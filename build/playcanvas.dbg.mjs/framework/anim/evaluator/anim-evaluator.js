/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { AnimTargetValue } from './anim-target-value.js';
import { AnimBlend } from './anim-blend.js';

class AnimEvaluator {
  constructor(binder) {
    this._binder = binder;
    this._clips = [];
    this._inputs = [];
    this._outputs = [];
    this._targets = {};
  }

  get clips() {
    return this._clips;
  }

  addClip(clip) {
    const targets = this._targets;
    const binder = this._binder;

    const curves = clip.track.curves;
    const snapshot = clip.snapshot;
    const inputs = [];
    const outputs = [];
    for (let i = 0; i < curves.length; ++i) {
      const curve = curves[i];
      const paths = curve.paths;
      for (let j = 0; j < paths.length; ++j) {
        const path = paths[j];
        const resolved = binder.resolve(path);
        let target = targets[resolved && resolved.targetPath || null];

        if (!target && resolved) {
          target = {
            target: resolved,
            value: [],
            curves: 0,
            blendCounter: 0
          };

          for (let k = 0; k < target.target.components; ++k) {
            target.value.push(0);
          }
          targets[resolved.targetPath] = target;
          if (binder.animComponent) {
            if (!binder.animComponent.targets[resolved.targetPath]) {
              let type;
              if (resolved.targetPath.substring(resolved.targetPath.length - 13) === 'localRotation') {
                type = AnimTargetValue.TYPE_QUAT;
              } else {
                type = AnimTargetValue.TYPE_VEC3;
              }
              binder.animComponent.targets[resolved.targetPath] = new AnimTargetValue(binder.animComponent, type);
            }
            binder.animComponent.targets[resolved.targetPath].layerCounter++;
            binder.animComponent.targets[resolved.targetPath].setMask(binder.layerIndex, 1);
          }
        }

        if (target) {
          target.curves++;
          inputs.push(snapshot._results[i]);
          outputs.push(target);
        }
      }
    }
    this._clips.push(clip);
    this._inputs.push(inputs);
    this._outputs.push(outputs);
  }

  removeClip(index) {
    const targets = this._targets;
    const binder = this._binder;
    const clips = this._clips;
    const clip = clips[index];
    const curves = clip.track.curves;
    for (let i = 0; i < curves.length; ++i) {
      const curve = curves[i];
      const paths = curve.paths;
      for (let j = 0; j < paths.length; ++j) {
        const path = paths[j];
        const target = this._binder.resolve(path);
        if (target) {
          target.curves--;
          if (target.curves === 0) {
            binder.unresolve(path);
            delete targets[target.targetPath];
            if (binder.animComponent) {
              binder.animComponent.targets[target.targetPath].layerCounter--;
            }
          }
        }
      }
    }
    clips.splice(index, 1);
    this._inputs.splice(index, 1);
    this._outputs.splice(index, 1);
  }

  removeClips() {
    while (this._clips.length > 0) {
      this.removeClip(0);
    }
  }

  findClip(name) {
    const clips = this._clips;
    for (let i = 0; i < clips.length; ++i) {
      const clip = clips[i];
      if (clip.name === name) {
        return clip;
      }
    }
    return null;
  }
  rebind() {
    this._binder.rebind();
    this._targets = {};
    const clips = [...this.clips];
    this.removeClips();
    clips.forEach(clip => {
      this.addClip(clip);
    });
  }
  assignMask(mask) {
    return this._binder.assignMask(mask);
  }

