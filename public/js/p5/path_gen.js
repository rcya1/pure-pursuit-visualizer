const Waypoint = require("./waypoint");

injectPoints = function(userPoints, injectedPoints, spacing) {
    injectedPoints.splice(0, injectedPoints.length);

    for (let i = 0; i < userPoints.length - 1; i++) {
        let a = userPoints[i];
        let b = userPoints[i + 1];

        let vector = b.getPosition().sub(a.getPosition());
        let numPoints = Math.ceil(vector.getMag() / spacing);
        let dVector = vector.normalize().mult(spacing);

        for (let j = 0; j < numPoints; j++) {
            injectedPoints.push(new Waypoint(a.getPosition().add(dVector.mult(j))));
        }
    }
}

smoothPoints = function(injectedPoints, smoothedPoints, weight) {
    smoothedPoints.splice(0, smoothedPoints.length);

    for (waypoint of injectedPoints) {
        smoothedPoints.push(new Waypoint(waypoint.getPosition()));
    }

    if(weight >= 1.0) weight = 0.999;
    let WEIGHT_SMOOTH = weight;
    let WEIGHT_DATA = 1 - weight;
    let change = 0.001;
    while(change >= 0.001) {
        change = 0.0;
        for(let i = 1; i < smoothedPoints.length - 1; i++) {
            let current = smoothedPoints[i];
            let prev = smoothedPoints[i - 1];
            let next = smoothedPoints[i + 1];

            let original = injectedPoints[i];

            // x smoothing
            let compX = current.getX();
            let newX = current.getX() + WEIGHT_DATA * (original.getX() - current.getX()) + 
                WEIGHT_SMOOTH * (prev.getX() + next.getX() - (2 * current.getX()));
            current.setX(newX);
            change += Math.abs(compX - newX);

            // y smoothing
            let compY = current.getY();
            let newY = current.getY() + WEIGHT_DATA * (original.getY() - current.getY()) + 
                WEIGHT_SMOOTH * (prev.getY() + next.getY() - (2 * current.getY()));
            current.setY(newY);
            change += Math.abs(compY - newY);
        }
    }
}

calculateDistances = function(points, distanceBetween) {
    for(let i = 0; i < points.length; i++) {
        if(i == 0) {
            distanceBetween.push(0.0);
        }
        else {
            let prev = points[i - 1];
            let curr = points[i];

            distanceBetween.push(curr.getDistanceTo(prev));
        }
    }
}

calculateCurvatures = function(points, curvatures) {
    for(let i = 0; i < points.length; i++) {
        if(i == 0 || i == points.length - 1) {
            curvatures.push(0);
            continue;
        }

        let curr = points[i];
        let prev = points[i - 1];
        let next = points[i + 1];

        let x1 = curr.getX();
        let y1 = curr.getY();

        let x2 = prev.getX();
        let y2 = prev.getY();

        let x3 = next.getX();
        let y3 = next.getY();

        if(x1 == x2) x1 += 0.0001; // get rid of divide by 0

        let k1 = 0.5 * (x1 * x1 + y1 * y1 - x2 * x2 - y2 * y2) / (x1 - x2);
        let k2 = (y1 - y2) / (x1 - x2);
        let b = 0.5 * (x2 * x2 - 2 * x2 * k1 + y2 * y2 - x3 * x3 + 2 * x3 * k1 - y3 * y3) / 
            (x3 * k2 - y3 + y2 - x2 * k2);
        let a = k1 - k2 * b;
        let r = Math.sqrt((x1 - a) * (x1 - a) + (y1 - b) * (y1 - b));

        let curvature;
        if(r == 0) {
            curvature = 1e18; // arbitrary value for infinity
        }
        else {
            curvature = 1.0 / r;
        }

        curvatures.push(curvature);
    }
}

calculateTargetVelocities = function(points, maxVelocity, maxAcceleration, turningConstant) {
    let distanceBetween = []; // distance between a point and its previous one
    let curvatures = [];

    calculateDistances(points, distanceBetween);
    calculateCurvatures(points, curvatures);

    for(let i = 0; i < points.length; i++) {
        points[i].setTargetVelocity(Math.min(maxVelocity, turningConstant / curvatures[i]));
    }

    for(let i = points.length - 1; i >= 0; i--) {
        if(i == points.length - 1) {
            points[i].setTargetVelocity(0);
            continue;
        }

        let dist = distanceBetween[i + 1];
        let nextVelocity = points[i + 1].getTargetVelocity();
        let calculatedSpeed = Math.sqrt(nextVelocity * nextVelocity + 2.0 * maxAcceleration * dist);

        points[i].setTargetVelocity(Math.min(points[i].getTargetVelocity(), calculatedSpeed));
    }
}

module.exports = {
    injectPoints,
    smoothPoints,
    calculateTargetVelocities
}
