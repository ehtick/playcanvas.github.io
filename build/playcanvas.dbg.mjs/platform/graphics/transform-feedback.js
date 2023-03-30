/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../core/debug.js';
import { BUFFER_GPUDYNAMIC, PRIMITIVE_POINTS } from './constants.js';
import { VertexBuffer } from './vertex-buffer.js';
import { DebugGraphics } from './debug-graphics.js';
import { Shader } from './shader.js';
import { ShaderUtils } from './shader-utils.js';

/**
 * This object allows you to configure and use the transform feedback feature (WebGL2 only). How to
 * use:
 *
 * 1. First, check that you're on WebGL2, by looking at the `app.graphicsDevice.webgl2`` value.
 * 2. Define the outputs in your vertex shader. The syntax is `out vec3 out_vertex_position`,
 * note that there must be out_ in the name. You can then simply assign values to these outputs in
 * VS. The order and size of shader outputs must match the output buffer layout.
 * 3. Create the shader using `TransformFeedback.createShader(device, vsCode, yourShaderName)`.
 * 4. Create/acquire the input vertex buffer. Can be any VertexBuffer, either manually created, or
 * from a Mesh.
 * 5. Create the TransformFeedback object: `var tf = new TransformFeedback(inputBuffer)`. This
 * object will internally create an output buffer.
 * 6. Run the shader: `tf.process(shader)`. Shader will take the input buffer, process it and write
 * to the output buffer, then the input/output buffers will be automatically swapped, so you'll
 * immediately see the result.
 *
 * ```javascript
 * // *** shader asset ***
 * attribute vec3 vertex_position;
 * attribute vec3 vertex_normal;
 * attribute vec2 vertex_texCoord0;
 * out vec3 out_vertex_position;
 * out vec3 out_vertex_normal;
 * out vec2 out_vertex_texCoord0;
 * void main(void) {
 *     // read position and normal, write new position (push away)
 *     out_vertex_position = vertex_position + vertex_normal * 0.01;
 *     // pass other attributes unchanged
 *     out_vertex_normal = vertex_normal;
 *     out_vertex_texCoord0 = vertex_texCoord0;
 * }
 * ```
 *
 * ```javascript
 * // *** script asset ***
 * var TransformExample = pc.createScript('transformExample');
 *
 * // attribute that references shader asset and material
 * TransformExample.attributes.add('shaderCode', { type: 'asset', assetType: 'shader' });
 * TransformExample.attributes.add('material', { type: 'asset', assetType: 'material' });
 *
 * TransformExample.prototype.initialize = function() {
 *     var device = this.app.graphicsDevice;
 *     var mesh = pc.createTorus(device, { tubeRadius: 0.01, ringRadius: 3 });
 *     var meshInstance = new pc.MeshInstance(mesh, this.material.resource);
 *     var entity = new pc.Entity();
 *     entity.addComponent('render', {
 *         type: 'asset',
 *         meshInstances: [meshInstance]
 *     });
 *     app.root.addChild(entity);
 *
 *     // if webgl2 is not supported, transform-feedback is not available
 *     if (!device.webgl2) return;
 *     var inputBuffer = mesh.vertexBuffer;
 *     this.tf = new pc.TransformFeedback(inputBuffer);
 *     this.shader = pc.TransformFeedback.createShader(device, this.shaderCode.resource, "tfMoveUp");
 * };
 *
 * TransformExample.prototype.update = function(dt) {
 *     if (!this.app.graphicsDevice.webgl2) return;
 *     this.tf.process(this.shader);
 * };
 * ```
 */
