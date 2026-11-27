// Global Variables
// ----------------------------------------------------------------
let sphereRadius = 6 ;
let startingCircleRadius = 0.5 ;
let time = 0 ;
let gamePoints = 0 ;
let userPoints = 0 ;
let bacterias = [] ;
let numBacteriasCurrent = 0 ;
let colors = [] ;
let circleRadii = [] ;
let numBacteriaGenerated = 0 ;
let pitch = 0 ;
let yaw = 0 ;
let dragging = false ;
let lastX = 0, lastY = 0 ;
let gameover = false ;
// ----------------------------------------------------------------









// Shaders
// ----------------------------------------------------------------
var CircleVertexShaderSource =
    'attribute vec4 vertex ;\n' +
    'uniform mat4 model ;\n' +
    'uniform mat4 view ;\n' +
    'uniform mat4 projection ;\n' +
    'void main() {\n' +
    '  gl_Position = projection * view * model * vertex ;\n' +
    '}\n';

var CircleFragmentShaderSource =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform vec4 uniformColor ;\n' +
    'void main() {\n' +
    '  gl_FragColor = uniformColor ;\n' +
    '}\n';

var SphereVertexShaderSource =
    'attribute vec4 vertex ;\n' +
    'attribute vec4 color ;\n' +
    'uniform mat4 model ;\n' +
    'uniform mat4 view ;\n' +
    'uniform mat4 projection ;\n' +
    'varying vec4 fcolor ;\n' +
    'void main() {\n' +
    '  gl_Position = projection * view * model * vertex;\n' +
    '  fcolor = color;\n' +
    '  gl_PointSize = 10.0;\n' +
    '}\n';

var SphereFragmentShaderSource =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 fcolor ;\n' +
    'uniform vec4 uniformColor ;\n' +
    'void main() {\n' +
    '  gl_FragColor = uniformColor ;\n' +
    '}\n';
// ----------------------------------------------------------------









// Shaders
// ----------------------------------------------------------------
function CreateShader( gl, type, source )
{
    const shader = gl.createShader( type ) ;
    gl.shaderSource( shader, source ) ;
    gl.compileShader( shader ) ;

    if( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ){
        console.error( 'Shader compile error:', gl.getShaderInfoLog( shader ) ) ;
        gl.deleteShader( shader ) ;
        
        return null ;
    }
    
    return shader ;
}

function CreateShaderProgram( gl, vsSource, fsSource )
{
    const vertexShader = CreateShader( gl, gl.VERTEX_SHADER, vsSource ) ;
    const fragmentShader = CreateShader( gl, gl.FRAGMENT_SHADER, fsSource ) ;
    const shaderProgram = gl.createProgram() ;
    
    gl.attachShader( shaderProgram, vertexShader ) ;
    gl.attachShader( shaderProgram, fragmentShader ) ;
    gl.linkProgram( shaderProgram ) ;

    if( !gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) ){
        console.error( 'ERROR::FAILURE TO CREATE SHADER PROGRAM', gl.getProgramInfoLog(shaderProgram) ) ;
        return null ;
    }
    
    return shaderProgram ;
}
// ----------------------------------------------------------------









// Utilities
// ----------------------------------------------------------------
function isSameColor(a, b, epsilon = 0.01) 
{
    return (
        Math.abs(a[0] - b[0]) < epsilon &&
        Math.abs(a[1] - b[1]) < epsilon &&
        Math.abs(a[2] - b[2]) < epsilon &&
        Math.abs(a[3] - b[3]) < epsilon
    );
}

function normalizeVec3(v)
{
    let out = vec3.create();
    vec3.normalize(out, v);
    return out;
}

function crossVec3(a, b) 
{
    let out = vec3.create();
    vec3.cross(out, a, b);
    return out;
}

// ----------------------------------------------------------------









