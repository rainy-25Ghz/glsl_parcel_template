#version 300 es
precision highp float;

uniform vec2 res;
uniform float u_time;

uniform sampler2D u_tex;//纹理采样器


out vec4 outColor;

void main() {
  vec2 uv= gl_FragCoord.xy/res;
  uv=vec2(uv.x,1.0-uv.y);
  outColor=texture(u_tex,uv);
}