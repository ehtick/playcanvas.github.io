/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../../core/debug.js';

class WebglRenderTarget {
  constructor() {
    this._glFrameBuffer = null;
    this._glDepthBuffer = null;
    this._glResolveFrameBuffer = null;
    this._glMsaaColorBuffer = null;
    this._glMsaaDepthBuffer = null;
  }
  destroy(device) {
    const gl = device.gl;
    if (this._glFrameBuffer) {
      gl.deleteFramebuffer(this._glFrameBuffer);
      this._glFrameBuffer = null;
    }
    if (this._glDepthBuffer) {
      gl.deleteRenderbuffer(this._glDepthBuffer);
      this._glDepthBuffer = null;
    }
    if (this._glResolveFrameBuffer) {
      gl.deleteFramebuffer(this._glResolveFrameBuffer);
      this._glResolveFrameBuffer = null;
    }
    if (this._glMsaaColorBuffer) {
      gl.deleteRenderbuffer(this._glMsaaColorBuffer);
      this._glMsaaColorBuffer = null;
    }
    if (this._glMsaaDepthBuffer) {
      gl.deleteRenderbuffer(this._glMsaaDepthBuffer);
      this._glMsaaDepthBuffer = null;
    }
  }
  get initialized() {
    return this._glFrameBuffer !== null;
  }
  init(device, target) {
    const gl = device.gl;

    this._glFrameBuffer = gl.createFramebuffer();
    device.setFramebuffer(this._glFrameBuffer);

    const colorBuffer = target._colorBuffer;
    if (colorBuffer) {
      if (!colorBuffer.impl._glTexture) {
        colorBuffer._width = Math.min(colorBuffer.width, device.maxRenderBufferSize);
        colorBuffer._height = Math.min(colorBuffer.height, device.maxRenderBufferSize);
        device.setTexture(colorBuffer, 0);
      }
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, colorBuffer._cubemap ? gl.TEXTURE_CUBE_MAP_POSITIVE_X + target._face : gl.TEXTURE_2D, colorBuffer.impl._glTexture, 0);
    }
    const depthBuffer = target._depthBuffer;
    if (depthBuffer) {
      if (!depthBuffer.impl._glTexture) {
        depthBuffer._width = Math.min(depthBuffer.width, device.maxRenderBufferSize);
        depthBuffer._height = Math.min(depthBuffer.height, device.maxRenderBufferSize);
        device.setTexture(depthBuffer, 0);
      }
      if (target._stencil) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, depthBuffer._cubemap ? gl.TEXTURE_CUBE_MAP_POSITIVE_X + target._face : gl.TEXTURE_2D, target._depthBuffer.impl._glTexture, 0);
      } else {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, depthBuffer._cubemap ? gl.TEXTURE_CUBE_MAP_POSITIVE_X + target._face : gl.TEXTURE_2D, target._depthBuffer.impl._glTexture, 0);
      }
    } else if (target._depth) {
      const willRenderMsaa = target._samples > 1 && device.webgl2;
      if (!willRenderMsaa) {
        if (!this._glDepthBuffer) {
          this._glDepthBuffer = gl.createRenderbuffer();
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, this._glDepthBuffer);
        if (target._stencil) {
          gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, target.width, target.height);
          gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._glDepthBuffer);
        } else {
          const depthFormat = device.webgl2 ? gl.DEPTH_COMPONENT32F : gl.DEPTH_COMPONENT16;
          gl.renderbufferStorage(gl.RENDERBUFFER, depthFormat, target.width, target.height);
          gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._glDepthBuffer);
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      }
    }
    Debug.call(() => this._checkFbo(device, target));

    if (device.webgl2 && target._samples > 1) {
      this._glResolveFrameBuffer = this._glFrameBuffer;

      this._glFrameBuffer = gl.createFramebuffer();
      device.setFramebuffer(this._glFrameBuffer);

      if (colorBuffer) {
        if (!this._glMsaaColorBuffer) {
          this._glMsaaColorBuffer = gl.createRenderbuffer();
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, this._glMsaaColorBuffer);
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, target._samples, colorBuffer.impl._glInternalFormat, target.width, target.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this._glMsaaColorBuffer);
      }

      if (target._depth) {
        if (!this._glMsaaDepthBuffer) {
          this._glMsaaDepthBuffer = gl.createRenderbuffer();
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, this._glMsaaDepthBuffer);
        if (target._stencil) {
          gl.renderbufferStorageMultisample(gl.RENDERBUFFER, target._samples, gl.DEPTH24_STENCIL8, target.width, target.height);
          gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._glMsaaDepthBuffer);
        } else {
          gl.renderbufferStorageMultisample(gl.RENDERBUFFER, target._samples, gl.DEPTH_COMPONENT32F, target.width, target.height);
          gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._glMsaaDepthBuffer);
        }
      }
      Debug.call(() => this._checkFbo(device, target, 'MSAA'));
    }
  }

  _checkFbo(device, target, type = '') {
    const gl = device.gl;
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    let errorCode;
    switch (status) {
      case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        errorCode = 'FRAMEBUFFER_INCOMPLETE_ATTACHMENT';
        break;
      case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        errorCode = 'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT';
        break;
      case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        errorCode = 'FRAMEBUFFER_INCOMPLETE_DIMENSIONS';
        break;
      case gl.FRAMEBUFFER_UNSUPPORTED:
        errorCode = 'FRAMEBUFFER_UNSUPPORTED';
        break;
    }
    Debug.assert(!errorCode, `Framebuffer creation failed with error code ${errorCode}, render target: ${target.name} ${type}`, target);
  }
  loseContext() {
    this._glFrameBuffer = null;
    this._glDepthBuffer = null;
    this._glResolveFrameBuffer = null;
    this._glMsaaColorBuffer = null;
    this._glMsaaDepthBuffer = null;
  }
  resolve(device, target, color, depth) {
    if (device.webgl2) {
      const gl = device.gl;
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._glFrameBuffer);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._glResolveFrameBuffer);
      gl.blitFramebuffer(0, 0, target.width, target.height, 0, 0, target.width, target.height, (color ? gl.COLOR_BUFFER_BIT : 0) | (depth ? gl.DEPTH_BUFFER_BIT : 0), gl.NEAREST);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._glFrameBuffer);
    }
  }
}

