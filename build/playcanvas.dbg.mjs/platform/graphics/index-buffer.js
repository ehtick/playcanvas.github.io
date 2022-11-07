/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../core/debug.js';
import { TRACEID_VRAM_IB } from '../../core/constants.js';
import { typedArrayIndexFormatsByteSize, BUFFER_STATIC, INDEXFORMAT_UINT32, INDEXFORMAT_UINT16 } from './constants.js';

let id = 0;

class IndexBuffer {
  constructor(graphicsDevice, format, numIndices, usage = BUFFER_STATIC, initialData) {
    this.device = graphicsDevice;
    this.format = format;
    this.numIndices = numIndices;
    this.usage = usage;
    this.id = id++;
    this.impl = graphicsDevice.createIndexBufferImpl(this);

    const bytesPerIndex = typedArrayIndexFormatsByteSize[format];
    this.bytesPerIndex = bytesPerIndex;
    this.numBytes = this.numIndices * bytesPerIndex;
    if (initialData) {
      this.setData(initialData);
    } else {
      this.storage = new ArrayBuffer(this.numBytes);
    }
    this.adjustVramSizeTracking(graphicsDevice._vram, this.numBytes);
    this.device.buffers.push(this);
  }

  destroy() {
    const device = this.device;
    const idx = device.buffers.indexOf(this);
    if (idx !== -1) {
      device.buffers.splice(idx, 1);
    }
    if (this.device.indexBuffer === this) {
      this.device.indexBuffer = null;
    }
    if (this.impl.initialized) {
      this.impl.destroy(device);
      this.adjustVramSizeTracking(device._vram, -this.storage.byteLength);
    }
  }
  adjustVramSizeTracking(vram, size) {
    Debug.trace(TRACEID_VRAM_IB, `${this.id} size: ${size} vram.ib: ${vram.ib} => ${vram.ib + size}`);
    vram.ib += size;
  }

  loseContext() {
    this.impl.loseContext();
  }

  getFormat() {
    return this.format;
  }

  getNumIndices() {
    return this.numIndices;
  }

  lock() {
    return this.storage;
  }

  unlock() {
    this.impl.unlock(this);
  }

  setData(data) {
    if (data.byteLength !== this.numBytes) {
      Debug.error(`IndexBuffer: wrong initial data size: expected ${this.numBytes}, got ${data.byteLength}`);
      return false;
    }
    this.storage = data;
    this.unlock();
    return true;
  }

  _lockTypedArray() {
    const lock = this.lock();
    const indices = this.format === INDEXFORMAT_UINT32 ? new Uint32Array(lock) : this.format === INDEXFORMAT_UINT16 ? new Uint16Array(lock) : new Uint8Array(lock);
    return indices;
  }

  writeData(data, count) {
    const indices = this._lockTypedArray();

    if (data.length > count) {
      if (ArrayBuffer.isView(data)) {
        data = data.subarray(0, count);
        indices.set(data);
      } else {
        for (let i = 0; i < count; i++) indices[i] = data[i];
      }
    } else {
      indices.set(data);
    }
    this.unlock();
  }

  readData(data) {
    const indices = this._lockTypedArray();
    const count = this.numIndices;
    if (ArrayBuffer.isView(data)) {
      data.set(indices);
    } else {
      data.length = 0;
      for (let i = 0; i < count; i++) data[i] = indices[i];
    }
    return count;
  }
}

