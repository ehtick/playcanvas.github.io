/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { Color } from '../../../core/math/color.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { LIGHTSHAPE_PUNCTUAL } from '../../../scene/constants.js';
import { Light, lightTypes } from '../../../scene/light.js';
import { ComponentSystem } from '../system.js';
import { LightComponent, _lightProps } from './component.js';
import { LightComponentData } from './data.js';

/**
 * A Light Component is used to dynamically light the scene.
 *
 * @augments ComponentSystem
 */
class LightComponentSystem extends ComponentSystem {
  /**
   * Create a new LightComponentSystem instance.
   *
   * @param {import('../../app-base.js').AppBase} app - The application.
   * @hideconstructor
   */
  constructor(app) {
    super(app);
    this.id = 'light';
    this.ComponentType = LightComponent;
    this.DataType = LightComponentData;
    this.on('beforeremove', this._onRemoveComponent, this);
  }
  initializeComponentData(component, _data) {
    const properties = _lightProps;

    // duplicate because we're modifying the data
    const data = {};
    for (let i = 0, len = properties.length; i < len; i++) {
      const property = properties[i];
      data[property] = _data[property];
    }
    if (!data.type) data.type = component.data.type;
    component.data.type = data.type;
    if (data.layers && Array.isArray(data.layers)) {
      data.layers = data.layers.slice(0);
    }
    if (data.color && Array.isArray(data.color)) data.color = new Color(data.color[0], data.color[1], data.color[2]);
    if (data.cookieOffset && data.cookieOffset instanceof Array) data.cookieOffset = new Vec2(data.cookieOffset[0], data.cookieOffset[1]);
    if (data.cookieScale && data.cookieScale instanceof Array) data.cookieScale = new Vec2(data.cookieScale[0], data.cookieScale[1]);
    if (data.enable) {
      console.warn('WARNING: enable: Property is deprecated. Set enabled property instead.');
      data.enabled = data.enable;
    }
    if (!data.shape) {
      data.shape = LIGHTSHAPE_PUNCTUAL;
    }
    const light = new Light(this.app.graphicsDevice);
    light.type = lightTypes[data.type];
    light._node = component.entity;
    light._scene = this.app.scene;
    component.data.light = light;
    super.initializeComponentData(component, data, properties);
  }
  _onRemoveComponent(entity, component) {
    component.onRemove();
  }
  cloneComponent(entity, clone) {
    const light = entity.light;
    const data = [];
    let name;
    const _props = _lightProps;
    for (let i = 0; i < _props.length; i++) {
      name = _props[i];
      if (name === 'light') continue;
      if (light[name] && light[name].clone) {
        data[name] = light[name].clone();
      } else {
        data[name] = light[name];
      }
    }
    return this.addComponent(clone, data);
  }
  changeType(component, oldValue, newValue) {
    if (oldValue !== newValue) {
      component.light.type = lightTypes[newValue];
    }
  }
}

