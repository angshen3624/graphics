//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// Chapter 5: ColoredTriangle.js (c) 2012 matsuda  AND
// Chapter 4: RotatingTriangle_withButtons.js (c) 2012 matsuda
// became:
//
// BasicShapes.js  MODIFIED for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin
//		--converted from 2D to 4D (x,y,z,w) vertices
//		--extend to other attributes: color, surface normal, etc.
//		--demonstrate how to keep & use MULTIPLE colored shapes in just one
//			Vertex Buffer Object(VBO). 
//		--create several canonical 3D shapes borrowed from 'GLUT' library:
//		--Demonstrate how to make a 'stepped spiral' tri-strip,  and use it
//			to build a cylinder, sphere, and torus.
//
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
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0; 		
var isDrag=false;	
var up_arrow=false;
var down_arrow=false;
var text;
 var zoom=0;
 var modelMatrix;
 var u_ModelMatrix;
 var help=false;
 var ctx;
function main() {
  
  var DNA = function() {
  this.Name = 'Huaipei Lu, NetID:hlv624';
  this.CurrentAngle = 0;
  this.Tremble=false; 
 // this.Help = false;
  this.mode = 'mode1';

};
 /* var color=function(){
	  this.Middle_part_left =[0.9, 0.9, 0.9];
	  this.Middle_part_right = [0.3, 0.7, 0.3];
	  this.Sphere_part =[0,0,0];
	  
  }
*/
  text = new DNA();
 // colorchoose=new color();
  var gui = new dat.GUI();
  var f1=gui.addFolder('Basic Control');
  gui.add(text, 'Name');
  gui.add(text, 'CurrentAngle', -120,360).listen();
  gui.add(text, 'Tremble');
 // gui.add(text, 'Help');
  gui.add(text, 'mode',['mode1','mode2']);
 /* var f2=gui.addFolder('color Control');
  f2.addColor(colorchoose,'Middle_part_left');
  f2.addColor(colorchoose,'Middle_part_right');
  f2.addColor(colorchoose,'Sphere_part');
*/
	var update=function(){
		requestAnimationFrame(update);
		text.CurrentAngle=currentAngle;
	}

	update();
	

//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  var hud = document.getElementById('hud');
  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
   ctx = hud.getContext('2d');
  if(!ctx){
	  console.log('Failed to get the rendering context for HUD');
  }
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
 
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // 
  var n = initVertexBuffer(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  
  
  canvas.onmousedown =	function(ev){myMouseDown( ev, gl, canvas) };// when user's mouse button goes down call mouseDown() function
  canvas.onmousemove = 	function(ev){myMouseMove( ev, gl, canvas) };		// call mouseMove() function					
  canvas.onmouseup   =  function(ev){myMouseUp(   ev, gl, canvas)};
  
 // canvas.addEventListener("click", function(ev){myMouseClick(ev,gl,canvas,currentAngle,n)},false);
  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);
  window.addEventListener("keypress", myKeyPress, false);
//  window.addEventListener("keypress", myMouseClick, false);
  
  
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 0);//gl.clearColor(0.03, 0.03, 0.05, 0);

	// NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
	// unless the new Z value is closer to the eye than the old one..
//	gl.depthFunc(gl.LESS);			 // WebGL default setting: (default)
	gl.enable(gl.DEPTH_TEST); 	  
	
  // Get handle to graphics system's storage location of u_ModelMatrix
   u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  // Create a local version of our model matrix in JavaScript 
  modelMatrix = new Matrix4();
  
  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;
 
	
//-----------------  

  // Start drawing: create 'tick' variable whose value is this function:
  
  var tick = function() {
  n = initVertexBuffer(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
	if(help==true)
     	draw2D(ctx);
    currentAngle = animate(currentAngle);  // Update the rotation angle
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw shapes
    // report current angle on console
    //console.log('currentAngle=',currentAngle);
    requestAnimationFrame(tick, canvas);   
    
	
		};
  tick();							// start (and continue) animation: draw current image
	
}

function initVertexBuffer(gl) {
//==============================================================================
// Create one giant vertex buffer object (VBO) that holds all vertices for all
// shapes.
make_joint();
					
  // how many floats total needed to store all shapes?
	var mySiz = (cylVerts.length + sphVerts.length	); 						

	// How many vertices total?
	var nn = mySiz / floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
	// Copy all shapes into one big Float32 array:
  var colorShapes = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:
	cylStart = 0;							// we stored the cylinder first.
  for(i=0,j=0; j< cylVerts.length; i++,j++) {
     colorShapes[i] = cylVerts[j];
	}
		sphStart = i;						// next, we'll store the sphere;
	for(j=0; j< sphVerts.length; i++, j++) {// don't initialize i -- reuse it!
		colorShapes[i] = sphVerts[j];
	}						
  // Create a buffer object on the graphics hardware:
  var shapeBufferHandle = gl.createBuffer();  
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  // (Use sparingly--may be slow if you transfer large shapes stored in files)
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);
    
  //Get graphics system's handle for our Vertex Shader's position-input variable: 
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?

  // Use handle to specify how to retrieve **POSITION** data from our VBO:
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE * floatsPerVertex, 0);						
  gl.enableVertexAttribArray(a_Position);  
  // Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // Use handle to specify how to retrieve **COLOR** data from our VBO:
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, 	false, 	FSIZE * 7, 	FSIZE * 4);			
  gl.enableVertexAttribArray(a_Color);  // Enable assignment of vertex buffer object's position data
  // Unbind the buffer object 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return nn;
}



