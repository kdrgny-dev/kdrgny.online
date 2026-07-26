// Shared sky model. Included by BOTH the sky and the sea shaders so that the
// sea's reflections and its horizon fog are sampled from the exact same
// function the sky is drawn with — the horizon line then matches by
// construction instead of by tuning.

export const skyCommon = /* glsl */ `
uniform vec3  uSunDir;
uniform vec3  uSunColor;
uniform float uSunIntensity;
uniform float uSunSize;
uniform vec3  uMoonDir;
uniform vec3  uMoonColor;
uniform float uMoonMix;
uniform vec3  uZenith;
uniform vec3  uMidSky;
uniform vec3  uHorizonCol;
uniform vec3  uHaze;
uniform float uHazeHeight;
uniform vec3  uIslandColor;
uniform float uIslandOpacity;
uniform float uStars;
uniform float uTime;
uniform float uPixelScale;

#define HZ_TAU 6.28318530718

float hzHash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// Interleaved-gradient noise: one dot, one fract, no texture fetch, and a
// spectrum high enough that the eye reads it as grain rather than as a pattern.
float hzIGN(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

// Triangular-PDF dither at exactly one 8-bit step. Must be applied AFTER the
// sRGB transfer, because the quantiser it is fighting lives in display space.
// Two independent samples rather than one on purpose: a rectangular PDF shifts
// the mean of the ramp it is meant to smooth, a triangular one leaves the mean
// alone and turns the quantisation error white.
vec3 hzDither(vec3 c, vec2 p) {
  float n = hzIGN(p) - hzIGN(p + vec2(41.7, 17.3));
  return c + n * (1.0 / 255.0);
}

// Gradient + glow only. Cheap enough to call twice per sea fragment.
vec3 skyGradient(vec3 dir) {
  float y  = dir.y;
  float hu = max(y, 0.0);

  vec3 col = mix(uMidSky, uZenith, pow(max(hu, 1e-4), 0.62));
  col = mix(uHorizonCol, col, smoothstep(0.0, 0.52, hu));

  // Haze is the thing that either dissolves the horizon or draws a bar across
  // it, so it is built as a bell centred ON the horizon plane rather than a
  // one-sided exponential hanging off it. Two consequences. It is smooth at
  // y = 0, so there is no cusp for the eye to latch onto as a line. And the sea
  // — which samples this same function at +y for its reflection and at -y for
  // its fog — gets the exact mirror of the sky, so the two halves melt into one
  // another instead of meeting. The second, much wider lobe is what keeps the
  // melt from simply becoming a fatter bar: it gives the falloff a long tail
  // with no edge anywhere for the band to re-form against.
  // Peak is 0.84, the value the old one-sided exponential had at y = 0, so the
  // horizon itself is no lighter than it was; all of the change is in how far
  // the falloff travels. The tail is spent by ~4H: long enough that there is no
  // edge for the band to re-form against, short enough that it does not lift
  // the zenith and flatten the sky it is meant to sit under.
  //
  // A rational bell rather than a sum of gaussians. It is even in y (so it is
  // symmetric and smooth at the horizon, which is the whole point), its quartic
  // term gives the long tail, and it costs one divide instead of two exp() —
  // this runs twice per sea fragment, so that is the difference between the
  // horizon fix being free and it costing a millisecond a frame.
  float H   = max(uHazeHeight, 0.02);
  float t2  = (y * y) / (H * H);
  float hazeW = 0.84 / (1.0 + 0.50 * t2 + 0.12 * t2 * t2);
  col = mix(col, uHaze, hazeW);

  // Warm toward the sun's azimuth, cool on the opposite side (Belt of Venus).
  // This is what makes low light read as time of day rather than a tinted lerp.
  // Gaussian in elevation for the same reason as the haze: the old exp(-|y|)
  // put a second kink on the same pixel row as the first.
  vec2 dxz = normalize(vec2(dir.x, dir.z) + vec2(1e-5));
  vec2 sxz = normalize(vec2(uSunDir.x, uSunDir.z) + vec2(1e-5));
  float az   = dot(dxz, sxz);
  float tb   = y / 0.34;
  float band = exp(-tb * tb * 0.5);
  col *= mix(vec3(1.0), vec3(1.16, 1.02, 0.86), clamp( az, 0.0, 1.0) * band * 0.60 * min(uSunIntensity, 1.4));
  col *= mix(vec3(1.0), vec3(0.90, 0.94, 1.12), clamp(-az, 0.0, 1.0) * band * 0.40);

  float sa = acos(clamp(dot(dir, uSunDir), -1.0, 1.0));
  // Tight-ish broad lobe: a wider one washes the whole night sky warm.
  col += uSunColor * (exp(-sa * 10.5) * 0.22 + exp(-sa * 42.0) * 0.80) * uSunIntensity;

  float ma = acos(clamp(dot(dir, uMoonDir), -1.0, 1.0));
  col += uMoonColor * (exp(-ma * 24.0) * 0.09 + exp(-ma * 140.0) * 0.26) * uMoonMix;

  return col;
}

float hzStars(vec3 dir) {
  if (uStars <= 0.002) return 0.0;
  // Equirectangular cells. Distortion is negligible across the band we can
  // actually see (roughly -5deg .. +35deg elevation).
  vec2 uv = vec2(atan(dir.x, -dir.z), asin(clamp(dir.y, -1.0, 1.0))) * 96.0;
  vec2 id = floor(uv);
  vec2 gv = fract(uv) - 0.5;
  float h = hzHash21(id);
  float present = step(0.958, h);
  vec2 off = (vec2(hzHash21(id + 13.7), hzHash21(id + 71.3)) - 0.5) * 0.70;
  float mag = fract(h * 91.7);
  float tw  = 0.62 + 0.38 * sin(uTime * (0.9 + mag * 2.4) + h * 57.0);
  return smoothstep(0.06, 0.0, length(gv - off))
       * present * (0.18 + 0.82 * pow(mag, 3.0)) * tw
       * smoothstep(0.004, 0.22, dir.y);
}

float hzBump(float a, float c, float w, float h) {
  float d = (a - c) / w;
  return h * exp(-d * d);
}

// Two silhouette layers: the far one low and washed, the near one taller and
// darker. Heights are in radians of elevation — ~0.013 rad is about 16px on a
// 900px viewport, which is the right size for distant land.
float hzLandFar(float az) {
  float p = 0.0;
  p += hzBump(az, -1.52, 0.30, 0.0060);
  p += hzBump(az, -0.88, 0.24, 0.0052);
  p += hzBump(az, -0.24, 0.34, 0.0070);
  p += hzBump(az,  0.46, 0.26, 0.0058);
  p += hzBump(az,  1.06, 0.22, 0.0046);
  p += hzBump(az,  1.62, 0.30, 0.0064);
  return p * (0.90 + 0.10 * sin(az * 31.0) + 0.06 * sin(az * 74.0 + 1.7));
}

float hzLandNear(float az) {
  float p = 0.0;
  p += hzBump(az, -1.18, 0.15, 0.0104);
  p += hzBump(az, -0.52, 0.12, 0.0082);
  p += hzBump(az,  0.10, 0.19, 0.0126);
  p += hzBump(az,  0.82, 0.13, 0.0090);
  p += hzBump(az,  1.40, 0.16, 0.0070);
  return p * (0.88 + 0.12 * sin(az * 27.0 + 0.6) + 0.06 * sin(az * 68.0));
}

vec3 skyFull(vec3 dir) {
  vec3 col = skyGradient(dir);

  float sa   = acos(clamp(dot(dir, uSunDir), -1.0, 1.0));
  float disc = 1.0 - smoothstep(uSunSize * 0.78, uSunSize * 1.30, sa);
  // Atmospheric extinction reddens and dims the disc as it approaches the sea.
  float low  = 1.0 - smoothstep(-0.02, 0.20, uSunDir.y);
  vec3  dcol = mix(uSunColor * 4.2, uSunColor * vec3(1.20, 0.58, 0.30) * 2.4, low);
  col = mix(col, dcol, disc * min(uSunIntensity, 1.0));

  float ma    = acos(clamp(dot(dir, uMoonDir), -1.0, 1.0));
  float mdisc = 1.0 - smoothstep(0.0082, 0.0126, ma);
  col = mix(col, uMoonColor * 3.2, mdisc * uMoonMix);

  // Night now runs at a lower exposure than golden hour rather than a higher
  // one, so the stars have to carry more of their own brightness to survive it.
  col += vec3(0.95, 0.97, 1.0) * hzStars(dir) * uStars * 2.3;

  // Islands. Edge softness is derived from the angular size of one pixel, so
  // the silhouette antialiases without needing derivatives.
  float azm = atan(dir.x, -dir.z);
  float e   = max(uPixelScale * 1.1, 1e-5);
  float pf  = hzLandFar(azm);
  float pn  = hzLandNear(azm);
  col = mix(col, mix(col, uIslandColor, uIslandOpacity * 0.60), smoothstep(pf + e, pf - e, dir.y));
  col = mix(col, mix(col, uIslandColor, uIslandOpacity),        smoothstep(pn + e, pn - e, dir.y));

  return col;
}
`
