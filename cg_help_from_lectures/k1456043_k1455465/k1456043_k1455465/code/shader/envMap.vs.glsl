/**
 * Environment Map vertex shader
 */

attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;
uniform mat3 u_invView; // neccessary to convert back from eye to world space

varying vec3 v_normalVec;
varying vec3 v_cameraRayVec;

void main(){
  vec4 eyePosition = u_modelView * vec4(a_position, 1);
  v_cameraRayVec = u_invView * eyePosition.xyz; //camera vector for each vertex in world space
  v_normalVec = u_invView * u_normalMatrix * a_normal;  //corresponding normal vector for each vertex in world space
  gl_Position = u_projection * eyePosition;
}