class TransformFeedback {
  /**
   * Create a new TransformFeedback instance.
   *
   * @param {VertexBuffer} inputBuffer - The input vertex buffer.
   * @param {number} [usage] - The optional usage type of the output vertex buffer. Can be:
   *
   * - {@link BUFFER_STATIC}
   * - {@link BUFFER_DYNAMIC}
   * - {@link BUFFER_STREAM}
   * - {@link BUFFER_GPUDYNAMIC}
   *
   * Defaults to {@link BUFFER_GPUDYNAMIC} (which is recommended for continuous update).
   */
  constructor(inputBuffer, usage = BUFFER_GPUDYNAMIC) {
    this.device = inputBuffer.device;
    const gl = this.device.gl;
    Debug.assert(inputBuffer.format.interleaved || inputBuffer.format.elements.length <= 1, "Vertex buffer used by TransformFeedback needs to be interleaved.");
    this._inputBuffer = inputBuffer;
    if (usage === BUFFER_GPUDYNAMIC && inputBuffer.usage !== usage) {
      // have to recreate input buffer with other usage
      gl.bindBuffer(gl.ARRAY_BUFFER, inputBuffer.impl.bufferId);
      gl.bufferData(gl.ARRAY_BUFFER, inputBuffer.storage, gl.DYNAMIC_COPY);
    }
    this._outputBuffer = new VertexBuffer(inputBuffer.device, inputBuffer.format, inputBuffer.numVertices, usage, inputBuffer.storage);
  }

  /**
   * Creates a transform feedback ready vertex shader from code.
   *
   * @param {import('./graphics-device.js').GraphicsDevice} graphicsDevice - The graphics device
   * used by the renderer.
   * @param {string} vertexCode - Vertex shader code. Should contain output variables starting with "out_".
   * @param {string} name - Unique name for caching the shader.
   * @returns {Shader} A shader to use in the process() function.
   */
  static createShader(graphicsDevice, vertexCode, name) {
    return new Shader(graphicsDevice, ShaderUtils.createDefinition(graphicsDevice, {
      name,
      vertexCode,
      useTransformFeedback: true
    }));
  }

  /**
   * Destroys the transform feedback helper object.
   */
  destroy() {
    this._outputBuffer.destroy();
  }

  /**
   * Runs the specified shader on the input buffer, writes results into the new buffer, then
   * optionally swaps input/output.
   *
   * @param {Shader} shader - A vertex shader to run. Should be created with
   * {@link TransformFeedback.createShader}.
   * @param {boolean} [swap] - Swap input/output buffer data. Useful for continuous buffer
   * processing. Default is true.
   */
  process(shader, swap = true) {
    const device = this.device;
    DebugGraphics.pushGpuMarker(device, "TransformFeedback");
    const oldRt = device.getRenderTarget();
    device.setRenderTarget(null);
    device.updateBegin();
    device.setVertexBuffer(this._inputBuffer, 0);
    device.setRaster(false);
    device.setTransformFeedbackBuffer(this._outputBuffer);
    device.setShader(shader);
    device.draw({
      type: PRIMITIVE_POINTS,
      base: 0,
      count: this._inputBuffer.numVertices,
      indexed: false
    });
    device.setTransformFeedbackBuffer(null);
    device.setRaster(true);
    device.updateEnd();
    device.setRenderTarget(oldRt);
    DebugGraphics.popGpuMarker(device);

    // swap buffers
    if (swap) {
      let tmp = this._inputBuffer.impl.bufferId;
      this._inputBuffer.impl.bufferId = this._outputBuffer.impl.bufferId;
      this._outputBuffer.impl.bufferId = tmp;

      // swap VAO
      tmp = this._inputBuffer.impl.vao;
      this._inputBuffer.impl.vao = this._outputBuffer.impl.vao;
      this._outputBuffer.impl.vao = tmp;
    }
  }

  /**
   * The current input buffer.
   *
   * @type {VertexBuffer}
   */
  get inputBuffer() {
    return this._inputBuffer;
  }

  /**
   * The current output buffer.
   *
   * @type {VertexBuffer}
   */
  get outputBuffer() {
    return this._outputBuffer;
  }
}

