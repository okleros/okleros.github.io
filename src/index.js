function loadSource(url) {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', url + "?please-do-not-cache" + math.random(), false);
	xhr.send();

	if (xhr.status === 200) {
		return xhr.responseText;
	} else {
		console.error('Error loading shader:', xhr.status);
		return null;
	}
}

function rad(angle) {
	return angle * math.PI / 180.0;
}

function getGL(canvas) {
	var gl;
	
	gl = canvas.getContext("webgl");
	
	if (gl) {
		return gl;
	}

	gl = canvas.getContext("experimental-webgl");
	
	if (gl) {
		return gl;
	}

	alert("pipipipopopo");
}

function createShader(gl, shaderType, shaderSrc) {
	var shader = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderSrc);
	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}

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

function initGL(gl, prog) {
	canvas = document.getElementById("glcanvas");
	gl = getGL(canvas);

	if (gl) {
		var vtxshSource = loadSource("src/vtxsh.glsl");
		var fragshSource = loadSource("src/fragsh.glsl");

		var vtxsh = createShader(gl, gl.VERTEX_SHADER, vtxshSource);
		var fragsh = createShader(gl, gl.FRAGMENT_SHADER, fragshSource);

		prog = createProgram(gl, vtxsh, fragsh);

		gl.useProgram(prog);

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		
		gl.clearColor(.3176470588, .3176470588, .3176470588, 1);
		
		gl.enable(gl.BLEND);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}
}

function createCamera(pos, target, up) {
	var zc = math.subtract(pos, target);
	zc = math.divide(zc, math.norm(zc));

	var yt = math.subtract(up, pos);
	yt = math.divide(yt, math.norm(yt));

	var xc = math.cross(yt, zc);
	xc = math.divide(xc, math.norm(xc));

	var yc = math.cross(zc, xc);
	yc = math.divide(yc, math.norm(yc));

	var mt = math.inv(math.transpose(math.matrix([xc, yc, zc])));
	mt = math.resize(mt, [4, 4], 0);
	mt._data[3][3] = 1.0;

	var mov = math.matrix([
							[1,   0,   0,   -pos[0]],
							[0,   1,   0,   -pos[1]],
							[0,   0,   1,   -pos[2]],
							[0,   0,   0,        1]
													]);

	var cam = math.multiply(mt, mov);

	return cam;
}

function createPerspective(fovy, aspec, near, far) {
	fovy = rad(fovy);

	var fy = 1.0 / math.tan(fovy / 2);
	var fx = fy / aspec;

	var B = -2 * far * near / (far - near);
	var A = -(far + near) / (far - near);

	var proj = math.matrix([
							 [ fx,  0.0,  0.0,  0.0],
							 [0.0,   fy,  0.0,  0.0],
							 [0.0,  0.0,    A,    B],
							 [0.0,  0.0, -1.0,  0.0]
													]);

	return proj;
}

