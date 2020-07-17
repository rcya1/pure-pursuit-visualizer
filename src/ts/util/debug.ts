import { px, py, SCREEN_WIDTH } from "./conversions"
import { Robot } from "../robot/robot"
import { Waypoint } from "./waypoint"
import * as p5 from 'p5';

export function drawDebugLine(a: number, b: number, c: number, sketch: p5): void {
    for (let x = 0; x < SCREEN_WIDTH; x += 5) {
        let y = (-c - a * x) / b;
        sketch.fill(255, 0, 0);
        sketch.noStroke();
        sketch.ellipse(px(x, sketch.width), py(y, sketch.height),
            px(0.5, sketch.width), px(0.5, sketch.width));
    }
}

export function drawDebugPoint(x: number, y: number, sketch: p5) {
    sketch.fill(0, 255, 0);
    sketch.noStroke();
    sketch.ellipse(px(x, sketch.width), py(y, sketch.height),
        px(2, sketch.width), px(2, sketch.width));
}

export function drawDebugCircle(x: number, y: number, r: number, sketch: p5) {
    sketch.noFill();
    sketch.stroke(0);
    sketch.ellipse(px(x, sketch.width), py(y, sketch.height), 
        px(r * 2, sketch.width), px(r * 2, sketch.width));
}

export function getString(_injectSpacing: number, _smoothWeight: number,
    _maxVel: number, _maxAcc: number, _laDist: number, _turnConst: number,
    _userPoints: Waypoint[], _robot: Robot): string {

    let obj: Object = {
		injectSpacing: _injectSpacing,
		smoothWeight: _smoothWeight,
		maxVel: _maxVel,
		maxAcc: _maxAcc,
		laDist: _laDist,
		turnConst: _turnConst,
		userPoints: _userPoints,
		robot: _robot
    };

    return JSON.stringify(obj);
}
