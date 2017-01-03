function Splitter() {
    this.chains = [];
    this.on = false;
}
var proto = Splitter.prototype;


proto.setup = function() {
    this.on = true;
};

proto.update = function() {
    if (this.on) {
        var l = this.chains.length-1;
        for (var i=l; i>=0; i--) {
            this.chains[i].update();
        }
    }

};

proto.draw = function() {
    if (this.on) {
        setColor(textCol);
        var l = this.chains.length;
        for (var i=0; i<l; i++) {
            this.chains[i].draw();
        }
    }
};

proto.burst = function() {
    var chain = new SplitChain();
    var x = dx + (tombola.range(-250,250)*units);
    var y = dy + (tombola.range(-10,200)*units);
    var s = tombola.rangeFloat(-8,-4);
    chain.p.push(new SplitP(x,y,0,s,chain));
    chain.p.push(new SplitP(x,y,0,s,chain));
    if (tombola.percent(20)) {
        chain.p.push(new SplitP(x,y,0,s,chain));
    }
    this.chains.push(chain);
};



// CHAIN //

function SplitChain() {
    this.p = [];
    this.lives = 10;
}
proto = SplitChain.prototype;


proto.update = function() {

    if (this.p.length<=0) {
        this.kill();
        return;
    }

    var l = this.p.length-1;
    for (var i=l; i>=0; i--) {
        this.p[i].update();
    }
};

proto.draw = function() {
    var l = this.p.length;
    for (var i=0; i<l; i++) {
        this.p[i].draw();
    }
};

proto.kill = function() {
    // get my index //
    var index = splitter.chains.indexOf(this);
    // remove //
    if (index > -1) {
        splitter.chains.splice(index, 1);
    }
};



// PARTICLE //


function SplitP(x,y,xs,ys,chain) {
    this.position = new Point(x,y);
    this.speed = new Vector(xs,ys);
    this.vector = new Vector(0,0);
    this.tail = this.position.clone();
    this.dest = this.position.clone();
    this.count = tombola.range(2,5);
    this.splits = 2;
    this.chain = chain;
    this.timeout = 10;
}
proto = SplitP.prototype;


proto.update = function() {

    // kill if offscreen //
    if (this.tail.y<0) {
        this.kill();
        return;
    }

    /*if (this.count>0) {
        this.count--;
    }
    if (this.timeout>0) {
        this.timeout--;
    }
    if (this.timeout===0 && this.count===0) {
        this.split();
    }*/

    var factor = 2;
    if (near(this.tail.x,this.dest.x,factor) && near(this.tail.y,this.dest.y,factor)) {
        this.redirect();
    }

    // position history //
    var s = 15;
    //this.tail.x = lerp(this.tail.x,this.dest.x,s);
    //this.tail.y = lerp(this.tail.y,this.dest.y,s);
    this.tail.x += this.vector.x;
    this.tail.y += this.vector.y;

    // update speed & position //
    this.position.add(this.speed);
};


proto.kill = function() {
    // get my index //
    var index = this.chain.p.indexOf(this);
    // remove //
    if (index > -1) {
        this.chain.p.splice(index, 1);
    }
};

proto.split = function() {

    if (this.splits>0 && this.chain.lives>0) {
        var s = tombola.rangeFloat(-8,-4);
        this.splits--;
        this.chain.lives--;
        this.chain.p.push(new SplitP(this.position.x,this.position.y,tombola.rangeFloat(-s,s),s,this.chain));
        if (tombola.percent(30)) {
            this.chain.p.push(new SplitP(this.position.x,this.position.y,tombola.rangeFloat(-s,s),s,this.chain));
        }
        if (tombola.percent(20)) {
            this.chain.p.push(new SplitP(this.position.x,this.position.y,tombola.rangeFloat(-s,s),s,this.chain));
        }
    }
    this.count = tombola.range(2,5);
    //this.redirect();
};

proto.redirect = function() {
    this.timeout = 20;
    this.speed.x = tombola.rangeFloat(-this.speed.y,this.speed.y);
    this.dest.x = this.position.x;
    this.dest.y = this.position.y;
    var d = tombola.range(10,40);
    this.vector.x = (this.dest.x - this.tail.x) / d;
    this.vector.y = (this.dest.y - this.tail.y) / d;

    this.count--;
    if (this.count === 0) {
        this.split();
    }
};


proto.draw = function() {
    var x = this.position.x;
    var y = this.position.y;
    var t = this.tail;
    var d = this.dest;

    cxa.beginPath();
    cxa.moveTo(t.x,t.y);
    cxa.lineTo(d.x,d.y);
    cxa.lineTo(x,y);
    cxa.stroke();
};
