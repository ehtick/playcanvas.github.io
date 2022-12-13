/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { WebglBuffer } from './webgl-buffer.js';

class WebglVertexBuffer extends WebglBuffer {
  constructor(...args) {
    super(...args);
    this.vao = null;
  }
  destroy(device) {
    super.destroy(device);

    device.boundVao = null;
    device.gl.bindVertexArray(null);
  }
  loseContext() {
    super.loseContext();
    this.vao = null;
  }
  unlock(vertexBuffer) {
    const device = vertexBuffer.device;
    super.unlock(device, vertexBuffer.usage, device.gl.ARRAY_BUFFER, vertexBuffer.storage);
  }
}

export { WebglVertexBuffer };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ2wtdmVydGV4LWJ1ZmZlci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3BsYXRmb3JtL2dyYXBoaWNzL3dlYmdsL3dlYmdsLXZlcnRleC1idWZmZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgV2ViZ2xCdWZmZXIgfSBmcm9tIFwiLi93ZWJnbC1idWZmZXIuanNcIjtcblxuLyoqXG4gKiBBIFdlYkdMIGltcGxlbWVudGF0aW9uIG9mIHRoZSBWZXJ0ZXhCdWZmZXIuXG4gKlxuICogQGlnbm9yZVxuICovXG5jbGFzcyBXZWJnbFZlcnRleEJ1ZmZlciBleHRlbmRzIFdlYmdsQnVmZmVyIHtcbiAgICAvLyB2ZXJ0ZXggYXJyYXkgb2JqZWN0XG4gICAgdmFvID0gbnVsbDtcblxuICAgIGRlc3Ryb3koZGV2aWNlKSB7XG5cbiAgICAgICAgc3VwZXIuZGVzdHJveShkZXZpY2UpO1xuXG4gICAgICAgIC8vIGNsZWFyIHVwIGJvdW5kIHZlcnRleCBidWZmZXJzXG4gICAgICAgIGRldmljZS5ib3VuZFZhbyA9IG51bGw7XG4gICAgICAgIGRldmljZS5nbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG4gICAgfVxuXG4gICAgbG9zZUNvbnRleHQoKSB7XG4gICAgICAgIHN1cGVyLmxvc2VDb250ZXh0KCk7XG4gICAgICAgIHRoaXMudmFvID0gbnVsbDtcbiAgICB9XG5cbiAgICB1bmxvY2sodmVydGV4QnVmZmVyKSB7XG5cbiAgICAgICAgY29uc3QgZGV2aWNlID0gdmVydGV4QnVmZmVyLmRldmljZTtcbiAgICAgICAgc3VwZXIudW5sb2NrKGRldmljZSwgdmVydGV4QnVmZmVyLnVzYWdlLCBkZXZpY2UuZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIuc3RvcmFnZSk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBXZWJnbFZlcnRleEJ1ZmZlciB9O1xuIl0sIm5hbWVzIjpbIldlYmdsVmVydGV4QnVmZmVyIiwiV2ViZ2xCdWZmZXIiLCJ2YW8iLCJkZXN0cm95IiwiZGV2aWNlIiwiYm91bmRWYW8iLCJnbCIsImJpbmRWZXJ0ZXhBcnJheSIsImxvc2VDb250ZXh0IiwidW5sb2NrIiwidmVydGV4QnVmZmVyIiwidXNhZ2UiLCJBUlJBWV9CVUZGRVIiLCJzdG9yYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBT0EsTUFBTUEsaUJBQWlCLFNBQVNDLFdBQVcsQ0FBQztBQUFBLEVBQUEsV0FBQSxDQUFBLEdBQUEsSUFBQSxFQUFBO0FBQUEsSUFBQSxLQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtJQUFBLElBRXhDQyxDQUFBQSxHQUFHLEdBQUcsSUFBSSxDQUFBO0FBQUEsR0FBQTtFQUVWQyxPQUFPLENBQUNDLE1BQU0sRUFBRTtBQUVaLElBQUEsS0FBSyxDQUFDRCxPQUFPLENBQUNDLE1BQU0sQ0FBQyxDQUFBOztJQUdyQkEsTUFBTSxDQUFDQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3RCRCxJQUFBQSxNQUFNLENBQUNFLEVBQUUsQ0FBQ0MsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ25DLEdBQUE7QUFFQUMsRUFBQUEsV0FBVyxHQUFHO0lBQ1YsS0FBSyxDQUFDQSxXQUFXLEVBQUUsQ0FBQTtJQUNuQixJQUFJLENBQUNOLEdBQUcsR0FBRyxJQUFJLENBQUE7QUFDbkIsR0FBQTtFQUVBTyxNQUFNLENBQUNDLFlBQVksRUFBRTtBQUVqQixJQUFBLE1BQU1OLE1BQU0sR0FBR00sWUFBWSxDQUFDTixNQUFNLENBQUE7QUFDbEMsSUFBQSxLQUFLLENBQUNLLE1BQU0sQ0FBQ0wsTUFBTSxFQUFFTSxZQUFZLENBQUNDLEtBQUssRUFBRVAsTUFBTSxDQUFDRSxFQUFFLENBQUNNLFlBQVksRUFBRUYsWUFBWSxDQUFDRyxPQUFPLENBQUMsQ0FBQTtBQUMxRixHQUFBO0FBQ0o7Ozs7In0=
