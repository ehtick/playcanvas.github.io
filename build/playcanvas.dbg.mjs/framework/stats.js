/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { getApplication } from './globals.js';

/**
 * Records performance-related statistics related to the application.
 *
 * @ignore
 */
class ApplicationStats {
  /**
   * Create a new ApplicationStats instance.
   *
   * @param {import('../platform/graphics/graphics-device.js').GraphicsDevice} device - The
   * graphics device.
   */
  constructor(device) {
    this.frame = {
      fps: 0,
      ms: 0,
      dt: 0,
      updateStart: 0,
      updateTime: 0,
      renderStart: 0,
      renderTime: 0,
      physicsStart: 0,
      physicsTime: 0,
      cullTime: 0,
      sortTime: 0,
      skinTime: 0,
      morphTime: 0,
      instancingTime: 0,
      // deprecated

      triangles: 0,
      otherPrimitives: 0,
      shaders: 0,
      materials: 0,
      cameras: 0,
      shadowMapUpdates: 0,
      shadowMapTime: 0,
      depthMapTime: 0,
      // deprecated
      forwardTime: 0,
      lightClustersTime: 0,
      lightClusters: 0,
      _timeToCountFrames: 0,
      _fpsAccum: 0
    };
    this.drawCalls = {
      forward: 0,
      depth: 0,
      // deprecated
      shadow: 0,
      immediate: 0,
      // deprecated
      misc: 0,
      // everything that is not forward/depth/shadow (post effect quads etc)
      total: 0,
      // total = forward + depth + shadow + misc

      // Some of forward/depth/shadow/misc draw calls:
      skinned: 0,
      instanced: 0,
      // deprecated

      removedByInstancing: 0 // deprecated
    };

    this.misc = {
      renderTargetCreationTime: 0
    };
    this.particles = {
      updatesPerFrame: 0,
      _updatesPerFrame: 0,
      frameTime: 0,
      _frameTime: 0
    };
    this.shaders = device._shaderStats;
    this.vram = device._vram;
    Object.defineProperty(this.vram, 'totalUsed', {
      get: function () {
        return this.tex + this.vb + this.ib;
      }
    });
    Object.defineProperty(this.vram, 'geom', {
      get: function () {
        return this.vb + this.ib;
      }
    });
  }
  get scene() {
    return getApplication().scene._stats;
  }
  get lightmapper() {
    var _getApplication$light;
    return (_getApplication$light = getApplication().lightmapper) == null ? void 0 : _getApplication$light.stats;
  }
  get batcher() {
    const batcher = getApplication()._batcher;
    return batcher ? batcher._stats : null;
  }
}

