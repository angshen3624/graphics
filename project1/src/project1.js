
// Vertex shader program----------------------------------
var VSHADER_SOURCE = 
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE = 
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variables
var ANGLE_STEP = 45.0;		// Rotation angle rate (degrees/second)
var floatsPerVertex = 7;	// # of Float32Array elements used for each vertex
// Global vars for mouse click-and-drag 
var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;   
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;  
// Global vars for animation
var scale = 0.0;
var rotate = 0.0;
// other globals
var help_sts = false;
var g_last = Date.now();
										
function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');
	var help = document.getElementById('help');
  
	// Get the rendering context for background and WebGL
	var ctx = help.getContext('2d');
	if (!ctx) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	var gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}
  
	var n = initVertexBuffer(gl);
	if (n < 0) {
		console.log('Failed to set the vertex information');
		return;
	}
  
	canvas.onmousedown	=	function(ev){myMouseDown( ev, gl, canvas) }; 
	canvas.onmousemove = 	function(ev){myMouseMove( ev, gl, canvas) };													
	canvas.onmouseup = 		function(ev){myMouseUp(   ev, gl, canvas)};
	document.onkeydown = function(ev){myKeyDown (ev)};
	document.onkeyup = function(ev){myKeyUp (ev)};
	
	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.depthFunc(gl.LESS);
	gl.enable(gl.DEPTH_TEST); 	  
	
	// Get handle to graphics system's storage location of u_ModelMatrix
	var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	if (!u_ModelMatrix) { 
		console.log('Failed to get the storage location of u_ModelMatrix');
		return;
	}
 
	// Create a local version of our model matrix in JavaScript 
	var modelMatrix = new Matrix4();
  
	// Create, init current rotation angle value in JavaScript
	var currentAngle = 0.0;
	var currentAngle2 = 0.0;
	var treeColor = 0.2;
  
	// Start drawing: create 'tick' variable whose value is this function:
	var tick = function() {
		// help window
		if (help_sts)
			draw_help(ctx);
		else
			ctx.clearRect(0,0,800,400);
		
	// change color in the buffer
	var treeColor = 0.2 + currentAngle2 / 600;
	var treeSize = 0.3 + currentAngle2 / 1200;
	n = initVertexBuffer(gl, treeColor, treeSize);
    currentAngle = animate(currentAngle);  // Update the rotation angle
	currentAngle2 = animate2(currentAngle2);
    draw(gl, n, currentAngle, currentAngle2, modelMatrix, u_ModelMatrix);   // Draw shapes
	requestAnimationFrame(tick, canvas);   				
	};
	tick();							// start (and continue) animation: draw current image
}

function initVertexBuffer(gl, treeColor, treeSize) {
	makeSphere();						
	makeNose();
	makeCylinder();
	makeSphere_eye();
	makeTree(treeColor, treeSize);
	makeTrunk();
	
	// how many floats total needed to store all shapes?
	var mySiz = sphVerts.length + noseVerts.length + cylVerts.length + sphEyeVerts.length + treeVerts.length + trunkVerts.length;						
	// How many vertices total
	var nn = mySiz / floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
	// Copy all shapes into one big Float32 array:
	var colorShapes = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:
	sphStart = 0;							// we stored the cylinder first.
	for(i=0,j=0; j< sphVerts.length; i++,j++) {
		colorShapes[i] = sphVerts[j];
	}
    noseStart = i;
	for(j=0; j< noseVerts.length; i++,j++) {
		colorShapes[i] = noseVerts[j];
	}
	cylStart = i;
	for(j=0; j< cylVerts.length; i++,j++) {
		colorShapes[i] = cylVerts[j];
	}
	sphEyeStart = i;
	for(j=0; j< sphEyeVerts.length; i++,j++) {
		colorShapes[i] = sphEyeVerts[j];
	}	
	treeStart = i;
	for(j=0; j< treeVerts.length; i++,j++) {
		colorShapes[i] = treeVerts[j];
	}	
	trunkStart = i;
	for(j=0; j< trunkVerts.length; i++,j++) {
		colorShapes[i] = trunkVerts[j];
	}
	
	// Create a buffer object on the graphics hardware:
	var shapeBufferHandle = gl.createBuffer();  
	if (!shapeBufferHandle) {
		console.log('Failed to create the shape buffer object');
		return false;
	}
	
	// Bind the the buffer object to target:
	gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
	gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);
	var FSIZE = colorShapes.BYTES_PER_ELEMENT; 
 
    //Get graphics system's handle for our Vertex Shader's position-input variable: 
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	
	// Use handle to specify how to retrieve **POSITION** data from our VBO:
	gl.vertexAttribPointer(
  		a_Position, 	// choose Vertex Shader attribute to fill with data
  		4, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
  		gl.FLOAT, 		// data type for each value: usually gl.FLOAT
  		false, 				// did we supply fixed-point data AND it needs normalizing?
  		FSIZE * floatsPerVertex, // Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  		0);						// Offset -- now many bytes from START of buffer to the
  									// value we will actually use?
	gl.enableVertexAttribArray(a_Position);  
  							// Enable assignment of vertex buffer object's position data

	// Get graphics system's handle for our Vertex Shader's color-input variable;
	var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	if(a_Color < 0) {
		console.log('Failed to get the storage location of a_Color');
		return -1;
	}
	// Use handle to specify how to retrieve **COLOR** data from our VBO:
	gl.vertexAttribPointer(
		a_Color, 				// choose Vertex Shader attribute to fill with data
		3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
		gl.FLOAT, 			// data type for each value: usually gl.FLOAT
		false, 					// did we supply fixed-point data AND it needs normalizing?
		FSIZE * 7, 			// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
		FSIZE * 4);			// Offset -- how many bytes from START of buffer to the
  									// value we will actually use?  Need to skip over x,y,z,w
  									
	gl.enableVertexAttribArray(a_Color);  // Enable assignment of vertex buffer object's position data
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return nn;
}

