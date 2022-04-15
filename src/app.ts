import fs from "./f.frag";
import fs_gamma from "./gamma.frag";
import vs from "./v.vert";
import * as twgl from "../node_modules/twgl.js/dist/4.x/twgl-full";
import { ObjMesh } from "./obj";
let img = document.createElement("img");
const url = new URL("bricks.png", import.meta.url);
img.src = url.pathname;
 //framebuffer与attach到fbo上的texture
 function createTextureAndFramebuffer(gl:WebGL2RenderingContext, width:number, height:number) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
       gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return {texture: tex, fb: fb};
  }
function main() {
    const info_ = {
        position: [-1, 3, 0, -1, -1, 0, 3, -1, 0],
        texcoord: [0, 2, 0, 0, 2, 0],
    };
    const { m4 } = twgl;

    let canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }
    const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    const programPostProcessingInfo = twgl.createProgramInfo(gl, [
        vs,
        fs_gamma,
      ]);
    // Tell the twgl to match position with a_position, n
    // normal with a_normal etc..
    twgl.setAttributePrefix("a_");

    const bufferInfo = twgl.createBufferInfoFromArrays(gl, info_);

    // const red = [1.0, 0, 0, 1];
    let uniforms: { [key: string]: any } = {
        u_resolution: [canvas.width, canvas.height],
    };
    let frame=1;
    let prevFrameTexture:WebGLTexture;
    const lastFrameCanvasData=canvas.cloneNode();

    function render(time:number) {
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        uniforms['time']=time;
        gl.useProgram(programInfo.program);
        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
        twgl.setUniforms(programInfo, uniforms);
        const {texture,fb}=createTextureAndFramebuffer(gl,gl.canvas.width,gl.canvas.height);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);

        //后处理 伽马矫正
        gl.useProgram(programPostProcessingInfo.program);
        const new_uniforms={
            frame:frame,
            time:time,
            u_resolution:[canvas.width, canvas.height],
            tex:frame===1?texture:prevFrameTexture,
            tex2:texture,//当前的纹理
        }
        twgl.setBuffersAndAttributes(gl, programPostProcessingInfo, bufferInfo);
        twgl.setUniforms(programPostProcessingInfo, new_uniforms);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
        frame++;
        prevFrameTexture=texture;
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
// img.addEventListener("load", main);
main();
