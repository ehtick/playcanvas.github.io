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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvYW5pbS9zeXN0ZW0uanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQW5pbVRyYWNrIH0gZnJvbSAnLi4vLi4vYW5pbS9ldmFsdWF0b3IvYW5pbS10cmFjay5qcyc7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgQ29tcG9uZW50U3lzdGVtIH0gZnJvbSAnLi4vc3lzdGVtLmpzJztcblxuaW1wb3J0IHsgQW5pbUNvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IEFuaW1Db21wb25lbnREYXRhIH0gZnJvbSAnLi9kYXRhLmpzJztcblxuY29uc3QgX3NjaGVtYSA9IFtcbiAgICAnZW5hYmxlZCdcbl07XG5cbi8qKlxuICogVGhlIEFuaW1Db21wb25lbnRTeXN0ZW0gbWFuYWdlcyBjcmVhdGluZyBhbmQgZGVsZXRpbmcgQW5pbUNvbXBvbmVudHMuXG4gKlxuICogQGF1Z21lbnRzIENvbXBvbmVudFN5c3RlbVxuICovXG5jbGFzcyBBbmltQ29tcG9uZW50U3lzdGVtIGV4dGVuZHMgQ29tcG9uZW50U3lzdGVtIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW4gQW5pbUNvbXBvbmVudFN5c3RlbSBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi8uLi9hcHAtYmFzZS5qcycpLkFwcEJhc2V9IGFwcCAtIFRoZSBhcHBsaWNhdGlvbiBtYW5hZ2luZyB0aGlzIHN5c3RlbS5cbiAgICAgKiBAaGlkZWNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXBwKSB7XG4gICAgICAgIHN1cGVyKGFwcCk7XG5cbiAgICAgICAgdGhpcy5pZCA9ICdhbmltJztcblxuICAgICAgICB0aGlzLkNvbXBvbmVudFR5cGUgPSBBbmltQ29tcG9uZW50O1xuICAgICAgICB0aGlzLkRhdGFUeXBlID0gQW5pbUNvbXBvbmVudERhdGE7XG5cbiAgICAgICAgdGhpcy5zY2hlbWEgPSBfc2NoZW1hO1xuXG4gICAgICAgIHRoaXMub24oJ2JlZm9yZXJlbW92ZScsIHRoaXMub25CZWZvcmVSZW1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLmFwcC5zeXN0ZW1zLm9uKCdhbmltYXRpb25VcGRhdGUnLCB0aGlzLm9uQW5pbWF0aW9uVXBkYXRlLCB0aGlzKTtcbiAgICB9XG5cbiAgICBpbml0aWFsaXplQ29tcG9uZW50RGF0YShjb21wb25lbnQsIGRhdGEsIHByb3BlcnRpZXMpIHtcbiAgICAgICAgc3VwZXIuaW5pdGlhbGl6ZUNvbXBvbmVudERhdGEoY29tcG9uZW50LCBkYXRhLCBfc2NoZW1hKTtcbiAgICAgICAgY29uc3QgY29tcGxleFByb3BlcnRpZXMgPSBbJ2FuaW1hdGlvbkFzc2V0cycsICdzdGF0ZUdyYXBoJywgJ2xheWVycycsICdtYXNrcyddO1xuICAgICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIC8vIHRoZXNlIHByb3BlcnRpZXMgd2lsbCBiZSBpbml0aWFsaXplZCBtYW51YWxseSBiZWxvd1xuICAgICAgICAgICAgaWYgKGNvbXBsZXhQcm9wZXJ0aWVzLmluY2x1ZGVzKGtleSkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbXBvbmVudFtrZXldID0gZGF0YVtrZXldO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGRhdGEuc3RhdGVHcmFwaCkge1xuICAgICAgICAgICAgY29tcG9uZW50LnN0YXRlR3JhcGggPSBkYXRhLnN0YXRlR3JhcGg7XG4gICAgICAgICAgICBjb21wb25lbnQubG9hZFN0YXRlR3JhcGgoY29tcG9uZW50LnN0YXRlR3JhcGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhLmxheWVycykge1xuICAgICAgICAgICAgZGF0YS5sYXllcnMuZm9yRWFjaCgobGF5ZXIsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBsYXllci5fY29udHJvbGxlci5zdGF0ZXMuZm9yRWFjaCgoc3RhdGVLZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGF5ZXIuX2NvbnRyb2xsZXIuX3N0YXRlc1tzdGF0ZUtleV0uX2FuaW1hdGlvbkxpc3QuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFub2RlLmFuaW1UcmFjayB8fCBub2RlLmFuaW1UcmFjayA9PT0gQW5pbVRyYWNrLkVNUFRZKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5pbWF0aW9uQXNzZXQgPSB0aGlzLmFwcC5hc3NldHMuZ2V0KGxheWVyLl9jb21wb25lbnQuX2FuaW1hdGlvbkFzc2V0c1tsYXllci5uYW1lICsgJzonICsgbm9kZS5uYW1lXS5hc3NldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYW4gYW5pbWF0aW9uIGFzc2V0IHRoYXQgaGFzbid0IGJlZW4gbG9hZGVkLCBhc3NpZ24gaXQgb25jZSBpdCBoYXMgbG9hZGVkLiBJZiBpdCBpcyBhbHJlYWR5IGxvYWRlZCBpdCB3aWxsIGJlIGFzc2lnbmVkIGFscmVhZHkuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkFzc2V0ICYmICFhbmltYXRpb25Bc3NldC5sb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uQXNzZXQub25jZSgnbG9hZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5sYXllcnNbaV0uYXNzaWduQW5pbWF0aW9uKG5vZGUubmFtZSwgYW5pbWF0aW9uQXNzZXQucmVzb3VyY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5sYXllcnNbaV0uYXNzaWduQW5pbWF0aW9uKG5vZGUubmFtZSwgbm9kZS5hbmltVHJhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGEuYW5pbWF0aW9uQXNzZXRzKSB7XG4gICAgICAgICAgICBjb21wb25lbnQuYW5pbWF0aW9uQXNzZXRzID0gT2JqZWN0LmFzc2lnbihjb21wb25lbnQuYW5pbWF0aW9uQXNzZXRzLCBkYXRhLmFuaW1hdGlvbkFzc2V0cyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS5tYXNrcykge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoZGF0YS5tYXNrcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5sYXllcnNba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXNrRGF0YSA9IGRhdGEubWFza3Nba2V5XS5tYXNrO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXNrID0ge307XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKG1hc2tEYXRhKS5mb3JFYWNoKChtYXNrS2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrW2RlY29kZVVSSShtYXNrS2V5KV0gPSBtYXNrRGF0YVttYXNrS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5sYXllcnNba2V5XS5tYXNrID0gbWFzaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uQW5pbWF0aW9uVXBkYXRlKGR0KSB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSB0aGlzLnN0b3JlO1xuXG4gICAgICAgIGZvciAoY29uc3QgaWQgaW4gY29tcG9uZW50cykge1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudHMuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gY29tcG9uZW50c1tpZF0uZW50aXR5LmFuaW07XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50RGF0YSA9IGNvbXBvbmVudC5kYXRhO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudERhdGEuZW5hYmxlZCAmJiBjb21wb25lbnQuZW50aXR5LmVuYWJsZWQgJiYgY29tcG9uZW50LnBsYXlpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnVwZGF0ZShkdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvbmVDb21wb25lbnQoZW50aXR5LCBjbG9uZSkge1xuICAgICAgICBsZXQgbWFza3M7XG4gICAgICAgIC8vIElmIHRoZSBjb21wb25lbnQgYW5pbWFpdGVzIGZyb20gdGhlIGNvbXBvbmVudHMgZW50aXR5LCBhbnkgbGF5ZXIgbWFzayBoaWVyYXJjaHkgc2hvdWxkIGJlIHVwZGF0ZWQgZnJvbSB0aGUgb2xkIGVudGl0eSB0byB0aGUgY2xvbmVkIGVudGl0eS5cbiAgICAgICAgaWYgKCFlbnRpdHkuYW5pbS5yb290Qm9uZSB8fCBlbnRpdHkuYW5pbS5yb290Qm9uZSA9PT0gZW50aXR5KSB7XG4gICAgICAgICAgICBtYXNrcyA9IHt9O1xuICAgICAgICAgICAgZW50aXR5LmFuaW0ubGF5ZXJzLmZvckVhY2goKGxheWVyLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGxheWVyLm1hc2spIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWFzayA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhsYXllci5tYXNrKS5mb3JFYWNoKChwYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgYmFzZSBvZiBhbGwgbWFzayBwYXRocyBzaG91bGQgYmUgbWFwcGVkIGZyb20gdGhlIHByZXZpb3VzIGVudGl0eSB0byB0aGUgY2xvbmVkIGVudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aEFyciA9IHBhdGguc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhBcnIuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb25lUGF0aCA9IFtjbG9uZS5uYW1lLCAuLi5wYXRoQXJyXS5qb2luKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrW2Nsb25lUGF0aF0gPSBsYXllci5tYXNrW3BhdGhdO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbWFza3NbaV0gPSB7IG1hc2sgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgc3RhdGVHcmFwaEFzc2V0OiBlbnRpdHkuYW5pbS5zdGF0ZUdyYXBoQXNzZXQsXG4gICAgICAgICAgICBhbmltYXRpb25Bc3NldHM6IGVudGl0eS5hbmltLmFuaW1hdGlvbkFzc2V0cyxcbiAgICAgICAgICAgIHNwZWVkOiBlbnRpdHkuYW5pbS5zcGVlZCxcbiAgICAgICAgICAgIGFjdGl2YXRlOiBlbnRpdHkuYW5pbS5hY3RpdmF0ZSxcbiAgICAgICAgICAgIHBsYXlpbmc6IGVudGl0eS5hbmltLnBsYXlpbmcsXG4gICAgICAgICAgICByb290Qm9uZTogZW50aXR5LmFuaW0ucm9vdEJvbmUsXG4gICAgICAgICAgICBzdGF0ZUdyYXBoOiBlbnRpdHkuYW5pbS5zdGF0ZUdyYXBoLFxuICAgICAgICAgICAgbGF5ZXJzOiBlbnRpdHkuYW5pbS5sYXllcnMsXG4gICAgICAgICAgICBsYXllckluZGljZXM6IGVudGl0eS5hbmltLmxheWVySW5kaWNlcyxcbiAgICAgICAgICAgIHBhcmFtZXRlcnM6IGVudGl0eS5hbmltLnBhcmFtZXRlcnMsXG4gICAgICAgICAgICBub3JtYWxpemVXZWlnaHRzOiBlbnRpdHkuYW5pbS5ub3JtYWxpemVXZWlnaHRzLFxuICAgICAgICAgICAgbWFza3NcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkQ29tcG9uZW50KGNsb25lLCBkYXRhKTtcbiAgICB9XG5cbiAgICBvbkJlZm9yZVJlbW92ZShlbnRpdHksIGNvbXBvbmVudCkge1xuICAgICAgICBjb21wb25lbnQub25CZWZvcmVSZW1vdmUoKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBzdXBlci5kZXN0cm95KCk7XG5cbiAgICAgICAgdGhpcy5hcHAuc3lzdGVtcy5vZmYoJ2FuaW1hdGlvblVwZGF0ZScsIHRoaXMub25BbmltYXRpb25VcGRhdGUsIHRoaXMpO1xuICAgIH1cbn1cblxuQ29tcG9uZW50Ll9idWlsZEFjY2Vzc29ycyhBbmltQ29tcG9uZW50LnByb3RvdHlwZSwgX3NjaGVtYSk7XG5cbmV4cG9ydCB7IEFuaW1Db21wb25lbnRTeXN0ZW0gfTtcbiJdLCJuYW1lcyI6WyJfc2NoZW1hIiwiQW5pbUNvbXBvbmVudFN5c3RlbSIsIkNvbXBvbmVudFN5c3RlbSIsImNvbnN0cnVjdG9yIiwiYXBwIiwiaWQiLCJDb21wb25lbnRUeXBlIiwiQW5pbUNvbXBvbmVudCIsIkRhdGFUeXBlIiwiQW5pbUNvbXBvbmVudERhdGEiLCJzY2hlbWEiLCJvbiIsIm9uQmVmb3JlUmVtb3ZlIiwic3lzdGVtcyIsIm9uQW5pbWF0aW9uVXBkYXRlIiwiaW5pdGlhbGl6ZUNvbXBvbmVudERhdGEiLCJjb21wb25lbnQiLCJkYXRhIiwicHJvcGVydGllcyIsImNvbXBsZXhQcm9wZXJ0aWVzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJpbmNsdWRlcyIsInN0YXRlR3JhcGgiLCJsb2FkU3RhdGVHcmFwaCIsImxheWVycyIsImxheWVyIiwiaSIsIl9jb250cm9sbGVyIiwic3RhdGVzIiwic3RhdGVLZXkiLCJfc3RhdGVzIiwiX2FuaW1hdGlvbkxpc3QiLCJub2RlIiwiYW5pbVRyYWNrIiwiQW5pbVRyYWNrIiwiRU1QVFkiLCJhbmltYXRpb25Bc3NldCIsImFzc2V0cyIsImdldCIsIl9jb21wb25lbnQiLCJfYW5pbWF0aW9uQXNzZXRzIiwibmFtZSIsImFzc2V0IiwibG9hZGVkIiwib25jZSIsImFzc2lnbkFuaW1hdGlvbiIsInJlc291cmNlIiwiYW5pbWF0aW9uQXNzZXRzIiwiYXNzaWduIiwibWFza3MiLCJtYXNrRGF0YSIsIm1hc2siLCJtYXNrS2V5IiwiZGVjb2RlVVJJIiwiZHQiLCJjb21wb25lbnRzIiwic3RvcmUiLCJoYXNPd25Qcm9wZXJ0eSIsImVudGl0eSIsImFuaW0iLCJjb21wb25lbnREYXRhIiwiZW5hYmxlZCIsInBsYXlpbmciLCJ1cGRhdGUiLCJjbG9uZUNvbXBvbmVudCIsImNsb25lIiwicm9vdEJvbmUiLCJwYXRoIiwicGF0aEFyciIsInNwbGl0Iiwic2hpZnQiLCJjbG9uZVBhdGgiLCJqb2luIiwic3RhdGVHcmFwaEFzc2V0Iiwic3BlZWQiLCJhY3RpdmF0ZSIsImxheWVySW5kaWNlcyIsInBhcmFtZXRlcnMiLCJub3JtYWxpemVXZWlnaHRzIiwiYWRkQ29tcG9uZW50IiwiZGVzdHJveSIsIm9mZiIsIkNvbXBvbmVudCIsIl9idWlsZEFjY2Vzc29ycyIsInByb3RvdHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBT0EsTUFBTUEsT0FBTyxHQUFHLENBQ1osU0FBUyxDQUNaLENBQUE7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLG1CQUFtQixTQUFTQyxlQUFlLENBQUM7QUFDOUM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0lDLFdBQVdBLENBQUNDLEdB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
