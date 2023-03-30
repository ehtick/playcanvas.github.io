/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../core/debug.js';
import { BoundingBox } from '../core/shape/bounding-box.js';
import { BUFFER_STATIC, TYPE_FLOAT32, SEMANTIC_ATTR0 } from '../platform/graphics/constants.js';
import { VertexBuffer } from '../platform/graphics/vertex-buffer.js';
import { VertexFormat } from '../platform/graphics/vertex-format.js';

/**
 * A Morph Target (also known as Blend Shape) contains deformation data to apply to existing mesh.
 * Multiple morph targets can be blended together on a mesh. This is useful for effects that are
 * hard to achieve with conventional animation and skinning.
 */
class MorphTarget {
  /**
   * A used flag. A morph target can be used / owned by the Morph class only one time.
   *
   * @type {boolean}
   */

  /**
   * Create a new MorphTarget instance.
   *
   * @param {object} options - Object for passing optional arguments.
   * @param {ArrayBuffer} options.deltaPositions - An array of 3-dimensional vertex position
   * offsets.
   * @param {number} options.deltaPositionsType - A format to store position offsets inside
   * {@link VertexBuffer}. Defaults to {@link TYPE_FLOAT32} if not provided.
   * @param {ArrayBuffer} [options.deltaNormals] - An array of 3-dimensional vertex normal
   * offsets.
   * @param {number} options.deltaNormalsType - A format to store normal offsets inside
   * {@link VertexBuffer}. Defaults to {@link TYPE_FLOAT32} if not provided.
   * @param {string} [options.name] - Name.
   * @param {BoundingBox} [options.aabb] - Bounding box. Will be automatically generated, if
   * undefined.
   * @param {number} [options.defaultWeight] - Default blend weight to use for this morph target.
   * @param {boolean} [options.preserveData] - When true, the morph target keeps its data passed using the options,
   * allowing the clone operation.
   */
  constructor(options) {
    this.used = false;
    if (arguments.length === 2) {
      Debug.deprecated('Passing graphicsDevice to MorphTarget is deprecated, please remove the parameter.');
      options = arguments[1];
    }
    this.options = options;
    this._name = options.name;
    this._defaultWeight = options.defaultWeight || 0;

    // bounds
    this._aabb = options.aabb;

    // store delta positions, used by aabb evaluation
    this.deltaPositions = options.deltaPositions;
  }
  destroy() {
    var _this$_vertexBufferPo, _this$_vertexBufferNo, _this$texturePosition, _this$textureNormals;
    (_this$_vertexBufferPo = this._vertexBufferPositions) == null ? void 0 : _this$_vertexBufferPo.destroy();
    this._vertexBufferPositions = null;
    (_this$_vertexBufferNo = this._vertexBufferNormals) == null ? void 0 : _this$_vertexBufferNo.destroy();
    this._vertexBufferNormals = null;
    (_this$texturePosition = this.texturePositions) == null ? void 0 : _this$texturePosition.destroy();
    this.texturePositions = null;
    (_this$textureNormals = this.textureNormals) == null ? void 0 : _this$textureNormals.destroy();
    this.textureNormals = null;
  }

  /**
   * The name of the morph target.
   *
   * @type {string}
   */
  get name() {
    return this._name;
  }

  /**
   * The default weight of the morph target.
   *
   * @type {number}
   */
  get defaultWeight() {
    return this._defaultWeight;
  }
  get aabb() {
    // lazy evaluation, which allows us to skip this completely if customAABB is used
    if (!this._aabb) {
      this._aabb = new BoundingBox();
      if (this.deltaPositions) this._aabb.compute(this.deltaPositions);
    }
    return this._aabb;
  }
  get morphPositions() {
    return !!this._vertexBufferPositions || !!this.texturePositions;
  }
  get morphNormals() {
    return !!this._vertexBufferNormals || !!this.textureNormals;
  }

