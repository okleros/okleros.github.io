var 
		gl,
		prog,
		camera,
		camPos,
		camUp,
		camLookAt,
		canvas,
		ambient,
		diffuse,
		specular,
		lightPos,
		boxGeometry,
		mproj,
		stackPos = 1,
		affectedByPhysics,
		currentDir = "z";
		stack = [],
		angle = 0.0,
		freqRot = 1.0,
		n = 25;

stack.push([[ 0.0, 1.20,  0.0], [1.0, 1.0, 1.0], stackPos]);
stack.push([[ 0.0, 1.50, -3.0], [1.0, 1.0, 1.0], stackPos]);

const loadImage = path => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous' // to avoid CORS if used with Canvas
    img.src = path
    img.onload = () => {
      resolve(img)
    }
    img.onerror = e => {
      reject(e)
    }
  })
}

window.addEventListener('keydown', function(event) {
  // ...
  if (event.key === ' ' && freqRot != 0) {
  	// affectedByPhysics = true;

  	// freqRot = 0;
  	camPos[1] += 0.29;
  	camLookAt[1] += 0.29;
  	camUp[1] += 0.29;

  	const topp = stack[stack.length - 1]

  	stackPos++;

  	if (currentDir === "z") {
  		stack.push([[-3.0, topp[0][1] + 0.3,  0.0], [topp[1][0], topp[1][1], topp[1][2] * 0.9], stackPos]);
  		currentDir = "x";

  	} else if (currentDir === "x") {
  		stack.push([[ 0.0, topp[0][1] + 0.3, -3.0], [topp[1][0] * 0.9, topp[1][1], topp[1][2]], stackPos]);
  		currentDir = "z";

  	}


  	stack = stack.slice(-8);

  	configCam();
  } else if (event.key === ' ' &&freqRot == 0) { freqRot = 1; affectedByPhysics = false;}
});

function resizeCanvas() {
  const canvas = document.getElementById('glcanvas');
  
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	
	mproj = createPerspective(20, gl.canvas.width / gl.canvas.height, 0.1, 1e4);

	const u_viewportDimensions = gl.getUniformLocation(prog, "u_viewportDimensions");
	gl.uniform2f(u_viewportDimensions, width, height);
}

function setup() {
	affectedByPhysics = false;

	canvas = document.getElementById("glcanvas");
	gl = getGL(canvas);

	if (gl) {
		const vtxshSource = loadSource("src/vtxsh.glsl");
		const fragshSource = loadSource("src/fragsh.glsl");

		const vtxsh = createShader(gl, gl.VERTEX_SHADER, vtxshSource);
		const fragsh = createShader(gl, gl.FRAGMENT_SHADER, fragshSource);

		prog = createProgram(gl, vtxsh, fragsh);

		gl.useProgram(prog);

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		
		gl.clearColor(0.8705883, 0.3647059, 0.5137255, 1.0);
		
		gl.enable(gl.BLEND);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
		configScene();
		
	} else {
		console.error("Error loading WebGL context");
	
	}
	

}

function resetCam() {
	camPos = [7.0, 6.0, 8.0];
	camLookAt = [0.0, 2.0, 0.0];
	camUp = [camPos[0], camPos[1] + 1, camPos[2]];

	configCam();
}

function configCam() {
	camera = createCamera(camPos, camLookAt, camUp);
}

