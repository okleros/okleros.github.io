precision mediump float;
//vec4 color;
varying vec2 v_texCoord;

uniform sampler2D tex;

void main() {
	// gl_FragColor = vec4(.5, .5, 0, 1);
	gl_FragColor = texture2D(tex, v_texCoord);
}