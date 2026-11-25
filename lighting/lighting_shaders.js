const lightingVertexShader = `#version 300 es

in vec3 aPosition;
in vec3 aNormal;
in vec2 aUv;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uCameraMatrix;
uniform mat3 uNormalMatrix;

out vec3 vWorldPosition;
out vec3 vNormal;
out vec2 vTexCoord;

void main() {
    // Transform vertex into world space
    vec4 worldPosition = uMVMatrix * vec4(aPosition, 1.0);

    vWorldPosition = worldPosition.xyz;

    // Transform surface normal into world space
    vNormal = normalize(uNormalMatrix * aNormal);

    // Pass texture coordinates to the fragment shader
    vTexCoord = aUv;

    // Transform vertex into clip space
    gl_Position = uPMatrix * uCameraMatrix * worldPosition;
}
`;


const lightingFragmentShader = `#version 300 es

precision highp float;

#define MAX_LIGHTS 16

in vec3 vWorldPosition;
in vec3 vNormal;
in vec2 vTexCoord;

out vec4 fragColor;

// Global lighting properties
uniform bool uLightingEnabled;
uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;
uniform vec3 uCameraPosition;

// Material properties
uniform vec3 uColor;
uniform float uDiffuseCoeff;
uniform vec3 uSpecularColor;
uniform float uSpecularStrength;
uniform float uShininess;
uniform vec3 uEmissive;
uniform bool uUseGrid;
uniform bool uFlatShading;

// Texture properties
uniform bool uUseTexture;
uniform sampler2D uMainTex;

// Light properties
struct Light {
    int type;

    vec3 position;
    vec3 direction;
    vec3 color;

    float intensity;
    float range;

    // Distance attenuation coefficients
    float constant;
    float linear;
    float quadratic;

    // Spotlight cutoff values
    float innerCutoff;
    float outerCutoff;
};

uniform int uLightCount;
uniform Light uLights[MAX_LIGHTS];

// Floor grid from environment shader
vec3 getBaseColor() {
    vec3 baseColor = uColor;

    // Apply material texture
    if (uUseTexture) {
        baseColor *= texture(uMainTex, vTexCoord).rgb;
    }

    if (uUseGrid) {
        vec2 coord = vWorldPosition.xz;

        vec2 grid =
            abs(fract(coord - 0.5) - 0.5) /
            max(fwidth(coord), vec2(0.0001));

        float line = min(grid.x, grid.y);

        float brightness = mix(
            0.65,
            1.0,
            min(line, 1.0)
        );

        baseColor *= brightness;
    }

    return baseColor;
}


// Calculate the contribution of an individual light
vec3 calculateLight(Light light, vec3 N, vec3 V, vec3 baseColor) {
    vec3 L;

    float attenuation = 1.0;
    float spotFactor = 1.0;

    // Directional light
    if (light.type == 0) {
        L = normalize(-light.direction);
    }

    // Point light and spotlight
    else {
        vec3 toLight = light.position - vWorldPosition;
        float distanceToLight = length(toLight);

        // Ignore fragments outside the light's range
        if (distanceToLight >= light.range ||
            distanceToLight < 0.0001) {
            return vec3(0.0);
        }

        L = toLight / distanceToLight;

        // Distance attenuation
        attenuation = 1.0 / max(
            light.constant +
            light.linear * distanceToLight +
            light.quadratic * distanceToLight * distanceToLight,
            0.0001
        );

        // Smoothly fade light near its maximum range
        attenuation *= 1.0 - smoothstep(
            light.range * 0.8,
            light.range,
            distanceToLight
        );

        // Spotlight cone
        if (light.type == 2) {
            float theta = dot(
                -L,
                normalize(light.direction)
            );

            spotFactor = smoothstep(
                light.outerCutoff,
                light.innerCutoff,
                theta
            );
        }
    }

    // Phong material coefficients
    vec3 Kd = baseColor * uDiffuseCoeff;
    vec3 Ks = uSpecularColor * uSpecularStrength;

    // Diffuse lighting
    float diff = max(dot(N, L), 0.0);

    vec3 diffuse = Kd * diff;

    // Specular lighting
    vec3 R = reflect(-L, N);

    float spec = 0.0;

    // Only calculate specular lighting on illuminated surfaces
    if (diff > 0.0) {
        spec = pow(
            max(dot(V, R), 0.0),
            max(uShininess, 1.0)
        );
    }

    vec3 specular = Ks * spec;

    // Final contribution of this light
    return (diffuse + specular) *
        light.color *
        light.intensity *
        attenuation *
        spotFactor;
}


void main() {
    vec3 baseColor = getBaseColor();

    // Allow lighting to be disabled
    if (!uLightingEnabled) {
        fragColor = vec4(baseColor, 1.0);
        return;
    }

    // Calculate the geometric face normal
    vec3 faceNormal = normalize(
        cross(
            dFdx(vWorldPosition),
            dFdy(vWorldPosition)
        )
    );

    // Select flat or smooth shading
    vec3 N = uFlatShading
        ? faceNormal
        : normalize(vNormal);

    // Viewing direction
    vec3 V = normalize(uCameraPosition - vWorldPosition);

    // Ambient lighting coefficient
    vec3 Ka = baseColor* uAmbientIntensity;

    // Initial ambient contribution
    vec3 ambient = Ka * uAmbientColor;

    vec3 result = ambient;

    // Accumulate contributions from all active lights
    for (int i = 0; i < MAX_LIGHTS; i++) {
        if (i >= uLightCount) {
            break;
        }

        result += calculateLight(uLights[i], N, V, baseColor);
    }

    // Add self-illuminating material color
    result += uEmissive;

    // Final fragment color
    fragColor = vec4(result, 1.0);
}
`;
