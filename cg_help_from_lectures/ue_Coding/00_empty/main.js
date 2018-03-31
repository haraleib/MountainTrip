//the OpenGL context
var gl = null;
//our shader program
var shaderProgram = null;

var canvasWidth = 800;
var canvasHeight = 800;
var aspectRatio = canvasWidth / canvasHeight;

var context;

//camera and projection settings
var animatedAngle = 0;
var fieldOfViewInRadians = convertDegreeToRadians(30);


var unicornTransformationNode;
var headTransformationNode;
//links to buffer stored on the GPU
var UnicornVertexBuffer, UnicornColorBuffer, UnicornIndexBuffer;
var headVertexBuffer, headColorBuffer, headIndexBuffer;
var coneVertexBuffer, coneColorBuffer, coneIndexBuffer;

/*--------------------CONE Unicorn------------------------*/
var coneVertices = [
    1.5, 0, 0,
    -1.5, 1, 0,
    -1.5, 0.809017,	0.587785,
    -1.5, 0.309017,	0.951057,
    -1.5, -0.309017, 0.951057,
    -1.5, -0.809017, 0.587785,
    -1.5, -1, 0,
    -1.5, -0.809017, -0.587785,
    -1.5, -0.309017, -0.951057,
    -1.5, 0.309017,	-0.951057,
    -1.5, 0.809017,	-0.587785
];
var coneIndices= [
    0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 5,
    0, 5, 6,
    0, 6, 7,
    0, 7, 8,
    0, 8, 9,
    0, 9, 10,
    0, 10, 1
];
/*--------------------END CONE Unicorn------------------------*/
  /*--------------------HEAD Unicorn------------------------*/
var t = 0.3;
var headVertices = new Float32Array([
      // vordere Fläche
      -t, -t,  t,
       t, -t,  t,
       t,  t,  t,
      -t,  t,  t,

      // hintere Fläche
      -t, -t, -t,
      -t,  t, -t,
       t,  t, -t,
       t, -t, -t,

      // obere Fläche
      -t,  t, -t,
      -t,  t,  t,
       t,  t,  t,
       t,  t, -t,

      // untere Fläche
      -t, -t, -t,
       t, -t, -t,
       t, -t,  t,
      -t, -t,  t,

      // rechte Fläche
       t, -t, -t,
       t,  t, -t,
       t,  t,  t,
       t, -t,  t,

      // linke Fläche
      -t, -t, -t,
      -t, -t,  t,
      -t,  t,  t,
      -t,  t, -t
    ]);
var headColors = new Float32Array([
       0,1,1, 0,1,1, 0,1,1, 0,1,1, //vorne
       1,0,1, 1,0,1, 1,0,1, 1,0,1, //hinten
       1,0,0, 1,0,0, 1,0,0, 1,0,0, //oben
       0,0,1, 0,0,1, 0,0,1, 0,0,1, //unten
       1,1,0, 1,1,0, 1,1,0, 1,1,0, //rechte
       0,1,0, 0,1,0, 0,1,0, 0,1,0 //linke
    ]);
var headIndices =  new Float32Array([
       0,1,2, 0,2,3, //vorne
       4,5,6, 4,6,7, //hinten
       8,9,10, 8,10,11, //oben
       12,13,14, 12,14,15, //unten
       16,17,18, 16,18,19, //rechts
       20,21,22, 20,22,23 //links
    ]);
