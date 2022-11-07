/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../core/debug.js';
import { EventHandler } from '../../core/event-handler.js';
import { script } from '../script.js';
import { AppBase } from '../app-base.js';
import { ScriptAttributes } from './script-attributes.js';
import { ScriptType } from './script-type.js';
import { ScriptTypes } from './script-types.js';

const reservedScriptNames = new Set(['system', 'entity', 'create', 'destroy', 'swap', 'move', 'scripts', '_scripts', '_scriptsIndex', '_scriptsData', 'enabled', '_oldState', 'onEnable', 'onDisable', 'onPostStateChange', '_onSetEnabled', '_checkState', '_onBeforeRemove', '_onInitializeAttributes', '_onInitialize', '_onPostInitialize', '_onUpdate', '_onPostUpdate', '_callbacks', 'has', 'get', 'on', 'off', 'fire', 'once', 'hasEvent']);

function createScript(name, app) {
  if (script.legacy) {
    Debug.error('This project is using the legacy script system. You cannot call pc.createScript().');
    return null;
  }
  if (reservedScriptNames.has(name)) throw new Error(`script name: '${name}' is reserved, please change script name`);
  const scriptType = function scriptType(args) {
    EventHandler.prototype.initEventHandler.call(this);
    ScriptType.prototype.initScriptType.call(this, args);
  };
  scriptType.prototype = Object.create(ScriptType.prototype);
  scriptType.prototype.constructor = scriptType;
  scriptType.extend = ScriptType.extend;
  scriptType.attributes = new ScriptAttributes(scriptType);
  registerScript(scriptType, name, app);
  return scriptType;
}

const reservedAttributes = {};
ScriptAttributes.reservedNames.forEach((value, value2, set) => {
  reservedAttributes[value] = 1;
});
createScript.reservedAttributes = reservedAttributes;

function registerScript(script, name, app) {
  if (script.legacy) {
    Debug.error('This project is using the legacy script system. You cannot call pc.registerScript().');
    return;
  }
  if (typeof script !== 'function') throw new Error(`script class: '${script}' must be a constructor function (i.e. class).`);
  if (!(script.prototype instanceof ScriptType)) throw new Error(`script class: '${ScriptType.__getScriptName(script)}' does not extend pc.ScriptType.`);
  name = name || script.__name || ScriptType.__getScriptName(script);
  if (reservedScriptNames.has(name)) throw new Error(`script name: '${name}' is reserved, please change script name`);
  script.__name = name;

  const registry = app ? app.scripts : AppBase.getApplication().scripts;
  registry.add(script);
  ScriptTypes.push(script, script.legacy);
}

