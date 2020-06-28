import { Robot } from "./robot";
import { Vector } from "./vector";
import { Waypoint } from "./waypoint";

// returns the index of the closest point to the given vector
// uses the last found point to optimize the search
function getClosestPointIndex(points: Waypoint[], pos: Vector, lastPointIndex: number = 0): number {
    let index: number = -1;
    let closestDist: number = -1;

    for(let i = lastPointIndex; i < points.length; i++) {
        let waypoint: Waypoint = points[i];
        let checkDist: number = waypoint.getDistanceToSq(pos);

        if(index == -1 || checkDist <= closestDist) {
            index = i;
            closestDist = checkDist;
        }
    }

    return index;
}

class LookAheadResult {
    t: number;
    i: number;
    lookaheadPoint: Vector;

    constructor(t: number, i: number, lookaheadPoint: Vector) {
        this.t = t;
        this.i = i;
        this.lookaheadPoint = lookaheadPoint;
    }
}

function getLookAheadPoint(points: Waypoint[], pos: Vector, lookaheadDist: number, lastT: number = 0, lastIndex: number = 0): LookAheadResult {
    for(let i = lastIndex; i < points.length - 1; i++) {
        let a: Waypoint = points[i];
        let b: Waypoint = points[i + 1];

        if(a == null || b == null) continue;

        let t: number = getLookAheadPointT(pos, a, b, lookaheadDist);

        // if the segment is further along or the fractional index is greater, then this is the correct point
        if(t != -1 && (i > lastIndex || t > lastT)) {
            return generateLookAheadResult(a, b, t, i);
        }
    }

    // if no point is found, just return the last look ahead result
    return generateLookAheadResult(points[lastIndex], points[lastIndex + 1], lastT, lastIndex);
}

function generateLookAheadResult(a: Vector, b: Vector, t: number, i: number): LookAheadResult {
    let d: Vector = b.sub(a);
    return new LookAheadResult(t, i, a.add(d.mult(t)));
}

function getLookAheadPointT(pos: Vector, start: Vector, end: Vector, lookaheadDist: number) {
    let d: Vector = end.sub(start);
    let f: Vector = start.sub(pos);

    let a: number = d.dot(d);
    let b: number = 2 * f.dot(d);
    let c: number = f.dot(f) - lookaheadDist * lookaheadDist;

    let disc: number = b * b - 4 * a * c;

    if(disc < 0) {
        return -1;
    }
    
    disc = Math.sqrt(disc);
    let t1: number = (-b - disc) / (2 * a);
    let t2: number = (-b + disc) / (2 * a);

    if(t1 >= 0 && t1 <= 1) return t1;
    if(t2 >= 0 && t2 <= 1) return t2;

    return -1;
}

function getCurvatureToPoint(pos: Vector, angle: number, lookahead: Vector, follower: PurePursuitFollower): number {
    let a: number = -Math.tan(angle);
    let b: number = 1.0;
    let c: number = Math.tan(angle) * pos.x - pos.y;

    let x: number = Math.abs(a * lookahead.x + b * lookahead.y + c) / Math.sqrt(a * a + b * b);
    let l: number = pos.getDistanceToSq(lookahead);
    let curvature: number = 2 * x / l;

    let otherPoint: Vector = pos.add(new Vector(Math.cos(angle), Math.sin(angle)));
    let side: number = Math.sign((otherPoint.y - pos.y) * (lookahead.x - pos.x) - 
        (otherPoint.x - pos.x) * (lookahead.y - pos.y));

    follower.debug_a = a;
    follower.debug_b = b;
    follower.debug_c = c;

    return curvature * side;
}

export class PurePursuitFollower {

    lastT: number = 0.0;
    lastLookAheadIndex: number = 0;
    lastClosestIndex: number = 0;
    leftSpeed: number = 0;
    rightSpeed: number = 0;
    lastTime: number = -1;

    // robot line
    debug_a: number = 0;
    debug_b: number = 0;
    debug_c: number = 0;

    // look ahead point
    debug_la_x: number = -1257;
    debug_la_y: number = -1257;

    lookaheadDist: number;
    driveWidth: number;
    maxAcceleration: number;

    constructor(lookaheadDist: number, driveWidth: number, maxAcceleration: number) {
        this.lookaheadDist = lookaheadDist;
        this.driveWidth = driveWidth;
        this.maxAcceleration = maxAcceleration;
    }
}

export function followPath(robot: Robot, follower: PurePursuitFollower, points: Waypoint[], currentTime: number): void {
    if(points.length == 0) return;

    follower.lastClosestIndex = getClosestPointIndex(points, robot.pos, follower.lastClosestIndex);
	if(follower.lastLookAheadIndex == -0) {
		follower.lastLookAheadIndex = follower.lastClosestIndex;
	}

    let lookaheadResult: LookAheadResult = getLookAheadPoint(points, robot.pos, follower.lookaheadDist, 
        follower.lastT, follower.lastLookAheadIndex);
    follower.lastT = lookaheadResult.t;
    follower.lastLookAheadIndex = lookaheadResult.i;
    let lookaheadPoint: Vector = lookaheadResult.lookaheadPoint;

    follower.debug_la_x = lookaheadPoint.x;
    follower.debug_la_y = lookaheadPoint.y;

    let curvature: number = getCurvatureToPoint(robot.pos, robot.angle, lookaheadPoint, follower);
    let targetVelocity: number = points[follower.lastClosestIndex].targetVelocity;

    let tempLeft: number = targetVelocity * (2.0 + curvature * follower.driveWidth) / 2.0;
    let tempRight: number = targetVelocity * (2.0 - curvature * follower.driveWidth) / 2.0;

    if(follower.lastTime == -1) follower.lastTime = currentTime;
    let maxChange: number = (currentTime - follower.lastTime) / 1000.0 * follower.maxAcceleration;
    follower.leftSpeed += constrain(tempLeft - follower.leftSpeed, maxChange, -maxChange);
    follower.rightSpeed += constrain(tempRight - follower.rightSpeed, maxChange, -maxChange);

    robot.leftSpeed = follower.leftSpeed;
    robot.rightSpeed = follower.rightSpeed;

    follower.lastTime = currentTime;
}

function constrain(value: number, max: number, min: number) {
    if(value < min) return min;
    if(value > max) return max;
    return value;
}