export { ApplicationStats };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvc3RhdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXBwbGljYXRpb24gfSBmcm9tICcuL2dsb2JhbHMuanMnO1xuXG4vKipcbiAqIFJlY29yZHMgcGVyZm9ybWFuY2UtcmVsYXRlZCBzdGF0aXN0aWNzIHJlbGF0ZWQgdG8gdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgQXBwbGljYXRpb25TdGF0cyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IEFwcGxpY2F0aW9uU3RhdHMgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vcGxhdGZvcm0vZ3JhcGhpY3MvZ3JhcGhpY3MtZGV2aWNlLmpzJykuR3JhcGhpY3NEZXZpY2V9IGRldmljZSAtIFRoZVxuICAgICAqIGdyYXBoaWNzIGRldmljZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihkZXZpY2UpIHtcbiAgICAgICAgdGhpcy5mcmFtZSA9IHtcbiAgICAgICAgICAgIGZwczogMCxcbiAgICAgICAgICAgIG1zOiAwLFxuICAgICAgICAgICAgZHQ6IDAsXG5cbiAgICAgICAgICAgIHVwZGF0ZVN0YXJ0OiAwLFxuICAgICAgICAgICAgdXBkYXRlVGltZTogMCxcbiAgICAgICAgICAgIHJlbmRlclN0YXJ0OiAwLFxuICAgICAgICAgICAgcmVuZGVyVGltZTogMCxcbiAgICAgICAgICAgIHBoeXNpY3NTdGFydDogMCxcbiAgICAgICAgICAgIHBoeXNpY3NUaW1lOiAwLFxuICAgICAgICAgICAgY3VsbFRpbWU6IDAsXG4gICAgICAgICAgICBzb3J0VGltZTogMCxcbiAgICAgICAgICAgIHNraW5UaW1lOiAwLFxuICAgICAgICAgICAgbW9ycGhUaW1lOiAwLFxuICAgICAgICAgICAgaW5zdGFuY2luZ1RpbWU6IDAsIC8vIGRlcHJlY2F0ZWRcblxuICAgICAgICAgICAgdHJpYW5nbGVzOiAwLFxuICAgICAgICAgICAgb3RoZXJQcmltaXRpdmVzOiAwLFxuICAgICAgICAgICAgc2hhZGVyczogMCxcbiAgICAgICAgICAgIG1hdGVyaWFsczogMCxcbiAgICAgICAgICAgIGNhbWVyYXM6IDAsXG4gICAgICAgICAgICBzaGFkb3dNYXBVcGRhdGVzOiAwLFxuICAgICAgICAgICAgc2hhZG93TWFwVGltZTogMCxcbiAgICAgICAgICAgIGRlcHRoTWFwVGltZTogMCwgLy8gZGVwcmVjYXRlZFxuICAgICAgICAgICAgZm9yd2FyZFRpbWU6IDAsXG5cbiAgICAgICAgICAgIGxpZ2h0Q2x1c3RlcnNUaW1lOiAwLFxuICAgICAgICAgICAgbGlnaHRDbHVzdGVyczogMCxcblxuICAgICAgICAgICAgX3RpbWVUb0NvdW50RnJhbWVzOiAwLFxuICAgICAgICAgICAgX2Zwc0FjY3VtOiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kcmF3Q2FsbHMgPSB7XG4gICAgICAgICAgICBmb3J3YXJkOiAwLFxuICAgICAgICAgICAgZGVwdGg6IDAsIC8vIGRlcHJlY2F0ZWRcbiAgICAgICAgICAgIHNoYWRvdzogMCxcbiAgICAgICAgICAgIGltbWVkaWF0ZTogMCwgLy8gZGVwcmVjYXRlZFxuICAgICAgICAgICAgbWlzYzogMCwgLy8gZXZlcnl0aGluZyB0aGF0IGlzIG5vdCBmb3J3YXJkL2RlcHRoL3NoYWRvdyAocG9zdCBlZmZlY3QgcXVhZHMgZXRjKVxuICAgICAgICAgICAgdG90YWw6IDAsIC8vIHRvdGFsID0gZm9yd2FyZCArIGRlcHRoICsgc2hhZG93ICsgbWlzY1xuXG4gICAgICAgICAgICAvLyBTb21lIG9mIGZvcndhcmQvZGVwdGgvc2hhZG93L21pc2MgZHJhdyBjYWxsczpcbiAgICAgICAgICAgIHNraW5uZWQ6IDAsXG4gICAgICAgICAgICBpbnN0YW5jZWQ6IDAsIC8vIGRlcHJlY2F0ZWRcblxuICAgICAgICAgICAgcmVtb3ZlZEJ5SW5zdGFuY2luZzogMCAvLyBkZXByZWNhdGVkXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5taXNjID0ge1xuICAgICAgICAgICAgcmVuZGVyVGFyZ2V0Q3JlYXRpb25UaW1lOiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSB7XG4gICAgICAgICAgICB1cGRhdGVzUGVyRnJhbWU6IDAsXG4gICAgICAgICAgICBfdXBkYXRlc1BlckZyYW1lOiAwLFxuICAgICAgICAgICAgZnJhbWVUaW1lOiAwLFxuICAgICAgICAgICAgX2ZyYW1lVGltZTogMFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2hhZGVycyA9IGRldmljZS5fc2hhZGVyU3RhdHM7XG4gICAgICAgIHRoaXMudnJhbSA9IGRldmljZS5fdnJhbTtcblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcy52cmFtLCAndG90YWxVc2VkJywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGV4ICsgdGhpcy52YiArIHRoaXMuaWI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLnZyYW0sICdnZW9tJywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudmIgKyB0aGlzLmliO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgc2NlbmUoKSB7XG4gICAgICAgIHJldHVybiBnZXRBcHBsaWNhdGlvbigpLnNjZW5lLl9zdGF0cztcbiAgICB9XG5cbiAgICBnZXQgbGlnaHRtYXBwZXIoKSB7XG4gICAgICAgIHJldHVybiBnZXRBcHBsaWNhdGlvbigpLmxpZ2h0bWFwcGVyPy5zdGF0cztcbiAgICB9XG5cbiAgICBnZXQgYmF0Y2hlcigpIHtcbiAgICAgICAgY29uc3QgYmF0Y2hlciA9IGdldEFwcGxpY2F0aW9uKCkuX2JhdGNoZXI7XG4gICAgICAgIHJldHVybiBiYXRjaGVyID8gYmF0Y2hlci5fc3RhdHMgOiBudWxsO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgQXBwbGljYXRpb25TdGF0cyB9O1xuIl0sIm5hbWVzIjpbIkFwcGxpY2F0aW9uU3RhdHMiLCJjb25zdHJ1Y3RvciIsImRldmljZSIsImZyYW1lIiwiZnBzIiwibXMiLCJkdCIsInVwZGF0ZVN0YXJ0IiwidXBkYXRlVGltZSIsInJlbmRlclN0YXJ0IiwicmVuZGVyVGltZSIsInBoeXNpY3NTdGFydCIsInBoeXNpY3NUaW1lIiwiY3VsbFRpbWUiLCJzb3J0VGltZSIsInNraW5UaW1lIiwibW9ycGhUaW1lIiwiaW5zdGFuY2luZ1RpbWUiLCJ0cmlhbmdsZXMiLCJvdGhlclByaW1pdGl2ZXMiLCJzaGFkZXJzIiwibWF0ZXJpYWxzIiwiY2FtZXJhcyIsInNoYWRvd01hcFVwZGF0ZXMiLCJzaGFkb3dNYXBUaW1lIiwiZGVwdGhNYXBUaW1lIiwiZm9yd2FyZFRpbWUiLCJsaWdodENsdXN0ZXJzVGltZSIsImxpZ2h0Q2x1c3RlcnMiLCJfdGltZVRvQ291bnRGcmFtZXMiLCJfZnBzQWNjdW0iLCJkcmF3Q2FsbHMiLCJmb3J3YXJkIiwiZGVwdGgiLCJzaGFkb3ciLCJpbW1lZGlhdGUiLCJtaXNjIiwidG90YWwiLCJza2lubmVkIiwiaW5zdGFuY2VkIiwicmVtb3ZlZEJ5SW5zdGFuY2luZyIsInJlbmRlclRhcmdldENyZWF0aW9uVGltZSIsInBhcnRpY2xlcyIsInVwZGF0ZXNQZXJGcmFtZSIsIl91cGRhdGVzUGVyRnJhbWUiLCJmcmFtZVRpbWUiLCJfZnJhbWVUaW1lIiwiX3NoYWRlclN0YXRzIiwidnJhbSIsIl92cmFtIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJnZXQiLCJ0ZXgiLCJ2YiIsImliIiwic2NlbmUiLCJnZXRBcHBsaWNhdGlvbiIsIl9zdGF0cyIsImxpZ2h0bWFwcGVyIiwiX2dldEFwcGxpY2F0aW9uJGxpZ2h0Iiwi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
