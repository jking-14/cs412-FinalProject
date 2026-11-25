class LightingSystem {
    constructor(gl) {
        this.gl = gl;

        this.lights = [];
        this.maxLights = 16;

        this.enabled = true;

        this.ambientColor = new Vector3(1, 1, 1);
        this.ambientIntensity = 0.15;

        this.time = 0.0;

        // Cache shader uniform locations
        this.uniformCache = new Map();

        // Default white texture for untextured models
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1, 1);

        this.defaultTexture = gl.fLoadTexture(
            "lighting_default_white",
            canvas,
            false
        );
    }

    // Light management

    addLight(light) {
        if (this.lights.length >= this.maxLights) {
            console.warn("Maximum number of lights reached.");
            return null;
        }

        this.lights.push(light);
        return light;
    }

    removeLight(light) {
        const index = this.lights.indexOf(light);

        if (index !== -1) {
            this.lights.splice(index, 1);
        }

        return this;
    }

    clearLights() {
        this.lights.length = 0;
        return this;
    }

    getActiveLights() {
        return this.lights.filter(light => light.enabled);
    }

    // Global lighting settings

    setAmbientColor(r, g, b) {
        this.ambientColor.set(r, g, b);
        return this;
    }

    setAmbientIntensity(value) {
        this.ambientIntensity = value;
        return this;
    }

    setEnabled(value) {
        this.enabled = value;
        return this;
    }

    update(dt) {
        this.time += dt;
        return this;
    }

    // Uniform management

    getUniformLocation(program, name) {
        if (!this.uniformCache.has(program)) {
            this.uniformCache.set(program, new Map());
        }

        const uniforms = this.uniformCache.get(program);

        if (!uniforms.has(name)) {
            uniforms.set(
                name,
                this.gl.getUniformLocation(program, name)
            );
        }

        return uniforms.get(name);
    }

    setUniformInt(program, name, value) {
        const location = this.getUniformLocation(program, name);

        if (location !== null) {
            this.gl.uniform1i(location, value);
        }
    }

    setUniformFloat(program, name, value) {
        const location = this.getUniformLocation(program, name);

        if (location !== null) {
            this.gl.uniform1f(location, value);
        }
    }

    setUniformVec3(program, name, vector) {
        const location = this.getUniformLocation(program, name);

        if (location !== null) {
            this.gl.uniform3fv(
                location,
                vector.getFloatArray()
            );
        }
    }

    // Upload individual light properties

    uploadLight(program, light, index) {
        const prefix = `uLights[${index}]`;

        // Light type
        this.setUniformInt(
            program, `${prefix}.type`, light.type
        );

        // Spatial properties
        this.setUniformVec3(
            program, `${prefix}.position`, light.position
        );

        this.setUniformVec3(
            program, `${prefix}.direction`, light.direction
        );

        // Appearance
        this.setUniformVec3(
            program, `${prefix}.color`, light.color
        );

        this.setUniformFloat(
            program, `${prefix}.intensity`, light.intensity
        );

        this.setUniformFloat(
            program, `${prefix}.range`, light.range
        );

        // Distance attenuation
        this.setUniformFloat(
            program, `${prefix}.constant`, light.constant
        );

        this.setUniformFloat(
            program, `${prefix}.linear`, light.linear
        );

        this.setUniformFloat(
            program, `${prefix}.quadratic`, light.quadratic
        );

        // Convert spotlight angles into cosine values
        const innerCutoff = Math.cos(
            light.innerAngle * Math.PI / 180
        );

        const outerCutoff = Math.cos(
            light.outerAngle * Math.PI / 180
        );

        this.setUniformFloat(
            program, `${prefix}.innerCutoff`, innerCutoff
        );

        this.setUniformFloat(
            program, `${prefix}.outerCutoff`, outerCutoff
        );
    }

    // Upload global lighting properties once per frame

    apply(shader, camera) {
        const program = shader.program;

        // Global lighting settings
        this.setUniformInt(
            program,
            "uLightingEnabled",
            this.enabled ? 1 : 0
        );

        this.setUniformVec3(
            program,
            "uAmbientColor",
            this.ambientColor
        );

        this.setUniformFloat(
            program,
            "uAmbientIntensity",
            this.ambientIntensity
        );

        // Existing camera position
        this.setUniformVec3(
            program,
            "uCameraPosition",
            camera.position
        );

        // Retrieve enabled lights
        const activeLights = this.enabled
            ? this.getActiveLights().slice(0, this.maxLights)
            : [];

        // Upload number of active lights
        this.setUniformInt(
            program,
            "uLightCount",
            activeLights.length
        );

        // Upload each active light
        for (let i = 0; i < activeLights.length; i++) {
            this.uploadLight(program, activeLights[i], i);
        }

        return this;
    }

    // Upload  material properties per model

    applyMaterial(shader, model) {
        const program = shader.program;
        const material = model.material;

        // Use material texture and mesh UV buffer
        const useTexture =
            material.texture != null &&
            model.mesh.bufUV != null;

        this.setUniformInt(
            program,
            "uUseTexture",
            useTexture ? 1 : 0
        );


        // Bind material texture or default white texture
        this.gl.activeTexture(this.gl.TEXTURE0);

        // Bind the GPU texture
        this.gl.bindTexture(
            this.gl.TEXTURE_2D,
            useTexture ? material.texture : this.defaultTexture
        );

        this.setUniformInt(program, "uMainTex", 0);

        // Enable theprocedural floor grid
        this.setUniformInt(
            program,
            "uUseGrid",
            model.useGrid ? 1 : 0
        );

        // Model color
        this.setUniformVec3(
            program, "uColor", model.color
        );

        // Diffuse coefficient (Kd)
        this.setUniformFloat(
            program, "uDiffuseCoeff",
            material.diffuseCoeff
        );

        // Specular coefficient (Ks)
        this.setUniformVec3(
            program, "uSpecularColor",
            material.specularColor
        );

        this.setUniformFloat(
            program, "uSpecularStrength",
            material.specularStrength
        );

        // Shininess exponent
        this.setUniformFloat(
            program, "uShininess",
            material.shininess
        );

        // Emissive color
        this.setUniformVec3(
            program, "uEmissive",
            material.emissive
        );

        // Flat or smooth shading
        this.setUniformInt(
            program,
            "uFlatShading",
            material.flatShading ? 1 : 0
        );

        // Use the existing normal transformation matrix
        const normalLocation = this.getUniformLocation(
            program, "uNormalMatrix"
        );

        if (normalLocation !== null) {
            this.gl.uniformMatrix3fv(
                normalLocation,
                false,
                model.transform.getNormalMatrix()
            );
        }

        return this;
    }
}
