// Modelo do carro: https://sketchfab.com/3d-models/low-poly-lamborghini-6f2a4555a33d4e6aadb142b5cca3f07b

const SCENE_W = 700;
const SCENE_H = 700;
const AXIS_SIZE = 5000;
const MODELS = ["bunny"];

let mouseDrag = false;
let mousePoint = new Point(0, 0, 0);
let cameraRotation = new Point(0, 0, 0);
let cameraDrag = new Point(0, 0, 0);
let cameraPosition = new Point(0, 0, 0);

let zoomLevel = 1.0; 
let zoomIncrement = 0.1;
let cameraSpeed = 2;

let modelName = "bunny";
let primitiveName = "box";

let selectedModel = null;

let checkboxVisible;
let canvas;

let config = {
    wireframe: true,
    fill: true,
    axis: true
};

function getAvailableName(name) {
    let index = 1;
    let newName = name;
    while (scene.find((e) => e.name == newName)) {
        newName = `${name} ${++index}`
    }
    return newName;
}

function getModelPath() {
    return `./models/${modelName}.obj`;
}

let hold = {};

function keyHolding(key) {
    if (key in hold) return hold[key];
    return false;
}

function setup() {
    canvas = createCanvas(SCENE_W, SCENE_H, WEBGL);
    canvas.parent('canvas-container');

    setupViewSettings();
    setupLoadModel();
    setupAddPrimitive();
    setupSceneView();
    setupObjectView();
    setupOctreeView();
    setupDropModel();

    scene = [];
    frameRate(144);
}

function setupDropModel() {
    let mainCanvas = document.querySelector('canvas');
    // Carregar arquivo de modelo
    mainCanvas.addEventListener('drop', e => {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = () => {
          addModel("model", reader.result);
          console.log(reader.result);
        }
        reader.readAsDataURL(e.dataTransfer.files[0]);
    });
    mainCanvas.addEventListener("dragover", e => {
        e.preventDefault();
    });
    mainCanvas.addEventListener("dragleave", e => {
        e.preventDefault();
    });
      

}

function setupViewSettings() {
    checkboxWireframe = createCheckbox("Wireframe", config.wireframe);
    checkboxWireframe.changed(() => { config.wireframe = checkboxWireframe.checked(); })
    checkboxWireframe.parent('view-settings');
    
    checkboxFill = createCheckbox("Fill", config.fill);
    checkboxFill.changed(() => { config.fill = checkboxFill.checked(); })
    checkboxFill.parent('view-settings');

    checkboxAxis = createCheckbox("Axis", config.axis);
    checkboxAxis.changed(() => { config.axis = checkboxAxis.checked(); })
    checkboxAxis.parent('view-settings');
}

function addModel(name, path) {
    let newName = getAvailableName(name);
    let model = new ModelObject(path);
    model.name = newName;
    scene.push(model);
    selectScene.option(newName);
    selectScene.adjust();
}

function setupLoadModel() {
    selectLoadModel = createSelect();
    MODELS.forEach(m => selectLoadModel.option(m));
    selectLoadModel.changed(() => {
        modelName = selectLoadModel.value();
    });
    selectLoadModel.parent('load-model');
    buttonLoadModel = createButton("Load");
    buttonLoadModel.mousePressed(() => {
        addModel(modelName, getModelPath());
    });
    buttonLoadModel.parent('load-model');
}

function setupAddPrimitive() {
    let parent = 'add-primitive';
    selectAddPrimitive = createSelect();
    PRIMITIVES.forEach(m => selectAddPrimitive.option(m));
    selectAddPrimitive.changed(() => {
        primitiveName = selectAddPrimitive.value();
    });
    selectAddPrimitive.parent(parent);
    buttonAddPrimitive = createButton("Add");
    buttonAddPrimitive.mousePressed(() => {
        let newName = getAvailableName(primitiveName);
        let primitive;
        if (primitiveName == "sphere") {
            primitive = new Sphere(100);
        } else if (primitiveName == "box") {
            primitive = new Box(100, 100, 100);
        } else if (primitiveName == "cylinder") {
            primitive = new Cylinder(100, 300);
        } else if (primitiveName == "cone") {
            primitive = new Cone(100, 300);
        } else if (primitiveName == "torus") {
            primitive = new Torus(300, 100);
        } else if (primitiveName == "pyramid") {
            primitive = new Pyramid(100, 100, 4);
        }
        primitive.name = newName;
        primitive.process();
        scene.push(primitive);
        selectScene.option(newName);
        selectScene.adjust();
    });
    buttonAddPrimitive.parent(parent);
}

function selectModel(model) {
    selectedModel = model;
    labelVolume.html("");
    if (selectedModel) {
        checkboxVisible.elt.firstChild.firstChild.checked = selectedModel.visible;
        if (selectedModel.volume) {
            labelVolume.html(`Volume: ${selectedModel.volume}`);
        }
    }
}

function setupSceneView() {
    selectScene = createSelect();
    selectScene.attribute('size', 5);
    selectScene.style('min-width', '200px');
    selectScene.parent('scene');
    selectScene.option('none');
    selectScene.input(() => {
        let model = scene.find((e) => e.name == selectScene.value());
        selectModel(model);
        selectScene.adjust();
    });
    selectScene.adjust = () => {
        selectScene.attribute('size', selectScene.elt.options.length);
    };
}

