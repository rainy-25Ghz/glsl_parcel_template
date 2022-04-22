#version 300 es
precision highp float;
const float colorOffsetIntensity=1.5;
uniform vec2 res;
uniform float u_time;

uniform sampler2D u_tex;//纹理采样器
float rand(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
float random1(float x){
  return fract(sin(x)*10000000.0);
}
float scanline(vec2 uv) {
	return sin(res.y * uv.y * 0.7 - u_time * 100.0);
}

float slowscan(vec2 uv) {
	return sin(res.y * uv.y * 0.02 + u_time * 3.0);
}

vec2 colorShift(vec2 uv) {
	return vec2(
		uv.x,
		uv.y + sin(u_time)*0.02
	);
}

vec2 crt(vec2 coord, float bend)
{
	// put in symmetrical coords
	coord = (coord - 0.5) * 2.0;

	coord *= 0.5;	
	
	// deform coords
	coord.x *= 1.0 + pow((abs(coord.y) / bend), 2.0);
	coord.y *= 1.0 + pow((abs(coord.x) / bend), 2.0);

	// transform back to 0.0 - 1.0 space
	coord  = (coord / 1.0) + 0.5;

	return coord;
}

vec2 colorshift(vec2 uv, float amount, float rand) {
	
	return vec2(
		uv.x,
		uv.y + amount * rand // * sin(uv.y * iResolution.y * 0.12 + iTime)
	);
}


float vignette(vec2 uv) {
	uv = (uv - 0.5) * 0.98;
	return clamp(pow(cos(uv.x * 3.1415), 1.2) * pow(cos(uv.y * 3.1415), 1.2) * 50.0, 0.0, 1.0);
}


out vec4 outColor;

void main() {
  vec2 uv= gl_FragCoord.xy/res;
  uv=vec2(uv.x,1.0-uv.y);
  float noise = rand(vec2(u_time, uv.y));
  uv.x += noise * 0.0058;
  vec2 crt_uv = crt(uv, 2.0);
  vec4 color=texture(u_tex,crt_uv);
	
  vec2 offsetR = vec2(0.006 * sin(u_time), 0.0) * colorOffsetIntensity;
  vec2 offsetG = vec2(0.0073 * (cos(u_time * 0.97)), 0.0) * colorOffsetIntensity;
  float r = texture(u_tex, crt_uv + offsetR).r;
  float g = texture(u_tex, crt_uv + offsetG).g;
  float b = texture(u_tex, crt_uv).b;
  color=vec4(r,g,b,1.0);
  if(crt_uv.x>1.0||crt_uv.x<0.) color=vec4(0.0,0.0,0.0,0.0);
  if(crt_uv.y>1.0||crt_uv.y<0.) color=vec4(0.0,0.0,0.0,0.0);

  vec4 scanline_color = vec4(scanline(crt_uv));
	vec4 slowscan_color = vec4(slowscan(crt_uv));
	
	// vec4 fragColor = mix(color, mix(scanline_color, slowscan_color, 0.5), 0.05) *
	// 	vignette(uv);
  outColor=color+scanline_color*0.05-slowscan_color*0.1;
}