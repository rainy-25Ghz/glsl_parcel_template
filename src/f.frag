#version 300 es
precision highp float;


//计算用的常量
#define PI  3.14159265359
#define PI2 6.28318530717
#define LAMBERT 0 
#define METAL 1
#define GLASS 2
#define GAMMA  2.2
float EPS=0.000001;
float INFINITY=9999999.0;
int samples=1000;//采样次数
int bounces=3;//反射次数


in vec4 v_position;
uniform float time;
uniform vec2 u_resolution;//屏幕分辨率
out vec4 outColor;

float seed = 0.0;
//随机数
float random() {
	return fract(sin(dot(vec2(0.0), vec2(12.9898, 78.233)) + seed++) * 43758.5453);
}

//随机单位向量
vec3 randomUnitVector() {
	float theta = random() * PI2;
  float z = random() * 2.0 - 1.0;
  float a = sqrt(1.0 - z * z);
  vec3 vector = vec3(a * cos(theta), a * sin(theta), z);
  return vector * sqrt(random());
}

//材料、球、光线
struct Material {
	int type;
  vec3 albedo;
  float parameter;
};
    
struct Sphere {
	vec3 center;
  float radius;
  Material material;
};
    
struct Ray {
  vec3 origin;
  vec3 direction;
};
//场景由球体组成   
Sphere scene[3];

// 获取ray上的某个点
vec3 rayPointAt(Ray r,float t){
  return r.origin+t*r.direction;
}

// 生成背景颜色
vec4 linearVertGradient(float yCoord, vec4 color_1,  vec4 color_2) {
  return mix(color_1, color_2, smoothstep(0.0,1.0 ,yCoord));
}


//对球求交点
bool hitSphereT(Ray r,float tMin, float tMax, 
Sphere sphere,
out vec3 position, 
out vec3 normal, 
out Material material ){
  vec3 co = r.origin - sphere.center;
  
  float b=dot(co,r.direction);
  float c=dot(co,co)-sphere.radius*sphere.radius;
  float delta=b*b-c;
  if (delta<EPS){ 
    return false;
  }
  delta=sqrt(delta);
  float t1 = -b - delta;
  if(t1>EPS){

    return true;
  }
  float t2 = -b + delta;
  if(t2>EPS){

    return true;
  }
  return false;
}


//场景设置
vec4 pink=vec4(1.00, 0.83, 0.83, 1.0);
vec4 blue=vec4(0.63, 0.81, 1.00, 1.0);
vec3 camera=vec3(0,0,1);

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
  //对地面求交


  outColor=linearVertGradient(uv.y,pink,blue);
  float t = .5*r.direction.y + .5;
            col *= mix(vec3(1),vec3(.5,.7,1), t);
            return col;
 
}