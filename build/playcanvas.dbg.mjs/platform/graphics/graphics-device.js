/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { EventHandler } from '../../core/event-handler.js';
import { platform } from '../../core/platform.js';
import { now } from '../../core/time.js';
import { ScopeSpace } from './scope-space.js';
import { PRIMITIVE_TRIFAN, PRIMITIVE_POINTS } from './constants.js';
import { Debug } from '../../core/debug.js';

const EVENT_RESIZE = 'resizecanvas';

class GraphicsDevice extends EventHandler {

  constructor(canvas) {
    super();
    this.canvas = void 0;
    this.deviceType = void 0;
    this.scope = void 0;
    this.boneLimit = void 0;
    this.maxAnisotropy = void 0;
    this.maxCubeMapSize = void 0;
    this.maxTextureSize = void 0;
    this.maxVolumeSize = void 0;
    this.precision = void 0;
    this.renderTarget = null;
    this.insideRenderPass = false;
    this.supportsInstancing = void 0;
    this.supportsUniformBuffers = false;
    this.textureFloatRenderable = void 0;
    this.textureHalfFloatRenderable = void 0;
    this.canvas = canvas;

    this._width = 0;
    this._height = 0;
    this._maxPixelRatio = 1;

    this.shaders = [];
    this.buffers = [];

    this.textures = [];

    this.targets = [];
    this._vram = {
      texShadow: 0,
      texAsset: 0,
      texLightmap: 0,
      tex: 0,
      vb: 0,
      ib: 0,
      ub: 0
    };
    this._shaderStats = {
      vsCompiled: 0,
      fsCompiled: 0,
      linked: 0,
      materialShaders: 0,
      compileTime: 0
    };
    this.initializeContextCaches();

    this._drawCallsPerFrame = 0;
    this._shaderSwitchesPerFrame = 0;
    this._primsPerFrame = [];
    for (let i = PRIMITIVE_POINTS; i <= PRIMITIVE_TRIFAN; i++) {
      this._primsPerFrame[i] = 0;
    }
    this._renderTargetCreationTime = 0;

    this.scope = new ScopeSpace("Device");
    this.textureBias = this.scope.resolve("textureBias");
    this.textureBias.setValue(0.0);
  }

  destroy() {
    this.fire('destroy');
  }
  onDestroyShader(shader) {
    this.fire('destroy:shader', shader);
    const idx = this.shaders.indexOf(shader);
    if (idx !== -1) {
      this.shaders.splice(idx, 1);
    }
  }

  postDestroy() {
    this.scope = null;
    this.canvas = null;
  }

  toJSON(key) {
    return undefined;
  }
  initializeContextCaches() {
    this.indexBuffer = null;
    this.vertexBuffers = [];
    this.shader = null;
    this.renderTarget = null;
  }

  setRenderTarget(renderTarget) {
    this.renderTarget = renderTarget;
  }

  setIndexBuffer(indexBuffer) {
    this.indexBuffer = indexBuffer;
  }

  setVertexBuffer(vertexBuffer) {
    if (vertexBuffer) {
      this.vertexBuffers.push(vertexBuffer);
    }
  }

  getRenderTarget() {
    return this.renderTarget;
  }

  initRenderTarget(target) {
    if (target.initialized) return;
    const startTime = now();
    this.fire('fbo:create', {
      timestamp: startTime,
      target: this
    });
    target.init();
    this.targets.push(target);
    this._renderTargetCreationTime += now() - startTime;
  }

  _isBrowserInterface(texture) {
    return this._isImageBrowserInterface(texture) || typeof HTMLCanvasElement !== 'undefined' && texture instanceof HTMLCanvasElement || typeof HTMLVideoElement !== 'undefined' && texture instanceof HTMLVideoElement;
  }
  _isImageBrowserInterface(texture) {
    return typeof ImageBitmap !== 'undefined' && texture instanceof ImageBitmap || typeof HTMLImageElement !== 'undefined' && texture instanceof HTMLImageElement;
  }

  resizeCanvas(width, height) {
    this._width = width;
    this._height = height;
    const ratio = Math.min(this._maxPixelRatio, platform.browser ? window.devicePixelRatio : 1);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.fire(EVENT_RESIZE, width, height);
    }
  }

  setResolution(width, height) {
    this._width = width;
    this._height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.fire(EVENT_RESIZE, width, height);
  }
  updateClientRect() {
    this.clientRect = this.canvas.getBoundingClientRect();
  }

  get width() {
    Debug.error("GraphicsDevice.width is not implemented on current device.");
    return this.canvas.width;
  }

  get height() {
    Debug.error("GraphicsDevice.height is not implemented on current device.");
    return this.canvas.height;
  }

  set fullscreen(fullscreen) {
    Debug.error("GraphicsDevice.fullscreen is not implemented on current device.");
  }
  get fullscreen() {
    Debug.error("GraphicsDevice.fullscreen is not implemented on current device.");
    return false;
  }

  set maxPixelRatio(ratio) {
    this._maxPixelRatio = ratio;
    this.resizeCanvas(this._width, this._height);
  }
  get maxPixelRatio() {
    return this._maxPixelRatio;
  }

  getBoneLimit() {
    return this.boneLimit;
  }

  setBoneLimit(maxBones) {
    this.boneLimit = maxBones;
  }
}

