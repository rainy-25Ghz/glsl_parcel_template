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
  const programPostProcessingInfo = twgl.createProgramInfo(gl, [
    postVs,
    postFs,
  ]);

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
  const postArrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    // texcoord: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    texcoord: [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1],
  };
  const bufferInfoPost = twgl.createBufferInfoFromArrays(gl, postArrays);
  function createTexture(
    gl: WebGL2RenderingContext,
    width: number,
    height: number
  ) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  const texImg = createTexture(gl, gl.canvas.width, gl.canvas.height);
  const fb = gl.createFramebuffer();
  function setFramebuffer(
    fbo: WebGLFramebuffer,
    width: number,
    height: number
  ) {
    // make this the framebuffer we are rendering to.
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    const mipLevel = 0; //mipmap
    // Attach a texture to it.
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      attachmentPoint,
      gl.TEXTURE_2D,
      texImg,
      mipLevel
    );

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, width, height);
  }
  setFramebuffer(fb, gl.canvas.width, gl.canvas.height);
  const tex = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: [
      255, 255, 255, 255, 192, 192, 192, 255, 192, 192, 192, 255, 255, 255, 255,
      255,
    ],
  });

  const uniforms_3d: { [key: string]: any } = {
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

    uniforms_3d.u_viewInverse = camera;
    uniforms_3d.u_world = world;
    uniforms_3d.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
    uniforms_3d.u_worldViewProjection = m4.multiply(viewProjection, world);

    gl.useProgram(program3dInfo.program);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    twgl.setBuffersAndAttributes(gl, program3dInfo, bufferInfo);
    twgl.setUniforms(program3dInfo, uniforms_3d);
    setFramebuffer(fb, gl.canvas.width, gl.canvas.height);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    gl.useProgram(programPostProcessingInfo.program);
    const uniformsPost = {
      u_image: texImg,
    };
    twgl.setBuffersAndAttributes(gl, programPostProcessingInfo, bufferInfoPost);
    twgl.setUniforms(programPostProcessingInfo, uniformsPost);
    // 后处理特效
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); //把纹理渲染到canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, bufferInfoPost.numElements);

    requestAnimationFrame(render);
  }
  // render();
  requestAnimationFrame(render);
}

main();
