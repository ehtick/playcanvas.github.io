/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../../core/debug.js';
import { path } from '../../../core/path.js';
import { Component } from '../component.js';

class ScriptLegacyComponent extends Component {
  constructor(system, entity) {
    super(system, entity);
    this.on('set_scripts', this.onSetScripts, this);
  }
  send(name, functionName) {
    Debug.deprecated('ScriptLegacyComponent.send() is deprecated and will be removed soon. Please use: http://developer.playcanvas.com/user-manual/scripting/communication/');
    const args = Array.prototype.slice.call(arguments, 2);
    const instances = this.entity.script.instances;
    let fn;
    if (instances && instances[name]) {
      fn = instances[name].instance[functionName];
      if (fn) {
        return fn.apply(instances[name].instance, args);
      }
    }
    return undefined;
  }
  onEnable() {
    if (this.data.areScriptsLoaded && !this.system.preloading) {
      if (!this.data.initialized) {
        this.system._initializeScriptComponent(this);
      } else {
        this.system._enableScriptComponent(this);
      }
      if (!this.data.postInitialized) {
        this.system._postInitializeScriptComponent(this);
      }
    }
  }
  onDisable() {
    this.system._disableScriptComponent(this);
  }
  onSetScripts(name, oldValue, newValue) {
    if (!this.system._inTools || this.runInTools) {
      if (this._updateScriptAttributes(oldValue, newValue)) {
        return;
      }

      if (this.enabled) {
        this.system._disableScriptComponent(this);
      }
      this.system._destroyScriptComponent(this);
      this.data.areScriptsLoaded = false;

      const scripts = newValue;
      const urls = scripts.map(function (s) {
        return s.url;
      });

      if (this._loadFromCache(urls)) {
        return;
      }

      this._loadScripts(urls);
    }
  }

  _updateScriptAttributes(oldValue, newValue) {
    let onlyUpdateAttributes = true;
    if (oldValue.length !== newValue.length) {
      onlyUpdateAttributes = false;
    } else {
      for (let i = 0, len = newValue.length; i < len; i++) {
        if (oldValue[i].url !== newValue[i].url) {
          onlyUpdateAttributes = false;
          break;
        }
      }
    }
    if (onlyUpdateAttributes) {
      for (const key in this.instances) {
        if (this.instances.hasOwnProperty(key)) {
          this.system._updateAccessors(this.entity, this.instances[key]);
        }
      }
    }
    return onlyUpdateAttributes;
  }

  _loadFromCache(urls) {
    const cached = [];
    const prefix = this.system.app._scriptPrefix || '';
    const regex = /^http(s)?:\/\//i;
    for (let i = 0, len = urls.length; i < len; i++) {
      let url = urls[i];
      if (!regex.test(url)) {
        url = path.join(prefix, url);
      }
      const type = this.system.app.loader.getFromCache(url, 'script');

      if (!type) {
        return false;
      }
      cached.push(type);
    }
    for (let i = 0, len = cached.length; i < len; i++) {
      const ScriptType = cached[i];

      if (ScriptType === true) {
        continue;
      }

      if (ScriptType && this.entity.script) {
        if (!this.entity.script.instances[ScriptType._pcScriptName]) {
          const instance = new ScriptType(this.entity);
          this.system._preRegisterInstance(this.entity, urls[i], ScriptType._pcScriptName, instance);
        }
      }
    }
    if (this.data) {
      this.data.areScriptsLoaded = true;
    }

    if (!this.system.preloading) {
      this.system.onInitialize(this.entity);
      this.system.onPostInitialize(this.entity);
    }
    return true;
  }
  _loadScripts(urls) {
    let count = urls.length;
    const prefix = this.system.app._scriptPrefix || '';
    urls.forEach(url => {
      let _url = null;
      let _unprefixed = null;
      if (url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://')) {
        _unprefixed = url;
        _url = url;
      } else {
        _unprefixed = url;
        _url = path.join(prefix, url);
      }
      this.system.app.loader.load(_url, 'script', (err, ScriptType) => {
        count--;
        if (!err) {
          if (ScriptType && this.entity.script) {
            if (!this.entity.script.instances[ScriptType._pcScriptName]) {
              const instance = new ScriptType(this.entity);
              this.system._preRegisterInstance(this.entity, _unprefixed, ScriptType._pcScriptName, instance);
            }
          }
        } else {
          console.error(err);
        }
        if (count === 0) {
          this.data.areScriptsLoaded = true;

          if (!this.system.preloading) {
            this.system.onInitialize(this.entity);
            this.system.onPostInitialize(this.entity);
          }
        }
      });
    });
  }
}

