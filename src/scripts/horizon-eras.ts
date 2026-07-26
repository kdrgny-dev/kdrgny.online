import { Color, LinearSRGBColorSpace } from 'three'

// One day over the gulf of Ayvalık, read as ten years of work.
//
// The ramp has a shape: value contrast peaks at midday, saturation peaks at
// golden hour, haze peaks at dawn. Dawn is deliberately cool — Aegean first
// light is milky lavender-grey, not pink-orange — so the warmth the page
// gains by `igaming` has somewhere to come from.
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
    // Ayvalık before the day starts. Haze eats the horizon; sky and sea sit at
    // almost the same value. The sun is present only as a warm bruise.
    key: 'dawn',
    sunElev: 1.4, sunAzFrac: -0.86, sunColor: 0xffb98a, sunIntensity: 0.55, sunSize: 0.017,
    moonMix: 0,
    zenith: 0x26314b, midSky: 0x54617e, horizonCol: 0xc9b7bd, haze: 0xd9c8c6, hazeHeight: 0.118,
    islandColor: 0x8c8391, islandOpacity: 0.46, stars: 0.10,
    seaDeep: 0x1b2436, seaShallow: 0x34435a, scatter: 0x6b788c,
    waveAmp: 0.52, choppy: 0.44, waveSpeed: 0.85,
    rhythm: 0, pulse: 0, chop: 0.15, glitter: 0.05,
    specStrength: 0.55, glintTight: 900, glintBroad: 40,
    fogScale: 620, exposure: 0.98, camY: 6.1, camPitch: 3.2,
  },
  {
    // Clear morning: the highest-clarity moment on the page. Haze pulled right
    // back so the islands read sharply for the only time all day.
    key: 'media',
    sunElev: 17, sunAzFrac: -0.52, sunColor: 0xffe9c4, sunIntensity: 1.0, sunSize: 0.012,
    moonMix: 0,
    zenith: 0x14508f, midSky: 0x3d85be, horizonCol: 0xb6d6e6, haze: 0xcfe3ec, hazeHeight: 0.055,
    islandColor: 0x40616f, islandOpacity: 0.82, stars: 0,
    seaDeep: 0x0d3852, seaShallow: 0x1d6884, scatter: 0x3c90a4,
    waveAmp: 0.50, choppy: 0.45, waveSpeed: 0.95,
    rhythm: 1.0, pulse: 0, chop: 0.30, glitter: 0.10,
    specStrength: 0.85, glintTight: 1700, glintBroad: 60,
    fogScale: 3000, exposure: 1.0, camY: 6.4, camPitch: 3.4,
  },
  {
    // Midday. Bleached horizon band, hard tiny glitter, and the turquoise a
    // shallow gulf actually goes at noon — warmth without going orange.
    key: 'food',
    sunElev: 54, sunAzFrac: -0.14, sunColor: 0xfff6e0, sunIntensity: 1.25, sunSize: 0.011,
    moonMix: 0,
    zenith: 0x1a6cb6, midSky: 0x59a4d5, horizonCol: 0xe9e2ce, haze: 0xf2ecd8, hazeHeight: 0.072,
    islandColor: 0x8e9a8b, islandOpacity: 0.55, stars: 0,
    seaDeep: 0x0a4956, seaShallow: 0x179283, scatter: 0x55bfa5,
    waveAmp: 0.82, choppy: 0.72, waveSpeed: 1.15,
    rhythm: 0.15, pulse: 0, chop: 1.0, glitter: 0.25,
    specStrength: 1.0, glintTight: 2400, glintBroad: 70,
    fogScale: 2000, exposure: 1.10, camY: 6.8, camPitch: 3.6,
  },
  {
    // Afternoon. Everything settles; the only movement that reads is the slow
    // crest arriving on a fixed cadence.
    key: 'health',
    sunElev: 31, sunAzFrac: 0.26, sunColor: 0xffe3b0, sunIntensity: 1.05, sunSize: 0.0125,
    moonMix: 0,
    zenith: 0x2d70ad, midSky: 0x73a5c7, horizonCol: 0xe7cfa8, haze: 0xebd8ba, hazeHeight: 0.088,
    islandColor: 0x6d7a78, islandOpacity: 0.68, stars: 0,
    seaDeep: 0x133f4e, seaShallow: 0x2b6d76, scatter: 0x5c9698,
    waveAmp: 0.48, choppy: 0.40, waveSpeed: 0.80,
    rhythm: 0.05, pulse: 1.0, chop: 0.20, glitter: 0.15,
    specStrength: 0.90, glintTight: 1900, glintBroad: 55,
    fogScale: 1900, exposure: 1.04, camY: 7.0, camPitch: 3.5,
  },
  {
    // Şeytan Sofrası. The sun sits down onto the archipelago; the islands are
    // at their darkest and the sea carries a long specular column.
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
    // the frame. Exposure is lifted so ACES does not crush the blues to mud.
    key: 'night',
    sunElev: -7, sunAzFrac: 0.88, sunColor: 0xff9a5c, sunIntensity: 0.14, sunSize: 0.020,
    moonMix: 1,
    zenith: 0x050813, midSky: 0x0a1124, horizonCol: 0x17233e, haze: 0x1e2c48, hazeHeight: 0.100,
    islandColor: 0x080d18, islandOpacity: 0.82, stars: 1.0,
    seaDeep: 0x02050d, seaShallow: 0x09101f, scatter: 0x16223a,
    waveAmp: 0.44, choppy: 0.42, waveSpeed: 0.75,
    rhythm: 0, pulse: 0, chop: 0.10, glitter: 1.0,
    specStrength: 1.50, glintTight: 3200, glintBroad: 90,
    fogScale: 1500, exposure: 1.45, camY: 6.6, camPitch: 3.6,
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
