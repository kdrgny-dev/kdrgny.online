import { Color, LinearSRGBColorSpace } from 'three'

// One day over the gulf of Ayvalık, read as ten years of work.
//
// The ramp has a shape: value contrast peaks at midday, saturation peaks at
// golden hour, haze peaks at dawn. Dawn is deliberately cool — Aegean first
// light is violet-rose, not pink-orange — so the warmth the page gains by
// `igaming` has somewhere to come from.
//
// Temperature runs cool-violet → cool-blue → neutral → warm-neutral → hot →
// cool-indigo, and every stop is on the blue side of cyan. The water used to
// pass through olive and mint on its way across the middle of the day, which
// put a green cast over four of the six stops and made them read as one muddy
// era rather than four times of day. There is no green in the gulf at this
// distance; what there is, is sky, and the water only returns it.
//
// `sunAzFrac` is the sun's azimuth as a fraction of the visible half-width of
// the frame, not an absolute angle. The sun therefore holds the same
// compositional position on a phone as on an ultrawide.

export interface EraNums {
  sunElev: number
  sunAzFrac: number
  sunIntensity: number
  sunSize: number
  moonMix: number
  hazeHeight: number
  islandOpacity: number
  stars: number
  waveAmp: number
  choppy: number
  waveSpeed: number
  rhythm: number
  pulse: number
  chop: number
  glitter: number
  specStrength: number
  glintTight: number
  glintBroad: number
  fogScale: number
  exposure: number
  camY: number
  camPitch: number
}

export interface EraCols {
  sunColor: number
  zenith: number
  midSky: number
  horizonCol: number
  haze: number
  islandColor: number
  seaDeep: number
  seaShallow: number
  scatter: number
}

export type Era = EraNums & EraCols & { key: string }

export const NUM_KEYS = [
  'sunElev', 'sunAzFrac', 'sunIntensity', 'sunSize', 'moonMix', 'hazeHeight',
  'islandOpacity', 'stars', 'waveAmp', 'choppy', 'waveSpeed', 'rhythm', 'pulse',
  'chop', 'glitter', 'specStrength', 'glintTight', 'glintBroad', 'fogScale',
  'exposure', 'camY', 'camPitch',
] as const satisfies readonly (keyof EraNums)[]

export const COL_KEYS = [
  'sunColor', 'zenith', 'midSky', 'horizonCol', 'haze', 'islandColor',
  'seaDeep', 'seaShallow', 'scatter',
] as const satisfies readonly (keyof EraCols)[]

