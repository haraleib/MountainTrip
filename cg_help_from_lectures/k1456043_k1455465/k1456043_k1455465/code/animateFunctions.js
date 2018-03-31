/**
 * Created by Alex and Flo on 16.06.2016.
 */
const coin = {
    posX: 0.85,
    posY: -0.39,
    posZ: 0
};

var rotatedCoin;

//coin triggering flags
var activateCoin = false;       //has the coin be triggered?
var coinBeginningPosition = true;     //get the current coin position at trigger time
var isCoinRotatingAtWellBorder = true;    //at first the coin rotates on the well border
var rotationTriggered;      //get the exact milliseconds when the trigger button has been pressed
var triggeredStartCounter = 0;  //counter which starts to increment when the coin snipping is triggered

//cg logo is rotating on top of the well
function animateCGLogo(timeInMilliseconds){
    //a logo on top of the well should rotate
    cgLogoTransform.matrix = mat4.multiply(mat4.create(),
        glm.transform({ translate: [0, -1.07, 0.00], rotateX : 90, scale: 0.1 }),
        glm.rotateZ(timeInMilliseconds * 0.1));
}

//coin moves around the well
function animateCoin(timeInMilliseconds){
    //we want to snip the coin
    if(activateCoin){
        snipCoin(timeInMilliseconds);
    }else if(isCoinRotatingAtWellBorder){ //executed when the scene has been reset
        //initially, the coin moves around the well border
        rotatedCoin.matrix = mat4.multiply(mat4.create(),
            glm.rotateY(timeInMilliseconds * 0.05),
            glm.transform({ translate: [coin.posX, coin.posY, coin.posZ], rotateX : 90, scale: 0.05 }));

        rotatedCoin.matrix = mat4.multiply(mat4.create(),
            rotatedCoin.matrix,
            glm.rotateZ(timeInMilliseconds * 0.5));
    }
}

//This function does the basic movement of the
//wells coin snipping effect
function snipCoin(timeInMilliseconds){
    //first we move the coin to the well border position where we have triggered it
    if(coinBeginningPosition){
        rotationTriggered = timeInMilliseconds; //store the rotation position of the coin where it has been triggered
        coinBeginningPosition = false;  //we do the code in the if statement only once at beginning of triggering
    }

    animateTriggeredCoin();
    
    //coin rotates nicely
    rotatedCoin.matrix = mat4.multiply(mat4.create(), rotatedCoin.matrix, glm.rotateX(timeInMilliseconds));

    triggeredStartCounter++;

    //coin drops on wells floor
    if(triggeredStartCounter > 115){

        animateTriggeredCoin(); //coin drops on the bottom of the well

        //reset all flags for triggering coin snip
        activateCoin = false;
        coinBeginningPosition = true;
        isCoinRotatingAtWellBorder = true;
        triggeredStartCounter = 0;
    }
}

//helper function which does the basic coin snip transformations
function animateTriggeredCoin(){
    //at every step we start at the position where triggering happened
    rotatedCoin.matrix = mat4.multiply(mat4.create(),
        glm.rotateY(rotationTriggered * 0.05),
        glm.transform({ translate: [coin.posX, coin.posY, coin.posZ], rotateX : 0, scale: 0.05 })
    );

    //multiply a certain rotation factor to the coin matrix
    rotatedCoin.matrix = mat4.multiply(mat4.create(), rotatedCoin.matrix,
        glm.transform({ translate: [- (triggeredStartCounter/10 + 0.01), -0.39 - (15 * Math.sin((triggeredStartCounter/30))), 0], rotateX : 0, scale: 1 }));

}

/*-------------------------------Animations for Scene 2--------------------------------------*/

var activateCarAnimation=false;
var carAnimationTime=0;
var carSpeed=0.3;
var started=false;
var startingSound;
var startTime=0;

/**
 * function to animate the movement of the car
 * @param carNode
 * @param tirePositions
 */