export { WebglRenderTarget };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ2wtcmVuZGVyLXRhcmdldC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3BsYXRmb3JtL2dyYXBoaWNzL3dlYmdsL3dlYmdsLXJlbmRlci10YXJnZXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGVidWcgfSBmcm9tIFwiLi4vLi4vLi4vY29yZS9kZWJ1Zy5qc1wiO1xuXG4vKipcbiAqIEEgV2ViR0wgaW1wbGVtZW50YXRpb24gb2YgdGhlIFJlbmRlclRhcmdldC5cbiAqXG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIFdlYmdsUmVuZGVyVGFyZ2V0IHtcbiAgICBfZ2xGcmFtZUJ1ZmZlciA9IG51bGw7XG5cbiAgICBfZ2xEZXB0aEJ1ZmZlciA9IG51bGw7XG5cbiAgICBfZ2xSZXNvbHZlRnJhbWVCdWZmZXIgPSBudWxsO1xuXG4gICAgX2dsTXNhYUNvbG9yQnVmZmVyID0gbnVsbDtcblxuICAgIF9nbE1zYWFEZXB0aEJ1ZmZlciA9IG51bGw7XG5cbiAgICBkZXN0cm95KGRldmljZSkge1xuICAgICAgICBjb25zdCBnbCA9IGRldmljZS5nbDtcbiAgICAgICAgaWYgKHRoaXMuX2dsRnJhbWVCdWZmZXIpIHtcbiAgICAgICAgICAgIGdsLmRlbGV0ZUZyYW1lYnVmZmVyKHRoaXMuX2dsRnJhbWVCdWZmZXIpO1xuICAgICAgICAgICAgdGhpcy5fZ2xGcmFtZUJ1ZmZlciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fZ2xEZXB0aEJ1ZmZlcikge1xuICAgICAgICAgICAgZ2wuZGVsZXRlUmVuZGVyYnVmZmVyKHRoaXMuX2dsRGVwdGhCdWZmZXIpO1xuICAgICAgICAgICAgdGhpcy5fZ2xEZXB0aEJ1ZmZlciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fZ2xSZXNvbHZlRnJhbWVCdWZmZXIpIHtcbiAgICAgICAgICAgIGdsLmRlbGV0ZUZyYW1lYnVmZmVyKHRoaXMuX2dsUmVzb2x2ZUZyYW1lQnVmZmVyKTtcbiAgICAgICAgICAgIHRoaXMuX2dsUmVzb2x2ZUZyYW1lQnVmZmVyID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9nbE1zYWFDb2xvckJ1ZmZlcikge1xuICAgICAgICAgICAgZ2wuZGVsZXRlUmVuZGVyYnVmZmVyKHRoaXMuX2dsTXNhYUNvbG9yQnVmZmVyKTtcbiAgICAgICAgICAgIHRoaXMuX2dsTXNhYUNvbG9yQnVmZmVyID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9nbE1zYWFEZXB0aEJ1ZmZlcikge1xuICAgICAgICAgICAgZ2wuZGVsZXRlUmVuZGVyYnVmZmVyKHRoaXMuX2dsTXNhYURlcHRoQnVmZmVyKTtcbiAgICAgICAgICAgIHRoaXMuX2dsTXNhYURlcHRoQnVmZmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpbml0aWFsaXplZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dsRnJhbWVCdWZmZXIgIT09IG51bGw7XG4gICAgfVxuXG4gICAgaW5pdChkZXZpY2UsIHRhcmdldCkge1xuICAgICAgICBjb25zdCBnbCA9IGRldmljZS5nbDtcblxuICAgICAgICAvLyAjIyMjIyBDcmVhdGUgbWFpbiBGQk8gIyMjIyNcbiAgICAgICAgdGhpcy5fZ2xGcmFtZUJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgICAgIGRldmljZS5zZXRGcmFtZWJ1ZmZlcih0aGlzLl9nbEZyYW1lQnVmZmVyKTtcblxuICAgICAgICAvLyAtLS0gSW5pdCB0aGUgcHJvdmlkZWQgY29sb3IgYnVmZmVyIChvcHRpb25hbCkgLS0tXG4gICAgICAgIGNvbnN0IGNvbG9yQnVmZmVyID0gdGFyZ2V0Ll9jb2xvckJ1ZmZlcjtcbiAgICAgICAgaWYgKGNvbG9yQnVmZmVyKSB7XG4gICAgICAgICAgICBpZiAoIWNvbG9yQnVmZmVyLmltcGwuX2dsVGV4dHVyZSkge1xuICAgICAgICAgICAgICAgIC8vIENsYW1wIHRoZSByZW5kZXIgYnVmZmVyIHNpemUgdG8gdGhlIG1heGltdW0gc3VwcG9ydGVkIGJ5IHRoZSBkZXZpY2VcbiAgICAgICAgICAgICAgICBjb2xvckJ1ZmZlci5fd2lkdGggPSBNYXRoLm1pbihjb2xvckJ1ZmZlci53aWR0aCwgZGV2aWNlLm1heFJlbmRlckJ1ZmZlclNpemUpO1xuICAgICAgICAgICAgICAgIGNvbG9yQnVmZmVyLl9oZWlnaHQgPSBNYXRoLm1pbihjb2xvckJ1ZmZlci5oZWlnaHQsIGRldmljZS5tYXhSZW5kZXJCdWZmZXJTaXplKTtcbiAgICAgICAgICAgICAgICBkZXZpY2Uuc2V0VGV4dHVyZShjb2xvckJ1ZmZlciwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBdHRhY2ggdGhlIGNvbG9yIGJ1ZmZlclxuICAgICAgICAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoXG4gICAgICAgICAgICAgICAgZ2wuRlJBTUVCVUZGRVIsXG4gICAgICAgICAgICAgICAgZ2wuQ09MT1JfQVRUQUNITUVOVDAsXG4gICAgICAgICAgICAgICAgY29sb3JCdWZmZXIuX2N1YmVtYXAgPyBnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggKyB0YXJnZXQuX2ZhY2UgOiBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgICAgIGNvbG9yQnVmZmVyLmltcGwuX2dsVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVwdGhCdWZmZXIgPSB0YXJnZXQuX2RlcHRoQnVmZmVyO1xuICAgICAgICBpZiAoZGVwdGhCdWZmZXIpIHtcbiAgICAgICAgICAgIC8vIC0tLSBJbml0IHRoZSBwcm92aWRlZCBkZXB0aC9zdGVuY2lsIGJ1ZmZlciAob3B0aW9uYWwsIFdlYkdMMiBvbmx5KSAtLS1cbiAgICAgICAgICAgIGlmICghZGVwdGhCdWZmZXIuaW1wbC5fZ2xUZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2xhbXAgdGhlIHJlbmRlciBidWZmZXIgc2l6ZSB0byB0aGUgbWF4aW11bSBzdXBwb3J0ZWQgYnkgdGhlIGRldmljZVxuICAgICAgICAgICAgICAgIGRlcHRoQnVmZmVyLl93aWR0aCA9IE1hdGgubWluKGRlcHRoQnVmZmVyLndpZHRoLCBkZXZpY2UubWF4UmVuZGVyQnVmZmVyU2l6ZSk7XG4gICAgICAgICAgICAgICAgZGVwdGhCdWZmZXIuX2hlaWdodCA9IE1hdGgubWluKGRlcHRoQnVmZmVyLmhlaWdodCwgZGV2aWNlLm1heFJlbmRlckJ1ZmZlclNpemUpO1xuICAgICAgICAgICAgICAgIGRldmljZS5zZXRUZXh0dXJlKGRlcHRoQnVmZmVyLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEF0dGFjaFxuICAgICAgICAgICAgaWYgKHRhcmdldC5fc3RlbmNpbCkge1xuICAgICAgICAgICAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGdsLkZSQU1FQlVGRkVSLCBnbC5ERVBUSF9TVEVOQ0lMX0FUVEFDSE1FTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGhCdWZmZXIuX2N1YmVtYXAgPyBnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggKyB0YXJnZXQuX2ZhY2UgOiBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5fZGVwdGhCdWZmZXIuaW1wbC5fZ2xUZXh0dXJlLCAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoZ2wuRlJBTUVCVUZGRVIsIGdsLkRFUFRIX0FUVEFDSE1FTlQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGhCdWZmZXIuX2N1YmVtYXAgPyBnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggKyB0YXJnZXQuX2ZhY2UgOiBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5fZGVwdGhCdWZmZXIuaW1wbC5fZ2xUZXh0dXJlLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQuX2RlcHRoKSB7XG4gICAgICAgICAgICAvLyAtLS0gSW5pdCBhIG5ldyBkZXB0aC9zdGVuY2lsIGJ1ZmZlciAob3B0aW9uYWwpIC0tLVxuICAgICAgICAgICAgLy8gaWYgZGV2aWNlIGlzIGEgTVNBQSBSVCwgYW5kIG5vIGJ1ZmZlciB0byByZXNvbHZlIHRvLCBza2lwIGNyZWF0aW5nIG5vbi1NU0FBIGRlcHRoXG4gICAgICAgICAgICBjb25zdCB3aWxsUmVuZGVyTXNhYSA9IHRhcmdldC5fc2FtcGxlcyA+IDEgJiYgZGV2aWNlLndlYmdsMjtcbiAgICAgICAgICAgIGlmICghd2lsbFJlbmRlck1zYWEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2dsRGVwdGhCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2xEZXB0aEJ1ZmZlciA9IGdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBnbC5iaW5kUmVuZGVyYnVmZmVyKGdsLlJFTkRFUkJVRkZFUiwgdGhpcy5fZ2xEZXB0aEJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5fc3RlbmNpbCkge1xuICAgICAgICAgICAgICAgICAgICBnbC5yZW5kZXJidWZmZXJTdG9yYWdlKGdsLlJFTkRFUkJVRkZFUiwgZ2wuREVQVEhfU1RFTkNJTCwgdGFyZ2V0LndpZHRoLCB0YXJnZXQuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGdsLkRFUFRIX1NURU5DSUxfQVRUQUNITUVOVCwgZ2wuUkVOREVSQlVGRkVSLCB0aGlzLl9nbERlcHRoQnVmZmVyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXB0aEZvcm1hdCA9IGRldmljZS53ZWJnbDIgPyBnbC5ERVBUSF9DT01QT05FTlQzMkYgOiBnbC5ERVBUSF9DT01QT05FTlQxNjtcbiAgICAgICAgICAgICAgICAgICAgZ2wucmVuZGVyYnVmZmVyU3RvcmFnZShnbC5SRU5ERVJCVUZGRVIsIGRlcHRoRm9ybWF0LCB0YXJnZXQud2lkdGgsIHRhcmdldC5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICBnbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgZ2wuREVQVEhfQVRUQUNITUVOVCwgZ2wuUkVOREVSQlVGRkVSLCB0aGlzLl9nbERlcHRoQnVmZmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgRGVidWcuY2FsbCgoKSA9PiB0aGlzLl9jaGVja0ZibyhkZXZpY2UsIHRhcmdldCkpO1xuXG4gICAgICAgIC8vICMjIyMjIENyZWF0ZSBNU0FBIEZCTyAoV2ViR0wyIG9ubHkpICMjIyMjXG4gICAgICAgIGlmIChkZXZpY2Uud2ViZ2wyICYmIHRhcmdldC5fc2FtcGxlcyA+IDEpIHtcblxuICAgICAgICAgICAgLy8gVXNlIHByZXZpb3VzIEZCTyBmb3IgcmVzb2x2ZXNcbiAgICAgICAgICAgIHRoaXMuX2dsUmVzb2x2ZUZyYW1lQnVmZmVyID0gdGhpcy5fZ2xGcmFtZUJ1ZmZlcjtcblxuICAgICAgICAgICAgLy8gQWN0dWFsIEZCTyB3aWxsIGJlIE1TQUFcbiAgICAgICAgICAgIHRoaXMuX2dsRnJhbWVCdWZmZXIgPSBnbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgICAgICAgICAgZGV2aWNlLnNldEZyYW1lYnVmZmVyKHRoaXMuX2dsRnJhbWVCdWZmZXIpO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgYW4gb3B0aW9uYWwgTVNBQSBjb2xvciBidWZmZXJcbiAgICAgICAgICAgIGlmIChjb2xvckJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fZ2xNc2FhQ29sb3JCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2xNc2FhQ29sb3JCdWZmZXIgPSBnbC5jcmVhdGVSZW5kZXJidWZmZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIHRoaXMuX2dsTXNhYUNvbG9yQnVmZmVyKTtcbiAgICAgICAgICAgICAgICBnbC5yZW5kZXJidWZmZXJTdG9yYWdlTXVsdGlzYW1wbGUoZ2wuUkVOREVSQlVGRkVSLCB0YXJnZXQuX3NhbXBsZXMsIGNvbG9yQnVmZmVyLmltcGwuX2dsSW50ZXJuYWxGb3JtYXQsIHRhcmdldC53aWR0aCwgdGFyZ2V0LmhlaWdodCk7XG4gICAgICAgICAgICAgICAgZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGdsLkNPTE9SX0FUVEFDSE1FTlQwLCBnbC5SRU5ERVJCVUZGRVIsIHRoaXMuX2dsTXNhYUNvbG9yQnVmZmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSBhZGQgYSBNU0FBIGRlcHRoL3N0ZW5jaWwgYnVmZmVyXG4gICAgICAgICAgICBpZiAodGFyZ2V0Ll9kZXB0aCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fZ2xNc2FhRGVwdGhCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2xNc2FhRGVwdGhCdWZmZXIgPSBnbC5jcmVhdGVSZW5kZXJidWZmZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIHRoaXMuX2dsTXNhYURlcHRoQnVmZmVyKTtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Ll9zdGVuY2lsKSB7XG4gICAgICAgICAgICAgICAgICAgIGdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2VNdWx0aXNhbXBsZShnbC5SRU5ERVJCVUZGRVIsIHRhcmdldC5fc2FtcGxlcywgZ2wuREVQVEgyNF9TVEVOQ0lMOCwgdGFyZ2V0LndpZHRoLCB0YXJnZXQuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGdsLkRFUFRIX1NURU5DSUxfQVRUQUNITUVOVCwgZ2wuUkVOREVSQlVGRkVSLCB0aGlzLl9nbE1zYWFEZXB0aEJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ2wucmVuZGVyYnVmZmVyU3RvcmFnZU11bHRpc2FtcGxlKGdsLlJFTkRFUkJVRkZFUiwgdGFyZ2V0Ll9zYW1wbGVzLCBnbC5ERVBUSF9DT01QT05FTlQzMkYsIHRhcmdldC53aWR0aCwgdGFyZ2V0LmhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIGdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBnbC5ERVBUSF9BVFRBQ0hNRU5ULCBnbC5SRU5ERVJCVUZGRVIsIHRoaXMuX2dsTXNhYURlcHRoQnVmZmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIERlYnVnLmNhbGwoKCkgPT4gdGhpcy5fY2hlY2tGYm8oZGV2aWNlLCB0YXJnZXQsICdNU0FBJykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHRoZSBjb21wbGV0ZW5lc3Mgc3RhdHVzIG9mIHRoZSBjdXJyZW50bHkgYm91bmQgV2ViR0xGcmFtZWJ1ZmZlciBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jaGVja0ZibyhkZXZpY2UsIHRhcmdldCwgdHlwZSA9ICcnKSB7XG4gICAgICAgIGNvbnN0IGdsID0gZGV2aWNlLmdsO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBnbC5jaGVja0ZyYW1lYnVmZmVyU3RhdHVzKGdsLkZSQU1FQlVGRkVSKTtcbiAgICAgICAgbGV0IGVycm9yQ29kZTtcbiAgICAgICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgZ2wuRlJBTUVCVUZGRVJfSU5DT01QTEVURV9BVFRBQ0hNRU5UOlxuICAgICAgICAgICAgICAgIGVycm9yQ29kZSA9ICdGUkFNRUJVRkZFUl9JTkNPTVBMRVRFX0FUVEFDSE1FTlQnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBnbC5GUkFNRUJVRkZFUl9JTkNPTVBMRVRFX01JU1NJTkdfQVRUQUNITUVOVDpcbiAgICAgICAgICAgICAgICBlcnJvckNvZGUgPSAnRlJBTUVCVUZGRVJfSU5DT01QTEVURV9NSVNTSU5HX0FUVEFDSE1FTlQnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBnbC5GUkFNRUJVRkZFUl9JTkNPTVBMRVRFX0RJTUVOU0lPTlM6XG4gICAgICAgICAgICAgICAgZXJyb3JDb2RlID0gJ0ZSQU1FQlVGRkVSX0lOQ09NUExFVEVfRElNRU5TSU9OUyc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGdsLkZSQU1FQlVGRkVSX1VOU1VQUE9SVEVEOlxuICAgICAgICAgICAgICAgIGVycm9yQ29kZSA9ICdGUkFNRUJVRkZFUl9VTlNVUFBPUlRFRCc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBEZWJ1Zy5hc3NlcnQoIWVycm9yQ29kZSwgYEZyYW1lYnVmZmVyIGNyZWF0aW9uIGZhaWxlZCB3aXRoIGVycm9yIGNvZGUgJHtlcnJvckNvZGV9LCByZW5kZXIgdGFyZ2V0OiAke3RhcmdldC5uYW1lfSAke3R5cGV9YCwgdGFyZ2V0KTtcbiAgICB9XG5cbiAgICBsb3NlQ29udGV4dCgpIHtcbiAgICAgICAgdGhpcy5fZ2xGcmFtZUJ1ZmZlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX2dsRGVwdGhCdWZmZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9nbFJlc29sdmVGcmFtZUJ1ZmZlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX2dsTXNhYUNvbG9yQnVmZmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZ2xNc2FhRGVwdGhCdWZmZXIgPSBudWxsO1xuICAgIH1cblxuICAgIHJlc29sdmUoZGV2aWNlLCB0YXJnZXQsIGNvbG9yLCBkZXB0aCkge1xuICAgICAgICBpZiAoZGV2aWNlLndlYmdsMikge1xuICAgICAgICAgICAgY29uc3QgZ2wgPSBkZXZpY2UuZ2w7XG4gICAgICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuUkVBRF9GUkFNRUJVRkZFUiwgdGhpcy5fZ2xGcmFtZUJ1ZmZlcik7XG4gICAgICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRFJBV19GUkFNRUJVRkZFUiwgdGhpcy5fZ2xSZXNvbHZlRnJhbWVCdWZmZXIpO1xuICAgICAgICAgICAgZ2wuYmxpdEZyYW1lYnVmZmVyKDAsIDAsIHRhcmdldC53aWR0aCwgdGFyZ2V0LmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCB0YXJnZXQud2lkdGgsIHRhcmdldC5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNvbG9yID8gZ2wuQ09MT1JfQlVGRkVSX0JJVCA6IDApIHwgKGRlcHRoID8gZ2wuREVQVEhfQlVGRkVSX0JJVCA6IDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsLk5FQVJFU1QpO1xuICAgICAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCB0aGlzLl9nbEZyYW1lQnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgV2ViZ2xSZW5kZXJUYXJnZXQgfTtcbiJdLCJuYW1lcyI6WyJXZWJnbFJlbmRlclRhcmdldCIsIl9nbEZyYW1lQnVmZmVyIiwiX2dsRGVwdGhCdWZmZXIiLCJfZ2xSZXNvbHZlRnJhbWVCdWZmZXIiLCJfZ2xNc2FhQ29sb3JCdWZmZXIiLCJfZ2xNc2FhRGVwdGhCdWZmZXIiLCJkZXN0cm95IiwiZGV2aWNlIiwiZ2wiLCJkZWxldGVGcmFtZWJ1ZmZlciIsImRlbGV0ZVJlbmRlcmJ1ZmZlciIsImluaXRpYWxpemVkIiwiaW5pdCIsInRhcmdldCIsImNyZWF0ZUZyYW1lYnVmZmVyIiwic2V0RnJhbWVidWZmZXIiLCJjb2xvckJ1ZmZlciIsIl9jb2xvckJ1ZmZlciIsImltcGwiLCJfZ2xUZXh0dXJlIiwiX3dpZHRoIiwiTWF0aCIsIm1pbiIsIndpZHRoIiwibWF4UmVuZGVyQnVmZmVyU2l6ZSIsIl9oZWlnaHQiLCJoZWlnaHQiLCJzZXRUZXh0dXJlIiwiZnJhbWVidWZmZXJUZXh0dXJlMkQiLCJGUkFNRUJVRkZFUiIsIkNPTE9SX0FUVEFDSE1FTlQwIiwiX2N1YmVtYXAiLCJURVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1giLCJfZmFjZSIsIlRFWFRVUkVfMkQiLCJkZXB0aEJ1ZmZlciIsIl9kZXB0aEJ1ZmZlciIsIl9zdGVuY2lsIiwiREVQVEhfU1RFTkNJTF9BVFRBQ0hNRU5UIiwiREVQVEhfQVRUQUNITUVOVCIsIl9kZXB0aCIsIndpbGxSZW5kZXJNc2FhIiwiX3NhbXBsZXMiLCJ3ZWJnbDIiLCJjcmVhdGVSZW5kZXJidWZmZXIiLCJiaW5kUmVuZGVyYnVmZmVyIiwiUkVOREVSQlVGRkVSIiwicmVuZGVyYnVmZmVyU3RvcmFnZSIsIkRFUFRIX1NURU5DSUwiLCJmcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlciIsImRlcHRoRm9ybWF0IiwiREVQVEhfQ09NUE9ORU5UMzJGIiwiREVQVEhfQ09NUE9ORU5UMTYiLCJEZWJ1ZyIsImNhbGwiLCJfY2hlY2tGYm8iLCJyZW5kZXJidWZmZXJTdG9yYWdlTXVsdGlzYW1wbGUiLCJfZ2xJbnRlcm5hbEZvcm1hdCIsIkRFUFRIMjRfU1RFTkNJTDgiLCJ0eXBlIiwic3RhdHVzIiwiY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cyIsImVycm9yQ29kZSIsIkZSQU1FQlVGRkVSX0lOQ09NUExFVEVfQVRUQUNITUVOVCIsIkZSQU1FQlVGRkVSX0lOQ09NUExFVEVfTUlTU0lOR19BVFRBQ0hNRU5UIiwiRlJBTUVCVUZGRVJfSU5DT01QTEVURV9ESU1FTlNJT05TIiwiRlJBTUVCVUZGRVJfVU5TVVBQT1JURUQiLCJhc3NlcnQiLCJuYW1lIiwibG9zZUNvbnRleHQiLCJyZXNvbHZlIiwiY29sb3IiLCJkZXB0aCIsImJpbmRGcmFtZWJ1ZmZlciIsIlJFQURfRlJBTUVCVUZGRVIiLCJEUkFXX0ZSQU1FQlVGRkVSIiwiYmxpdEZyYW1lYnVmZmVyIiwiQ09MT1JfQlVGRkVSX0JJVCIsIkRFUFRIX0JVRkZFUl9CSVQiLCJORUFSRVNUIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBT0EsTUFBTUEsaUJBQWlCLENBQUM7QUFBQSxFQUFBLFdBQUEsR0FBQTtJQUFBLElBQ3BCQyxDQUFBQSxjQUFjLEdBQUcsSUFBSSxDQUFBO0lBQUEsSUFFckJDLENBQUFBLGNBQWMsR0FBRyxJQUFJLENBQUE7SUFBQSxJQUVyQkMsQ0FBQUEscUJBQXFCLEdBQUcsSUFBSSxDQUFBO0lBQUEsSUFFNUJDLENBQUFBLGtCQUFrQixHQUFHLElBQUksQ0FBQTtJQUFBLElBRXpCQyxDQUFBQSxrQkFBa0IsR0FBRyxJQUFJLENBQUE7QUFBQSxHQUFBO0VBRXpCQyxPQUFPLENBQUNDLE1BQU0sRUFBRTtBQUNaLElBQUEsTUFBTUMsRUFBRSxHQUFHRCxNQUFNLENBQUNDLEVBQUUsQ0FBQTtJQUNwQixJQUFJLElBQUksQ0FBQ1AsY0FBYyxFQUFFO0FBQ3JCTyxNQUFBQSxFQUFFLENBQUNDLGlCQUFpQixDQUFDLElBQUksQ0FBQ1IsY0FBYyxDQUFDLENBQUE7TUFDekMsSUFBSSxDQUFDQSxjQUFjLEdBQUcs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
