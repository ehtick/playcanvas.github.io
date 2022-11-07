/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../../core/debug.js';
import { AnimTrack } from '../../anim/evaluator/anim-track.js';
import { AnimTransition } from '../../anim/controller/anim-transition.js';
import { ANIM_LAYER_OVERWRITE } from '../../anim/controller/constants.js';
import { math } from '../../../core/math/math.js';

class AnimComponentLayer {
  constructor(name, controller, component, weight = 1, blendType = ANIM_LAYER_OVERWRITE, normalizedWeight = true) {
    this._name = name;
    this._controller = controller;
    this._component = component;
    this._weight = weight;
    this._blendType = blendType;
    this._normalizedWeight = normalizedWeight;
    this._mask = null;
    this._blendTime = 0;
    this._blendTimeElapsed = 0;
    this._startingWeight = 0;
    this._targetWeight = 0;
  }

  get name() {
    return this._name;
  }

  set playing(value) {
    this._controller.playing = value;
  }
  get playing() {
    return this._controller.playing;
  }

  get playable() {
    return this._controller.playable;
  }

  get activeState() {
    return this._controller.activeStateName;
  }

  get previousState() {
    return this._controller.previousStateName;
  }

  get activeStateProgress() {
    return this._controller.activeStateProgress;
  }

  get activeStateDuration() {
    return this._controller.activeStateDuration;
  }

  set activeStateCurrentTime(time) {
    const controller = this._controller;
    const layerPlaying = controller.playing;
    controller.playing = true;
    controller.activeStateCurrentTime = time;
    if (!layerPlaying) {
      controller.update(0);
    }
    controller.playing = layerPlaying;
  }
  get activeStateCurrentTime() {
    return this._controller.activeStateCurrentTime;
  }

  get transitioning() {
    return this._controller.transitioning;
  }

  get transitionProgress() {
    if (this.transitioning) {
      return this._controller.transitionProgress;
    }
    return null;
  }

  get states() {
    return this._controller.states;
  }

  set weight(value) {
    this._weight = value;
    this._component.dirtifyTargets();
  }
  get weight() {
    return this._weight;
  }
  set blendType(value) {
    if (value !== this._blendType) {
      this._blendType = value;
      if (this._controller.normalizeWeights) {
        this._component.rebind();
      }
    }
  }
  get blendType() {
    return this._blendType;
  }

  set mask(value) {
    if (this._controller.assignMask(value)) {
      this._component.rebind();
    }
    this._mask = value;
  }
  get mask() {
    return this._mask;
  }

  play(name) {
    this._controller.play(name);
  }

  pause() {
    this._controller.pause();
  }

  reset() {
    this._controller.reset();
  }

  rebind() {
    this._controller.rebind();
  }
  update(dt) {
    if (this._blendTime) {
      if (this._blendTimeElapsed < this._blendTime) {
        this.weight = math.lerp(this._startingWeight, this._targetWeight, this._blendTimeElapsed / this._blendTime);
        this._blendTimeElapsed += dt;
      } else {
        this.weight = this._targetWeight;
        this._blendTime = 0;
        this._blendTimeElapsed = 0;
        this._startingWeight = 0;
        this._targetWeight = 0;
      }
    }
    this._controller.update(dt);
  }

  blendToWeight(weight, time) {
    this._startingWeight = this.weight;
    this._targetWeight = weight;
    this._blendTime = Math.max(0, time);
    this._blendTimeElapsed = 0;
  }

  assignMask(mask) {
    Debug.deprecated('The pc.AnimComponentLayer#assignMask function is now deprecated. Assign masks to the pc.AnimComponentLayer#mask property instead.');
    if (this._controller.assignMask(mask)) {
      this._component.rebind();
    }
    this._mask = mask;
  }

  assignAnimation(nodePath, animTrack, speed, loop) {
    if (animTrack.constructor !== AnimTrack) {
      Debug.error('assignAnimation: animTrack supplied to function was not of type AnimTrack');
      return;
    }
    this._controller.assignAnimation(nodePath, animTrack, speed, loop);
    if (this._controller._transitions.length === 0) {
      this._controller._transitions.push(new AnimTransition({
        from: 'START',
        to: nodePath
      }));
    }
    if (this._component.activate && this._component.playable) {
      this._component.playing = true;
    }
  }

