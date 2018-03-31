/**
 * Created by Alex-User on 17.06.2016.
 */

var skyBoxShaderNode;
var globalLightningShaderNode;
var rotateLight;
var wellMainNode;
var cgLogoTransform;
var rotatedCoin;

var waterFrameBuffer;
var waterReflectionTexture;
var waterReflectionDepthTexture;

//different "level of detail" models
var wellUpsideDown1;
var wellUpsideDown2;
var wellUpsideDown3;

var wellLevelToSet = null;

const well = {
    position: {
        x: 0,
        y: 0.25,
        z: 15
    }
}

function createScene1AndEnv(resources) {

    var root = new ShaderSGNode();

    skyBoxShaderNode = new ShaderSGNode(createProgram(gl, resources.vs_env, resources.fs_env));
    globalLightningShaderNode = new ShaderSGNode(createProgram(gl, resources.vs_lighting, resources.fs_lighting));  //global lightning with phong shader


    root.append(skyBoxShaderNode);
    root.append(globalLightningShaderNode);

    var skyBoxNode = new EnvironmentSGNode(cubeMapTexture, 4, new RenderSGNode(makeSphere(35)));
    skyBoxShaderNode.append(skyBoxNode);

    //wells light source
    function createLightSphere() {
        return new ShaderSGNode(createProgram(gl, resources.vs_lighting, resources.fs_lighting), [
            new RenderSGNode(resources.modelLaternLamp)
        ]);
    }

    {
        let light = new LightSGNode();
        light.ambient = [0.4, 0.4, 0.4, 1];
        light.diffuse = [0.3, 0.3, 0.3, 1];
        light.specular = [1, 1, 1, 1];
        light.position = [-5.0, -3.5, 15];
        light.append(createLightSphere());

        rotateLight = new TransformationSGNode(mat4.create(), [
            light
        ]);
        globalLightningShaderNode.append(rotateLight);
    }

    {
        let latern = new MaterialSGNode([
            new RenderSGNode(resources.modelLatern)
        ]);

        latern.ambient = [0.0, 0.3, 0.0, 1];
        latern.diffuse = [0.1, 0.49, 0.1, 1];
        latern.specular = [0.2, 0.4, 0.2, 1];
        latern.shininess = 0.8;

        laternTransform = new TransformationSGNode(mat4.create(), [
            new TransformationSGNode(glm.transform({ translate: [-5.0, 0, 15], rotateX : 180, scale: 0.6 }),  [
                latern
            ])
        ]);
        globalLightningShaderNode.append(laternTransform);
    }

    {   //To transform all well components as a whole only once
        wellMainNode = new TransformationSGNode(glm.transform({ translate: [well.position.x, well.position.y, well.position.z], rotateX: 0, scale: 2}));
        globalLightningShaderNode.append(wellMainNode);
    }

    {
        setWellLevelOfDetail(1);    //initial level of detail for well (lowest one first)
    }

    {
        let cgLogo = new MaterialSGNode([
            new RenderSGNode(resources.modelCGLogo)
        ]);

        cgLogo.ambient = [0.8, 0.5, 0.2, 1];
        cgLogo.diffuse = [0.8, 0.5, 0.2, 1];
        cgLogo.specular = [0.8, 0.5, 0.2, 1];
        cgLogo.shininess = 0.4;

        cgLogoTransform = new TransformationSGNode(mat4.create(), [cgLogo]);
        wellMainNode.append(cgLogoTransform);
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
        wellMainNode.append(rotatedCoin);
    }

    {
        wellFloorNode = new ShaderSGNode(createProgram(gl, resources.vs_tex, resources.fs_tex));
        let wellFloor =  new BlendTextureSGNode(wellfloorTexture,3, 1,
            new RenderSGNode(makeWellTextureBase())
        );

        wellFloorTransform = new TransformationSGNode(
            glm.transform({ translate: [0, 0.1, 0], rotateX: -90, scale: 0.8}),
            [wellFloor]
        );
        wellFloorNode.append(wellFloorTransform);
        wellMainNode.append(wellFloorNode);
    }

    {
        waterRootNode = new ShaderSGNode(createProgram(gl, resources.vs_water, resources.fs_water));
        let watersurface =
            new WaterSGNode(waterReflectionTexture, 1, waterDUDVmap, 2, 0.7,
                new RenderSGNode(makeWellTextureBase())
            );

        waterTransfrom = new TransformationSGNode(
            glm.transform({ translate: [0, waterHeight, 0], rotateX: -90, scale: 0.8}),
            [watersurface]
        );
        waterRootNode.append(waterTransfrom);
        wellMainNode.append(waterRootNode);
    }

    {
        wellDescriptionNode = new ShaderSGNode(createProgram(gl, resources.vs_tex, resources.fs_tex));
        let wellDescription =  new BlendTextureSGNode(wellDescriptionTexture, 0, 1,
            [new RenderSGNode(makeSimpleQuad(1))]);
        wellDescription.wrapS = gl.CLAMP_TO_EDGE;
        wellDescription.wrapT = gl.CLAMP_TO_EDGE;

        wellDescriptionTransform = new TransformationSGNode(mat4.create(), [
            new TransformationSGNode(glm.transform({ translate: [0, -0.1, -1.1], rotateX : 175, rotateY: 0, scale: 0.3 }),  [
                wellDescription
            ])
        ]);

        wellDescriptionNode.append(wellDescriptionTransform);
        wellMainNode.append(wellDescriptionNode);
    }


    {
        overallFloorNode = new ShaderSGNode(createProgram(gl, resources.vs_tex, resources.fs_tex));
        let wellFloor =  new BlendTextureSGNode(overallFloorTexture,3, 1,
            new RenderSGNode(makeSimpleQuad(20))
        );

        overallFloorTransform = new TransformationSGNode(glm.transform({ translate: [0, 1.0, 0], rotateX : 90, scale: 50 }), [wellFloor]);
        overallFloorNode.append(overallFloorTransform);
        globalLightningShaderNode.append(overallFloorNode);
    }

    return root;
}

