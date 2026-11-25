class LightingDebug {
    constructor(gl) {
        this.gl = gl;
        this.enabled = false;
        this.radius = 0.15;

        this.mesh = this.createSphereMesh();
        this.model = new Model(this.mesh);

        // Emissive material for light visualization
        this.model.material
            .setDiffuse(0.0)
            .setSpecularStrength(0.0);

        this.model.setScale(
            this.radius,
            this.radius,
            this.radius
        );
    }

    // Generate a reusable unit sphere
    createSphereMesh(segments = 16, rings = 12) {
        const vertices = [];
        const normals = [];
        const indices = [];

        for (let y = 0; y <= rings; y++) {
            const theta = y * Math.PI / rings;

            for (let x = 0; x <= segments; x++) {
                const phi = x * 2.0 * Math.PI / segments;

                const nx = Math.sin(theta) * Math.cos(phi);
                const ny = Math.cos(theta);
                const nz = Math.sin(theta) * Math.sin(phi);

                vertices.push(nx, ny, nz);
                normals.push(nx, ny, nz);
            }
        }

        for (let y = 0; y < rings; y++) {
            for (let x = 0; x < segments; x++) {
                const first = y * (segments + 1) + x;
                const second = first + segments + 1;

                indices.push(
                    first,
                    first + 1,
                    second
                );

                indices.push(
                    second,
                    first + 1,
                    second + 1
                );
            }
        }

        return this.gl.fCreateMeshVAO(
            "lighting_debug_sphere",
            indices,
            vertices,
            normals,
            null
        );
    }

    setEnabled(value) {
        this.enabled = value;
        return this;
    }

    setRadius(value) {
        this.radius = Math.max(0.001, value);

        this.model.setScale(
            this.radius,
            this.radius,
            this.radius
        );

        return this;
    }

    render(shader, lightingSystem) {
        if (!this.enabled) {
            return;
        }

        for (const light of lightingSystem.lights) {
            // Directional lights have no fixed position
            if (light.type === LightType.DIRECTIONAL) {
                continue;
            }

            // Skip disabled or hidden lights
            if (!light.enabled || !light.visible) {
                continue;
            }

            // Match the light position
            this.model.setPosition(
                light.position.x,
                light.position.y,
                light.position.z
            );

            // Match the light color
            this.model.setColor(
                light.color.x,
                light.color.y,
                light.color.z
            );

            this.model.material.setEmissive(
                light.color.x,
                light.color.y,
                light.color.z
            );

            // Update transformation matrices
            this.model.preRender();

            // Upload material properties
            lightingSystem.applyMaterial(
                shader,
                this.model
            );

            // Render the sphere
            shader.renderModel(this.model);
        }
    }
}