function animateCarMovement(carNode,tirePositions) {

    if(!started) {
        started=true;
        //start the sound of the car
        startingSound.play();
        //disable the spotlight
        lightSpot.disableSpot=true;
        translateSpotLight.matrix=glm.translate(0,20,0);
    }
    

    if(startTime>300) {
        var move = -carAnimationTime * carSpeed / 10;
        if (carPosition[0]+move > -12) {

            //move the camera until the third scene is reached
            carNode.matrix = glm.translate(move, 0, 0);

            //animate the tires
            for (var i = 0; i < 4; i++) {
                //translate  back to position
                let transMat = mat4.translate(mat4.create(), mat4.create(), tirePositions[i]);
                //rotate around its position
                let rotMat = mat4.rotate(mat4.create(), transMat, glMatrix.toRadian(carAnimationTime * carSpeed * 10), [0, 0, -1]);
                //translate to the origin
                transMat = mat4.translate(mat4.create(), rotMat, [-tirePositions[i][0], -tirePositions[i][1], -tirePositions[i][2]]);

                switch (i) {
                    case 0:
                        tireRotateRightBack.matrix = transMat;
                        break;
                    case 1:
                        tireRotateRightFront.matrix = transMat;
                        break;
                    case 2:
                        tireRotateLeftBack.matrix = transMat;
                        break;
                    case 3:
                        tireRotateLeftFront.matrix = transMat;
                        break;
                }
                carAnimationTime++;
            }
        } else {
           startingSound.pause();
            if(cancelCameraFlight) {
                //reset scene
                started=false;
                startingSound.load();
                startTime=0;
                carAnimationTime=0;
                
                activateCarAnimation=false;
                lightSpot.disableSpot=false;
                translateSpotLight.matrix=glm.translate(0,0,0);
                carNode.matrix = glm.translate(0, 0, 0);
            }

        }

    }

    startTime++;

}


/*-------------------------------Animations for Scene 3--------------------------------------*/

var animationCounter=0;

var audio;
var playing=false;

//varibles to animate movement
var lightMovement=0;
var lightTranslation=0;
var alphaMovement=0;

var alphaGridTrans;

//nodes for transforming the spheres and changing the light
var redTrans;
var blueTrans;
var greenTrans;
var changingLight;

var activateScene3Animation=false;

/**
 * function to animate the last scene
 */
function animateScene3() {

    if(!playing) {

        audio.play();
        playing=true;
    }

    //move the front side of the cuboid into the socket
    alphaGridTrans.matrix=glm.translate(0,alphaMovement,0);

    //rotate the red, blue and green sphere
    redTrans.matrix=mat4.multiply(mat4.create(),glm.rotateX(lightMovement*10),glm.translate(0,0,0.3));
    blueTrans.matrix=mat4.multiply(mat4.create(),glm.rotateZ(lightMovement*10),glm.translate(0.3,0,0));
    greenTrans.matrix=mat4.multiply(mat4.create(),glm.rotateY(lightMovement*10),glm.translate(-0.3,0,0));

    lightMovement+=1;

    if(animationCounter%4==0) {
        //change the light randomly
        changingLight.ambient = [Math.random(), Math.random(), Math.random(), 1];
    }
    if(alphaMovement<=0.8) {

        alphaMovement+=0.002;
    } else {
        //move the spheres out of the cuboid
        completeLightTransform.matrix = glm.translate(0, -lightTranslation / 7, lightTranslation);
        changingLight.ambient = [0, 0, 0];
        lightTranslation += 0.02;
    }
    if(audio.ended&&cancelCameraFlight) {
        //reset the scene
        activateScene3Animation=false;
        changingLight.ambient = [0.4, 0.4, 0.45, 1];

        //reset the position of the spheres and the grid
        redTrans.matrix=glm.translate(0,0,0);
        blueTrans.matrix=glm.translate(0,0,0);
        greenTrans.matrix=glm.translate(0,0,0);
        completeLightTransform.matrix = glm.translate(0,0,0);
        alphaGridTrans.matrix=glm.translate(0,0,0);

        //reset the movement variables
        lightMovement=0;
        lightTranslation=0;
        alphaMovement=0;

        //reload audio
        audio.load();
        playing=false;
    }

    animationCounter++;

}
