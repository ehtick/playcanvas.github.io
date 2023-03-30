/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { EventHandler } from '../../core/event-handler.js';
import { Color } from '../../core/math/color.js';
import { Vec2 } from '../../core/math/vec2.js';
import { Vec3 } from '../../core/math/vec3.js';
import { Vec4 } from '../../core/math/vec4.js';

/**
 * Component Systems contain the logic and functionality to update all Components of a particular
 * type.
 *
 * @augments EventHandler
 */
class ComponentSystem extends EventHandler {
  /**
   * Create a new ComponentSystem instance.
   *
   * @param {import('../app-base.js').AppBase} app - The application managing this system.
   */
  constructor(app) {
    super();
    this.app = app;

    // The store where all ComponentData objects are kept
    this.store = {};
    this.schema = [];
  }

  /**
   * Create new {@link Component} and component data instances and attach them to the entity.
   *
   * @param {import('../entity.js').Entity} entity - The Entity to attach this component to.
   * @param {object} [data] - The source data with which to create the component.
   * @returns {import('./component.js').Component} Returns a Component of type defined by the
   * component system.
   * @example
   * var entity = new pc.Entity(app);
   * app.systems.model.addComponent(entity, { type: 'box' });
   * // entity.model is now set to a pc.ModelComponent
   * @ignore
   */
  addComponent(entity, data = {}) {
    const component = new this.ComponentType(this, entity);
    const componentData = new this.DataType();
    this.store[entity.getGuid()] = {
      entity: entity,
      data: componentData
    };
    entity[this.id] = component;
    entity.c[this.id] = component;
    this.initializeComponentData(component, data, []);
    this.fire('add', entity, component);
    return component;
  }

  /**
   * Remove the {@link Component} from the entity and delete the associated component data.
   *
   * @param {import('../entity.js').Entity} entity - The entity to remove the component from.
   * @example
   * app.systems.model.removeComponent(entity);
   * // entity.model === undefined
   * @ignore
   */
  removeComponent(entity) {
    const record = this.store[entity.getGuid()];
    const component = entity.c[this.id];
    this.fire('beforeremove', entity, component);
    delete this.store[entity.getGuid()];
    entity[this.id] = undefined;
    delete entity.c[this.id];
    this.fire('remove', entity, record.data);
  }

  /**
   * Create a clone of component. This creates a copy of all component data variables.
   *
   * @param {import('../entity.js').Entity} entity - The entity to clone the component from.
   * @param {import('../entity.js').Entity} clone - The entity to clone the component into.
   * @returns {import('./component.js').Component} The newly cloned component.
   * @ignore
   */
  cloneComponent(entity, clone) {
    // default clone is just to add a new component with existing data
    const src = this.store[entity.getGuid()];
    return this.addComponent(clone, src.data);
  }

  /**
   * Called during {@link ComponentSystem#addComponent} to initialize the component data in the
   * store. This can be overridden by derived Component Systems and either called by the derived
   * System or replaced entirely.
   *
   * @param {import('./component.js').Component} component - The component being initialized.
   * @param {object} data - The data block used to initialize the component.
   * @param {Array<string | {name: string, type: string}>} properties - The array of property
   * descriptors for the component. A descriptor can be either a plain property name, or an
   * object specifying the name and type.
   * @ignore
   */
  initializeComponentData(component, data = {}, properties) {
    // initialize
    for (let i = 0, len = properties.length; i < len; i++) {
      const descriptor = properties[i];
      let name, type;

      // If the descriptor is an object, it will have `name` and `type` members
      if (typeof descriptor === 'object') {
        name = descriptor.name;
        type = descriptor.type;
      } else {
        // Otherwise, the descriptor is just the property name
        name = descriptor;
        type = undefined;
      }
      let value = data[name];
      if (value !== undefined) {
        // If we know the intended type of the value, convert the raw data
        // into an instance of the specified type.
        if (type !== undefined) {
          value = convertValue(value, type);
        }
        component[name] = value;
      } else {
        component[name] = component.data[name];
      }
    }

    // after component is initialized call onEnable
    if (component.enabled && component.entity.enabled) {
      component.onEnable();
    }
  }

