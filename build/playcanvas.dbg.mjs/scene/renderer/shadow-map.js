/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { PIXELFORMAT_RGBA32F, PIXELFORMAT_RGBA16F, PIXELFORMAT_DEPTH, PIXELFORMAT_R8_G8_B8_A8, FILTER_NEAREST, FILTER_LINEAR, TEXHINT_SHADOWMAP, ADDRESS_CLAMP_TO_EDGE, FUNC_LESS } from '../../platform/graphics/constants.js';
import { RenderTarget } from '../../platform/graphics/render-target.js';
import { Texture } from '../../platform/graphics/texture.js';
import { SHADOW_VSM32, SHADOW_VSM16, SHADOW_PCF5, SHADOW_PCF3, LIGHTTYPE_OMNI } from '../constants.js';

class ShadowMap {
  constructor(texture, targets) {
    this.texture = texture;

    this.cached = false;

    this.renderTargets = targets;
  }
  destroy() {
    if (this.texture) {
      this.texture.destroy();
      this.texture = null;
    }
    const targets = this.renderTargets;
    for (let i = 0; i < targets.length; i++) {
      targets[i].destroy();
    }
    this.renderTargets.length = 0;
  }
  static getShadowFormat(device, shadowType) {
    if (shadowType === SHADOW_VSM32) {
      return PIXELFORMAT_RGBA32F;
    } else if (shadowType === SHADOW_VSM16) {
      return PIXELFORMAT_RGBA16F;
    } else if (shadowType === SHADOW_PCF5) {
      return PIXELFORMAT_DEPTH;
    } else if (shadowType === SHADOW_PCF3 && device.webgl2) {
      return PIXELFORMAT_DEPTH;
    }
    return PIXELFORMAT_R8_G8_B8_A8;
  }
  static getShadowFiltering(device, shadowType) {
    if (shadowType === SHADOW_PCF3 && !device.webgl2) {
      return FILTER_NEAREST;
    } else if (shadowType === SHADOW_VSM32) {
      return device.extTextureFloatLinear ? FILTER_LINEAR : FILTER_NEAREST;
    } else if (shadowType === SHADOW_VSM16) {
      return device.extTextureHalfFloatLinear ? FILTER_LINEAR : FILTER_NEAREST;
    }
    return FILTER_LINEAR;
  }
  static create(device, light) {
    let shadowMap = null;
    if (light._type === LIGHTTYPE_OMNI) {
      shadowMap = this.createCubemap(device, light._shadowResolution);
    } else {
      shadowMap = this.create2dMap(device, light._shadowResolution, light._shadowType);
    }
    return shadowMap;
  }

  static createAtlas(device, resolution, shadowType) {
    const shadowMap = this.create2dMap(device, resolution, shadowType);

    const targets = shadowMap.renderTargets;
    const rt = targets[0];
    for (let i = 0; i < 5; i++) {
      targets.push(rt);
    }
    return shadowMap;
  }
  static create2dMap(device, size, shadowType) {
    const format = this.getShadowFormat(device, shadowType);
    const filter = this.getShadowFiltering(device, shadowType);
    const texture = new Texture(device, {
      profilerHint: TEXHINT_SHADOWMAP,
      format: format,
      width: size,
      height: size,
      mipmaps: false,
      minFilter: filter,
      magFilter: filter,
      addressU: ADDRESS_CLAMP_TO_EDGE,
      addressV: ADDRESS_CLAMP_TO_EDGE,
      name: 'ShadowMap2D'
    });
    let target = null;
    if (shadowType === SHADOW_PCF5 || shadowType === SHADOW_PCF3 && device.webgl2) {
      texture.compareOnRead = true;
      texture.compareFunc = FUNC_LESS;

      target = new RenderTarget({
        depthBuffer: texture
      });
    } else {
      target = new RenderTarget({
        colorBuffer: texture,
        depth: true
      });
    }
    return new ShadowMap(texture, [target]);
  }
  static createCubemap(device, size) {
    const cubemap = new Texture(device, {
      profilerHint: TEXHINT_SHADOWMAP,
      format: PIXELFORMAT_R8_G8_B8_A8,
      width: size,
      height: size,
      cubemap: true,
      mipmaps: false,
      minFilter: FILTER_NEAREST,
      magFilter: FILTER_NEAREST,
      addressU: ADDRESS_CLAMP_TO_EDGE,
      addressV: ADDRESS_CLAMP_TO_EDGE,
      name: 'ShadowMapCube'
    });
    const targets = [];
    for (let i = 0; i < 6; i++) {
      const target = new RenderTarget({
        colorBuffer: cubemap,
        face: i,
        depth: true
      });
      targets.push(target);
    }
    return new ShadowMap(cubemap, targets);
  }
}