  update(deltaTime) {
    const clips = this._clips;

    const order = clips.map(function (c, i) {
      return i;
    });
    AnimBlend.stableSort(order, function (a, b) {
      return clips[a].blendOrder < clips[b].blendOrder;
    });
    for (let i = 0; i < order.length; ++i) {
      const index = order[i];
      const clip = clips[index];
      const inputs = this._inputs[index];
      const outputs = this._outputs[index];
      const blendWeight = clip.blendWeight;

      if (blendWeight > 0.0) {
        clip._update(deltaTime);
      }
      let input;
      let output;
      let value;
      if (blendWeight >= 1.0) {
        for (let j = 0; j < inputs.length; ++j) {
          input = inputs[j];
          output = outputs[j];
          value = output.value;
          AnimBlend.set(value, input, output.target.type);
          output.blendCounter++;
        }
      } else if (blendWeight > 0.0) {
        for (let j = 0; j < inputs.length; ++j) {
          input = inputs[j];
          output = outputs[j];
          value = output.value;
          if (output.blendCounter === 0) {
            AnimBlend.set(value, input, output.target.type);
          } else {
            AnimBlend.blend(value, input, blendWeight, output.target.type);
          }
          output.blendCounter++;
        }
      }
    }

    const targets = this._targets;
    const binder = this._binder;
    for (const path in targets) {
      if (targets.hasOwnProperty(path)) {
        const target = targets[path];
        if (binder.animComponent && target.target.isTransform) {
          const animTarget = binder.animComponent.targets[path];
          if (animTarget.counter === animTarget.layerCounter) {
            animTarget.counter = 0;
          }
          if (!animTarget.path) {
            animTarget.path = path;
            animTarget.baseValue = target.target.get();
            animTarget.setter = target.target.set;
          }
          animTarget.updateValue(binder.layerIndex, target.value);
          animTarget.counter++;
        } else {
          target.target.set(target.value);
        }
        target.blendCounter = 0;
      }
    }

    binder.update(deltaTime);
  }
}

