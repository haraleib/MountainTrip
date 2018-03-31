var waterHeight = -0.25;
var overallFloorNode;
var introSound;

loadResources({

  vs_tex: 'shader/texture_1.vs.glsl',
  fs_tex: 'shader/texture_1.fs.glsl',
  vs_water: 'shader/water.vs.glsl',
  fs_water: 'shader/water.fs.glsl',
  vs_env: 'shader/envMap.vs.glsl',
  fs_env: 'shader/envMap.fs.glsl',
  vs_lighting: 'shader/phong.vs.glsl',
  fs_lighting: 'shader/phong.fs.glsl',
  env_negx: 'res/skybox/right.jpg',
  env_negy: 'res/skybox/down.jpg',
  env_negz: 'res/skybox/back.jpg',
  env_posx: 'res/skybox/left.jpg',
  env_posy: 'res/skybox/up.jpg',
  env_posz: 'res/skybox/front.jpg',
  stoneBottom: 'res/img/floor.jpg',
  wellbottomtex: 'res/img/coinsBottom.jpg',
  wellDescr: 'res/img/wellDescr.jpg',
  modelWell3: 'res/models/brunnen4.obj',
  modelWell2: 'res/models/brunnen2.obj',
  modelWell1: 'res/models/brunnen1.obj',
  modelLatern: 'res/models/latern.obj',
  modelLaternLamp: 'res/models/laternLamp.obj',  
  modelCGLogo: 'res/models/cg.obj',
  modelCoin: 'res/models/coin.obj',
  waterBase: 'res/models/waterBase.obj',
  modelWaterSurface: 'res/models/watersurface.obj',
  waterdudv: 'res/img/waterdudv.jpg',

    //resources scene 2
    vs_tex2: 'shader/texture_2_3.vs.glsl',
    fs_tex2: 'shader/texture_2_3.fs.glsl',
    socketTexture: 'res/modelsScene2/romanMarble.jpg',
    statueTexture: 'res/modelsScene2/marble.jpg',
    spotLight:'res/modelsScene2/spotLight.obj',
    carTexture: 'res/modelsScene2/rust.jpg',  //carTex
    car: 'res/modelsScene2/car_withoutTires.obj',
    tire: 'res/modelsScene2/tire.obj',
    tireTex: 'res/modelsScene2/tireTex.jpg',
    model: 'res/modelsScene2/statue.obj',
    
    //resources scene3
    floor: 'res/modelsScene3/secondFloor.jpg',
    glass: 'res/modelsScene3/glassTexture.jpg',
    alphaGlass: 'res/modelsScene3/alpha.jpg'
    

}).then(function (resources) {
  init(resources);
  render(0, resources);
});


function init(resources) {
    gl = createContext();
    setUpCubeMap(resources);
    setUpStaticTextures(resources);
    setUpReflectionTexture();

    //On window resize, we have to set new attributes for waters reflection textures
    window.addEventListener ('load', function () {
       window.onresize = function (){
           setRenderTextureAttributes();
        }
    });

    setUpWellLevelOfDetail(resources);

    gl.enable(gl.DEPTH_TEST);

    initInteraction(gl.canvas);

    introSound=new Audio("./res/models/strauss.mp3");
    root = createScene1AndEnv(resources);
    //append scene 2


    startingSound=new Audio("./res/modelsScene2/carStartUp.mp3");
   root.append(new TransformationSGNode(glm.transform({translate:[13,-0.1,-3]}),createScene2(gl,resources)));

    overallFloorNode.append(new ShaderSGNode(createProgram(gl,resources.vs_tex2,resources.fs_tex2),carRotateNode));

    //append scene 3
    audio=new Audio("./res/modelsScene3/8Bit_cut.mp3");
    root.append(new TransformationSGNode(glm.transform({translate:[-15, -0.1,-5],rotateY:180}),createScene3(gl,resources)));
    moveFactor = 0.0; //we want to move the water by time
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

function render(timeInMilliseconds) {
    if(!cancelCameraFlight) //the automated camera flight can be canceled with C
        triggerAutomatedCameraFlight(timeInMilliseconds);

    moveCamera(); //change the camera position and direction

    //scene 1 triggering
    prevCameraToWellDistance = cameraToWellDistance;
    cameraToWellDistance = calculateCameraToWellDistance();
    if(cameraToWellDistance < minDistanceToWell) {  //trigger the snip coin animation in scene 1
        activateCoin = true;
    }

    //if within the radius
    if(calculateCameraToStatueDistance()<minDistanceToStatue&&cancelCameraFlight) {
        activateCarAnimation=true;
    }
    if(calculateCameraToScene3()<minDistanceToScene3&&cancelCameraFlight) {
        activateScene3Animation=true;
    }

    checkForWindowResize(gl);

    calculateWaterMovement(timeInMilliseconds); //get a certain factor (time dependence) for water wave effect

    renderWaterReflectionTexture(timeInMilliseconds); //render the water reflection texture

    //special effect: check well's level of detail
    if(cameraToWellDistance >= 5.0 && cameraToWellDistance <= 6.0)
        setWellLevelOfDetail(3);
    else if(cameraToWellDistance >= 10.0 && cameraToWellDistance <= 11.0)
        setWellLevelOfDetail(2);
    else if(cameraToWellDistance >= 15.0 && cameraToWellDistance <= 16.0)
        setWellLevelOfDetail(1);

    //render water at the end at every time (otherwise it would lead to alpha blending problems)
    wellMainNode.remove(waterRootNode);
    wellMainNode.append(waterRootNode);

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    const context = createSGContext(gl);
    context.projectionMatrix = mat4.perspective(mat4.create(), 30, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
    let lookAtMatrix = mat4.lookAt(mat4.create(), [camera.position.x, -camera.position.y, camera.position.z], [camera.position.x, -camera.position.y, 30], [0,1,0]);
    let mouseRotateMatrix = mat4.multiply(mat4.create(),
                            glm.rotateX(camera.direction.y),
                            glm.rotateY(camera.direction.x));
    context.viewMatrix = mat4.multiply(mat4.create(), mouseRotateMatrix, lookAtMatrix);
    context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

    animateCoin(timeInMilliseconds);
    animateCGLogo(timeInMilliseconds);


    if(activateCarAnimation) {
        animateCarMovement(carRotateNode,[posRightBack,posRightFront,posLeftBack,posLeftFront]);
    }

    //rotating light in scene 3
    rotateLight.matrix=glm.rotateY(timeInMilliseconds/10);

    if(activateScene3Animation) {
        animateScene3();
    }

    root.render(context);
    requestAnimationFrame(render);
}





