/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import '../../../core/tracing.js';
import { Mat4 } from '../../../core/math/mat4.js';
import { Quat } from '../../../core/math/quat.js';
import { Vec3 } from '../../../core/math/vec3.js';
import { SEMANTIC_POSITION } from '../../../platform/graphics/constants.js';
import { GraphNode } from '../../../scene/graph-node.js';
import { Model } from '../../../scene/model.js';
import { Component } from '../component.js';
import { ComponentSystem } from '../system.js';
import { CollisionComponent } from './component.js';
import { CollisionComponentData } from './data.js';
import { Trigger } from './trigger.js';

const mat4 = new Mat4();
const vec3 = new Vec3();
const quat = new Quat();
const tempGraphNode = new GraphNode();
const _schema = ['enabled', 'type', 'halfExtents', 'linearOffset', 'angularOffset', 'radius', 'axis', 'height', 'asset', 'renderAsset', 'shape', 'model', 'render'];

class CollisionSystemImpl {
  constructor(system) {
    this.system = system;
  }

  beforeInitialize(component, data) {
    data.shape = null;
    data.model = new Model();
    data.model.graph = new GraphNode();
  }

  afterInitialize(component, data) {
    this.recreatePhysicalShapes(component);
    component.data.initialized = true;
  }

  reset(component, data) {
    this.beforeInitialize(component, data);
    this.afterInitialize(component, data);
  }

  recreatePhysicalShapes(component) {
    const entity = component.entity;
    const data = component.data;
    if (typeof Ammo !== 'undefined') {
      if (entity.trigger) {
        entity.trigger.destroy();
        delete entity.trigger;
      }
      if (data.shape) {
        if (component._compoundParent) {
          this.system._removeCompoundChild(component._compoundParent, data.shape);
          if (component._compoundParent.entity.rigidbody) component._compoundParent.entity.rigidbody.activate();
        }
        Ammo.destroy(data.shape);
        data.shape = null;
      }
      data.shape = this.createPhysicalShape(component.entity, data);
      const firstCompoundChild = !component._compoundParent;
      if (data.type === 'compound' && (!component._compoundParent || component === component._compoundParent)) {
        component._compoundParent = component;
        entity.forEach(this._addEachDescendant, component);
      } else if (data.type !== 'compound') {
        if (component._compoundParent && component === component._compoundParent) {
          entity.forEach(this.system.implementations.compound._updateEachDescendant, component);
        }
        if (!component.rigidbody) {
          component._compoundParent = null;
          let parent = entity.parent;
          while (parent) {
            if (parent.collision && parent.collision.type === 'compound') {
              component._compoundParent = parent.collision;
              break;
            }
            parent = parent.parent;
          }
        }
      }
      if (component._compoundParent) {
        if (component !== component._compoundParent) {
          if (firstCompoundChild && component._compoundParent.shape.getNumChildShapes() === 0) {
            this.system.recreatePhysicalShapes(component._compoundParent);
          } else {
            this.system.updateCompoundChildTransform(entity);
            if (component._compoundParent.entity.rigidbody) component._compoundParent.entity.rigidbody.activate();
          }
        }
      }
      if (entity.rigidbody) {
        entity.rigidbody.disableSimulation();
        entity.rigidbody.createBody();
        if (entity.enabled && entity.rigidbody.enabled) {
          entity.rigidbody.enableSimulation();
        }
      } else if (!component._compoundParent) {
        if (!entity.trigger) {
          entity.trigger = new Trigger(this.system.app, component, data);
        } else {
          entity.trigger.initialize(data);
        }
      }
    }
  }

  createPhysicalShape(entity, data) {
    return undefined;
  }
  updateTransform(component, position, rotation, scale) {
    if (component.entity.trigger) {
      component.entity.trigger.updateTransform();
    }
  }
  beforeRemove(entity, component) {
    if (component.data.shape) {
      if (component._compoundParent && !component._compoundParent.entity._destroying) {
        this.system._removeCompoundChild(component._compoundParent, component.data.shape);
        if (component._compoundParent.entity.rigidbody) component._compoundParent.entity.rigidbody.activate();
      }
      component._compoundParent = null;
      Ammo.destroy(component.data.shape);
      component.data.shape = null;
    }
  }

