class Model {
    constructor(meshData) {
        this.transform = new Transform();
        this.mesh = meshData;
        this.color = new Vector3(1, 1, 1);
        this.material = Materials.get("default")
    }

    setScale(x, y, z) {
        this.transform.scale.set(x, y, z);
        return this;
    }

    setColor(x, y, z) {
        this.color.set(x, y, z);
        return this;
    }

    setPosition(x, y, z) {
        this.transform.position.set(x, y, z);
        return this;
    }

    setRotation(x, y, z) {
        this.transform.rotation.set(x, y, z);
        return this;
    }

    setMaterial(material) {
        if (typeof material === 'string') {
            this.material = Materials.get(material);
        } else if (material && typeof material === 'object') {
            this.material = material;
        }
        return this;
    }

    addScale(x, y, z) {
        this.transform.scale.x += x;
        this.transform.scale.y += y;
        this.transform.scale.z += z;
        return this;
    }

    addPosition(x, y, z) {
        this.transform.position.x += x;
        this.transform.position.y += y;
        this.transform.position.z += z;
        return this;
    }

    addRotation(x, y, z) {
        this.transform.rotation.x += x;
        this.transform.rotation.y += y;
        this.transform.rotation.z += z;
        return this;
    }

    addChild(child) {
        this.transform.addChild(child.transform);
        return this;
    }

    preRender() {
        this.transform.updateMatrix();
        return this;
    }
}
