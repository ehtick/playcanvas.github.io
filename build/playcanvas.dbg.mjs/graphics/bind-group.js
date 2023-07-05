/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { UNIFORM_BUFFER_DEFAULT_SLOT_NAME } from './constants.js';
import { Debug } from '../core/debug.js';

class BindGroup {
  constructor(graphicsDevice, format, defaultUniformBuffer) {
    this.device = graphicsDevice;
    this.format = format;
    this.dirty = true;
    this.impl = graphicsDevice.createBindGroupImpl(this);
    this.textures = [];
    this.uniformBuffers = [];
    this.defaultUniformBuffer = defaultUniformBuffer;

    if (defaultUniformBuffer) {
      this.setUniformBuffer(UNIFORM_BUFFER_DEFAULT_SLOT_NAME, defaultUniformBuffer);
    }
  }

  destroy() {
    this.impl.destroy();
    this.impl = null;
    this.format = null;
    this.defaultUniformBuffer = null;
  }

  setUniformBuffer(name, uniformBuffer) {
    const index = this.format.bufferFormatsMap.get(name);
    Debug.assert(index !== undefined, `Setting a uniform [${name}] on a bind group which does not contain in.`);

    if (this.uniformBuffers[index] !== uniformBuffer) {
      this.uniformBuffers[index] = uniformBuffer;
      this.dirty = true;
    }
  }

  setTexture(name, texture) {
    const index = this.format.textureFormatsMap.get(name);
    Debug.assert(index !== undefined, `Setting a texture [${name}] on a bind group which does not contain in.`);

    if (this.textures[index] !== texture) {
      this.textures[index] = texture;
      this.dirty = true;
    }
  }

  update() {
    const textureFormats = this.format.textureFormats;

    for (let i = 0; i < textureFormats.length; i++) {
      const textureFormat = textureFormats[i];
      const value = textureFormat.scopeId.value;
      Debug.assert(value, `Value was not set when assigning texture slot [${textureFormat.name}] to a bind group.`);
      this.setTexture(textureFormat.name, value);
    }

    if (this.dirty) {
      this.dirty = false;
      this.impl.update(this);
    }
  }

}