/*--------------------END HEAD Unicorn------------------------*/
/*----------------------BODY Unicorn--------------------------*/
var s = 0.3; //size of Unicorn
var UnicornVertices = new Float32Array([
  // vordere Fläche
  -s, -s,  s,
   s, -s,  s,
   s,  s,  s,
  -s,  s,  s,

  // hintere Fläche
  -s, -s, -s,
  -s,  s, -s,
   s,  s, -s,
   s, -s, -s,

  // obere Fläche
  -s,  s, -s,
  -s,  s,  s,
   s,  s,  s,
   s,  s, -s,

  // untere Fläche
  -s, -s, -s,
   s, -s, -s,
   s, -s,  s,
  -s, -s,  s,

  // rechte Fläche
   s, -s, -s,
   s,  s, -s,
   s,  s,  s,
   s, -s,  s,

  // linke Fläche
  -s, -s, -s,
  -s, -s,  s,
  -s,  s,  s,
  -s,  s, -s
]);
var UnicornColors = new Float32Array([
   0,1,1, 0,1,1, 0,1,1, 0,1,1, //vorne
   1,0,1, 1,0,1, 1,0,1, 1,0,1, //hinten
   1,0,0, 1,0,0, 1,0,0, 1,0,0, //oben
   0,0,1, 0,0,1, 0,0,1, 0,0,1, //unten
   1,1,0, 1,1,0, 1,1,0, 1,1,0, //rechte
   0,1,0, 0,1,0, 0,1,0, 0,1,0 //linke
]);
var UnicornIndices =  new Float32Array([
   0,1,2, 0,2,3, //vorne
   4,5,6, 4,6,7, //hinten
   8,9,10, 8,10,11, //oben
   12,13,14, 12,14,15, //unten
   16,17,18, 16,18,19, //rechts
   20,21,22, 20,22,23 //links
]);
/*----------------------------- END BODY Unicorn ----------------*/
//load the shader resources using a utility function
loadResources({
  vs: 'shader/empty.vs.glsl',
  fs: 'shader/empty.fs.glsl',
  //TASK 5-3
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render();
});

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context
  gl = createContext(canvasWidth, canvasHeight);
  //in WebGL / OpenGL3 we have to create and use our own shaders for the programmable pipeline
  //create the shader program
  shaderProgram = createProgram(gl, resources.vs, resources.fs);
  //set buffers for unicorn
  initUnicornBuffer();
  rootNode = new SceneGraphNode();

  var unicornTransformationMatrix = glm.rotateX(90);
  unicornTransformationMatrix = mat4.multiply(mat4.create(), unicornTransformationMatrix, glm.translate(0.0,-0.5,0));
  unicornTransformationMatrix = mat4.multiply(mat4.create(), unicornTransformationMatrix, glm.scale(0.5,0.5,1));

  //Task 3-2
  var transformationNode = new TransformationSceneGraphNode(unicornTransformationMatrix);
  rootNode.append(transformationNode);

  //TASK 5-3
  var staticColorShaderNode = new ShaderSceneGraphNode(createProgram(gl, resources.staticcolorvs, resources.fs));
  transformationNode.append(staticColorShaderNode);

  //TASK 2-2
  var quadNode = new QuadRenderNode();
  staticColorShaderNode.append(quadNode)

  createRobot(rootNode);
}
/*
*Buffers for the Unicorn
*/
function initUnicornBuffer(){
  initHeadBuffer();
  initConeBuffer();
  initUnicornBodyBuffer();
}
function initConeBuffer(){
  coneVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coneVertices), gl.STATIC_DRAW);

//  coneColorBuffer = gl.createBuffer();
//  gl.bindBuffer(gl.ARRAY_BUFFER, coneColorBuffer);
//  gl.bufferData(gl.ARRAY_BUFFER, coneColors, gl.STATIC_DRAW);

  coneIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(coneIndices), gl.STATIC_DRAW);
}

function initHeadBuffer(){
  headVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, headVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, headVertices, gl.STATIC_DRAW);

  headColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, headColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, headColors, gl.STATIC_DRAW);

  headIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, headIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(headIndices), gl.STATIC_DRAW);
}

function initUnicornBodyBuffer() {
  UnicornVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, UnicornVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, UnicornVertices, gl.STATIC_DRAW);

  UnicornColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, UnicornColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, UnicornColors, gl.STATIC_DRAW);

  UnicornIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, UnicornIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(UnicornIndices), gl.STATIC_DRAW);
}

function createRobot(rootNode) {
  var robotTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.rotateY(animatedAngle/2));
  robotTransformationMatrix = mat4.multiply(mat4.create(), robotTransformationMatrix, glm.translate(0.3,0.9,0));
  robotTransformationNode = new TransformationSceneGraphNode(robotTransformationMatrix);
  rootNode.append(robotTransformationNode);

  //body
  cubeNode = new CubeRenderNode();
  robotTransformationNode.append(cubeNode);

  //transformation of head
  var headTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.rotateY(animatedAngle));
  headTransformationMatrix = mat4.multiply(mat4.create(), headTransformationMatrix, glm.translate(0.0,0.4,0));
  headTransformationMatrix = mat4.multiply(mat4.create(), headTransformationMatrix, glm.scale(0.4,0.33,0.5));
  headTransformationNode = new TransformationSceneGraphNode(headTransformationMatrix);
  robotTransformationNode.append(headTransformationNode);

  //head
  cubeNode = new CubeRenderNode();
  headTransformationNode.append(cubeNode);

  //transformation of left leg
  var leftLegTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.translate(0.16,-0.6,0));
  leftLegTransformationMatrix = mat4.multiply(mat4.create(), leftLegTransformationMatrix, glm.scale(0.2,1,1));
  var leftLegTransformationNode = new TransformationSceneGraphNode(leftLegTransformationMatrix);
  robotTransformationNode.append(leftLegTransformationNode);

  //left leg
  cubeNode = new CubeRenderNode();
  leftLegTransformationNode.append(cubeNode);

  //transformation of right leg
  var rightLegTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.translate(-0.16,-0.6,0));
  rightLegTransformationMatrix = mat4.multiply(mat4.create(), rightLegTransformationMatrix, glm.scale(0.2,1,1));
  var rightLegtTransformationNode = new TransformationSceneGraphNode(rightLegTransformationMatrix);
  robotTransformationNode.append(rightLegtTransformationNode);

  //right leg
  cubeNode = new CubeRenderNode();
  rightLegtTransformationNode.append(cubeNode);
}

