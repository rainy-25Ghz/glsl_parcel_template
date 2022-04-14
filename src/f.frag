#version 300 es
precision highp float;

in vec4 v_position;
uniform vec2 u_resolution;//屏幕分辨率

out vec4 outColor;

//
// Hash functions by Nimitz:
// https://www.shadertoy.com/view/Xt3cDn
//

uint base_hash(uvec2 p) {
    p = 1103515245U*((p >> 1U)^(p.yx));
    uint h32 = 1103515245U*((p.x)^(p.y>>3U));
    return h32^(h32 >> 16);
}

float g_seed = 0.;

vec2 hash2(inout float seed) {
    uint n = base_hash(floatBitsToUint(vec2(seed+=.1,seed+=.1)));
    uvec2 rz = uvec2(n, n*48271U);
    return vec2(rz.xy & uvec2(0x7fffffffU))/float(0x7fffffff);
}

vec3 hash3(inout float seed) {
    uint n = base_hash(floatBitsToUint(vec2(seed+=.1,seed+=.1)));
    uvec3 rz = uvec3(n, n*16807U, n*48271U);
    return vec3(rz & uvec3(0x7fffffffU))/float(0x7fffffff);
}


//平面上任意一点投影到法向为一个常数
struct Plane{
  vec3 normal;
  float c; //原点到平面的距离
};

struct Sphere{
  vec3 center;
  float radius;
};

struct Ray{
  vec3 origin;//光线起点
  vec3 dir;//光线方向
  float t;//控制光路长度
};

struct Intersection{
  vec3 position;
  vec3 normal;
};

// 起始点 时间 方向
vec3 getRay(Ray r){
  return r.origin+r.t*r.dir;
}

// 生成背景颜色
vec4 linearVertGradient(float yCoord, vec4 color_1,  vec4 color_2) {
  return mix(color_1, color_2, smoothstep(0.0,1.0 ,yCoord));
}

// //对平面求交点
// float getRayPlaneT(ray r, plane p){
//   return (p.c-dot(r.origin,p.normal))/dot(r.dir,p.normal);
// }
// //对球求交点
// bool getRaySphereT(ray r, sphere sphere,out float t ){
//   float a=dot(r.dir,r.dir);
//   float b=2.0*dot((r.origin-sphere.center),r.dir);
//   float c=dot(r.origin-sphere.center,r.origin-sphere.center)-pow(sphere.radius,2);
//   float delta=b*b-4*a*c;
//   if delta<0 return false;
// }
//计算用的极限值
float EPS=0.000001;
float INFINITY=9999999.0;
int samples=1000;//采样次数
int bounces=3;//反射次数

//场景设置
vec4 pink=vec4(1.00, 0.83, 0.83, 1.0);
vec4 blue=vec4(0.63, 0.81, 1.00, 1.0);
vec3 camera=vec3(0,0,1);
Sphere ball=Sphere(vec3(0,0,0),10.0);
Plane  ground=Plane(vec3(0,1,0),0.1);

// 生成初始射线
Ray getInitRay(vec2 uv){
  uv = uv * 2.0 - 1.0;// [0,1] to [-1,1] 
  uv.x *= u_resolution.x / u_resolution.y; //修正像素宽度，防止像素被拉长
  float fov=1.0;//fov为tan(π/2)
  uv *= fov;
  Ray r;
  r.origin= camera;
  vec3 target=vec3(uv,0);
  r.dir=normalize(target-camera);
  return r;
}

void main() {
  // 生成初始射线 参见https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-generating-camera-rays/generating-camera-rays
  vec2 uv=gl_FragCoord.xy/u_resolution;//左下角为（0，0），右上角为（1，1）
  Ray r=getInitRay(uv);
  //对场景每个物体光线求交
  while()

  outColor=linearVertGradient(uv.y,pink,blue);
  float t = .5*r.direction.y + .5;
            col *= mix(vec3(1),vec3(.5,.7,1), t);
            return col;
 
}