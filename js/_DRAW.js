
var Amethyst;
var amRat = 500/420;
var amLoaded = false;

function drawSetup() {
    Amethyst = new Image();
    Amethyst.onload = function() {
        amLoaded = true;
        colourTo(bgCols[1],60,10,50,1,3);
        alphaTo(imageA,0.5,3);
    };

    Amethyst.src = 'img/full.png';
}


//-------------------------------------------------------------------------------------------
//  BG
//-------------------------------------------------------------------------------------------


function drawBG() {
    setColor(bgCols[0]);
    cxa.clearRect(0,0,fullX,fullY);
}





//-------------------------------------------------------------------------------------------
//  FOREGROUND
//-------------------------------------------------------------------------------------------




function drawScene() {

    var s = 1;
    var u = units * s;
    var x = dx;
    var y = dy - (scrollOffset/4);
    var arrowY = dy + (170*units) - (scrollOffset/2);

    cxa.globalAlpha = 1;




    // bg shape //
    setColor(bgCols[1]);
    drawShape(x,y,u);


    // splitter //
    cxa.lineWidth = 1.2*units;
    splitter.draw();


    // image //
    if (amLoaded) {
        cxa.globalAlpha = imageA.a;
        var h = 230*u;
        cxa.drawImage(Amethyst,dx-(h/2),y - ((h*amRat)/2),h,h*amRat);
    }

    cxa.globalAlpha = 1;

    // particles //
    bursts.draw();

    // vert //
    vert.draw();

    // pips //
    pips.draw();


    // arrow //
    setRGBA(255,255,255,1);
    cxa.lineWidth = 1.5;
    drawArrow(x,arrowY,20*u);

    if (playing) {
        cxa.fillRect(20*u,20*u,3*u,13*u);
        cxa.fillRect(28*u,20*u,3*u,13*u);
    } else {
        cxa.beginPath();
        cxa.moveTo(20*u,20*u);
        cxa.lineTo(20*u,33*u);
        cxa.lineTo(32*u,26.5*u);
        cxa.closePath();
        cxa.fill();
    }
    if (playOver) {
        cxa.fillRect(20*u,40*u,11*u,3*u);
    }


    // title //
    cxa.textAlign = 'center';
    cxa.font = '300 '+headerType + 'px Quicksand';
    cxa.fillText('DISQUIET',dx,dy + (headerType * 0.35));
}



function drawShape(x,y,u) {
    cxa.beginPath();
    cxa.moveTo(x,y + (137*u));
    cxa.lineTo(x - (114*u),y - (28.5*u));
    cxa.lineTo(x - (71*u),y - (85*u));
    cxa.lineTo(x - (71*u),y - (94*u));
    cxa.lineTo(x - (36*u),y - (130*u));
    cxa.lineTo(x - (23*u),y - (116*u));
    cxa.lineTo(x - (14*u),y - (124*u));
    cxa.lineTo(x - (3*u),y - (114*u));
    cxa.lineTo(x + (3.5*u),y - (121*u));
    cxa.lineTo(x + (8*u),y - (111*u));
    cxa.lineTo(x + (57*u),y - (136*u));
    cxa.lineTo(x + (71.5*u),y - (130*u));
    cxa.lineTo(x + (93.5*u),y - (63*u));
    cxa.lineTo(x + (90*u),y - (50*u));
    cxa.lineTo(x + (104.5*u),y - (45.5*u));
    cxa.lineTo(x + (97*u),y - (14*u));
    cxa.lineTo(x + (108.5*u),y - (10*u));
    cxa.lineTo(x + (101*u),y + (13*u));
    cxa.closePath();
    cxa.fill();
}


function drawArrow(x,y,s) {
    cxa.beginPath();
    cxa.moveTo(x - (s/2),y - (s/4));
    cxa.lineTo(x,y + (s/4));
    cxa.lineTo(x + (s/2),y - (s/4));
    cxa.stroke();
}



//-------------------------------------------------------------------------------------------
//  DRAW FUNCTIONS
//-------------------------------------------------------------------------------------------


// PASS COLOUR OBJECT //
function setColor(col) {

    // master color filter //
    var red = Math.round(col.R + masterCol.R);
    var green = Math.round(col.G + masterCol.G);
    var blue = Math.round(col.B + masterCol.B);
    var alpha = col.A + masterCol.A;

    // high & low pass color filters //
    var av = ((red + green + blue) / 3);
    var hp = av/255;
    var lp = 1 - (av/255);
    red += Math.round((highPass.R*hp) + (lowPass.R*lp));
    green += Math.round((highPass.G*hp) + (lowPass.G*lp));
    blue += Math.round((highPass.B*hp) + (lowPass.B*lp));

    buildColour(red,green,blue,alpha);
}


// PASS MANUAL R G B A //
function setRGBA(r,g,b,a) {
    var red = Math.round(r + masterCol.R);
    var green = Math.round(g + masterCol.G);
    var blue = Math.round(b + masterCol.B);
    var alpha = a + masterCol.A;

    // high & low pass color filters //
    var av = ((red + green + blue) / 3);
    var hp = av/255;
    var lp = 1 - (av/255);
    red += Math.round((highPass.R*hp) + (lowPass.R*lp));
    green += Math.round((highPass.G*hp) + (lowPass.G*lp));
    blue += Math.round((highPass.B*hp) + (lowPass.B*lp));

    buildColour(red,green,blue,alpha);
}


function buildColour(red,green,blue,alpha) {
    // RANGE //
    if (red<0) {
        red = 0;
    }
    if (red>255) {
        red = 255;
    }
    if (green<0) {
        green = 0;
    }
    if (green>255) {
        green = 255;
    }
    if (blue<0) {
        blue = 0;
    }
    if (blue>255) {
        blue = 255;
    }
    if (alpha<0) {
        alpha = 0;
    }
    if (alpha>1) {
        alpha = 1;
    }
    cxa.fillStyle = cxa.strokeStyle = "rgba("+red+","+green+","+blue+","+alpha+")";
}




//-------------------------------------------------------------------------------------------
//  EFFECTS
//-------------------------------------------------------------------------------------------


