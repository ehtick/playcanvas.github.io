import { path } from '../../core/path.js';
import { Debug } from '../../core/debug.js';
import { Http, http } from '../../platform/net/http.js';
import { hasAudioContext } from '../../platform/audio/capabilities.js';
import { Sound } from '../../platform/sound/sound.js';

/** @typedef {import('./handler.js').ResourceHandler} ResourceHandler */

// checks if user is running IE
const ie = function () {
  if (typeof window === 'undefined') {
    // Node.js => return false
    return false;
  }
  const ua = window.navigator.userAgent;
  const msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }
  const trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    const rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }
  return false;
}();
const supportedExtensions = ['.ogg', '.mp3', '.wav', '.mp4a', '.m4a', '.mp4', '.aac', '.opus'];

/**
 * Resource handler used for loading {@link Sound} resources.
 *
 * @implements {ResourceHandler}
 */
class AudioHandler {
  /**
   * Create a new AudioHandler instance.
   *
   * @param {import('../app-base.js').AppBase} app - The running {@link AppBase}.
   * @hideconstructor
   */
  constructor(app) {
    /**
     * Type of the resource the handler handles.
     *
     * @type {string}
     */
    this.handlerType = "audio";
    this.manager = app.soundManager;
    Debug.assert(this.manager, "AudioSourceComponentSystem cannot be created without sound manager");
    this.maxRetries = 0;
  }
  _isSupported(url) {
    const ext = path.getExtension(url);
    return supportedExtensions.indexOf(ext) > -1;
  }
  load(url, callback) {
    if (typeof url === 'string') {
      url = {
        load: url,
        original: url
      };
    }
    const success = function success(resource) {
      callback(null, new Sound(resource));
    };
    const error = function error(err) {
      let msg = 'Error loading audio url: ' + url.original;
      if (err) {
        msg += ': ' + (err.message || err);
      }
      console.warn(msg);
      callback(msg);
    };
    if (this._createSound) {
      if (!this._isSupported(url.original)) {
        error(`Audio format for ${url.original} not supported`);
        return;
      }
      this._createSound(url.load, success, error);
    } else {
      error(null);
    }
  }
  open(url, data) {
    return data;
  }
  patch(asset, assets) {}

  /**
   * Loads an audio asset using an AudioContext by URL and calls success or error with the
   * created resource or error respectively.
   *
   * @param {string} url - The url of the audio asset.
   * @param {Function} success - Function to be called if the audio asset was loaded or if we
   * just want to continue without errors even if the audio is not loaded.
   * @param {Function} error - Function to be called if there was an error while loading the
   * audio asset.
   * @private
   */
  _createSound(url, success, error) {
    if (hasAudioContext()) {
      const manager = this.manager;
      if (!manager.context) {
        error('Audio manager has no audio context');
        return;
      }

      // if this is a blob URL we need to set the response type to arraybuffer
      const options = {
        retry: this.maxRetries > 0,
        maxRetries: this.maxRetries
      };
      if (url.startsWith('blob:') || url.startsWith('data:')) {
        options.responseType = Http.ResponseType.ARRAY_BUFFER;
      }
      http.get(url, options, function (err, response) {
        if (err) {
          error(err);
          return;
        }
        manager.context.decodeAudioData(response, success, error);
      });
    } else {
      let audio = null;
      try {
        audio = new Audio();
      } catch (e) {
        // Some windows platforms will report Audio as available, then throw an exception when
        // the object is created.
        error('No support for Audio element');
        return;
      }

      // audio needs to be added to the DOM for IE
      if (ie) {
        document.body.appendChild(audio);
      }
      const onReady = function onReady() {
        audio.removeEventListener('canplaythrough', onReady);

        // remove from DOM no longer necessary
        if (ie) {
          document.body.removeChild(audio);
        }
        success(audio);
      };
      audio.onerror = function () {
        audio.onerror = null;

        // remove from DOM no longer necessary
        if (ie) {
          document.body.removeChild(audio);
        }
        error();
      };
      audio.addEventListener('canplaythrough', onReady);
      audio.src = url;
    }
  }
}

