 var VSHADER_SOURCE =
  'attribute vec4 a_Position; \n' +		
  'attribute vec4 a_Normal; \n' +	
  'attribute vec4 a_Color;\n' +		
  'uniform vec3 u_Kd; \n' +			
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_ModelMatrix; \n' + 	
  'uniform mat4 u_NormalMatrix; \n' +  	
  'varying vec3 v_Kd; \n' +						
  'varying vec4 v_Position; \n' +				
  'varying vec3 v_Normal; \n' +					
  'varying vec4 v_Color;\n' +
  'void main() { \n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_Position = u_ModelMatrix * a_Position; \n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' + 
  '	 v_Kd = u_Kd; \n' +		
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  
  'uniform vec4 u_Lamp0Pos;\n' + 			
  'uniform vec3 u_Lamp0Amb;\n' +   		
  'uniform vec3 u_Lamp0Diff;\n' +     
  'uniform vec3 u_Lamp0Spec;\n' +
  'uniform vec4 u_Lamp1Pos;\n' + 			
  'uniform vec3 u_Lamp1Amb;\n' +   		
  'uniform vec3 u_Lamp1Diff;\n' +     
  'uniform vec3 u_Lamp1Spec;\n' +  
  'uniform vec3 u_Ke;\n' +							
  'uniform vec3 u_Ka;\n' +						
  'uniform vec3 u_Ks;\n' +		 	
  //'uniform vec3 u_Kshiny;\n' +
  'uniform vec4 u_eyePosWorld; \n' + 		
  'varying vec3 v_Normal;\n' +				
  'varying vec4 v_Position;\n' +
  'varying vec4 v_Color;\n' +			
  'varying vec3 v_Kd;	\n' +						
  'void main() { \n' +
	'  vec3 normal = normalize(v_Normal); \n' +
	'  vec3 lightDirection = normalize(u_Lamp0Pos.xyz - v_Position.xyz);\n' +
	'  vec3 lightDirection1 = normalize(u_Lamp1Pos.xyz - v_Position.xyz);\n' +
	'  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
	'  float nDotL1 = max(dot(lightDirection1, normal), 0.0); \n' +
    '  vec3 eyeDirection = normalize(u_eyePosWorld.xyz - v_Position.xyz); \n' +
	'  vec3 H = normalize(lightDirection + eyeDirection); \n' +
	'  vec3 H1 = normalize(lightDirection1 + eyeDirection); \n' +
	'  float nDotH = max(dot(H, normal), 0.0); \n' +
	'  float nDotH1 = max(dot(H1, normal), 0.0); \n' +
	'  float e02 = nDotH*nDotH; \n' +
	'  float e04 = e02*e02; \n' +
	'  float e08 = e04*e04; \n' +
	'  float e16 = e08*e08; \n' +
	'  float e32 = e16*e16; \n' +
	'  float e64 = e32*e32;	\n' +
	'  float e021 = nDotH1*nDotH1; \n' +
	'  float e041 = e021*e021; \n' +
	'  float e081 = e041*e041; \n' +
	'  float e161 = e081*e081; \n' +
	'  float e321 = e161*e161; \n' +
	'  float e641 = e321*e321;	\n' +
    '  vec3 emissive = u_Ke;' +
    '  vec3 ambient = u_Lamp0Amb * u_Ka;\n' +
    '  vec3 diffuse = u_Lamp0Diff * v_Kd * nDotL;\n' +
    '  vec3 speculr = u_Lamp0Spec * u_Ks * e64 * e64;\n' +
	'  vec3 ambient1 = u_Lamp1Amb * u_Ka;\n' +
	'  vec3 diffuse1 = u_Lamp1Diff * v_Kd * nDotL1;\n' +
    '  vec3 speculr1 = u_Lamp1Spec * u_Ks * e641 * e641;\n' +
    '  gl_FragColor = vec4(emissive + ambient + ambient1 + diffuse + diffuse1 + speculr + speculr1, 1.0) * v_Color;\n' +
  '}\n';
 
// Global Variables
var ANGLE_STEP = 45.0;		// Rotation angle rate (degrees/second)
var floatsPerVertex = 10;	// # of Float32Array elements used for each vertex
// Global vars for mouse click-and-drag 
var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;   
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;  
// Global vars for animation
var scale = 0.0;
//var rotate = 0.0;
// other globals
var help_sts = false;
var g_last = Date.now();
var g_EyeX = 0.20, g_EyeY = 0.5, g_EyeZ = 4.25, g_LookY = -0.25;
var theta = -90.0;
 // quaternion
var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)
var quatMatrix = new Matrix4();				// rotation matrix, made from latest qTot
//light0
var light0_sts = 1;
var ambient0_sts = 1;
var diffuse0_sts = 1;
var specular0_sts = 1;
var light0_ambient = 0.4;
var light0_diffuse = 1.0;
var light0_specular = 1.0;
var light0_ambient_temp;
var	light0_diffuse_temp;
var light0_specular_temp;
var ambient0_temp;
var diffuse0_temp;
var specular0_temp;


// light1
var light1_sts = 1;
var ambient1_sts = 1;
var diffuse1_sts = 1;
var specular1_sts = 1;
var light1_ambient = 0.4;
var light1_diffuse = 1.0;
var light1_specular = 1.0;
var light1_ambient_temp;
var	light1_diffuse_temp;
var light1_specular_temp;
var ambient1_temp;
var diffuse1_temp;
var specular1_temp;
var light1_X = 6.0;
var light1_Y = 6.0;
var light1_Z = 0.0;

