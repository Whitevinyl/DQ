function Vert() {
    this.p1 = [];
    this.on = false;
}
var proto = Vert.prototype;


proto.setup = function() {
    this.on = true;
};

proto.update = function() {
    if (this.on) {
        var l = this.p1.length-1;
        for (var i=l; i>=0; i--) {
            this.p1[i].update();
        }
    }

};

proto.draw = function() {
    if (this.on) {
        var l = this.p1.length;
        cxa.lineWidth = 2;
        setColor(bgCols[4]);
        for (var i=0; i<l; i++) {
            this.p1[i].draw();
        }
    }
};

proto.burst = function() {
    var x = dx + (tombola.range(-250,250)*units);
    var y = dy + (tombola.range(-50,100)*units);

    var r = 35*units;
    var n = tombola.range(5,11);
    for (var i=0; i<n; i++) {
        var mx = x + tombola.range(-r,r);
        var my = y + tombola.range(-r,r);
        var s = tombola.rangeFloat(-1,0);
        this.p1.push(new VertP(mx,my,s));
    }
};



function VertP(x,y,s) {
    this.position = new Point(x,y);
    this.speed = s;
    this.s = tombola.rangeFloat(0.05,0.3);
    this.m1 = this.position.clone();
    this.m2 = this.position.clone();
}
proto = VertP.prototype;


proto.update = function() {

    // kill if offscreen //
    if (this.position.y<-10) {
        this.kill();
        return;
    }

    // position history //
    this.m2 = this.m1.clone();
    this.m1 = this.position.clone();

    // update speed & position //
    this.speed -= this.s;
    if (this.speed<-30) {
        this.speed = -30;
    }
    this.position.y += this.speed;
};


proto.kill = function() {
    // get my index //
    var index = vert.p1.indexOf(this);
    // remove //
    if (index > -1) {
        vert.p1.splice(index, 1);
    }
};


proto.draw = function() {
    var x = this.position.x;
    var y = this.position.y;
    var t = this.m2;

    cxa.beginPath();
    cxa.moveTo(t.x,t.y);
    cxa.lineTo(x,y);
    cxa.stroke();
};
