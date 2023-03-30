/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../core/debug.js';
import { hashCode } from '../../core/hash.js';
import { math } from '../../core/math/math.js';
import { typedArrayTypesByteSize, vertexTypesNames, SEMANTIC_TEXCOORD0, SEMANTIC_TEXCOORD1, SEMANTIC_COLOR, SEMANTIC_TANGENT, SEMANTIC_ATTR12, TYPE_FLOAT32, SEMANTIC_ATTR13, SEMANTIC_ATTR14, SEMANTIC_ATTR15 } from './constants.js';

/**
 * A vertex format is a descriptor that defines the layout of vertex data inside a
 * {@link VertexBuffer}.
 *
 * @property {object[]} elements The vertex attribute elements.
 * @property {string} elements[].name The meaning of the vertex element. This is used to link the
 * vertex data to a shader input. Can be:
 *
 * - {@link SEMANTIC_POSITION}
 * - {@link SEMANTIC_NORMAL}
 * - {@link SEMANTIC_TANGENT}
 * - {@link SEMANTIC_BLENDWEIGHT}
 * - {@link SEMANTIC_BLENDINDICES}
 * - {@link SEMANTIC_COLOR}
 * - {@link SEMANTIC_TEXCOORD0}
 * - {@link SEMANTIC_TEXCOORD1}
 * - {@link SEMANTIC_TEXCOORD2}
 * - {@link SEMANTIC_TEXCOORD3}
 * - {@link SEMANTIC_TEXCOORD4}
 * - {@link SEMANTIC_TEXCOORD5}
 * - {@link SEMANTIC_TEXCOORD6}
 * - {@link SEMANTIC_TEXCOORD7}
 *
 * If vertex data has a meaning other that one of those listed above, use the user-defined
 * semantics: {@link SEMANTIC_ATTR0} to {@link SEMANTIC_ATTR15}.
 * @property {number} elements[].numComponents The number of components of the vertex attribute.
 * Can be 1, 2, 3 or 4.
 * @property {number} elements[].dataType The data type of the attribute. Can be:
 *
 * - {@link TYPE_INT8}
 * - {@link TYPE_UINT8}
 * - {@link TYPE_INT16}
 * - {@link TYPE_UINT16}
 * - {@link TYPE_INT32}
 * - {@link TYPE_UINT32}
 * - {@link TYPE_FLOAT32}
 * @property {boolean} elements[].normalize If true, vertex attribute data will be mapped from a 0
 * to 255 range down to 0 to 1 when fed to a shader. If false, vertex attribute data is left
 * unchanged. If this property is unspecified, false is assumed.
 * @property {number} elements[].offset The number of initial bytes at the start of a vertex that
 * are not relevant to this attribute.
 * @property {number} elements[].stride The number of total bytes that are between the start of one
 * vertex, and the start of the next.
 * @property {number} elements[].size The size of the attribute in bytes.
 */
