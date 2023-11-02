class Box extends Primitive {
    constructor (width, height, depth) {
        super();
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.type = "box";
        this.process();
    }
    hasPoint(p) {
        return Math.abs(this.center.y - p.y) * 2 <= this.height
            && Math.abs(this.center.x - p.x) * 2 <= this.width
            && Math.abs(this.center.z - p.z) * 2 <= this.depth;
    }
    getMaxRadius() {
        return Math.max(this.width/2, this.height/2, this.depth/2);
    }
    draw() {
        super.draw();
        push();
        translate(this.center.x, this.center.y, this.center.z);
        box(this.width, this.height, this.depth);
        pop();
    }
    calculateVolume() {
        return this.width * this.height * this.depth;
    }
}
PRIMITIVES.push("box");