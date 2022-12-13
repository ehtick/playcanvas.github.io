/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { SEMANTIC_POSITION, TYPE_FLOAT32, BUFFER_STATIC, CULLFACE_NONE, PRIMITIVE_TRISTRIP } from '../../platform/graphics/constants.js';
import { VertexBuffer } from '../../platform/graphics/vertex-buffer.js';
import { VertexFormat } from '../../platform/graphics/vertex-format.js';

const primitive = {
  type: PRIMITIVE_TRISTRIP,
  base: 0,
  count: 4,
  indexed: false
};

class PostEffect {
  constructor(graphicsDevice) {
    this.device = graphicsDevice;

    this.shader = null;

    this.vertexBuffer = createFullscreenQuad(graphicsDevice);

    this.needsDepthBuffer = false;
    this.depthMap = null;
  }

  render(inputTarget, outputTarget, rect) {}
}

function createFullscreenQuad(device) {
  const vertexFormat = new VertexFormat(device, [{
    semantic: SEMANTIC_POSITION,
    components: 2,
    type: TYPE_FLOAT32
  }]);

  const data = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  return new VertexBuffer(device, vertexFormat, 4, BUFFER_STATIC, data.buffer);
}

function drawFullscreenQuad(device, target, vertexBuffer, shader, rect) {
  const oldRt = device.getRenderTarget();
  device.setRenderTarget(target);
  device.updateBegin();
  let w = target ? target.width : device.width;
  let h = target ? target.height : device.height;
  let x = 0;
  let y = 0;
  if (rect) {
    x = rect.x * w;
    y = rect.y * h;
    w *= rect.z;
    h *= rect.w;
  }
  const oldVx = device.vx;
  const oldVy = device.vy;
  const oldVw = device.vw;
  const oldVh = device.vh;
  device.setViewport(x, y, w, h);
  const oldSx = device.sx;
  const oldSy = device.sy;
  const oldSw = device.sw;
  const oldSh = device.sh;
  device.setScissor(x, y, w, h);
  const oldBlending = device.getBlending();
  const oldDepthTest = device.getDepthTest();
  const oldDepthWrite = device.getDepthWrite();
  const oldCullMode = device.getCullMode();
  const oldWR = device.writeRed;
  const oldWG = device.writeGreen;
  const oldWB = device.writeBlue;
  const oldWA = device.writeAlpha;
  device.setBlending(false);
  device.setDepthTest(false);
  device.setDepthWrite(false);
  device.setCullMode(CULLFACE_NONE);
  device.setColorWrite(true, true, true, true);
  device.setVertexBuffer(vertexBuffer, 0);
  device.setShader(shader);
  device.draw(primitive);
  device.setBlending(oldBlending);
  device.setDepthTest(oldDepthTest);
  device.setDepthWrite(oldDepthWrite);
  device.setCullMode(oldCullMode);
  device.setColorWrite(oldWR, oldWG, oldWB, oldWA);
  device.updateEnd();
  device.setRenderTarget(oldRt);
  device.updateBegin();
  device.setViewport(oldVx, oldVy, oldVw, oldVh);
  device.setScissor(oldSx, oldSy, oldSw, oldSh);
}

