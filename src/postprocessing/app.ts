import * as twgl from 'twgl.js';
var vs = `
attribute vec4 position;

uniform mat4 matrix;

varying vec2 v_texcoord;

void main() {
  gl_Position = matrix * position;
  v_texcoord = position.xy * .5 + .5;
}
`;

var colorFS = `
precision mediump float;

uniform vec4 color;

void main() {
  gl_FragColor = color;
}
`;

var mixFS = `
precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D tex1;
uniform sampler2D tex2;
const float PI = 3.1415926535;
void main() {
  // probably should use different texture coords for each
  // texture for more flexibility but I'm lazy

  float aperture = 178.0;
  float apertureHalf = 0.5 * aperture * (PI / 180.0);
  float maxFactor = sin(apertureHalf);
  
  vec2 uv;
  vec2 xy = 2.0 * v_texcoord.xy - 1.0;
  float d = length(xy);
  if (d < (2.0-maxFactor))
  {
    d = length(xy * maxFactor);
    float z = sqrt(1.0 - d * d);
    float r = atan(d, z) / PI;
    float phi = atan(xy.y, xy.x);
    
    uv.x = r * cos(phi) + 0.5;
    uv.y = r * sin(phi) + 0.5;
  }
  else
  {
    uv = v_texcoord.xy;
  }

  vec4 color1 = texture2D(tex1, uv);
  vec4 color2 = texture2D(tex2, uv);
  gl_FragColor = mix(color1, color2, 0.5);
}
`;

const gl = document.querySelector("canvas").getContext("webgl");
const colorProgram = twgl.createProgramFromSources(gl, [vs, colorFS]);
const mixProgram = twgl.createProgramFromSources(gl, [vs, mixFS]);

// make 2 textures by attaching them to framebuffers and rendering to them
const texFbPair1 = createTextureAndFramebuffer(gl, gl.canvas.width, gl.canvas.height);
const texFbPair2 = createTextureAndFramebuffer(gl,gl.canvas.width, gl.canvas.height);

const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
  -1,  1,
   1, -1,
   1,  1,
]), gl.STATIC_DRAW);

function setAttributes(buf, positionLoc) {
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
}
  
const colorPrgPositionLoc = gl.getAttribLocation(colorProgram, "position");
setAttributes(buf, colorPrgPositionLoc);
const colorLoc = gl.getUniformLocation(colorProgram, "color");
const colorProgMatrixLoc = gl.getUniformLocation(colorProgram, "matrix");

// draw red rect to first texture through the framebuffer it's attached to
gl.useProgram(colorProgram);
  
gl.bindFramebuffer(gl.FRAMEBUFFER, texFbPair1.fb);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.uniform4fv(colorLoc, [1, 0, 0, 1]);
gl.uniformMatrix4fv(colorProgMatrixLoc, false, [
  0.5, 0, 0, 0,
    0,.25, 0, 0,
    0, 0, 1, 0,
   .2,.3, 0, 1,
]);

gl.drawArrays(gl.TRIANGLES, 0, 6);

// Draw a blue rect to the second texture through the framebuffer it's attached to
gl.bindFramebuffer(gl.FRAMEBUFFER, texFbPair2.fb);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.uniform4fv(colorLoc, [0.5, 1, 1, 1]);
gl.uniformMatrix4fv(colorProgMatrixLoc, false, [
  0.25, 0, 0, 0,
    0,.5, 0, 0,
    0, 0, 1, 0,
   .2,.3, 0, 1,
]);

gl.drawArrays(gl.TRIANGLES, 0, 6);

// Draw both textures to the canvas
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
const mixPrgPositionLoc = gl.getAttribLocation(mixProgram, "position");
setAttributes(buf, mixPrgPositionLoc);
  
const mixProgMatrixLoc = gl.getUniformLocation(mixProgram, "matrix");

const tex1Loc = gl.getUniformLocation(mixProgram, "tex1");  
const tex2Loc = gl.getUniformLocation(mixProgram, "tex2");  
  
gl.useProgram(mixProgram);

gl.uniform1i(tex1Loc, 0);
gl.uniform1i(tex2Loc, 1);
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, texFbPair1.tex);
gl.activeTexture(gl.TEXTURE0 + 1);
gl.bindTexture(gl.TEXTURE_2D, texFbPair2.tex);
gl.uniformMatrix4fv(mixProgMatrixLoc, false, [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
]);  

gl.drawArrays(gl.TRIANGLES, 0, 6);

function createTextureAndFramebuffer(gl, width, height) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(
     gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return {tex: tex, fb: fb};
}