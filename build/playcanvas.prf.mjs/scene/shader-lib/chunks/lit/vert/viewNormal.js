/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
var viewNormalVS = `
#ifndef VIEWMATRIX
#define VIEWMATRIX
uniform mat4 matrix_view;
#endif

vec3 getViewNormal() {
    return mat3(matrix_view) * vNormalW;
}
`;

export { viewNormalVS as default };