//preconfigure the 3 different "level of detail" objects
function setUpWellLevelOfDetail(resources){
    {
        let well1 = new MaterialSGNode([
            new RenderSGNode(resources.modelWell1)
        ]);

        well1.ambient = [0.8, 0.8, 0.8, 1];
        well1.diffuse = [0.75164, 0.75164, 0.75164, 1];
        well1.specular = [0.1, 0.1, 0.1, 1];
        well1.shininess = 0.4;

        wellUpsideDown1 = new TransformationSGNode(mat4.create(), [
            new TransformationSGNode(glm.transform({ translate: [0, 0, 0], rotateX : 180, scale: 0.8 }),  [
                well1
            ])
        ]);
    }

    {
        let well2 = new MaterialSGNode([
            new RenderSGNode(resources.modelWell2)
        ]);

        well2.ambient = [0.8, 0.8, 0.8, 1];
        well2.diffuse = [0.75164, 0.75164, 0.75164, 1];
        well2.specular = [0.1, 0.1, 0.1, 1];
        well2.shininess = 0.4;

        wellUpsideDown2 = new TransformationSGNode(mat4.create(), [
            new TransformationSGNode(glm.transform({ translate: [0, 0, 0], rotateX : 180, scale: 0.8 }),  [
                well2
            ])
        ]);
    }

    {
        let well3 = new MaterialSGNode([
            new RenderSGNode(resources.modelWell3)
        ]);

        well3.ambient = [0.8, 0.8, 0.8, 1];
        well3.diffuse = [0.75164, 0.75164, 0.75164, 1];
        well3.specular = [0.1, 0.1, 0.1, 1];
        well3.shininess = 0.4;

        wellUpsideDown3 = new TransformationSGNode(mat4.create(), [
            new TransformationSGNode(glm.transform({ translate: [0, 0, 0], rotateX : 180, scale: 0.8 }),  [
                well3
            ])
        ]);
    }
}

//set current level of detail well geometry
function setWellLevelOfDetail(level){
    if(wellLevelToSet != null)
        wellMainNode.remove(wellLevelToSet);

    if(level == 1){
        wellLevelToSet = wellUpsideDown1;
    }else if(level == 2){
        wellLevelToSet = wellUpsideDown2;
    }else if(level == 3) {
        wellLevelToSet = wellUpsideDown3;
    }

    wellMainNode.append(wellLevelToSet);
}

