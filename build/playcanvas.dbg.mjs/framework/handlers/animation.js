/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { path } from '../../core/path.js';
import { Quat } from '../../core/math/quat.js';
import { Vec3 } from '../../core/math/vec3.js';
import { Http, http } from '../../platform/net/http.js';
import { Animation, Node, Key } from '../../scene/animation/animation.js';
import { AnimEvents } from '../anim/evaluator/anim-events.js';
import { GlbParser } from '../parsers/glb-parser.js';

class AnimationHandler {

  constructor(app) {
    this.handlerType = "animation";
    this.maxRetries = 0;
  }
  load(url, callback) {
    if (typeof url === 'string') {
      url = {
        load: url,
        original: url
      };
    }

    const options = {
      retry: this.maxRetries > 0,
      maxRetries: this.maxRetries
    };
    if (url.load.startsWith('blob:') || url.load.startsWith('data:')) {
      if (path.getExtension(url.original).toLowerCase() === '.glb') {
        options.responseType = Http.ResponseType.ARRAY_BUFFER;
      } else {
        options.responseType = Http.ResponseType.JSON;
      }
    }
    http.get(url.load, options, function (err, response) {
      if (err) {
        callback(`Error loading animation resource: ${url.original} [${err}]`);
      } else {
        callback(null, response);
      }
    });
  }
  open(url, data, asset) {
    if (path.getExtension(url).toLowerCase() === '.glb') {
      const glbResources = GlbParser.parse('filename.glb', data, null);
      if (glbResources) {
        var _asset$data;
        const animations = glbResources.animations;
        if (asset != null && (_asset$data = asset.data) != null && _asset$data.events) {
          for (let i = 0; i < animations.length; i++) {
            animations[i].events = new AnimEvents(Object.values(asset.data.events));
          }
        }
        glbResources.destroy();
        return animations;
      }
      return null;
    }
    return this['_parseAnimationV' + data.animation.version](data);
  }
  patch(asset, assets) {}
  _parseAnimationV3(data) {
    const animData = data.animation;
    const anim = new Animation();
    anim.name = animData.name;
    anim.duration = animData.duration;
    for (let i = 0; i < animData.nodes.length; i++) {
      const node = new Node();
      const n = animData.nodes[i];
      node._name = n.name;
      for (let j = 0; j < n.keys.length; j++) {
        const k = n.keys[j];
        const t = k.time;
        const p = k.pos;
        const r = k.rot;
        const s = k.scale;
        const pos = new Vec3(p[0], p[1], p[2]);
        const rot = new Quat().setFromEulerAngles(r[0], r[1], r[2]);
        const scl = new Vec3(s[0], s[1], s[2]);
        const key = new Key(t, pos, rot, scl);
        node._keys.push(key);
      }
      anim.addNode(node);
    }
    return anim;
  }
  _parseAnimationV4(data) {
    const animData = data.animation;
    const anim = new Animation();
    anim.name = animData.name;
    anim.duration = animData.duration;
    for (let i = 0; i < animData.nodes.length; i++) {
      const node = new Node();
      const n = animData.nodes[i];
      node._name = n.name;
      const defPos = n.defaults.p;
      const defRot = n.defaults.r;
      const defScl = n.defaults.s;
      for (let j = 0; j < n.keys.length; j++) {
        const k = n.keys[j];
        const t = k.t;
        const p = defPos ? defPos : k.p;
        const r = defRot ? defRot : k.r;
        const s = defScl ? defScl : k.s;
        const pos = new Vec3(p[0], p[1], p[2]);
        const rot = new Quat().setFromEulerAngles(r[0], r[1], r[2]);
        const scl = new Vec3(s[0], s[1], s[2]);
        const key = new Key(t, pos, rot, scl);
        node._keys.push(key);
      }
      anim.addNode(node);
    }
    return anim;
  }
}

