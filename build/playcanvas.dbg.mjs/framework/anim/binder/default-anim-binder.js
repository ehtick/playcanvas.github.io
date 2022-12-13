/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../../core/debug.js';
import { AnimBinder } from './anim-binder.js';
import { AnimTarget } from '../evaluator/anim-target.js';
import { Entity } from '../../entity.js';

class DefaultAnimBinder {
  constructor(graph) {
    this._isPathInMask = (path, checkMaskValue) => {
      const maskItem = this._mask[path];
      if (!maskItem) return false;else if (maskItem.children || checkMaskValue && maskItem.value !== false) return true;
      return false;
    };
    this.graph = graph;
    if (!graph) return;
    this._mask = null;
    const nodes = {};
    const flatten = function flatten(node) {
      nodes[node.name] = node;
      for (let i = 0; i < node.children.length; ++i) {
        flatten(node.children[i]);
      }
    };
    flatten(graph);
    this.nodes = nodes;
    this.targetCache = {};
    this.visitedFallbackGraphPaths = {};
    const findMeshInstances = function findMeshInstances(node) {
      let object = node;
      while (object && !(object instanceof Entity)) {
        object = object.parent;
      }

      let meshInstances;
      if (object) {
        if (object.render) {
          meshInstances = object.render.meshInstances;
        } else if (object.model) {
          meshInstances = object.model.meshInstances;
        }
      }
      return meshInstances;
    };
    this.nodeCounts = {};
    this.activeNodes = [];
    this.handlers = {
      'localPosition': function (node) {
        const object = node.localPosition;
        const func = function func(value) {
          object.set(...value);
        };
        return DefaultAnimBinder.createAnimTarget(func, 'vector', 3, node, 'localPosition');
      },
      'localRotation': function (node) {
        const object = node.localRotation;
        const func = function func(value) {
          object.set(...value);
        };
        return DefaultAnimBinder.createAnimTarget(func, 'quaternion', 4, node, 'localRotation');
      },
      'localScale': function (node) {
        const object = node.localScale;
        const func = function func(value) {
          object.set(...value);
        };
        return DefaultAnimBinder.createAnimTarget(func, 'vector', 3, node, 'localScale');
      },
      'weight': function (node, weightName) {
        if (weightName.indexOf('name.') === 0) {
          weightName = weightName.replace('name.', '');
        } else {
          weightName = Number(weightName);
        }
        const meshInstances = findMeshInstances(node);
        let setters;
        if (meshInstances) {
          for (let i = 0; i < meshInstances.length; ++i) {
            if (meshInstances[i].node.name === node.name && meshInstances[i].morphInstance) {
              const morphInstance = meshInstances[i].morphInstance;
              const func = value => {
                morphInstance.setWeight(weightName, value[0]);
              };
              if (!setters) setters = [];
              setters.push(func);
            }
          }
        }
        if (setters) {
          const callSetters = value => {
            for (let i = 0; i < setters.length; ++i) {
              setters[i](value);
            }
          };
          return DefaultAnimBinder.createAnimTarget(callSetters, 'number', 1, node, `weight.${weightName}`);
        }
        return null;
      },
      'materialTexture': (node, textureName) => {
        const meshInstances = findMeshInstances(node);
        if (meshInstances) {
          let meshInstance;
          for (let i = 0; i < meshInstances.length; ++i) {
            if (meshInstances[i].node.name === node.name) {
              meshInstance = meshInstances[i];
              break;
            }
          }
          if (meshInstance) {
            const func = value => {
              const textureAsset = this.animComponent.system.app.assets.get(value[0]);
              if (textureAsset && textureAsset.resource && textureAsset.type === 'texture') {
                meshInstance.material[textureName] = textureAsset.resource;
                meshInstance.material.update();
              }
            };
            return DefaultAnimBinder.createAnimTarget(func, 'vector', 1, node, 'materialTexture', 'material');
          }
        }
        return null;
      }
    };
  }
  _isPathActive(path) {
    if (!this._mask) return true;
    const rootNodeNames = [path.entityPath[0], this.graph.name];
    for (let j = 0; j < rootNodeNames.length; ++j) {
      let currEntityPath = rootNodeNames[j];
      if (this._isPathInMask(currEntityPath, path.entityPath.length === 1)) return true;
      for (let i = 1; i < path.entityPath.length; i++) {
        currEntityPath += '/' + path.entityPath[i];
        if (this._isPathInMask(currEntityPath, i === path.entityPath.length - 1)) return true;
      }
    }
    return false;
  }
  findNode(path) {
    if (!this._isPathActive(path)) {
      return null;
    }
    let node;
    if (this.graph) {
      node = this.graph.findByPath(path.entityPath);
      if (!node) {
        node = this.graph.findByPath(path.entityPath.slice(1));
      }
    }
    if (!node) {
      node = this.nodes[path.entityPath[path.entityPath.length - 1] || ""];
      const fallbackGraphPath = AnimBinder.encode(path.entityPath[path.entityPath.length - 1] || "", 'graph', path.propertyPath);
      if (this.visitedFallbackGraphPaths[fallbackGraphPath] === 1) {
        Debug.warn(`Anim Binder: Multiple animation curves with the path ${fallbackGraphPath} are present in the ${this.graph.path} graph which may result in the incorrect binding of animations`);
      }
      if (!Number.isFinite(this.visitedFallbackGraphPaths[fallbackGraphPath])) {
        this.visitedFallbackGraphPaths[fallbackGraphPath] = 0;
      } else {
        this.visitedFallbackGraphPaths[fallbackGraphPath]++;
      }
    }
    return node;
  }
  static createAnimTarget(func, type, valueCount, node, propertyPath, componentType) {
    const targetPath = AnimBinder.encode(node.path, componentType ? componentType : 'entity', propertyPath);
    return new AnimTarget(func, type, valueCount, targetPath);
  }
  resolve(path) {
    const encodedPath = AnimBinder.encode(path.entityPath, path.component, path.propertyPath);
    let target = this.targetCache[encodedPath];
    if (target) return target;
    const node = this.findNode(path);
    if (!node) {
      return null;
    }
    const handler = this.handlers[path.propertyPath];
    if (!handler) {
      return null;
    }
    target = handler(node);
    if (!target) {
      return null;
    }
    this.targetCache[encodedPath] = target;
    if (!this.nodeCounts[node.path]) {
      this.activeNodes.push(node);
      this.nodeCounts[node.path] = 1;
    } else {
      this.nodeCounts[node.path]++;
    }
    return target;
  }
  unresolve(path) {
    if (path.component !== 'graph') return;
    const node = this.nodes[path.entityPath[path.entityPath.length - 1] || ""];
    this.nodeCounts[node.path]--;
    if (this.nodeCounts[node.path] === 0) {
      const activeNodes = this.activeNodes;
      const i = activeNodes.indexOf(node.node);
      const len = activeNodes.length;
      if (i < len - 1) {
        activeNodes[i] = activeNodes[len - 1];
      }
      activeNodes.pop();
    }
  }

