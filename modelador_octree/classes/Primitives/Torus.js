class Torus extends Primitive {
    constructor(outerRadius, tubeRadius) {
        super();
        this.outerRadius = outerRadius;
        this.tubeRadius = tubeRadius;
        this.type = "torus";
        this.process();
    }
    hasPoint(p) {
        const pointDistance = Math.sqrt(p.x**2 + p.z**2);
        return (this.outerRadius - pointDistance)**2 + p.y**2 <= this.tubeRadius**2;
    }
    getMaxRadius() {
        return this.outerRadius + this.tubeRadius;
    }
    draw() {
        super.draw();
        push();
        rotateX(PI/2);
        translate(this.center.x, this.center.y, this.center.z);
        torus(this.outerRadius, this.tubeRadius);
        pop();
    }
    calculateVolume() {
        return 2 * this.outerRadius * ((Math.PI * this.tubeRadius) ** 2);
    }
}
PRIMITIVES.push("torus");