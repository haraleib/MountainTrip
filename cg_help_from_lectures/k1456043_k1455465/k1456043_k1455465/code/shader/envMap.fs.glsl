/**
*   environment fragement shader
*/

precision mediump float;    //how precisely is a float value resolved

varying vec3 v_normalVec;
varying vec3 v_cameraRayVec;

uniform samplerCube u_texCube;  //contains the cube map's image data

void main(){
  vec3 normalVec = normalize(v_normalVec);
  vec3 cameraRayVec = normalize(v_cameraRayVec);    //lookup cube map texel for eachs vertex cameraRayVector

  gl_FragColor = textureCube(u_texCube, cameraRayVec);
}
