class Pyramid extends Primitive {
    constructor(baseSize, height, sides) {
        super();
        this.baseSize = baseSize;
        this.height = height;
        this.sides = sides;
        this.type = "pyramid";
        this.process();
    }
    hasPoint(p) { 
        return p.y >= -this.height/2
            && p.y <= this.height/2
            && this.isPointInPolygon(-p.x, p.z, ((p.y - this.height/2) * this.baseSize / this.height));
    }
    // https://www.eecs.umich.edu/courses/eecs380/HANDOUTS/PROJ2/InsidePoly.html - Solution 3 (2D)
    isPointInPolygon(x, z, side) {
        let lastSide = 0;
        let angle = Math.PI * 2 / this.sides;
        let radius = side / (2 * Math.sin(Math.PI / this.sides));
        for (let i = 0; i < this.sides; i++) {
            let x1 = radius * cos(i * angle);
            let z1 = radius * sin(i * angle);
            let x2 = radius * cos((i + 1) * angle);
            let z2 = radius * sin((i + 1) * angle);
            let thisSide = (z - z1) * (x2 - x1) - (x - x1) * (z2 - z1);
            if (thisSide * lastSide < 0) return false;
            lastSide = thisSide;
        }
        return true;
    }
    getMaxRadius() {
        return Math.max(this.baseSize, this.height);
    }
    draw() {
        super.draw();
        push();
        translate(this.center.x, this.center.y - this.height/2, this.center.z);

        let angle = Math.PI * 2 / this.sides;
        let radius = this.baseSize / (2 * sin(Math.PI / this.sides));

        // Desenha a base
        beginShape();
        for (let i = 0; i < this.sides; i++) {
            let x = radius * cos(i * angle);
            let z = radius * sin(i * angle);
            vertex(x, 0, z);
        }
        endShape(CLOSE);

        // Desenha as faces triangulares
        for (let i = 0; i < this.sides; i++) {
            let x1 = radius * cos(i * angle);
            let z1 = radius * sin(i * angle);
            let x2 = radius * cos((i + 1) * angle);
            let z2 = radius * sin((i + 1) * angle);
            beginShape();
            vertex(0, this.height, 0);
            vertex(x1, 0, z1);
            vertex(x2, 0, z2);
            endShape(CLOSE);
        }
        pop();
    }
    getBaseArea() {
        return this.sides * (this.baseSize ** 2) / (4 * tan(PI / this.sides));
    }
    calculateVolume() {
        return this.getBaseArea() * this.height / 3;
    }
}
PRIMITIVES.push("pyramid");