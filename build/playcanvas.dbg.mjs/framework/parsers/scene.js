/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Entity } from '../entity.js';
import { CompressUtils } from '../../scene/compress/compress-utils.js';
import { Decompress } from '../../scene/compress/decompress.js';
import { Debug } from '../../core/debug.js';

class SceneParser {
  constructor(app, isTemplate) {
    this._app = app;
    this._isTemplate = isTemplate;
  }
  parse(data) {
    const entities = {};
    let parent = null;
    const compressed = data.compressedFormat;
    if (compressed && !data.entDecompressed) {
      data.entDecompressed = true;
      data.entities = new Decompress(data.entities, compressed).run();
    }

    for (const id in data.entities) {
      const curData = data.entities[id];
      const curEnt = this._createEntity(curData, compressed);
      entities[id] = curEnt;
      if (curData.parent === null) {
        parent = curEnt;
      }
    }

    for (const id in data.entities) {
      const curEnt = entities[id];
      const children = data.entities[id].children;
      const len = children.length;
      for (let i = 0; i < len; i++) {
        const childEnt = entities[children[i]];
        if (childEnt) {
          curEnt.addChild(childEnt);
        }
      }
    }
    this._openComponentData(parent, data.entities);
    return parent;
  }
  _createEntity(data, compressed) {
    const entity = new Entity(data.name, this._app);
    entity.setGuid(data.resource_id);
    this._setPosRotScale(entity, data, compressed);
    entity._enabled = data.enabled !== undefined ? data.enabled : true;
    if (this._isTemplate) {
      entity._template = true;
    } else {
      entity._enabledInHierarchy = entity._enabled;
    }
    entity.template = data.template;
    if (data.tags) {
      for (let i = 0; i < data.tags.length; i++) {
        entity.tags.add(data.tags[i]);
      }
    }
    if (data.labels) {
      data.labels.forEach(function (label) {
        entity.addLabel(label);
      });
    }
    return entity;
  }
  _setPosRotScale(entity, data, compressed) {
    if (compressed) {
      CompressUtils.setCompressedPRS(entity, data, compressed);
    } else {
      const p = data.position;
      const r = data.rotation;
      const s = data.scale;
      entity.setLocalPosition(p[0], p[1], p[2]);
      entity.setLocalEulerAngles(r[0], r[1], r[2]);
      entity.setLocalScale(s[0], s[1], s[2]);
    }
  }
  _openComponentData(entity, entities) {
    const systemsList = this._app.systems.list;
    let len = systemsList.length;
    const entityData = entities[entity.getGuid()];
    for (let i = 0; i < len; i++) {
      const system = systemsList[i];
      const componentData = entityData.components[system.id];
      if (componentData) {
        system.addComponent(entity, componentData);
      }
    }

    len = entityData.children.length;
    const children = entity._children;
    for (let i = 0; i < len; i++) {
      if (children[i]) {
        children[i] = this._openComponentData(children[i], entities);
      } else {
        Debug.warn(`Scene data is invalid where a child under "${entity.name}" Entity doesn't exist. Please check the scene data.`);
      }
    }
    return entity;
  }
}