// Create a Circle
// ----------------------------------------------------------------
function CreateCircle( centre, numSegments, radius )
{
    let normal = normalizeVec3(centre) ;
    
    let temp = Math.abs(normal[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    let tangent1 = normalizeVec3(crossVec3(normal, temp));
    let tangent2 = normalizeVec3(crossVec3(normal, tangent1));

    const circleVertices = [] ;
    circleVertices.push(centre[0], centre[1], centre[2], centre[3]);

    for (let i = 0; i <= numSegments; ++i) {
        let angle = 2 * Math.PI * i / numSegments;
        let dx = Math.cos(angle) * radius;
        let dy = Math.sin(angle) * radius;
        let vx = centre[0] + dx * tangent1[0] + dy * tangent2[0];
        let vy = centre[1] + dx * tangent1[1] + dy * tangent2[1];
        let vz = centre[2] + dx * tangent1[2] + dy * tangent2[2];

        circleVertices.push(vx, vy, vz, 1);
    }
    return new Float32Array( circleVertices ) ;
}
// ----------------------------------------------------------------









// Sphere
// ----------------------------------------------------------------
function CreateSphere( numSectors, numStacks )
{
    const vertices = [] ;
    const indices = [] ;
    const colors = [] ;
    for( let latitude = 0 ; latitude <= numStacks ; latitude++ ){
        const theta = latitude * Math.PI / numStacks ;
        const sinTheta = Math.sin( theta ) ;
        const cosTheta = Math.cos( theta ) ;
        for( let longitude = 0 ; longitude <= numSectors ; longitude++ ) {
            const phi = longitude * 2 * Math.PI / numSectors ;
            const sinPhi = Math.sin( phi ) ;
            const cosPhi = Math.cos( phi ) ;
            const x = cosPhi * sinTheta * sphereRadius ;
            const y = cosTheta * sphereRadius ;
            const z = sinPhi * sinTheta * sphereRadius ;
            vertices.push( x, y, z, 1 ) ;
            colors.push( 0, 0, 0, 1 ) ;
        }
    }
    for( let latitude = 0 ; latitude < numStacks ; latitude++ ) {
        for( let longitude = 0 ; longitude < numSectors ; longitude++ ){
            const first = latitude * (numSectors + 1) + longitude ;
            const second = first + numSectors + 1 ;
            indices.push( first, second, first + 1 ) ;
            indices.push( second, second + 1, first + 1 ) ;
      }
    }
    return {
        vertices: new Float32Array( vertices ),
        indices: new Uint16Array( indices ),
        colors: new Float32Array( colors )
    } ;
}
// ----------------------------------------------------------------









// Buffer
// ----------------------------------------------------------------
function CreateBuffer( gl, data, type )
{
    const buffer = gl.createBuffer() ;
    gl.bindBuffer( type, buffer ) ;
    gl.bufferData( type, data, gl.STATIC_DRAW ) ;
    
    return buffer ;
}
// ----------------------------------------------------------------









// Pick a Random Point on Sphere
// ----------------------------------------------------------------
function PickRandomPointOnSphere()
{
    const theta = Math.random() * Math.PI ;
    const sinTheta = Math.sin( theta ) ;
    const cosTheta = Math.cos( theta ) ;

    const phi = Math.random() * 2 * Math.PI ;
    const sinPhi = Math.sin( phi ) ;
    const cosPhi = Math.cos( phi ) ;

    const x = cosPhi * sinTheta * sphereRadius ;
    const y = cosTheta * sphereRadius ;
    const z = sinPhi * sinTheta * sphereRadius ;

    let point = [x, y, z, 1] ;
    
    return point ;
}
// ----------------------------------------------------------------









// Rotation
// ----------------------------------------------------------------
function TrackMouseRotation(gl, canvas) {
    canvas.addEventListener("mousedown", function(event) {
        dragging = true ;
        lastX = event.clientX ;
        lastY = event.clientY ;
        
        const rect = canvas.getBoundingClientRect() ;
        const mouseX = event.clientX - rect.left ;
        const mouseY = event.clientY - rect.top ;
        
        // Flip Y for WebGL
        const flippedY = canvas.height - mouseY ;
        
        let pixel = new Uint8Array(4);
        gl.readPixels(mouseX, flippedY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        let color = [ pixel[0] / 255, pixel[1] / 255, pixel[2] / 255, 1 ];
        for( let i = 0 ; i < numBacteriasCurrent ; i++ ){
            if (color && colors[i]){
                if( isSameColor(colors[i],color) ){
                    bacterias.splice(i, 1) ;
                    colors.splice(i, 1) ;
                    circleRadii.splice(i, 1) ;
                    numBacteriasCurrent-- ;
                    userPoints++ ;
                    break ;
                }
            }
        }
    });
    canvas.addEventListener("mousemove", function(event) {
        if (!dragging)
            return ;

        let dx = event.clientX - lastX ;
        let dy = event.clientY - lastY ;

        const rotationSpeed = 0.005 ;
        yaw += dx * rotationSpeed ;
        pitch += dy * rotationSpeed ;

        lastX = event.clientX ;
        lastY = event.clientY ;
    });

    canvas.addEventListener("mouseup", () => { dragging = false; }) ;
    canvas.addEventListener("mouseleave", () => { dragging = false; }) ;
}
// ----------------------------------------------------------------










// Update Model Matrix
// ----------------------------------------------------------------
function UpdateModelMatrix()
{
    const modelMatrix = mat4.create() ;
    mat4.rotateY( modelMatrix, modelMatrix, yaw ) ;
    mat4.rotateX( modelMatrix, modelMatrix, pitch ) ;

    return modelMatrix ;
}
// ----------------------------------------------------------------









// Renderer
// ----------------------------------------------------------------
function RenderSphere( gl, canvas, sphereData, vertexBuffer, indexBuffer, colorBuffer, modelMatrix, viewMatrix, projectionMatrix, shaderProgram )
{
    gl.useProgram( shaderProgram ) ;

    // Bind Vertex Data
    const vertex = gl.getAttribLocation( shaderProgram, "vertex" ) ;
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer ) ;
    gl.enableVertexAttribArray( vertex ) ;
    gl.vertexAttribPointer( vertex, 4, gl.FLOAT, false, 0, 0 ) ;
    
    // Bind Color Data
    const color = gl.getAttribLocation( shaderProgram, "color" ) ;
    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer ) ;
    gl.enableVertexAttribArray( color ) ;
    gl.vertexAttribPointer( color, 4, gl.FLOAT, false, 0, 0 ) ;
    
    // Set MVP Matrices
    gl.uniformMatrix4fv( gl.getUniformLocation(shaderProgram, "model"), false, modelMatrix ) ;
    gl.uniformMatrix4fv( gl.getUniformLocation(shaderProgram, "view"), false, viewMatrix ) ;
    gl.uniformMatrix4fv( gl.getUniformLocation( shaderProgram, "projection" ), false, projectionMatrix ) ;
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer ) ;
    
    // Set Sphere Color
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "uniformColor"),[1.0, 1.0, 1.0, 1.0]);
    
    // Render as Points
    gl.drawElements(gl.POINTS, sphereData.indices.length, gl.UNSIGNED_SHORT, 0);
    
    // Set Sphere Color
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "uniformColor"),[0.5, 0.5, 0.5, 1.0]);
    
    // Render as Triangles
    gl.drawElements(gl.TRIANGLES, sphereData.indices.length, gl.UNSIGNED_SHORT, 0);
}