export { AnimEvaluator };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbS1ldmFsdWF0b3IuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvYW5pbS9ldmFsdWF0b3IvYW5pbS1ldmFsdWF0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQW5pbVRhcmdldFZhbHVlIH0gZnJvbSAnLi9hbmltLXRhcmdldC12YWx1ZS5qcyc7XG5pbXBvcnQgeyBBbmltQmxlbmQgfSBmcm9tICcuL2FuaW0tYmxlbmQuanMnO1xuXG4vKipcbiAqIEFuaW1FdmFsdWF0b3IgYmxlbmRzIG11bHRpcGxlIHNldHMgb2YgYW5pbWF0aW9uIGNsaXBzIHRvZ2V0aGVyLlxuICpcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgQW5pbUV2YWx1YXRvciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGFuaW1hdGlvbiBldmFsdWF0b3IuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vYmluZGVyL2FuaW0tYmluZGVyLmpzJykuQW5pbUJpbmRlcn0gYmluZGVyIC0gaW50ZXJmYWNlIHJlc29sdmVzIGN1cnZlXG4gICAgICogcGF0aHMgdG8gaW5zdGFuY2VzIG9mIHtAbGluayBBbmltVGFyZ2V0fS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihiaW5kZXIpIHtcbiAgICAgICAgdGhpcy5fYmluZGVyID0gYmluZGVyO1xuICAgICAgICB0aGlzLl9jbGlwcyA9IFtdO1xuICAgICAgICB0aGlzLl9pbnB1dHMgPSBbXTtcbiAgICAgICAgdGhpcy5fb3V0cHV0cyA9IFtdO1xuICAgICAgICB0aGlzLl90YXJnZXRzID0ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGxpc3Qgb2YgYW5pbWF0aW9uIGNsaXBzLlxuICAgICAqXG4gICAgICogQHR5cGUge2ltcG9ydCgnLi9hbmltLWNsaXAuanMnKS5BbmltQ2xpcFtdfVxuICAgICAqL1xuICAgIGdldCBjbGlwcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NsaXBzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIGNsaXAgdG8gdGhlIGV2YWx1YXRvci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuL2FuaW0tY2xpcC5qcycpLkFuaW1DbGlwfSBjbGlwIC0gVGhlIGNsaXAgdG8gYWRkIHRvIHRoZSBldmFsdWF0b3IuXG4gICAgICovXG4gICAgYWRkQ2xpcChjbGlwKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSB0aGlzLl90YXJnZXRzO1xuICAgICAgICBjb25zdCBiaW5kZXIgPSB0aGlzLl9iaW5kZXI7XG5cbiAgICAgICAgLy8gc3RvcmUgbGlzdCBvZiBpbnB1dC9vdXRwdXQgYXJyYXlzXG4gICAgICAgIGNvbnN0IGN1cnZlcyA9IGNsaXAudHJhY2suY3VydmVzO1xuICAgICAgICBjb25zdCBzbmFwc2hvdCA9IGNsaXAuc25hcHNob3Q7XG4gICAgICAgIGNvbnN0IGlucHV0cyA9IFtdO1xuICAgICAgICBjb25zdCBvdXRwdXRzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3VydmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJ2ZSA9IGN1cnZlc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IHBhdGhzID0gY3VydmUucGF0aHM7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhdGhzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGF0aCA9IHBhdGhzW2pdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkID0gYmluZGVyLnJlc29sdmUocGF0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IHRhcmdldHNbcmVzb2x2ZWQgJiYgcmVzb2x2ZWQudGFyZ2V0UGF0aCB8fCBudWxsXTtcblxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgdGFyZ2V0IGlmIGl0IGRvZXNuJ3QgZXhpc3QgeWV0XG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXQgJiYgcmVzb2x2ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiByZXNvbHZlZCwgICAgICAgICAgIC8vIHJlc29sdmVkIHRhcmdldCBpbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFtdLCAgICAgICAgICAgICAgICAgIC8vIHN0b3JhZ2UgZm9yIGNhbGN1bGF0ZWQgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnZlczogMCwgICAgICAgICAgICAgICAgICAvLyBudW1iZXIgb2YgY3VydmVzIGRyaXZpbmcgdGhpcyB0YXJnZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsZW5kQ291bnRlcjogMCAgICAgICAgICAgICAvLyBwZXItZnJhbWUgbnVtYmVyIG9mIGJsZW5kcyAodXNlZCB0byBpZGVudGlmeSBmaXJzdCBibGVuZClcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHRhcmdldC50YXJnZXQuY29tcG9uZW50czsgKytrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQudmFsdWUucHVzaCgwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldHNbcmVzb2x2ZWQudGFyZ2V0UGF0aF0gPSB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiaW5kZXIuYW5pbUNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFiaW5kZXIuYW5pbUNvbXBvbmVudC50YXJnZXRzW3Jlc29sdmVkLnRhcmdldFBhdGhdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc29sdmVkLnRhcmdldFBhdGguc3Vic3RyaW5nKHJlc29sdmVkLnRhcmdldFBhdGgubGVuZ3RoIC0gMTMpID09PSAnbG9jYWxSb3RhdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9IEFuaW1UYXJnZXRWYWx1ZS5UWVBFX1FVQVQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9IEFuaW1UYXJnZXRWYWx1ZS5UWVBFX1ZFQzM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRlci5hbmltQ29tcG9uZW50LnRhcmdldHNbcmVzb2x2ZWQudGFyZ2V0UGF0aF0gPSBuZXcgQW5pbVRhcmdldFZhbHVlKGJpbmRlci5hbmltQ29tcG9uZW50LCB0eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRlci5hbmltQ29tcG9uZW50LnRhcmdldHNbcmVzb2x2ZWQudGFyZ2V0UGF0aF0ubGF5ZXJDb3VudGVyKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kZXIuYW5pbUNvbXBvbmVudC50YXJnZXRzW3Jlc29sdmVkLnRhcmdldFBhdGhdLnNldE1hc2soYmluZGVyLmxheWVySW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gYmluZGluZyBtYXkgaGF2ZSBmYWlsZWRcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBpdCBtYXkgYmUgd29ydGggc3RvcmluZyBxdWF0ZXJuaW9ucyBhbmQgdmVjdG9yIHRhcmdldHMgaW4gc2VwYXJhdGVcbiAgICAgICAgICAgICAgICAvLyBsaXN0cy4gdGhpcyB3YXkgdGhlIHVwZGF0ZSBjb2RlIHdvbid0IGJlIGZvcmNlZCB0byBjaGVjayB0YXJnZXQgdHlwZSBiZWZvcmVcbiAgICAgICAgICAgICAgICAvLyBzZXR0aW5nL2JsZW5kaW5nIGVhY2ggdGFyZ2V0LlxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmN1cnZlcysrO1xuICAgICAgICAgICAgICAgICAgICBpbnB1dHMucHVzaChzbmFwc2hvdC5fcmVzdWx0c1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dHMucHVzaCh0YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NsaXBzLnB1c2goY2xpcCk7XG4gICAgICAgIHRoaXMuX2lucHV0cy5wdXNoKGlucHV0cyk7XG4gICAgICAgIHRoaXMuX291dHB1dHMucHVzaChvdXRwdXRzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSBjbGlwIGZyb20gdGhlIGV2YWx1YXRvci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIEluZGV4IG9mIHRoZSBjbGlwIHRvIHJlbW92ZS5cbiAgICAgKi9cbiAgICByZW1vdmVDbGlwKGluZGV4KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSB0aGlzLl90YXJnZXRzO1xuICAgICAgICBjb25zdCBiaW5kZXIgPSB0aGlzLl9iaW5kZXI7XG5cbiAgICAgICAgY29uc3QgY2xpcHMgPSB0aGlzLl9jbGlwcztcbiAgICAgICAgY29uc3QgY2xpcCA9IGNsaXBzW2luZGV4XTtcbiAgICAgICAgY29uc3QgY3VydmVzID0gY2xpcC50cmFjay5jdXJ2ZXM7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjdXJ2ZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnZlID0gY3VydmVzW2ldO1xuICAgICAgICAgICAgY29uc3QgcGF0aHMgPSBjdXJ2ZS5wYXRocztcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGF0aHMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoID0gcGF0aHNbal07XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLl9iaW5kZXIucmVzb2x2ZShwYXRoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmN1cnZlcy0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0LmN1cnZlcyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmluZGVyLnVucmVzb2x2ZShwYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0YXJnZXRzW3RhcmdldC50YXJnZXRQYXRoXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kZXIuYW5pbUNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRlci5hbmltQ29tcG9uZW50LnRhcmdldHNbdGFyZ2V0LnRhcmdldFBhdGhdLmxheWVyQ291bnRlci0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2xpcHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5faW5wdXRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMuX291dHB1dHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYWxsIGNsaXBzIGZyb20gdGhlIGV2YWx1YXRvci5cbiAgICAgKi9cbiAgICByZW1vdmVDbGlwcygpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuX2NsaXBzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xpcCgwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGZpcnN0IGNsaXAgd2hpY2ggbWF0Y2hlcyB0aGUgZ2l2ZW4gbmFtZSwgb3IgbnVsbCBpZiBubyBzdWNoIGNsaXAgd2FzIGZvdW5kLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIHRoZSBjbGlwIHRvIGZpbmQuXG4gICAgICogQHJldHVybnMge2ltcG9ydCgnLi9hbmltLWNsaXAuanMnKS5BbmltQ2xpcHxudWxsfSAtIFRoZSBjbGlwIHdpdGggdGhlIGdpdmVuIG5hbWUgb3IgbnVsbCBpZiBubyBzdWNoIGNsaXAgd2FzIGZvdW5kLlxuICAgICAqL1xuICAgIGZpbmRDbGlwKG5hbWUpIHtcbiAgICAgICAgY29uc3QgY2xpcHMgPSB0aGlzLl9jbGlwcztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGlwcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgY2xpcCA9IGNsaXBzW2ldO1xuICAgICAgICAgICAgaWYgKGNsaXAubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjbGlwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJlYmluZCgpIHtcbiAgICAgICAgdGhpcy5fYmluZGVyLnJlYmluZCgpO1xuICAgICAgICB0aGlzLl90YXJnZXRzID0ge307XG4gICAgICAgIGNvbnN0IGNsaXBzID0gWy4uLnRoaXMuY2xpcHNdO1xuICAgICAgICB0aGlzLnJlbW92ZUNsaXBzKCk7XG4gICAgICAgIGNsaXBzLmZvckVhY2goKGNsaXApID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2xpcChjbGlwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXNzaWduTWFzayhtYXNrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9iaW5kZXIuYXNzaWduTWFzayhtYXNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFdmFsdWF0b3IgZnJhbWUgdXBkYXRlIGZ1bmN0aW9uLiBBbGwgdGhlIGF0dGFjaGVkIHtAbGluayBBbmltQ2xpcH1zIGFyZSBldmFsdWF0ZWQsIGJsZW5kZWRcbiAgICAgKiBhbmQgdGhlIHJlc3VsdHMgc2V0IG9uIHRoZSB7QGxpbmsgQW5pbVRhcmdldH0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGVsdGFUaW1lIC0gVGhlIGFtb3VudCBvZiB0aW1lIHRoYXQgaGFzIHBhc3NlZCBzaW5jZSB0aGUgbGFzdCB1cGRhdGUsIGluXG4gICAgICogc2Vjb25kcy5cbiAgICAgKi9cbiAgICB1cGRhdGUoZGVsdGFUaW1lKSB7XG4gICAgICAgIC8vIGNvcHkgY2xpcHNcbiAgICAgICAgY29uc3QgY2xpcHMgPSB0aGlzLl9jbGlwcztcblxuICAgICAgICAvLyBzdGFibGUgc29ydCBvcmRlclxuICAgICAgICBjb25zdCBvcmRlciA9IGNsaXBzLm1hcChmdW5jdGlvbiAoYywgaSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH0pO1xuICAgICAgICBBbmltQmxlbmQuc3RhYmxlU29ydChvcmRlciwgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGlwc1thXS5ibGVuZE9yZGVyIDwgY2xpcHNbYl0uYmxlbmRPcmRlcjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlci5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBvcmRlcltpXTtcbiAgICAgICAgICAgIGNvbnN0IGNsaXAgPSBjbGlwc1tpbmRleF07XG4gICAgICAgICAgICBjb25zdCBpbnB1dHMgPSB0aGlzLl9pbnB1dHNbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3Qgb3V0cHV0cyA9IHRoaXMuX291dHB1dHNbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgYmxlbmRXZWlnaHQgPSBjbGlwLmJsZW5kV2VpZ2h0O1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgY2xpcFxuICAgICAgICAgICAgaWYgKGJsZW5kV2VpZ2h0ID4gMC4wKSB7XG4gICAgICAgICAgICAgICAgY2xpcC5fdXBkYXRlKGRlbHRhVGltZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBpbnB1dDtcbiAgICAgICAgICAgIGxldCBvdXRwdXQ7XG4gICAgICAgICAgICBsZXQgdmFsdWU7XG5cbiAgICAgICAgICAgIGlmIChibGVuZFdlaWdodCA+PSAxLjApIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGlucHV0cy5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9IGlucHV0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBvdXRwdXQudmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgQW5pbUJsZW5kLnNldCh2YWx1ZSwgaW5wdXQsIG91dHB1dC50YXJnZXQudHlwZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmJsZW5kQ291bnRlcisrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYmxlbmRXZWlnaHQgPiAwLjApIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGlucHV0cy5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9IGlucHV0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBvdXRwdXQudmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dC5ibGVuZENvdW50ZXIgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFuaW1CbGVuZC5zZXQodmFsdWUsIGlucHV0LCBvdXRwdXQudGFyZ2V0LnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgQW5pbUJsZW5kLmJsZW5kKHZhbHVlLCBpbnB1dCwgYmxlbmRXZWlnaHQsIG91dHB1dC50YXJnZXQudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuYmxlbmRDb3VudGVyKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXBwbHkgcmVzdWx0IHRvIGFuaW0gdGFyZ2V0c1xuICAgICAgICBjb25zdCB0YXJnZXRzID0gdGhpcy5fdGFyZ2V0cztcbiAgICAgICAgY29uc3QgYmluZGVyID0gdGhpcy5fYmluZGVyO1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggaW4gdGFyZ2V0cykge1xuICAgICAgICAgICAgaWYgKHRhcmdldHMuaGFzT3duUHJvcGVydHkocGF0aCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXQgPSB0YXJnZXRzW3BhdGhdO1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoaXMgZXZhbHVhdG9yIGlzIGFzc29jaWF0ZWQgd2l0aCBhbiBhbmltIGNvbXBvbmVudCB0aGVuIHdlIHNob3VsZCBibGVuZCB0aGUgcmVzdWx0IG9mIHRoaXMgZXZhbHVhdG9yIHdpdGggYWxsIG90aGVyIGFuaW0gbGF5ZXIncyBldmFsdWF0b3JzXG4gICAgICAgICAgICAgICAgaWYgKGJpbmRlci5hbmltQ29tcG9uZW50ICYmIHRhcmdldC50YXJnZXQuaXNUcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5pbVRhcmdldCA9IGJpbmRlci5hbmltQ29tcG9uZW50LnRhcmdldHNbcGF0aF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmltVGFyZ2V0LmNvdW50ZXIgPT09IGFuaW1UYXJnZXQubGF5ZXJDb3VudGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltVGFyZ2V0LmNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghYW5pbVRhcmdldC5wYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltVGFyZ2V0LnBhdGggPSBwYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbVRhcmdldC5iYXNlVmFsdWUgPSB0YXJnZXQudGFyZ2V0LmdldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbVRhcmdldC5zZXR0ZXIgPSB0YXJnZXQudGFyZ2V0LnNldDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhpcyBsYXllcidzIHZhbHVlIG9udG8gdGhlIHRhcmdldCB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICBhbmltVGFyZ2V0LnVwZGF0ZVZhbHVlKGJpbmRlci5sYXllckluZGV4LCB0YXJnZXQudmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGFuaW1UYXJnZXQuY291bnRlcisrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC50YXJnZXQuc2V0KHRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRhcmdldC5ibGVuZENvdW50ZXIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2l2ZSB0aGUgYmluZGVyIGFuIG9wcG9ydHVuaXR5IHRvIHVwZGF0ZSBpdHNlbGZcbiAgICAgICAgLy8gVE9ETzogaXMgdGhpcyBldmVuIG5lY2Vzc2FyeT8gYmluZGVyIGNvdWxkIGtub3cgd2hlbiB0byB1cGRhdGVcbiAgICAgICAgLy8gaXRzZWxmIHdpdGhvdXQgb3VyIGhlbHAuXG4gICAgICAgIGJpbmRlci51cGRhdGUoZGVsdGFUaW1lKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IEFuaW1FdmFsdWF0b3IgfTtcbiJdLCJuYW1lcyI6WyJBbmltRXZhbHVhdG9yIiwiY29uc3RydWN0b3IiLCJiaW5kZXIiLCJfYmluZGVyIiwiX2NsaXBzIiwiX2lucHV0cyIsIl9vdXRwdXRzIiwiX3RhcmdldHMiLCJjbGlwcyIsImFkZENsaXAiLCJjbGlwIiwidGFyZ2V0cyIsImN1cnZlcyIsInRyYWNrIiwic25hcHNob3QiLCJpbnB1dHMiLCJvdXRwdXRzIiwiaSIsImxlbmd0aCIsImN1cnZlIiwicGF0aHMiLCJqIiwicGF0aCIsInJlc29sdmVkIiwicmVzb2x2ZSIsInRhcmdldCIsInRhcmdldFBhdGgiLCJ2YWx1ZSIsImJsZW5kQ291bnRlciIsImsiLCJjb21wb25lbnRzIiwicHVzaCIsImFuaW1Db21wb25lbnQiLCJ0eXBlIiwic3Vic3RyaW5nIiwiQW5pbVRhcmdldFZhbHVlIiwiVFlQRV9RVUFUIiwiVFlQRV9WRUMzIiwibGF5ZXJDb3VudGVyIiwic2V0TWFzayIsImxheWVySW5kZXgiLCJfcmVzdWx0cyIsInJlbW92ZUNsaXAiLCJpbmRleCIsInVucmVzb2x2ZSIsInNwbGljZSIsInJlbW92ZUNsaXBzIiwiZmluZENsaXAiLCJuYW1lIiwicmViaW5kIiwiZm9yRWFjaCIsImFzc2lnbk1hc2siLCJtYXNrIiwidXBkYXRlIiwiZGVsdGFUaW1lIiwib3JkZXIiLCJtYXAiLCJjIiwiQW5pbUJsZW5kIiwic3RhYmxlU29ydCIsImEiLCJiIiwiYmxlbmRPcmRlciIsImJsZW5kV2VpZ2h0IiwiX3VwZGF0ZSIsImlucHV0Iiwib3V0cHV0Iiwic2V0IiwiYmxlbmQiLCJoYXNPd25Qcm9wZXJ0eSIsImlzVHJhbnNmb3JtIiwiYW5pbVRhcmdldCIsImNvdW50ZXIiLCJiYXNlVmFsdWUiLCJnZXQiLCJzZXR0ZXIiLCJ1cGRhdGVWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFRQSxNQUFNQSxhQUFhLENBQUM7RUFPaEJDLFdBQVcsQ0FBQ0MsTUFBTSxFQUFFO0lBQ2hCLElBQUksQ0FBQ0MsT0FBTyxHQUFHRCxN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
