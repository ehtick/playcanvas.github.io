import { semanticToLocation, TYPE_INT8, TYPE_UINT8, TYPE_INT16, TYPE_UINT16, TYPE_INT32, TYPE_UINT32, TYPE_FLOAT32 } from '../constants.js';

// map of TYPE_*** to GPUVertexFormat
const gpuVertexFormats = [];
gpuVertexFormats[TYPE_INT8] = 'sint8';
gpuVertexFormats[TYPE_UINT8] = 'uint8';
gpuVertexFormats[TYPE_INT16] = 'sint16';
gpuVertexFormats[TYPE_UINT16] = 'uint16';
gpuVertexFormats[TYPE_INT32] = 'sint32';
gpuVertexFormats[TYPE_UINT32] = 'uint32';
gpuVertexFormats[TYPE_FLOAT32] = 'float32';
const gpuVertexFormatsNormalized = [];
gpuVertexFormatsNormalized[TYPE_INT8] = 'snorm8';
gpuVertexFormatsNormalized[TYPE_UINT8] = 'unorm8';
gpuVertexFormatsNormalized[TYPE_INT16] = 'snorm16';
gpuVertexFormatsNormalized[TYPE_UINT16] = 'unorm16';
gpuVertexFormatsNormalized[TYPE_INT32] = 'sint32'; // there is no 32bit normalized signed int
gpuVertexFormatsNormalized[TYPE_UINT32] = 'uint32'; // there is no 32bit normalized unsigned int
gpuVertexFormatsNormalized[TYPE_FLOAT32] = 'float32'; // there is no 32bit normalized float

/**
 * @ignore
 */
class WebgpuVertexBufferLayout {
  constructor() {
    /**
     * @type {Map<string, GPUVertexBufferLayout[]>}
     * @private
     */
    this.cache = new Map();
  }
  /**
   * Obtain a vertex layout of one or two vertex formats.
   *
   * @param {import('../vertex-format.js').VertexFormat} vertexFormat0 - The first vertex format.
   * @param {import('../vertex-format.js').VertexFormat} [vertexFormat1] - The second vertex format.
   * @returns {any[]} - The vertex layout.
   */
  get(vertexFormat0, vertexFormat1 = null) {
    const key = this.getKey(vertexFormat0, vertexFormat1);
    let layout = this.cache.get(key);
    if (!layout) {
      layout = this.create(vertexFormat0, vertexFormat1);
      this.cache.set(key, layout);
    }
    return layout;
  }
  getKey(vertexFormat0, vertexFormat1 = null) {
    return `VB[${vertexFormat0 == null ? void 0 : vertexFormat0.renderingHashString}, ${vertexFormat1 == null ? void 0 : vertexFormat1.renderingHashString}]`;
  }

  /**
   * @param {import('../vertex-format.js').VertexFormat} vertexFormat0 - The first vertex format.
   * @param {import('../vertex-format.js').VertexFormat} vertexFormat1 - The second vertex format.
   * @returns {any[]} - The vertex buffer layout.
   */
  create(vertexFormat0, vertexFormat1) {
    // type  {GPUVertexBufferLayout[]}
    const layout = [];
    const addFormat = format => {
      const interleaved = format.interleaved;
      const stepMode = format.instancing ? 'instance' : 'vertex';
      let attributes = [];
      const elementCount = format.elements.length;
      for (let i = 0; i < elementCount; i++) {
        const element = format.elements[i];
        const location = semanticToLocation[element.name];
        const formatTable = element.normalize ? gpuVertexFormatsNormalized : gpuVertexFormats;
        attributes.push({
          shaderLocation: location,
          offset: interleaved ? element.offset : 0,
          format: `${formatTable[element.dataType]}${element.numComponents > 1 ? 'x' + element.numComponents : ''}`
        });
        if (!interleaved || i === elementCount - 1) {
          layout.push({
            attributes: attributes,
            arrayStride: element.stride,
            stepMode: stepMode
          });
          attributes = [];
        }
      }
    };
    if (vertexFormat0) addFormat(vertexFormat0);
    if (vertexFormat1) addFormat(vertexFormat1);
    return layout;
  }
}