export { GraphicsDevice };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhpY3MtZGV2aWNlLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcGxhdGZvcm0vZ3JhcGhpY3MvZ3JhcGhpY3MtZGV2aWNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50SGFuZGxlciB9IGZyb20gJy4uLy4uL2NvcmUvZXZlbnQtaGFuZGxlci5qcyc7XG5pbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gJy4uLy4uL2NvcmUvcGxhdGZvcm0uanMnO1xuaW1wb3J0IHsgbm93IH0gZnJvbSAnLi4vLi4vY29yZS90aW1lLmpzJztcblxuaW1wb3J0IHsgU2NvcGVTcGFjZSB9IGZyb20gJy4vc2NvcGUtc3BhY2UuanMnO1xuXG5pbXBvcnQge1xuICAgIFBSSU1JVElWRV9QT0lOVFMsIFBSSU1JVElWRV9UUklGQU5cbn0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgRGVidWcgfSBmcm9tICcuLi8uLi9jb3JlL2RlYnVnLmpzJztcblxuY29uc3QgRVZFTlRfUkVTSVpFID0gJ3Jlc2l6ZWNhbnZhcyc7XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL3JlbmRlci10YXJnZXQuanMnKS5SZW5kZXJUYXJnZXR9IFJlbmRlclRhcmdldCAqL1xuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4vc2hhZGVyLmpzJykuU2hhZGVyfSBTaGFkZXIgKi9cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL3RleHR1cmUuanMnKS5UZXh0dXJlfSBUZXh0dXJlICovXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi9pbmRleC1idWZmZXIuanMnKS5JbmRleEJ1ZmZlcn0gSW5kZXhCdWZmZXIgKi9cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL3ZlcnRleC1idWZmZXIuanMnKS5WZXJ0ZXhCdWZmZXJ9IFZlcnRleEJ1ZmZlciAqL1xuXG4vKipcbiAqIFRoZSBncmFwaGljcyBkZXZpY2UgbWFuYWdlcyB0aGUgdW5kZXJseWluZyBncmFwaGljcyBjb250ZXh0LiBJdCBpcyByZXNwb25zaWJsZSBmb3Igc3VibWl0dGluZ1xuICogcmVuZGVyIHN0YXRlIGNoYW5nZXMgYW5kIGdyYXBoaWNzIHByaW1pdGl2ZXMgdG8gdGhlIGhhcmR3YXJlLiBBIGdyYXBoaWNzIGRldmljZSBpcyB0aWVkIHRvIGFcbiAqIHNwZWNpZmljIGNhbnZhcyBIVE1MIGVsZW1lbnQuIEl0IGlzIHZhbGlkIHRvIGhhdmUgbW9yZSB0aGFuIG9uZSBjYW52YXMgZWxlbWVudCBwZXIgcGFnZSBhbmRcbiAqIGNyZWF0ZSBhIG5ldyBncmFwaGljcyBkZXZpY2UgYWdhaW5zdCBlYWNoLlxuICpcbiAqIEBhdWdtZW50cyBFdmVudEhhbmRsZXJcbiAqL1xuY2xhc3MgR3JhcGhpY3NEZXZpY2UgZXh0ZW5kcyBFdmVudEhhbmRsZXIge1xuICAgIC8qKlxuICAgICAqIFRoZSBjYW52YXMgRE9NIGVsZW1lbnQgdGhhdCBwcm92aWRlcyB0aGUgdW5kZXJseWluZyBXZWJHTCBjb250ZXh0IHVzZWQgYnkgdGhlIGdyYXBoaWNzIGRldmljZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAgKi9cbiAgICBjYW52YXM7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZ3JhcGhpY3MgZGV2aWNlIHR5cGUsIERFVklDRVRZUEVfV0VCR0wgb3IgREVWSUNFVFlQRV9XRUJHUFUuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBkZXZpY2VUeXBlO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNjb3BlIG5hbWVzcGFjZSBmb3Igc2hhZGVyIGF0dHJpYnV0ZXMgYW5kIHZhcmlhYmxlcy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtTY29wZVNwYWNlfVxuICAgICAqL1xuICAgIHNjb3BlO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG1heGltdW0gbnVtYmVyIG9mIHN1cHBvcnRlZCBib25lcyB1c2luZyB1bmlmb3JtIGJ1ZmZlcnMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIGJvbmVMaW1pdDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBtYXhpbXVtIHN1cHBvcnRlZCB0ZXh0dXJlIGFuaXNvdHJvcHkgc2V0dGluZy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgbWF4QW5pc290cm9weTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBtYXhpbXVtIHN1cHBvcnRlZCBkaW1lbnNpb24gb2YgYSBjdWJlIG1hcC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgbWF4Q3ViZU1hcFNpemU7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWF4aW11bSBzdXBwb3J0ZWQgZGltZW5zaW9uIG9mIGEgdGV4dHVyZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgbWF4VGV4dHVyZVNpemU7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWF4aW11bSBzdXBwb3J0ZWQgZGltZW5zaW9uIG9mIGEgM0QgdGV4dHVyZSAoYW55IGF4aXMpLlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBtYXhWb2x1bWVTaXplO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGhpZ2hlc3Qgc2hhZGVyIHByZWNpc2lvbiBzdXBwb3J0ZWQgYnkgdGhpcyBncmFwaGljcyBkZXZpY2UuIENhbiBiZSAnaGlwaHAnLCAnbWVkaXVtcCcgb3JcbiAgICAgKiAnbG93cCcuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHByZWNpc2lvbjtcblxuICAgIC8qKlxuICAgICAqIEN1cnJlbnRseSBhY3RpdmUgcmVuZGVyIHRhcmdldC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtSZW5kZXJUYXJnZXR9XG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIHJlbmRlclRhcmdldCA9IG51bGw7XG5cbiAgICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gICAgaW5zaWRlUmVuZGVyUGFzcyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogVHJ1ZSBpZiBoYXJkd2FyZSBpbnN0YW5jaW5nIGlzIHN1cHBvcnRlZC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHN1cHBvcnRzSW5zdGFuY2luZztcblxuICAgIC8qKlxuICAgICAqIFRydWUgaWYgdGhlIGRldmljZSBzdXBwb3J0cyB1bmlmb3JtIGJ1ZmZlcnMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgc3VwcG9ydHNVbmlmb3JtQnVmZmVycyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogVHJ1ZSBpZiAzMi1iaXQgZmxvYXRpbmctcG9pbnQgdGV4dHVyZXMgY2FuIGJlIHVzZWQgYXMgYSBmcmFtZSBidWZmZXIuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0ZXh0dXJlRmxvYXRSZW5kZXJhYmxlO1xuXG4gICAgIC8qKlxuICAgICAgKiBUcnVlIGlmIDE2LWJpdCBmbG9hdGluZy1wb2ludCB0ZXh0dXJlcyBjYW4gYmUgdXNlZCBhcyBhIGZyYW1lIGJ1ZmZlci5cbiAgICAgICpcbiAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAqL1xuICAgIHRleHR1cmVIYWxmRmxvYXRSZW5kZXJhYmxlO1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG5cbiAgICAgICAgLy8gbG9jYWwgd2lkdGgvaGVpZ2h0IHdpdGhvdXQgcGl4ZWxSYXRpbyBhcHBsaWVkXG4gICAgICAgIHRoaXMuX3dpZHRoID0gMDtcbiAgICAgICAgdGhpcy5faGVpZ2h0ID0gMDtcblxuICAgICAgICB0aGlzLl9tYXhQaXhlbFJhdGlvID0gMTtcblxuICAgICAgICAvLyBBcnJheSBvZiBvYmplY3RzIHRoYXQgbmVlZCB0byBiZSByZS1pbml0aWFsaXplZCBhZnRlciBhIGNvbnRleHQgcmVzdG9yZSBldmVudFxuICAgICAgICAvKiogQHR5cGUge1NoYWRlcltdfSAqL1xuICAgICAgICB0aGlzLnNoYWRlcnMgPSBbXTtcblxuICAgICAgICB0aGlzLmJ1ZmZlcnMgPSBbXTtcblxuICAgICAgICAvKiogQHR5cGUge1RleHR1cmVbXX0gKi9cbiAgICAgICAgdGhpcy50ZXh0dXJlcyA9IFtdO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7UmVuZGVyVGFyZ2V0W119ICovXG4gICAgICAgIHRoaXMudGFyZ2V0cyA9IFtdO1xuXG4gICAgICAgIHRoaXMuX3ZyYW0gPSB7XG4gICAgICAgICAgICAvLyAjaWYgX1BST0ZJTEVSXG4gICAgICAgICAgICB0ZXhTaGFkb3c6IDAsXG4gICAgICAgICAgICB0ZXhBc3NldDogMCxcbiAgICAgICAgICAgIHRleExpZ2h0bWFwOiAwLFxuICAgICAgICAgICAgLy8gI2VuZGlmXG4gICAgICAgICAgICB0ZXg6IDAsXG4gICAgICAgICAgICB2YjogMCxcbiAgICAgICAgICAgIGliOiAwLFxuICAgICAgICAgICAgdWI6IDBcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9zaGFkZXJTdGF0cyA9IHtcbiAgICAgICAgICAgIHZzQ29tcGlsZWQ6IDAsXG4gICAgICAgICAgICBmc0NvbXBpbGVkOiAwLFxuICAgICAgICAgICAgbGlua2VkOiAwLFxuICAgICAgICAgICAgbWF0ZXJpYWxTaGFkZXJzOiAwLFxuICAgICAgICAgICAgY29tcGlsZVRpbWU6IDBcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemVDb250ZXh0Q2FjaGVzKCk7XG5cbiAgICAgICAgLy8gUHJvZmlsZXIgc3RhdHNcbiAgICAgICAgdGhpcy5fZHJhd0NhbGxzUGVyRnJhbWUgPSAwO1xuICAgICAgICB0aGlzLl9zaGFkZXJTd2l0Y2hlc1BlckZyYW1lID0gMDtcblxuICAgICAgICB0aGlzLl9wcmltc1BlckZyYW1lID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSBQUklNSVRJVkVfUE9JTlRTOyBpIDw9IFBSSU1JVElWRV9UUklGQU47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5fcHJpbXNQZXJGcmFtZVtpXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVuZGVyVGFyZ2V0Q3JlYXRpb25UaW1lID0gMDtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIFNjb3BlTmFtZXNwYWNlIGZvciBzaGFkZXIgYXR0cmlidXRlcyBhbmQgdmFyaWFibGVzXG4gICAgICAgIHRoaXMuc2NvcGUgPSBuZXcgU2NvcGVTcGFjZShcIkRldmljZVwiKTtcblxuICAgICAgICB0aGlzLnRleHR1cmVCaWFzID0gdGhpcy5zY29wZS5yZXNvbHZlKFwidGV4dHVyZUJpYXNcIik7XG4gICAgICAgIHRoaXMudGV4dHVyZUJpYXMuc2V0VmFsdWUoMC4wKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlZCB3aGVuIHRoZSBjYW52YXMgaXMgcmVzaXplZC5cbiAgICAgKlxuICAgICAqIEBldmVudCBHcmFwaGljc0RldmljZSNyZXNpemVjYW52YXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBUaGUgbmV3IHdpZHRoIG9mIHRoZSBjYW52YXMgaW4gcGl4ZWxzLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBUaGUgbmV3IGhlaWdodCBvZiB0aGUgY2FudmFzIGluIHBpeGVscy5cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3kgdGhlIGdyYXBoaWNzIGRldmljZS5cbiAgICAgKi9cbiAgICBkZXN0cm95KCkge1xuICAgICAgICAvLyBmaXJlIHRoZSBkZXN0cm95IGV2ZW50LlxuICAgICAgICAvLyB0ZXh0dXJlcyBhbmQgb3RoZXIgZGV2aWNlIHJlc291cmNlcyBtYXkgZGVzdHJveSB0aGVtc2VsdmVzIGluIHJlc3BvbnNlLlxuICAgICAgICB0aGlzLmZpcmUoJ2Rlc3Ryb3knKTtcbiAgICB9XG5cbiAgICBvbkRlc3Ryb3lTaGFkZXIoc2hhZGVyKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnZGVzdHJveTpzaGFkZXInLCBzaGFkZXIpO1xuXG4gICAgICAgIGNvbnN0IGlkeCA9IHRoaXMuc2hhZGVycy5pbmRleE9mKHNoYWRlcik7XG4gICAgICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnNoYWRlcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBleGVjdXRlcyBhZnRlciB0aGUgZXh0ZW5kZWQgY2xhc3NlcyBoYXZlIGV4ZWN1dGVkIHRoZWlyIGRlc3Ryb3kgZnVuY3Rpb25cbiAgICBwb3N0RGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5zY29wZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY2FudmFzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBkb24ndCBzdHJpbmdpZnkgR3JhcGhpY3NEZXZpY2UgdG8gSlNPTiBieSBKU09OLnN0cmluZ2lmeVxuICAgIHRvSlNPTihrZXkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpbml0aWFsaXplQ29udGV4dENhY2hlcygpIHtcbiAgICAgICAgdGhpcy5pbmRleEJ1ZmZlciA9IG51bGw7XG4gICAgICAgIHRoaXMudmVydGV4QnVmZmVycyA9IFtdO1xuICAgICAgICB0aGlzLnNoYWRlciA9IG51bGw7XG4gICAgICAgIHRoaXMucmVuZGVyVGFyZ2V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBzcGVjaWZpZWQgcmVuZGVyIHRhcmdldCBvbiB0aGUgZGV2aWNlLiBJZiBudWxsIGlzIHBhc3NlZCBhcyBhIHBhcmFtZXRlciwgdGhlIGJhY2tcbiAgICAgKiBidWZmZXIgYmVjb21lcyB0aGUgY3VycmVudCB0YXJnZXQgZm9yIGFsbCByZW5kZXJpbmcgb3BlcmF0aW9ucy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7UmVuZGVyVGFyZ2V0fSByZW5kZXJUYXJnZXQgLSBUaGUgcmVuZGVyIHRhcmdldCB0byBhY3RpdmF0ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFNldCBhIHJlbmRlciB0YXJnZXQgdG8gcmVjZWl2ZSBhbGwgcmVuZGVyaW5nIG91dHB1dFxuICAgICAqIGRldmljZS5zZXRSZW5kZXJUYXJnZXQocmVuZGVyVGFyZ2V0KTtcbiAgICAgKlxuICAgICAqIC8vIFNldCB0aGUgYmFjayBidWZmZXIgdG8gcmVjZWl2ZSBhbGwgcmVuZGVyaW5nIG91dHB1dFxuICAgICAqIGRldmljZS5zZXRSZW5kZXJUYXJnZXQobnVsbCk7XG4gICAgICovXG4gICAgc2V0UmVuZGVyVGFyZ2V0KHJlbmRlclRhcmdldCkge1xuICAgICAgICB0aGlzLnJlbmRlclRhcmdldCA9IHJlbmRlclRhcmdldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBjdXJyZW50IGluZGV4IGJ1ZmZlciBvbiB0aGUgZ3JhcGhpY3MgZGV2aWNlLiBPbiBzdWJzZXF1ZW50IGNhbGxzIHRvXG4gICAgICoge0BsaW5rIEdyYXBoaWNzRGV2aWNlI2RyYXd9LCB0aGUgc3BlY2lmaWVkIGluZGV4IGJ1ZmZlciB3aWxsIGJlIHVzZWQgdG8gcHJvdmlkZSBpbmRleCBkYXRhXG4gICAgICogZm9yIGFueSBpbmRleGVkIHByaW1pdGl2ZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0luZGV4QnVmZmVyfSBpbmRleEJ1ZmZlciAtIFRoZSBpbmRleCBidWZmZXIgdG8gYXNzaWduIHRvIHRoZSBkZXZpY2UuXG4gICAgICovXG4gICAgc2V0SW5kZXhCdWZmZXIoaW5kZXhCdWZmZXIpIHtcbiAgICAgICAgLy8gU3RvcmUgdGhlIGluZGV4IGJ1ZmZlclxuICAgICAgICB0aGlzLmluZGV4QnVmZmVyID0gaW5kZXhCdWZmZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgY3VycmVudCB2ZXJ0ZXggYnVmZmVyIG9uIHRoZSBncmFwaGljcyBkZXZpY2UuIE9uIHN1YnNlcXVlbnQgY2FsbHMgdG9cbiAgICAgKiB7QGxpbmsgR3JhcGhpY3NEZXZpY2UjZHJhd30sIHRoZSBzcGVjaWZpZWQgdmVydGV4IGJ1ZmZlcihzKSB3aWxsIGJlIHVzZWQgdG8gcHJvdmlkZSB2ZXJ0ZXhcbiAgICAgKiBkYXRhIGZvciBhbnkgcHJpbWl0aXZlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VmVydGV4QnVmZmVyfSB2ZXJ0ZXhCdWZmZXIgLSBUaGUgdmVydGV4IGJ1ZmZlciB0byBhc3NpZ24gdG8gdGhlIGRldmljZS5cbiAgICAgKi9cbiAgICBzZXRWZXJ0ZXhCdWZmZXIodmVydGV4QnVmZmVyKSB7XG5cbiAgICAgICAgaWYgKHZlcnRleEJ1ZmZlcikge1xuICAgICAgICAgICAgdGhpcy52ZXJ0ZXhCdWZmZXJzLnB1c2godmVydGV4QnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFF1ZXJpZXMgdGhlIGN1cnJlbnRseSBzZXQgcmVuZGVyIHRhcmdldCBvbiB0aGUgZGV2aWNlLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1JlbmRlclRhcmdldH0gVGhlIGN1cnJlbnQgcmVuZGVyIHRhcmdldC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIEdldCB0aGUgY3VycmVudCByZW5kZXIgdGFyZ2V0XG4gICAgICogdmFyIHJlbmRlclRhcmdldCA9IGRldmljZS5nZXRSZW5kZXJUYXJnZXQoKTtcbiAgICAgKi9cbiAgICBnZXRSZW5kZXJUYXJnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlclRhcmdldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHJlbmRlciB0YXJnZXQgYmVmb3JlIGl0IGNhbiBiZSB1c2VkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtSZW5kZXJUYXJnZXR9IHRhcmdldCAtIFRoZSByZW5kZXIgdGFyZ2V0IHRvIGJlIGluaXRpYWxpemVkLlxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBpbml0UmVuZGVyVGFyZ2V0KHRhcmdldCkge1xuXG4gICAgICAgIGlmICh0YXJnZXQuaW5pdGlhbGl6ZWQpIHJldHVybjtcblxuICAgICAgICAvLyAjaWYgX1BST0ZJTEVSXG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IG5vdygpO1xuICAgICAgICB0aGlzLmZpcmUoJ2ZibzpjcmVhdGUnLCB7XG4gICAgICAgICAgICB0aW1lc3RhbXA6IHN0YXJ0VGltZSxcbiAgICAgICAgICAgIHRhcmdldDogdGhpc1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gI2VuZGlmXG5cbiAgICAgICAgdGFyZ2V0LmluaXQoKTtcbiAgICAgICAgdGhpcy50YXJnZXRzLnB1c2godGFyZ2V0KTtcblxuICAgICAgICAvLyAjaWYgX1BST0ZJTEVSXG4gICAgICAgIHRoaXMuX3JlbmRlclRhcmdldENyZWF0aW9uVGltZSArPSBub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgLy8gI2VuZGlmXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVwb3J0cyB3aGV0aGVyIGEgdGV4dHVyZSBzb3VyY2UgaXMgYSBjYW52YXMsIGltYWdlLCB2aWRlbyBvciBJbWFnZUJpdG1hcC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Kn0gdGV4dHVyZSAtIFRleHR1cmUgc291cmNlIGRhdGEuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHRleHR1cmUgaXMgYSBjYW52YXMsIGltYWdlLCB2aWRlbyBvciBJbWFnZUJpdG1hcCBhbmQgZmFsc2VcbiAgICAgKiBvdGhlcndpc2UuXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIF9pc0Jyb3dzZXJJbnRlcmZhY2UodGV4dHVyZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNJbWFnZUJyb3dzZXJJbnRlcmZhY2UodGV4dHVyZSkgfHxcbiAgICAgICAgICAgICAgICAodHlwZW9mIEhUTUxDYW52YXNFbGVtZW50ICE9PSAndW5kZWZpbmVkJyAmJiB0ZXh0dXJlIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQpIHx8XG4gICAgICAgICAgICAgICAgKHR5cGVvZiBIVE1MVmlkZW9FbGVtZW50ICE9PSAndW5kZWZpbmVkJyAmJiB0ZXh0dXJlIGluc3RhbmNlb2YgSFRNTFZpZGVvRWxlbWVudCk7XG4gICAgfVxuXG4gICAgX2lzSW1hZ2VCcm93c2VySW50ZXJmYWNlKHRleHR1cmUpIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgSW1hZ2VCaXRtYXAgIT09ICd1bmRlZmluZWQnICYmIHRleHR1cmUgaW5zdGFuY2VvZiBJbWFnZUJpdG1hcCkgfHxcbiAgICAgICAgICAgICAgICh0eXBlb2YgSFRNTEltYWdlRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdGV4dHVyZSBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIGNhbnZhcywgdGhlbiBmaXJlcyB0aGUgYHJlc2l6ZWNhbnZhc2AgZXZlbnQuIE5vdGUgdGhhdCB0aGVcbiAgICAgKiBzcGVjaWZpZWQgd2lkdGggYW5kIGhlaWdodCB2YWx1ZXMgd2lsbCBiZSBtdWx0aXBsaWVkIGJ5IHRoZSB2YWx1ZSBvZlxuICAgICAqIHtAbGluayBHcmFwaGljc0RldmljZSNtYXhQaXhlbFJhdGlvfSB0byBnaXZlIHRoZSBmaW5hbCByZXN1bHRhbnQgd2lkdGggYW5kIGhlaWdodCBmb3IgdGhlXG4gICAgICogY2FudmFzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gVGhlIG5ldyB3aWR0aCBvZiB0aGUgY2FudmFzLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBUaGUgbmV3IGhlaWdodCBvZiB0aGUgY2FudmFzLlxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICByZXNpemVDYW52YXMod2lkdGgsIGhlaWdodCkge1xuICAgICAgICB0aGlzLl93aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLl9oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgY29uc3QgcmF0aW8gPSBNYXRoLm1pbih0aGlzLl9tYXhQaXhlbFJhdGlvLCBwbGF0Zm9ybS5icm93c2VyID8gd2luZG93LmRldmljZVBpeGVsUmF0aW8gOiAxKTtcbiAgICAgICAgd2lkdGggPSBNYXRoLmZsb29yKHdpZHRoICogcmF0aW8pO1xuICAgICAgICBoZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAqIHJhdGlvKTtcblxuICAgICAgICBpZiAodGhpcy5jYW52YXMud2lkdGggIT09IHdpZHRoIHx8IHRoaXMuY2FudmFzLmhlaWdodCAhPT0gaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5maXJlKEVWRU5UX1JFU0laRSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBjYW52YXMsIHRoZW4gZmlyZXMgdGhlIGByZXNpemVjYW52YXNgIGV2ZW50LiBOb3RlIHRoYXQgdGhlXG4gICAgICogdmFsdWUgb2Yge0BsaW5rIEdyYXBoaWNzRGV2aWNlI21heFBpeGVsUmF0aW99IGlzIGlnbm9yZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBUaGUgbmV3IHdpZHRoIG9mIHRoZSBjYW52YXMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIFRoZSBuZXcgaGVpZ2h0IG9mIHRoZSBjYW52YXMuXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIHNldFJlc29sdXRpb24od2lkdGgsIGhlaWdodCkge1xuICAgICAgICB0aGlzLl93aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLl9oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5maXJlKEVWRU5UX1JFU0laRSwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2xpZW50UmVjdCgpIHtcbiAgICAgICAgdGhpcy5jbGllbnRSZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2lkdGggb2YgdGhlIGJhY2sgYnVmZmVyIGluIHBpeGVscy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0IHdpZHRoKCkge1xuICAgICAgICBEZWJ1Zy5lcnJvcihcIkdyYXBoaWNzRGV2aWNlLndpZHRoIGlzIG5vdCBpbXBsZW1lbnRlZCBvbiBjdXJyZW50IGRldmljZS5cIik7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcy53aWR0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWlnaHQgb2YgdGhlIGJhY2sgYnVmZmVyIGluIHBpeGVscy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgRGVidWcuZXJyb3IoXCJHcmFwaGljc0RldmljZS5oZWlnaHQgaXMgbm90IGltcGxlbWVudGVkIG9uIGN1cnJlbnQgZGV2aWNlLlwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzLmhlaWdodDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdWxsc2NyZWVuIG1vZGUuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBzZXQgZnVsbHNjcmVlbihmdWxsc2NyZWVuKSB7XG4gICAgICAgIERlYnVnLmVycm9yKFwiR3JhcGhpY3NEZXZpY2UuZnVsbHNjcmVlbiBpcyBub3QgaW1wbGVtZW50ZWQgb24gY3VycmVudCBkZXZpY2UuXCIpO1xuICAgIH1cblxuICAgIGdldCBmdWxsc2NyZWVuKCkge1xuICAgICAgICBEZWJ1Zy5lcnJvcihcIkdyYXBoaWNzRGV2aWNlLmZ1bGxzY3JlZW4gaXMgbm90IGltcGxlbWVudGVkIG9uIGN1cnJlbnQgZGV2aWNlLlwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1heGltdW0gcGl4ZWwgcmF0aW8uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHNldCBtYXhQaXhlbFJhdGlvKHJhdGlvKSB7XG4gICAgICAgIHRoaXMuX21heFBpeGVsUmF0aW8gPSByYXRpbztcbiAgICAgICAgdGhpcy5yZXNpemVDYW52YXModGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XG4gICAgfVxuXG4gICAgZ2V0IG1heFBpeGVsUmF0aW8oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXhQaXhlbFJhdGlvO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFF1ZXJpZXMgdGhlIG1heGltdW0gbnVtYmVyIG9mIGJvbmVzIHRoYXQgY2FuIGJlIHJlZmVyZW5jZWQgYnkgYSBzaGFkZXIuIFRoZSBzaGFkZXJcbiAgICAgKiBnZW5lcmF0b3JzIChwcm9ncmFtbGliKSB1c2UgdGhpcyBudW1iZXIgdG8gc3BlY2lmeSB0aGUgbWF0cml4IGFycmF5IHNpemUgb2YgdGhlIHVuaWZvcm1cbiAgICAgKiAnbWF0cml4X3Bvc2VbMF0nLiBUaGUgdmFsdWUgaXMgY2FsY3VsYXRlZCBiYXNlZCBvbiB0aGUgbnVtYmVyIG9mIGF2YWlsYWJsZSB1bmlmb3JtIHZlY3RvcnNcbiAgICAgKiBhdmFpbGFibGUgYWZ0ZXIgc3VidHJhY3RpbmcgdGhlIG51bWJlciB0YWtlbiBieSBhIHR5cGljYWwgaGVhdnl3ZWlnaHQgc2hhZGVyLiBJZiBhIGRpZmZlcmVudFxuICAgICAqIG51bWJlciBpcyByZXF1aXJlZCwgaXQgY2FuIGJlIHR1bmVkIHZpYSB7QGxpbmsgR3JhcGhpY3NEZXZpY2Ujc2V0Qm9uZUxpbWl0fS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBtYXhpbXVtIG51bWJlciBvZiBib25lcyB0aGF0IGNhbiBiZSBzdXBwb3J0ZWQgYnkgdGhlIGhvc3QgaGFyZHdhcmUuXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIGdldEJvbmVMaW1pdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9uZUxpbWl0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNwZWNpZmllcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgYm9uZXMgdGhhdCB0aGUgZGV2aWNlIGNhbiBzdXBwb3J0IG9uIHRoZSBjdXJyZW50IGhhcmR3YXJlLlxuICAgICAqIFRoaXMgZnVuY3Rpb24gYWxsb3dzIHRoZSBkZWZhdWx0IGNhbGN1bGF0ZWQgdmFsdWUgYmFzZWQgb24gYXZhaWxhYmxlIHZlY3RvciB1bmlmb3JtcyB0byBiZVxuICAgICAqIG92ZXJyaWRkZW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4Qm9uZXMgLSBUaGUgbWF4aW11bSBudW1iZXIgb2YgYm9uZXMgc3VwcG9ydGVkIGJ5IHRoZSBob3N0IGhhcmR3YXJlLlxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBzZXRCb25lTGltaXQobWF4Qm9uZXMpIHtcbiAgICAgICAgdGhpcy5ib25lTGltaXQgPSBtYXhCb25lcztcbiAgICB9XG59XG5cbmV4cG9ydCB7IEdyYXBoaWNzRGV2aWNlIH07XG4iXSwibmFtZXMiOlsiRVZFTlRfUkVTSVpFIiwiR3JhcGhpY3NEZXZpY2UiLCJFdmVudEhhbmRsZXIiLCJjb25zdHJ1Y3RvciIsImNhbnZhcyIsImRldmljZVR5cGUiLCJzY29wZSIsImJvbmVMaW1pdCIsIm1heEFuaXNvdHJvcHkiLCJtYXhDdWJlTWFwU2l6ZSIsIm1heFRleHR1cmVTaXplIiwibWF4Vm9sdW1lU2l6ZSIsInByZWNpc2lvbiIsInJlbmRlclRhcmdldCIsImluc2lkZVJlbmRlclBhc3MiLCJzdXBwb3J0c0luc3RhbmNpbmciLCJzdXBwb3J0c1VuaWZvcm1CdWZmZXJzIiwidGV4dHVyZUZsb2F0UmVuZGVyYWJsZSIsInRleHR1cmVIYWxmRmxvYXRSZW5kZXJhYmxlIiwiX3dpZHRoIiwiX2hlaWdodCIsIl9tYXhQaXhlbFJhdGlvIiwic2hhZGVycyIsImJ1ZmZlcnMiLCJ0ZXh0dXJlcyIsInRhcmdldHMiLCJfdnJhbSIsInRleFNoYWRvdyIsInRleEFzc2V0IiwidGV4TGlnaHRtYXAiLCJ0ZXgiLCJ2YiIsImliIiwidWIiLCJfc2hhZGVyU3RhdHMiLCJ2c0NvbXBpbGVkIiwiZnNDb21waWxlZCIsImxpbmtlZCIsIm1hdGVyaWFsU2hhZGVycyIsImNvbXBpbGVUaW1lIiwiaW5pdGlhbGl6ZUNvbnRleHRDYWNoZXMiLCJfZHJhd0NhbGxzUGVyRnJhbWUiLCJfc2hhZGVyU3dpdGNoZXNQZXJGcmFtZSIsIl9wcmltc1BlckZyYW1lIiwiaSIsIlBSSU1JVElWRV9QT0lOVFMiLCJQUklNSVRJVkVfVFJJRkFOIiwiX3JlbmRlclRhcmdldENyZWF0aW9uVGltZSIsIlNjb3BlU3BhY2UiLCJ0ZXh0dXJlQmlhcyIsInJlc29sdmUiLCJzZXRWYWx1ZSIsImRlc3Ryb3kiLCJmaXJlIiwib25EZXN0cm95U2hhZGVyIiwic2hhZGVyIiwiaWR4IiwiaW5kZXhPZiIsInNwbGljZSIsInBvc3REZXN0cm95IiwidG9KU09OIiwia2V5IiwidW5kZWZpbmVkIiwiaW5kZXhCdWZmZXIiLCJ2ZXJ0ZXhCdWZmZXJzIiwic2V0UmVuZGVyVGFyZ2V0Iiwic2V0SW5kZXhCdWZmZXIiLCJzZXRWZXJ0ZXhCdWZmZXIiLCJ2ZXJ0ZXhCdWZmZXIiLCJwdXNoIiwiZ2V0UmVuZGVyVGFyZ2V0IiwiaW5pdFJlbmRlclRhcmdldCIsInRhcmdldCIsImluaXRpYWxpemVkIiwic3RhcnRUaW1lIiwibm93IiwidGltZXN0YW1wIiwiaW5pdCIsIl9pc0Jyb3dzZXJJbnRlcmZhY2UiLCJ0ZXh0dXJlIiwiX2lzSW1hZ2VCcm93c2VySW50ZXJmYWNlIiwiSFRNTENhbnZhc0VsZW1lbnQiLCJIVE1MVmlkZW9FbGVtZW50IiwiSW1hZ2VCaXRtYXAiLCJIVE1MSW1hZ2VFbGVtZW50IiwicmVzaXplQ2FudmFzIiwid2lkdGgiLCJoZWlnaHQiLCJyYXRpbyIsIk1hdGgiLCJtaW4iLCJwbGF0Zm9ybSIsImJyb3dzZXIiLCJ3aW5kb3ciLCJkZXZpY2VQaXhlbFJhdGlvIiwiZmxvb3IiLCJzZXRSZXNvbHV0aW9uIiwidXBkYXRlQ2xpZW50UmVjdCIsImNsaWVudFJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJEZWJ1ZyIsImVycm9yIiwiZnVsbHNjcmVlbiIsIm1heFBpeGVsUmF0aW8iLCJnZXRCb25lTGltaXQiLCJzZXRCb25lTGltaXQiLCJtYXhCb25lcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBV0EsTUFBTUEsWUFBWSxHQUFHLGNBQWMsQ0FBQTs7QUFnQm5DLE1BQU1DLGNBQWMsU0FBU0MsWUFBWSxDQUFDOztFQTBHdENDLFdBQVcsQ0FBQ0MsTUFBTSxFQUFFO0FBQ2hCLElBQUEsS0FBSyxFQUFFLENBQUE7QUFBQyxJQUFBLElBQUEsQ0FyR1pBLE1BQU0sR0FBQSxLQUFBLENBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQSxDQVFOQyxVQUFVLEdBQUEsS0FBQSxDQUFBLENBQUE7QUFBQSxJQUFBLElBQUEsQ0FPVkMsS0FBSyxHQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFBLENBT0xDLFNBQVMsR0FBQSxLQUFBLENBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQSxDQU9UQyxhQUFhLEdBQUEsS0FBQSxDQUFBLENBQUE7QUFBQSxJQUFBLElBQUEsQ0FPYkMsY0FBYyxHQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFBLENBT2RDLGNBQWMsR0FBQSxLQUFBLENBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQSxDQU9k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
