/**
 * Created by Flo on 16.06.2016.
 */


var statueNode;
var carRotateNode;

//rotation nodes for the tires
var tireRotateRightBack;
var tireRotateRightFront;
var tireRotateLeftBack;
var tireRotateLeftFront;

var carPosition=[15,1,-12];

//position of the tires
var posRightBack=[-1.5,-0.4,-0.3];
var posRightFront=[-5.1,-0.4,-0.3];
var posLeftBack= [-1.5,-0.4,-2];
var posLeftFront=[-5.1,-0.4,-2];


//spot light variables
var lightSpot;
var translateSpotLight;

/**
 * Function to setup a textured Socket
 * @param texture     Texture of the socket
 * @returns {MaterialSGNode}
 */
function getSocket(texture) {
  var texNode = new AdvancedTextureSGNode(texture, new RenderSGNode(createSocket()));
  texNode.wrapS = gl.CLAMP_TO_EDGE;
  texNode.wrapT = gl.CLAMP_TO_EDGE;
  var socketMaterial = new MaterialSGNode(new CustomTexSGNode(texNode));
  socketMaterial.ambient = [0.05375, 0.05, 0.06625,1];
  socketMaterial.diffuse = [0.18275, 0.17, 0.22525,1];
  socketMaterial.specular = [0.332741, 0.328634, 0.346435,1];
  socketMaterial.shininess = 100;

  return socketMaterial;
}

/**
 * Function to create a tire for the car
 * @param tireTexture Texture of the tire
 * @param tireModel   Object file for the tire
 * @returns {MaterialSGNode}
 */
function getTire(tireTexture,tireModel) {
  let tire=new MaterialSGNode([new CustomTexSGNode(new AdvancedTextureSGNode(tireTexture,new RenderSGNode(tireModel)))]);

  tire.ambient = [0.02 ,	0.02 ,	0.02, 1];
  tire.diffuse = [0.01 ,	0.01 ,	0.01, 1];
  tire.specular = [0 ,	0 ,0 , 1];
  tire.shininess = .078125;
  return tire;
}

/**
 * Function to set up a car with four tires
 * (our manually composed model)
 * @param carTexture    Texture of the car
 * @param carModel      Object file for the car
 * @param tireTexture   Texture for the tire
 * @param tireModel     Object file for the tire
 * @returns {TransformationSGNode}
 */
function setUpCar(carTexture,carModel,tireTexture,tireModel) {
  let car = new MaterialSGNode([new AdvancedTextureSGNode(carTexture,new RenderSGNode(carModel))]);
  car.ambient = [0,0.1,0.6,1];
  car.diffuse = [0,0.50980392,0.50980392,1];
  car.specular = [0.50196078,0.50196078,0.50196078 	,1];
  car.shininess = 0.25;

  let carTranslationNode=new TransformationSGNode(glm.transform({translate:carPosition }),[new TransformationSGNode(glm.transform({ rotateX:90,rotateZ:180,scale: 0.03}),car)]);
  carRotateNode = new TransformationSGNode(mat4.create(),carTranslationNode);

  //tires
  let rightBackTire = getTire(tireTexture,tireModel);
  tireRotateRightBack =new TransformationSGNode(mat4.create(),[new TransformationSGNode(glm.transform({translate: posRightBack,rotateX: 90, scale: 1.23}),rightBackTire)]);
  carTranslationNode.append(tireRotateRightBack);

  let rightFrontTire = getTire(tireTexture,tireModel);
  tireRotateRightFront=new TransformationSGNode(mat4.create(),[new TransformationSGNode(glm.transform({translate: posRightFront, rotateX: 90,scale:1.23 }),rightFrontTire)]);
  carTranslationNode.append(tireRotateRightFront);

  let leftBackTire= getTire(tireTexture,tireModel);
  tireRotateLeftBack=new TransformationSGNode(mat4.create(),[new TransformationSGNode(glm.transform({translate:posLeftBack,rotateX:270,scale:1.23 }),leftBackTire)]);
  carTranslationNode.append(tireRotateLeftBack);

  let leftFrontTire = getTire(tireTexture,tireModel);
  tireRotateLeftFront=new TransformationSGNode(mat4.create(),[new TransformationSGNode(glm.transform({translate: posLeftFront,rotateX: 270,scale:1.23 }),leftFrontTire)]);
  carTranslationNode.append(tireRotateLeftFront);


  return carRotateNode;
}


/**
 * Creates our complex 3D Shape, a socket for the statue
 * @returns {{position: *[], normal: number[], texture: number[], index: number[]}}
 */
