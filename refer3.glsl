// Decrease for faster final result. Increase for a less noisey result.
// #define MAX_WEIGHT 200

#define MAX_BOUNCES 10
#define NUM_SPHERES 5 //球体个数
#define SAMPLES 1 //采样数

#define PI  3.14159265359
#define PI2 6.28318530717


#define LAMB 0
#define METAL 1
#define DIEL 2 //电介质材料，可以理解为透明材料

const float GAMMA = 2.2;

struct Material {
	int type;
    vec3 albedo;//反射率
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
    
Sphere scene[NUM_SPHERES];

//种子
float seed = 0.0;
vec2 UV = vec2(0.0);
// 随机数
float random() {
	return fract(sin(dot(UV, vec2(12.9898, 78.233)) + seed++) * 43758.5453);
}
//随机单位向量
vec3 randomUnitVector() {
	float theta = random() * PI2;
    float z = random() * 2.0 - 1.0;
    float a = sqrt(1.0 - z * z);
    vec3 vector = vec3(a * cos(theta), a * sin(theta), z);
    return vector * sqrt(random());
}

vec3 rayPointAt(Ray ray, float t) {
 	return ray.origin + t * ray.direction;   
}

//处理折射问题
float schlick(float cosine, float IOR) {
 	float r0 = (1.0 - IOR) / (1.0 + IOR);
    r0 *= r0;
    return r0 + (1.0 - r0) * pow(1.0 - cosine, 5.0);
}


// Ray tracing function.
bool hitScene(Ray ray, float tMin, float tMax,
              out vec3 position, out vec3 normal, out Material material)
{
    float closestSoFar = tMax;//最近的交点的t
    bool hitAnything = false;
    
    for (int i = 0; i < NUM_SPHERES; i++) {
     	Sphere sphere = scene[i];
        
        vec3 oc = ray.origin - sphere.center;
        float a = dot(ray.direction, ray.direction);
        float b = dot(oc, ray.direction);
        float c = dot(oc, oc) - sphere.radius * sphere.radius;
        float discriminant = b * b - a * c;
        
        if (discriminant > 0.0001) {
			float t = (-b - sqrt(discriminant)) / a;
            if (t < tMin) {
                t = (-b + sqrt(discriminant)) / a;
            }
            
            if (t > tMin && t < closestSoFar) {
                closestSoFar = t;
                hitAnything = true;
                
                vec3 p = rayPointAt(ray, t);
                position = p;
                normal = (p - sphere.center) / sphere.radius;
                material = sphere.material;
            }
        }
    }
 	return hitAnything;
}

//追踪一条光线
vec3 trace(Ray ray) {
  	// Pass these to the `hitScene` function.
    vec3 normal, position;
    Material material;
    
    vec3 color = vec3(0.0);
    vec3 mask = vec3(1.0);
        
    for (int b = 0; b < MAX_BOUNCES; b++) {
        if (hitScene(ray, 0.001, 5000.0, position, normal, material)) {
            if (material.type == LAMB) {
                //处理漫反射材质
                //反射方向随机散射
                vec3 direction = normal + randomUnitVector();
                //反射光线
                ray = Ray(position, direction);
                // 颜色按照反射率衰减
                color *= material.albedo * mask;
                mask *= material.albedo;
            }
            else if (material.type == METAL) {
                vec3 reflected = reflect(ray.direction, normal);//反射光方向
                vec3 direction = randomUnitVector() * material.parameter + reflected;//这个parameter可以理解为金属的粗糙度，会让镜面反射散射一些。
                
                //如果反射方向与法线在同一侧，那么反射，否则不考虑
                if (dot(direction, normal) > 0.0) {
               		ray = Ray(position, direction);
                	color *= material.albedo * mask;
               	 	mask *= material.albedo;
                }
            }
            else if (material.type == DIEL) {
                vec3 reflected = reflect(ray.direction, normal);
                vec3 attenuation = vec3(1.0);
                
                vec3 refracted, outwardNormal;
                float eta, reflectProb, cosine;
                
                float dt = dot(ray.direction, normal);
                
                if (dt > 0.0) {
					outwardNormal = -normal;
                    eta = material.parameter;
                    cosine = eta * dt / length(ray.direction);
                }
                else {
                    outwardNormal = normal;
                    eta = 1.0 / material.parameter;
                    cosine = -dt / length(ray.direction);
                }
                
                refracted = refract(normalize(ray.direction), normalize(outwardNormal), eta);
                if (all(notEqual(refracted, vec3(0.0)))) {
                    reflectProb = schlick(cosine, material.parameter);
                }
                else {
                	reflectProb = 1.0;
                }
                
                if (random() < reflectProb) {
                    ray = Ray(position, reflected);
                }
                else {
                    ray = Ray(position, refracted);
                }
                
                color *= mask * attenuation;
                mask *= attenuation;
            }
        }
        else {
            vec3 skyColor = texture(iChannel1, -ray.direction).rgb;
            skyColor = pow(skyColor, vec3(GAMMA));
            color = mask * skyColor;
        }
    }
        
 	return color;
}

void initScene() {
	scene[0] = Sphere(vec3(0, 1, 0), 1.0, Material(LAMB, vec3(0, 0.9, 0.05), 0.0));
    scene[1] = Sphere(vec3(0, 1, 2.5), 1.0, Material(METAL, vec3(0.9, 0.9, 0.9), 0.01));
    scene[2] = Sphere(vec3(0, 1, -2.5), 1.0, Material(DIEL, vec3(0, 0, 0), 1.5));
    scene[3] = Sphere(vec3(0, 1, -2.5), -0.92, Material(DIEL, vec3(0.9, 0.9, 0.9), 1.5));
    scene[3] = Sphere(vec3(0, -1e3, 0), 1e3, Material(METAL, vec3(0.7, 0.75, 0.8), 0.4));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    initScene();
    
    seed = iTime;
    
    UV = fragCoord / iResolution.xy;
    vec2 pixelSize = vec2(1.0) / iResolution.xy;
    
    float ratio = iResolution.x / iResolution.y;
    
    const float fov = 80.0;
    float halfWidth = tan(radians(fov) * 0.5);
    float halfHeight = halfWidth / ratio;
    
    // Camera vectors.
    const float dist = 6.5;
    vec2 mousePos = iMouse.xy / iResolution.xy;  
    if (all(equal(mousePos, vec2(0.0)))) {
        mousePos = vec2(0.55, 0.2); // Default position.
    }
    
    float x = cos(mousePos.x * 10.0) * dist;
    float z = sin(mousePos.x * 10.0) * dist;
    float y = mousePos.y * 10.0;
        
    vec3 origin = vec3(x, y, z);
    vec3 lookAt = vec3(0.0, 1.0, 0.0);
    vec3 upVector = vec3(0.0, 1.0, 0.0);
    
    vec3 w = normalize(origin - lookAt);
    vec3 u = cross(upVector, w);
    vec3 v = cross(w, u);
        
    vec3 lowerLeft = origin - halfWidth * u - halfHeight * v - w;
    vec3 horizontal = u * halfWidth * 2.0;
    vec3 vertical = v * halfHeight * 2.0;
        
    vec3 color = vec3(0.0);
    
    for (int s = 0; s < SAMPLES; s++) {        
     	vec3 direction = lowerLeft - origin; 
        direction += horizontal * (pixelSize.x * random() + UV.x);
        direction += vertical * (pixelSize.y * random() + UV.y);
        color += trace(Ray(origin, direction));
    }
    
    color /= float(SAMPLES);
    
    // Gamma correct.
    color = pow(color, vec3(1.0 / GAMMA));
       
    vec3 previousColor = texture(iChannel0, UV).rgb;
    
    float weight = min(float(iFrame + 1), float(MAX_WEIGHT));
    
    // Reset weight on interaction.
    if (!all(lessThanEqual(iMouse.zw, vec2(0.0)))) {
        weight = 1.0;
    }
    
    vec3 newColor = mix(previousColor, color, 1.0 / weight);
    
    fragColor = vec4(newColor, 1.0);
    //fragColor = vec4(color, 1.0);
}