  /**
   * Searches the component schema for properties that match the specified type.
   *
   * @param {string} type - The type to search for.
   * @returns {string[]|object[]} An array of property descriptors matching the specified type.
   * @ignore
   */
  getPropertiesOfType(type) {
    const matchingProperties = [];
    const schema = this.schema || [];
    schema.forEach(function (descriptor) {
      if (descriptor && typeof descriptor === 'object' && descriptor.type === type) {
        matchingProperties.push(descriptor);
      }
    });
    return matchingProperties;
  }
  destroy() {
    this.off();
  }
}
function convertValue(value, type) {
  if (!value) {
    return value;
  }
  switch (type) {
    case 'rgb':
      if (value instanceof Color) {
        return value.clone();
      }
      return new Color(value[0], value[1], value[2]);
    case 'rgba':
      if (value instanceof Color) {
        return value.clone();
      }
      return new Color(value[0], value[1], value[2], value[3]);
    case 'vec2':
      if (value instanceof Vec2) {
        return value.clone();
      }
      return new Vec2(value[0], value[1]);
    case 'vec3':
      if (value instanceof Vec3) {
        return value.clone();
      }
      return new Vec3(value[0], value[1], value[2]);
    case 'vec4':
      if (value instanceof Vec4) {
        return value.clone();
      }
      return new Vec4(value[0], value[1], value[2], value[3]);
    case 'boolean':
    case 'number':
    case 'string':
      return value;
    case 'entity':
      return value;
    // Entity fields should just be a string guid
    default:
      throw new Error('Could not convert unhandled type: ' + type);
  }
}