function makeCylinder() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
	var ctrColr = new Float32Array([0.5, 0.0, 0.0]);	// dark gray
	var topColr = new Float32Array([0.8, 0.1, 0.1]);	// light green
	var botColr = new Float32Array([0.3, 0.3, 0.3]);	// light blue
	var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
	var botRadius = 1.6;		// radius of bottom of cylinder (top always 1.0)
 
	// Create a (global) array to hold this cylinder's vertices;
	cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] = 1.0; 
			cylVerts[j+3] = 1.0;			// r,g,b = topColr[]
			cylVerts[j+4]=ctrColr[0];
			cylVerts[j+5]=ctrColr[1];
			cylVerts[j+6]=ctrColr[2];
		}
		else { 	
			cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			cylVerts[j+2] = 1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			cylVerts[j+4]=topColr[0]; 
			cylVerts[j+5]=topColr[1]; 
			cylVerts[j+6]=topColr[2];			
		}
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
			cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts[j+2] = 1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			cylVerts[j+4]=topColr[0]; 
			cylVerts[j+5]=topColr[1]; 
			cylVerts[j+6]=topColr[2];			
		}
		else		// position all odd# vertices along the bottom cap:
		{
			cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
			cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
			cylVerts[j+2] =-1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];			
		}
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts[j+2] =-1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] =-1.0; 
			cylVerts[j+3] = 1.0;			// r,g,b = botColr[]
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];
		}
	}
}

function makeNose() {
	var a = 0.2;
	var b = a / Math.sqrt(3.0);
	var c = 1.0;
	noseVerts = new Float32Array([
		-1*a, -1*b, 0.0, 1.0, 0.7, 0.5, 0.5, 
		a, 	  -1*b, 0.0, 1.0, 0.7, 0.5, 0.5,
		0.0,  a,   	0.0, 1.0, 0.7, 0.5, 0.5,  //triangle1
		
		0.0,  0.0,  c,   1.0, 0.9, 0.0, 0.0,
		-1*a, -1*b, 0.0, 1.0, 0.7, 0.5, 0.5,
		a, 	  -1*b, 0.0, 1.0, 0.7, 0.5, 0.5, //triangle2
		
		0.0,  0.0,  c,   1.0, 0.9, 0.0, 0.0,
		-1*a, -1*b, 0.0, 1.0, 0.7, 0.5, 0.5,
		0.0,  a,   	0.0, 1.0, 0.7, 0.5, 0.5, //triangle3
		
		0.0,  0.0,  c,   1.0, 0.9, 0.0, 0.0,
		a, 	  -1*b, 0.0, 1.0, 0.7, 0.5, 0.5,
		0.0,  a,   	0.0, 1.0, 0.7, 0.5, 0.5, //triangle4
	]);

}