  remove(entity, data) {
    if (entity.rigidbody && entity.rigidbody.body) {
      entity.rigidbody.disableSimulation();
    }
    if (entity.trigger) {
      entity.trigger.destroy();
      delete entity.trigger;
    }
  }

  clone(entity, clone) {
    const src = this.system.store[entity.getGuid()];
    const data = {
      enabled: src.data.enabled,
      type: src.data.type,
      halfExtents: [src.data.halfExtents.x, src.data.halfExtents.y, src.data.halfExtents.z],
      linearOffset: [src.data.linearOffset.x, src.data.linearOffset.y, src.data.linearOffset.z],
      angularOffset: [src.data.angularOffset.x, src.data.angularOffset.y, src.data.angularOffset.z, src.data.angularOffset.w],
      radius: src.data.radius,
      axis: src.data.axis,
      height: src.data.height,
      asset: src.data.asset,
      renderAsset: src.data.renderAsset,
      model: src.data.model,
      render: src.data.render
    };
    return this.system.addComponent(clone, data);
  }
}

class CollisionBoxSystemImpl extends CollisionSystemImpl {
  createPhysicalShape(entity, data) {
    if (typeof Ammo !== 'undefined') {
      const he = data.halfExtents;
      const ammoHe = new Ammo.btVector3(he ? he.x : 0.5, he ? he.y : 0.5, he ? he.z : 0.5);
      const shape = new Ammo.btBoxShape(ammoHe);
      Ammo.destroy(ammoHe);
      return shape;
    }
    return undefined;
  }
}

class CollisionSphereSystemImpl extends CollisionSystemImpl {
  createPhysicalShape(entity, data) {
    if (typeof Ammo !== 'undefined') {
      return new Ammo.btSphereShape(data.radius);
    }
    return undefined;
  }
}

class CollisionCapsuleSystemImpl extends CollisionSystemImpl {
  createPhysicalShape(entity, data) {
    const axis = data.axis !== undefined ? data.axis : 1;
    const radius = data.radius || 0.5;
    const height = Math.max((data.height || 2) - 2 * radius, 0);
    let shape = null;
    if (typeof Ammo !== 'undefined') {
      switch (axis) {
        case 0:
          shape = new Ammo.btCapsuleShapeX(radius, height);
          break;
        case 1:
          shape = new Ammo.btCapsuleShape(radius, height);
          break;
        case 2:
          shape = new Ammo.btCapsuleShapeZ(radius, height);
          break;
      }
    }
    return shape;
  }
}

class CollisionCylinderSystemImpl extends CollisionSystemImpl {
  createPhysicalShape(entity, data) {
    const axis = data.axis !== undefined ? data.axis : 1;
    const radius = data.radius !== undefined ? data.radius : 0.5;
    const height = data.height !== undefined ? data.height : 1;
    let halfExtents = null;
    let shape = null;
    if (typeof Ammo !== 'undefined') {
      switch (axis) {
        case 0:
          halfExtents = new Ammo.btVector3(height * 0.5, radius, radius);
          shape = new Ammo.btCylinderShapeX(halfExtents);
          break;
        case 1:
          halfExtents = new Ammo.btVector3(radius, height * 0.5, radius);
          shape = new Ammo.btCylinderShape(halfExtents);
          break;
        case 2:
          halfExtents = new Ammo.btVector3(radius, radius, height * 0.5);
          shape = new Ammo.btCylinderShapeZ(halfExtents);
          break;
      }
    }
    if (halfExtents) Ammo.destroy(halfExtents);
    return shape;
  }
}

class CollisionConeSystemImpl extends CollisionSystemImpl {
  createPhysicalShape(entity, data) {
    const axis = data.axis !== undefined ? data.axis : 1;
    const radius = data.radius !== undefined ? data.radius : 0.5;
    const height = data.height !== undefined ? data.height : 1;
    let shape = null;
    if (typeof Ammo !== 'undefined') {
      switch (axis) {
        case 0:
          shape = new Ammo.btConeShapeX(radius, height);
          break;
        case 1:
          shape = new Ammo.btConeShape(radius, height);
          break;
        case 2:
          shape = new Ammo.btConeShapeZ(radius, height);
          break;
      }
    }
    return shape;
  }
}

