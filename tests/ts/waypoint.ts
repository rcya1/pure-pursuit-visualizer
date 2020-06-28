import { Waypoint } from "../../src/ts/waypoint"
import { Vector } from "../../src/ts/vector"
import { expect } from 'chai';
import 'mocha';

describe('Waypoint', () => {
    it('construct from Vector', () => {
        const vector: Vector = new Vector(1, 1);
        let waypoint: Waypoint = new Waypoint(vector);
        validateWaypointExact(waypoint, 1, 1, -1);
    });

    it('construct from Waypoint', () => {
        let waypoint: Waypoint = new Waypoint(new Vector(1, 1));
        waypoint.targetVelocity = 20.0;

        const waypointCopy: Waypoint = new Waypoint(waypoint);
        validateWaypointExact(waypointCopy, 1, 1, 20.0);
    });

    function validateWaypointExact(waypoint: Waypoint, x: number, y: number, targetVelocity: number) {
        expect(waypoint).not.equal(null);
        expect(waypoint.x).equal(x);
        expect(waypoint.y).equal(y);
        expect(waypoint.targetVelocity).equal(targetVelocity);
    }
});