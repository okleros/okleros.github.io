precision mediump float;

uniform vec3 u_lightDirection;
uniform vec3 u_ambientColor;
uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;
uniform float u_shininess;
uniform float u_stackPos;
uniform bool u_textured;
uniform sampler2D u_tex;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_pointToCam;
varying vec3 v_pointToLight;

void main()
{
    vec4 texColor;

    vec3 v_normal_n = normalize(v_normal);
    vec3 v_pointToLight_n = normalize(v_pointToLight);

    vec3 halfVec = normalize(v_pointToCam + v_pointToLight);

    vec3 ambient = u_ambientColor;

    float lightd = max(dot(v_normal_n, normalize(-u_lightDirection)), 0.0);
    vec3 diffuse = lightd * u_diffuseColor;

    float lightp = max(dot(v_normal_n, v_pointToLight_n), 0.0);
    vec3 point = lightp * u_specularColor;

    float lighte = max(dot(v_normal_n, halfVec), 0.0);
    vec3 specular = u_specularColor * pow(lighte, u_shininess);

    if (u_textured)
        texColor = texture2D(u_tex, v_texCoord);
    else
        texColor = vec4(min(u_stackPos * 0.4, 1.0), min(u_stackPos, 1.0), min(0.3 + u_stackPos / 2.0, 1.0), 1.0);

    gl_FragColor = vec4((max((1.0 - (u_stackPos * 0.7)), 0.4) * ambient + 0.2 * diffuse + 0.6 * point + specular) * texColor.rgb, texColor.a);
}