export { ComponentSystem };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvc3lzdGVtLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50SGFuZGxlciB9IGZyb20gJy4uLy4uL2NvcmUvZXZlbnQtaGFuZGxlci5qcyc7XG5cbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vY29yZS9tYXRoL2NvbG9yLmpzJztcbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuLi8uLi9jb3JlL21hdGgvdmVjMi5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vLi4vY29yZS9tYXRoL3ZlYzMuanMnO1xuaW1wb3J0IHsgVmVjNCB9IGZyb20gJy4uLy4uL2NvcmUvbWF0aC92ZWM0LmpzJztcblxuLyoqXG4gKiBDb21wb25lbnQgU3lzdGVtcyBjb250YWluIHRoZSBsb2dpYyBhbmQgZnVuY3Rpb25hbGl0eSB0byB1cGRhdGUgYWxsIENvbXBvbmVudHMgb2YgYSBwYXJ0aWN1bGFyXG4gKiB0eXBlLlxuICpcbiAqIEBhdWdtZW50cyBFdmVudEhhbmRsZXJcbiAqL1xuY2xhc3MgQ29tcG9uZW50U3lzdGVtIGV4dGVuZHMgRXZlbnRIYW5kbGVyIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgQ29tcG9uZW50U3lzdGVtIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4uL2FwcC1iYXNlLmpzJykuQXBwQmFzZX0gYXBwIC0gVGhlIGFwcGxpY2F0aW9uIG1hbmFnaW5nIHRoaXMgc3lzdGVtLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGFwcCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuYXBwID0gYXBwO1xuXG4gICAgICAgIC8vIFRoZSBzdG9yZSB3aGVyZSBhbGwgQ29tcG9uZW50RGF0YSBvYmplY3RzIGFyZSBrZXB0XG4gICAgICAgIHRoaXMuc3RvcmUgPSB7fTtcbiAgICAgICAgdGhpcy5zY2hlbWEgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbmV3IHtAbGluayBDb21wb25lbnR9IGFuZCBjb21wb25lbnQgZGF0YSBpbnN0YW5jZXMgYW5kIGF0dGFjaCB0aGVtIHRvIHRoZSBlbnRpdHkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vZW50aXR5LmpzJykuRW50aXR5fSBlbnRpdHkgLSBUaGUgRW50aXR5IHRvIGF0dGFjaCB0aGlzIGNvbXBvbmVudCB0by5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW2RhdGFdIC0gVGhlIHNvdXJjZSBkYXRhIHdpdGggd2hpY2ggdG8gY3JlYXRlIHRoZSBjb21wb25lbnQuXG4gICAgICogQHJldHVybnMge2ltcG9ydCgnLi9jb21wb25lbnQuanMnKS5Db21wb25lbnR9IFJldHVybnMgYSBDb21wb25lbnQgb2YgdHlwZSBkZWZpbmVkIGJ5IHRoZVxuICAgICAqIGNvbXBvbmVudCBzeXN0ZW0uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgZW50aXR5ID0gbmV3IHBjLkVudGl0eShhcHApO1xuICAgICAqIGFwcC5zeXN0ZW1zLm1vZGVsLmFkZENvbXBvbmVudChlbnRpdHksIHsgdHlwZTogJ2JveCcgfSk7XG4gICAgICogLy8gZW50aXR5Lm1vZGVsIGlzIG5vdyBzZXQgdG8gYSBwYy5Nb2RlbENvbXBvbmVudFxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBhZGRDb21wb25lbnQoZW50aXR5LCBkYXRhID0ge30pIHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gbmV3IHRoaXMuQ29tcG9uZW50VHlwZSh0aGlzLCBlbnRpdHkpO1xuICAgICAgICBjb25zdCBjb21wb25lbnREYXRhID0gbmV3IHRoaXMuRGF0YVR5cGUoKTtcblxuICAgICAgICB0aGlzLnN0b3JlW2VudGl0eS5nZXRHdWlkKCldID0ge1xuICAgICAgICAgICAgZW50aXR5OiBlbnRpdHksXG4gICAgICAgICAgICBkYXRhOiBjb21wb25lbnREYXRhXG4gICAgICAgIH07XG5cbiAgICAgICAgZW50aXR5W3RoaXMuaWRdID0gY29tcG9uZW50O1xuICAgICAgICBlbnRpdHkuY1t0aGlzLmlkXSA9IGNvbXBvbmVudDtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemVDb21wb25lbnREYXRhKGNvbXBvbmVudCwgZGF0YSwgW10pO1xuXG4gICAgICAgIHRoaXMuZmlyZSgnYWRkJywgZW50aXR5LCBjb21wb25lbnQpO1xuXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIHRoZSB7QGxpbmsgQ29tcG9uZW50fSBmcm9tIHRoZSBlbnRpdHkgYW5kIGRlbGV0ZSB0aGUgYXNzb2NpYXRlZCBjb21wb25lbnQgZGF0YS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi9lbnRpdHkuanMnKS5FbnRpdHl9IGVudGl0eSAtIFRoZSBlbnRpdHkgdG8gcmVtb3ZlIHRoZSBjb21wb25lbnQgZnJvbS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGFwcC5zeXN0ZW1zLm1vZGVsLnJlbW92ZUNvbXBvbmVudChlbnRpdHkpO1xuICAgICAqIC8vIGVudGl0eS5tb2RlbCA9PT0gdW5kZWZpbmVkXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIHJlbW92ZUNvbXBvbmVudChlbnRpdHkpIHtcbiAgICAgICAgY29uc3QgcmVjb3JkID0gdGhpcy5zdG9yZVtlbnRpdHkuZ2V0R3VpZCgpXTtcbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gZW50aXR5LmNbdGhpcy5pZF07XG5cbiAgICAgICAgdGhpcy5maXJlKCdiZWZvcmVyZW1vdmUnLCBlbnRpdHksIGNvbXBvbmVudCk7XG5cbiAgICAgICAgZGVsZXRlIHRoaXMuc3RvcmVbZW50aXR5LmdldEd1aWQoKV07XG5cbiAgICAgICAgZW50aXR5W3RoaXMuaWRdID0gdW5kZWZpbmVkO1xuICAgICAgICBkZWxldGUgZW50aXR5LmNbdGhpcy5pZF07XG5cbiAgICAgICAgdGhpcy5maXJlKCdyZW1vdmUnLCBlbnRpdHksIHJlY29yZC5kYXRhKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBjbG9uZSBvZiBjb21wb25lbnQuIFRoaXMgY3JlYXRlcyBhIGNvcHkgb2YgYWxsIGNvbXBvbmVudCBkYXRhIHZhcmlhYmxlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi9lbnRpdHkuanMnKS5FbnRpdHl9IGVudGl0eSAtIFRoZSBlbnRpdHkgdG8gY2xvbmUgdGhlIGNvbXBvbmVudCBmcm9tLlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi9lbnRpdHkuanMnKS5FbnRpdHl9IGNsb25lIC0gVGhlIGVudGl0eSB0byBjbG9uZSB0aGUgY29tcG9uZW50IGludG8uXG4gICAgICogQHJldHVybnMge2ltcG9ydCgnLi9jb21wb25lbnQuanMnKS5Db21wb25lbnR9IFRoZSBuZXdseSBjbG9uZWQgY29tcG9uZW50LlxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBjbG9uZUNvbXBvbmVudChlbnRpdHksIGNsb25lKSB7XG4gICAgICAgIC8vIGRlZmF1bHQgY2xvbmUgaXMganVzdCB0byBhZGQgYSBuZXcgY29tcG9uZW50IHdpdGggZXhpc3RpbmcgZGF0YVxuICAgICAgICBjb25zdCBzcmMgPSB0aGlzLnN0b3JlW2VudGl0eS5nZXRHdWlkKCldO1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRDb21wb25lbnQoY2xvbmUsIHNyYy5kYXRhKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgZHVyaW5nIHtAbGluayBDb21wb25lbnRTeXN0ZW0jYWRkQ29tcG9uZW50fSB0byBpbml0aWFsaXplIHRoZSBjb21wb25lbnQgZGF0YSBpbiB0aGVcbiAgICAgKiBzdG9yZS4gVGhpcyBjYW4gYmUgb3ZlcnJpZGRlbiBieSBkZXJpdmVkIENvbXBvbmVudCBTeXN0ZW1zIGFuZCBlaXRoZXIgY2FsbGVkIGJ5IHRoZSBkZXJpdmVkXG4gICAgICogU3lzdGVtIG9yIHJlcGxhY2VkIGVudGlyZWx5LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4vY29tcG9uZW50LmpzJykuQ29tcG9uZW50fSBjb21wb25lbnQgLSBUaGUgY29tcG9uZW50IGJlaW5nIGluaXRpYWxpemVkLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIC0gVGhlIGRhdGEgYmxvY2sgdXNlZCB0byBpbml0aWFsaXplIHRoZSBjb21wb25lbnQuXG4gICAgICogQHBhcmFtIHtBcnJheTxzdHJpbmcgfCB7bmFtZTogc3RyaW5nLCB0eXBlOiBzdHJpbmd9Pn0gcHJvcGVydGllcyAtIFRoZSBhcnJheSBvZiBwcm9wZXJ0eVxuICAgICAqIGRlc2NyaXB0b3JzIGZvciB0aGUgY29tcG9uZW50LiBBIGRlc2NyaXB0b3IgY2FuIGJlIGVpdGhlciBhIHBsYWluIHByb3BlcnR5IG5hbWUsIG9yIGFuXG4gICAgICogb2JqZWN0IHNwZWNpZnlpbmcgdGhlIG5hbWUgYW5kIHR5cGUuXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIGluaXRpYWxpemVDb21wb25lbnREYXRhKGNvbXBvbmVudCwgZGF0YSA9IHt9LCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIC8vIGluaXRpYWxpemVcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHByb3BlcnRpZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBwcm9wZXJ0aWVzW2ldO1xuICAgICAgICAgICAgbGV0IG5hbWUsIHR5cGU7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBkZXNjcmlwdG9yIGlzIGFuIG9iamVjdCwgaXQgd2lsbCBoYXZlIGBuYW1lYCBhbmQgYHR5cGVgIG1lbWJlcnNcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGVzY3JpcHRvciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gZGVzY3JpcHRvci5uYW1lO1xuICAgICAgICAgICAgICAgIHR5cGUgPSBkZXNjcmlwdG9yLnR5cGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgdGhlIGRlc2NyaXB0b3IgaXMganVzdCB0aGUgcHJvcGVydHkgbmFtZVxuICAgICAgICAgICAgICAgIG5hbWUgPSBkZXNjcmlwdG9yO1xuICAgICAgICAgICAgICAgIHR5cGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IGRhdGFbbmFtZV07XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2Uga25vdyB0aGUgaW50ZW5kZWQgdHlwZSBvZiB0aGUgdmFsdWUsIGNvbnZlcnQgdGhlIHJhdyBkYXRhXG4gICAgICAgICAgICAgICAgLy8gaW50byBhbiBpbnN0YW5jZSBvZiB0aGUgc3BlY2lmaWVkIHR5cGUuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGNvbnZlcnRWYWx1ZSh2YWx1ZSwgdHlwZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50W25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudFtuYW1lXSA9IGNvbXBvbmVudC5kYXRhW25hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWZ0ZXIgY29tcG9uZW50IGlzIGluaXRpYWxpemVkIGNhbGwgb25FbmFibGVcbiAgICAgICAgaWYgKGNvbXBvbmVudC5lbmFibGVkICYmIGNvbXBvbmVudC5lbnRpdHkuZW5hYmxlZCkge1xuICAgICAgICAgICAgY29tcG9uZW50Lm9uRW5hYmxlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWFyY2hlcyB0aGUgY29tcG9uZW50IHNjaGVtYSBmb3IgcHJvcGVydGllcyB0aGF0IG1hdGNoIHRoZSBzcGVjaWZpZWQgdHlwZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIHR5cGUgdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW118b2JqZWN0W119IEFuIGFycmF5IG9mIHByb3BlcnR5IGRlc2NyaXB0b3JzIG1hdGNoaW5nIHRoZSBzcGVjaWZpZWQgdHlwZS5cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgZ2V0UHJvcGVydGllc09mVHlwZSh0eXBlKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoaW5nUHJvcGVydGllcyA9IFtdO1xuICAgICAgICBjb25zdCBzY2hlbWEgPSB0aGlzLnNjaGVtYSB8fCBbXTtcblxuICAgICAgICBzY2hlbWEuZm9yRWFjaChmdW5jdGlvbiAoZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgaWYgKGRlc2NyaXB0b3IgJiYgdHlwZW9mIGRlc2NyaXB0b3IgPT09ICdvYmplY3QnICYmIGRlc2NyaXB0b3IudHlwZSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIG1hdGNoaW5nUHJvcGVydGllcy5wdXNoKGRlc2NyaXB0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbWF0Y2hpbmdQcm9wZXJ0aWVzO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMub2ZmKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjb252ZXJ0VmFsdWUodmFsdWUsIHR5cGUpIHtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAncmdiJzpcbiAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIENvbG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmNsb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbG9yKHZhbHVlWzBdLCB2YWx1ZVsxXSwgdmFsdWVbMl0pO1xuICAgICAgICBjYXNlICdyZ2JhJzpcbiAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIENvbG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmNsb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbG9yKHZhbHVlWzBdLCB2YWx1ZVsxXSwgdmFsdWVbMl0sIHZhbHVlWzNdKTtcbiAgICAgICAgY2FzZSAndmVjMic6XG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBWZWMyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmNsb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzIodmFsdWVbMF0sIHZhbHVlWzFdKTtcbiAgICAgICAgY2FzZSAndmVjMyc6XG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBWZWMzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmNsb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzModmFsdWVbMF0sIHZhbHVlWzFdLCB2YWx1ZVsyXSk7XG4gICAgICAgIGNhc2UgJ3ZlYzQnOlxuICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgVmVjNCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5jbG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWM0KHZhbHVlWzBdLCB2YWx1ZVsxXSwgdmFsdWVbMl0sIHZhbHVlWzNdKTtcbiAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIGNhc2UgJ2VudGl0eSc6XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7IC8vIEVudGl0eSBmaWVsZHMgc2hvdWxkIGp1c3QgYmUgYSBzdHJpbmcgZ3VpZFxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgY29udmVydCB1bmhhbmRsZWQgdHlwZTogJyArIHR5cGUpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgQ29tcG9uZW50U3lzdGVtIH07XG4iXSwibmFtZXMiOlsiQ29tcG9uZW50U3lzdGVtIiwiRXZlbnRIYW5kbGVyIiwiY29uc3RydWN0b3IiLCJhcHAiLCJzdG9yZSIsInNjaGVtYSIsImFkZENvbXBvbmVudCIsImVudGl0eSIsImRhdGEiLCJjb21wb25lbnQiLCJDb21wb25lbnRUeXBlIiwiY29tcG9uZW50RGF0YSIsIkRhdGFUeXBlIiwiZ2V0R3VpZCIsImlkIiwiYyIsImluaXRpYWxpemVDb21wb25lbnREYXRhIiwiZmlyZSIsInJlbW92ZUNvbXBvbmVudCIsInJlY29yZCIsInVuZGVmaW5lZCIsImNsb25lQ29tcG9uZW50IiwiY2xvbmUiLCJzcmMiLCJwcm9wZXJ0aWVzIiwiaSIsImxlbiIsImxlbmd0aCIsImRlc2NyaXB0b3IiLCJuYW1lIiwidHlwZSIsInZhbHVlIiwiY29udmVydFZhbHVlIiwiZW5hYmxlZCIsIm9uRW5hYmxlIiwiZ2V0UHJvcGVydGllc09mVHlwZSIsIm1hdGNoaW5nUHJvcGVydGllcyIsImZvckVhY2giLCJwdXNoIiwiZGVzdHJveSIsIm9mZiIsIkNvbG9yIiwiVmVjMiIsIlZlYzMiLCJWZWM0IiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUEsZUFBZSxTQUFTQyxZQUFZLENBQUM7QUFDdkM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtFQUNJQyxXQUFXQSxDQUFDQyxHQUFHLEVB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
