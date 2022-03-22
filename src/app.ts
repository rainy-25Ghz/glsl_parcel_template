import fs from "./fs.frag";
import vs from "./vs.vert";
import postFs from "./post.frag";
import postVs from "./post.vert";
import * as twgl from "../node_modules/twgl.js/dist/4.x/twgl-full";

function main() {
  const { m4 } = twgl;
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  let canvas = document.querySelector("#canvas") as HTMLCanvasElement;
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
  const program3dInfo = twgl.createProgramInfo(gl, [vs, fs]);
  const programPostProcessingInfo=twgl.createProgramInfo(gl,[postVs,postFs]);

  // Tell the twgl to match position with a_position, n
  // normal with a_normal etc..
  twgl.setAttributePrefix("a_");

  // a single cube
  const arrays = {
    position: [
      1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1,
      -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1,
      1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1,
      1, -1, 1, -1, -1, -1, -1, -1,
    ],
    normal: [
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
      -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
      0, 0, -1,
    ],
    texcoord: [
      1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1,
      0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
    ],
    indices: [
      0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12,
      14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
    ],
  };
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  const tex = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: [
      255, 255, 255, 255, 192, 192, 192, 255, 192, 192, 192, 255, 255, 255, 255,
      255,
    ],
  });
  const uniforms: { [key: string]: any } = {
    u_lightWorldPos: [1, 8, -10],
    u_lightColor: [1, 0.8, 0.8, 1],
    u_ambient: [0, 0, 0, 1],
    u_specular: [1, 1, 1, 1],
    u_shininess: 50,
    u_specularFactor: 1,
    u_diffuse: tex,
  };

  function render(time) {
    time *= 0.001;
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fov = (30 * Math.PI) / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.5;
    const zFar = 1000;
    const projection = m4.perspective(fov, aspect, zNear, zFar);
    const eye = [1, 8, -26];
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    const viewProjection = m4.multiply(projection, view);
    const world = m4.rotationY(time);

    uniforms.u_viewInverse = camera;
    uniforms.u_world = world;
    uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
    uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);

    gl.useProgram(program3dInfo.program);
    twgl.setBuffersAndAttributes(gl, program3dInfo, bufferInfo);
    twgl.setUniforms(program3dInfo, uniforms);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
