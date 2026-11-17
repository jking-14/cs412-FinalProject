class Material {
    constructor(name = "custom") {
        this.name = name;

        this.diffuseCoeff = 1.0;
        this.specularColor = new Vector3(1, 1, 1);
        this.specularStrength = 1.0;
        this.shininess = 32;
        this.emissive = new Vector3(0, 0, 0);
        this.flatShading = false;
        this.texture = null;
    }

    setDiffuse(value) {
        this.diffuseCoeff = value;
        return this;
    }

    setSpecularColor(r, g, b) {
        this.specularColor.set(r, g, b);
        return this;
    }

    setSpecularStrength(value) {
        this.specularStrength = value;
        return this;
    }

    setShininess(value) {
        this.shininess = value;
        return this;
    }

    setEmissive(r, g, b) {
        this.emissive.set(r, g, b);
        return this;
    }

    setFlatShading(value) {
        this.flatShading = value;
        return this;
    }

    setTexture(texture) {
        this.texture = texture;
        return this;
    }

    copy(other) {
        this.diffuseCoeff = other.diffuseCoeff;
        this.specularColor.copy(other.specularColor);
        this.specularStrength = other.specularStrength;
        this.shininess = other.shininess;
        this.emissive.copy(other.emissive);
        this.flatShading = other.flatShading;
        this.texture = other.texture;
        return this;
    }
    
    clone() {
        var material = new Material(this.name + " (copy)");
        material.copy(this);
        return material;
    }
}