function makeSphere() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
  var slices = 30;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([1.0, 1.0, 1.0]);	// North Pole: light gray
  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this sphere's vertices:
  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 
										// each slice requires 2*sliceVerts vertices except 1st and
										// last ones, which require only 2*sliceVerts-1.
										
	// Create dome-shaped top slice of sphere at z=+1
	// s counts slices; v counts vertices; 
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;	
	var j = 0;							// initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s==0) {
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else {					// otherwise, new top edge == old bottom edge
			isFirst = 0;	
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = Math.cos((s+1)*sliceAngle);
		sin1 = Math.sin((s+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s==slices-1) isLast=1;	// skip last vertex of last slice.
		for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
			if(v%2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))  
				sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
				sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
				sphVerts[j+2] = cos0;		
				sphVerts[j+3] = 1.0;			
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				sphVerts[j+2] = cos1;																				// z
				sphVerts[j+3] = 1.0;																				// w.		
			}
			
				sphVerts[j+4]=topColr[0]- s * 0.02; // equColr[0]; 
				sphVerts[j+5]=topColr[1]- s * 0.02; // equColr[1]; 
				sphVerts[j+6]=topColr[2] ; // equColr[2];					
			
		}
	}
}

function makeSphere_eye() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
	var slices = 30;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
	var sliceVerts	= 27;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
	var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this sphere's vertices:
	sphEyeVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 
										// each slice requires 2*sliceVerts vertices except 1st and
										// last ones, which require only 2*sliceVerts-1.
										
	// Create dome-shaped top slice of sphere at z=+1
	// s counts slices; v counts vertices; 
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;	
	var j = 0;							// initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s==0) {
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else {					// otherwise, new top edge == old bottom edge
			isFirst = 0;	
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = Math.cos((s+1)*sliceAngle);
		sin1 = Math.sin((s+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s==slices-1) isLast=1;	// skip last vertex of last slice.
		for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
			if(v%2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))  
				sphEyeVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
				sphEyeVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
				sphEyeVerts[j+2] = cos0;		
				sphEyeVerts[j+3] = 1.0;			
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				sphEyeVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				sphEyeVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				sphEyeVerts[j+2] = cos1;																				// z
				sphEyeVerts[j+3] = 1.0;																				// w.		
			}
			if (s == 0 || s == 1){
				sphEyeVerts[j+4] = 1.0;
				sphEyeVerts[j+5] = 1.0;
				sphEyeVerts[j+6] = 1.0;	
			}	
			else{
				sphEyeVerts[j+4] = 0.0;
				sphEyeVerts[j+5] = 0.0;
				sphEyeVerts[j+6] = 0.0;	
			}
		}
	}
}

function makeTree(treeColor, treeSize){
	treeVerts = new Float32Array([
		-1*treeSize, 0.0,  0.1, 1.0, 0.0, treeColor, 0.0, 
		treeSize , 0.0,  0.1, 1.0, 0.0, treeColor, 0.0,
		0.0,  treeSize,  0.0, 1.0, 0.0, treeColor, 0.0,  //triangle1
		
		-1*treeSize, 0.0, -0.1, 1.0, 0.0, treeColor, 0.0, 
		treeSize , 0.0, -0.1, 1.0, 0.0, treeColor, 0.0,
		0.0,  treeSize,  0.0, 1.0, 0.0, treeColor, 0.0, //triangle2
		
		-1*treeSize, 0.0,  0.1, 1.0, 0.0, 0.5, 0.0, 
		-1*treeSize, 0.0, -0.1, 1.0, 0.0, 0.5, 0.0, 
		0.0,  treeSize,  0.0, 1.0, 0.0, 0.5, 0.0, //triangle3
		
		treeSize, 0.0,  0.1, 1.0, 0.0, 0.5, 0.0, 
		treeSize, 0.0, -0.1, 1.0, 0.0, 0.5, 0.0, 
		0.0,  treeSize,  0.0, 1.0, 0.0, 0.5, 0.0, //triangle4
	]);

	
}

