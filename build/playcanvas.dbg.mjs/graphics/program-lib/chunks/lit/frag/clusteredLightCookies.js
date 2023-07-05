/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
var clusteredLightCookiesPS = `
vec3 _getCookieClustered(sampler2D tex, vec2 uv, float intensity, bool isRgb, vec4 cookieChannel) {
    vec4 pixel = mix(vec4(1.0), texture2D(tex, uv), intensity);
    return isRgb == true ? pixel.rgb : vec3(dot(pixel, cookieChannel));
}

// getCookie2D for clustered lighting including channel selector
vec3 getCookie2DClustered(sampler2D tex, mat4 transform, vec3 worldPosition, float intensity, bool isRgb, vec4 cookieChannel) {
    vec4 projPos = transform * vec4(worldPosition, 1.0);
    return _getCookieClustered(tex, projPos.xy / projPos.w, intensity, isRgb, cookieChannel);
}

// getCookie for clustered omni light with the cookie texture being stored in the cookie atlas
vec3 getCookieCubeClustered(sampler2D tex, vec3 dir, float intensity, bool isRgb, vec4 cookieChannel, float shadowTextureResolution, float shadowEdgePixels, vec3 omniAtlasViewport) {
    vec2 uv = getCubemapAtlasCoordinates(omniAtlasViewport, shadowEdgePixels, shadowTextureResolution, dir);
    return _getCookieClustered(tex, uv, intensity, isRgb, cookieChannel);
}
`;

export { clusteredLightCookiesPS as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2x1c3RlcmVkTGlnaHRDb29raWVzLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZ3JhcGhpY3MvcHJvZ3JhbS1saWIvY2h1bmtzL2xpdC9mcmFnL2NsdXN0ZXJlZExpZ2h0Q29va2llcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCAvKiBnbHNsICovYFxudmVjMyBfZ2V0Q29va2llQ2x1c3RlcmVkKHNhbXBsZXIyRCB0ZXgsIHZlYzIgdXYsIGZsb2F0IGludGVuc2l0eSwgYm9vbCBpc1JnYiwgdmVjNCBjb29raWVDaGFubmVsKSB7XG4gICAgdmVjNCBwaXhlbCA9IG1peCh2ZWM0KDEuMCksIHRleHR1cmUyRCh0ZXgsIHV2KSwgaW50ZW5zaXR5KTtcbiAgICByZXR1cm4gaXNSZ2IgPT0gdHJ1ZSA/IHBpeGVsLnJnYiA6IHZlYzMoZG90KHBpeGVsLCBjb29raWVDaGFubmVsKSk7XG59XG5cbi8vIGdldENvb2tpZTJEIGZvciBjbHVzdGVyZWQgbGlnaHRpbmcgaW5jbHVkaW5nIGNoYW5uZWwgc2VsZWN0b3JcbnZlYzMgZ2V0Q29va2llMkRDbHVzdGVyZWQoc2FtcGxlcjJEIHRleCwgbWF0NCB0cmFuc2Zvcm0sIHZlYzMgd29ybGRQb3NpdGlvbiwgZmxvYXQgaW50ZW5zaXR5LCBib29sIGlzUmdiLCB2ZWM0IGNvb2tpZUNoYW5uZWwpIHtcbiAgICB2ZWM0IHByb2pQb3MgPSB0cmFuc2Zvcm0gKiB2ZWM0KHdvcmxkUG9zaXRpb24sIDEuMCk7XG4gICAgcmV0dXJuIF9nZXRDb29raWVDbHVzdGVyZWQodGV4LCBwcm9qUG9zLnh5IC8gcHJvalBvcy53LCBpbnRlbnNpdHksIGlzUmdiLCBjb29raWVDaGFubmVsKTtcbn1cblxuLy8gZ2V0Q29va2llIGZvciBjbHVzdGVyZWQgb21uaSBsaWdodCB3aXRoIHRoZSBjb29raWUgdGV4dHVyZSBiZWluZyBzdG9yZWQgaW4gdGhlIGNvb2tpZSBhdGxhc1xudmVjMyBnZXRDb29raWVDdWJlQ2x1c3RlcmVkKHNhbXBsZXIyRCB0ZXgsIHZlYzMgZGlyLCBmbG9hdCBpbnRlbnNpdHksIGJvb2wgaXNSZ2IsIHZlYzQgY29va2llQ2hhbm5lbCwgZmxvYXQgc2hhZG93VGV4dHVyZVJlc29sdXRpb24sIGZsb2F0IHNoYWRvd0VkZ2VQaXhlbHMsIHZlYzMgb21uaUF0bGFzVmlld3BvcnQpIHtcbiAgICB2ZWMyIHV2ID0gZ2V0Q3ViZW1hcEF0bGFzQ29vcmRpbmF0ZXMob21uaUF0bGFzVmlld3BvcnQsIHNoYWRvd0VkZ2VQaXhlbHMsIHNoYWRvd1RleHR1cmVSZXNvbHV0aW9uLCBkaXIpO1xuICAgIHJldHVybiBfZ2V0Q29va2llQ2x1c3RlcmVkKHRleCwgdXYsIGludGVuc2l0eSwgaXNSZ2IsIGNvb2tpZUNoYW5uZWwpO1xufVxuYDtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDhCQUEwQixDQUFBO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FqQkE7Ozs7In0=
