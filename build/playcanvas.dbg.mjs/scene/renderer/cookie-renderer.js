/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Vec4 } from '../../core/math/vec4.js';
import { Mat4 } from '../../core/math/mat4.js';
import { PIXELFORMAT_RGBA8, FILTER_NEAREST, ADDRESS_CLAMP_TO_EDGE } from '../../platform/graphics/constants.js';
import { DebugGraphics } from '../../platform/graphics/debug-graphics.js';
import { drawQuadWithShader } from '../../platform/graphics/simple-post-effect.js';
import { Texture } from '../../platform/graphics/texture.js';
import { LIGHTTYPE_OMNI } from '../constants.js';
import { createShaderFromCode } from '../shader-lib/utils.js';
import { LightCamera } from './light-camera.js';

const textureBlitVertexShader = `
    attribute vec2 vertex_position;
    varying vec2 uv0;
    void main(void) {
        gl_Position = vec4(vertex_position, 0.5, 1.0);
        uv0 = vertex_position.xy * 0.5 + 0.5;
    }`;
const textureBlitFragmentShader = `
    varying vec2 uv0;
    uniform sampler2D blitTexture;
    void main(void) {
        gl_FragColor = texture2D(blitTexture, uv0);
    }`;

const textureCubeBlitFragmentShader = `
    varying vec2 uv0;
    uniform samplerCube blitTexture;
    uniform mat4 invViewProj;
    void main(void) {
        vec4 projPos = vec4(uv0 * 2.0 - 1.0, 0.5, 1.0);
        vec4 worldPos = invViewProj * projPos;
        gl_FragColor = textureCube(blitTexture, worldPos.xyz);
    }`;
const _viewport = new Vec4();

class CookieRenderer {
  constructor(device, lightTextureAtlas) {
    this.device = device;
    this.lightTextureAtlas = lightTextureAtlas;
    this.blitShader2d = null;
    this.blitShaderCube = null;
    this.blitTextureId = null;
    this.invViewProjId = null;
  }
  destroy() {}
  getShader(shader, fragment) {
    if (!this[shader]) this[shader] = createShaderFromCode(this.device, textureBlitVertexShader, fragment, `cookie_renderer_${shader}`);
    if (!this.blitTextureId) this.blitTextureId = this.device.scope.resolve('blitTexture');
    if (!this.invViewProjId) this.invViewProjId = this.device.scope.resolve('invViewProj');
    return this[shader];
  }
  get shader2d() {
    return this.getShader('blitShader2d', textureBlitFragmentShader);
  }
  get shaderCube() {
    return this.getShader('blitShaderCube', textureCubeBlitFragmentShader);
  }
  static createTexture(device, resolution) {
    const texture = new Texture(device, {
      name: 'CookieAtlas',
      width: resolution,
      height: resolution,
      format: PIXELFORMAT_RGBA8,
      cubemap: false,
      mipmaps: false,
      minFilter: FILTER_NEAREST,
      magFilter: FILTER_NEAREST,
      addressU: ADDRESS_CLAMP_TO_EDGE,
      addressV: ADDRESS_CLAMP_TO_EDGE
    });
    return texture;
  }

  initInvViewProjMatrices() {
    if (!CookieRenderer._invViewProjMatrices) {
      CookieRenderer._invViewProjMatrices = [];
      for (let face = 0; face < 6; face++) {
        const camera = LightCamera.create(null, LIGHTTYPE_OMNI, face);
        const projMat = camera.projectionMatrix;
        const viewMat = camera.node.getLocalTransform().clone().invert();
        CookieRenderer._invViewProjMatrices[face] = new Mat4().mul2(projMat, viewMat).invert();
      }
    }
  }
  render(light, renderTarget) {
    if (light.enabled && light.cookie && light.visibleThisFrame) {
      DebugGraphics.pushGpuMarker(this.device, `COOKIE ${light._node.name}`);
      const faceCount = light.numShadowFaces;
      const shader = faceCount > 1 ? this.shaderCube : this.shader2d;
      const device = this.device;
      if (faceCount > 1) {
        this.initInvViewProjMatrices();
      }

      this.blitTextureId.setValue(light.cookie);

      for (let face = 0; face < faceCount; face++) {
        _viewport.copy(light.atlasViewport);
        if (faceCount > 1) {
          const smallSize = _viewport.z / 3;
          const offset = this.lightTextureAtlas.cubeSlotsOffsets[face];
          _viewport.x += smallSize * offset.x;
          _viewport.y += smallSize * offset.y;
          _viewport.z = smallSize;
          _viewport.w = smallSize;

          this.invViewProjId.setValue(CookieRenderer._invViewProjMatrices[face].data);
        }
        _viewport.mulScalar(renderTarget.colorBuffer.width);
        drawQuadWithShader(device, renderTarget, shader, _viewport);
      }
      DebugGraphics.popGpuMarker(this.device);
    }
  }
}
CookieRenderer._invViewProjMatrices = null;

