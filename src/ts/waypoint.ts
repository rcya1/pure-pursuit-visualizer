import { Vector } from "./vector"
import { px, py } from "./conversions"
import * as p5 from 'p5';

export class Waypoint extends Vector {
    targetVelocity: number = -1.0;

    constructor(vector: Vector) {
        super(vector.x, vector.y);

        if(vector instanceof Waypoint) {
            this.targetVelocity = vector.targetVelocity;
        }
    }

    draw(sketch: p5, radius: number, active: boolean, color: number) {
        sketch.fill(color * this.targetVelocity / 50);
        sketch.noStroke();
        let drawRadius = active ? radius * 1.25 : radius;
        sketch.ellipse(px(this.x, sketch.width), py(this.y, sketch.height),
            px(drawRadius, sketch.width), px(drawRadius, sketch.width));
    }
}
