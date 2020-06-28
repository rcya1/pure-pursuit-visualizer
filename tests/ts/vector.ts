import {Vector} from "../../src/ts/vector"
import { expect } from 'chai';
import 'mocha';

describe('Vector', () => {
    it('constructor', () => {
        const vector: Vector = new Vector(1, 1);
        expect(vector).not.equal(null);
    });

    it('getters and setters for (x, y)', () => {
        const vector: Vector = new Vector(1, 2);
        expect(vector).not.equal(null);
        expect(vector.x).equal(1);
        expect(vector.y).equal(2);
        vector.x = 3;
        expect(vector.x).equal(3);
        expect(vector.y).equal(2);
        vector.y = 4;
        expect(vector.x).equal(3);
        expect(vector.y).equal(4);
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
        expect(vector).not.equal(null);

        const norm: Vector = vector.normalize();
        expect(vector).not.equal(null);
        expect(norm).not.equal(null);
        
        expect(vector.x).equal(1);
        expect(vector.y).equal(2);

        expect(norm.x).to.be.closeTo(0.447, 0.001);
        expect(norm.y).to.be.closeTo(0.894, 0.001);

        expect(norm.mag).to.be.closeTo(1, 0.0001);
    });
});