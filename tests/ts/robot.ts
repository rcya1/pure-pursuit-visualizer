import { Robot } from "../../src/ts/robot"
import { Vector } from "../../src/ts/vector"
import { PI } from "../../src/ts/conversions"
import { expect } from 'chai';
import 'mocha';

describe('Robot', () => {
    it('constructor', () => {
        let robot: Robot = new Robot();
        expect(robot).not.equal(null);
    });

    it('stays still', () => {
        let robot: Robot = new Robot();
        let initPos: Vector = new Vector(robot.pos.x, robot.pos.y);

        for(let i = 0; i < 1000; i++) {
            robot.update(60.0, 10.0);
        }

        validateVectorApprox(robot.pos, initPos, 0.01);
        expect(robot.velocity).to.be.closeTo(0.0, 0.01);
        expect(robot.angle).to.be.closeTo(PI / 2, 0.01);
        expect(robot.angularVelocity).to.be.closeTo(0.0, 0.01);
    });

    it('rotates in place', () => {
        let robot: Robot = new Robot();
        let initPos: Vector = new Vector(robot.pos.x, robot.pos.y);

        for(let i = 0; i < 10; i++) {
            robot.leftSpeed = 1.0;
            robot.rightSpeed = -1.0;
            robot.update(60.0, 10.0);
        }

        validateVectorApprox(robot.pos, initPos, 0.01);
        expect(robot.velocity).to.be.closeTo(0.0, 0.01);
        expect(robot.angle).to.be.closeTo(1.54, 0.01);
        expect(robot.angularVelocity).to.be.closeTo(-0.20, 0.01);
    });

    it('drives forward', () => {
        let robot: Robot = new Robot();
        let initPos: Vector = new Vector(robot.pos.x, robot.pos.y);

        for(let i = 0; i < 100; i++) {
            robot.leftSpeed = 20.0;
            robot.rightSpeed = 20.0;
            robot.update(60.0, 10.0);
        }

        validateVectorApprox(robot.pos, new Vector(initPos.x, initPos.y + 33.33));
        expect(robot.velocity).to.be.closeTo(20.0, 0.01);
        expect(robot.angle).to.be.closeTo(PI / 2, 0.01);
        expect(robot.angularVelocity).to.be.closeTo(0.0, 0.01);
    });

    it('drives randomly', () => {
        let robot: Robot = new Robot();
        let initPos: Vector = new Vector(robot.pos.x, robot.pos.y);

        for(let i = 0; i < 1257; i++) {
            robot.leftSpeed = -254.0 ;
            robot.rightSpeed = 118.0;
            robot.update(60.0, 11.0);

            for(let j = 0; j < 2; j++) {
                robot.leftSpeed = 1257.0 ;
                robot.rightSpeed = 1923.0;
                robot.update(60.0, 11.0);
            }
        }

        validateVectorApprox(robot.pos, new Vector(initPos.x - 31.77, initPos.y - 36.23));
        expect(robot.velocity).to.be.closeTo(1590, 0.01);
        expect(robot.angle).to.be.closeTo(4.79, 0.01);
        expect(robot.angularVelocity).to.be.closeTo(60.54, 0.01);
    });

    function validateVectorApprox(a: Vector, b: Vector, e: number = 0.01) {
        expect(a).not.equal(null);
        expect(a.x).to.be.closeTo(b.x, e);
        expect(a.y).to.be.closeTo(b.y, e);
    }
});
