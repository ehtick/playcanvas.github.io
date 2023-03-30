/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { Tracing } from './tracing.js';

/**
 * Engine debug log system. Note that the logging only executes in the
 * debug build of the engine, and is stripped out in other builds.
 *
 * @ignore
 */
class Debug {
  /**
   * Set storing already logged messages, to only print each unique message one time.
   *
   * @type {Set<string>}
   * @private
   */

  /**
   * Deprecated warning message.
   *
   * @param {string} message - The message to log.
   */
  static deprecated(message) {
    if (!Debug._loggedMessages.has(message)) {
      Debug._loggedMessages.add(message);
      console.warn('DEPRECATED: ' + message);
    }
  }

  /**
   * Assertion deprecated message. If the assertion is false, the deprecated message is written to the log.
   *
   * @param {boolean|object} assertion - The assertion to check.
   * @param {string} message - The message to log.
   */
  static assertDeprecated(assertion, message) {
    if (!assertion) {
      Debug.deprecated(message);
    }
  }

  /**
   * Assertion error message. If the assertion is false, the error message is written to the log.
   *
   * @param {boolean|object} assertion - The assertion to check.
   * @param {...*} args - The values to be written to the log.
   */
  static assert(assertion, ...args) {
    if (!assertion) {
      console.error('ASSERT FAILED: ', ...args);
    }
  }

  /**
   * Assertion error message that writes an error message to the log if the object has already
   * been destroyed. To be used along setDestroyed.
   *
   * @param {object} object - The object to check.
   */
  static assertDestroyed(object) {
    if (object != null && object.__alreadyDestroyed) {
      var _object$constructor;
      const message = `[${(_object$constructor = object.constructor) == null ? void 0 : _object$constructor.name}] with name [${object.name}] has already been destroyed, and cannot be used.`;
      if (!Debug._loggedMessages.has(message)) {
        Debug._loggedMessages.add(message);
        console.error('ASSERT FAILED: ', message, object);
      }
    }
  }

  /**
   * Executes a function in debug mode only.
   *
   * @param {Function} func - Function to call.
   */
  static call(func) {
    func();
  }

  /**
   * Info message.
   *
   * @param {...*} args - The values to be written to the log.
   */
  static log(...args) {
    console.log(...args);
  }

  /**
   * Info message logged no more than once.
   *
   * @param {string} message - The message to log.
   */
  static logOnce(message) {
    if (!Debug._loggedMessages.has(message)) {
      Debug._loggedMessages.add(message);
      console.log(message);
    }
  }

  /**
   * Warning message.
   *
   * @param {...*} args - The values to be written to the log.
   */
  static warn(...args) {
    console.warn(...args);
  }

  /**
   * Warning message logged no more than once.
   *
   * @param {string} message - The message to log.
   */
  static warnOnce(message) {
    if (!Debug._loggedMessages.has(message)) {
      Debug._loggedMessages.add(message);
      console.warn(message);
    }
  }

  /**
   * Error message.
   *
   * @param {...*} args - The values to be written to the log.
   */
  static error(...args) {
    console.error(...args);
  }

  /**
   * Error message logged no more than once.
   *
   * @param {string} message - The message to log.
   */
  static errorOnce(message) {
    if (!Debug._loggedMessages.has(message)) {
      Debug._loggedMessages.add(message);
      console.error(message);
    }
  }

  /**
   * Trace message, which is logged to the console if the tracing for the channel is enabled
   *
   * @param {string} channel - The trace channel
   * @param {...*} args - The values to be written to the log.
   */
  static trace(channel, ...args) {
    if (Tracing.get(channel)) {
      console.groupCollapsed(`${channel.padEnd(20, ' ')}|`, ...args);
      if (Tracing.stack) {
        console.trace();
      }
      console.groupEnd();
    }
  }
}

/**
 * A helper debug functionality.
 *
 * @ignore
 */
Debug._loggedMessages = new Set();
class DebugHelper {
  /**
   * Set a name to the name property of the object. Executes only in the debug build.
   *
   * @param {object} object - The object to assign the name to.
   * @param {string} name - The name to assign.
   */
  static setName(object, name) {
    if (object) {
      object.name = name;
    }
  }

  /**
   * Set a label to the label property of the object. Executes only in the debug build.
   *
   * @param {object} object - The object to assign the name to.
   * @param {string} label - The label to assign.
   */
  static setLabel(object, label) {
    if (object) {
      object.label = label;
    }
  }

