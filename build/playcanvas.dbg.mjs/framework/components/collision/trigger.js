/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { BODYFLAG_NORESPONSE_OBJECT, BODYGROUP_TRIGGER, BODYMASK_NOT_STATIC, BODYSTATE_ACTIVE_TAG, BODYSTATE_DISABLE_SIMULATION } from '../rigid-body/constants.js';

let _ammoVec1, _ammoQuat, _ammoTransform;

/**
 * Creates a trigger object used to create internal physics objects that interact with rigid bodies
 * and trigger collision events with no collision response.
 *
 * @ignore
 */
class Trigger {
  /**
   * Create a new Trigger instance.
   *
   * @param {AppBase} app - The running {@link AppBase}.
   * @param {Component} component - The component for which the trigger will be created.
   * @param {ComponentData} data - The data for the component.
   */
  constructor(app, component, data) {
    this.entity = component.entity;
    this.component = component;
    this.app = app;
    if (typeof Ammo !== 'undefined' && !_ammoVec1) {
      _ammoVec1 = new Ammo.btVector3();
      _ammoQuat = new Ammo.btQuaternion();
      _ammoTransform = new Ammo.btTransform();
    }
    this.initialize(data);
  }
  initialize(data) {
    const entity = this.entity;
    const shape = data.shape;
    if (shape && typeof Ammo !== 'undefined') {
      if (entity.trigger) {
        entity.trigger.destroy();
      }
      const mass = 1;
      const component = this.component;
      if (component) {
        const bodyPos = component.getShapePosition();
        const bodyRot = component.getShapeRotation();
        _ammoVec1.setValue(bodyPos.x, bodyPos.y, bodyPos.z);
        _ammoQuat.setValue(bodyRot.x, bodyRot.y, bodyRot.z, bodyRot.w);
      } else {
        const pos = entity.getPosition();
        const rot = entity.getRotation();
        _ammoVec1.setValue(pos.x, pos.y, pos.z);
        _ammoQuat.setValue(rot.x, rot.y, rot.z, rot.w);
      }
      _ammoTransform.setOrigin(_ammoVec1);
      _ammoTransform.setRotation(_ammoQuat);
      const body = this.app.systems.rigidbody.createBody(mass, shape, _ammoTransform);
      body.setRestitution(0);
      body.setFriction(0);
      body.setDamping(0, 0);
      _ammoVec1.setValue(0, 0, 0);
      body.setLinearFactor(_ammoVec1);
      body.setAngularFactor(_ammoVec1);
      body.setCollisionFlags(body.getCollisionFlags() | BODYFLAG_NORESPONSE_OBJECT);
      body.entity = entity;
      this.body = body;
      if (this.component.enabled && entity.enabled) {
        this.enable();
      }
    }
  }
  destroy() {
    const body = this.body;
    if (!body) return;
    this.disable();
    this.app.systems.rigidbody.destroyBody(body);
  }
  _getEntityTransform(transform) {
    const component = this.component;
    if (component) {
      const bodyPos = component.getShapePosition();
      const bodyRot = component.getShapeRotation();
      _ammoVec1.setValue(bodyPos.x, bodyPos.y, bodyPos.z);
      _ammoQuat.setValue(bodyRot.x, bodyRot.y, bodyRot.z, bodyRot.w);
    } else {
      const pos = this.entity.getPosition();
      const rot = this.entity.getRotation();
      _ammoVec1.setValue(pos.x, pos.y, pos.z);
      _ammoQuat.setValue(rot.x, rot.y, rot.z, rot.w);
    }
    transform.setOrigin(_ammoVec1);
    transform.setRotation(_ammoQuat);
  }
  updateTransform() {
    this._getEntityTransform(_ammoTransform);
    const body = this.body;
    body.setWorldTransform(_ammoTransform);
    body.activate();
  }
  enable() {
    const body = this.body;
    if (!body) return;
    const systems = this.app.systems;
    systems.rigidbody.addBody(body, BODYGROUP_TRIGGER, BODYMASK_NOT_STATIC ^ BODYGROUP_TRIGGER);
    systems.rigidbody._triggers.push(this);

    // set the body's activation state to active so that it is
    // simulated properly again
    body.forceActivationState(BODYSTATE_ACTIVE_TAG);
    this.updateTransform();
  }
  disable() {
    const body = this.body;
    if (!body) return;
    const systems = this.app.systems;
    const idx = systems.rigidbody._triggers.indexOf(this);
    if (idx > -1) {
      systems.rigidbody._triggers.splice(idx, 1);
    }
    systems.rigidbody.removeBody(body);

    // set the body's activation state to disable simulation so
    // that it properly deactivates after we remove it from the physics world
    body.forceActivationState(BODYSTATE_DISABLE_SIMULATION);
  }
}

