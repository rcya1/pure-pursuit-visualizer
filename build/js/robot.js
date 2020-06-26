var Vector = require('./vector');
var conv = require('./conversions.js');
var Robot = /** @class */ (function () {
    function Robot() {
        this.pos = new Vector(100, 50);
        this.velocity = 0.0;
        this.angle = conv.PI / 2;
        this.angularVelocity = 0.0;
        this.leftSpeed = 0.0;
        this.rightSpeed = 0.0;
    }
    Robot.prototype.setLeft = function (leftSpeed) {
        this.leftSpeed = leftSpeed;
    };
    Robot.prototype.setRight = function (rightSpeed) {
        this.rightSpeed = rightSpeed;
    };
    Robot.prototype.update = function (frameRate, driveWidth) {
        this.velocity = (this.leftSpeed + this.rightSpeed) / 2;
        this.angularVelocity = -(this.leftSpeed - this.rightSpeed) / driveWidth;
        if (isNaN(frameRate) || frameRate == 0)
            frameRate = 60;
        this.angle += this.angularVelocity / frameRate;
        this.pos = this.pos.add(new Vector(this.velocity * Math.cos(this.angle), this.velocity * Math.sin(this.angle)).mult(1 / frameRate));
        this.leftSpeed = 0;
        this.rightSpeed = 0;
    };
    Robot.prototype.draw = function (sketch, driveWidth) {
        sketch.rectMode(sketch.CENTER);
        sketch.fill(120);
        sketch.stroke(0);
        sketch.push();
        sketch.translate(conv.px(this.pos.getX(), sketch.width), conv.py(this.pos.getY(), sketch.height));
        sketch.rotate(-this.angle + conv.PI / 2);
        sketch.rect(0, 0, conv.px(driveWidth, sketch.width), conv.px(driveWidth * 1.5, sketch.width));
        sketch.pop();
    };
    Robot.prototype.getX = function () {
        return this.pos.getX();
    };
    Robot.prototype.getY = function () {
        return this.pos.getY();
    };
    Robot.prototype.getPosition = function () {
        return this.pos;
    };
    Robot.prototype.setPosition = function (pos) {
        this.pos = pos;
    };
    Robot.prototype.getAngle = function () {
        return this.angle;
    };
    Robot.prototype.setAngle = function (angle) {
        this.angle = angle;
    };
    return Robot;
}());
module.exports = Robot;
