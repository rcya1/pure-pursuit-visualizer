let Vector = class {
    
    constructor(x, y) {
        this.x = x;
        this.y = y;
    
        this.mag = -1;
        this.magSq = -1;
    }

    copy() {
        return new Vector(this.getX(), this.getY());
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    setX(x) {
        this.x = x;
        this.mag = -1;
        this.magSq = -1;
    }

    setY(y) {
        this.y = y;
        this.mag = -1;
        this.magSq = -1;
    }

    getMagSq() {
        if(this.magSq == -1) {
            this.magSq = this.getX() * this.getX() + this.getY() * this.getY();
        }
        return this.magSq;
    }

    getMag() {
        if(this.mag == -1) {
            this.mag = Math.sqrt(this.getMagSq());
        }
        return this.mag;
    }

    normalize() {
        let newX = this.getX() / this.getMag();
        let newY = this.getY() / this.getMag();

        return new Vector(newX, newY);
    }

    add(vector) {
        return new Vector(this.getX() + vector.getX(), this.getY() + vector.getY());
    }

    sub(vector) {
        return new Vector(this.getX() - vector.getX(), this.getY() - vector.getY());
    }

    mult(num) {
        return new Vector(this.getX() * num, this.getY() * num);
    }

    dot(vector) {
        return this.getX() * vector.getX() +  this.getY() * vector.getY();
    }

    getDistanceTo(other) {
        return Math.sqrt((this.getX() - other.getX()) * (this.getX() - other.getX()) +
            (this.getY() - other.getY()) * (this.getY() - other.getY()));
    }

    getDistanceToSq(other) {
        return ((this.getX() - other.getX()) * (this.getX() - other.getX()) +
            (this.getY() - other.getY()) * (this.getY() - other.getY()));
    }

    printInfo() {
        console.log("X: " + this.getX() + ", Y: " + this.getY());
    }

    printInfoVerbose() {
        console.log("X: " + this.getX() + ", Y: " + this.getY() + ", Mag: " + this.getMag());
    }
}

module.exports = Vector;
