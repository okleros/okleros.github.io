//attribute vec4 fcolor;
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec3 a_normal;

uniform vec3 u_lightPosition;
uniform vec3 u_camPosition;
uniform mat4 u_invTranspModelMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_MVPMatrix;

//varying vec4 color;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_pointToLight;
varying vec3 v_pointToCam;

void main()
{
	gl_Position = u_MVPMatrix * a_position;
	
	v_pointToLight = u_lightPosition - (u_modelMatrix * a_position).xyz;
	v_pointToCam = u_camPosition - (u_modelMatrix * a_position).xyz;

	v_normal = (u_invTranspModelMatrix * vec4(a_normal, 1.0)).xyz;
	v_texCoord = a_texCoord;
}