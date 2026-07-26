import {
  ACESFilmicToneMapping,
  BufferAttribute,
  BufferGeometry,
  Color,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three'

import { skyFrag, skyVert } from './shaders/sky.glsl'
import { seaFrag, seaVert } from './shaders/sea.glsl'
import {
  COL_KEYS,
  ERA_COLORS,
  ERA_INDEX,
  ERAS,
  MOON_AZ_FRAC,
  MOON_COLOR,
  MOON_ELEV,
  NUM_KEYS,
  type EraCols,
  type EraNums,
} from './horizon-eras'

type Frame = { [K in keyof EraNums]: number } & { [K in keyof EraCols]: Color }

interface Anchor {
  era: number
  y: number
}

export interface HorizonHandle {
  destroy: () => void
  debug: () => { pos: number; from: string; to: string; blend: number; fps: number }
}

const DEG = Math.PI / 180
const BASE_FOV = 42

let active: HorizonHandle | null = null

export function mountHorizon(): HorizonHandle | null {
  if (active) return active

  const root = document.getElementById('horizon')
  const canvas = document.getElementById('horizon-canvas') as HTMLCanvasElement | null
  if (!root || !canvas) return null

  const fail = () => {
    root.dataset.state = 'failed'
  }

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: !coarse,
      alpha: false,
      stencil: false,
      depth: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    })
  } catch {
    fail()
    return null
  }

  renderer.toneMapping = ACESFilmicToneMapping
  renderer.setClearColor(0x000000, 1)

  const scene = new Scene()
  const camera = new PerspectiveCamera(BASE_FOV, 1, 0.5, 30000)

  // ---------------------------------------------------------------- uniforms
  // A single uniform object shared by both materials. Extra entries a program
  // does not declare are simply ignored by three.
  const U = {
    uTime: { value: 0 },
    uPixelScale: { value: 0.0009 },
    uInvVP: { value: new Matrix4() },
    uCamPos: { value: new Vector3() },

    uSunDir: { value: new Vector3(0, 0.1, -1) },
    uSunColor: { value: new Color(0xffffff) },
    uSunIntensity: { value: 1 },
    uSunSize: { value: 0.014 },
    uMoonDir: { value: new Vector3(0, 0.4, -1) },
    uMoonColor: { value: new Color(MOON_COLOR) },
    uMoonMix: { value: 0 },

    uZenith: { value: new Color() },
    uMidSky: { value: new Color() },
    uHorizonCol: { value: new Color() },
    uHaze: { value: new Color() },
    uHazeHeight: { value: 0.1 },
    uIslandColor: { value: new Color() },
    uIslandOpacity: { value: 0.6 },
    uStars: { value: 0 },

    uSeaDeep: { value: new Color() },
    uSeaShallow: { value: new Color() },
    uScatter: { value: new Color() },
    uWaveAmp: { value: 0.5 },
    uChoppy: { value: 0.5 },
    uWaveSpeed: { value: 1 },
    uChop: { value: 0 },
    uRhythm: { value: 0 },
    uPulse: { value: 0 },
    uGlitter: { value: 0 },
    uSpecStrength: { value: 1 },
    uGlintTight: { value: 2000 },
    uGlintBroad: { value: 60 },
    uFogScale: { value: 1500 },
  }

  // -------------------------------------------------------------- geometries
  const skyGeo = new BufferGeometry()
  skyGeo.setAttribute(
    'position',
    new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
  )

  const R_MIN = 4
  const R_MAX = 13000
  const rings = coarse ? 96 : 180
  const segs = coarse ? 112 : 200
  const seaGeo = buildSeaDisc(rings, segs, R_MIN, R_MAX)

  const skyMat = new ShaderMaterial({
    uniforms: U,
    vertexShader: skyVert,
    fragmentShader: skyFrag,
    depthTest: false,
    depthWrite: false,
  })

  const seaMat = new ShaderMaterial({
    uniforms: U,
    vertexShader: seaVert,
    fragmentShader: seaFrag,
  })

  const skyMesh = new Mesh(skyGeo, skyMat)
  skyMesh.frustumCulled = false
  skyMesh.renderOrder = -1
  scene.add(skyMesh)

  const seaMesh = new Mesh(seaGeo, seaMat)
  seaMesh.frustumCulled = false
  scene.add(seaMesh)

  // ------------------------------------------------------------------- state
  const frame = makeFrame()

  let anchors: Anchor[] = []
  let pos = 0
  let posTarget = 0
  let ptrX = 0
  let ptrY = 0
  let ptrTX = 0
  let ptrTY = 0
  let hHalf = 0.6
  let clock = 14
  let fps = 0
  let ready = false
  let reduced = motionQuery.matches
  let disposed = false
  let restoreAttempts = 0

  const lookAt = new Vector3()

  // ----------------------------------------------------------------- helpers
  function makeFrame(): Frame {
    const f = {} as Frame
    for (const k of NUM_KEYS) f[k] = ERAS[0][k]
    for (const k of COL_KEYS) f[k] = new Color()
    return f
  }

  function collectAnchors() {
    const els = document.querySelectorAll<HTMLElement>('[data-era]')
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const next: Anchor[] = []
    const vh = window.innerHeight

    els.forEach((el) => {
      const era = ERA_INDEX[el.dataset.era ?? '']
      if (era === undefined) return
      const rect = el.getBoundingClientRect()
      const centre = rect.top + window.scrollY + rect.height / 2 - vh / 2
      next.push({ era, y: Math.min(Math.max(centre, 0), max) })
    })

    anchors = next
  }

  // Position along the anchor sequence, as a float. Damping a single scalar
  // keeps transitions monotonic — damping the era pair directly would not.
  function scrollPos(): number {
    const y = window.scrollY
    const n = anchors.length

    if (n === 0) {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      return Math.min(Math.max(y / max, 0), 1) * (ERAS.length - 1)
    }
    if (n === 1) return 0
    if (y <= anchors[0].y) return 0
    if (y >= anchors[n - 1].y) return n - 1

    for (let i = 0; i < n - 1; i++) {
      const a = anchors[i]
      const b = anchors[i + 1]
      if (y < b.y) {
        const span = Math.max(b.y - a.y, 1)
        return i + (y - a.y) / span
      }
    }
    return n - 1
  }

  function eraAt(i: number): number {
    if (anchors.length === 0) return Math.min(Math.max(i, 0), ERAS.length - 1)
    return anchors[Math.min(Math.max(i, 0), anchors.length - 1)].era
  }

  function resolveFrame(p: number) {
    const i = Math.floor(p)
    const raw = p - i
    // smoothstep so each section holds its light while it is centred, and the
    // change happens in the space between sections
    const f = raw * raw * (3 - 2 * raw)

    const a = ERAS[eraAt(i)]
    const b = ERAS[eraAt(i + 1)]
    const ca = ERA_COLORS[eraAt(i)]
    const cb = ERA_COLORS[eraAt(i + 1)]

    for (const k of NUM_KEYS) frame[k] = a[k] + (b[k] - a[k]) * f
    for (const k of COL_KEYS) frame[k].copy(ca[k]).lerp(cb[k], f)
  }

  function applyUniforms() {
    const az = frame.sunAzFrac * hHalf
    const el = frame.sunElev * DEG
    U.uSunDir.value
      .set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el))
      .normalize()

    const maz = MOON_AZ_FRAC * hHalf
    const mel = MOON_ELEV * DEG
    U.uMoonDir.value
      .set(Math.sin(maz) * Math.cos(mel), Math.sin(mel), -Math.cos(maz) * Math.cos(mel))
      .normalize()

    // frame.* colours are blended in sRGB space; the transfer to the linear
    // working space happens here, once the blend is settled.
    U.uSunColor.value.copy(frame.sunColor).convertSRGBToLinear()
    U.uSunIntensity.value = frame.sunIntensity
    U.uSunSize.value = frame.sunSize
    U.uMoonMix.value = frame.moonMix

    U.uZenith.value.copy(frame.zenith).convertSRGBToLinear()
    U.uMidSky.value.copy(frame.midSky).convertSRGBToLinear()
    U.uHorizonCol.value.copy(frame.horizonCol).convertSRGBToLinear()
    U.uHaze.value.copy(frame.haze).convertSRGBToLinear()
    U.uHazeHeight.value = frame.hazeHeight
    U.uIslandColor.value.copy(frame.islandColor).convertSRGBToLinear()
    U.uIslandOpacity.value = frame.islandOpacity
    U.uStars.value = frame.stars

    U.uSeaDeep.value.copy(frame.seaDeep).convertSRGBToLinear()
    U.uSeaShallow.value.copy(frame.seaShallow).convertSRGBToLinear()
    U.uScatter.value.copy(frame.scatter).convertSRGBToLinear()
    U.uWaveAmp.value = frame.waveAmp
    U.uChoppy.value = frame.choppy
    U.uWaveSpeed.value = frame.waveSpeed
    U.uChop.value = frame.chop
    U.uRhythm.value = frame.rhythm
    U.uPulse.value = frame.pulse
    U.uGlitter.value = frame.glitter
    U.uSpecStrength.value = frame.specStrength
    U.uGlintTight.value = frame.glintTight
    U.uGlintBroad.value = frame.glintBroad
    U.uFogScale.value = frame.fogScale

    renderer.toneMappingExposure = frame.exposure
  }

  function updateCamera() {
    const pitch = frame.camPitch * DEG
    camera.position.set(ptrX * 1.7, frame.camY + ptrY * 0.45, 0)
    lookAt.set(
      camera.position.x + ptrX * 2.4,
      camera.position.y + Math.tan(pitch) * 160 - ptrY * 2.0,
      camera.position.z - 160,
    )
    camera.lookAt(lookAt)
    camera.updateMatrixWorld()

    U.uCamPos.value.copy(camera.position)
    U.uInvVP.value.multiplyMatrices(camera.matrixWorld, camera.projectionMatrixInverse)
  }

  function draw() {
    applyUniforms()
    updateCamera()
    U.uTime.value = clock
    renderer.render(scene, camera)
    if (!ready) {
      ready = true
      root.dataset.state = 'ready'
    }
  }

  // ------------------------------------------------------------------ resize
  function resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    if (w === 0 || h === 0) return

    let dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2)
    const budget = coarse ? 1_500_000 : 2_900_000
    if (w * h * dpr * dpr > budget) dpr = Math.max(1, Math.sqrt(budget / (w * h)))

    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)

    const aspect = w / h
    camera.aspect = aspect
    // Portrait viewports widen a little so the composition does not collapse
    // into a slot, but never so far that the perspective goes fisheye.
    camera.fov = aspect < 1 ? Math.min(62, BASE_FOV * (1 + (1 - aspect) * 0.55)) : BASE_FOV
    camera.updateProjectionMatrix()

    const tanHalf = Math.tan(camera.fov * DEG / 2)
    hHalf = Math.min(Math.atan(tanHalf * aspect), 0.62)
    U.uPixelScale.value = (2 * tanHalf) / (h * dpr)

    collectAnchors()
  }

  // -------------------------------------------------------------------- loop
  let raf = 0
  let last = 0
  let running = false
  let visible = true

  function tick(now: number) {
    raf = requestAnimationFrame(tick)
    const dt = last === 0 ? 1 / 60 : Math.min((now - last) / 1000, 0.05)
    last = now
    clock += dt
    fps = fps * 0.9 + (1 / Math.max(dt, 1e-4)) * 0.1

    posTarget = scrollPos()
    const k = 1 - Math.exp(-dt * 5)
    pos += (posTarget - pos) * k

    const pk = 1 - Math.exp(-dt * 3)
    ptrX += (ptrTX - ptrX) * pk
    ptrY += (ptrTY - ptrY) * pk

    resolveFrame(pos)
    draw()
  }

  function start() {
    if (running || disposed || reduced || !visible || document.hidden) return
    running = true
    last = 0
    raf = requestAnimationFrame(tick)
  }

  function stop() {
    if (!running) return
    running = false
    cancelAnimationFrame(raf)
  }

  // Reduced motion: no loop, no easing. The scene still tracks the section the
  // reader is on, but only ever moves in direct response to their own scroll.
  let staticRaf = 0
  function renderStatic() {
    if (staticRaf || disposed) return
    staticRaf = requestAnimationFrame(() => {
      staticRaf = 0
      pos = posTarget = scrollPos()
      ptrX = ptrY = 0
      resolveFrame(pos)
      draw()
    })
  }

  function setMode() {
    reduced = motionQuery.matches
    if (reduced) {
      stop()
      clock = 14
      renderStatic()
    } else {
      start()
    }
  }

  // ---------------------------------------------------------------- listeners
  let resizeTimer = 0
  const onResize = () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      resize()
      if (reduced) renderStatic()
    }, 150)
  }

  const onScroll = () => {
    if (reduced) renderStatic()
  }

  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    ptrTX = (e.clientX / window.innerWidth) * 2 - 1
    ptrTY = (e.clientY / window.innerHeight) * 2 - 1
  }

  const onVisibility = () => {
    if (document.hidden) stop()
    else start()
  }

  const onLost = (e: Event) => {
    e.preventDefault()
    stop()
    ready = false
    fail()
  }

  const onRestored = () => {
    if (disposed || restoreAttempts >= 1) return
    restoreAttempts++
    destroy()
    active = null
    mountHorizon()
  }

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true
      if (visible) start()
      else stop()
    },
    { threshold: 0 },
  )
  io.observe(root)

  const ro = new ResizeObserver(onResize)
  ro.observe(document.documentElement)

  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('orientationchange', onResize, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  canvas.addEventListener('webglcontextlost', onLost as EventListener)
  canvas.addEventListener('webglcontextrestored', onRestored)
  motionQuery.addEventListener('change', setMode)

  // ------------------------------------------------------------------ teardown
  function destroy() {
    if (disposed) return
    disposed = true
    stop()
    cancelAnimationFrame(staticRaf)
    window.clearTimeout(resizeTimer)

    io.disconnect()
    ro.disconnect()
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('pointermove', onPointer)
    document.removeEventListener('visibilitychange', onVisibility)
    canvas.removeEventListener('webglcontextlost', onLost as EventListener)
    canvas.removeEventListener('webglcontextrestored', onRestored)
    motionQuery.removeEventListener('change', setMode)

    scene.clear()
    skyGeo.dispose()
    seaGeo.dispose()
    skyMat.dispose()
    seaMat.dispose()
    renderer.dispose()
    active = null
  }

  // -------------------------------------------------------------------- boot
  try {
    resize()
    pos = posTarget = scrollPos()
    resolveFrame(pos)
    draw()
  } catch {
    destroy()
    fail()
    return null
  }

  setMode()

  const handle: HorizonHandle = {
    destroy,
    debug: () => {
      const i = Math.floor(pos)
      const raw = pos - i
      return {
        pos,
        from: ERAS[eraAt(i)].key,
        to: ERAS[eraAt(i + 1)].key,
        blend: raw * raw * (3 - 2 * raw),
        fps,
      }
    },
  }

  active = handle
  ;(window as unknown as { __horizon?: HorizonHandle }).__horizon = handle
  document.addEventListener('astro:before-swap', destroy, { once: true })
  return handle
}

