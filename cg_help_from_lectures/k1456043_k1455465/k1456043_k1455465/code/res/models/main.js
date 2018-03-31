//camera
const camera = {
  rotation: {
    x: 0,
    y: 0,
    z: 0
  }
};

loadResources({
  vs_tex: 'shader/texture_1.vs.glsl',
  fs_tex: 'shader/texture_1.fs.glsl',
  vs_water: 'shader/water.vs.glsl',
  fs_water: 'shader/water.fs.glsl',
  vs_env: 'shader/envMap.vs.glsl',
  fs_env: 'shader/envMap.fs.glsl',
  vs_lighting: 'shader/phong.vs.glsl',
  fs_lighting: 'shader/phong.fs.glsl',
  env_negx: 'res/skybox/negx.jpg',
  env_negy: 'res/skybox/negy.jpg',
  env_negz: 'res/skybox/negz.jpg',
  env_posx: 'res/skybox/posx.jpg',
  env_posy: 'res/skybox/posy.jpg',
  env_posz: 'res/skybox/posz.jpg',
  wellbottomtex: 'res/img/coinsBottom.jpg',
  modelWell: 'res/models/brunnen4.obj',
  modelCGLogo: 'res/models/cg.obj',
  modelCoin: 'res/models/coin.obj',
  modelWaterSurface: 'res/models/watersurface.obj',
  waterdudv: 'res/img/waterdudv.jpg',
  waterDisplacementTexture: 'res/img/waterdisplacementmap.jpg'
}).then(function (resources) {
  init(resources);
  render(0);
});

function init(resources) {
  gl = createContext();
  setUpCubeMap(resources);
  setUpStaticTextures(resources);
  setUpReflectionTexture();

  gl.enable(gl.DEPTH_TEST);

  initInteraction(gl.canvas);
  root = makeTheScene(resources);
  moveFactor = 0.0; //we want to move the water by time
}

function makeTheScene(resources) {

  var root = new ShaderSGNode();

  //2nd level scenegraph nodes
  skyBoxShaderNode = new ShaderSGNode(createProgram(gl, resources.vs_env, resources.fs_env));
  globalLightningShaderNode = new ShaderSGNode(createProgram(gl, resources.vs_lighting, resources.fs_lighting));  //global lightning with phong shader

  root.append(skyBoxShaderNode);
  root.append(globalLightningShaderNode);

  var skyBoxNode = new EnvironmentSGNode(cubeMapTexture, 4, new RenderSGNode(makeSphere(10)));
  skyBoxShaderNode.append(skyBoxNode);

  function createLightSphere() {
     return new ShaderSGNode(createProgram(gl, resources.vs, resources.fs), [
       new RenderSGNode(makeSphere(.2,10,10))
     ]);
   }

   {
     let light = new LightSGNode();
     light.ambient = [0.3, 0.3, 0.3, 1];
     light.diffuse = [0.3, 0.3, 0.3, 1];
     light.specular = [1, 1, 1, 1];
     light.position = [2, -2.0, 0];
     light.append(createLightSphere());

     rotateLight = new TransformationSGNode(mat4.create(), [
         light
     ]);
    globalLightningShaderNode.append(rotateLight);
  }

  {
    let well = new MaterialSGNode([
      new RenderSGNode(resources.modelWell)
    ]);

    well.ambient = [0.24725, 0.1995, 0.0745, 1];
    well.diffuse = [0.75164, 0.60648, 0.22648, 1];
    well.specular = [0.628281, 0.555802, 0.366065, 1];
    well.shininess = 0.4;

    wellUpsideDown = new TransformationSGNode(mat4.create(), [
      new TransformationSGNode(glm.transform({ translate: [0, 0, 0], rotateX : 180, scale: 0.8 }),  [
        well
      ])
    ]);

    globalLightningShaderNode.append(wellUpsideDown);
  }


  {
    let cgLogo = new MaterialSGNode([
      new RenderSGNode(resources.modelCGLogo)
    ]);

    cgLogo.ambient = [0.3, 0.3, 0.3, 1];
    cgLogo.diffuse = [1, 0, 1, 1];
    cgLogo.specular = [0.1, 0.1, 0.1, 1];
    cgLogo.shininess = 0.9;

    cgLogoTransform = new TransformationSGNode(mat4.create(), [cgLogo]);
    globalLightningShaderNode.append(cgLogoTransform);
  }

  {
    let coin = new MaterialSGNode([
      new RenderSGNode(resources.modelCoin)
    ]);

    coin.ambient = [0.24725, 0.1995, 0.0745, 1];
    coin.diffuse = [0.75164, 0.60648, 0.22648, 1];
    coin.specular = [0.628281, 0.555802, 0.366065, 1];
    coin.shininess = 0.4;

    rotatedCoin = new TransformationSGNode(mat4.create(), [coin]);
    globalLightningShaderNode.append(rotatedCoin);
  }

  {
    wellFloorNode = new ShaderSGNode(createProgram(gl, resources.vs_tex, resources.fs_tex));
    let wellFloor =  new BlendTextureSGNode(wellfloorTexture,3, 1,
      new RenderSGNode(makeSimpleQuad())
    );

    wellFloorTransform = new TransformationSGNode(mat4.create(), [wellFloor]);
    wellFloorNode.append(wellFloorTransform);
    globalLightningShaderNode.append(wellFloorNode);
  }


  {
    waterRootNode = new ShaderSGNode(createProgram(gl, resources.vs_water, resources.fs_water));
    let watersurface = new MaterialSGNode(  //our water surface needs a material (we want to reflect light as well)
                new WaterSGNode(waterReflectionTexture, 1, waterDUDVmap, 2, waterDisplacementmap, 3, 0.7,
                new RenderSGNode(makeSimpleQuad())
                ));

    waterTransfrom = new TransformationSGNode(mat4.create(), [watersurface]);
    waterRootNode.append(waterTransfrom);
    globalLightningShaderNode.append(waterRootNode);
  }

  return root;
}

