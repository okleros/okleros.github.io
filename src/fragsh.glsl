precision mediump float;

uniform vec3 u_lightDirection;
uniform vec3 u_ambientColor;
uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;
uniform float u_shininess;
uniform float u_stackPos;
uniform sampler2D u_tex;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_pointToCam;
varying vec3 v_pointToLight;
varying float v_distance;

vec4 rgb2hsv(vec4 c)
{
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1e-10;
    return vec4(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x, c.a);
}

vec4 blur(sampler2D tex, vec2 texCoord)
{
    const int neighborhoodSize = 8;
    const float neighborhoodSize_f = float(neighborhoodSize);
    const int neighborSize = neighborhoodSize / 2;
    const float texelSize = 1.0 / 512.0/*  textureSize(tex, 0) + 1e-10 */; // Calculate the size of a texel (pixel)
    vec4 sum = vec4(0.0);
    
    for (int i = -neighborSize; i <= neighborSize; i++)
    {
        for (int j = -neighborSize; j <= neighborSize; j++)
        {
            vec2 offset = vec2(i, j) * texelSize;
            sum += texture2D(tex, texCoord + offset);
        }
    }
    
    vec4 averageColor = sum / float((2 * neighborSize + 1) * (2 * neighborSize + 1)); // Divide the sum by 9 to get the average
    
    return averageColor;
}

void main()
{
    vec2 normalizedFragCoord = gl_FragCoord.xy / vec2(640, 480);

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

    // vec4 texColor = texture2D(u_tex, v_texCoord);
    // vec4 texColor = vec4(v_normal_n, 1.0);

    vec4 texColor = vec4(min(u_stackPos * 0.4, 1.0), min(u_stackPos, 1.0), min(0.3 + u_stackPos / 2.0, 1.0), 1.0);
    // gl_FragColor[3] = 1.0;
    gl_FragColor = vec4((max((1.0 - (u_stackPos * 0.7)), 0.4) * ambient + 0.2 * diffuse + 0.8 * point + 0.2 * specular) * texColor.rgb, texColor.a);
}