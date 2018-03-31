
/*
Phong shader for textures and with spotlight and alpha texture support
*/
precision mediump float;

/**
 * definition of a material structure containing common properties
 */
struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

/**
 * definition of the light properties related to material properties
 */
struct Light {

	vec4 ambient;
	vec4 diffuse;
	vec4 specular;

	//for spotlight
	vec3 direction;
	float angle;
	vec3 position;
};

//illumination related variables
uniform Material u_material;
uniform Light u_light;
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;

 uniform float u_alpha;
 uniform bool u_enableAlpha;

//texture related variables
uniform bool u_enableObjectTexture;
varying vec2 v_texCoord;
uniform sampler2D u_tex;
uniform sampler2D u_alphaTex;


//spotlight variables
uniform bool u_spotLight;
varying mat3 v_normalMatrix;
uniform bool u_disableSpot;
float attenuation;

vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor) {
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	//compute diffuse term
	float diffuse = max(dot(normalVec,lightVec),0.0);

	//compute specular term
	vec3 reflectVec = reflect(-lightVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

  if(u_enableObjectTexture)
  {
    material.diffuse=textureColor;
    material.ambient=textureColor;

  }

	vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

  return c_amb + c_diff + c_spec + c_em;
}

void main (void) {

  vec4 textureColor = vec4(0,0,0,1);
  float alpha;
  if(u_enableObjectTexture)
  {
		textureColor=texture2D(u_tex,v_texCoord);

  }

  attenuation=1.0;

  if(u_spotLight) {

    //the direction vector of the light has to be transformed, otherwise it would move with the camera
    vec3 coneDir=normalize(vec3(v_normalMatrix*(u_light.direction-u_light.position)));

    //the ray direction is the direction vector from the light to a point of an object
    vec3 rayDir =normalize(v_lightVec);

    //calculates the angle between the direction of the light and the direction from the light to a point of an object
    float lightToSurfaceAngle = degrees(acos(dot(rayDir,coneDir)));


    //if this angle is bigger, the point is not within the spot and will therefore be painted darker"
    if(lightToSurfaceAngle>u_light.angle||u_disableSpot) {
     attenuation=0.5;
    }

  }

    if(u_enableAlpha) {
    //if an alpha texture is given, the alpha value will be taken from the texture
      alpha=texture2D(u_alphaTex,v_texCoord)[1];
         vec4 temp=calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec, textureColor);

          gl_FragColor = vec4(temp.xyz*attenuation,alpha);

     } else {
        vec4 temp=calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec, textureColor);

        //the vector is multiplied with the attenuation to determine if it is painted darker or not
        gl_FragColor = vec4(temp.xyz*attenuation,1);


    }



}


