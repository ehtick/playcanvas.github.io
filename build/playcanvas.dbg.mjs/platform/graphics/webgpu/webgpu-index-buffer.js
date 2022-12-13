/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../../core/debug.js';
import { INDEXFORMAT_UINT8, INDEXFORMAT_UINT16 } from '../constants.js';
import { WebgpuBuffer } from './webgpu-buffer.js';

class WebgpuIndexBuffer extends WebgpuBuffer {
  constructor(indexBuffer) {
    super();
    this.format = null;
    Debug.assert(indexBuffer.format !== INDEXFORMAT_UINT8, "WebGPU does not support 8-bit index buffer format");
    this.format = indexBuffer.format === INDEXFORMAT_UINT16 ? "uint16" : "uint32";
  }
  unlock(indexBuffer) {
    const device = indexBuffer.device;
    super.unlock(device, indexBuffer.usage, GPUBufferUsage.INDEX, indexBuffer.storage);
  }
}

export { WebgpuIndexBuffer };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ3B1LWluZGV4LWJ1ZmZlci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3BsYXRmb3JtL2dyYXBoaWNzL3dlYmdwdS93ZWJncHUtaW5kZXgtYnVmZmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERlYnVnIH0gZnJvbSAnLi4vLi4vLi4vY29yZS9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBJTkRFWEZPUk1BVF9VSU5UOCwgSU5ERVhGT1JNQVRfVUlOVDE2IH0gZnJvbSAnLi4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IFdlYmdwdUJ1ZmZlciB9IGZyb20gXCIuL3dlYmdwdS1idWZmZXIuanNcIjtcblxuLyoqXG4gKiBBIFdlYkdQVSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgSW5kZXhCdWZmZXIuXG4gKlxuICogQGlnbm9yZVxuICovXG5jbGFzcyBXZWJncHVJbmRleEJ1ZmZlciBleHRlbmRzIFdlYmdwdUJ1ZmZlciB7XG4gICAgZm9ybWF0ID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKGluZGV4QnVmZmVyKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgRGVidWcuYXNzZXJ0KGluZGV4QnVmZmVyLmZvcm1hdCAhPT0gSU5ERVhGT1JNQVRfVUlOVDgsIFwiV2ViR1BVIGRvZXMgbm90IHN1cHBvcnQgOC1iaXQgaW5kZXggYnVmZmVyIGZvcm1hdFwiKTtcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBpbmRleEJ1ZmZlci5mb3JtYXQgPT09IElOREVYRk9STUFUX1VJTlQxNiA/IFwidWludDE2XCIgOiBcInVpbnQzMlwiO1xuICAgIH1cblxuICAgIHVubG9jayhpbmRleEJ1ZmZlcikge1xuICAgICAgICBjb25zdCBkZXZpY2UgPSBpbmRleEJ1ZmZlci5kZXZpY2U7XG4gICAgICAgIHN1cGVyLnVubG9jayhkZXZpY2UsIGluZGV4QnVmZmVyLnVzYWdlLCBHUFVCdWZmZXJVc2FnZS5JTkRFWCwgaW5kZXhCdWZmZXIuc3RvcmFnZSk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBXZWJncHVJbmRleEJ1ZmZlciB9O1xuIl0sIm5hbWVzIjpbIldlYmdwdUluZGV4QnVmZmVyIiwiV2ViZ3B1QnVmZmVyIiwiY29uc3RydWN0b3IiLCJpbmRleEJ1ZmZlciIsImZvcm1hdCIsIkRlYnVnIiwiYXNzZXJ0IiwiSU5ERVhGT1JNQVRfVUlOVDgiLCJJTkRFWEZPUk1BVF9VSU5UMTYiLCJ1bmxvY2siLCJkZXZpY2UiLCJ1c2FnZSIsIkdQVUJ1ZmZlclVzYWdlIiwiSU5ERVgiLCJzdG9yYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFTQSxNQUFNQSxpQkFBaUIsU0FBU0MsWUFBWSxDQUFDO0VBR3pDQyxXQUFXLENBQUNDLFdBQVcsRUFBRTtBQUNyQixJQUFBLEtBQUssRUFBRSxDQUFBO0lBQUMsSUFIWkMsQ0FBQUEsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUtUQyxLQUFLLENBQUNDLE1BQU0sQ0FBQ0gsV0FBVyxDQUFDQyxNQUFNLEtBQUtHLGlCQUFpQixFQUFFLG1EQUFtRCxDQUFDLENBQUE7SUFDM0csSUFBSSxDQUFDSCxNQUFNLEdBQUdELFdBQVcsQ0FBQ0MsTUFBTSxLQUFLSSxrQkFBa0IsR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFBO0FBQ2pGLEdBQUE7RUFFQUMsTUFBTSxDQUFDTixXQUFXLEVBQUU7QUFDaEIsSUFBQSxNQUFNTyxNQUFNLEdBQUdQLFdBQVcsQ0FBQ08sTUFBTSxDQUFBO0FBQ2pDLElBQUEsS0FBSyxDQUFDRCxNQUFNLENBQUNDLE1BQU0sRUFBRVAsV0FBVyxDQUFDUSxLQUFLLEVBQUVDLGNBQWMsQ0FBQ0MsS0FBSyxFQUFFVixXQUFXLENBQUNXLE9BQU8sQ0FBQyxDQUFBO0FBQ3RGLEdBQUE7QUFDSjs7OzsifQ==
