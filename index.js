var gl, prog, coordTriangle, i4, numElementos;
var teximg = [];
texSrc = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"];
loadedTexturesCount = 0;
var angle = 0;
var df = -6.0;
var rotFreq = 1;

function getGL(canvas) {
	var gl;
	
	gl = canvas.getContext("webgl");
	if (gl) { return gl; }

	gl = canvas.getContext("experimental-webgl");
	if (gl) { return gl; }

	alert("pipipipopopo");
}

function createShader(gl, shaderType, shaderSrc) {
	var shader = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderSrc);
	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { return shader }

	alert(gl.getShaderInfoLog(shader));

	gl.deleteShader(shader);
}

function createProgram(gl, vtxsh, fragsh) {
	var prog = gl.createProgram();
	gl.attachShader(prog, vtxsh);
	gl.attachShader(prog, fragsh);
	gl.linkProgram(prog);

	if (gl.getProgramParameter(prog, gl.LINK_STATUS)) { return prog; }

	alert(gl.getProgramInfoLog(prog));

	gl.deleteProgram(prog);
}

function init() {
	for (var i = 0; i < texSrc.length; i++) {
		teximg[i] = new Image();
		teximg[i].crossOrigin = "anonymous";
		teximg[i].src = texSrc[i];
		teximg[i].onload = function() {
			loadedTexturesCount++;
			loadTextures();
		}
	}

}

function loadTextures() {
	if (loadedTexturesCount == teximg.length) {
		initGL();
		configScene();
		draw();
	}
}

function initGL() {
	var canvas = document.getElementById("glcanvas");
	gl = getGL(canvas);

	if (gl) {
		var vtxshSource = document.getElementById("vertex-shader").text;
		var fragshSource = document.getElementById("fragment-shader").text;

		var vtxsh = createShader(gl, gl.VERTEX_SHADER, vtxshSource);
		var fragsh = createShader(gl, gl.FRAGMENT_SHADER, fragshSource);

		prog = createProgram(gl, vtxsh, fragsh);

		gl.useProgram(prog);

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		
		gl.clearColor(0, 0, 0, 1);
		
		gl.enable(gl.CULL_FACE || gl.DEPTH_TEST || gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}
}

function configScene() {
		i4 = math.identity(4)
		coordTriangle = new Float32Array([
											// FRENTE
											-0.5,  0.5,  0.5,  0.0,  0.0,
											-0.5, -0.5,  0.5,  0.0,  1.0,
											 0.5, -0.5,  0.5,  1.0,  1.0,
											 0.5,  0.5,  0.5,  1.0,  0.0,
											-0.5,  0.5,  0.5,  0.0,  0.0,
											 
											// COSTAS
											 0.5,  0.5, -0.5,  0.0,  0.0,
											 0.5, -0.5, -0.5,  0.0,  1.0,
											-0.5, -0.5, -0.5,  1.0,  1.0,
											-0.5,  0.5, -0.5,  1.0,  0.0,
											 0.5,  0.5, -0.5,  0.0,  0.0,

											// DIREITA
											 0.5,  0.5,  0.5,  0.0,  0.0,
											 0.5, -0.5,  0.5,  0.0,  1.0,
											 0.5, -0.5, -0.5,  1.0,  1.0,
											 0.5,  0.5, -0.5,  1.0,  0.0,
											 0.5,  0.5,  0.5,  0.0,  0.0,

											// ESQUERDA
											-0.5,  0.5, -0.5,  0.0,  0.0,
											-0.5, -0.5, -0.5,  0.0,  1.0,
											-0.5, -0.5,  0.5,  1.0,  1.0,
											-0.5,  0.5,  0.5,  1.0,  0.0,
											-0.5,  0.5, -0.5,  0.0,  0.0,

											// CIMA
											-0.5,  0.5, -0.5,  0.0,  0.0,
											-0.5,  0.5,  0.5,  0.0,  1.0,
											 0.5,  0.5,  0.5,  1.0,  1.0,
											 0.5,  0.5, -0.5,  1.0,  0.0,
											-0.5,  0.5, -0.5,  0.0,  0.0,

											// BAIXO
											-0.5, -0.5,  0.5,  0.0,  0.0,
											-0.5, -0.5, -0.5,  0.0,  1.0,
											 0.5, -0.5, -0.5,  1.0,  1.0,
											 0.5, -0.5,  0.5,  1.0,  0.0,
											-0.5, -0.5,  0.5,  0.0,  0.0,
											 								]);

		numElementos = 5;

		var bufferPtr = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferPtr);
		gl.bufferData(gl.ARRAY_BUFFER, coordTriangle, gl.STATIC_DRAW);

		var positionPtr = gl.getAttribLocation(prog, "position");
		gl.enableVertexAttribArray(positionPtr);
		gl.vertexAttribPointer( 
								positionPtr     , // attribute location
								3               , // number of elements per attribute
								gl.FLOAT        , // type of elements
								gl.FALSE        , // whether or not values are normalized
								numElementos * 4, // size of an individual block of data
								0 * 4             // offset from the beginning of the data to this specific attribute
												);
		
		var texCoordPtr = gl.getAttribLocation(prog, "texCoord");
		gl.enableVertexAttribArray(texCoordPtr);
		gl.vertexAttribPointer(
								texCoordPtr     , // attribute location
								2               , // number of elements per attribute
								gl.FLOAT        , // type of elements
								gl.FALSE        , // whether or not values are normalized
								numElementos * 4, // size of an individual block of data
								3 * 4             // offset from the beginning of the data to this specific attribute
												);

		for (var i = 0; i < texSrc.length; i++) {
			// submit image to gpu
			var tex = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0 + i);
			gl.bindTexture(gl.TEXTURE_2D, tex);
			// setting texture parameters
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[i]);
		}

}

function draw() {
	var dfPtr = gl.getUniformLocation(prog, "df");
	gl.uniform1f(dfPtr, df);
	
	var a = angle * math.PI / 180.0;

	var matrotX = math.matrix([  
								[1,               0,             0,   0],
								[0,     math.cos(a*2),  -math.sin(a*2),   0],
							    [0,     math.sin(a*2),   math.cos(a*2),   0],
						 		[0,               0,             0,   1]
								   										]);
	
	var matrotY = math.matrix([  
								[math.cos(a),    0,   -math.sin(a),   0],
							    [          0,    1,              0,   0],
							    [math.sin(a),    0,    math.cos(a),   0],
							    [          0,    0,              0,   1]
							              								]);
	
	var matrotZ = math.matrix([ 
								[math.cos(a),   -math.sin(a),    0,   0],
							    [math.sin(a),    math.cos(a),    0,   0],
							    [          0,              0,    1,   0],
							    [          0,              0,    0,   1]
							     										]);

	var transfPtr = gl.getUniformLocation(prog, "transf");

	var matTransf = math.multiply(matrotX, math.multiply(matrotY, matrotZ));

	gl.uniformMatrix4fv(transfPtr, gl.FALSE, math.flatten(matTransf).toArray());

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var texPtr = gl.getUniformLocation(prog, "tex");

	for (var i = 0; i < coordTriangle.length; i += numElementos) {
		gl.uniform1i(texPtr, 6);
		// gl.uniform1i(texPtr, math.floor(i / numElementos));
		gl.drawArrays(gl.TRIANGLES, i, 3);
		gl.drawArrays(gl.TRIANGLES, i + 2, 3);
	}

	angle += rotFreq;
	requestAnimationFrame(draw);
}