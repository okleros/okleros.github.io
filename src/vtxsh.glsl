//attribute vec4 fcolor;
attribute vec4 position;
attribute vec2 texCoord;
attribute vec3 normal;

//uniform float df;
uniform mat4 transf;

//varying vec4 color;
varying vec2 v_texCoord;
varying vec3 v_normal;

void main() {
	//color = fcolor;
	v_texCoord = texCoord;
	gl_Position = transf * position;
}