export const ERAS: Era[] = [
  {
    // Ayvalık before the day starts. Cool, low sun, real haze. The sky is
    // violet going to rose at the water; the sea is pewter — a blue-grey with a
    // violet lean and no green in it at all, because at this light the water is
    // only returning the sky. Haze is at its maximum for the day here, which is
    // both true to first light on the gulf and the reason dawn has the softest
    // horizon of the six.
    key: 'dawn',
    sunElev: 1.4, sunAzFrac: -0.86, sunColor: 0xffb08c, sunIntensity: 0.55, sunSize: 0.017,
    moonMix: 0,
    zenith: 0x2a2b52, midSky: 0x6d6b95, horizonCol: 0xdcb3b8, haze: 0xe6c8c8, hazeHeight: 0.145,
    islandColor: 0x877f95, islandOpacity: 0.46, stars: 0.10,
    seaDeep: 0x232839, seaShallow: 0x3e4459, scatter: 0x7a7590,
    waveAmp: 0.52, choppy: 0.44, waveSpeed: 0.85,
    rhythm: 0, pulse: 0, chop: 0.15, glitter: 0.05,
    specStrength: 0.55, glintTight: 900, glintBroad: 40,
    fogScale: 620, exposure: 0.98, camY: 6.1, camPitch: 3.2,
  },
  {
    // Clear morning: the highest-clarity moment on the page, and the only one
    // where the islands read sharply. Haze is the lowest of the day. The water
    // is marine blue rather than the teal it used to be — the difference
    // between morning air over open water and a lagoon postcard.
    key: 'media',
    sunElev: 17, sunAzFrac: -0.52, sunColor: 0xffe9c4, sunIntensity: 1.0, sunSize: 0.012,
    moonMix: 0,
    zenith: 0x0f4f96, midSky: 0x468ac9, horizonCol: 0xbed8eb, haze: 0xd6e7f0, hazeHeight: 0.085,
    islandColor: 0x3d5c72, islandOpacity: 0.82, stars: 0,
    seaDeep: 0x0b3355, seaShallow: 0x1c6392, scatter: 0x3f8cb8,
    waveAmp: 0.50, choppy: 0.45, waveSpeed: 0.95,
    rhythm: 1.0, pulse: 0, chop: 0.30, glitter: 0.10,
    specStrength: 0.85, glintTight: 1700, glintBroad: 60,
    fogScale: 3000, exposure: 1.00, camY: 6.4, camPitch: 3.4,
  },
  {
    // Midday, the high-key stop. Sun almost overhead, so the horizon bleaches to
    // a blue-white. The water is deep Aegean ultramarine, NOT a tropical cyan —
    // cyan is what made the middle of the day read green.
    key: 'food',
    sunElev: 54, sunAzFrac: -0.14, sunColor: 0xfff4e6, sunIntensity: 1.25, sunSize: 0.011,
    moonMix: 0,
    zenith: 0x0d55b4, midSky: 0x4a92e0, horizonCol: 0xdbe4f2, haze: 0xe8eef8, hazeHeight: 0.098,
    islandColor: 0x7d879c, islandOpacity: 0.55, stars: 0,
    seaDeep: 0x062f6b, seaShallow: 0x1461b4, scatter: 0x4a8ad6,
    waveAmp: 0.82, choppy: 0.72, waveSpeed: 1.15,
    rhythm: 0.15, pulse: 0, chop: 1.0, glitter: 0.34,
    specStrength: 1.0, glintTight: 2400, glintBroad: 70,
    fogScale: 2000, exposure: 1.10, camY: 6.8, camPitch: 3.6,
  },
  {
    // Afternoon. Everything settles: contrast comes down, haze comes up a
    // little, and the light turns warm-neutral without turning gold — that is
    // still an hour away. Sea goes steel blue. The only movement that reads is
    // the slow crest arriving on a fixed cadence.
    key: 'health',
    sunElev: 31, sunAzFrac: 0.26, sunColor: 0xffe2b6, sunIntensity: 1.05, sunSize: 0.0125,
    moonMix: 0,
    zenith: 0x2f66a8, midSky: 0x7a9fd0, horizonCol: 0xe8d2bb, haze: 0xeddac6, hazeHeight: 0.112,
    islandColor: 0x6d7488, islandOpacity: 0.68, stars: 0,
    seaDeep: 0x16375e, seaShallow: 0x36699e, scatter: 0x7d97c2,
    waveAmp: 0.48, choppy: 0.40, waveSpeed: 0.80,
    rhythm: 0.05, pulse: 1.0, chop: 0.20, glitter: 0.15,
    specStrength: 0.90, glintTight: 1900, glintBroad: 55,
    fogScale: 1900, exposure: 1.00, camY: 7.0, camPitch: 3.5,
  },
  {
    // Şeytan Sofrası. The sun sits down onto the archipelago; the islands are
    // at their darkest and the sea carries a long specular column.
    //
    // HELD. Every value below is unchanged from the grade the client signed off
    // on — this is the stop the rest of the day is graded to arrive at, so it
    // is the fixed point, not a candidate. Anything that has to move for the
    // horizon fix moves in the shader, where it applies to all six equally.
    key: 'igaming',
    sunElev: 2.4, sunAzFrac: 0.60, sunColor: 0xffc569, sunIntensity: 1.6, sunSize: 0.020,
    moonMix: 0,
    zenith: 0x2b2e62, midSky: 0x8a5a83, horizonCol: 0xf0a85c, haze: 0xf6c078, hazeHeight: 0.128,
    islandColor: 0x2a2036, islandOpacity: 0.90, stars: 0.06,
    seaDeep: 0x151f3b, seaShallow: 0x3a395d, scatter: 0x9a6a6a,
    waveAmp: 0.62, choppy: 0.52, waveSpeed: 0.90,
    rhythm: 0, pulse: 0.10, chop: 0.35, glitter: 0.50,
    specStrength: 1.25, glintTight: 2600, glintBroad: 42,
    fogScale: 1050, exposure: 1.16, camY: 7.0, camPitch: 3.3,
  },
  {
    // Night. The sun has gone under, leaving afterglow on the right; the moon
    // comes up on the left, so the glitter path crosses to the other side of
    // the frame.
    //
    // Exposure used to be pushed to 1.45 to stop ACES crushing the blues to
    // mud, which is why night never actually read as night — it was the
    // brightest setting of the six. The fix is to solve that in the palette
    // instead: every colour here carries more chroma than it did, so it holds
    // its blue on the way down, and exposure then drops to 0.92 — well under
    // golden hour's 1.16. What is left is a genuinely dark frame with stars,
    // moonlight, and glitter on black water.
    key: 'night',
    sunElev: -7, sunAzFrac: 0.88, sunColor: 0xff9a5c, sunIntensity: 0.14, sunSize: 0.020,
    moonMix: 1,
    zenith: 0x04061a, midSky: 0x0a1030, horizonCol: 0x1a2450, haze: 0x232f5c, hazeHeight: 0.125,
    islandColor: 0x05070f, islandOpacity: 0.82, stars: 1.0,
    seaDeep: 0x01030a, seaShallow: 0x070c1c, scatter: 0x141d3c,
    waveAmp: 0.44, choppy: 0.42, waveSpeed: 0.75,
    rhythm: 0, pulse: 0, chop: 0.10, glitter: 1.0,
    specStrength: 1.70, glintTight: 3200, glintBroad: 90,
    fogScale: 1500, exposure: 0.92, camY: 6.6, camPitch: 3.6,
  },
]

export const ERA_INDEX: Record<string, number> = Object.fromEntries(
  ERAS.map((e, i) => [e.key, i]),
)

export const MOON_ELEV = 24
export const MOON_AZ_FRAC = -0.55
export const MOON_COLOR = 0xcdd9f2

// Palette colours held UNCONVERTED, i.e. the raw sRGB components of the hex.
//
// Blending has to happen in this space, not in linear. Lerping linearly makes
// bright warm values dominate dark ones far beyond their weight: 90% night
// mixed with 10% golden hour came out brown rather than blue. Interpolating in
// the space the palette was chosen in gives the ramp the designer picked.
// The transfer to linear is applied per frame, after the blend.
export const ERA_COLORS: Record<keyof EraCols, Color>[] = ERAS.map((era) => {
  const out = {} as Record<keyof EraCols, Color>
  for (const k of COL_KEYS) out[k] = new Color().setHex(era[k], LinearSRGBColorSpace)
  return out
})