function RenderCircle( gl, canvas, circleShaderProgram, modelMatrix, viewMatrix, projectionMatrix, colors )
{
    gl.useProgram( circleShaderProgram ) ;

    for( let i = 0 ; i < numBacteriasCurrent ; i++ ){
        
        // Create Circle
        let circleVertices = CreateCircle( bacterias[i], 30, circleRadii[i] ) ;
        
        // Create Circle Vertex Buffer
        const circleVertexBuffer = CreateBuffer(gl, circleVertices, gl.ARRAY_BUFFER);
        
        const circleVertex = gl.getAttribLocation( circleShaderProgram, "vertex" ) ;
        gl.bindBuffer( gl.ARRAY_BUFFER, circleVertexBuffer ) ;
        gl.enableVertexAttribArray( circleVertex ) ;
        gl.vertexAttribPointer( circleVertex, 4, gl.FLOAT, false, 0, 0 ) ;
        
        gl.uniformMatrix4fv( gl.getUniformLocation(circleShaderProgram, "model"), false, modelMatrix ) ;
        gl.uniformMatrix4fv( gl.getUniformLocation(circleShaderProgram, "view"), false, viewMatrix ) ;
        gl.uniformMatrix4fv( gl.getUniformLocation( circleShaderProgram, "projection" ), false, projectionMatrix ) ;
        gl.uniform4fv(gl.getUniformLocation(circleShaderProgram, "uniformColor"),colors[i]);
        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length/4 );
        circleRadii[i] = circleRadii[i] + 0.001 ;
        console.log("Radius = ", circleRadii[i]);
        if( circleRadii[i] > 0.8 )
            gamePoints = gamePoints + 1 ;
    }
}