function main() {
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	var help = document.getElementById('help');
  
	// Get the rendering context for background and WebGL
	ctx = help.getContext('2d');
	if (!ctx) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	
	gl = getWebGLContext(canvas);
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
  
	canvas.onmousedown	= function(ev){myMouseDown(ev, gl, canvas) }; 
	canvas.onmousemove = function(ev){myMouseMove(ev, gl, canvas) };													
	canvas.onmouseup = function(ev){myMouseUp(ev, gl, canvas)};
	
	document.onkeyup = function(ev){myKeyUp (ev)};
	
	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.depthFunc(gl.LESS);
	gl.enable(gl.DEPTH_TEST); 	  
	
	// Get handle to graphics system's storage location of u_ModelMatrix
	u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	u_ViewMatrix  = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	u_ProjMatrix  = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    u_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
    
	if (!u_ModelMatrix || !u_ViewMatrix || !u_ProjMatrix) { 
		console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix');
		return;
	}
	
   u_Lamp0Pos  = gl.getUniformLocation(gl.program, 	'u_Lamp0Pos');
   u_Lamp0Amb  = gl.getUniformLocation(gl.program, 	'u_Lamp0Amb');
   u_Lamp0Diff = gl.getUniformLocation(gl.program, 	'u_Lamp0Diff');
   u_Lamp0Spec	= gl.getUniformLocation(gl.program,	'u_Lamp0Spec');
   u_Lamp1Pos  = gl.getUniformLocation(gl.program, 	'u_Lamp1Pos');
   u_Lamp1Amb  = gl.getUniformLocation(gl.program, 	'u_Lamp1Amb');
   u_Lamp1Diff = gl.getUniformLocation(gl.program, 	'u_Lamp1Diff');
   u_Lamp1Spec	= gl.getUniformLocation(gl.program,	'u_Lamp1Spec');
   if( !u_Lamp0Pos || !u_Lamp0Amb) {//|| !u_Lamp0Diff	) { // || !u_Lamp0Spec	) {
      console.log('Failed to get the Lamp0 storage locations');
      return;
   }
	// ... for Phong material/reflectance:
	 u_Ke = gl.getUniformLocation(gl.program, 'u_Ke');
	 u_Ka = gl.getUniformLocation(gl.program, 'u_Ka');
	 u_Kd = gl.getUniformLocation(gl.program, 'u_Kd');
	 u_Ks = gl.getUniformLocation(gl.program, 'u_Ks');
//	var u_Kshiny = gl.getUniformLocation(gl.program, 'u_Kshiny');
	
	if(!u_Ke || !u_Ka || !u_Kd) {
		console.log('Failed to get the Phong Reflectance storage locations');
		return;
	}

	// Position the first light source in World coords: 
	//gl.uniform4f(u_Lamp0Pos, 6.0, 6.0, 0.0, 1.0);
	
	// Set the Phong materials' reflectance:
	gl.uniform3f(u_Ke, 0.0, 0.0, 0.0);				// Ke emissive
	//gl.uniform3f(u_Ka, 0.3, 0.3, 0.3);				// Ka ambient
    //gl.uniform3f(u_Kd, 1, 1, 1);				// Kd	diffuse
	//gl.uniform3f(u_Ks, 0.8, 0.8, 0.8);				// Ks specular
//	gl.uniform1i(u_Kshiny, 4);							// Kshiny shinyness exponent
	
 
 
	// Create a local version of our model matrix in JavaScript 
	modelMatrix = new Matrix4();
	viewMatrix = new Matrix4();  // The view matrix
	projMatrix = new Matrix4();  // The projection matrix
	normalMatrix = new Matrix4();
	document.onkeydown = function(ev){myKeyDown(ev, gl, u_ViewMatrix, viewMatrix)};
	
	
	// Create, init current rotation angle value in JavaScript
	currentAngle = 0.0;
	currentAngle2 = 0.0;
	treeColor = 0.2;
  
    // Start drawing: create 'tick' variable whose value is this function:
	var tick = function() {
		// help window
		if (help_sts)
			draw_help(ctx);
		else
			ctx.clearRect(0,0,800,400);
		
	// change color in the buffer
	var treeColor = 0.2 + currentAngle2 / 600;
	var treeSize = 0.5 //+ currentAngle2 / 1200;
	n = initVertexBuffer(gl, treeColor, treeSize);
    currentAngle = animate(currentAngle);  // Update the rotation angle
	currentAngle2 = animate2(currentAngle2);
    draw(gl, canvas, currentAngle, currentAngle2, modelMatrix, u_ModelMatrix, viewMatrix, u_ViewMatrix, projMatrix, u_ProjMatrix);   // Draw shapes
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
	makeGroundGrid();
	makeAxis();
	makeObj();
	makeObj2();
	
	// how many floats total needed to store all shapes?
	var mySiz = sphVerts.length + noseVerts.length + cylVerts.length 
				+ sphEyeVerts.length + treeVerts.length + trunkVerts.length 
				+ gndVerts.length + axisVerts.length + objkVerts.length
				+ obj2Verts.length;						
	
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
	
	gndStart = i;
	for(j=0; j< gndVerts.length; i++, j++) {
		colorShapes[i] = gndVerts[j];
	}
	
	axisStart = i;
	for(j=0; j< axisVerts.length; i++, j++) {
		colorShapes[i] = axisVerts[j];
	}
	
	objkStart = i;
	for(j=0; j< objkVerts.length; i++, j++) {
		colorShapes[i] = objkVerts[j];
	}
	
	obj2Start = i;
	for(j=0; j< obj2Verts.length; i++, j++) {
		colorShapes[i] = obj2Verts[j];
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
		FSIZE * floatsPerVertex, 			// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
		FSIZE * 4);			// Offset -- how many bytes from START of buffer to the
  									// value we will actually use?  Need to skip over x,y,z,w
  									
	gl.enableVertexAttribArray(a_Color);  // Enable assignment of vertex buffer object's position data
	//gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
	if(a_Normal < 0) {
		console.log('Failed to get the storage location of a_Normal');
		return -1;
	}
	// Use handle to specify how to retrieve **COLOR** data from our VBO:
	gl.vertexAttribPointer(
		a_Normal, 				// choose Vertex Shader attribute to fill with data
		3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
		gl.FLOAT, 			// data type for each value: usually gl.FLOAT
		false, 					// did we supply fixed-point data AND it needs normalizing?
		FSIZE * floatsPerVertex, 			// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
		FSIZE * 7);			// Offset -- how many bytes from START of buffer to the
  									// value we will actually use?  Need to skip over x,y,z,w
  									
	gl.enableVertexAttribArray(a_Normal);  // Enable assignment of vertex buffer object's position data
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return nn;
}

function makeAxis(){
	axisVerts = new Float32Array([
  
     	// Drawing Axes: Draw them using gl.LINES drawing primitive;
     	// +x axis RED; +y axis GREEN; +z axis BLUE; origin: GRAY
		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	1, 1, 1,// X axis line (origin: gray)
		 1.3,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3,	1, 1, 1,// 						 (endpoint: red)
		
		 0.0,  0.0,  0.0, 1.0,    0.3,  0.3,  0.3,		1, 1, 1,// Y axis line (origin: white)
		 0.0,  1.3,  0.0, 1.0,		0.3,  1.0,  0.3,	1, 1, 1,//						 (endpoint: green)

		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	1, 1, 1,// Z axis line (origin:white)
		 0.0,  0.0,  1.3, 1.0,		0.3,  0.3,  1.0,	1, 1, 1,//						 (endpoint: blue)
  ]);
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
			cylVerts[j+7]=cylVerts[j];
			cylVerts[j+8]=cylVerts[j+1];
			cylVerts[j+9]=cylVerts[j+2];
			
		}
		else { 	
			cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			cylVerts[j+2] = 1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			cylVerts[j+4]=topColr[0]; 
			cylVerts[j+5]=topColr[1]; 
			cylVerts[j+6]=topColr[2];
			cylVerts[j+7]=cylVerts[j];
			cylVerts[j+8]=cylVerts[j+1];
			cylVerts[j+9]=cylVerts[j+2];			
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
		cylVerts[j+7]=cylVerts[j];
		cylVerts[j+8]=cylVerts[j+1];
		cylVerts[j+9]=cylVerts[j+2];
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
		cylVerts[j+7]=cylVerts[j];
		cylVerts[j+8]=cylVerts[j+1];
		cylVerts[j+9]=cylVerts[j+2];
	}
}

