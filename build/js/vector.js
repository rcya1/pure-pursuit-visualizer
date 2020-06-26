var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
        this.mag = -1;
        this.magSq = -1;
    }
    Vector.prototype.copy = function () {
        return new Vector(this.getX(), this.getY());
    };
    Vector.prototype.getX = function () {
        return this.x;
    };
    Vector.prototype.getY = function () {
        return this.y;
    };
    Vector.prototype.setX = function (x) {
        this.x = x;
        this.mag = -1;
        this.magSq = -1;
    };
    Vector.prototype.setY = function (y) {
        this.y = y;
        this.mag = -1;
        this.magSq = -1;
    };
    Vector.prototype.getMagSq = function () {
        if (this.magSq == -1) {
            this.magSq = this.getX() * this.getX() + this.getY() * this.getY();
        }
        return this.magSq;
    };
    Vector.prototype.getMag = function () {
        if (this.mag == -1) {
            this.mag = Math.sqrt(this.getMagSq());
        }
        return this.mag;
    };
    Vector.prototype.normalize = function () {
        var newX = this.getX() / this.getMag();
        var newY = this.getY() / this.getMag();
        return new Vector(newX, newY);
    };
    Vector.prototype.add = function (vector) {
        return new Vector(this.getX() + vector.getX(), this.getY() + vector.getY());
    };
    Vector.prototype.sub = function (vector) {
        return new Vector(this.getX() - vector.getX(), this.getY() - vector.getY());
    };
    Vector.prototype.mult = function (num) {
        return new Vector(this.getX() * num, this.getY() * num);
    };
    Vector.prototype.dot = function (vector) {
        return this.getX() * vector.getX() + this.getY() * vector.getY();
    };
    Vector.prototype.getDistanceTo = function (other) {
        return Math.sqrt((this.getX() - other.getX()) * (this.getX() - other.getX()) +
            (this.getY() - other.getY()) * (this.getY() - other.getY()));
    };
    Vector.prototype.getDistanceToSq = function (other) {
        return ((this.getX() - other.getX()) * (this.getX() - other.getX()) +
            (this.getY() - other.getY()) * (this.getY() - other.getY()));
    };
    Vector.prototype.printInfo = function () {
        console.log("X: " + this.getX() + ", Y: " + this.getY());
    };
    Vector.prototype.printInfoVerbose = function () {
        console.log("X: " + this.getX() + ", Y: " + this.getY() + ", Mag: " + this.getMag());
    };
    return Vector;
}());
module.exports = Vector;
