/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Component } from '../component.js';
import { ComponentSystem } from '../system.js';
import { ScrollViewComponent } from './component.js';
import { ScrollViewComponentData } from './data.js';
import { Vec2 } from '../../../core/math/vec2.js';

const _schema = [{
  name: 'enabled',
  type: 'boolean'
}, {
  name: 'horizontal',
  type: 'boolean'
}, {
  name: 'vertical',
  type: 'boolean'
}, {
  name: 'scrollMode',
  type: 'number'
}, {
  name: 'bounceAmount',
  type: 'number'
}, {
  name: 'friction',
  type: 'number'
}, {
  name: 'dragThreshold',
  type: 'number'
}, {
  name: 'useMouseWheel',
  type: 'boolean'
}, {
  name: 'mouseWheelSensitivity',
  type: 'vec2'
}, {
  name: 'horizontalScrollbarVisibility',
  type: 'number'
}, {
  name: 'verticalScrollbarVisibility',
  type: 'number'
}, {
  name: 'viewportEntity',
  type: 'entity'
}, {
  name: 'contentEntity',
  type: 'entity'
}, {
  name: 'horizontalScrollbarEntity',
  type: 'entity'
}, {
  name: 'verticalScrollbarEntity',
  type: 'entity'
}];
const DEFAULT_DRAG_THRESHOLD = 10;

class ScrollViewComponentSystem extends ComponentSystem {
  constructor(app) {
    super(app);
    this.id = 'scrollview';
    this.ComponentType = ScrollViewComponent;
    this.DataType = ScrollViewComponentData;
    this.schema = _schema;
    this.on('beforeremove', this._onRemoveComponent, this);
    this.app.systems.on('update', this.onUpdate, this);
  }
  initializeComponentData(component, data, properties) {
    if (data.dragThreshold === undefined) {
      data.dragThreshold = DEFAULT_DRAG_THRESHOLD;
    }
    if (data.useMouseWheel === undefined) {
      data.useMouseWheel = true;
    }
    if (data.mouseWheelSensitivity === undefined) {
      data.mouseWheelSensitivity = new Vec2(1, 1);
    }
    super.initializeComponentData(component, data, _schema);
  }
  onUpdate(dt) {
    const components = this.store;
    for (const id in components) {
      const entity = components[id].entity;
      const component = entity.scrollview;
      if (component.enabled && entity.enabled) {
        component.onUpdate();
      }
    }
  }
  _onRemoveComponent(entity, component) {
    component.onRemove();
  }
  destroy() {
    super.destroy();
    this.app.systems.off('update', this.onUpdate, this);
  }
}
Component._buildAccessors(ScrollViewComponent.prototype, _schema);