class CollisionMeshSystemImpl extends CollisionSystemImpl {
  beforeInitialize(component, data) {}
  createAmmoMesh(mesh, node, shape) {
    let triMesh;
    if (this.system._triMeshCache[mesh.id]) {
      triMesh = this.system._triMeshCache[mesh.id];
    } else {
      const vb = mesh.vertexBuffer;
      const format = vb.getFormat();
      let stride;
      let positions;
      for (let i = 0; i < format.elements.length; i++) {
        const element = format.elements[i];
        if (element.name === SEMANTIC_POSITION) {
          positions = new Float32Array(vb.lock(), element.offset);
          stride = element.stride / 4;
          break;
        }
      }
      const indices = [];
      mesh.getIndices(indices);
      const numTriangles = mesh.primitive[0].count / 3;
      const v1 = new Ammo.btVector3();
      const v2 = new Ammo.btVector3();
      const v3 = new Ammo.btVector3();
      let i1, i2, i3;
      const base = mesh.primitive[0].base;
      triMesh = new Ammo.btTriangleMesh();
      this.system._triMeshCache[mesh.id] = triMesh;
      for (let i = 0; i < numTriangles; i++) {
        i1 = indices[base + i * 3] * stride;
        i2 = indices[base + i * 3 + 1] * stride;
        i3 = indices[base + i * 3 + 2] * stride;
        v1.setValue(positions[i1], positions[i1 + 1], positions[i1 + 2]);
        v2.setValue(positions[i2], positions[i2 + 1], positions[i2 + 2]);
        v3.setValue(positions[i3], positions[i3 + 1], positions[i3 + 2]);
        triMesh.addTriangle(v1, v2, v3, true);
      }
      Ammo.destroy(v1);
      Ammo.destroy(v2);
      Ammo.destroy(v3);
    }
    const useQuantizedAabbCompression = true;
    const triMeshShape = new Ammo.btBvhTriangleMeshShape(triMesh, useQuantizedAabbCompression);
    const scaling = this.system._getNodeScaling(node);
    triMeshShape.setLocalScaling(scaling);
    Ammo.destroy(scaling);
    const transform = this.system._getNodeTransform(node);
    shape.addChildShape(transform, triMeshShape);
    Ammo.destroy(transform);
  }
  createPhysicalShape(entity, data) {
    if (typeof Ammo === 'undefined') return undefined;
    if (data.model || data.render) {
      const shape = new Ammo.btCompoundShape();
      if (data.model) {
        const meshInstances = data.model.meshInstances;
        for (let i = 0; i < meshInstances.length; i++) {
          this.createAmmoMesh(meshInstances[i].mesh, meshInstances[i].node, shape);
        }
      } else if (data.render) {
        const meshes = data.render.meshes;
        for (let i = 0; i < meshes.length; i++) {
          this.createAmmoMesh(meshes[i], tempGraphNode, shape);
        }
      }
      const entityTransform = entity.getWorldTransform();
      const scale = entityTransform.getScale();
      const vec = new Ammo.btVector3(scale.x, scale.y, scale.z);
      shape.setLocalScaling(vec);
      Ammo.destroy(vec);
      return shape;
    }
    return undefined;
  }
  recreatePhysicalShapes(component) {
    const data = component.data;
    if (data.renderAsset || data.asset) {
      if (component.enabled && component.entity.enabled) {
        this.loadAsset(component, data.renderAsset || data.asset, data.renderAsset ? 'render' : 'model');
        return;
      }
    }
    this.doRecreatePhysicalShape(component);
  }
  loadAsset(component, id, property) {
    const data = component.data;
    const assets = this.system.app.assets;
    const asset = assets.get(id);
    if (asset) {
      asset.ready(asset => {
        data[property] = asset.resource;
        this.doRecreatePhysicalShape(component);
      });
      assets.load(asset);
    } else {
      assets.once('add:' + id, asset => {
        asset.ready(asset => {
          data[property] = asset.resource;
          this.doRecreatePhysicalShape(component);
        });
        assets.load(asset);
      });
    }
  }
  doRecreatePhysicalShape(component) {
    const entity = component.entity;
    const data = component.data;
    if (data.model || data.render) {
      this.destroyShape(data);
      data.shape = this.createPhysicalShape(entity, data);
      if (entity.rigidbody) {
        entity.rigidbody.disableSimulation();
        entity.rigidbody.createBody();
        if (entity.enabled && entity.rigidbody.enabled) {
          entity.rigidbody.enableSimulation();
        }
      } else {
        if (!entity.trigger) {
          entity.trigger = new Trigger(this.system.app, component, data);
        } else {
          entity.trigger.initialize(data);
        }
      }
    } else {
      this.beforeRemove(entity, component);
      this.remove(entity, data);
    }
  }
  updateTransform(component, position, rotation, scale) {
    if (component.shape) {
      const entityTransform = component.entity.getWorldTransform();
      const worldScale = entityTransform.getScale();

      const previousScale = component.shape.getLocalScaling();
      if (worldScale.x !== previousScale.x() || worldScale.y !== previousScale.y() || worldScale.z !== previousScale.z()) {
        this.doRecreatePhysicalShape(component);
      }
    }
    super.updateTransform(component, position, rotation, scale);
  }
  destroyShape(data) {
    if (!data.shape) return;
    const numShapes = data.shape.getNumChildShapes();
    for (let i = 0; i < numShapes; i++) {
      const shape = data.shape.getChildShape(i);
      Ammo.destroy(shape);
    }
    Ammo.destroy(data.shape);
    data.shape = null;
  }
  remove(entity, data) {
    this.destroyShape(data);
    super.remove(entity, data);
  }
}

