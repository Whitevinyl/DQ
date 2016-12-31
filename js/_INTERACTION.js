/**
 * Created by luketwyman on 25/11/2015.
 */

//-------------------------------------------------------------------------------------------
//  INTERACTION
//-------------------------------------------------------------------------------------------

var scrollOffset = 0;

function interactionInit(target) {

    // MOUSE //
    target.addEventListener("mousedown", mousePress, false);
    target.addEventListener("mouseup", mouseRelease, false);
    target.addEventListener("mousemove", mouseMove, false);


    // TOUCH //
    target.addEventListener('touchstart', function(event) {
        if (event.targetTouches.length == 1) {
            touch = event.targetTouches[0];
            touchTakeover = true;
        } else {
            touchTakeover = false;
        }
        clickOrTouch();
    }, false);
    target.addEventListener('touchmove', function(event) {
        event.preventDefault();
        if (event.targetTouches.length == 1) {
            touch = event.targetTouches[0];
        }
        mouseMove(event);
    }, false);
    target.addEventListener('touchend', function(event) {
        mouseRelease();
        touchTakeover = false;
    }, false);

    window.addEventListener("scroll", function(event) {scrollEvent(event)}, false);
}


function scrollEvent() {
    var m = 40;
    var s = window.scrollY;

    if (s<m) {
        s = 0;
    }
    else {
        s = s-m;
    }

    scrollOffset = s;
}

function mousePress() {
    mouseIsDown = true;
    rolloverCheck();
    bursts.burst1();

    waves.burst();

}

function mouseRelease() {
    mouseIsDown = false;
}



function mouseMove(event) {

    var x,y;

    if (touchTakeover==true) {
        x = touch.pageX;
        y = touch.pageY;
    } else {
        x = event.pageX;
        y = event.pageY;
    }

    const ratio = getPixelRatio();
    mouseX = x * ratio;
    mouseY = y * ratio;
    rolloverCheck();
}

function rolloverCheck() {
    //playOver = hudCheck(dx - (32*units),dy + (8*units) + (midType*0.9),64*units,64*units);
}

function hudCheck(x,y,w,h) { // IS CURSOR WITHIN GIVEN BOUNDARIES
    var mx = mouseX;
    var my = mouseY;
    return (mx>x && mx<(x+w) && my>y && my<(y+h));
}


// DETERMINE CLICK //
function clickOrTouch(event) {

    var x,y;

    if (touchTakeover==true) {
        x = touch.pageX;
        y = touch.pageY;
    } else {
        x = event.pageX;
        y = event.pageY;
    }

    const ratio = getPixelRatio();
    mouseX = x * ratio;
    mouseY = y * ratio;

    if (mouseIsDown==false) {
        mousePress(event);
    }
}