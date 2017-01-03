function Radial() {
    this.on = false;
    this.points = [];
    this.origin = new Point(0,0);
    this.count = 60;
}
var proto = Radial.prototype;


proto.setup = function() {
    this.on = true;

    for (var i=0; i<6; i++) {
        this.points.push(new Point(dx,dy));
    }

    this.origin.x = tombola.range(-50,50);
    this.origin.y = tombola.range(-50,50);
};

proto.update = function() {
    if (this.on) {
        var l = this.points.length;
        var r = 50;

        for (var i=0; i<l; i++) {
            var p = this.points[i];

            if (near(p.x,dx,10) && near(p.y,dy,10)) {
                this.points[i].x = dx + (this.origin.x*units) + (tombola.range(-r,r)*units);
                this.points[i].y = dy + (this.origin.y*units) + (tombola.range(-r,r)*units);
            }

            p.x = lerp(p.x,dx,9);
            p.y = lerp(p.y,dy,9);
        }

        this.count--;
        var w = 50;
        var h = 50;
        if (this.count===0) {
            this.origin.x += tombola.range(-w,w);
            this.origin.y += tombola.range(-h,h);
            this.origin.x = valueInRange(this.origin.x,-w,w);
            this.origin.y = valueInRange(this.origin.y,-h,h);
            this.count = 60;
        }
    }
};

proto.draw = function() {
    if (this.on) {
        var l = this.points.length;
        setColor(bgCols[5]);
        cxa.beginPath();
        for (var i=0; i<l; i++) {
            var p = this.points[i];

            cxa.moveTo(p.x, p.y);
            cxa.lineTo(dx,dy);
        }
        cxa.stroke();
    }
};

