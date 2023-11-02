class Cylinder extends Primitive {
    constructor(radius, height) {
        super();
        this.radius = radius;
        this.height = height;
        this.type = "cylinder";
        this.process();
    }
    hasPoint(p) {
        return this.center.sub(new Point(p.x, 0, p.z)).magnitude() <= this.radius && Math.abs(this.center.y - p.y) * 2 <= this.height;
    }
    getMaxRadius() {
        return Math.max(this.radius, this.height);
    }
    draw() {
        super.draw();
        push();
        translate(this.center.x, this.center.y, this.center.z);
        cylinder(this.radius, this.height);
        pop();
    }
    calculateVolume() {
        return Math.PI * (this.radius**2) * this.height;
    }
}
PRIMITIVES.push("cylinder");