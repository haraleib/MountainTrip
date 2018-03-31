/**
 * Created by Alex-User on 16.06.2016.
 */


const camera = {
    position: {
        x: 0,
        y: 33,
        z: 0
    },

    prevposition: {
        x: 0,
        y: 33,
        z: 0
    },
    direction: {
        x: 1,
        y: 0,
        z: 1
    },
    up: {
        x: 0,
        y: 0,
        z: 1
    }
}

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

var cameraSpeed = 0.15;

// user interactions are not allowed when
// automated camera flight is triggered
var cancelCameraFlight = false;


function moveCamera(){

    //is the camera out of bounds ?
    if(calculateCameraToOriginDistance() > 33){
        camera.position.x = camera.prevposition.x;
        camera.position.y = camera.prevposition.y;
        camera.position.z = camera.prevposition.z;
        return;
    }

    //set the previous camera position
    camera.prevposition.x = camera.position.x;
    camera.prevposition.y = camera.position.y;
    camera.prevposition.z = camera.position.z;
    
    //move the camera
    if(moveForward){
        camera.position.x += -Math.sin(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
        camera.position.y += Math.sin(glMatrix.toRadian(camera.direction.y)) * cameraSpeed;
        camera.position.z += Math.cos(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
    }if(moveBackward){
        camera.position.x -= -Math.sin(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
        camera.position.y -= Math.sin(glMatrix.toRadian(camera.direction.y)) * cameraSpeed;
        camera.position.z -= Math.cos(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
    }if(moveLeft){
        camera.position.x += -Math.cos(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
        camera.position.z += -Math.sin(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
    }if(moveRight){
        camera.position.x -= -Math.cos(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
        camera.position.z -= -Math.sin(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
    }

    //camera stops at the bottom
    if(camera.position.y <= 0.5){
       camera.position.y = 0.5;
    }
}

function calculateCameraToOriginDistance(){
    return Math.sqrt(Math.pow(camera.position.x, 2) + Math.pow(camera.position.y, 2) + Math.pow(camera.position.z, 2));
}

function calculatePrevCameraToOriginDistance(){
    return Math.sqrt(Math.pow(camera.prevposition.x, 2) + Math.pow(camera.prevposition.y, 2) + Math.pow(camera.prevposition.z, 2));
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

        if (mouse.leftButtonDown && cancelCameraFlight) {
            //add the relative movement of the mouse to the rotation variables
            camera.direction.x += delta.x;
            camera.direction.y += delta.y;

            //roll is not allowed
            if(camera.direction.y < -270)
                camera.direction.y = -270;
            if(camera.direction.y > 90)
                camera.direction.y = 90;

        }
        mouse.pos = pos;
    });
    canvas.addEventListener('mouseup', function(event) {
        mouse.pos = toPos(event);
        mouse.leftButtonDown = false;
    });
    //register globally
    document.addEventListener('keypress', function(event) {


        if(event.code==='KeyC') {   //deactivate the camera flight
            introSound.pause();
            cancelCameraFlight = true;
        }

        
        if(event.code === 'KeyK' && cancelCameraFlight){  //speed up camera
            cameraSpeed +=0.01;
            if(cameraSpeed >= 0.2)
                cameraSpeed = 0.2;
        }
        if(event.code === 'KeyL' && cancelCameraFlight){  //slow down camera
            cameraSpeed -=0.01;
            if(cameraSpeed <= 0.01){
                cameraSpeed = 0.01;
            }
        }

        if(event.code ==='KeyQ' && cancelCameraFlight) {
            if(activateCarAnimation) {
                startingSound.pause();
            }
            if(activateScene3Animation) {
                audio.pause();
            }

        }

    });

    document.addEventListener('keydown', function(event) {
        if(cancelCameraFlight) {

            if (event.code === 'ArrowUp' || event.code === 'KeyW') {
                moveForward = true;
            }
            if (event.code === 'ArrowDown' || event.code === 'KeyS') {
                moveBackward = true;
            }
            if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
                moveLeft = true;
            }
            if (event.code === 'ArrowRight' || event.code === 'KeyD') {
                moveRight = true;
            }

        }
    });

    document.addEventListener('keyup', function(event) {
        if(cancelCameraFlight) {
            if (event.code === 'ArrowUp' || event.code === 'KeyW') {
                moveForward = false;
            }
            if (event.code === 'ArrowDown' || event.code === 'KeyS') {
                moveBackward = false;
            }
            if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
                moveLeft = false;
            }
            if (event.code === 'ArrowRight' || event.code === 'KeyD') {
                moveRight = false;
            }
        }
    });
}

//waters wave effect changes by time
function calculateWaterMovement(timeInMilliseconds){
    moveFactor = 0.03 * (timeInMilliseconds/1000);
    moveFactor = moveFactor % 1;  //avoid overflows
}

function calculateCameraToWellDistance(){
    xDist = camera.position.x - well.position.x;
    yDist = camera.position.y - well.position.y;
    zDist = camera.position.z - well.position.z;
    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2) + Math.pow(zDist, 2));
}


var statuePosX = 12;
var statuePosY = 0;
var statuePosZ = -3;

function calculateCameraToStatueDistance(){
    xDist = camera.position.x - statuePosX;
    yDist = camera.position.y - statuePosY;
    zDist = camera.position.z - statuePosZ;
    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2) + Math.pow(zDist, 2));
}