class VertexFormat {
  /**
   * Create a new VertexFormat instance.
   *
   * @param {import('./graphics-device.js').GraphicsDevice} graphicsDevice - The graphics device
   * used to manage this vertex format.
   * @param {object[]} description - An array of vertex attribute descriptions.
   * @param {string} description[].semantic - The meaning of the vertex element. This is used to
   * link the vertex data to a shader input. Can be:
   *
   * - {@link SEMANTIC_POSITION}
   * - {@link SEMANTIC_NORMAL}
   * - {@link SEMANTIC_TANGENT}
   * - {@link SEMANTIC_BLENDWEIGHT}
   * - {@link SEMANTIC_BLENDINDICES}
   * - {@link SEMANTIC_COLOR}
   * - {@link SEMANTIC_TEXCOORD0}
   * - {@link SEMANTIC_TEXCOORD1}
   * - {@link SEMANTIC_TEXCOORD2}
   * - {@link SEMANTIC_TEXCOORD3}
   * - {@link SEMANTIC_TEXCOORD4}
   * - {@link SEMANTIC_TEXCOORD5}
   * - {@link SEMANTIC_TEXCOORD6}
   * - {@link SEMANTIC_TEXCOORD7}
   *
   * If vertex data has a meaning other that one of those listed above, use the user-defined
   * semantics: {@link SEMANTIC_ATTR0} to {@link SEMANTIC_ATTR15}.
   * @param {number} description[].components - The number of components of the vertex attribute.
   * Can be 1, 2, 3 or 4.
   * @param {number} description[].type - The data type of the attribute. Can be:
   *
   * - {@link TYPE_INT8}
   * - {@link TYPE_UINT8}
   * - {@link TYPE_INT16}
   * - {@link TYPE_UINT16}
   * - {@link TYPE_INT32}
   * - {@link TYPE_UINT32}
   * - {@link TYPE_FLOAT32}
   *
   * @param {boolean} [description[].normalize] - If true, vertex attribute data will be mapped
   * from a 0 to 255 range down to 0 to 1 when fed to a shader. If false, vertex attribute data
   * is left unchanged. If this property is unspecified, false is assumed.
   * @param {number} [vertexCount] - When specified, vertex format will be set up for
   * non-interleaved format with a specified number of vertices. (example: PPPPNNNNCCCC), where
   * arrays of individual attributes will be stored one right after the other (subject to
   * alignment requirements). Note that in this case, the format depends on the number of
   * vertices, and needs to change when the number of vertices changes. When not specified,
   * vertex format will be interleaved. (example: PNCPNCPNCPNC).
   * @example
   * // Specify 3-component positions (x, y, z)
   * var vertexFormat = new pc.VertexFormat(graphicsDevice, [
   *     { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 }
   * ]);
   * @example
   * // Specify 2-component positions (x, y), a texture coordinate (u, v) and a vertex color (r, g, b, a)
   * var vertexFormat = new pc.VertexFormat(graphicsDevice, [
   *     { semantic: pc.SEMANTIC_POSITION, components: 2, type: pc.TYPE_FLOAT32 },
   *     { semantic: pc.SEMANTIC_TEXCOORD0, components: 2, type: pc.TYPE_FLOAT32 },
   *     { semantic: pc.SEMANTIC_COLOR, components: 4, type: pc.TYPE_UINT8, normalize: true }
   * ]);
   */
  constructor(graphicsDevice, description, vertexCount) {
    this.device = graphicsDevice;
    this._elements = [];
    this.hasUv0 = false;
    this.hasUv1 = false;
    this.hasColor = false;
    this.hasTangents = false;
    this.verticesByteSize = 0;
    this.vertexCount = vertexCount;
    this.interleaved = vertexCount === undefined;

    // true if the vertex format represents an instancing vertex buffer
    this.instancing = false;

    // calculate total size of the vertex
    this.size = description.reduce((total, desc) => {
      return total + Math.ceil(desc.components * typedArrayTypesByteSize[desc.type] / 4) * 4;
    }, 0);
    let offset = 0,
      elementSize;
    for (let i = 0, len = description.length; i < len; i++) {
      var _elementDesc$normaliz;
      const elementDesc = description[i];
      elementSize = elementDesc.components * typedArrayTypesByteSize[elementDesc.type];

      // WebGPU has limited element size support (for example uint16x3 is not supported)
      Debug.assert(!graphicsDevice.isWebGPU || [2, 4, 8, 12, 16].includes(elementSize), `WebGPU does not support the format of vertex element ${elementDesc.semantic} : ${vertexTypesNames[elementDesc.type]} x ${elementDesc.components}`);

      // align up the offset to elementSize (when vertexCount is specified only - case of non-interleaved format)
      if (vertexCount) {
        offset = math.roundUp(offset, elementSize);

        // non-interleaved format with elementSize not multiple of 4 might be slower on some platforms - padding is recommended to align its size
        // example: use 4 x TYPE_UINT8 instead of 3 x TYPE_UINT8
        Debug.assert(elementSize % 4 === 0, `Non-interleaved vertex format with element size not multiple of 4 can have performance impact on some platforms. Element size: ${elementSize}`);
      }
      const element = {
        name: elementDesc.semantic,
        offset: vertexCount ? offset : elementDesc.hasOwnProperty('offset') ? elementDesc.offset : offset,
        stride: vertexCount ? elementSize : elementDesc.hasOwnProperty('stride') ? elementDesc.stride : this.size,
        dataType: elementDesc.type,
        numComponents: elementDesc.components,
        normalize: (_elementDesc$normaliz = elementDesc.normalize) != null ? _elementDesc$normaliz : false,
        size: elementSize
      };
      this._elements.push(element);
      if (vertexCount) {
        offset += elementSize * vertexCount;
      } else {
        offset += Math.ceil(elementSize / 4) * 4;
      }
      if (elementDesc.semantic === SEMANTIC_TEXCOORD0) {
        this.hasUv0 = true;
      } else if (elementDesc.semantic === SEMANTIC_TEXCOORD1) {
        this.hasUv1 = true;
      } else if (elementDesc.semantic === SEMANTIC_COLOR) {
        this.hasColor = true;
      } else if (elementDesc.semantic === SEMANTIC_TANGENT) {
        this.hasTangents = true;
      }
    }
    if (vertexCount) {
      this.verticesByteSize = offset;
    }
    this._evaluateHash();
  }
  get elements() {
    return this._elements;
  }

  /**
   * @type {VertexFormat}
   * @private
   */

  /**
   * The {@link VertexFormat} used to store matrices of type {@link Mat4} for hardware instancing.
   *
   * @param {import('./graphics-device.js').GraphicsDevice} graphicsDevice - The graphics device
   * used to create this vertex format.
   *
   * @returns {VertexFormat} The default instancing vertex format.
   */
  static getDefaultInstancingFormat(graphicsDevice) {
    if (!VertexFormat._defaultInstancingFormat) {
      VertexFormat._defaultInstancingFormat = new VertexFormat(graphicsDevice, [{
        semantic: SEMANTIC_ATTR12,
        components: 4,
        type: TYPE_FLOAT32
      }, {
        semantic: SEMANTIC_ATTR13,
        components: 4,
        type: TYPE_FLOAT32
      }, {
        semantic: SEMANTIC_ATTR14,
        components: 4,
        type: TYPE_FLOAT32
      }, {
        semantic: SEMANTIC_ATTR15,
        components: 4,
        type: TYPE_FLOAT32
      }]);
    }
    return VertexFormat._defaultInstancingFormat;
  }

  /**
   * Applies any changes made to the VertexFormat's properties.
   *
   * @private
   */
  update() {
    // Note that this is used only by vertex attribute morphing on the WebGL.
    Debug.assert(!this.device.isWebGPU, `VertexFormat#update is not supported on WebGPU and VertexFormat cannot be modified.`);
    this._evaluateHash();
  }

