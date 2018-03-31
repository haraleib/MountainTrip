/**
 * waters vertex shader (scene 1)
 */

attribute vec3 a_position;

uniform mat4 u_modelView;
uniform mat4 u_projection;

varying vec4 v_clipSpace;

varying vec2 v_texCoord;


void main() {

  //bring objectCoordinates.xy into textures coordinate system
  v_texCoord = vec2(a_position.x/2.0 + 0.5, a_position.y/2.0 + 0.5);
  vec4 eyePosition = u_modelView * vec4(a_position,1);
  v_clipSpace = u_projection * eyePosition;
  gl_Position = v_clipSpace;
}
