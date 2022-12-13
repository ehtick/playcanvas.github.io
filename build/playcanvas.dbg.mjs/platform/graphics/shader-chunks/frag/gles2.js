/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
var gles2PS = `
#define texture2DBias texture2D

#ifndef SUPPORTS_TEXLOD

// fallback for lod instructions
#define texture2DLodEXT texture2D
#define texture2DProjLodEXT textureProj
#define textureCubeLodEXT textureCube
#define textureShadow texture2D

#else

#define textureShadow(res, uv) texture2DGradEXT(res, uv, vec2(1, 1), vec2(1, 1))

#endif

`;

export { gles2PS as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xlczIuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9wbGF0Zm9ybS9ncmFwaGljcy9zaGFkZXItY2h1bmtzL2ZyYWcvZ2xlczIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgLyogZ2xzbCAqL2BcbiNkZWZpbmUgdGV4dHVyZTJEQmlhcyB0ZXh0dXJlMkRcblxuI2lmbmRlZiBTVVBQT1JUU19URVhMT0RcblxuLy8gZmFsbGJhY2sgZm9yIGxvZCBpbnN0cnVjdGlvbnNcbiNkZWZpbmUgdGV4dHVyZTJETG9kRVhUIHRleHR1cmUyRFxuI2RlZmluZSB0ZXh0dXJlMkRQcm9qTG9kRVhUIHRleHR1cmVQcm9qXG4jZGVmaW5lIHRleHR1cmVDdWJlTG9kRVhUIHRleHR1cmVDdWJlXG4jZGVmaW5lIHRleHR1cmVTaGFkb3cgdGV4dHVyZTJEXG5cbiNlbHNlXG5cbiNkZWZpbmUgdGV4dHVyZVNoYWRvdyhyZXMsIHV2KSB0ZXh0dXJlMkRHcmFkRVhUKHJlcywgdXYsIHZlYzIoMSwgMSksIHZlYzIoMSwgMSkpXG5cbiNlbmRpZlxuXG5gO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsY0FBMEIsQ0FBQTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7Ozs7In0=