  /**
   * Evaluates hash values for the format allowing fast compare of batching / rendering compatibility.
   *
   * @private
   */
  _evaluateHash() {
    let stringElementBatch;
    const stringElementsBatch = [];
    let stringElementRender;
    const stringElementsRender = [];
    const len = this._elements.length;
    for (let i = 0; i < len; i++) {
      const element = this._elements[i];

      // create string description of each element that is relevant for batching
      stringElementBatch = element.name;
      stringElementBatch += element.dataType;
      stringElementBatch += element.numComponents;
      stringElementBatch += element.normalize;
      stringElementsBatch.push(stringElementBatch);

      // create string description of each element that is relevant for rendering
      stringElementRender = stringElementBatch;
      stringElementRender += element.offset;
      stringElementRender += element.stride;
      stringElementRender += element.size;
      stringElementsRender.push(stringElementRender);
    }

    // sort batching ones alphabetically to make the hash order independent
    stringElementsBatch.sort();
    this.batchingHash = hashCode(stringElementsBatch.join());

    // rendering hash
    this.renderingHashString = stringElementsRender.join('_');
    this.renderingHash = hashCode(this.renderingHashString);
  }
}
VertexFormat._defaultInstancingFormat = null;

export { VertexFormat };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVydGV4LWZvcm1hdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3BsYXRmb3JtL2dyYXBoaWNzL3ZlcnRleC1mb3JtYXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGVidWcgfSBmcm9tICcuLi8uLi9jb3JlL2RlYnVnLmpzJztcbmltcG9ydCB7IGhhc2hDb2RlIH0gZnJvbSAnLi4vLi4vY29yZS9oYXNoLmpzJztcblxuaW1wb3J0IHsgbWF0aCB9IGZyb20gJy4uLy4uL2NvcmUvbWF0aC9tYXRoLmpzJztcblxuaW1wb3J0IHtcbiAgICBTRU1BTlRJQ19URVhDT09SRDAsIFNFTUFOVElDX1RFWENPT1JEMSwgU0VNQU5USUNfQVRUUjEyLCBTRU1BTlRJQ19BVFRSMTMsIFNFTUFOVElDX0FUVFIxNCwgU0VNQU5USUNfQVRUUjE1LFxuICAgIFNFTUFOVElDX0NPTE9SLCBTRU1BTlRJQ19UQU5HRU5ULCBUWVBFX0ZMT0FUMzIsIHR5cGVkQXJyYXlUeXBlc0J5dGVTaXplLCB2ZXJ0ZXhUeXBlc05hbWVzXG59IGZyb20gJy4vY29uc3RhbnRzLmpzJztcblxuLyoqXG4gKiBBIHZlcnRleCBmb3JtYXQgaXMgYSBkZXNjcmlwdG9yIHRoYXQgZGVmaW5lcyB0aGUgbGF5b3V0IG9mIHZlcnRleCBkYXRhIGluc2lkZSBhXG4gKiB7QGxpbmsgVmVydGV4QnVmZmVyfS5cbiAqXG4gKiBAcHJvcGVydHkge29iamVjdFtdfSBlbGVtZW50cyBUaGUgdmVydGV4IGF0dHJpYnV0ZSBlbGVtZW50cy5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBlbGVtZW50c1tdLm5hbWUgVGhlIG1lYW5pbmcgb2YgdGhlIHZlcnRleCBlbGVtZW50LiBUaGlzIGlzIHVzZWQgdG8gbGluayB0aGVcbiAqIHZlcnRleCBkYXRhIHRvIGEgc2hhZGVyIGlucHV0LiBDYW4gYmU6XG4gKlxuICogLSB7QGxpbmsgU0VNQU5USUNfUE9TSVRJT059XG4gKiAtIHtAbGluayBTRU1BTlRJQ19OT1JNQUx9XG4gKiAtIHtAbGluayBTRU1BTlRJQ19UQU5HRU5UfVxuICogLSB7QGxpbmsgU0VNQU5USUNfQkxFTkRXRUlHSFR9XG4gKiAtIHtAbGluayBTRU1BTlRJQ19CTEVORElORElDRVN9XG4gKiAtIHtAbGluayBTRU1BTlRJQ19DT0xPUn1cbiAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JEMH1cbiAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JEMX1cbiAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JEMn1cbiAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JEM31cbiAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JENH1cbiAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JENX1cbiAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JENn1cbiAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JEN31cbiAqXG4gKiBJZiB2ZXJ0ZXggZGF0YSBoYXMgYSBtZWFuaW5nIG90aGVyIHRoYXQgb25lIG9mIHRob3NlIGxpc3RlZCBhYm92ZSwgdXNlIHRoZSB1c2VyLWRlZmluZWRcbiAqIHNlbWFudGljczoge0BsaW5rIFNFTUFOVElDX0FUVFIwfSB0byB7QGxpbmsgU0VNQU5USUNfQVRUUjE1fS5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBlbGVtZW50c1tdLm51bUNvbXBvbmVudHMgVGhlIG51bWJlciBvZiBjb21wb25lbnRzIG9mIHRoZSB2ZXJ0ZXggYXR0cmlidXRlLlxuICogQ2FuIGJlIDEsIDIsIDMgb3IgNC5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBlbGVtZW50c1tdLmRhdGFUeXBlIFRoZSBkYXRhIHR5cGUgb2YgdGhlIGF0dHJpYnV0ZS4gQ2FuIGJlOlxuICpcbiAqIC0ge0BsaW5rIFRZUEVfSU5UOH1cbiAqIC0ge0BsaW5rIFRZUEVfVUlOVDh9XG4gKiAtIHtAbGluayBUWVBFX0lOVDE2fVxuICogLSB7QGxpbmsgVFlQRV9VSU5UMTZ9XG4gKiAtIHtAbGluayBUWVBFX0lOVDMyfVxuICogLSB7QGxpbmsgVFlQRV9VSU5UMzJ9XG4gKiAtIHtAbGluayBUWVBFX0ZMT0FUMzJ9XG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGVsZW1lbnRzW10ubm9ybWFsaXplIElmIHRydWUsIHZlcnRleCBhdHRyaWJ1dGUgZGF0YSB3aWxsIGJlIG1hcHBlZCBmcm9tIGEgMFxuICogdG8gMjU1IHJhbmdlIGRvd24gdG8gMCB0byAxIHdoZW4gZmVkIHRvIGEgc2hhZGVyLiBJZiBmYWxzZSwgdmVydGV4IGF0dHJpYnV0ZSBkYXRhIGlzIGxlZnRcbiAqIHVuY2hhbmdlZC4gSWYgdGhpcyBwcm9wZXJ0eSBpcyB1bnNwZWNpZmllZCwgZmFsc2UgaXMgYXNzdW1lZC5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBlbGVtZW50c1tdLm9mZnNldCBUaGUgbnVtYmVyIG9mIGluaXRpYWwgYnl0ZXMgYXQgdGhlIHN0YXJ0IG9mIGEgdmVydGV4IHRoYXRcbiAqIGFyZSBub3QgcmVsZXZhbnQgdG8gdGhpcyBhdHRyaWJ1dGUuXG4gKiBAcHJvcGVydHkge251bWJlcn0gZWxlbWVudHNbXS5zdHJpZGUgVGhlIG51bWJlciBvZiB0b3RhbCBieXRlcyB0aGF0IGFyZSBiZXR3ZWVuIHRoZSBzdGFydCBvZiBvbmVcbiAqIHZlcnRleCwgYW5kIHRoZSBzdGFydCBvZiB0aGUgbmV4dC5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBlbGVtZW50c1tdLnNpemUgVGhlIHNpemUgb2YgdGhlIGF0dHJpYnV0ZSBpbiBieXRlcy5cbiAqL1xuY2xhc3MgVmVydGV4Rm9ybWF0IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgVmVydGV4Rm9ybWF0IGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4vZ3JhcGhpY3MtZGV2aWNlLmpzJykuR3JhcGhpY3NEZXZpY2V9IGdyYXBoaWNzRGV2aWNlIC0gVGhlIGdyYXBoaWNzIGRldmljZVxuICAgICAqIHVzZWQgdG8gbWFuYWdlIHRoaXMgdmVydGV4IGZvcm1hdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdFtdfSBkZXNjcmlwdGlvbiAtIEFuIGFycmF5IG9mIHZlcnRleCBhdHRyaWJ1dGUgZGVzY3JpcHRpb25zLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNjcmlwdGlvbltdLnNlbWFudGljIC0gVGhlIG1lYW5pbmcgb2YgdGhlIHZlcnRleCBlbGVtZW50LiBUaGlzIGlzIHVzZWQgdG9cbiAgICAgKiBsaW5rIHRoZSB2ZXJ0ZXggZGF0YSB0byBhIHNoYWRlciBpbnB1dC4gQ2FuIGJlOlxuICAgICAqXG4gICAgICogLSB7QGxpbmsgU0VNQU5USUNfUE9TSVRJT059XG4gICAgICogLSB7QGxpbmsgU0VNQU5USUNfTk9STUFMfVxuICAgICAqIC0ge0BsaW5rIFNFTUFOVElDX1RBTkdFTlR9XG4gICAgICogLSB7QGxpbmsgU0VNQU5USUNfQkxFTkRXRUlHSFR9XG4gICAgICogLSB7QGxpbmsgU0VNQU5USUNfQkxFTkRJTkRJQ0VTfVxuICAgICAqIC0ge0BsaW5rIFNFTUFOVElDX0NPTE9SfVxuICAgICAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JEMH1cbiAgICAgKiAtIHtAbGluayBTRU1BTlRJQ19URVhDT09SRDF9XG4gICAgICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQyfVxuICAgICAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JEM31cbiAgICAgKiAtIHtAbGluayBTRU1BTlRJQ19URVhDT09SRDR9XG4gICAgICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQ1fVxuICAgICAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JENn1cbiAgICAgKiAtIHtAbGluayBTRU1BTlRJQ19URVhDT09SRDd9XG4gICAgICpcbiAgICAgKiBJZiB2ZXJ0ZXggZGF0YSBoYXMgYSBtZWFuaW5nIG90aGVyIHRoYXQgb25lIG9mIHRob3NlIGxpc3RlZCBhYm92ZSwgdXNlIHRoZSB1c2VyLWRlZmluZWRcbiAgICAgKiBzZW1hbnRpY3M6IHtAbGluayBTRU1BTlRJQ19BVFRSMH0gdG8ge0BsaW5rIFNFTUFOVElDX0FUVFIxNX0uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRlc2NyaXB0aW9uW10uY29tcG9uZW50cyAtIFRoZSBudW1iZXIgb2YgY29tcG9uZW50cyBvZiB0aGUgdmVydGV4IGF0dHJpYnV0ZS5cbiAgICAgKiBDYW4gYmUgMSwgMiwgMyBvciA0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkZXNjcmlwdGlvbltdLnR5cGUgLSBUaGUgZGF0YSB0eXBlIG9mIHRoZSBhdHRyaWJ1dGUuIENhbiBiZTpcbiAgICAgKlxuICAgICAqIC0ge0BsaW5rIFRZUEVfSU5UOH1cbiAgICAgKiAtIHtAbGluayBUWVBFX1VJTlQ4fVxuICAgICAqIC0ge0BsaW5rIFRZUEVfSU5UMTZ9XG4gICAgICogLSB7QGxpbmsgVFlQRV9VSU5UMTZ9XG4gICAgICogLSB7QGxpbmsgVFlQRV9JTlQzMn1cbiAgICAgKiAtIHtAbGluayBUWVBFX1VJTlQzMn1cbiAgICAgKiAtIHtAbGluayBUWVBFX0ZMT0FUMzJ9XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtkZXNjcmlwdGlvbltdLm5vcm1hbGl6ZV0gLSBJZiB0cnVlLCB2ZXJ0ZXggYXR0cmlidXRlIGRhdGEgd2lsbCBiZSBtYXBwZWRcbiAgICAgKiBmcm9tIGEgMCB0byAyNTUgcmFuZ2UgZG93biB0byAwIHRvIDEgd2hlbiBmZWQgdG8gYSBzaGFkZXIuIElmIGZhbHNlLCB2ZXJ0ZXggYXR0cmlidXRlIGRhdGFcbiAgICAgKiBpcyBsZWZ0IHVuY2hhbmdlZC4gSWYgdGhpcyBwcm9wZXJ0eSBpcyB1bnNwZWNpZmllZCwgZmFsc2UgaXMgYXNzdW1lZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ZlcnRleENvdW50XSAtIFdoZW4gc3BlY2lmaWVkLCB2ZXJ0ZXggZm9ybWF0IHdpbGwgYmUgc2V0IHVwIGZvclxuICAgICAqIG5vbi1pbnRlcmxlYXZlZCBmb3JtYXQgd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgdmVydGljZXMuIChleGFtcGxlOiBQUFBQTk5OTkNDQ0MpLCB3aGVyZVxuICAgICAqIGFycmF5cyBvZiBpbmRpdmlkdWFsIGF0dHJpYnV0ZXMgd2lsbCBiZSBzdG9yZWQgb25lIHJpZ2h0IGFmdGVyIHRoZSBvdGhlciAoc3ViamVjdCB0b1xuICAgICAqIGFsaWdubWVudCByZXF1aXJlbWVudHMpLiBOb3RlIHRoYXQgaW4gdGhpcyBjYXNlLCB0aGUgZm9ybWF0IGRlcGVuZHMgb24gdGhlIG51bWJlciBvZlxuICAgICAqIHZlcnRpY2VzLCBhbmQgbmVlZHMgdG8gY2hhbmdlIHdoZW4gdGhlIG51bWJlciBvZiB2ZXJ0aWNlcyBjaGFuZ2VzLiBXaGVuIG5vdCBzcGVjaWZpZWQsXG4gICAgICogdmVydGV4IGZvcm1hdCB3aWxsIGJlIGludGVybGVhdmVkLiAoZXhhbXBsZTogUE5DUE5DUE5DUE5DKS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFNwZWNpZnkgMy1jb21wb25lbnQgcG9zaXRpb25zICh4LCB5LCB6KVxuICAgICAqIHZhciB2ZXJ0ZXhGb3JtYXQgPSBuZXcgcGMuVmVydGV4Rm9ybWF0KGdyYXBoaWNzRGV2aWNlLCBbXG4gICAgICogICAgIHsgc2VtYW50aWM6IHBjLlNFTUFOVElDX1BPU0lUSU9OLCBjb21wb25lbnRzOiAzLCB0eXBlOiBwYy5UWVBFX0ZMT0FUMzIgfVxuICAgICAqIF0pO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gU3BlY2lmeSAyLWNvbXBvbmVudCBwb3NpdGlvbnMgKHgsIHkpLCBhIHRleHR1cmUgY29vcmRpbmF0ZSAodSwgdikgYW5kIGEgdmVydGV4IGNvbG9yIChyLCBnLCBiLCBhKVxuICAgICAqIHZhciB2ZXJ0ZXhGb3JtYXQgPSBuZXcgcGMuVmVydGV4Rm9ybWF0KGdyYXBoaWNzRGV2aWNlLCBbXG4gICAgICogICAgIHsgc2VtYW50aWM6IHBjLlNFTUFOVElDX1BPU0lUSU9OLCBjb21wb25lbnRzOiAyLCB0eXBlOiBwYy5UWVBFX0ZMT0FUMzIgfSxcbiAgICAgKiAgICAgeyBzZW1hbnRpYzogcGMuU0VNQU5USUNfVEVYQ09PUkQwLCBjb21wb25lbnRzOiAyLCB0eXBlOiBwYy5UWVBFX0ZMT0FUMzIgfSxcbiAgICAgKiAgICAgeyBzZW1hbnRpYzogcGMuU0VNQU5USUNfQ09MT1IsIGNvbXBvbmVudHM6IDQsIHR5cGU6IHBjLlRZUEVfVUlOVDgsIG5vcm1hbGl6ZTogdHJ1ZSB9XG4gICAgICogXSk7XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZ3JhcGhpY3NEZXZpY2UsIGRlc2NyaXB0aW9uLCB2ZXJ0ZXhDb3VudCkge1xuICAgICAgICB0aGlzLmRldmljZSA9IGdyYXBoaWNzRGV2aWNlO1xuICAgICAgICB0aGlzLl9lbGVtZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmhhc1V2MCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmhhc1V2MSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmhhc0NvbG9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaGFzVGFuZ2VudHMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy52ZXJ0aWNlc0J5dGVTaXplID0gMDtcbiAgICAgICAgdGhpcy52ZXJ0ZXhDb3VudCA9IHZlcnRleENvdW50O1xuICAgICAgICB0aGlzLmludGVybGVhdmVkID0gdmVydGV4Q291bnQgPT09IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyB0cnVlIGlmIHRoZSB2ZXJ0ZXggZm9ybWF0IHJlcHJlc2VudHMgYW4gaW5zdGFuY2luZyB2ZXJ0ZXggYnVmZmVyXG4gICAgICAgIHRoaXMuaW5zdGFuY2luZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0b3RhbCBzaXplIG9mIHRoZSB2ZXJ0ZXhcbiAgICAgICAgdGhpcy5zaXplID0gZGVzY3JpcHRpb24ucmVkdWNlKCh0b3RhbCwgZGVzYykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRvdGFsICsgTWF0aC5jZWlsKGRlc2MuY29tcG9uZW50cyAqIHR5cGVkQXJyYXlUeXBlc0J5dGVTaXplW2Rlc2MudHlwZV0gLyA0KSAqIDQ7XG4gICAgICAgIH0sIDApO1xuXG4gICAgICAgIGxldCBvZmZzZXQgPSAwLCBlbGVtZW50U2l6ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGRlc2NyaXB0aW9uLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50RGVzYyA9IGRlc2NyaXB0aW9uW2ldO1xuXG4gICAgICAgICAgICBlbGVtZW50U2l6ZSA9IGVsZW1lbnREZXNjLmNvbXBvbmVudHMgKiB0eXBlZEFycmF5VHlwZXNCeXRlU2l6ZVtlbGVtZW50RGVzYy50eXBlXTtcblxuICAgICAgICAgICAgLy8gV2ViR1BVIGhhcyBsaW1pdGVkIGVsZW1lbnQgc2l6ZSBzdXBwb3J0IChmb3IgZXhhbXBsZSB1aW50MTZ4MyBpcyBub3Qgc3VwcG9ydGVkKVxuICAgICAgICAgICAgRGVidWcuYXNzZXJ0KCFncmFwaGljc0RldmljZS5pc1dlYkdQVSB8fCBbMiwgNCwgOCwgMTIsIDE2XS5pbmNsdWRlcyhlbGVtZW50U2l6ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgYFdlYkdQVSBkb2VzIG5vdCBzdXBwb3J0IHRoZSBmb3JtYXQgb2YgdmVydGV4IGVsZW1lbnQgJHtlbGVtZW50RGVzYy5zZW1hbnRpY30gOiAke3ZlcnRleFR5cGVzTmFtZXNbZWxlbWVudERlc2MudHlwZV19IHggJHtlbGVtZW50RGVzYy5jb21wb25lbnRzfWApO1xuXG4gICAgICAgICAgICAvLyBhbGlnbiB1cCB0aGUgb2Zmc2V0IHRvIGVsZW1lbnRTaXplICh3aGVuIHZlcnRleENvdW50IGlzIHNwZWNpZmllZCBvbmx5IC0gY2FzZSBvZiBub24taW50ZXJsZWF2ZWQgZm9ybWF0KVxuICAgICAgICAgICAgaWYgKHZlcnRleENvdW50KSB7XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gbWF0aC5yb3VuZFVwKG9mZnNldCwgZWxlbWVudFNpemUpO1xuXG4gICAgICAgICAgICAgICAgLy8gbm9uLWludGVybGVhdmVkIGZvcm1hdCB3aXRoIGVsZW1lbnRTaXplIG5vdCBtdWx0aXBsZSBvZiA0IG1pZ2h0IGJlIHNsb3dlciBvbiBzb21lIHBsYXRmb3JtcyAtIHBhZGRpbmcgaXMgcmVjb21tZW5kZWQgdG8gYWxpZ24gaXRzIHNpemVcbiAgICAgICAgICAgICAgICAvLyBleGFtcGxlOiB1c2UgNCB4IFRZUEVfVUlOVDggaW5zdGVhZCBvZiAzIHggVFlQRV9VSU5UOFxuICAgICAgICAgICAgICAgIERlYnVnLmFzc2VydCgoZWxlbWVudFNpemUgJSA0KSA9PT0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYE5vbi1pbnRlcmxlYXZlZCB2ZXJ0ZXggZm9ybWF0IHdpdGggZWxlbWVudCBzaXplIG5vdCBtdWx0aXBsZSBvZiA0IGNhbiBoYXZlIHBlcmZvcm1hbmNlIGltcGFjdCBvbiBzb21lIHBsYXRmb3Jtcy4gRWxlbWVudCBzaXplOiAke2VsZW1lbnRTaXplfWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IGVsZW1lbnREZXNjLnNlbWFudGljLFxuICAgICAgICAgICAgICAgIG9mZnNldDogKHZlcnRleENvdW50ID8gb2Zmc2V0IDogKGVsZW1lbnREZXNjLmhhc093blByb3BlcnR5KCdvZmZzZXQnKSA/IGVsZW1lbnREZXNjLm9mZnNldCA6IG9mZnNldCkpLFxuICAgICAgICAgICAgICAgIHN0cmlkZTogKHZlcnRleENvdW50ID8gZWxlbWVudFNpemUgOiAoZWxlbWVudERlc2MuaGFzT3duUHJvcGVydHkoJ3N0cmlkZScpID8gZWxlbWVudERlc2Muc3RyaWRlIDogdGhpcy5zaXplKSksXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6IGVsZW1lbnREZXNjLnR5cGUsXG4gICAgICAgICAgICAgICAgbnVtQ29tcG9uZW50czogZWxlbWVudERlc2MuY29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICBub3JtYWxpemU6IGVsZW1lbnREZXNjLm5vcm1hbGl6ZSA/PyBmYWxzZSxcbiAgICAgICAgICAgICAgICBzaXplOiBlbGVtZW50U2l6ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzLnB1c2goZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmICh2ZXJ0ZXhDb3VudCkge1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSBlbGVtZW50U2l6ZSAqIHZlcnRleENvdW50O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gTWF0aC5jZWlsKGVsZW1lbnRTaXplIC8gNCkgKiA0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudERlc2Muc2VtYW50aWMgPT09IFNFTUFOVElDX1RFWENPT1JEMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFzVXYwID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudERlc2Muc2VtYW50aWMgPT09IFNFTUFOVElDX1RFWENPT1JEMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFzVXYxID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudERlc2Muc2VtYW50aWMgPT09IFNFTUFOVElDX0NPTE9SKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYXNDb2xvciA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnREZXNjLnNlbWFudGljID09PSBTRU1BTlRJQ19UQU5HRU5UKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYXNUYW5nZW50cyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmVydGV4Q291bnQpIHtcbiAgICAgICAgICAgIHRoaXMudmVydGljZXNCeXRlU2l6ZSA9IG9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2V2YWx1YXRlSGFzaCgpO1xuICAgIH1cblxuICAgIGdldCBlbGVtZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtWZXJ0ZXhGb3JtYXR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzdGF0aWMgX2RlZmF1bHRJbnN0YW5jaW5nRm9ybWF0ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSB7QGxpbmsgVmVydGV4Rm9ybWF0fSB1c2VkIHRvIHN0b3JlIG1hdHJpY2VzIG9mIHR5cGUge0BsaW5rIE1hdDR9IGZvciBoYXJkd2FyZSBpbnN0YW5jaW5nLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4vZ3JhcGhpY3MtZGV2aWNlLmpzJykuR3JhcGhpY3NEZXZpY2V9IGdyYXBoaWNzRGV2aWNlIC0gVGhlIGdyYXBoaWNzIGRldmljZVxuICAgICAqIHVzZWQgdG8gY3JlYXRlIHRoaXMgdmVydGV4IGZvcm1hdC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtWZXJ0ZXhGb3JtYXR9IFRoZSBkZWZhdWx0IGluc3RhbmNpbmcgdmVydGV4IGZvcm1hdC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0RGVmYXVsdEluc3RhbmNpbmdGb3JtYXQoZ3JhcGhpY3NEZXZpY2UpIHtcblxuICAgICAgICBpZiAoIVZlcnRleEZvcm1hdC5fZGVmYXVsdEluc3RhbmNpbmdGb3JtYXQpIHtcbiAgICAgICAgICAgIFZlcnRleEZvcm1hdC5fZGVmYXVsdEluc3RhbmNpbmdGb3JtYXQgPSBuZXcgVmVydGV4Rm9ybWF0KGdyYXBoaWNzRGV2aWNlLCBbXG4gICAgICAgICAgICAgICAgeyBzZW1hbnRpYzogU0VNQU5USUNfQVRUUjEyLCBjb21wb25lbnRzOiA0LCB0eXBlOiBUWVBFX0ZMT0FUMzIgfSxcbiAgICAgICAgICAgICAgICB7IHNlbWFudGljOiBTRU1BTlRJQ19BVFRSMTMsIGNvbXBvbmVudHM6IDQsIHR5cGU6IFRZUEVfRkxPQVQzMiB9LFxuICAgICAgICAgICAgICAgIHsgc2VtYW50aWM6IFNFTUFOVElDX0FUVFIxNCwgY29tcG9uZW50czogNCwgdHlwZTogVFlQRV9GTE9BVDMyIH0sXG4gICAgICAgICAgICAgICAgeyBzZW1hbnRpYzogU0VNQU5USUNfQVRUUjE1LCBjb21wb25lbnRzOiA0LCB0eXBlOiBUWVBFX0ZMT0FUMzIgfVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gVmVydGV4Rm9ybWF0Ll9kZWZhdWx0SW5zdGFuY2luZ0Zvcm1hdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGFueSBjaGFuZ2VzIG1hZGUgdG8gdGhlIFZlcnRleEZvcm1hdCdzIHByb3BlcnRpZXMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgaXMgdXNlZCBvbmx5IGJ5IHZlcnRleCBhdHRyaWJ1dGUgbW9ycGhpbmcgb24gdGhlIFdlYkdMLlxuICAgICAgICBEZWJ1Zy5hc3NlcnQoIXRoaXMuZGV2aWNlLmlzV2ViR1BVLCBgVmVydGV4Rm9ybWF0I3VwZGF0ZSBpcyBub3Qgc3VwcG9ydGVkIG9uIFdlYkdQVSBhbmQgVmVydGV4Rm9ybWF0IGNhbm5vdCBiZSBtb2RpZmllZC5gKTtcbiAgICAgICAgdGhpcy5fZXZhbHVhdGVIYXNoKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXZhbHVhdGVzIGhhc2ggdmFsdWVzIGZvciB0aGUgZm9ybWF0IGFsbG93aW5nIGZhc3QgY29tcGFyZSBvZiBiYXRjaGluZyAvIHJlbmRlcmluZyBjb21wYXRpYmlsaXR5LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXZhbHVhdGVIYXNoKCkge1xuICAgICAgICBsZXQgc3RyaW5nRWxlbWVudEJhdGNoO1xuICAgICAgICBjb25zdCBzdHJpbmdFbGVtZW50c0JhdGNoID0gW107XG4gICAgICAgIGxldCBzdHJpbmdFbGVtZW50UmVuZGVyO1xuICAgICAgICBjb25zdCBzdHJpbmdFbGVtZW50c1JlbmRlciA9IFtdO1xuICAgICAgICBjb25zdCBsZW4gPSB0aGlzLl9lbGVtZW50cy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50c1tpXTtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIHN0cmluZyBkZXNjcmlwdGlvbiBvZiBlYWNoIGVsZW1lbnQgdGhhdCBpcyByZWxldmFudCBmb3IgYmF0Y2hpbmdcbiAgICAgICAgICAgIHN0cmluZ0VsZW1lbnRCYXRjaCA9IGVsZW1lbnQubmFtZTtcbiAgICAgICAgICAgIHN0cmluZ0VsZW1lbnRCYXRjaCArPSBlbGVtZW50LmRhdGFUeXBlO1xuICAgICAgICAgICAgc3RyaW5nRWxlbWVudEJhdGNoICs9IGVsZW1lbnQubnVtQ29tcG9uZW50cztcbiAgICAgICAgICAgIHN0cmluZ0VsZW1lbnRCYXRjaCArPSBlbGVtZW50Lm5vcm1hbGl6ZTtcbiAgICAgICAgICAgIHN0cmluZ0VsZW1lbnRzQmF0Y2gucHVzaChzdHJpbmdFbGVtZW50QmF0Y2gpO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgc3RyaW5nIGRlc2NyaXB0aW9uIG9mIGVhY2ggZWxlbWVudCB0aGF0IGlzIHJlbGV2YW50IGZvciByZW5kZXJpbmdcbiAgICAgICAgICAgIHN0cmluZ0VsZW1lbnRSZW5kZXIgPSBzdHJpbmdFbGVtZW50QmF0Y2g7XG4gICAgICAgICAgICBzdHJpbmdFbGVtZW50UmVuZGVyICs9IGVsZW1lbnQub2Zmc2V0O1xuICAgICAgICAgICAgc3RyaW5nRWxlbWVudFJlbmRlciArPSBlbGVtZW50LnN0cmlkZTtcbiAgICAgICAgICAgIHN0cmluZ0VsZW1lbnRSZW5kZXIgKz0gZWxlbWVudC5zaXplO1xuICAgICAgICAgICAgc3RyaW5nRWxlbWVudHNSZW5kZXIucHVzaChzdHJpbmdFbGVtZW50UmVuZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNvcnQgYmF0Y2hpbmcgb25lcyBhbHBoYWJldGljYWxseSB0byBtYWtlIHRoZSBoYXNoIG9yZGVyIGluZGVwZW5kZW50XG4gICAgICAgIHN0cmluZ0VsZW1lbnRzQmF0Y2guc29ydCgpO1xuICAgICAgICB0aGlzLmJhdGNoaW5nSGFzaCA9IGhhc2hDb2RlKHN0cmluZ0VsZW1lbnRzQmF0Y2guam9pbigpKTtcblxuICAgICAgICAvLyByZW5kZXJpbmcgaGFzaFxuICAgICAgICB0aGlzLnJlbmRlcmluZ0hhc2hTdHJpbmcgPSBzdHJpbmdFbGVtZW50c1JlbmRlci5qb2luKCdfJyk7XG4gICAgICAgIHRoaXMucmVuZGVyaW5nSGFzaCA9IGhhc2hDb2RlKHRoaXMucmVuZGVyaW5nSGFzaFN0cmluZyk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBWZXJ0ZXhGb3JtYXQgfTtcbiJdLCJuYW1lcyI6WyJWZXJ0ZXhGb3JtYXQiLCJjb25zdHJ1Y3RvciIsImdyYXBoaWNzRGV2aWNlIiwiZGVzY3JpcHRpb24iLCJ2ZXJ0ZXhDb3VudCIsImRldmljZSIsIl9lbGVtZW50cyIsImhhc1V2MCIsImhhc1V2MSIsImhhc0NvbG9yIiwiaGFzVGFuZ2VudHMiLCJ2ZXJ0aWNlc0J5dGVTaXplIiwiaW50ZXJsZWF2ZWQiLCJ1bmRlZmluZWQiLCJpbnN0YW5jaW5nIiwic2l6ZSIsInJlZHVjZSIsInRvdGFsIiwiZGVzYyIsIk1hdGgiLCJjZWlsIiwiY29tcG9uZW50cyIsInR5cGVkQXJyYXlUeXBlc0J5dGVTaXplIiwidHlwZSIsIm9mZnNldCIsImVsZW1lbnRTaXplIiwiaSIsImxlbiIsImxlbmd0aCIsIl9lbGVtZW50RGVzYyRub3JtYWxpeiIsImVsZW1lbnREZXNjIiwiRGVidWciLCJhc3NlcnQiLCJpc1dlYkdQVSIsImluY2x1ZGVzIiwic2VtYW50aWMiLCJ2ZXJ0ZXhUeXBlc05hbWVzIiwibWF0aCIsInJvdW5kVXAiLCJlbGVtZW50IiwibmFtZSIsImhhc093blByb3BlcnR5Iiwic3RyaWRlIiwiZGF0YVR5cGUiLCJudW1Db21wb25lbnRzIiwibm9ybWFsaXplIiwicHVzaCIsIlNFTUFOVElDX1RFWENPT1JEMCIsIlNFTUFOVElDX1RFWENPT1JEMSIsIlNFTUFOVElDX0NPTE9SIiwiU0VNQU5USUNfVEFOR0VOVCIsIl9ldmFsdWF0ZUhhc2giLCJlbGVtZW50cyIsImdldERlZmF1bHRJbnN0YW5jaW5nRm9ybWF0IiwiX2RlZmF1bHRJbnN0YW5jaW5nRm9ybWF0IiwiU0VNQU5USUNfQVRUUjEyIiwiVFlQRV9GTE9BVDMyIiwiU0VNQU5USUNfQVRUUjEzIiwiU0VNQU5USUNfQVRUUjE0IiwiU0VNQU5USUNfQVRUUjE1IiwidXBkYXRlIiwic3RyaW5nRWxlbWVudEJhdGNoIiwic3RyaW5nRWxlbWVudHNCYXRjaCIsInN0cmluZ0VsZW1lbnRSZW5kZXIiLCJzdHJpbmdFbGVtZW50c1JlbmRlciIsInNvcnQiLCJiYXRjaGluZ0hhc2giLCJoYXNoQ29kZSIsImpvaW4iLCJyZW5kZXJpbmdIYXNoU3RyaW5nIiwicmVuZGVyaW5nSGFzaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLFlBQVksQ0FBQztBQUNmO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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