function makeNose() {
	var a = 0.2;
	var b = 0.1;//a / Math.sqrt(3.0);
	var c = 1.0;
	noseVerts = new Float32Array([
		-1*a, -1*b, 0.0, 1.0, 0.7, 0.5, 0.5, 0,0.5,0.5,
		a, 	  -1*b, 0.0, 1.0, 0.7, 0.5, 0.5, 0,0.5,0.5,
		0.0,  a,   	0.0, 1.0, 0.7, 0.5, 0.5,  0,0.5,0.5, //triangle1
		
		0.0,  0.0,  c,   1.0, 0.9, 0.0, 0.0, 0,0.5,0.5,
		-1*a, -1*b, 0.0, 1.0, 0.7, 0.5, 0.5, 0,0.5,0.5,
		a, 	  -1*b, 0.0, 1.0, 0.7, 0.5, 0.5,  0,0.5,0.5,//triangle2
		
		0.0,  0.0,  c,   1.0, 0.9, 0.0, 0.0, 0,0.5,0.5,
		-1*a, -1*b, 0.0, 1.0, 0.7, 0.5, 0.5, 0,0.5,0.5,
		0.0,  a,   	0.0, 1.0, 0.7, 0.5, 0.5,  0,0.5,0.5,//triangle3
		
		0.0,  0.0,  c,   1.0, 0.9, 0.0, 0.0, 0,0.5,0.5,
		a, 	  -1*b, 0.0, 1.0, 0.7, 0.5, 0.5, 0,0.5,0.5,
		0.0,  a,   	0.0, 1.0, 0.7, 0.5, 0.5,  0,0.5,0.5,//triangle4
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
				sphVerts[j+7]=sphVerts[j];
				sphVerts[j+8]=sphVerts[j+1];
				sphVerts[j+9]=sphVerts[j+2];
			
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
			sphVerts[j+7]=sphVerts[j];
			sphVerts[j+8]=sphVerts[j+1];
			sphVerts[j+9]=sphVerts[j+2];
		}
	}
}

function makeTree(treeColor, treeSize){
	treeVerts = new Float32Array([
		-1*treeSize, 0.0,  0.1, 1.0, 	0.0, treeColor, 0.0,  0,0.1,0.5,
		treeSize , 0.0,  0.1, 1.0, 		0.0, treeColor, 0.0,  0,0.1,0.5,
		0.0,  treeSize,  0.0, 1.0, 		0.0, treeColor, 0.0,  0,0.1,0.5,//triangle1
		
		-1*treeSize, 0.0, -0.1, 1.0, 	0.0, treeColor, 0.0,  0,-0.1,0.5,
		treeSize , 0.0, -0.1, 1.0, 		0.0, treeColor, 0.0,  0,-0.1,0.5,
		0.0,  treeSize,  0.0, 1.0, 		0.0, treeColor, 0.0,  0,-0.1,0.5,//triangle2
		
		-1*treeSize, 0.0,  0.1, 1.0,	0.0, 0.5, 0.0,  -0.1, 0.1, 0,
		-1*treeSize, 0.0, -0.1, 1.0, 	0.0, 0.5, 0.0,  -0.1, 0.1, 0,
		0.0,  treeSize,  0.0, 1.0, 		0.0, 0.5, 0.0,  -0.1, 0.1, 0,//triangle3
		
		treeSize, 0.0,  0.1, 1.0, 		0.0, 0.5, 0.0,  0.1, 0.1, 0,
		treeSize, 0.0, -0.1, 1.0, 		0.0, 0.5, 0.0,  0.1, 0.1, 0,
		0.0,  treeSize,  0.0, 1.0, 		0.0, 0.5, 0.0,  0.1, 0.1, 0,//triangle4
	]);

	
}

