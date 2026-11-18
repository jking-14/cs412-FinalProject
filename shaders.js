class Shader {
    constructor(gl, verShaderSrc, fragShaderSrc) {
        this.program = ShaderUtil.createProgramFromText(gl, verShaderSrc, fragShaderSrc, true);
        
        if (this.program != null) {
            this.gl = gl;
            gl.useProgram(this.program);
            this.attribLoc = ShaderUtil.getStandardAttribLocations(gl, this.program);
            this.uniformLoc = ShaderUtil.getStandardUniformLocations(gl, this.program);
        }
    }

    activate() {
        this.gl.useProgram(this.program);
        return this;
    }

    deactivate() {
        this.gl.useProgram(null);
        return this;
    }

    setPerspective(matData) {
        this.gl.uniformMatrix4fv(this.uniformLoc.perspective, false, matData);
        return this;
    }

    setModelMatrix(matData) {
        this.gl.uniformMatrix4fv(this.uniformLoc.modelMatrix, false, matData);
        return this;
    }

    setCameraMatrix(matData) {
        this.gl.uniformMatrix4fv(this.uniformLoc.cameraMatrix, false, matData);
        return this;
    }

    // helps clean up shader resources when not needed
    dispose() {
        //unbind program if active
        if (this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program)
            this.gl.useProgram(null);
        
        this.gl.deleteProgram(this.program);
    }

    renderModel(model) {
        this.setModelMatrix(model.transform.getViewMatrix());
        this.gl.bindVertexArray(model.mesh.vao); // endable vao to set all predef attrib for shader

        if (model.mesh.noCulling) {
            this.gl.disable(this.gl.CULL_FACE);
        }
        if (model.mesh.doBlending) {
            this.gl.enable(this.gl.BLEND);
        }
        
        if (model.mesh.indexCount) {
            this.gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, this.gl.UNSIGNED_SHORT, 0);
        } else {
            this.gl.drawArrays(model.mesh.drawMode, 0, model.mesh.vertexCount);
        }

        this.gl.bindVertexArray(null);
        if (model.mesh.noCulling) {
            this.gl.enable(this.gl.CULL_FACE);
        }
        if (model.mesh.doBlending) {
            this.gl.disable(this.gl.BLEND);
        }

        return this;
    }
}

class ShaderUtil {
    // get the text of a script tag that are storing shader code
    static domShaderSrc(elmID) {
        var elm = document.getElementById(elmID);
        if (!elm || elm.text == "") {
            console.log(elmID + " shader not found or no text.");
        }

        return elm.text;
    }

    // create a shader by passing in its code and what type
    static createShader(gl, src, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Error compiling shader: " + src, gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    // link the two compiled shdaers to create rendering program
    static createProgram(gl, vShader, fShader, doValidate) {
        // link shaders together
        var prog = gl.createProgram()
        gl.attachShader(prog, vShader);
        gl.attachShader(prog, fShader);

        // force predefined locations for attributes
        gl.bindAttribLocation(prog, ATTR_POSITION_LOC, ATTR_POSITION_NAME);
        gl.bindAttribLocation(prog, ATTR_NORMAL_LOC, ATTR_NORMAL_NAME);
        gl.bindAttribLocation(prog, ATTR_UV_LOC, ATTR_UV_NAME);
        gl.linkProgram(prog);
        
        // check if successfull
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error("Error creating shader program. ", gl.getProgramInfoLog(prog));
            gl.deleteProgram(prog);
            return null;
        }

        // Only do this for additional debugging
        if (doValidate) {
            gl.validateProgram(prog);
            if (!gl.getProgramParameter(prog, gl.VALIDATE_STATUS)) {
                console.error("Error validating program ", gl.getProgramInfoLog(prog));
                gl.deleteProgram(prog);
                return null;
            }
        }

        // Can delete shaders since program has been made
        gl.detachShader(prog, vShader); // may cause issues on some browsers
        gl.detachShader(prog, fShader);
        gl.deleteShader(fShader);
        gl.deleteShader(vShader);

        return prog;
    }

    // create program from 2 shader script tag ids
    static domShaderProgram(gl, vectID, fragID, doValidate) {
        // get vertex and fragment shader text
        var vShaderText = ShaderUtil.domShaderSrc(vectID);
        if (!vShaderText) return null;
        var fShaderText = ShaderUtil.domShaderSrc(fragID);
        if (!fShaderText) return null;

        // compile text and validate
        var vShader = ShaderUtil.createShader(gl, vShaderText, gl.VERTEX_SHADER);
        if (!vShader) return null;
        var fShader = ShaderUtil.createShader(gl, fShaderText, gl.FRAGMENT_SHADER);
        if (!fShader) {
            gl.deleteShader(vShader);
            return null;
        }

        // link shaders together
        return ShaderUtil.createProgram(gl, vShader, fShader, true);
    }

    static createProgramFromText(gl, vShaderText, fShaderText, doValidate) {
        var vShader = ShaderUtil.createShader(gl, vShaderText, gl.VERTEX_SHADER);
        if (!vShader) return null;
        var fShader = ShaderUtil.createShader(gl, fShaderText, gl.FRAGMENT_SHADER);
        if (!fShader) {
            gl.deleteShader(vShader);
            return null;
        }

        // link shaders together
        return ShaderUtil.createProgram(gl, vShader, fShader, true);
    }

    static getStandardAttribLocations(gl, program) {
        return {
            position: gl.getAttribLocation(program, ATTR_POSITION_NAME),
            normal: gl.getAttribLocation(program, ATTR_NORMAL_NAME),
            uv: gl.getAttribLocation(program, ATTR_UV_NAME)
        };
    }

    static getStandardUniformLocations(gl, program) {
        return {
            perspective: gl.getUniformLocation(program, "uPMatrix"),
            modelMatrix: gl.getUniformLocation(program, "uMVMatrix"),
            cameraMatrix: gl.getUniformLocation(program, "uCameraMatrix"),
            maintexture: gl.getUniformLocation(program, "uMainTex")
        };
    }
}

out vec4 fragColor;

void main() {
    vec2 coord = vWorldPosition.xz;

    vec2 grid = abs( fract(coord - 0.5) - 0.5) / max(fwidth(coord), vec2(0.0001));

    float line = min(grid.x, grid.y);
    float brightness = mix( 0.65, 1.0, min(line, 1.0));
}`;