function setupObjectView() {
    checkboxVisible = createCheckbox("Visible", true);
    checkboxVisible.changed(() => { 
        if (!selectedModel) return;
        selectedModel.visible = checkboxVisible.checked(); 
    })
    checkboxVisible.parent('object-visible');
    
    labelVolume = createDiv('');
    labelVolume.parent('object-visible');

    buttonDeleteObject = createButton('Delete');
    buttonDeleteObject.parent('object');
    buttonDeleteObject.mousePressed(() => {
        if (!selectedModel) return;
        let index = scene.findIndex((e) => e.name == selectedModel.name);
        if (index == -1) return;
        selectScene.elt.remove(1 + index);
        scene.splice(index, 1);
        selectModel(null);
        selectScene.adjust();
    });
}

function setupOctreeView() {
    sliderDepth = createSlider(3, 9, 1);
    sliderDepth.parent('octree');
    sliderDepth.value(5);
    sliderDepth.input(() => {
        labelDepthValue.html(sliderDepth.value());
    })

    labelDepthValue = createDiv('5');
    labelDepthValue.parent('octree');

    buttonGenerateOctree = createButton('Generate');
    buttonGenerateOctree.parent('octree-generate');
    buttonGenerateOctree.mousePressed(() => {
        if (!selectedModel) return;
        let newName = getAvailableName(`octree ${selectedModel.type}`);
        let octreeCenter = selectedModel.center.mul(1);
        let oct = new Octree(octreeCenter, selectedModel.getMaxRadius(), sliderDepth.value());
        oct.build(selectedModel);
        oct.process();
        oct.name = newName;
        selectedModel.visible = false;
        selectModel(oct);
        scene.push(oct);
        selectScene.option(newName);
        selectScene.value(newName);
        selectScene.adjust();
    });
}

function cameraMovement() {
    let velocity = new Point(0, 0, 0);
    let upDirection = keyHolding("e") - keyHolding("c");
    let xDirection = keyHolding("d") - keyHolding("a");
    let zDirection = keyHolding("w") - keyHolding("s");
    let moveSpeed = cameraSpeed;
    velocity.x -= xDirection * moveSpeed;
    velocity.z += zDirection * moveSpeed;
    velocity.y -= upDirection * moveSpeed;
    let primitive = new Primitive();
    primitive.addVertex(velocity.x, velocity.y, velocity.z);
    primitive.rotateY(-cameraRotation.y);
    primitive.rotateZ(-cameraRotation.z);
    primitive.preProcess();
    velocity = primitive.points[0];
    if (keyHolding("v")) {
        cameraPosition = new Point(0, 0, 0);
    }
    cameraPosition = cameraPosition.add(velocity);
}

function draw() {
    scale(1, -1, 1);
    // Ajustar perspectiva da câmera baseado no zoom
    let fov = PI / 3;  // Campo de visão inicial
    let camZ = (height / 2.0) / tan(fov / 2.0);
    perspective(PI / 3, width / height, camZ / 10, camZ * 10);
    
    // Aplicar zoom
    scale(zoomLevel);
    if (mouseDrag) {
        cameraRotation.x = cameraDrag.x + 1/180*(mouseY - mousePoint.y);
        cameraRotation.y = cameraDrag.y + 1/180*(mouseX - mousePoint.x);
    }
    cameraMovement();
    pointLight(255, 255, 255, 100, -200, 400);
    ambientLight(60);
    rotateX(cameraRotation.x);
    rotateY(cameraRotation.y);
    strokeWeight(min(1/zoomLevel, 1));
    background(48);
    translate(cameraPosition.x, cameraPosition.y, cameraPosition.z);

    if (config.axis) {
        // Desenho do eixo y:
        beginShape();
        stroke(255,0,0);
        vertex(0,-AXIS_SIZE,0);
        vertex(0,AXIS_SIZE,0);
        endShape();

        // Desenho do eixo x:
        beginShape();
        stroke(0,255,0);
        vertex(-AXIS_SIZE,0, 0);
        vertex(AXIS_SIZE,0, 0);
        endShape();

        // Desenho do eixo z:
        beginShape();
        stroke(0,0,255);
        vertex(0,0,-AXIS_SIZE);
        vertex(0,0,AXIS_SIZE);
        endShape();
    }
    // Objetos da cena
    scene.forEach(o => {
        if (!o.visible) return;
        push();
        o.selected = (selectedModel === o);
        o.draw();
        pop();
    });
}

function mousePressed() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        mouseDrag = true;
        mousePoint.x = mouseX;
        mousePoint.y = mouseY;
        cameraDrag.x = cameraRotation.x;
        cameraDrag.y = cameraRotation.y;
    }
}

function mouseReleased() {
    mouseDrag = false;
}

function mouseWheel(event) {
    // Ajustar nível do zoom
    if (event.delta > 0) {
        zoomLevel -= zoomIncrement;  // Zoom out
    } else {
        zoomLevel += zoomIncrement;  // Zoom in
    }
    // Limitar zoom
    zoomLevel = constrain(zoomLevel, 0.2, 8.0);
    return false;
}

function keyPressed() {
    hold[key] = true;
    if (keyCode === ESCAPE) {
        selectedModel = null;
        selectScene.selected();
    }
}

function keyReleased() {
    hold[key] = false;
}