  removeNodeAnimations(nodeName) {
    if (this._controller.removeNodeAnimations(nodeName)) {
      this._component.playing = false;
    }
  }

  getAnimationAsset(stateName) {
    return this._component.animationAssets[`${this.name}:${stateName}`];
  }

  transition(to, time = 0, transitionOffset = null) {
    this._controller.updateStateFromTransition(new AnimTransition({
      from: this._controller.activeStateName,
      to,
      time,
      transitionOffset
    }));
  }
}

export { AnimComponentLayer };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWxheWVyLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvYW5pbS9jb21wb25lbnQtbGF5ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGVidWcgfSBmcm9tICcuLi8uLi8uLi9jb3JlL2RlYnVnLmpzJztcbmltcG9ydCB7IEFuaW1UcmFjayB9IGZyb20gJy4uLy4uL2FuaW0vZXZhbHVhdG9yL2FuaW0tdHJhY2suanMnO1xuaW1wb3J0IHsgQW5pbVRyYW5zaXRpb24gfSBmcm9tICcuLi8uLi9hbmltL2NvbnRyb2xsZXIvYW5pbS10cmFuc2l0aW9uLmpzJztcbmltcG9ydCB7IEFOSU1fTEFZRVJfT1ZFUldSSVRFIH0gZnJvbSAnLi4vLi4vYW5pbS9jb250cm9sbGVyL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBtYXRoIH0gZnJvbSAnLi4vLi4vLi4vY29yZS9tYXRoL21hdGguanMnO1xuXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi9jb21wb25lbnQuanMnKS5BbmltQ29tcG9uZW50fSBBbmltQ29tcG9uZW50ICovXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi4vLi4vYXNzZXQvYXNzZXQuanMnKS5Bc3NldH0gQXNzZXQgKi9cblxuLyoqXG4gKiBUaGUgQW5pbSBDb21wb25lbnQgTGF5ZXIgYWxsb3dzIG1hbmFnZXJzIGEgc2luZ2xlIGxheWVyIG9mIHRoZSBhbmltYXRpb24gc3RhdGUgZ3JhcGguXG4gKi9cbmNsYXNzIEFuaW1Db21wb25lbnRMYXllciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IEFuaW1Db21wb25lbnRMYXllciBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGxheWVyLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250cm9sbGVyIC0gVGhlIGNvbnRyb2xsZXIgdG8gbWFuYWdlIHRoaXMgbGF5ZXJzIGFuaW1hdGlvbnMuXG4gICAgICogQHBhcmFtIHtBbmltQ29tcG9uZW50fSBjb21wb25lbnQgLSBUaGUgY29tcG9uZW50IHRoYXQgdGhpcyBsYXllciBpcyBhIG1lbWJlciBvZi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dlaWdodF0gLSBUaGUgd2VpZ2h0IG9mIHRoaXMgbGF5ZXIuIERlZmF1bHRzIHRvIDEuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtibGVuZFR5cGVdIC0gVGhlIGJsZW5kIHR5cGUgb2YgdGhpcyBsYXllci4gRGVmYXVsdHMgdG8ge0BsaW5rIEFOSU1fTEFZRVJfT1ZFUldSSVRFfS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtub3JtYWxpemVkV2VpZ2h0XSAtIFdoZXRoZXIgdGhlIHdlaWdodCBvZiB0aGlzIGxheWVyIHNob3VsZCBiZSBub3JtYWxpemVkIHVzaW5nIHRoZSB0b3RhbCB3ZWlnaHQgb2YgYWxsIGxheWVycy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjb250cm9sbGVyLCBjb21wb25lbnQsIHdlaWdodCA9IDEsIGJsZW5kVHlwZSA9IEFOSU1fTEFZRVJfT1ZFUldSSVRFLCBub3JtYWxpemVkV2VpZ2h0ID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5fY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudCA9IGNvbXBvbmVudDtcbiAgICAgICAgdGhpcy5fd2VpZ2h0ID0gd2VpZ2h0O1xuICAgICAgICB0aGlzLl9ibGVuZFR5cGUgPSBibGVuZFR5cGU7XG4gICAgICAgIHRoaXMuX25vcm1hbGl6ZWRXZWlnaHQgPSBub3JtYWxpemVkV2VpZ2h0O1xuICAgICAgICB0aGlzLl9tYXNrID0gbnVsbDtcbiAgICAgICAgdGhpcy5fYmxlbmRUaW1lID0gMDtcbiAgICAgICAgdGhpcy5fYmxlbmRUaW1lRWxhcHNlZCA9IDA7XG4gICAgICAgIHRoaXMuX3N0YXJ0aW5nV2VpZ2h0ID0gMDtcbiAgICAgICAgdGhpcy5fdGFyZ2V0V2VpZ2h0ID0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSBsYXllci5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhpcyBsYXllciBpcyBjdXJyZW50bHkgcGxheWluZy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgc2V0IHBsYXlpbmcodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fY29udHJvbGxlci5wbGF5aW5nID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHBsYXlpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250cm9sbGVyLnBsYXlpbmc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIGEgc3RhdGUgZ3JhcGggaGFzIGJlZW4gbG9hZGVkIGFuZCBhbGwgc3RhdGVzIGluIHRoZSBncmFwaCBoYXZlIGJlZW4gYXNzaWduZWRcbiAgICAgKiBhbmltYXRpb24gdHJhY2tzLlxuICAgICAqXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXQgcGxheWFibGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250cm9sbGVyLnBsYXlhYmxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnRseSBhY3RpdmUgc3RhdGUgbmFtZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0IGFjdGl2ZVN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udHJvbGxlci5hY3RpdmVTdGF0ZU5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcHJldmlvdXNseSBhY3RpdmUgc3RhdGUgbmFtZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0IHByZXZpb3VzU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250cm9sbGVyLnByZXZpb3VzU3RhdGVOYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnRseSBhY3RpdmUgc3RhdGVzIHByb2dyZXNzIGFzIGEgdmFsdWUgbm9ybWFsaXplZCBieSB0aGUgc3RhdGVzIGFuaW1hdGlvblxuICAgICAqIGR1cmF0aW9uLiBMb29wZWQgYW5pbWF0aW9ucyB3aWxsIHJldHVybiB2YWx1ZXMgZ3JlYXRlciB0aGFuIDEuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIGdldCBhY3RpdmVTdGF0ZVByb2dyZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udHJvbGxlci5hY3RpdmVTdGF0ZVByb2dyZXNzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnRseSBhY3RpdmUgc3RhdGVzIGR1cmF0aW9uLlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBnZXQgYWN0aXZlU3RhdGVEdXJhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnRyb2xsZXIuYWN0aXZlU3RhdGVEdXJhdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYWN0aXZlIHN0YXRlcyB0aW1lIGluIHNlY29uZHMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHNldCBhY3RpdmVTdGF0ZUN1cnJlbnRUaW1lKHRpbWUpIHtcbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuX2NvbnRyb2xsZXI7XG4gICAgICAgIGNvbnN0IGxheWVyUGxheWluZyA9IGNvbnRyb2xsZXIucGxheWluZztcbiAgICAgICAgY29udHJvbGxlci5wbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgY29udHJvbGxlci5hY3RpdmVTdGF0ZUN1cnJlbnRUaW1lID0gdGltZTtcbiAgICAgICAgaWYgKCFsYXllclBsYXlpbmcpIHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIudXBkYXRlKDApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRyb2xsZXIucGxheWluZyA9IGxheWVyUGxheWluZztcbiAgICB9XG5cbiAgICBnZXQgYWN0aXZlU3RhdGVDdXJyZW50VGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnRyb2xsZXIuYWN0aXZlU3RhdGVDdXJyZW50VGltZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGFuaW0gY29tcG9uZW50IGxheWVyIGlzIGN1cnJlbnRseSB0cmFuc2l0aW9uaW5nIGJldHdlZW4gc3RhdGVzLlxuICAgICAqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgZ2V0IHRyYW5zaXRpb25pbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250cm9sbGVyLnRyYW5zaXRpb25pbmc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWYgdGhlIGFuaW0gY29tcG9uZW50IGxheWVyIGlzIGN1cnJlbnRseSB0cmFuc2l0aW9uaW5nIGJldHdlZW4gc3RhdGVzLCByZXR1cm5zIHRoZSBwcm9ncmVzcy5cbiAgICAgKiBPdGhlcndpc2UgcmV0dXJucyBudWxsLlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcnxudWxsfVxuICAgICAqL1xuICAgIGdldCB0cmFuc2l0aW9uUHJvZ3Jlc3MoKSB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zaXRpb25pbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb250cm9sbGVyLnRyYW5zaXRpb25Qcm9ncmVzcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMaXN0cyBhbGwgYXZhaWxhYmxlIHN0YXRlcyBpbiB0aGlzIGxheWVycyBzdGF0ZSBncmFwaC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmdbXX1cbiAgICAgKi9cbiAgICBnZXQgc3RhdGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udHJvbGxlci5zdGF0ZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJsZW5kaW5nIHdlaWdodCBvZiB0aGlzIGxheWVyLiBVc2VkIHdoZW4gY2FsY3VsYXRpbmcgdGhlIHZhbHVlIG9mIHByb3BlcnRpZXMgdGhhdCBhcmVcbiAgICAgKiBhbmltYXRlZCBieSBtb3JlIHRoYW4gb25lIGxheWVyLlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBzZXQgd2VpZ2h0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3dlaWdodCA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9jb21wb25lbnQuZGlydGlmeVRhcmdldHMoKTtcbiAgICB9XG5cbiAgICBnZXQgd2VpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fd2VpZ2h0O1xuICAgIH1cblxuICAgIHNldCBibGVuZFR5cGUodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLl9ibGVuZFR5cGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2JsZW5kVHlwZSA9IHZhbHVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NvbnRyb2xsZXIubm9ybWFsaXplV2VpZ2h0cykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudC5yZWJpbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBibGVuZFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ibGVuZFR5cGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBtYXNrIG9mIGJvbmVzIHdoaWNoIHNob3VsZCBiZSBhbmltYXRlZCBvciBpZ25vcmVkIGJ5IHRoaXMgbGF5ZXIuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgICAqIEBleGFtcGxlXG4gICAgICogZW50aXR5LmFuaW0uYmFzZUxheWVyLm1hc2sgPSB7XG4gICAgICogICAgIC8vIGluY2x1ZGUgdGhlIHNwaW5lIG9mIHRoZSBjdXJyZW50IG1vZGVsIGFuZCBhbGwgb2YgaXRzIGNoaWxkcmVuXG4gICAgICogICAgIFwicGF0aC90by9zcGluZVwiOiB7XG4gICAgICogICAgICAgICBjaGlsZHJlbjogdHJ1ZVxuICAgICAqICAgICB9LFxuICAgICAqICAgICAvLyBpbmNsdWRlIHRoZSBoaXAgb2YgdGhlIGN1cnJlbnQgbW9kZWwgYnV0IG5vdCBhbGwgb2YgaXRzIGNoaWxkcmVuXG4gICAgICogICAgIFwicGF0aC90by9oaXBcIjogdHJ1ZVxuICAgICAqIH07XG4gICAgICovXG4gICAgc2V0IG1hc2sodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRyb2xsZXIuYXNzaWduTWFzayh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudC5yZWJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9tYXNrID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IG1hc2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXNrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IHBsYXlpbmcgdGhlIGFuaW1hdGlvbiBpbiB0aGUgY3VycmVudCBzdGF0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZV0gLSBJZiBwcm92aWRlZCwgd2lsbCBiZWdpbiBwbGF5aW5nIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBzdGF0ZSB3aXRoXG4gICAgICogdGhpcyBuYW1lLlxuICAgICAqL1xuICAgIHBsYXkobmFtZSkge1xuICAgICAgICB0aGlzLl9jb250cm9sbGVyLnBsYXkobmFtZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGF1c2UgdGhlIGFuaW1hdGlvbiBpbiB0aGUgY3VycmVudCBzdGF0ZS5cbiAgICAgKi9cbiAgICBwYXVzZSgpIHtcbiAgICAgICAgdGhpcy5fY29udHJvbGxlci5wYXVzZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0IHRoZSBhbmltYXRpb24gY29tcG9uZW50IHRvIGl0cyBpbml0aWFsIHN0YXRlLCBpbmNsdWRpbmcgYWxsIHBhcmFtZXRlcnMuIFRoZSBzeXN0ZW1cbiAgICAgKiB3aWxsIGJlIHBhdXNlZC5cbiAgICAgKi9cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5fY29udHJvbGxlci5yZXNldCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYmluZCBhbnkgYW5pbWF0aW9ucyBpbiB0aGUgbGF5ZXIgdG8gdGhlIGN1cnJlbnRseSBwcmVzZW50IGNvbXBvbmVudHMgYW5kIG1vZGVsIG9mIHRoZSBhbmltXG4gICAgICogY29tcG9uZW50cyBlbnRpdHkuXG4gICAgICovXG4gICAgcmViaW5kKCkge1xuICAgICAgICB0aGlzLl9jb250cm9sbGVyLnJlYmluZCgpO1xuICAgIH1cblxuICAgIHVwZGF0ZShkdCkge1xuICAgICAgICBpZiAodGhpcy5fYmxlbmRUaW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fYmxlbmRUaW1lRWxhcHNlZCA8IHRoaXMuX2JsZW5kVGltZSkge1xuICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0ID0gbWF0aC5sZXJwKHRoaXMuX3N0YXJ0aW5nV2VpZ2h0LCB0aGlzLl90YXJnZXRXZWlnaHQsIHRoaXMuX2JsZW5kVGltZUVsYXBzZWQgLyB0aGlzLl9ibGVuZFRpbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2JsZW5kVGltZUVsYXBzZWQgKz0gZHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0ID0gdGhpcy5fdGFyZ2V0V2VpZ2h0O1xuICAgICAgICAgICAgICAgIHRoaXMuX2JsZW5kVGltZSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmxlbmRUaW1lRWxhcHNlZCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RhcnRpbmdXZWlnaHQgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuX3RhcmdldFdlaWdodCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY29udHJvbGxlci51cGRhdGUoZHQpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQmxlbmQgZnJvbSB0aGUgY3VycmVudCB3ZWlnaHQgdmFsdWUgdG8gdGhlIHByb3ZpZGVkIHdlaWdodCB2YWx1ZSBvdmVyIGEgZ2l2ZW4gYW1vdW50IG9mIHRpbWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2VpZ2h0IC0gVGhlIG5ldyB3ZWlnaHQgdmFsdWUgdG8gYmxlbmQgdG8uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgLSBUaGUgZHVyYXRpb24gb2YgdGhlIGJsZW5kIGluIHNlY29uZHMuXG4gICAgICovXG4gICAgYmxlbmRUb1dlaWdodCh3ZWlnaHQsIHRpbWUpIHtcbiAgICAgICAgdGhpcy5fc3RhcnRpbmdXZWlnaHQgPSB0aGlzLndlaWdodDtcbiAgICAgICAgdGhpcy5fdGFyZ2V0V2VpZ2h0ID0gd2VpZ2h0O1xuICAgICAgICB0aGlzLl9ibGVuZFRpbWUgPSBNYXRoLm1heCgwLCB0aW1lKTtcbiAgICAgICAgdGhpcy5fYmxlbmRUaW1lRWxhcHNlZCA9IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbWFzayB0byB0aGlzIGxheWVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFttYXNrXSAtIFRoZSBtYXNrIHRvIGFzc2lnbiB0byB0aGUgbGF5ZXIuIElmIG5vdCBwcm92aWRlZCB0aGUgY3VycmVudCBtYXNrXG4gICAgICogaW4gdGhlIGxheWVyIHdpbGwgYmUgcmVtb3ZlZC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGVudGl0eS5hbmltLmJhc2VMYXllci5hc3NpZ25NYXNrKHtcbiAgICAgKiAgICAgLy8gaW5jbHVkZSB0aGUgc3BpbmUgb2YgdGhlIGN1cnJlbnQgbW9kZWwgYW5kIGFsbCBvZiBpdHMgY2hpbGRyZW5cbiAgICAgKiAgICAgXCJwYXRoL3RvL3NwaW5lXCI6IHtcbiAgICAgKiAgICAgICAgIGNoaWxkcmVuOiB0cnVlXG4gICAgICogICAgIH0sXG4gICAgICogICAgIC8vIGluY2x1ZGUgdGhlIGhpcCBvZiB0aGUgY3VycmVudCBtb2RlbCBidXQgbm90IGFsbCBvZiBpdHMgY2hpbGRyZW5cbiAgICAgKiAgICAgXCJwYXRoL3RvL2hpcFwiOiB0cnVlXG4gICAgICogfSk7XG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIGFzc2lnbk1hc2sobWFzaykge1xuICAgICAgICBEZWJ1Zy5kZXByZWNhdGVkKCdUaGUgcGMuQW5pbUNvbXBvbmVudExheWVyI2Fzc2lnbk1hc2sgZnVuY3Rpb24gaXMgbm93IGRlcHJlY2F0ZWQuIEFzc2lnbiBtYXNrcyB0byB0aGUgcGMuQW5pbUNvbXBvbmVudExheWVyI21hc2sgcHJvcGVydHkgaW5zdGVhZC4nKTtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRyb2xsZXIuYXNzaWduTWFzayhtYXNrKSkge1xuICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50LnJlYmluZCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21hc2sgPSBtYXNrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFzc2lnbnMgYW4gYW5pbWF0aW9uIHRyYWNrIHRvIGEgc3RhdGUgb3IgYmxlbmQgdHJlZSBub2RlIGluIHRoZSBjdXJyZW50IGdyYXBoLiBJZiBhIHN0YXRlXG4gICAgICogZm9yIHRoZSBnaXZlbiBub2RlUGF0aCBkb2Vzbid0IGV4aXN0LCBpdCB3aWxsIGJlIGNyZWF0ZWQuIElmIGFsbCBzdGF0ZXMgbm9kZXMgYXJlIGxpbmtlZCBhbmRcbiAgICAgKiB0aGUge0BsaW5rIEFuaW1Db21wb25lbnQjYWN0aXZhdGV9IHZhbHVlIHdhcyBzZXQgdG8gdHJ1ZSB0aGVuIHRoZSBjb21wb25lbnQgd2lsbCBiZWdpblxuICAgICAqIHBsYXlpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbm9kZVBhdGggLSBFaXRoZXIgdGhlIHN0YXRlIG5hbWUgb3IgdGhlIHBhdGggdG8gYSBibGVuZCB0cmVlIG5vZGUgdGhhdCB0aGlzXG4gICAgICogYW5pbWF0aW9uIHNob3VsZCBiZSBhc3NvY2lhdGVkIHdpdGguIEVhY2ggc2VjdGlvbiBvZiBhIGJsZW5kIHRyZWUgcGF0aCBpcyBzcGxpdCB1c2luZyBhXG4gICAgICogcGVyaW9kIChgLmApIHRoZXJlZm9yZSBzdGF0ZSBuYW1lcyBzaG91bGQgbm90IGluY2x1ZGUgdGhpcyBjaGFyYWN0ZXIgKGUuZyBcIk15U3RhdGVOYW1lXCIgb3JcbiAgICAgKiBcIk15U3RhdGVOYW1lLkJsZW5kVHJlZU5vZGVcIikuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGFuaW1UcmFjayAtIFRoZSBhbmltYXRpb24gdHJhY2sgdGhhdCB3aWxsIGJlIGFzc2lnbmVkIHRvIHRoaXMgc3RhdGUgYW5kXG4gICAgICogcGxheWVkIHdoZW5ldmVyIHRoaXMgc3RhdGUgaXMgYWN0aXZlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc3BlZWRdIC0gVXBkYXRlIHRoZSBzcGVlZCBvZiB0aGUgc3RhdGUgeW91IGFyZSBhc3NpZ25pbmcgYW4gYW5pbWF0aW9uIHRvLlxuICAgICAqIERlZmF1bHRzIHRvIDEuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbbG9vcF0gLSBVcGRhdGUgdGhlIGxvb3AgcHJvcGVydHkgb2YgdGhlIHN0YXRlIHlvdSBhcmUgYXNzaWduaW5nIGFuXG4gICAgICogYW5pbWF0aW9uIHRvLiBEZWZhdWx0cyB0byB0cnVlLlxuICAgICAqL1xuICAgIGFzc2lnbkFuaW1hdGlvbihub2RlUGF0aCwgYW5pbVRyYWNrLCBzcGVlZCwgbG9vcCkge1xuICAgICAgICBpZiAoYW5pbVRyYWNrLmNvbnN0cnVjdG9yICE9PSBBbmltVHJhY2spIHtcbiAgICAgICAgICAgIERlYnVnLmVycm9yKCdhc3NpZ25BbmltYXRpb246IGFuaW1UcmFjayBzdXBwbGllZCB0byBmdW5jdGlvbiB3YXMgbm90IG9mIHR5cGUgQW5pbVRyYWNrJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY29udHJvbGxlci5hc3NpZ25BbmltYXRpb24obm9kZVBhdGgsIGFuaW1UcmFjaywgc3BlZWQsIGxvb3ApO1xuICAgICAgICBpZiAodGhpcy5fY29udHJvbGxlci5fdHJhbnNpdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9jb250cm9sbGVyLl90cmFuc2l0aW9ucy5wdXNoKG5ldyBBbmltVHJhbnNpdGlvbih7XG4gICAgICAgICAgICAgICAgZnJvbTogJ1NUQVJUJyxcbiAgICAgICAgICAgICAgICB0bzogbm9kZVBhdGhcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fY29tcG9uZW50LmFjdGl2YXRlICYmIHRoaXMuX2NvbXBvbmVudC5wbGF5YWJsZSkge1xuICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50LnBsYXlpbmcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbmltYXRpb25zIGZyb20gYSBub2RlIGluIHRoZSBsb2FkZWQgc3RhdGUgZ3JhcGguXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbm9kZU5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbm9kZSB0aGF0IHNob3VsZCBoYXZlIGl0cyBhbmltYXRpb24gdHJhY2tzIHJlbW92ZWQuXG4gICAgICovXG4gICAgcmVtb3ZlTm9kZUFuaW1hdGlvbnMobm9kZU5hbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRyb2xsZXIucmVtb3ZlTm9kZUFuaW1hdGlvbnMobm9kZU5hbWUpKSB7XG4gICAgICAgICAgICB0aGlzLl9jb21wb25lbnQucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYXNzZXQgdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHN0YXRlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBzdGF0ZSB0byBnZXQgdGhlIGFzc2V0IGZvci5cbiAgICAgKiBAcmV0dXJucyB7QXNzZXR9IFRoZSBhc3NldCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHN0YXRlLlxuICAgICAqL1xuICAgIGdldEFuaW1hdGlvbkFzc2V0KHN0YXRlTmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50LmFuaW1hdGlvbkFzc2V0c1tgJHt0aGlzLm5hbWV9OiR7c3RhdGVOYW1lfWBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYW5zaXRpb24gdG8gYW55IHN0YXRlIGluIHRoZSBjdXJyZW50IGxheWVycyBncmFwaC4gVHJhbnNpdGlvbnMgY2FuIGJlIGluc3RhbnQgb3IgdGFrZSBhblxuICAgICAqIG9wdGlvbmFsIGJsZW5kIHRpbWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdG8gLSBUaGUgc3RhdGUgdGhhdCB0aGlzIHRyYW5zaXRpb24gd2lsbCB0cmFuc2l0aW9uIHRvLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbdGltZV0gLSBUaGUgZHVyYXRpb24gb2YgdGhlIHRyYW5zaXRpb24gaW4gc2Vjb25kcy4gRGVmYXVsdHMgdG8gMC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RyYW5zaXRpb25PZmZzZXRdIC0gSWYgcHJvdmlkZWQsIHRoZSBkZXN0aW5hdGlvbiBzdGF0ZSB3aWxsIGJlZ2luIHBsYXlpbmdcbiAgICAgKiBpdHMgYW5pbWF0aW9uIGF0IHRoaXMgdGltZS4gR2l2ZW4gaW4gbm9ybWFsaXplZCB0aW1lLCBiYXNlZCBvbiB0aGUgc3RhdGVzIGR1cmF0aW9uICYgbXVzdCBiZVxuICAgICAqIGJldHdlZW4gMCBhbmQgMS4gRGVmYXVsdHMgdG8gbnVsbC5cbiAgICAgKi9cbiAgICB0cmFuc2l0aW9uKHRvLCB0aW1lID0gMCwgdHJhbnNpdGlvbk9mZnNldCA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fY29udHJvbGxlci51cGRhdGVTdGF0ZUZyb21UcmFuc2l0aW9uKG5ldyBBbmltVHJhbnNpdGlvbih7XG4gICAgICAgICAgICBmcm9tOiB0aGlzLl9jb250cm9sbGVyLmFjdGl2ZVN0YXRlTmFtZSxcbiAgICAgICAgICAgIHRvLFxuICAgICAgICAgICAgdGltZSxcbiAgICAgICAgICAgIHRyYW5zaXRpb25PZmZzZXRcbiAgICAgICAgfSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgQW5pbUNvbXBvbmVudExheWVyIH07XG4iXSwibmFtZXMiOlsiQW5pbUNvbXBvbmVudExheWVyIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiY29udHJvbGxlciIsImNvbXBvbmVudCIsIndlaWdodCIsImJsZW5kVHlwZSIsIkFOSU1fTEFZRVJfT1ZFUldSSVRFIiwibm9ybWFsaXplZFdlaWdodCIsIl9uYW1lIiwiX2NvbnRyb2xsZXIiLCJfY29tcG9uZW50IiwiX3dlaWdodCIsIl9ibGVuZFR5cGUiLCJfbm9ybWFsaXplZFdlaWdodCIsIl9tYXNrIiwiX2JsZW5kVGltZSIsIl9ibGVuZFRpbWVFbGFwc2VkIiwiX3N0YXJ0aW5nV2VpZ2h0IiwiX3RhcmdldFdlaWdodCIsInBsYXlpbmciLCJ2YWx1ZSIsInBsYXlhYmxlIiwiYWN0aXZlU3RhdGUiLCJhY3RpdmVTdGF0ZU5hbWUiLCJwcmV2aW91c1N0YXRlIiwicHJldmlvdXNTdGF0ZU5hbWUiLCJhY3RpdmVTdGF0ZVByb2dyZXNzIiwiYWN0aXZlU3RhdGVEdXJhdGlvbiIsImFjdGl2ZVN0YXRlQ3VycmVudFRpbWUiLCJ0aW1lIiwibGF5ZXJQbGF5aW5nIiwidXBkYXRlIiwidHJhbnNpdGlvbmluZyIsInRyYW5zaXRpb25Qcm9ncmVzcyIsInN0YXRlcyIsImRpcnRpZnlUYXJnZXRzIiwibm9ybWFsaXplV2VpZ2h0cyIsInJlYmluZCIsIm1hc2siLCJhc3NpZ25NYXNrIiwicGxheSIsInBhdXNlIiwicmVzZXQiLCJkdCIsIm1hdGgiLCJsZXJwIiwiYmxlbmRUb1dlaWdodCIsIk1hdGgiLCJtYXgiLCJEZWJ1ZyIsImRlcHJlY2F0ZWQiLCJhc3NpZ25BbmltYXRpb24iLCJub2RlUGF0aCIsImFuaW1UcmFjayIsInNwZWVkIiwibG9vcCIsIkFuaW1UcmFjayIsImVycm9yIiwiX3RyYW5zaXRpb25zIiwibGVuZ3RoIiwicHVzaCIsIkFuaW1UcmFuc2l0aW9uIiwiZnJvbSIsInRvIiwiYWN0aXZhdGUiLCJyZW1vdmVOb2RlQW5pbWF0aW9ucyIsIm5vZGVOYW1lIiwiZ2V0QW5pbWF0aW9uQXNzZXQiLCJzdGF0ZU5hbWUiLCJhbmltYXRpb25Bc3NldHMiLCJ0cmFuc2l0aW9uIiwidHJhbnNpdGlvbk9mZnNldCIsInVwZGF0ZVN0YXRlRnJvbVRyYW5zaXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBWUEsTUFBTUEsa0JBQWtCLENBQUM7QUFXckJDLEVBQUFBLFdBQVcsQ0FBQ0MsSUFBSSxFQUFFQyxVQUFVLEVBQUVDLFNBQVMsRUFBRUMsTUFBTSxHQUFHLENBQUMsRUFBRUMsU0FBUyxHQUFHQyxvQkFBb0IsRUFBRUMsZ0JBQWdCLEdBQUcsSUFBSSxFQUFFO0lBQzVHLElBQUksQ0FBQ0MsS0FBSyxHQUFHUCxJQUFJLENBQUE7SUFDakIsSUFBSSxDQUFDUSxXQUFXLEdBQUdQLFVBQVUsQ0FBQTtJQUM3QixJQUFJLENBQUNRLFVBQVUsR0FBR1AsU0FBUyxDQUFBO0lBQzNCLElBQUksQ0FBQ1EsT0FBTyxHQUFHUCxNQUFNLENBQUE7SUFDckIsSUFBSSxDQUFDUSxVQUFVLEdBQUdQLFNBQVMsQ0FBQTtJQUMzQixJQUFJLENBQUNR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