export { ScriptLegacyComponent };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvc2NyaXB0LWxlZ2FjeS9jb21wb25lbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGVidWcgfSBmcm9tICcuLi8uLi8uLi9jb3JlL2RlYnVnLmpzJztcbmltcG9ydCB7IHBhdGggfSBmcm9tICcuLi8uLi8uLi9jb3JlL3BhdGguanMnO1xuXG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuXG5jbGFzcyBTY3JpcHRMZWdhY3lDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHN5c3RlbSwgZW50aXR5KSB7XG4gICAgICAgIHN1cGVyKHN5c3RlbSwgZW50aXR5KTtcbiAgICAgICAgdGhpcy5vbignc2V0X3NjcmlwdHMnLCB0aGlzLm9uU2V0U2NyaXB0cywgdGhpcyk7XG4gICAgfVxuXG4gICAgc2VuZChuYW1lLCBmdW5jdGlvbk5hbWUpIHtcbiAgICAgICAgRGVidWcuZGVwcmVjYXRlZCgnU2NyaXB0TGVnYWN5Q29tcG9uZW50LnNlbmQoKSBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgc29vbi4gUGxlYXNlIHVzZTogaHR0cDovL2RldmVsb3Blci5wbGF5Y2FudmFzLmNvbS91c2VyLW1hbnVhbC9zY3JpcHRpbmcvY29tbXVuaWNhdGlvbi8nKTtcblxuICAgICAgICBjb25zdCBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICAgICAgY29uc3QgaW5zdGFuY2VzID0gdGhpcy5lbnRpdHkuc2NyaXB0Lmluc3RhbmNlcztcbiAgICAgICAgbGV0IGZuO1xuXG4gICAgICAgIGlmIChpbnN0YW5jZXMgJiYgaW5zdGFuY2VzW25hbWVdKSB7XG4gICAgICAgICAgICBmbiA9IGluc3RhbmNlc1tuYW1lXS5pbnN0YW5jZVtmdW5jdGlvbk5hbWVdO1xuICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KGluc3RhbmNlc1tuYW1lXS5pbnN0YW5jZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBvbkVuYWJsZSgpIHtcbiAgICAgICAgLy8gaWYgdGhlIHNjcmlwdHMgb2YgdGhlIGNvbXBvbmVudCBoYXZlIGJlZW4gbG9hZGVkXG4gICAgICAgIC8vIHRoZW4gY2FsbCB0aGUgYXBwcm9wcmlhdGUgbWV0aG9kcyBvbiB0aGUgY29tcG9uZW50XG4gICAgICAgIGlmICh0aGlzLmRhdGEuYXJlU2NyaXB0c0xvYWRlZCAmJiAhdGhpcy5zeXN0ZW0ucHJlbG9hZGluZykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmRhdGEuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN5c3RlbS5faW5pdGlhbGl6ZVNjcmlwdENvbXBvbmVudCh0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zeXN0ZW0uX2VuYWJsZVNjcmlwdENvbXBvbmVudCh0aGlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLmRhdGEucG9zdEluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zeXN0ZW0uX3Bvc3RJbml0aWFsaXplU2NyaXB0Q29tcG9uZW50KHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25EaXNhYmxlKCkge1xuICAgICAgICB0aGlzLnN5c3RlbS5fZGlzYWJsZVNjcmlwdENvbXBvbmVudCh0aGlzKTtcbiAgICB9XG5cbiAgICBvblNldFNjcmlwdHMobmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5zeXN0ZW0uX2luVG9vbHMgfHwgdGhpcy5ydW5JblRvb2xzKSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBvbmx5IG5lZWQgdG8gdXBkYXRlIHNjcmlwdCBhdHRyaWJ1dGVzIHRoZW4gdXBkYXRlIHRoZW0gYW5kIHJldHVyblxuICAgICAgICAgICAgaWYgKHRoaXMuX3VwZGF0ZVNjcmlwdEF0dHJpYnV0ZXMob2xkVmFsdWUsIG5ld1ZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZGlzYWJsZSB0aGUgc2NyaXB0IGZpcnN0XG4gICAgICAgICAgICBpZiAodGhpcy5lbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zeXN0ZW0uX2Rpc2FibGVTY3JpcHRDb21wb25lbnQodGhpcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc3lzdGVtLl9kZXN0cm95U2NyaXB0Q29tcG9uZW50KHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLmRhdGEuYXJlU2NyaXB0c0xvYWRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBnZXQgdGhlIHVybHNcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdHMgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHVybHMgPSBzY3JpcHRzLm1hcChmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzLnVybDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyB0cnkgdG8gbG9hZCB0aGUgc2NyaXB0cyBzeW5jaHJvbm91c2x5IGZpcnN0XG4gICAgICAgICAgICBpZiAodGhpcy5fbG9hZEZyb21DYWNoZSh1cmxzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbm90IGFsbCBzY3JpcHRzIGFyZSBpbiB0aGUgY2FjaGUgc28gbG9hZCB0aGVtIGFzeW5jaHJvbm91c2x5XG4gICAgICAgICAgICB0aGlzLl9sb2FkU2NyaXB0cyh1cmxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIG9ubHkgc2NyaXB0IGF0dHJpYnV0ZXMgbmVlZCB1cGRhdGluZyBpbiB3aGljaFxuICAgIC8vIGNhc2UganVzdCB1cGRhdGUgdGhlIGF0dHJpYnV0ZXMgYW5kIHJldHVybiBvdGhlcndpc2UgcmV0dXJuIGZhbHNlXG4gICAgX3VwZGF0ZVNjcmlwdEF0dHJpYnV0ZXMob2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGxldCBvbmx5VXBkYXRlQXR0cmlidXRlcyA9IHRydWU7XG5cbiAgICAgICAgaWYgKG9sZFZhbHVlLmxlbmd0aCAhPT0gbmV3VmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBvbmx5VXBkYXRlQXR0cmlidXRlcyA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IG5ld1ZhbHVlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbHVlW2ldLnVybCAhPT0gbmV3VmFsdWVbaV0udXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ubHlVcGRhdGVBdHRyaWJ1dGVzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvbmx5VXBkYXRlQXR0cmlidXRlcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5pbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbnN0YW5jZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN5c3RlbS5fdXBkYXRlQWNjZXNzb3JzKHRoaXMuZW50aXR5LCB0aGlzLmluc3RhbmNlc1trZXldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb25seVVwZGF0ZUF0dHJpYnV0ZXM7XG4gICAgfVxuXG4gICAgLy8gTG9hZCBlYWNoIHVybCBmcm9tIHRoZSBjYWNoZSBzeW5jaHJvbm91c2x5LiBJZiBvbmUgb2YgdGhlIHVybHMgaXMgbm90IGluIHRoZSBjYWNoZVxuICAgIC8vIHRoZW4gc3RvcCBhbmQgcmV0dXJuIGZhbHNlLlxuICAgIF9sb2FkRnJvbUNhY2hlKHVybHMpIHtcbiAgICAgICAgY29uc3QgY2FjaGVkID0gW107XG5cbiAgICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5zeXN0ZW0uYXBwLl9zY3JpcHRQcmVmaXggfHwgJyc7XG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gL15odHRwKHMpPzpcXC9cXC8vaTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdXJscy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgbGV0IHVybCA9IHVybHNbaV07XG4gICAgICAgICAgICBpZiAoIXJlZ2V4LnRlc3QodXJsKSkge1xuICAgICAgICAgICAgICAgIHVybCA9IHBhdGguam9pbihwcmVmaXgsIHVybCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLnN5c3RlbS5hcHAubG9hZGVyLmdldEZyb21DYWNoZSh1cmwsICdzY3JpcHQnKTtcblxuICAgICAgICAgICAgLy8gaWYgd2UgY2Fubm90IGZpbmQgdGhlIHNjcmlwdCBpbiB0aGUgY2FjaGUgdGhlbiByZXR1cm4gYW5kIGxvYWRcbiAgICAgICAgICAgIC8vIGFsbCBzY3JpcHRzIHdpdGggdGhlIHJlc291cmNlIGxvYWRlclxuICAgICAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWNoZWQucHVzaCh0eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBjYWNoZWQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IFNjcmlwdFR5cGUgPSBjYWNoZWRbaV07XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoaXMgaXMgYSByZWd1bGFyIEpTIGZpbGVcbiAgICAgICAgICAgIGlmIChTY3JpcHRUeXBlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNjcmlwdFR5cGUgbWF5IGJlIG51bGwgaWYgdGhlIHNjcmlwdCBjb21wb25lbnQgaXMgbG9hZGluZyBhbiBvcmRpbmFyeSBKYXZhU2NyaXB0IGxpYiByYXRoZXIgdGhhbiBhIFBsYXlDYW52YXMgc2NyaXB0XG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCBzY3JpcHQgY29tcG9uZW50IGhhc24ndCBiZWVuIHJlbW92ZWQgc2luY2Ugd2Ugc3RhcnRlZCBsb2FkaW5nXG4gICAgICAgICAgICBpZiAoU2NyaXB0VHlwZSAmJiB0aGlzLmVudGl0eS5zY3JpcHQpIHtcbiAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCB3ZSBoYXZlbid0IGFscmVhZHkgaW5zdGFudGlhdGVkIGFub3RoZXIgaWRlbnRpY2FsIHNjcmlwdCB3aGlsZSBsb2FkaW5nXG4gICAgICAgICAgICAgICAgLy8gZS5nLiBpZiB5b3UgZG8gYWRkQ29tcG9uZW50LCByZW1vdmVDb21wb25lbnQsIGFkZENvbXBvbmVudCwgaW4gcXVpY2sgc3VjY2Vzc2lvblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5lbnRpdHkuc2NyaXB0Lmluc3RhbmNlc1tTY3JpcHRUeXBlLl9wY1NjcmlwdE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IFNjcmlwdFR5cGUodGhpcy5lbnRpdHkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN5c3RlbS5fcHJlUmVnaXN0ZXJJbnN0YW5jZSh0aGlzLmVudGl0eSwgdXJsc1tpXSwgU2NyaXB0VHlwZS5fcGNTY3JpcHROYW1lLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhLmFyZVNjcmlwdHNMb2FkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2Ugb25seSBuZWVkIHRvIGluaXRpYWxpemUgYWZ0ZXIgcHJlbG9hZGluZyBpcyBjb21wbGV0ZVxuICAgICAgICAvLyBEdXJpbmcgcHJlbG9hZGluZyBhbGwgc2NyaXB0cyBhcmUgaW5pdGlhbGl6ZWQgYWZ0ZXIgZXZlcnl0aGluZyBpcyBsb2FkZWRcbiAgICAgICAgaWYgKCF0aGlzLnN5c3RlbS5wcmVsb2FkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnN5c3RlbS5vbkluaXRpYWxpemUodGhpcy5lbnRpdHkpO1xuICAgICAgICAgICAgdGhpcy5zeXN0ZW0ub25Qb3N0SW5pdGlhbGl6ZSh0aGlzLmVudGl0eSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBfbG9hZFNjcmlwdHModXJscykge1xuICAgICAgICBsZXQgY291bnQgPSB1cmxzLmxlbmd0aDtcblxuICAgICAgICBjb25zdCBwcmVmaXggPSB0aGlzLnN5c3RlbS5hcHAuX3NjcmlwdFByZWZpeCB8fCAnJztcblxuICAgICAgICB1cmxzLmZvckVhY2goKHVybCkgPT4ge1xuICAgICAgICAgICAgbGV0IF91cmwgPSBudWxsO1xuICAgICAgICAgICAgbGV0IF91bnByZWZpeGVkID0gbnVsbDtcbiAgICAgICAgICAgIC8vIHN1cHBvcnQgYWJzb2x1dGUgVVJMcyAoZm9yIG5vdylcbiAgICAgICAgICAgIGlmICh1cmwudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCdodHRwOi8vJykgfHwgdXJsLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnaHR0cHM6Ly8nKSkge1xuICAgICAgICAgICAgICAgIF91bnByZWZpeGVkID0gdXJsO1xuICAgICAgICAgICAgICAgIF91cmwgPSB1cmw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF91bnByZWZpeGVkID0gdXJsO1xuICAgICAgICAgICAgICAgIF91cmwgPSBwYXRoLmpvaW4ocHJlZml4LCB1cmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zeXN0ZW0uYXBwLmxvYWRlci5sb2FkKF91cmwsICdzY3JpcHQnLCAoZXJyLCBTY3JpcHRUeXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgICAgICAvLyBTY3JpcHRUeXBlIGlzIG51bGwgaWYgdGhlIHNjcmlwdCBpcyBub3QgYSBQbGF5Q2FudmFzIHNjcmlwdFxuICAgICAgICAgICAgICAgICAgICBpZiAoU2NyaXB0VHlwZSAmJiB0aGlzLmVudGl0eS5zY3JpcHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5lbnRpdHkuc2NyaXB0Lmluc3RhbmNlc1tTY3JpcHRUeXBlLl9wY1NjcmlwdE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgU2NyaXB0VHlwZSh0aGlzLmVudGl0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zeXN0ZW0uX3ByZVJlZ2lzdGVySW5zdGFuY2UodGhpcy5lbnRpdHksIF91bnByZWZpeGVkLCBTY3JpcHRUeXBlLl9wY1NjcmlwdE5hbWUsIGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5hcmVTY3JpcHRzTG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBvbmx5IG5lZWQgdG8gaW5pdGlhbGl6ZSBhZnRlciBwcmVsb2FkaW5nIGlzIGNvbXBsZXRlXG4gICAgICAgICAgICAgICAgICAgIC8vIER1cmluZyBwcmVsb2FkaW5nIGFsbCBzY3JpcHRzIGFyZSBpbml0aWFsaXplZCBhZnRlciBldmVyeXRoaW5nIGlzIGxvYWRlZFxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc3lzdGVtLnByZWxvYWRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3lzdGVtLm9uSW5pdGlhbGl6ZSh0aGlzLmVudGl0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN5c3RlbS5vblBvc3RJbml0aWFsaXplKHRoaXMuZW50aXR5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFNjcmlwdExlZ2FjeUNvbXBvbmVudCB9O1xuIl0sIm5hbWVzIjpbIlNjcmlwdExlZ2FjeUNvbXBvbmVudCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwic3lzdGVtIiwiZW50aXR5Iiwib24iLCJvblNldFNjcmlwdHMiLCJzZW5kIiwibmFtZSIsImZ1bmN0aW9uTmFtZSIsIkRlYnVnIiwiZGVwcmVjYXRlZCIsImFyZ3MiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsImluc3RhbmNlcyIsInNjcmlwdCIsImZuIiwiaW5zdGFuY2UiLCJhcHBseSIsInVuZGVmaW5lZCIsIm9uRW5hYmxlIiwiZGF0YSIsImFyZVNjcmlwdHNMb2FkZWQiLCJwcmVsb2FkaW5nIiwiaW5pdGlhbGl6ZWQiLCJfaW5pdGlhbGl6ZVNjcmlwdENvbXBvbmVudCIsIl9lbmFibGVTY3JpcHRDb21wb25lbnQiLCJwb3N0SW5pdGlhbGl6ZWQiLCJfcG9zdEluaXRpYWxpemVTY3JpcHRDb21wb25lbnQiLCJvbkRpc2FibGUiLCJfZGlzYWJsZVNjcmlwdENvbXBvbmVudCIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJfaW5Ub29scyIsInJ1bkluVG9vbHMiLCJfdXBkYXRlU2NyaXB0QXR0cmlidXRlcyIsImVuYWJsZWQiLCJfZGVzdHJveVNjcmlwdENvbXBvbmVudCIsInNjcmlwdHMiLCJ1cmxzIiwibWFwIiwicyIsInVybCIsIl9sb2FkRnJvbUNhY2hlIiwiX2xvYWRTY3JpcHRzIiwib25seVVwZGF0ZUF0dHJpYnV0ZXMiLCJsZW5ndGgiLCJpIiwibGVuIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJfdXBkYXRlQWNjZXNzb3JzIiwiY2FjaGVkIiwicHJlZml4IiwiYXBwIiwiX3NjcmlwdFByZWZpeCIsInJlZ2V4IiwidGVzdCIsInBhdGgiLCJqb2luIiwidHlwZSIsImxvYWRlciIsImdldEZyb21DYWNoZSIsInB1c2giLCJTY3JpcHRUeXBlIiwiX3BjU2NyaXB0TmFtZSIsIl9wcmVSZWdpc3Rlckluc3RhbmNlIiwib25Jbml0aWFsaXplIiwib25Qb3N0SW5pdGlhbGl6ZSIsImNvdW50IiwiZm9yRWFjaCIsIl91cmwiLCJfdW5wcmVmaXhlZCIsInRvTG93ZXJDYXNlIiwic3RhcnRzV2l0aCIsImxvYWQiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUtBLE1BQU1BLHFCQUFxQixTQUFTQyxTQUFTLENBQUM7QUFDMUNDLEVBQUFBLFdBQVcsQ0FBQ0MsTUFBTSxFQUFFQyxNQUFNLEVBQUU7QUFDeEIsSUFBQSxLQUFLLENBQUNELE1BQU0sRUFBRUMsTUFBTSxDQUFDLENBQUE7SUFDckIsSUFBSSxDQUFDQyxFQUFFLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQ0MsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ25ELEdBQUE7QUFFQUMsRUFBQUEsSUFBSSxDQUFDQyxJQUFJLEVBQUVDLFlBQVksRUFBRTtBQUNyQkMsSUFBQUEsS0FBSyxDQUFDQyxVQUFVLENBQUMsdUpBQXVKLENBQUMsQ0FBQTtBQUV6SyxJQUFBLE1BQU1DLElBQUksR0FBR0MsS0FBSyxDQUFDQyxTQUFTLENBQUNDLEtBQUssQ0FBQ0MsSUFBSSxDQUFDQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDckQsTUFBTUMsU0FBUyxHQUFHLElBQUksQ0FBQ2QsTUFBTSxDQUFDZSxNQUFNLENBQUNELFNBQVMsQ0FBQTtBQUM5QyxJQUFBLElBQUlFLEVBQUUsQ0FBQTtBQUVOLElBQUEsSUFBSUYsU0FBUyxJQUFJQSxTQUFTLENBQUNWLElBQUksQ0FBQyxFQUFFO01BQzlCWSxFQUFFLEdBQUdGLFNBQVMsQ0FBQ1YsSUFBSSxDQUFDLENBQUNhLFFBQVEsQ0FBQ1osWUFBWSxDQUFDLENBQUE7QUFDM0MsTUFBQSxJQUFJVyxFQUFFLEVBQUU7QUFDSixRQUFBLE9BQU9BLEVBQUUsQ0FBQ0UsS0FBSyxDQUFDSixTQUFTLENBQUNWLElBQUksQ0FBQyxDQUFDYSxRQUFRLEVBQUVULElBQUksQ0FBQyxDQUFBO0FBQ25ELE9BQUE7QUFDSixLQUFBO0FBQ0EsSUFBQSxPQUFPVyxTQUFTLENBQUE7QUFDcEIsR0FBQTtBQUVBQyxFQUFBQSxRQUFRLEdBQUc7QUFHUCxJQUFBLElBQUksSUFBSSxDQUFDQyxJQUFJLENBQUNDLGdCQUFnQixJQUFJLENBQUMsSUFBSSxDQUFDdkIsTUFBTSxDQUFDd0IsVUFBVSxFQUFFO0FBQ3ZELE1BQUEsSUFBSSxDQUFDLElBQUksQ0FBQ0YsSUFBSSxDQUFDRyxXQUFXLEVBQUU7QUFDeEIsUUFBQSxJQUFJLENBQUN6QixNQUFNLENBQUMwQiwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNoRCxPQUFDLE1BQU07QUFDSCxRQUFBLElBQUksQ0FBQzFCLE1BQU0sQ0FBQzJCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzVDLE9BQUE7QUFFQSxNQUFBLElBQUksQ0FBQyxJQUFJLENBQUNMLElBQUksQ0FBQ00sZUFBZSxFQUFFO0FBQzVCLFFBQUEsSUFBSSxDQUFDNUIsTUFBTSxDQUFDNkIsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDcEQsT0FBQTtBQUNKLEtBQUE7QUFDSixHQUFBO0FBRUFDLEVBQUFBLFNBQVMsR0FBRztBQUNSLElBQUEsSUFBSSxDQUFDOUIsTUFBTSxDQUFDK0IsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDN0MsR0FBQTtBQUVBNUIsRUFBQUEsWUFBWSxDQUFDRSxJQUFJLEVBQUUyQixRQUFRLEVBQUVDLFFBQVEsRUFBRTtJQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDakMsTUFBTSxDQUFDa0MsUUFBUSxJQUFJLElBQUksQ0FBQ0MsVUFBVSxFQUFFO01BRTFDLElBQUksSUFBSSxDQUFDQyx1QkFBdUIsQ0FBQ0osUUFBUSxFQUFFQyxRQUFRLENBQUMsRUFBRTtBQUNsRCxRQUFBLE9BQUE7QUFDSixPQUFBOztNQUdBLElBQUksSUFBSSxDQUFDSSxPQUFPLEVBQUU7QUFDZCxRQUFBLElBQUksQ0FBQ3JDLE1BQU0sQ0FBQytCLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzdDLE9BQUE7QUFFQSxNQUFBLElBQUksQ0FBQy9CLE1BQU0sQ0FBQ3NDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFBO0FBRXpDLE1BQUEsSUFBSSxDQUFDaEIsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUE7O01BR2xDLE1BQU1nQixPQUFPLEdBQUdOLFFBQVEsQ0FBQTtNQUN4QixNQUFNTyxJQUFJLEdBQUdELE9BQU8sQ0FBQ0UsR0FBRyxDQUFDLFVBQVVDLENBQUMsRUFBRTtRQUNsQyxPQUFPQSxDQUFDLENBQUNDLEdBQUcsQ0FBQTtBQUNoQixPQUFDLENBQUMsQ0FBQTs7QUFHRixNQUFBLElBQUksSUFBSSxDQUFDQyxjQUFjLENBQUNKLElBQUksQ0FBQyxFQUFFO0FBQzNCLFFBQUEsT0FBQTtBQUNKLE9BQUE7O0FBR0EsTUFBQSxJQUFJLENBQUNLLFlBQVksQ0FBQ0wsSUFBSSxDQUFDLENBQUE7QUFDM0IsS0FBQTtBQUNKLEdBQUE7O0FBSUFKLEVBQUFBLHVCQUF1QixDQUFDSixRQUFRLEVBQUVDLFFBQVEsRUFBRTtJQUN4QyxJQUFJYSxvQkFBb0IsR0FBRyxJQUFJLENBQUE7QUFFL0IsSUFBQSxJQUFJZCxRQUFRLENBQUNlLE1BQU0sS0FBS2QsUUFBUSxDQUFDYyxNQUFNLEVBQUU7QUFDckNELE1BQUFBLG9CQUFvQixHQUFHLEtBQUssQ0FBQTtBQUNoQyxLQUFDLE1BQU07QUFDSCxNQUFBLEtBQUssSUFBSUUsQ0FBQyxHQUFHLENBQUMsRUFBRUMsR0FBRyxHQUFHaEIsUUFBUSxDQUFDYyxNQUFNLEVBQUVDLENBQUMsR0FBR0MsR0FBRyxFQUFFRCxDQUFDLEVBQUUsRUFBRTtBQUNqRCxRQUFBLElBQUloQixRQUFRLENBQUNnQixDQUFDLENBQUMsQ0FBQ0wsR0FBRyxLQUFLVixRQUFRLENBQUNlLENBQUMsQ0FBQyxDQUFDTCxHQUFHLEVBQUU7QUFDckNHLFVBQUFBLG9CQUFvQixHQUFHLEtBQUssQ0FBQTtBQUM1QixVQUFBLE1BQUE7QUFDSixTQUFBO0FBQ0osT0FBQTtBQUNKLEtBQUE7QUFFQSxJQUFBLElBQUlBLG9CQUFvQixFQUFFO0FBQ3RCLE1BQUEsS0FBSyxNQUFNSSxHQUFHLElBQUksSUFBSSxDQUFDbkMsU0FBUyxFQUFFO1FBQzlCLElBQUksSUFBSSxDQUFDQSxTQUFTLENBQUNvQyxjQUFjLENBQUNELEdBQUcsQ0FBQyxFQUFFO0FBQ3BDLFVBQUEsSUFBSSxDQUFDbEQsTUFBTSxDQUFDb0QsZ0JBQWdCLENBQUMsSUFBSSxDQUFDbkQsTUFBTSxFQUFFLElBQUksQ0FBQ2MsU0FBUyxDQUFDbUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUNsRSxTQUFBO0FBQ0osT0FBQTtBQUNKLEtBQUE7QUFFQSxJQUFBLE9BQU9KLG9CQUFvQixDQUFBO0FBQy9CLEdBQUE7O0VBSUFGLGNBQWMsQ0FBQ0osSUFBSSxFQUFFO0lBQ2pCLE1BQU1hLE1BQU0sR0FBRyxFQUFFLENBQUE7SUFFakIsTUFBTUMsTUFBTSxHQUFHLElBQUksQ0FBQ3RELE1BQU0sQ0FBQ3VELEdBQUcsQ0FBQ0MsYUFBYSxJQUFJLEVBQUUsQ0FBQTtJQUNsRCxNQUFNQyxLQUFLLEdBQUcsaUJBQWlCLENBQUE7QUFFL0IsSUFBQSxLQUFLLElBQUlULENBQUMsR0FBRyxDQUFDLEVBQUVDLEdBQUcsR0FBR1QsSUFBSSxDQUFDTyxNQUFNLEVBQUVDLENBQUMsR0FBR0MsR0FBRyxFQUFFRCxDQUFDLEVBQUUsRUFBRTtBQUM3QyxNQUFBLElBQUlMLEdBQUcsR0FBR0gsSUFBSSxDQUFDUSxDQUFDLENBQUMsQ0FBQTtBQUNqQixNQUFBLElBQUksQ0FBQ1MsS0FBSyxDQUFDQyxJQUFJLENBQUNmLEdBQUcsQ0FBQyxFQUFFO1FBQ2xCQSxHQUFHLEdBQUdnQixJQUFJLENBQUNDLElBQUksQ0FBQ04sTUFBTSxFQUFFWCxHQUFHLENBQUMsQ0FBQTtBQUNoQyxPQUFBO0FBRUEsTUFBQSxNQUFNa0IsSUFBSSxHQUFHLElBQUksQ0FBQzdELE1BQU0sQ0FBQ3VELEdBQUcsQ0FBQ08sTUFBTSxDQUFDQyxZQUFZLENBQUNwQixHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUE7O01BSS9ELElBQUksQ0FBQ2tCLElBQUksRUFBRTtBQUNQLFFBQUEsT0FBTyxLQUFLLENBQUE7QUFDaEIsT0FBQTtBQUVBUixNQUFBQSxNQUFNLENBQUNXLElBQUksQ0FBQ0gsSUFBSSxDQUFDLENBQUE7QUFDckIsS0FBQTtBQUVBLElBQUEsS0FBSyxJQUFJYixDQUFDLEdBQUcsQ0FBQyxFQUFFQyxHQUFHLEdBQUdJLE1BQU0sQ0FBQ04sTUFBTSxFQUFFQyxDQUFDLEdBQUdDLEdBQUcsRUFBRUQsQ0FBQyxFQUFFLEVBQUU7QUFDL0MsTUFBQSxNQUFNaUIsVUFBVSxHQUFHWixNQUFNLENBQUNMLENBQUMsQ0FBQyxDQUFBOztNQUc1QixJQUFJaUIsVUFBVSxLQUFLLElBQUksRUFBRTtBQUNyQixRQUFBLFNBQUE7QUFDSixPQUFBOztBQUlBLE1BQUEsSUFBSUEsVUFBVSxJQUFJLElBQUksQ0FBQ2hFLE1BQU0sQ0FBQ2UsTUFBTSxFQUFFO0FBR2xDLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQ2YsTUFBTSxDQUFDZSxNQUFNLENBQUNELFNBQVMsQ0FBQ2tELFVBQVUsQ0FBQ0MsYUFBYSxDQUFDLEVBQUU7VUFDekQsTUFBTWhELFFBQVEsR0FBRyxJQUFJK0MsVUFBVSxDQUFDLElBQUksQ0FBQ2hFLE1BQU0sQ0FBQyxDQUFBO0FBQzVDLFVBQUEsSUFBSSxDQUFDRCxNQUFNLENBQUNtRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUNsRSxNQUFNLEVBQUV1QyxJQUFJLENBQUNRLENBQUMsQ0FBQyxFQUFFaUIsVUFBVSxDQUFDQyxhQUFhLEVBQUVoRCxRQUFRLENBQUMsQ0FBQTtBQUM5RixTQUFBO0FBQ0osT0FBQTtBQUNKLEtBQUE7SUFFQSxJQUFJLElBQUksQ0FBQ0ksSUFBSSxFQUFFO0FBQ1gsTUFBQSxJQUFJLENBQUNBLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBO0FBQ3JDLEtBQUE7O0FBSUEsSUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDdkIsTUFBTSxDQUFDd0IsVUFBVSxFQUFFO01BQ3pCLElBQUksQ0FBQ3hCLE1BQU0sQ0FBQ29FLFlBQVksQ0FBQyxJQUFJLENBQUNuRSxNQUFNLENBQUMsQ0FBQTtNQUNyQyxJQUFJLENBQUNELE1BQU0sQ0FBQ3FFLGdCQUFnQixDQUFDLElBQUksQ0FBQ3BFLE1BQU0sQ0FBQyxDQUFBO0FBQzdDLEtBQUE7QUFFQSxJQUFBLE9BQU8sSUFBSSxDQUFBO0FBQ2YsR0FBQTtFQUVBNEMsWUFBWSxDQUFDTCxJQUFJLEVBQUU7QUFDZixJQUFBLElBQUk4QixLQUFLLEdBQUc5QixJQUFJLENBQUNPLE1BQU0sQ0FBQTtJQUV2QixNQUFNTyxNQUFNLEdBQUcsSUFBSSxDQUFDdEQsTUFBTSxDQUFDdUQsR0FBRyxDQUFDQyxhQUFhLElBQUksRUFBRSxDQUFBO0FBRWxEaEIsSUFBQUEsSUFBSSxDQUFDK0IsT0FBTyxDQUFFNUIsR0FBRyxJQUFLO01BQ2xCLElBQUk2QixJQUFJLEdBQUcsSUFBSSxDQUFBO01BQ2YsSUFBSUMsV0FBVyxHQUFHLElBQUksQ0FBQTtBQUV0QixNQUFBLElBQUk5QixHQUFHLENBQUMrQixXQUFXLEVBQUUsQ0FBQ0MsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJaEMsR0FBRyxDQUFDK0IsV0FBVyxFQUFFLENBQUNDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUNyRkYsUUFBQUEsV0FBVyxHQUFHOUIsR0FBRyxDQUFBO0FBQ2pCNkIsUUFBQUEsSUFBSSxHQUFHN0IsR0FBRyxDQUFBO0FBQ2QsT0FBQyxNQUFNO0FBQ0g4QixRQUFBQSxXQUFXLEdBQUc5QixHQUFHLENBQUE7UUFDakI2QixJQUFJLEdBQUdiLElBQUksQ0FBQ0MsSUFBSSxDQUFDTixNQUFNLEVBQUVYLEdBQUcsQ0FBQyxDQUFBO0FBQ2pDLE9BQUE7QUFDQSxNQUFBLElBQUksQ0FBQzNDLE1BQU0sQ0FBQ3VELEdBQUcsQ0FBQ08sTUFBTSxDQUFDYyxJQUFJLENBQUNKLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQ0ssR0FBRyxFQUFFWixVQUFVLEtBQUs7QUFDN0RLLFFBQUFBLEtBQUssRUFBRSxDQUFBO1FBQ1AsSUFBSSxDQUFDTyxHQUFHLEVBQUU7QUFFTixVQUFBLElBQUlaLFVBQVUsSUFBSSxJQUFJLENBQUNoRSxNQUFNLENBQUNlLE1BQU0sRUFBRTtBQUNsQyxZQUFBLElBQUksQ0FBQyxJQUFJLENBQUNmLE1BQU0sQ0FBQ2UsTUFBTSxDQUFDRCxTQUFTLENBQUNrRCxVQUFVLENBQUNDLGFBQWEsQ0FBQyxFQUFFO2NBQ3pELE1BQU1oRCxRQUFRLEdBQUcsSUFBSStDLFVBQVUsQ0FBQyxJQUFJLENBQUNoRSxNQUFNLENBQUMsQ0FBQTtBQUM1QyxjQUFBLElBQUksQ0FBQ0QsTUFBTSxDQUFDbUUsb0JBQW9CLENBQUMsSUFBSSxDQUFDbEUsTUFBTSxFQUFFd0UsV0FBVyxFQUFFUixVQUFVLENBQUNDLGFBQWEsRUFBRWhELFFBQVEsQ0FBQyxDQUFBO0FBQ2xHLGFBQUE7QUFDSixXQUFBO0FBQ0osU0FBQyxNQUFNO0FBQ0g0RCxVQUFBQSxPQUFPLENBQUNDLEtBQUssQ0FBQ0YsR0FBRyxDQUFDLENBQUE7QUFDdEIsU0FBQTtRQUNBLElBQUlQLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDYixVQUFBLElBQUksQ0FBQ2hELElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBOztBQUlqQyxVQUFBLElBQUksQ0FBQyxJQUFJLENBQUN2QixNQUFNLENBQUN3QixVQUFVLEVBQUU7WUFDekIsSUFBSSxDQUFDeEIsTUFBTSxDQUFDb0UsWUFBWSxDQUFDLElBQUksQ0FBQ25FLE1BQU0sQ0FBQyxDQUFBO1lBQ3JDLElBQUksQ0FBQ0QsTUFBTSxDQUFDcUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDcEUsTUFBTSxDQUFDLENBQUE7QUFDN0MsV0FBQTtBQUNKLFNBQUE7QUFDSixPQUFDLENBQUMsQ0FBQTtBQUNOLEtBQUMsQ0FBQyxDQUFBO0FBQ04sR0FBQTtBQUNKOzs7OyJ9
