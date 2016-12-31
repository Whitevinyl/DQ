function Radial() {
    this.on = false;
    this.points = [];
}
var proto = Radial.prototype;


proto.setup = function() {
    this.on = true;

    for (var i=0; i<4; i++) {
        this.points.push(new Point(dx,dy));
    }
};

proto.update = function() {
    if (this.on) {
        var l = this.points.length;

        for (var i=0; i<l; i++) {
            var p = this.points[i];

            if (mouseIsDown && near(p.x,dx,10) && near(p.y,dy,10)) {
                this.points[i].x = mouseX;
                this.points[i].y = mouseY;
            }


            p.x = lerp(p.x,dx,10);
            p.y = lerp(p.y,dy,10);
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