async function configScene() {
	// resizeCanvas();
	resetCam();

	lightPos = [0.0, 0.0, 0.0];

	ambient = {
		color: [1.0, 1.0, 1.0]
	};

	diffuse = {
		color: [1.0, 1.0, 1.0],
		direction: [-1.0, 0.0, -1.0]
	};

	specular = {
		color: [1.0, 1.0, 1.0] /*[0.6549019608, 0.7803921569, 0.9058823529]*/ /*[0.0, 1.0, 1.0]*/,
		position: lightPos,
		shininess: 50
	};

	mproj = createPerspective(20, gl.canvas.width / gl.canvas.height, 0.1, 1e4);

	const u_ambientColor = gl.getUniformLocation(prog, "u_ambientColor");
	gl.uniform3fv(u_ambientColor, ambient.color);

	const u_diffuseColor = gl.getUniformLocation(prog, "u_diffuseColor");
	gl.uniform3fv(u_diffuseColor, diffuse.color);	

	const u_specularColor = gl.getUniformLocation(prog, "u_specularColor");
	gl.uniform3fv(u_specularColor, specular.color);
	
	const u_lightPosition = gl.getUniformLocation(prog, "u_lightPosition");
	gl.uniform3fv(u_lightPosition, specular.position);
	
	const u_lightDirection = gl.getUniformLocation(prog, "u_lightDirection");
	gl.uniform3fv(u_lightDirection, diffuse.direction);
	
	const u_shininess = gl.getUniformLocation(prog, "u_shininess");
	gl.uniform1f(u_shininess, specular.shininess);
	
	boxGeometry = await load3DObject("/models/shaded_box.obj");

	initTexture();
	loop();
}

function draw3DObject(object, info) {
	const u_stackPos = gl.getUniformLocation(prog, "u_stackPos");
	gl.uniform1f(u_stackPos, info[2] / 50.0);

	const u_lightPosition = gl.getUniformLocation(prog, "u_lightPosition");
	gl.uniform3fv(u_lightPosition, specular.position);

	const u_invTranspModelMatrix = gl.getUniformLocation(prog, "u_invTranspModelMatrix");
	const u_MVPMatrix = gl.getUniformLocation(prog, "u_MVPMatrix");
	
	const pos = info[0];
	const scalef = info[1];

	const translation = translate(pos[0], pos[1], pos[2]);
	const scaling = scale(scalef[0], scalef[1], scalef[2]);

	const modelMatrix = math.multiply(translation, scaling);
	
	// Aqui só enviamos invertida pois o OpenGL já interpreta como transposta
	gl.uniformMatrix4fv(u_invTranspModelMatrix, gl.FALSE, math.flatten(math.inv(modelMatrix)).toArray());

	var MVPMatrix = math.multiply(mproj, camera, modelMatrix);

	gl.uniformMatrix4fv(u_MVPMatrix, gl.FALSE, math.flatten(math.transpose(MVPMatrix)).toArray());
	// Bind normals buffer
	var normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, object.normals, gl.STATIC_DRAW);

	// Bind texture coordinates buffer
	var texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, object.texCoords, gl.STATIC_DRAW);

	// Bind vertex buffer
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, object.vertices, gl.STATIC_DRAW);

	// Bind index buffer
	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, object.indices, gl.STATIC_DRAW);

	var a_position = gl.getAttribLocation(prog, "a_position");
	gl.enableVertexAttribArray(a_position);
	gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

	var a_texCoord = gl.getAttribLocation(prog, "a_texCoord");
	gl.enableVertexAttribArray(a_texCoord);
	gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, 0, 0);

	var a_normal = gl.getAttribLocation(prog, "a_normal");
	gl.enableVertexAttribArray(a_normal);
	gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0);

	gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);

	gl.deleteBuffer(normalBuffer);
	gl.deleteBuffer(indexBuffer);
	gl.deleteBuffer(vertexBuffer);
	gl.deleteBuffer(texCoordBuffer);
}


async function initTexture() {
	try {
		var texture = await loadImage("res/7.jpg");
	
	} catch(e) {
		console.error(e);
		return;
	}
	
	const tex = gl.createTexture();

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
	
	const texPtr = gl.getUniformLocation(prog, "u_tex");
	gl.uniform1i(texPtr, 0);
}

function loop() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var top = stack[stack.length - 1];

	if (currentDir === "z") {
		top[0][2] += freqRot / 10;

		if (math.abs(top[0][2]) >= 3.1) {
			freqRot *= -1;
		}
	
	} else if (currentDir === "x") {
		top[0][0] += freqRot / 10;

		if (math.abs(top[0][0]) >= 3.1) {
			freqRot *= -1;
		}
	}
	
	specular.position = [top[0][0], top[0][1] + 1.0, top[0][2]];

	for (var i = 0; i < stack.length; i++) {
		draw3DObject(boxGeometry, stack[i]);

	}

	configCam();

	requestAnimationFrame(loop);
}
