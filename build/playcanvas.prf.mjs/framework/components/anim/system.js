/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Component } from '../component.js';
import { ComponentSystem } from '../system.js';
import { AnimComponent } from './component.js';
import { AnimComponentData } from './data.js';

const _schema = ['enabled'];

class AnimComponentSystem extends ComponentSystem {
  constructor(app) {
    super(app);
    this.id = 'anim';
    this.ComponentType = AnimComponent;
    this.DataType = AnimComponentData;
    this.schema = _schema;
    this.on('beforeremove', this.onBeforeRemove, this);
    this.app.systems.on('animationUpdate', this.onAnimationUpdate, this);
  }
  initializeComponentData(component, data, properties) {
    super.initializeComponentData(component, data, _schema);
    const complexProperties = ['animationAssets', 'stateGraph', 'layers', 'masks'];
    Object.keys(data).forEach(key => {
      if (complexProperties.includes(key)) return;
      component[key] = data[key];
    });
    if (data.stateGraph) {
      component.stateGraph = data.stateGraph;
      component.loadStateGraph(component.stateGraph);
    }
    if (data.layers) {
      data.layers.forEach((layer, i) => {
        layer._controller.states.forEach(stateKey => {
          layer._controller._states[stateKey]._animationList.forEach(node => {
            component.layers[i].assignAnimation(node.name, node.animTrack);
          });
        });
      });
    } else if (data.animationAssets) {
      component.animationAssets = Object.assign(component.animationAssets, data.animationAssets);
    }
    if (data.masks) {
      Object.keys(data.masks).forEach(key => {
        if (component.layers[key]) {
          const maskData = data.masks[key].mask;
          const mask = {};
          Object.keys(maskData).forEach(maskKey => {
            mask[decodeURI(maskKey)] = maskData[maskKey];
          });
          component.layers[key].mask = mask;
        }
      });
    }
  }
  onAnimationUpdate(dt) {
    const components = this.store;
    for (const id in components) {
      if (components.hasOwnProperty(id)) {
        const component = components[id].entity.anim;
        const componentData = component.data;
        if (componentData.enabled && component.entity.enabled && component.playing) {
          component.update(dt);
        }
      }
    }
  }
  cloneComponent(entity, clone) {
    let masks;
    if (!entity.anim.rootBone || entity.anim.rootBone === entity) {
      masks = {};
      entity.anim.layers.forEach((layer, i) => {
        if (layer.mask) {
          const mask = {};
          Object.keys(layer.mask).forEach(path => {
            const pathArr = path.split('/');
            pathArr.shift();
            const clonePath = [clone.name, ...pathArr].join('/');
            mask[clonePath] = layer.mask[path];
          });
          masks[i] = {
            mask
          };
        }
      });
    }
    const data = {
      stateGraphAsset: entity.anim.stateGraphAsset,
      animationAssets: entity.anim.animationAssets,
      speed: entity.anim.speed,
      activate: entity.anim.activate,
      playing: entity.anim.playing,
      rootBone: entity.anim.rootBone,
      stateGraph: entity.anim.stateGraph,
      layers: entity.anim.layers,
      layerIndices: entity.anim.layerIndices,
      parameters: entity.anim.parameters,
      normalizeWeights: entity.anim.normalizeWeights,
      masks
    };
    return this.addComponent(clone, data);
  }
  onBeforeRemove(entity, component) {
    component.onBeforeRemove();
  }
  destroy() {
    super.destroy();
    this.app.systems.off('animationUpdate', this.onAnimationUpdate, this);
  }
}
Component._buildAccessors(AnimComponent.prototype, _schema);

export { AnimComponentSystem };
