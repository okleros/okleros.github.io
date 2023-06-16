var gl, prog;
var teximg = [];
texSrc = ["kleros.jpg", "cube.jpg"];
loadedTexturesCount = 0;
var angle = 0;

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
		
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}
}

function configScene() {
		var coordTriangle = new Float32Array([
												-0.5,  0.5,  0.0,  0.0,
												-0.5, -0.5,  0.0,  1.0,
												 0.5, -0.5,  1.0,  1.0,
												 0.5,  0.5,  1.0,  0.0,
												-0.5,  0.5,  0.0,  0.0,
												 						]);

		var bufferPtr = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferPtr);
		gl.bufferData(gl.ARRAY_BUFFER, coordTriangle, gl.STATIC_DRAW);

		var positionPtr = gl.getAttribLocation(prog, "position");
		gl.vertexAttribPointer( 
								positionPtr, // attribute location
								2          , // number of elements per attribute
								gl.FLOAT   , // type of elements
								gl.FALSE      , // whether or not values are normalized
								4 * 4      , // size of an individual block of data
								0 * 4       // offset from the beginning of the data to this specific attribute
											);
		gl.enableVertexAttribArray(positionPtr);
		
		var texCoordPtr = gl.getAttribLocation(prog, "texCoord");
		gl.enableVertexAttribArray(texCoordPtr);
		gl.vertexAttribPointer(texCoordPtr, 2, gl.FLOAT, gl.FALSE, 4 * 4, 2 * 4);

		// submit image to gpu
		var tex0 = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, tex0);
		// setting texture parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[0]);

		// submit image to gpu
		var tex1 = gl.createTexture();
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, tex1);
		// setting texture parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[1]);

}

function draw() {
	var a = angle * (math.PI / 180);

	var matrotX = math.matrix([  
								[1,               0,             0,   0],
								[0,     math.cos(a),  -math.sin(a),   0],
							    [0,     math.sin(a),   math.cos(a),   0],
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
	//console.log(matTransf);

	gl.uniformMatrix4fv(transfPtr, gl.FALSE, math.flatten(matTransf).toArray());

	gl.clear(gl.COLOR_BUFFER_BIT);
	
	var texPtr = gl.getUniformLocation(prog, "tex");
	
	gl.uniform1i(texPtr, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	gl.uniform1i(texPtr, 1);
	gl.drawArrays(gl.TRIANGLES, 2, 3);

	angle += 1;
	requestAnimationFrame(draw);
}