//base geometry for textures
function makeSimpleQuad(){
  var position = [ -1, -1, 0,  1, -1, 0,  1, 1, 0,  -1, 1, 0];
  var normVecs = [0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1];
  var texCoords = [0, 0,   1, 0,   1, 1,   0, 1];
  var index = [0, 1, 2,   2, 3, 0];

  //RenderSGNode requires this attributes for rendering
  return {position: position, normal: normVecs, texture: texCoords, index: index};
}

function setUpCubeMap(resources) {

  cubeMapTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTexture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  //now we upload the 6 skymap images to the corresponding cube planes
  //(type of texture, detail level, internal format, image format, data type of image, image data)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_posx);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_negx);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_negy);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_posy);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_posz);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_negz);

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}

function setUpStaticTextures(resources)
{
  gl.activeTexture(gl.TEXTURE0);

  wellfloorTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, wellfloorTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, 0,  gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.wellbottomtex);

  waterDUDVmap = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, waterDUDVmap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.waterdudv);

  waterDisplacementmap = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, waterDisplacementmap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.waterDisplacementTexture);

  gl.bindTexture(gl.TEXTURE_2D, null);
}

function setUpReflectionTexture() {
  gl.getExtension("WEBGL_depth_texture");

  //we want to render to a frame buffer object now
  waterFrameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, waterFrameBuffer);
  checkForWindowResize(gl); //resize window to render whole scene on texture

  gl.activeTexture(gl.TEXTURE0);
  waterReflectionTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, waterReflectionTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);  //we need to clamp to edge if texture is not size "power of 2"
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight,  0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  //create depth texture
  waterReflectionDepthTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, waterReflectionDepthTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

  //fill the allocated framebuffer object with our render texture (depth texture is also required in order to provide DEPTH_TEST);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, waterReflectionTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, waterReflectionDepthTexture ,0);

  //unbind texture and activate screen's framebuffer again
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function renderWaterReflectionTexture(timeInMilliseconds)
{
  checkForWindowResize(gl);
  gl.bindFramebuffer(gl.FRAMEBUFFER, waterFrameBuffer); //we want to render to our created frame buffer object instead to screen

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const context = createSGContext(gl);
  context.projectionMatrix = mat4.perspective(mat4.create(), 30, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
  let lookAtMatrix = mat4.lookAt(mat4.create(), [0, 1, -2], [0,0,0], [0,1,0]);
  let mouseRotateMatrix = mat4.multiply(mat4.create(),
                            glm.rotateX(-camera.rotation.x),
                            glm.rotateY(camera.rotation.y));
  context.viewMatrix = mat4.multiply(mat4.create(), lookAtMatrix, mouseRotateMatrix);
  context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

  //skybox will be rendered to our currently bound framebuffer (our water reflection texture)
  skyBoxShaderNode.render(context);

  //activate screen's framebuffer again
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

//waters wave effect changes by time
function calculateWaterMovement(timeInMilliseconds){
  moveFactor = 0.03 * (timeInMilliseconds/1000);
  moveFactor = moveFactor % 1;  //avoid overflows
}

function render(timeInMilliseconds) {
  checkForWindowResize(gl);

  calculateWaterMovement(timeInMilliseconds);

  renderWaterReflectionTexture(timeInMilliseconds);

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const context = createSGContext(gl);
  context.projectionMatrix = mat4.perspective(mat4.create(), 30, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
  let lookAtMatrix = mat4.lookAt(mat4.create(), [0, -1, -2], [0,0,0], [0,1,0]);
  let mouseRotateMatrix = mat4.multiply(mat4.create(),
                            glm.rotateX(camera.rotation.x),
                            glm.rotateY(camera.rotation.y));
  context.viewMatrix = mat4.multiply(mat4.create(), lookAtMatrix, mouseRotateMatrix);
  context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

  //animate
  rotatedCoin.matrix = mat4.multiply(mat4.create(),
                            glm.transform({ translate: [0.5, -0.1, 0], rotateX : 90, scale: 0.05 }),
                            glm.rotateX(timeInMilliseconds * 0.05));

  cgLogoTransform.matrix = mat4.multiply(mat4.create(),
                            glm.rotateY(timeInMilliseconds * 0.1),
                            glm.transform({ translate: [1.0, -1.07, 0], rotateX : 0, scale: 0.1 }));


  waterTransfrom.matrix = glm.transform({ translate: [0, -0.2, 0], rotateX: -90, scale: 0.715});
  wellFloorTransform.matrix = glm.transform({ translate: [0, 0.1, 0], rotateX: -90, scale: 0.715});

  root.render(context);

  requestAnimationFrame(render);
}


class EnvironmentSGNode extends SGNode {

  constructor(envtexture, textureunit, children) {
      super(children);
      this.envtexture = envtexture;
      this.textureunit = textureunit;
  }

  render(context)
  {
    let invView3x3 = mat3.fromMat4(mat3.create(), context.invViewMatrix);
    gl.uniformMatrix3fv(gl.getUniformLocation(context.shader, 'u_invView'), false, invView3x3);
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_texCube'), this.textureunit);

    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.envtexture);

    super.render(context);

    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  }
}

class BlendTextureSGNode extends SGNode {
  constructor(texture, textureunit, alpha, children ) {
      super(children);
      this.texture = texture;
      this.textureunit = textureunit;
      this.alpha = alpha;
  }

  render(context)
  {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    let invView3x3 = mat3.fromMat4(mat3.create(), context.invViewMatrix);
    gl.uniformMatrix3fv(gl.getUniformLocation(context.shader, 'u_invView'), false, invView3x3);
    gl.uniform1f(gl.getUniformLocation(context.shader, 'uAlpha'), this.alpha);

    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_tex'), this.textureunit);

    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    super.render(context);

    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.disable(gl.BLEND);
  }
}

class WaterSGNode extends BlendTextureSGNode {
  constructor(reflectionTexture, reflTextureUnit, dudvMapTexture, dudvMapTextureUnit, displacementMap, displacementMapunit, alpha, children ) {
      super(reflectionTexture, reflTextureUnit, alpha, children);
      this.dudvMapTexture = dudvMapTexture;
      this.dudvMapTextureUnit = dudvMapTextureUnit;
      this.displacementMap = displacementMap;
      this.displacementMapunit = displacementMapunit;
  }

  render(context)
  {
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_texDisplacement'), this.displacementMapunit);
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_texDUDV'), this.dudvMapTextureUnit);
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_moveFactor'), moveFactor);


    gl.activeTexture(gl.TEXTURE0 + this.dudvMapTextureUnit);
    gl.bindTexture(gl.TEXTURE_2D, this.dudvMapTexture);
    gl.activeTexture(gl.TEXTURE0 + this.displacementMapunit);
    gl.bindTexture(gl.TEXTURE_2D, this.displacementMap);

    super.render(context);

    gl.activeTexture(gl.TEXTURE0 + this.dudvMapTextureUnit);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0 + this.displacementMapunit);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}

function initInteraction(canvas) {
  const mouse = {
    pos: { x : 0, y : 0},
    leftButtonDown: false
  };
  function toPos(event) {
    //convert to local coordinates
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  canvas.addEventListener('mousedown', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = event.button === 0;
  });
  canvas.addEventListener('mousemove', function(event) {
    const pos = toPos(event);
    const delta = { x : mouse.pos.x - pos.x, y: mouse.pos.y - pos.y };
    //TASK 0-1 add delta mouse to camera.rotation if the left mouse button is pressed
    if (mouse.leftButtonDown) {
      //add the relative movement of the mouse to the rotation variables
  		camera.rotation.x += delta.x;
  		camera.rotation.y += delta.y;
    }
    mouse.pos = pos;
  });
  canvas.addEventListener('mouseup', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = false;
  });
  //register globally
  document.addEventListener('keypress', function(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
    if (event.code === 'KeyR') {
      camera.rotation.x = 0;
  		camera.rotation.y = 0;
    }
  });

  document.addEventListener('keydown', function(event) {

    const keyName = event.key;
    if (event.code === 'ArrowUp') {
      i++;
    }
    if (event.code === 'ArrowDown') {
      i--;
    }
    if (event.code === 'ArrowLeft') {
      a++;
    }
    if (event.code === 'ArrowRight') {
      a--;
    }
  });
}
