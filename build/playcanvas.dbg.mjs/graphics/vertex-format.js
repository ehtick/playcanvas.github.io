/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../core/debug.js';
import { hashCode } from '../core/hash.js';
import { math } from '../math/math.js';
import { typedArrayTypesByteSize, SEMANTIC_TEXCOORD0, SEMANTIC_TEXCOORD1, SEMANTIC_COLOR, SEMANTIC_TANGENT, SEMANTIC_ATTR12, TYPE_FLOAT32, SEMANTIC_ATTR13, SEMANTIC_ATTR14, SEMANTIC_ATTR15 } from './constants.js';

class VertexFormat {
  constructor(graphicsDevice, description, vertexCount) {
    this._elements = [];
    this.hasUv0 = false;
    this.hasUv1 = false;
    this.hasColor = false;
    this.hasTangents = false;
    this.verticesByteSize = 0;
    this.vertexCount = vertexCount;
    this.interleaved = vertexCount === undefined;
    this.size = description.reduce((total, desc) => {
      return total + Math.ceil(desc.components * typedArrayTypesByteSize[desc.type] / 4) * 4;
    }, 0);
    let offset = 0,
        elementSize;

    for (let i = 0, len = description.length; i < len; i++) {
      const elementDesc = description[i];
      elementSize = elementDesc.components * typedArrayTypesByteSize[elementDesc.type];

      if (vertexCount) {
        offset = math.roundUp(offset, elementSize);
        Debug.assert(elementSize % 4 === 0, `Non-interleaved vertex format with element size not multiple of 4 can have performance impact on some platforms. Element size: ${elementSize}`);
      }

      const element = {
        name: elementDesc.semantic,
        offset: vertexCount ? offset : elementDesc.hasOwnProperty('offset') ? elementDesc.offset : offset,
        stride: vertexCount ? elementSize : elementDesc.hasOwnProperty('stride') ? elementDesc.stride : this.size,
        dataType: elementDesc.type,
        numComponents: elementDesc.components,
        normalize: elementDesc.normalize === undefined ? false : elementDesc.normalize,
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

  static get defaultInstancingFormat() {
    if (!VertexFormat._defaultInstancingFormat) {
      VertexFormat._defaultInstancingFormat = new VertexFormat(null, [{
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

  _evaluateHash() {
    let stringElementBatch;
    const stringElementsBatch = [];
    let stringElementRender;
    const stringElementsRender = [];
    const len = this._elements.length;

    for (let i = 0; i < len; i++) {
      const element = this._elements[i];
      stringElementBatch = element.name;
      stringElementBatch += element.dataType;
      stringElementBatch += element.numComponents;
      stringElementBatch += element.normalize;
      stringElementsBatch.push(stringElementBatch);
      stringElementRender = stringElementBatch;
      stringElementRender += element.offset;
      stringElementRender += element.stride;
      stringElementRender += element.size;
      stringElementsRender.push(stringElementRender);
    }

    stringElementsBatch.sort();
    this.batchingHash = hashCode(stringElementsBatch.join());
    this.renderingingHashString = stringElementsRender.join('_');
    this.renderingingHash = hashCode(this.renderingingHashString);
  }

}

VertexFormat._defaultInstancingFormat = null;

export { VertexFormat };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVydGV4LWZvcm1hdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dyYXBoaWNzL3ZlcnRleC1mb3JtYXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGVidWcgfSBmcm9tICcuLi9jb3JlL2RlYnVnLmpzJztcbmltcG9ydCB7IGhhc2hDb2RlIH0gZnJvbSAnLi4vY29yZS9oYXNoLmpzJztcblxuaW1wb3J0IHsgbWF0aCB9IGZyb20gJy4uL21hdGgvbWF0aC5qcyc7XG5cbmltcG9ydCB7XG4gICAgU0VNQU5USUNfVEVYQ09PUkQwLCBTRU1BTlRJQ19URVhDT09SRDEsIFNFTUFOVElDX0FUVFIxMiwgU0VNQU5USUNfQVRUUjEzLCBTRU1BTlRJQ19BVFRSMTQsIFNFTUFOVElDX0FUVFIxNSxcbiAgICBTRU1BTlRJQ19DT0xPUiwgU0VNQU5USUNfVEFOR0VOVCwgVFlQRV9GTE9BVDMyLCB0eXBlZEFycmF5VHlwZXNCeXRlU2l6ZVxufSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL2dyYXBoaWNzLWRldmljZS5qcycpLkdyYXBoaWNzRGV2aWNlfSBHcmFwaGljc0RldmljZSAqL1xuXG4vKipcbiAqIEEgdmVydGV4IGZvcm1hdCBpcyBhIGRlc2NyaXB0b3IgdGhhdCBkZWZpbmVzIHRoZSBsYXlvdXQgb2YgdmVydGV4IGRhdGEgaW5zaWRlIGFcbiAqIHtAbGluayBWZXJ0ZXhCdWZmZXJ9LlxuICpcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0W119IGVsZW1lbnRzIFRoZSB2ZXJ0ZXggYXR0cmlidXRlIGVsZW1lbnRzLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IGVsZW1lbnRzW10ubmFtZSBUaGUgbWVhbmluZyBvZiB0aGUgdmVydGV4IGVsZW1lbnQuIFRoaXMgaXMgdXNlZCB0byBsaW5rIHRoZVxuICogdmVydGV4IGRhdGEgdG8gYSBzaGFkZXIgaW5wdXQuIENhbiBiZTpcbiAqXG4gKiAtIHtAbGluayBTRU1BTlRJQ19QT1NJVElPTn1cbiAqIC0ge0BsaW5rIFNFTUFOVElDX05PUk1BTH1cbiAqIC0ge0BsaW5rIFNFTUFOVElDX1RBTkdFTlR9XG4gKiAtIHtAbGluayBTRU1BTlRJQ19CTEVORFdFSUdIVH1cbiAqIC0ge0BsaW5rIFNFTUFOVElDX0JMRU5ESU5ESUNFU31cbiAqIC0ge0BsaW5rIFNFTUFOVElDX0NPTE9SfVxuICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQwfVxuICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQxfVxuICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQyfVxuICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQzfVxuICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQ0fVxuICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQ1fVxuICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQ2fVxuICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQ3fVxuICpcbiAqIElmIHZlcnRleCBkYXRhIGhhcyBhIG1lYW5pbmcgb3RoZXIgdGhhdCBvbmUgb2YgdGhvc2UgbGlzdGVkIGFib3ZlLCB1c2UgdGhlIHVzZXItZGVmaW5lZFxuICogc2VtYW50aWNzOiB7QGxpbmsgU0VNQU5USUNfQVRUUjB9IHRvIHtAbGluayBTRU1BTlRJQ19BVFRSMTV9LlxuICogQHByb3BlcnR5IHtudW1iZXJ9IGVsZW1lbnRzW10ubnVtQ29tcG9uZW50cyBUaGUgbnVtYmVyIG9mIGNvbXBvbmVudHMgb2YgdGhlIHZlcnRleCBhdHRyaWJ1dGUuXG4gKiBDYW4gYmUgMSwgMiwgMyBvciA0LlxuICogQHByb3BlcnR5IHtudW1iZXJ9IGVsZW1lbnRzW10uZGF0YVR5cGUgVGhlIGRhdGEgdHlwZSBvZiB0aGUgYXR0cmlidXRlLiBDYW4gYmU6XG4gKlxuICogLSB7QGxpbmsgVFlQRV9JTlQ4fVxuICogLSB7QGxpbmsgVFlQRV9VSU5UOH1cbiAqIC0ge0BsaW5rIFRZUEVfSU5UMTZ9XG4gKiAtIHtAbGluayBUWVBFX1VJTlQxNn1cbiAqIC0ge0BsaW5rIFRZUEVfSU5UMzJ9XG4gKiAtIHtAbGluayBUWVBFX1VJTlQzMn1cbiAqIC0ge0BsaW5rIFRZUEVfRkxPQVQzMn1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gZWxlbWVudHNbXS5ub3JtYWxpemUgSWYgdHJ1ZSwgdmVydGV4IGF0dHJpYnV0ZSBkYXRhIHdpbGwgYmUgbWFwcGVkIGZyb20gYSAwXG4gKiB0byAyNTUgcmFuZ2UgZG93biB0byAwIHRvIDEgd2hlbiBmZWQgdG8gYSBzaGFkZXIuIElmIGZhbHNlLCB2ZXJ0ZXggYXR0cmlidXRlIGRhdGEgaXMgbGVmdFxuICogdW5jaGFuZ2VkLiBJZiB0aGlzIHByb3BlcnR5IGlzIHVuc3BlY2lmaWVkLCBmYWxzZSBpcyBhc3N1bWVkLlxuICogQHByb3BlcnR5IHtudW1iZXJ9IGVsZW1lbnRzW10ub2Zmc2V0IFRoZSBudW1iZXIgb2YgaW5pdGlhbCBieXRlcyBhdCB0aGUgc3RhcnQgb2YgYSB2ZXJ0ZXggdGhhdFxuICogYXJlIG5vdCByZWxldmFudCB0byB0aGlzIGF0dHJpYnV0ZS5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBlbGVtZW50c1tdLnN0cmlkZSBUaGUgbnVtYmVyIG9mIHRvdGFsIGJ5dGVzIHRoYXQgYXJlIGJldHdlZW4gdGhlIHN0YXJ0IG9mIG9uZVxuICogdmVydGV4LCBhbmQgdGhlIHN0YXJ0IG9mIHRoZSBuZXh0LlxuICogQHByb3BlcnR5IHtudW1iZXJ9IGVsZW1lbnRzW10uc2l6ZSBUaGUgc2l6ZSBvZiB0aGUgYXR0cmlidXRlIGluIGJ5dGVzLlxuICovXG5jbGFzcyBWZXJ0ZXhGb3JtYXQge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBWZXJ0ZXhGb3JtYXQgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0dyYXBoaWNzRGV2aWNlfSBncmFwaGljc0RldmljZSAtIFRoZSBncmFwaGljcyBkZXZpY2UgdXNlZCB0byBtYW5hZ2UgdGhpcyB2ZXJ0ZXggZm9ybWF0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0W119IGRlc2NyaXB0aW9uIC0gQW4gYXJyYXkgb2YgdmVydGV4IGF0dHJpYnV0ZSBkZXNjcmlwdGlvbnMuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2NyaXB0aW9uW10uc2VtYW50aWMgLSBUaGUgbWVhbmluZyBvZiB0aGUgdmVydGV4IGVsZW1lbnQuIFRoaXMgaXMgdXNlZCB0byBsaW5rXG4gICAgICogdGhlIHZlcnRleCBkYXRhIHRvIGEgc2hhZGVyIGlucHV0LiBDYW4gYmU6XG4gICAgICpcbiAgICAgKiAtIHtAbGluayBTRU1BTlRJQ19QT1NJVElPTn1cbiAgICAgKiAtIHtAbGluayBTRU1BTlRJQ19OT1JNQUx9XG4gICAgICogLSB7QGxpbmsgU0VNQU5USUNfVEFOR0VOVH1cbiAgICAgKiAtIHtAbGluayBTRU1BTlRJQ19CTEVORFdFSUdIVH1cbiAgICAgKiAtIHtAbGluayBTRU1BTlRJQ19CTEVORElORElDRVN9XG4gICAgICogLSB7QGxpbmsgU0VNQU5USUNfQ09MT1J9XG4gICAgICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQwfVxuICAgICAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JEMX1cbiAgICAgKiAtIHtAbGluayBTRU1BTlRJQ19URVhDT09SRDJ9XG4gICAgICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQzfVxuICAgICAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JENH1cbiAgICAgKiAtIHtAbGluayBTRU1BTlRJQ19URVhDT09SRDV9XG4gICAgICogLSB7QGxpbmsgU0VNQU5USUNfVEVYQ09PUkQ2fVxuICAgICAqIC0ge0BsaW5rIFNFTUFOVElDX1RFWENPT1JEN31cbiAgICAgKlxuICAgICAqIElmIHZlcnRleCBkYXRhIGhhcyBhIG1lYW5pbmcgb3RoZXIgdGhhdCBvbmUgb2YgdGhvc2UgbGlzdGVkIGFib3ZlLCB1c2UgdGhlIHVzZXItZGVmaW5lZFxuICAgICAqIHNlbWFudGljczoge0BsaW5rIFNFTUFOVElDX0FUVFIwfSB0byB7QGxpbmsgU0VNQU5USUNfQVRUUjE1fS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGVzY3JpcHRpb25bXS5jb21wb25lbnRzIC0gVGhlIG51bWJlciBvZiBjb21wb25lbnRzIG9mIHRoZSB2ZXJ0ZXggYXR0cmlidXRlLlxuICAgICAqIENhbiBiZSAxLCAyLCAzIG9yIDQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRlc2NyaXB0aW9uW10udHlwZSAtIFRoZSBkYXRhIHR5cGUgb2YgdGhlIGF0dHJpYnV0ZS4gQ2FuIGJlOlxuICAgICAqXG4gICAgICogLSB7QGxpbmsgVFlQRV9JTlQ4fVxuICAgICAqIC0ge0BsaW5rIFRZUEVfVUlOVDh9XG4gICAgICogLSB7QGxpbmsgVFlQRV9JTlQxNn1cbiAgICAgKiAtIHtAbGluayBUWVBFX1VJTlQxNn1cbiAgICAgKiAtIHtAbGluayBUWVBFX0lOVDMyfVxuICAgICAqIC0ge0BsaW5rIFRZUEVfVUlOVDMyfVxuICAgICAqIC0ge0BsaW5rIFRZUEVfRkxPQVQzMn1cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Rlc2NyaXB0aW9uW10ubm9ybWFsaXplXSAtIElmIHRydWUsIHZlcnRleCBhdHRyaWJ1dGUgZGF0YSB3aWxsIGJlIG1hcHBlZFxuICAgICAqIGZyb20gYSAwIHRvIDI1NSByYW5nZSBkb3duIHRvIDAgdG8gMSB3aGVuIGZlZCB0byBhIHNoYWRlci4gSWYgZmFsc2UsIHZlcnRleCBhdHRyaWJ1dGUgZGF0YVxuICAgICAqIGlzIGxlZnQgdW5jaGFuZ2VkLiBJZiB0aGlzIHByb3BlcnR5IGlzIHVuc3BlY2lmaWVkLCBmYWxzZSBpcyBhc3N1bWVkLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbdmVydGV4Q291bnRdIC0gV2hlbiBzcGVjaWZpZWQsIHZlcnRleCBmb3JtYXQgd2lsbCBiZSBzZXQgdXAgZm9yXG4gICAgICogbm9uLWludGVybGVhdmVkIGZvcm1hdCB3aXRoIGEgc3BlY2lmaWVkIG51bWJlciBvZiB2ZXJ0aWNlcy4gKGV4YW1wbGU6IFBQUFBOTk5OQ0NDQyksIHdoZXJlXG4gICAgICogYXJyYXlzIG9mIGluZGl2aWR1YWwgYXR0cmlidXRlcyB3aWxsIGJlIHN0b3JlZCBvbmUgcmlnaHQgYWZ0ZXIgdGhlIG90aGVyIChzdWJqZWN0IHRvXG4gICAgICogYWxpZ25tZW50IHJlcXVpcmVtZW50cykuIE5vdGUgdGhhdCBpbiB0aGlzIGNhc2UsIHRoZSBmb3JtYXQgZGVwZW5kcyBvbiB0aGUgbnVtYmVyIG9mXG4gICAgICogdmVydGljZXMsIGFuZCBuZWVkcyB0byBjaGFuZ2Ugd2hlbiB0aGUgbnVtYmVyIG9mIHZlcnRpY2VzIGNoYW5nZXMuIFdoZW4gbm90IHNwZWNpZmllZCxcbiAgICAgKiB2ZXJ0ZXggZm9ybWF0IHdpbGwgYmUgaW50ZXJsZWF2ZWQuIChleGFtcGxlOiBQTkNQTkNQTkNQTkMpLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gU3BlY2lmeSAzLWNvbXBvbmVudCBwb3NpdGlvbnMgKHgsIHksIHopXG4gICAgICogdmFyIHZlcnRleEZvcm1hdCA9IG5ldyBwYy5WZXJ0ZXhGb3JtYXQoZ3JhcGhpY3NEZXZpY2UsIFtcbiAgICAgKiAgICAgeyBzZW1hbnRpYzogcGMuU0VNQU5USUNfUE9TSVRJT04sIGNvbXBvbmVudHM6IDMsIHR5cGU6IHBjLlRZUEVfRkxPQVQzMiB9XG4gICAgICogXSk7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBTcGVjaWZ5IDItY29tcG9uZW50IHBvc2l0aW9ucyAoeCwgeSksIGEgdGV4dHVyZSBjb29yZGluYXRlICh1LCB2KSBhbmQgYSB2ZXJ0ZXggY29sb3IgKHIsIGcsIGIsIGEpXG4gICAgICogdmFyIHZlcnRleEZvcm1hdCA9IG5ldyBwYy5WZXJ0ZXhGb3JtYXQoZ3JhcGhpY3NEZXZpY2UsIFtcbiAgICAgKiAgICAgeyBzZW1hbnRpYzogcGMuU0VNQU5USUNfUE9TSVRJT04sIGNvbXBvbmVudHM6IDIsIHR5cGU6IHBjLlRZUEVfRkxPQVQzMiB9LFxuICAgICAqICAgICB7IHNlbWFudGljOiBwYy5TRU1BTlRJQ19URVhDT09SRDAsIGNvbXBvbmVudHM6IDIsIHR5cGU6IHBjLlRZUEVfRkxPQVQzMiB9LFxuICAgICAqICAgICB7IHNlbWFudGljOiBwYy5TRU1BTlRJQ19DT0xPUiwgY29tcG9uZW50czogNCwgdHlwZTogcGMuVFlQRV9VSU5UOCwgbm9ybWFsaXplOiB0cnVlIH1cbiAgICAgKiBdKTtcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihncmFwaGljc0RldmljZSwgZGVzY3JpcHRpb24sIHZlcnRleENvdW50KSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRzID0gW107XG4gICAgICAgIHRoaXMuaGFzVXYwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaGFzVXYxID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaGFzQ29sb3IgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5oYXNUYW5nZW50cyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZlcnRpY2VzQnl0ZVNpemUgPSAwO1xuICAgICAgICB0aGlzLnZlcnRleENvdW50ID0gdmVydGV4Q291bnQ7XG4gICAgICAgIHRoaXMuaW50ZXJsZWF2ZWQgPSB2ZXJ0ZXhDb3VudCA9PT0gdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0b3RhbCBzaXplIG9mIHRoZSB2ZXJ0ZXhcbiAgICAgICAgdGhpcy5zaXplID0gZGVzY3JpcHRpb24ucmVkdWNlKCh0b3RhbCwgZGVzYykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRvdGFsICsgTWF0aC5jZWlsKGRlc2MuY29tcG9uZW50cyAqIHR5cGVkQXJyYXlUeXBlc0J5dGVTaXplW2Rlc2MudHlwZV0gLyA0KSAqIDQ7XG4gICAgICAgIH0sIDApO1xuXG4gICAgICAgIGxldCBvZmZzZXQgPSAwLCBlbGVtZW50U2l6ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGRlc2NyaXB0aW9uLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50RGVzYyA9IGRlc2NyaXB0aW9uW2ldO1xuXG4gICAgICAgICAgICAvLyBhbGlnbiB1cCB0aGUgb2Zmc2V0IHRvIGVsZW1lbnRTaXplICh3aGVuIHZlcnRleENvdW50IGlzIHNwZWNpZmllZCBvbmx5IC0gY2FzZSBvZiBub24taW50ZXJsZWF2ZWQgZm9ybWF0KVxuICAgICAgICAgICAgZWxlbWVudFNpemUgPSBlbGVtZW50RGVzYy5jb21wb25lbnRzICogdHlwZWRBcnJheVR5cGVzQnl0ZVNpemVbZWxlbWVudERlc2MudHlwZV07XG4gICAgICAgICAgICBpZiAodmVydGV4Q291bnQpIHtcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBtYXRoLnJvdW5kVXAob2Zmc2V0LCBlbGVtZW50U2l6ZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBub24taW50ZXJsZWF2ZWQgZm9ybWF0IHdpdGggZWxlbWVudFNpemUgbm90IG11bHRpcGxlIG9mIDQgbWlnaHQgYmUgc2xvd2VyIG9uIHNvbWUgcGxhdGZvcm1zIC0gcGFkZGluZyBpcyByZWNvbW1lbmRlZCB0byBhbGlnbiBpdHMgc2l6ZVxuICAgICAgICAgICAgICAgIC8vIGV4YW1wbGU6IHVzZSA0IHggVFlQRV9VSU5UOCBpbnN0ZWFkIG9mIDMgeCBUWVBFX1VJTlQ4XG4gICAgICAgICAgICAgICAgRGVidWcuYXNzZXJ0KChlbGVtZW50U2l6ZSAlIDQpID09PSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgTm9uLWludGVybGVhdmVkIHZlcnRleCBmb3JtYXQgd2l0aCBlbGVtZW50IHNpemUgbm90IG11bHRpcGxlIG9mIDQgY2FuIGhhdmUgcGVyZm9ybWFuY2UgaW1wYWN0IG9uIHNvbWUgcGxhdGZvcm1zLiBFbGVtZW50IHNpemU6ICR7ZWxlbWVudFNpemV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogZWxlbWVudERlc2Muc2VtYW50aWMsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiAodmVydGV4Q291bnQgPyBvZmZzZXQgOiAoZWxlbWVudERlc2MuaGFzT3duUHJvcGVydHkoJ29mZnNldCcpID8gZWxlbWVudERlc2Mub2Zmc2V0IDogb2Zmc2V0KSksXG4gICAgICAgICAgICAgICAgc3RyaWRlOiAodmVydGV4Q291bnQgPyBlbGVtZW50U2l6ZSA6IChlbGVtZW50RGVzYy5oYXNPd25Qcm9wZXJ0eSgnc3RyaWRlJykgPyBlbGVtZW50RGVzYy5zdHJpZGUgOiB0aGlzLnNpemUpKSxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogZWxlbWVudERlc2MudHlwZSxcbiAgICAgICAgICAgICAgICBudW1Db21wb25lbnRzOiBlbGVtZW50RGVzYy5jb21wb25lbnRzLFxuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZTogKGVsZW1lbnREZXNjLm5vcm1hbGl6ZSA9PT0gdW5kZWZpbmVkKSA/IGZhbHNlIDogZWxlbWVudERlc2Mubm9ybWFsaXplLFxuICAgICAgICAgICAgICAgIHNpemU6IGVsZW1lbnRTaXplXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHMucHVzaChlbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKHZlcnRleENvdW50KSB7XG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9IGVsZW1lbnRTaXplICogdmVydGV4Q291bnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSBNYXRoLmNlaWwoZWxlbWVudFNpemUgLyA0KSAqIDQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50RGVzYy5zZW1hbnRpYyA9PT0gU0VNQU5USUNfVEVYQ09PUkQwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYXNVdjAgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50RGVzYy5zZW1hbnRpYyA9PT0gU0VNQU5USUNfVEVYQ09PUkQxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYXNVdjEgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50RGVzYy5zZW1hbnRpYyA9PT0gU0VNQU5USUNfQ09MT1IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhc0NvbG9yID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudERlc2Muc2VtYW50aWMgPT09IFNFTUFOVElDX1RBTkdFTlQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhc1RhbmdlbnRzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2ZXJ0ZXhDb3VudCkge1xuICAgICAgICAgICAgdGhpcy52ZXJ0aWNlc0J5dGVTaXplID0gb2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZXZhbHVhdGVIYXNoKCk7XG4gICAgfVxuXG4gICAgZ2V0IGVsZW1lbnRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1ZlcnRleEZvcm1hdH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHN0YXRpYyBfZGVmYXVsdEluc3RhbmNpbmdGb3JtYXQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHtAbGluayBWZXJ0ZXhGb3JtYXR9IHVzZWQgdG8gc3RvcmUgbWF0cmljZXMgb2YgdHlwZSB7QGxpbmsgTWF0NH0gZm9yIGhhcmR3YXJlIGluc3RhbmNpbmcuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7VmVydGV4Rm9ybWF0fVxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgZGVmYXVsdEluc3RhbmNpbmdGb3JtYXQoKSB7XG5cbiAgICAgICAgaWYgKCFWZXJ0ZXhGb3JtYXQuX2RlZmF1bHRJbnN0YW5jaW5nRm9ybWF0KSB7XG4gICAgICAgICAgICBWZXJ0ZXhGb3JtYXQuX2RlZmF1bHRJbnN0YW5jaW5nRm9ybWF0ID0gbmV3IFZlcnRleEZvcm1hdChudWxsLCBbXG4gICAgICAgICAgICAgICAgeyBzZW1hbnRpYzogU0VNQU5USUNfQVRUUjEyLCBjb21wb25lbnRzOiA0LCB0eXBlOiBUWVBFX0ZMT0FUMzIgfSxcbiAgICAgICAgICAgICAgICB7IHNlbWFudGljOiBTRU1BTlRJQ19BVFRSMTMsIGNvbXBvbmVudHM6IDQsIHR5cGU6IFRZUEVfRkxPQVQzMiB9LFxuICAgICAgICAgICAgICAgIHsgc2VtYW50aWM6IFNFTUFOVElDX0FUVFIxNCwgY29tcG9uZW50czogNCwgdHlwZTogVFlQRV9GTE9BVDMyIH0sXG4gICAgICAgICAgICAgICAgeyBzZW1hbnRpYzogU0VNQU5USUNfQVRUUjE1LCBjb21wb25lbnRzOiA0LCB0eXBlOiBUWVBFX0ZMT0FUMzIgfVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gVmVydGV4Rm9ybWF0Ll9kZWZhdWx0SW5zdGFuY2luZ0Zvcm1hdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFdmFsdWF0ZXMgaGFzaCB2YWx1ZXMgZm9yIHRoZSBmb3JtYXQgYWxsb3dpbmcgZmFzdCBjb21wYXJlIG9mIGJhdGNoaW5nIC8gcmVuZGVyaW5nIGNvbXBhdGliaWxpdHkuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9ldmFsdWF0ZUhhc2goKSB7XG4gICAgICAgIGxldCBzdHJpbmdFbGVtZW50QmF0Y2g7XG4gICAgICAgIGNvbnN0IHN0cmluZ0VsZW1lbnRzQmF0Y2ggPSBbXTtcbiAgICAgICAgbGV0IHN0cmluZ0VsZW1lbnRSZW5kZXI7XG4gICAgICAgIGNvbnN0IHN0cmluZ0VsZW1lbnRzUmVuZGVyID0gW107XG4gICAgICAgIGNvbnN0IGxlbiA9IHRoaXMuX2VsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRzW2ldO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgc3RyaW5nIGRlc2NyaXB0aW9uIG9mIGVhY2ggZWxlbWVudCB0aGF0IGlzIHJlbGV2YW50IGZvciBiYXRjaGluZ1xuICAgICAgICAgICAgc3RyaW5nRWxlbWVudEJhdGNoID0gZWxlbWVudC5uYW1lO1xuICAgICAgICAgICAgc3RyaW5nRWxlbWVudEJhdGNoICs9IGVsZW1lbnQuZGF0YVR5cGU7XG4gICAgICAgICAgICBzdHJpbmdFbGVtZW50QmF0Y2ggKz0gZWxlbWVudC5udW1Db21wb25lbnRzO1xuICAgICAgICAgICAgc3RyaW5nRWxlbWVudEJhdGNoICs9IGVsZW1lbnQubm9ybWFsaXplO1xuICAgICAgICAgICAgc3RyaW5nRWxlbWVudHNCYXRjaC5wdXNoKHN0cmluZ0VsZW1lbnRCYXRjaCk7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBzdHJpbmcgZGVzY3JpcHRpb24gb2YgZWFjaCBlbGVtZW50IHRoYXQgaXMgcmVsZXZhbnQgZm9yIHJlbmRlcmluZ1xuICAgICAgICAgICAgc3RyaW5nRWxlbWVudFJlbmRlciA9IHN0cmluZ0VsZW1lbnRCYXRjaDtcbiAgICAgICAgICAgIHN0cmluZ0VsZW1lbnRSZW5kZXIgKz0gZWxlbWVudC5vZmZzZXQ7XG4gICAgICAgICAgICBzdHJpbmdFbGVtZW50UmVuZGVyICs9IGVsZW1lbnQuc3RyaWRlO1xuICAgICAgICAgICAgc3RyaW5nRWxlbWVudFJlbmRlciArPSBlbGVtZW50LnNpemU7XG4gICAgICAgICAgICBzdHJpbmdFbGVtZW50c1JlbmRlci5wdXNoKHN0cmluZ0VsZW1lbnRSZW5kZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc29ydCBiYXRjaGluZyBvbmVzIGFscGhhYmV0aWNhbGx5IHRvIG1ha2UgdGhlIGhhc2ggb3JkZXIgaW5kZXBlbmRlbnRcbiAgICAgICAgc3RyaW5nRWxlbWVudHNCYXRjaC5zb3J0KCk7XG4gICAgICAgIHRoaXMuYmF0Y2hpbmdIYXNoID0gaGFzaENvZGUoc3RyaW5nRWxlbWVudHNCYXRjaC5qb2luKCkpO1xuXG4gICAgICAgIC8vIHJlbmRlcmluZyBoYXNoXG4gICAgICAgIHRoaXMucmVuZGVyaW5naW5nSGFzaFN0cmluZyA9IHN0cmluZ0VsZW1lbnRzUmVuZGVyLmpvaW4oJ18nKTtcbiAgICAgICAgdGhpcy5yZW5kZXJpbmdpbmdIYXNoID0gaGFzaENvZGUodGhpcy5yZW5kZXJpbmdpbmdIYXNoU3RyaW5nKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFZlcnRleEZvcm1hdCB9O1xuIl0sIm5hbWVzIjpbIlZlcnRleEZvcm1hdCIsImNvbnN0cnVjdG9yIiwiZ3JhcGhpY3NEZXZpY2UiLCJkZXNjcmlwdGlvbiIsInZlcnRleENvdW50IiwiX2VsZW1lbnRzIiwiaGFzVXYwIiwiaGFzVXYxIiwiaGFzQ29sb3IiLCJoYXNUYW5nZW50cyIsInZlcnRpY2VzQnl0ZVNpemUiLCJpbnRlcmxlYXZlZCIsInVuZGVmaW5lZCIsInNpemUiLCJyZWR1Y2UiLCJ0b3RhbCIsImRlc2MiLCJNYXRoIiwiY2VpbCIsImNvbXBvbmVudHMiLCJ0eXBlZEFycmF5VHlwZXNCeXRlU2l6ZSIsInR5cGUiLCJvZmZzZXQiLCJlbGVtZW50U2l6ZSIsImkiLCJsZW4iLCJsZW5ndGgiLCJlbGVtZW50RGVzYyIsIm1hdGgiLCJyb3VuZFVwIiwiRGVidWciLCJhc3NlcnQiLCJlbGVtZW50IiwibmFtZSIsInNlbWFudGljIiwiaGFzT3duUHJvcGVydHkiLCJzdHJpZGUiLCJkYXRhVHlwZSIsIm51bUNvbXBvbmVudHMiLCJub3JtYWxpemUiLCJwdXNoIiwiU0VNQU5USUNfVEVYQ09PUkQwIiwiU0VNQU5USUNfVEVYQ09PUkQxIiwiU0VNQU5USUNfQ09MT1IiLCJTRU1BTlRJQ19UQU5HRU5UIiwiX2V2YWx1YXRlSGFzaCIsImVsZW1lbnRzIiwiZGVmYXVsdEluc3RhbmNpbmdGb3JtYXQiLCJfZGVmYXVsdEluc3RhbmNpbmdGb3JtYXQiLCJTRU1BTlRJQ19BVFRSMTIiLCJUWVBFX0ZMT0FUMzIiLCJTRU1BTlRJQ19BVFRSMTMiLCJTRU1BTlRJQ19BVFRSMTQiLCJTRU1BTlRJQ19BVFRSMTUiLCJzdHJpbmdFbGVtZW50QmF0Y2giLCJzdHJpbmdFbGVtZW50c0JhdGNoIiwic3RyaW5nRWxlbWVudFJlbmRlciIsInN0cmluZ0VsZW1lbnRzUmVuZGVyIiwic29ydCIsImJhdGNoaW5nSGFzaCIsImhhc2hDb2RlIiwiam9pbiIsInJlbmRlcmluZ2luZ0hhc2hTdHJpbmciLCJyZW5kZXJpbmdpbmdIYXNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBeURBLE1BQU1BLFlBQU4sQ0FBbUI7QUE0RGZDLEVBQUFBLFdBQVcsQ0FBQ0MsY0FBRCxFQUFpQkMsV0FBakIsRUFBOEJDLFdBQTlCLEVBQTJDO0lBQ2xELElBQUtDLENBQUFBLFNBQUwsR0FBaUIsRUFBakIsQ0FBQTtJQUNBLElBQUtDLENBQUFBLE1BQUwsR0FBYyxLQUFkLENBQUE7SUFDQSxJQUFLQyxDQUFBQSxNQUFMLEdBQWMsS0FBZCxDQUFBO0lBQ0EsSUFBS0MsQ0FBQUEsUUFBTCxHQUFnQixLQUFoQixDQUFBO0lBQ0EsSUFBS0MsQ0FBQUEsV0FBTCxHQUFtQixLQUFuQixDQUFBO0lBQ0EsSUFBS0MsQ0FBQUEsZ0JBQUwsR0FBd0IsQ0FBeEIsQ0FBQTtJQUNBLElBQUtOLENBQUFBLFdBQUwsR0FBbUJBLFdBQW5CLENBQUE7QUFDQSxJQUFBLElBQUEsQ0FBS08sV0FBTCxHQUFtQlAsV0FBVyxLQUFLUSxTQUFuQyxDQUFBO0lBR0EsSUFBS0MsQ0FBQUEsSUFBTCxHQUFZVixXQUFXLENBQUNXLE1BQVosQ0FBbUIsQ0FBQ0MsS0FBRCxFQUFRQyxJQUFSLEtBQWlCO0FBQzVDLE1BQUEsT0FBT0QsS0FBSyxHQUFHRSxJQUFJLENBQUNDLElBQUwsQ0FBVUYsSUFBSSxDQUFDRyxVQUFMLEdBQWtCQyx1QkFBdUIsQ0FBQ0osSUFBSSxDQUFDSyxJQUFOLENBQXpDLEdBQXVELENBQWpFLElBQXNFLENBQXJGLENBQUE7S0FEUSxFQUVULENBRlMsQ0FBWixDQUFBO0lBSUEsSUFBSUMsTUFBTSxHQUFHLENB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