class CollisionCompoundSystemImpl extends CollisionSystemImpl {
  createPhysicalShape(entity, data) {
    if (typeof Ammo !== 'undefined') {
      return new Ammo.btCompoundShape();
    }
    return undefined;
  }
  _addEachDescendant(entity) {
    if (!entity.collision || entity.rigidbody) return;
    entity.collision._compoundParent = this;
    if (entity !== this.entity) {
      entity.collision.system.recreatePhysicalShapes(entity.collision);
    }
  }
  _updateEachDescendant(entity) {
    if (!entity.collision) return;
    if (entity.collision._compoundParent !== this) return;
    entity.collision._compoundParent = null;
    if (entity !== this.entity && !entity.rigidbody) {
      entity.collision.system.recreatePhysicalShapes(entity.collision);
    }
  }
  _updateEachDescendantTransform(entity) {
    if (!entity.collision || entity.collision._compoundParent !== this.collision._compoundParent) return;
    this.collision.system.updateCompoundChildTransform(entity);
  }
}

class CollisionComponentSystem extends ComponentSystem {
  constructor(app) {
    super(app);
    this.id = 'collision';
    this.ComponentType = CollisionComponent;
    this.DataType = CollisionComponentData;
    this.schema = _schema;
    this.implementations = {};
    this._triMeshCache = {};
    this.on('beforeremove', this.onBeforeRemove, this);
    this.on('remove', this.onRemove, this);
  }
  initializeComponentData(component, _data, properties) {
    properties = ['type', 'halfExtents', 'radius', 'axis', 'height', 'shape', 'model', 'asset', 'render', 'renderAsset', 'enabled', 'linearOffset', 'angularOffset'];

    const data = {};
    for (let i = 0, len = properties.length; i < len; i++) {
      const property = properties[i];
      data[property] = _data[property];
    }

    let idx;
    if (_data.hasOwnProperty('asset')) {
      idx = properties.indexOf('model');
      if (idx !== -1) {
        properties.splice(idx, 1);
      }
      idx = properties.indexOf('render');
      if (idx !== -1) {
        properties.splice(idx, 1);
      }
    } else if (_data.hasOwnProperty('model')) {
      idx = properties.indexOf('asset');
      if (idx !== -1) {
        properties.splice(idx, 1);
      }
    }
    if (!data.type) {
      data.type = component.data.type;
    }
    component.data.type = data.type;
    if (Array.isArray(data.halfExtents)) {
      data.halfExtents = new Vec3(data.halfExtents);
    }
    if (Array.isArray(data.linearOffset)) {
      data.linearOffset = new Vec3(data.linearOffset);
    }
    if (Array.isArray(data.angularOffset)) {
      const values = data.angularOffset;
      if (values.length === 3) {
        data.angularOffset = new Quat().setFromEulerAngles(values[0], values[1], values[2]);
      } else {
        data.angularOffset = new Quat(data.angularOffset);
      }
    }
    const impl = this._createImplementation(data.type);
    impl.beforeInitialize(component, data);
    super.initializeComponentData(component, data, properties);
    impl.afterInitialize(component, data);
  }

