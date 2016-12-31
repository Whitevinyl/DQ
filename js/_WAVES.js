

function Waves() {
    this.l1 = [];
    this.l2 = [];
    this.l3 = [];
    this.a = 0;
    this.ai = 100;
    this.simplex = new SimplexNoise();
    this.i1 = 0;
    this.destA = 0;
    this.timeOut = null;
    this.on = false;
}
var proto = Waves.prototype;



proto.setup = function() {
    this.on = true;
};


proto.burst = function() {
    /*this.destA = 1;
    if (this.timeOut) {
        clearTimeout(this.timeOut);
    }
    var that = this;
    this.timeOut = setTimeout(function() {
        that.destA = 0;
    },5000);*/

};


proto.update = function() {

    if (this.on) {

        this.i1 += 0.0065;
        this.ai += 0.001;
        this.a = 0.3 + this.simplex.noise(this.ai,0);

        var ys = 55;

        if (this.a>0.001) {
            this.l1 = [];
            this.l2 = [];
            this.l3 = [];
            for (var i=0; i<40; i++) {
                this.l1.push(this.simplex.noise(i/ys,this.i1));
                //this.l2.push(this.simplex.noise((i/ys) + 0.05,this.i1));
                //this.l3.push(this.simplex.noise((i/ys) + 0.1,this.i1));
            }
        }

    }
};


proto.draw = function() {

    if (this.on && this.a>0.001) {

        var i;
        var a = this.a;
        var la = a * (105*units);
        var y = -(20*units) + (dy*a);

        var line = this.l1;

        var l = line.length;
        var d = fullX/(l-1);

        setColor(bgCols[4]);
        //cxa.globalAlpha = 0.85;

        cxa.beginPath();

        cxa.moveTo(0,0);
        for (i=0; i<l; i++) {
            cxa.lineTo(d*i,y + line[i]*la);
        }
        cxa.lineTo(fullX,0);
        cxa.closePath();
        cxa.fill();


        setRGBA(255,255,255,1);
        //cxa.globalAlpha = 1;



        /*cxa.beginPath();

        cxa.moveTo(0,y + line[0]*la);
        for (i=1; i<l; i++) {
            cxa.lineTo(d*i,y + line[i]*la);
        }

        line = this.l2;
        y -= (4*units);

        cxa.moveTo(0,y + line[0]*la);
        for (i=1; i<l; i++) {
            cxa.lineTo(d*i,y + line[i]*la);
        }

        /!*line = this.l3;
        y -= (4*units);

        cxa.moveTo(0,y + line[0]*la);
        for (i=1; i<l; i++) {
            cxa.lineTo(d*i,y + line[i]*la);
        }*!/

        cxa.stroke();*/

    }

};