/**
 * render one frame
 */
function render(timeInMilliseconds) {
  //Setzt die Farbe auf Schwarz, vollständig sichtbar
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  //clear the buffer Lösche alles, um die neue Farbe sichtbar zu machen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Aktiviere Tiefentest to let objects in front occluse objects further away
  gl.enable(gl.DEPTH_TEST);

  //activate this shader program
  gl.useProgram(shaderProgram);

  context = createSceneGraphContext(gl, shaderProgram);

  rootNode.render(context);

  renderRobot(context.sceneMatrix, context.viewMatrix);
  renderUnicornHead(context.sceneMatrix, context.viewMatrix);
  renderUnicornCone(context.sceneMatrix, context.viewMatrix);

  //request another render call as soon as possible
  requestAnimationFrame(render);

  //animate based on elapsed time
  animatedAngle = timeInMilliseconds/10;
}
function renderUnicornCone(sceneMatrix, viewMatrix){
  var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
  gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(positionLocation);

//  var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
//  gl.bindBuffer(gl.ARRAY_BUFFER, coneColorBuffer);
//  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false,0,0) ;
//  gl.enableVertexAttribArray(colorLocation);

  //transformations on whole body
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.rotateY(animatedAngle/4));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.translate(1.1,0.65,-0.5));

  //store current sceneMatrix in originSceneMatrix, so it can be restored
  var originSceneMatrix = sceneMatrix;

  //karosserie

  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.rotateZ(90));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.translate(0.15,0.1,1));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.scale(0.125,-0.15,0.2));
  setUpModelViewMatrix(sceneMatrix, viewMatrix);
  renderCone();
}

function renderUnicornHead(sceneMatrix, viewMatrix){

  var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
  gl.bindBuffer(gl.ARRAY_BUFFER, headVertexBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(positionLocation);

  var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
  gl.bindBuffer(gl.ARRAY_BUFFER, headColorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(colorLocation);
  //transformations on whole body
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.rotateY(animatedAngle/4));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.translate(1,0.9,0));

  //sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.rotateY(animatedAngle));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.translate(0.0,-0.4,0.5));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.scale(0.5,0.4,0.7));
  setUpModelViewMatrix(sceneMatrix, viewMatrix);
  renderHead();
}

function renderRobot(sceneMatrix, viewMatrix) {
  var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
  gl.bindBuffer(gl.ARRAY_BUFFER, UnicornVertexBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(positionLocation);

  var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
  gl.bindBuffer(gl.ARRAY_BUFFER, UnicornColorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(colorLocation);

  //transformations on whole body
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.rotateY(animatedAngle/4));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.translate(1,0.9,0));

  //store current sceneMatrix in originSceneMatrix, so it can be restored
  var originSceneMatrix = sceneMatrix;
  //body
  //sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.rotateY(animatedAngle));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.translate(0.0,-0.4,0));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.scale(0.7,0.4,1));
  setUpModelViewMatrix(sceneMatrix, viewMatrix);
  renderUnicornBody();

  //body
  //  sceneMatrix = originSceneMatrix;
  //  setUpModelViewMatrix(sceneMatrix, viewMatrix);
  //  renderUnicorn();

  //left wheel front
  sceneMatrix = originSceneMatrix;
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.translate(0.15,-0.58,-0.24));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.scale(0.2,0.2,0.2));
  setUpModelViewMatrix(sceneMatrix, viewMatrix);
  renderUnicornBody();

  //right wheel front
  sceneMatrix = originSceneMatrix;
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.translate(-0.15,-0.58,-0.24));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.scale(0.2,0.2,0.2));
  setUpModelViewMatrix(sceneMatrix, viewMatrix);
  renderUnicornBody();

  //left wheel back
  sceneMatrix = originSceneMatrix;
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.translate(0.15,-0.58,0.24));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.scale(0.2,0.2,0.2));
  setUpModelViewMatrix(sceneMatrix, viewMatrix);
  renderUnicornBody();

  //right wheel back
  sceneMatrix = originSceneMatrix;
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.translate(-0.15,-0.58,0.24));
  sceneMatrix = mat4.multiply(mat4.create(), sceneMatrix, glm.scale(0.2,0.2,0.2));
  setUpModelViewMatrix(sceneMatrix, viewMatrix);
  renderUnicornBody();
}

