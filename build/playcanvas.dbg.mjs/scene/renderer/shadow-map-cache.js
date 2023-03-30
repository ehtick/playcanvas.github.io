/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { LIGHTTYPE_OMNI } from '../constants.js';
import { ShadowMap } from './shadow-map.js';

// In the normal case where the light renders a shadow, the light has a unique shadow map.
// ShadowMapCache is used in two cases:
// 1) by Lightmapper - when lights are baked to lightmaps one at a time, shadow maps are re-used
//    to limit allocations. Those are deleted when baking is done.
// 2) by ShadowRenderer - when VSM blur is done, a temporary buffer is grabbed from the cache
class ShadowMapCache {
  constructor() {
    // maps a shadow map key to an array of shadow maps in the cache
    this.cache = new Map();
  }
  destroy() {
    this.clear();
    this.cache = null;
  }

  // remove all shadowmaps from the cache
  clear() {
    this.cache.forEach(shadowMaps => {
      shadowMaps.forEach(shadowMap => {
        shadowMap.destroy();
      });
    });
    this.cache.clear();
  }

  // generates a string key for the shadow map required by the light
  getKey(light) {
    const isCubeMap = light._type === LIGHTTYPE_OMNI;
    const shadowType = light._shadowType;
    const resolution = light._shadowResolution;
    return `${isCubeMap}-${shadowType}-${resolution}`;
  }

  // returns shadow map from the cache, or creates a new one if none available
  get(device, light) {
    // get matching shadow buffer from the cache
    const key = this.getKey(light);
    const shadowMaps = this.cache.get(key);
    if (shadowMaps && shadowMaps.length) {
      return shadowMaps.pop();
    }

    // create new one if not in cache
    const shadowMap = ShadowMap.create(device, light);
    shadowMap.cached = true;
    return shadowMap;
  }

  // returns shadow map for the light back to the cache
  add(light, shadowMap) {
    const key = this.getKey(light);
    const shadowMaps = this.cache.get(key);
    if (shadowMaps) {
      shadowMaps.push(shadowMap);
    } else {
      this.cache.set(key, [shadowMap]);
    }
  }
}

