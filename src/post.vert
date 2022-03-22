#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec2 a_texcoord;

// Used to pass in the resolution of the canvas
// uniform vec2 u_resolution;
// uniform float u_flipY;

// Used to pass the texture coordinates to the fragment shader
out vec2 v_texcoord;

// all shaders have a main function
void main() {

  // // convert the position from pixels to 0.0 to 1.0
  // vec2 zeroToOne = a_position ;

  // // convert from 0->1 to 0->2
  // vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  // vec2 clipSpace = a_position;

// // 由于画布canvas的y轴方向与webgl裁剪坐标系y轴方向不一致，需要翻转一下
  gl_Position = a_position;

  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texcoord = a_texcoord;
}