function make_joint(){
	makeCylinder();
	makeSphere();
	
}
function makeCylinder() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
 var ctrColr = new Float32Array([0.5, 0.5, 0.5]);	// dark gray
 var topColr = new Float32Array([1, 0.365, 0.059]);	// light green
 var botColr = new Float32Array([0.051, 0.234, 0.745]);	// light blue
 var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 0.05;		// radius of bottom of cylinder (top always 1.0)
 
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
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			cylVerts[j  ] = botRadius*Math.cos(Math.PI*(v-1)/capVerts);			// x
			cylVerts[j+1] = botRadius*Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			cylVerts[j+2] = 1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
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
				cylVerts[j  ] = botRadius*Math.cos(Math.PI*(v)/capVerts);		// x
				cylVerts[j+1] = botRadius*Math.sin(Math.PI*(v)/capVerts);		// y
				cylVerts[j+2] = 1.0;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
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
				// r,g,b = topColr[]
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

function makeSphere() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
  var slices = 24;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 26;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([0.5,0.3,0.5]);	// North Pole: light gray
  var equColr = new Float32Array([0.5,0.9,0.5]);	// Equator:    bright green
  var botColr = new Float32Array([0.5,0.63,0.5]);	// South Pole: brightest gray.
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
			if(s==0) {	// finally, set some interesting colors for vertices:
				sphVerts[j+4]=topColr[0]; 
				sphVerts[j+5]=topColr[1]; 
				sphVerts[j+6]=topColr[2];	
				}
			else if(s==slices-1) {
				sphVerts[j+4]=botColr[0]; 
				sphVerts[j+5]=botColr[1]; 
				sphVerts[j+6]=botColr[2];	
			}
			else {
					sphVerts[j+4]= equColr[0]; //Math.random()
					sphVerts[j+5]= equColr[1]; 
					sphVerts[j+6]= equColr[2];					
			}
		}
	}
}
function makeStar(){
	
	
	
	
	
	
	
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
  
  if(up_arrow==true)
	  zoom+=0.03;
  if(down_arrow==true)
	  zoom-=0.03;
 var TrembleScale=0;
 var offset1=1.3;
 var offset=1;
  //-------Draw Spinning Cylinder:
	for( var i=0,j=0;i<40;i++,j+=1.5){	
   modelMatrix.setScale(1,1,-1); 
 if(text.mode=='mode1')
	 offset=1;
 else 
	 offset=(1-0.05*j);
 if(text.Tremble==true)
     TrembleScale=10*Math.random(); 
  else 
	  TrembleScale=0;
  // convert to left-handed coord sys  																				// to match WebGL display canvas.
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.scale(1+zoom,1+zoom,1+zoom);
  modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);  
  modelMatrix.rotate(currentAngle*offset+i*10, 0, 1,0);
  modelMatrix.translate(0.0,-1.8+i*0.1, 0.0);
  //mouse
 gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Draw just the the cylinder's vertices:
  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							cylStart/floatsPerVertex, // start at this vertex number, and
  							cylVerts.length/floatsPerVertex);	// draw this many vertices.
//--------Draw Spinning Sphere
  modelMatrix.setScale(1,1,-1);							// convert to left-handed coord sys																			// to match WebGL display canvas.
    modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
  modelMatrix.scale(0.05, 0.05, 0.05);
 // Make it smaller:
modelMatrix.scale(1+zoom,1+zoom,1+zoom);
 modelMatrix.rotate(90,0,1,0);
 modelMatrix.rotate(currentAngle*offset+TrembleScale+i*10, 0, 1, 0);  
 modelMatrix.translate(10,-18+i,0.0);
 
 gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  		// Draw just the sphere's vertices
 gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							sphStart/floatsPerVertex,	// start at this vertex number, and 
  							sphVerts.length/floatsPerVertex);	// draw this many vertices.

 modelMatrix.setScale(1,1,-1);							// convert to left-handed coord sys
modelMatrix.scale(1+zoom,1+zoom,1+zoom);
 modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0); 																				// to match WebGL display canvas.
