class Transform {
    constructor() {
       this.position = new Vector3(0, 0, 0);
       this.scale = new Vector3(1, 1, 1);
       this.rotation = new Vector3(0, 0, 0);
       this.matView = new Matrix4();
       this.matNormal = new Float32Array(9);

       this.forward = new Float32Array(4);
       this.up = new Float32Array(4);
       this.right = new Float32Array(4);

       this.children = [];
       this.parent = null;
       this.matWorld = new Float32Array(16);
    }

    // Hierarchy methods
    addChild(child) {
        if(child === this) return null;
        if(child.parent) child.parent.removeChild(child);

        child.parent = this;
        this.children.push(child);
        return child;
    }

    removeChild(child) {
        var i = this.children.indexOf(child);
        if(i === -1) return null;
        this.children.splice(i, 1);
        child.parent = null;
        return child;
    }

    // Transformations
    updateMatrix() {
        // Local
        this.matView.reset()
            .vtranslate(this.position)
            .rotateX(this.rotation.x * Transform.deg2Rad)
            .rotateY(this.rotation.y * Transform.deg2Rad)
            .rotateZ(this.rotation.z * Transform.deg2Rad)
            .vscale(this.scale);

        // World
        if (this.parent) {
            Matrix4.mult(this.matWorld, this.parent.updateMatrix(), this.matView.raw);
        } else {
            this.matWorld.set(this.matView.raw);
        }
        
        // Calculate normal matrix which doesn't need translate, then transpose and inverse the mat4 to mat3
        Matrix4.normalMat3(this.matNormal, this.matWorld);

        // determine direction after all transformations
        Matrix4.transformVec4(this.forward, [0, 0, 1, 0], this.matWorld);
        Matrix4.transformVec4(this.up, [0, 1, 0, 0], this.matWorld);
        Matrix4.transformVec4(this.right, [1, 0, 0, 0], this.matWorld);

        return this.matWorld;
    }

    updateDirection() {
        Matrix4.transformVec4(this.forward, [0, 0, 1, 0], this.matView.raw);
        Matrix4.transformVec4(this.up, [0, 1, 0, 0], this.matView.raw);
        Matrix4.transformVec4(this.right, [1, 0, 0, 0], this.matView.raw);
        return this;
    }

    getViewMatrix() {
        return this.matWorld;
    }

    getNormalMatrix() {
        return this.matNormal;
    }

    reset() {
        this.position.set(0, 0, 0);
        this.scale.set(1, 1, 1);
        this.rotation.set(0, 0, 0);
    }
}

Transform.deg2Rad = Math.PI / 180;
Transform.rad2Deg = 180 / Math.PI;