  update(deltaTime) {
    const activeNodes = this.activeNodes;
    for (let i = 0; i < activeNodes.length; ++i) {
      activeNodes[i]._dirtifyLocal();
    }
  }
  assignMask(mask) {
    if (mask !== this._mask) {
      this._mask = mask;
      return true;
    }
    return false;
  }
}

export { DefaultAnimBinder };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1hbmltLWJpbmRlci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9hbmltL2JpbmRlci9kZWZhdWx0LWFuaW0tYmluZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERlYnVnIH0gZnJvbSAnLi4vLi4vLi4vY29yZS9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBBbmltQmluZGVyIH0gZnJvbSAnLi9hbmltLWJpbmRlci5qcyc7XG5pbXBvcnQgeyBBbmltVGFyZ2V0IH0gZnJvbSAnLi4vZXZhbHVhdG9yL2FuaW0tdGFyZ2V0LmpzJztcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4uLy4uL2VudGl0eS5qcyc7XG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIHtAbGluayBBbmltQmluZGVyfSBmb3IgYW5pbWF0aW5nIGEgc2tlbGV0b24gaW4gdGhlIGdyYXBoLW5vZGUgaGllcmFyY2h5LlxuICpcbiAqIEBpbXBsZW1lbnRzIHtBbmltQmluZGVyfVxuICogQGlnbm9yZVxuICovXG5jbGFzcyBEZWZhdWx0QW5pbUJpbmRlciB7XG4gICAgY29uc3RydWN0b3IoZ3JhcGgpIHtcbiAgICAgICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xuXG4gICAgICAgIGlmICghZ3JhcGgpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9tYXNrID0gbnVsbDtcblxuICAgICAgICBjb25zdCBub2RlcyA9IHsgfTtcbiAgICAgICAgLy8gY2FjaGUgbm9kZSBuYW1lcyBzbyB3ZSBjYW4gcXVpY2tseSByZXNvbHZlIGFuaW1hdGlvbiBwYXRoc1xuICAgICAgICBjb25zdCBmbGF0dGVuID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIG5vZGVzW25vZGUubmFtZV0gPSBub2RlO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgZmxhdHRlbihub2RlLmNoaWxkcmVuW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZmxhdHRlbihncmFwaCk7XG4gICAgICAgIHRoaXMubm9kZXMgPSBub2RlcztcbiAgICAgICAgdGhpcy50YXJnZXRDYWNoZSA9IHt9O1xuICAgICAgICAvLyAjaWYgX0RFQlVHXG4gICAgICAgIHRoaXMudmlzaXRlZEZhbGxiYWNrR3JhcGhQYXRocyA9IHt9O1xuICAgICAgICAvLyAjZW5kaWZcblxuICAgICAgICBjb25zdCBmaW5kTWVzaEluc3RhbmNlcyA9IGZ1bmN0aW9uIChub2RlKSB7XG5cbiAgICAgICAgICAgIC8vIHdhbGsgdXAgdG8gdGhlIGZpcnN0IHBhcmVudCBub2RlIG9mIGVudGl0eSB0eXBlIChza2lwcyBpbnRlcm5hbCBub2RlcyBvZiBNb2RlbClcbiAgICAgICAgICAgIGxldCBvYmplY3QgPSBub2RlO1xuICAgICAgICAgICAgd2hpbGUgKG9iamVjdCAmJiAhKG9iamVjdCBpbnN0YW5jZW9mIEVudGl0eSkpIHtcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBvYmplY3QucGFyZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBnZXQgbWVzaEluc3RhbmNlcyBmcm9tIGVpdGhlciBtb2RlbCBvciByZW5kZXIgY29tcG9uZW50XG4gICAgICAgICAgICBsZXQgbWVzaEluc3RhbmNlcztcbiAgICAgICAgICAgIGlmIChvYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqZWN0LnJlbmRlcikge1xuICAgICAgICAgICAgICAgICAgICBtZXNoSW5zdGFuY2VzID0gb2JqZWN0LnJlbmRlci5tZXNoSW5zdGFuY2VzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob2JqZWN0Lm1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc2hJbnN0YW5jZXMgPSBvYmplY3QubW9kZWwubWVzaEluc3RhbmNlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVzaEluc3RhbmNlcztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm5vZGVDb3VudHMgPSB7fTsgICAgICAgICAgICAgICAvLyBtYXAgb2Ygbm9kZSBwYXRoIC0+IGNvdW50XG4gICAgICAgIHRoaXMuYWN0aXZlTm9kZXMgPSBbXTsgICAgICAgICAgICAgIC8vIGxpc3Qgb2YgYWN0aXZlIG5vZGVzXG4gICAgICAgIHRoaXMuaGFuZGxlcnMgPSB7XG4gICAgICAgICAgICAnbG9jYWxQb3NpdGlvbic6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2JqZWN0ID0gbm9kZS5sb2NhbFBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bmMgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnNldCguLi52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gRGVmYXVsdEFuaW1CaW5kZXIuY3JlYXRlQW5pbVRhcmdldChmdW5jLCAndmVjdG9yJywgMywgbm9kZSwgJ2xvY2FsUG9zaXRpb24nKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICdsb2NhbFJvdGF0aW9uJzogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvYmplY3QgPSBub2RlLmxvY2FsUm90YXRpb247XG4gICAgICAgICAgICAgICAgY29uc3QgZnVuYyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBvYmplY3Quc2V0KC4uLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBEZWZhdWx0QW5pbUJpbmRlci5jcmVhdGVBbmltVGFyZ2V0KGZ1bmMsICdxdWF0ZXJuaW9uJywgNCwgbm9kZSwgJ2xvY2FsUm90YXRpb24nKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICdsb2NhbFNjYWxlJzogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvYmplY3QgPSBub2RlLmxvY2FsU2NhbGU7XG4gICAgICAgICAgICAgICAgY29uc3QgZnVuYyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBvYmplY3Quc2V0KC4uLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBEZWZhdWx0QW5pbUJpbmRlci5jcmVhdGVBbmltVGFyZ2V0KGZ1bmMsICd2ZWN0b3InLCAzLCBub2RlLCAnbG9jYWxTY2FsZScpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgJ3dlaWdodCc6IGZ1bmN0aW9uIChub2RlLCB3ZWlnaHROYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdlaWdodE5hbWUuaW5kZXhPZignbmFtZS4nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB3ZWlnaHROYW1lID0gd2VpZ2h0TmFtZS5yZXBsYWNlKCduYW1lLicsICcnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3ZWlnaHROYW1lID0gTnVtYmVyKHdlaWdodE5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBtZXNoSW5zdGFuY2VzID0gZmluZE1lc2hJbnN0YW5jZXMobm9kZSk7XG4gICAgICAgICAgICAgICAgbGV0IHNldHRlcnM7XG4gICAgICAgICAgICAgICAgaWYgKG1lc2hJbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXNoSW5zdGFuY2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWVzaEluc3RhbmNlc1tpXS5ub2RlLm5hbWUgPT09IG5vZGUubmFtZSAmJiBtZXNoSW5zdGFuY2VzW2ldLm1vcnBoSW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb3JwaEluc3RhbmNlID0gbWVzaEluc3RhbmNlc1tpXS5tb3JwaEluc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZ1bmMgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9ycGhJbnN0YW5jZS5zZXRXZWlnaHQod2VpZ2h0TmFtZSwgdmFsdWVbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzZXR0ZXJzKSBzZXR0ZXJzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGVycy5wdXNoKGZ1bmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzZXR0ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxTZXR0ZXJzID0gKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNldHRlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0ZXJzW2ldKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERlZmF1bHRBbmltQmluZGVyLmNyZWF0ZUFuaW1UYXJnZXQoY2FsbFNldHRlcnMsICdudW1iZXInLCAxLCBub2RlLCBgd2VpZ2h0LiR7d2VpZ2h0TmFtZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ21hdGVyaWFsVGV4dHVyZSc6IChub2RlLCB0ZXh0dXJlTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc2hJbnN0YW5jZXMgPSBmaW5kTWVzaEluc3RhbmNlcyhub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAobWVzaEluc3RhbmNlcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzaEluc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lc2hJbnN0YW5jZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZXNoSW5zdGFuY2VzW2ldLm5vZGUubmFtZSA9PT0gbm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzaEluc3RhbmNlID0gbWVzaEluc3RhbmNlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobWVzaEluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmdW5jID0gKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZUFzc2V0ID0gdGhpcy5hbmltQ29tcG9uZW50LnN5c3RlbS5hcHAuYXNzZXRzLmdldCh2YWx1ZVswXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRleHR1cmVBc3NldCAmJiB0ZXh0dXJlQXNzZXQucmVzb3VyY2UgJiYgdGV4dHVyZUFzc2V0LnR5cGUgPT09ICd0ZXh0dXJlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNoSW5zdGFuY2UubWF0ZXJpYWxbdGV4dHVyZU5hbWVdID0gdGV4dHVyZUFzc2V0LnJlc291cmNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNoSW5zdGFuY2UubWF0ZXJpYWwudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBEZWZhdWx0QW5pbUJpbmRlci5jcmVhdGVBbmltVGFyZ2V0KGZ1bmMsICd2ZWN0b3InLCAxLCBub2RlLCAnbWF0ZXJpYWxUZXh0dXJlJywgJ21hdGVyaWFsJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfaXNQYXRoSW5NYXNrID0gKHBhdGgsIGNoZWNrTWFza1ZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hc2tJdGVtID0gdGhpcy5fbWFza1twYXRoXTtcbiAgICAgICAgaWYgKCFtYXNrSXRlbSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBlbHNlIGlmIChtYXNrSXRlbS5jaGlsZHJlbiB8fCAoY2hlY2tNYXNrVmFsdWUgJiYgbWFza0l0ZW0udmFsdWUgIT09IGZhbHNlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgX2lzUGF0aEFjdGl2ZShwYXRoKSB7XG4gICAgICAgIGlmICghdGhpcy5fbWFzaykgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgY29uc3Qgcm9vdE5vZGVOYW1lcyA9IFtwYXRoLmVudGl0eVBhdGhbMF0sIHRoaXMuZ3JhcGgubmFtZV07XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcm9vdE5vZGVOYW1lcy5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgbGV0IGN1cnJFbnRpdHlQYXRoID0gcm9vdE5vZGVOYW1lc1tqXTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc1BhdGhJbk1hc2soY3VyckVudGl0eVBhdGgsIHBhdGguZW50aXR5UGF0aC5sZW5ndGggPT09IDEpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgcGF0aC5lbnRpdHlQYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3VyckVudGl0eVBhdGggKz0gJy8nICsgcGF0aC5lbnRpdHlQYXRoW2ldO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc1BhdGhJbk1hc2soY3VyckVudGl0eVBhdGgsIGkgPT09IHBhdGguZW50aXR5UGF0aC5sZW5ndGggLSAxKSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZpbmROb2RlKHBhdGgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1BhdGhBY3RpdmUocGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5vZGU7XG4gICAgICAgIGlmICh0aGlzLmdyYXBoKSB7XG4gICAgICAgICAgICBub2RlID0gdGhpcy5ncmFwaC5maW5kQnlQYXRoKHBhdGguZW50aXR5UGF0aCk7XG4gICAgICAgICAgICAvLyBpZiB0aGUgcGF0aCBpcyBub3QgZm91bmQgdW5kZXIgdGhlIGdpdmVuIHJvb3Qgbm9kZSwgdHJ5IHRvIGZpbmQgdGhlIHBhdGggdXNpbmcgdGhlIHJvb3Qgbm9kZSBhcyB0aGUgYmFzZSBvZiB0aGUgcGF0aCBpbnN0ZWFkXG4gICAgICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgICAgICBub2RlID0gdGhpcy5ncmFwaC5maW5kQnlQYXRoKHBhdGguZW50aXR5UGF0aC5zbGljZSgxKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICBub2RlID0gdGhpcy5ub2Rlc1twYXRoLmVudGl0eVBhdGhbcGF0aC5lbnRpdHlQYXRoLmxlbmd0aCAtIDFdIHx8IFwiXCJdO1xuXG4gICAgICAgICAgICAvLyAjaWYgX0RFQlVHXG4gICAgICAgICAgICBjb25zdCBmYWxsYmFja0dyYXBoUGF0aCA9IEFuaW1CaW5kZXIuZW5jb2RlKHBhdGguZW50aXR5UGF0aFtwYXRoLmVudGl0eVBhdGgubGVuZ3RoIC0gMV0gfHwgXCJcIiwgJ2dyYXBoJywgcGF0aC5wcm9wZXJ0eVBhdGgpO1xuICAgICAgICAgICAgaWYgKHRoaXMudmlzaXRlZEZhbGxiYWNrR3JhcGhQYXRoc1tmYWxsYmFja0dyYXBoUGF0aF0gPT09IDEpIHtcbiAgICAgICAgICAgICAgICBEZWJ1Zy53YXJuKGBBbmltIEJpbmRlcjogTXVsdGlwbGUgYW5pbWF0aW9uIGN1cnZlcyB3aXRoIHRoZSBwYXRoICR7ZmFsbGJhY2tHcmFwaFBhdGh9IGFyZSBwcmVzZW50IGluIHRoZSAke3RoaXMuZ3JhcGgucGF0aH0gZ3JhcGggd2hpY2ggbWF5IHJlc3VsdCBpbiB0aGUgaW5jb3JyZWN0IGJpbmRpbmcgb2YgYW5pbWF0aW9uc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodGhpcy52aXNpdGVkRmFsbGJhY2tHcmFwaFBhdGhzW2ZhbGxiYWNrR3JhcGhQYXRoXSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2l0ZWRGYWxsYmFja0dyYXBoUGF0aHNbZmFsbGJhY2tHcmFwaFBhdGhdID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aXNpdGVkRmFsbGJhY2tHcmFwaFBhdGhzW2ZhbGxiYWNrR3JhcGhQYXRoXSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gI2VuZGlmXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZUFuaW1UYXJnZXQoZnVuYywgdHlwZSwgdmFsdWVDb3VudCwgbm9kZSwgcHJvcGVydHlQYXRoLCBjb21wb25lbnRUeXBlKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldFBhdGggPSBBbmltQmluZGVyLmVuY29kZShub2RlLnBhdGgsIGNvbXBvbmVudFR5cGUgPyBjb21wb25lbnRUeXBlIDogJ2VudGl0eScsIHByb3BlcnR5UGF0aCk7XG4gICAgICAgIHJldHVybiBuZXcgQW5pbVRhcmdldChmdW5jLCB0eXBlLCB2YWx1ZUNvdW50LCB0YXJnZXRQYXRoKTtcbiAgICB9XG5cbiAgICByZXNvbHZlKHBhdGgpIHtcbiAgICAgICAgY29uc3QgZW5jb2RlZFBhdGggPSBBbmltQmluZGVyLmVuY29kZShwYXRoLmVudGl0eVBhdGgsIHBhdGguY29tcG9uZW50LCBwYXRoLnByb3BlcnR5UGF0aCk7XG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLnRhcmdldENhY2hlW2VuY29kZWRQYXRoXTtcbiAgICAgICAgaWYgKHRhcmdldCkgcmV0dXJuIHRhcmdldDtcblxuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5maW5kTm9kZShwYXRoKTtcbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLmhhbmRsZXJzW3BhdGgucHJvcGVydHlQYXRoXTtcbiAgICAgICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldCA9IGhhbmRsZXIobm9kZSk7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudGFyZ2V0Q2FjaGVbZW5jb2RlZFBhdGhdID0gdGFyZ2V0O1xuXG4gICAgICAgIGlmICghdGhpcy5ub2RlQ291bnRzW25vZGUucGF0aF0pIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgIHRoaXMubm9kZUNvdW50c1tub2RlLnBhdGhdID0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubm9kZUNvdW50c1tub2RlLnBhdGhdKys7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIHVucmVzb2x2ZShwYXRoKSB7XG4gICAgICAgIGlmIChwYXRoLmNvbXBvbmVudCAhPT0gJ2dyYXBoJylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5ub2Rlc1twYXRoLmVudGl0eVBhdGhbcGF0aC5lbnRpdHlQYXRoLmxlbmd0aCAtIDFdIHx8IFwiXCJdO1xuXG4gICAgICAgIHRoaXMubm9kZUNvdW50c1tub2RlLnBhdGhdLS07XG4gICAgICAgIGlmICh0aGlzLm5vZGVDb3VudHNbbm9kZS5wYXRoXSA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3QgYWN0aXZlTm9kZXMgPSB0aGlzLmFjdGl2ZU5vZGVzO1xuICAgICAgICAgICAgY29uc3QgaSA9IGFjdGl2ZU5vZGVzLmluZGV4T2Yobm9kZS5ub2RlKTsgIC8vIDooXG4gICAgICAgICAgICBjb25zdCBsZW4gPSBhY3RpdmVOb2Rlcy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAoaSA8IGxlbiAtIDEpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVOb2Rlc1tpXSA9IGFjdGl2ZU5vZGVzW2xlbiAtIDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWN0aXZlTm9kZXMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmbGFnIGFuaW1hdGluZyBub2RlcyBhcyBkaXJ0eVxuICAgIHVwZGF0ZShkZWx0YVRpbWUpIHtcbiAgICAgICAgY29uc3QgYWN0aXZlTm9kZXMgPSB0aGlzLmFjdGl2ZU5vZGVzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdGl2ZU5vZGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBhY3RpdmVOb2Rlc1tpXS5fZGlydGlmeUxvY2FsKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3NpZ25NYXNrKG1hc2spIHtcbiAgICAgICAgaWYgKG1hc2sgIT09IHRoaXMuX21hc2spIHtcbiAgICAgICAgICAgIHRoaXMuX21hc2sgPSBtYXNrO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgRGVmYXVsdEFuaW1CaW5kZXIgfTtcbiJdLCJuYW1lcyI6WyJEZWZhdWx0QW5pbUJpbmRlciIsImNvbnN0cnVjdG9yIiwiZ3JhcGgiLCJfaXNQYXRoSW5NYXNrIiwicGF0aCIsImNoZWNrTWFza1ZhbHVlIiwibWFza0l0ZW0iLCJfbWFzayIsImNoaWxkcmVuIiwidmFsdWUiLCJub2RlcyIsImZsYXR0ZW4iLCJub2RlIiwibmFtZSIsImkiLCJsZW5ndGgiLCJ0YXJnZXRDYWNoZSIsInZpc2l0ZWRGYWxsYmFja0dyYXBoUGF0aHMiLCJmaW5kTWVzaEluc3RhbmNlcyIsIm9iamVjdCIsIkVudGl0eSIsInBhcmVudCIsIm1lc2hJbnN0YW5jZXMiLCJyZW5kZXIiLCJtb2RlbCIsIm5vZGVDb3VudHMiLCJhY3RpdmVOb2RlcyIsImhhbmRsZXJzIiwibG9jYWxQb3NpdGlvbiIsImZ1bmMiLCJzZXQiLCJjcmVhdGVBbmltVGFyZ2V0IiwibG9jYWxSb3RhdGlvbiIsImxvY2FsU2NhbGUiLCJ3ZWlnaHROYW1lIiwiaW5kZXhPZiIsInJlcGxhY2UiLCJOdW1iZXIiLCJzZXR0ZXJzIiwibW9ycGhJbnN0YW5jZSIsInNldFdlaWdodCIsInB1c2giLCJjYWxsU2V0dGVycyIsInRleHR1cmVOYW1lIiwibWVzaEluc3RhbmNlIiwidGV4dHVyZUFzc2V0IiwiYW5pbUNvbXBvbmVudCIsInN5c3RlbSIsImFwcCIsImFzc2V0cyIsImdldCIsInJlc291cmNlIiwidHlwZSIsIm1hdGVyaWFsIiwidXBkYXRlIiwiX2lzUGF0aEFjdGl2ZSIsInJvb3ROb2RlTmFtZXMiLCJlbnRpdHlQYXRoIiwiaiIsImN1cnJFbnRpdHlQYXRoIiwiZmluZE5vZGUiLCJmaW5kQnlQYXRoIiwic2xpY2UiLCJmYWxsYmFja0dyYXBoUGF0aCIsIkFuaW1CaW5kZXIiLCJlbmNvZGUiLCJwcm9wZXJ0eVBhdGgiLCJEZWJ1ZyIsIndhcm4iLCJpc0Zpbml0ZSIsInZhbHVlQ291bnQiLCJjb21wb25lbnRUeXBlIiwidGFyZ2V0UGF0aCIsIkFuaW1UYXJnZXQiLCJyZXNvbHZlIiwiZW5jb2RlZFBhdGgiLCJjb21wb25lbnQiLCJ0YXJnZXQiLCJoYW5kbGVyIiwidW5yZXNvbHZlIiwibGVuIiwicG9wIiwiZGVsdGFUaW1lIiwiX2RpcnRpZnlMb2NhbCIsImFzc2lnbk1hc2siLCJtYXNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBVUEsTUFBTUEsaUJBQWlCLENBQUM7RUFDcEJDLFdBQVcsQ0FBQ0MsS0FBSyxFQUFFO0FBQUEsSUFBQSxJQUFBLENBOEhuQkMsYUFBYSxHQUFHLENBQUNDLElBQUksRUFBRUMsY0FBYyxLQUFLO0FBQ3RDLE1BQUEsTUFBTUMsUUFBUSxHQUFHLElBQUksQ0FBQ0MsS0FBSyxDQUFDSCxJQUFJLENBQUMsQ0FBQTtNQUNqQyxJQUFJLENBQUNFLFFBQVEsRUFBRSxPQUFPLEtBQUssQ0FBQyxLQUN2QixJQUFJQSxRQUFRLENBQUNFLFFBQVEsSUFBS0gsY0FBYyxJQUFJQyxRQUFRLENBQUNHLEtBQUssS0FBSyxLQUFNLEVBQUUsT0FBTyxJQUFJLENBQUE7QUFDdkYsTUFBQSxPQUFPLEtBQUssQ0FBQTtLQUNmLENBQUE7SUFsSUcsSUFBSSxDQUFDUCxLQUFLLEdBQUdBLEtBQUssQ0FBQTtJQUVsQixJQUFJLENBQUNBLEtBQUssRUFBRSxPQUFBO0lBRVosSUFBSSxDQUFDSyxLQUFLLEdBQUcsSUFBSSxDQUFBO0lBRWpCLE1BQU1HLEtBQUssR0FBRyxFQUFHLENBQUE7QUFFakIsSUFBQSxNQUFNQyxPQUFPLEdBQUcsU0FBVkEsT0FBTyxDQUFhQyxJQUFJLEVBQUU7QUFDNUJGLE1BQUFBLEtBQUssQ0FBQ0UsSUFBSSxDQUFDQyxJQUFJLENBQUMsR0FB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
