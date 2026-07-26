import { skyCommon } from './sky-common.glsl'

// One fullscreen triangle. The view ray is reconstructed from the inverse
// view-projection matrix, which is linear in NDC, so the varying interpolates
// exactly. Cheaper than a skybox sphere and there is no geometry to dispose.
export const skyVert = /* glsl */ `
uniform mat4 uInvVP;
varying vec3 vRay;

void main() {
  vec4 wp = uInvVP * vec4(position.xy, 1.0, 1.0);
  vRay = wp.xyz / wp.w - cameraPosition;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`

export const skyFrag = /* glsl */ `
${skyCommon}

varying vec3 vRay;

// Dither is hzDither() from skyCommon — see the note in sea.glsl.
#include <common>

void main() {
  gl_FragColor = vec4(skyFull(normalize(vRay)), 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb = hzDither(gl_FragColor.rgb, gl_FragCoord.xy);
}
`
