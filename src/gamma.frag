#version 300 es
#define MAX_WEIGHT 1000000
precision highp float;
uniform sampler2D tex;
uniform sampler2D tex2;
uniform int frame;
uniform vec2 u_resolution;//屏幕分辨率
out vec4 outColor;
void main( ) 
{
    vec2 uv=gl_FragCoord.xy/u_resolution;//左下角为（0，0），右上角为（1，1）
    vec3 previousColor = texture(tex,uv).rgb; 
    vec3 color=texture(tex2,uv).rgb;   
    float weight = min(float(frame ), float(MAX_WEIGHT));
    vec3 newColor = mix(previousColor, color, 1.0 / weight);
    vec3 col = pow(newColor, vec3(0.4545));
	outColor = vec4(col,1);
}