export { WebgpuVertexBufferLayout };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ3B1LXZlcnRleC1idWZmZXItbGF5b3V0LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvcGxhdGZvcm0vZ3JhcGhpY3Mvd2ViZ3B1L3dlYmdwdS12ZXJ0ZXgtYnVmZmVyLWxheW91dC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIHNlbWFudGljVG9Mb2NhdGlvbixcbiAgICBUWVBFX0lOVDgsIFRZUEVfVUlOVDgsIFRZUEVfSU5UMTYsIFRZUEVfVUlOVDE2LCBUWVBFX0lOVDMyLCBUWVBFX1VJTlQzMiwgVFlQRV9GTE9BVDMyXG59IGZyb20gJy4uL2NvbnN0YW50cy5qcyc7XG5cbi8vIG1hcCBvZiBUWVBFXyoqKiB0byBHUFVWZXJ0ZXhGb3JtYXRcbmNvbnN0IGdwdVZlcnRleEZvcm1hdHMgPSBbXTtcbmdwdVZlcnRleEZvcm1hdHNbVFlQRV9JTlQ4XSA9ICdzaW50OCc7XG5ncHVWZXJ0ZXhGb3JtYXRzW1RZUEVfVUlOVDhdID0gJ3VpbnQ4JztcbmdwdVZlcnRleEZvcm1hdHNbVFlQRV9JTlQxNl0gPSAnc2ludDE2JztcbmdwdVZlcnRleEZvcm1hdHNbVFlQRV9VSU5UMTZdID0gJ3VpbnQxNic7XG5ncHVWZXJ0ZXhGb3JtYXRzW1RZUEVfSU5UMzJdID0gJ3NpbnQzMic7XG5ncHVWZXJ0ZXhGb3JtYXRzW1RZUEVfVUlOVDMyXSA9ICd1aW50MzInO1xuZ3B1VmVydGV4Rm9ybWF0c1tUWVBFX0ZMT0FUMzJdID0gJ2Zsb2F0MzInO1xuXG5jb25zdCBncHVWZXJ0ZXhGb3JtYXRzTm9ybWFsaXplZCA9IFtdO1xuZ3B1VmVydGV4Rm9ybWF0c05vcm1hbGl6ZWRbVFlQRV9JTlQ4XSA9ICdzbm9ybTgnO1xuZ3B1VmVydGV4Rm9ybWF0c05vcm1hbGl6ZWRbVFlQRV9VSU5UOF0gPSAndW5vcm04JztcbmdwdVZlcnRleEZvcm1hdHNOb3JtYWxpemVkW1RZUEVfSU5UMTZdID0gJ3Nub3JtMTYnO1xuZ3B1VmVydGV4Rm9ybWF0c05vcm1hbGl6ZWRbVFlQRV9VSU5UMTZdID0gJ3Vub3JtMTYnO1xuZ3B1VmVydGV4Rm9ybWF0c05vcm1hbGl6ZWRbVFlQRV9JTlQzMl0gPSAnc2ludDMyJzsgICAgIC8vIHRoZXJlIGlzIG5vIDMyYml0IG5vcm1hbGl6ZWQgc2lnbmVkIGludFxuZ3B1VmVydGV4Rm9ybWF0c05vcm1hbGl6ZWRbVFlQRV9VSU5UMzJdID0gJ3VpbnQzMic7ICAgIC8vIHRoZXJlIGlzIG5vIDMyYml0IG5vcm1hbGl6ZWQgdW5zaWduZWQgaW50XG5ncHVWZXJ0ZXhGb3JtYXRzTm9ybWFsaXplZFtUWVBFX0ZMT0FUMzJdID0gJ2Zsb2F0MzInOyAgLy8gdGhlcmUgaXMgbm8gMzJiaXQgbm9ybWFsaXplZCBmbG9hdFxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgV2ViZ3B1VmVydGV4QnVmZmVyTGF5b3V0IHtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TWFwPHN0cmluZywgR1BVVmVydGV4QnVmZmVyTGF5b3V0W10+fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgY2FjaGUgPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBPYnRhaW4gYSB2ZXJ0ZXggbGF5b3V0IG9mIG9uZSBvciB0d28gdmVydGV4IGZvcm1hdHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vdmVydGV4LWZvcm1hdC5qcycpLlZlcnRleEZvcm1hdH0gdmVydGV4Rm9ybWF0MCAtIFRoZSBmaXJzdCB2ZXJ0ZXggZm9ybWF0LlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi92ZXJ0ZXgtZm9ybWF0LmpzJykuVmVydGV4Rm9ybWF0fSBbdmVydGV4Rm9ybWF0MV0gLSBUaGUgc2Vjb25kIHZlcnRleCBmb3JtYXQuXG4gICAgICogQHJldHVybnMge2FueVtdfSAtIFRoZSB2ZXJ0ZXggbGF5b3V0LlxuICAgICAqL1xuICAgIGdldCh2ZXJ0ZXhGb3JtYXQwLCB2ZXJ0ZXhGb3JtYXQxID0gbnVsbCkge1xuXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0S2V5KHZlcnRleEZvcm1hdDAsIHZlcnRleEZvcm1hdDEpO1xuICAgICAgICBsZXQgbGF5b3V0ID0gdGhpcy5jYWNoZS5nZXQoa2V5KTtcbiAgICAgICAgaWYgKCFsYXlvdXQpIHtcbiAgICAgICAgICAgIGxheW91dCA9IHRoaXMuY3JlYXRlKHZlcnRleEZvcm1hdDAsIHZlcnRleEZvcm1hdDEpO1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5zZXQoa2V5LCBsYXlvdXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYXlvdXQ7XG4gICAgfVxuXG4gICAgZ2V0S2V5KHZlcnRleEZvcm1hdDAsIHZlcnRleEZvcm1hdDEgPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBgVkJbJHt2ZXJ0ZXhGb3JtYXQwPy5yZW5kZXJpbmdIYXNoU3RyaW5nfSwgJHt2ZXJ0ZXhGb3JtYXQxPy5yZW5kZXJpbmdIYXNoU3RyaW5nfV1gO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi92ZXJ0ZXgtZm9ybWF0LmpzJykuVmVydGV4Rm9ybWF0fSB2ZXJ0ZXhGb3JtYXQwIC0gVGhlIGZpcnN0IHZlcnRleCBmb3JtYXQuXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4uL3ZlcnRleC1mb3JtYXQuanMnKS5WZXJ0ZXhGb3JtYXR9IHZlcnRleEZvcm1hdDEgLSBUaGUgc2Vjb25kIHZlcnRleCBmb3JtYXQuXG4gICAgICogQHJldHVybnMge2FueVtdfSAtIFRoZSB2ZXJ0ZXggYnVmZmVyIGxheW91dC5cbiAgICAgKi9cbiAgICBjcmVhdGUodmVydGV4Rm9ybWF0MCwgdmVydGV4Rm9ybWF0MSkge1xuXG4gICAgICAgIC8vIHR5cGUgIHtHUFVWZXJ0ZXhCdWZmZXJMYXlvdXRbXX1cbiAgICAgICAgY29uc3QgbGF5b3V0ID0gW107XG5cbiAgICAgICAgY29uc3QgYWRkRm9ybWF0ID0gKGZvcm1hdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW50ZXJsZWF2ZWQgPSBmb3JtYXQuaW50ZXJsZWF2ZWQ7XG4gICAgICAgICAgICBjb25zdCBzdGVwTW9kZSA9IGZvcm1hdC5pbnN0YW5jaW5nID8gJ2luc3RhbmNlJyA6ICd2ZXJ0ZXgnO1xuICAgICAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRDb3VudCA9IGZvcm1hdC5lbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGZvcm1hdC5lbGVtZW50c1tpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHNlbWFudGljVG9Mb2NhdGlvbltlbGVtZW50Lm5hbWVdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZvcm1hdFRhYmxlID0gZWxlbWVudC5ub3JtYWxpemUgPyBncHVWZXJ0ZXhGb3JtYXRzTm9ybWFsaXplZCA6IGdwdVZlcnRleEZvcm1hdHM7XG5cbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBzaGFkZXJMb2NhdGlvbjogbG9jYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogaW50ZXJsZWF2ZWQgPyBlbGVtZW50Lm9mZnNldCA6IDAsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdDogYCR7Zm9ybWF0VGFibGVbZWxlbWVudC5kYXRhVHlwZV19JHtlbGVtZW50Lm51bUNvbXBvbmVudHMgPiAxID8gJ3gnICsgZWxlbWVudC5udW1Db21wb25lbnRzIDogJyd9YFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFpbnRlcmxlYXZlZCB8fCBpID09PSBlbGVtZW50Q291bnQgLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGxheW91dC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJheVN0cmlkZTogZWxlbWVudC5zdHJpZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwTW9kZTogc3RlcE1vZGVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHZlcnRleEZvcm1hdDApXG4gICAgICAgICAgICBhZGRGb3JtYXQodmVydGV4Rm9ybWF0MCk7XG5cbiAgICAgICAgaWYgKHZlcnRleEZvcm1hdDEpXG4gICAgICAgICAgICBhZGRGb3JtYXQodmVydGV4Rm9ybWF0MSk7XG5cbiAgICAgICAgcmV0dXJuIGxheW91dDtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFdlYmdwdVZlcnRleEJ1ZmZlckxheW91dCB9O1xuIl0sIm5hbWVzIjpbImdwdVZlcnRleEZvcm1hdHMiLCJUWVBFX0lOVDgiLCJUWVBFX1VJTlQ4IiwiVFlQRV9JTlQxNiIsIlRZUEVfVUlOVDE2IiwiVFlQRV9JTlQzMiIsIlRZUEVfVUlOVDMyIiwiVFlQRV9GTE9BVDMyIiwiZ3B1VmVydGV4Rm9ybWF0c05vcm1hbGl6ZWQiLCJXZWJncHVWZXJ0ZXhCdWZmZXJMYXlvdXQiLCJjb25zdHJ1Y3RvciIsImNhY2hlIiwiTWFwIiwiZ2V0IiwidmVydGV4Rm9ybWF0MCIsInZlcnRleEZvcm1hdDEiLCJrZXkiLCJnZXRLZXkiLCJsYXlvdXQiLCJjcmVhdGUiLCJzZXQiLCJyZW5kZXJpbmdIYXNoU3RyaW5nIiwiYWRkRm9ybWF0IiwiZm9ybWF0IiwiaW50ZXJsZWF2ZWQiLCJzdGVwTW9kZSIsImluc3RhbmNpbmciLCJhdHRyaWJ1dGVzIiwiZWxlbWVudENvdW50IiwiZWxlbWVudHMiLCJsZW5ndGgiLCJpIiwiZWxlbWVudCIsImxvY2F0aW9uIiwic2VtYW50aWNUb0xvY2F0aW9uIiwibmFtZSIsImZvcm1hdFRhYmxlIiwibm9ybWFsaXplIiwicHVzaCIsInNoYWRlckxvY2F0aW9uIiwib2Zmc2V0IiwiZGF0YVR5cGUiLCJudW1Db21wb25lbnRzIiwiYXJyYXlTdHJpZGUiLCJzdHJpZGUiXSwibWFwcGluZ3MiOiI7O0FBS0E7QUFDQSxNQUFNQSxnQkFBZ0IsR0FBRyxFQUFFLENBQUE7QUFDM0JBLGdCQUFnQixDQUFDQyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUE7QUFDckNELGdCQUFnQixDQUFDRSxVQUFVLENBQUMsR0FBRyxPQUFPLENBQUE7QUFDdENGLGdCQUFnQixDQUFDRyxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUE7QUFDdkNILGdCQUFnQixDQUFDSSxXQUFXLENBQUMsR0FBRyxRQUFRLENBQUE7QUFDeENKLGdCQUFnQixDQUFDSyxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUE7QUFDdkNMLGdCQUFnQixDQUFDTSxXQUFXLENBQUMsR0FBRyxRQUFRLENBQUE7QUFDeENOLGdCQUFnQixDQUFDTyxZQUFZLENBQUMsR0FBRyxTQUFTLENBQUE7QUFFMUMsTUFBTUMsMEJBQTBCLEdBQUcsRUFBRSxDQUFBO0FBQ3JDQSwwQkFBMEIsQ0FBQ1AsU0FBUyxDQUFDLEdBQUcsUUFBUSxDQUFBO0FBQ2hETywwQkFBMEIsQ0FBQ04sVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFBO0FBQ2pETSwwQkFBMEIsQ0FBQ0wsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFBO0FBQ2xESywwQkFBMEIsQ0FBQ0osV0FBVyxDQUFDLEdBQUcsU0FBUyxDQUFBO0FBQ25ESSwwQkFBMEIsQ0FBQ0gsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQ2xERywwQkFBMEIsQ0FBQ0YsV0FBVyxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQ25ERSwwQkFBMEIsQ0FBQ0QsWUFBWSxDQUFDLEdBQUcsU0FBUyxDQUFDOztBQUVyRDtBQUNBO0FBQ0E7QUFDQSxNQUFNRSx3QkFBd0IsQ0FBQztFQUFBQyxXQUFBLEdBQUE7QUFDM0I7QUFDSjtBQUNBO0FBQ0E7QUFI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
