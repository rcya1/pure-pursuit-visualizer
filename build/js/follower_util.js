var Vector = require("./vector");
// returns the index of the closest point to the given vector
// uses the last found point to optimize the search
var getClosestPointIndex = function (points, pos, lastPointIndex) {
    if (lastPointIndex === void 0) { lastPointIndex = 0; }
    var index = -1;
    var closestDist = -1;
    for (var i = lastPointIndex; i < points.length; i++) {
        waypoint = points[i];
        var checkDist = waypoint.getDistanceToSq(pos);
        if (index == -1 || checkDist <= closestDist) {
            index = i;
            closestDist = checkDist;
        }
    }
    return index;
};
var LookAheadResult = /** @class */ (function () {
    function LookAheadResult(t, i, lookaheadPoint) {
        this.t = t;
        this.i = i;
        this.lookaheadPoint = lookaheadPoint;
    }
    return LookAheadResult;
}());
var getLookAheadPoint = function (points, pos, lookaheadDist, lastT, lastIndex) {
    if (lastT === void 0) { lastT = 0; }
    if (lastIndex === void 0) { lastIndex = 0; }
    for (var i = lastIndex; i < points.length - 1; i++) {
        var a = points[i];
        var b = points[i + 1];
        if (a == null || b == null)
            continue;
        var t = getLookAheadPointT(pos, a.getPosition(), b.getPosition(), lookaheadDist);
        // if the segment is further along or the fractional index is greater, then this is the correct point
        if (t != -1 && (i > lastIndex || t > lastT)) {
            return generateLookAheadResult(a, b, t, i);
        }
    }
    // if no point is found, just return the last look ahead result
    return generateLookAheadResult(points[lastIndex], points[lastIndex + 1], lastT, lastIndex);
};
var generateLookAheadResult = function (a, b, t, i) {
    var d = b.getPosition().sub(a.getPosition());
    return new LookAheadResult(t, i, a.getPosition().add(d.mult(t)));
};
var getLookAheadPointT = function (pos, start, end, lookaheadDist) {
    var d = end.sub(start);
    var f = start.sub(pos);
    var a = d.dot(d);
    var b = 2 * f.dot(d);
    var c = f.dot(f) - lookaheadDist * lookaheadDist;
    var disc = b * b - 4 * a * c;
    if (disc < 0) {
        return -1;
    }
    disc = Math.sqrt(disc);
    var t1 = (-b - disc) / (2 * a);
    var t2 = (-b + disc) / (2 * a);
    if (t1 >= 0 && t1 <= 1)
        return t1;
    if (t2 >= 0 && t2 <= 1)
        return t2;
    return -1;
};
var getCurvatureToPoint = function (pos, angle, lookahead, follower) {
    var a = -Math.tan(angle);
    var b = 1.0;
    var c = Math.tan(angle) * pos.getX() - pos.getY();
    var x = Math.abs(a * lookahead.getX() + b * lookahead.getY() + c) / Math.sqrt(a * a + b * b);
    var l = pos.getDistanceToSq(lookahead);
    var curvature = 2 * x / l;
    var otherPoint = pos.add(new Vector(Math.cos(angle), Math.sin(angle)));
    var side = Math.sign((otherPoint.getY() - pos.getY()) * (lookahead.getX() - pos.getX()) -
        (otherPoint.getX() - pos.getX()) * (lookahead.getY() - pos.getY()));
    follower.debug_a = a;
    follower.debug_b = b;
    follower.debug_c = c;
    return curvature * side;
};
var PurePursuitFollower = /** @class */ (function () {
    function PurePursuitFollower(lookaheadDist, driveWidth, maxAcceleration) {
        this.lastT = 0.0;
        this.lastLookAheadIndex = 0;
        this.lastClosestIndex = 0;
        this.leftSpeed = 0;
        this.rightSpeed = 0;
        this.lastTime = -1;
        // robot line
        this.debug_a = 0;
        this.debug_b = 0;
        this.debug_c = 0;
        // look ahead point
        this.debug_la_x = -1257;
        this.debug_la_y = -1257;
        this.lookaheadDist = lookaheadDist;
        this.driveWidth = driveWidth;
        this.maxAcceleration = maxAcceleration;
    }
    return PurePursuitFollower;
}());
var followPath = function (robot, follower, points, currentTime) {
    if (points.length == 0)
        return;
    follower.lastClosestIndex = getClosestPointIndex(points, robot.getPosition(), follower.lastClosestIndex);
    if (follower.lastLookAheadIndex == -0) {
        follower.lastLookAheadIndex = follower.lastClosestIndex;
    }
    var lookaheadResult = getLookAheadPoint(points, robot.getPosition(), follower.lookaheadDist, follower.lastT, follower.lastLookAheadIndex);
    follower.lastT = lookaheadResult.t;
    follower.lastLookAheadIndex = lookaheadResult.i;
    var lookaheadPoint = lookaheadResult.lookaheadPoint;
    follower.debug_la_x = lookaheadPoint.getX();
    follower.debug_la_y = lookaheadPoint.getY();
    var curvature = getCurvatureToPoint(robot.getPosition(), robot.getAngle(), lookaheadPoint, follower);
    var targetVelocity = points[follower.lastClosestIndex].getTargetVelocity();
    var tempLeft = targetVelocity * (2.0 + curvature * follower.driveWidth) / 2.0;
    var tempRight = targetVelocity * (2.0 - curvature * follower.driveWidth) / 2.0;
    if (follower.lastCall == -1)
        follower.lastCall = currentTime;
    var maxChange = (currentTime - follower.lastCall) / 1000.0 * follower.maxAcceleration;
    follower.leftSpeed += constrain(tempLeft - follower.leftSpeed, maxChange, -maxChange);
    follower.rightSpeed += constrain(tempRight - follower.rightSpeed, maxChange, -maxChange);
    robot.setLeft(follower.leftSpeed);
    robot.setRight(follower.rightSpeed);
    follower.lastCall = currentTime;
};
var constrain = function (value, max, min) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
};
module.exports = {
    followPath: followPath,
    PurePursuitFollower: PurePursuitFollower
};