//base geometry for textures
function makeSimpleQuad(texRepeatFactor){
    var position = [ -1, -1, 0,  1, -1, 0,  1, 1, 0,  -1, 1, 0];
    var normVecs = [0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1];
    var texCoords = [0, 0,   texRepeatFactor, 0,   texRepeatFactor, texRepeatFactor,   0, texRepeatFactor];
    var index = [0, 1, 2,   2, 3, 0];

    //RenderSGNode requires this attributes for rendering
    return {position: position, normal: normVecs, texture: texCoords, index: index};
}

function makeWellTextureBase(){

    var v = 0.35;

    var position = [-v,1,0, -1,v,0, -1,-v,0, -v,-1,0, v,-1,0, 1,-v,0, 1,v,0, v,1,0];
    var normVecs = [0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,    0, 0, 1,   0, 0, 1];
    var texCoords = [0.25,1, 0,0.75, 0, 0.25, 0.25,0, 0.75,0, 1,0.25, 1,0.75, 0.75,1];
    var index = [1,2,3, 0,1,3, 0,3,4, 0,7,4, 7,4,5, 7,5,6];

    return {position: position, normal: normVecs, texture: texCoords, index: index};
}

function setUpStaticTextures(resources)
{
    gl.activeTexture(gl.TEXTURE0);

    wellDescriptionTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, wellDescriptionTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0,  gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.wellDescr);

    overallFloorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, overallFloorTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0,  gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.stoneBottom);

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

    gl.bindTexture(gl.TEXTURE_2D, null);
}

function setUpReflectionTexture() {
    gl.getExtension("WEBGL_depth_texture");

    //we want to render to a frame buffer object now
    waterFrameBuffer = gl.createFramebuffer();
    waterReflectionTexture = gl.createTexture();
    waterReflectionDepthTexture = gl.createTexture();

    //now we set the corresponding attributes for reclection and reflectionDepth texture
    setRenderTextureAttributes();
}

function setRenderTextureAttributes(){
    gl.bindFramebuffer(gl.FRAMEBUFFER, waterFrameBuffer);
    checkForWindowResize(gl);

    gl.activeTexture(gl.TEXTURE0);

    //create color texture
    gl.bindTexture(gl.TEXTURE_2D, waterReflectionTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //we need to clamp to edge if texture is not size "power of 2"
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight,
        0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    //create depth texture
    gl.bindTexture(gl.TEXTURE_2D, waterReflectionDepthTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, gl.drawingBufferWidth, gl.drawingBufferHeight,
        0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

    //attach the textures to the framebuffer object
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, waterReflectionTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, waterReflectionDepthTexture ,0);

    //unbind texture and activate screen's framebuffer again
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function renderWaterReflectionTexture(timeInMilliseconds)
{
    checkForWindowResize(gl);
    //we want to render to our created frame buffer object instead to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, waterFrameBuffer);

    //clear viewport
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const context = createSGContext(gl);
    context.projectionMatrix = mat4.perspective(mat4.create(), 30, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
    //camera y position for recording reflection (under the watersurface)
    let camRefPosition = camera.position.y - waterHeight;
    //set camera position for recording waters reflection
    let lookAtMatrix = mat4.lookAt(mat4.create(),
        [camera.position.x, camera.position.y - 2*camRefPosition, camera.position.z],
        [camera.position.x, -camera.position.y - 2*camRefPosition, 30],
        [0,1,0]);
    //if the direction of the cam changes only, the reflection should not alter (do the inverse actions of camera direction changings)
    let mouseRotateMatrix = mat4.multiply(mat4.create(),
        glm.rotateX(-camera.direction.y),
        glm.rotateY(camera.direction.x));
    //standard stuff
    context.viewMatrix = mat4.multiply(mat4.create(), mouseRotateMatrix, lookAtMatrix);
    context.viewMatrix = mat4.multiply(mat4.create(),  mouseRotateMatrix, lookAtMatrix);
    context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

    //skybox will be rendered to our currently bound framebuffer (our water reflection texture)
    skyBoxShaderNode.render(context);

    //activate screen's framebuffer again
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