export { LightComponentSystem };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvbGlnaHQvc3lzdGVtLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vY29yZS9tYXRoL2NvbG9yLmpzJztcbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuLi8uLi8uLi9jb3JlL21hdGgvdmVjMi5qcyc7XG5cbmltcG9ydCB7IExJR0hUU0hBUEVfUFVOQ1RVQUwgfSBmcm9tICcuLi8uLi8uLi9zY2VuZS9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgTGlnaHQsIGxpZ2h0VHlwZXMgfSBmcm9tICcuLi8uLi8uLi9zY2VuZS9saWdodC5qcyc7XG5cbmltcG9ydCB7IENvbXBvbmVudFN5c3RlbSB9IGZyb20gJy4uL3N5c3RlbS5qcyc7XG5cbmltcG9ydCB7IF9saWdodFByb3BzLCBMaWdodENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50LmpzJztcbmltcG9ydCB7IExpZ2h0Q29tcG9uZW50RGF0YSB9IGZyb20gJy4vZGF0YS5qcyc7XG5cbi8qKlxuICogQSBMaWdodCBDb21wb25lbnQgaXMgdXNlZCB0byBkeW5hbWljYWxseSBsaWdodCB0aGUgc2NlbmUuXG4gKlxuICogQGF1Z21lbnRzIENvbXBvbmVudFN5c3RlbVxuICovXG5jbGFzcyBMaWdodENvbXBvbmVudFN5c3RlbSBleHRlbmRzIENvbXBvbmVudFN5c3RlbSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IExpZ2h0Q29tcG9uZW50U3lzdGVtIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4uLy4uL2FwcC1iYXNlLmpzJykuQXBwQmFzZX0gYXBwIC0gVGhlIGFwcGxpY2F0aW9uLlxuICAgICAqIEBoaWRlY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihhcHApIHtcbiAgICAgICAgc3VwZXIoYXBwKTtcblxuICAgICAgICB0aGlzLmlkID0gJ2xpZ2h0JztcblxuICAgICAgICB0aGlzLkNvbXBvbmVudFR5cGUgPSBMaWdodENvbXBvbmVudDtcbiAgICAgICAgdGhpcy5EYXRhVHlwZSA9IExpZ2h0Q29tcG9uZW50RGF0YTtcblxuICAgICAgICB0aGlzLm9uKCdiZWZvcmVyZW1vdmUnLCB0aGlzLl9vblJlbW92ZUNvbXBvbmVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZUNvbXBvbmVudERhdGEoY29tcG9uZW50LCBfZGF0YSkge1xuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0gX2xpZ2h0UHJvcHM7XG5cbiAgICAgICAgLy8gZHVwbGljYXRlIGJlY2F1c2Ugd2UncmUgbW9kaWZ5aW5nIHRoZSBkYXRhXG4gICAgICAgIGNvbnN0IGRhdGEgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHByb3BlcnRpZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5ID0gcHJvcGVydGllc1tpXTtcbiAgICAgICAgICAgIGRhdGFbcHJvcGVydHldID0gX2RhdGFbcHJvcGVydHldO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFkYXRhLnR5cGUpXG4gICAgICAgICAgICBkYXRhLnR5cGUgPSBjb21wb25lbnQuZGF0YS50eXBlO1xuXG4gICAgICAgIGNvbXBvbmVudC5kYXRhLnR5cGUgPSBkYXRhLnR5cGU7XG5cbiAgICAgICAgaWYgKGRhdGEubGF5ZXJzICYmIEFycmF5LmlzQXJyYXkoZGF0YS5sYXllcnMpKSB7XG4gICAgICAgICAgICBkYXRhLmxheWVycyA9IGRhdGEubGF5ZXJzLnNsaWNlKDApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGEuY29sb3IgJiYgQXJyYXkuaXNBcnJheShkYXRhLmNvbG9yKSlcbiAgICAgICAgICAgIGRhdGEuY29sb3IgPSBuZXcgQ29sb3IoZGF0YS5jb2xvclswXSwgZGF0YS5jb2xvclsxXSwgZGF0YS5jb2xvclsyXSk7XG5cbiAgICAgICAgaWYgKGRhdGEuY29va2llT2Zmc2V0ICYmIGRhdGEuY29va2llT2Zmc2V0IGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICAgICBkYXRhLmNvb2tpZU9mZnNldCA9IG5ldyBWZWMyKGRhdGEuY29va2llT2Zmc2V0WzBdLCBkYXRhLmNvb2tpZU9mZnNldFsxXSk7XG5cbiAgICAgICAgaWYgKGRhdGEuY29va2llU2NhbGUgJiYgZGF0YS5jb29raWVTY2FsZSBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgZGF0YS5jb29raWVTY2FsZSA9IG5ldyBWZWMyKGRhdGEuY29va2llU2NhbGVbMF0sIGRhdGEuY29va2llU2NhbGVbMV0pO1xuXG4gICAgICAgIGlmIChkYXRhLmVuYWJsZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdXQVJOSU5HOiBlbmFibGU6IFByb3BlcnR5IGlzIGRlcHJlY2F0ZWQuIFNldCBlbmFibGVkIHByb3BlcnR5IGluc3RlYWQuJyk7XG4gICAgICAgICAgICBkYXRhLmVuYWJsZWQgPSBkYXRhLmVuYWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZGF0YS5zaGFwZSkge1xuICAgICAgICAgICAgZGF0YS5zaGFwZSA9IExJR0hUU0hBUEVfUFVOQ1RVQUw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsaWdodCA9IG5ldyBMaWdodCh0aGlzLmFwcC5ncmFwaGljc0RldmljZSk7XG4gICAgICAgIGxpZ2h0LnR5cGUgPSBsaWdodFR5cGVzW2RhdGEudHlwZV07XG4gICAgICAgIGxpZ2h0Ll9ub2RlID0gY29tcG9uZW50LmVudGl0eTtcbiAgICAgICAgbGlnaHQuX3NjZW5lID0gdGhpcy5hcHAuc2NlbmU7XG4gICAgICAgIGNvbXBvbmVudC5kYXRhLmxpZ2h0ID0gbGlnaHQ7XG5cbiAgICAgICAgc3VwZXIuaW5pdGlhbGl6ZUNvbXBvbmVudERhdGEoY29tcG9uZW50LCBkYXRhLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICBfb25SZW1vdmVDb21wb25lbnQoZW50aXR5LCBjb21wb25lbnQpIHtcbiAgICAgICAgY29tcG9uZW50Lm9uUmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgY2xvbmVDb21wb25lbnQoZW50aXR5LCBjbG9uZSkge1xuICAgICAgICBjb25zdCBsaWdodCA9IGVudGl0eS5saWdodDtcblxuICAgICAgICBjb25zdCBkYXRhID0gW107XG4gICAgICAgIGxldCBuYW1lO1xuICAgICAgICBjb25zdCBfcHJvcHMgPSBfbGlnaHRQcm9wcztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBfcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5hbWUgPSBfcHJvcHNbaV07XG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gJ2xpZ2h0JykgY29udGludWU7XG4gICAgICAgICAgICBpZiAobGlnaHRbbmFtZV0gJiYgbGlnaHRbbmFtZV0uY2xvbmUpIHtcbiAgICAgICAgICAgICAgICBkYXRhW25hbWVdID0gbGlnaHRbbmFtZV0uY2xvbmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGF0YVtuYW1lXSA9IGxpZ2h0W25hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkQ29tcG9uZW50KGNsb25lLCBkYXRhKTtcbiAgICB9XG5cbiAgICBjaGFuZ2VUeXBlKGNvbXBvbmVudCwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5saWdodC50eXBlID0gbGlnaHRUeXBlc1tuZXdWYWx1ZV07XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IExpZ2h0Q29tcG9uZW50U3lzdGVtIH07XG4iXSwibmFtZXMiOlsiTGlnaHRDb21wb25lbnRTeXN0ZW0iLCJDb21wb25lbnRTeXN0ZW0iLCJjb25zdHJ1Y3RvciIsImFwcCIsImlkIiwiQ29tcG9uZW50VHlwZSIsIkxpZ2h0Q29tcG9uZW50IiwiRGF0YVR5cGUiLCJMaWdodENvbXBvbmVudERhdGEiLCJvbiIsIl9vblJlbW92ZUNvbXBvbmVudCIsImluaXRpYWxpemVDb21wb25lbnREYXRhIiwiY29tcG9uZW50IiwiX2RhdGEiLCJwcm9wZXJ0aWVzIiwiX2xpZ2h0UHJvcHMiLCJkYXRhIiwiaSIsImxlbiIsImxlbmd0aCIsInByb3BlcnR5IiwidHlwZSIsImxheWVycyIsIkFycmF5IiwiaXNBcnJheSIsInNsaWNlIiwiY29sb3IiLCJDb2xvciIsImNvb2tpZU9mZnNldCIsIlZlYzIiLCJjb29raWVTY2FsZSIsImVuYWJsZSIsImNvbnNvbGUiLCJ3YXJuIiwiZW5hYmxlZCIsInNoYXBlIiwiTElHSFRTSEFQRV9QVU5DVFVBTCIsImxpZ2h0IiwiTGlnaHQiLCJncmFwaGljc0RldmljZSIsImxpZ2h0VHlwZXMiLCJfbm9kZSIsImVudGl0eSIsIl9zY2VuZSIsInNjZW5lIiwib25SZW1vdmUiLCJjbG9uZUNvbXBvbmVudCIsImNsb25lIiwibmFtZSIsIl9wcm9wcyIsImFkZENvbXBvbmVudCIsImNoYW5nZVR5cGUiLCJvbGRWYWx1ZSIsIm5ld1ZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLG9CQUFvQixTQUFTQyxlQUFlLENBQUM7QUFDL0M7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0lDLFdBQVdBLENBQUNDLEdBQUcsRUFBRTtJQUNiLEtBQUssQ0FBQ0EsR0FBRyxDQUFDLENBQUE7SUFFVixJQUFJLENBQUNDLEVBQUUsR0FBRyxPQUFPLENBQUE7SUFFakIsSUFBSSxDQUFDQyxhQUFhLEdBQUdDLGNBQWMsQ0FBQTtJQUNuQyxJQUFJLENBQUNDLFFBQVEsR0FBR0Msa0JBQWtCLENBQUE7SUFFbEMsSUFBSSxDQUFDQyxFQUFFLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQ0Ms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