export { PostEffect, createFullscreenQuad, drawFullscreenQuad };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdC1lZmZlY3QuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY2VuZS9ncmFwaGljcy9wb3N0LWVmZmVjdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDVUxMRkFDRV9OT05FLCBQUklNSVRJVkVfVFJJU1RSSVAsIFNFTUFOVElDX1BPU0lUSU9OLCBUWVBFX0ZMT0FUMzIsIEJVRkZFUl9TVEFUSUMgfSBmcm9tICcuLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgVmVydGV4QnVmZmVyIH0gZnJvbSAnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3MvdmVydGV4LWJ1ZmZlci5qcyc7XG5pbXBvcnQgeyBWZXJ0ZXhGb3JtYXQgfSBmcm9tICcuLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy92ZXJ0ZXgtZm9ybWF0LmpzJztcblxuLy8gUHJpbWl0aXZlIGZvciBkcmF3RnVsbHNjcmVlblF1YWRcbmNvbnN0IHByaW1pdGl2ZSA9IHtcbiAgICB0eXBlOiBQUklNSVRJVkVfVFJJU1RSSVAsXG4gICAgYmFzZTogMCxcbiAgICBjb3VudDogNCxcbiAgICBpbmRleGVkOiBmYWxzZVxufTtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhbGwgcG9zdCBlZmZlY3RzLiBQb3N0IGVmZmVjdHMgdGFrZSBhIGEgcmVuZGVyIHRhcmdldCBhcyBpbnB1dCBhcHBseSBlZmZlY3RzIHRvXG4gKiBpdCBhbmQgdGhlbiByZW5kZXIgdGhlIHJlc3VsdCB0byBhbiBvdXRwdXQgcmVuZGVyIHRhcmdldCBvciB0aGUgc2NyZWVuIGlmIG5vIG91dHB1dCBpc1xuICogc3BlY2lmaWVkLlxuICovXG5jbGFzcyBQb3N0RWZmZWN0IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgUG9zdEVmZmVjdCBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy9ncmFwaGljcy1kZXZpY2UuanMnKS5HcmFwaGljc0RldmljZX0gZ3JhcGhpY3NEZXZpY2UgLVxuICAgICAqIFRoZSBncmFwaGljcyBkZXZpY2Ugb2YgdGhlIGFwcGxpY2F0aW9uLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGdyYXBoaWNzRGV2aWNlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgZ3JhcGhpY3MgZGV2aWNlIG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge2ltcG9ydCgnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3MvZ3JhcGhpY3MtZGV2aWNlLmpzJykuR3JhcGhpY3NEZXZpY2V9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRldmljZSA9IGdyYXBoaWNzRGV2aWNlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgc2hhZGVyIGRlZmluaXRpb24gZm9yIHRoZSBmdWxsc2NyZWVuIHF1YWQuIE5lZWRzIHRvIGJlIHNldCBieSB0aGUgY3VzdG9tIHBvc3QgZWZmZWN0XG4gICAgICAgICAqIChkZWZhdWx0IGlzIG51bGwpLiBVc2VkIHdoZW4gY2FsbGluZyB7QGxpbmsgZHJhd0Z1bGxzY3JlZW5RdWFkfS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge2ltcG9ydCgnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3Mvc2hhZGVyLmpzJykuU2hhZGVyfG51bGx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNoYWRlciA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSB2ZXJ0ZXggYnVmZmVyIGZvciB0aGUgZnVsbHNjcmVlbiBxdWFkLiBVc2VkIHdoZW4gY2FsbGluZyB7QGxpbmsgZHJhd0Z1bGxzY3JlZW5RdWFkfS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge1ZlcnRleEJ1ZmZlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudmVydGV4QnVmZmVyID0gY3JlYXRlRnVsbHNjcmVlblF1YWQoZ3JhcGhpY3NEZXZpY2UpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgcHJvcGVydHkgdGhhdCBzaG91bGQgdG8gYmUgc2V0IHRvIGB0cnVlYCAoYnkgdGhlIGN1c3RvbSBwb3N0IGVmZmVjdCkgaWYgYSBkZXB0aCBtYXBcbiAgICAgICAgICogaXMgbmVjZXNzYXJ5IChkZWZhdWx0IGlzIGZhbHNlKS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm5lZWRzRGVwdGhCdWZmZXIgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmRlcHRoTWFwID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGhlIHBvc3QgZWZmZWN0IHVzaW5nIHRoZSBzcGVjaWZpZWQgaW5wdXRUYXJnZXQgdG8gdGhlIHNwZWNpZmllZCBvdXRwdXRUYXJnZXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3MvcmVuZGVyLXRhcmdldC5qcycpLlJlbmRlclRhcmdldH0gaW5wdXRUYXJnZXQgLSBUaGVcbiAgICAgKiBpbnB1dCByZW5kZXIgdGFyZ2V0LlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy9yZW5kZXItdGFyZ2V0LmpzJykuUmVuZGVyVGFyZ2V0fSBvdXRwdXRUYXJnZXQgLSBUaGVcbiAgICAgKiBvdXRwdXQgcmVuZGVyIHRhcmdldC4gSWYgbnVsbCB0aGVuIHRoaXMgd2lsbCBiZSB0aGUgc2NyZWVuLlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi8uLi9jb3JlL21hdGgvdmVjNC5qcycpLlZlYzR9IFtyZWN0XSAtIFRoZSByZWN0IG9mIHRoZSBjdXJyZW50IGNhbWVyYS4gSWZcbiAgICAgKiBub3Qgc3BlY2lmaWVkLCBpdCB3aWxsIGRlZmF1bHQgdG8gWzAsIDAsIDEsIDFdLlxuICAgICAqL1xuICAgIHJlbmRlcihpbnB1dFRhcmdldCwgb3V0cHV0VGFyZ2V0LCByZWN0KSB7XG4gICAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIHZlcnRleCBidWZmZXIgd2l0aCA0IHZlcnRpY2VzIHJlcHJlc2VudGluZyBhIGZ1bGxzY3JlZW4gcXVhZC5cbiAqXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi4vLi4vcGxhdGZvcm0vL2dyYXBoaWNzL2dyYXBoaWNzLWRldmljZS5qcycpLkdyYXBoaWNzRGV2aWNlfSBkZXZpY2UgLSBUaGVcbiAqIGdyYXBoaWNzIGRldmljZS5cbiAqIEByZXR1cm5zIHtWZXJ0ZXhCdWZmZXJ9IC0gVGhlIGZ1bGxzY3JlZW4gcXVhZCB2ZXJ0ZXggYnVmZmVyLlxuICogQGlnbm9yZVxuICovXG5mdW5jdGlvbiBjcmVhdGVGdWxsc2NyZWVuUXVhZChkZXZpY2UpIHtcbiAgICAvLyBDcmVhdGUgdGhlIHZlcnRleCBmb3JtYXRcbiAgICBjb25zdCB2ZXJ0ZXhGb3JtYXQgPSBuZXcgVmVydGV4Rm9ybWF0KGRldmljZSwgW1xuICAgICAgICB7IHNlbWFudGljOiBTRU1BTlRJQ19QT1NJVElPTiwgY29tcG9uZW50czogMiwgdHlwZTogVFlQRV9GTE9BVDMyIH1cbiAgICBdKTtcblxuICAgIC8vIENyZWF0ZSBhIHZlcnRleCBidWZmZXJcbiAgICBjb25zdCBkYXRhID0gbmV3IEZsb2F0MzJBcnJheShbLTEsIC0xLCAxLCAtMSwgLTEsIDEsIDEsIDFdKTtcbiAgICByZXR1cm4gbmV3IFZlcnRleEJ1ZmZlcihkZXZpY2UsIHZlcnRleEZvcm1hdCwgNCwgQlVGRkVSX1NUQVRJQywgZGF0YS5idWZmZXIpO1xufVxuXG4vKipcbiAqIERyYXcgYSBzY3JlZW4tc3BhY2UgcmVjdGFuZ2xlIGluIGEgcmVuZGVyIHRhcmdldC4gUHJpbWFyaWx5IG1lYW50IHRvIGJlIHVzZWQgaW4gY3VzdG9tIHBvc3RcbiAqIGVmZmVjdHMgYmFzZWQgb24ge0BsaW5rIFBvc3RFZmZlY3R9LlxuICpcbiAqIEBwYXJhbSB7aW1wb3J0KCcuLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy9ncmFwaGljcy1kZXZpY2UuanMnKS5HcmFwaGljc0RldmljZX0gZGV2aWNlIC0gVGhlXG4gKiBncmFwaGljcyBkZXZpY2Ugb2YgdGhlIGFwcGxpY2F0aW9uLlxuICogQHBhcmFtIHtpbXBvcnQoJy4uLy4uL3BsYXRmb3JtL2dyYXBoaWNzL3JlbmRlci10YXJnZXQuanMnKS5SZW5kZXJUYXJnZXR9IHRhcmdldCAtIFRoZSBvdXRwdXRcbiAqIHJlbmRlciB0YXJnZXQuXG4gKiBAcGFyYW0ge1ZlcnRleEJ1ZmZlcn0gdmVydGV4QnVmZmVyIC0gVGhlIHZlcnRleCBidWZmZXIgZm9yIHRoZSByZWN0YW5nbGUgbWVzaC4gV2hlbiBjYWxsaW5nIGZyb21cbiAqIGEgY3VzdG9tIHBvc3QgZWZmZWN0LCBwYXNzIHRoZSBmaWVsZCB7QGxpbmsgUG9zdEVmZmVjdCN2ZXJ0ZXhCdWZmZXJ9LlxuICogQHBhcmFtIHtpbXBvcnQoJy4uLy4uL3BsYXRmb3JtL2dyYXBoaWNzL3NoYWRlci5qcycpLlNoYWRlcn0gc2hhZGVyIC0gVGhlIHNoYWRlciB0byBiZSB1c2VkIGZvclxuICogZHJhd2luZyB0aGUgcmVjdGFuZ2xlLiBXaGVuIGNhbGxpbmcgZnJvbSBhIGN1c3RvbSBwb3N0IGVmZmVjdCwgcGFzcyB0aGUgZmllbGRcbiAqIHtAbGluayBQb3N0RWZmZWN0I3NoYWRlcn0uXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi4vLi4vY29yZS9tYXRoL3ZlYzQuanMnKS5WZWM0fSBbcmVjdF0gLSBUaGUgbm9ybWFsaXplZCBzY3JlZW4tc3BhY2UgcG9zaXRpb25cbiAqIChyZWN0LngsIHJlY3QueSkgYW5kIHNpemUgKHJlY3QueiwgcmVjdC53KSBvZiB0aGUgcmVjdGFuZ2xlLiBEZWZhdWx0IGlzIFswLCAwLCAxLCAxXS5cbiAqL1xuZnVuY3Rpb24gZHJhd0Z1bGxzY3JlZW5RdWFkKGRldmljZSwgdGFyZ2V0LCB2ZXJ0ZXhCdWZmZXIsIHNoYWRlciwgcmVjdCkge1xuICAgIGNvbnN0IG9sZFJ0ID0gZGV2aWNlLmdldFJlbmRlclRhcmdldCgpO1xuICAgIGRldmljZS5zZXRSZW5kZXJUYXJnZXQodGFyZ2V0KTtcbiAgICBkZXZpY2UudXBkYXRlQmVnaW4oKTtcblxuICAgIGxldCB3ID0gdGFyZ2V0ID8gdGFyZ2V0LndpZHRoIDogZGV2aWNlLndpZHRoO1xuICAgIGxldCBoID0gdGFyZ2V0ID8gdGFyZ2V0LmhlaWdodCA6IGRldmljZS5oZWlnaHQ7XG4gICAgbGV0IHggPSAwO1xuICAgIGxldCB5ID0gMDtcblxuICAgIGlmIChyZWN0KSB7XG4gICAgICAgIHggPSByZWN0LnggKiB3O1xuICAgICAgICB5ID0gcmVjdC55ICogaDtcbiAgICAgICAgdyAqPSByZWN0Lno7XG4gICAgICAgIGggKj0gcmVjdC53O1xuICAgIH1cblxuICAgIGNvbnN0IG9sZFZ4ID0gZGV2aWNlLnZ4O1xuICAgIGNvbnN0IG9sZFZ5ID0gZGV2aWNlLnZ5O1xuICAgIGNvbnN0IG9sZFZ3ID0gZGV2aWNlLnZ3O1xuICAgIGNvbnN0IG9sZFZoID0gZGV2aWNlLnZoO1xuICAgIGRldmljZS5zZXRWaWV3cG9ydCh4LCB5LCB3LCBoKTtcbiAgICBjb25zdCBvbGRTeCA9IGRldmljZS5zeDtcbiAgICBjb25zdCBvbGRTeSA9IGRldmljZS5zeTtcbiAgICBjb25zdCBvbGRTdyA9IGRldmljZS5zdztcbiAgICBjb25zdCBvbGRTaCA9IGRldmljZS5zaDtcbiAgICBkZXZpY2Uuc2V0U2Npc3Nvcih4LCB5LCB3LCBoKTtcblxuICAgIGNvbnN0IG9sZEJsZW5kaW5nID0gZGV2aWNlLmdldEJsZW5kaW5nKCk7XG4gICAgY29uc3Qgb2xkRGVwdGhUZXN0ID0gZGV2aWNlLmdldERlcHRoVGVzdCgpO1xuICAgIGNvbnN0IG9sZERlcHRoV3JpdGUgPSBkZXZpY2UuZ2V0RGVwdGhXcml0ZSgpO1xuICAgIGNvbnN0IG9sZEN1bGxNb2RlID0gZGV2aWNlLmdldEN1bGxNb2RlKCk7XG4gICAgY29uc3Qgb2xkV1IgPSBkZXZpY2Uud3JpdGVSZWQ7XG4gICAgY29uc3Qgb2xkV0cgPSBkZXZpY2Uud3JpdGVHcmVlbjtcbiAgICBjb25zdCBvbGRXQiA9IGRldmljZS53cml0ZUJsdWU7XG4gICAgY29uc3Qgb2xkV0EgPSBkZXZpY2Uud3JpdGVBbHBoYTtcbiAgICBkZXZpY2Uuc2V0QmxlbmRpbmcoZmFsc2UpO1xuICAgIGRldmljZS5zZXREZXB0aFRlc3QoZmFsc2UpO1xuICAgIGRldmljZS5zZXREZXB0aFdyaXRlKGZhbHNlKTtcbiAgICBkZXZpY2Uuc2V0Q3VsbE1vZGUoQ1VMTEZBQ0VfTk9ORSk7XG4gICAgZGV2aWNlLnNldENvbG9yV3JpdGUodHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSk7XG5cbiAgICBkZXZpY2Uuc2V0VmVydGV4QnVmZmVyKHZlcnRleEJ1ZmZlciwgMCk7XG4gICAgZGV2aWNlLnNldFNoYWRlcihzaGFkZXIpO1xuXG4gICAgZGV2aWNlLmRyYXcocHJpbWl0aXZlKTtcblxuICAgIGRldmljZS5zZXRCbGVuZGluZyhvbGRCbGVuZGluZyk7XG4gICAgZGV2aWNlLnNldERlcHRoVGVzdChvbGREZXB0aFRlc3QpO1xuICAgIGRldmljZS5zZXREZXB0aFdyaXRlKG9sZERlcHRoV3JpdGUpO1xuICAgIGRldmljZS5zZXRDdWxsTW9kZShvbGRDdWxsTW9kZSk7XG4gICAgZGV2aWNlLnNldENvbG9yV3JpdGUob2xkV1IsIG9sZFdHLCBvbGRXQiwgb2xkV0EpO1xuXG4gICAgZGV2aWNlLnVwZGF0ZUVuZCgpO1xuXG4gICAgZGV2aWNlLnNldFJlbmRlclRhcmdldChvbGRSdCk7XG4gICAgZGV2aWNlLnVwZGF0ZUJlZ2luKCk7XG5cbiAgICBkZXZpY2Uuc2V0Vmlld3BvcnQob2xkVngsIG9sZFZ5LCBvbGRWdywgb2xkVmgpO1xuICAgIGRldmljZS5zZXRTY2lzc29yKG9sZFN4LCBvbGRTeSwgb2xkU3csIG9sZFNoKTtcbn1cblxuZXhwb3J0IHsgY3JlYXRlRnVsbHNjcmVlblF1YWQsIGRyYXdGdWxsc2NyZWVuUXVhZCwgUG9zdEVmZmVjdCB9O1xuIl0sIm5hbWVzIjpbInByaW1pdGl2ZSIsInR5cGUiLCJQUklNSVRJVkVfVFJJU1RSSVAiLCJiYXNlIiwiY291bnQiLCJpbmRleGVkIiwiUG9zdEVmZmVjdCIsImNvbnN0cnVjdG9yIiwiZ3JhcGhpY3NEZXZpY2UiLCJkZXZpY2UiLCJzaGFkZXIiLCJ2ZXJ0ZXhCdWZmZXIiLCJjcmVhdGVGdWxsc2NyZWVuUXVhZCIsIm5lZWRzRGVwdGhCdWZmZXIiLCJkZXB0aE1hcCIsInJlbmRlciIsImlucHV0VGFyZ2V0Iiwib3V0cHV0VGFyZ2V0IiwicmVjdCIsInZlcnRleEZvcm1hdCIsIlZlcnRleEZvcm1hdCIsInNlbWFudGljIiwiU0VNQU5USUNfUE9TSVRJT04iLCJjb21wb25lbnRzIiwiVFlQRV9GTE9BVDMyIiwiZGF0YSIsIkZsb2F0MzJBcnJheSIsIlZlcnRleEJ1ZmZlciIsIkJVRkZFUl9TVEFUSUMiLCJidWZmZXIiLCJkcmF3RnVsbHNjcmVlblF1YWQiLCJ0YXJnZXQiLCJvbGRSdCIsImdldFJlbmRlclRhcmdldCIsInNldFJlbmRlclRhcmdldCIsInVwZGF0ZUJlZ2luIiwidyIsIndpZHRoIiwiaCIsImhlaWdodCIsIngiLCJ5IiwieiIsIm9sZFZ4IiwidngiLCJvbGRWeSIsInZ5Iiwib2xkVnciLCJ2dyIsIm9sZFZoIiwidmgiLCJzZXRWaWV3cG9ydCIsIm9sZFN4Iiwic3giLCJvbGRTeSIsInN5Iiwib2xkU3ciLCJzdyIsIm9sZFNoIiwic2giLCJzZXRTY2lzc29yIiwib2xkQmxlbmRpbmciLCJnZXRCbGVuZGluZyIsIm9sZERlcHRoVGVzdCIsImdldERlcHRoVGVzdCIsIm9sZERlcHRoV3JpdGUiLCJnZXREZXB0aFdyaXRlIiwib2xkQ3VsbE1vZGUiLCJnZXRDdWxsTW9kZSIsIm9sZFdSIiwid3JpdGVSZWQiLCJvbGRXRyIsIndyaXRlR3JlZW4iLCJvbGRXQiIsIndyaXRlQmx1ZSIsIm9sZFdBIiwid3JpdGVBbHBoYSIsInNldEJsZW5kaW5nIiwic2V0RGVwdGhUZXN0Iiwic2V0RGVwdGhXcml0ZSIsInNldEN1bGxNb2RlIiwiQ1VMTEZBQ0VfTk9ORSIsInNldENvbG9yV3JpdGUiLCJzZXRWZXJ0ZXhCdWZmZXIiLCJzZXRTaGFkZXIiLCJkcmF3IiwidXBkYXRlRW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFLQSxNQUFNQSxTQUFTLEdBQUc7QUFDZEMsRUFBQUEsSUFBSSxFQUFFQyxrQkFBa0I7QUFDeEJDLEVBQUFBLElBQUksRUFBRSxDQUFDO0FBQ1BDLEVBQUFBLEtBQUssRUFBRSxDQUFDO0FBQ1JDLEVBQUFBLE9BQU8sRUFBRSxLQUFBO0FBQ2IsQ0FBQyxDQUFBOztBQU9ELE1BQU1DLFVBQVUsQ0FBQztFQU9iQyxXQUFXLENBQUNDLGNBQWMsRUFBRTtJQU14QixJQUFJLENBQUNDLE1BQU0sR0FBR0QsY0FBYyxDQUFBOztJQVE1QixJQUFJLENBQUNFLE1BQU0sR0FBRyxJQUFJLENBQUE7O0FBT2xCLElBQUEsSUFBSSxDQUFDQyxZQUFZLEdBQUdDLG9CQUFvQixDQUFDSixjQUFjLENBQUMsQ0FBQTs7SUFReEQsSUFBSSxDQUFDSyxnQkFBZ0IsR0FBRyxLQUFLLENBQUE7SUFFN0IsSUFBSSxDQUFDQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3hCLEdBQUE7O0FBWUFDLEVBQUFBLE1BQU0sQ0FBQ0MsV0FBVyxFQUFFQyxZQUFZLEVBQUVDLElBQUksRUFBRSxFQUN4QztBQUNKLENBQUE7O0FBVUEsU0FBU04sb0JBQW9CLENBQUNILE1BQU0sRUFBRTtBQUVsQyxFQUFBLE1BQU1VLFlBQVksR0FBRyxJQUFJQyxZQUFZLENBQUNYLE1BQU0sRUFBRSxDQUMxQztBQUFFWSxJQUFBQSxRQUFRLEVBQUVDLGlCQUFpQjtBQUFFQyxJQUFBQSxVQUFVLEVBQUUsQ0FBQztBQUFFdEIsSUFBQUEsSUFBSSxFQUFFdUIsWUFBQUE7QUFBYSxHQUFDLENBQ3JFLENBQUMsQ0FBQTs7RUFHRixNQUFNQyxJQUFJLEdBQUcsSUFBSUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMs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