var first = true;
var cameraFlightSteps = 0;
var minDistanceToWell = 5;
var minDistanceToStatue = 5;
var minDistanceToScene3 = 5;

function triggerAutomatedCameraFlight(timeInMilliseconds){
    switch(cameraFlightSteps){
        case 0:{    //part 1: go from top of the world to first scene
            if(first) { //is executed only once (at the beginning of the camera flight)
                introSound.play();
                cameraSpeed = 0.3;
                camera.direction.y -= 30;   //set view angle in y direction
                first = false;  //do not execute anymore
            }
            if (camera.direction.x < 360) { //rotate cameras around own a axis
                camera.direction.x += 2;
            }else
                cameraSpeed = 0.12;
            //move the camera towards the well until minDistanceToWell has been reached
            if (calculateCameraToWellDistance() > minDistanceToWell) {
                camera.position.x += -Math.sin(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
                camera.position.y += Math.sin(glMatrix.toRadian(camera.direction.y)) * cameraSpeed * 0.9;
                camera.position.z += Math.cos(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
            }else{  //First part of camera animation is over, go to next part
                cameraFlightSteps = 1;
                camera.direction.x = 0;
                cameraSpeed = 0.3;
            }
            break;
        }
        case 1:{    //part 2: rotate the camera around the well
            activateCoin = true;
            var outputCameraPosVec = [0,0,0];
            vec3.rotateY(outputCameraPosVec,
                [camera.position.x, camera.position.y, camera.position.z],
                [well.position.x, well.position.y, well.position.z],
                0.011);
            camera.position.x = outputCameraPosVec[0];
            camera.position.y = outputCameraPosVec[1];
            camera.position.z = outputCameraPosVec[2];

            camera.direction.x -= 0.65;
            //now we look directly at scene 2
            if(camera.direction.x < -145){
                cameraFlightSteps = 2;
                activateCoin = false;
                cameraFlightSteps = 2;  //part 2 is over now
            }
            break;
        }
        case 2:{    //part 3: move towards scene2 (roman statue)
            if (calculateCameraToStatueDistance() > minDistanceToStatue+1) {
                camera.direction.y += 0.5;
                camera.position.x += -Math.sin(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
                camera.position.y += Math.sin(glMatrix.toRadian(camera.direction.y)) * cameraSpeed;
                camera.position.z += Math.cos(glMatrix.toRadian(camera.direction.x)) * cameraSpeed;
            }else
                cameraFlightSteps = 3;  // to continue with part 4 ...
            break;
        }
        case 3: {
            if(camera.position.z>statuePosZ-4) {    //move further to the statue and the car
                camera.position.z += Math.cos(glMatrix.toRadian(camera.direction.x)) * cameraSpeed/2;

            } else {
                //turn camera to the staue
                if(camera.direction.x<-70) {
                    camera.direction.x+=0.7;

                } else {
                    cameraFlightSteps=4;
                }
            }
            break;
        }
        case 4:
        {
            //activate the car and turn camera back to the car
            activateCarAnimation = true;
            camera.direction.x -= 0.45;
            if (camera.direction.x<-215) {
                cameraFlightSteps = 5;
            }
            break;
        }
        case 5: {
            //move camera with the car to scene 3
            if(camera.position.x >-13) {
                camera.position.x += -Math.sin(glMatrix.toRadian(camera.direction.x)) * cameraSpeed/1.5;
            } else {
                activateScene3Animation=true;
                //turn camera onto the glass like cube
                if(camera.direction.x>-303) {
                    camera.direction.x -= 0.6;

                } else {
                    cameraFlightSteps=6;
                }
            }
            break;
        }
        case 6:
        {
            //move tha camera to the left side of the cuboid and change the camera direction
            if (camera.position.x > -16) {
                camera.position.x += -Math.sin(glMatrix.toRadian(camera.direction.x)) * cameraSpeed / 7;
                camera.direction.x -= 0.3;

            } else {
                cameraFlightSteps = 7;
            }

            break;
        }
        case 7: {
            //adapt camera direction the look slightly up to the cuboid
            if (camera.direction.x > -400) {
                camera.direction.x -= 0.2;
                camera.direction.y+=0.08;
            }
        }
    }
}

var centerScene3=[-15,0,-4.6];

/**
 * function to determine the distance from the camera to the third scene
 * @returns {number}
 */
function calculateCameraToScene3() {
    xDist = camera.position.x - centerScene3[0];
    yDist = camera.position.y - centerScene3[1];
    zDist = camera.position.z - centerScene3[2];
    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2) + Math.pow(zDist, 2));
}

var cameraToWellDistance = minDistanceToWell + 1;
var prevCameraToWellDistance = minDistanceToWell + 1;   //at beginning we are outside of the scene radius