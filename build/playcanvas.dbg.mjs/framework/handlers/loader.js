/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../core/debug.js';

class ResourceLoader {
  constructor(app) {
    this._handlers = {};
    this._requests = {};
    this._cache = {};
    this._app = app;
  }

  addHandler(type, handler) {
    this._handlers[type] = handler;
    handler._loader = this;
  }

  removeHandler(type) {
    delete this._handlers[type];
  }

  getHandler(type) {
    return this._handlers[type];
  }

  load(url, type, callback, asset) {
    const handler = this._handlers[type];
    if (!handler) {
      const err = `No resource handler for asset type: '${type}' when loading [${url}]`;
      Debug.errorOnce(err);
      callback(err);
      return;
    }

    if (!url) {
      this._loadNull(handler, callback, asset);
      return;
    }
    const key = url + type;
    if (this._cache[key] !== undefined) {
      callback(null, this._cache[key]);
    } else if (this._requests[key]) {
      this._requests[key].push(callback);
    } else {
      this._requests[key] = [callback];
      const self = this;
      const handleLoad = function handleLoad(err, urlObj) {
        if (err) {
          self._onFailure(key, err);
          return;
        }
        handler.load(urlObj, function (err, data, extra) {
          if (!self._requests[key]) {
            return;
          }
          if (err) {
            self._onFailure(key, err);
            return;
          }
          try {
            self._onSuccess(key, handler.open(urlObj.original, data, asset), extra);
          } catch (e) {
            self._onFailure(key, e);
          }
        }, asset);
      };
      const normalizedUrl = url.split('?')[0];
      if (this._app.enableBundles && this._app.bundles.hasUrl(normalizedUrl)) {
        if (!this._app.bundles.canLoadUrl(normalizedUrl)) {
          handleLoad(`Bundle for ${url} not loaded yet`);
          return;
        }
        this._app.bundles.loadUrl(normalizedUrl, function (err, fileUrlFromBundle) {
          handleLoad(err, {
            load: fileUrlFromBundle,
            original: normalizedUrl
          });
        });
      } else {
        handleLoad(null, {
          load: url,
          original: asset && asset.file.filename || url
        });
      }
    }
  }

  _loadNull(handler, callback, asset) {
    const onLoad = function onLoad(err, data, extra) {
      if (err) {
        callback(err);
      } else {
        try {
          callback(null, handler.open(null, data, asset), extra);
        } catch (e) {
          callback(e);
        }
      }
    };
    handler.load(null, onLoad, asset);
  }
  _onSuccess(key, result, extra) {
    this._cache[key] = result;
    for (let i = 0; i < this._requests[key].length; i++) {
      this._requests[key][i](null, result, extra);
    }
    delete this._requests[key];
  }
  _onFailure(key, err) {
    console.error(err);
    if (this._requests[key]) {
      for (let i = 0; i < this._requests[key].length; i++) {
        this._requests[key][i](err);
      }
      delete this._requests[key];
    }
  }

  open(type, data) {
    const handler = this._handlers[type];
    if (!handler) {
      console.warn('No resource handler found for: ' + type);
      return data;
    }
    return handler.open(null, data);
  }

  patch(asset, assets) {
    const handler = this._handlers[asset.type];
    if (!handler) {
      console.warn('No resource handler found for: ' + asset.type);
      return;
    }
    if (handler.patch) {
      handler.patch(asset, assets);
    }
  }

  clearCache(url, type) {
    delete this._cache[url + type];
  }

  getFromCache(url, type) {
    if (this._cache[url + type]) {
      return this._cache[url + type];
    }
    return undefined;
  }

  enableRetry(maxRetries = 5) {
    maxRetries = Math.max(0, maxRetries) || 0;
    for (const key in this._handlers) {
      this._handlers[key].maxRetries = maxRetries;
    }
  }

  disableRetry() {
    for (const key in this._handlers) {
      this._handlers[key].maxRetries = 0;
    }
  }

  destroy() {
    this._handlers = {};
    this._requests = {};
    this._cache = {};
  }
}

