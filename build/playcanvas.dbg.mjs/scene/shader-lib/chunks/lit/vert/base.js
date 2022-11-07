/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
var baseVS = `
attribute vec3 vertex_position;
attribute vec3 vertex_normal;
attribute vec4 vertex_tangent;
attribute vec2 vertex_texCoord0;
attribute vec2 vertex_texCoord1;
attribute vec4 vertex_color;

uniform mat4 matrix_viewProjection;
uniform mat4 matrix_model;
uniform mat3 matrix_normal;

vec3 dPositionW;
mat4 dModelMatrix;
mat3 dNormalMatrix;
`;

export { baseVS as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NjZW5lL3NoYWRlci1saWIvY2h1bmtzL2xpdC92ZXJ0L2Jhc2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgLyogZ2xzbCAqL2BcbmF0dHJpYnV0ZSB2ZWMzIHZlcnRleF9wb3NpdGlvbjtcbmF0dHJpYnV0ZSB2ZWMzIHZlcnRleF9ub3JtYWw7XG5hdHRyaWJ1dGUgdmVjNCB2ZXJ0ZXhfdGFuZ2VudDtcbmF0dHJpYnV0ZSB2ZWMyIHZlcnRleF90ZXhDb29yZDA7XG5hdHRyaWJ1dGUgdmVjMiB2ZXJ0ZXhfdGV4Q29vcmQxO1xuYXR0cmlidXRlIHZlYzQgdmVydGV4X2NvbG9yO1xuXG51bmlmb3JtIG1hdDQgbWF0cml4X3ZpZXdQcm9qZWN0aW9uO1xudW5pZm9ybSBtYXQ0IG1hdHJpeF9tb2RlbDtcbnVuaWZvcm0gbWF0MyBtYXRyaXhfbm9ybWFsO1xuXG52ZWMzIGRQb3NpdGlvblc7XG5tYXQ0IGRNb2RlbE1hdHJpeDtcbm1hdDMgZE5vcm1hbE1hdHJpeDtcbmA7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxhQUEwQixDQUFBO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7OyJ9
