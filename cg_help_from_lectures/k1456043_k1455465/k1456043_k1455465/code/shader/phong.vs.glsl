/**
 * wells phong vertex shader (well, coin and cg logo)
 */

attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;

uniform vec3 u_lightPos;    //where is the light source

//output of this shader
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;

void main() {
	vec4 eyePosition = u_modelView * vec4(a_position,1);    //eye coords

	//the following three properties are neccessary for phong shading in the fragment shader
    v_normalVec = u_normalMatrix * a_normal;
    v_eyeVec = -eyePosition.xyz;    //vector of eye
	v_lightVec = u_lightPos - eyePosition.xyz; //vector of light

	gl_Position = u_projection * eyePosition;
}
