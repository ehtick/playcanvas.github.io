/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
var fogNonePS = `
float dBlendModeFogFactor = 1.0;

vec3 addFog(vec3 color) {
    return color;
}
`;

export { fogNonePS as default };
