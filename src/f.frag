#version 300 es
precision highp float;

in vec4 v_position;
uniform vec2 u_resolution;//屏幕分辨率

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
//平面上任意一点投影到法向为一个常数
struct plane{
  vec3 normal;
  float c;
};
struct sphere{
  vec3 center;
  float radius;
};
struct ray{
  vec3 p;//光线起点
  vec3 d;//光线方向
  float t;//控制光路长度
};
// 起始点 时间 方向
vec3 getRay(ray r){
return r.p+r.t*r.d;
}

//对平面求交点 
float getRayPlaneT(ray r, plane p){
  return (p.c-dot(r.p,p.normal))/dot(r.d,p.normal);
}

vec4 pink=vec4(1.00, 0.83, 0.83, 1.0);
vec4 blue=vec4(0.63, 0.81, 1.00, 1.0);
vec3 camera=vec3(0,0,1);
sphere ball=sphere(vec3(0,0,0),10.0);
plane  ground=plane(vec3(0,1,0),0.1);
float thresh=0.000001;
void main() {
  // 生成初始射线 参见https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-generating-camera-rays/generating-camera-rays
  vec2 uv=gl_FragCoord.xy/u_resolution;//左下角为（0，0），右上角为（1，1）
  uv = uv * 2.0 - 1.0;// [0,1] to [-1,1] 
  uv.x *= u_resolution.x / u_resolution.y; //修正像素宽度，防止像素被拉长
  float fov=1.0;//fov为tan(π/2)
  uv *= fov;
  ray r;
  r.p= camera;
  vec3 target=vec3(uv,0);
  r.d=target-camera;


  //需要把纹理坐标转化为世界坐标系
  
  // vec3 target=vec3(uv.x*2.0-1.0,uv.y*2.0-1.0,0);
  // vec3 dir=normalize(target-camera);
  // ray r;
  // r.p=camera;
  // r.d=dir;
  // r.t=0.0;
  if(getRayPlaneT(r,ground)>thresh){
    outColor=vec4(1.0,1.0,0,0);
  }
  else{
    outColor=linearVertGradient(uv.y,pink,blue);
  } 
  // outColor=color;
}