export { CookieRenderer };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llLXJlbmRlcmVyLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NlbmUvcmVuZGVyZXIvY29va2llLXJlbmRlcmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZlYzQgfSBmcm9tICcuLi8uLi9jb3JlL21hdGgvdmVjNC5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vLi4vY29yZS9tYXRoL21hdDQuanMnO1xuXG5pbXBvcnQgeyBBRERSRVNTX0NMQU1QX1RPX0VER0UsIEZJTFRFUl9ORUFSRVNULCBQSVhFTEZPUk1BVF9SR0JBOCB9IGZyb20gJy4uLy4uL3BsYXRmb3JtL2dyYXBoaWNzL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBEZWJ1Z0dyYXBoaWNzIH0gZnJvbSAnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3MvZGVidWctZ3JhcGhpY3MuanMnO1xuaW1wb3J0IHsgZHJhd1F1YWRXaXRoU2hhZGVyIH0gZnJvbSAnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3Mvc2ltcGxlLXBvc3QtZWZmZWN0LmpzJztcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy90ZXh0dXJlLmpzJztcblxuaW1wb3J0IHsgTElHSFRUWVBFX09NTkkgfSBmcm9tICcuLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgY3JlYXRlU2hhZGVyRnJvbUNvZGUgfSBmcm9tICcuLi9zaGFkZXItbGliL3V0aWxzLmpzJztcbmltcG9ydCB7IExpZ2h0Q2FtZXJhIH0gZnJvbSAnLi9saWdodC1jYW1lcmEuanMnO1xuXG5jb25zdCB0ZXh0dXJlQmxpdFZlcnRleFNoYWRlciA9IGBcbiAgICBhdHRyaWJ1dGUgdmVjMiB2ZXJ0ZXhfcG9zaXRpb247XG4gICAgdmFyeWluZyB2ZWMyIHV2MDtcbiAgICB2b2lkIG1haW4odm9pZCkge1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQodmVydGV4X3Bvc2l0aW9uLCAwLjUsIDEuMCk7XG4gICAgICAgIHV2MCA9IHZlcnRleF9wb3NpdGlvbi54eSAqIDAuNSArIDAuNTtcbiAgICB9YDtcblxuY29uc3QgdGV4dHVyZUJsaXRGcmFnbWVudFNoYWRlciA9IGBcbiAgICB2YXJ5aW5nIHZlYzIgdXYwO1xuICAgIHVuaWZvcm0gc2FtcGxlcjJEIGJsaXRUZXh0dXJlO1xuICAgIHZvaWQgbWFpbih2b2lkKSB7XG4gICAgICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRChibGl0VGV4dHVyZSwgdXYwKTtcbiAgICB9YDtcblxuLy8gc2hhZGVyIHJ1bnMgZm9yIGVhY2ggZmFjZSwgd2l0aCBpblZpZXdQcm9qIG1hdHJpeCByZXByZXNlbnRpbmcgYSBmYWNlIGNhbWVyYVxuY29uc3QgdGV4dHVyZUN1YmVCbGl0RnJhZ21lbnRTaGFkZXIgPSBgXG4gICAgdmFyeWluZyB2ZWMyIHV2MDtcbiAgICB1bmlmb3JtIHNhbXBsZXJDdWJlIGJsaXRUZXh0dXJlO1xuICAgIHVuaWZvcm0gbWF0NCBpbnZWaWV3UHJvajtcbiAgICB2b2lkIG1haW4odm9pZCkge1xuICAgICAgICB2ZWM0IHByb2pQb3MgPSB2ZWM0KHV2MCAqIDIuMCAtIDEuMCwgMC41LCAxLjApO1xuICAgICAgICB2ZWM0IHdvcmxkUG9zID0gaW52Vmlld1Byb2ogKiBwcm9qUG9zO1xuICAgICAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlQ3ViZShibGl0VGV4dHVyZSwgd29ybGRQb3MueHl6KTtcbiAgICB9YDtcblxuY29uc3QgX3ZpZXdwb3J0ID0gbmV3IFZlYzQoKTtcblxuLy8gaGVscGVyIGNsYXNzIHVzZWQgYnkgY2x1c3RlcmVkIGxpZ2h0aW5nIHN5c3RlbSB0byByZW5kZXIgY29va2llcyBpbnRvIHRoZSB0ZXh0dXJlIGF0bGFzLCBzaW1pbGFybHkgdG8gc2hhZG93IHJlbmRlcmVyXG5jbGFzcyBDb29raWVSZW5kZXJlciB7XG4gICAgY29uc3RydWN0b3IoZGV2aWNlLCBsaWdodFRleHR1cmVBdGxhcykge1xuICAgICAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICAgICAgdGhpcy5saWdodFRleHR1cmVBdGxhcyA9IGxpZ2h0VGV4dHVyZUF0bGFzO1xuXG4gICAgICAgIHRoaXMuYmxpdFNoYWRlcjJkID0gbnVsbDtcbiAgICAgICAgdGhpcy5ibGl0U2hhZGVyQ3ViZSA9IG51bGw7XG4gICAgICAgIHRoaXMuYmxpdFRleHR1cmVJZCA9IG51bGw7XG4gICAgICAgIHRoaXMuaW52Vmlld1Byb2pJZCA9IG51bGw7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICB9XG5cbiAgICBnZXRTaGFkZXIoc2hhZGVyLCBmcmFnbWVudCkge1xuXG4gICAgICAgIGlmICghdGhpc1tzaGFkZXJdKVxuICAgICAgICAgICAgdGhpc1tzaGFkZXJdID0gY3JlYXRlU2hhZGVyRnJvbUNvZGUodGhpcy5kZXZpY2UsIHRleHR1cmVCbGl0VmVydGV4U2hhZGVyLCBmcmFnbWVudCwgYGNvb2tpZV9yZW5kZXJlcl8ke3NoYWRlcn1gKTtcblxuICAgICAgICBpZiAoIXRoaXMuYmxpdFRleHR1cmVJZClcbiAgICAgICAgICAgIHRoaXMuYmxpdFRleHR1cmVJZCA9IHRoaXMuZGV2aWNlLnNjb3BlLnJlc29sdmUoJ2JsaXRUZXh0dXJlJyk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmludlZpZXdQcm9qSWQpXG4gICAgICAgICAgICB0aGlzLmludlZpZXdQcm9qSWQgPSB0aGlzLmRldmljZS5zY29wZS5yZXNvbHZlKCdpbnZWaWV3UHJvaicpO1xuXG4gICAgICAgIHJldHVybiB0aGlzW3NoYWRlcl07XG4gICAgfVxuXG4gICAgZ2V0IHNoYWRlcjJkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTaGFkZXIoJ2JsaXRTaGFkZXIyZCcsIHRleHR1cmVCbGl0RnJhZ21lbnRTaGFkZXIpO1xuICAgIH1cblxuICAgIGdldCBzaGFkZXJDdWJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTaGFkZXIoJ2JsaXRTaGFkZXJDdWJlJywgdGV4dHVyZUN1YmVCbGl0RnJhZ21lbnRTaGFkZXIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGVUZXh0dXJlKGRldmljZSwgcmVzb2x1dGlvbikge1xuXG4gICAgICAgIGNvbnN0IHRleHR1cmUgPSBuZXcgVGV4dHVyZShkZXZpY2UsIHtcbiAgICAgICAgICAgIG5hbWU6ICdDb29raWVBdGxhcycsXG4gICAgICAgICAgICB3aWR0aDogcmVzb2x1dGlvbixcbiAgICAgICAgICAgIGhlaWdodDogcmVzb2x1dGlvbixcbiAgICAgICAgICAgIGZvcm1hdDogUElYRUxGT1JNQVRfUkdCQTgsXG4gICAgICAgICAgICBjdWJlbWFwOiBmYWxzZSxcbiAgICAgICAgICAgIG1pcG1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgbWluRmlsdGVyOiBGSUxURVJfTkVBUkVTVCxcbiAgICAgICAgICAgIG1hZ0ZpbHRlcjogRklMVEVSX05FQVJFU1QsXG4gICAgICAgICAgICBhZGRyZXNzVTogQUREUkVTU19DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgYWRkcmVzc1Y6IEFERFJFU1NfQ0xBTVBfVE9fRURHRVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGV4dHVyZTtcbiAgICB9XG5cbiAgICAvLyBmb3IgcmVuZGVyaW5nIG9mIGNvb2tpZXMsIHN0b3JlIGludmVyc2UgdmlldyBwcm9qZWN0aW9uIG1hdHJpY2VzIGZvciA2IGZhY2VzLCBhbGxvd2luZyBjdWJlbWFwIGZhY2VzIHRvIGJlIGNvcGllZCBpbnRvIHRoZSBhdGxhc1xuICAgIHN0YXRpYyBfaW52Vmlld1Byb2pNYXRyaWNlcyA9IG51bGw7XG5cbiAgICBpbml0SW52Vmlld1Byb2pNYXRyaWNlcygpIHtcbiAgICAgICAgaWYgKCFDb29raWVSZW5kZXJlci5faW52Vmlld1Byb2pNYXRyaWNlcykge1xuICAgICAgICAgICAgQ29va2llUmVuZGVyZXIuX2ludlZpZXdQcm9qTWF0cmljZXMgPSBbXTtcblxuICAgICAgICAgICAgZm9yIChsZXQgZmFjZSA9IDA7IGZhY2UgPCA2OyBmYWNlKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYW1lcmEgPSBMaWdodENhbWVyYS5jcmVhdGUobnVsbCwgTElHSFRUWVBFX09NTkksIGZhY2UpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb2pNYXQgPSBjYW1lcmEucHJvamVjdGlvbk1hdHJpeDtcbiAgICAgICAgICAgICAgICBjb25zdCB2aWV3TWF0ID0gY2FtZXJhLm5vZGUuZ2V0TG9jYWxUcmFuc2Zvcm0oKS5jbG9uZSgpLmludmVydCgpO1xuICAgICAgICAgICAgICAgIENvb2tpZVJlbmRlcmVyLl9pbnZWaWV3UHJvak1hdHJpY2VzW2ZhY2VdID0gbmV3IE1hdDQoKS5tdWwyKHByb2pNYXQsIHZpZXdNYXQpLmludmVydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKGxpZ2h0LCByZW5kZXJUYXJnZXQpIHtcblxuICAgICAgICBpZiAobGlnaHQuZW5hYmxlZCAmJiBsaWdodC5jb29raWUgJiYgbGlnaHQudmlzaWJsZVRoaXNGcmFtZSkge1xuXG4gICAgICAgICAgICBEZWJ1Z0dyYXBoaWNzLnB1c2hHcHVNYXJrZXIodGhpcy5kZXZpY2UsIGBDT09LSUUgJHtsaWdodC5fbm9kZS5uYW1lfWApO1xuXG4gICAgICAgICAgICBjb25zdCBmYWNlQ291bnQgPSBsaWdodC5udW1TaGFkb3dGYWNlcztcbiAgICAgICAgICAgIGNvbnN0IHNoYWRlciA9IGZhY2VDb3VudCA+IDEgPyB0aGlzLnNoYWRlckN1YmUgOiB0aGlzLnNoYWRlcjJkO1xuICAgICAgICAgICAgY29uc3QgZGV2aWNlID0gdGhpcy5kZXZpY2U7XG5cbiAgICAgICAgICAgIGlmIChmYWNlQ291bnQgPiAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0SW52Vmlld1Byb2pNYXRyaWNlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzb3VyY2UgdGV4dHVyZVxuICAgICAgICAgICAgdGhpcy5ibGl0VGV4dHVyZUlkLnNldFZhbHVlKGxpZ2h0LmNvb2tpZSk7XG5cbiAgICAgICAgICAgIC8vIHJlbmRlciBpdCB0byBhIHZpZXdwb3J0IG9mIHRoZSB0YXJnZXRcbiAgICAgICAgICAgIGZvciAobGV0IGZhY2UgPSAwOyBmYWNlIDwgZmFjZUNvdW50OyBmYWNlKyspIHtcblxuICAgICAgICAgICAgICAgIF92aWV3cG9ydC5jb3B5KGxpZ2h0LmF0bGFzVmlld3BvcnQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGZhY2VDb3VudCA+IDEpIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgY3ViZW1hcCwgcmVuZGVyIHRvIG9uZSBvZiB0aGUgM3gzIHN1Yi1hcmVhc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzbWFsbFNpemUgPSBfdmlld3BvcnQueiAvIDM7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHRoaXMubGlnaHRUZXh0dXJlQXRsYXMuY3ViZVNsb3RzT2Zmc2V0c1tmYWNlXTtcbiAgICAgICAgICAgICAgICAgICAgX3ZpZXdwb3J0LnggKz0gc21hbGxTaXplICogb2Zmc2V0Lng7XG4gICAgICAgICAgICAgICAgICAgIF92aWV3cG9ydC55ICs9IHNtYWxsU2l6ZSAqIG9mZnNldC55O1xuICAgICAgICAgICAgICAgICAgICBfdmlld3BvcnQueiA9IHNtYWxsU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgX3ZpZXdwb3J0LncgPSBzbWFsbFNpemU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY3ViZW1hcCBmYWNlIHByb2plY3Rpb24gdW5pZm9ybVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmludlZpZXdQcm9qSWQuc2V0VmFsdWUoQ29va2llUmVuZGVyZXIuX2ludlZpZXdQcm9qTWF0cmljZXNbZmFjZV0uZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgX3ZpZXdwb3J0Lm11bFNjYWxhcihyZW5kZXJUYXJnZXQuY29sb3JCdWZmZXIud2lkdGgpO1xuICAgICAgICAgICAgICAgIGRyYXdRdWFkV2l0aFNoYWRlcihkZXZpY2UsIHJlbmRlclRhcmdldCwgc2hhZGVyLCBfdmlld3BvcnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBEZWJ1Z0dyYXBoaWNzLnBvcEdwdU1hcmtlcih0aGlzLmRldmljZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IENvb2tpZVJlbmRlcmVyIH07XG4iXSwibmFtZXMiOlsidGV4dHVyZUJsaXRWZXJ0ZXhTaGFkZXIiLCJ0ZXh0dXJlQmxpdEZyYWdtZW50U2hhZGVyIiwidGV4dHVyZUN1YmVCbGl0RnJhZ21lbnRTaGFkZXIiLCJfdmlld3BvcnQiLCJWZWM0IiwiQ29va2llUmVuZGVyZXIiLCJjb25zdHJ1Y3RvciIsImRldmljZSIsImxpZ2h0VGV4dHVyZUF0bGFzIiwiYmxpdFNoYWRlcjJkIiwiYmxpdFNoYWRlckN1YmUiLCJibGl0VGV4dHVyZUlkIiwiaW52Vmlld1Byb2pJZCIsImRlc3Ryb3kiLCJnZXRTaGFkZXIiLCJzaGFkZXIiLCJmcmFnbWVudCIsImNyZWF0ZVNoYWRlckZyb21Db2RlIiwic2NvcGUiLCJyZXNvbHZlIiwic2hhZGVyMmQiLCJzaGFkZXJDdWJlIiwiY3JlYXRlVGV4dHVyZSIsInJlc29sdXRpb24iLCJ0ZXh0dXJlIiwiVGV4dHVyZSIsIm5hbWUiLCJ3aWR0aCIsImhlaWdodCIsImZvcm1hdCIsIlBJWEVMRk9STUFUX1JHQkE4IiwiY3ViZW1hcCIsIm1pcG1hcHMiLCJtaW5GaWx0ZXIiLCJGSUxURVJfTkVBUkVTVCIsIm1hZ0ZpbHRlciIsImFkZHJlc3NVIiwiQUREUkVTU19DTEFNUF9UT19FREdFIiwiYWRkcmVzc1YiLCJpbml0SW52Vmlld1Byb2pNYXRyaWNlcyIsIl9pbnZWaWV3UHJvak1hdHJpY2VzIiwiZmFjZSIsImNhbWVyYSIsIkxpZ2h0Q2FtZXJhIiwiY3JlYXRlIiwiTElHSFRUWVBFX09NTkkiLCJwcm9qTWF0IiwicHJvamVjdGlvbk1hdHJpeCIsInZpZXdNYXQiLCJub2RlIiwiZ2V0TG9jYWxUcmFuc2Zvcm0iLCJjbG9uZSIsImludmVydCIsIk1hdDQiLCJtdWwyIiwicmVuZGVyIiwibGlnaHQiLCJyZW5kZXJUYXJnZXQiLCJlbmFibGVkIiwiY29va2llIiwidmlzaWJsZVRoaXNGcmFtZSIsIkRlYnVnR3JhcGhpY3MiLCJwdXNoR3B1TWFya2VyIiwiX25vZGUiLCJmYWNlQ291bnQiLCJudW1TaGFkb3dGYWNlcyIsInNldFZhbHVlIiwiY29weSIsImF0bGFzVmlld3BvcnQiLCJzbWFsbFNpemUiLCJ6Iiwib2Zmc2V0IiwiY3ViZVNsb3RzT2Zmc2V0cyIsIngiLCJ5IiwidyIsImRhdGEiLCJtdWxTY2FsYXIiLCJjb2xvckJ1ZmZlciIsImRyYXdRdWFkV2l0aFNoYWRlciIsInBvcEdwdU1hcmtlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBWUEsTUFBTUEsdUJBQXVCLEdBQUksQ0FBQTtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBTSxDQUFBLENBQUE7QUFFTixNQUFNQyx5QkFBeUIsR0FBSSxDQUFBO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBTSxDQUFBLENBQUE7O0FBR04sTUFBTUMsNkJBQTZCLEdBQUksQ0FBQTtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQU0sQ0FBQSxDQUFBO0FBRU4sTUFBTUMsU0FBUyxHQUFHLElBQUlDLElBQUksRUFBRSxDQUFBOztBQUc1QixNQUFNQyxjQUFjLENBQUM7QUFDakJDLEVBQUFBLFdBQVcsQ0FBQ0MsTUFBTSxFQUFFQyxpQkFBaUIsRUFBRTtJQUNuQyxJQUFJLENBQUNELE1BQU0sR0FBR0EsTUFBTSxDQUFBO0lBQ3BCLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUdBLGlCQUFpQixDQUFBO0lBRTFDLElBQUksQ0FBQ0MsWUFBWSxHQUFHLElBQUksQ0FBQTtJQUN4QixJQUFJLENBQUNDLGNBQWMsR0FBRyxJQUFJLENBQUE7SUFDMUIsSUFBSSxDQUFDQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLElBQUksQ0FBQ0MsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUM3QixHQUFBO0FBRUFDLEVBQUFBLE9BQU8sR0FBRyxFQUNWO0FBRUFDLEVBQUFBLFNBQVMsQ0FBQ0MsTUFBTSxFQUFFQyxRQUFRLEVBQUU7SUFFeEIsSUFBSSxDQUFDLElBQUksQ0FBQ0QsTUFBTSxDQUFDLEVBQ2IsSUFBSSxDQUFDQSxNQUFNLENBQUMsR0FBR0Usb0JBQW9CLENBQUMsSUFBSSxDQUFDVixNQUFNLEVBQUVQLHVCQUF1QixFQUFFZ0IsUUFBUSxFQUFHLENBQUEsZ0JBQUEsRUFBa0JELE1BQU8sQ0FBQSxDQUFDLENBQUMsQ0FBQTtBQUVwSCxJQUFBLElBQUksQ0FBQyxJQUFJLENBQUNKLGFBQWEsRUFDbkIsSUFBSSxDQUFDQSxhQUFhLEdBQUcsSUFBSSxDQUFDSixNQUFNLENBQUNXLEtBQUssQ0FBQ0MsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBRWpFLElBQUEsSUFBSSxDQUFDLElBQUksQ0FBQ1AsYUFBYSxFQUNuQixJQUFJLENBQUNBLGFBQWEsR0FBRyxJQUFJLENBQUNMLE1BQU0sQ0FBQ1csS0FBSyxDQUFDQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7SUFFakUsT0FBTyxJQUFJLENBQUNKLE1BQU0sQ0FBQyxDQUFBO0FBQ3ZCLEdBQUE7QUFFQSxFQUFBLElBQUlLLFFBQVEsR0FBRztBQUNYLElBQUEsT0FBTyxJQUFJLENBQUNOLFNBQVMsQ0FBQyxjQUFjLEVBQUViLHlCQUF5QixDQUFDLENBQUE7QUFDcEUsR0FBQTtBQUVBLEVBQUEsSUFBSW9CLFVBQVUsR0FBRztBQUNiLElBQUEsT0FBTyxJQUFJLENBQUNQLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRVosNkJBQTZCLENBQUMsQ0FBQTtBQUMxRSxHQUFBO0FBRUEsRUFBQSxPQUFPb0IsYUFBYSxDQUFDZixNQUFNLEVBQUVnQixVQUFVLEVBQUU7QUFFckMsSUFBQSxNQUFNQyxPQUFPLEdBQUcsSUFBSUMsT0FBTyxDQUFDbEIsTUFBTSxFQUFFO0FBQ2hDbUIsTUFBQUEsSUFBSSxFQUFFLGFBQWE7QUFDbkJDLE1BQUFBLEtBQUssRUFBRUosVUFBVTtBQUNqQkssTUFBQUEsTUFBTSxFQUFFTCxVQUFVO0FBQ2xCTSxNQUFBQSxNQUFNLEVBQUVDLGlCQUFpQjtBQUN6QkMsTUFBQUEsT0FBTyxFQUFFLEtBQUs7QUFDZEMsTUFBQUEsT0FBTyxFQUFFLEtBQUs7QUFDZEMsTUFBQUEsU0FBUyxFQUFFQyxjQUFjO0FBQ3pCQyxNQUFBQSxTQUFTLEVBQUVELGNBQWM7QUFDekJFLE1BQUFBLFFBQVEsRUFBRUMscUJBQXFCO0FBQy9CQyxNQUFBQSxRQUFRLEVBQUVELHFCQUFBQTtBQUNkLEtBQUMsQ0FBQyxDQUFBO0FBRUYsSUFBQSxPQUFPYixPQUFPLENBQUE7QUFDbEIsR0FBQTs7QUFLQWUsRUFBQUEsdUJBQXVCLEdBQUc7QUFDdEIsSUFBQSxJQUFJLENBQUNsQyxjQUFjLENBQUNtQyxvQkFBb0IsRUFBRTtNQUN0Q25DLGNBQWMsQ0FBQ21DLG9CQUFvQixHQUFHLEVBQUUsQ0FBQTtNQUV4QyxLQUFLLElBQUlDLElBQUksR0FBRyxDQUFDLEVBQUVBLElBQUksR0FBRyxDQUFDLEVBQUVBLElBQUksRUFBRSxFQUFFO1FBQ2pDLE1BQU1DLE1BQU0sR0FBR0MsV0FBVyxDQUFDQyxNQUFNLENBQUMsSUFBSSxFQUFFQyxjQUFjLEVBQUVKLElBQUksQ0FBQyxDQUFBO0FBQzdELFFBQUEsTUFBTUssT0FBTyxHQUFHSixNQUFNLENBQUNLLGdCQUFnQixDQUFBO0FBQ3ZDLFFBQUEsTUFBTUMsT0FBTyxHQUFHTixNQUFNLENBQUNPLElBQUksQ0FBQ0MsaUJBQWlCLEVBQUUsQ0FBQ0MsS0FBSyxFQUFFLENBQUNDLE1BQU0sRUFBRSxDQUFBO0FBQ2hFL0MsUUFBQUEsY0FBYyxDQUFDbUMsb0JBQW9CLENBQUNDLElBQUksQ0FBQyxHQUFHLElBQUlZLElBQUksRUFBRSxDQUFDQyxJQUFJLENBQUNSLE9BQU8sRUFBRUUsT0FBTyxDQUFDLENBQUNJLE1BQU0sRUFBRSxDQUFBO0FBQzFGLE9BQUE7QUFDSixLQUFBO0FBQ0osR0FBQTtBQUVBRyxFQUFBQSxNQUFNLENBQUNDLEtBQUssRUFBRUMsWUFBWSxFQUFFO0lBRXhCLElBQUlELEtBQUssQ0FBQ0UsT0FBTyxJQUFJRixLQUFLLENBQUNHLE1BQU0sSUFBSUgsS0FBSyxDQUFDSSxnQkFBZ0IsRUFBRTtBQUV6REMsTUFBQUEsYUFBYSxDQUFDQyxhQUFhLENBQUMsSUFBSSxDQUFDdkQsTUFBTSxFQUFHLENBQVNpRCxPQUFBQSxFQUFBQSxLQUFLLENBQUNPLEtBQUssQ0FBQ3JDLElBQUssRUFBQyxDQUFDLENBQUE7QUFFdEUsTUFBQSxNQUFNc0MsU0FBUyxHQUFHUixLQUFLLENBQUNTLGNBQWMsQ0FBQTtBQUN0QyxNQUFBLE1BQU1sRCxNQUFNLEdBQUdpRCxTQUFTLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQzNDLFVBQVUsR0FBRyxJQUFJLENBQUNELFFBQVEsQ0FBQTtBQUM5RCxNQUFBLE1BQU1iLE1BQU0sR0FBRyxJQUFJLENBQUNBLE1BQU0sQ0FBQTtNQUUxQixJQUFJeUQsU0FBUyxHQUFHLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQ3pCLHVCQUF1QixFQUFFLENBQUE7QUFDbEMsT0FBQTs7TUFHQSxJQUFJLENBQUM1QixhQUFhLENBQUN1RCxRQUFRLENBQUNWLEtBQUssQ0FBQ0csTUFBTSxDQUFDLENBQUE7O01BR3pDLEtBQUssSUFBSWxCLElBQUksR0FBRyxDQUFDLEVBQUVBLElBQUksR0FBR3VCLFNBQVMsRUFBRXZCLElBQUksRUFBRSxFQUFFO0FBRXpDdEMsUUFBQUEsU0FBUyxDQUFDZ0UsSUFBSSxDQUFDWCxLQUFLLENBQUNZLGFBQWEsQ0FBQyxDQUFBO1FBRW5DLElBQUlKLFNBQVMsR0FBRyxDQUFDLEVBQUU7QUFHZixVQUFBLE1BQU1LLFNBQVMsR0FBR2xFLFNBQVMsQ0FBQ21FLENBQUMsR0FBRyxDQUFDLENBQUE7VUFDakMsTUFBTUMsTUFBTSxHQUFHLElBQUksQ0FBQy9ELGlCQUFpQixDQUFDZ0UsZ0JBQWdCLENBQUMvQixJQUFJLENBQUMsQ0FBQTtBQUM1RHRDLFVBQUFBLFNBQVMsQ0FBQ3NFLENBQUMsSUFBSUosU0FBUyxHQUFHRSxNQUFNLENBQUNFLENBQUMsQ0FBQTtBQUNuQ3RFLFVBQUFBLFNBQVMsQ0FBQ3VFLENBQUMsSUFBSUwsU0FBUyxHQUFHRSxNQUFNLENBQUNHLENBQUMsQ0FBQTtVQUNuQ3ZFLFNBQVMsQ0FBQ21FLENBQUMsR0FBR0QsU0FBUyxDQUFBO1VBQ3ZCbEUsU0FBUyxDQUFDd0UsQ0FBQyxHQUFHTixTQUFTLENBQUE7O0FBR3ZCLFVBQUEsSUFBSSxDQUFDekQsYUFBYSxDQUFDc0QsUUFBUSxDQUFDN0QsY0FBYyxDQUFDbUMsb0JBQW9CLENBQUNDLElBQUksQ0FBQyxDQUFDbUMsSUFBSSxDQUFDLENBQUE7QUFDL0UsU0FBQTtRQUVBekUsU0FBUyxDQUFDMEUsU0FBUyxDQUFDcEIsWUFBWSxDQUFDcUIsV0FBVyxDQUFDbkQsS0FBSyxDQUFDLENBQUE7UUFDbkRvRCxrQkFBa0IsQ0FBQ3hFLE1BQU0sRUFBRWtELFlBQVksRUFBRTFDLE1BQU0sRUFBRVosU0FBUyxDQUFDLENBQUE7QUFDL0QsT0FBQTtBQUVBMEQsTUFBQUEsYUFBYSxDQUFDbUIsWUFBWSxDQUFDLElBQUksQ0FBQ3pFLE1BQU0sQ0FBQyxDQUFBO0FBQzNDLEtBQUE7QUFDSixHQUFBO0FBQ0osQ0FBQTtBQWpITUYsY0FBYyxDQXVEVG1DLG9CQUFvQixHQUFHLElBQUk7Ozs7In0=
