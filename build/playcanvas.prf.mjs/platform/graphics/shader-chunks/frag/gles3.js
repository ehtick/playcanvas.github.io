/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
var gles3PS = `
#define varying in
out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
#define texture2D texture
#define texture2DBias texture
#define textureCube texture
#define texture2DProj textureProj
#define texture2DLodEXT textureLod
#define texture2DProjLodEXT textureProjLod
#define textureCubeLodEXT textureLod
#define texture2DGradEXT textureGrad
#define texture2DProjGradEXT textureProjGrad
#define textureCubeGradEXT textureGrad

// sample shadows using textureGrad to remove derivates in the dynamic loops (which are used by
// clustered lighting) - as DirectX shader compiler tries to unroll the loops and takes long time
// to compile the shader. Using textureLod would be even better, but WebGl does not translate it to
// lod instruction for DirectX correctly and uses SampleCmp instead of SampleCmpLevelZero or similar.
#define textureShadow(res, uv) textureGrad(res, uv, vec2(1, 1), vec2(1, 1))

#define GL2
#define SUPPORTS_TEXLOD
`;

export { gles3PS as default };
