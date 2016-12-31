/**
 * Created by luketwyman on 03/11/2014.
 */



// INIT //
var canvas;
var cxa;
var scene = 0;
var TWEEN;


// METRICS //
var halfX = 0;
var halfY = 0;
var fullX = 0;
var fullY = 0;
var units = 0;
var dx = halfX;
var dy = halfY;
var headerType = 0;
var midType = 0;
var dataType = 0;
var bodyType = 0;
var subType = 0;
var device = "desktop";


// INTERACTION //
var mouseX = 0;
var mouseY = 0;
var touchTakeover = false;
var touch;
var mouseIsDown = false;


// COLORS //
var bgCols = [new RGBA(0,79,66,1),new RGBA(255,255,255,1),new RGBA(242,28,85,1),new RGBA(90,0,90,1,1),new RGBA(228,100,127,1,1),new RGBA(98,9,115,1,1)];
var textCol = new RGBA(255,255,255,1);
var masterCol = new RGBA(0,0,0,0);
var highPass = new RGBA(0,0,0,0);
var lowPass = new RGBA(0,0,0,0);


var bursts;
var waves;
var diamond;
var radial;


//-------------------------------------------------------------------------------------------
//  INITIALISE
//-------------------------------------------------------------------------------------------


function init() {

    ////////////// SETUP CANVAS ////////////

    canvas = document.getElementById("cnvs");
    interactionInit(canvas);

    cxa = canvas.getContext("2d");
    cxa.mozImageSmoothingEnabled = false;
    cxa.imageSmoothingEnabled = false;

    // SET CANVAS & DRAWING POSITIONS //
    metrics();


    bursts = new Bursts();
    bursts.setup();

    waves = new Waves();
    //waves.setup();

    diamond = new Diamond();
    diamond.setup();

    radial = new Radial();
    radial.setup();

    // DONE //
    scene = 1;
    draw();



    setTimeout( function() {
        colourTo(bgCols[1],60,10,50,1,6);
    },1000);



} // END INIT








//-------------------------------------------------------------------------------------------
//  LOOP
//-------------------------------------------------------------------------------------------




function draw() {
    if (scene==1) {
        update();
        drawBG();
        drawScene();
    }

    requestAnimationFrame(draw,canvas);
}


//-------------------------------------------------------------------------------------------
//  UPDATE
//-------------------------------------------------------------------------------------------



function update() {
    if (TWEEN) {
        TWEEN.update();
    }

    bursts.update();
    waves.update();
    diamond.update();
    radial.update();
}





function valueInRange(value,floor,ceiling) {
    if (value < floor) {
        value = floor;
    }
    if (value> ceiling) {
        value = ceiling;
    }
    return value;
}

function lerp(current,destination,speed) {
    return current + (((destination-current)/100) * speed);
}

function near(a,b,factor) {
    return Math.round(a/factor) == Math.round(b/factor);
}