function makeObj(){
 var ctrColr = new Float32Array([0.3, 0.20, 0.60]);	// dark gray
 var otherColr = new Float32Array([0.1, 0.30, 0.10]);
 var other2Colr = new Float32Array([0.6, 0.10, 0.0]);
 var capVerts = 20;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 1.0;		// radius of bottom of cylinder (top always 1.0)
 
 // Create a (global) array to hold this cylinder's vertices;
 objkVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			objkVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			objkVerts[j+1] = 0.0;	
			objkVerts[j+2] = 1.0; 
			objkVerts[j+3] = 1.0;			// r,g,b = topColr[]
			objkVerts[j+4]=ctrColr[0];
			objkVerts[j+5]=ctrColr[1];
			objkVerts[j+6]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			objkVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			objkVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			objkVerts[j+2] = 1.0;	// z
			objkVerts[j+3] = 1.0;	// w.
			objkVerts[j+4]=ctrColr[0]; 
			objkVerts[j+5]=ctrColr[1]; 
			objkVerts[j+6]=ctrColr[2];			
		}
		objkVerts[j+7]=objkVerts[j];
		objkVerts[j+8]=objkVerts[j+1];
		objkVerts[j+9]=objkVerts[j+2];
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
			objkVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
			objkVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
			objkVerts[j+2] = 1.0;	// z
			objkVerts[j+3] = 1.0;	// w.
			objkVerts[j+4]=otherColr[0]; 
			objkVerts[j+5]=otherColr[1]; 
			objkVerts[j+6]=otherColr[2];			
		}
		else		// position all odd# vertices along the bottom cap:
		{
			objkVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
			objkVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
			objkVerts[j+2] =-1.0;	// z
			objkVerts[j+3] = 1.0;	// w.
			objkVerts[j+4]=other2Colr[0]; 
			objkVerts[j+5]=other2Colr[1]; 
			objkVerts[j+6]=other2Colr[2];			
		}
		objkVerts[j+7]=objkVerts[j];
		objkVerts[j+8]=objkVerts[j+1];
		objkVerts[j+9]=objkVerts[j+2];
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			objkVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			objkVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			objkVerts[j+2] =-1.0;	// z
			objkVerts[j+3] = 1.0;	// w.
			objkVerts[j+4]=other2Colr[0]; 
			objkVerts[j+5]=other2Colr[1]; 
			objkVerts[j+6]=other2Colr[2];		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			objkVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			objkVerts[j+1] = 0.0;	
			objkVerts[j+2] =-1.0; 
			objkVerts[j+3] = 1.0;			// r,g,b = botColr[]
			objkVerts[j+4]=ctrColr[0]; 
			objkVerts[j+5]=ctrColr[1]; 
			objkVerts[j+6]=ctrColr[2];
		}
		objkVerts[j+7]=objkVerts[j];
		objkVerts[j+8]=objkVerts[j+1];
		objkVerts[j+9]=objkVerts[j+2];
	}
}

function makeObj2() {
	var a = 0.2;
	var b = a / Math.sqrt(3.0);
	var c = 1.0;
	obj2Verts = new Float32Array([
		/*-1*a, -1*b, 0.0, 1.0, 0.2, 0.5, 0.5,  0,0,0,
		a, 	  -1*b, 0.0, 1.0, 0.2, 0.5, 0.5, 0,0,0,
		0.0,  a,   	0.0, 1.0, 0.2, 0.5, 0.5,  0,0,0, //triangle1
		
		0.0,  0.0,  c,   1.0, 0.5, 0.0, 0.0, 0,0,0,
		-1*a, -1*b, 0.0, 1.0, 0.7, 0.2, 0.5, 0,0,0,
		a, 	  -1*b, 0.0, 1.0, 0.7, 0.2, 0.5,  0,0,0,//triangle2
		
		0.0,  0.0,  c,   1.0, 0.9, 0.0, 0.0, 0,0,0,
		-1*a, -1*b, 0.0, 1.0, 0.7, 0.5, 0.5, 0,0,0,
		0.0,  a,   	0.0, 1.0, 0.7, 0.5, 0.5,  0,0,0,//triangle3
		
		0.0,  0.0,  c,   1.0, 0.5, 0.0, 0.0, 0,0,0,
		a, 	  -1*b, 0.0, 1.0, 0.7, 0.5, 0.5, 0,0,0,
		0.0,  a,   	0.0, 1.0, 0.7, 0.5, 0.5,  0,0,0,//triangle4  */
		//Left
		-1, 1, -1, 1, 	0, 0, 1, -1, 0, 0, //A
		-1, 1, 1, 1, 	0, 0, 1, -1, 0, 0, //D
		-1, -1, 1, 1, 	0, 0, 1, -1, 0, 0, //H
		-1, -1, -1, 1, 	0, 0, 1, -1, 0, 0, //E
		-1, 1, -1, 1, 	0, 0, 1, -1, 0, 0, //A
		-1, -1, 1, 1, 	0, 0, 1, -1, 0, 0, //H
		//Front
		-1, 1, 1, 1, 	0, 0, 1, 0, 0, 1, //D
		-1, -1, 1, 1, 	0, 0, 1, 0, 0, 1, //H
		1, -1, 1, 1,  	0, 0, 1, 0, 0, 1,  //G
		-1, 1, 1, 1, 	0, 0, 1, 0, 0, 1, //D
		1, 1, 1, 1, 	0, 0, 1, 0, 0, 1, //C
		1, -1, 1, 1,  	0, 0, 1, 0, 0, 1,  //G
		//Right
		1, 1, 1, 1, 	0, 0, 1, 1, 0, 0, //C
		1, -1, 1, 1, 	0, 0, 1, 1, 0, 0,  //G
		1, -1, -1, 1, 	0, 0, 1, 1, 0, 0, // F
		1, 1, 1, 1, 	0, 0, 1, 1, 0, 0, //C
		1, 1, -1, 1, 	0, 0, 1, 1, 0, 0,  //B
		1, -1, -1, 1, 	0, 0, 1, 1, 0, 0, // F
		//Back
		-1, 1, -1, 1, 	0, 0, 1, 0, 0, -1, //A
		-1, -1, -1, 1, 	0, 0, 1, 0, 0, -1,//E
		1, -1, -1, 1, 	0, 0, 1, 0, 0, -1,// F
		-1, 1, -1, 1, 	0, 0, 1, 0, 0, -1, //A
		1, 1, -1, 1, 	0, 0, 1, 0, 0, -1,  //B
		1, -1, -1, 1, 	0, 0, 1, 0, 0, -1, // F
		//Up
		-1, 1, -1, 1, 	0, 0, 1, 0, 1, 0, //A
		1, 1, -1, 1, 	0, 0, 1, 0, 1, 0, //B
		1, 1, 1, 1, 	0, 0, 1, 0, 1, 0, //C
		-1, 1, -1, 1, 	0, 0, 1, 0, 1, 0, //A
		-1, 1, 1, 1, 	0, 0, 1, 0, 1, 0, //D
		1, 1, 1, 1, 	0, 0, 1, 0, 1, 0, //C
		// Down
		-1, -1, 1, 1, 	0, 0, 1, 0, -1, 0, //H
		1, -1, 1, 1,  	0, 0, 1, 0, -1, 0,  //G
		-1, -1, -1, 1, 	0, 0, 1, 0, -1, 0,//E
		1, -1, 1, 1,  	0, 0, 1, 0, -1, 0,  //G
		-1, -1, -1, 1, 	0, 0, 1, 0, -1, 0,//E
		1, -1, -1, 1, 	0, 0, 1, 0, -1, 0, // F
		
	]);

}

