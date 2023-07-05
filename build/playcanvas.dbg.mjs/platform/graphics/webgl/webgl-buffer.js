import { BUFFER_GPUDYNAMIC, BUFFER_STREAM, BUFFER_DYNAMIC, BUFFER_STATIC } from '../constants.js';

/**
 * A WebGL implementation of the Buffer.
 *
 * @ignore
 */
class WebglBuffer {
  constructor() {
    this.bufferId = null;
  }
  destroy(device) {
    if (this.bufferId) {
      device.gl.deleteBuffer(this.bufferId);
      this.bufferId = null;
    }
  }
  get initialized() {
    return !!this.bufferId;
  }
  loseContext() {
    this.bufferId = null;
  }
  unlock(device, usage, target, storage) {
    const gl = device.gl;
    if (!this.bufferId) {
      this.bufferId = gl.createBuffer();
    }
    let glUsage;
    switch (usage) {
      case BUFFER_STATIC:
        glUsage = gl.STATIC_DRAW;
        break;
      case BUFFER_DYNAMIC:
        glUsage = gl.DYNAMIC_DRAW;
        break;
      case BUFFER_STREAM:
        glUsage = gl.STREAM_DRAW;
        break;
      case BUFFER_GPUDYNAMIC:
        if (device.webgl2) {
          glUsage = gl.DYNAMIC_COPY;
        } else {
          glUsage = gl.STATIC_DRAW;
        }
        break;
    }
    gl.bindBuffer(target, this.bufferId);
    gl.bufferData(target, storage, glUsage);
  }
}

