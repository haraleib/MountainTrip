/**
 * texture fragment shader (scene 1)
 */
precision mediump float;

//output texture coordinates to fragment shader
varying vec2 v_texCoord;
//image data
uniform sampler2D u_tex;

uniform float uAlpha;   //we enabled blending to visualize transparent textures

void main (void) {

  vec4 immFragColor = texture2D(u_tex, v_texCoord); //lookup corresponding texel
  gl_FragColor = vec4(immFragColor.rgb, immFragColor.a * uAlpha);   //compute blended fragment colors
}