function makeTrunk(){
 var ctrColr = new Float32Array([0.15, 0.10, 0.10]);	// dark gray
 
 var capVerts = 20;	// # of vertices around the topmost 'cap' of the shape
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
			trunkVerts[j+2] = 1.0;	// z
			trunkVerts[j+3] = 1.0;	// w.
			trunkVerts[j+4]=ctrColr[0]; 
			trunkVerts[j+5]=ctrColr[1]; 
			trunkVerts[j+6]=ctrColr[2];			
		}
		trunkVerts[j+7]=trunkVerts[j];
		trunkVerts[j+8]=trunkVerts[j+1];
		trunkVerts[j+9]=trunkVerts[j+2];
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
		trunkVerts[j+7]=trunkVerts[j];
		trunkVerts[j+8]=trunkVerts[j+1];
		trunkVerts[j+9]=trunkVerts[j+2];
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			trunkVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			trunkVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			trunkVerts[j+2] =-1.0;	// z
			trunkVerts[j+3] = 1.0;	// w.
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
		trunkVerts[j+7]=trunkVerts[j];
		trunkVerts[j+8]=trunkVerts[j+1];
		trunkVerts[j+9]=trunkVerts[j+2];
	}
}

function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

	var xcount = 100;			// # of lines to draw in x,y to make the grid.
	var ycount = 100;		
	var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
 	var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
 	var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.
 	
	// Create an (global) array to hold this ground-plane's vertices:
	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						// draw a grid made of xcount+ycount lines; 2 vertices per line.
						
	var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
	
	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j  ] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;									// z
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;									// z
		}								// z
		gndVerts[j+3] = 1.0;
		gndVerts[j+4] = xColr[0];			// red
		gndVerts[j+5] = xColr[1];			// grn
		gndVerts[j+6] = xColr[2];			// blu
		gndVerts[j+7]=0.0;
		gndVerts[j+8]=1.0;
		gndVerts[j+9]==0.0;
	}
	// Second, step thru y values as wqe make horizontal lines of constant-y:
	// (don't re-initialize j--we're adding more vertices to the array)
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;
		}
		gndVerts[j+4] = yColr[0];			// red
		gndVerts[j+5] = yColr[1];			// grn
		gndVerts[j+6] = yColr[2];			// blu
		gndVerts[j+7]=0.0;
		gndVerts[j+8]=1.0;
		gndVerts[j+9]==0.0;
	}
}

function draw(mygl, mycanvas, currentAngle, currentAngle2, modelMatrix, u_ModelMatrix, viewMatrix, u_ViewMatrix, projMatrix, u_ProjMatrix) {
	
	
	gl.uniform4f(u_Lamp0Pos, g_EyeX, g_EyeY, g_EyeZ, 1.0);
	gl.uniform3f(u_Lamp0Amb,  light0_ambient, light0_ambient, light0_ambient);		// ambient
	gl.uniform3f(u_Lamp0Diff, light0_diffuse, light0_diffuse, light0_diffuse);		// diffuse
	gl.uniform3f(u_Lamp0Spec, light0_specular, light0_specular, light0_specular);		// Specular
	
	gl.uniform4f(u_Lamp1Pos, light1_X, light1_Y, light1_Z, 1.0);
	gl.uniform3f(u_Lamp1Amb,  light1_ambient, light1_ambient, light1_ambient);		// ambient
	gl.uniform3f(u_Lamp1Diff, light1_diffuse, light1_diffuse, light1_diffuse);		// diffuse
	gl.uniform3f(u_Lamp1Spec, light1_specular, light1_specular, light1_specular);		// Specular
	
	projMatrix.setPerspective(40, mycanvas.width/mycanvas.height, 1, 100);
	mygl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	mygl.clear(mygl.COLOR_BUFFER_BIT | mygl.DEPTH_BUFFER_BIT);
	mygl.viewport(0, 0, mycanvas.width, mycanvas.height);					
	viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, 	// eye position
  						 g_EyeX + Math.cos(theta/2/Math.PI), g_EyeY + g_LookY, g_EyeZ + Math.sin(theta/Math.PI/2),
						 0, 1, 0);
	mygl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
	// Pass the eye position to u_eyePosWorld
	gl.uniform4f(u_eyePosWorld, g_EyeX, g_EyeY, g_EyeZ, 1);
	draw_scene(mygl, modelMatrix, u_ModelMatrix, currentAngle, currentAngle2);
	
	}	