async function oldload3DObject(url) {
	var response = await fetch(url);
	var objData = await response.text();
	var lines = objData.split('\n');

	// vetores de cada tipo lidos na URL
	var vertices = [];
	var normals = [];
	var texCoords = [];
	// vetor auxiliar
	var elements = [];
	// vetor de cada elemento já indexado
	var Fvertices = [];
	var Fnormals = [];
	var FtexCoords = [];
	// vetor com o indice de cada tipo e um indice com todos os indices juntos;
	var FvertexIndex = [];
	var FtextureIndex = [];
	var FnormalIndex = [];
	var Findices = [];

	// for que vai ir de linha em linha checando ela
	for (var i = 0; i < lines.length; i++) {
	  var line = lines[i].trim();
	  elements = line.split(' ');
	  // checa se a linha é uma linha de vertices
	  //  Esse RGB aqui é pq há a possibilidade de ter vertices que podem ter 3 valores a mais que seriam as cores
	  if (elements[0] === 'v') { // Vertices
		var x = parseFloat(elements[1]);
		var y = parseFloat(elements[2]);
		var z = parseFloat(elements[3]);
  
		vertices.push(x, y, z);
	  }
	  // checa se a linha é uma linha de normal
	  else if (elements[0] === 'vn') { // Normal
		var nx = parseFloat(elements[1]);
		var ny = parseFloat(elements[2]);
		var nz = parseFloat(elements[3]);
  
		normals.push(nx, ny, nz);
	  }
	  // checa se a linha é uma linha de textura
	  else if (elements[0] === 'vt') { // textura
			var t1 = parseFloat(elements[1]);
			var t2 = parseFloat(elements[2]);
	  
			texCoords.push(t1, t2);
	  }
	  // checa se a linha é uma linha de face 
	  else if (elements[0] === 'f') { // Faces
			var vertexIndices = [];
			var textureIndices = [];
			var normalIndices = [];
			// for para rodar a linha de face e descobrir e separar cada um dos indices
			for (var j = 1; j < elements.length; j++) {
				var faceElement = elements[j].split('/');
				var vertexIndex = parseInt(faceElement[0] - 1);
				var textureIndex = parseInt(faceElement[1] - 1);
				var normalIndex = parseInt(faceElement[2] - 1);
				
				if (textureIndex < 0) {
					textureIndex = texCoords.length / 2 + textureIndex + 1;
				}
				if (normalIndex < 0) {
					normalIndex = normals.length / 3 + normalIndex + 1;
				}
				
				textureIndices.push(textureIndex);
				normalIndices.push(normalIndex);
				
				Findices.push(vertexIndex,textureIndex,normalIndex)

				FvertexIndex.push(vertexIndex);
				FtextureIndex.push(textureIndex);
				FnormalIndex.push(normalIndex);
			}

			// console.log(textureIndices.length);
			for (var k = 0; k < textureIndices.length; k += 2) {
				var textureIndex = textureIndices[k];
		
				// Acesso às coordenadas de textura
				var texCoord = [
				  texCoords[(textureIndex) * 2],     
				  texCoords[(textureIndex) * 2 + 1]  
				];
				FtexCoords.push(...texCoord);
			}


			for (var k = 0; k < normalIndices.length; k += 1) {
				var normalIndex = normalIndices[k];
		
				// Acesso aos normais
				var normal = [
				  normals[normalIndex * 3],       
				  normals[normalIndex * 3 + 1],    
				  normals[normalIndex * 3 + 2]     
				];
				Fnormals.push(...normal);
			}

	  }
	}
	
	var box = {};


	box.vertices = new Float32Array(vertices);
	box.normals = new Float32Array(Fnormals);
	box.texCoords = new Float32Array(FtexCoords);
  
	return box;
}

async function load3DObject(url) {
	var response = await fetch(url);
	var objData = await response.text();
	var lines = objData.split('\n');
  
	var vertices = [];
	var normals = [];
	var texCoords = [];
  
	for (var i = 0; i < lines.length; i++) {
	  var line = lines[i].trim();
	  var elements = line.split(' ');
  
	  if (elements[0] === 'v') { // Vertices
		var x = parseFloat(elements[1]);
		var y = parseFloat(elements[2]);
		var z = parseFloat(elements[3]);
  
		vertices.push(x, y, z);
	  }
	  else if (elements[0] === 'vn') { // Normal
		var nx = parseFloat(elements[1]);
		var ny = parseFloat(elements[2]);
		var nz = parseFloat(elements[3]);
  
		normals.push(nx, ny, nz);
	  }
	  else if (elements[0] === 'vt') { // Texture
		var t1 = parseFloat(elements[1]);
		var t2 = parseFloat(elements[2]);
  
		texCoords.push(t1, t2);
	  }
	  else if (elements[0] === 'f') { // Faces
		var FtextureIndex = [];
		var FnormalIndex = [];
  
		for (var j = 1; j < elements.length; j++) {
		  var faceElement = elements[j].split('/');
		  var vertexIndex = parseInt(faceElement[0]) - 1;
		  var textureIndex = parseInt(faceElement[1]) - 1;
		  var normalIndex = parseInt(faceElement[2]) - 1;
  
		  if (textureIndex >= 0) {
			FtextureIndex.push(textureIndex);
		  }
  
		  if (normalIndex >= 0) {
			FnormalIndex.push(normalIndex);
		  }
		}
	  }
	}
  
	var box = {
	  indices: new Float32Array(vertices),
	  normals: new Float32Array(normals),
	  texCoords: new Float32Array(texCoords)
	};
  
	return box;
  }
  