function makeTrunk(){
 var ctrColr = new Float32Array([0.15, 0.10, 0.10]);	// dark gray
 
 var capVerts = 10;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 1.0;		// radius of bottom of cylinder (top always 1.0)
 
 // Create a (global) array to hold this cylinder's vertices;
 trunkVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			trunkVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			trunkVerts[j+1] = 0.0;	
			trunkVerts[j+2] = 1.0; 
			trunkVerts[j+3] = 1.0;			// r,g,b = topColr[]
			trunkVerts[j+4]=ctrColr[0];
			trunkVerts[j+5]=ctrColr[1];
			trunkVerts[j+6]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			trunkVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			trunkVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			trunkVerts[j+2] = 1.0;	// z
			trunkVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			trunkVerts[j+4]=ctrColr[0]; 
			trunkVerts[j+5]=ctrColr[1]; 
			trunkVerts[j+6]=ctrColr[2];			
		}
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
			trunkVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
			trunkVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
			trunkVerts[j+2] = 1.0;	// z
			trunkVerts[j+3] = 1.0;	// w.
			trunkVerts[j+4]=ctrColr[0]; 
			trunkVerts[j+5]=ctrColr[1]; 
			trunkVerts[j+6]=ctrColr[2];			
		}
		else		// position all odd# vertices along the bottom cap:
		{
			trunkVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
			trunkVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
			trunkVerts[j+2] =-1.0;	// z
			trunkVerts[j+3] = 1.0;	// w.
			trunkVerts[j+4]=ctrColr[0]; 
			trunkVerts[j+5]=ctrColr[1]; 
			trunkVerts[j+6]=ctrColr[2];			
		}
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			trunkVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			trunkVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			trunkVerts[j+2] =-1.0;	// z
			trunkVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			trunkVerts[j+4]=ctrColr[0]; 
			trunkVerts[j+5]=ctrColr[1]; 
			trunkVerts[j+6]=ctrColr[2];		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			trunkVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			trunkVerts[j+1] = 0.0;	
			trunkVerts[j+2] =-1.0; 
			trunkVerts[j+3] = 1.0;			// r,g,b = botColr[]
			trunkVerts[j+4]=ctrColr[0]; 
			trunkVerts[j+5]=ctrColr[1]; 
			trunkVerts[j+6]=ctrColr[2];
		}
	}
}

function draw(gl, n, currentAngle, currentAngle2, modelMatrix, u_ModelMatrix) {
//==============================================================================
	// Clear <canvas>  colors AND the depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Draw body1 - Sphere1  
	modelMatrix.setTranslate( 0.0, -0.5, 0.0); 
	pushMatrix(modelMatrix);
	modelMatrix.scale(0.4 + scale, 0.4 + scale, 0.4 + scale);
	//var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
	//modelMatrix.rotate(-1*dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
	modelMatrix.translate(xMdragTot, yMdragTot, 0.0);
	modelMatrix.rotate(180 + rotate + currentAngle / 4.0, 0, 1, 0);  
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
				sphStart/floatsPerVertex,	// start at this vertex number, and 
				sphVerts.length/floatsPerVertex);	// draw this many vertices.
	modelMatrix.scale(2.5, 2.5, 2.5);
	modelMatrix.translate(0.0, 0.45, 0.0); 
  
	// Draw body2 - Sphere2
	pushMatrix(modelMatrix);
	modelMatrix.scale(0.25, 0.25, 0.25);  
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  				sphStart/floatsPerVertex,	// start at this vertex number, and 
  				sphVerts.length/floatsPerVertex);	// draw this many vertices. 
	modelMatrix = popMatrix();
	
	// Draw head - Sphere3
	modelMatrix.translate(0.0, 0.35, 0.0);
	modelMatrix.scale(0.2, 0.2, 0.2); 
	modelMatrix.rotate(currentAngle, 0, 1, 0); 
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  				sphStart/floatsPerVertex,	// start at this vertex number, and 
  				sphVerts.length/floatsPerVertex);	// draw this many vertices. 
	modelMatrix.scale(5, 5, 5); 
  
	// Draw left eye - Sphere4 
	modelMatrix.translate( -0.08, 0.11, 0.12); 
	modelMatrix.scale(0.04, 0.04, 0.04); 
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  				sphEyeStart/floatsPerVertex,	// start at this vertex number, and 
  				sphEyeVerts.length/floatsPerVertex);	// draw this many vertices.
  
	// Draw right eye - Sphere5
    modelMatrix.translate(0.16/0.04, 0, 0); 
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  				sphEyeStart/floatsPerVertex,	// start at this vertex number, and 
  				sphEyeVerts.length/floatsPerVertex);	// draw this many vertices.
	modelMatrix.scale(25, 25 ,25);
	modelMatrix.translate(-0.08, -0.11, 0.08);
  
	// Draw nose 
	modelMatrix.scale(0.15, 0.15, 0.15);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  				noseStart/floatsPerVertex,	// start at this vertex number, and 
  				noseVerts.length/floatsPerVertex);	// draw this many vertices.
	modelMatrix.scale(1.0/0.15, 1.0/0.15, 1.0/0.15);
	modelMatrix.translate(0.0, 0.18, -0.22);
	
	// Draw hat base
	modelMatrix.rotate(-110, 1, 0, 0);
	modelMatrix.translate(0.0, 0.04, -0.02);
	modelMatrix.scale(0.15, 0.15, 0.015);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  				cylStart/floatsPerVertex,	// start at this vertex number, and 
  				cylVerts.length/floatsPerVertex);	// draw this many vertices.
				
	// Draw hat top
	modelMatrix.scale(0.7, 0.7, 7);
	modelMatrix.translate(0.0, 0.0, 0.1/0.7/0.15);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  				cylStart/floatsPerVertex,	// start at this vertex number, and 
  				cylVerts.length/floatsPerVertex);	// draw this many vertices.
	modelMatrix = popMatrix(); // back to (0.0, -0.5, 0.0)
	
	
	// draw trunk
	modelMatrix.setTranslate( 0.5, -0.7, 0.5); 
	modelMatrix.rotate(90, 0, 1, 0);
	modelMatrix.scale(0.2, 0.1, 0.1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				trunkStart/floatsPerVertex,	
  				trunkVerts.length/floatsPerVertex);	
				
	// draw tree
	modelMatrix.setTranslate( 0.5, -0.65, 0.5); 
	modelMatrix.rotate(currentAngle2, 0, 1, 0); 
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	
	modelMatrix.rotate(90, 0, 1, 0);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	
	
	modelMatrix.translate(0.0, 0.27, 0.0);
	modelMatrix.scale(0.7, 0.7, 0.7);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	
	modelMatrix.rotate(90, 0, 1, 0);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	
				
	modelMatrix.translate(0.0, 0.26, 0.0);
	modelMatrix.scale(0.7, 0.7, 0.7);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	
	modelMatrix.rotate(90, 0, 1, 0);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	
 }