export { ResourceLoader };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2hhbmRsZXJzL2xvYWRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZWJ1ZyB9IGZyb20gJy4uLy4uL2NvcmUvZGVidWcuanMnO1xuXG4vKipcbiAqIENhbGxiYWNrIHVzZWQgYnkge0BsaW5rIFJlc291cmNlTG9hZGVyI2xvYWR9IHdoZW4gYSByZXNvdXJjZSBpcyBsb2FkZWQgKG9yIGFuIGVycm9yIG9jY3VycykuXG4gKlxuICogQGNhbGxiYWNrIFJlc291cmNlTG9hZGVyQ2FsbGJhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IGVyciAtIFRoZSBlcnJvciBtZXNzYWdlIGluIHRoZSBjYXNlIHdoZXJlIHRoZSBsb2FkIGZhaWxzLlxuICogQHBhcmFtIHsqfSBbcmVzb3VyY2VdIC0gVGhlIHJlc291cmNlIHRoYXQgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGxvYWRlZC5cbiAqL1xuXG4vKipcbiAqIExvYWQgcmVzb3VyY2UgZGF0YSwgcG90ZW50aWFsbHkgZnJvbSByZW1vdGUgc291cmNlcy4gQ2FjaGVzIHJlc291cmNlIG9uIGxvYWQgdG8gcHJldmVudCBtdWx0aXBsZVxuICogcmVxdWVzdHMuIEFkZCBSZXNvdXJjZUhhbmRsZXJzIHRvIGhhbmRsZSBkaWZmZXJlbnQgdHlwZXMgb2YgcmVzb3VyY2VzLlxuICovXG5jbGFzcyBSZXNvdXJjZUxvYWRlciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IFJlc291cmNlTG9hZGVyIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4uL2FwcC1iYXNlLmpzJykuQXBwQmFzZX0gYXBwIC0gVGhlIGFwcGxpY2F0aW9uLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGFwcCkge1xuICAgICAgICB0aGlzLl9oYW5kbGVycyA9IHt9O1xuICAgICAgICB0aGlzLl9yZXF1ZXN0cyA9IHt9O1xuICAgICAgICB0aGlzLl9jYWNoZSA9IHt9O1xuICAgICAgICB0aGlzLl9hcHAgPSBhcHA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEge0BsaW5rIFJlc291cmNlSGFuZGxlcn0gZm9yIGEgcmVzb3VyY2UgdHlwZS4gSGFuZGxlciBzaG91bGQgc3VwcG9ydCBhdCBsZWFzdCBgbG9hZCgpYFxuICAgICAqIGFuZCBgb3BlbigpYC4gSGFuZGxlcnMgY2FuIG9wdGlvbmFsbHkgc3VwcG9ydCBwYXRjaChhc3NldCwgYXNzZXRzKSB0byBoYW5kbGUgZGVwZW5kZW5jaWVzIG9uXG4gICAgICogb3RoZXIgYXNzZXRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgbmFtZSBvZiB0aGUgcmVzb3VyY2UgdHlwZSB0aGF0IHRoZSBoYW5kbGVyIHdpbGwgYmUgcmVnaXN0ZXJlZFxuICAgICAqIHdpdGguIENhbiBiZTpcbiAgICAgKlxuICAgICAqIC0ge0BsaW5rIEFTU0VUX0FOSU1BVElPTn1cbiAgICAgKiAtIHtAbGluayBBU1NFVF9BVURJT31cbiAgICAgKiAtIHtAbGluayBBU1NFVF9JTUFHRX1cbiAgICAgKiAtIHtAbGluayBBU1NFVF9KU09OfVxuICAgICAqIC0ge0BsaW5rIEFTU0VUX01PREVMfVxuICAgICAqIC0ge0BsaW5rIEFTU0VUX01BVEVSSUFMfVxuICAgICAqIC0ge0BsaW5rIEFTU0VUX1RFWFR9XG4gICAgICogLSB7QGxpbmsgQVNTRVRfVEVYVFVSRX1cbiAgICAgKiAtIHtAbGluayBBU1NFVF9DVUJFTUFQfVxuICAgICAqIC0ge0BsaW5rIEFTU0VUX1NIQURFUn1cbiAgICAgKiAtIHtAbGluayBBU1NFVF9DU1N9XG4gICAgICogLSB7QGxpbmsgQVNTRVRfSFRNTH1cbiAgICAgKiAtIHtAbGluayBBU1NFVF9TQ1JJUFR9XG4gICAgICogLSB7QGxpbmsgQVNTRVRfQ09OVEFJTkVSfVxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4vaGFuZGxlci5qcycpLlJlc291cmNlSGFuZGxlcn0gaGFuZGxlciAtIEFuIGluc3RhbmNlIG9mIGEgcmVzb3VyY2UgaGFuZGxlclxuICAgICAqIHN1cHBvcnRpbmcgYXQgbGVhc3QgYGxvYWQoKWAgYW5kIGBvcGVuKClgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxvYWRlciA9IG5ldyBSZXNvdXJjZUxvYWRlcigpO1xuICAgICAqIGxvYWRlci5hZGRIYW5kbGVyKFwianNvblwiLCBuZXcgcGMuSnNvbkhhbmRsZXIoKSk7XG4gICAgICovXG4gICAgYWRkSGFuZGxlcih0eXBlLCBoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX2hhbmRsZXJzW3R5cGVdID0gaGFuZGxlcjtcbiAgICAgICAgaGFuZGxlci5fbG9hZGVyID0gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSB7QGxpbmsgUmVzb3VyY2VIYW5kbGVyfSBmb3IgYSByZXNvdXJjZSB0eXBlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgbmFtZSBvZiB0aGUgdHlwZSB0aGF0IHRoZSBoYW5kbGVyIHdpbGwgYmUgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICByZW1vdmVIYW5kbGVyKHR5cGUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2hhbmRsZXJzW3R5cGVdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIHtAbGluayBSZXNvdXJjZUhhbmRsZXJ9IGZvciBhIHJlc291cmNlIHR5cGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSBuYW1lIG9mIHRoZSByZXNvdXJjZSB0eXBlIHRoYXQgdGhlIGhhbmRsZXIgaXMgcmVnaXN0ZXJlZCB3aXRoLlxuICAgICAqIEByZXR1cm5zIHtpbXBvcnQoJy4vaGFuZGxlci5qcycpLlJlc291cmNlSGFuZGxlcn0gVGhlIHJlZ2lzdGVyZWQgaGFuZGxlci5cbiAgICAgKi9cbiAgICBnZXRIYW5kbGVyKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZXJzW3R5cGVdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ha2UgYSByZXF1ZXN0IGZvciBhIHJlc291cmNlIGZyb20gYSByZW1vdGUgVVJMLiBQYXJzZSB0aGUgcmV0dXJuZWQgZGF0YSB1c2luZyB0aGUgaGFuZGxlclxuICAgICAqIGZvciB0aGUgc3BlY2lmaWVkIHR5cGUuIFdoZW4gbG9hZGVkIGFuZCBwYXJzZWQsIHVzZSB0aGUgY2FsbGJhY2sgdG8gcmV0dXJuIGFuIGluc3RhbmNlIG9mXG4gICAgICogdGhlIHJlc291cmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSBVUkwgb2YgdGhlIHJlc291cmNlIHRvIGxvYWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgdHlwZSBvZiByZXNvdXJjZSBleHBlY3RlZC5cbiAgICAgKiBAcGFyYW0ge1Jlc291cmNlTG9hZGVyQ2FsbGJhY2t9IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIHVzZWQgd2hlbiB0aGUgcmVzb3VyY2UgaXMgbG9hZGVkIG9yXG4gICAgICogYW4gZXJyb3Igb2NjdXJzLiBQYXNzZWQgKGVyciwgcmVzb3VyY2UpIHdoZXJlIGVyciBpcyBudWxsIGlmIHRoZXJlIGFyZSBubyBlcnJvcnMuXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4uL2Fzc2V0L2Fzc2V0LmpzJykuQXNzZXR9IFthc3NldF0gLSBPcHRpb25hbCBhc3NldCB0aGF0IGlzIHBhc3NlZCBpbnRvXG4gICAgICogaGFuZGxlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGFwcC5sb2FkZXIubG9hZChcIi4uL3BhdGgvdG8vdGV4dHVyZS5wbmdcIiwgXCJ0ZXh0dXJlXCIsIGZ1bmN0aW9uIChlcnIsIHRleHR1cmUpIHtcbiAgICAgKiAgICAgLy8gdXNlIHRleHR1cmUgaGVyZVxuICAgICAqIH0pO1xuICAgICAqL1xuICAgIGxvYWQodXJsLCB0eXBlLCBjYWxsYmFjaywgYXNzZXQpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX2hhbmRsZXJzW3R5cGVdO1xuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IGBObyByZXNvdXJjZSBoYW5kbGVyIGZvciBhc3NldCB0eXBlOiAnJHt0eXBlfScgd2hlbiBsb2FkaW5nIFske3VybH1dYDtcbiAgICAgICAgICAgIERlYnVnLmVycm9yT25jZShlcnIpO1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhhbmRsZSByZXF1ZXN0cyB3aXRoIG51bGwgZmlsZVxuICAgICAgICBpZiAoIXVybCkge1xuICAgICAgICAgICAgdGhpcy5fbG9hZE51bGwoaGFuZGxlciwgY2FsbGJhY2ssIGFzc2V0KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGtleSA9IHVybCArIHR5cGU7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NhY2hlW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gaW4gY2FjaGVcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHRoaXMuX2NhY2hlW2tleV0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3JlcXVlc3RzW2tleV0pIHtcbiAgICAgICAgICAgIC8vIGV4aXN0aW5nIHJlcXVlc3RcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RzW2tleV0ucHVzaChjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBuZXcgcmVxdWVzdFxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdHNba2V5XSA9IFtjYWxsYmFja107XG5cbiAgICAgICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVMb2FkID0gZnVuY3Rpb24gKGVyciwgdXJsT2JqKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9vbkZhaWx1cmUoa2V5LCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaGFuZGxlci5sb2FkKHVybE9iaiwgZnVuY3Rpb24gKGVyciwgZGF0YSwgZXh0cmEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIGtleSBleGlzdHMgYmVjYXVzZSBsb2FkZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gbWlnaHQgaGF2ZSBiZWVuIGRlc3Ryb3llZCBieSBub3dcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLl9yZXF1ZXN0c1trZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9vbkZhaWx1cmUoa2V5LCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX29uU3VjY2VzcyhrZXksIGhhbmRsZXIub3Blbih1cmxPYmoub3JpZ2luYWwsIGRhdGEsIGFzc2V0KSwgZXh0cmEpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9vbkZhaWx1cmUoa2V5LCBlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGFzc2V0KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRVcmwgPSB1cmwuc3BsaXQoJz8nKVswXTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9hcHAuZW5hYmxlQnVuZGxlcyAmJiB0aGlzLl9hcHAuYnVuZGxlcy5oYXNVcmwobm9ybWFsaXplZFVybCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2FwcC5idW5kbGVzLmNhbkxvYWRVcmwobm9ybWFsaXplZFVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlTG9hZChgQnVuZGxlIGZvciAke3VybH0gbm90IGxvYWRlZCB5ZXRgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuX2FwcC5idW5kbGVzLmxvYWRVcmwobm9ybWFsaXplZFVybCwgZnVuY3Rpb24gKGVyciwgZmlsZVVybEZyb21CdW5kbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlTG9hZChlcnIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWQ6IGZpbGVVcmxGcm9tQnVuZGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IG5vcm1hbGl6ZWRVcmxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhbmRsZUxvYWQobnVsbCwge1xuICAgICAgICAgICAgICAgICAgICBsb2FkOiB1cmwsXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBhc3NldCAmJiBhc3NldC5maWxlLmZpbGVuYW1lIHx8IHVybFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gbG9hZCBhbiBhc3NldCB3aXRoIG5vIHVybCwgc2tpcHBpbmcgYnVuZGxlcyBhbmQgY2FjaGluZ1xuICAgIF9sb2FkTnVsbChoYW5kbGVyLCBjYWxsYmFjaywgYXNzZXQpIHtcbiAgICAgICAgY29uc3Qgb25Mb2FkID0gZnVuY3Rpb24gKGVyciwgZGF0YSwgZXh0cmEpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBoYW5kbGVyLm9wZW4obnVsbCwgZGF0YSwgYXNzZXQpLCBleHRyYSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGhhbmRsZXIubG9hZChudWxsLCBvbkxvYWQsIGFzc2V0KTtcbiAgICB9XG5cbiAgICBfb25TdWNjZXNzKGtleSwgcmVzdWx0LCBleHRyYSkge1xuICAgICAgICB0aGlzLl9jYWNoZVtrZXldID0gcmVzdWx0O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3JlcXVlc3RzW2tleV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RzW2tleV1baV0obnVsbCwgcmVzdWx0LCBleHRyYSk7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIHRoaXMuX3JlcXVlc3RzW2tleV07XG4gICAgfVxuXG4gICAgX29uRmFpbHVyZShrZXksIGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIGlmICh0aGlzLl9yZXF1ZXN0c1trZXldKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3JlcXVlc3RzW2tleV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXF1ZXN0c1trZXldW2ldKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcmVxdWVzdHNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgcmF3IHJlc291cmNlIGRhdGEgaW50byBhIHJlc291cmNlIGluc3RhbmNlLiBFLmcuIFRha2UgM0QgbW9kZWwgZm9ybWF0IEpTT04gYW5kXG4gICAgICogcmV0dXJuIGEge0BsaW5rIE1vZGVsfS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIHR5cGUgb2YgcmVzb3VyY2UuXG4gICAgICogQHBhcmFtIHsqfSBkYXRhIC0gVGhlIHJhdyByZXNvdXJjZSBkYXRhLlxuICAgICAqIEByZXR1cm5zIHsqfSBUaGUgcGFyc2VkIHJlc291cmNlIGRhdGEuXG4gICAgICovXG4gICAgb3Blbih0eXBlLCBkYXRhKSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9oYW5kbGVyc1t0eXBlXTtcbiAgICAgICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHJlc291cmNlIGhhbmRsZXIgZm91bmQgZm9yOiAnICsgdHlwZSk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoYW5kbGVyLm9wZW4obnVsbCwgZGF0YSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIGFueSBvcGVyYXRpb25zIG9uIGEgcmVzb3VyY2UsIHRoYXQgcmVxdWlyZXMgYSBkZXBlbmRlbmN5IG9uIGl0cyBhc3NldCBkYXRhIG9yIGFueVxuICAgICAqIG90aGVyIGFzc2V0IGRhdGEuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vYXNzZXQvYXNzZXQuanMnKS5Bc3NldH0gYXNzZXQgLSBUaGUgYXNzZXQgdG8gcGF0Y2guXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4uL2Fzc2V0L2Fzc2V0LXJlZ2lzdHJ5LmpzJykuQXNzZXRSZWdpc3RyeX0gYXNzZXRzIC0gVGhlIGFzc2V0IHJlZ2lzdHJ5LlxuICAgICAqL1xuICAgIHBhdGNoKGFzc2V0LCBhc3NldHMpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuX2hhbmRsZXJzW2Fzc2V0LnR5cGVdO1xuICAgICAgICBpZiAoIWhhbmRsZXIpICB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHJlc291cmNlIGhhbmRsZXIgZm91bmQgZm9yOiAnICsgYXNzZXQudHlwZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlci5wYXRjaCkge1xuICAgICAgICAgICAgaGFuZGxlci5wYXRjaChhc3NldCwgYXNzZXRzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSByZXNvdXJjZSBmcm9tIGNhY2hlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSBVUkwgb2YgdGhlIHJlc291cmNlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIHR5cGUgb2YgcmVzb3VyY2UuXG4gICAgICovXG4gICAgY2xlYXJDYWNoZSh1cmwsIHR5cGUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2NhY2hlW3VybCArIHR5cGVdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGNhY2hlIGZvciByZXNvdXJjZSBmcm9tIGEgVVJMLiBJZiBwcmVzZW50LCByZXR1cm4gdGhlIGNhY2hlZCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBUaGUgVVJMIG9mIHRoZSByZXNvdXJjZSB0byBnZXQgZnJvbSB0aGUgY2FjaGUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgdHlwZSBvZiB0aGUgcmVzb3VyY2UuXG4gICAgICogQHJldHVybnMgeyp9IFRoZSByZXNvdXJjZSBsb2FkZWQgZnJvbSB0aGUgY2FjaGUuXG4gICAgICovXG4gICAgZ2V0RnJvbUNhY2hlKHVybCwgdHlwZSkge1xuICAgICAgICBpZiAodGhpcy5fY2FjaGVbdXJsICsgdHlwZV0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYWNoZVt1cmwgKyB0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuYWJsZXMgcmV0cnlpbmcgb2YgZmFpbGVkIHJlcXVlc3RzIHdoZW4gbG9hZGluZyBhc3NldHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4UmV0cmllcyAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiB0aW1lcyB0byByZXRyeSBsb2FkaW5nIGFuIGFzc2V0LiBEZWZhdWx0c1xuICAgICAqIHRvIDUuXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIGVuYWJsZVJldHJ5KG1heFJldHJpZXMgPSA1KSB7XG4gICAgICAgIG1heFJldHJpZXMgPSBNYXRoLm1heCgwLCBtYXhSZXRyaWVzKSB8fCAwO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuX2hhbmRsZXJzKSB7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVyc1trZXldLm1heFJldHJpZXMgPSBtYXhSZXRyaWVzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzYWJsZXMgcmV0cnlpbmcgb2YgZmFpbGVkIHJlcXVlc3RzIHdoZW4gbG9hZGluZyBhc3NldHMuXG4gICAgICpcbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgZGlzYWJsZVJldHJ5KCkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLl9oYW5kbGVycykge1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlcnNba2V5XS5tYXhSZXRyaWVzID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHRoZSByZXNvdXJjZSBsb2FkZXIuXG4gICAgICovXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5faGFuZGxlcnMgPSB7fTtcbiAgICAgICAgdGhpcy5fcmVxdWVzdHMgPSB7fTtcbiAgICAgICAgdGhpcy5fY2FjaGUgPSB7fTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFJlc291cmNlTG9hZGVyIH07XG4iXSwibmFtZXMiOlsiUmVzb3VyY2VMb2FkZXIiLCJjb25zdHJ1Y3RvciIsImFwcCIsIl9oYW5kbGVycyIsIl9yZXF1ZXN0cyIsIl9jYWNoZSIsIl9hcHAiLCJhZGRIYW5kbGVyIiwidHlwZSIsImhhbmRsZXIiLCJfbG9hZGVyIiwicmVtb3ZlSGFuZGxlciIsImdldEhhbmRsZXIiLCJsb2FkIiwidXJsIiwiY2FsbGJhY2siLCJhc3NldCIsImVyciIsIkRlYnVnIiwiZXJyb3JPbmNlIiwiX2xvYWROdWxsIiwia2V5IiwidW5kZWZpbmVkIiwicHVzaCIsInNlbGYiLCJoYW5kbGVMb2FkIiwidXJsT2JqIiwiX29uRmFpbHVyZSIsImRhdGEiLCJleHRyYSIsIl9vblN1Y2Nlc3MiLCJvcGVuIiwib3JpZ2luYWwiLCJlIiwibm9ybWFsaXplZFVybCIsInNwbGl0IiwiZW5hYmxlQnVuZGxlcyIsImJ1bmRsZXMiLCJoYXNVcmwiLCJjYW5Mb2FkVXJsIiwibG9hZFVybCIsImZpbGVVcmxGcm9tQnVuZGxlIiwiZmlsZSIsImZpbGVuYW1lIiwib25Mb2FkIiwicmVzdWx0IiwiaSIsImxlbmd0aCIsImNvbnNvbGUiLCJlcnJvciIsIndhcm4iLCJwYXRjaCIsImFzc2V0cyIsImNsZWFyQ2FjaGUiLCJnZXRGcm9tQ2FjaGUiLCJlbmFibGVSZXRyeSIsIm1heFJldHJpZXMiLCJNYXRoIiwibWF4IiwiZGlzYWJsZVJldHJ5IiwiZGVzdHJveSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWNBLE1BQU1BLGNBQWMsQ0FBQztFQU1qQkMsV0FBVyxDQUFDQyxHQUFHLEVBQUU7QUFDYixJQUFBLElBQUksQ0FBQ0MsU0FBUyxHQUFHLEVBQUUsQ0FBQTtBQUNuQixJQUFBLElBQUksQ0FBQ0MsU0FBUyxHQUFHLEVBQUUsQ0FBQTtBQUNuQixJQUFBLElBQUksQ0FBQ0MsTUFBTSxHQUFHLEVB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
