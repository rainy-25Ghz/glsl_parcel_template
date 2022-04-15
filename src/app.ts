import fs from "./f.frag";
import vs from "./v.vert";
import * as twgl from "../node_modules/twgl.js/dist/4.x/twgl-full";
import obj from "bundle-text:./teapot.obj";
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

    // Tell the twgl to match position with a_position, n
    // normal with a_normal etc..
    twgl.setAttributePrefix("a_");

    const bufferInfo = twgl.createBufferInfoFromArrays(gl, info_);

    // const red = [1.0, 0, 0, 1];
    let uniforms: { [key: string]: any } = {
        u_resolution: [canvas.width, canvas.height],
        // u_lightWorldPos: [0, 2.0, 15],
        // u_lightColor: [1, 1, 1],
        // u_ambientColor: [0.05, 0.05, 0.05],
        // u_specularColor: [1, 1, 1],
        // u_shininess: 40,
        // u_color: red,
        // u_useTexture: true,
        // u_tex: twgl.createTexture(gl, {
        //   min: gl.LINEAR,
        //   mag: gl.LINEAR,
        //   src: img,
        // }),
    };
    const lastFrameCanvasData=canvas.cloneNode()
    function render(time:number) {
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const {texture,fb}=createTextureAndFramebuffer(gl,gl.canvas.width,gl.canvas.height);
        // const fov = (30 * Math.PI) / 180;
        // const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        // const zNear = 0.5;
        // const zFar = 1000;
        // const projection = m4.perspective(fov, aspect, zNear, zFar);
        // const eye = [1, 8, 100];
        // const target = [0, 0, 0];
        // const up = [0, 1, 0];

        // const camera = m4.lookAt(eye, target, up);
        // const view = m4.inverse(camera);
        // const viewProjection = m4.multiply(projection, view);
        // const world = m4.rotationY(time);

        // uniforms.u_viewInverse = camera;
        // uniforms.u_world = world;
        // uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
        // uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);
        uniforms['time']=time;
        gl.useProgram(programInfo.program);
        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
        twgl.setUniforms(programInfo, uniforms);
        gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
// img.addEventListener("load", main);
main();
