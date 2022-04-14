// silly xmas doodle. thanks to all the shaders I copy pasted from. some links where I remembered to paste them.

float sunbright = 8.;
float light2bright = 50.;
float skybright = 3.;

float dens=35.; // foggy inverse - big numbers are clear
float aperture = 0.1; // controls dof

float lightdist=1.2;

// thanks to morimea for this quick fix :)
vec3 my_normalize(vec3 v){return normalize(v+0.001*(1.-abs(sign(v))));}
#define normalize my_normalize

// random numbers thanks to https://www.shadertoy.com/view/tltGzH
uint seed;	//seed initialized in main

uint wang_hash()
{
    seed = uint(seed ^ uint(61)) ^ uint(seed >> uint(16));
    seed *= uint(9);
    seed = seed ^ (seed >> 4);
    seed *= uint(0x27d4eb2d);
    seed = seed ^ (seed >> 15);
    return seed;
}
float rnd()
{
    return float(wang_hash()) / 4294967296.0;
}
vec2 rnd2() { return vec2(rnd(),rnd()); }
vec3 rnd3() { return vec3(rnd(),rnd(),rnd()); }

// perp from https://blog.selfshadow.com/2011/10/17/perp-vectors/
vec3 perp_hm(vec3 u)
 {
     vec3 a = abs(u);
     vec3 v;
     if (a.x <= a.y && a.x <= a.z)
         v = vec3(0, -u.z, u.y);
     else if (a.y <= a.x && a.y <= a.z)
         v = vec3(-u.z, 0, u.x);
     else
        v = vec3(-u.y, u.x, 0);
    return v;
}

// cos weighted dir from https://www.shadertoy.com/view/4tl3z4
vec3 cosWeightedRandomHemisphereDirection( const vec3 n) {
  	vec2 r = rnd2();

	vec3  uu = normalize( perp_hm(n) );
	vec3  vv = cross( uu, n );
	
	float ra = sqrt(r.y);
	float rx = ra*cos(6.2831*r.x); 
	float ry = ra*sin(6.2831*r.x);
	float rz = sqrt( 1.0-r.y );
	vec3  rr = vec3( rx*uu + ry*vv + rz*n );
    
    return normalize( rr );
}
vec3 randomSphereDirection() {
    vec2 h = rnd2() * vec2(2.,6.28318530718)-vec2(1,0);
    float phi = h.y;
	return vec3(sqrt(1.-h.x*h.x)*vec2(sin(phi),cos(phi)),h.x);
}
vec2 randomdisc() {
    vec2 h=rnd2() * vec2(6.28318530718,1.);
    h.y=sqrt(h.y);
    return h.y*vec2(sin(h.x),cos(h.x));
 }

// these from iq, modified
// sphere of size ra centered at point ce
bool sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, float ra, inout float tmax, out vec3 outNormal )
{
    vec3 oc = ro - ce;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;
    if( h<0.0 ) return false; // no intersection
    h = sqrt( h );
    float t = -b-h;
    if (t>0. && t<tmax) {
        outNormal=normalize(oc+rd*t);
        tmax=t;
        return true;
    } 
    t=-b+h;
    if (t>0. && t<tmax) {
        outNormal=normalize(oc+rd*t);
        tmax=t;
        return true;
    }
    return false;
}
// axis aligned box centered at the origin, with size boxSize
bool boxIntersect( in vec3 ro, in vec3 rd, vec3 boxPos, vec3 boxSize, inout float tmax, out vec3 outNormal ) 
{
    ro-=boxPos;
    vec3 m = 1.0/rd; // can precompute if traversing a set of aligned boxes
    vec3 n = m*ro;   // can precompute if traversing a set of aligned boxes
    vec3 k = abs(m)*boxSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF || tF<0.0) return false; // no intersection
    if (tN>0. && tN<tmax) {
         outNormal = -sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);
         tmax=tN;
         return true;
    }
    return false;
    if (tF>0. && tF<tmax) {
    // TODO wrong - swap order of step params?
         outNormal = -sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);
         tmax=tF;
         return true;
      }
    return false;
}

