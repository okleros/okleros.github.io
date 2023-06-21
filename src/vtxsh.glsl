//attribute vec4 fcolor;
attribute vec4 position;
attribute vec2 texCoord;
attribute vec3 normal;

//uniform float df;
uniform mat4 transfProj;
uniform vec3 lightColor;
uniform mat4 transf;

//varying vec4 color;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_lightColor;

void main() {
	//color = fcolor;
	v_normal = (transf * vec4(normal, 1.0)).xyz;
	v_texCoord = texCoord;
	v_lightColor = lightColor;
	gl_Position = transfProj * position;
}