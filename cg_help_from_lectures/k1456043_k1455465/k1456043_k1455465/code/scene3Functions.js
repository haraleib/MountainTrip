/**
 * Created by Flo on 16.06.2016.
 */


/**
 * Function to create a cuboid with variable parameters
 * @param width
 * @param height
 * @param depth
 * @returns {{position: *[], normal: number[], texture: number[], index: number[]}}
 */
function createCuboid(width, height, depth, textureRepeatFactor) {

  var socketVertices = [
    -width,-height,-depth,  width,-height,-depth,  width, height,-depth,  -width, height,-depth,
    -width,-height, depth,  width,-height, depth,  width, height, depth,  -width, height, depth,
    -width,-height,-depth, -width, height,-depth, -width, height, depth,  -width,-height, depth,
    width,-height,-depth,  width, height,-depth,  width, height, depth,  width,-height, depth,
    -width,-height,-depth,  -width,-height, depth,  width,-height,depth,  width,-height,-depth,
    -width, height,-depth,  -width, height, depth,  width, height, depth,   width, height,-depth
  ];

  var socketIndices = [
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    8,9,10, 8,10,11,
    12,13,14, 12,14,15,
    16,17,18, 16,18,19,
    20,21,22, 20,22,23
  ];


  var normal = [
    0,0,-1,   0,0,-1, 0,0,-1, 0,0,-1,    //left
    0,0,1, 0,0,1, 0,0,1, 0,0,1,            //right
    -1,0,0,  -1,0,0,  -1,0,0,  -1,0,0,      //front
    1,0,0,  1,0,0,  1,0,0,  1,0,0,          //back
    0, -1,0,   0,-1,0,   0,-1,0,   0,-1,0,   //bottom
    0, 1,0,   0,1,0,   0,1,0,   0,1,0];     //top

  var texturecoordinates = [
    0.0, 0.0, textureRepeatFactor,0.0,  textureRepeatFactor,textureRepeatFactor,  0,textureRepeatFactor,
    textureRepeatFactor,0.0,   0.0,0.0,  0,textureRepeatFactor,   textureRepeatFactor,textureRepeatFactor,
    0.0, 0.0,  0,textureRepeatFactor,    textureRepeatFactor,textureRepeatFactor,  textureRepeatFactor,0.0,
    0.0,0.0,  0,textureRepeatFactor,   textureRepeatFactor,textureRepeatFactor,   textureRepeatFactor,0.0,
    0.0,0.0,  0.0,textureRepeatFactor,   textureRepeatFactor,textureRepeatFactor, textureRepeatFactor,0.0 ,
    0,0,  textureRepeatFactor,0,  textureRepeatFactor,textureRepeatFactor, 0,textureRepeatFactor


  ];
  return {
    position: socketVertices,
    normal: normal,
    texture: texturecoordinates,
    index: socketIndices
  };

}

/**
 * Create a textured cuboid
 * @param width   Width of the cube
 * @param height  Height of the cube
 * @param depth   Depth of the cube
 * @param texture Texture of the cube
 * @returns {*}
 */
function getCuboid(width, height, depth, texture, textureRepeatFactor) {
  var texNode;
  var socketMaterial;
  if(texture!=null) {
    texNode=new AdvancedTextureSGNode(texture,new RenderSGNode(createCuboid(width,height,depth,textureRepeatFactor)));
    texNode.wrapS=gl.CLAMP_TO_EDGE;
    texNode.wrapT=gl.CLAMP_TO_EDGE;
    socketMaterial = new MaterialSGNode(new CustomTexSGNode(texNode));
  } else {
    socketMaterial = new MaterialSGNode(new CustomTexSGNode(new RenderSGNode(createCuboid(width,height,depth,textureRepeatFactor))));
  }


  socketMaterial.ambient=[0.05375,0.05,0.06625,1];
  socketMaterial.diffuse=[0.18275,0.17,0.22525,1];
  socketMaterial.specular=[0.332741,0.328634 ,0.346435,1];
  socketMaterial.shininess=50;

  return socketMaterial;
}

var socketTransformNode;
var completeLightTransform;
var rotateLight;