export { TransformFeedback };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLWZlZWRiYWNrLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcGxhdGZvcm0vZ3JhcGhpY3MvdHJhbnNmb3JtLWZlZWRiYWNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERlYnVnIH0gZnJvbSAnLi4vLi4vY29yZS9kZWJ1Zy5qcyc7XG5cbmltcG9ydCB7IEJVRkZFUl9HUFVEWU5BTUlDLCBQUklNSVRJVkVfUE9JTlRTIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgVmVydGV4QnVmZmVyIH0gZnJvbSAnLi92ZXJ0ZXgtYnVmZmVyLmpzJztcbmltcG9ydCB7IERlYnVnR3JhcGhpY3MgfSBmcm9tICcuL2RlYnVnLWdyYXBoaWNzLmpzJztcbmltcG9ydCB7IFNoYWRlciB9IGZyb20gJy4vc2hhZGVyLmpzJztcbmltcG9ydCB7IFNoYWRlclV0aWxzIH0gZnJvbSAnLi9zaGFkZXItdXRpbHMuanMnO1xuXG4vKipcbiAqIFRoaXMgb2JqZWN0IGFsbG93cyB5b3UgdG8gY29uZmlndXJlIGFuZCB1c2UgdGhlIHRyYW5zZm9ybSBmZWVkYmFjayBmZWF0dXJlIChXZWJHTDIgb25seSkuIEhvdyB0b1xuICogdXNlOlxuICpcbiAqIDEuIEZpcnN0LCBjaGVjayB0aGF0IHlvdSdyZSBvbiBXZWJHTDIsIGJ5IGxvb2tpbmcgYXQgdGhlIGBhcHAuZ3JhcGhpY3NEZXZpY2Uud2ViZ2wyYGAgdmFsdWUuXG4gKiAyLiBEZWZpbmUgdGhlIG91dHB1dHMgaW4geW91ciB2ZXJ0ZXggc2hhZGVyLiBUaGUgc3ludGF4IGlzIGBvdXQgdmVjMyBvdXRfdmVydGV4X3Bvc2l0aW9uYCxcbiAqIG5vdGUgdGhhdCB0aGVyZSBtdXN0IGJlIG91dF8gaW4gdGhlIG5hbWUuIFlvdSBjYW4gdGhlbiBzaW1wbHkgYXNzaWduIHZhbHVlcyB0byB0aGVzZSBvdXRwdXRzIGluXG4gKiBWUy4gVGhlIG9yZGVyIGFuZCBzaXplIG9mIHNoYWRlciBvdXRwdXRzIG11c3QgbWF0Y2ggdGhlIG91dHB1dCBidWZmZXIgbGF5b3V0LlxuICogMy4gQ3JlYXRlIHRoZSBzaGFkZXIgdXNpbmcgYFRyYW5zZm9ybUZlZWRiYWNrLmNyZWF0ZVNoYWRlcihkZXZpY2UsIHZzQ29kZSwgeW91clNoYWRlck5hbWUpYC5cbiAqIDQuIENyZWF0ZS9hY3F1aXJlIHRoZSBpbnB1dCB2ZXJ0ZXggYnVmZmVyLiBDYW4gYmUgYW55IFZlcnRleEJ1ZmZlciwgZWl0aGVyIG1hbnVhbGx5IGNyZWF0ZWQsIG9yXG4gKiBmcm9tIGEgTWVzaC5cbiAqIDUuIENyZWF0ZSB0aGUgVHJhbnNmb3JtRmVlZGJhY2sgb2JqZWN0OiBgdmFyIHRmID0gbmV3IFRyYW5zZm9ybUZlZWRiYWNrKGlucHV0QnVmZmVyKWAuIFRoaXNcbiAqIG9iamVjdCB3aWxsIGludGVybmFsbHkgY3JlYXRlIGFuIG91dHB1dCBidWZmZXIuXG4gKiA2LiBSdW4gdGhlIHNoYWRlcjogYHRmLnByb2Nlc3Moc2hhZGVyKWAuIFNoYWRlciB3aWxsIHRha2UgdGhlIGlucHV0IGJ1ZmZlciwgcHJvY2VzcyBpdCBhbmQgd3JpdGVcbiAqIHRvIHRoZSBvdXRwdXQgYnVmZmVyLCB0aGVuIHRoZSBpbnB1dC9vdXRwdXQgYnVmZmVycyB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgc3dhcHBlZCwgc28geW91J2xsXG4gKiBpbW1lZGlhdGVseSBzZWUgdGhlIHJlc3VsdC5cbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiAvLyAqKiogc2hhZGVyIGFzc2V0ICoqKlxuICogYXR0cmlidXRlIHZlYzMgdmVydGV4X3Bvc2l0aW9uO1xuICogYXR0cmlidXRlIHZlYzMgdmVydGV4X25vcm1hbDtcbiAqIGF0dHJpYnV0ZSB2ZWMyIHZlcnRleF90ZXhDb29yZDA7XG4gKiBvdXQgdmVjMyBvdXRfdmVydGV4X3Bvc2l0aW9uO1xuICogb3V0IHZlYzMgb3V0X3ZlcnRleF9ub3JtYWw7XG4gKiBvdXQgdmVjMiBvdXRfdmVydGV4X3RleENvb3JkMDtcbiAqIHZvaWQgbWFpbih2b2lkKSB7XG4gKiAgICAgLy8gcmVhZCBwb3NpdGlvbiBhbmQgbm9ybWFsLCB3cml0ZSBuZXcgcG9zaXRpb24gKHB1c2ggYXdheSlcbiAqICAgICBvdXRfdmVydGV4X3Bvc2l0aW9uID0gdmVydGV4X3Bvc2l0aW9uICsgdmVydGV4X25vcm1hbCAqIDAuMDE7XG4gKiAgICAgLy8gcGFzcyBvdGhlciBhdHRyaWJ1dGVzIHVuY2hhbmdlZFxuICogICAgIG91dF92ZXJ0ZXhfbm9ybWFsID0gdmVydGV4X25vcm1hbDtcbiAqICAgICBvdXRfdmVydGV4X3RleENvb3JkMCA9IHZlcnRleF90ZXhDb29yZDA7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiAvLyAqKiogc2NyaXB0IGFzc2V0ICoqKlxuICogdmFyIFRyYW5zZm9ybUV4YW1wbGUgPSBwYy5jcmVhdGVTY3JpcHQoJ3RyYW5zZm9ybUV4YW1wbGUnKTtcbiAqXG4gKiAvLyBhdHRyaWJ1dGUgdGhhdCByZWZlcmVuY2VzIHNoYWRlciBhc3NldCBhbmQgbWF0ZXJpYWxcbiAqIFRyYW5zZm9ybUV4YW1wbGUuYXR0cmlidXRlcy5hZGQoJ3NoYWRlckNvZGUnLCB7IHR5cGU6ICdhc3NldCcsIGFzc2V0VHlwZTogJ3NoYWRlcicgfSk7XG4gKiBUcmFuc2Zvcm1FeGFtcGxlLmF0dHJpYnV0ZXMuYWRkKCdtYXRlcmlhbCcsIHsgdHlwZTogJ2Fzc2V0JywgYXNzZXRUeXBlOiAnbWF0ZXJpYWwnIH0pO1xuICpcbiAqIFRyYW5zZm9ybUV4YW1wbGUucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAqICAgICB2YXIgZGV2aWNlID0gdGhpcy5hcHAuZ3JhcGhpY3NEZXZpY2U7XG4gKiAgICAgdmFyIG1lc2ggPSBwYy5jcmVhdGVUb3J1cyhkZXZpY2UsIHsgdHViZVJhZGl1czogMC4wMSwgcmluZ1JhZGl1czogMyB9KTtcbiAqICAgICB2YXIgbWVzaEluc3RhbmNlID0gbmV3IHBjLk1lc2hJbnN0YW5jZShtZXNoLCB0aGlzLm1hdGVyaWFsLnJlc291cmNlKTtcbiAqICAgICB2YXIgZW50aXR5ID0gbmV3IHBjLkVudGl0eSgpO1xuICogICAgIGVudGl0eS5hZGRDb21wb25lbnQoJ3JlbmRlcicsIHtcbiAqICAgICAgICAgdHlwZTogJ2Fzc2V0JyxcbiAqICAgICAgICAgbWVzaEluc3RhbmNlczogW21lc2hJbnN0YW5jZV1cbiAqICAgICB9KTtcbiAqICAgICBhcHAucm9vdC5hZGRDaGlsZChlbnRpdHkpO1xuICpcbiAqICAgICAvLyBpZiB3ZWJnbDIgaXMgbm90IHN1cHBvcnRlZCwgdHJhbnNmb3JtLWZlZWRiYWNrIGlzIG5vdCBhdmFpbGFibGVcbiAqICAgICBpZiAoIWRldmljZS53ZWJnbDIpIHJldHVybjtcbiAqICAgICB2YXIgaW5wdXRCdWZmZXIgPSBtZXNoLnZlcnRleEJ1ZmZlcjtcbiAqICAgICB0aGlzLnRmID0gbmV3IHBjLlRyYW5zZm9ybUZlZWRiYWNrKGlucHV0QnVmZmVyKTtcbiAqICAgICB0aGlzLnNoYWRlciA9IHBjLlRyYW5zZm9ybUZlZWRiYWNrLmNyZWF0ZVNoYWRlcihkZXZpY2UsIHRoaXMuc2hhZGVyQ29kZS5yZXNvdXJjZSwgXCJ0Zk1vdmVVcFwiKTtcbiAqIH07XG4gKlxuICogVHJhbnNmb3JtRXhhbXBsZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcbiAqICAgICBpZiAoIXRoaXMuYXBwLmdyYXBoaWNzRGV2aWNlLndlYmdsMikgcmV0dXJuO1xuICogICAgIHRoaXMudGYucHJvY2Vzcyh0aGlzLnNoYWRlcik7XG4gKiB9O1xuICogYGBgXG4gKi9cbmNsYXNzIFRyYW5zZm9ybUZlZWRiYWNrIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgVHJhbnNmb3JtRmVlZGJhY2sgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1ZlcnRleEJ1ZmZlcn0gaW5wdXRCdWZmZXIgLSBUaGUgaW5wdXQgdmVydGV4IGJ1ZmZlci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3VzYWdlXSAtIFRoZSBvcHRpb25hbCB1c2FnZSB0eXBlIG9mIHRoZSBvdXRwdXQgdmVydGV4IGJ1ZmZlci4gQ2FuIGJlOlxuICAgICAqXG4gICAgICogLSB7QGxpbmsgQlVGRkVSX1NUQVRJQ31cbiAgICAgKiAtIHtAbGluayBCVUZGRVJfRFlOQU1JQ31cbiAgICAgKiAtIHtAbGluayBCVUZGRVJfU1RSRUFNfVxuICAgICAqIC0ge0BsaW5rIEJVRkZFUl9HUFVEWU5BTUlDfVxuICAgICAqXG4gICAgICogRGVmYXVsdHMgdG8ge0BsaW5rIEJVRkZFUl9HUFVEWU5BTUlDfSAod2hpY2ggaXMgcmVjb21tZW5kZWQgZm9yIGNvbnRpbnVvdXMgdXBkYXRlKS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihpbnB1dEJ1ZmZlciwgdXNhZ2UgPSBCVUZGRVJfR1BVRFlOQU1JQykge1xuICAgICAgICB0aGlzLmRldmljZSA9IGlucHV0QnVmZmVyLmRldmljZTtcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmRldmljZS5nbDtcblxuICAgICAgICBEZWJ1Zy5hc3NlcnQoaW5wdXRCdWZmZXIuZm9ybWF0LmludGVybGVhdmVkIHx8IGlucHV0QnVmZmVyLmZvcm1hdC5lbGVtZW50cy5sZW5ndGggPD0gMSxcbiAgICAgICAgICAgICAgICAgICAgIFwiVmVydGV4IGJ1ZmZlciB1c2VkIGJ5IFRyYW5zZm9ybUZlZWRiYWNrIG5lZWRzIHRvIGJlIGludGVybGVhdmVkLlwiKTtcblxuICAgICAgICB0aGlzLl9pbnB1dEJ1ZmZlciA9IGlucHV0QnVmZmVyO1xuICAgICAgICBpZiAodXNhZ2UgPT09IEJVRkZFUl9HUFVEWU5BTUlDICYmIGlucHV0QnVmZmVyLnVzYWdlICE9PSB1c2FnZSkge1xuICAgICAgICAgICAgLy8gaGF2ZSB0byByZWNyZWF0ZSBpbnB1dCBidWZmZXIgd2l0aCBvdGhlciB1c2FnZVxuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGlucHV0QnVmZmVyLmltcGwuYnVmZmVySWQpO1xuICAgICAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIGlucHV0QnVmZmVyLnN0b3JhZ2UsIGdsLkRZTkFNSUNfQ09QWSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9vdXRwdXRCdWZmZXIgPSBuZXcgVmVydGV4QnVmZmVyKGlucHV0QnVmZmVyLmRldmljZSwgaW5wdXRCdWZmZXIuZm9ybWF0LCBpbnB1dEJ1ZmZlci5udW1WZXJ0aWNlcywgdXNhZ2UsIGlucHV0QnVmZmVyLnN0b3JhZ2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSB0cmFuc2Zvcm0gZmVlZGJhY2sgcmVhZHkgdmVydGV4IHNoYWRlciBmcm9tIGNvZGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi9ncmFwaGljcy1kZXZpY2UuanMnKS5HcmFwaGljc0RldmljZX0gZ3JhcGhpY3NEZXZpY2UgLSBUaGUgZ3JhcGhpY3MgZGV2aWNlXG4gICAgICogdXNlZCBieSB0aGUgcmVuZGVyZXIuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZlcnRleENvZGUgLSBWZXJ0ZXggc2hhZGVyIGNvZGUuIFNob3VsZCBjb250YWluIG91dHB1dCB2YXJpYWJsZXMgc3RhcnRpbmcgd2l0aCBcIm91dF9cIi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFVuaXF1ZSBuYW1lIGZvciBjYWNoaW5nIHRoZSBzaGFkZXIuXG4gICAgICogQHJldHVybnMge1NoYWRlcn0gQSBzaGFkZXIgdG8gdXNlIGluIHRoZSBwcm9jZXNzKCkgZnVuY3Rpb24uXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZVNoYWRlcihncmFwaGljc0RldmljZSwgdmVydGV4Q29kZSwgbmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IFNoYWRlcihncmFwaGljc0RldmljZSwgU2hhZGVyVXRpbHMuY3JlYXRlRGVmaW5pdGlvbihncmFwaGljc0RldmljZSwge1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIHZlcnRleENvZGUsXG4gICAgICAgICAgICB1c2VUcmFuc2Zvcm1GZWVkYmFjazogdHJ1ZVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVzdHJveXMgdGhlIHRyYW5zZm9ybSBmZWVkYmFjayBoZWxwZXIgb2JqZWN0LlxuICAgICAqL1xuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuX291dHB1dEJ1ZmZlci5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB0aGUgc3BlY2lmaWVkIHNoYWRlciBvbiB0aGUgaW5wdXQgYnVmZmVyLCB3cml0ZXMgcmVzdWx0cyBpbnRvIHRoZSBuZXcgYnVmZmVyLCB0aGVuXG4gICAgICogb3B0aW9uYWxseSBzd2FwcyBpbnB1dC9vdXRwdXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1NoYWRlcn0gc2hhZGVyIC0gQSB2ZXJ0ZXggc2hhZGVyIHRvIHJ1bi4gU2hvdWxkIGJlIGNyZWF0ZWQgd2l0aFxuICAgICAqIHtAbGluayBUcmFuc2Zvcm1GZWVkYmFjay5jcmVhdGVTaGFkZXJ9LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3N3YXBdIC0gU3dhcCBpbnB1dC9vdXRwdXQgYnVmZmVyIGRhdGEuIFVzZWZ1bCBmb3IgY29udGludW91cyBidWZmZXJcbiAgICAgKiBwcm9jZXNzaW5nLiBEZWZhdWx0IGlzIHRydWUuXG4gICAgICovXG4gICAgcHJvY2VzcyhzaGFkZXIsIHN3YXAgPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IGRldmljZSA9IHRoaXMuZGV2aWNlO1xuXG4gICAgICAgIERlYnVnR3JhcGhpY3MucHVzaEdwdU1hcmtlcihkZXZpY2UsIFwiVHJhbnNmb3JtRmVlZGJhY2tcIik7XG5cbiAgICAgICAgY29uc3Qgb2xkUnQgPSBkZXZpY2UuZ2V0UmVuZGVyVGFyZ2V0KCk7XG4gICAgICAgIGRldmljZS5zZXRSZW5kZXJUYXJnZXQobnVsbCk7XG4gICAgICAgIGRldmljZS51cGRhdGVCZWdpbigpO1xuICAgICAgICBkZXZpY2Uuc2V0VmVydGV4QnVmZmVyKHRoaXMuX2lucHV0QnVmZmVyLCAwKTtcbiAgICAgICAgZGV2aWNlLnNldFJhc3RlcihmYWxzZSk7XG4gICAgICAgIGRldmljZS5zZXRUcmFuc2Zvcm1GZWVkYmFja0J1ZmZlcih0aGlzLl9vdXRwdXRCdWZmZXIpO1xuICAgICAgICBkZXZpY2Uuc2V0U2hhZGVyKHNoYWRlcik7XG4gICAgICAgIGRldmljZS5kcmF3KHtcbiAgICAgICAgICAgIHR5cGU6IFBSSU1JVElWRV9QT0lOVFMsXG4gICAgICAgICAgICBiYXNlOiAwLFxuICAgICAgICAgICAgY291bnQ6IHRoaXMuX2lucHV0QnVmZmVyLm51bVZlcnRpY2VzLFxuICAgICAgICAgICAgaW5kZXhlZDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIGRldmljZS5zZXRUcmFuc2Zvcm1GZWVkYmFja0J1ZmZlcihudWxsKTtcbiAgICAgICAgZGV2aWNlLnNldFJhc3Rlcih0cnVlKTtcbiAgICAgICAgZGV2aWNlLnVwZGF0ZUVuZCgpO1xuICAgICAgICBkZXZpY2Uuc2V0UmVuZGVyVGFyZ2V0KG9sZFJ0KTtcblxuICAgICAgICBEZWJ1Z0dyYXBoaWNzLnBvcEdwdU1hcmtlcihkZXZpY2UpO1xuXG4gICAgICAgIC8vIHN3YXAgYnVmZmVyc1xuICAgICAgICBpZiAoc3dhcCkge1xuICAgICAgICAgICAgbGV0IHRtcCA9IHRoaXMuX2lucHV0QnVmZmVyLmltcGwuYnVmZmVySWQ7XG4gICAgICAgICAgICB0aGlzLl9pbnB1dEJ1ZmZlci5pbXBsLmJ1ZmZlcklkID0gdGhpcy5fb3V0cHV0QnVmZmVyLmltcGwuYnVmZmVySWQ7XG4gICAgICAgICAgICB0aGlzLl9vdXRwdXRCdWZmZXIuaW1wbC5idWZmZXJJZCA9IHRtcDtcblxuICAgICAgICAgICAgLy8gc3dhcCBWQU9cbiAgICAgICAgICAgIHRtcCA9IHRoaXMuX2lucHV0QnVmZmVyLmltcGwudmFvO1xuICAgICAgICAgICAgdGhpcy5faW5wdXRCdWZmZXIuaW1wbC52YW8gPSB0aGlzLl9vdXRwdXRCdWZmZXIuaW1wbC52YW87XG4gICAgICAgICAgICB0aGlzLl9vdXRwdXRCdWZmZXIuaW1wbC52YW8gPSB0bXA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudCBpbnB1dCBidWZmZXIuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7VmVydGV4QnVmZmVyfVxuICAgICAqL1xuICAgIGdldCBpbnB1dEJ1ZmZlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lucHV0QnVmZmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IG91dHB1dCBidWZmZXIuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7VmVydGV4QnVmZmVyfVxuICAgICAqL1xuICAgIGdldCBvdXRwdXRCdWZmZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vdXRwdXRCdWZmZXI7XG4gICAgfVxufVxuXG5leHBvcnQgeyBUcmFuc2Zvcm1GZWVkYmFjayB9O1xuIl0sIm5hbWVzIjpbIlRyYW5zZm9ybUZlZWRiYWNrIiwiY29uc3RydWN0b3IiLCJpbnB1dEJ1ZmZlciIsInVzYWdlIiwiQlVGRkVSX0dQVURZTkFNSUMiLCJkZXZpY2UiLCJnbCIsIkRlYnVnIiwiYXNzZXJ0IiwiZm9ybWF0IiwiaW50ZXJsZWF2ZWQiLCJlbGVtZW50cyIsImxlbmd0aCIsIl9pbnB1dEJ1ZmZlciIsImJpbmRCdWZmZXIiLCJBUlJBWV9CVUZGRVIiLCJpbXBsIiwiYnVmZmVySWQiLCJidWZmZXJEYXRhIiwic3RvcmFnZSIsIkRZTkFNSUNfQ09QWSIsIl9vdXRwdXRCdWZmZXIiLCJWZXJ0ZXhCdWZmZXIiLCJudW1WZXJ0aWNlcyIsImNyZWF0ZVNoYWRlciIsImdyYXBoaWNzRGV2aWNlIiwidmVydGV4Q29kZSIsIm5hbWUiLCJTaGFkZXIiLCJTaGFkZXJVdGlscyIsImNyZWF0ZURlZmluaXRpb24iLCJ1c2VUcmFuc2Zvcm1GZWVkYmFjayIsImRlc3Ryb3kiLCJwcm9jZXNzIiwic2hhZGVyIiwic3dhcCIsIkRlYnVnR3JhcGhpY3MiLCJwdXNoR3B1TWFya2VyIiwib2xkUnQiLCJnZXRSZW5kZXJUYXJnZXQiLCJzZXRSZW5kZXJUYXJnZXQiLCJ1cGRhdGVCZWdpbiIsInNldFZlcnRleEJ1ZmZlciIsInNldFJhc3RlciIsInNldFRyYW5zZm9ybUZlZWRiYWNrQnVmZmVyIiwic2V0U2hhZGVyIiwiZHJhdyIsInR5cGUiLCJQUklNSVRJVkVfUE9JTlRTIiwiYmFzZSIsImNvdW50IiwiaW5kZXhlZCIsInVwZGF0ZUVuZCIsInBvcEdwdU1hcmtlciIsInRtcCIsInZhbyIsIm91dHB1dEJ1ZmZlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUEsaUJBQWlCLENBQUM7QUFDcEI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSUMsRUFBQUEsV0FBV0EsQ0FBQ0MsV0FBVyxFQUFFQyxLQUFLLEdBQUdDLGlCQUFpQixFQUFFO0FBQ2hELElBQUEsSUFBSSxDQUFDQyxNQUFNLEdBQUdILFdBQVcsQ0FBQ0csTUFBTSxDQUFBO0FBQ2hDLElBQUEsTUFBTUMsRUFBRSxHQUFHLElBQUksQ0FBQ0Qs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
