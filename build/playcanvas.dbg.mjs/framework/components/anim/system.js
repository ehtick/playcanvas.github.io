/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { AnimTrack } from '../../anim/evaluator/anim-track.js';
import { Component } from '../component.js';
import { ComponentSystem } from '../system.js';
import { AnimComponent } from './component.js';
import { AnimComponentData } from './data.js';

const _schema = ['enabled'];

/**
 * The AnimComponentSystem manages creating and deleting AnimComponents.
 *
 * @augments ComponentSystem
 */
class AnimComponentSystem extends ComponentSystem {
  /**
   * Create an AnimComponentSystem instance.
   *
   * @param {import('../../app-base.js').AppBase} app - The application managing this system.
   * @hideconstructor
   */
  constructor(app) {
    super(app);
    this.id = 'anim';
    this.ComponentType = AnimComponent;
    this.DataType = AnimComponentData;
    this.schema = _schema;
    this.on('beforeremove', this.onBeforeRemove, this);
    this.app.systems.on('animationUpdate', this.onAnimationUpdate, this);
  }
  initializeComponentData(component, data, properties) {
    super.initializeComponentData(component, data, _schema);
    const complexProperties = ['animationAssets', 'stateGraph', 'layers', 'masks'];
    Object.keys(data).forEach(key => {
      // these properties will be initialized manually below
      if (complexProperties.includes(key)) return;
      component[key] = data[key];
    });
    if (data.stateGraph) {
      component.stateGraph = data.stateGraph;
      component.loadStateGraph(component.stateGraph);
    }
    if (data.layers) {
      data.layers.forEach((layer, i) => {
        layer._controller.states.forEach(stateKey => {
          layer._controller._states[stateKey]._animationList.forEach(node => {
            if (!node.animTrack || node.animTrack === AnimTrack.EMPTY) {
              const animationAsset = this.app.assets.get(layer._component._animationAssets[layer.name + ':' + node.name].asset);
              // If there is an animation asset that hasn't been loaded, assign it once it has loaded. If it is already loaded it will be assigned already.
              if (animationAsset && !animationAsset.loaded) {
                animationAsset.once('load', () => {
                  component.layers[i].assignAnimation(node.name, animationAsset.resource);
                });
              }
            } else {
              component.layers[i].assignAnimation(node.name, node.animTrack);
            }
          });
        });
      });
    } else if (data.animationAssets) {
      component.animationAssets = Object.assign(component.animationAssets, data.animationAssets);
    }
    if (data.masks) {
      Object.keys(data.masks).forEach(key => {
        if (component.layers[key]) {
          const maskData = data.masks[key].mask;
          const mask = {};
          Object.keys(maskData).forEach(maskKey => {
            mask[decodeURI(maskKey)] = maskData[maskKey];
          });
          component.layers[key].mask = mask;
        }
      });
    }
  }
  onAnimationUpdate(dt) {
    const components = this.store;
    for (const id in components) {
      if (components.hasOwnProperty(id)) {
        const component = components[id].entity.anim;
        const componentData = component.data;
        if (componentData.enabled && component.entity.enabled && component.playing) {
          component.update(dt);
        }
      }
    }
  }
  cloneComponent(entity, clone) {
    let masks;
    // If the component animaites from the components entity, any layer mask hierarchy should be updated from the old entity to the cloned entity.
    if (!entity.anim.rootBone || entity.anim.rootBone === entity) {
      masks = {};
      entity.anim.layers.forEach((layer, i) => {
        if (layer.mask) {
          const mask = {};
          Object.keys(layer.mask).forEach(path => {
            // The base of all mask paths should be mapped from the previous entity to the cloned entity
            const pathArr = path.split('/');
            pathArr.shift();
            const clonePath = [clone.name, ...pathArr].join('/');
            mask[clonePath] = layer.mask[path];
          });
          masks[i] = {
            mask
          };
        }
      });
    }
    const data = {
      stateGraphAsset: entity.anim.stateGraphAsset,
      animationAssets: entity.anim.animationAssets,
      speed: entity.anim.speed,
      activate: entity.anim.activate,
      playing: entity.anim.playing,
      rootBone: entity.anim.rootBone,
      stateGraph: entity.anim.stateGraph,
      layers: entity.anim.layers,
      layerIndices: entity.anim.layerIndices,
      parameters: entity.anim.parameters,
      normalizeWeights: entity.anim.normalizeWeights,
      masks
    };
    return this.addComponent(clone, data);
  }
  onBeforeRemove(entity, component) {
    component.onBeforeRemove();
  }
  destroy() {
    super.destroy();
    this.app.systems.off('animationUpdate', this.onAnimationUpdate, this);
  }
}
Component._buildAccessors(AnimComponent.prototype, _schema);

