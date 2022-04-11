#version 300 es
precision highp float;

in vec4 v_position;
in vec2 v_texCoord;
// in vec3 v_normal;
// in vec3 v_surfaceToLight;//表面到光源的向量
// in vec3 v_surfaceToView;//表面到相机的向量

// uniform vec3 u_lightColor;//光源颜色
// uniform vec3 u_ambientColor;//环境光颜色
// uniform vec3 u_specularColor;//高光颜色
// uniform sampler2D u_tex;//纹理采样器
// uniform vec4 u_color;//不使用纹理时，设置物体颜色为纯色
// uniform bool  u_useTexture;//是否使用纹理
// uniform float u_shininess;//闪光度，代表光滑程度，越光滑，高光面积越小

// uniform float u_specularFactor;//控制高光反射的系数

out vec4 outColor;

vec4 linearVertGradient(float yCoord, vec4 color_1,  vec4 color_2) {
  return mix(color_1, color_2, smoothstep(0.0,1.0 ,yCoord));
}

vec4 pink=vec4(1.00, 0.83, 0.83, 1.0);
vec4 blue=vec4(0.63, 0.81, 1.00, 1.0);
void main() {
  vec2 uv=v_texCoord;
  outColor= linearVertGradient(uv.y,pink,blue);
}