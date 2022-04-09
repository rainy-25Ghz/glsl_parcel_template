#version 300 es
precision highp float;

in vec4 v_position;
in vec2 v_texCoord;
in vec3 v_normal;
in vec3 v_surfaceToLight;//表面到光源的向量
in vec3 v_surfaceToView;//表面到相机的向量

uniform vec3 u_lightColor;//光源颜色
uniform vec3 u_ambientColor;//环境光颜色
uniform vec3 u_specularColor;//高光颜色
uniform sampler2D u_tex;//纹理采样器
uniform vec4 u_color;//不使用纹理时，设置物体颜色为纯色
uniform bool  u_useTexture;//是否使用纹理
uniform float u_shininess;//闪光度，代表光滑程度，越光滑，高光面积越小

// uniform float u_specularFactor;//控制高光反射的系数

out vec4 outColor;


// incident 表面指向光源的向量,计算反射向量
vec3 reflect_(vec3 incident , vec3 normal){
  float dot_=2.0*dot(incident,normal);
  vec3 res=dot_*normal-incident;
  return res;
}
//glsl 有内置的reflect 这里练习用

void main() {
  vec3 lightDir=normalize(vec3(15,5,15));
  vec4 objectColor =u_useTexture?texture(u_tex, v_texCoord):u_color;//计算物体本身的颜色
  vec3 a_normal = normalize(v_normal);
  vec3 surfaceToView = normalize(v_surfaceToView);

  //计算环境光
  vec3 ambientColor = u_ambientColor;
  
  // 计算漫反射
  float cosTheta=dot(a_normal, lightDir);//求出光线与法线的夹角余弦
  float lambert = max(cosTheta, 0.0);
  vec3 lambertColor=lambert*objectColor.rgb;

  // 计算高光
  vec3 reflectVector = reflect(-lightDir,a_normal);//反射向量
  float cosPhi=dot(reflectVector,surfaceToView);//计算反射光与表面到相机向量的夹角余弦
  float specular = pow(max(cosPhi, 0.0), u_shininess);
  vec3 specularColor=specular*u_specularColor;
  
  vec3 result = ambientColor+lambertColor+specularColor;
  // result = pow(result, vec3(1.0 / 2.2) ); // gamma correction

  outColor= vec4(result.x,result.y,result.z,objectColor.a);//处理透明颜色的物体
  //我直接把其透明度保留，不参与光照计算，不知道对不对。。。
  
}