function animate(angle) {
//==============================================================================
	// Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_last;
	//g_last = now;

	if(angle >   120.0 && ANGLE_STEP > 0.0) ANGLE_STEP = -ANGLE_STEP;
	if(angle <  -120.0 && ANGLE_STEP < 0.0) ANGLE_STEP = -ANGLE_STEP;
  
	var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
	return newAngle %= 360;
}

function animate2(angle) {
//==============================================================================
  // Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;

	var newAngle = angle + (60 * elapsed) / 1000.0;
	return newAngle %= 360;
}

//===================Mouse and Keyboard event-handling Callbacks
function myMouseDown(ev, gl, canvas) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
	var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
	var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
	var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = true;											// set our mouse-dragging flag
	xMclik = x;													// record where mouse-dragging began
	yMclik = y;
};

function myMouseMove(ev, gl, canvas) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

	if(isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
	var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
	var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
	var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
							 
	//console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
	yMdragTot += (y - yMclik);
	xMclik = x;													// Make next drag-measurement from here.
	yMclik = y;
	
};

function myMouseUp(ev, gl, canvas) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
	var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
	var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
	var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	xMdragTot += (x - xMclik);
	yMdragTot += (y - yMclik);
	//console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
}

function myKeyDown(ev) {
	//console.log('come to mykeydown:');
	if (ev.keyCode == '38')  //up
		scale += 0.02;
		//console.log('up');
	else if (ev.keyCode == '40') //down
		scale -= 0.02;
		//console.log('down');
	else if (ev.keyCode == '37') //down
		rotate += 10;
	else if (ev.keyCode == '39') //down
		rotate -= 10;
	else if (ev.keyCode == '72') //down
		help_sts = true;
	else if (ev.keyCode == '187') //down
		ANGLE_STEP *= 4;
	else if (ev.keyCode == '189') //down
		ANGLE_STEP /= 4;
}

function myKeyUp(ev) {
	//console.log('come to mykeyup:');
	if (ev.keyCode == '72')
		help_sts = false;
}

function draw_help(ctx){
	ctx.clearRect(0, 0, 800, 400);
	//ctx.clearColor(0.0, 0.0, 0.0, 1.0);
	ctx.font='27px Arial';
	ctx.fillStyle='rgba(255,0,0,1)';
	ctx.fillText('Mouth drag: move the snowman', 50, 50);
	ctx.fillText('Keyboard left or right: rotate snowman',50,100);
	ctx.fillText('Keyboard up or down: zoom in or zoom out',50,150);
	ctx.fillText('Keyboard + or - : speed up or slow down',50,200);
}

function spinUp() {
// Called when user presses the 'Spin >>' button on our webpage.
// ?HOW? Look in the HTML file (e.g. ControlMulti.html) to find
// the HTML 'button' element with onclick='spinUp()'.
	ANGLE_STEP *= 4; 
}

function spinDown() {
// Called when user presses the 'Spin <<' button
	ANGLE_STEP /= 4; 
}

function runStop() {
// Called when user presses the 'Run/Stop' button
	if(ANGLE_STEP*ANGLE_STEP > 1) {
		myTmp = ANGLE_STEP;
		ANGLE_STEP = 0;
	}
	else {
		ANGLE_STEP = myTmp;
	}
}	