function draw_scene(gl, modelMatrix, u_ModelMatrix, currentAngle, currentAngle2){
	
	// Draw body1 - Sphere1  
	// Set the Phong materials' reflectance:
	gl.uniform3f(u_Ka, 0.3, 0.3, 0.3);				// Ka ambient
    gl.uniform3f(u_Kd, 1, 1, 1);				// Kd	diffuse
	gl.uniform3f(u_Ks, 1, 0.8, 1);				// Ks specular
	//gl.uniform1i(u_Kshiny, 4);							// Kshiny shinyness exponent
	modelMatrix.setTranslate( 0.0, -0.5, 0.0); 
	quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
	modelMatrix.concat(quatMatrix);	// apply that matrix.
	
	pushMatrix(modelMatrix);
	//var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
	//modelMatrix.rotate(-1*dist*120.0, yMdragTot+0.0001, 0.0, xMdragTot+0.0001);
	
	modelMatrix.rotate(currentAngle, 0, 1, 0); 	
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	modelMatrix.scale(0.4 + scale, 0.4 + scale, 0.4 + scale);
	//modelMatrix.translate(xMdragTot, yMdragTot, 0.0);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
				sphStart/floatsPerVertex,	// start at this vertex number, and 
				sphVerts.length/floatsPerVertex);	// draw this many vertices.
	modelMatrix.scale(2.5, 2.5, 2.5);
	modelMatrix.translate(0.0, 0.45, 0.0); 
  
	// Draw body2 - Sphere2
	gl.uniform3f(u_Ka, 0.329412, 0.223529, 0.027451);				// Ka ambient
    gl.uniform3f(u_Kd, 0.780392, 0.568627, 0.113725);				// Kd	diffuse
	gl.uniform3f(u_Ks, 0.2, 0.2, 0.4); //0.992157, 0.941176, 0.807843);				// Ks specular
	//gl.uniform1i(u_Kshiny, 27.8974);							// Kshiny shinyness exponent
	
	// Set the Phong materials' reflectance:
	//gl.uniform3f(u_Ke, );				// Ke emissive
	//gl.uniform3f(u_Ka, );				// Ka ambient
    //gl.uniform3f(u_Kd, );				// Kd	diffuse
	//gl.uniform3f(u_Ks, );				// Ks specular
	//gl.uniform1i(u_Kshiny, );							// Kshiny shinyness exponent
	pushMatrix(modelMatrix);
	modelMatrix.scale(0.25, 0.25, 0.25); 
	modelMatrix.rotate(currentAngle, 0, 1, 0); 
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);	
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  				sphStart/floatsPerVertex,	// start at this vertex number, and 
  				sphVerts.length/floatsPerVertex);	// draw this many vertices. 
	modelMatrix = popMatrix();
	
	// Draw head - Sphere3
	gl.uniform3f(u_Ka, 0.19125,  0.0735,   0.0225);				// Ka ambient
    gl.uniform3f(u_Kd, 0.7038,   0.27048,  0.0828);				// Kd	diffuse
	gl.uniform3f(u_Ks, 0.256777, 0.137622, 0.086014);				// Ks specular
	
	modelMatrix.translate(0.0, 0.35, 0.0);
	modelMatrix.scale(0.2, 0.2, 0.2); 
	modelMatrix.rotate(2*currentAngle, 0, 1, 0); 
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  				sphStart/floatsPerVertex,	// start at this vertex number, and 
  				sphVerts.length/floatsPerVertex);	// draw this many vertices. 
	modelMatrix.scale(5, 5, 5); 
  
	// Draw left eye - Sphere4 
	gl.uniform3f(u_Ka, 0.3, 0.3, 0.3);				// Ka ambient
    gl.uniform3f(u_Kd, 1, 1, 1);				// Kd	diffuse
	gl.uniform3f(u_Ks, 0.8, 0.8, 0.8);				// Ks specular
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
	
	/*
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
	*/
	
	// draw trunk
	modelMatrix.setTranslate( 0.9, -0.6, 0.5); 
	modelMatrix.rotate(90, 1, 0, 0);
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	modelMatrix.scale(0.1, 0.1, 0.2);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				trunkStart/floatsPerVertex,	
  				trunkVerts.length/floatsPerVertex);

	// draw tree and axis
	modelMatrix.setTranslate(0.9, -0.4, 0.5); 
	modelMatrix.scale(1, 1.5, 1);
	modelMatrix.rotate(currentAngle2, 0, 1, 0); 
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.LINES,							// use this drawing primitive, and
  				  axisStart/floatsPerVertex,	// start at this vertex number, and
  				  axisVerts.length/floatsPerVertex);		// draw this many vertices		
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	
	modelMatrix.rotate(90, 0, 1, 0);
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	
				
	modelMatrix.rotate(currentAngle2, 0, 1, 0); 
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	modelMatrix.translate(0.0, 0.27, 0.0);
	modelMatrix.scale(0.7, 0.7, 0.7);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	
	modelMatrix.rotate(90, 0, 1, 0);
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	

	modelMatrix.rotate(currentAngle2, 0, 1, 0); 
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	modelMatrix.translate(0.0, 0.26, 0.0);
	modelMatrix.scale(0.7, 0.7, 0.7);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	
	modelMatrix.rotate(90, 0, 1, 0);
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				treeStart/floatsPerVertex,	
  				treeVerts.length/floatsPerVertex);	
	
	// Draw Obj#3
	gl.uniform3f(u_Ka, 0.05375, 0.05, 0.06625);			
    gl.uniform3f(u_Kd, 1, 1, 1);				
	gl.uniform3f(u_Ks, 0.997254, 0.829,  0.8);
	modelMatrix.setTranslate(-2.9, -0.6, -1.0); 
	modelMatrix.rotate(-1*currentAngle, 0, 0, 1);
	modelMatrix.scale(0.3, 0.2, 0.2);
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				objkStart/floatsPerVertex,	
  				objkVerts.length/floatsPerVertex);
	
	gl.uniform3f(u_Ka, 0.1,      0.18725,  0.1745);				// Ka ambient
    gl.uniform3f(u_Kd, 0.396,    0.4151,  0.6102);				// Kd	diffuse
	gl.uniform3f(u_Ks, 0.31, 0.234, 0.346435);				// Ks specular
	modelMatrix.translate(0, 0, 5.0);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				
  				objkStart/floatsPerVertex,	
  				objkVerts.length/floatsPerVertex);
	
	gl.uniform3f(u_Ka, 0.23125,  0.23125,  0.23125);				// Ka ambient
    gl.uniform3f(u_Kd, 0.2775,   0.2775,   0.2775);				// Kd	diffuse
	gl.uniform3f(u_Ks, 0.773911, 0.773911, 0.773911);				// Ks specular
	modelMatrix.setTranslate(-2.9, -0.6, -0.5); 
	modelMatrix.scale(0.05, 0.05, 1);
	modelMatrix.rotate(180, 0, 1, 0);
	normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	modelMatrix.scale(0.3, 0.3, 0.3);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  				obj2Start/floatsPerVertex,	// start at this vertex number, and 
  				obj2Verts.length/floatsPerVertex);	// draw this many vertices.

	// Draw ground
	gl.uniform3f(u_Kd, 1, 1, 1);				// Kd	diffuse
	modelMatrix.setTranslate( 0.0, -0.7, 0.0);																	// made by rotating -90 deg on +x-axis.
  	modelMatrix.rotate(-90.0, 1,0,0);	// new one has "+z points upwards",
	modelMatrix.scale(0.4, 0.4,0.4);		// shrink the drawing axes 
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements); 
	gl.drawArrays(gl.LINES,							// use this drawing primitive, and
  				  gndStart/floatsPerVertex,	// start at this vertex number, and
  				  gndVerts.length/floatsPerVertex);		// draw this many vertices

 }