function createScene3(gl, resources) {

  const root = new ShaderSGNode(createProgram(gl, resources.vs_tex2, resources.fs_tex2));

  //create a rotating light for the scene
  let light = new LightSGNode();
  light.ambient = [0.2, 0.2, 0.2, 1];
  light.diffuse = [1, 1, 1, 1];
  light.specular = [1, 1, 1, 1];
  light.position = [0, 0, 0];

  rotateLight = new TransformationSGNode(mat4.create(),new TransformationSGNode(glm.translate(0,-2.5,-4),[light]));
  root.append(rotateLight);


  //make an additional second light for the scene
  let light2 = new LightSGNode();
  light2.ambient = [0.2, 0.2, 0.2, 1];
  light2.diffuse = [1, 1, 1, 1];
  light2.specular = [1, 1, 1, 1];

  let lightTransNode=new TransformationSGNode(glm.translate(2,-3,2));
  lightTransNode.append(light2);


  socketTransformNode =  new TransformationSGNode(mat4.create(),[]);

  //create a floor with a special texture for the scene
  let floor=new MaterialSGNode(new CustomTexSGNode(new AdvancedTextureSGNode(resources.floor,new RenderSGNode(createCuboid(6,0.1,6,5)))));

    //sort of ruby like material but with different shininess
  floor.ambient = [0.1745, 0.01175, 0.01175, 1];
  floor.diffuse = [0.61424, 0.04136, 0.04136, 1];
  floor.specular = [0.727811,0.626959, 0.626959, 1];
  floor.shininess =16;

  socketTransformNode.append(new TransformationSGNode(glm.transform({translate: [0,0.98, 0]}),floor));

  //create the steps for the glass cuboid
  var cubeChange=0;
  for(let i=0;i<6;i++) {
    socketTransformNode.append(new TransformationSGNode(glm.transform({translate: [0,0.80-cubeChange, 0]}),getCuboid(2-cubeChange,0.1,2-cubeChange,resources.socketTexture,1)));
    cubeChange+=0.2;
  }

  socketTransformNode.append(new TransformationSGNode(glm.transform({translate: [0,-0.5, 0]}),getCuboid(0.4,0.3,0.4,resources.socketTexture,1)));


  //create the different coloured spheres
  let redSphere=new MaterialSGNode(new RenderSGNode(makeSphere(.1,30,30)));
  redSphere.ambient = [1, 0.05, 0.06625,1];
  redSphere.diffuse = [1, 0.17, 0.22525,1];
  redSphere.specular = [0.332741, 0.328634, 0.346435,1];
  redSphere.shininess = 1;
  let redLight=new LightSGNode();
  redLight.ambient = [0.4, 0.2, 0.2, 1];
  redLight.diffuse = [1, 1, 1, 1];
  redLight.specular = [1, 1, 1, 1];
  redLight.append(redSphere);

  let blueSphere=new MaterialSGNode(new RenderSGNode(makeSphere(.1,30,30)));
  blueSphere.ambient = [0, 0.05, 1,1];
  blueSphere.diffuse = [0, 0.17, 1,1];
  blueSphere.specular = [0.332741, 0.328634, 0.346435,1];
  blueSphere.shininess = 1;

  changingLight=new LightSGNode();
  changingLight.ambient = [0.4, 0.4, 0.45, 1];
  changingLight.diffuse = [1, 1, 1, 1];
  changingLight.specular = [1, 1, 1, 1];
  changingLight.append(blueSphere);
  redTrans=new TransformationSGNode(mat4.create(),redLight);
  blueTrans=new TransformationSGNode(mat4.create(),[changingLight]);

  let greenSphere=new MaterialSGNode(new RenderSGNode(makeSphere(.1,30,30)));
  greenSphere.ambient = [0, 1, 0,1];
  greenSphere.diffuse = [0, 1, 0,1];
  greenSphere.specular = [0.332741, 0.328634, 0.346435,1];
  greenSphere.shininess = 1;

  let greenLight=new LightSGNode();
  greenLight.ambient = [0, 0.4, 0, 1];
  greenLight.diffuse = [1, 1, 1, 1];
  greenLight.specular = [1, 1, 1, 1];
  greenLight.append(greenSphere);

  greenTrans=new TransformationSGNode(mat4.create(),greenLight);

  //create the glass like cuboid, the front will be a seethrough grid created implemented with an alpha texture
  let alphaFront=new TransformationSGNode(glm.transform({translate: [0,0.15,0.39],rotateX:90}),
    new AlphaSGNode(resources.glass,resources.alphaGlass,getCuboid(0.4,0,0.4,null,1)));
  let backSide=new TransformationSGNode(glm.transform({translate: [0,0.15,-0.4],rotateX:-90}),
    getCuboid(0.4,0,0.4,resources.glass,1));
  let topSide=new TransformationSGNode(glm.transform({translate: [0,-0.25, 0],rotateZ:180}),
      getCuboid(0.4,0,0.4,resources.glass,1));
  let leftSide=new TransformationSGNode(glm.transform({translate: [0.4,0.15, 0],rotateZ:-90}),
      getCuboid(0.4,0,0.4,resources.glass,1));
  let rightSide=new TransformationSGNode(glm.transform({translate: [-0.4,0.15, 0],rotateZ:90}),
      getCuboid(0.4,0,0.4,resources.glass,1));

  completeLightTransform=new TransformationSGNode(mat4.create(),new TransformationSGNode(glm.transform({translate:[0,0.15,0]}),[greenTrans, redTrans,blueTrans]));

  //the front of the cuboid will sink down during the animation, therefore we need a TransformationSGNode
  alphaGridTrans=new TransformationSGNode(mat4.create(),[alphaFront]);
  socketTransformNode.append(new TransformationSGNode(glm.transform({translate: [0,-1.35, 0]}),
      [completeLightTransform, leftSide,rightSide,backSide,topSide,alphaGridTrans]));

  root.append(lightTransNode);
  root.append(rotateLight);
  root.append(socketTransformNode);


  return root;
}