export { AudioHandler };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaW8uanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvaGFuZGxlcnMvYXVkaW8uanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGF0aCB9IGZyb20gJy4uLy4uL2NvcmUvcGF0aC5qcyc7XG5pbXBvcnQgeyBEZWJ1ZyB9IGZyb20gJy4uLy4uL2NvcmUvZGVidWcuanMnO1xuXG5pbXBvcnQgeyBodHRwLCBIdHRwIH0gZnJvbSAnLi4vLi4vcGxhdGZvcm0vbmV0L2h0dHAuanMnO1xuXG5pbXBvcnQgeyBoYXNBdWRpb0NvbnRleHQgfSBmcm9tICcuLi8uLi9wbGF0Zm9ybS9hdWRpby9jYXBhYmlsaXRpZXMuanMnO1xuXG5pbXBvcnQgeyBTb3VuZCB9IGZyb20gJy4uLy4uL3BsYXRmb3JtL3NvdW5kL3NvdW5kLmpzJztcblxuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4vaGFuZGxlci5qcycpLlJlc291cmNlSGFuZGxlcn0gUmVzb3VyY2VIYW5kbGVyICovXG5cbi8vIGNoZWNrcyBpZiB1c2VyIGlzIHJ1bm5pbmcgSUVcbmNvbnN0IGllID0gKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gTm9kZS5qcyA9PiByZXR1cm4gZmFsc2VcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCB1YSA9IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gICAgY29uc3QgbXNpZSA9IHVhLmluZGV4T2YoJ01TSUUgJyk7XG4gICAgaWYgKG1zaWUgPiAwKSB7XG4gICAgICAgIC8vIElFIDEwIG9yIG9sZGVyID0+IHJldHVybiB2ZXJzaW9uIG51bWJlclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQodWEuc3Vic3RyaW5nKG1zaWUgKyA1LCB1YS5pbmRleE9mKCcuJywgbXNpZSkpLCAxMCk7XG4gICAgfVxuXG4gICAgY29uc3QgdHJpZGVudCA9IHVhLmluZGV4T2YoJ1RyaWRlbnQvJyk7XG4gICAgaWYgKHRyaWRlbnQgPiAwKSB7XG4gICAgICAgIC8vIElFIDExID0+IHJldHVybiB2ZXJzaW9uIG51bWJlclxuICAgICAgICBjb25zdCBydiA9IHVhLmluZGV4T2YoJ3J2OicpO1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQodWEuc3Vic3RyaW5nKHJ2ICsgMywgdWEuaW5kZXhPZignLicsIHJ2KSksIDEwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59KSgpO1xuXG5jb25zdCBzdXBwb3J0ZWRFeHRlbnNpb25zID0gW1xuICAgICcub2dnJyxcbiAgICAnLm1wMycsXG4gICAgJy53YXYnLFxuICAgICcubXA0YScsXG4gICAgJy5tNGEnLFxuICAgICcubXA0JyxcbiAgICAnLmFhYycsXG4gICAgJy5vcHVzJ1xuXTtcblxuLyoqXG4gKiBSZXNvdXJjZSBoYW5kbGVyIHVzZWQgZm9yIGxvYWRpbmcge0BsaW5rIFNvdW5kfSByZXNvdXJjZXMuXG4gKlxuICogQGltcGxlbWVudHMge1Jlc291cmNlSGFuZGxlcn1cbiAqL1xuY2xhc3MgQXVkaW9IYW5kbGVyIHtcbiAgICAvKipcbiAgICAgKiBUeXBlIG9mIHRoZSByZXNvdXJjZSB0aGUgaGFuZGxlciBoYW5kbGVzLlxuICAgICAqXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBoYW5kbGVyVHlwZSA9IFwiYXVkaW9cIjtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBBdWRpb0hhbmRsZXIgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vYXBwLWJhc2UuanMnKS5BcHBCYXNlfSBhcHAgLSBUaGUgcnVubmluZyB7QGxpbmsgQXBwQmFzZX0uXG4gICAgICogQGhpZGVjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGFwcCkge1xuICAgICAgICB0aGlzLm1hbmFnZXIgPSBhcHAuc291bmRNYW5hZ2VyO1xuICAgICAgICBEZWJ1Zy5hc3NlcnQodGhpcy5tYW5hZ2VyLCBcIkF1ZGlvU291cmNlQ29tcG9uZW50U3lzdGVtIGNhbm5vdCBiZSBjcmVhdGVkIHdpdGhvdXQgc291bmQgbWFuYWdlclwiKTtcblxuICAgICAgICB0aGlzLm1heFJldHJpZXMgPSAwO1xuICAgIH1cblxuICAgIF9pc1N1cHBvcnRlZCh1cmwpIHtcbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5nZXRFeHRlbnNpb24odXJsKTtcblxuICAgICAgICByZXR1cm4gc3VwcG9ydGVkRXh0ZW5zaW9ucy5pbmRleE9mKGV4dCkgPiAtMTtcbiAgICB9XG5cbiAgICBsb2FkKHVybCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB1cmwgPSB7XG4gICAgICAgICAgICAgICAgbG9hZDogdXJsLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB1cmxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdWNjZXNzID0gZnVuY3Rpb24gKHJlc291cmNlKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBuZXcgU291bmQocmVzb3VyY2UpKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBlcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGxldCBtc2cgPSAnRXJyb3IgbG9hZGluZyBhdWRpbyB1cmw6ICcgKyB1cmwub3JpZ2luYWw7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgbXNnICs9ICc6ICcgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihtc2cpO1xuICAgICAgICAgICAgY2FsbGJhY2sobXNnKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5fY3JlYXRlU291bmQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTdXBwb3J0ZWQodXJsLm9yaWdpbmFsKSkge1xuICAgICAgICAgICAgICAgIGVycm9yKGBBdWRpbyBmb3JtYXQgZm9yICR7dXJsLm9yaWdpbmFsfSBub3Qgc3VwcG9ydGVkYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVTb3VuZCh1cmwubG9hZCwgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IobnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvcGVuKHVybCwgZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICBwYXRjaChhc3NldCwgYXNzZXRzKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgYW4gYXVkaW8gYXNzZXQgdXNpbmcgYW4gQXVkaW9Db250ZXh0IGJ5IFVSTCBhbmQgY2FsbHMgc3VjY2VzcyBvciBlcnJvciB3aXRoIHRoZVxuICAgICAqIGNyZWF0ZWQgcmVzb3VyY2Ugb3IgZXJyb3IgcmVzcGVjdGl2ZWx5LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSB1cmwgb2YgdGhlIGF1ZGlvIGFzc2V0LlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHN1Y2Nlc3MgLSBGdW5jdGlvbiB0byBiZSBjYWxsZWQgaWYgdGhlIGF1ZGlvIGFzc2V0IHdhcyBsb2FkZWQgb3IgaWYgd2VcbiAgICAgKiBqdXN0IHdhbnQgdG8gY29udGludWUgd2l0aG91dCBlcnJvcnMgZXZlbiBpZiB0aGUgYXVkaW8gaXMgbm90IGxvYWRlZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcnJvciAtIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBpZiB0aGVyZSB3YXMgYW4gZXJyb3Igd2hpbGUgbG9hZGluZyB0aGVcbiAgICAgKiBhdWRpbyBhc3NldC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVTb3VuZCh1cmwsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIGlmIChoYXNBdWRpb0NvbnRleHQoKSkge1xuICAgICAgICAgICAgY29uc3QgbWFuYWdlciA9IHRoaXMubWFuYWdlcjtcblxuICAgICAgICAgICAgaWYgKCFtYW5hZ2VyLmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBlcnJvcignQXVkaW8gbWFuYWdlciBoYXMgbm8gYXVkaW8gY29udGV4dCcpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgdGhpcyBpcyBhIGJsb2IgVVJMIHdlIG5lZWQgdG8gc2V0IHRoZSByZXNwb25zZSB0eXBlIHRvIGFycmF5YnVmZmVyXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIHJldHJ5OiB0aGlzLm1heFJldHJpZXMgPiAwLFxuICAgICAgICAgICAgICAgIG1heFJldHJpZXM6IHRoaXMubWF4UmV0cmllc1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHVybC5zdGFydHNXaXRoKCdibG9iOicpIHx8IHVybC5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5yZXNwb25zZVR5cGUgPSBIdHRwLlJlc3BvbnNlVHlwZS5BUlJBWV9CVUZGRVI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGh0dHAuZ2V0KHVybCwgb3B0aW9ucywgZnVuY3Rpb24gKGVyciwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtYW5hZ2VyLmNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHJlc3BvbnNlLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBhdWRpbyA9IG51bGw7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXVkaW8gPSBuZXcgQXVkaW8oKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBTb21lIHdpbmRvd3MgcGxhdGZvcm1zIHdpbGwgcmVwb3J0IEF1ZGlvIGFzIGF2YWlsYWJsZSwgdGhlbiB0aHJvdyBhbiBleGNlcHRpb24gd2hlblxuICAgICAgICAgICAgICAgIC8vIHRoZSBvYmplY3QgaXMgY3JlYXRlZC5cbiAgICAgICAgICAgICAgICBlcnJvcignTm8gc3VwcG9ydCBmb3IgQXVkaW8gZWxlbWVudCcpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYXVkaW8gbmVlZHMgdG8gYmUgYWRkZWQgdG8gdGhlIERPTSBmb3IgSUVcbiAgICAgICAgICAgIGlmIChpZSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXVkaW8pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvblJlYWR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGF1ZGlvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25SZWFkeSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgZnJvbSBET00gbm8gbG9uZ2VyIG5lY2Vzc2FyeVxuICAgICAgICAgICAgICAgIGlmIChpZSkge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGF1ZGlvKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdWNjZXNzKGF1ZGlvKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGF1ZGlvLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYXVkaW8ub25lcnJvciA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgZnJvbSBET00gbm8gbG9uZ2VyIG5lY2Vzc2FyeVxuICAgICAgICAgICAgICAgIGlmIChpZSkge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGF1ZGlvKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBvblJlYWR5KTtcbiAgICAgICAgICAgIGF1ZGlvLnNyYyA9IHVybDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgQXVkaW9IYW5kbGVyIH07XG4iXSwibmFtZXMiOlsiaWUiLCJ3aW5kb3ciLCJ1YSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1zaWUiLCJpbmRleE9mIiwicGFyc2VJbnQiLCJzdWJzdHJpbmciLCJ0cmlkZW50IiwicnYiLCJzdXBwb3J0ZWRFeHRlbnNpb25zIiwiQXVkaW9IYW5kbGVyIiwiY29uc3RydWN0b3IiLCJhcHAiLCJoYW5kbGVyVHlwZSIsIm1hbmFnZXIiLCJzb3VuZE1hbmFnZXIiLCJEZWJ1ZyIsImFzc2VydCIsIm1heFJldHJpZXMiLCJfaXNTdXBwb3J0ZWQiLCJ1cmwiLCJleHQiLCJwYXRoIiwiZ2V0RXh0ZW5zaW9uIiwibG9hZCIsImNhbGxiYWNrIiwib3JpZ2luYWwiLCJzdWNjZXNzIiwicmVzb3VyY2UiLCJTb3VuZCIsImVycm9yIiwiZXJyIiwibXNnIiwibWVzc2FnZSIsImNvbnNvbGUiLCJ3YXJuIiwiX2NyZWF0ZVNvdW5kIiwib3BlbiIsImRhdGEiLCJwYXRjaCIsImFzc2V0IiwiYXNzZXRzIiwiaGFzQXVkaW9Db250ZXh0IiwiY29udGV4dCIsIm9wdGlvbnMiLCJyZXRyeSIsInN0YXJ0c1dpdGgiLCJyZXNwb25zZVR5cGUiLCJIdHRwIiwiUmVzcG9uc2VUeXBlIiwiQVJSQVlfQlVGRkVSIiwiaHR0cCIsImdldCIsInJlc3BvbnNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYXVkaW8iLCJBdWRpbyIsImUiLCJkb2N1bWVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsIm9uUmVhZHkiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlQ2hpbGQiLCJvbmVycm9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsInNyYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBU0E7O0FBRUE7QUFDQSxNQUFNQSxFQUFFLEdBQUksWUFBWTtBQUNwQixFQUFBLElBQUksT0FBT0MsTUFBTSxLQUFLLFdBQVcsRUFBRTtBQUMvQjtBQUNBLElBQUEsT0FBTyxLQUFLLENBQUE7QUFDaEIsR0FBQTtBQUNBLEVBQUEsTUFBTUMsRUFBRSxHQUFHRCxNQUFNLENBQUNFLFNBQVMsQ0FBQ0MsU0FBUyxDQUFBO0FBRXJDLEVBQUEsTUFBTUMsSUFBSSxHQUFHSCxFQUFFLENBQUNJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtFQUNoQyxJQUFJRCxJQUFJLEdBQUcsQ0FBQyxFQUFFO0FBQ1Y7SUFDQSxPQUFPRSxRQUFRLENBQUNMLEVBQUUsQ0FBQ00sU0FBUyxDQUFDSCxJQUFJLEdBQUcsQ0FBQyxFQUFFSCxFQUFFLENBQUNJLE9BQU8sQ0FBQyxHQUFHLEVBQUVELElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDdEUsR0FBQTtBQUVBLEVBQUEsTUFBTUksT0FBTyxHQUFHUCxFQUFFLENBQUNJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtFQUN0QyxJQUFJRyxPQUFPLEdBQUcsQ0FBQyxFQUFFO0FBQ2I7QUFDQSxJQUFBLE1BQU1DLEVBQUUsR0FBR1IsRUFBRSxDQUFDSSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDNUIsT0FBT0MsUUFBUSxDQUFDTCxFQUFFLENBQUNNLFNBQVMsQ0FBQ0UsRUFBRSxHQUFHLENBQUMsRUFBRVIsRUFBRSxDQUFD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
