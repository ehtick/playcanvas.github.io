import { Quat } from '../../../core/math/quat.js';
import { ANIM_LAYER_OVERWRITE, ANIM_LAYER_ADDITIVE } from '../controller/constants.js';
import { AnimBlend } from './anim-blend.js';
import { math } from '../../../core/math/math.js';

/**
 * Used to store and update the value of an animation target. This combines the values of multiple
 * layer targets into a single value.
 *
 * @ignore
 */
class AnimTargetValue {
  /**
   * Create a new AnimTargetValue instance.
   *
   * @param {AnimComponent} component - The anim component this target value is associated with.
   * @param {string} type - The type of value stored, either quat or vec3.
   */
  constructor(component, type) {
    this._component = component;
    this.mask = new Int8Array(component.layers.length);
    this.weights = new Float32Array(component.layers.length);
    this.totalWeight = 0;
    this.counter = 0;
    this.layerCounter = 0;
    this.valueType = type;
    this.dirty = true;
    this.value = type === AnimTargetValue.TYPE_QUAT ? [0, 0, 0, 1] : [0, 0, 0];
    this.baseValue = null;
    this.setter = null;
  }
  get _normalizeWeights() {
    return this._component.normalizeWeights;
  }
  getWeight(index) {
    if (this.dirty) this.updateWeights();
    if (this._normalizeWeights && this.totalWeight === 0 || !this.mask[index]) {
      return 0;
    } else if (this._normalizeWeights) {
      return this.weights[index] / this.totalWeight;
    }
    return math.clamp(this.weights[index], 0, 1);
  }
  _layerBlendType(index) {
    return this._component.layers[index].blendType;
  }
  setMask(index, value) {
    this.mask[index] = value;
    if (this._normalizeWeights) {
      if (this._component.layers[index].blendType === ANIM_LAYER_OVERWRITE) {
        this.mask = this.mask.fill(0, 0, index);
      }
      this.dirty = true;
    }
  }
  updateWeights() {
    this.totalWeight = 0;
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] = this._component.layers[i].weight;
      this.totalWeight += this.mask[i] * this.weights[i];
    }
    this.dirty = false;
  }
  updateValue(index, value) {
    // always reset the value of the target when the counter is 0
    if (this.counter === 0) {
      AnimBlend.set(this.value, AnimTargetValue.IDENTITY_QUAT_ARR, this.valueType);
      if (!this._normalizeWeights) {
        AnimBlend.blend(this.value, this.baseValue, 1, this.valueType);
      }
    }
    if (!this.mask[index] || this.getWeight(index) === 0) return;
    if (this._layerBlendType(index) === ANIM_LAYER_ADDITIVE && !this._normalizeWeights) {
      if (this.valueType === AnimTargetValue.TYPE_QUAT) {
        // current value
        const v = AnimTargetValue.q1.set(this.value[0], this.value[1], this.value[2], this.value[3]);
        // additive value
        const aV1 = AnimTargetValue.q2.set(this.baseValue[0], this.baseValue[1], this.baseValue[2], this.baseValue[3]);
        const aV2 = AnimTargetValue.q3.set(value[0], value[1], value[2], value[3]);
        const aV = aV1.invert().mul(aV2);
        // scale additive value by it's weight
        aV.slerp(Quat.IDENTITY, aV, this.getWeight(index));
        // add the additive value onto the current value then set it to the targets value
        v.mul(aV);
        AnimTargetValue.quatArr[0] = v.x;
        AnimTargetValue.quatArr[1] = v.y;
        AnimTargetValue.quatArr[2] = v.z;
        AnimTargetValue.quatArr[3] = v.w;
        AnimBlend.set(this.value, AnimTargetValue.quatArr, this.valueType);
      } else {
        AnimTargetValue.vecArr[0] = value[0] - this.baseValue[0];
        AnimTargetValue.vecArr[1] = value[1] - this.baseValue[1];
        AnimTargetValue.vecArr[2] = value[2] - this.baseValue[2];
        AnimBlend.blend(this.value, AnimTargetValue.vecArr, this.getWeight(index), this.valueType, true);
      }
    } else {
      AnimBlend.blend(this.value, value, this.getWeight(index), this.valueType);
    }
    if (this.setter) this.setter(this.value);
  }
  unbind() {
    if (this.setter) {
      this.setter(this.baseValue);
    }
  }
}
AnimTargetValue.TYPE_QUAT = 'quaternion';
AnimTargetValue.TYPE_VEC3 = 'vector3';
AnimTargetValue.q1 = new Quat();
AnimTargetValue.q2 = new Quat();
AnimTargetValue.q3 = new Quat();
AnimTargetValue.quatArr = [0, 0, 0, 1];
AnimTargetValue.vecArr = [0, 0, 0];
AnimTargetValue.IDENTITY_QUAT_ARR = [0, 0, 0, 1];