  _createImplementation(type) {
    if (this.implementations[type] === undefined) {
      let impl;
      switch (type) {
        case 'box':
          impl = new CollisionBoxSystemImpl(this);
          break;
        case 'sphere':
          impl = new CollisionSphereSystemImpl(this);
          break;
        case 'capsule':
          impl = new CollisionCapsuleSystemImpl(this);
          break;
        case 'cylinder':
          impl = new CollisionCylinderSystemImpl(this);
          break;
        case 'cone':
          impl = new CollisionConeSystemImpl(this);
          break;
        case 'mesh':
          impl = new CollisionMeshSystemImpl(this);
          break;
        case 'compound':
          impl = new CollisionCompoundSystemImpl(this);
          break;
      }
      this.implementations[type] = impl;
    }
    return this.implementations[type];
  }

  _getImplementation(entity) {
    return this.implementations[entity.collision.data.type];
  }
  cloneComponent(entity, clone) {
    return this._getImplementation(entity).clone(entity, clone);
  }
  onBeforeRemove(entity, component) {
    this.implementations[component.data.type].beforeRemove(entity, component);
    component.onBeforeRemove();
  }
  onRemove(entity, data) {
    this.implementations[data.type].remove(entity, data);
  }
  updateCompoundChildTransform(entity) {

    this._removeCompoundChild(entity.collision._compoundParent, entity.collision.data.shape);
    if (entity.enabled && entity.collision.enabled) {
      const transform = this._getNodeTransform(entity, entity.collision._compoundParent.entity);
      entity.collision._compoundParent.shape.addChildShape(transform, entity.collision.data.shape);
      Ammo.destroy(transform);
    }
  }
  _removeCompoundChild(collision, shape) {
    if (collision.shape.removeChildShape) {
      collision.shape.removeChildShape(shape);
    } else {
      const ind = collision._getCompoundChildShapeIndex(shape);
      if (ind !== null) {
        collision.shape.removeChildShapeByIndex(ind);
      }
    }
  }
  onTransformChanged(component, position, rotation, scale) {
    this.implementations[component.data.type].updateTransform(component, position, rotation, scale);
  }

  changeType(component, previousType, newType) {
    this.implementations[previousType].beforeRemove(component.entity, component);
    this.implementations[previousType].remove(component.entity, component.data);
    this._createImplementation(newType).reset(component, component.data);
  }

  recreatePhysicalShapes(component) {
    this.implementations[component.data.type].recreatePhysicalShapes(component);
  }
  _calculateNodeRelativeTransform(node, relative) {
    if (node === relative) {
      const scale = node.getWorldTransform().getScale();
      mat4.setScale(scale.x, scale.y, scale.z);
    } else {
      this._calculateNodeRelativeTransform(node.parent, relative);
      mat4.mul(node.getLocalTransform());
    }
  }
  _getNodeScaling(node) {
    const wtm = node.getWorldTransform();
    const scl = wtm.getScale();
    return new Ammo.btVector3(scl.x, scl.y, scl.z);
  }
  _getNodeTransform(node, relative) {
    let pos, rot;
    if (relative) {
      this._calculateNodeRelativeTransform(node, relative);
      pos = vec3;
      rot = quat;
      mat4.getTranslation(pos);
      rot.setFromMat4(mat4);
    } else {
      pos = node.getPosition();
      rot = node.getRotation();
    }
    const ammoQuat = new Ammo.btQuaternion();
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    const origin = transform.getOrigin();
    const component = node.collision;
    if (component && component._hasOffset) {
      const lo = component.data.linearOffset;
      const ao = component.data.angularOffset;
      quat.copy(rot).transformVector(lo, vec3);
      vec3.add(pos);
      quat.copy(rot).mul(ao);
      origin.setValue(vec3.x, vec3.y, vec3.z);
      ammoQuat.setValue(quat.x, quat.y, quat.z, quat.w);
    } else {
      origin.setValue(pos.x, pos.y, pos.z);
      ammoQuat.setValue(rot.x, rot.y, rot.z, rot.w);
    }
    transform.setRotation(ammoQuat);
    Ammo.destroy(ammoQuat);
    Ammo.destroy(origin);
    return transform;
  }
  destroy() {
    for (const key in this._triMeshCache) {
      Ammo.destroy(this._triMeshCache[key]);
    }
    this._triMeshCache = null;
    super.destroy();
  }
}
Component._buildAccessors(CollisionComponent.prototype, _schema);

export { CollisionComponentSystem };
