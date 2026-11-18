const ATTR_POSITION_NAME    = "aPosition";
const ATTR_POSITION_LOC     = 0;
const ATTR_NORMAL_NAME      = "aNormal";
const ATTR_NORMAL_LOC       = 1;
const ATTR_UV_NAME          = "aUv";
const ATTR_UV_LOC           = 2;

function GLInstance(canvasId) {
    // get webgl context
    var canvas = document.getElementById(canvasId);
    var gl = canvas.getContext("webgl2");

    if(!gl) {
        console.error("WebGL context is not available");
        return null;
    }

    // cache meshes and textures
    gl.mMeshCache = []; // cache mesh structs to make it easier to unload buffer
    gl.mTextureCache = [];

    // Set gpu state
    gl.cullFace(gl.BACK); // cull back face
    gl.frontFace(gl.CCW); // front face is determined by ccw rotation
    gl.enable(gl.DEPTH_TEST); // enable depth buffer to prevent drawing hidden primitives
    gl.enable(gl.CULL_FACE); // turn culling on
    gl.depthFunc(gl.LEQUAL); // closer/equal distance prims win
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // standard alpha blending
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set clear color to black

    // clear color and depth buffers (erases previous frame)
    gl.fClear = function(){
        this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT);
        return this;
    }

    // add array to buffer
    gl.fCreateArrayBuffer = function(floatArray, isStatic = true) {
        var buffer = this.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, floatArray, isStatic ? this.STATIC_DRAW : this.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buffer;
    }

    // turns arrays into buffers and setup VAO (vertex array object) that will predefine buffers to standard shader attributes
    gl.fCreateMeshVAO = function(name, arrayIndices, arrayVertices, arrayNormals, arrayUVs, vertexComponentLen = 3) {
        var rtn = {
            drawMode: this.TRIANGLES
        };

        // create and bind vao
        rtn.vao = this.createVertexArray();
        this.bindVertexArray(rtn.vao);

        // set up vertices
        if (arrayVertices !== undefined && arrayVertices != null) {
            rtn.bufVertices = this.createBuffer(); // create buffer
            rtn.vertexComponentLen = vertexComponentLen; // how many floats in vertex
            rtn.vertexCount = arrayVertices.length / rtn.vertexComponentLen; // how many vertices in array

            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufVertices);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(arrayVertices), this.STATIC_DRAW); // push array into buffer
            this.enableVertexAttribArray(ATTR_POSITION_LOC); //enable attribute location
            this.vertexAttribPointer(ATTR_POSITION_LOC, rtn.vertexComponentLen, this.FLOAT, false, 0, 0); // put buffer at vao location
        }

        // set up normals
        if (arrayNormals !== undefined && arrayNormals != null) {
            rtn.bufNormals = this.createBuffer();
            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufNormals);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(arrayNormals), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTR_NORMAL_LOC);
            this.vertexAttribPointer(ATTR_NORMAL_LOC, 3, this.FLOAT, false, 0, 0);
        }

        // set up uvs
        if (arrayUVs !== undefined && arrayUVs != null) {
            rtn.bufUV = this.createBuffer();
            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufUV);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(arrayUVs), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTR_UV_LOC);
            this.vertexAttribPointer(ATTR_UV_LOC, 2, this.FLOAT, false, 0, 0); // UV has 2 floats per component
        }

        // set up indices
        if (arrayIndices !== undefined && arrayIndices != null) {
            rtn.bufIndex = this.createBuffer();
            rtn.indexCount  = arrayIndices.length;
            this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, rtn.bufIndex);
            this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrayIndices), this.STATIC_DRAW);
            // this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, null);
        }

        this.bindVertexArray(null); // unbind vao after use
        this.bindBuffer(this.ARRAY_BUFFER, null); // unbind any set buffers

        this.mMeshCache[name] = rtn;
        return rtn;
    }

    gl.fLoadTexture = function (name, img, doYFlip) {
        const tex = this.createTexture();
        if (doYFlip) {
            this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true);
        }

        this.bindTexture(this.TEXTURE_2D, tex);
        this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, img);

        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR);
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_NEAREST);
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_S, this.REPEAT);
        this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_T, this.REPEAT);
        this.generateMipmap(this.TEXTURE_2D);

        this.bindTexture(this.TEXTURE_2D, null);
        this.mTextureCache[name] = tex;

        if(doYFlip) {
            this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);
        }

        return tex;
    }

    gl.fUpdateTexture = function (tex, img, doYFlip) {
        if (!tex || !img) return null;

        // Must match the flip setting used when the texture was originally loaded.
        if (doYFlip) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true);

        this.bindTexture(this.TEXTURE_2D, tex);

        this.texImage2D(
            this.TEXTURE_2D,
            0,                  // mip level
            this.RGBA,          // internal format
            this.RGBA,          // source format
            this.UNSIGNED_BYTE,
            img                 // HTMLImageElement / canvas / video
        );

        // Level 0 changed, so rebuild the mip chain.
        this.generateMipmap(this.TEXTURE_2D);

        this.bindTexture(this.TEXTURE_2D, null);

        if (doYFlip) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);

        return tex;
    };

    gl.fSetSize = function(w, h) {
        // set canvas size
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";
        this.canvas.width = w;
        this.canvas.height = h;

        // must reset viewport on updating canvas size to ensure render change
        this.viewport(0, 0, w, h);
        return this;
    }

    gl.fFitScreen = function (wp = 1, hp = 1) {
        return this.fSetSize(
            window.innerWidth * wp, 
            window.innerHeight * hp
        );
    }

    return gl;
}
