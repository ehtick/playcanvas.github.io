/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
var shadowCoordPerspZbufferPS = /* glsl */`
void _getShadowCoordPerspZbuffer(mat4 shadowMatrix, vec4 shadowParams, vec3 wPos) {
    vec4 projPos = shadowMatrix * vec4(wPos, 1.0);
    projPos.xyz /= projPos.w;
    dShadowCoord = projPos.xyz;
    // depth bias is already applied on render
}

void getShadowCoordPerspZbufferNormalOffset(mat4 shadowMatrix, vec4 shadowParams, vec3 normal) {
    vec3 wPos = vPositionW + normal * shadowParams.y;
    _getShadowCoordPerspZbuffer(shadowMatrix, shadowParams, wPos);
}

void getShadowCoordPerspZbuffer(mat4 shadowMatrix, vec4 shadowParams) {
    _getShadowCoordPerspZbuffer(shadowMatrix, shadowParams, vPositionW);
}
`;

export { shadowCoordPerspZbufferPS as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93Q29vcmRQZXJzcFpidWZmZXIuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY2VuZS9zaGFkZXItbGliL2NodW5rcy9saXQvZnJhZy9zaGFkb3dDb29yZFBlcnNwWmJ1ZmZlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCAvKiBnbHNsICovYFxudm9pZCBfZ2V0U2hhZG93Q29vcmRQZXJzcFpidWZmZXIobWF0NCBzaGFkb3dNYXRyaXgsIHZlYzQgc2hhZG93UGFyYW1zLCB2ZWMzIHdQb3MpIHtcbiAgICB2ZWM0IHByb2pQb3MgPSBzaGFkb3dNYXRyaXggKiB2ZWM0KHdQb3MsIDEuMCk7XG4gICAgcHJvalBvcy54eXogLz0gcHJvalBvcy53O1xuICAgIGRTaGFkb3dDb29yZCA9IHByb2pQb3MueHl6O1xuICAgIC8vIGRlcHRoIGJpYXMgaXMgYWxyZWFkeSBhcHBsaWVkIG9uIHJlbmRlclxufVxuXG52b2lkIGdldFNoYWRvd0Nvb3JkUGVyc3BaYnVmZmVyTm9ybWFsT2Zmc2V0KG1hdDQgc2hhZG93TWF0cml4LCB2ZWM0IHNoYWRvd1BhcmFtcywgdmVjMyBub3JtYWwpIHtcbiAgICB2ZWMzIHdQb3MgPSB2UG9zaXRpb25XICsgbm9ybWFsICogc2hhZG93UGFyYW1zLnk7XG4gICAgX2dldFNoYWRvd0Nvb3JkUGVyc3BaYnVmZmVyKHNoYWRvd01hdHJpeCwgc2hhZG93UGFyYW1zLCB3UG9zKTtcbn1cblxudm9pZCBnZXRTaGFkb3dDb29yZFBlcnNwWmJ1ZmZlcihtYXQ0IHNoYWRvd01hdHJpeCwgdmVjNCBzaGFkb3dQYXJhbXMpIHtcbiAgICBfZ2V0U2hhZG93Q29vcmRQZXJzcFpidWZmZXIoc2hhZG93TWF0cml4LCBzaGFkb3dQYXJhbXMsIHZQb3NpdGlvblcpO1xufVxuYDtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdDQUFlLFVBQVcsQ0FBQTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7OyJ9