function createSocket() {
  //socket parameters
  var s = 0.5;
  var t=1.0;
  var u=1.2;
  var socketVertices = [
    -t,-s,-u,  t,-s,-u,  s, s,-s,  -s, s,-s,  //left    //statue back
    -t,-s, u,  t,-s, u,  s, s, s,  -s, s, s,  //right   //statue front
    -t,-s,-u, -s, s,-s, -s, s, s,  -t,-s, u,  //front   //statue left
    t,-s,-u,  s, s,-s,  s, s, s,  t,-s, u,   //back     //statue right
    -t,-s,-u,  -t,-s, u,  t,-s,u,  t,-s,-u,   //bottom
    -s, s,-s,  -s, s, s,  s, s, s,   s, s,-s //top
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
    0, 0.573462,-0.819232,  0, 0.573462,-0.819232,   0, 0.573462,-0.819232,   0, 0.573462,-0.819232,      //left
    0, 0.573462,0.819232,  0, 0.573462,0.819232,   0, 0.573462,0.819232,   0, 0.573462,0.819232,      //right
    -0.894427,0.447214,0,   -0.894427,0.447214,0,   -0.894427,0.447214,0,  -0.894427,0.447214,0,      //front
    0.894427,0.447214,0,   0.894427,0.447214,0,   0.894427,0.447214,0, 0.894427,0.447214,0,      //back
    0, -1,0,   0,-1,0,   0,-1,0,   0,-1,0,                                                               //bottom
    0, 1,0,   0,1,0,   0,1,0,   0,1,0];                                                                   //top

  var texturecoordinates = [
    0.0, 0.0,  1.0,0.0,  0.75,1.0,  0.25,1.0,   //left
    1.0,0.0,   0.0,0.0,  0.25,1.0,   0.75,1.0,  //right
    0.0, 0.0,  0.25,1.0,    0.75,1.0,  1.0,0.0,  //front
    0.0,0.0,  0.25,1.0,   0.75,1.0,   1.0,0.0,   //back
    0.0,0.0,  0.0,1.0,   1.0,1.0, 1.0,0.0 ,     //bottom
    0.25,0.25,  0.75,0.25,  0.75,0.75, 0.25,0.75    //top


  ];
  return {
    position: socketVertices,
    normal: normal,
    texture: texturecoordinates,
    index: socketIndices
  };
}

/**
 * Function to setup a Statue
 * @param statueTexture Texture of the statue
 * @param statueModel   Object file for the statue
 * @returns {MaterialSGNode}
 */
function createStatue(statueTexture,statueModel) {
  let statueTex=new AdvancedTextureSGNode(statueTexture,new RenderSGNode(statueModel));
  statueTex.wrapS=gl.CLAMP_TO_EDGE;
  statueTex.wrapT=gl.CLAMP_TO_EDGE;

  let statue = new MaterialSGNode([
    new CustomTexSGNode(statueTex)
  ]);

  //obsidian
  statue.ambient = [0.05375, 0.05, 0.06625,1];
  statue.diffuse = [0.18275, 0.17, 0.22525,1];
  statue.specular = [0.332741, 0.328634, 0.346435,1];
  statue.shininess = 0.5;

  return statue;
}

function createScene2(gl, resources) {

  const root = new ShaderSGNode(createProgram(gl, resources.vs_tex2, resources.fs_tex2));

    //creates a light quad which is used to mimic a the lamp for the spotlight
    function  createLightQuad(width,height) {
        return new ShaderSGNode(createProgram(gl, resources.vs_lighting, resources.fs_lighting), [
            new RenderSGNode(createCuboid(width,height,0))
        ]);
    }


    //the socket for the statue
  var socketTransformNode =
    new TransformationSGNode(glm.transform({translate: [0, 0.6, 0], rotateX: 180, scale: 0.8}), [
      getSocket(resources.socketTexture)
    ]);


  var statue = createStatue(resources.statueTexture,resources.model);

  let statueTransformNode=new TransformationSGNode(glm.transform({translate: [0, 0.2, 0], rotateZ:-180,rotateY:180, scale: 0.7}),[statue]);

    //the whole statue node which encapsulates the the socket and the roman statue
  statueNode = new TransformationSGNode(glm.transform({translate: [0, -0.12, 0],scale:1.2}), [statueTransformNode,socketTransformNode]);

  //initialize the spotlight
  lightSpot = new SpotLightSGNode([0, 0.5,-3.7],30,[0,-1.5,0]); //use now framework implementation of light node
  lightSpot.ambient = [0.2, 0.2, 0.2, 1];
  lightSpot.diffuse = [0.8, 0.8, 0.8, 1];
  lightSpot.specular = [1, 1, 1, 1];

//the spotlight object
  let spotLight = new MaterialSGNode(new RenderSGNode(resources.spotLight));

  //black plastic
  spotLight.ambient = [0, 0, 0, 1];
  spotLight.diffuse = [0.01, 0.01, 0.01, 1];
  spotLight.specular = [ 	0.50,  	0.50,  	0.50, 1];
  spotLight.shininess = .25;

  translateSpotLight =new TransformationSGNode(mat4.create());
  lightSpot.append(new TransformationSGNode(glm.transform({translate:[-0.01,0.03,0.035],rotateX:40}),createLightQuad(0.3,0.18)));
  translateSpotLight.append(lightSpot);

  var spotTransformationNode = new TransformationSGNode(mat4.create(), [new TransformationSGNode(glm.transform({
    translate: [0, 0.99, -4],
    rotateX: 180,
    scale: 0.1
  }), spotLight)]);



  root.append(statueNode);
  root.append(spotTransformationNode);
  root.append(translateSpotLight);

    //set up the car and its tires
  carRotateNode=setUpCar(resources.carTexture,resources.car,resources.tireTex,resources.tire);


    //append a light to the car to make it visible the whole time
  let carlight = new LightSGNode();
  carlight.ambient = [0.2, 0.2, 0.2, 1];
  carlight.diffuse = [0.8, 0.8, 0.8, 1];
  carlight.specular = [1, 1, 1, 1];
  carlight.position = [0, 0, 0];

    //the car itself will be later on appended to the big floor
 carRotateNode.append(new TransformationSGNode(glm.transform({translate:[13,-2,-5]}),carlight));


  return root;
}
