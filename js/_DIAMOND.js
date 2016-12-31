

function Diamond() {
    this.a = 0;
    this.on = false;
    this.simplex = new SimplexNoise();
    this.ai = 0;
}
var proto = Diamond.prototype;


proto.setup = function() {
    this.on = true;
};

proto.update = function() {
    if (this.on) {
        this.ai += 0.002;
        this.a = (-0.2 + this.simplex.noise(this.ai,0)) * 1.2;
    }
};

proto.draw = function() {
    if (this.on && this.a>0) {
        setColor(bgCols[5]);
        var a = this.a + tombola.rangeFloat(-0.02,0.02);
        var x = dx;
        var y = dy;
        var u = units;
        var w = (150*u)*a;
        var h = (200*u)*a;
        var tw = Math.min((40*u),w);
        var th = Math.min((53*u),h);

        cxa.beginPath();
        cxa.moveTo(x,y-h);
        cxa.lineTo(x+w,y);
        cxa.lineTo(x,y+h);
        cxa.lineTo(x-w,y);
        cxa.lineTo(x,y-h);

        cxa.lineTo(x,y-h+th);
        cxa.lineTo(x-w+tw,y);
        cxa.lineTo(x,y+h-th);
        cxa.lineTo(x+w-tw,y);
        cxa.lineTo(x,y-h+th);
        cxa.closePath();
        cxa.fill();
    }
};