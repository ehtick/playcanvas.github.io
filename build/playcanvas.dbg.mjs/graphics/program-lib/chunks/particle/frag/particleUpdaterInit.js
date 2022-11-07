/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
var particleUpdaterInitPS = `
varying vec2 vUv0;

uniform highp sampler2D particleTexIN;
uniform highp sampler2D internalTex0;
uniform highp sampler2D internalTex1;
uniform highp sampler2D internalTex2;
uniform highp sampler2D internalTex3;

uniform mat3 emitterMatrix, emitterMatrixInv;
uniform vec3 emitterScale;

uniform vec3 emitterPos, frameRandom, localVelocityDivMult, velocityDivMult;
uniform float delta, rate, rateDiv, lifetime, numParticles, rotSpeedDivMult, radialSpeedDivMult, seed;
uniform float startAngle, startAngle2;
uniform float initialVelocity;

uniform float graphSampleSize;
uniform float graphNumSamples;

vec3 inPos;
vec3 inVel;
float inAngle;
bool inShow;
float inLife;
float visMode;

vec3 outPos;
vec3 outVel;
float outAngle;
bool outShow;
float outLife;
`;

export { particleUpdaterInitPS as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGljbGVVcGRhdGVySW5pdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2dyYXBoaWNzL3Byb2dyYW0tbGliL2NodW5rcy9wYXJ0aWNsZS9mcmFnL3BhcnRpY2xlVXBkYXRlckluaXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgLyogZ2xzbCAqL2BcbnZhcnlpbmcgdmVjMiB2VXYwO1xuXG51bmlmb3JtIGhpZ2hwIHNhbXBsZXIyRCBwYXJ0aWNsZVRleElOO1xudW5pZm9ybSBoaWdocCBzYW1wbGVyMkQgaW50ZXJuYWxUZXgwO1xudW5pZm9ybSBoaWdocCBzYW1wbGVyMkQgaW50ZXJuYWxUZXgxO1xudW5pZm9ybSBoaWdocCBzYW1wbGVyMkQgaW50ZXJuYWxUZXgyO1xudW5pZm9ybSBoaWdocCBzYW1wbGVyMkQgaW50ZXJuYWxUZXgzO1xuXG51bmlmb3JtIG1hdDMgZW1pdHRlck1hdHJpeCwgZW1pdHRlck1hdHJpeEludjtcbnVuaWZvcm0gdmVjMyBlbWl0dGVyU2NhbGU7XG5cbnVuaWZvcm0gdmVjMyBlbWl0dGVyUG9zLCBmcmFtZVJhbmRvbSwgbG9jYWxWZWxvY2l0eURpdk11bHQsIHZlbG9jaXR5RGl2TXVsdDtcbnVuaWZvcm0gZmxvYXQgZGVsdGEsIHJhdGUsIHJhdGVEaXYsIGxpZmV0aW1lLCBudW1QYXJ0aWNsZXMsIHJvdFNwZWVkRGl2TXVsdCwgcmFkaWFsU3BlZWREaXZNdWx0LCBzZWVkO1xudW5pZm9ybSBmbG9hdCBzdGFydEFuZ2xlLCBzdGFydEFuZ2xlMjtcbnVuaWZvcm0gZmxvYXQgaW5pdGlhbFZlbG9jaXR5O1xuXG51bmlmb3JtIGZsb2F0IGdyYXBoU2FtcGxlU2l6ZTtcbnVuaWZvcm0gZmxvYXQgZ3JhcGhOdW1TYW1wbGVzO1xuXG52ZWMzIGluUG9zO1xudmVjMyBpblZlbDtcbmZsb2F0IGluQW5nbGU7XG5ib29sIGluU2hvdztcbmZsb2F0IGluTGlmZTtcbmZsb2F0IHZpc01vZGU7XG5cbnZlYzMgb3V0UG9zO1xudmVjMyBvdXRWZWw7XG5mbG9hdCBvdXRBbmdsZTtcbmJvb2wgb3V0U2hvdztcbmZsb2F0IG91dExpZmU7XG5gO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNEJBQTBCLENBQUE7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQWhDQTs7OzsifQ==
