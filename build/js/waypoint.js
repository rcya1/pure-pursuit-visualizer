var Vector = require("./vector");
var conv = require('./conversions.js');
var Waypoint = /** @class */ (function () {
    function Waypoint(other) {
        if (other instanceof Waypoint) {
            this.position = other.getPosition().copy();
        }
        else if (other instanceof Vector) {
            this.position = other.copy();
        }
        else {
            throw (other + " passed into Waypoint constructor");
        }
        this.targetVelocity = -1.0;
    }
    Waypoint.prototype.getDistanceTo = function (other) {
        var otherVector;
        if (other instanceof Waypoint) {
            otherVector = other.getPosition();
        }
        else if (other instanceof Vector) {
            otherVector = other;
        }
        else {
            throw (other + " passed into Waypoint getDistanceTo()");
        }
        return this.position.getDistanceTo(otherVector);
    };
    Waypoint.prototype.getDistanceToSq = function (other) {
        var otherVector;
        if (other instanceof Waypoint) {
            otherVector = other.getPosition();
        }
        else if (other instanceof Vector) {
            otherVector = other;
        }
        else {
            throw (other + " passed into Waypoint getDistanceTo()");
        }
        return this.position.getDistanceToSq(otherVector);
    };
    Waypoint.prototype.getX = function () {
        return this.position.getX();
    };
    Waypoint.prototype.getY = function () {
        return this.position.getY();
    };
    Waypoint.prototype.setX = function (x) {
        this.position.setX(x);
    };
    Waypoint.prototype.setY = function (y) {
        this.position.setY(y);
    };
    Waypoint.prototype.getPosition = function () {
        return this.position;
    };
    Waypoint.prototype.getTargetVelocity = function () {
        return this.targetVelocity;
    };
    Waypoint.prototype.setTargetVelocity = function (targetVelocity) {
        this.targetVelocity = targetVelocity;
    };
    Waypoint.prototype.draw = function (sketch, radius, active, color) {
        sketch.fill(color * this.targetVelocity / 50);
        sketch.noStroke();
        var drawRadius = active ? radius * 1.25 : radius;
        sketch.ellipse(conv.px(this.getX(), sketch.width), conv.py(this.getY(), sketch.height), conv.px(drawRadius, sketch.width), conv.px(drawRadius, sketch.width));
    };
    return Waypoint;
}());
module.exports = Waypoint;
