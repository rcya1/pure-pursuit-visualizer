import {Vector} from "../../src/ts/vector"
import { expect } from 'chai';
import 'mocha';

describe('Vector', () => {
    it('constructor', () => {
        const vector: Vector = new Vector(1, 1);
        validateVectorExact(vector, 1, 1);
    });

    it('getters and setters for (x, y)', () => {
        const vector: Vector = new Vector(1, 2);
        validateVectorExact(vector, 1, 2);
        vector.x = 3;
        validateVectorExact(vector, 3, 2);
        vector.y = 4;
        validateVectorExact(vector, 3, 4);
    });

    it('magnitude', () => {
        const vector: Vector = new Vector(3, 4);
        expect(vector).not.equal(null);
        expect(vector.magSq).equal(25);
        expect(vector.mag).equal(5);

        vector.x = 10;
        vector.y = 20;
        expect(vector.magSq).equal(500);
        expect(vector.mag).to.be.closeTo(22.36, 0.01);
    });

    it('normalize', () => {
        const vector: Vector = new Vector(1, 2);
        const norm: Vector = vector.normalize();
        
        validateVectorExact(vector, 1, 2);
        validateVectorApprox(norm, 0.447, 0.894, 0.001);

        expect(norm.mag).to.be.closeTo(1, 0.0001);
    });

    it('add / sub', () => {
        const a: Vector = new Vector(1, 2);
        const b: Vector = new Vector(3, 5);

        const c: Vector = a.add(b);
        validateVectorExact(a, 1, 2);
        validateVectorExact(c, 4, 7);

        const d: Vector = b.sub(a);
        validateVectorExact(a, 1, 2);
        validateVectorExact(d, 2, 3);
    });

    it('scalar mult', () => {
        const vector: Vector = new Vector(2, 4);
        const mult: number = 3;

        const product: Vector = vector.mult(mult);
        validateVectorExact(vector, 2, 4);
        validateVectorExact(product, 6, 12);
    });

    it('dot', () => {
        const a: Vector = new Vector(2, 4);
        const b: Vector = new Vector(3, 5);

        const dot1: number = a.dot(b);
        const dot2: number = b.dot(a);

        expect(dot1).equal(26);
        expect(dot2).equal(26);
    });

    it('get distance', () => {
        const a: Vector = new Vector(2, 5);
        const b: Vector = new Vector(3, 20);

        const distSq1: number = a.getDistanceToSq(b);
        const distSq2: number = b.getDistanceToSq(a);

        expect(distSq1).equal(226);
        expect(distSq2).equal(226);

        const dist1: Number = a.getDistanceTo(b);
        const dist2: Number = b.getDistanceTo(a);

        expect(dist1).to.be.closeTo(15.033, 0.001);
        expect(dist2).to.be.closeTo(15.033, 0.001);
    });

    function validateVectorExact(vector: Vector, x: number, y: number) {
        expect(vector).not.equal(null);
        expect(vector.x).equal(x);
        expect(vector.y).equal(y);
    }

    function validateVectorApprox(vector: Vector, x: number, y: number, e: number) {
        expect(vector).not.equal(null);
        expect(vector.x).to.be.closeTo(x, e);
        expect(vector.y).to.be.closeTo(y, e);
    }
});