export { ShadowMapCache };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93LW1hcC1jYWNoZS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjZW5lL3JlbmRlcmVyL3NoYWRvdy1tYXAtY2FjaGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBMSUdIVFRZUEVfT01OSVxufSBmcm9tICcuLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgU2hhZG93TWFwIH0gZnJvbSAnLi9zaGFkb3ctbWFwLmpzJztcblxuLy8gSW4gdGhlIG5vcm1hbCBjYXNlIHdoZXJlIHRoZSBsaWdodCByZW5kZXJzIGEgc2hhZG93LCB0aGUgbGlnaHQgaGFzIGEgdW5pcXVlIHNoYWRvdyBtYXAuXG4vLyBTaGFkb3dNYXBDYWNoZSBpcyB1c2VkIGluIHR3byBjYXNlczpcbi8vIDEpIGJ5IExpZ2h0bWFwcGVyIC0gd2hlbiBsaWdodHMgYXJlIGJha2VkIHRvIGxpZ2h0bWFwcyBvbmUgYXQgYSB0aW1lLCBzaGFkb3cgbWFwcyBhcmUgcmUtdXNlZFxuLy8gICAgdG8gbGltaXQgYWxsb2NhdGlvbnMuIFRob3NlIGFyZSBkZWxldGVkIHdoZW4gYmFraW5nIGlzIGRvbmUuXG4vLyAyKSBieSBTaGFkb3dSZW5kZXJlciAtIHdoZW4gVlNNIGJsdXIgaXMgZG9uZSwgYSB0ZW1wb3JhcnkgYnVmZmVyIGlzIGdyYWJiZWQgZnJvbSB0aGUgY2FjaGVcbmNsYXNzIFNoYWRvd01hcENhY2hlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy8gbWFwcyBhIHNoYWRvdyBtYXAga2V5IHRvIGFuIGFycmF5IG9mIHNoYWRvdyBtYXBzIGluIHRoZSBjYWNoZVxuICAgICAgICB0aGlzLmNhY2hlID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5jYWNoZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGFsbCBzaGFkb3dtYXBzIGZyb20gdGhlIGNhY2hlXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuY2FjaGUuZm9yRWFjaCgoc2hhZG93TWFwcykgPT4ge1xuICAgICAgICAgICAgc2hhZG93TWFwcy5mb3JFYWNoKChzaGFkb3dNYXApID0+IHtcbiAgICAgICAgICAgICAgICBzaGFkb3dNYXAuZGVzdHJveSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNhY2hlLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgLy8gZ2VuZXJhdGVzIGEgc3RyaW5nIGtleSBmb3IgdGhlIHNoYWRvdyBtYXAgcmVxdWlyZWQgYnkgdGhlIGxpZ2h0XG4gICAgZ2V0S2V5KGxpZ2h0KSB7XG4gICAgICAgIGNvbnN0IGlzQ3ViZU1hcCA9IGxpZ2h0Ll90eXBlID09PSBMSUdIVFRZUEVfT01OSTtcbiAgICAgICAgY29uc3Qgc2hhZG93VHlwZSA9IGxpZ2h0Ll9zaGFkb3dUeXBlO1xuICAgICAgICBjb25zdCByZXNvbHV0aW9uID0gbGlnaHQuX3NoYWRvd1Jlc29sdXRpb247XG4gICAgICAgIHJldHVybiBgJHtpc0N1YmVNYXB9LSR7c2hhZG93VHlwZX0tJHtyZXNvbHV0aW9ufWA7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyBzaGFkb3cgbWFwIGZyb20gdGhlIGNhY2hlLCBvciBjcmVhdGVzIGEgbmV3IG9uZSBpZiBub25lIGF2YWlsYWJsZVxuICAgIGdldChkZXZpY2UsIGxpZ2h0KSB7XG5cbiAgICAgICAgLy8gZ2V0IG1hdGNoaW5nIHNoYWRvdyBidWZmZXIgZnJvbSB0aGUgY2FjaGVcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXkobGlnaHQpO1xuICAgICAgICBjb25zdCBzaGFkb3dNYXBzID0gdGhpcy5jYWNoZS5nZXQoa2V5KTtcbiAgICAgICAgaWYgKHNoYWRvd01hcHMgJiYgc2hhZG93TWFwcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBzaGFkb3dNYXBzLnBvcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY3JlYXRlIG5ldyBvbmUgaWYgbm90IGluIGNhY2hlXG4gICAgICAgIGNvbnN0IHNoYWRvd01hcCA9IFNoYWRvd01hcC5jcmVhdGUoZGV2aWNlLCBsaWdodCk7XG4gICAgICAgIHNoYWRvd01hcC5jYWNoZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gc2hhZG93TWFwO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgc2hhZG93IG1hcCBmb3IgdGhlIGxpZ2h0IGJhY2sgdG8gdGhlIGNhY2hlXG4gICAgYWRkKGxpZ2h0LCBzaGFkb3dNYXApIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5nZXRLZXkobGlnaHQpO1xuICAgICAgICBjb25zdCBzaGFkb3dNYXBzID0gdGhpcy5jYWNoZS5nZXQoa2V5KTtcbiAgICAgICAgaWYgKHNoYWRvd01hcHMpIHtcbiAgICAgICAgICAgIHNoYWRvd01hcHMucHVzaChzaGFkb3dNYXApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5zZXQoa2V5LCBbc2hhZG93TWFwXSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IFNoYWRvd01hcENhY2hlIH07XG4iXSwibmFtZXMiOlsiU2hhZG93TWFwQ2FjaGUiLCJjb25zdHJ1Y3RvciIsImNhY2hlIiwiTWFwIiwiZGVzdHJveSIsImNsZWFyIiwiZm9yRWFjaCIsInNoYWRvd01hcHMiLCJzaGFkb3dNYXAiLCJnZXRLZXkiLCJsaWdodCIsImlzQ3ViZU1hcCIsIl90eXBlIiwiTElHSFRUWVBFX09NTkkiLCJzaGFkb3dUeXBlIiwiX3NoYWRvd1R5cGUiLCJyZXNvbHV0aW9uIiwiX3NoYWRvd1Jlc29sdXRpb24iLCJnZXQiLCJkZXZpY2UiLCJrZXkiLCJsZW5ndGgiLCJwb3AiLCJTaGFkb3dNYXAiLCJjcmVhdGUiLCJjYWNoZWQiLCJhZGQiLCJwdXNoIiwic2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQSxj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