//draw second sphere 
 modelMatrix.scale(0.05, 0.05, 0.05);
 // modelMatrix.translate(11.0,8.5,0.0);
 // Make it smaller:

 modelMatrix.rotate(90,0,1,0);
 modelMatrix.rotate(currentAngle*offset+TrembleScale+i*10, 0, 1, 0);  // Spin on XY diagonal axis
 modelMatrix.translate(-10.0,-18+i,0.0);

 gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  		// Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							sphStart/floatsPerVertex,	// start at this vertex number, and 
  							sphVerts.length/floatsPerVertex);	// draw this many vertices.
}											
}
var g_last = Date.now();
function draw2 (gl, n, currentAngle, modelMatrix, u_ModelMatrix,r_x,r_y) {
var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
  
  if(up_arrow==true)
	  zoom+=0.03;
  if(down_arrow==true)
	  zoom-=0.03;
	modelMatrix.setScale(1,1,-1);							// convert to left-handed coord sys																			// to match WebGL display canvas.
    modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
  modelMatrix.scale(0.05, 0.05, 0.05);
 // Make it smaller:
 modelMatrix.scale(1+zoom,1+zoom,1+zoom);
 modelMatrix.translate(r_x*20,r_y*20,0.0);
 
 gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  		// Draw just the sphere's vertices
 gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							sphStart/floatsPerVertex,	// start at this vertex number, and 
  							sphVerts.length/floatsPerVertex);	// draw this many vertices.
							
}

function animate(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
if(text.mode=='mode2')
{  if(angle >  120.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  if(angle < -120 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
} 
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

//==================HTML Button Callbacks
function spinDown() {
 ANGLE_STEP -= 25; 
}

function spinUp() {
  ANGLE_STEP += 25; 
}

function runStop() {
  if(ANGLE_STEP*ANGLE_STEP > 1) {
    myTmp = ANGLE_STEP;
    ANGLE_STEP = 0;
  }
  else {
  	ANGLE_STEP = myTmp;
  }
}
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
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
	yMdragTot += (y - yMclik);
	xMclik = x;													// Make next drag-measurement from here.
	yMclik = y;
};
function myMouseClick(ev,gl,canvas,currentAngle,n){
	 var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
  console.log("hahahahahaha");
	// Convert to Canonical View Volume (CVV) coordinates too:
  var r_x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var r_y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
	var tick2 = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
    draw2(gl, n, currentAngle, modelMatrix, u_ModelMatrix,r_x,r_y);   // Draw shapes
    requestAnimationFrame(tick2, canvas);   
		};
  tick2();
	
	
	
}
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
};
function myKeyDown(ev) {
	switch(ev.keyCode) {			// keycodes !=ASCII, but are very consistent for 
	//	nearly all non-alphanumeric keys for nearly all keyboards in all countries.
		case 65:		// left-arrow key
			// print in console:
			console.log(' left-arrow.');
			spinDown();
			break;
		case 32:
			console.log("space");
			runStop();
			break;
		case 87:		// up_arrow key
			console.log('   up_arrow.');
  		    up_arrow=true;
			break;
		case 68:		// right-arrow key
			console.log('right-arrow.');
			spinUp();
  		    break;
		case 83:		// down_arrow key
			console.log(' down_arrow.');
  		    down_arrow=true;
     		break;
		case 73:
			console.log('h down');
			help=true;
			break;
     	default:
			console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
	         break;
	}
	
}
function myKeyUp(ev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well
	switch(ev.keyCode) {			// keycodes !=ASCII, but are very consistent for 
	//	nearly all non-alphanumeric keys for nearly all keyboards in all countries.

		case 87:		// up_arrow key
			console.log('   up_arrow.');
  		    up_arrow=false;
			break;
		case 83:		// down_arrow key
			console.log(' down_arrow.');
  		    down_arrow=false;
			break;
		case 73:
			help=false;
			ctx.clearRect(0,0,600,600);
			break;
		default:
			break;
	}
}
function draw2D(ctx){
	ctx.font='18px Arial';
	ctx.clearRect(0,0,600,600);
	ctx.fillStyle='rgba(255,255,255,1)';
	ctx.fillText('Mouse drag: Change view angle',0,20);
	ctx.fillText('W/S: Zoom in/out',0,60);
	ctx.fillText('A/D: Reduce/Add spinning speed',0,100);
	ctx.fillText('Space: Stop/Start spinning',0,140);
	ctx.fillText('Use the Control Pad on the up-right corner to Control other feature',0,180);
	
	
	
	
}
function myKeyPress(ev) {
//===============================================================================
// Best for capturing alphanumeric keys and key-combinations such as 
// CTRL-C, alt-F, SHIFT-4, etc.
    if(ev.keycode==111)
	{  draw2D(ctx);   }	
	console.log('myKeyPress():keyCode='+ev.keyCode  +', charCode=' +ev.charCode+
												', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
												', altKey='   +ev.altKey   +
												', metaKey(Command key or Windows key)='+ev.metaKey);
}
