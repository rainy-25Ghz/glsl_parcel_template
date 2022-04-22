import fs from "./f.frag";
import vs from "./v.vert";
import * as twgl from "../node_modules/twgl.js/dist/4.x/twgl-full";
let video = document.getElementById("origin") as HTMLVideoElement;
const url = new URL("cateye.mp4", import.meta.url);
video.src = url.pathname;

let btn=document.getElementById("btn");
btn.onclick=()=>{
  video.play();
  main();
}
function main() {
  const postArrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    texcoord: [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1],
  };
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  let canvas = document.querySelector("#canvas") as HTMLCanvasElement;
  let gl = canvas.getContext("webgl2");

  if (!gl) {
    return;
  }
  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  // Tell the twgl to match position with a_position, n
  // normal with a_normal etc..
  twgl.setAttributePrefix("a_");
  
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, postArrays);
  
  // const red = [1.0, 0, 0, 1];
  const uniforms: { [key: string]: any } = {
    res:[canvas.width,canvas.height],
    u_tex:null,
  };

  function render(time) {
    const texture= twgl.createTexture(gl, {
      min: gl.LINEAR,
      mag: gl.LINEAR,
      width:gl.canvas.width,
      height:gl.canvas.height,
      src: null,
    });
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
    uniforms.u_tex=texture;
    uniforms.u_time=time*0.001;
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    console.log(uniforms);
    gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
    gl.deleteTexture(texture);
    requestAnimationFrame(render);
  }
  // video.addEventListener("load", render);
   requestAnimationFrame(render);
} 

