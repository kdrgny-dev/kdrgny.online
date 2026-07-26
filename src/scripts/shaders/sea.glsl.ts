import { skyCommon } from './sky-common.glsl'

// The macro geometry is four Gerstner waves with deep-water dispersion. The
// steepness is stored normalised (Q = choppy / (k*A*N)) so that Q*A and Q*k*A
// stay bounded as the amplitude is faded out with distance — no blow-up, no
// self-intersection.
export const seaVert = /* glsl */ `
uniform float uTime;
uniform float uWaveAmp;
uniform float uChoppy;
uniform float uWaveSpeed;
uniform float uPulse;

varying vec3  vWorld;
varying vec3  vNrm;
varying float vHeight;

#define G 9.81
#define TAU 6.28318530718

#define GERSTNER(DX, DZ, LEN, AMP) { \
  vec2  d  = normalize(vec2(DX, DZ)); \
  float k  = TAU / (LEN); \
  float a  = (AMP) * uWaveAmp; \
  float w  = sqrt(G * k) * uWaveSpeed; \
  float q  = uChoppy / (k * max(a, 1e-4) * 4.0); \
  float ph = k * dot(d, WP) - w * uTime; \
  float s  = sin(ph); \
  float c  = cos(ph); \
  float ka = k * a; \
  disp.x += q * a * d.x * c; \
  disp.z += q * a * d.y * c; \
  disp.y += a * s; \
  dBx.x  -= q * ka * d.x * d.x * s; \
  dBx.y  +=     ka * d.x * c; \
  dBx.z  -= q * ka * d.x * d.y * s; \
  dTz.x  -= q * ka * d.x * d.y * s; \
  dTz.y  +=     ka * d.y * c; \
  dTz.z  -= q * ka * d.y * d.y * s; \
}

void main() {
  vec3  P = position;
  float r = length(P.xz);

  // Flatten the geometry with distance. Everything past this range is carried
  // by fog and by a widened specular lobe instead, which is both cheaper and
  // free of horizon shimmer.
  float lod = 1.0 - smoothstep(350.0, 2200.0, r);

  // A pure sum of sines reads as corduroy — the crests line up and repeat. Two
  // cheap fixes, both very low frequency so they cost nothing in sampling:
  // a slow domain warp that makes crests wander, and a wave-group envelope so
  // the swell arrives in sets the way a real sea does.
  vec2 WP = P.xz + vec2(
    sin(P.z * 0.0135 + uTime * 0.11),
    cos(P.x * 0.0115 - uTime * 0.09)
  ) * 4.2;
  float grp = 0.70 + 0.30 * sin(P.x * 0.0075 + P.z * 0.0052 + uTime * 0.17);

  vec3 disp = vec3(0.0);
  vec3 dBx  = vec3(0.0);
  vec3 dTz  = vec3(0.0);

  // Deliberately non-harmonic wavelengths so the pattern does not re-phase.
  GERSTNER( 1.00,  0.06, 71.0, 0.42)
  GERSTNER( 0.58,  0.81, 43.5, 0.25)
  GERSTNER(-0.64,  0.77, 26.5, 0.15)
  GERSTNER(-0.51, -0.86, 15.3, 0.075)

  disp *= grp;
  dBx  *= grp;
  dTz  *= grp;

  // 'health': one slow crest travelling inward on a fixed cadence. Analytic
  // radial derivative so it contributes a real slope, not just height.
  if (uPulse > 0.002) {
    float w   = fract(uTime * 0.075 + r / 320.0);
    float u   = w - 0.5;
    float s2  = 0.085 * 0.085;
    float env = exp(-(u * u) / s2);
    float amp = 0.85;
    disp.y += uPulse * amp * env * sin(u * 22.0);

    float dpdr = amp * (1.0 / 320.0) * env
               * (22.0 * cos(u * 22.0) - (2.0 * u / s2) * sin(u * 22.0));
    vec2 rad = r > 1e-3 ? P.xz / r : vec2(0.0);
    dBx.y += uPulse * dpdr * rad.x;
    dTz.y += uPulse * dpdr * rad.y;
  }

  disp *= lod;
  dBx  *= lod;
  dTz  *= lod;

  vec3 Bx = vec3(1.0, 0.0, 0.0) + dBx;
  vec3 Tz = vec3(0.0, 0.0, 1.0) + dTz;

  vec3 wp = P + disp;
  vWorld  = wp;
  vNrm    = normalize(cross(Tz, Bx));
  vHeight = disp.y;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(wp, 1.0);
}
`