export { SceneParser };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvcGFyc2Vycy9zY2VuZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuLi9lbnRpdHkuanMnO1xuXG5pbXBvcnQgeyBDb21wcmVzc1V0aWxzIH0gZnJvbSAnLi4vLi4vc2NlbmUvY29tcHJlc3MvY29tcHJlc3MtdXRpbHMuanMnO1xuaW1wb3J0IHsgRGVjb21wcmVzcyB9IGZyb20gJy4uLy4uL3NjZW5lL2NvbXByZXNzL2RlY29tcHJlc3MuanMnO1xuaW1wb3J0IHsgRGVidWcgfSBmcm9tIFwiLi4vLi4vY29yZS9kZWJ1Zy5qc1wiO1xuXG5jbGFzcyBTY2VuZVBhcnNlciB7XG4gICAgY29uc3RydWN0b3IoYXBwLCBpc1RlbXBsYXRlKSB7XG4gICAgICAgIHRoaXMuX2FwcCA9IGFwcDtcblxuICAgICAgICB0aGlzLl9pc1RlbXBsYXRlID0gaXNUZW1wbGF0ZTtcbiAgICB9XG5cbiAgICBwYXJzZShkYXRhKSB7XG4gICAgICAgIGNvbnN0IGVudGl0aWVzID0ge307XG4gICAgICAgIGxldCBwYXJlbnQgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IGNvbXByZXNzZWQgPSBkYXRhLmNvbXByZXNzZWRGb3JtYXQ7XG4gICAgICAgIGlmIChjb21wcmVzc2VkICYmICFkYXRhLmVudERlY29tcHJlc3NlZCkge1xuICAgICAgICAgICAgZGF0YS5lbnREZWNvbXByZXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgZGF0YS5lbnRpdGllcyA9IG5ldyBEZWNvbXByZXNzKGRhdGEuZW50aXRpZXMsIGNvbXByZXNzZWQpLnJ1bigpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5zdGFudGlhdGUgZW50aXRpZXNcbiAgICAgICAgZm9yIChjb25zdCBpZCBpbiBkYXRhLmVudGl0aWVzKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJEYXRhID0gZGF0YS5lbnRpdGllc1tpZF07XG4gICAgICAgICAgICBjb25zdCBjdXJFbnQgPSB0aGlzLl9jcmVhdGVFbnRpdHkoY3VyRGF0YSwgY29tcHJlc3NlZCk7XG4gICAgICAgICAgICBlbnRpdGllc1tpZF0gPSBjdXJFbnQ7XG4gICAgICAgICAgICBpZiAoY3VyRGF0YS5wYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSBjdXJFbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwdXQgZW50aXRpZXMgaW50byBoaWVyYXJjaHlcbiAgICAgICAgZm9yIChjb25zdCBpZCBpbiBkYXRhLmVudGl0aWVzKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJFbnQgPSBlbnRpdGllc1tpZF07XG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGRhdGEuZW50aXRpZXNbaWRdLmNoaWxkcmVuO1xuICAgICAgICAgICAgY29uc3QgbGVuID0gY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkRW50ID0gZW50aXRpZXNbY2hpbGRyZW5baV1dO1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZEVudCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJFbnQuYWRkQ2hpbGQoY2hpbGRFbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX29wZW5Db21wb25lbnREYXRhKHBhcmVudCwgZGF0YS5lbnRpdGllcyk7XG5cbiAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICB9XG5cbiAgICBfY3JlYXRlRW50aXR5KGRhdGEsIGNvbXByZXNzZWQpIHtcbiAgICAgICAgY29uc3QgZW50aXR5ID0gbmV3IEVudGl0eShkYXRhLm5hbWUsIHRoaXMuX2FwcCk7XG5cbiAgICAgICAgZW50aXR5LnNldEd1aWQoZGF0YS5yZXNvdXJjZV9pZCk7XG4gICAgICAgIHRoaXMuX3NldFBvc1JvdFNjYWxlKGVudGl0eSwgZGF0YSwgY29tcHJlc3NlZCk7XG4gICAgICAgIGVudGl0eS5fZW5hYmxlZCA9IGRhdGEuZW5hYmxlZCAhPT0gdW5kZWZpbmVkID8gZGF0YS5lbmFibGVkIDogdHJ1ZTtcblxuICAgICAgICBpZiAodGhpcy5faXNUZW1wbGF0ZSkge1xuICAgICAgICAgICAgZW50aXR5Ll90ZW1wbGF0ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbnRpdHkuX2VuYWJsZWRJbkhpZXJhcmNoeSA9IGVudGl0eS5fZW5hYmxlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVudGl0eS50ZW1wbGF0ZSA9IGRhdGEudGVtcGxhdGU7XG5cbiAgICAgICAgaWYgKGRhdGEudGFncykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLnRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbnRpdHkudGFncy5hZGQoZGF0YS50YWdzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkYXRhLmxhYmVscykge1xuICAgICAgICAgICAgZGF0YS5sYWJlbHMuZm9yRWFjaChmdW5jdGlvbiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICBlbnRpdHkuYWRkTGFiZWwobGFiZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZW50aXR5O1xuICAgIH1cblxuICAgIF9zZXRQb3NSb3RTY2FsZShlbnRpdHksIGRhdGEsIGNvbXByZXNzZWQpIHtcbiAgICAgICAgaWYgKGNvbXByZXNzZWQpIHtcbiAgICAgICAgICAgIENvbXByZXNzVXRpbHMuc2V0Q29tcHJlc3NlZFBSUyhlbnRpdHksIGRhdGEsIGNvbXByZXNzZWQpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwID0gZGF0YS5wb3NpdGlvbjtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBkYXRhLnJvdGF0aW9uO1xuICAgICAgICAgICAgY29uc3QgcyA9IGRhdGEuc2NhbGU7XG5cbiAgICAgICAgICAgIGVudGl0eS5zZXRMb2NhbFBvc2l0aW9uKHBbMF0sIHBbMV0sIHBbMl0pO1xuICAgICAgICAgICAgZW50aXR5LnNldExvY2FsRXVsZXJBbmdsZXMoclswXSwgclsxXSwgclsyXSk7XG4gICAgICAgICAgICBlbnRpdHkuc2V0TG9jYWxTY2FsZShzWzBdLCBzWzFdLCBzWzJdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vcGVuQ29tcG9uZW50RGF0YShlbnRpdHksIGVudGl0aWVzKSB7XG4gICAgICAgIC8vIENyZWF0ZSBjb21wb25lbnRzIGluIG9yZGVyXG4gICAgICAgIGNvbnN0IHN5c3RlbXNMaXN0ID0gdGhpcy5fYXBwLnN5c3RlbXMubGlzdDtcblxuICAgICAgICBsZXQgbGVuID0gc3lzdGVtc0xpc3QubGVuZ3RoO1xuICAgICAgICBjb25zdCBlbnRpdHlEYXRhID0gZW50aXRpZXNbZW50aXR5LmdldEd1aWQoKV07XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHN5c3RlbSA9IHN5c3RlbXNMaXN0W2ldO1xuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50RGF0YSA9IGVudGl0eURhdGEuY29tcG9uZW50c1tzeXN0ZW0uaWRdO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudERhdGEpIHtcbiAgICAgICAgICAgICAgICBzeXN0ZW0uYWRkQ29tcG9uZW50KGVudGl0eSwgY29tcG9uZW50RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPcGVuIGFsbCBjaGlsZHJlbiBhbmQgYWRkIHRoZW0gdG8gdGhlIG5vZGVcbiAgICAgICAgbGVuID0gZW50aXR5RGF0YS5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gZW50aXR5Ll9jaGlsZHJlbjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGNoaWxkcmVuW2ldKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW5baV0gPSB0aGlzLl9vcGVuQ29tcG9uZW50RGF0YShjaGlsZHJlbltpXSwgZW50aXRpZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBEZWJ1Zy53YXJuKGBTY2VuZSBkYXRhIGlzIGludmFsaWQgd2hlcmUgYSBjaGlsZCB1bmRlciBcIiR7ZW50aXR5Lm5hbWV9XCIgRW50aXR5IGRvZXNuJ3QgZXhpc3QuIFBsZWFzZSBjaGVjayB0aGUgc2NlbmUgZGF0YS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbnRpdHk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBTY2VuZVBhcnNlciB9O1xuIl0sIm5hbWVzIjpbIlNjZW5lUGFyc2VyIiwiY29uc3RydWN0b3IiLCJhcHAiLCJpc1RlbXBsYXRlIiwiX2FwcCIsIl9pc1RlbXBsYXRlIiwicGFyc2UiLCJkYXRhIiwiZW50aXRpZXMiLCJwYXJlbnQiLCJjb21wcmVzc2VkIiwiY29tcHJlc3NlZEZvcm1hdCIsImVudERlY29tcHJlc3NlZCIsIkRlY29tcHJlc3MiLCJydW4iLCJpZCIsImN1ckRhdGEiLCJjdXJFbnQiLCJfY3JlYXRlRW50aXR5IiwiY2hpbGRyZW4iLCJsZW4iLCJsZW5ndGgiLCJpIiwiY2hpbGRFbnQiLCJhZGRDaGlsZCIsIl9vcGVuQ29tcG9uZW50RGF0YSIsImVudGl0eSIsIkVudGl0eSIsIm5hbWUiLCJzZXRHdWlkIiwicmVzb3VyY2VfaWQiLCJfc2V0UG9zUm90U2NhbGUiLCJfZW5hYmxlZCIsImVuYWJsZWQiLCJ1bmRlZmluZWQiLCJfdGVtcGxhdGUiLCJfZW5hYmxlZEluSGllcmFyY2h5IiwidGVtcGxhdGUiLCJ0YWdzIiwiYWRkIiwibGFiZWxzIiwiZm9yRWFjaCIsImxhYmVsIiwiYWRkTGFiZWwiLCJDb21wcmVzc1V0aWxzIiwic2V0Q29tcHJlc3NlZFBSUyIsInAiLCJwb3NpdGlvbiIsInIiLCJyb3RhdGlvbiIsInMiLCJzY2FsZSIsInNldExvY2FsUG9zaXRpb24iLCJzZXRMb2NhbEV1bGVyQW5nbGVzIiwic2V0TG9jYWxTY2FsZSIsInN5c3RlbXNMaXN0Iiwic3lzdGVtcyIsImxpc3QiLCJlbnRpdHlEYXRhIiwiZ2V0R3VpZCIsInN5c3RlbSIsImNvbXBvbmVudERhdGEiLCJjb21wb25lbnRzIiwiYWRkQ29tcG9uZW50IiwiX2NoaWxkcmVuIiwiRGVidWciLCJ3YXJuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBTUEsTUFBTUEsV0FBVyxDQUFDO0FBQ2RDLEVBQUFBLFdBQVcsQ0FBQ0MsR0FBRyxFQUFFQyxVQUFVLEVBQUU7SUFDekIsSUFBSSxDQUFDQyxJQUFJLEdBQUdGLEdBQUcsQ0FBQTtJQUVmLElBQUksQ0FBQ0csV0FBVyxHQUFHRixVQUFVLENBQUE7QUFDakMsR0FBQTtFQUVBRyxLQUFLLENBQUNDLElBQUksRUFBRTtJQUNSLE1BQU1DLFFBQVEsR0FBRyxFQUFFLENBQUE7SUFDbkIsSUFBSUMsTUFBTSxHQUFHLElBQUksQ0FBQTtBQUVqQixJQUFBLE1BQU1DLFVBQVUsR0FBR0gsSUFBSSxDQUFDSSxnQkFBZ0IsQ0FBQTtBQUN4QyxJQUFBLElBQUlELFVBQVUsSUFBSSxDQUFDSCxJQUFJLENBQUNLLGVBQWUsRUFBRTtNQUNyQ0wsSUFBSSxDQUFDSyxlQUFlLEdBQUcsSUFBSSxDQUFBO0FBQzNCTCxNQUFBQSxJQUFJLENBQUNDLFFBQVEsR0FBRyxJQUFJSyxVQUFVLENBQUNOLElBQUksQ0FBQ0MsUUFBUSxFQUFFRSxVQUFVLENBQUMsQ0FBQ0ksR0FBRyxFQUFFLENBQUE7QUFDbkUsS0FBQTs7QUFHQSxJQUFBLEtBQUssTUFBTUMsRUFBRSxJQUFJUixJQUFJLENBQUNDLFFBQVEsRUFBRTtBQUM1QixNQUFBLE1BQU1RLE9BQU8sR0FBR1QsSUFBSSxDQUFDQyxR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
