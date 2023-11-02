class Primitive {
    constructor() {
      this.vertices = [];
      this.points = [];
      this.center = new Point(0, 0, 0);
      this.fill = 'yellow';
      this.strokeColor = 'black';
      this.strokeColorSelected = 'orange';
      this.strokeWeight = 1;
      this.strokeWeightSelected = 2;
      this.type = "";
      this.name = "";
      this.selected = false;
      this.visible = true;
      this.volume = 0;
    }
    addVertex(x, y, z) {
      let point = new Point(x, y, z);
      this.points.push(point);
      this.vertices.push(point.toArray());
      return point;
    }
    getVertexCopy(index) {
      let v = this.vertices[index];
      return [[v[0]], [v[1]], [v[2]], [1]];
    }
    preProcess() {
      for (let i = 0; i < this.vertices.length; ++i) {
        this.points[i].setFromArray(this.vertices[i]);
      }
    }
    applyOperation(matrix) {
      for (let v = 0; v < this.vertices.length; ++v) {
        const vert = this.getVertexCopy(v);
        const result = Matrix.mul(matrix, vert);
        for (let i = 0; i < 3; ++i) {
          this.vertices[v][i] = result[i][0];
        }
      }
    }
    scale(x, y, z) {
      this.applyOperation([[x, 0, 0, 0], [0, y, 0, 0], [0, 0, z, 0], [0, 0, 0, 1]]);
    }
    translate(x, y, z) {
      this.applyOperation([[1, 0, 0, x], [0, 1, 0, y], [0, 0, 1, z], [0, 0, 0, 1]]);
    }
    rotateX(angle) {
      let c = cos(angle), s = sin(angle);
      this.applyOperation([[1, 0, 0, 0], [0, c, -s, 0], [0, s, c,0], [0, 0, 0, 1]]);
    }
    rotateY(angle) {
      let c = cos(angle), s = sin(angle);
      this.applyOperation([[c, 0, s, 0], [0, 1, 0, 0], [-s, 0,  c, 0], [0, 0, 0, 1]]);
    }
    rotateZ(angle) {
      let c = cos(angle), s = sin(angle);
      this.applyOperation([[c, -s, 0, 0 ], [s, c, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
    }
    hasPoint(p) {}
    process() {
        this.volume = this.calculateVolume();
    }
    getStroke() {
        return (this.selected) ? this.strokeColorSelected : this.strokeColor;
    }
    getMaxRadius() {
        return 0;
    }
    getStrokeWeight() {
        if (!config.wireframe) return 0;
        return (this.selected) ? this.strokeWeightSelected : this.strokeWeight;
    } 
    classifyLeaf(octree) {
        let count = 0;
        const octreeVertices = octree.getVertices(); 
        for (const vertex of octreeVertices) {
            if (this.hasPoint(vertex)) {
                count++;
            }
        }
        if (count >= Octree.minVertices) return 'B';
        return '(';
    }
    classify(octree) {
        let inside = true;
        const octreeVertices = octree.getVertices(); 
        for (const vertex of octreeVertices) {
            if (!this.hasPoint(vertex)) {
                inside = false;
                break; 
            }
        }
        if (inside) {
            return 'B';
        }
        return '(';
    }
    draw() {
        fill(this.fill);
        if (!config.fill) noFill();
        stroke(this.getStroke());
        strokeWeight(this.getStrokeWeight());
    }
    calculateVolume() {
        return 0;
    }
}
var PRIMITIVES = [];