// A polar disc with exponentially spaced rings: dense right in front of the
// camera where a 20-unit wave fills the screen, sparse at the horizon where it
// is a single pixel. A uniform grid would be mush in front and waste behind.
function buildSeaDisc(rings: number, segs: number, rMin: number, rMax: number): BufferGeometry {
  const cols = segs + 1
  const count = (rings + 1) * cols
  const pos = new Float32Array(count * 3)
  const ratio = rMax / rMin

  for (let i = 0; i <= rings; i++) {
    const r = rMin * Math.pow(ratio, i / rings)
    for (let j = 0; j < cols; j++) {
      const th = (j / segs) * Math.PI * 2
      const o = (i * cols + j) * 3
      pos[o] = r * Math.cos(th)
      pos[o + 1] = 0
      pos[o + 2] = r * Math.sin(th)
    }
  }

  const quads = rings * segs
  const index = count > 65535 ? new Uint32Array(quads * 6) : new Uint16Array(quads * 6)
  let n = 0
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * cols + j
      const b = (i + 1) * cols + j
      const c = (i + 1) * cols + j + 1
      const d = i * cols + j + 1
      // wound so the face normal is +Y
      index[n++] = a
      index[n++] = c
      index[n++] = b
      index[n++] = a
      index[n++] = d
      index[n++] = c
    }
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setIndex(new BufferAttribute(index, 1))
  return geo
}