export { Trigger };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJpZ2dlci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9jb21wb25lbnRzL2NvbGxpc2lvbi90cmlnZ2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJPRFlGTEFHX05PUkVTUE9OU0VfT0JKRUNULCBCT0RZTUFTS19OT1RfU1RBVElDLCBCT0RZR1JPVVBfVFJJR0dFUiwgQk9EWVNUQVRFX0FDVElWRV9UQUcsIEJPRFlTVEFURV9ESVNBQkxFX1NJTVVMQVRJT04gfSBmcm9tICcuLi9yaWdpZC1ib2R5L2NvbnN0YW50cy5qcyc7XG5cbmxldCBfYW1tb1ZlYzEsIF9hbW1vUXVhdCwgX2FtbW9UcmFuc2Zvcm07XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRyaWdnZXIgb2JqZWN0IHVzZWQgdG8gY3JlYXRlIGludGVybmFsIHBoeXNpY3Mgb2JqZWN0cyB0aGF0IGludGVyYWN0IHdpdGggcmlnaWQgYm9kaWVzXG4gKiBhbmQgdHJpZ2dlciBjb2xsaXNpb24gZXZlbnRzIHdpdGggbm8gY29sbGlzaW9uIHJlc3BvbnNlLlxuICpcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgVHJpZ2dlciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IFRyaWdnZXIgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FwcEJhc2V9IGFwcCAtIFRoZSBydW5uaW5nIHtAbGluayBBcHBCYXNlfS5cbiAgICAgKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcG9uZW50IC0gVGhlIGNvbXBvbmVudCBmb3Igd2hpY2ggdGhlIHRyaWdnZXIgd2lsbCBiZSBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50RGF0YX0gZGF0YSAtIFRoZSBkYXRhIGZvciB0aGUgY29tcG9uZW50LlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGFwcCwgY29tcG9uZW50LCBkYXRhKSB7XG4gICAgICAgIHRoaXMuZW50aXR5ID0gY29tcG9uZW50LmVudGl0eTtcbiAgICAgICAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gICAgICAgIHRoaXMuYXBwID0gYXBwO1xuXG4gICAgICAgIGlmICh0eXBlb2YgQW1tbyAhPT0gJ3VuZGVmaW5lZCcgJiYgIV9hbW1vVmVjMSkge1xuICAgICAgICAgICAgX2FtbW9WZWMxID0gbmV3IEFtbW8uYnRWZWN0b3IzKCk7XG4gICAgICAgICAgICBfYW1tb1F1YXQgPSBuZXcgQW1tby5idFF1YXRlcm5pb24oKTtcbiAgICAgICAgICAgIF9hbW1vVHJhbnNmb3JtID0gbmV3IEFtbW8uYnRUcmFuc2Zvcm0oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZShkYXRhKTtcbiAgICB9XG5cbiAgICBpbml0aWFsaXplKGRhdGEpIHtcbiAgICAgICAgY29uc3QgZW50aXR5ID0gdGhpcy5lbnRpdHk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gZGF0YS5zaGFwZTtcblxuICAgICAgICBpZiAoc2hhcGUgJiYgdHlwZW9mIEFtbW8gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBpZiAoZW50aXR5LnRyaWdnZXIpIHtcbiAgICAgICAgICAgICAgICBlbnRpdHkudHJpZ2dlci5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG1hc3MgPSAxO1xuXG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudDtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5UG9zID0gY29tcG9uZW50LmdldFNoYXBlUG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5Um90ID0gY29tcG9uZW50LmdldFNoYXBlUm90YXRpb24oKTtcbiAgICAgICAgICAgICAgICBfYW1tb1ZlYzEuc2V0VmFsdWUoYm9keVBvcy54LCBib2R5UG9zLnksIGJvZHlQb3Mueik7XG4gICAgICAgICAgICAgICAgX2FtbW9RdWF0LnNldFZhbHVlKGJvZHlSb3QueCwgYm9keVJvdC55LCBib2R5Um90LnosIGJvZHlSb3Qudyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IGVudGl0eS5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvdCA9IGVudGl0eS5nZXRSb3RhdGlvbigpO1xuICAgICAgICAgICAgICAgIF9hbW1vVmVjMS5zZXRWYWx1ZShwb3MueCwgcG9zLnksIHBvcy56KTtcbiAgICAgICAgICAgICAgICBfYW1tb1F1YXQuc2V0VmFsdWUocm90LngsIHJvdC55LCByb3Queiwgcm90LncpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfYW1tb1RyYW5zZm9ybS5zZXRPcmlnaW4oX2FtbW9WZWMxKTtcbiAgICAgICAgICAgIF9hbW1vVHJhbnNmb3JtLnNldFJvdGF0aW9uKF9hbW1vUXVhdCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSB0aGlzLmFwcC5zeXN0ZW1zLnJpZ2lkYm9keS5jcmVhdGVCb2R5KG1hc3MsIHNoYXBlLCBfYW1tb1RyYW5zZm9ybSk7XG5cbiAgICAgICAgICAgIGJvZHkuc2V0UmVzdGl0dXRpb24oMCk7XG4gICAgICAgICAgICBib2R5LnNldEZyaWN0aW9uKDApO1xuICAgICAgICAgICAgYm9keS5zZXREYW1waW5nKDAsIDApO1xuICAgICAgICAgICAgX2FtbW9WZWMxLnNldFZhbHVlKDAsIDAsIDApO1xuICAgICAgICAgICAgYm9keS5zZXRMaW5lYXJGYWN0b3IoX2FtbW9WZWMxKTtcbiAgICAgICAgICAgIGJvZHkuc2V0QW5ndWxhckZhY3RvcihfYW1tb1ZlYzEpO1xuXG4gICAgICAgICAgICBib2R5LnNldENvbGxpc2lvbkZsYWdzKGJvZHkuZ2V0Q29sbGlzaW9uRmxhZ3MoKSB8IEJPRFlGTEFHX05PUkVTUE9OU0VfT0JKRUNUKTtcbiAgICAgICAgICAgIGJvZHkuZW50aXR5ID0gZW50aXR5O1xuXG4gICAgICAgICAgICB0aGlzLmJvZHkgPSBib2R5O1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jb21wb25lbnQuZW5hYmxlZCAmJiBlbnRpdHkuZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5hYmxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBjb25zdCBib2R5ID0gdGhpcy5ib2R5O1xuICAgICAgICBpZiAoIWJvZHkpIHJldHVybjtcblxuICAgICAgICB0aGlzLmRpc2FibGUoKTtcblxuICAgICAgICB0aGlzLmFwcC5zeXN0ZW1zLnJpZ2lkYm9keS5kZXN0cm95Qm9keShib2R5KTtcbiAgICB9XG5cbiAgICBfZ2V0RW50aXR5VHJhbnNmb3JtKHRyYW5zZm9ybSkge1xuICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudDtcbiAgICAgICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgY29uc3QgYm9keVBvcyA9IGNvbXBvbmVudC5nZXRTaGFwZVBvc2l0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBib2R5Um90ID0gY29tcG9uZW50LmdldFNoYXBlUm90YXRpb24oKTtcbiAgICAgICAgICAgIF9hbW1vVmVjMS5zZXRWYWx1ZShib2R5UG9zLngsIGJvZHlQb3MueSwgYm9keVBvcy56KTtcbiAgICAgICAgICAgIF9hbW1vUXVhdC5zZXRWYWx1ZShib2R5Um90LngsIGJvZHlSb3QueSwgYm9keVJvdC56LCBib2R5Um90LncpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcG9zID0gdGhpcy5lbnRpdHkuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IHJvdCA9IHRoaXMuZW50aXR5LmdldFJvdGF0aW9uKCk7XG4gICAgICAgICAgICBfYW1tb1ZlYzEuc2V0VmFsdWUocG9zLngsIHBvcy55LCBwb3Mueik7XG4gICAgICAgICAgICBfYW1tb1F1YXQuc2V0VmFsdWUocm90LngsIHJvdC55LCByb3Queiwgcm90LncpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJhbnNmb3JtLnNldE9yaWdpbihfYW1tb1ZlYzEpO1xuICAgICAgICB0cmFuc2Zvcm0uc2V0Um90YXRpb24oX2FtbW9RdWF0KTtcbiAgICB9XG5cbiAgICB1cGRhdGVUcmFuc2Zvcm0oKSB7XG4gICAgICAgIHRoaXMuX2dldEVudGl0eVRyYW5zZm9ybShfYW1tb1RyYW5zZm9ybSk7XG5cbiAgICAgICAgY29uc3QgYm9keSA9IHRoaXMuYm9keTtcbiAgICAgICAgYm9keS5zZXRXb3JsZFRyYW5zZm9ybShfYW1tb1RyYW5zZm9ybSk7XG4gICAgICAgIGJvZHkuYWN0aXZhdGUoKTtcbiAgICB9XG5cbiAgICBlbmFibGUoKSB7XG4gICAgICAgIGNvbnN0IGJvZHkgPSB0aGlzLmJvZHk7XG4gICAgICAgIGlmICghYm9keSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHN5c3RlbXMgPSB0aGlzLmFwcC5zeXN0ZW1zO1xuICAgICAgICBzeXN0ZW1zLnJpZ2lkYm9keS5hZGRCb2R5KGJvZHksIEJPRFlHUk9VUF9UUklHR0VSLCBCT0RZTUFTS19OT1RfU1RBVElDIF4gQk9EWUdST1VQX1RSSUdHRVIpO1xuICAgICAgICBzeXN0ZW1zLnJpZ2lkYm9keS5fdHJpZ2dlcnMucHVzaCh0aGlzKTtcblxuICAgICAgICAvLyBzZXQgdGhlIGJvZHkncyBhY3RpdmF0aW9uIHN0YXRlIHRvIGFjdGl2ZSBzbyB0aGF0IGl0IGlzXG4gICAgICAgIC8vIHNpbXVsYXRlZCBwcm9wZXJseSBhZ2FpblxuICAgICAgICBib2R5LmZvcmNlQWN0aXZhdGlvblN0YXRlKEJPRFlTVEFURV9BQ1RJVkVfVEFHKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpO1xuICAgIH1cblxuICAgIGRpc2FibGUoKSB7XG4gICAgICAgIGNvbnN0IGJvZHkgPSB0aGlzLmJvZHk7XG4gICAgICAgIGlmICghYm9keSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHN5c3RlbXMgPSB0aGlzLmFwcC5zeXN0ZW1zO1xuICAgICAgICBjb25zdCBpZHggPSBzeXN0ZW1zLnJpZ2lkYm9keS5fdHJpZ2dlcnMuaW5kZXhPZih0aGlzKTtcbiAgICAgICAgaWYgKGlkeCA+IC0xKSB7XG4gICAgICAgICAgICBzeXN0ZW1zLnJpZ2lkYm9keS5fdHJpZ2dlcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgc3lzdGVtcy5yaWdpZGJvZHkucmVtb3ZlQm9keShib2R5KTtcblxuICAgICAgICAvLyBzZXQgdGhlIGJvZHkncyBhY3RpdmF0aW9uIHN0YXRlIHRvIGRpc2FibGUgc2ltdWxhdGlvbiBzb1xuICAgICAgICAvLyB0aGF0IGl0IHByb3Blcmx5IGRlYWN0aXZhdGVzIGFmdGVyIHdlIHJlbW92ZSBpdCBmcm9tIHRoZSBwaHlzaWNzIHdvcmxkXG4gICAgICAgIGJvZHkuZm9yY2VBY3RpdmF0aW9uU3RhdGUoQk9EWVNUQVRFX0RJU0FCTEVfU0lNVUxBVElPTik7XG4gICAgfVxufVxuXG5leHBvcnQgeyBUcmlnZ2VyIH07XG4iXSwibmFtZXMiOlsiX2FtbW9WZWMxIiwiX2FtbW9RdWF0IiwiX2FtbW9UcmFuc2Zvcm0iLCJUcmlnZ2VyIiwiY29uc3RydWN0b3IiLCJhcHAiLCJjb21wb25lbnQiLCJkYXRhIiwiZW50aXR5IiwiQW1tbyIsImJ0VmVjdG9yMyIsImJ0UXVhdGVybmlvbiIsImJ0VHJhbnNmb3JtIiwiaW5pdGlhbGl6ZSIsInNoYXBlIiwidHJpZ2dlciIsImRlc3Ryb3kiLCJtYXNzIiwiYm9keVBvcyIsImdldFNoYXBlUG9zaXRpb24iLCJib2R5Um90IiwiZ2V0U2hhcGVSb3RhdGlvbiIsInNldFZhbHVlIiwieCIsInkiLCJ6IiwidyIsInBvcyIsImdldFBvc2l0aW9uIiwicm90IiwiZ2V0Um90YXRpb24iLCJzZXRPcmlnaW4iLCJzZXRSb3RhdGlvbiIsImJvZHkiLCJzeXN0ZW1zIiwicmlnaWRib2R5IiwiY3JlYXRlQm9keSIsInNldFJlc3RpdHV0aW9uIiwic2V0RnJpY3Rpb24iLCJzZXREYW1waW5nIiwic2V0TGluZWFyRmFjdG9yIiwic2V0QW5ndWxhckZhY3RvciIsInNldENvbGxpc2lvbkZsYWdzIiwiZ2V0Q29sbGlzaW9uRmxhZ3MiLCJCT0RZRkxBR19OT1JFU1BPTlNFX09CSkVDVCIsImVuYWJsZWQiLCJlbmFibGUiLCJkaXNhYmxlIiwiZGVzdHJveUJvZHkiLCJfZ2V0RW50aXR5VHJhbnNmb3JtIiwidHJhbnNmb3JtIiwidXBkYXRlVHJhbnNmb3JtIiwic2V0V29ybGRUcmFuc2Zvcm0iLCJhY3RpdmF0ZSIsImFkZEJvZHkiLCJCT0RZR1JPVVBfVFJJR0dFUiIsIkJPRFlNQVNLX05PVF9TVEFUSUMiLCJfdHJpZ2dlcnMiLCJwdXNoIiwiZm9yY2VBY3RpdmF0aW9uU3RhdGUiLCJCT0RZU1RBVEVfQUNUSVZFX1RBRyIsImlkeCIsImluZGV4T2YiLCJzcGxpY2UiLCJyZW1vdmVCb2R5IiwiQk9EWVNUQVRFX0RJU0FCTEVfU0lNVUxBVElPTiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBLElBQUlBLFNBQVMsRUFBRUMsU0FBUyxFQUFFQyxjQUFjLENBQUE7O0FBRXhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLE9BQU8sQ0FBQztBQUNWO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLFdBQVdBLENBQUNDLEdBQUcsRUFBRUMsU0FBUyxFQUFFQyxJQUFJLEVBQUU7QUFDOUIsSUFBQSxJQUFJLENBQUNDLE1BQU0sR0FBR0YsU0FBUyxDQUFDRSxNQUFNLENBQUE7SUFDOUIsSUFBSSxDQUFDRixTQUFTLEdBQUdBLFNBQVMsQ0FBQTtJQUMxQixJQUFJLENBQUNELEdBQUcsR0FBR0EsR0FBRyxDQUFBO0FBRWQsSUFBQSxJQUFJLE9BQU9JLElBQUksS0FBSyxXQUFXLElBQUksQ0FBQ1QsU0FBUyxFQUFFO0FBQzNDQSxNQUFBQSxTQUFTLEdBQUcsSUFBSVMsSUFBSSxDQUFDQyxT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
