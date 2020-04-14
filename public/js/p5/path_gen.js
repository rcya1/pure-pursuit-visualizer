const Waypoint = require("./waypoint");

injectPoints = function (userPoints, injectedPoints, spacing) {
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

smoothPoints = function (injectedPoints, smoothedPoints) {
    smoothedPoints.splice(0, smoothedPoints.length);

    for (waypoint of injectedPoints) {
        smoothedPoints.push(new Waypoint(waypoint.getPosition()));
    }

    let WEIGHT_SMOOTH = 0.75;
    let WEIGHT_DATA = 1 - WEIGHT_SMOOTH;
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

module.exports = {
    injectPoints,
    smoothPoints
}