vec3 skycol(vec3 rd) {
    float d=max(rd.y,0.);
    d=d*d;d=d*d;
    d=d*d;d=d*d;
    return vec3(0.05,0.1,0.4)*skybright*d;
}
vec3 rotatez(vec3 p, float ang) {
    float c=cos(ang),s=sin(ang);
   return vec3(p.x*c-p.y*s,p.y*c+p.x*s,p.z);
}
vec3 rotatey(vec3 p, float ang) {
    float c=cos(ang),s=sin(ang);
    return vec3(p.x*c-p.z*s,p.y,p.z*c+p.x*s);
}
vec3 rotatex(vec3 p, float ang) {
    float c=cos(ang),s=sin(ang);
    return vec3(p.x,p.y*c-p.z*s,p.z*c+p.y*s);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    int spp=8;
    seed = uint(uint(fragCoord.x) * uint(1973) + uint(fragCoord.y) * uint(9277) + uint(iFrame) * uint(26699)) | uint(1);   
    vec3 coltot=vec3(0.);
    for (int s=min(iFrame,0);s<spp;++s) {
    vec2 uv = (fragCoord-iResolution.xy*0.5)/iResolution.yy;
    vec3 col=vec3(0.);
    uv+=rnd2()*(1./iResolution.yy);
    vec3 ro = vec3(0.2,-0.1, -18.) + vec3(randomdisc()*aperture,0.);
    vec3 target = vec3(0.2,-0.1,0)+vec3(uv.xy*3.5,0);
    vec3 rd = normalize(target-ro);
    ro=rotatex(rotatey(ro,+0.05),0.15);
    rd=rotatex(rotatey(rd,+0.05),0.15);
    
    
    
    
    vec3 thp=vec3(1.);
    bool inside=false;
    for (int bounce=min(iFrame,0);bounce<10;++bounce){
        if (abs(ro.x)>38. || abs(ro.y)>38. || abs(ro.z)>38.) {
            col=skycol(rd); break;
         }
        vec3 n;
        float tmax=1000.;
        int obj=0;
            if (sphIntersect(ro,rd,vec3(-0.1,-0.1,-0.1),0.9, tmax, n)) obj=1;// glass ball
        if (sphIntersect(ro,rd,vec3(0.9,-0.75,-1.3),0.25, tmax, n)) obj=6; // reflective ball
        if (sphIntersect(ro,rd,vec3(1.6,-1.+0.5,1.5),0.5, tmax, n)) obj=7; // green ball

        if (boxIntersect(ro,rd,vec3(0,-1.1,0),vec3(18,0.1,18), tmax,n)) obj=2; // floor
        if (boxIntersect(ro,rd,vec3(-1.3,0,-0.3),vec3(0.1,3,1.5), tmax,n)) obj=4; // yellow
        if (boxIntersect(ro,rd,vec3(2.2,-0.7,1.5),vec3(0.1,1,2), tmax,n)) obj=5; // blue


        if (boxIntersect(ro,rd,vec3(0.15,0,2.5),vec3(0.2,1.5,.2), tmax,n)) obj=8 ; // red
    
        if (sphIntersect(ro,rd,vec3(3.,1.6,2.)*lightdist,0.4, tmax, n)) obj=3; // light
        
        //vec3 ro2=rotatez(ro,-0.15);
        //vec3 rd2=rotatez(rd,-0.15);
        if (boxIntersect(ro,rd,vec3(-3.1,2.,3.1),vec3(2.05,0.05,0.05), tmax, n)) obj=33; // light 2
        
        
        float scatter_t = (-log(1.0f - rnd()) ) * dens;
        if (tmax>scatter_t) {
            thp*=0.999;
           // if (inside) thp*=vec3(0.99,0.95,0.5);
            ro=ro+scatter_t*rd;
            float forward = 0.f;
            rd=normalize(forward*rd+randomSphereDirection());
            continue;
        }
            
            

        
        if (obj==0) { col=skycol(rd); break; }
        
        if (obj==3) { col=vec3(10,9,8)*sunbright; break; }
        if (obj==33) { col=vec3(1.5,0.5,0.5)*light2bright; break; }
            vec3 albedo=vec3(0.7);
        
        ro=ro+tmax*rd;
                    ro+=n*1e-3;

        float ndotr = dot(rd,n);
        float eta=1./1.5;
        if( ndotr > 0. ) { // exit
            n = -n;
            eta=1./eta;
        } 
        float cosThetaI = abs(ndotr);
        float sinThetaTSq = eta * eta * (1. - cosThetaI * cosThetaI);            
        float fresnel=1.;
        if (sinThetaTSq < 1.)
        {
            float cosThetaT = sqrt(1. - sinThetaTSq);     
            float Rs = (eta * cosThetaI - cosThetaT) / (eta * cosThetaI + cosThetaT);
            float Rp = (eta * cosThetaT - cosThetaI) / (eta * cosThetaT + cosThetaI);    
            fresnel = 0.5 * (Rs * Rs + Rp * Rp);
        }
		              
         if (obj==7) {
             n=normalize(n+0.15*randomSphereDirection());
             albedo=vec3(0.3,0.55,0.3);
         /*    if (ndotr<0.) {
                 inside=true;
                 ro-=n*2e-3;
                 n=-n;
              } else {
                  inside=false;
               }
         rd=cosWeightedRandomHemisphereDirection(n);
         continue;*/
         }
        vec3 refl =  reflect( rd, n );        
     
        if (obj==1) {
        //col=vec3(fresnel); break;
        vec3 ref =  refract( rd, n, eta );        
        if( ref == vec3(0) || rnd() < fresnel  ) {
            ref = refl;
        } else {
            // refract
            ro-=n*2e-3;
            //ro+=ref*2e-3;
            thp*=vec3(0.99,0.8,0.9);
            //thp*=0.;
        }
        rd=ref;
        } else {
        
            // diffuse bounce
            if (obj==4) albedo=vec3(0.9,0.5,0.1);
            else if (obj==8) albedo=vec3(0.9,0.1,0.1);
            else if (obj==5) albedo=vec3(0.1,0.5,0.9);
            
            else if (obj==2) {
                float c=cos(0.1),s=sin(0.1);
                vec2 uv=vec2(ro.x*c-ro.z*s,ro.z*c+ro.x*s);
                //vec2 uv=ro.xz;
                
                 float xstripe = smoothstep(0.49,0.491,abs(fract(uv.x)-0.5));
                 float ystripe = smoothstep(0.49,0.491,abs(fract(uv.y)-0.5));
                 float stripe=max(xstripe,ystripe);
                 
                 float xstripe2 = smoothstep(0.45,0.46,abs(fract(uv.x*5.)-0.5))*0.5;
                 float ystripe2 = smoothstep(0.45,0.46,abs(fract(uv.y*5.)-0.5))*0.5;
                  stripe=max(stripe,max(xstripe2,ystripe2)); // max(xstripe,ystripe);
                 
                 albedo = vec3(0.9-stripe*0.8);
                 fresnel*=0.25;
             }
            if ((obj==7 ) && rnd()<fresnel) {
                rd=refl;
                continue;
            } else 
            if (obj==6) {
                rd=refl;
                continue;
            }
            thp*=albedo;
            vec3 newrd=cosWeightedRandomHemisphereDirection(n);
                rd=newrd;
        }
        rd=normalize(rd);
//        if (dot(n,rd)<0.) {col=vec3(1,0,0);       break;}
        //ro+=rd*1e-3;
//        col=rd*0.5+0.5;break;

    }
    col*=thp;
    coltot+=col;
    }
    coltot*=(1./float(spp));
    // Output to screen
    vec4 lastFrameColor = texture(iChannel0, fragCoord / iResolution.xy);
    float frames=float(iFrame)-5.;
    if (frames<=0.) fragColor=vec4(0.);
    else fragColor = (lastFrameColor * frames + vec4(coltot,1.0)) / (frames+1.);
}