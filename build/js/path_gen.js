var Waypoint = require("./waypoint");
var injectPoints = function (userPoints, injectedPoints, spacing) {
    injectedPoints.splice(0, injectedPoints.length);
    for (var i = 0; i < userPoints.length - 1; i++) {
        var a = userPoints[i];
        var b = userPoints[i + 1];
        var vector = b.getPosition().sub(a.getPosition());
        var numPoints = Math.ceil(vector.getMag() / spacing);
        var dVector = vector.normalize().mult(spacing);
        for (var j = 0; j < numPoints; j++) {
            injectedPoints.push(new Waypoint(a.getPosition().add(dVector.mult(j))));
        }
    }
};
var smoothPoints = function (injectedPoints, smoothedPoints, weight) {
    smoothedPoints.splice(0, smoothedPoints.length);
    for (var _i = 0, injectedPoints_1 = injectedPoints; _i < injectedPoints_1.length; _i++) {
        waypoint = injectedPoints_1[_i];
        smoothedPoints.push(new Waypoint(waypoint.getPosition()));
    }
    if (weight >= 1.0)
        weight = 0.999;
    var WEIGHT_SMOOTH = weight;
    var WEIGHT_DATA = 1 - weight;
    var change = 0.001;
    while (change >= 0.001) {
        change = 0.0;
        for (var i = 1; i < smoothedPoints.length - 1; i++) {
            var current = smoothedPoints[i];
            var prev = smoothedPoints[i - 1];
            var next = smoothedPoints[i + 1];
            var original = injectedPoints[i];
            // x smoothing
            var compX = current.getX();
            var newX = current.getX() + WEIGHT_DATA * (original.getX() - current.getX()) +
                WEIGHT_SMOOTH * (prev.getX() + next.getX() - (2 * current.getX()));
            current.setX(newX);
            change += Math.abs(compX - newX);
            // y smoothing
            var compY = current.getY();
            var newY = current.getY() + WEIGHT_DATA * (original.getY() - current.getY()) +
                WEIGHT_SMOOTH * (prev.getY() + next.getY() - (2 * current.getY()));
            current.setY(newY);
            change += Math.abs(compY - newY);
        }
    }
};
var calculateDistances = function (points, distanceBetween) {
    for (var i = 0; i < points.length; i++) {
        if (i == 0) {
            distanceBetween.push(0.0);
        }
        else {
            var prev = points[i - 1];
            var curr = points[i];
            distanceBetween.push(curr.getDistanceTo(prev));
        }
    }
};
var calculateCurvatures = function (points, curvatures) {
    for (var i = 0; i < points.length; i++) {
        if (i == 0 || i == points.length - 1) {
            curvatures.push(0);
            continue;
        }
        var curr = points[i];
        var prev = points[i - 1];
        var next = points[i + 1];
        var x1 = curr.getX();
        var y1 = curr.getY();
        var x2 = prev.getX();
        var y2 = prev.getY();
        var x3 = next.getX();
        var y3 = next.getY();
        if (x1 == x2)
            x1 += 0.0001; // get rid of divide by 0
        var k1 = 0.5 * (x1 * x1 + y1 * y1 - x2 * x2 - y2 * y2) / (x1 - x2);
        var k2 = (y1 - y2) / (x1 - x2);
        var b = 0.5 * (x2 * x2 - 2 * x2 * k1 + y2 * y2 - x3 * x3 + 2 * x3 * k1 - y3 * y3) /
            (x3 * k2 - y3 + y2 - x2 * k2);
        var a = k1 - k2 * b;
        var r = Math.sqrt((x1 - a) * (x1 - a) + (y1 - b) * (y1 - b));
        var curvature = void 0;
        if (r == 0) {
            curvature = 1e18; // arbitrary value for infinity
        }
        else {
            curvature = 1.0 / r;
        }
        curvatures.push(curvature);
    }
};
var calculateTargetVelocities = function (points, maxVelocity, maxAcceleration, turningConstant) {
    var distanceBetween = []; // distance between a point and its previous one
    var curvatures = [];
    calculateDistances(points, distanceBetween);
    calculateCurvatures(points, curvatures);
    for (var i = 0; i < points.length; i++) {
        points[i].setTargetVelocity(Math.min(maxVelocity, turningConstant / curvatures[i]));
    }
    for (var i = points.length - 1; i >= 0; i--) {
        if (i == points.length - 1) {
            points[i].setTargetVelocity(0);
            continue;
        }
        var dist = distanceBetween[i + 1];
        var nextVelocity = points[i + 1].getTargetVelocity();
        var calculatedSpeed = Math.sqrt(nextVelocity * nextVelocity + 2.0 * maxAcceleration * dist);
        points[i].setTargetVelocity(Math.min(points[i].getTargetVelocity(), calculatedSpeed));
    }
};
module.exports = {
    injectPoints: injectPoints,
    smoothPoints: smoothPoints,
    calculateTargetVelocities: calculateTargetVelocities
};
