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

// <common> supplies rand(), which dithering_pars_fragment depends on.
#include <common>
#include <dithering_pars_fragment>

void main() {
  gl_FragColor = vec4(skyFull(normalize(vRay)), 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <dithering_fragment>
}
`