function renderUnicornBody() {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, UnicornIndexBuffer);
  gl.drawElements(gl.TRIANGLES, UnicornIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP
}

function renderHead() {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, headIndexBuffer);
  gl.drawElements(gl.TRIANGLES, headIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP
}

function renderCone() {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
  gl.drawElements(gl.TRIANGLES, coneIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP
}

function setUpModelViewMatrix(sceneMatrix, viewMatrix) {
  var modelViewMatrix = mat4.multiply(mat4.create(), viewMatrix, sceneMatrix);
  gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_modelView'), false, modelViewMatrix);
}

/**
 * returns a new rendering context
 * @param gl the gl context
 * @param projectionMatrix optional projection Matrix
 * @returns {ISceneGraphContext}
 */
function createSceneGraphContext(gl, shader) {

  //create a default projection matrix
  projectionMatrix = mat4.perspective(mat4.create(), fieldOfViewInRadians, aspectRatio, 0.01, 10);
  gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_projection'), false, projectionMatrix);

  return {
    gl: gl,
    sceneMatrix: mat4.create(),
    viewMatrix: calculateViewMatrix(),
    projectionMatrix: projectionMatrix,
    shader: shader
  };
}

function calculateViewMatrix() {
  //compute the camera's matrix
  var eye = [0,3,5];
  var center = [0,0,0];
  var up = [0,1,0];
  viewMatrix = mat4.lookAt(mat4.create(), eye, center, up);
  return viewMatrix;
}

/**
 * base node of the scenegraph
 */
class SceneGraphNode {

  constructor() {
    this.children = [];
  }

  /**
   * appends a new child to this node
   * @param child the child to append
   * @returns {SceneGraphNode} the child
   */
  append(child) {
    this.children.push(child);
    return child;
  }

  /**
   * removes a child from this node
   * @param child
   * @returns {boolean} whether the operation was successful
   */
  remove(child) {
    var i = this.children.indexOf(child);
    if (i >= 0) {
      this.children.splice(i, 1);
    }
    return i >= 0;
  };

  /**
   * render method to render this scengraph
   * @param context
   */
  render(context) {

    //render all children
    this.children.forEach(function (c) {
      return c.render(context);
    });
  };
}

/**
 * a quad node that renders floor plane
 */
class QuadRenderNode extends SceneGraphNode {
  render(context) {

    //TASK 2-1

    //setting the model view and projection matrix on shader
    setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

    var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
    gl.bindBuffer(gl.ARRAY_BUFFER, quadColorBuffer);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocation);

    //set alpha value for blending
    //TASK 1-3
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), 1);

    // draw the bound data as 6 vertices = 2 triangles starting at index 0
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    //render children
    super.render(context);
  }
}

//TASK 4-1
class unicornRenderNode extends SceneGraphNode {
  render(context) {

    //setting the model view and projection matrix on shader
    setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

    var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, unicornVertexBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
    gl.enableVertexAttribArray(positionLocation);

    var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
    gl.bindBuffer(gl.ARRAY_BUFFER, unicornColorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false,0,0) ;
    gl.enableVertexAttribArray(colorLocation);

    //set alpha value for blending
    //TASK 1-3
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), 0.5);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, unicornIndexBuffer);
    gl.drawElements(gl.TRIANGLES, unicornIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP

    //render children
    super.render(context);
  }
}

//TASK 3-0
/**
 * a transformation node, i.e applied a transformation matrix to its successors
 */
class TransformationSceneGraphNode extends SceneGraphNode {
  /**
   * the matrix to apply
   * @param matrix
   */
  constructor(matrix) {
    super();
    this.matrix = matrix || mat4.create();
  }

  render(context) {
    //backup previous one
    var previous = context.sceneMatrix;
    //set current world matrix by multiplying it
    context.sceneMatrix = mat4.multiply(mat4.create(), previous, this.matrix);
    //render children
    super.render(context);
    //restore backup
    context.sceneMatrix = previous;
  }

  setMatrix(matrix) {
    this.matrix = matrix;
  }
}

//TASK 5-0
/**
 * a shader node sets a specific shader for the successors
 */
class ShaderSceneGraphNode extends SceneGraphNode {
  /**
   * constructs a new shader node with the given shader program
   * @param shader the shader program to use
   */
  constructor(shader) {
    super();
    this.shader = shader;
  }

  render(context) {
    //backup prevoius one
    var backup = context.shader;
    //set current shader
    context.shader = this.shader;
    //activate the shader
    context.gl.useProgram(this.shader);
    //set projection matrix
    gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_projection'), false, context.projectionMatrix);
    //render children
    super.render(context);
    //restore backup
    context.shader = backup;
    //activate the shader
    context.gl.useProgram(backup);
  }
};

function convertDegreeToRadians(degree) {
  return degree * Math.PI / 180
}