  /**
   * Marks object as destroyed. Executes only in the debug build. To be used along assertDestroyed.
   *
   * @param {object} object - The object to mark as destroyed.
   */
  static setDestroyed(object) {
    if (object) {
      object.__alreadyDestroyed = true;
    }
  }
}

export { Debug, DebugHelper };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWcuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2RlYnVnLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRyYWNpbmcgfSBmcm9tIFwiLi90cmFjaW5nLmpzXCI7XG5cbi8qKlxuICogRW5naW5lIGRlYnVnIGxvZyBzeXN0ZW0uIE5vdGUgdGhhdCB0aGUgbG9nZ2luZyBvbmx5IGV4ZWN1dGVzIGluIHRoZVxuICogZGVidWcgYnVpbGQgb2YgdGhlIGVuZ2luZSwgYW5kIGlzIHN0cmlwcGVkIG91dCBpbiBvdGhlciBidWlsZHMuXG4gKlxuICogQGlnbm9yZVxuICovXG5jbGFzcyBEZWJ1ZyB7XG4gICAgLyoqXG4gICAgICogU2V0IHN0b3JpbmcgYWxyZWFkeSBsb2dnZWQgbWVzc2FnZXMsIHRvIG9ubHkgcHJpbnQgZWFjaCB1bmlxdWUgbWVzc2FnZSBvbmUgdGltZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtTZXQ8c3RyaW5nPn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHN0YXRpYyBfbG9nZ2VkTWVzc2FnZXMgPSBuZXcgU2V0KCk7XG5cbiAgICAvKipcbiAgICAgKiBEZXByZWNhdGVkIHdhcm5pbmcgbWVzc2FnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gbG9nLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXByZWNhdGVkKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKCFEZWJ1Zy5fbG9nZ2VkTWVzc2FnZXMuaGFzKG1lc3NhZ2UpKSB7XG4gICAgICAgICAgICBEZWJ1Zy5fbG9nZ2VkTWVzc2FnZXMuYWRkKG1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdERVBSRUNBVEVEOiAnICsgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBc3NlcnRpb24gZGVwcmVjYXRlZCBtZXNzYWdlLiBJZiB0aGUgYXNzZXJ0aW9uIGlzIGZhbHNlLCB0aGUgZGVwcmVjYXRlZCBtZXNzYWdlIGlzIHdyaXR0ZW4gdG8gdGhlIGxvZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxvYmplY3R9IGFzc2VydGlvbiAtIFRoZSBhc3NlcnRpb24gdG8gY2hlY2suXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byBsb2cuXG4gICAgICovXG4gICAgc3RhdGljIGFzc2VydERlcHJlY2F0ZWQoYXNzZXJ0aW9uLCBtZXNzYWdlKSB7XG4gICAgICAgIGlmICghYXNzZXJ0aW9uKSB7XG4gICAgICAgICAgICBEZWJ1Zy5kZXByZWNhdGVkKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXNzZXJ0aW9uIGVycm9yIG1lc3NhZ2UuIElmIHRoZSBhc3NlcnRpb24gaXMgZmFsc2UsIHRoZSBlcnJvciBtZXNzYWdlIGlzIHdyaXR0ZW4gdG8gdGhlIGxvZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxvYmplY3R9IGFzc2VydGlvbiAtIFRoZSBhc3NlcnRpb24gdG8gY2hlY2suXG4gICAgICogQHBhcmFtIHsuLi4qfSBhcmdzIC0gVGhlIHZhbHVlcyB0byBiZSB3cml0dGVuIHRvIHRoZSBsb2cuXG4gICAgICovXG4gICAgc3RhdGljIGFzc2VydChhc3NlcnRpb24sIC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFhc3NlcnRpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0FTU0VSVCBGQUlMRUQ6ICcsIC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXNzZXJ0aW9uIGVycm9yIG1lc3NhZ2UgdGhhdCB3cml0ZXMgYW4gZXJyb3IgbWVzc2FnZSB0byB0aGUgbG9nIGlmIHRoZSBvYmplY3QgaGFzIGFscmVhZHlcbiAgICAgKiBiZWVuIGRlc3Ryb3llZC4gVG8gYmUgdXNlZCBhbG9uZyBzZXREZXN0cm95ZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IC0gVGhlIG9iamVjdCB0byBjaGVjay5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXNzZXJ0RGVzdHJveWVkKG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0Py5fX2FscmVhZHlEZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgWyR7b2JqZWN0LmNvbnN0cnVjdG9yPy5uYW1lfV0gd2l0aCBuYW1lIFske29iamVjdC5uYW1lfV0gaGFzIGFscmVhZHkgYmVlbiBkZXN0cm95ZWQsIGFuZCBjYW5ub3QgYmUgdXNlZC5gO1xuICAgICAgICAgICAgaWYgKCFEZWJ1Zy5fbG9nZ2VkTWVzc2FnZXMuaGFzKG1lc3NhZ2UpKSB7XG4gICAgICAgICAgICAgICAgRGVidWcuX2xvZ2dlZE1lc3NhZ2VzLmFkZChtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdBU1NFUlQgRkFJTEVEOiAnLCBtZXNzYWdlLCBvYmplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgYSBmdW5jdGlvbiBpbiBkZWJ1ZyBtb2RlIG9ubHkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gdG8gY2FsbC5cbiAgICAgKi9cbiAgICBzdGF0aWMgY2FsbChmdW5jKSB7XG4gICAgICAgIGZ1bmMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbmZvIG1lc3NhZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgdmFsdWVzIHRvIGJlIHdyaXR0ZW4gdG8gdGhlIGxvZy5cbiAgICAgKi9cbiAgICBzdGF0aWMgbG9nKC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5mbyBtZXNzYWdlIGxvZ2dlZCBubyBtb3JlIHRoYW4gb25jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gbG9nLlxuICAgICAqL1xuICAgIHN0YXRpYyBsb2dPbmNlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKCFEZWJ1Zy5fbG9nZ2VkTWVzc2FnZXMuaGFzKG1lc3NhZ2UpKSB7XG4gICAgICAgICAgICBEZWJ1Zy5fbG9nZ2VkTWVzc2FnZXMuYWRkKG1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYXJuaW5nIG1lc3NhZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgdmFsdWVzIHRvIGJlIHdyaXR0ZW4gdG8gdGhlIGxvZy5cbiAgICAgKi9cbiAgICBzdGF0aWMgd2FybiguLi5hcmdzKSB7XG4gICAgICAgIGNvbnNvbGUud2FybiguLi5hcmdzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYXJuaW5nIG1lc3NhZ2UgbG9nZ2VkIG5vIG1vcmUgdGhhbiBvbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byBsb2cuXG4gICAgICovXG4gICAgc3RhdGljIHdhcm5PbmNlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKCFEZWJ1Zy5fbG9nZ2VkTWVzc2FnZXMuaGFzKG1lc3NhZ2UpKSB7XG4gICAgICAgICAgICBEZWJ1Zy5fbG9nZ2VkTWVzc2FnZXMuYWRkKG1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXJyb3IgbWVzc2FnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Li4uKn0gYXJncyAtIFRoZSB2YWx1ZXMgdG8gYmUgd3JpdHRlbiB0byB0aGUgbG9nLlxuICAgICAqL1xuICAgIHN0YXRpYyBlcnJvciguLi5hcmdzKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXJyb3IgbWVzc2FnZSBsb2dnZWQgbm8gbW9yZSB0aGFuIG9uY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIGxvZy5cbiAgICAgKi9cbiAgICBzdGF0aWMgZXJyb3JPbmNlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKCFEZWJ1Zy5fbG9nZ2VkTWVzc2FnZXMuaGFzKG1lc3NhZ2UpKSB7XG4gICAgICAgICAgICBEZWJ1Zy5fbG9nZ2VkTWVzc2FnZXMuYWRkKG1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYWNlIG1lc3NhZ2UsIHdoaWNoIGlzIGxvZ2dlZCB0byB0aGUgY29uc29sZSBpZiB0aGUgdHJhY2luZyBmb3IgdGhlIGNoYW5uZWwgaXMgZW5hYmxlZFxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYW5uZWwgLSBUaGUgdHJhY2UgY2hhbm5lbFxuICAgICAqIEBwYXJhbSB7Li4uKn0gYXJncyAtIFRoZSB2YWx1ZXMgdG8gYmUgd3JpdHRlbiB0byB0aGUgbG9nLlxuICAgICAqL1xuICAgIHN0YXRpYyB0cmFjZShjaGFubmVsLCAuLi5hcmdzKSB7XG4gICAgICAgIGlmIChUcmFjaW5nLmdldChjaGFubmVsKSkge1xuICAgICAgICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZChgJHtjaGFubmVsLnBhZEVuZCgyMCwgJyAnKX18YCwgLi4uYXJncyk7XG4gICAgICAgICAgICBpZiAoVHJhY2luZy5zdGFjaykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIGhlbHBlciBkZWJ1ZyBmdW5jdGlvbmFsaXR5LlxuICpcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgRGVidWdIZWxwZXIge1xuICAgIC8qKlxuICAgICAqIFNldCBhIG5hbWUgdG8gdGhlIG5hbWUgcHJvcGVydHkgb2YgdGhlIG9iamVjdC4gRXhlY3V0ZXMgb25seSBpbiB0aGUgZGVidWcgYnVpbGQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IC0gVGhlIG9iamVjdCB0byBhc3NpZ24gdGhlIG5hbWUgdG8uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSB0byBhc3NpZ24uXG4gICAgICovXG4gICAgc3RhdGljIHNldE5hbWUob2JqZWN0LCBuYW1lKSB7XG4gICAgICAgIGlmIChvYmplY3QpIHtcbiAgICAgICAgICAgIG9iamVjdC5uYW1lID0gbmFtZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIGxhYmVsIHRvIHRoZSBsYWJlbCBwcm9wZXJ0eSBvZiB0aGUgb2JqZWN0LiBFeGVjdXRlcyBvbmx5IGluIHRoZSBkZWJ1ZyBidWlsZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3QgLSBUaGUgb2JqZWN0IHRvIGFzc2lnbiB0aGUgbmFtZSB0by5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWwgLSBUaGUgbGFiZWwgdG8gYXNzaWduLlxuICAgICAqL1xuICAgIHN0YXRpYyBzZXRMYWJlbChvYmplY3QsIGxhYmVsKSB7XG4gICAgICAgIGlmIChvYmplY3QpIHtcbiAgICAgICAgICAgIG9iamVjdC5sYWJlbCA9IGxhYmVsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFya3Mgb2JqZWN0IGFzIGRlc3Ryb3llZC4gRXhlY3V0ZXMgb25seSBpbiB0aGUgZGVidWcgYnVpbGQuIFRvIGJlIHVzZWQgYWxvbmcgYXNzZXJ0RGVzdHJveWVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9iamVjdCAtIFRoZSBvYmplY3QgdG8gbWFyayBhcyBkZXN0cm95ZWQuXG4gICAgICovXG4gICAgc3RhdGljIHNldERlc3Ryb3llZChvYmplY3QpIHtcbiAgICAgICAgaWYgKG9iamVjdCkge1xuICAgICAgICAgICAgb2JqZWN0Ll9fYWxyZWFkeURlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IERlYnVnLCBEZWJ1Z0hlbHBlciB9O1xuIl0sIm5hbWVzIjpbIkRlYnVnIiwiZGVwcmVjYXRlZCIsIm1lc3NhZ2UiLCJfbG9nZ2VkTWVzc2FnZXMiLCJoYXMiLCJhZGQiLCJjb25zb2xlIiwid2FybiIsImFzc2VydERlcHJlY2F0ZWQiLCJhc3NlcnRpb24iLCJhc3NlcnQiLCJhcmdzIiwiZXJyb3IiLCJhc3NlcnREZXN0cm95ZWQiLCJvYmplY3QiLCJfX2FscmVhZHlEZXN0cm95ZWQiLCJfb2JqZWN0JGNvbnN0cnVjdG9yIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiY2FsbCIsImZ1bmMiLCJsb2ciLCJsb2dPbmNlIiwid2Fybk9uY2UiLCJlcnJvck9uY2UiLCJ0cmFjZSIsImNoYW5uZWwiLCJUcmFjaW5nIiwiZ2V0IiwiZ3JvdXBDb2xsYXBzZWQiLCJwYWRFbmQiLCJzdGFjayIsImdyb3VwRW5kIiwiU2V0IiwiRGVidWdIZWxwZXIiLCJzZXROYW1lIiwic2V0TGFiZWwiLCJsYWJlbCIsInNldERlc3Ryb3llZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLEtBQUssQ0FBQztBQUNSO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0VBQ0ksT0FBT0MsVUFBVUEsQ0FBQ0MsT0FBTyxFQUFFO0lBQ3ZCLElBQUksQ0FBQ0YsS0FBSyxDQUFDRyxlQUFlLENBQUNDLEdBQUcsQ0FBQ0YsT0FB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
