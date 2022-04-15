#version 300 es
precision highp float;

#define MAX_WEIGHT 10

#define MAX_DISTANCE 50.0

#define SAMPLES 2
#define MAX_BOUNCES 15
#define NUM_SPHERES 7

#define PI  3.14159265359
#define PI2 6.28318530717

// Materials
#define LAMB 0
#define METAL 1
#define DIEL 2
#define EMISSIVE 3


in vec4 v_position;
uniform float time;
uniform vec2 u_resolution;//屏幕分辨率
out vec4 outColor;
// Comment to stop.
//#define MOVEMENT

const float GAMMA = 2.2;
//场景设置
vec4 pink=vec4(1.00, 0.83, 0.83, 1.0);
vec4 blue=vec4(0.63, 0.81, 1.00, 1.0);
// 生成背景颜色
vec4 linearVertGradient(float yCoord, vec4 color_1,  vec4 color_2) {
  return mix(color_1, color_2, smoothstep(0.0,1.0 ,yCoord));
}
///-- Scene Objects -------------------------------------------------------

struct Material
{
	int type;
    vec3 albedo;
    
    // value corresponds to a material. 
    //
    // Roughness for metal.
    // Refract index for dielectrics.
    // Color multiplier for current fake emission mat.
    float v; 
};
    
struct Sphere
{
	vec3 c;
    float r;
    Material mat;
};

// Just for the sake of simplicity.
struct Ray 
{
    vec3 origin;
    vec3 direction;
};
    
// Spheres on scene declaration.
Sphere scene[NUM_SPHERES];

///-------------------------------------------------------------------------

///-- Helper Functions -----------------------------------------------------
    
float seed = 0.0;
vec2 UV = vec2(0.0);

float random() 
{
	return fract(sin(dot(UV, vec2(12.9898, 78.233)) + seed++) * 43758.5453);
}

// We use it for ray scattering.
vec3 randomUnitVector() 
{
	float theta = random() * PI2;
    float z = random() * 2.0 - 1.0;
    float a = sqrt(1.0 - z * z);
    vec3 vector = vec3(a * cos(theta), a * sin(theta), z);
    return vector * sqrt(random());
}

// The point where we intersected something.
vec3 getHitPoint(Ray ray, float t) 
{
 	return ray.origin + t * ray.direction;   
}

// Shlick's formula for transparent materials like glass.
float schlick(float cosine, float IOR) 
{
 	float r0 = (1.0 - IOR) / (1.0 + IOR);
    r0 *= r0;
    return r0 + (1.0 - r0) * pow(1.0 - cosine, 5.0);
}

///--------------------------------------------------------------------------

///-- MAIN FUNCTIONS --------------------------------------------------------

// Ray tracing function.
bool hitScene(Ray ray, float tMin, float tMax,
              out vec3 position, out vec3 normal, out Material material)
{
    // By default we assume that we are at max distance
    // and didn't hit anything.
    float closestSoFar = tMax;
    bool isHit = false;
    
    // Intersection with spheres.
    // Looping through all, caching the closest 't' point.
    // which is a distance from ray origin and later used to get hit point.
    for (int i = 0; i < NUM_SPHERES; i++) 
    {
        Sphere sphere = scene[i];
        
        // Sphere intersection formula.
        vec3 oc = ray.origin - sphere.c;
        float a = dot(ray.direction, ray.direction);
        float b = dot(oc, ray.direction);
        float c = dot(oc, oc) - sphere.r * sphere.r;
        float discriminant = b * b - a * c;
        
        if (discriminant > 0.0001) 
        {
            // We only need the closer side of a sphere.
			float t = (-b - sqrt(discriminant)) / a;
            
            if (t < tMin) 
            {
                t = (-b + sqrt(discriminant)) / a;
            }
            
            // If we hit sphere, which is closest so far,
            // we set it to closest, and re-set output
            // materials and other stuff.
            if (t > tMin && t < closestSoFar) 
            {
                closestSoFar = t;
                isHit = true;
                
                vec3 p = getHitPoint(ray, t);
                position = p;
                normal = (p - sphere.c) / sphere.r;
                material = sphere.mat;
            }
        }
    }
    
    return isHit;
}