export { ShadowMap };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93LW1hcC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjZW5lL3JlbmRlcmVyL3NoYWRvdy1tYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBRERSRVNTX0NMQU1QX1RPX0VER0UsXG4gICAgRklMVEVSX0xJTkVBUiwgRklMVEVSX05FQVJFU1QsXG4gICAgRlVOQ19MRVNTLFxuICAgIFBJWEVMRk9STUFUX0RFUFRILCBQSVhFTEZPUk1BVF9SOF9HOF9COF9BOCwgUElYRUxGT1JNQVRfUkdCQTE2RiwgUElYRUxGT1JNQVRfUkdCQTMyRixcbiAgICBURVhISU5UX1NIQURPV01BUFxufSBmcm9tICcuLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgUmVuZGVyVGFyZ2V0IH0gZnJvbSAnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3MvcmVuZGVyLXRhcmdldC5qcyc7XG5pbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3MvdGV4dHVyZS5qcyc7XG5cbmltcG9ydCB7XG4gICAgTElHSFRUWVBFX09NTkksXG4gICAgU0hBRE9XX1BDRjMsIFNIQURPV19QQ0Y1LCBTSEFET1dfVlNNMTYsIFNIQURPV19WU00zMlxufSBmcm9tICcuLi9jb25zdGFudHMuanMnO1xuXG5cbmNsYXNzIFNoYWRvd01hcCB7XG4gICAgY29uc3RydWN0b3IodGV4dHVyZSwgdGFyZ2V0cykge1xuXG4gICAgICAgIC8vIHRoZSBhY3R1YWwgdGV4dHVyZSBidWZmZXIgdGhhdCBpcyBzaGFyZWQgYnkgc2hhZG93IG1hcCByZW5kZXIgdGFyZ2V0c1xuICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuXG4gICAgICAgIC8vIHNldCB0byB0cnVlIGlmIHRoZSBzaGFkb3cgbWFwIGlzIG93bmVkIGJ5IHRoZSBzaGFkb3cgbWFwIGNhY2hlXG4gICAgICAgIHRoaXMuY2FjaGVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gYW4gYXJyYXkgb2YgcmVuZGVyIHRhcmdldHM6XG4gICAgICAgIC8vIDEgZm9yIGRpcmVjdGlvbmFsIGFuZCBzcG90IGxpZ2h0XG4gICAgICAgIC8vIDYgZm9yIG9tbmkgbGlnaHRcbiAgICAgICAgdGhpcy5yZW5kZXJUYXJnZXRzID0gdGFyZ2V0cztcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuXG4gICAgICAgIC8vIHNpbmdsZSB0ZXh0dXJlIGlzIHNoYXJlZCBieSBhbGwgcmVuZGVyIHRhcmdldHMsIGRlc3Ryb3kgaXQgb25jZVxuICAgICAgICBpZiAodGhpcy50ZXh0dXJlKSB7XG4gICAgICAgICAgICB0aGlzLnRleHR1cmUuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy50ZXh0dXJlID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSB0aGlzLnJlbmRlclRhcmdldHM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGFyZ2V0c1tpXS5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW5kZXJUYXJnZXRzLmxlbmd0aCA9IDA7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFNoYWRvd0Zvcm1hdChkZXZpY2UsIHNoYWRvd1R5cGUpIHtcbiAgICAgICAgaWYgKHNoYWRvd1R5cGUgPT09IFNIQURPV19WU00zMikge1xuICAgICAgICAgICAgcmV0dXJuIFBJWEVMRk9STUFUX1JHQkEzMkY7XG4gICAgICAgIH0gZWxzZSBpZiAoc2hhZG93VHlwZSA9PT0gU0hBRE9XX1ZTTTE2KSB7XG4gICAgICAgICAgICByZXR1cm4gUElYRUxGT1JNQVRfUkdCQTE2RjtcbiAgICAgICAgfSBlbHNlIGlmIChzaGFkb3dUeXBlID09PSBTSEFET1dfUENGNSkge1xuICAgICAgICAgICAgcmV0dXJuIFBJWEVMRk9STUFUX0RFUFRIO1xuICAgICAgICB9IGVsc2UgaWYgKHNoYWRvd1R5cGUgPT09IFNIQURPV19QQ0YzICYmIGRldmljZS53ZWJnbDIpIHtcbiAgICAgICAgICAgIHJldHVybiBQSVhFTEZPUk1BVF9ERVBUSDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUElYRUxGT1JNQVRfUjhfRzhfQjhfQTg7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFNoYWRvd0ZpbHRlcmluZyhkZXZpY2UsIHNoYWRvd1R5cGUpIHtcbiAgICAgICAgaWYgKHNoYWRvd1R5cGUgPT09IFNIQURPV19QQ0YzICYmICFkZXZpY2Uud2ViZ2wyKSB7XG4gICAgICAgICAgICByZXR1cm4gRklMVEVSX05FQVJFU1Q7XG4gICAgICAgIH0gZWxzZSBpZiAoc2hhZG93VHlwZSA9PT0gU0hBRE9XX1ZTTTMyKSB7XG4gICAgICAgICAgICByZXR1cm4gZGV2aWNlLmV4dFRleHR1cmVGbG9hdExpbmVhciA/IEZJTFRFUl9MSU5FQVIgOiBGSUxURVJfTkVBUkVTVDtcbiAgICAgICAgfSBlbHNlIGlmIChzaGFkb3dUeXBlID09PSBTSEFET1dfVlNNMTYpIHtcbiAgICAgICAgICAgIHJldHVybiBkZXZpY2UuZXh0VGV4dHVyZUhhbGZGbG9hdExpbmVhciA/IEZJTFRFUl9MSU5FQVIgOiBGSUxURVJfTkVBUkVTVDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gRklMVEVSX0xJTkVBUjtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlKGRldmljZSwgbGlnaHQpIHtcblxuICAgICAgICBsZXQgc2hhZG93TWFwID0gbnVsbDtcbiAgICAgICAgaWYgKGxpZ2h0Ll90eXBlID09PSBMSUdIVFRZUEVfT01OSSkge1xuICAgICAgICAgICAgc2hhZG93TWFwID0gdGhpcy5jcmVhdGVDdWJlbWFwKGRldmljZSwgbGlnaHQuX3NoYWRvd1Jlc29sdXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2hhZG93TWFwID0gdGhpcy5jcmVhdGUyZE1hcChkZXZpY2UsIGxpZ2h0Ll9zaGFkb3dSZXNvbHV0aW9uLCBsaWdodC5fc2hhZG93VHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2hhZG93TWFwO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZXMgYSBzaGFkb3cgbWFwIHdoaWNoIGlzIHVzZWQgYnkgdGhlIGxpZ2h0IHRleHR1cmUgYXRsYXMgZm9yIGNsdXN0ZXJlZCBsaWdodGluZ1xuICAgIHN0YXRpYyBjcmVhdGVBdGxhcyhkZXZpY2UsIHJlc29sdXRpb24sIHNoYWRvd1R5cGUpIHtcbiAgICAgICAgY29uc3Qgc2hhZG93TWFwID0gdGhpcy5jcmVhdGUyZE1hcChkZXZpY2UsIHJlc29sdXRpb24sIHNoYWRvd1R5cGUpO1xuXG4gICAgICAgIC8vIGNvcHkgdGhlIHRhcmdldCA1IG1vcmUgdGltZXMgdG8gYWxsb3cgdW5pZmllZCBhY2Nlc3MgZm9yIHBvaW50IGxpZ2h0IGZhY2VzXG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSBzaGFkb3dNYXAucmVuZGVyVGFyZ2V0cztcbiAgICAgICAgY29uc3QgcnQgPSB0YXJnZXRzWzBdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKHJ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzaGFkb3dNYXA7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZTJkTWFwKGRldmljZSwgc2l6ZSwgc2hhZG93VHlwZSkge1xuXG4gICAgICAgIGNvbnN0IGZvcm1hdCA9IHRoaXMuZ2V0U2hhZG93Rm9ybWF0KGRldmljZSwgc2hhZG93VHlwZSk7XG4gICAgICAgIGNvbnN0IGZpbHRlciA9IHRoaXMuZ2V0U2hhZG93RmlsdGVyaW5nKGRldmljZSwgc2hhZG93VHlwZSk7XG5cbiAgICAgICAgY29uc3QgdGV4dHVyZSA9IG5ldyBUZXh0dXJlKGRldmljZSwge1xuICAgICAgICAgICAgLy8gI2lmIF9QUk9GSUxFUlxuICAgICAgICAgICAgcHJvZmlsZXJIaW50OiBURVhISU5UX1NIQURPV01BUCxcbiAgICAgICAgICAgIC8vICNlbmRpZlxuICAgICAgICAgICAgZm9ybWF0OiBmb3JtYXQsXG4gICAgICAgICAgICB3aWR0aDogc2l6ZSxcbiAgICAgICAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgICAgICAgIG1pcG1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgbWluRmlsdGVyOiBmaWx0ZXIsXG4gICAgICAgICAgICBtYWdGaWx0ZXI6IGZpbHRlcixcbiAgICAgICAgICAgIGFkZHJlc3NVOiBBRERSRVNTX0NMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICBhZGRyZXNzVjogQUREUkVTU19DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgbmFtZTogJ1NoYWRvd01hcDJEJ1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgdGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgaWYgKHNoYWRvd1R5cGUgPT09IFNIQURPV19QQ0Y1IHx8IChzaGFkb3dUeXBlID09PSBTSEFET1dfUENGMyAmJiBkZXZpY2Uud2ViZ2wyKSkge1xuXG4gICAgICAgICAgICAvLyBlbmFibGUgaGFyZHdhcmUgUENGIHdoZW4gc2FtcGxpbmcgdGhlIGRlcHRoIHRleHR1cmVcbiAgICAgICAgICAgIHRleHR1cmUuY29tcGFyZU9uUmVhZCA9IHRydWU7XG4gICAgICAgICAgICB0ZXh0dXJlLmNvbXBhcmVGdW5jID0gRlVOQ19MRVNTO1xuXG4gICAgICAgICAgICAvLyBkZXB0aGJ1ZmZlciBvbmx5XG4gICAgICAgICAgICB0YXJnZXQgPSBuZXcgUmVuZGVyVGFyZ2V0KHtcbiAgICAgICAgICAgICAgICBkZXB0aEJ1ZmZlcjogdGV4dHVyZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBlbmNvZGVkIHJnYmEgZGVwdGhcbiAgICAgICAgICAgIHRhcmdldCA9IG5ldyBSZW5kZXJUYXJnZXQoe1xuICAgICAgICAgICAgICAgIGNvbG9yQnVmZmVyOiB0ZXh0dXJlLFxuICAgICAgICAgICAgICAgIGRlcHRoOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgU2hhZG93TWFwKHRleHR1cmUsIFt0YXJnZXRdKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlQ3ViZW1hcChkZXZpY2UsIHNpemUpIHtcbiAgICAgICAgY29uc3QgY3ViZW1hcCA9IG5ldyBUZXh0dXJlKGRldmljZSwge1xuICAgICAgICAgICAgLy8gI2lmIF9QUk9GSUxFUlxuICAgICAgICAgICAgcHJvZmlsZXJIaW50OiBURVhISU5UX1NIQURPV01BUCxcbiAgICAgICAgICAgIC8vICNlbmRpZlxuICAgICAgICAgICAgZm9ybWF0OiBQSVhFTEZPUk1BVF9SOF9HOF9COF9BOCxcbiAgICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICAgICAgaGVpZ2h0OiBzaXplLFxuICAgICAgICAgICAgY3ViZW1hcDogdHJ1ZSxcbiAgICAgICAgICAgIG1pcG1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgbWluRmlsdGVyOiBGSUxURVJfTkVBUkVTVCxcbiAgICAgICAgICAgIG1hZ0ZpbHRlcjogRklMVEVSX05FQVJFU1QsXG4gICAgICAgICAgICBhZGRyZXNzVTogQUREUkVTU19DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgYWRkcmVzc1Y6IEFERFJFU1NfQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIG5hbWU6ICdTaGFkb3dNYXBDdWJlJ1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB0YXJnZXRzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBuZXcgUmVuZGVyVGFyZ2V0KHtcbiAgICAgICAgICAgICAgICBjb2xvckJ1ZmZlcjogY3ViZW1hcCxcbiAgICAgICAgICAgICAgICBmYWNlOiBpLFxuICAgICAgICAgICAgICAgIGRlcHRoOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRhcmdldHMucHVzaCh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgU2hhZG93TWFwKGN1YmVtYXAsIHRhcmdldHMpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgU2hhZG93TWFwIH07XG4iXSwibmFtZXMiOlsiU2hhZG93TWFwIiwiY29uc3RydWN0b3IiLCJ0ZXh0dXJlIiwidGFyZ2V0cyIsImNhY2hlZCIsInJlbmRlclRhcmdldHMiLCJkZXN0cm95IiwiaSIsImxlbmd0aCIsImdldFNoYWRvd0Zvcm1hdCIsImRldmljZSIsInNoYWRvd1R5cGUiLCJTSEFET1dfVlNNMzIiLCJQSVhFTEZPUk1BVF9SR0JBMzJGIiwiU0hBRE9XX1ZTTTE2IiwiUElYRUxGT1JNQVRfUkdCQTE2RiIsIlNIQURPV19QQ0Y1IiwiUElYRUxGT1JNQVRfREVQVEgiLCJTSEFET1dfUENGMyIsIndlYmdsMiIsIlBJWEVMRk9STUFUX1I4X0c4X0I4X0E4IiwiZ2V0U2hhZG93RmlsdGVyaW5nIiwiRklMVEVSX05FQVJFU1QiLCJleHRUZXh0dXJlRmxvYXRMaW5lYXIiLCJGSUxURVJfTElORUFSIiwiZXh0VGV4dHVyZUhhbGZGbG9hdExpbmVhciIsImNyZWF0ZSIsImxpZ2h0Iiwic2hhZG93TWFwIiwiX3R5cGUiLCJMSUdIVFRZUEVfT01OSSIsImNyZWF0ZUN1YmVtYXAiLCJfc2hhZG93UmVzb2x1dGlvbiIsImNyZWF0ZTJkTWFwIiwiX3NoYWRvd1R5cGUiLCJjcmVhdGVBdGxhcyIsInJlc29sdXRpb24iLCJydCIsInB1c2giLCJzaXplIiwiZm9ybWF0IiwiZmlsdGVyIiwiVGV4dHVyZSIsInByb2ZpbGVySGludCIsIlRFWEhJTlRfU0hBRE9XTUFQIiwid2lkdGgiLCJoZWlnaHQiLCJtaXBtYXBzIiwibWluRmlsdGVyIiwibWFnRmlsdGVyIiwiYWRkcmVzc1UiLCJBRERSRVNTX0NMQU1QX1RPX0VER0UiLCJhZGRyZXNzViIsIm5hbWUiLCJ0YXJnZXQiLCJjb21wYXJlT25SZWFkIiwiY29tcGFyZUZ1bmMiLCJGVU5DX0xFU1MiLCJSZW5kZXJUYXJnZXQiLCJkZXB0aEJ1ZmZlciIsImNvbG9yQnVmZmVyIiwiZGVwdGgiLCJjdWJlbWFwIiwiZmFjZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQWdCQSxNQUFNQSxTQUFTLENBQUM7QUFDWkMsRUFBQUEsV0FBVyxDQUFDQyxPQUFPLEVBQUVDLE9BQU8sRUFBRTtJQUcxQixJQUFJLENBQUNELE9BQU8sR0FBR0EsT0FBTyxDQUFBOztJQUd0QixJQUFJLENBQUNFLE1BQU0sR0FBRyxLQUFLLENBQUE7O0lBS25CLElBQUksQ0FBQ0MsYUFBYSxHQUFHRixPQUFPLENBQUE7QUFDaEMsR0FBQTtBQUVBRyxFQUFBQSxPQUFPLEdBQUc7SUFHTixJQUFJLElBQUksQ0FBQ0osT0FBTyxFQUFFO0FBQ2QsTUFBQSxJQUFJLENBQUNBLE9BQU8sQ0FBQ0ksT0FBTyxFQUFFLENBQUE7TUFDdEIsSUFBSSxDQUFDSixPQUFPLEdBQUcsSUFBSSxDQUFBO0FBQ3ZCLEtBQUE7QUFFQSxJQUFBLE1BQU1DLE9BQU8sR0FBRyxJQUFJLENBQUNFLGFBQWEsQ0FBQTtBQUNsQyxJQUFBLEtBQUssSUFBSUUsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSixPQUFPLENBQUNLLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUU7QUFDckNKLE1BQUFBLE9BQU8sQ0FBQ0ksQ0FBQyxDQUFDLENBQUNELE9BQU8sRUFBRSxDQUFBO0FBQ3hCLEtBQUE7QUFDQSxJQUFBLElBQUksQ0FBQ0QsYUFBYSxDQUFDRyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0FBQ2pDLEdBQUE7QUFFQSxFQUFBLE9BQU9DLGVBQWUsQ0FBQ0MsTUFBTSxFQUFFQyxVQUFVLEVBQUU7SUFDdkMsSUFBSUEsVUFBVSxLQUFLQyxZQUFZLEVBQUU7QUFDN0IsTUFBQSxPQUFPQyxtQkFBbUIsQ0FBQTtBQUM5QixLQUFDLE1BQU0sSUFBSUYsVUFBVSxLQUFLRyxZQUFZLEVBQUU7QUFDcEMsTUFBQSxPQUFPQyxtQkFBbUIs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
