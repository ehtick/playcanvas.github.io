/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
var particle_normalMapPS = `
    vec3 normalMap = normalize(texture2D(normalMap, vec2(texCoordsAlphaLife.x, 1.0 - texCoordsAlphaLife.y)).xyz * 2.0 - 1.0);
    vec3 normal = ParticleMat * normalMap;
`;

export { particle_normalMapPS as default };
