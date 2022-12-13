/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { type } from '../../core/core.js';
import { ACTION_KEYBOARD, ACTION_MOUSE, ACTION_GAMEPAD, PAD_1, PAD_L_STICK_Y, PAD_L_STICK_X, PAD_R_STICK_Y, PAD_R_STICK_X, EVENT_MOUSEMOVE } from './constants.js';
import { Keyboard } from './keyboard.js';
import { Mouse } from './mouse.js';

class Controller {
  constructor(element, options = {}) {
    this._keyboard = options.keyboard || null;
    this._mouse = options.mouse || null;
    this._gamepads = options.gamepads || null;
    this._element = null;
    this._actions = {};
    this._axes = {};
    this._axesValues = {};
    if (element) {
      this.attach(element);
    }
  }

  attach(element) {
    this._element = element;
    if (this._keyboard) {
      this._keyboard.attach(element);
    }
    if (this._mouse) {
      this._mouse.attach(element);
    }
  }

  detach() {
    if (this._keyboard) {
      this._keyboard.detach();
    }
    if (this._mouse) {
      this._mouse.detach();
    }
    this._element = null;
  }

  disableContextMenu() {
    if (!this._mouse) {
      this._enableMouse();
    }
    this._mouse.disableContextMenu();
  }

  enableContextMenu() {
    if (!this._mouse) {
      this._enableMouse();
    }
    this._mouse.enableContextMenu();
  }

  update(dt) {
    if (this._keyboard) {
      this._keyboard.update();
    }
    if (this._mouse) {
      this._mouse.update();
    }
    if (this._gamepads) {
      this._gamepads.update();
    }

    this._axesValues = {};
    for (const key in this._axes) {
      this._axesValues[key] = [];
    }
  }

  appendAction(action_name, action) {
    this._actions[action_name] = this._actions[action_name] || [];
    this._actions[action_name].push(action);
  }

  registerKeys(action, keys) {
    if (!this._keyboard) {
      this._enableKeyboard();
    }
    if (this._actions[action]) {
      throw new Error(`Action: ${action} already registered`);
    }
    if (keys === undefined) {
      throw new Error('Invalid button');
    }

    if (!keys.length) {
      keys = [keys];
    }

    this.appendAction(action, {
      type: ACTION_KEYBOARD,
      keys
    });
  }

  registerMouse(action, button) {
    if (!this._mouse) {
      this._enableMouse();
    }
    if (button === undefined) {
      throw new Error('Invalid button');
    }

    this.appendAction(action, {
      type: ACTION_MOUSE,
      button
    });
  }

  registerPadButton(action, pad, button) {
    if (button === undefined) {
      throw new Error('Invalid button');
    }
    this.appendAction(action, {
      type: ACTION_GAMEPAD,
      button,
      pad
    });
  }

  registerAxis(options) {
    const name = options.name;
    if (!this._axes[name]) {
      this._axes[name] = [];
    }
    const i = this._axes[name].push(name);
    options = options || {};
    options.pad = options.pad || PAD_1;
    const bind = function bind(controller, source, value, key) {
      switch (source) {
        case 'mousex':
          controller._mouse.on(EVENT_MOUSEMOVE, function (e) {
            controller._axesValues[name][i] = e.dx / 10;
          });
          break;
        case 'mousey':
          controller._mouse.on(EVENT_MOUSEMOVE, function (e) {
            controller._axesValues[name][i] = e.dy / 10;
          });
          break;
        case 'key':
          controller._axes[name].push(function () {
            return controller._keyboard.isPressed(key) ? value : 0;
          });
          break;
        case 'padrx':
          controller._axes[name].push(function () {
            return controller._gamepads.getAxis(options.pad, PAD_R_STICK_X);
          });
          break;
        case 'padry':
          controller._axes[name].push(function () {
            return controller._gamepads.getAxis(options.pad, PAD_R_STICK_Y);
          });
          break;
        case 'padlx':
          controller._axes[name].push(function () {
            return controller._gamepads.getAxis(options.pad, PAD_L_STICK_X);
          });
          break;
        case 'padly':
          controller._axes[name].push(function () {
            return controller._gamepads.getAxis(options.pad, PAD_L_STICK_Y);
          });
          break;
        default:
          throw new Error('Unknown axis');
      }
    };
    bind(this, options.positive, 1, options.positiveKey);
    if (options.negativeKey || options.negative !== options.positive) {
      bind(this, options.negative, -1, options.negativeKey);
    }
  }