function animate(angle) {
//==============================================================================
	// Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_last;
	//g_last = now;

	if(angle >   120.0 && ANGLE_STEP > 0.0) ANGLE_STEP = -ANGLE_STEP;
	if(angle <  -120.0 && ANGLE_STEP < 0.0) ANGLE_STEP = -ANGLE_STEP;
  
	var newAngle = angle + ( 60 * elapsed) / 1000.0;
	return newAngle %= 360;
}

function animate2(angle) {
//==============================================================================
  // Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;

	var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
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
	dragQuat(x - xMclik, y - yMclik);
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
	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);

	dragQuat(x - xMclik, y - yMclik);
}

function dragQuat(xdrag, ydrag) {
//==============================================================================
// Called when user drags mouse by 'xdrag,ydrag' as measured in CVV coords.
// We find a rotation axis perpendicular to the drag direction, and convert the 
// drag distance to an angular rotation amount, and use both to set the value of 
// the quaternion qNew.  We then combine this new rotation with the current 
// rotation stored in quaternion 'qTot' by quaternion multiply.  Note the 
// 'draw()' function converts this current 'qTot' quaternion to a rotation 
// matrix for drawing. 
	var res = 5;
	var qTmp = new Quaternion(0,0,0,1);
	
	var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
	// console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
	qNew.setFromAxisAngle(-ydrag + 0.0001, 0.0, -xdrag + 0.0001,dist*250.0);
	// (why add tiny 0.0001? To ensure we never have a zero-length rotation axis)
							// why axis (x,y,z) = (-yMdrag,+xMdrag,0)? 
							// -- to rotate around +x axis, drag mouse in -y direction.
							// -- to rotate around +y axis, drag mouse in +x direction.
							
	qTmp.multiply(qNew,qTot);			// apply new rotation to current rotation. 
	qTot.copy(qTmp);
	
};

function myKeyDown(ev, gl, u_ViewMatrix, viewMatrix) {
	if (ev.keyCode == '83'){  // forward
		g_EyeZ -= 0.1 * Math.sin(theta/2/Math.PI);
		g_EyeX -= 0.1 * Math.cos(theta/2/Math.PI);
	}
	else if (ev.keyCode == '87'){ // backward
		g_EyeZ += 0.1 * Math.sin(theta/2/Math.PI);
		g_EyeX += 0.1 * Math.cos(theta/2/Math.PI);
	}
	else if (ev.keyCode == '65'){ //left
		g_EyeX += 0.1 * Math.sin(theta/2/Math.PI);
		g_EyeZ -= 0.1 * Math.cos(theta/2/Math.PI);
	}
	else if (ev.keyCode == '68'){ //right
		g_EyeX -= 0.1 * Math.sin(theta/2/Math.PI);
		g_EyeZ += 0.1 * Math.cos(theta/2/Math.PI);
	}
	else if (ev.keyCode == '69') //down
		g_EyeY -= 0.1;
	else if (ev.keyCode == '81') //down
		g_EyeY += 0.1;		
	else if (ev.keyCode == '38')
		g_LookY += 0.1;
	else if (ev.keyCode == '40')
		g_LookY -= 0.1;
	else if (ev.keyCode == '37')
		theta -= 1;
	else if (ev.keyCode == '39')
		theta += 1;
	else if (ev.keyCode == '72') //down
		help_sts = true;
	else if (ev.keyCode == '187') //down
		ANGLE_STEP *= 4;
	else if (ev.keyCode == '189') //down
		ANGLE_STEP /= 4;
	else if (ev.keyCode == '49') //down
		light1_ambient += 0.2;
	else if (ev.keyCode == '50') //down
		light1_ambient -= 0.2;
	else if (ev.keyCode == '51') //down
		light1_diffuse += 0.2;
	else if (ev.keyCode == '52') //down
		light1_diffuse -= 0.2;
	else if (ev.keyCode == '53') //down
		light1_specular += 0.2;
	else if (ev.keyCode == '54') //down
		light1_specular -= 0.2;
		
}

function myKeyUp(ev) {
	//console.log('come to mykeyup:');
	if (ev.keyCode == '72')
		help_sts = false;
}

