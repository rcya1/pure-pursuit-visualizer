export class Vector {

    private _x: number;
    private _y: number;
    private _mag: number = -1;
    private _magSq: number = -1;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x(): number {
        return this._x;
    }
    
    get y(): number {
        return this._y;
    }

    set x(newX: number) {
        this._x = newX;
        this._mag = -1;
        this._magSq = -1;
    }

    set y(newY: number) {
        this._y = newY;
        this._mag = -1;
        this._magSq = -1;
    }

    get magSq(): number {
        if(this._magSq == -1) {
           this._magSq = this._x * this._x + this._y + this._y; 
        }
        return this._magSq;
    }

    get mag(): number {
        if(this._mag == -1) {
           this._mag = Math.sqrt(this.magSq);
        }
        return this._mag;
    }

    normalize() {
        let newX = this._x / this.mag;
        let newY = this._y / this.mag;

        return new Vector(newX, newY);
    }

    add(vector: Vector) {
        return new Vector(this._x + vector.x, this._y + vector.y);
    }

    sub(vector: Vector) {
        return new Vector(this._x - vector.x, this._y - vector.y);
    }

    mult(num: number) {
        return new Vector(this._x * num, this._y * num);
    }

    dot(vector: Vector) {
        return this._x * vector.x + this._y * vector.y;
    }

    getDistanceTo(vector: Vector) {
        return this.sub(vector).mag;
    }

    getDistanceToSq(vector: Vector) {
        return this.sub(vector).magSq;
    }

    printInfo() {
        console.log("X: " + this._x + ", Y: " + this._y);
    }

    printInfoVerbose() {
        console.log("X: " + this._x + ", Y: " + this._y + ", Mag: " + this.mag);
    }
}