  isPressed(actionName) {
    if (!this._actions[actionName]) {
      return false;
    }
    const length = this._actions[actionName].length;
    for (let index = 0; index < length; ++index) {
      const action = this._actions[actionName][index];
      switch (action.type) {
        case ACTION_KEYBOARD:
          if (this._keyboard) {
            const len = action.keys.length;
            for (let i = 0; i < len; i++) {
              if (this._keyboard.isPressed(action.keys[i])) {
                return true;
              }
            }
          }
          break;
        case ACTION_MOUSE:
          if (this._mouse && this._mouse.isPressed(action.button)) {
            return true;
          }
          break;
        case ACTION_GAMEPAD:
          if (this._gamepads && this._gamepads.isPressed(action.pad, action.button)) {
            return true;
          }
          break;
      }
    }
    return false;
  }

  wasPressed(actionName) {
    if (!this._actions[actionName]) {
      return false;
    }
    const length = this._actions[actionName].length;
    for (let index = 0; index < length; ++index) {
      const action = this._actions[actionName][index];
      switch (action.type) {
        case ACTION_KEYBOARD:
          if (this._keyboard) {
            const len = action.keys.length;
            for (let i = 0; i < len; i++) {
              if (this._keyboard.wasPressed(action.keys[i])) {
                return true;
              }
            }
          }
          break;
        case ACTION_MOUSE:
          if (this._mouse && this._mouse.wasPressed(action.button)) {
            return true;
          }
          break;
        case ACTION_GAMEPAD:
          if (this._gamepads && this._gamepads.wasPressed(action.pad, action.button)) {
            return true;
          }
          break;
      }
    }
    return false;
  }
  getAxis(name) {
    let value = 0;
    if (this._axes[name]) {
      const len = this._axes[name].length;
      for (let i = 0; i < len; i++) {
        if (type(this._axes[name][i]) === 'function') {
          const v = this._axes[name][i]();
          if (Math.abs(v) > Math.abs(value)) {
            value = v;
          }
        } else if (this._axesValues[name]) {
          if (Math.abs(this._axesValues[name][i]) > Math.abs(value)) {
            value = this._axesValues[name][i];
          }
        }
      }
    }
    return value;
  }
  _enableMouse() {
    this._mouse = new Mouse();
    if (!this._element) {
      throw new Error('Controller must be attached to an Element');
    }
    this._mouse.attach(this._element);
  }
  _enableKeyboard() {
    this._keyboard = new Keyboard();
    if (!this._element) {
      throw new Error('Controller must be attached to an Element');
    }
    this._keyboard.attach(this._element);
  }
}