export { AnimationHandler };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2hhbmRsZXJzL2FuaW1hdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwYXRoIH0gZnJvbSAnLi4vLi4vY29yZS9wYXRoLmpzJztcblxuaW1wb3J0IHsgUXVhdCB9IGZyb20gJy4uLy4uL2NvcmUvbWF0aC9xdWF0LmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi8uLi9jb3JlL21hdGgvdmVjMy5qcyc7XG5cbmltcG9ydCB7IGh0dHAsIEh0dHAgfSBmcm9tICcuLi8uLi9wbGF0Zm9ybS9uZXQvaHR0cC5qcyc7XG5cbmltcG9ydCB7IEFuaW1hdGlvbiwgS2V5LCBOb2RlIH0gZnJvbSAnLi4vLi4vc2NlbmUvYW5pbWF0aW9uL2FuaW1hdGlvbi5qcyc7XG5pbXBvcnQgeyBBbmltRXZlbnRzIH0gZnJvbSAnLi4vYW5pbS9ldmFsdWF0b3IvYW5pbS1ldmVudHMuanMnO1xuXG5pbXBvcnQgeyBHbGJQYXJzZXIgfSBmcm9tICcuLi9wYXJzZXJzL2dsYi1wYXJzZXIuanMnO1xuXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi9oYW5kbGVyLmpzJykuUmVzb3VyY2VIYW5kbGVyfSBSZXNvdXJjZUhhbmRsZXIgKi9cblxuLyoqXG4gKiBSZXNvdXJjZSBoYW5kbGVyIHVzZWQgZm9yIGxvYWRpbmcge0BsaW5rIEFuaW1hdGlvbn0gcmVzb3VyY2VzLlxuICpcbiAqIEBpbXBsZW1lbnRzIHtSZXNvdXJjZUhhbmRsZXJ9XG4gKi9cbmNsYXNzIEFuaW1hdGlvbkhhbmRsZXIge1xuICAgIC8qKlxuICAgICAqIFR5cGUgb2YgdGhlIHJlc291cmNlIHRoZSBoYW5kbGVyIGhhbmRsZXMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIGhhbmRsZXJUeXBlID0gXCJhbmltYXRpb25cIjtcblxuICAgIC8qKiBAaGlkZWNvbnN0cnVjdG9yICovXG4gICAgY29uc3RydWN0b3IoYXBwKSB7XG4gICAgICAgIHRoaXMubWF4UmV0cmllcyA9IDA7XG4gICAgfVxuXG4gICAgbG9hZCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdXJsID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdXJsID0ge1xuICAgICAgICAgICAgICAgIGxvYWQ6IHVybCxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbDogdXJsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UgbmVlZCB0byBzcGVjaWZ5IEpTT04gZm9yIGJsb2IgVVJMc1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgcmV0cnk6IHRoaXMubWF4UmV0cmllcyA+IDAsXG4gICAgICAgICAgICBtYXhSZXRyaWVzOiB0aGlzLm1heFJldHJpZXNcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodXJsLmxvYWQuc3RhcnRzV2l0aCgnYmxvYjonKSB8fCB1cmwubG9hZC5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgICAgICAgICBpZiAocGF0aC5nZXRFeHRlbnNpb24odXJsLm9yaWdpbmFsKS50b0xvd2VyQ2FzZSgpID09PSAnLmdsYicpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLnJlc3BvbnNlVHlwZSA9IEh0dHAuUmVzcG9uc2VUeXBlLkFSUkFZX0JVRkZFUjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5yZXNwb25zZVR5cGUgPSBIdHRwLlJlc3BvbnNlVHlwZS5KU09OO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaHR0cC5nZXQodXJsLmxvYWQsIG9wdGlvbnMsIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soYEVycm9yIGxvYWRpbmcgYW5pbWF0aW9uIHJlc291cmNlOiAke3VybC5vcmlnaW5hbH0gWyR7ZXJyfV1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvcGVuKHVybCwgZGF0YSwgYXNzZXQpIHtcbiAgICAgICAgaWYgKHBhdGguZ2V0RXh0ZW5zaW9uKHVybCkudG9Mb3dlckNhc2UoKSA9PT0gJy5nbGInKSB7XG4gICAgICAgICAgICBjb25zdCBnbGJSZXNvdXJjZXMgPSBHbGJQYXJzZXIucGFyc2UoJ2ZpbGVuYW1lLmdsYicsIGRhdGEsIG51bGwpO1xuICAgICAgICAgICAgaWYgKGdsYlJlc291cmNlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuaW1hdGlvbnMgPSBnbGJSZXNvdXJjZXMuYW5pbWF0aW9ucztcbiAgICAgICAgICAgICAgICBpZiAoYXNzZXQ/LmRhdGE/LmV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFuaW1hdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbnNbaV0uZXZlbnRzID0gbmV3IEFuaW1FdmVudHMoT2JqZWN0LnZhbHVlcyhhc3NldC5kYXRhLmV2ZW50cykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdsYlJlc291cmNlcy5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1snX3BhcnNlQW5pbWF0aW9uVicgKyBkYXRhLmFuaW1hdGlvbi52ZXJzaW9uXShkYXRhKTtcbiAgICB9XG5cbiAgICBwYXRjaChhc3NldCwgYXNzZXRzKSB7XG4gICAgfVxuXG4gICAgX3BhcnNlQW5pbWF0aW9uVjMoZGF0YSkge1xuICAgICAgICBjb25zdCBhbmltRGF0YSA9IGRhdGEuYW5pbWF0aW9uO1xuXG4gICAgICAgIGNvbnN0IGFuaW0gPSBuZXcgQW5pbWF0aW9uKCk7XG4gICAgICAgIGFuaW0ubmFtZSA9IGFuaW1EYXRhLm5hbWU7XG4gICAgICAgIGFuaW0uZHVyYXRpb24gPSBhbmltRGF0YS5kdXJhdGlvbjtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFuaW1EYXRhLm5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gbmV3IE5vZGUoKTtcblxuICAgICAgICAgICAgY29uc3QgbiA9IGFuaW1EYXRhLm5vZGVzW2ldO1xuICAgICAgICAgICAgbm9kZS5fbmFtZSA9IG4ubmFtZTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBuLmtleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrID0gbi5rZXlzW2pdO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdCA9IGsudGltZTtcbiAgICAgICAgICAgICAgICBjb25zdCBwID0gay5wb3M7XG4gICAgICAgICAgICAgICAgY29uc3QgciA9IGsucm90O1xuICAgICAgICAgICAgICAgIGNvbnN0IHMgPSBrLnNjYWxlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IG5ldyBWZWMzKHBbMF0sIHBbMV0sIHBbMl0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvdCA9IG5ldyBRdWF0KCkuc2V0RnJvbUV1bGVyQW5nbGVzKHJbMF0sIHJbMV0sIHJbMl0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNjbCA9IG5ldyBWZWMzKHNbMF0sIHNbMV0sIHNbMl0pO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gbmV3IEtleSh0LCBwb3MsIHJvdCwgc2NsKTtcblxuICAgICAgICAgICAgICAgIG5vZGUuX2tleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhbmltLmFkZE5vZGUobm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYW5pbTtcbiAgICB9XG5cbiAgICBfcGFyc2VBbmltYXRpb25WNChkYXRhKSB7XG4gICAgICAgIGNvbnN0IGFuaW1EYXRhID0gZGF0YS5hbmltYXRpb247XG5cbiAgICAgICAgY29uc3QgYW5pbSA9IG5ldyBBbmltYXRpb24oKTtcbiAgICAgICAgYW5pbS5uYW1lID0gYW5pbURhdGEubmFtZTtcbiAgICAgICAgYW5pbS5kdXJhdGlvbiA9IGFuaW1EYXRhLmR1cmF0aW9uO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYW5pbURhdGEubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgTm9kZSgpO1xuXG4gICAgICAgICAgICBjb25zdCBuID0gYW5pbURhdGEubm9kZXNbaV07XG4gICAgICAgICAgICBub2RlLl9uYW1lID0gbi5uYW1lO1xuXG4gICAgICAgICAgICBjb25zdCBkZWZQb3MgPSBuLmRlZmF1bHRzLnA7XG4gICAgICAgICAgICBjb25zdCBkZWZSb3QgPSBuLmRlZmF1bHRzLnI7XG4gICAgICAgICAgICBjb25zdCBkZWZTY2wgPSBuLmRlZmF1bHRzLnM7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbi5rZXlzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgayA9IG4ua2V5c1tqXTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBrLnQ7XG4gICAgICAgICAgICAgICAgY29uc3QgcCA9IGRlZlBvcyA/IGRlZlBvcyA6IGsucDtcbiAgICAgICAgICAgICAgICBjb25zdCByID0gZGVmUm90ID8gZGVmUm90IDogay5yO1xuICAgICAgICAgICAgICAgIGNvbnN0IHMgPSBkZWZTY2wgPyBkZWZTY2wgOiBrLnM7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9zID0gbmV3IFZlYzMocFswXSwgcFsxXSwgcFsyXSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm90ID0gbmV3IFF1YXQoKS5zZXRGcm9tRXVsZXJBbmdsZXMoclswXSwgclsxXSwgclsyXSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2NsID0gbmV3IFZlYzMoc1swXSwgc1sxXSwgc1syXSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBuZXcgS2V5KHQsIHBvcywgcm90LCBzY2wpO1xuXG4gICAgICAgICAgICAgICAgbm9kZS5fa2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFuaW0uYWRkTm9kZShub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhbmltO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgQW5pbWF0aW9uSGFuZGxlciB9O1xuIl0sIm5hbWVzIjpbIkFuaW1hdGlvbkhhbmRsZXIiLCJjb25zdHJ1Y3RvciIsImFwcCIsImhhbmRsZXJUeXBlIiwibWF4UmV0cmllcyIsImxvYWQiLCJ1cmwiLCJjYWxsYmFjayIsIm9yaWdpbmFsIiwib3B0aW9ucyIsInJldHJ5Iiwic3RhcnRzV2l0aCIsInBhdGgiLCJnZXRFeHRlbnNpb24iLCJ0b0xvd2VyQ2FzZSIsInJlc3BvbnNlVHlwZSIsIkh0dHAiLCJSZXNwb25zZVR5cGUiLCJBUlJBWV9CVUZGRVIiLCJKU09OIiwiaHR0cCIsImdldCIsImVyciIsInJlc3BvbnNlIiwib3BlbiIsImRhdGEiLCJhc3NldCIsImdsYlJlc291cmNlcyIsIkdsYlBhcnNlciIsInBhcnNlIiwiYW5pbWF0aW9ucyIsImV2ZW50cyIsImkiLCJsZW5ndGgiLCJBbmltRXZlbnRzIiwiT2JqZWN0IiwidmFsdWVzIiwiZGVzdHJveSIsImFuaW1hdGlvbiIsInZlcnNpb24iLCJwYXRjaCIsImFzc2V0cyIsIl9wYXJzZUFuaW1hdGlvblYzIiwiYW5pbURhdGEiLCJhbmltIiwiQW5pbWF0aW9uIiwibmFtZSIsImR1cmF0aW9uIiwibm9kZXMiLCJub2RlIiwiTm9kZSIsIm4iLCJfbmFtZSIsImoiLCJrZXlzIiwiayIsInQiLCJ0aW1lIiwicCIsInBvcyIsInIiLCJyb3QiLCJzIiwic2NhbGUiLCJWZWMzIiwiUXVhdCIsInNldEZyb21FdWxlckFuZ2xlcyIsInNjbCIsImtleSIsIktleSIsIl9rZXlzIiwicHVzaCIsImFkZE5vZGUiLCJfcGFyc2VBbmltYXRpb25WNCIsImRlZlBvcyIsImRlZmF1bHRzIiwiZGVmUm90IiwiZGVmU2NsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBbUJBLE1BQU1BLGdCQUFnQixDQUFDOztFQVNuQkMsV0FBVyxDQUFDQyxHQUFHLEVBQUU7SUFBQSxJQUhqQkMsQ0FBQUEsV0FBVyxHQUFHLFdBQVcsQ0FBQTtJQUlyQixJQUFJLENBQUNDLFVBQVUsR0FBRyxDQUFDLENBQUE7QUFDdkIsR0FBQTtBQUVBQyxFQUFBQSxJQUFJLENBQUNDLEdBQUcsRUFBRUMsUUFBUSxFQUFFO0FBQ2hCLElBQUEsSUFBSSxPQUFPRCxHQUFHLEtBQUssUUFBUSxFQUFFO0FBQ3pCQSxNQUFBQSxHQUFHLEdBQUc7QUFDRkQsUUFBQUEsSUFBSSxFQUFFQyxHQUFHO0FBQ1RFLFFBQUFBLFFBQVEsRUFBRUYsR0FBQUE7T0FDYixDQUFBO0FBQ0wsS0FBQTs7QUFHQSxJQUFBLE1BQU1HLE9BQU8sR0FBRztBQUNaQyxNQUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDTixVQUFVLEdBQUcsQ0FBQztNQUMxQkEsVUFBVSxFQUFFLElBQUksQ0FBQ0EsVUFBQUE7S0FDcEIsQ0FBQTtBQUVELElBQUEsSUFBSUUsR0FBRyxDQUFDRCxJQUFJLENBQUNNLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSUwsR0FBRyxDQUFDRCxJQUFJLENBQUNNLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUM5RCxNQUFBLElBQUlDLElBQUksQ0FBQ0MsWUFBWSxDQUFDUCxHQUFHLENBQUNFLFFBQVEsQ0FBQyxDQUFDTSxXQUFXLEVBQUUsS0FBSyxNQUFNLEVBQUU7QUFD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
