


function Bursts() {
    this.p1 = [];
    this.on = false;
}
var proto = Bursts.prototype;


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
        setRGBA(255,255,255,1);
        for (var i=0; i<l; i++) {
            this.p1[i].draw();
        }
    }
};

proto.burst = function() {
    var x = dx + (tombola.range(-250,250)*units);
    var y = dy + (tombola.range(-50,100)*units);

    var r = 45*units;
    var n = tombola.range(7,11);
    for (var i=0; i<n; i++) {
        var mx = x + tombola.range(-r,r);
        var my = y + tombola.range(-r,r);
        var xs = tombola.rangeFloat(-2,2);
        var ys = tombola.rangeFloat(-1,0);
        this.p1.push(new P1(mx,my,xs,ys));
    }
};



function P1(x,y,xs,ys) {
    this.position = new Point(x,y);
    this.speed = new Vector(xs,ys);
    this.s = tombola.rangeFloat(0.05,0.3);
    this.m1 = this.position.clone();
    this.m2 = this.position.clone();
    this.m3 = this.position.clone();
}
proto = P1.prototype;


proto.update = function() {

    // kill if offscreen //
    if (this.position.y<-5) {
        this.kill();
        return;
    }

    // position history //
    this.m3 = this.m2.clone();
    this.m2 = this.m1.clone();
    this.m1 = this.position.clone();

    // update speed & position //
    var s = this.s;
    if (this.position.x<dx) {
        this.speed.x += s;
    }
    if (this.position.x>dx) {
        this.speed.x -= s;
    }
    this.speed.y -= s/2;

    this.speed.x = valueInRange(this.speed.x,-12,12);
    this.speed.y = valueInRange(this.speed.y,-30,10);
    this.position.add(this.speed);
};


proto.kill = function() {
    this.position.x = dx;
    this.position.y = dy;

    // get my index //
    var index = bursts.p1.indexOf(this);
    // remove //
    if (index > -1) {
        bursts.p1.splice(index, 1);
    }
};


proto.draw = function() {
    var x = this.position.x;
    var y = this.position.y;
    var t = this.m3;
    var vx = x - t.x;
    var vy = y - t.y;
    var w = 0.1;

    cxa.beginPath();
    cxa.moveTo(t.x,t.y);
    cxa.lineTo(x + (vy*w),y - (vx*w));
    cxa.lineTo(x - (vy*w),y + (vx*w));
    cxa.closePath();
    cxa.fill();
};