export { IndexBuffer };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtYnVmZmVyLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcGxhdGZvcm0vZ3JhcGhpY3MvaW5kZXgtYnVmZmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERlYnVnIH0gZnJvbSAnLi4vLi4vY29yZS9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBUUkFDRUlEX1ZSQU1fSUIgfSBmcm9tICcuLi8uLi9jb3JlL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQge1xuICAgIEJVRkZFUl9TVEFUSUMsIElOREVYRk9STUFUX1VJTlQxNiwgSU5ERVhGT1JNQVRfVUlOVDMyLCB0eXBlZEFycmF5SW5kZXhGb3JtYXRzQnl0ZVNpemVcbn0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi9ncmFwaGljcy1kZXZpY2UuanMnKS5HcmFwaGljc0RldmljZX0gR3JhcGhpY3NEZXZpY2UgKi9cblxubGV0IGlkID0gMDtcblxuLyoqXG4gKiBBbiBpbmRleCBidWZmZXIgc3RvcmVzIGluZGV4IHZhbHVlcyBpbnRvIGEge0BsaW5rIFZlcnRleEJ1ZmZlcn0uIEluZGV4ZWQgZ3JhcGhpY2FsIHByaW1pdGl2ZXNcbiAqIGNhbiBub3JtYWxseSB1dGlsaXplIGxlc3MgbWVtb3J5IHRoYXQgdW5pbmRleGVkIHByaW1pdGl2ZXMgKGlmIHZlcnRpY2VzIGFyZSBzaGFyZWQpLlxuICpcbiAqIFR5cGljYWxseSwgaW5kZXggYnVmZmVycyBhcmUgc2V0IG9uIHtAbGluayBNZXNofSBvYmplY3RzLlxuICovXG5jbGFzcyBJbmRleEJ1ZmZlciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IEluZGV4QnVmZmVyIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtHcmFwaGljc0RldmljZX0gZ3JhcGhpY3NEZXZpY2UgLSBUaGUgZ3JhcGhpY3MgZGV2aWNlIHVzZWQgdG8gbWFuYWdlIHRoaXMgaW5kZXhcbiAgICAgKiBidWZmZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGZvcm1hdCAtIFRoZSB0eXBlIG9mIGVhY2ggaW5kZXggdG8gYmUgc3RvcmVkIGluIHRoZSBpbmRleCBidWZmZXIuIENhbiBiZTpcbiAgICAgKlxuICAgICAqIC0ge0BsaW5rIElOREVYRk9STUFUX1VJTlQ4fVxuICAgICAqIC0ge0BsaW5rIElOREVYRk9STUFUX1VJTlQxNn1cbiAgICAgKiAtIHtAbGluayBJTkRFWEZPUk1BVF9VSU5UMzJ9XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG51bUluZGljZXMgLSBUaGUgbnVtYmVyIG9mIGluZGljZXMgdG8gYmUgc3RvcmVkIGluIHRoZSBpbmRleCBidWZmZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt1c2FnZV0gLSBUaGUgdXNhZ2UgdHlwZSBvZiB0aGUgdmVydGV4IGJ1ZmZlci4gQ2FuIGJlOlxuICAgICAqXG4gICAgICogLSB7QGxpbmsgQlVGRkVSX0RZTkFNSUN9XG4gICAgICogLSB7QGxpbmsgQlVGRkVSX1NUQVRJQ31cbiAgICAgKiAtIHtAbGluayBCVUZGRVJfU1RSRUFNfVxuICAgICAqXG4gICAgICogRGVmYXVsdHMgdG8ge0BsaW5rIEJVRkZFUl9TVEFUSUN9LlxuICAgICAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IFtpbml0aWFsRGF0YV0gLSBJbml0aWFsIGRhdGEuIElmIGxlZnQgdW5zcGVjaWZpZWQsIHRoZSBpbmRleCBidWZmZXJcbiAgICAgKiB3aWxsIGJlIGluaXRpYWxpemVkIHRvIHplcm9zLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gQ3JlYXRlIGFuIGluZGV4IGJ1ZmZlciBob2xkaW5nIDMgMTYtYml0IGluZGljZXMuIFRoZSBidWZmZXIgaXMgbWFya2VkIGFzXG4gICAgICogLy8gc3RhdGljLCBoaW50aW5nIHRoYXQgdGhlIGJ1ZmZlciB3aWxsIG5ldmVyIGJlIG1vZGlmaWVkLlxuICAgICAqIHZhciBpbmRpY2VzID0gbmV3IFVJbnQxNkFycmF5KFswLCAxLCAyXSk7XG4gICAgICogdmFyIGluZGV4QnVmZmVyID0gbmV3IHBjLkluZGV4QnVmZmVyKGdyYXBoaWNzRGV2aWNlLFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYy5JTkRFWEZPUk1BVF9VSU5UMTYsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDMsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBjLkJVRkZFUl9TVEFUSUMsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGljZXMpO1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGdyYXBoaWNzRGV2aWNlLCBmb3JtYXQsIG51bUluZGljZXMsIHVzYWdlID0gQlVGRkVSX1NUQVRJQywgaW5pdGlhbERhdGEpIHtcbiAgICAgICAgLy8gQnkgZGVmYXVsdCwgaW5kZXggYnVmZmVycyBhcmUgc3RhdGljIChiZXR0ZXIgZm9yIHBlcmZvcm1hbmNlIHNpbmNlIGJ1ZmZlciBkYXRhIGNhbiBiZSBjYWNoZWQgaW4gVlJBTSlcbiAgICAgICAgdGhpcy5kZXZpY2UgPSBncmFwaGljc0RldmljZTtcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBmb3JtYXQ7XG4gICAgICAgIHRoaXMubnVtSW5kaWNlcyA9IG51bUluZGljZXM7XG4gICAgICAgIHRoaXMudXNhZ2UgPSB1c2FnZTtcblxuICAgICAgICB0aGlzLmlkID0gaWQrKztcblxuICAgICAgICB0aGlzLmltcGwgPSBncmFwaGljc0RldmljZS5jcmVhdGVJbmRleEJ1ZmZlckltcGwodGhpcyk7XG5cbiAgICAgICAgLy8gQWxsb2NhdGUgdGhlIHN0b3JhZ2VcbiAgICAgICAgY29uc3QgYnl0ZXNQZXJJbmRleCA9IHR5cGVkQXJyYXlJbmRleEZvcm1hdHNCeXRlU2l6ZVtmb3JtYXRdO1xuICAgICAgICB0aGlzLmJ5dGVzUGVySW5kZXggPSBieXRlc1BlckluZGV4O1xuICAgICAgICB0aGlzLm51bUJ5dGVzID0gdGhpcy5udW1JbmRpY2VzICogYnl0ZXNQZXJJbmRleDtcblxuICAgICAgICBpZiAoaW5pdGlhbERhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YShpbml0aWFsRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgQXJyYXlCdWZmZXIodGhpcy5udW1CeXRlcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkanVzdFZyYW1TaXplVHJhY2tpbmcoZ3JhcGhpY3NEZXZpY2UuX3ZyYW0sIHRoaXMubnVtQnl0ZXMpO1xuXG4gICAgICAgIHRoaXMuZGV2aWNlLmJ1ZmZlcnMucHVzaCh0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGcmVlcyByZXNvdXJjZXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgaW5kZXggYnVmZmVyLlxuICAgICAqL1xuICAgIGRlc3Ryb3koKSB7XG5cbiAgICAgICAgLy8gc3RvcCB0cmFja2luZyB0aGUgaW5kZXggYnVmZmVyXG4gICAgICAgIGNvbnN0IGRldmljZSA9IHRoaXMuZGV2aWNlO1xuICAgICAgICBjb25zdCBpZHggPSBkZXZpY2UuYnVmZmVycy5pbmRleE9mKHRoaXMpO1xuICAgICAgICBpZiAoaWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgZGV2aWNlLmJ1ZmZlcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5kZXZpY2UuaW5kZXhCdWZmZXIgPT09IHRoaXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGV2aWNlLmluZGV4QnVmZmVyID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmltcGwuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaW1wbC5kZXN0cm95KGRldmljZSk7XG4gICAgICAgICAgICB0aGlzLmFkanVzdFZyYW1TaXplVHJhY2tpbmcoZGV2aWNlLl92cmFtLCAtdGhpcy5zdG9yYWdlLmJ5dGVMZW5ndGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRqdXN0VnJhbVNpemVUcmFja2luZyh2cmFtLCBzaXplKSB7XG4gICAgICAgIERlYnVnLnRyYWNlKFRSQUNFSURfVlJBTV9JQiwgYCR7dGhpcy5pZH0gc2l6ZTogJHtzaXplfSB2cmFtLmliOiAke3ZyYW0uaWJ9ID0+ICR7dnJhbS5pYiArIHNpemV9YCk7XG4gICAgICAgIHZyYW0uaWIgKz0gc2l6ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgcmVuZGVyaW5nIGNvbnRleHQgd2FzIGxvc3QuIEl0IHJlbGVhc2VzIGFsbCBjb250ZXh0IHJlbGF0ZWQgcmVzb3VyY2VzLlxuICAgICAqXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIGxvc2VDb250ZXh0KCkge1xuICAgICAgICB0aGlzLmltcGwubG9zZUNvbnRleHQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkYXRhIGZvcm1hdCBvZiB0aGUgc3BlY2lmaWVkIGluZGV4IGJ1ZmZlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBkYXRhIGZvcm1hdCBvZiB0aGUgc3BlY2lmaWVkIGluZGV4IGJ1ZmZlci4gQ2FuIGJlOlxuICAgICAqXG4gICAgICogLSB7QGxpbmsgSU5ERVhGT1JNQVRfVUlOVDh9XG4gICAgICogLSB7QGxpbmsgSU5ERVhGT1JNQVRfVUlOVDE2fVxuICAgICAqIC0ge0BsaW5rIElOREVYRk9STUFUX1VJTlQzMn1cbiAgICAgKi9cbiAgICBnZXRGb3JtYXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1hdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgaW5kaWNlcyBzdG9yZWQgaW4gdGhlIHNwZWNpZmllZCBpbmRleCBidWZmZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGluZGljZXMgc3RvcmVkIGluIHRoZSBzcGVjaWZpZWQgaW5kZXggYnVmZmVyLlxuICAgICAqL1xuICAgIGdldE51bUluZGljZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm51bUluZGljZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2l2ZXMgYWNjZXNzIHRvIHRoZSBibG9jayBvZiBtZW1vcnkgdGhhdCBzdG9yZXMgdGhlIGJ1ZmZlcidzIGluZGljZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7QXJyYXlCdWZmZXJ9IEEgY29udGlndW91cyBibG9jayBvZiBtZW1vcnkgd2hlcmUgaW5kZXggZGF0YSBjYW4gYmUgd3JpdHRlbiB0by5cbiAgICAgKi9cbiAgICBsb2NrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yYWdlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNpZ25hbHMgdGhhdCB0aGUgYmxvY2sgb2YgbWVtb3J5IHJldHVybmVkIGJ5IGEgY2FsbCB0byB0aGUgbG9jayBmdW5jdGlvbiBpcyByZWFkeSB0byBiZVxuICAgICAqIGdpdmVuIHRvIHRoZSBncmFwaGljcyBoYXJkd2FyZS4gT25seSB1bmxvY2tlZCBpbmRleCBidWZmZXJzIGNhbiBiZSBzZXQgb24gdGhlIGN1cnJlbnRseVxuICAgICAqIGFjdGl2ZSBkZXZpY2UuXG4gICAgICovXG4gICAgdW5sb2NrKCkge1xuXG4gICAgICAgIC8vIFVwbG9hZCB0aGUgbmV3IGluZGV4IGRhdGFcbiAgICAgICAgdGhpcy5pbXBsLnVubG9jayh0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgcHJlYWxsb2NhdGVkIGRhdGEgb24gdGhlIGluZGV4IGJ1ZmZlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGRhdGEgLSBUaGUgaW5kZXggZGF0YSB0byBzZXQuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGRhdGEgd2FzIHNldCBzdWNjZXNzZnVsbHksIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgc2V0RGF0YShkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLmJ5dGVMZW5ndGggIT09IHRoaXMubnVtQnl0ZXMpIHtcbiAgICAgICAgICAgIERlYnVnLmVycm9yKGBJbmRleEJ1ZmZlcjogd3JvbmcgaW5pdGlhbCBkYXRhIHNpemU6IGV4cGVjdGVkICR7dGhpcy5udW1CeXRlc30sIGdvdCAke2RhdGEuYnl0ZUxlbmd0aH1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RvcmFnZSA9IGRhdGE7XG4gICAgICAgIHRoaXMudW5sb2NrKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYXBwcm9wcmlhdGUgdHlwZWQgYXJyYXkgZnJvbSBhbiBpbmRleCBidWZmZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7VWludDhBcnJheXxVaW50MTZBcnJheXxVaW50MzJBcnJheX0gVGhlIHR5cGVkIGFycmF5IGNvbnRhaW5pbmcgdGhlIGluZGV4IGRhdGEuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbG9ja1R5cGVkQXJyYXkoKSB7XG4gICAgICAgIGNvbnN0IGxvY2sgPSB0aGlzLmxvY2soKTtcbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IHRoaXMuZm9ybWF0ID09PSBJTkRFWEZPUk1BVF9VSU5UMzIgPyBuZXcgVWludDMyQXJyYXkobG9jaykgOlxuICAgICAgICAgICAgKHRoaXMuZm9ybWF0ID09PSBJTkRFWEZPUk1BVF9VSU5UMTYgPyBuZXcgVWludDE2QXJyYXkobG9jaykgOiBuZXcgVWludDhBcnJheShsb2NrKSk7XG4gICAgICAgIHJldHVybiBpbmRpY2VzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvcGllcyB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBlbGVtZW50cyBmcm9tIGRhdGEgaW50byBpbmRleCBidWZmZXIuIE9wdGltaXplZCBmb3JcbiAgICAgKiBwZXJmb3JtYW5jZSBmcm9tIGJvdGggdHlwZWQgYXJyYXkgYXMgd2VsbCBhcyBhcnJheS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VWludDhBcnJheXxVaW50MTZBcnJheXxVaW50MzJBcnJheXxudW1iZXJbXX0gZGF0YSAtIFRoZSBkYXRhIHRvIHdyaXRlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCAtIFRoZSBudW1iZXIgb2YgaW5kaWNlcyB0byB3cml0ZS5cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgd3JpdGVEYXRhKGRhdGEsIGNvdW50KSB7XG4gICAgICAgIGNvbnN0IGluZGljZXMgPSB0aGlzLl9sb2NrVHlwZWRBcnJheSgpO1xuXG4gICAgICAgIC8vIGlmIGRhdGEgY29udGFpbnMgbW9yZSBpbmRpY2VzIHRoYW4gbmVlZGVkLCBjb3B5IGZyb20gaXRzIHN1YmFycmF5XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IGNvdW50KSB7XG5cbiAgICAgICAgICAgIC8vIGlmIGRhdGEgaXMgdHlwZWQgYXJyYXlcbiAgICAgICAgICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS5zdWJhcnJheSgwLCBjb3VudCk7XG4gICAgICAgICAgICAgICAgaW5kaWNlcy5zZXQoZGF0YSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGRhdGEgaXMgYXJyYXksIGNvcHkgcmlnaHQgYW1vdW50IG1hbnVhbGx5XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICBpbmRpY2VzW2ldID0gZGF0YVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNvcHkgd2hvbGUgZGF0YVxuICAgICAgICAgICAgaW5kaWNlcy5zZXQoZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVubG9jaygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvcGllcyBpbmRleCBkYXRhIGZyb20gaW5kZXggYnVmZmVyIGludG8gcHJvdmlkZWQgZGF0YSBhcnJheS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VWludDhBcnJheXxVaW50MTZBcnJheXxVaW50MzJBcnJheXxudW1iZXJbXX0gZGF0YSAtIFRoZSBkYXRhIGFycmF5IHRvIHdyaXRlIHRvLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBudW1iZXIgb2YgaW5kaWNlcyByZWFkLlxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICByZWFkRGF0YShkYXRhKSB7XG4gICAgICAgIC8vIG5vdGU6IHRoZXJlIGlzIG5vIG5lZWQgdG8gdW5sb2NrIHRoaXMgYnVmZmVyLCBhcyB3ZSBhcmUgb25seSByZWFkaW5nIGZyb20gaXRcbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IHRoaXMuX2xvY2tUeXBlZEFycmF5KCk7XG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5udW1JbmRpY2VzO1xuXG4gICAgICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpIHtcbiAgICAgICAgICAgIC8vIGRlc3RpbmF0aW9uIGRhdGEgaXMgdHlwZWQgYXJyYXlcbiAgICAgICAgICAgIGRhdGEuc2V0KGluZGljZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZGF0YSBpcyBhcnJheSwgY29weSByaWdodCBhbW91bnQgbWFudWFsbHlcbiAgICAgICAgICAgIGRhdGEubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKylcbiAgICAgICAgICAgICAgICBkYXRhW2ldID0gaW5kaWNlc1tpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICB9XG59XG5cbmV4cG9ydCB7IEluZGV4QnVmZmVyIH07XG4iXSwibmFtZXMiOlsiaWQiLCJJbmRleEJ1ZmZlciIsImNvbnN0cnVjdG9yIiwiZ3JhcGhpY3NEZXZpY2UiLCJmb3JtYXQiLCJudW1JbmRpY2VzIiwidXNhZ2UiLCJCVUZGRVJfU1RBVElDIiwiaW5pdGlhbERhdGEiLCJkZXZpY2UiLCJpbXBsIiwiY3JlYXRlSW5kZXhCdWZmZXJJbXBsIiwiYnl0ZXNQZXJJbmRleCIsInR5cGVkQXJyYXlJbmRleEZvcm1hdHNCeXRlU2l6ZSIsIm51bUJ5dGVzIiwic2V0RGF0YSIsInN0b3JhZ2UiLCJBcnJheUJ1ZmZlciIsImFkanVzdFZyYW1TaXplVHJhY2tpbmciLCJfdnJhbSIsImJ1ZmZlcnMiLCJwdXNoIiwiZGVzdHJveSIsImlkeCIsImluZGV4T2YiLCJzcGxpY2UiLCJpbmRleEJ1ZmZlciIsImluaXRpYWxpemVkIiwiYnl0ZUxlbmd0aCIsInZyYW0iLCJzaXplIiwiRGVidWciLCJ0cmFjZSIsIlRSQUNFSURfVlJBTV9JQiIsImliIiwibG9zZUNvbnRleHQiLCJnZXRGb3JtYXQiLCJnZXROdW1JbmRpY2VzIiwibG9jayIsInVubG9jayIsImRhdGEiLCJlcnJvciIsIl9sb2NrVHlwZWRBcnJheSIsImluZGljZXMiLCJJTkRFWEZPUk1BVF9VSU5UMzIiLCJVaW50MzJBcnJheSIsIklOREVYRk9STUFUX1VJTlQxNiIsIlVpbnQxNkFycmF5IiwiVWludDhBcnJheSIsIndyaXRlRGF0YSIsImNvdW50IiwibGVuZ3RoIiwiaXNWaWV3Iiwic3ViYXJyYXkiLCJzZXQiLCJpIiwicmVhZERhdGEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQVFBLElBQUlBLEVBQUUsR0FBRyxDQUFDLENBQUE7O0FBUVYsTUFBTUMsV0FBVyxDQUFDO0FBK0JkQyxFQUFBQSxXQUFXLENBQUNDLGNBQWMsRUFBRUMsTUFBTSxFQUFFQyxVQUFVLEVBQUVDLEtBQUssR0FBR0MsYUFBYSxFQUFFQyxXQUFXLEVBQUU7SUFFaEYsSUFBSSxDQUFDQyxNQUFNLEdBQUdOLGNBQWMs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