function draw_help(ctx){
	ctx.clearRect(0, 0, 800, 400);
	ctx.font='27px Arial';
	ctx.fillStyle='rgba(255,255,255,1)';
	ctx.fillText('w s: move forward backward', 50, 50);
	ctx.fillText('a d: move left and right',50,80);
	ctx.fillText('q e: move up and down',50,110);
	ctx.fillText('arrow: control look at poit',50,140);
	ctx.fillText('mouse drag: control the snowman',50,170);
	ctx.fillText('1 2: change ambient',50,200);
	ctx.fillText('3 4: change diffusion',50,230);
	ctx.fillText('5 6: change specular',50,260);
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

function winResize() {
	var nuCanvas = document.getElementById('webgl');	// get current canvas
	//Make canvas fill the top 3/4 of our browser window:
	nuCanvas.width = innerWidth;
	nuCanvas.height = innerHeight;
	var nuGL = getWebGLContext(nuCanvas);							// and context:
	var help = document.getElementById('help');
  
	// Get the rendering context for background and WebGL
	var ctx = help.getContext('2d');
	if (!ctx) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	console.log('nuCanvas width,height=', nuCanvas.width, nuCanvas.height);		
	console.log('Browser window: innerWidth,innerHeight=', innerWidth, innerHeight);
	var tick = function() {
	// help window
	if (help_sts)
		draw_help(ctx);
	else
		ctx.clearRect(0,0,800,400);
		
	// change color in the buffer
	var treeColor = 0.5;//0.2 + currentAngle2 / 600;
	var treeSize = 0.3 + currentAngle2 / 1200;
	n = initVertexBuffer(nuGL, treeColor, treeSize);
    currentAngle = animate(currentAngle);  // Update the rotation angle
	currentAngle2 = animate2(currentAngle2);
    draw(nuGL, nuCanvas,currentAngle, currentAngle2, modelMatrix, u_ModelMatrix, viewMatrix, u_ViewMatrix, projMatrix, u_ProjMatrix);   // Draw shapes
	requestAnimationFrame(tick, nuCanvas);   				
	};
	tick();
}

function treeView(){
	g_EyeX = 0.90;
	g_EyeZ = 0.5;
	g_EyeY = 0.65;
	g_LookY = -0.6;
	var tick = function() {
		// help window
		if (help_sts)
			draw_help(ctx);
		else
			ctx.clearRect(0,0,800,400);
		
		// change color in the buffer
		var treeColor = 0.2 + currentAngle2 / 600;
		var treeSize = 0.5; //+ currentAngle2 / 1200
		n = initVertexBuffer(gl, treeColor, treeSize);
		currentAngle = animate(currentAngle);  // Update the rotation angle
		currentAngle2 = animate2(currentAngle2);
		console.log('currentAngle2 = ' + currentAngle2);
		projMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
		gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, canvas.width/2, canvas.height);					
		viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, 	// eye position
							 g_EyeX + Math.cos(currentAngle2/2/Math.PI), g_EyeY + g_LookY, g_EyeZ + Math.sin(currentAngle2/Math.PI/2),
							 0, 1, 0);
		gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
		draw_scene(gl, modelMatrix, u_ModelMatrix, currentAngle, currentAngle2);
	
		//
		projMatrix.setOrtho(-3.0, 3.0, -3*canvas.height/canvas.width, 3*canvas.height/canvas.width, 0.0, 200.0);
		gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
		gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height);					
		viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, 	// eye position
							 g_EyeX + Math.cos(currentAngle2/2/Math.PI), g_EyeY + g_LookY, g_EyeZ + Math.sin(currentAngle2/Math.PI/2), 								// look-at point (origin)
							 0, 1, 0);								// up vector (+y)
		gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
		draw_scene(gl, modelMatrix, u_ModelMatrix, currentAngle, currentAngle2);
		requestAnimationFrame(tick, canvas);   				
	};
	tick();	
}

function light0OnOff(){
	light0_sts = !light0_sts;
	if (!light0_sts){
		light0_ambient_temp = light0_ambient;
		light0_diffuse_temp = light0_diffuse;
		light0_specular_temp = light0_specular;
		light0_ambient = 0.0;
		light0_diffuse = 0.0;
		light0_specular = 0.0;
	}
	else{
		light0_ambient = light0_ambient_temp;
		light0_diffuse = light0_diffuse_temp;
		light0_specular = light0_specular_temp;
	}
}

function ambient0OnOff(){
	ambient0_sts = !ambient0_sts;
	if (!ambient0_sts){
		ambient0_temp = light0_ambient;
		light0_ambient = 0.0;
	}
	else
		light0_ambient = ambient0_temp;
}

function diffuse0OnOff(){
	diffuse0_sts = !diffuse0_sts;
	if (!diffuse0_sts){
		diffuse0_temp = light0_diffuse;
		light0_diffuse = 0.0;
	}
	else
		light0_diffuse = diffuse0_temp;
}

function specular0OnOff(){
	specular0_sts = !specular0_sts;
	if (!specular0_sts){
		specular0_temp = light0_specular;
		light0_specular = 0.0;
	}
	else
		light0_specular = specular0_temp;
}

function light1OnOff(){
	light1_sts = !light1_sts;
	if (!light1_sts){
		light1_ambient_temp = light1_ambient;
		light1_diffuse_temp = light1_diffuse;
		light1_specular_temp = light1_specular;
		light1_ambient = 0.0;
		light1_diffuse = 0.0;
		light1_specular = 0.0;
	}
	else{
		light1_ambient = light1_ambient_temp;
		light1_diffuse = light1_diffuse_temp;
		light1_specular = light1_specular_temp;
	}
}

function ambient1OnOff(){
	ambient1_sts = !ambient1_sts;
	if (!ambient1_sts){
		ambient1_temp = light1_ambient;
		light1_ambient = 0.0;
	}
	else
		light1_ambient = ambient1_temp;
}

function diffuse1OnOff(){
	diffuse1_sts = !diffuse1_sts;
	if (!diffuse1_sts){
		diffuse1_temp = light1_diffuse;
		light1_diffuse = 0.0;
	}
	else
		light1_diffuse = diffuse1_temp;
}

function specular1OnOff(){
	specular1_sts = !specular1_sts;
	if (!specular1_sts){
		specular1_temp = light1_specular;
		light1_specular = 0.0;
	}
	else
		light1_specular = specular1_temp;
}

function light1_X_Add(){
	light1_X += 1;
}

function light1_X_Sub(){
	light1_X -= 1;
}

function light1_Y_Add(){
	light1_Y += 1;
}

function light1_Y_Sub(){
	light1_Y -= 1;
}

function light1_Z_Add(){
	light1_Z += 1;
}

function light1_Z_Sub(){
	light1_Z -= 1;
}

function originView(){
	g_EyeX = 0.20; g_EyeY = 0.5; g_EyeZ = 4.25; g_LookY = -0.25;
	var tick = function() {
		// help window
		if (help_sts)
			draw_help(ctx);
		else
			ctx.clearRect(0,0,800,400);
		
	// change color in the buffer
	var treeColor = 0.2 + currentAngle2 / 600;
	var treeSize = 0.5 //+ currentAngle2 / 1200;
	n = initVertexBuffer(gl, treeColor, treeSize);
    currentAngle = animate(currentAngle);  // Update the rotation angle
	currentAngle2 = animate2(currentAngle2);
    draw(gl, canvas, currentAngle, currentAngle2, modelMatrix, u_ModelMatrix, viewMatrix, u_ViewMatrix, projMatrix, u_ProjMatrix);   // Draw shapes
	requestAnimationFrame(tick, canvas);   				
	};
	tick();		
	
}
