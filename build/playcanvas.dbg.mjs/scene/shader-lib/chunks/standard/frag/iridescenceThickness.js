/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
var iridescenceThicknessPS = `
uniform float material_iridescenceThicknessMax;

#ifdef MAPTEXTURE
uniform float material_iridescenceThicknessMin;
#endif

void getIridescenceThickness() {

    #ifdef MAPTEXTURE
    float blend = texture2DBias($SAMPLER, $UV, textureBias).$CH;
    float iridescenceThickness = mix(material_iridescenceThicknessMin, material_iridescenceThicknessMax, blend);
    #else
    float iridescenceThickness = material_iridescenceThicknessMax;
    #endif

    dIridescenceThickness = iridescenceThickness; 
}
`;

export { iridescenceThicknessPS as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXJpZGVzY2VuY2VUaGlja25lc3MuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zY2VuZS9zaGFkZXItbGliL2NodW5rcy9zdGFuZGFyZC9mcmFnL2lyaWRlc2NlbmNlVGhpY2tuZXNzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IC8qIGdsc2wgKi9gXG51bmlmb3JtIGZsb2F0IG1hdGVyaWFsX2lyaWRlc2NlbmNlVGhpY2tuZXNzTWF4O1xuXG4jaWZkZWYgTUFQVEVYVFVSRVxudW5pZm9ybSBmbG9hdCBtYXRlcmlhbF9pcmlkZXNjZW5jZVRoaWNrbmVzc01pbjtcbiNlbmRpZlxuXG52b2lkIGdldElyaWRlc2NlbmNlVGhpY2tuZXNzKCkge1xuXG4gICAgI2lmZGVmIE1BUFRFWFRVUkVcbiAgICBmbG9hdCBibGVuZCA9IHRleHR1cmUyREJpYXMoJFNBTVBMRVIsICRVViwgdGV4dHVyZUJpYXMpLiRDSDtcbiAgICBmbG9hdCBpcmlkZXNjZW5jZVRoaWNrbmVzcyA9IG1peChtYXRlcmlhbF9pcmlkZXNjZW5jZVRoaWNrbmVzc01pbiwgbWF0ZXJpYWxfaXJpZGVzY2VuY2VUaGlja25lc3NNYXgsIGJsZW5kKTtcbiAgICAjZWxzZVxuICAgIGZsb2F0IGlyaWRlc2NlbmNlVGhpY2tuZXNzID0gbWF0ZXJpYWxfaXJpZGVzY2VuY2VUaGlja25lc3NNYXg7XG4gICAgI2VuZGlmXG5cbiAgICBkSXJpZGVzY2VuY2VUaGlja25lc3MgPSBpcmlkZXNjZW5jZVRoaWNrbmVzczsgXG59XG5gO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkJBQTBCLENBQUE7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7Ozs7In0=
