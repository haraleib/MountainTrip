// Phong Vertex Shader for textures

attribute vec3 a_position;
attribute vec3 a_normal;
//given texture coordinates per vertex
attribute vec2 a_texCoord;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;
uniform mat4 u_invView;

uniform vec3 u_lightPos;

//output of this shader
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;

varying vec2 v_texCoord;
varying mat3 v_normalMatrix;


void main() {
	vec4 eyePosition = u_modelView * vec4(a_position,1);

    v_normalVec = u_normalMatrix * a_normal;

    v_eyeVec = -eyePosition.xyz;
    v_lightVec = u_lightPos - eyePosition.xyz;

    //transfer the normal matrix to the fragment shader to use it for the transformaton of the direction vector of the spotlight
    v_normalMatrix=u_normalMatrix;


	v_texCoord=a_texCoord;
	gl_Position = u_projection * eyePosition;
}
