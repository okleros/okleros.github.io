class Octree extends Primitive {
    constructor(center, halfDimension, depth) {
        super();
        this.center = center;
        this.halfDimension = halfDimension;
        this.depth = depth;
        this.state = 'B';
        this.children = [];
    }
  
    subdivide() {
        const halfDim = this.halfDimension/2;
        // Define o centro do 8 sub-octantes
        const centers = [
            new Point(this.center.x - halfDim, this.center.y - halfDim, this.center.z - halfDim),
            new Point(this.center.x - halfDim, this.center.y - halfDim, this.center.z + halfDim),
            new Point(this.center.x - halfDim, this.center.y + halfDim, this.center.z - halfDim),
            new Point(this.center.x - halfDim, this.center.y + halfDim, this.center.z + halfDim),
            new Point(this.center.x + halfDim, this.center.y - halfDim, this.center.z - halfDim),
            new Point(this.center.x + halfDim, this.center.y - halfDim, this.center.z + halfDim),
            new Point(this.center.x + halfDim, this.center.y + halfDim, this.center.z - halfDim),
            new Point(this.center.x + halfDim, this.center.y + halfDim, this.center.z + halfDim)
        ];
        // Cria os 8 sub-octantes
        this.children = centers.map(center => new Octree(center, halfDim, this.depth - 1));
    }
    
    build(solid) {
        if (this.depth >= 1) {
            this.state = solid.classify(this);   
            if (this.state === '(') { 
                this.subdivide();
                for (let i = 0; i < 8; i++) {
                    this.children[i].build(solid);
                }
            }
        } else {
            this.state = solid.classifyLeaf(this);
        }
    }

    drawOctree() {
        if (this.state === "B") {
            const halfDim = this.halfDimension;
            push();
            translate(this.center.x, this.center.y, this.center.z);
            box(halfDim*2);
            pop();
        } else if (this.state === "(") {
            for (let i = 0; i < 8; i++) {
                if (this.children[i]) {
                    this.children[i].drawOctree();
                }
            }
        }
    }

    draw() {
        super.draw();
        this.drawOctree();
    }

    getVertices() {
        const halfDim = this.halfDimension;
        const x = this.center.x;
        const y = this.center.y;
        const z = this.center.z;
      
        const vertices = [
            new Point(x - halfDim, y - halfDim, z - halfDim),
            new Point(x + halfDim, y - halfDim, z - halfDim),
            new Point(x + halfDim, y + halfDim, z - halfDim),
            new Point(x - halfDim, y + halfDim, z - halfDim),
            new Point(x - halfDim, y - halfDim, z + halfDim),
            new Point(x + halfDim, y - halfDim, z + halfDim),
            new Point(x + halfDim, y + halfDim, z + halfDim),
            new Point(x - halfDim, y + halfDim, z + halfDim),
            new Point(x, y, z)
        ];
        return vertices;
    }

    calculateVolume() {
        if (this.state === 'B') {
            const sideLength = this.halfDimension * 2;
            return sideLength ** 3;
        } else if (this.state === '(') {
            let volume = 0;
            for (let i = 0; i < 8; i++) {
                if (this.children[i]) {
                    volume += this.children[i].calculateVolume();
                }
            }
            return volume;
        }
        return 0;
    }
}
Octree.minVertices = 5;