function Render( gl, canvas, sphereData, vertexBuffer, indexBuffer, colorBuffer, shaderProgram, circleShaderProgram, viewMatrix, projectionMatrix )
{
    function renderLoop() {
        if( !gameover ){
            gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT ) ;
            
            // Update Model Matrix
            const modelMatrix = UpdateModelMatrix() ;

            // Render Sphere
            RenderSphere( gl, canvas, sphereData, vertexBuffer, indexBuffer, colorBuffer, modelMatrix, viewMatrix, projectionMatrix, shaderProgram ) ;
            
            // Render Circle
            RenderCircle( gl, canvas, circleShaderProgram, modelMatrix, viewMatrix, projectionMatrix, colors ) ;
            
            // Increment Frame
            time = time + 1 ;

            // Generate New Bacteria every 100 frames
            if( time % 100 == 0 && numBacteriaGenerated < 10 ){
                bacterias.push(PickRandomPointOnSphere()) ;
                colors.push([Math.random(),Math.random(),Math.random(),1]) ;
                circleRadii.push(startingCircleRadius) ;
                numBacteriasCurrent++ ;
                numBacteriaGenerated++ ;
                time = 0 ;
            }
            
            // Game Over
            if( numBacteriaGenerated == 9 ){
                gameover = true ;
                console.log("GamePoints = ", gamePoints);
                console.log("UserPoints = ", userPoints);
                document.getElementById("glCanvas").style.display = "none";
                if( gamePoints > userPoints )
                    document.getElementById("YouLost").style.display = "block";
                else if( gamePoints == userPoints )
                    document.getElementById("Draw").style.display = "block";
                else
                    document.getElementById("YouWon").style.display = "block";
            }
        }
        requestAnimationFrame( renderLoop ) ;
    };
    requestAnimationFrame( renderLoop ) ;
}
// ----------------------------------------------------------------









// Main Function
// ----------------------------------------------------------------
function main()
{
    var canvas = document.getElementById('bookshelf');
    
    var gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }) || canvas.getContext("experimental-webgl");
    if( !gl ){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }
    
    // Set Viewport
    gl.viewport( 0, 0, canvas.width, canvas.height ) ;
    
    // Reset Color
    gl.clearColor( 0.2, 0.2, 0.6, 1.0 ) ;
    
    // Enable Depth Testing
    gl.enable( gl.DEPTH_TEST ) ;
    gl.depthFunc( gl.LEQUAL ) ;

    // Create Shaders
    const shaderProgram = CreateShaderProgram( gl, SphereVertexShaderSource, SphereFragmentShaderSource ) ;
    if (!shaderProgram) {
        console.error("ERROR::FAILURE TO CREATE SHADER PROGRAM") ;
        return;
    }
    
    // Create Circle Shaders
    const circleShaderProgram = CreateShaderProgram( gl, CircleVertexShaderSource, CircleFragmentShaderSource ) ;
    if (!circleShaderProgram) {
        console.error("ERROR::FAILURE TO CREATE CIRCLE SHADER PROGRAM") ;
        return;
    }
    
    // Create Sphere
    sphereData = CreateSphere( 30, 30 ) ;
    
    // Create Vertex Buffer
    const vertexBuffer = CreateBuffer( gl, sphereData.vertices, gl.ARRAY_BUFFER ) ;
    
    // Create Color Buffer
    const colorBuffer = CreateBuffer( gl, sphereData.colors, gl.ARRAY_BUFFER ) ;
    
    // Create Index Buffer
    const indexBuffer = CreateBuffer(gl, sphereData.indices, gl.ELEMENT_ARRAY_BUFFER );
    
    // Track Mouse Rotation
    TrackMouseRotation( gl, canvas ) ;
    
    // Set View Matrix
    const viewMatrix = mat4.create() ;
    mat4.translate(viewMatrix, viewMatrix, [0, 0, -20]);
    
    // Set Projection Matrix
    const projectionMatrix = mat4.create();
    const fov = (45 * Math.PI / 180) ;
    mat4.perspective(projectionMatrix, fov, canvas.width / canvas.height, 0.1, 100.0);

    // Render
    Render( gl, canvas, sphereData, vertexBuffer, indexBuffer, colorBuffer, shaderProgram, circleShaderProgram, viewMatrix, projectionMatrix ) ;
}
// ----------------------------------------------------------------
