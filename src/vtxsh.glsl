attribute vec4 position;
//attribute vec4 fcolor;
attribute vec2 texCoord;
uniform mat4 transf;
//uniform float df;

//varying vec4 color;
varying vec2 v_texCoord;

void main() {
	//color = fcolor;
	v_texCoord = texCoord;
	gl_Position = transf * position;

	//gl_Position[3] = 1.0 + gl_Position[2] / df;
}