export { WebglBuffer };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ2wtYnVmZmVyLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvcGxhdGZvcm0vZ3JhcGhpY3Mvd2ViZ2wvd2ViZ2wtYnVmZmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJVRkZFUl9EWU5BTUlDLCBCVUZGRVJfR1BVRFlOQU1JQywgQlVGRkVSX1NUQVRJQywgQlVGRkVSX1NUUkVBTSB9IGZyb20gJy4uL2NvbnN0YW50cy5qcyc7XG5cbi8qKlxuICogQSBXZWJHTCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgQnVmZmVyLlxuICpcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgV2ViZ2xCdWZmZXIge1xuICAgIGJ1ZmZlcklkID0gbnVsbDtcblxuICAgIGRlc3Ryb3koZGV2aWNlKSB7XG4gICAgICAgIGlmICh0aGlzLmJ1ZmZlcklkKSB7XG4gICAgICAgICAgICBkZXZpY2UuZ2wuZGVsZXRlQnVmZmVyKHRoaXMuYnVmZmVySWQpO1xuICAgICAgICAgICAgdGhpcy5idWZmZXJJZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaW5pdGlhbGl6ZWQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuYnVmZmVySWQ7XG4gICAgfVxuXG4gICAgbG9zZUNvbnRleHQoKSB7XG4gICAgICAgIHRoaXMuYnVmZmVySWQgPSBudWxsO1xuICAgIH1cblxuICAgIHVubG9jayhkZXZpY2UsIHVzYWdlLCB0YXJnZXQsIHN0b3JhZ2UpIHtcbiAgICAgICAgY29uc3QgZ2wgPSBkZXZpY2UuZ2w7XG5cbiAgICAgICAgaWYgKCF0aGlzLmJ1ZmZlcklkKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlcklkID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZ2xVc2FnZTtcbiAgICAgICAgc3dpdGNoICh1c2FnZSkge1xuICAgICAgICAgICAgY2FzZSBCVUZGRVJfU1RBVElDOlxuICAgICAgICAgICAgICAgIGdsVXNhZ2UgPSBnbC5TVEFUSUNfRFJBVztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQlVGRkVSX0RZTkFNSUM6XG4gICAgICAgICAgICAgICAgZ2xVc2FnZSA9IGdsLkRZTkFNSUNfRFJBVztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQlVGRkVSX1NUUkVBTTpcbiAgICAgICAgICAgICAgICBnbFVzYWdlID0gZ2wuU1RSRUFNX0RSQVc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEJVRkZFUl9HUFVEWU5BTUlDOlxuICAgICAgICAgICAgICAgIGlmIChkZXZpY2Uud2ViZ2wyKSB7XG4gICAgICAgICAgICAgICAgICAgIGdsVXNhZ2UgPSBnbC5EWU5BTUlDX0NPUFk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xVc2FnZSA9IGdsLlNUQVRJQ19EUkFXO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGdsLmJpbmRCdWZmZXIodGFyZ2V0LCB0aGlzLmJ1ZmZlcklkKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YSh0YXJnZXQsIHN0b3JhZ2UsIGdsVXNhZ2UpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgV2ViZ2xCdWZmZXIgfTtcbiJdLCJuYW1lcyI6WyJXZWJnbEJ1ZmZlciIsImNvbnN0cnVjdG9yIiwiYnVmZmVySWQiLCJkZXN0cm95IiwiZGV2aWNlIiwiZ2wiLCJkZWxldGVCdWZmZXIiLCJpbml0aWFsaXplZCIsImxvc2VDb250ZXh0IiwidW5sb2NrIiwidXNhZ2UiLCJ0YXJnZXQiLCJzdG9yYWdlIiwiY3JlYXRlQnVmZmVyIiwiZ2xVc2FnZSIsIkJVRkZFUl9TVEFUSUMiLCJTVEFUSUNfRFJBVyIsIkJVRkZFUl9EWU5BTUlDIiwiRFlOQU1JQ19EUkFXIiwiQlVGRkVSX1NUUkVBTSIsIlNUUkVBTV9EUkFXIiwiQlVGRkVSX0dQVURZTkFNSUMiLCJ3ZWJnbDIiLCJEWU5BTUlDX0NPUFkiLCJiaW5kQnVmZmVyIiwiYnVmZmVyRGF0YSJdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUEsV0FBVyxDQUFDO0VBQUFDLFdBQUEsR0FBQTtJQUFBLElBQ2RDLENBQUFBLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFBQSxHQUFBO0VBRWZDLE9BQU9BLENBQUNDLE1BQU0sRUFBRTtJQUNaLElBQUksSUFBSSxDQUFDRixRQUFRLEVBQUU7TUFDZkUsTUFBTSxDQUFDQyxFQUFFLENBQUNDLFlBQVksQ0FBQyxJQUFJLENBQUNKLFFBQVEsQ0FBQyxDQUFBO01BQ3JDLElBQUksQ0FBQ0EsUUFBUSxHQUFHLElBQUksQ0FBQTtBQUN4QixLQUFBO0FBQ0osR0FBQTtFQUVBLElBQUlLLFdBQVdBLEdBQUc7QUFDZCxJQUFBLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQ0wsUUFBUSxDQUFBO0FBQzFCLEdBQUE7QUFFQU0sRUFBQUEsV0FBV0EsR0FBRztJQUNWLElBQUksQ0FBQ04sUUFBUSxHQUFHLElBQUksQ0FBQTtBQUN4QixHQUFBO0VBRUFPLE1BQU1BLENBQUNMLE1BQU0sRUFBRU0sS0FBSyxFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRTtBQUNuQyxJQUFBLE1BQU1QLEVBQUUsR0FBR0QsTUFBTSxDQUFDQyxFQUFFLENBQUE7QUFFcEIsSUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDSCxRQUFRLEVBQUU7QUFDaEIsTUFBQSxJQUFJLENBQUNBLFFBQVEsR0FBR0csRUFBRSxDQUFDUSxZQUFZLEVBQUUsQ0FBQTtBQUNyQyxLQUFBO0FBRUEsSUFBQSxJQUFJQyxPQUFPLENBQUE7QUFDWCxJQUFBLFFBQVFKLEtBQUs7QUFDVCxNQUFBLEtBQUtLLGFBQWE7UUFDZEQsT0FBTyxHQUFHVCxFQUFFLENBQUNXLFdBQVcsQ0FBQTtBQUN4QixRQUFBLE1BQUE7QUFDSixNQUFBLEtBQUtDLGNBQWM7UUFDZkgsT0FBTyxHQUFHVCxFQUFFLENBQUNhLFlBQVksQ0FBQTtBQUN6QixRQUFBLE1BQUE7QUFDSixNQUFBLEtBQUtDLGFBQWE7UUFDZEwsT0FBTyxHQUFHVCxFQUFFLENBQUNlLFdBQVcsQ0FBQTtBQUN4QixRQUFBLE1BQUE7QUFDSixNQUFBLEtBQUtDLGlCQUFpQjtRQUNsQixJQUFJakIsTUFBTSxDQUFDa0IsTUFBTSxFQUFFO1VBQ2ZSLE9BQU8sR0FBR1QsRUFBRSxDQUFDa0IsWUFBWSxDQUFBO0FBQzdCLFNBQUMsTUFBTTtVQUNIVCxPQUFPLEdBQUdULEVBQUUsQ0FBQ1csV0FBVyxDQUFBO0FBQzVCLFNBQUE7QUFDQSxRQUFBLE1BQUE7QUFDUixLQUFBO0lBRUFYLEVBQUUsQ0FBQ21CLFVBQVUsQ0FBQ2IsTUFBTSxFQUFFLElBQUksQ0FBQ1QsUUFBUSxDQUFDLENBQUE7SUFDcENHLEVBQUUsQ0FBQ29CLFVBQVUsQ0FBQ2QsTUFBTSxFQUFFQyxPQUFPLEVBQUVFLE9BQU8sQ0FBQyxDQUFBO0FBQzNDLEdBQUE7QUFDSjs7OzsifQ==