export { createScript, registerScript };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL3NjcmlwdC9zY3JpcHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGVidWcgfSBmcm9tICcuLi8uLi9jb3JlL2RlYnVnLmpzJztcbmltcG9ydCB7IEV2ZW50SGFuZGxlciB9IGZyb20gJy4uLy4uL2NvcmUvZXZlbnQtaGFuZGxlci5qcyc7XG5cbmltcG9ydCB7IHNjcmlwdCB9IGZyb20gJy4uL3NjcmlwdC5qcyc7XG5pbXBvcnQgeyBBcHBCYXNlIH0gZnJvbSAnLi4vYXBwLWJhc2UuanMnO1xuXG5pbXBvcnQgeyBTY3JpcHRBdHRyaWJ1dGVzIH0gZnJvbSAnLi9zY3JpcHQtYXR0cmlidXRlcy5qcyc7XG5pbXBvcnQgeyBTY3JpcHRUeXBlIH0gZnJvbSAnLi9zY3JpcHQtdHlwZS5qcyc7XG5pbXBvcnQgeyBTY3JpcHRUeXBlcyB9IGZyb20gJy4vc2NyaXB0LXR5cGVzLmpzJztcblxuY29uc3QgcmVzZXJ2ZWRTY3JpcHROYW1lcyA9IG5ldyBTZXQoW1xuICAgICdzeXN0ZW0nLCAnZW50aXR5JywgJ2NyZWF0ZScsICdkZXN0cm95JywgJ3N3YXAnLCAnbW92ZScsXG4gICAgJ3NjcmlwdHMnLCAnX3NjcmlwdHMnLCAnX3NjcmlwdHNJbmRleCcsICdfc2NyaXB0c0RhdGEnLFxuICAgICdlbmFibGVkJywgJ19vbGRTdGF0ZScsICdvbkVuYWJsZScsICdvbkRpc2FibGUnLCAnb25Qb3N0U3RhdGVDaGFuZ2UnLFxuICAgICdfb25TZXRFbmFibGVkJywgJ19jaGVja1N0YXRlJywgJ19vbkJlZm9yZVJlbW92ZScsXG4gICAgJ19vbkluaXRpYWxpemVBdHRyaWJ1dGVzJywgJ19vbkluaXRpYWxpemUnLCAnX29uUG9zdEluaXRpYWxpemUnLFxuICAgICdfb25VcGRhdGUnLCAnX29uUG9zdFVwZGF0ZScsXG4gICAgJ19jYWxsYmFja3MnLCAnaGFzJywgJ2dldCcsICdvbicsICdvZmYnLCAnZmlyZScsICdvbmNlJywgJ2hhc0V2ZW50J1xuXSk7XG5cbi8qKlxuICogQ3JlYXRlIGFuZCByZWdpc3RlciBhIG5ldyB7QGxpbmsgU2NyaXB0VHlwZX0uIEl0IHJldHVybnMgbmV3IGNsYXNzIHR5cGUgKGNvbnN0cnVjdG9yIGZ1bmN0aW9uKSxcbiAqIHdoaWNoIGlzIGF1dG8tcmVnaXN0ZXJlZCB0byB7QGxpbmsgU2NyaXB0UmVnaXN0cnl9IHVzaW5nIGl0cyBuYW1lLiBUaGlzIGlzIHRoZSBtYWluIGludGVyZmFjZSB0b1xuICogY3JlYXRlIFNjcmlwdCBUeXBlcywgdG8gZGVmaW5lIGN1c3RvbSBsb2dpYyB1c2luZyBKYXZhU2NyaXB0LCB0aGF0IGlzIHVzZWQgdG8gY3JlYXRlIGludGVyYWN0aW9uXG4gKiBmb3IgZW50aXRpZXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBVbmlxdWUgTmFtZSBvZiBhIFNjcmlwdCBUeXBlLiBJZiBhIFNjcmlwdCBUeXBlIHdpdGggdGhlIHNhbWUgbmFtZSBoYXNcbiAqIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkIGFuZCB0aGUgbmV3IG9uZSBoYXMgYSBgc3dhcGAgbWV0aG9kIGRlZmluZWQgaW4gaXRzIHByb3RvdHlwZSwgdGhlbiBpdFxuICogd2lsbCBwZXJmb3JtIGhvdCBzd2FwcGluZyBvZiBleGlzdGluZyBTY3JpcHQgSW5zdGFuY2VzIG9uIGVudGl0aWVzIHVzaW5nIHRoaXMgbmV3IFNjcmlwdCBUeXBlLlxuICogTm90ZTogVGhlcmUgaXMgYSByZXNlcnZlZCBsaXN0IG9mIG5hbWVzIHRoYXQgY2Fubm90IGJlIHVzZWQsIHN1Y2ggYXMgbGlzdCBiZWxvdyBhcyB3ZWxsIGFzIHNvbWVcbiAqIHN0YXJ0aW5nIGZyb20gYF9gICh1bmRlcnNjb3JlKTogc3lzdGVtLCBlbnRpdHksIGNyZWF0ZSwgZGVzdHJveSwgc3dhcCwgbW92ZSwgc2NyaXB0cywgb25FbmFibGUsXG4gKiBvbkRpc2FibGUsIG9uUG9zdFN0YXRlQ2hhbmdlLCBoYXMsIG9uLCBvZmYsIGZpcmUsIG9uY2UsIGhhc0V2ZW50LlxuICogQHBhcmFtIHtBcHBCYXNlfSBbYXBwXSAtIE9wdGlvbmFsIGFwcGxpY2F0aW9uIGhhbmRsZXIsIHRvIGNob29zZSB3aGljaCB7QGxpbmsgU2NyaXB0UmVnaXN0cnl9XG4gKiB0byBhZGQgYSBzY3JpcHQgdG8uIEJ5IGRlZmF1bHQgaXQgd2lsbCB1c2UgYEFwcGxpY2F0aW9uLmdldEFwcGxpY2F0aW9uKClgIHRvIGdldCBjdXJyZW50XG4gKiB7QGxpbmsgQXBwQmFzZX0uXG4gKiBAcmV0dXJucyB7Q2xhc3M8U2NyaXB0VHlwZT58bnVsbH0gQSBjbGFzcyB0eXBlIChjb25zdHJ1Y3RvciBmdW5jdGlvbikgdGhhdCBpbmhlcml0cyB7QGxpbmsgU2NyaXB0VHlwZX0sXG4gKiB3aGljaCB0aGUgZGV2ZWxvcGVyIGlzIG1lYW50IHRvIGZ1cnRoZXIgZXh0ZW5kIGJ5IGFkZGluZyBhdHRyaWJ1dGVzIGFuZCBwcm90b3R5cGUgbWV0aG9kcy5cbiAqIFJldHVybnMgbnVsbCBpZiB0aGVyZSB3YXMgYW4gZXJyb3IuXG4gKiBAZXhhbXBsZVxuICogdmFyIFR1cm5pbmcgPSBwYy5jcmVhdGVTY3JpcHQoJ3R1cm4nKTtcbiAqXG4gKiAvLyBkZWZpbmUgYHNwZWVkYCBhdHRyaWJ1dGUgdGhhdCBpcyBhdmFpbGFibGUgaW4gRWRpdG9yIFVJXG4gKiBUdXJuaW5nLmF0dHJpYnV0ZXMuYWRkKCdzcGVlZCcsIHtcbiAqICAgICB0eXBlOiAnbnVtYmVyJyxcbiAqICAgICBkZWZhdWx0OiAxODAsXG4gKiAgICAgcGxhY2Vob2xkZXI6ICdkZWcvcydcbiAqIH0pO1xuICpcbiAqIC8vIHJ1bnMgZXZlcnkgdGlja1xuICogVHVybmluZy5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGR0KSB7XG4gKiAgICAgdGhpcy5lbnRpdHkucm90YXRlKDAsIHRoaXMuc3BlZWQgKiBkdCwgMCk7XG4gKiB9O1xuICovXG5mdW5jdGlvbiBjcmVhdGVTY3JpcHQobmFtZSwgYXBwKSB7XG4gICAgaWYgKHNjcmlwdC5sZWdhY3kpIHtcbiAgICAgICAgRGVidWcuZXJyb3IoJ1RoaXMgcHJvamVjdCBpcyB1c2luZyB0aGUgbGVnYWN5IHNjcmlwdCBzeXN0ZW0uIFlvdSBjYW5ub3QgY2FsbCBwYy5jcmVhdGVTY3JpcHQoKS4nKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHJlc2VydmVkU2NyaXB0TmFtZXMuaGFzKG5hbWUpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHNjcmlwdCBuYW1lOiAnJHtuYW1lfScgaXMgcmVzZXJ2ZWQsIHBsZWFzZSBjaGFuZ2Ugc2NyaXB0IG5hbWVgKTtcblxuICAgIGNvbnN0IHNjcmlwdFR5cGUgPSBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICBFdmVudEhhbmRsZXIucHJvdG90eXBlLmluaXRFdmVudEhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgU2NyaXB0VHlwZS5wcm90b3R5cGUuaW5pdFNjcmlwdFR5cGUuY2FsbCh0aGlzLCBhcmdzKTtcbiAgICB9O1xuXG4gICAgc2NyaXB0VHlwZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNjcmlwdFR5cGUucHJvdG90eXBlKTtcbiAgICBzY3JpcHRUeXBlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHNjcmlwdFR5cGU7XG5cbiAgICBzY3JpcHRUeXBlLmV4dGVuZCA9IFNjcmlwdFR5cGUuZXh0ZW5kO1xuICAgIHNjcmlwdFR5cGUuYXR0cmlidXRlcyA9IG5ldyBTY3JpcHRBdHRyaWJ1dGVzKHNjcmlwdFR5cGUpO1xuXG4gICAgcmVnaXN0ZXJTY3JpcHQoc2NyaXB0VHlwZSwgbmFtZSwgYXBwKTtcbiAgICByZXR1cm4gc2NyaXB0VHlwZTtcbn1cblxuLy8gRWRpdG9yIHVzZXMgdGhpcyAtIG1pZ3JhdGUgdG8gU2NyaXB0QXR0cmlidXRlcy5yZXNlcnZlZE5hbWVzIGFuZCBkZWxldGUgdGhpc1xuY29uc3QgcmVzZXJ2ZWRBdHRyaWJ1dGVzID0ge307XG5TY3JpcHRBdHRyaWJ1dGVzLnJlc2VydmVkTmFtZXMuZm9yRWFjaCgodmFsdWUsIHZhbHVlMiwgc2V0KSA9PiB7XG4gICAgcmVzZXJ2ZWRBdHRyaWJ1dGVzW3ZhbHVlXSA9IDE7XG59KTtcbmNyZWF0ZVNjcmlwdC5yZXNlcnZlZEF0dHJpYnV0ZXMgPSByZXNlcnZlZEF0dHJpYnV0ZXM7XG5cbi8qIGVzbGludC1kaXNhYmxlIGpzZG9jL2NoZWNrLWV4YW1wbGVzICovXG4vKipcbiAqIFJlZ2lzdGVyIGEgZXhpc3RpbmcgY2xhc3MgdHlwZSBhcyBhIFNjcmlwdCBUeXBlIHRvIHtAbGluayBTY3JpcHRSZWdpc3RyeX0uIFVzZWZ1bCB3aGVuIGRlZmluaW5nXG4gKiBhIEVTNiBzY3JpcHQgY2xhc3MgdGhhdCBleHRlbmRzIHtAbGluayBTY3JpcHRUeXBlfSAoc2VlIGV4YW1wbGUpLlxuICpcbiAqIEBwYXJhbSB7Q2xhc3M8U2NyaXB0VHlwZT59IHNjcmlwdCAtIFRoZSBleGlzdGluZyBjbGFzcyB0eXBlIChjb25zdHJ1Y3RvciBmdW5jdGlvbikgdG8gYmVcbiAqIHJlZ2lzdGVyZWQgYXMgYSBTY3JpcHQgVHlwZS4gQ2xhc3MgbXVzdCBleHRlbmQge0BsaW5rIFNjcmlwdFR5cGV9IChzZWUgZXhhbXBsZSkuIFBsZWFzZSBub3RlOiBBXG4gKiBjbGFzcyBjcmVhdGVkIHVzaW5nIHtAbGluayBjcmVhdGVTY3JpcHR9IGlzIGF1dG8tcmVnaXN0ZXJlZCwgYW5kIHNob3VsZCB0aGVyZWZvcmUgbm90IGJlIHBhc3NcbiAqIGludG8ge0BsaW5rIHJlZ2lzdGVyU2NyaXB0fSAod2hpY2ggd291bGQgcmVzdWx0IGluIHN3YXBwaW5nIG91dCBhbGwgcmVsYXRlZCBzY3JpcHQgaW5zdGFuY2VzKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZV0gLSBPcHRpb25hbCB1bmlxdWUgbmFtZSBvZiB0aGUgU2NyaXB0IFR5cGUuIEJ5IGRlZmF1bHQgaXQgd2lsbCB1c2UgdGhlXG4gKiBzYW1lIG5hbWUgYXMgdGhlIGV4aXN0aW5nIGNsYXNzLiBJZiBhIFNjcmlwdCBUeXBlIHdpdGggdGhlIHNhbWUgbmFtZSBoYXMgYWxyZWFkeSBiZWVuIHJlZ2lzdGVyZWRcbiAqIGFuZCB0aGUgbmV3IG9uZSBoYXMgYSBgc3dhcGAgbWV0aG9kIGRlZmluZWQgaW4gaXRzIHByb3RvdHlwZSwgdGhlbiBpdCB3aWxsIHBlcmZvcm0gaG90IHN3YXBwaW5nXG4gKiBvZiBleGlzdGluZyBTY3JpcHQgSW5zdGFuY2VzIG9uIGVudGl0aWVzIHVzaW5nIHRoaXMgbmV3IFNjcmlwdCBUeXBlLiBOb3RlOiBUaGVyZSBpcyBhIHJlc2VydmVkXG4gKiBsaXN0IG9mIG5hbWVzIHRoYXQgY2Fubm90IGJlIHVzZWQsIHN1Y2ggYXMgbGlzdCBiZWxvdyBhcyB3ZWxsIGFzIHNvbWUgc3RhcnRpbmcgZnJvbSBgX2BcbiAqICh1bmRlcnNjb3JlKTogc3lzdGVtLCBlbnRpdHksIGNyZWF0ZSwgZGVzdHJveSwgc3dhcCwgbW92ZSwgc2NyaXB0cywgb25FbmFibGUsIG9uRGlzYWJsZSxcbiAqIG9uUG9zdFN0YXRlQ2hhbmdlLCBoYXMsIG9uLCBvZmYsIGZpcmUsIG9uY2UsIGhhc0V2ZW50LlxuICogQHBhcmFtIHtBcHBCYXNlfSBbYXBwXSAtIE9wdGlvbmFsIGFwcGxpY2F0aW9uIGhhbmRsZXIsIHRvIGNob29zZSB3aGljaCB7QGxpbmsgU2NyaXB0UmVnaXN0cnl9XG4gKiB0byByZWdpc3RlciB0aGUgc2NyaXB0IHR5cGUgdG8uIEJ5IGRlZmF1bHQgaXQgd2lsbCB1c2UgYEFwcGxpY2F0aW9uLmdldEFwcGxpY2F0aW9uKClgIHRvIGdldFxuICogY3VycmVudCB7QGxpbmsgQXBwQmFzZX0uXG4gKiBAZXhhbXBsZVxuICogLy8gZGVmaW5lIGEgRVM2IHNjcmlwdCBjbGFzc1xuICogY2xhc3MgUGxheWVyQ29udHJvbGxlciBleHRlbmRzIHBjLlNjcmlwdFR5cGUge1xuICpcbiAqICAgICBpbml0aWFsaXplKCkge1xuICogICAgICAgICAvLyBjYWxsZWQgb25jZSBvbiBpbml0aWFsaXplXG4gKiAgICAgfVxuICpcbiAqICAgICB1cGRhdGUoZHQpIHtcbiAqICAgICAgICAgLy8gY2FsbGVkIGVhY2ggdGlja1xuICogICAgIH1cbiAqIH1cbiAqXG4gKiAvLyByZWdpc3RlciB0aGUgY2xhc3MgYXMgYSBzY3JpcHRcbiAqIHBjLnJlZ2lzdGVyU2NyaXB0KFBsYXllckNvbnRyb2xsZXIpO1xuICpcbiAqIC8vIGRlY2xhcmUgc2NyaXB0IGF0dHJpYnV0ZXMgKE11c3QgYmUgYWZ0ZXIgcGMucmVnaXN0ZXJTY3JpcHQoKSlcbiAqIFBsYXllckNvbnRyb2xsZXIuYXR0cmlidXRlcy5hZGQoJ2F0dHJpYnV0ZTEnLCB7dHlwZTogJ251bWJlcid9KTtcbiAqL1xuZnVuY3Rpb24gcmVnaXN0ZXJTY3JpcHQoc2NyaXB0LCBuYW1lLCBhcHApIHtcbiAgICBpZiAoc2NyaXB0LmxlZ2FjeSkge1xuICAgICAgICBEZWJ1Zy5lcnJvcignVGhpcyBwcm9qZWN0IGlzIHVzaW5nIHRoZSBsZWdhY3kgc2NyaXB0IHN5c3RlbS4gWW91IGNhbm5vdCBjYWxsIHBjLnJlZ2lzdGVyU2NyaXB0KCkuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNjcmlwdCAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBzY3JpcHQgY2xhc3M6ICcke3NjcmlwdH0nIG11c3QgYmUgYSBjb25zdHJ1Y3RvciBmdW5jdGlvbiAoaS5lLiBjbGFzcykuYCk7XG5cbiAgICBpZiAoIShzY3JpcHQucHJvdG90eXBlIGluc3RhbmNlb2YgU2NyaXB0VHlwZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgc2NyaXB0IGNsYXNzOiAnJHtTY3JpcHRUeXBlLl9fZ2V0U2NyaXB0TmFtZShzY3JpcHQpfScgZG9lcyBub3QgZXh0ZW5kIHBjLlNjcmlwdFR5cGUuYCk7XG5cbiAgICBuYW1lID0gbmFtZSB8fCBzY3JpcHQuX19uYW1lIHx8IFNjcmlwdFR5cGUuX19nZXRTY3JpcHROYW1lKHNjcmlwdCk7XG5cbiAgICBpZiAocmVzZXJ2ZWRTY3JpcHROYW1lcy5oYXMobmFtZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgc2NyaXB0IG5hbWU6ICcke25hbWV9JyBpcyByZXNlcnZlZCwgcGxlYXNlIGNoYW5nZSBzY3JpcHQgbmFtZWApO1xuXG4gICAgc2NyaXB0Ll9fbmFtZSA9IG5hbWU7XG5cbiAgICAvLyBhZGQgdG8gc2NyaXB0cyByZWdpc3RyeVxuICAgIGNvbnN0IHJlZ2lzdHJ5ID0gYXBwID8gYXBwLnNjcmlwdHMgOiBBcHBCYXNlLmdldEFwcGxpY2F0aW9uKCkuc2NyaXB0cztcbiAgICByZWdpc3RyeS5hZGQoc2NyaXB0KTtcblxuICAgIFNjcmlwdFR5cGVzLnB1c2goc2NyaXB0LCBzY3JpcHQubGVnYWN5KTtcbn1cbi8qIGVzbGludC1lbmFibGUganNkb2MvY2hlY2stZXhhbXBsZXMgKi9cblxuZXhwb3J0IHsgY3JlYXRlU2NyaXB0LCByZWdpc3RlclNjcmlwdCB9O1xuIl0sIm5hbWVzIjpbInJlc2VydmVkU2NyaXB0TmFtZXMiLCJTZXQiLCJjcmVhdGVTY3JpcHQiLCJuYW1lIiwiYXBwIiwic2NyaXB0IiwibGVnYWN5IiwiRGVidWciLCJlcnJvciIsImhhcyIsIkVycm9yIiwic2NyaXB0VHlwZSIsImFyZ3MiLCJFdmVudEhhbmRsZXIiLCJwcm90b3R5cGUiLCJpbml0RXZlbnRIYW5kbGVyIiwiY2FsbCIsIlNjcmlwdFR5cGUiLCJpbml0U2NyaXB0VHlwZSIsIk9iamVjdCIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwiZXh0ZW5kIiwiYXR0cmlidXRlcyIsIlNjcmlwdEF0dHJpYnV0ZXMiLCJyZWdpc3RlclNjcmlwdCIsInJlc2VydmVkQXR0cmlidXRlcyIsInJlc2VydmVkTmFtZXMiLCJmb3JFYWNoIiwidmFsdWUiLCJ2YWx1ZTIiLCJzZXQiLCJfX2dldFNjcmlwdE5hbWUiLCJfX25hbWUiLCJyZWdpc3RyeSIsInNjcmlwdHMiLCJBcHBCYXNlIiwiZ2V0QXBwbGljYXRpb24iLCJhZGQiLCJT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
