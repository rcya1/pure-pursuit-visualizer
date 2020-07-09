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
        if(this.targetVelocity != -1) {
            sketch.fill(color * this.targetVelocity / 50);
        }
        else {
            sketch.fill(color);

        }
        sketch.noStroke();
        let drawRadius = active ? radius * 1.25 : radius;
        sketch.ellipse(px(this.x, sketch.width), py(this.y, sketch.height),
            px(drawRadius, sketch.width), px(drawRadius, sketch.width));
    }

    drawColor(sketch: p5, radius: number, active: boolean, r: number, g: number, b: number) {
        sketch.noStroke();
        sketch.fill(r, g, b);
        let drawRadius = active ? radius * 1.25 : radius;
        sketch.ellipse(px(this.x, sketch.width), py(this.y, sketch.height),
            px(drawRadius, sketch.width), px(drawRadius, sketch.width));
    }
}
