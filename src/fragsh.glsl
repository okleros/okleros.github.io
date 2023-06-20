//vec4 color;

precision mediump float;

uniform vec3 lightDirection;
uniform sampler2D tex;

varying vec2 v_texCoord;
varying vec3 v_normal;

vec4 rgb2hsv(vec4 c) {
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1e-10;
    return vec4(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x, c.a);
}

void main() {
	// gl_FragColor = rgb2hsv(vec4(.5, .5, 0, 1));
	gl_FragColor =/*  vec4(1.0, 0.7, 0.0, 1.0) *  */texture2D(tex, v_texCoord);
}