function rotateX(a) { return math.matrix([  
								[1,               0,             0,   0],
								[0,     math.cos(a),  -math.sin(a),   0],
								[0,     math.sin(a),   math.cos(a),   0],
								[0,               0,             0,   1]
																			]);}
	
function rotateY(a) { return math.matrix([  
								[math.cos(a),    0,   -math.sin(a),   0],
								[          0,    1,              0,   0],
								[math.sin(a),    0,    math.cos(a),   0],
								[          0,    0,              0,   1]
																					]);}

function rotateZ(a) { return math.matrix([ 
								[math.cos(a),   -math.sin(a),    0,   0],
								[math.sin(a),    math.cos(a),    0,   0],
								[          0,              0,    1,   0],
								[          0,              0,    0,   1]
																		]);}

function rotate(x, y, z) {
	var rot = math.multiply(rotateY(y), rotateZ(z));

	return math.multiply(rotateX(x), rot);
}

function translate(x, y, z) {
	return math.matrix([
											[1, 0, 0, x],
											[0, 1, 0, y],
											[0, 0, 1, z],
											[0, 0, 0, 1]
																	])
}

function scale(x, y, z) {
	return math.matrix([
											[x, 0, 0, 0],
											[0, y, 0, 0],
											[0, 0, z, 0],
											[0, 0, 0, 1]
																	])
}

function draw() {
	var camPos = [0, 0, 3];

	var camPosPtr = gl.getUniformLocation(prog, "u_camPosition");

	gl.uniform3fv(camPosPtr, camPos);

	var camLookAt = [0, 0, 0];
	var camUp = [camPos[0], camPos[1] + 1, camPos[2]];

	var cam = createCamera(camPos, camLookAt, camUp);
	
	var a = rad(angle);

	var mproj = createPerspective(45, canvas.width / canvas.height, 1e-4, 1e4);

	var u_modelMatrix = gl.getUniformLocation(prog, "u_modelMatrix");
	var u_MVPMatrix = gl.getUniformLocation(prog, "u_MVPMatrix");

	var modelMatrix = math.identity(4);
	var viewMatrix = cam;
	var projMatrix = mproj;

	// modelMatrix = math.multiply(modelMatrix, matrotX);
	modelMatrix = math.multiply(modelMatrix, matrotY);
	modelMatrix = math.multiply(modelMatrix, matrotZ);
	gl.uniformMatrix4fv(u_modelMatrix, gl.FALSE, math.flatten(math.transpose(modelMatrix)).toArray());

	var MVPMatrix = math.multiply(viewMatrix, modelMatrix);
	MVPMatrix = math.multiply(mproj, MVPMatrix);

	gl.uniformMatrix4fv(u_MVPMatrix, gl.FALSE, math.flatten(math.transpose(MVPMatrix)).toArray());

	gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
	
	for (var i = 0; i < coordTriangle.length; i += numElementos) {
		// gl.uniform1i(texPtr, math.floor(i / numElementos));
		gl.drawArrays(gl.TRIANGLES, i, 3);
		gl.drawArrays(gl.TRIANGLES, i + 2, 3);
	}
	// lightPosition, lightColor, modelMatrix, viewMatrix, projectionMatrix
	// drawPointLight([1.0, 1.0, 1.0], [2.0, 2.0, 2.0], i4, viewMatrix, projMatrix);

	angle += rotFreq;
	// requestAnimationFrame(draw);
}