export { AnimTargetValue };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbS10YXJnZXQtdmFsdWUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvYW5pbS9ldmFsdWF0b3IvYW5pbS10YXJnZXQtdmFsdWUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUXVhdCB9IGZyb20gJy4uLy4uLy4uL2NvcmUvbWF0aC9xdWF0LmpzJztcbmltcG9ydCB7IEFOSU1fTEFZRVJfQURESVRJVkUsIEFOSU1fTEFZRVJfT1ZFUldSSVRFIH0gZnJvbSAnLi4vY29udHJvbGxlci9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgQW5pbUJsZW5kIH0gZnJvbSAnLi9hbmltLWJsZW5kLmpzJztcbmltcG9ydCB7IG1hdGggfSBmcm9tICcuLi8uLi8uLi9jb3JlL21hdGgvbWF0aC5qcyc7XG5cbi8qKlxuICogVXNlZCB0byBzdG9yZSBhbmQgdXBkYXRlIHRoZSB2YWx1ZSBvZiBhbiBhbmltYXRpb24gdGFyZ2V0LiBUaGlzIGNvbWJpbmVzIHRoZSB2YWx1ZXMgb2YgbXVsdGlwbGVcbiAqIGxheWVyIHRhcmdldHMgaW50byBhIHNpbmdsZSB2YWx1ZS5cbiAqXG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIEFuaW1UYXJnZXRWYWx1ZSB7XG4gICAgc3RhdGljIFRZUEVfUVVBVCA9ICdxdWF0ZXJuaW9uJztcblxuICAgIHN0YXRpYyBUWVBFX1ZFQzMgPSAndmVjdG9yMyc7XG5cbiAgICBzdGF0aWMgcTEgPSBuZXcgUXVhdCgpO1xuXG4gICAgc3RhdGljIHEyID0gbmV3IFF1YXQoKTtcblxuICAgIHN0YXRpYyBxMyA9IG5ldyBRdWF0KCk7XG5cbiAgICBzdGF0aWMgcXVhdEFyciA9IFswLCAwLCAwLCAxXTtcblxuICAgIHN0YXRpYyB2ZWNBcnIgPSBbMCwgMCwgMF07XG5cbiAgICBzdGF0aWMgSURFTlRJVFlfUVVBVF9BUlIgPSBbMCwgMCwgMCwgMV07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgQW5pbVRhcmdldFZhbHVlIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtBbmltQ29tcG9uZW50fSBjb21wb25lbnQgLSBUaGUgYW5pbSBjb21wb25lbnQgdGhpcyB0YXJnZXQgdmFsdWUgaXMgYXNzb2NpYXRlZCB3aXRoLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIHR5cGUgb2YgdmFsdWUgc3RvcmVkLCBlaXRoZXIgcXVhdCBvciB2ZWMzLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGNvbXBvbmVudCwgdHlwZSkge1xuICAgICAgICB0aGlzLl9jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gICAgICAgIHRoaXMubWFzayA9IG5ldyBJbnQ4QXJyYXkoY29tcG9uZW50LmxheWVycy5sZW5ndGgpO1xuICAgICAgICB0aGlzLndlaWdodHMgPSBuZXcgRmxvYXQzMkFycmF5KGNvbXBvbmVudC5sYXllcnMubGVuZ3RoKTtcbiAgICAgICAgdGhpcy50b3RhbFdlaWdodCA9IDA7XG4gICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgIHRoaXMubGF5ZXJDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy52YWx1ZVR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy52YWx1ZSA9ICh0eXBlID09PSBBbmltVGFyZ2V0VmFsdWUuVFlQRV9RVUFUID8gWzAsIDAsIDAsIDFdIDogWzAsIDAsIDBdKTtcbiAgICAgICAgdGhpcy5iYXNlVmFsdWUgPSBudWxsO1xuICAgICAgICB0aGlzLnNldHRlciA9IG51bGw7XG4gICAgfVxuXG4gICAgZ2V0IF9ub3JtYWxpemVXZWlnaHRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50Lm5vcm1hbGl6ZVdlaWdodHM7XG4gICAgfVxuXG4gICAgZ2V0V2VpZ2h0KGluZGV4KSB7XG4gICAgICAgIGlmICh0aGlzLmRpcnR5KSB0aGlzLnVwZGF0ZVdlaWdodHMoKTtcbiAgICAgICAgaWYgKHRoaXMuX25vcm1hbGl6ZVdlaWdodHMgJiYgdGhpcy50b3RhbFdlaWdodCA9PT0gMCB8fCAhdGhpcy5tYXNrW2luZGV4XSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fbm9ybWFsaXplV2VpZ2h0cykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2VpZ2h0c1tpbmRleF0gLyB0aGlzLnRvdGFsV2VpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRoLmNsYW1wKHRoaXMud2VpZ2h0c1tpbmRleF0sIDAsIDEpO1xuICAgIH1cblxuICAgIF9sYXllckJsZW5kVHlwZShpbmRleCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50LmxheWVyc1tpbmRleF0uYmxlbmRUeXBlO1xuICAgIH1cblxuICAgIHNldE1hc2soaW5kZXgsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMubWFza1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMuX25vcm1hbGl6ZVdlaWdodHMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jb21wb25lbnQubGF5ZXJzW2luZGV4XS5ibGVuZFR5cGUgPT09IEFOSU1fTEFZRVJfT1ZFUldSSVRFKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXNrID0gdGhpcy5tYXNrLmZpbGwoMCwgMCwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVXZWlnaHRzKCkge1xuICAgICAgICB0aGlzLnRvdGFsV2VpZ2h0ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLndlaWdodHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMud2VpZ2h0c1tpXSA9IHRoaXMuX2NvbXBvbmVudC5sYXllcnNbaV0ud2VpZ2h0O1xuICAgICAgICAgICAgdGhpcy50b3RhbFdlaWdodCArPSB0aGlzLm1hc2tbaV0gKiB0aGlzLndlaWdodHNbaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHVwZGF0ZVZhbHVlKGluZGV4LCB2YWx1ZSkge1xuICAgICAgICAvLyBhbHdheXMgcmVzZXQgdGhlIHZhbHVlIG9mIHRoZSB0YXJnZXQgd2hlbiB0aGUgY291bnRlciBpcyAwXG4gICAgICAgIGlmICh0aGlzLmNvdW50ZXIgPT09IDApIHtcbiAgICAgICAgICAgIEFuaW1CbGVuZC5zZXQodGhpcy52YWx1ZSwgQW5pbVRhcmdldFZhbHVlLklERU5USVRZX1FVQVRfQVJSLCB0aGlzLnZhbHVlVHlwZSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX25vcm1hbGl6ZVdlaWdodHMpIHtcbiAgICAgICAgICAgICAgICBBbmltQmxlbmQuYmxlbmQodGhpcy52YWx1ZSwgdGhpcy5iYXNlVmFsdWUsIDEsIHRoaXMudmFsdWVUeXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMubWFza1tpbmRleF0gfHwgdGhpcy5nZXRXZWlnaHQoaW5kZXgpID09PSAwKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLl9sYXllckJsZW5kVHlwZShpbmRleCkgPT09IEFOSU1fTEFZRVJfQURESVRJVkUgJiYgIXRoaXMuX25vcm1hbGl6ZVdlaWdodHMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbHVlVHlwZSA9PT0gQW5pbVRhcmdldFZhbHVlLlRZUEVfUVVBVCkge1xuICAgICAgICAgICAgICAgIC8vIGN1cnJlbnQgdmFsdWVcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gQW5pbVRhcmdldFZhbHVlLnExLnNldCh0aGlzLnZhbHVlWzBdLCB0aGlzLnZhbHVlWzFdLCB0aGlzLnZhbHVlWzJdLCB0aGlzLnZhbHVlWzNdKTtcbiAgICAgICAgICAgICAgICAvLyBhZGRpdGl2ZSB2YWx1ZVxuICAgICAgICAgICAgICAgIGNvbnN0IGFWMSA9IEFuaW1UYXJnZXRWYWx1ZS5xMi5zZXQodGhpcy5iYXNlVmFsdWVbMF0sIHRoaXMuYmFzZVZhbHVlWzFdLCB0aGlzLmJhc2VWYWx1ZVsyXSwgdGhpcy5iYXNlVmFsdWVbM10pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFWMiA9IEFuaW1UYXJnZXRWYWx1ZS5xMy5zZXQodmFsdWVbMF0sIHZhbHVlWzFdLCB2YWx1ZVsyXSwgdmFsdWVbM10pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFWID0gYVYxLmludmVydCgpLm11bChhVjIpO1xuICAgICAgICAgICAgICAgIC8vIHNjYWxlIGFkZGl0aXZlIHZhbHVlIGJ5IGl0J3Mgd2VpZ2h0XG4gICAgICAgICAgICAgICAgYVYuc2xlcnAoUXVhdC5JREVOVElUWSwgYVYsIHRoaXMuZ2V0V2VpZ2h0KGluZGV4KSk7XG4gICAgICAgICAgICAgICAgLy8gYWRkIHRoZSBhZGRpdGl2ZSB2YWx1ZSBvbnRvIHRoZSBjdXJyZW50IHZhbHVlIHRoZW4gc2V0IGl0IHRvIHRoZSB0YXJnZXRzIHZhbHVlXG4gICAgICAgICAgICAgICAgdi5tdWwoYVYpO1xuICAgICAgICAgICAgICAgIEFuaW1UYXJnZXRWYWx1ZS5xdWF0QXJyWzBdID0gdi54O1xuICAgICAgICAgICAgICAgIEFuaW1UYXJnZXRWYWx1ZS5xdWF0QXJyWzFdID0gdi55O1xuICAgICAgICAgICAgICAgIEFuaW1UYXJnZXRWYWx1ZS5xdWF0QXJyWzJdID0gdi56O1xuICAgICAgICAgICAgICAgIEFuaW1UYXJnZXRWYWx1ZS5xdWF0QXJyWzNdID0gdi53O1xuICAgICAgICAgICAgICAgIEFuaW1CbGVuZC5zZXQodGhpcy52YWx1ZSwgQW5pbVRhcmdldFZhbHVlLnF1YXRBcnIsIHRoaXMudmFsdWVUeXBlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgQW5pbVRhcmdldFZhbHVlLnZlY0FyclswXSA9IHZhbHVlWzBdIC0gdGhpcy5iYXNlVmFsdWVbMF07XG4gICAgICAgICAgICAgICAgQW5pbVRhcmdldFZhbHVlLnZlY0FyclsxXSA9IHZhbHVlWzFdIC0gdGhpcy5iYXNlVmFsdWVbMV07XG4gICAgICAgICAgICAgICAgQW5pbVRhcmdldFZhbHVlLnZlY0FyclsyXSA9IHZhbHVlWzJdIC0gdGhpcy5iYXNlVmFsdWVbMl07XG4gICAgICAgICAgICAgICAgQW5pbUJsZW5kLmJsZW5kKHRoaXMudmFsdWUsIEFuaW1UYXJnZXRWYWx1ZS52ZWNBcnIsIHRoaXMuZ2V0V2VpZ2h0KGluZGV4KSwgdGhpcy52YWx1ZVR5cGUsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgQW5pbUJsZW5kLmJsZW5kKHRoaXMudmFsdWUsIHZhbHVlLCB0aGlzLmdldFdlaWdodChpbmRleCksIHRoaXMudmFsdWVUeXBlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zZXR0ZXIpIHRoaXMuc2V0dGVyKHRoaXMudmFsdWUpO1xuICAgIH1cblxuICAgIHVuYmluZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGVyKSB7XG4gICAgICAgICAgICB0aGlzLnNldHRlcih0aGlzLmJhc2VWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7XG4gICAgQW5pbVRhcmdldFZhbHVlXG59O1xuIl0sIm5hbWVzIjpbIkFuaW1UYXJnZXRWYWx1ZSIsImNvbnN0cnVjdG9yIiwiY29tcG9uZW50IiwidHlwZSIsIl9jb21wb25lbnQiLCJtYXNrIiwiSW50OEFycmF5IiwibGF5ZXJzIiwibGVuZ3RoIiwid2VpZ2h0cyIsIkZsb2F0MzJBcnJheSIsInRvdGFsV2VpZ2h0IiwiY291bnRlciIsImxheWVyQ291bnRlciIsInZhbHVlVHlwZSIsImRpcnR5IiwidmFsdWUiLCJUWVBFX1FVQVQiLCJiYXNlVmFsdWUiLCJzZXR0ZXIiLCJfbm9ybWFsaXplV2VpZ2h0cyIsIm5vcm1hbGl6ZVdlaWdodHMiLCJnZXRXZWlnaHQiLCJpbmRleCIsInVwZGF0ZVdlaWdodHMiLCJtYXRoIiwiY2xhbXAiLCJfbGF5ZXJCbGVuZFR5cGUiLCJibGVuZFR5cGUiLCJzZXRNYXNrIiwiQU5JTV9MQVlFUl9PVkVSV1JJVEUiLCJmaWxsIiwiaSIsIndlaWdodCIsInVwZGF0ZVZhbHVlIiwiQW5pbUJsZW5kIiwic2V0IiwiSURFTlRJVFlfUVVBVF9BUlIiLCJibGVuZCIsIkFOSU1fTEFZRVJfQURESVRJVkUiLCJ2IiwicTEiLCJhVjEiLCJxMiIsImFWMiIsInEzIiwiYVYiLCJpbnZlcnQiLCJtdWwiLCJzbGVycCIsIlF1YXQiLCJJREVOVElUWSIsInF1YXRBcnIiLCJ4IiwieSIsInoiLCJ3IiwidmVjQXJyIiwidW5iaW5kIiwiVFlQRV9WRUMzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLGVBQWUsQ0FBQztBQWlCbEI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLFdBQVdBLENBQUNDLFNBQVMsRUFBRUMsSUFBSSxFQUFFO0lBQ3pCLElBQUksQ0FBQ0MsVUFBVSxHQUFHRixTQUFTLENBQUE7SUFDM0IsSUFBSSxDQUFDRyxJQUFJLEdBQUcsSUFBSUMsU0FBUyxDQUFDSixTQUFTLENBQUNLLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUE7SUFDbEQsSUFBSSxDQUFDQyxPQUFPLEdBQUcsSUFBSUMsWUFBWSxDQUFDUixTQUFTLENBQUNLLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUE7SUFDeEQsSUFBSSxDQUFDRyxXQUFXLEdBQUcsQ0FBQyxDQUFBO0lBQ3BCLElBQUksQ0FBQ0MsT0FBTyxHQUFHLENBQUMsQ0FBQTtJQUNoQixJQUFJLENBQUNDLFlBQVksR0FBRyxDQUFDLENBQUE7SUFDckIsSUFBSSxDQUFDQyxTQUFTLEdBQUdYLElBQUksQ0FBQTtJQUNyQixJQUFJLENBQUNZLEtBQUssR0FBRyxJQUFJLENBQUE7SUFDakIsSUFBSSxDQUFDQyxLQUFLLEdBQUliLElBQUksS0FBS0gsZUFBZSxDQUFDaUIsU0FBUyxHQUFHLENBQUMs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
