// Supported light types
const LightType = Object.freeze({
    DIRECTIONAL: 0,
    POINT: 1,
    SPOT: 2
});

class Light {
    constructor(type = LightType.POINT) {
        this.type = type;
        this.enabled = true;
        this.visible = true;

        // Spatial properties
        this.position = new Vector3(0, 0, 0);
        this.direction = new Vector3(0, -1, 0);

        // Appearance
        this.color = new Vector3(1, 1, 1);
        this.intensity = 1.0;

        // Distance attenuation
        this.range = 15.0;
        this.constant = 1.0;
        this.linear = 0.09;
        this.quadratic = 0.032;

        // Spotlight cone angles (degrees)
        this.innerAngle = 12.5;
        this.outerAngle = 17.5;
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        return this;
    }

    setDirection(x, y, z) {
        this.direction.set(x, y, z).normalize();
        return this;
    }

    setColor(r, g, b) {
        this.color.set(r, g, b);
        return this;
    }

    setIntensity(value) {
        this.intensity = value;
        return this;
    }

    setRange(value) {
        this.range = value;
        return this;
    }

    setEnabled(value) {
        this.enabled = value;
        return this;
    }
    
    setVisible(value) {
        this.visible = value;
        return this;
    }

    setAttenuation(constant, linear, quadratic) {
        this.constant = constant;
        this.linear = linear;
        this.quadratic = quadratic;
        return this;
    }

    setSpotAngles(inner, outer) {
        this.innerAngle = inner;
        this.outerAngle = outer;
        return this;
    }
}