export { ScrollViewComponentSystem };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvc2Nyb2xsLXZpZXcvc3lzdGVtLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5pbXBvcnQgeyBDb21wb25lbnRTeXN0ZW0gfSBmcm9tICcuLi9zeXN0ZW0uanMnO1xuXG5pbXBvcnQgeyBTY3JvbGxWaWV3Q29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgU2Nyb2xsVmlld0NvbXBvbmVudERhdGEgfSBmcm9tICcuL2RhdGEuanMnO1xuXG5pbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi4vLi4vLi4vY29yZS9tYXRoL3ZlYzIuanMnO1xuXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi4vLi4vYXBwLWJhc2UuanMnKS5BcHBCYXNlfSBBcHBCYXNlICovXG5cbmNvbnN0IF9zY2hlbWEgPSBbXG4gICAgeyBuYW1lOiAnZW5hYmxlZCcsIHR5cGU6ICdib29sZWFuJyB9LFxuICAgIHsgbmFtZTogJ2hvcml6b250YWwnLCB0eXBlOiAnYm9vbGVhbicgfSxcbiAgICB7IG5hbWU6ICd2ZXJ0aWNhbCcsIHR5cGU6ICdib29sZWFuJyB9LFxuICAgIHsgbmFtZTogJ3Njcm9sbE1vZGUnLCB0eXBlOiAnbnVtYmVyJyB9LFxuICAgIHsgbmFtZTogJ2JvdW5jZUFtb3VudCcsIHR5cGU6ICdudW1iZXInIH0sXG4gICAgeyBuYW1lOiAnZnJpY3Rpb24nLCB0eXBlOiAnbnVtYmVyJyB9LFxuICAgIHsgbmFtZTogJ2RyYWdUaHJlc2hvbGQnLCB0eXBlOiAnbnVtYmVyJyB9LFxuICAgIHsgbmFtZTogJ3VzZU1vdXNlV2hlZWwnLCB0eXBlOiAnYm9vbGVhbicgfSxcbiAgICB7IG5hbWU6ICdtb3VzZVdoZWVsU2Vuc2l0aXZpdHknLCB0eXBlOiAndmVjMicgfSxcbiAgICB7IG5hbWU6ICdob3Jpem9udGFsU2Nyb2xsYmFyVmlzaWJpbGl0eScsIHR5cGU6ICdudW1iZXInIH0sXG4gICAgeyBuYW1lOiAndmVydGljYWxTY3JvbGxiYXJWaXNpYmlsaXR5JywgdHlwZTogJ251bWJlcicgfSxcbiAgICB7IG5hbWU6ICd2aWV3cG9ydEVudGl0eScsIHR5cGU6ICdlbnRpdHknIH0sXG4gICAgeyBuYW1lOiAnY29udGVudEVudGl0eScsIHR5cGU6ICdlbnRpdHknIH0sXG4gICAgeyBuYW1lOiAnaG9yaXpvbnRhbFNjcm9sbGJhckVudGl0eScsIHR5cGU6ICdlbnRpdHknIH0sXG4gICAgeyBuYW1lOiAndmVydGljYWxTY3JvbGxiYXJFbnRpdHknLCB0eXBlOiAnZW50aXR5JyB9XG5dO1xuXG5jb25zdCBERUZBVUxUX0RSQUdfVEhSRVNIT0xEID0gMTA7XG5cbi8qKlxuICogTWFuYWdlcyBjcmVhdGlvbiBvZiB7QGxpbmsgU2Nyb2xsVmlld0NvbXBvbmVudH1zLlxuICpcbiAqIEBhdWdtZW50cyBDb21wb25lbnRTeXN0ZW1cbiAqL1xuY2xhc3MgU2Nyb2xsVmlld0NvbXBvbmVudFN5c3RlbSBleHRlbmRzIENvbXBvbmVudFN5c3RlbSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IFNjcm9sbFZpZXdDb21wb25lbnRTeXN0ZW0gaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FwcEJhc2V9IGFwcCAtIFRoZSBhcHBsaWNhdGlvbi5cbiAgICAgKiBAaGlkZWNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXBwKSB7XG4gICAgICAgIHN1cGVyKGFwcCk7XG5cbiAgICAgICAgdGhpcy5pZCA9ICdzY3JvbGx2aWV3JztcblxuICAgICAgICB0aGlzLkNvbXBvbmVudFR5cGUgPSBTY3JvbGxWaWV3Q29tcG9uZW50O1xuICAgICAgICB0aGlzLkRhdGFUeXBlID0gU2Nyb2xsVmlld0NvbXBvbmVudERhdGE7XG5cbiAgICAgICAgdGhpcy5zY2hlbWEgPSBfc2NoZW1hO1xuXG4gICAgICAgIHRoaXMub24oJ2JlZm9yZXJlbW92ZScsIHRoaXMuX29uUmVtb3ZlQ29tcG9uZW50LCB0aGlzKTtcblxuICAgICAgICB0aGlzLmFwcC5zeXN0ZW1zLm9uKCd1cGRhdGUnLCB0aGlzLm9uVXBkYXRlLCB0aGlzKTtcbiAgICB9XG5cbiAgICBpbml0aWFsaXplQ29tcG9uZW50RGF0YShjb21wb25lbnQsIGRhdGEsIHByb3BlcnRpZXMpIHtcbiAgICAgICAgaWYgKGRhdGEuZHJhZ1RocmVzaG9sZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkYXRhLmRyYWdUaHJlc2hvbGQgPSBERUZBVUxUX0RSQUdfVEhSRVNIT0xEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhLnVzZU1vdXNlV2hlZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGF0YS51c2VNb3VzZVdoZWVsID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5tb3VzZVdoZWVsU2Vuc2l0aXZpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGF0YS5tb3VzZVdoZWVsU2Vuc2l0aXZpdHkgPSBuZXcgVmVjMigxLCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyLmluaXRpYWxpemVDb21wb25lbnREYXRhKGNvbXBvbmVudCwgZGF0YSwgX3NjaGVtYSk7XG4gICAgfVxuXG4gICAgb25VcGRhdGUoZHQpIHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IHRoaXMuc3RvcmU7XG5cbiAgICAgICAgZm9yIChjb25zdCBpZCBpbiBjb21wb25lbnRzKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRpdHkgPSBjb21wb25lbnRzW2lkXS5lbnRpdHk7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBlbnRpdHkuc2Nyb2xsdmlldztcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuZW5hYmxlZCAmJiBlbnRpdHkuZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5vblVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25SZW1vdmVDb21wb25lbnQoZW50aXR5LCBjb21wb25lbnQpIHtcbiAgICAgICAgY29tcG9uZW50Lm9uUmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xuXG4gICAgICAgIHRoaXMuYXBwLnN5c3RlbXMub2ZmKCd1cGRhdGUnLCB0aGlzLm9uVXBkYXRlLCB0aGlzKTtcbiAgICB9XG59XG5cbkNvbXBvbmVudC5fYnVpbGRBY2Nlc3NvcnMoU2Nyb2xsVmlld0NvbXBvbmVudC5wcm90b3R5cGUsIF9zY2hlbWEpO1xuXG5leHBvcnQgeyBTY3JvbGxWaWV3Q29tcG9uZW50U3lzdGVtIH07XG4iXSwibmFtZXMiOlsiX3NjaGVtYSIsIm5hbWUiLCJ0eXBlIiwiREVGQVVMVF9EUkFHX1RIUkVTSE9MRCIsIlNjcm9sbFZpZXdDb21wb25lbnRTeXN0ZW0iLCJDb21wb25lbnRTeXN0ZW0iLCJjb25zdHJ1Y3RvciIsImFwcCIsImlkIiwiQ29tcG9uZW50VHlwZSIsIlNjcm9sbFZpZXdDb21wb25lbnQiLCJEYXRhVHlwZSIsIlNjcm9sbFZpZXdDb21wb25lbnREYXRhIiwic2NoZW1hIiwib24iLCJfb25SZW1vdmVDb21wb25lbnQiLCJzeXN0ZW1zIiwib25VcGRhdGUiLCJpbml0aWFsaXplQ29tcG9uZW50RGF0YSIsImNvbXBvbmVudCIsImRhdGEiLCJwcm9wZXJ0aWVzIiwiZHJhZ1RocmVzaG9sZCIsInVuZGVmaW5lZCIsInVzZU1vdXNlV2hlZWwiLCJtb3VzZVdoZWVsU2Vuc2l0aXZpdHkiLCJWZWMyIiwiZHQiLCJjb21wb25lbnRzIiwic3RvcmUiLCJlbnRpdHkiLCJzY3JvbGx2aWV3IiwiZW5hYmxlZCIsIm9uUmVtb3ZlIiwiZGVzdHJveSIsIm9mZiIsIkNvbXBvbmVudCIsIl9idWlsZEFjY2Vzc29ycyIsInByb3RvdHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFVQSxNQUFNQSxPQUFPLEdBQUcsQ0FDWjtBQUFFQyxFQUFBQSxJQUFJLEVBQUUsU0FBUztBQUFFQyxFQUFBQSxJQUFJLEVBQUUsU0FBQTtBQUFVLENBQUMsRUFDcEM7QUFBRUQsRUFBQUEsSUFBSSxFQUFFLFlBQVk7QUFBRUMsRUFBQUEsSUFBSSxFQUFFLFNBQUE7QUFBVSxDQUFDLEVBQ3ZDO0FBQUVELEVBQUFBLElBQUksRUFBRSxVQUFVO0FBQUVDLEVBQUFBLElBQUksRUFBRSxTQUFBO0FBQVUsQ0FBQyxFQUNyQztBQUFFRCxFQUFBQSxJQUFJLEVBQUUsWUFBWTtBQUFFQyxFQUFBQSxJQUFJLEVBQUUsUUFBQTtBQUFTLENBQUMsRUFDdEM7QUFBRUQsRUFBQUEsSUFBSSxFQUFFLGNBQWM7QUFBRUMsRUFBQUEsSUFBSSxFQUFFLFFBQUE7QUFBUyxDQUFDLEVBQ3hDO0FBQUVELEVBQUFBLElBQUksRUFBRSxVQUFVO0FBQUVDLEVBQUFBLElBQUksRUFBRSxRQUFBO0FBQVMsQ0FBQyxFQUNwQztBQUFFRCxFQUFBQSxJQUFJLEVBQUUsZUFBZTtBQUFFQyxFQUFBQSxJQUFJLEVBQUUsUUFBQTtBQUFTLENBQUMsRUFDekM7QUFBRUQsRUFBQUEsSUFBSSxFQUFFLGVBQWU7QUFBRUMsRUFBQUEsSUFBSSxFQUFFLFNBQUE7QUFBVSxDQUFDLEVBQzFDO0FBQUVELEVBQUFBLElBQUksRUFBRSx1QkFBdUI7QUFBRUMsRUFBQUEsSUFBSSxFQUFFLE1BQUE7QUFBTyxDQUFDLEVBQy9DO0FBQUVELEVBQUFBLElBQUksRUFBRSwrQkFBK0I7QUFBRUMsRUFBQUEsSUFBSSxFQUFFLFFBQUE7QUFBUyxDQUFDLEVBQ3pEO0FBQUVELEVBQUFBLElBQUksRUFBRSw2QkFBNkI7QUFBRUMsRUFBQUEsSUFBSSxFQUFFLFFBQUE7QUFBUyxDQUFDLEVBQ3ZEO0FBQUVELEVBQUFBLElBQUksRUFBRSxnQkFBZ0I7QUFBRUMsRUFBQUEsSUFBSSxFQUFFLFFBQUE7QUFBUyxDQUFDLEVBQzFDO0FBQUVELEVBQUFBLElBQUksRUFBRSxlQUFlO0FBQUVDLEVBQUFBLElBQUksRUFBRSxRQUFBO0FBQVMsQ0FBQyxFQUN6QztBQUFFRCxFQUFBQSxJQUFJLEVBQUUsMkJBQTJCO0FBQUVDLEVBQUFBLElBQUksRUFBRSxRQUFBO0FBQVMsQ0FBQyxFQUNyRDtBQUFFRCxFQUFBQSxJQUFJLEVBQUUseUJBQXlCO0FBQUVDLEVBQUFBLElBQUksRUFBRSxRQUFBO0FBQVMsQ0FBQyxDQUN0RCxDQUFBO0FBRUQsTUFBTUMsc0JBQXNCLEdBQUcsRUFBRSxDQUFBOztBQU9qQyxNQUFNQyx5QkFBeUIsU0FBU0MsZUFBZSxDQUFDO0VBT3BEQyxXQUFXLENBQUNDLEdBQUcsRUFBRTtJQUNiLEtBQUssQ0FBQ0EsR0FBRyxDQUFDLENBQUE7SUFFVixJQUFJLENBQUNDLEVBQUUsR0FBRyxZQUFZLENBQUE7SUFFdEIsSUFBSSxDQUFDQyxhQUFhLEdBQUdDLG1CQUFtQixDQUFBO0lBQ3hDLElBQUksQ0FBQ0MsUUFBUSxHQUFHQyx1QkFBdUIsQ0FBQTtJQUV2QyxJQUFJLENBQUNDLE1BQU0sR0FBR2IsT0FBTyxDQUFBO0lBRXJCLElBQUksQ0FBQ2MsRUFBRSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUNDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFBO0FBRXRELElBQUEsSUFBSSxDQUFDUixHQUFHLENBQUNTLE9BQU8sQ0FBQ0YsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUNHLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUN0RCxHQUFBO0FBRUFDLEVBQUFBLHVCQUF1QixDQUFDQyxTQUFTLEVBQUVDLElBQUksRUFBRUMsVUFBVSxFQUFFO0FBQ2pELElBQUEsSUFBSUQsSUFBSSxDQUFDRSxhQUFhLEtBQUtDLFNBQVMsRUFBRTtNQUNsQ0gsSUFBSSxDQUFDRSxhQUFhLEdBQUduQixzQkFBc0IsQ0FBQTtBQUMvQyxLQUFBO0FBQ0EsSUFBQSxJQUFJaUIsSUFBSSxDQUFDSSxhQUFhLEtBQUtELFNBQVMsRUFBRTtNQUNsQ0gsSUFBSSxDQUFDSSxhQUFhLEdBQUcsSUFBSSxDQUFBO0FBQzdCLEtBQUE7QUFDQSxJQUFBLElBQUlKLElBQUksQ0FBQ0sscUJBQXFCLEtBQUtGLFNBQVMsRUFBRTtNQUMxQ0gsSUFBSSxDQUFDSyxxQkFBcUIsR0FBRyxJQUFJQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQy9DLEtBQUE7SUFFQSxLQUFLLENBQUNSLHVCQUF1QixDQUFDQyxTQUFTLEVBQUVDLElBQUksRUFBRXBCLE9BQU8sQ0FBQyxDQUFBO0FBQzNELEdBQUE7RUFFQWlCLFFBQVEsQ0FBQ1UsRUFBRSxFQUFFO0FBQ1QsSUFBQSxNQUFNQyxVQUFVLEdBQUcsSUFBSSxDQUFDQyxLQUFLLENBQUE7QUFFN0IsSUFBQSxLQUFLLE1BQU1yQixFQUFFLElBQUlvQixVQUFVLEVBQUU7QUFDekIsTUFBQSxNQUFNRSxNQUFNLEdBQUdGLFVBQVUsQ0FBQ3BCLEVBQUUsQ0FBQyxDQUFDc0IsTUFBTSxDQUFBO0FBQ3BDLE1BQUEsTUFBTVgsU0FBUyxHQUFHVyxNQUFNLENBQUNDLFVBQVUsQ0FBQTtBQUNuQyxNQUFBLElBQUlaLFNBQVMsQ0FBQ2EsT0FBTyxJQUFJRixNQUFNLENBQUNFLE9BQU8sRUFBRTtRQUNyQ2IsU0FBUyxDQUFDRixRQUFRLEVBQUUsQ0FBQTtBQUN4QixPQUFBO0FBRUosS0FBQTtBQUNKLEdBQUE7QUFFQUYsRUFBQUEsa0JBQWtCLENBQUNlLE1BQU0sRUFBRVgsU0FBUyxFQUFFO0lBQ2xDQSxTQUFTLENBQUNjLFFBQVEsRUFBRSxDQUFBO0FBQ3hCLEdBQUE7QUFFQUMsRUFBQUEsT0FBTyxHQUFHO0lBQ04sS0FBSyxDQUFDQSxPQUFPLEVBQUUsQ0FBQTtBQUVmLElBQUEsSUFBSSxDQUFDM0IsR0FBRyxDQUFDUyxPQUFPLENBQUNtQixHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQ2xCLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUN2RCxHQUFBO0FBQ0osQ0FBQTtBQUVBbUIsU0FBUyxDQUFDQyxlQUFlLENBQUMzQixtQkFBbUIsQ0FBQzRCLFNBQVMsRUFBRXRDLE9BQU8sQ0FBQzs7OzsifQ==
