/**
 * texture vertex shader (scene 1)
 */

attribute vec3 a_position;
attribute vec2 a_texCoord;

uniform mat4 u_modelView;
uniform mat4 u_projection;

varying vec2 v_texCoord;

void main() {
	vec4 eyePosition = u_modelView * vec4(a_position,1);

    //output texture coordinates to fragment shader
	v_texCoord = a_texCoord;
	gl_Position = u_projection * eyePosition;;
}
