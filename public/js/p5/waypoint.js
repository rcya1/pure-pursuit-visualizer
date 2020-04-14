const Vector = require("./vector");
const conv = require('./conversions.js');

let Waypoint = class {
    
    constructor(other) {
        if(other instanceof Waypoint) { 
            this.position = other.getPosition().copy();
        }
        else if(other instanceof Vector) {
            this.position = other.copy();
        }
        else {
            throw (other + " passed into Waypoint constructor");
        }
        this.targetVelocity = -1.0;
    }

    getDistanceTo(other) {
        let otherVector;
        if(other instanceof Waypoint) {
            otherVector = other.getPosition();
        }
        else if(other instanceof Vector) {
            otherVector = other;
        }
        else {
            throw (other + " passed into Waypoint getDistanceTo()");
        }

        return this.position.getDistanceTo(otherVector);
    }

    getDistanceToSq(other) {
        let otherVector;
        if(other instanceof Waypoint) {
            otherVector = other.getPosition();
        }
        else if(other instanceof Vector) {
            otherVector = other;
        }
        else {
            throw (other + " passed into Waypoint getDistanceTo()");
        }

        return this.position.getDistanceToSq(otherVector);
    }

    getX() {
        return this.position.getX();
    }

    getY() {
        return this.position.getY();
    }

    setX(x) {
        this.position.setX(x);
    }

    setY(y) {
        this.position.setY(y);
    }

    getPosition() {
        return this.position;
    }

    getTargetVelocity() {
        return this.targetVelocity;
    }

    setTargetVelocity(targetVelocity) {
        this.targetVelocity = targetVelocity;
    }

    draw(sketch, radius, active, color) {
        sketch.fill(color);
        sketch.noStroke();
        let drawRadius = active ? radius * 1.25 : radius;
        sketch.ellipse(conv.px(this.getX(), sketch.width), conv.py(this.getY(), sketch.height),
            conv.px(drawRadius, sketch.width), conv.px(drawRadius, sketch.width));
    }
}

module.exports = Waypoint;