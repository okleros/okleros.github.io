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
		angle = 0.0,
		freqRot = 1.0;

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

function setup() {
	canvas = document.getElementById("glcanvas");
	gl = getGL(canvas);

	resizeCanvas();

	window.addEventListener('resize', function() {
		resizeCanvas();
		gl.viewport(0, 0, canvas.width, canvas.height);
		mproj = createPerspective(20, gl.canvas.width / gl.canvas.height, 0.1, 1e4);
	});

	if (gl) {
		const vtxshSource = loadSource("src/vtxsh.glsl");
		const fragshSource = loadSource("src/fragsh.glsl");

		const vtxsh = createShader(gl, gl.VERTEX_SHADER, vtxshSource);
		const fragsh = createShader(gl, gl.FRAGMENT_SHADER, fragshSource);

		prog = createProgram(gl, vtxsh, fragsh);

		gl.useProgram(prog);

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		
		gl.clearColor(0.8705883, 0.3647059, 0.5137255, 1);
		
		gl.enable(gl.BLEND);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
		configScene();
		
	} else {
		console.error("Error loading WebGL context");
	
	}
	

}

function configCam() {
	camPos = [10.0, 10.0, 10.0];
	camLookAt = [0.0, 2.0, 0.0];
	camUp = [camPos[0], camPos[1] + 1, camPos[2]];

	camera = createCamera(camPos, camLookAt, camUp);
}

async function configScene() {
	configCam();

	lightPos = camPos;

	ambient = {
		color: [1.0, 1.0, 1.0]
	};

	diffuse = {
		color: [1.0, 1.0, 1.0],
		direction: [0.0, 0.0, -1.0]
	};

	specular = {
		color: [0.6549019608, 0.7803921569, 0.9058823529],
		position: lightPos,
		shininess: 100
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
	
	boxGeometry = await load3DObject("/models/Lowpoly_tree_sample.obj");

	console.log(boxGeometry);

	initTexture();
	loop();
}

function draw3DObject(object) {
  // Bind normals buffer
  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.normals), gl.STATIC_DRAW);

  // Bind texture coordinates buffer
  var texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.texCoords), gl.STATIC_DRAW);

  // Bind vertex buffer
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);

  // Bind index buffer
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.indices), gl.STATIC_DRAW);

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

	camera = createCamera(camPos, camLookAt, camUp);

	var coordTriangle = new Float32Array([
											 0.0,  1.0,  1.0,
											-0.5, -1.0,  1.0,
											 0.5, -1.0,  1.0
																])

	var indices = new Uint16Array([
									 0, 1, 2
												])

/*	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, coordTriangle, gl.STATIC_DRAW);

	// Bind index buffer
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	const a_position = gl.getAttribLocation(prog, "a_position");
	gl.enableVertexAttribArray(a_position);
	gl.vertexAttribPointer(a_position, 3, gl.FLOAT, gl.FALSE, 0, 0);

	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
*/
	var matrotY = rotateY(rad(angle));

	var u_invTranspModelMatrix = gl.getUniformLocation(prog, "u_invTranspModelMatrix");
	var u_MVPMatrix = gl.getUniformLocation(prog, "u_MVPMatrix");
	
	var modelMatrix = math.identity(4);
	modelMatrix = math.multiply(modelMatrix, matrotY);
	
	gl.uniformMatrix4fv(u_invTranspModelMatrix, gl.FALSE, math.flatten((math.inv(modelMatrix))).toArray());

	var MVPMatrix = math.multiply(camera, modelMatrix);
	MVPMatrix = math.multiply(mproj, MVPMatrix);

	gl.uniformMatrix4fv(u_MVPMatrix, gl.FALSE, math.flatten(math.transpose(MVPMatrix)).toArray());

	draw3DObject(boxGeometry);

	angle += freqRot;

	requestAnimationFrame(loop);
}