  /**
   * Returns an identical copy of the specified morph target. This can only be used if the morph target
   * was created with options.preserveData set to true.
   *
   * @returns {MorphTarget} A morph target instance containing the result of the cloning.
   */
  clone() {
    Debug.assert(this.options, 'MorphTarget cannot be cloned, was it created with a preserveData option?');
    return new MorphTarget(this.options);
  }
  _postInit() {
    // release original data
    if (!this.options.preserveData) {
      this.options = null;
    }

    // mark it as used
    this.used = true;
  }
  _initVertexBuffers(graphicsDevice) {
    const options = this.options;
    this._vertexBufferPositions = this._createVertexBuffer(graphicsDevice, options.deltaPositions, options.deltaPositionsType);
    this._vertexBufferNormals = this._createVertexBuffer(graphicsDevice, options.deltaNormals, options.deltaNormalsType);

    // access positions from vertex buffer when needed
    if (this._vertexBufferPositions) {
      this.deltaPositions = this._vertexBufferPositions.lock();
    }
  }
  _createVertexBuffer(device, data, dataType = TYPE_FLOAT32) {
    if (data) {
      // create vertex buffer with specified type (or float32), and semantic of ATTR0 which gets replaced at runtime with actual semantic
      const formatDesc = [{
        semantic: SEMANTIC_ATTR0,
        components: 3,
        type: dataType
      }];
      return new VertexBuffer(device, new VertexFormat(device, formatDesc), data.length / 3, BUFFER_STATIC, data);
    }
    return null;
  }
  _setTexture(name, texture) {
    this[name] = texture;
  }
}