// Main tracing function.
vec3 trace(Ray ray) 
{
    vec3 normal, position;
    Material material;
    
    vec3 color = vec3(0.0);
    vec3 attenuation = vec3(1.0);
       
    // So for each bounce, we try to hit anything
    // on the scene (spheres only yet), and then we 
    // apply the material of that object to properly
    // color it. After all (when the bounce hit nothing)
    // we multiply the rest of attenuation by "sky" color.
    for (int b = 0; b < MAX_BOUNCES; b++) 
    {
        if (hitScene(ray, 0.001, MAX_DISTANCE, position, normal, material)) 
        {
            // Lambertian material.
            if (material.type == LAMB) 
            {
                vec3 direction = normal + randomUnitVector();
                if (dot(direction, normal) > 0.0){
                ray = Ray(position, direction);
                color *= material.albedo * attenuation;
                attenuation *= material.albedo;}
            }
            
            // Metallic material.
            else if (material.type == METAL)
            {
                vec3 reflected = reflect(ray.direction, normal);
                vec3 direction = randomUnitVector() * material.v + reflected;
                
                if (dot(direction, normal) > 0.0) 
                {
               		ray = Ray(position, direction);
                	color *= material.albedo * attenuation;
               	 	attenuation *= material.albedo;
                }
            }
            
            // Dielectric material.
            else if (material.type == DIEL)
            {
                 vec3 outward_normal;
                 vec3 reflected = reflect(ray.direction, normal);
                 float ni_over_nt;

                 vec3 refracted;
                 
                 attenuation = vec3(1.0, 1.0, 1.0); 
                
                 float reflect_prob;
                 float cosine;

                 if (dot(ray.direction, normal) > 0.) 
                 {
                      outward_normal = -normal;
                      ni_over_nt = material.v;
                      cosine = dot(ray.direction, normal) / length(ray.direction);
                      cosine = sqrt(1. - material.v * material.v * (1. - cosine * cosine));
                 }
                
                 else 
                 {
                      outward_normal = normal;
                      ni_over_nt = 1.0 / material.v;
                      cosine = -dot(ray.direction, normal) / length(ray.direction);
                 }

                 refracted = refract(normalize(ray.direction), normalize(outward_normal), ni_over_nt);
                 if (length(refracted) > 0.0) 
                 {
                     reflect_prob = schlick(cosine, material.v);
                 }


                 else reflect_prob = 1.0;

                 if (random() < reflect_prob)
                    ray = Ray(position, reflected);

                 else ray = Ray(position, refracted);

                 color *= material.albedo * attenuation;
                 attenuation *= material.albedo;
            }
            
            // Emissive material. (WIP)
            // Obviously emissiveness doesn't work like this.
            // And i'm not yet sure how it should be properly
            // implemented, but i like the simplicity of a fake.
            else if (material.type == EMISSIVE)
            {
                vec3 direction = normal + randomUnitVector();
                ray = Ray(position, direction);                
                color *= material.albedo * attenuation;
                attenuation *= material.albedo * material.v;
            }
        }
        
        // At the end we mix with "sky" color which is an iChannel1.
        else 
        {   
            float t = .5*ray.direction.y + .5;
            vec3 skyColor = linearVertGradient(t,pink,blue).rgb;
            skyColor = pow(skyColor, vec3(GAMMA));
            color = attenuation * skyColor;
        }
    }
    
    return color;
}

///-------------------------------------------------------------------------

// Putting it all somewhere on the scene.
void SceneFill() 
{
    // Main spheres.
	scene[0] = Sphere(vec3(0.0, 1.0, 3.0), 1.0, Material(LAMB, vec3(0., 0.9, 0.9), 0.0));
    scene[1] = Sphere(vec3(0.0, 1.0, 0.0), 1.0, Material(METAL, vec3(0.9, 0.9, 0.9), 0.5));
    scene[2] = Sphere(vec3(0.0, 4.0, -3.0), 1.0, Material(DIEL, vec3(0.9, 0.9, 0.9), 1.517));
    // Negative radius hack sphere inside main (DIEL) one for correct reflection.
   // scene[3] = Sphere(vec3(0.0, 1.0, -3.0), -0.9, Material(DIEL, vec3(0.9, 0.9, 0.9), 1.517));
    
    //scene[4] = Sphere(vec3(0.0, 0.3, -1.5), 0.3, Material(EMISSIVE, vec3(0.83, 0.2, 0.2), 20.));
    //scene[5] = Sphere(vec3(0.0, 0.3, 1.5), 0.3, Material(EMISSIVE, vec3(0.2, 0.83, 0.2), 20.));
    
    // A thin metal disk under main spheres, play with roughness!
    scene[6] = Sphere(vec3(0., -1e3, 0.), 1e3, Material(METAL, vec3(0.7, 0.75, 0.8), 0.25));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Initialization and seed.
    SceneFill();
    seed = iTime;
    
   vec2 uv=gl_FragCoord.xy/u_resolution;//左下角为（0，0），右上角为（1，1）
    
    // Basic normalization.
    UV = fragCoord / iResolution.xy;
    vec2 pixelSize = vec2(1.0) / iResolution.xy;
    
    float aspect = iResolution.x / iResolution.y;
    
    // Camera stuff taken from https://www.shadertoy.com/view/ldtSR2.
    const float fov = 80.0;
    float halfWidth = tan(radians(fov) * 0.5);
    float halfHeight = halfWidth / aspect;
    
    const float dist = 7.5;
    vec2 mousePos = iMouse.xy / iResolution.xy;  
    
    if (all(equal(mousePos, vec2(0.0)))) 
    {
        mousePos = vec2(0.63, 0.27); // Default position.
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
    
    // We add random amount for a better AA. More samples - smoother.
    for (int s = 0; s < SAMPLES; s++) 
    {        
     	vec3 direction = lowerLeft - origin;
        direction += horizontal * (pixelSize.x * random() + UV.x);
        direction += vertical * (pixelSize.y * random() + UV.y);
        color += trace(Ray(origin, direction));
    }
    
    color /= float(SAMPLES);
    /*
    vec3 previousColor = texture(iChannel0, UV).rgb;
    
    float weight = min(float(iFrame + 1), float(MAX_WEIGHT));
    
    // Resetting weight on mouse change.
    if (!all(lessThanEqual(iMouse.zw, vec2(0.0)))) 
    {
        weight = 1.0;
    }
    
    vec3 newColor = mix(previousColor, color, 1.0 / weight);*/
    
   ou = vec4(color, 1.0);
}