export { BindGroup };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZC1ncm91cC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dyYXBoaWNzL2JpbmQtZ3JvdXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVU5JRk9STV9CVUZGRVJfREVGQVVMVF9TTE9UX05BTUUgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL2dyYXBoaWNzLWRldmljZS5qcycpLkdyYXBoaWNzRGV2aWNlfSBHcmFwaGljc0RldmljZSAqL1xuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4vdGV4dHVyZS5qcycpLlRleHR1cmV9IFRleHR1cmUgKi9cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL2JpbmQtZ3JvdXAtZm9ybWF0LmpzJykuQmluZEdyb3VwRm9ybWF0fSBCaW5kR3JvdXBGb3JtYXQgKi9cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL3VuaWZvcm0tYnVmZmVyLmpzJykuVW5pZm9ybUJ1ZmZlcn0gVW5pZm9ybUJ1ZmZlciAqL1xuXG5pbXBvcnQgeyBEZWJ1ZyB9IGZyb20gJy4uL2NvcmUvZGVidWcuanMnO1xuXG4vKipcbiAqIEEgYmluZCBncm91cCByZXByZXNlbnRzIGFuIGNvbGxlY3Rpb24gb2Yge0BsaW5rIFVuaWZvcm1CdWZmZXJ9IGFuZCB7QGxpbmsgVGV4dHVyZX0gaW5zdGFuY2UsXG4gKiB3aGljaCBjYW4gYmUgYmluZCBvbiBhIEdQVSBmb3IgcmVuZGVyaW5nLlxuICpcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgQmluZEdyb3VwIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgQmluZCBHcm91cC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7R3JhcGhpY3NEZXZpY2V9IGdyYXBoaWNzRGV2aWNlIC0gVGhlIGdyYXBoaWNzIGRldmljZSB1c2VkIHRvIG1hbmFnZSB0aGlzIHVuaWZvcm0gYnVmZmVyLlxuICAgICAqIEBwYXJhbSB7QmluZEdyb3VwRm9ybWF0fSBmb3JtYXQgLSBGb3JtYXQgb2YgdGhlIGJpbmQgZ3JvdXAuXG4gICAgICogQHBhcmFtIHtVbmlmb3JtQnVmZmVyfSBbZGVmYXVsdFVuaWZvcm1CdWZmZXJdIC0gVGhlIGRlZmF1bHQgdW5pZm9ybSBidWZmZXIuIFR5cGljYWxseSBhIGJpbmQgZ3JvdXAgb25seVxuICAgICAqIGhhcyBhIHNpbmdsZSB1bmlmb3JtIGJ1ZmZlciwgYW5kIHRoaXMgYWxsb3dzIGVhc2llciBhY2Nlc3MuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZ3JhcGhpY3NEZXZpY2UsIGZvcm1hdCwgZGVmYXVsdFVuaWZvcm1CdWZmZXIpIHtcbiAgICAgICAgdGhpcy5kZXZpY2UgPSBncmFwaGljc0RldmljZTtcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBmb3JtYXQ7XG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICAgICB0aGlzLmltcGwgPSBncmFwaGljc0RldmljZS5jcmVhdGVCaW5kR3JvdXBJbXBsKHRoaXMpO1xuXG4gICAgICAgIHRoaXMudGV4dHVyZXMgPSBbXTtcbiAgICAgICAgdGhpcy51bmlmb3JtQnVmZmVycyA9IFtdO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7VW5pZm9ybUJ1ZmZlcn0gKi9cbiAgICAgICAgdGhpcy5kZWZhdWx0VW5pZm9ybUJ1ZmZlciA9IGRlZmF1bHRVbmlmb3JtQnVmZmVyO1xuICAgICAgICBpZiAoZGVmYXVsdFVuaWZvcm1CdWZmZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VW5pZm9ybUJ1ZmZlcihVTklGT1JNX0JVRkZFUl9ERUZBVUxUX1NMT1RfTkFNRSwgZGVmYXVsdFVuaWZvcm1CdWZmZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnJlZXMgcmVzb3VyY2VzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGJpbmQgZ3JvdXAuXG4gICAgICovXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5pbXBsLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5pbXBsID0gbnVsbDtcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBudWxsO1xuICAgICAgICB0aGlzLmRlZmF1bHRVbmlmb3JtQnVmZmVyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBc3NpZ24gYSB1bmlmb3JtIGJ1ZmZlciB0byBhIHNsb3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB1bmlmb3JtIGJ1ZmZlciBzbG90XG4gICAgICogQHBhcmFtIHtVbmlmb3JtQnVmZmVyfSB1bmlmb3JtQnVmZmVyIC0gVGhlIFVuaWZvcm0gYnVmZmVyIHRvIGFzc2lnbiB0byB0aGUgc2xvdC5cbiAgICAgKi9cbiAgICBzZXRVbmlmb3JtQnVmZmVyKG5hbWUsIHVuaWZvcm1CdWZmZXIpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmZvcm1hdC5idWZmZXJGb3JtYXRzTWFwLmdldChuYW1lKTtcbiAgICAgICAgRGVidWcuYXNzZXJ0KGluZGV4ICE9PSB1bmRlZmluZWQsIGBTZXR0aW5nIGEgdW5pZm9ybSBbJHtuYW1lfV0gb24gYSBiaW5kIGdyb3VwIHdoaWNoIGRvZXMgbm90IGNvbnRhaW4gaW4uYCk7XG4gICAgICAgIGlmICh0aGlzLnVuaWZvcm1CdWZmZXJzW2luZGV4XSAhPT0gdW5pZm9ybUJ1ZmZlcikge1xuICAgICAgICAgICAgdGhpcy51bmlmb3JtQnVmZmVyc1tpbmRleF0gPSB1bmlmb3JtQnVmZmVyO1xuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBc3NpZ24gYSB0ZXh0dXJlIHRvIGEgbmFtZWQgc2xvdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHRleHR1cmUgc2xvdC5cbiAgICAgKiBAcGFyYW0ge1RleHR1cmV9IHRleHR1cmUgLSBUZXh0dXJlIHRvIGFzc2lnbiB0byB0aGUgc2xvdC5cbiAgICAgKi9cbiAgICBzZXRUZXh0dXJlKG5hbWUsIHRleHR1cmUpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmZvcm1hdC50ZXh0dXJlRm9ybWF0c01hcC5nZXQobmFtZSk7XG4gICAgICAgIERlYnVnLmFzc2VydChpbmRleCAhPT0gdW5kZWZpbmVkLCBgU2V0dGluZyBhIHRleHR1cmUgWyR7bmFtZX1dIG9uIGEgYmluZCBncm91cCB3aGljaCBkb2VzIG5vdCBjb250YWluIGluLmApO1xuICAgICAgICBpZiAodGhpcy50ZXh0dXJlc1tpbmRleF0gIT09IHRleHR1cmUpIHtcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZXNbaW5kZXhdID0gdGV4dHVyZTtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXBwbGllcyBhbnkgY2hhbmdlcyBtYWRlIHRvIHRoZSBiaW5kIGdyb3VwJ3MgcHJvcGVydGllcy5cbiAgICAgKi9cbiAgICB1cGRhdGUoKSB7XG5cbiAgICAgICAgY29uc3QgdGV4dHVyZUZvcm1hdHMgPSB0aGlzLmZvcm1hdC50ZXh0dXJlRm9ybWF0cztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0dXJlRm9ybWF0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgdGV4dHVyZUZvcm1hdCA9IHRleHR1cmVGb3JtYXRzW2ldO1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0ZXh0dXJlRm9ybWF0LnNjb3BlSWQudmFsdWU7XG4gICAgICAgICAgICBEZWJ1Zy5hc3NlcnQodmFsdWUsIGBWYWx1ZSB3YXMgbm90IHNldCB3aGVuIGFzc2lnbmluZyB0ZXh0dXJlIHNsb3QgWyR7dGV4dHVyZUZvcm1hdC5uYW1lfV0gdG8gYSBiaW5kIGdyb3VwLmApO1xuICAgICAgICAgICAgdGhpcy5zZXRUZXh0dXJlKHRleHR1cmVGb3JtYXQubmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaW1wbC51cGRhdGUodGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IEJpbmRHcm91cCB9O1xuIl0sIm5hbWVzIjpbIkJpbmRHcm91cCIsImNvbnN0cnVjdG9yIiwiZ3JhcGhpY3NEZXZpY2UiLCJmb3JtYXQiLCJkZWZhdWx0VW5pZm9ybUJ1ZmZlciIsImRldmljZSIsImRpcnR5IiwiaW1wbCIsImNyZWF0ZUJpbmRHcm91cEltcGwiLCJ0ZXh0dXJlcyIsInVuaWZvcm1CdWZmZXJzIiwic2V0VW5pZm9ybUJ1ZmZlciIsIlVOSUZPUk1fQlVGRkVSX0RFRkFVTFRfU0xPVF9OQU1FIiwiZGVzdHJveSIsIm5hbWUiLCJ1bmlmb3JtQnVmZmVyIiwiaW5kZXgiLCJidWZmZXJGb3JtYXRzTWFwIiwiZ2V0IiwiRGVidWciLCJhc3NlcnQiLCJ1bmRlZmluZWQiLCJzZXRUZXh0dXJlIiwidGV4dHVyZSIsInRleHR1cmVGb3JtYXRzTWFwIiwidXBkYXRlIiwidGV4dHVyZUZvcm1hdHMiLCJpIiwibGVuZ3RoIiwidGV4dHVyZUZvcm1hdCIsInZhbHVlIiwic2NvcGVJZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFlQSxNQUFNQSxTQUFOLENBQWdCO0FBU1pDLEVBQUFBLFdBQVcsQ0FBQ0MsY0FBRCxFQUFpQkMsTUFBakIsRUFBeUJDLG9CQUF6QixFQUErQztJQUN0RCxJQUFLQyxDQUFBQSxNQUFMLEdBQWNILGNBQWQsQ0FBQTtJQUNBLElBQUtDLENBQUFBLE1BQUwsR0FBY0EsTUFBZCxDQUFBO0lBQ0EsSUFBS0csQ0FBQUEsS0FBTCxHQUFhLElBQWIsQ0FBQTtBQUNBLElBQUEsSUFBQSxDQUFLQyxJQUFMLEdBQVlMLGNBQWMsQ0FBQ00sbUJBQWYsQ0FBbUMsSUFBbkMsQ0FBWixDQUFBO0lBRUEsSUFBS0MsQ0FBQUEsUUFBTCxHQUFnQixFQUFoQixDQUFBO0lBQ0EsSUFBS0Ms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
