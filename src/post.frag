#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
in vec2 v_texcoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec2 threePixel = vec2(3) / vec2(textureSize(u_image, 0));
    // outColor = vec4(0.5,1.0,0.1,0.5);
  float r = texture(u_image, v_texcoord+threePixel).x;
  float g = texture(u_image, v_texcoord).y;
  float b = texture(u_image, v_texcoord).z;
  outColor = vec4(r, g, b, 1);
}