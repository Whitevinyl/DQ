/**
 * Created by luketwyman on 25/11/2015.
 */

//-------------------------------------------------------------------------------------------
//  OBJECTS
//-------------------------------------------------------------------------------------------


function Point( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
}
Point.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
};
Point.prototype.clone = function() {
    return new Point(this.x,this.y);
};

function Point3D( x, y, z ) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

function Vector( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
}
Vector.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
};

function Size( w, h ) {
    this.w = w || 0;
    this.h = h || 0;
}

function RGBA( r, g, b, a ) {
    this.R = r;
    this.G = g;
    this.B = b;
    this.A = a;

    this.toString = function() {
        return "rgba("+this.R+","+this.G+","+this.B+",1)";
    };

    this.clone = function () {
        return new RGBA(this.R, this.G, this.B, this.A);
    };
}

function Alpha(a) {
    this.a = a || 0;
}

function Particle(point,vector) {
    this.Position = point || new Point();
    this.Vector = vector || new Vector();
    this.Active = false;
}