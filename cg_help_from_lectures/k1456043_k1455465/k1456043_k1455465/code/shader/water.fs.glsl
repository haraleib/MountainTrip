/**
 * waters fragment shader (scene 1)
 */
precision mediump float;

varying vec2 v_texCoord;    //texture coordinates of the water's reflection texture
uniform sampler2D u_tex;    //image data of the water's reflection texture
uniform sampler2D u_texDUDV; //image data of the water's distortion map

uniform float uAlpha;   //the water should be transparent, therefore we need an alpha value

varying vec4 v_clipSpace; //

uniform float u_moveFactor; //the water should have wave effects (influenced by time factor)
const float waveMovement = 0.01;

void main (void) {
  //bring clipSpacecoords.xy into textures coordinate system (with perspective division of homogeneous coordinate w)
  vec2 convertedTextureCoordinates = (v_clipSpace.xy / v_clipSpace.w) / 2.0 + 0.5;
  vec2 reflectionTextureCoords = vec2(convertedTextureCoordinates.x, convertedTextureCoordinates.y);

  //wave effect (we just blur the reflection texture coordinates a little bit in two dimensions)
  vec2 xBlur = (texture2D(u_texDUDV, vec2(v_texCoord.x + u_moveFactor, v_texCoord.y)).rg * 4.0 - 1.0) * waveMovement;
  vec2 yBlur = (texture2D(u_texDUDV, vec2(-v_texCoord.x + u_moveFactor, v_texCoord.y + u_moveFactor)).rg * 4.0 - 1.0) * waveMovement;
  vec2 totalBlur = xBlur + yBlur;

  //compute final blured reflection texture coordinates
  reflectionTextureCoords += totalBlur;
  vec4 immFragColor = texture2D(u_tex, vec2(reflectionTextureCoords.x, 1.0 - reflectionTextureCoords.y));

  gl_FragColor = vec4(immFragColor.rgb, immFragColor.a * uAlpha);
}
