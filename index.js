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

var gl;

function init() {
	var canvas = document.getElementById("glcanvas");
	gl = getGL(canvas);

	if (gl) {
		var vtxshSource = document.getElementById("vertex-shader").text;
		var fragshSource = document.getElementById("fragment-shader").text;

		var vtxsh = createShader(gl, gl.VERTEX_SHADER, vtxshSource);
		var fragsh = createShader(gl, gl.FRAGMENT_SHADER, fragshSource);

		var prog = createProgram(gl, vtxsh, fragsh);

		gl.useProgram(prog);

		var coordTriangle = new Float32Array([
												-0.5,  0.5,  0.0,  0.0,
												-0.5, -0.5,  1.0,  1.0,
												 0.5, -0.5,  0.0,  1.0,
												 0.5,  0.5,  1.0,  1.0,
												-0.5,  0.5,  1.0,  0.0,
												 									]);

		var bufferPtr = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferPtr);
		gl.bufferData(gl.ARRAY_BUFFER, coordTriangle, gl.STATIC_DRAW);

		var positionPtr = gl.getAttribLocation(prog, "position");
		gl.vertexAttribPointer( 
								positionPtr, // attribute location
								2          , // number of elements per attribute
								gl.FLOAT   , // type of elements
								false      , // whether or not values are normalized
								6 * 4      , // size of an individual block of data
								0 * 4       // offset from the beginning of the data to this specific attribute
											);
		gl.enableVertexAttribArray(positionPtr);
		
		var fcolorPtr = gl.getAttribLocation(prog, "fcolor");
		gl.vertexAttribPointer(fcolorPtr, 4, gl.FLOAT, false, 6 * 4, 2 * 4);
		gl.enableVertexAttribArray(fcolorPtr);

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.drawArrays(gl.TRIANGLES, 2, 3);
	}
}