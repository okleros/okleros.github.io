class Cone extends Primitive {
    constructor(radius, height) {
        super();
        this.radius = radius;
        this.height = height;
        this.type = "cone";
        this.process();
    }
    hasPoint(p) { 
        return p.y >= -this.height/2
            && p.y <= this.height/2
            && p.x**2 + p.z**2 <= ((p.y - this.height/2) * this.radius / this.height) ** 2; 
    }
    getMaxRadius() {
        return Math.max(this.radius, this.height);
    }
    draw() {
        super.draw();
        push();
        translate(this.center.x, this.center.y, this.center.z);
        cone(this.radius, this.height);
        pop();
    }
    calculateVolume() {
        return (1/3) * Math.PI * (this.radius**2) * this.height;
    }
}
PRIMITIVES.push("cone");