export { AnimComponentSystem };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvYW5pbS9zeXN0ZW0uanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQW5pbVRyYWNrIH0gZnJvbSAnLi4vLi4vYW5pbS9ldmFsdWF0b3IvYW5pbS10cmFjay5qcyc7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgQ29tcG9uZW50U3lzdGVtIH0gZnJvbSAnLi4vc3lzdGVtLmpzJztcblxuaW1wb3J0IHsgQW5pbUNvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IEFuaW1Db21wb25lbnREYXRhIH0gZnJvbSAnLi9kYXRhLmpzJztcblxuY29uc3QgX3NjaGVtYSA9IFtcbiAgICAnZW5hYmxlZCdcbl07XG5cbi8qKlxuICogVGhlIEFuaW1Db21wb25lbnRTeXN0ZW0gbWFuYWdlcyBjcmVhdGluZyBhbmQgZGVsZXRpbmcgQW5pbUNvbXBvbmVudHMuXG4gKlxuICogQGF1Z21lbnRzIENvbXBvbmVudFN5c3RlbVxuICovXG5jbGFzcyBBbmltQ29tcG9uZW50U3lzdGVtIGV4dGVuZHMgQ29tcG9uZW50U3lzdGVtIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW4gQW5pbUNvbXBvbmVudFN5c3RlbSBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi8uLi9hcHAtYmFzZS5qcycpLkFwcEJhc2V9IGFwcCAtIFRoZSBhcHBsaWNhdGlvbiBtYW5hZ2luZyB0aGlzIHN5c3RlbS5cbiAgICAgKiBAaGlkZWNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXBwKSB7XG4gICAgICAgIHN1cGVyKGFwcCk7XG5cbiAgICAgICAgdGhpcy5pZCA9ICdhbmltJztcblxuICAgICAgICB0aGlzLkNvbXBvbmVudFR5cGUgPSBBbmltQ29tcG9uZW50O1xuICAgICAgICB0aGlzLkRhdGFUeXBlID0gQW5pbUNvbXBvbmVudERhdGE7XG5cbiAgICAgICAgdGhpcy5zY2hlbWEgPSBfc2NoZW1hO1xuXG4gICAgICAgIHRoaXMub24oJ2JlZm9yZXJlbW92ZScsIHRoaXMub25CZWZvcmVSZW1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLmFwcC5zeXN0ZW1zLm9uKCdhbmltYXRpb25VcGRhdGUnLCB0aGlzLm9uQW5pbWF0aW9uVXBkYXRlLCB0aGlzKTtcbiAgICB9XG5cbiAgICBpbml0aWFsaXplQ29tcG9uZW50RGF0YShjb21wb25lbnQsIGRhdGEsIHByb3BlcnRpZXMpIHtcbiAgICAgICAgc3VwZXIuaW5pdGlhbGl6ZUNvbXBvbmVudERhdGEoY29tcG9uZW50LCBkYXRhLCBfc2NoZW1hKTtcbiAgICAgICAgY29uc3QgY29tcGxleFByb3BlcnRpZXMgPSBbJ2FuaW1hdGlvbkFzc2V0cycsICdzdGF0ZUdyYXBoJywgJ2xheWVycycsICdtYXNrcyddO1xuICAgICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIC8vIHRoZXNlIHByb3BlcnRpZXMgd2lsbCBiZSBpbml0aWFsaXplZCBtYW51YWxseSBiZWxvd1xuICAgICAgICAgICAgaWYgKGNvbXBsZXhQcm9wZXJ0aWVzLmluY2x1ZGVzKGtleSkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbXBvbmVudFtrZXldID0gZGF0YVtrZXldO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGRhdGEuc3RhdGVHcmFwaCkge1xuICAgICAgICAgICAgY29tcG9uZW50LnN0YXRlR3JhcGggPSBkYXRhLnN0YXRlR3JhcGg7XG4gICAgICAgICAgICBjb21wb25lbnQubG9hZFN0YXRlR3JhcGgoY29tcG9uZW50LnN0YXRlR3JhcGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhLmxheWVycykge1xuICAgICAgICAgICAgZGF0YS5sYXllcnMuZm9yRWFjaCgobGF5ZXIsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBsYXllci5fY29udHJvbGxlci5zdGF0ZXMuZm9yRWFjaCgoc3RhdGVLZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGF5ZXIuX2NvbnRyb2xsZXIuX3N0YXRlc1tzdGF0ZUtleV0uX2FuaW1hdGlvbkxpc3QuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFub2RlLmFuaW1UcmFjayB8fCBub2RlLmFuaW1UcmFjayA9PT0gQW5pbVRyYWNrLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5pbWF0aW9uQXNzZXQgPSB0aGlzLmFwcC5hc3NldHMuZ2V0KGxheWVyLl9jb21wb25lbnQuX2FuaW1hdGlvbkFzc2V0c1tsYXllci5uYW1lICsgJzonICsgbm9kZS5uYW1lXS5hc3NldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYW4gYW5pbWF0aW9uIGFzc2V0IHRoYXQgaGFzbid0IGJlZW4gbG9hZGVkLCBhc3NpZ24gaXQgb25jZSBpdCBoYXMgbG9hZGVkLiBJZiBpdCBpcyBhbHJlYWR5IGxvYWRlZCBpdCB3aWxsIGJlIGFzc2lnbmVkIGFscmVhZHkuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkFzc2V0ICYmICFhbmltYXRpb25Bc3NldC5sb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uQXNzZXQub25jZSgnbG9hZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5sYXllcnNbaV0uYXNzaWduQW5pbWF0aW9uKG5vZGUubmFtZSwgYW5pbWF0aW9uQXNzZXQucmVzb3VyY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5sYXllcnNbaV0uYXNzaWduQW5pbWF0aW9uKG5vZGUubmFtZSwgbm9kZS5hbmltVHJhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGEuYW5pbWF0aW9uQXNzZXRzKSB7XG4gICAgICAgICAgICBjb21wb25lbnQuYW5pbWF0aW9uQXNzZXRzID0gT2JqZWN0LmFzc2lnbihjb21wb25lbnQuYW5pbWF0aW9uQXNzZXRzLCBkYXRhLmFuaW1hdGlvbkFzc2V0cyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS5tYXNrcykge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoZGF0YS5tYXNrcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5sYXllcnNba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXNrRGF0YSA9IGRhdGEubWFza3Nba2V5XS5tYXNrO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXNrID0ge307XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKG1hc2tEYXRhKS5mb3JFYWNoKChtYXNrS2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrW2RlY29kZVVSSShtYXNrS2V5KV0gPSBtYXNrRGF0YVttYXNrS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5sYXllcnNba2V5XS5tYXNrID0gbWFzaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uQW5pbWF0aW9uVXBkYXRlKGR0KSB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSB0aGlzLnN0b3JlO1xuXG4gICAgICAgIGZvciAoY29uc3QgaWQgaW4gY29tcG9uZW50cykge1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudHMuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gY29tcG9uZW50c1tpZF0uZW50aXR5LmFuaW07XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50RGF0YSA9IGNvbXBvbmVudC5kYXRhO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudERhdGEuZW5hYmxlZCAmJiBjb21wb25lbnQuZW50aXR5LmVuYWJsZWQgJiYgY29tcG9uZW50LnBsYXlpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnVwZGF0ZShkdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvbmVDb21wb25lbnQoZW50aXR5LCBjbG9uZSkge1xuICAgICAgICBsZXQgbWFza3M7XG4gICAgICAgIC8vIElmIHRoZSBjb21wb25lbnQgYW5pbWFpdGVzIGZyb20gdGhlIGNvbXBvbmVudHMgZW50aXR5LCBhbnkgbGF5ZXIgbWFzayBoaWVyYXJjaHkgc2hvdWxkIGJlIHVwZGF0ZWQgZnJvbSB0aGUgb2xkIGVudGl0eSB0byB0aGUgY2xvbmVkIGVudGl0eS5cbiAgICAgICAgaWYgKCFlbnRpdHkuYW5pbS5yb290Qm9uZSB8fCBlbnRpdHkuYW5pbS5yb290Qm9uZSA9PT0gZW50aXR5KSB7XG4gICAgICAgICAgICBtYXNrcyA9IHt9O1xuICAgICAgICAgICAgZW50aXR5LmFuaW0ubGF5ZXJzLmZvckVhY2goKGxheWVyLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGxheWVyLm1hc2spIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWFzayA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhsYXllci5tYXNrKS5mb3JFYWNoKChwYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgYmFzZSBvZiBhbGwgbWFzayBwYXRocyBzaG91bGQgYmUgbWFwcGVkIGZyb20gdGhlIHByZXZpb3VzIGVudGl0eSB0byB0aGUgY2xvbmVkIGVudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aEFyciA9IHBhdGguc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhBcnIuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb25lUGF0aCA9IFtjbG9uZS5uYW1lLCAuLi5wYXRoQXJyXS5qb2luKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrW2Nsb25lUGF0aF0gPSBsYXllci5tYXNrW3BhdGhdO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbWFza3NbaV0gPSB7IG1hc2sgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgc3RhdGVHcmFwaEFzc2V0OiBlbnRpdHkuYW5pbS5zdGF0ZUdyYXBoQXNzZXQsXG4gICAgICAgICAgICBhbmltYXRpb25Bc3NldHM6IGVudGl0eS5hbmltLmFuaW1hdGlvbkFzc2V0cyxcbiAgICAgICAgICAgIHNwZWVkOiBlbnRpdHkuYW5pbS5zcGVlZCxcbiAgICAgICAgICAgIGFjdGl2YXRlOiBlbnRpdHkuYW5pbS5hY3RpdmF0ZSxcbiAgICAgICAgICAgIHBsYXlpbmc6IGVudGl0eS5hbmltLnBsYXlpbmcsXG4gICAgICAgICAgICByb290Qm9uZTogZW50aXR5LmFuaW0ucm9vdEJvbmUsXG4gICAgICAgICAgICBzdGF0ZUdyYXBoOiBlbnRpdHkuYW5pbS5zdGF0ZUdyYXBoLFxuICAgICAgICAgICAgbGF5ZXJzOiBlbnRpdHkuYW5pbS5sYXllcnMsXG4gICAgICAgICAgICBsYXllckluZGljZXM6IGVudGl0eS5hbmltLmxheWVySW5kaWNlcyxcbiAgICAgICAgICAgIHBhcmFtZXRlcnM6IGVudGl0eS5hbmltLnBhcmFtZXRlcnMsXG4gICAgICAgICAgICBub3JtYWxpemVXZWlnaHRzOiBlbnRpdHkuYW5pbS5ub3JtYWxpemVXZWlnaHRzLFxuICAgICAgICAgICAgbWFza3NcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkQ29tcG9uZW50KGNsb25lLCBkYXRhKTtcbiAgICB9XG5cbiAgICBvbkJlZm9yZVJlbW92ZShlbnRpdHksIGNvbXBvbmVudCkge1xuICAgICAgICBjb21wb25lbnQub25CZWZvcmVSZW1vdmUoKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBzdXBlci5kZXN0cm95KCk7XG5cbiAgICAgICAgdGhpcy5hcHAuc3lzdGVtcy5vZmYoJ2FuaW1hdGlvblVwZGF0ZScsIHRoaXMub25BbmltYXRpb25VcGRhdGUsIHRoaXMpO1xuICAgIH1cbn1cblxuQ29tcG9uZW50Ll9idWlsZEFjY2Vzc29ycyhBbmltQ29tcG9uZW50LnByb3RvdHlwZSwgX3NjaGVtYSk7XG5cbmV4cG9ydCB7IEFuaW1Db21wb25lbnRTeXN0ZW0gfTtcbiJdLCJuYW1lcyI6WyJfc2NoZW1hIiwiQW5pbUNvbXBvbmVudFN5c3RlbSIsIkNvbXBvbmVudFN5c3RlbSIsImNvbnN0cnVjdG9yIiwiYXBwIiwiaWQiLCJDb21wb25lbnRUeXBlIiwiQW5pbUNvbXBvbmVudCIsIkRhdGFUeXBlIiwiQW5pbUNvbXBvbmVudERhdGEiLCJzY2hlbWEiLCJvbiIsIm9uQmVmb3JlUmVtb3ZlIiwic3lzdGVtcyIsIm9uQW5pbWF0aW9uVXBkYXRlIiwiaW5pdGlhbGl6ZUNvbXBvbmVudERhdGEiLCJjb21wb25lbnQiLCJkYXRhIiwicHJvcGVydGllcyIsImNvbXBsZXhQcm9wZXJ0aWVzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJpbmNsdWRlcyIsInN0YXRlR3JhcGgiLCJsb2FkU3RhdGVHcmFwaCIsImxheWVycyIsImxheWVyIiwiaSIsIl9jb250cm9sbGVyIiwic3RhdGVzIiwic3RhdGVLZXkiLCJfc3RhdGVzIiwiX2FuaW1hdGlvbkxpc3QiLCJub2RlIiwiYW5pbVRyYWNrIiwiQW5pbVRyYWNrIiwiRU1QVFkiLCJhbmltYXRpb25Bc3NldCIsImFzc2V0cyIsImdldCIsIl9jb21wb25lbnQiLCJfYW5pbWF0aW9uQXNzZXRzIiwibmFtZSIsImFzc2V0IiwibG9hZGVkIiwib25jZSIsImFzc2lnbkFuaW1hdGlvbiIsInJlc291cmNlIiwiYW5pbWF0aW9uQXNzZXRzIiwiYXNzaWduIiwibWFza3MiLCJtYXNrRGF0YSIsIm1hc2siLCJtYXNrS2V5IiwiZGVjb2RlVVJJIiwiZHQiLCJjb21wb25lbnRzIiwic3RvcmUiLCJoYXNPd25Qcm9wZXJ0eSIsImVudGl0eSIsImFuaW0iLCJjb21wb25lbnREYXRhIiwiZW5hYmxlZCIsInBsYXlpbmciLCJ1cGRhdGUiLCJjbG9uZUNvbXBvbmVudCIsImNsb25lIiwicm9vdEJvbmUiLCJwYXRoIiwicGF0aEFyciIsInNwbGl0Iiwic2hpZnQiLCJjbG9uZVBhdGgiLCJqb2luIiwic3RhdGVHcmFwaEFzc2V0Iiwic3BlZWQiLCJhY3RpdmF0ZSIsImxheWVySW5kaWNlcyIsInBhcmFtZXRlcnMiLCJub3JtYWxpemVXZWlnaHRzIiwiYWRkQ29tcG9uZW50IiwiZGVzdHJveSIsIm9mZiIsIkNvbXBvbmVudCIsIl9idWlsZEFjY2Vzc29ycyIsInByb3RvdHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFPQSxNQUFNQSxPQUFPLEdBQUcsQ0FDWixTQUFTLENBQ1osQ0FBQTs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsbUJBQW1CLFNBQVNDLGVBQWUsQ0FBQztBQUM5QztBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDSUMsV0FBV0EsQ0FB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