export const seaFrag = /* glsl */ `
${skyCommon}

uniform vec3  uCamPos;
uniform vec3  uSeaDeep;
uniform vec3  uSeaShallow;
uniform vec3  uScatter;
uniform float uWaveAmp;
uniform float uWaveSpeed;
uniform float uChop;
uniform float uRhythm;
uniform float uGlitter;
uniform float uSpecStrength;
uniform float uGlintTight;
uniform float uGlintBroad;
uniform float uFogScale;

varying vec3  vWorld;
varying vec3  vNrm;
varying float vHeight;

// Dither is hzDither() from skyCommon, applied by hand after the sRGB transfer.
// three's own dithering chunk is deliberately not used: it is compiled out
// unless material.dithering is set, and switching that flag on pulls in a chunk
// that depends on rand() from <common> — the arrangement that broke the build
// last time. A local hash has no such coupling.
#include <common>

// Analytic LOD: an octave fades out once its wavelength approaches the ground
// footprint of a pixel. This is the difference between crisp water and a field
// of shimmering noise.
float hzLodFade(float len, float fp) {
  return smoothstep(1.2, 3.4, len / max(fp, 1e-4));
}

#define RIPPLE(DX, DZ, LEN, AMP) { \
  vec2  d  = normalize(vec2(DX, DZ)); \
  float k  = HZ_TAU / (LEN); \
  float w  = sqrt(9.81 * k); \
  g += (AMP) * k * d * cos(k * dot(d, pw) - w * t) * hzLodFade((LEN), fp); \
}

void main() {
  vec3  toCam = uCamPos - vWorld;
  float dist  = length(toCam);
  vec3  V     = toCam / dist;

  // World units covered by one pixel on the water surface.
  float fp = dist * uPixelScale / max(abs(V.y), 0.012);

  vec2  p  = vWorld.xz;
  float t  = uTime * uWaveSpeed;
  float da = (0.80 + 0.90 * uChop);
  float dg = da * (1.0 + uGlitter * 0.70);

  // Bend the sampling position before the octaves are summed. Without this the
  // five directional sines stay in phase with each other and the surface reads
  // as plaid; the warp is longer than the coarsest ripple so it decorrelates
  // them without adding any frequency of its own.
  vec2 pw = p + vec2(
    sin(p.y * 0.21 + t * 0.50),
    cos(p.x * 0.19 - t * 0.42)
  ) * 0.95;

  vec2 g = vec2(0.0);
  RIPPLE( 0.83,  0.56, 8.70, 0.070 * da)
  RIPPLE(-0.62,  0.78, 5.30, 0.049 * da)
  RIPPLE( 0.35, -0.94, 3.10, 0.032 * da)
  RIPPLE( 0.98,  0.19, 1.90, 0.021 * dg)
  RIPPLE(-0.28, -0.96, 1.15, 0.013 * dg)

  // 'media': ruled horizontal ridges gathered into a slow travelling cadence.
  // A ticker rhythm written into the water's slope, not an overlay.
  float rk  = HZ_TAU / 4.2;
  float cad = 0.30 + 0.70 * pow(0.5 + 0.5 * sin(p.y * 0.052 - uTime * 0.42), 2.0);
  g.y += uRhythm * 0.052 * rk * cos(p.y * rk + uTime * 1.05) * cad * hzLodFade(4.2, fp);

  vec3  N     = vNrm;
  vec2  slope = vec2(-N.x, -N.z) / max(N.y, 1e-3) + g;
  N = normalize(vec3(-slope.x, 1.0, -slope.y));

  vec3 L   = normalize(mix(uSunDir, uMoonDir, uMoonMix));
  vec3 lit = mix(uSunColor * uSunIntensity, uMoonColor, uMoonMix);

  float ndv = max(dot(N, V), 0.0);
  float F   = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);

  vec3 R = reflect(-V, N);
  R.y = max(R.y, 0.0035);
  vec3 refl = skyGradient(normalize(R));

  float crest = clamp(vHeight / max(uWaveAmp, 0.05) * 0.55 + 0.5, 0.0, 1.0);
  vec3  body  = mix(uSeaDeep, uSeaShallow, crest);

  // Subsurface glow through the back of a crest — the reason backlit water at
  // golden hour looks lit from within rather than painted.
  vec3  sdir = normalize(L + N * 0.65);
  float sss  = pow(max(dot(V, -sdir), 0.0), 4.0);
  body += uScatter * sss * (0.55 + 0.45 * crest) * uSunIntensity * (1.0 - uMoonMix) * 0.70;

  vec3 col = mix(body, refl, F);

  // Two specular lobes. As detail fades with distance its slope variance is
  // handed to the broad lobe, so the sun path stays a smooth column far out
  // and breaks into individual sparks up close.
  vec3  H     = normalize(L + V);
  float d1    = 1.0 - max(dot(N, H), 0.0);
  float sharp = smoothstep(0.5, 3.0, 6.1 / max(fp, 1e-4));
  float glint = exp(-d1 * uGlintTight) * sharp
              + exp(-d1 * uGlintBroad * mix(0.35, 1.0, sharp)) * mix(0.55, 0.30, sharp);
  glint *= F * 6.0;

  // No extra twinkle term here on purpose: a cell-hashed one showed up as
  // visible square blocks in the near field, and the ripple octaves already
  // break the highlight into sparks on their own.
  col += lit * glint * uSpecStrength;

  // Fog toward the sky this pixel would actually see if the water were not
  // there — the real view direction, not one pinned to y = 0. Pinning it made
  // the whole lower half fog toward a single constant colour, which is what
  // gave the sea a flat slab under the band. Sampled at -y against a haze bell
  // that is symmetric about the horizon plane, the fog target instead continues
  // the sky's own ramp downward, and matches it exactly at the seam.
  vec3  hd  = -V;
  float fog = 1.0 - exp(-dist / max(uFogScale, 50.0));

  // Guarantee a smooth, wide approach to full fog as the view flattens out.
  // Angle rather than distance: distance compresses into a couple of pixels
  // near the horizon, so a distance ramp puts its entire remaining travel on
  // one scanline, which is a hard edge by any other name. V.y is the sine of
  // the depression angle, i.e. near-linear in screen y, so this ramp occupies
  // real estate the eye can see it cross.
  // Squared by multiply rather than pow(): same curve to the eye, and this runs
  // on every sea fragment.
  float below = 1.0 - smoothstep(0.0, 0.055, max(V.y, 0.0));
  fog = max(fog, below * below);

  col = mix(col, skyGradient(hd), fog);

  gl_FragColor = vec4(col, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb = hzDither(gl_FragColor.rgb, gl_FragCoord.xy);
}
`
