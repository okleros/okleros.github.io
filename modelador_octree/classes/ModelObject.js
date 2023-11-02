class ModelObject extends Primitive {
    constructor(path) {
        super();
        this.fill = color(195, 25, 25);
        this.strokeWeight = 0.5;
        this.type = "model";
        this.vertices = []
        this.faces = [];
        this.model = loadModel(path, true, ()=> {
            this.vertices = this.model.vertices.map(v => new Point(v.x, v.y, v.z));
            this.faces = this.model.faces.map(f => [
                this.vertices[f[0]],
                this.vertices[f[1]],
                this.vertices[f[2]]
            ]);
        }, () => {
            console.log("Error while loading model!");
        }, ".obj");
    }
    getMaxRadius() {
        let minBounds = new Point(Infinity, Infinity, Infinity);
        let maxBounds = new Point(-Infinity, -Infinity, -Infinity);

        // Encontre as coordenadas máximas e mínimas
        for (let vertex of this.vertices) {
            minBounds.x = min(minBounds.x, vertex.x);
            minBounds.y = min(minBounds.y, vertex.y);
            minBounds.z = min(minBounds.z, vertex.z);

            maxBounds.x = max(maxBounds.x, vertex.x);
            maxBounds.y = max(maxBounds.y, vertex.y);
            maxBounds.z = max(maxBounds.z, vertex.z);
        }

        return Math.max(...(maxBounds.sub(minBounds).toArray3D()));
    }
    setName(name) {
        this.name = name;
        return this;
    }
    hasPoint(point) {
        const directions = [
            new Point(1, 0, 0),
            new Point(0, 1, 0),
            new Point(0, 0, 1)
        ];
    
        for (const direction of directions) {
            let intersectionCount = 0;
            for (const triangle of this.faces) {
                if (this.rayIntersectsFace(point, direction, triangle)) {
                    intersectionCount++;
                }
            }
            // Verifica se o número de interseções é ímpar (ponto dentro do sólido)
            if (intersectionCount % 2 === 0) return false;
        }
        return true;
    }
    // Fonte: https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
    rayIntersectsFace(rayOrigin, rayDirection, face) {
        const EPSILON = 1e-9;
    
        const vertex0 = face[0];
        const vertex1 = face[1];
        const vertex2 = face[2];
    
        const edge1 = vertex1.sub(vertex0);
        const edge2 = vertex2.sub(vertex0);
    
        const h = rayDirection.cross(edge2);
        const a = edge1.dot(h);
    
        if (Math.abs(a) < EPSILON) {
            // O raio é paralelo ao triângulo
            return false;
        }
    
        const f = 1.0 / a;
        const s = rayOrigin.sub(vertex0);
        const u = f * s.dot(h);
    
        if (u < 0.0 || u > 1.0) {
            return false;
        }
    
        const q = s.cross(edge1);
        const v = f * rayDirection.dot(q);
    
        if (v < 0.0 || u + v > 1.0) {
            return false;
        }
    
        // Calcula o parâmetro t para a interseção
        const t = f * edge2.dot(q);
    
        // Verifica se a interseção está à frente do raio
        if (t > EPSILON) {
            return true;
        }
    
        return false;
    }
    draw() {
        super.draw();
        model(this.model);
    }
}