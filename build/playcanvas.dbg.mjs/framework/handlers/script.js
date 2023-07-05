import { script } from '../script.js';
import { ScriptTypes } from '../script/script-types.js';

/** @typedef {import('./handler.js').ResourceHandler} ResourceHandler */

/**
 * Resource handler for loading JavaScript files dynamically.  Two types of JavaScript files can be
 * loaded, PlayCanvas scripts which contain calls to {@link createScript}, or regular JavaScript
 * files, such as third-party libraries.
 *
 * @implements {ResourceHandler}
 */
class ScriptHandler {
  /**
   * Create a new ScriptHandler instance.
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
    this.handlerType = "script";
    this._app = app;
    this._scripts = {};
    this._cache = {};
  }
  load(url, callback) {
    // Scripts don't support bundling since we concatenate them. Below is for consistency.
    if (typeof url === 'string') {
      url = {
        load: url,
        original: url
      };
    }
    const self = this;
    script.app = this._app;
    this._loadScript(url.load, (err, url, extra) => {
      if (!err) {
        if (script.legacy) {
          let Type = null;
          // pop the type from the loading stack
          if (ScriptTypes._types.length) {
            Type = ScriptTypes._types.pop();
          }
          if (Type) {
            // store indexed by URL
            this._scripts[url] = Type;
          } else {
            Type = null;
          }

          // return the resource
          callback(null, Type, extra);
        } else {
          const obj = {};
          for (let i = 0; i < ScriptTypes._types.length; i++) obj[ScriptTypes._types[i].name] = ScriptTypes._types[i];
          ScriptTypes._types.length = 0;
          callback(null, obj, extra);

          // no cache for scripts
          delete self._loader._cache[url + 'script'];
        }
      } else {
        callback(err);
      }
    });
  }
  open(url, data) {
    return data;
  }
  patch(asset, assets) {}
  _loadScript(url, callback) {
    const head = document.head;
    const element = document.createElement('script');
    this._cache[url] = element;

    // use async=false to force scripts to execute in order
    element.async = false;
    element.addEventListener('error', function (e) {
      callback(`Script: ${e.target.src} failed to load`);
    }, false);
    let done = false;
    element.onload = element.onreadystatechange = function () {
      if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
        done = true; // prevent double event firing
        callback(null, url, element);
      }
    };
    // set the src attribute after the onload callback is set, to avoid an instant loading failing to fire the callback
    element.src = url;
    head.appendChild(element);
  }
}

export { ScriptHandler };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2hhbmRsZXJzL3NjcmlwdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzY3JpcHQgfSBmcm9tICcuLi9zY3JpcHQuanMnO1xuaW1wb3J0IHsgU2NyaXB0VHlwZXMgfSBmcm9tICcuLi9zY3JpcHQvc2NyaXB0LXR5cGVzLmpzJztcblxuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4vaGFuZGxlci5qcycpLlJlc291cmNlSGFuZGxlcn0gUmVzb3VyY2VIYW5kbGVyICovXG5cbi8qKlxuICogUmVzb3VyY2UgaGFuZGxlciBmb3IgbG9hZGluZyBKYXZhU2NyaXB0IGZpbGVzIGR5bmFtaWNhbGx5LiAgVHdvIHR5cGVzIG9mIEphdmFTY3JpcHQgZmlsZXMgY2FuIGJlXG4gKiBsb2FkZWQsIFBsYXlDYW52YXMgc2NyaXB0cyB3aGljaCBjb250YWluIGNhbGxzIHRvIHtAbGluayBjcmVhdGVTY3JpcHR9LCBvciByZWd1bGFyIEphdmFTY3JpcHRcbiAqIGZpbGVzLCBzdWNoIGFzIHRoaXJkLXBhcnR5IGxpYnJhcmllcy5cbiAqXG4gKiBAaW1wbGVtZW50cyB7UmVzb3VyY2VIYW5kbGVyfVxuICovXG5jbGFzcyBTY3JpcHRIYW5kbGVyIHtcbiAgICAvKipcbiAgICAgKiBUeXBlIG9mIHRoZSByZXNvdXJjZSB0aGUgaGFuZGxlciBoYW5kbGVzLlxuICAgICAqXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBoYW5kbGVyVHlwZSA9IFwic2NyaXB0XCI7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgU2NyaXB0SGFuZGxlciBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi9hcHAtYmFzZS5qcycpLkFwcEJhc2V9IGFwcCAtIFRoZSBydW5uaW5nIHtAbGluayBBcHBCYXNlfS5cbiAgICAgKiBAaGlkZWNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXBwKSB7XG4gICAgICAgIHRoaXMuX2FwcCA9IGFwcDtcbiAgICAgICAgdGhpcy5fc2NyaXB0cyA9IHsgfTtcbiAgICAgICAgdGhpcy5fY2FjaGUgPSB7IH07XG4gICAgfVxuXG4gICAgbG9hZCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIFNjcmlwdHMgZG9uJ3Qgc3VwcG9ydCBidW5kbGluZyBzaW5jZSB3ZSBjb25jYXRlbmF0ZSB0aGVtLiBCZWxvdyBpcyBmb3IgY29uc2lzdGVuY3kuXG4gICAgICAgIGlmICh0eXBlb2YgdXJsID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdXJsID0ge1xuICAgICAgICAgICAgICAgIGxvYWQ6IHVybCxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbDogdXJsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNjcmlwdC5hcHAgPSB0aGlzLl9hcHA7XG5cbiAgICAgICAgdGhpcy5fbG9hZFNjcmlwdCh1cmwubG9hZCwgKGVyciwgdXJsLCBleHRyYSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2NyaXB0LmxlZ2FjeSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgVHlwZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIC8vIHBvcCB0aGUgdHlwZSBmcm9tIHRoZSBsb2FkaW5nIHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIGlmIChTY3JpcHRUeXBlcy5fdHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBUeXBlID0gU2NyaXB0VHlwZXMuX3R5cGVzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKFR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIGluZGV4ZWQgYnkgVVJMXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JpcHRzW3VybF0gPSBUeXBlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgVHlwZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJlc291cmNlXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIFR5cGUsIGV4dHJhKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvYmogPSB7IH07XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBTY3JpcHRUeXBlcy5fdHlwZXMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpbU2NyaXB0VHlwZXMuX3R5cGVzW2ldLm5hbWVdID0gU2NyaXB0VHlwZXMuX3R5cGVzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIFNjcmlwdFR5cGVzLl90eXBlcy5sZW5ndGggPSAwO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIG9iaiwgZXh0cmEpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vIGNhY2hlIGZvciBzY3JpcHRzXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBzZWxmLl9sb2FkZXIuX2NhY2hlW3VybCArICdzY3JpcHQnXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9wZW4odXJsLCBkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIHBhdGNoKGFzc2V0LCBhc3NldHMpIHsgfVxuXG4gICAgX2xvYWRTY3JpcHQodXJsLCBjYWxsYmFjaykge1xuICAgICAgICBjb25zdCBoZWFkID0gZG9jdW1lbnQuaGVhZDtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICB0aGlzLl9jYWNoZVt1cmxdID0gZWxlbWVudDtcblxuICAgICAgICAvLyB1c2UgYXN5bmM9ZmFsc2UgdG8gZm9yY2Ugc2NyaXB0cyB0byBleGVjdXRlIGluIG9yZGVyXG4gICAgICAgIGVsZW1lbnQuYXN5bmMgPSBmYWxzZTtcblxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGBTY3JpcHQ6ICR7ZS50YXJnZXQuc3JjfSBmYWlsZWQgdG8gbG9hZGApO1xuICAgICAgICB9LCBmYWxzZSk7XG5cbiAgICAgICAgbGV0IGRvbmUgPSBmYWxzZTtcbiAgICAgICAgZWxlbWVudC5vbmxvYWQgPSBlbGVtZW50Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghZG9uZSAmJiAoIXRoaXMucmVhZHlTdGF0ZSB8fCAodGhpcy5yZWFkeVN0YXRlID09PSAnbG9hZGVkJyB8fCB0aGlzLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpKSkge1xuICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlOyAvLyBwcmV2ZW50IGRvdWJsZSBldmVudCBmaXJpbmdcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB1cmwsIGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBzZXQgdGhlIHNyYyBhdHRyaWJ1dGUgYWZ0ZXIgdGhlIG9ubG9hZCBjYWxsYmFjayBpcyBzZXQsIHRvIGF2b2lkIGFuIGluc3RhbnQgbG9hZGluZyBmYWlsaW5nIHRvIGZpcmUgdGhlIGNhbGxiYWNrXG4gICAgICAgIGVsZW1lbnQuc3JjID0gdXJsO1xuXG4gICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBTY3JpcHRIYW5kbGVyIH07XG4iXSwibmFtZXMiOlsiU2NyaXB0SGFuZGxlciIsImNvbnN0cnVjdG9yIiwiYXBwIiwiaGFuZGxlclR5cGUiLCJfYXBwIiwiX3NjcmlwdHMiLCJfY2FjaGUiLCJsb2FkIiwidXJsIiwiY2FsbGJhY2siLCJvcmlnaW5hbCIsInNlbGYiLCJzY3JpcHQiLCJfbG9hZFNjcmlwdCIsImVyciIsImV4dHJhIiwibGVnYWN5IiwiVHlwZSIsIlNjcmlwdFR5cGVzIiwiX3R5cGVzIiwibGVuZ3RoIiwicG9wIiwib2JqIiwiaSIsIm5hbWUiLCJfbG9hZGVyIiwib3BlbiIsImRhdGEiLCJwYXRjaCIsImFzc2V0IiwiYXNzZXRzIiwiaGVhZCIsImRvY3VtZW50IiwiZWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJhc3luYyIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwidGFyZ2V0Iiwic3JjIiwiZG9uZSIsIm9ubG9hZCIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJhcHBlbmRDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQSxhQUFhLENBQUM7QUFRaEI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0lDLFdBQVdBLENBQUNDLEdBQUcsRUFBRTtBQWJqQjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0lBSkksSUFLQUMsQ0FBQUEsV0FBVyxHQUFHLFFBQVEsQ0FBQTtJQVNsQixJQUFJLENBQUNDLElBQUksR0FBR0YsR0FBRyxDQUFBO0FBQ2YsSUFBQSxJQUFJLENBQUNHLFFBQVEsR0FBRyxFQUFHLENBQUE7QUFDbkIsSUFBQSxJQUFJLENBQUNDLE1BQU0sR0FBRyxFQUFHLENBQUE7QUFDckIsR0FBQTtBQUVBQyxFQUFBQSxJQUFJQSxDQUFDQyxHQUFHLEVBQUVDLFFBQVEsRUFBRTtBQUNoQjtBQUNBLElBQUEs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
