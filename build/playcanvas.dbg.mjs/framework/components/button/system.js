/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { Component } from '../component.js';
import { ComponentSystem } from '../system.js';
import { ButtonComponent } from './component.js';
import { ButtonComponentData } from './data.js';

const _schema = ['enabled', 'active', {
  name: 'imageEntity',
  type: 'entity'
}, {
  name: 'hitPadding',
  type: 'vec4'
}, 'transitionMode', {
  name: 'hoverTint',
  type: 'rgba'
}, {
  name: 'pressedTint',
  type: 'rgba'
}, {
  name: 'inactiveTint',
  type: 'rgba'
}, 'fadeDuration', 'hoverSpriteAsset', 'hoverSpriteFrame', 'pressedSpriteAsset', 'pressedSpriteFrame', 'inactiveSpriteAsset', 'inactiveSpriteFrame'];

/**
 * Manages creation of {@link ButtonComponent}s.
 *
 * @augments ComponentSystem
 */
class ButtonComponentSystem extends ComponentSystem {
  /**
   * Create a new ButtonComponentSystem.
   *
   * @param {import('../../app-base.js').AppBase} app - The application.
   * @hideconstructor
   */
  constructor(app) {
    super(app);
    this.id = 'button';
    this.ComponentType = ButtonComponent;
    this.DataType = ButtonComponentData;
    this.schema = _schema;
    this.on('beforeremove', this._onRemoveComponent, this);
    this.app.systems.on('update', this.onUpdate, this);
  }
  initializeComponentData(component, data, properties) {
    super.initializeComponentData(component, data, _schema);
  }
  onUpdate(dt) {
    const components = this.store;
    for (const id in components) {
      const entity = components[id].entity;
      const component = entity.button;
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
Component._buildAccessors(ButtonComponent.prototype, _schema);

export { ButtonComponentSystem };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvYnV0dG9uL3N5c3RlbS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgQ29tcG9uZW50U3lzdGVtIH0gZnJvbSAnLi4vc3lzdGVtLmpzJztcblxuaW1wb3J0IHsgQnV0dG9uQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgQnV0dG9uQ29tcG9uZW50RGF0YSB9IGZyb20gJy4vZGF0YS5qcyc7XG5cbmNvbnN0IF9zY2hlbWEgPSBbXG4gICAgJ2VuYWJsZWQnLFxuICAgICdhY3RpdmUnLFxuICAgIHsgbmFtZTogJ2ltYWdlRW50aXR5JywgdHlwZTogJ2VudGl0eScgfSxcbiAgICB7IG5hbWU6ICdoaXRQYWRkaW5nJywgdHlwZTogJ3ZlYzQnIH0sXG4gICAgJ3RyYW5zaXRpb25Nb2RlJyxcbiAgICB7IG5hbWU6ICdob3ZlclRpbnQnLCB0eXBlOiAncmdiYScgfSxcbiAgICB7IG5hbWU6ICdwcmVzc2VkVGludCcsIHR5cGU6ICdyZ2JhJyB9LFxuICAgIHsgbmFtZTogJ2luYWN0aXZlVGludCcsIHR5cGU6ICdyZ2JhJyB9LFxuICAgICdmYWRlRHVyYXRpb24nLFxuICAgICdob3ZlclNwcml0ZUFzc2V0JyxcbiAgICAnaG92ZXJTcHJpdGVGcmFtZScsXG4gICAgJ3ByZXNzZWRTcHJpdGVBc3NldCcsXG4gICAgJ3ByZXNzZWRTcHJpdGVGcmFtZScsXG4gICAgJ2luYWN0aXZlU3ByaXRlQXNzZXQnLFxuICAgICdpbmFjdGl2ZVNwcml0ZUZyYW1lJ1xuXTtcblxuLyoqXG4gKiBNYW5hZ2VzIGNyZWF0aW9uIG9mIHtAbGluayBCdXR0b25Db21wb25lbnR9cy5cbiAqXG4gKiBAYXVnbWVudHMgQ29tcG9uZW50U3lzdGVtXG4gKi9cbmNsYXNzIEJ1dHRvbkNvbXBvbmVudFN5c3RlbSBleHRlbmRzIENvbXBvbmVudFN5c3RlbSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IEJ1dHRvbkNvbXBvbmVudFN5c3RlbS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi8uLi9hcHAtYmFzZS5qcycpLkFwcEJhc2V9IGFwcCAtIFRoZSBhcHBsaWNhdGlvbi5cbiAgICAgKiBAaGlkZWNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXBwKSB7XG4gICAgICAgIHN1cGVyKGFwcCk7XG5cbiAgICAgICAgdGhpcy5pZCA9ICdidXR0b24nO1xuXG4gICAgICAgIHRoaXMuQ29tcG9uZW50VHlwZSA9IEJ1dHRvbkNvbXBvbmVudDtcbiAgICAgICAgdGhpcy5EYXRhVHlwZSA9IEJ1dHRvbkNvbXBvbmVudERhdGE7XG5cbiAgICAgICAgdGhpcy5zY2hlbWEgPSBfc2NoZW1hO1xuXG4gICAgICAgIHRoaXMub24oJ2JlZm9yZXJlbW92ZScsIHRoaXMuX29uUmVtb3ZlQ29tcG9uZW50LCB0aGlzKTtcblxuICAgICAgICB0aGlzLmFwcC5zeXN0ZW1zLm9uKCd1cGRhdGUnLCB0aGlzLm9uVXBkYXRlLCB0aGlzKTtcbiAgICB9XG5cbiAgICBpbml0aWFsaXplQ29tcG9uZW50RGF0YShjb21wb25lbnQsIGRhdGEsIHByb3BlcnRpZXMpIHtcbiAgICAgICAgc3VwZXIuaW5pdGlhbGl6ZUNvbXBvbmVudERhdGEoY29tcG9uZW50LCBkYXRhLCBfc2NoZW1hKTtcbiAgICB9XG5cbiAgICBvblVwZGF0ZShkdCkge1xuICAgICAgICBjb25zdCBjb21wb25lbnRzID0gdGhpcy5zdG9yZTtcblxuICAgICAgICBmb3IgKGNvbnN0IGlkIGluIGNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGVudGl0eSA9IGNvbXBvbmVudHNbaWRdLmVudGl0eTtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGVudGl0eS5idXR0b247XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50LmVuYWJsZWQgJiYgZW50aXR5LmVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQub25VcGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vblJlbW92ZUNvbXBvbmVudChlbnRpdHksIGNvbXBvbmVudCkge1xuICAgICAgICBjb21wb25lbnQub25SZW1vdmUoKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBzdXBlci5kZXN0cm95KCk7XG5cbiAgICAgICAgdGhpcy5hcHAuc3lzdGVtcy5vZmYoJ3VwZGF0ZScsIHRoaXMub25VcGRhdGUsIHRoaXMpO1xuICAgIH1cbn1cblxuQ29tcG9uZW50Ll9idWlsZEFjY2Vzc29ycyhCdXR0b25Db21wb25lbnQucHJvdG90eXBlLCBfc2NoZW1hKTtcblxuZXhwb3J0IHsgQnV0dG9uQ29tcG9uZW50U3lzdGVtIH07XG4iXSwibmFtZXMiOlsiX3NjaGVtYSIsIm5hbWUiLCJ0eXBlIiwiQnV0dG9uQ29tcG9uZW50U3lzdGVtIiwiQ29tcG9uZW50U3lzdGVtIiwiY29uc3RydWN0b3IiLCJhcHAiLCJpZCIsIkNvbXBvbmVudFR5cGUiLCJCdXR0b25Db21wb25lbnQiLCJEYXRhVHlwZSIsIkJ1dHRvbkNvbXBvbmVudERhdGEiLCJzY2hlbWEiLCJvbiIsIl9vblJlbW92ZUNvbXBvbmVudCIsInN5c3RlbXMiLCJvblVwZGF0ZSIsImluaXRpYWxpemVDb21wb25lbnREYXRhIiwiY29tcG9uZW50IiwiZGF0YSIsInByb3BlcnRpZXMiLCJkdCIsImNvbXBvbmVudHMiLCJzdG9yZSIsImVudGl0eSIsImJ1dHRvbiIsImVuYWJsZWQiLCJvblJlbW92ZSIsImRlc3Ryb3kiLCJvZmYiLCJDb21wb25lbnQiLCJfYnVpbGRBY2Nlc3NvcnMiLCJwcm90b3R5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFNQSxNQUFNQSxPQUFPLEdBQUcsQ0FDWixTQUFTLEVBQ1Qs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
