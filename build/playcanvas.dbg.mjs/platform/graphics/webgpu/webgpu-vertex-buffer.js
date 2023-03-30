/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { WebgpuBuffer } from './webgpu-buffer.js';

/**
 * A WebGPU implementation of the VertexBuffer.
 *
 * @ignore
 */
class WebgpuVertexBuffer extends WebgpuBuffer {
  constructor(vertexBuffer, format) {
    super();
  }
  destroy(device) {
    super.destroy(device);

    // TODO: clear up bound vertex buffers
  }

  unlock(vertexBuffer) {
    const device = vertexBuffer.device;
    super.unlock(device, vertexBuffer.usage, GPUBufferUsage.VERTEX, vertexBuffer.storage);
  }
}

export { WebgpuVertexBuffer };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ3B1LXZlcnRleC1idWZmZXIuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9wbGF0Zm9ybS9ncmFwaGljcy93ZWJncHUvd2ViZ3B1LXZlcnRleC1idWZmZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgV2ViZ3B1QnVmZmVyIH0gZnJvbSBcIi4vd2ViZ3B1LWJ1ZmZlci5qc1wiO1xuXG4vKipcbiAqIEEgV2ViR1BVIGltcGxlbWVudGF0aW9uIG9mIHRoZSBWZXJ0ZXhCdWZmZXIuXG4gKlxuICogQGlnbm9yZVxuICovXG5jbGFzcyBXZWJncHVWZXJ0ZXhCdWZmZXIgZXh0ZW5kcyBXZWJncHVCdWZmZXIge1xuICAgIGNvbnN0cnVjdG9yKHZlcnRleEJ1ZmZlciwgZm9ybWF0KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgZGVzdHJveShkZXZpY2UpIHtcblxuICAgICAgICBzdXBlci5kZXN0cm95KGRldmljZSk7XG5cbiAgICAgICAgLy8gVE9ETzogY2xlYXIgdXAgYm91bmQgdmVydGV4IGJ1ZmZlcnNcbiAgICB9XG5cbiAgICB1bmxvY2sodmVydGV4QnVmZmVyKSB7XG5cbiAgICAgICAgY29uc3QgZGV2aWNlID0gdmVydGV4QnVmZmVyLmRldmljZTtcbiAgICAgICAgc3VwZXIudW5sb2NrKGRldmljZSwgdmVydGV4QnVmZmVyLnVzYWdlLCBHUFVCdWZmZXJVc2FnZS5WRVJURVgsIHZlcnRleEJ1ZmZlci5zdG9yYWdlKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFdlYmdwdVZlcnRleEJ1ZmZlciB9O1xuIl0sIm5hbWVzIjpbIldlYmdwdVZlcnRleEJ1ZmZlciIsIldlYmdwdUJ1ZmZlciIsImNvbnN0cnVjdG9yIiwidmVydGV4QnVmZmVyIiwiZm9ybWF0IiwiZGVzdHJveSIsImRldmljZSIsInVubG9jayIsInVzYWdlIiwiR1BVQnVmZmVyVXNhZ2UiLCJWRVJURVgiLCJzdG9yYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLGtCQUFrQixTQUFTQyxZQUFZLENBQUM7QUFDMUNDLEVBQUFBLFdBQVdBLENBQUNDLFlBQVksRUFBRUMsTUFBTSxFQUFFO0FBQzlCLElBQUEsS0FBSyxFQUFFLENBQUE7QUFDWCxHQUFBO0VBRUFDLE9BQU9BLENBQUNDLE1BQU0sRUFBRTtBQUVaLElBQUEsS0FBSyxDQUFDRCxPQUFPLENBQUNDLE1BQU0sQ0FBQyxDQUFBOztBQUVyQjtBQUNKLEdBQUE7O0VBRUFDLE1BQU1BLENBQUNKLFlBQVksRUFBRTtBQUVqQixJQUFBLE1BQU1HLE1BQU0sR0FBR0gsWUFBWSxDQUFDRyxNQUFNLENBQUE7QUFDbEMsSUFBQSxLQUFLLENBQUNDLE1BQU0sQ0FBQ0QsTUFBTSxFQUFFSCxZQUFZLENBQUNLLEtBQUssRUFBRUMsY0FBYyxDQUFDQyxNQUFNLEVBQUVQLFlBQVksQ0FBQ1EsT0FBTyxDQUFDLENBQUE7QUFDekYsR0FBQTtBQUNKOzs7OyJ9
