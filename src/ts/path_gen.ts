import { Vector } from "./vector"
import { Waypoint } from "./waypoint"

export function injectPoints(userPoints: Waypoint[], injectedPoints: Waypoint[], spacing: number): void {
    injectedPoints.splice(0, injectedPoints.length);

    for (let i = 0; i < userPoints.length - 1; i++) {
        let a: Waypoint = userPoints[i];
        let b: Waypoint = userPoints[i + 1];

        let vector: Vector = b.sub(a);
        let numPoints: number = Math.ceil(vector.mag / spacing);
        let dVector: Vector = vector.normalize().mult(spacing);

        for (let j = 0; j < numPoints; j++) {
            injectedPoints.push(new Waypoint(a.add(dVector.mult(j))));
        }
    }
}

export function smoothPoints(injectedPoints: Waypoint[], smoothedPoints: Waypoint[], weight: number): void {
    smoothedPoints.splice(0, smoothedPoints.length);

    for (let waypoint of injectedPoints) {
        smoothedPoints.push(new Waypoint(waypoint));
    }

    if(weight >= 1.0) weight = 0.999;
    const WEIGHT_SMOOTH: number = weight;
    const WEIGHT_DATA: number = 1 - weight;
    let change: number = 0.001;

    while(change >= 0.001) {
        change = 0.0;
        for(let i = 1; i < smoothedPoints.length - 1; i++) {
            let current: Waypoint = smoothedPoints[i];
            let prev: Waypoint = smoothedPoints[i - 1];
            let next: Waypoint = smoothedPoints[i + 1];

            let original: Waypoint = injectedPoints[i];

            // x smoothing
            let compX: number = current.x;
            let newX: number = current.x + WEIGHT_DATA * (original.x - current.x) + 
                WEIGHT_SMOOTH * (prev.x + next.x - (2 * current.x));
            current.x = newX;
            change += Math.abs(compX - newX);

            // y smoothing
            let compY: number = current.y;
            let newY: number = current.y + WEIGHT_DATA * (original.y - current.y) + 
                WEIGHT_SMOOTH * (prev.y + next.y - (2 * current.y));
            current.y = newY;
            change += Math.abs(compY - newY);
        }
    }
}

function calculateDistances(points: Waypoint[], distanceBetween: number[]): void {
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

function calculateCurvatures(points: Waypoint[], curvatures: number[]): void {
    for(let i = 0; i < points.length; i++) {
        if(i == 0 || i == points.length - 1) {
            curvatures.push(0);
            continue;
        }

        let curr: Waypoint = points[i];
        let prev: Waypoint = points[i - 1];
        let next: Waypoint = points[i + 1];

        let x1: number = curr.x;
        let y1: number = curr.y;

        let x2: number = prev.x;
        let y2 = prev.y;

        let x3: number = next.x;
        let y3: number = next.y;

        if(x1 == x2) x1 += 0.0001; // get rid of divide by 0

        let k1: number = 0.5 * (x1 * x1 + y1 * y1 - x2 * x2 - y2 * y2) / (x1 - x2);
        let k2: number = (y1 - y2) / (x1 - x2);
        let b: number = 0.5 * (x2 * x2 - 2 * x2 * k1 + y2 * y2 - x3 * x3 + 2 * x3 * k1 - y3 * y3) / 
            (x3 * k2 - y3 + y2 - x2 * k2);
        let a: number = k1 - k2 * b;
        let r: number = Math.sqrt((x1 - a) * (x1 - a) + (y1 - b) * (y1 - b));

        let curvature: number;
        if(r == 0) {
            curvature = 1e18; // arbitrary value for infinity
        }
        else {
            curvature = 1.0 / r;
        }

        curvatures.push(curvature);
    }
}

export function calculateTargetVelocities(points: Waypoint[], maxVelocity: number, maxAcceleration: number,
    turningConstant: number): void {
        
    let distanceBetween: number[] = []; // distance between a point and its previous one
    let curvatures: number[] = [];

    calculateDistances(points, distanceBetween);
    calculateCurvatures(points, curvatures);

    for(let i = 0; i < points.length; i++) {
        points[i].targetVelocity = Math.min(maxVelocity, turningConstant / curvatures[i]);
    }

    for(let i = points.length - 1; i >= 0; i--) {
        if(i == points.length - 1) {
            points[i].targetVelocity = 0;
            continue;
        }

        let dist: number = distanceBetween[i + 1];
        let nextVelocity: number= points[i + 1].targetVelocity;
        let calculatedSpeed: number = Math.sqrt(nextVelocity * nextVelocity + 2.0 * maxAcceleration * dist);

        points[i].targetVelocity = Math.min(points[i].targetVelocity, calculatedSpeed);
    }
}
