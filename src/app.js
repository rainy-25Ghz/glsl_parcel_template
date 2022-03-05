
import fs from './f.frag';
import vs from './v.vert'


function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Tell the twgl to match position with a_position, n
  // normal with a_normal etc..
  twgl.setAttributePrefix("a_");

  // a single triangle
  let arrays = {
     position: { numComponents: 3, data: [0, -10, 0, 10, 10, 0, -10, 10, 0], },
     texcoord: { numComponents: 2, data: [0.5, 0, 1, 1, 0, 1],               },
     normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1],        },
  };
  let bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  // setup GLSL program
  let program = twgl.createProgramFromSources(gl, [vs, fs]);
  let uniformSetters = twgl.createUniformSetters(gl, program);
  let attribSetters  = twgl.createAttributeSetters(gl, program);

  let vao = twgl.createVAOFromBufferInfo(
      gl, attribSetters, bufferInfo);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  let fieldOfViewRadians = degToRad(60);

  let uniformsThatAreTheSameForAllObjects = {
    u_lightWorldPos:         [-50, 30, 100],
    u_viewInverse:           m4.identity(),
    u_lightColor:            [1, 1, 1, 1],
  };

  let uniformsThatAreComputedForEachObject = {
    u_worldViewProjection:   m4.identity(),
    u_world:                 m4.identity(),
    u_worldInverseTranspose: m4.identity(),
  };

  let rand = function(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + Math.random() * (max - min);
  };

  let randInt = function(range) {
    return Math.floor(Math.random() * range);
  };

  let textures = [
    textureUtils.makeStripeTexture(gl, { color1: "#FFF", color2: "#CCC", }),
    textureUtils.makeCheckerTexture(gl, { color1: "#FFF", color2: "#CCC", }),
    textureUtils.makeCircleTexture(gl, { color1: "#FFF", color2: "#CCC", }),
  ];

  let objects = [];
  let numObjects = 300;
  let baseColor = rand(240);
  for (let ii = 0; ii < numObjects; ++ii) {
    objects.push({
      radius: rand(150),
      xRotation: rand(Math.PI * 2),
      yRotation: rand(Math.PI),
      materialUniforms: {
        u_colorMult:             chroma.hsv(rand(baseColor, baseColor + 120), 0.5, 1).gl(),
        u_diffuse:               textures[randInt(textures.length)],
        u_specular:              [1, 1, 1, 1],
        u_shininess:             rand(500),
        u_specularFactor:        rand(1),
      },
    });
  }

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
    time = 5 + time * 0.0001;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);

    // Compute the projection matrix
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    let cameraPosition = [0, 0, 100];
    let target = [0, 0, 0];
    let up = [0, 1, 0];
    let cameraMatrix = m4.lookAt(cameraPosition, target, up, uniformsThatAreTheSameForAllObjects.u_viewInverse);

    // Make a view matrix from the camera matrix.
    let viewMatrix = m4.inverse(cameraMatrix);

    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    gl.useProgram(program);

    // Setup all the needed attributes.
    gl.bindVertexArray(vao);

    // Set the uniforms that are the same for all objects.
    twgl.setUniforms(uniformSetters, uniformsThatAreTheSameForAllObjects);

    // Draw objects
    objects.forEach(function(object) {

      // Compute a position for this object based on the time.
      let worldMatrix = m4.identity();
      worldMatrix = m4.yRotate(worldMatrix, object.yRotation * time);
      worldMatrix = m4.xRotate(worldMatrix, object.xRotation * time);
      worldMatrix = m4.translate(worldMatrix, 0, 0, object.radius,
         uniformsThatAreComputedForEachObject.u_world);

      // Multiply the matrices.
      m4.multiply(viewProjectionMatrix, worldMatrix, uniformsThatAreComputedForEachObject.u_worldViewProjection);
      m4.transpose(m4.inverse(worldMatrix), uniformsThatAreComputedForEachObject.u_worldInverseTranspose);

      // Set the uniforms we just computed
      twgl.setUniforms(uniformSetters, uniformsThatAreComputedForEachObject);

      // Set the uniforms that are specific to the this object.
      twgl.setUniforms(uniformSetters, object.materialUniforms);

      // Draw the geometry.
      gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
    });

    requestAnimationFrame(drawScene);
  }
}

main();