export { MorphTarget };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ycGgtdGFyZ2V0LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2NlbmUvbW9ycGgtdGFyZ2V0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERlYnVnIH0gZnJvbSAnLi4vY29yZS9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBCb3VuZGluZ0JveCB9IGZyb20gJy4uL2NvcmUvc2hhcGUvYm91bmRpbmctYm94LmpzJztcblxuaW1wb3J0IHsgQlVGRkVSX1NUQVRJQywgU0VNQU5USUNfQVRUUjAsIFRZUEVfRkxPQVQzMiB9IGZyb20gJy4uL3BsYXRmb3JtL2dyYXBoaWNzL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBWZXJ0ZXhCdWZmZXIgfSBmcm9tICcuLi9wbGF0Zm9ybS9ncmFwaGljcy92ZXJ0ZXgtYnVmZmVyLmpzJztcbmltcG9ydCB7IFZlcnRleEZvcm1hdCB9IGZyb20gJy4uL3BsYXRmb3JtL2dyYXBoaWNzL3ZlcnRleC1mb3JtYXQuanMnO1xuXG4vKipcbiAqIEEgTW9ycGggVGFyZ2V0IChhbHNvIGtub3duIGFzIEJsZW5kIFNoYXBlKSBjb250YWlucyBkZWZvcm1hdGlvbiBkYXRhIHRvIGFwcGx5IHRvIGV4aXN0aW5nIG1lc2guXG4gKiBNdWx0aXBsZSBtb3JwaCB0YXJnZXRzIGNhbiBiZSBibGVuZGVkIHRvZ2V0aGVyIG9uIGEgbWVzaC4gVGhpcyBpcyB1c2VmdWwgZm9yIGVmZmVjdHMgdGhhdCBhcmVcbiAqIGhhcmQgdG8gYWNoaWV2ZSB3aXRoIGNvbnZlbnRpb25hbCBhbmltYXRpb24gYW5kIHNraW5uaW5nLlxuICovXG5jbGFzcyBNb3JwaFRhcmdldCB7XG4gICAgLyoqXG4gICAgICogQSB1c2VkIGZsYWcuIEEgbW9ycGggdGFyZ2V0IGNhbiBiZSB1c2VkIC8gb3duZWQgYnkgdGhlIE1vcnBoIGNsYXNzIG9ubHkgb25lIHRpbWUuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB1c2VkID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgTW9ycGhUYXJnZXQgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIE9iamVjdCBmb3IgcGFzc2luZyBvcHRpb25hbCBhcmd1bWVudHMuXG4gICAgICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gb3B0aW9ucy5kZWx0YVBvc2l0aW9ucyAtIEFuIGFycmF5IG9mIDMtZGltZW5zaW9uYWwgdmVydGV4IHBvc2l0aW9uXG4gICAgICogb2Zmc2V0cy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5kZWx0YVBvc2l0aW9uc1R5cGUgLSBBIGZvcm1hdCB0byBzdG9yZSBwb3NpdGlvbiBvZmZzZXRzIGluc2lkZVxuICAgICAqIHtAbGluayBWZXJ0ZXhCdWZmZXJ9LiBEZWZhdWx0cyB0byB7QGxpbmsgVFlQRV9GTE9BVDMyfSBpZiBub3QgcHJvdmlkZWQuXG4gICAgICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gW29wdGlvbnMuZGVsdGFOb3JtYWxzXSAtIEFuIGFycmF5IG9mIDMtZGltZW5zaW9uYWwgdmVydGV4IG5vcm1hbFxuICAgICAqIG9mZnNldHMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuZGVsdGFOb3JtYWxzVHlwZSAtIEEgZm9ybWF0IHRvIHN0b3JlIG5vcm1hbCBvZmZzZXRzIGluc2lkZVxuICAgICAqIHtAbGluayBWZXJ0ZXhCdWZmZXJ9LiBEZWZhdWx0cyB0byB7QGxpbmsgVFlQRV9GTE9BVDMyfSBpZiBub3QgcHJvdmlkZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm5hbWVdIC0gTmFtZS5cbiAgICAgKiBAcGFyYW0ge0JvdW5kaW5nQm94fSBbb3B0aW9ucy5hYWJiXSAtIEJvdW5kaW5nIGJveC4gV2lsbCBiZSBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCwgaWZcbiAgICAgKiB1bmRlZmluZWQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmRlZmF1bHRXZWlnaHRdIC0gRGVmYXVsdCBibGVuZCB3ZWlnaHQgdG8gdXNlIGZvciB0aGlzIG1vcnBoIHRhcmdldC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnByZXNlcnZlRGF0YV0gLSBXaGVuIHRydWUsIHRoZSBtb3JwaCB0YXJnZXQga2VlcHMgaXRzIGRhdGEgcGFzc2VkIHVzaW5nIHRoZSBvcHRpb25zLFxuICAgICAqIGFsbG93aW5nIHRoZSBjbG9uZSBvcGVyYXRpb24uXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICBEZWJ1Zy5kZXByZWNhdGVkKCdQYXNzaW5nIGdyYXBoaWNzRGV2aWNlIHRvIE1vcnBoVGFyZ2V0IGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSByZW1vdmUgdGhlIHBhcmFtZXRlci4nKTtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBhcmd1bWVudHNbMV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLl9uYW1lID0gb3B0aW9ucy5uYW1lO1xuICAgICAgICB0aGlzLl9kZWZhdWx0V2VpZ2h0ID0gb3B0aW9ucy5kZWZhdWx0V2VpZ2h0IHx8IDA7XG5cbiAgICAgICAgLy8gYm91bmRzXG4gICAgICAgIHRoaXMuX2FhYmIgPSBvcHRpb25zLmFhYmI7XG5cbiAgICAgICAgLy8gc3RvcmUgZGVsdGEgcG9zaXRpb25zLCB1c2VkIGJ5IGFhYmIgZXZhbHVhdGlvblxuICAgICAgICB0aGlzLmRlbHRhUG9zaXRpb25zID0gb3B0aW9ucy5kZWx0YVBvc2l0aW9ucztcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuXG4gICAgICAgIHRoaXMuX3ZlcnRleEJ1ZmZlclBvc2l0aW9ucz8uZGVzdHJveSgpO1xuICAgICAgICB0aGlzLl92ZXJ0ZXhCdWZmZXJQb3NpdGlvbnMgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuX3ZlcnRleEJ1ZmZlck5vcm1hbHM/LmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5fdmVydGV4QnVmZmVyTm9ybWFscyA9IG51bGw7XG5cbiAgICAgICAgdGhpcy50ZXh0dXJlUG9zaXRpb25zPy5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMudGV4dHVyZVBvc2l0aW9ucyA9IG51bGw7XG5cbiAgICAgICAgdGhpcy50ZXh0dXJlTm9ybWFscz8uZGVzdHJveSgpO1xuICAgICAgICB0aGlzLnRleHR1cmVOb3JtYWxzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgbW9ycGggdGFyZ2V0LlxuICAgICAqXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGRlZmF1bHQgd2VpZ2h0IG9mIHRoZSBtb3JwaCB0YXJnZXQuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIGdldCBkZWZhdWx0V2VpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmYXVsdFdlaWdodDtcbiAgICB9XG5cbiAgICBnZXQgYWFiYigpIHtcblxuICAgICAgICAvLyBsYXp5IGV2YWx1YXRpb24sIHdoaWNoIGFsbG93cyB1cyB0byBza2lwIHRoaXMgY29tcGxldGVseSBpZiBjdXN0b21BQUJCIGlzIHVzZWRcbiAgICAgICAgaWYgKCF0aGlzLl9hYWJiKSB7XG4gICAgICAgICAgICB0aGlzLl9hYWJiID0gbmV3IEJvdW5kaW5nQm94KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5kZWx0YVBvc2l0aW9ucylcbiAgICAgICAgICAgICAgICB0aGlzLl9hYWJiLmNvbXB1dGUodGhpcy5kZWx0YVBvc2l0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fYWFiYjtcbiAgICB9XG5cbiAgICBnZXQgbW9ycGhQb3NpdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3ZlcnRleEJ1ZmZlclBvc2l0aW9ucyB8fCAhIXRoaXMudGV4dHVyZVBvc2l0aW9ucztcbiAgICB9XG5cbiAgICBnZXQgbW9ycGhOb3JtYWxzKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl92ZXJ0ZXhCdWZmZXJOb3JtYWxzIHx8ICEhdGhpcy50ZXh0dXJlTm9ybWFscztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGlkZW50aWNhbCBjb3B5IG9mIHRoZSBzcGVjaWZpZWQgbW9ycGggdGFyZ2V0LiBUaGlzIGNhbiBvbmx5IGJlIHVzZWQgaWYgdGhlIG1vcnBoIHRhcmdldFxuICAgICAqIHdhcyBjcmVhdGVkIHdpdGggb3B0aW9ucy5wcmVzZXJ2ZURhdGEgc2V0IHRvIHRydWUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TW9ycGhUYXJnZXR9IEEgbW9ycGggdGFyZ2V0IGluc3RhbmNlIGNvbnRhaW5pbmcgdGhlIHJlc3VsdCBvZiB0aGUgY2xvbmluZy5cbiAgICAgKi9cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgRGVidWcuYXNzZXJ0KHRoaXMub3B0aW9ucywgJ01vcnBoVGFyZ2V0IGNhbm5vdCBiZSBjbG9uZWQsIHdhcyBpdCBjcmVhdGVkIHdpdGggYSBwcmVzZXJ2ZURhdGEgb3B0aW9uPycpO1xuICAgICAgICByZXR1cm4gbmV3IE1vcnBoVGFyZ2V0KHRoaXMub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgX3Bvc3RJbml0KCkge1xuXG4gICAgICAgIC8vIHJlbGVhc2Ugb3JpZ2luYWwgZGF0YVxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wcmVzZXJ2ZURhdGEpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtYXJrIGl0IGFzIHVzZWRcbiAgICAgICAgdGhpcy51c2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBfaW5pdFZlcnRleEJ1ZmZlcnMoZ3JhcGhpY3NEZXZpY2UpIHtcblxuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgICB0aGlzLl92ZXJ0ZXhCdWZmZXJQb3NpdGlvbnMgPSB0aGlzLl9jcmVhdGVWZXJ0ZXhCdWZmZXIoZ3JhcGhpY3NEZXZpY2UsIG9wdGlvbnMuZGVsdGFQb3NpdGlvbnMsIG9wdGlvbnMuZGVsdGFQb3NpdGlvbnNUeXBlKTtcbiAgICAgICAgdGhpcy5fdmVydGV4QnVmZmVyTm9ybWFscyA9IHRoaXMuX2NyZWF0ZVZlcnRleEJ1ZmZlcihncmFwaGljc0RldmljZSwgb3B0aW9ucy5kZWx0YU5vcm1hbHMsIG9wdGlvbnMuZGVsdGFOb3JtYWxzVHlwZSk7XG5cbiAgICAgICAgLy8gYWNjZXNzIHBvc2l0aW9ucyBmcm9tIHZlcnRleCBidWZmZXIgd2hlbiBuZWVkZWRcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRleEJ1ZmZlclBvc2l0aW9ucykge1xuICAgICAgICAgICAgdGhpcy5kZWx0YVBvc2l0aW9ucyA9IHRoaXMuX3ZlcnRleEJ1ZmZlclBvc2l0aW9ucy5sb2NrKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlVmVydGV4QnVmZmVyKGRldmljZSwgZGF0YSwgZGF0YVR5cGUgPSBUWVBFX0ZMT0FUMzIpIHtcblxuICAgICAgICBpZiAoZGF0YSkge1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgdmVydGV4IGJ1ZmZlciB3aXRoIHNwZWNpZmllZCB0eXBlIChvciBmbG9hdDMyKSwgYW5kIHNlbWFudGljIG9mIEFUVFIwIHdoaWNoIGdldHMgcmVwbGFjZWQgYXQgcnVudGltZSB3aXRoIGFjdHVhbCBzZW1hbnRpY1xuICAgICAgICAgICAgY29uc3QgZm9ybWF0RGVzYyA9IFt7IHNlbWFudGljOiBTRU1BTlRJQ19BVFRSMCwgY29tcG9uZW50czogMywgdHlwZTogZGF0YVR5cGUgfV07XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlcnRleEJ1ZmZlcihkZXZpY2UsIG5ldyBWZXJ0ZXhGb3JtYXQoZGV2aWNlLCBmb3JtYXREZXNjKSwgZGF0YS5sZW5ndGggLyAzLCBCVUZGRVJfU1RBVElDLCBkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIF9zZXRUZXh0dXJlKG5hbWUsIHRleHR1cmUpIHtcbiAgICAgICAgdGhpc1tuYW1lXSA9IHRleHR1cmU7XG4gICAgfVxufVxuXG5leHBvcnQgeyBNb3JwaFRhcmdldCB9O1xuIl0sIm5hbWVzIjpbIk1vcnBoVGFyZ2V0IiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwidXNlZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsIkRlYnVnIiwiZGVwcmVjYXRlZCIsIl9uYW1lIiwibmFtZSIsIl9kZWZhdWx0V2VpZ2h0IiwiZGVmYXVsdFdlaWdodCIsIl9hYWJiIiwiYWFiYiIsImRlbHRhUG9zaXRpb25zIiwiZGVzdHJveSIsIl90aGlzJF92ZXJ0ZXhCdWZmZXJQbyIsIl90aGlzJF92ZXJ0ZXhCdWZmZXJObyIsIl90aGlzJHRleHR1cmVQb3NpdGlvbiIsIl90aGlzJHRleHR1cmVOb3JtYWxzIiwiX3ZlcnRleEJ1ZmZlclBvc2l0aW9ucyIsIl92ZXJ0ZXhCdWZmZXJOb3JtYWxzIiwidGV4dHVyZVBvc2l0aW9ucyIsInRleHR1cmVOb3JtYWxzIiwiQm91bmRpbmdCb3giLCJjb21wdXRlIiwibW9ycGhQb3NpdGlvbnMiLCJtb3JwaE5vcm1hbHMiLCJjbG9uZSIsImFzc2VydCIsIl9wb3N0SW5pdCIsInByZXNlcnZlRGF0YSIsIl9pbml0VmVydGV4QnVmZmVycyIsImdyYXBoaWNzRGV2aWNlIiwiX2NyZWF0ZVZlcnRleEJ1ZmZlciIsImRlbHRhUG9zaXRpb25zVHlwZSIsImRlbHRhTm9ybWFscyIsImRlbHRhTm9ybWFsc1R5cGUiLCJsb2NrIiwiZGV2aWNlIiwiZGF0YSIsImRhdGFUeXBlIiwiVFlQRV9GTE9BVDMyIiwiZm9ybWF0RGVzYyIsInNlbWFudGljIiwiU0VNQU5USUNfQVRUUjAiLCJjb21wb25lbnRzIiwidHlwZSIsIlZlcnRleEJ1ZmZlciIsIlZlcnRleEZvcm1hdCIsIkJVRkZFUl9TVEFUSUMiLCJfc2V0VGV4dHVyZSIsInRleHR1cmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLFdBQVcsQ0FBQztBQUNkO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7O0FBR0k7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDSUMsV0FBV0EsQ0FBQ0MsT0FBTyxFQUFFO0lBQUEsSUFyQnJCQyxDQUFBQSxJQUFJLEdBQUcsS0FBSyxDQUFBO0FBdUJSLElBQUEsSUFBSUMsU0FBUyxDQUFDQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3hCQyxNQUFBQSxLQUFLLENBQUNDLFVBQVUsQ0FBQyxtRkFBbUYsQ0FBQyxDQUFBO0FBQ3JHTCxNQUFBQSxPQUFPLEdBQUdFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMxQixLQUFBO0lBRUEsSUFBSSxDQUFDRixPQUFPLEdBQUdBLE9BQU8sQ0FBQTtBQUN0QixJQUFBLElBQUksQ0FBQ00sS0FBSyxHQUFHTixPQUFPLENBQUNPLElBQUksQ0FBQTtBQUN6QixJQUFBLElBQUksQ0FBQ0MsY0FBYyxHQUFHUixPQUFPLENBQUNTLGFBQWEsSUFBSSxDQUFDLENBQUE7O0FBRWhEO0FBQ0EsSUFBQSxJQUFJLENBQUNDLEtBQUssR0FBR1YsT0FBTyxDQUFDVyxJQUFJLENBQUE7O0FBRXpCO0FBQ0EsSUFBQSxJQUFJLENBQUNDLGNBQWMsR0FBR1osT0FBTyxDQUFDWSxjQUFjLENBQUE7QUFDaEQsR0FBQTtBQUVBQyxFQUFBQSxPQUFPQSxHQUFHO0FBQUEsSUFBQSxJQUFBQyxxQkFBQSxFQUFBQyxxQkFBQSxFQUFBQyxxQkFBQSxFQUFBQyxvQkFBQSxDQUFBO0lBRU4sQ0FBQUgs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