export { Controller };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbGxlci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3BsYXRmb3JtL2lucHV0L2NvbnRyb2xsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdHlwZSB9IGZyb20gJy4uLy4uL2NvcmUvY29yZS5qcyc7XG5cbmltcG9ydCB7XG4gICAgQUNUSU9OX0dBTUVQQUQsIEFDVElPTl9LRVlCT0FSRCwgQUNUSU9OX01PVVNFLFxuICAgIEVWRU5UX01PVVNFTU9WRSxcbiAgICBQQURfMSxcbiAgICBQQURfTF9TVElDS19YLCBQQURfTF9TVElDS19ZLCBQQURfUl9TVElDS19YLCBQQURfUl9TVElDS19ZXG59IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IEtleWJvYXJkIH0gZnJvbSAnLi9rZXlib2FyZC5qcyc7XG5pbXBvcnQgeyBNb3VzZSB9IGZyb20gJy4vbW91c2UuanMnO1xuXG4vKipcbiAqIEEgZ2VuZXJhbCBpbnB1dCBoYW5kbGVyIHdoaWNoIGhhbmRsZXMgYm90aCBtb3VzZSBhbmQga2V5Ym9hcmQgaW5wdXQgYXNzaWduZWQgdG8gbmFtZWQgYWN0aW9ucy5cbiAqIFRoaXMgYWxsb3dzIHlvdSB0byBkZWZpbmUgaW5wdXQgaGFuZGxlcnMgc2VwYXJhdGVseSB0byBkZWZpbmluZyBrZXlib2FyZC9tb3VzZSBjb25maWd1cmF0aW9ucy5cbiAqL1xuY2xhc3MgQ29udHJvbGxlciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIGEgQ29udHJvbGxlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gW2VsZW1lbnRdIC0gRWxlbWVudCB0byBhdHRhY2ggQ29udHJvbGxlciB0by5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIC0gT3B0aW9uYWwgYXJndW1lbnRzLlxuICAgICAqIEBwYXJhbSB7S2V5Ym9hcmR9IFtvcHRpb25zLmtleWJvYXJkXSAtIEEgS2V5Ym9hcmQgb2JqZWN0IHRvIHVzZS5cbiAgICAgKiBAcGFyYW0ge01vdXNlfSBbb3B0aW9ucy5tb3VzZV0gLSBBIE1vdXNlIG9iamVjdCB0byB1c2UuXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4vZ2FtZS1wYWRzLmpzJykuR2FtZVBhZHN9IFtvcHRpb25zLmdhbWVwYWRzXSAtIEEgR2FtZXBhZHMgb2JqZWN0IHRvIHVzZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBjID0gbmV3IHBjLkNvbnRyb2xsZXIoZG9jdW1lbnQpO1xuICAgICAqXG4gICAgICogLy8gUmVnaXN0ZXIgdGhlIFwiZmlyZVwiIGFjdGlvbiBhbmQgYXNzaWduIGl0IHRvIGJvdGggdGhlIEVudGVyIGtleSBhbmQgdGhlIHNwYWNlIGJhci5cbiAgICAgKiBjLnJlZ2lzdGVyS2V5cyhcImZpcmVcIiwgW3BjLktFWV9FTlRFUiwgcGMuS0VZX1NQQUNFXSk7XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMuX2tleWJvYXJkID0gb3B0aW9ucy5rZXlib2FyZCB8fCBudWxsO1xuICAgICAgICB0aGlzLl9tb3VzZSA9IG9wdGlvbnMubW91c2UgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5fZ2FtZXBhZHMgPSBvcHRpb25zLmdhbWVwYWRzIHx8IG51bGw7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5fYWN0aW9ucyA9IHt9O1xuICAgICAgICB0aGlzLl9heGVzID0ge307XG4gICAgICAgIHRoaXMuX2F4ZXNWYWx1ZXMgPSB7fTtcblxuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5hdHRhY2goZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggQ29udHJvbGxlciB0byBhbiBFbGVtZW50LiBUaGlzIGlzIHJlcXVpcmVkIGJlZm9yZSB5b3UgY2FuIG1vbml0b3IgZm9yIGtleS9tb3VzZVxuICAgICAqIGlucHV0cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHRvIGF0dGFjaCBtb3VzZSBhbmQga2V5Ym9hcmQgZXZlbnQgaGFuZGxlciB0b28uXG4gICAgICovXG4gICAgYXR0YWNoKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIGlmICh0aGlzLl9rZXlib2FyZCkge1xuICAgICAgICAgICAgdGhpcy5fa2V5Ym9hcmQuYXR0YWNoKGVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX21vdXNlKSB7XG4gICAgICAgICAgICB0aGlzLl9tb3VzZS5hdHRhY2goZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRhY2ggQ29udHJvbGxlciBmcm9tIGFuIEVsZW1lbnQuIFRoaXMgc2hvdWxkIGJlIGRvbmUgYmVmb3JlIHRoZSBDb250cm9sbGVyIGlzIGRlc3Ryb3llZC5cbiAgICAgKi9cbiAgICBkZXRhY2goKSB7XG4gICAgICAgIGlmICh0aGlzLl9rZXlib2FyZCkge1xuICAgICAgICAgICAgdGhpcy5fa2V5Ym9hcmQuZGV0YWNoKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX21vdXNlKSB7XG4gICAgICAgICAgICB0aGlzLl9tb3VzZS5kZXRhY2goKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNhYmxlIHRoZSBjb250ZXh0IG1lbnUgdXN1YWxseSBhY3RpdmF0ZWQgd2l0aCB0aGUgcmlnaHQgbW91c2UgYnV0dG9uLlxuICAgICAqL1xuICAgIGRpc2FibGVDb250ZXh0TWVudSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9tb3VzZSkge1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlTW91c2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX21vdXNlLmRpc2FibGVDb250ZXh0TWVudSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuYWJsZSB0aGUgY29udGV4dCBtZW51IHVzdWFsbHkgYWN0aXZhdGVkIHdpdGggdGhlIHJpZ2h0IG1vdXNlIGJ1dHRvbi4gVGhpcyBpcyBlbmFibGVkIGJ5XG4gICAgICogZGVmYXVsdC5cbiAgICAgKi9cbiAgICBlbmFibGVDb250ZXh0TWVudSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9tb3VzZSkge1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlTW91c2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX21vdXNlLmVuYWJsZUNvbnRleHRNZW51KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRoZSBLZXlib2FyZCBhbmQgTW91c2UgaGFuZGxlcnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZHQgLSBUaGUgdGltZSBzaW5jZSB0aGUgbGFzdCBmcmFtZS5cbiAgICAgKi9cbiAgICB1cGRhdGUoZHQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2tleWJvYXJkKSB7XG4gICAgICAgICAgICB0aGlzLl9rZXlib2FyZC51cGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9tb3VzZSkge1xuICAgICAgICAgICAgdGhpcy5fbW91c2UudXBkYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fZ2FtZXBhZHMpIHtcbiAgICAgICAgICAgIHRoaXMuX2dhbWVwYWRzLnVwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2xlYXIgYXhlcyB2YWx1ZXNcbiAgICAgICAgdGhpcy5fYXhlc1ZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLl9heGVzKSB7XG4gICAgICAgICAgICB0aGlzLl9heGVzVmFsdWVzW2tleV0gPSBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBmdW5jdGlvbiB0byBhcHBlbmQgYW4gYWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbl9uYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGFjdGlvbi5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYWN0aW9uIC0gQW4gYWN0aW9uIG9iamVjdCB0byBhZGQuXG4gICAgICogQHBhcmFtIHtBQ1RJT05fS0VZQk9BUkQgfCBBQ1RJT05fTU9VU0UgfCBBQ1RJT05fR0FNRVBBRH0gYWN0aW9uLnR5cGUgLSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyW119IFthY3Rpb24ua2V5c10gLSBLZXlib2FyZDogQSBsaXN0IG9mIGtleWNvZGVzIGUuZy4gYFtwYy5LRVlfQSwgcGMuS0VZX0VOVEVSXWAuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFthY3Rpb24uYnV0dG9uXSAtIE1vdXNlOiBlLmcuIGBwYy5NT1VTRUJVVFRPTl9MRUZUYCAtIEdhbWVwYWQ6IGUuZy4gYHBjLlBBRF9GQUNFXzFgXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFthY3Rpb24ucGFkXSAtIEdhbWVwYWQ6IEFuIGluZGV4IG9mIHRoZSBwYWQgdG8gcmVnaXN0ZXIgKHVzZSB7QGxpbmsgUEFEXzF9LCBldGMpLlxuICAgICAqL1xuICAgIGFwcGVuZEFjdGlvbihhY3Rpb25fbmFtZSwgYWN0aW9uKSB7XG4gICAgICAgIHRoaXMuX2FjdGlvbnNbYWN0aW9uX25hbWVdID0gdGhpcy5fYWN0aW9uc1thY3Rpb25fbmFtZV0gfHwgW107XG4gICAgICAgIHRoaXMuX2FjdGlvbnNbYWN0aW9uX25hbWVdLnB1c2goYWN0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgb3IgdXBkYXRlIGEgYWN0aW9uIHdoaWNoIGlzIGVuYWJsZWQgd2hlbiB0aGUgc3VwcGxpZWQga2V5cyBhcmUgcHJlc3NlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb24gLSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyW119IGtleXMgLSBBIGxpc3Qgb2Yga2V5Y29kZXMuXG4gICAgICovXG4gICAgcmVnaXN0ZXJLZXlzKGFjdGlvbiwga2V5cykge1xuICAgICAgICBpZiAoIXRoaXMuX2tleWJvYXJkKSB7XG4gICAgICAgICAgICB0aGlzLl9lbmFibGVLZXlib2FyZCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9hY3Rpb25zW2FjdGlvbl0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQWN0aW9uOiAke2FjdGlvbn0gYWxyZWFkeSByZWdpc3RlcmVkYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYnV0dG9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb252ZXJ0IHRvIGFuIGFycmF5XG4gICAgICAgIGlmICgha2V5cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGtleXMgPSBba2V5c107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQga2V5cyB0byBhY3Rpb25zXG4gICAgICAgIHRoaXMuYXBwZW5kQWN0aW9uKGFjdGlvbiwge1xuICAgICAgICAgICAgdHlwZTogQUNUSU9OX0tFWUJPQVJELFxuICAgICAgICAgICAga2V5c1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgb3IgdXBkYXRlIGFuIGFjdGlvbiB3aGljaCBpcyBlbmFibGVkIHdoZW4gdGhlIHN1cHBsaWVkIG1vdXNlIGJ1dHRvbiBpcyBwcmVzc2VkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbiAtIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJ1dHRvbiAtIFRoZSBtb3VzZSBidXR0b24uXG4gICAgICovXG4gICAgcmVnaXN0ZXJNb3VzZShhY3Rpb24sIGJ1dHRvbikge1xuICAgICAgICBpZiAoIXRoaXMuX21vdXNlKSB7XG4gICAgICAgICAgICB0aGlzLl9lbmFibGVNb3VzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJ1dHRvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYnV0dG9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgbW91c2UgYnV0dG9uIHRvIGFjdGlvbnNcbiAgICAgICAgdGhpcy5hcHBlbmRBY3Rpb24oYWN0aW9uLCB7XG4gICAgICAgICAgICB0eXBlOiBBQ1RJT05fTU9VU0UsXG4gICAgICAgICAgICBidXR0b25cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG9yIHVwZGF0ZSBhbiBhY3Rpb24gd2hpY2ggaXMgZW5hYmxlZCB3aGVuIHRoZSBnYW1lcGFkIGJ1dHRvbiBpcyBwcmVzc2VkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbiAtIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBhZCAtIFRoZSBpbmRleCBvZiB0aGUgcGFkIHRvIHJlZ2lzdGVyICh1c2Uge0BsaW5rIFBBRF8xfSwgZXRjKS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYnV0dG9uIC0gVGhlIHBhZCBidXR0b24uXG4gICAgICovXG4gICAgcmVnaXN0ZXJQYWRCdXR0b24oYWN0aW9uLCBwYWQsIGJ1dHRvbikge1xuICAgICAgICBpZiAoYnV0dG9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidXR0b24nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhZGQgZ2FtZXBhZCBidXR0b24gYW5kIHBhZCB0byBhY3Rpb25zXG4gICAgICAgIHRoaXMuYXBwZW5kQWN0aW9uKGFjdGlvbiwge1xuICAgICAgICAgICAgdHlwZTogQUNUSU9OX0dBTUVQQUQsXG4gICAgICAgICAgICBidXR0b24sXG4gICAgICAgICAgICBwYWRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYW4gYWN0aW9uIGFnYWluc3QgYSBjb250cm9sbGVyIGF4aXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIC0gT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBhZF0gLSBUaGUgaW5kZXggb2YgdGhlIGdhbWUgcGFkIHRvIHJlZ2lzdGVyIGZvciAodXNlIHtAbGluayBQQURfMX0sIGV0YykuXG4gICAgICovXG4gICAgcmVnaXN0ZXJBeGlzKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgICAgICAgaWYgKCF0aGlzLl9heGVzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLl9heGVzW25hbWVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaSA9IHRoaXMuX2F4ZXNbbmFtZV0ucHVzaChuYW1lKTtcblxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgb3B0aW9ucy5wYWQgPSBvcHRpb25zLnBhZCB8fCBQQURfMTtcblxuICAgICAgICBjb25zdCBiaW5kID0gZnVuY3Rpb24gKGNvbnRyb2xsZXIsIHNvdXJjZSwgdmFsdWUsIGtleSkge1xuICAgICAgICAgICAgc3dpdGNoIChzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdtb3VzZXgnOlxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLl9tb3VzZS5vbihFVkVOVF9NT1VTRU1PVkUsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLl9heGVzVmFsdWVzW25hbWVdW2ldID0gZS5keCAvIDEwO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbW91c2V5JzpcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5fbW91c2Uub24oRVZFTlRfTU9VU0VNT1ZFLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5fYXhlc1ZhbHVlc1tuYW1lXVtpXSA9IGUuZHkgLyAxMDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2tleSc6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuX2F4ZXNbbmFtZV0ucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbGxlci5fa2V5Ym9hcmQuaXNQcmVzc2VkKGtleSkgPyB2YWx1ZSA6IDA7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdwYWRyeCc6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuX2F4ZXNbbmFtZV0ucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbGxlci5fZ2FtZXBhZHMuZ2V0QXhpcyhvcHRpb25zLnBhZCwgUEFEX1JfU1RJQ0tfWCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdwYWRyeSc6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuX2F4ZXNbbmFtZV0ucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbGxlci5fZ2FtZXBhZHMuZ2V0QXhpcyhvcHRpb25zLnBhZCwgUEFEX1JfU1RJQ0tfWSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdwYWRseCc6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuX2F4ZXNbbmFtZV0ucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbGxlci5fZ2FtZXBhZHMuZ2V0QXhpcyhvcHRpb25zLnBhZCwgUEFEX0xfU1RJQ0tfWCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdwYWRseSc6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuX2F4ZXNbbmFtZV0ucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbGxlci5fZ2FtZXBhZHMuZ2V0QXhpcyhvcHRpb25zLnBhZCwgUEFEX0xfU1RJQ0tfWSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gYXhpcycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGJpbmQodGhpcywgb3B0aW9ucy5wb3NpdGl2ZSwgMSwgb3B0aW9ucy5wb3NpdGl2ZUtleSk7XG4gICAgICAgIGlmIChvcHRpb25zLm5lZ2F0aXZlS2V5IHx8IG9wdGlvbnMubmVnYXRpdmUgIT09IG9wdGlvbnMucG9zaXRpdmUpIHtcbiAgICAgICAgICAgIGJpbmQodGhpcywgb3B0aW9ucy5uZWdhdGl2ZSwgLTEsIG9wdGlvbnMubmVnYXRpdmVLZXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGFjdGlvbiBpcyBlbmFibGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbk5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBhY3Rpb24gaXMgZW5hYmxlZC5cbiAgICAgKi9cbiAgICBpc1ByZXNzZWQoYWN0aW9uTmFtZSkge1xuICAgICAgICBpZiAoIXRoaXMuX2FjdGlvbnNbYWN0aW9uTmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuX2FjdGlvbnNbYWN0aW9uTmFtZV0ubGVuZ3RoO1xuXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMuX2FjdGlvbnNbYWN0aW9uTmFtZV1baW5kZXhdO1xuICAgICAgICAgICAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgQUNUSU9OX0tFWUJPQVJEOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fa2V5Ym9hcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlbiA9IGFjdGlvbi5rZXlzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fa2V5Ym9hcmQuaXNQcmVzc2VkKGFjdGlvbi5rZXlzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBBQ1RJT05fTU9VU0U6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9tb3VzZSAmJiB0aGlzLl9tb3VzZS5pc1ByZXNzZWQoYWN0aW9uLmJ1dHRvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgQUNUSU9OX0dBTUVQQUQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9nYW1lcGFkcyAmJiB0aGlzLl9nYW1lcGFkcy5pc1ByZXNzZWQoYWN0aW9uLnBhZCwgYWN0aW9uLmJ1dHRvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFjdGlvbiB3YXMgZW5hYmxlZCB0aGlzIHNpbmNlIHRoZSBsYXN0IHVwZGF0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb25OYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGFjdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgYWN0aW9uIHdhcyBlbmFibGVkIHRoaXMgc2luY2UgdGhlIGxhc3QgdXBkYXRlLlxuICAgICAqL1xuICAgIHdhc1ByZXNzZWQoYWN0aW9uTmFtZSkge1xuICAgICAgICBpZiAoIXRoaXMuX2FjdGlvbnNbYWN0aW9uTmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuX2FjdGlvbnNbYWN0aW9uTmFtZV0ubGVuZ3RoO1xuXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMuX2FjdGlvbnNbYWN0aW9uTmFtZV1baW5kZXhdO1xuICAgICAgICAgICAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgQUNUSU9OX0tFWUJPQVJEOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fa2V5Ym9hcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlbiA9IGFjdGlvbi5rZXlzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fa2V5Ym9hcmQud2FzUHJlc3NlZChhY3Rpb24ua2V5c1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgQUNUSU9OX01PVVNFOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fbW91c2UgJiYgdGhpcy5fbW91c2Uud2FzUHJlc3NlZChhY3Rpb24uYnV0dG9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBBQ1RJT05fR0FNRVBBRDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2dhbWVwYWRzICYmIHRoaXMuX2dhbWVwYWRzLndhc1ByZXNzZWQoYWN0aW9uLnBhZCwgYWN0aW9uLmJ1dHRvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRBeGlzKG5hbWUpIHtcbiAgICAgICAgbGV0IHZhbHVlID0gMDtcblxuICAgICAgICBpZiAodGhpcy5fYXhlc1tuYW1lXSkge1xuICAgICAgICAgICAgY29uc3QgbGVuID0gdGhpcy5fYXhlc1tuYW1lXS5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUodGhpcy5fYXhlc1tuYW1lXVtpXSkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMuX2F4ZXNbbmFtZV1baV0oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHYpID4gTWF0aC5hYnModmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHY7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2F4ZXNWYWx1ZXNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMuX2F4ZXNWYWx1ZXNbbmFtZV1baV0pID4gTWF0aC5hYnModmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuX2F4ZXNWYWx1ZXNbbmFtZV1baV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgX2VuYWJsZU1vdXNlKCkge1xuICAgICAgICB0aGlzLl9tb3VzZSA9IG5ldyBNb3VzZSgpO1xuICAgICAgICBpZiAoIXRoaXMuX2VsZW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29udHJvbGxlciBtdXN0IGJlIGF0dGFjaGVkIHRvIGFuIEVsZW1lbnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9tb3VzZS5hdHRhY2godGhpcy5fZWxlbWVudCk7XG4gICAgfVxuXG4gICAgX2VuYWJsZUtleWJvYXJkKCkge1xuICAgICAgICB0aGlzLl9rZXlib2FyZCA9IG5ldyBLZXlib2FyZCgpO1xuICAgICAgICBpZiAoIXRoaXMuX2VsZW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29udHJvbGxlciBtdXN0IGJlIGF0dGFjaGVkIHRvIGFuIEVsZW1lbnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9rZXlib2FyZC5hdHRhY2godGhpcy5fZWxlbWVudCk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBDb250cm9sbGVyIH07XG4iXSwibmFtZXMiOlsiQ29udHJvbGxlciIsImNvbnN0cnVjdG9yIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfa2V5Ym9hcmQiLCJrZXlib2FyZCIsIl9tb3VzZSIsIm1vdXNlIiwiX2dhbWVwYWRzIiwiZ2FtZXBhZHMiLCJfZWxlbWVudCIsIl9hY3Rpb25zIiwiX2F4ZXMiLCJfYXhlc1ZhbHVlcyIsImF0dGFjaCIsImRldGFjaCIsImRpc2FibGVDb250ZXh0TWVudSIsIl9lbmFibGVNb3VzZSIsImVuYWJsZUNvbnRleHRNZW51IiwidXBkYXRlIiwiZHQiLCJrZXkiLCJhcHBlbmRBY3Rpb24iLCJhY3Rpb25fbmFtZSIsImFjdGlvbiIsInB1c2giLCJyZWdpc3RlcktleXMiLCJrZXlzIiwiX2VuYWJsZUtleWJvYXJkIiwiRXJyb3IiLCJ1bmRlZmluZWQiLCJsZW5ndGgiLCJ0eXBlIiwiQUNUSU9OX0tFWUJPQVJEIiwicmVnaXN0ZXJNb3VzZSIsImJ1dHRvbiIsIkFDVElPTl9NT1VTRSIsInJlZ2lzdGVyUGFkQnV0dG9uIiwicGFkIiwiQUNUSU9OX0dBTUVQQUQiLCJyZWdpc3RlckF4aXMiLCJuYW1lIiwiaSIsIlBBRF8xIiwiYmluZCIsImNvbnRyb2xsZXIiLCJzb3VyY2UiLCJ2YWx1ZSIsIm9uIiwiRVZFTlRfTU9VU0VNT1ZFIiwiZSIsImR4IiwiZHkiLCJpc1ByZXNzZWQiLCJnZXRBeGlzIiwiUEFEX1JfU1RJQ0tfWCIsIlBBRF9SX1NUSUNLX1kiLCJQQURfTF9TVElDS19YIiwiUEFEX0xfU1RJQ0tfWSIsInBvc2l0aXZlIiwicG9zaXRpdmVLZXkiLCJuZWdhdGl2ZUtleSIsIm5lZ2F0aXZlIiwiYWN0aW9uTmFtZSIsImluZGV4IiwibGVuIiwid2FzUHJlc3NlZCIsInYiLCJNYXRoIiwiYWJzIiwiTW91c2UiLCJLZXlib2FyZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQWVBLE1BQU1BLFVBQVUsQ0FBQztBQWViQyxFQUFBQSxXQUFXLENBQUNDLE9BQU8sRUFBRUMsT0FBTyxHQUFHLEVBQUUsRUFBRTtBQUMvQixJQUFBLElBQUksQ0FBQ0MsU0FBUyxHQUFHRCxPQUFPLENBQUNFLFFBQVEsSUFBSSxJQUFJLENBQUE7QUFDekMsSUFBQSxJQUFJLENBQUNDLE1BQU0sR0FBR0gsT0FBTyxDQUFDSSxLQUFLLElBQUksSUFBSSxDQUFBO0FBQ25DLElBQUEsSUFBSSxDQUFDQyxTQUFTLEdBQUdMLE9BQU8sQ0FBQ00sUUFBUSxJQUFJLElBQUksQ0FBQTtJQUV6QyxJQUFJLENBQUNDLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFFcEIsSUFBQSxJQUFJLENBQUNDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsSUFBQSxJQUFJLENBQUNDLEtBQUssR0FBRyxFQUFFLENBQUE7QUFDZixJQUFBLElBQUksQ0FBQ0MsV0FBVyxHQUFHLEVBQUUsQ0FB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
