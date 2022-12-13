/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../../core/debug.js';
import { Mat4 } from '../../../core/math/mat4.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { Entity } from '../../entity.js';
import { SCALEMODE_NONE, SCALEMODE_BLEND } from './constants.js';
import { Component } from '../component.js';

const _transform = new Mat4();

class ScreenComponent extends Component {
  constructor(system, entity) {
    super(system, entity);
    this._resolution = new Vec2(640, 320);
    this._referenceResolution = new Vec2(640, 320);
    this._scaleMode = SCALEMODE_NONE;
    this.scale = 1;
    this._scaleBlend = 0.5;
    this._priority = 0;
    this._screenSpace = false;

    this.cull = this._screenSpace;
    this._screenMatrix = new Mat4();
    this._elements = new Set();
    system.app.graphicsDevice.on('resizecanvas', this._onResize, this);
  }

  syncDrawOrder() {
    this.system.queueDrawOrderSync(this.entity.getGuid(), this._processDrawOrderSync, this);
  }
  _recurseDrawOrderSync(e, i) {
    if (!(e instanceof Entity)) {
      return i;
    }
    if (e.element) {
      const prevDrawOrder = e.element.drawOrder;
      e.element.drawOrder = i++;
      if (e.element._batchGroupId >= 0 && prevDrawOrder !== e.element.drawOrder) {
        var _this$system$app$batc;
        (_this$system$app$batc = this.system.app.batcher) == null ? void 0 : _this$system$app$batc.markGroupDirty(e.element._batchGroupId);
      }
    }

    if (e.particlesystem) {
      e.particlesystem.drawOrder = i++;
    }
    const children = e.children;
    for (let j = 0; j < children.length; j++) {
      i = this._recurseDrawOrderSync(children[j], i);
    }
    return i;
  }
  _processDrawOrderSync() {
    const i = 1;
    this._recurseDrawOrderSync(this.entity, i);

    this.fire('syncdraworder');
  }
  _calcProjectionMatrix() {
    const w = this._resolution.x / this.scale;
    const h = this._resolution.y / this.scale;
    const left = 0;
    const right = w;
    const bottom = -h;
    const top = 0;
    const near = 1;
    const far = -1;
    this._screenMatrix.setOrtho(left, right, bottom, top, near, far);
    if (!this._screenSpace) {
      _transform.setScale(0.5 * w, 0.5 * h, 1);
      this._screenMatrix.mul2(_transform, this._screenMatrix);
    }
  }
  _updateScale() {
    this.scale = this._calcScale(this._resolution, this.referenceResolution);
  }
  _calcScale(resolution, referenceResolution) {
    const lx = Math.log2(resolution.x / referenceResolution.x);
    const ly = Math.log2(resolution.y / referenceResolution.y);
    return Math.pow(2, lx * (1 - this._scaleBlend) + ly * this._scaleBlend);
  }
  _onResize(width, height) {
    if (this._screenSpace) {
      this._resolution.set(width, height);
      this.resolution = this._resolution;
    }
  }

  _bindElement(element) {
    this._elements.add(element);
  }
  _unbindElement(element) {
    this._elements.delete(element);
  }
  onRemove() {
    this.system.app.graphicsDevice.off('resizecanvas', this._onResize, this);
    this.fire('remove');
    this._elements.forEach(element => element._onScreenRemove());
    this._elements.clear();

    this.off();
  }

  set resolution(value) {
    if (!this._screenSpace) {
      this._resolution.set(value.x, value.y);
    } else {
      this._resolution.set(this.system.app.graphicsDevice.width, this.system.app.graphicsDevice.height);
    }
    this._updateScale();
    this._calcProjectionMatrix();
    if (!this.entity._dirtyLocal) this.entity._dirtifyLocal();
    this.fire('set:resolution', this._resolution);
    this._elements.forEach(element => element._onScreenResize(this._resolution));
  }
  get resolution() {
    return this._resolution;
  }

  set referenceResolution(value) {
    this._referenceResolution.set(value.x, value.y);
    this._updateScale();
    this._calcProjectionMatrix();
    if (!this.entity._dirtyLocal) this.entity._dirtifyLocal();
    this.fire('set:referenceresolution', this._resolution);
    this._elements.forEach(element => element._onScreenResize(this._resolution));
  }
  get referenceResolution() {
    if (this._scaleMode === SCALEMODE_NONE) {
      return this._resolution;
    }
    return this._referenceResolution;
  }

  set screenSpace(value) {
    this._screenSpace = value;
    if (this._screenSpace) {
      this._resolution.set(this.system.app.graphicsDevice.width, this.system.app.graphicsDevice.height);
    }
    this.resolution = this._resolution;

    if (!this.entity._dirtyLocal) this.entity._dirtifyLocal();
    this.fire('set:screenspace', this._screenSpace);
    this._elements.forEach(element => element._onScreenSpaceChange());
  }
  get screenSpace() {
    return this._screenSpace;
  }

  set scaleMode(value) {
    if (value !== SCALEMODE_NONE && value !== SCALEMODE_BLEND) {
      value = SCALEMODE_NONE;
    }

    if (!this._screenSpace && value !== SCALEMODE_NONE) {
      value = SCALEMODE_NONE;
    }
    this._scaleMode = value;
    this.resolution = this._resolution;
    this.fire('set:scalemode', this._scaleMode);
  }
  get scaleMode() {
    return this._scaleMode;
  }

  set scaleBlend(value) {
    this._scaleBlend = value;
    this._updateScale();
    this._calcProjectionMatrix();
    if (!this.entity._dirtyLocal) this.entity._dirtifyLocal();
    this.fire('set:scaleblend', this._scaleBlend);
    this._elements.forEach(element => element._onScreenResize(this._resolution));
  }
  get scaleBlend() {
    return this._scaleBlend;
  }

  set priority(value) {
    if (value > 0xFF) {
      Debug.warn(`Clamping screen priority from ${value} to 255`);
      value = 0xFF;
    }
    if (this._priority === value) {
      return;
    }
    this._priority = value;
    this.syncDrawOrder();
  }
  get priority() {
    return this._priority;
  }
}

export { ScreenComponent };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvc2NyZWVuL2NvbXBvbmVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZWJ1ZyB9IGZyb20gJy4uLy4uLy4uL2NvcmUvZGVidWcuanMnO1xuXG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vLi4vLi4vY29yZS9tYXRoL21hdDQuanMnO1xuaW1wb3J0IHsgVmVjMiB9IGZyb20gJy4uLy4uLy4uL2NvcmUvbWF0aC92ZWMyLmpzJztcblxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnLi4vLi4vZW50aXR5LmpzJztcblxuaW1wb3J0IHsgU0NBTEVNT0RFX0JMRU5ELCBTQ0FMRU1PREVfTk9ORSB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5cbmNvbnN0IF90cmFuc2Zvcm0gPSBuZXcgTWF0NCgpO1xuXG4vKipcbiAqIEEgU2NyZWVuQ29tcG9uZW50IGVuYWJsZXMgdGhlIEVudGl0eSB0byByZW5kZXIgY2hpbGQge0BsaW5rIEVsZW1lbnRDb21wb25lbnR9cyB1c2luZyBhbmNob3JzIGFuZFxuICogcG9zaXRpb25zIGluIHRoZSBTY3JlZW5Db21wb25lbnQncyBzcGFjZS5cbiAqXG4gKiBAYXVnbWVudHMgQ29tcG9uZW50XG4gKi9cbmNsYXNzIFNjcmVlbkNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IFNjcmVlbkNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuL3N5c3RlbS5qcycpLlNjcmVlbkNvbXBvbmVudFN5c3RlbX0gc3lzdGVtIC0gVGhlIENvbXBvbmVudFN5c3RlbSB0aGF0XG4gICAgICogY3JlYXRlZCB0aGlzIENvbXBvbmVudC5cbiAgICAgKiBAcGFyYW0ge0VudGl0eX0gZW50aXR5IC0gVGhlIEVudGl0eSB0aGF0IHRoaXMgQ29tcG9uZW50IGlzIGF0dGFjaGVkIHRvLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN5c3RlbSwgZW50aXR5KSB7XG4gICAgICAgIHN1cGVyKHN5c3RlbSwgZW50aXR5KTtcblxuICAgICAgICB0aGlzLl9yZXNvbHV0aW9uID0gbmV3IFZlYzIoNjQwLCAzMjApO1xuICAgICAgICB0aGlzLl9yZWZlcmVuY2VSZXNvbHV0aW9uID0gbmV3IFZlYzIoNjQwLCAzMjApO1xuICAgICAgICB0aGlzLl9zY2FsZU1vZGUgPSBTQ0FMRU1PREVfTk9ORTtcbiAgICAgICAgdGhpcy5zY2FsZSA9IDE7XG4gICAgICAgIHRoaXMuX3NjYWxlQmxlbmQgPSAwLjU7XG5cbiAgICAgICAgdGhpcy5fcHJpb3JpdHkgPSAwO1xuXG4gICAgICAgIHRoaXMuX3NjcmVlblNwYWNlID0gZmFsc2U7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRydWUgdGhlbiBlbGVtZW50cyBpbnNpZGUgdGhpcyBzY3JlZW4gd2lsbCBiZSBub3QgYmUgcmVuZGVyZWQgd2hlbiBvdXRzaWRlIG9mIHRoZVxuICAgICAgICAgKiBzY3JlZW4gKG9ubHkgdmFsaWQgd2hlbiBzY3JlZW5TcGFjZSBpcyB0cnVlKS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmN1bGwgPSB0aGlzLl9zY3JlZW5TcGFjZTtcbiAgICAgICAgdGhpcy5fc2NyZWVuTWF0cml4ID0gbmV3IE1hdDQoKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50cyA9IG5ldyBTZXQoKTtcblxuICAgICAgICBzeXN0ZW0uYXBwLmdyYXBoaWNzRGV2aWNlLm9uKCdyZXNpemVjYW52YXMnLCB0aGlzLl9vblJlc2l6ZSwgdGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBkcmF3T3JkZXIgb2YgZWFjaCBjaGlsZCB7QGxpbmsgRWxlbWVudENvbXBvbmVudH0gc28gdGhhdCBFbGVtZW50Q29tcG9uZW50cyB3aGljaCBhcmVcbiAgICAgKiBsYXN0IGluIHRoZSBoaWVyYXJjaHkgYXJlIHJlbmRlcmVkIG9uIHRvcC4gRHJhdyBPcmRlciBzeW5jIGlzIHF1ZXVlZCBhbmQgd2lsbCBiZSB1cGRhdGVkIGJ5XG4gICAgICogdGhlIG5leHQgdXBkYXRlIGxvb3AuXG4gICAgICovXG4gICAgc3luY0RyYXdPcmRlcigpIHtcbiAgICAgICAgdGhpcy5zeXN0ZW0ucXVldWVEcmF3T3JkZXJTeW5jKHRoaXMuZW50aXR5LmdldEd1aWQoKSwgdGhpcy5fcHJvY2Vzc0RyYXdPcmRlclN5bmMsIHRoaXMpO1xuICAgIH1cblxuICAgIF9yZWN1cnNlRHJhd09yZGVyU3luYyhlLCBpKSB7XG4gICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBFbnRpdHkpKSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlLmVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXZEcmF3T3JkZXIgPSBlLmVsZW1lbnQuZHJhd09yZGVyO1xuICAgICAgICAgICAgZS5lbGVtZW50LmRyYXdPcmRlciA9IGkrKztcblxuICAgICAgICAgICAgaWYgKGUuZWxlbWVudC5fYmF0Y2hHcm91cElkID49IDAgJiYgcHJldkRyYXdPcmRlciAhPT0gZS5lbGVtZW50LmRyYXdPcmRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc3lzdGVtLmFwcC5iYXRjaGVyPy5tYXJrR3JvdXBEaXJ0eShlLmVsZW1lbnQuX2JhdGNoR3JvdXBJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjaGlsZCBwYXJ0aWNsZSBzeXN0ZW0gaW5zaWRlIDJEIHNjcmVlbiBzdWItaGllcmFyY2h5IGdldHMgc29ydGVkIGFsb25nIG90aGVyIDJEIGVsZW1lbnRzXG4gICAgICAgIGlmIChlLnBhcnRpY2xlc3lzdGVtKSB7XG4gICAgICAgICAgICBlLnBhcnRpY2xlc3lzdGVtLmRyYXdPcmRlciA9IGkrKztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gZS5jaGlsZHJlbjtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaSA9IHRoaXMuX3JlY3Vyc2VEcmF3T3JkZXJTeW5jKGNoaWxkcmVuW2pdLCBpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpO1xuICAgIH1cblxuICAgIF9wcm9jZXNzRHJhd09yZGVyU3luYygpIHtcbiAgICAgICAgY29uc3QgaSA9IDE7XG5cbiAgICAgICAgdGhpcy5fcmVjdXJzZURyYXdPcmRlclN5bmModGhpcy5lbnRpdHksIGkpO1xuXG4gICAgICAgIC8vIGZpcmUgaW50ZXJuYWwgZXZlbnQgYWZ0ZXIgYWxsIHNjcmVlbiBoaWVyYXJjaHkgaXMgc3luY2VkXG4gICAgICAgIHRoaXMuZmlyZSgnc3luY2RyYXdvcmRlcicpO1xuICAgIH1cblxuICAgIF9jYWxjUHJvamVjdGlvbk1hdHJpeCgpIHtcbiAgICAgICAgY29uc3QgdyA9IHRoaXMuX3Jlc29sdXRpb24ueCAvIHRoaXMuc2NhbGU7XG4gICAgICAgIGNvbnN0IGggPSB0aGlzLl9yZXNvbHV0aW9uLnkgLyB0aGlzLnNjYWxlO1xuXG4gICAgICAgIGNvbnN0IGxlZnQgPSAwO1xuICAgICAgICBjb25zdCByaWdodCA9IHc7XG4gICAgICAgIGNvbnN0IGJvdHRvbSA9IC1oO1xuICAgICAgICBjb25zdCB0b3AgPSAwO1xuICAgICAgICBjb25zdCBuZWFyID0gMTtcbiAgICAgICAgY29uc3QgZmFyID0gLTE7XG5cbiAgICAgICAgdGhpcy5fc2NyZWVuTWF0cml4LnNldE9ydGhvKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKTtcblxuICAgICAgICBpZiAoIXRoaXMuX3NjcmVlblNwYWNlKSB7XG4gICAgICAgICAgICBfdHJhbnNmb3JtLnNldFNjYWxlKDAuNSAqIHcsIDAuNSAqIGgsIDEpO1xuICAgICAgICAgICAgdGhpcy5fc2NyZWVuTWF0cml4Lm11bDIoX3RyYW5zZm9ybSwgdGhpcy5fc2NyZWVuTWF0cml4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF91cGRhdGVTY2FsZSgpIHtcbiAgICAgICAgdGhpcy5zY2FsZSA9IHRoaXMuX2NhbGNTY2FsZSh0aGlzLl9yZXNvbHV0aW9uLCB0aGlzLnJlZmVyZW5jZVJlc29sdXRpb24pO1xuICAgIH1cblxuICAgIF9jYWxjU2NhbGUocmVzb2x1dGlvbiwgcmVmZXJlbmNlUmVzb2x1dGlvbikge1xuICAgICAgICAvLyBVc2luZyBsb2cgb2Ygc2NhbGUgdmFsdWVzXG4gICAgICAgIC8vIFRoaXMgcHJvZHVjZXMgYSBuaWNlciBvdXRjb21lIHdoZXJlIGlmIHlvdSBoYXZlIGEgeHNjYWxlID0gMiBhbmQgeXNjYWxlID0gMC41XG4gICAgICAgIC8vIHRoZSBjb21iaW5lZCBzY2FsZSBpcyAxIGZvciBhbiBldmVuIGJsZW5kXG4gICAgICAgIGNvbnN0IGx4ID0gTWF0aC5sb2cyKHJlc29sdXRpb24ueCAvIHJlZmVyZW5jZVJlc29sdXRpb24ueCk7XG4gICAgICAgIGNvbnN0IGx5ID0gTWF0aC5sb2cyKHJlc29sdXRpb24ueSAvIHJlZmVyZW5jZVJlc29sdXRpb24ueSk7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdygyLCAobHggKiAoMSAtIHRoaXMuX3NjYWxlQmxlbmQpICsgbHkgKiB0aGlzLl9zY2FsZUJsZW5kKSk7XG4gICAgfVxuXG4gICAgX29uUmVzaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NjcmVlblNwYWNlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvbHV0aW9uLnNldCh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMucmVzb2x1dGlvbiA9IHRoaXMuX3Jlc29sdXRpb247IC8vIGZvcmNlIHVwZGF0ZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2JpbmRFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuICAgIH1cblxuICAgIF91bmJpbmRFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudHMuZGVsZXRlKGVsZW1lbnQpO1xuICAgIH1cblxuICAgIG9uUmVtb3ZlKCkge1xuICAgICAgICB0aGlzLnN5c3RlbS5hcHAuZ3JhcGhpY3NEZXZpY2Uub2ZmKCdyZXNpemVjYW52YXMnLCB0aGlzLl9vblJlc2l6ZSwgdGhpcyk7XG4gICAgICAgIHRoaXMuZmlyZSgncmVtb3ZlJyk7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IGVsZW1lbnQuX29uU2NyZWVuUmVtb3ZlKCkpO1xuICAgICAgICB0aGlzLl9lbGVtZW50cy5jbGVhcigpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBhbGwgZXZlbnRzXG4gICAgICAgIHRoaXMub2ZmKCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgU2NyZWVuQ29tcG9uZW50LiBXaGVuIHNjcmVlblNwYWNlIGlzIHRydWUgdGhlIHJlc29sdXRpb24gd2lsbFxuICAgICAqIGFsd2F5cyBiZSBlcXVhbCB0byB7QGxpbmsgR3JhcGhpY3NEZXZpY2Ujd2lkdGh9IHgge0BsaW5rIEdyYXBoaWNzRGV2aWNlI2hlaWdodH0uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7VmVjMn1cbiAgICAgKi9cbiAgICBzZXQgcmVzb2x1dGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAoIXRoaXMuX3NjcmVlblNwYWNlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvbHV0aW9uLnNldCh2YWx1ZS54LCB2YWx1ZS55KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlnbm9yZSBpbnB1dCB3aGVuIHVzaW5nIHNjcmVlbiBzcGFjZS5cbiAgICAgICAgICAgIHRoaXMuX3Jlc29sdXRpb24uc2V0KHRoaXMuc3lzdGVtLmFwcC5ncmFwaGljc0RldmljZS53aWR0aCwgdGhpcy5zeXN0ZW0uYXBwLmdyYXBoaWNzRGV2aWNlLmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl91cGRhdGVTY2FsZSgpO1xuXG4gICAgICAgIHRoaXMuX2NhbGNQcm9qZWN0aW9uTWF0cml4KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmVudGl0eS5fZGlydHlMb2NhbClcbiAgICAgICAgICAgIHRoaXMuZW50aXR5Ll9kaXJ0aWZ5TG9jYWwoKTtcblxuICAgICAgICB0aGlzLmZpcmUoJ3NldDpyZXNvbHV0aW9uJywgdGhpcy5fcmVzb2x1dGlvbik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiBlbGVtZW50Ll9vblNjcmVlblJlc2l6ZSh0aGlzLl9yZXNvbHV0aW9uKSk7XG4gICAgfVxuXG4gICAgZ2V0IHJlc29sdXRpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZXNvbHV0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSByZXNvbHV0aW9uIHRoYXQgdGhlIFNjcmVlbkNvbXBvbmVudCBpcyBkZXNpZ25lZCBmb3IuIFRoaXMgaXMgb25seSB0YWtlbiBpbnRvIGFjY291bnRcbiAgICAgKiB3aGVuIHNjcmVlblNwYWNlIGlzIHRydWUgYW5kIHNjYWxlTW9kZSBpcyB7QGxpbmsgU0NBTEVNT0RFX0JMRU5EfS4gSWYgdGhlIGFjdHVhbCByZXNvbHV0aW9uXG4gICAgICogaXMgZGlmZmVyZW50IHRoZW4gdGhlIFNjcmVlbkNvbXBvbmVudCB3aWxsIGJlIHNjYWxlZCBhY2NvcmRpbmcgdG8gdGhlIHNjYWxlQmxlbmQgdmFsdWUuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7VmVjMn1cbiAgICAgKi9cbiAgICBzZXQgcmVmZXJlbmNlUmVzb2x1dGlvbih2YWx1ZSkge1xuICAgICAgICB0aGlzLl9yZWZlcmVuY2VSZXNvbHV0aW9uLnNldCh2YWx1ZS54LCB2YWx1ZS55KTtcbiAgICAgICAgdGhpcy5fdXBkYXRlU2NhbGUoKTtcbiAgICAgICAgdGhpcy5fY2FsY1Byb2plY3Rpb25NYXRyaXgoKTtcblxuICAgICAgICBpZiAoIXRoaXMuZW50aXR5Ll9kaXJ0eUxvY2FsKVxuICAgICAgICAgICAgdGhpcy5lbnRpdHkuX2RpcnRpZnlMb2NhbCgpO1xuXG4gICAgICAgIHRoaXMuZmlyZSgnc2V0OnJlZmVyZW5jZXJlc29sdXRpb24nLCB0aGlzLl9yZXNvbHV0aW9uKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IGVsZW1lbnQuX29uU2NyZWVuUmVzaXplKHRoaXMuX3Jlc29sdXRpb24pKTtcbiAgICB9XG5cbiAgICBnZXQgcmVmZXJlbmNlUmVzb2x1dGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NjYWxlTW9kZSA9PT0gU0NBTEVNT0RFX05PTkUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXNvbHV0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZlcmVuY2VSZXNvbHV0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIHRydWUgdGhlbiB0aGUgU2NyZWVuQ29tcG9uZW50IHdpbGwgcmVuZGVyIGl0cyBjaGlsZCB7QGxpbmsgRWxlbWVudENvbXBvbmVudH1zIGluIHNjcmVlblxuICAgICAqIHNwYWNlIGluc3RlYWQgb2Ygd29ybGQgc3BhY2UuIEVuYWJsZSB0aGlzIHRvIGNyZWF0ZSAyRCB1c2VyIGludGVyZmFjZXMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBzZXQgc2NyZWVuU3BhY2UodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc2NyZWVuU3BhY2UgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMuX3NjcmVlblNwYWNlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvbHV0aW9uLnNldCh0aGlzLnN5c3RlbS5hcHAuZ3JhcGhpY3NEZXZpY2Uud2lkdGgsIHRoaXMuc3lzdGVtLmFwcC5ncmFwaGljc0RldmljZS5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzb2x1dGlvbiA9IHRoaXMuX3Jlc29sdXRpb247IC8vIGZvcmNlIHVwZGF0ZSBlaXRoZXIgd2F5XG5cbiAgICAgICAgaWYgKCF0aGlzLmVudGl0eS5fZGlydHlMb2NhbClcbiAgICAgICAgICAgIHRoaXMuZW50aXR5Ll9kaXJ0aWZ5TG9jYWwoKTtcblxuICAgICAgICB0aGlzLmZpcmUoJ3NldDpzY3JlZW5zcGFjZScsIHRoaXMuX3NjcmVlblNwYWNlKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gZWxlbWVudC5fb25TY3JlZW5TcGFjZUNoYW5nZSgpKTtcbiAgICB9XG5cbiAgICBnZXQgc2NyZWVuU3BhY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5TcGFjZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYW4gZWl0aGVyIGJlIHtAbGluayBTQ0FMRU1PREVfTk9ORX0gb3Ige0BsaW5rIFNDQUxFTU9ERV9CTEVORH0uIFNlZSB0aGUgZGVzY3JpcHRpb24gb2ZcbiAgICAgKiByZWZlcmVuY2VSZXNvbHV0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBzZXQgc2NhbGVNb2RlKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gU0NBTEVNT0RFX05PTkUgJiYgdmFsdWUgIT09IFNDQUxFTU9ERV9CTEVORCkge1xuICAgICAgICAgICAgdmFsdWUgPSBTQ0FMRU1PREVfTk9ORTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdvcmxkIHNwYWNlIHNjcmVlbnMgZG8gbm90IHN1cHBvcnQgc2NhbGUgbW9kZXNcbiAgICAgICAgaWYgKCF0aGlzLl9zY3JlZW5TcGFjZSAmJiB2YWx1ZSAhPT0gU0NBTEVNT0RFX05PTkUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gU0NBTEVNT0RFX05PTkU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zY2FsZU1vZGUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5yZXNvbHV0aW9uID0gdGhpcy5fcmVzb2x1dGlvbjsgLy8gZm9yY2UgdXBkYXRlXG4gICAgICAgIHRoaXMuZmlyZSgnc2V0OnNjYWxlbW9kZScsIHRoaXMuX3NjYWxlTW9kZSk7XG4gICAgfVxuXG4gICAgZ2V0IHNjYWxlTW9kZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjYWxlTW9kZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIHZhbHVlIGJldHdlZW4gMCBhbmQgMSB0aGF0IGlzIHVzZWQgd2hlbiBzY2FsZU1vZGUgaXMgZXF1YWwgdG8ge0BsaW5rIFNDQUxFTU9ERV9CTEVORH0uXG4gICAgICogU2NhbGVzIHRoZSBTY3JlZW5Db21wb25lbnQgd2l0aCB3aWR0aCBhcyBhIHJlZmVyZW5jZSAod2hlbiB2YWx1ZSBpcyAwKSwgdGhlIGhlaWdodCBhcyBhXG4gICAgICogcmVmZXJlbmNlICh3aGVuIHZhbHVlIGlzIDEpIG9yIGFueXRoaW5nIGluIGJldHdlZW4uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHNldCBzY2FsZUJsZW5kKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3NjYWxlQmxlbmQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fdXBkYXRlU2NhbGUoKTtcbiAgICAgICAgdGhpcy5fY2FsY1Byb2plY3Rpb25NYXRyaXgoKTtcblxuICAgICAgICBpZiAoIXRoaXMuZW50aXR5Ll9kaXJ0eUxvY2FsKVxuICAgICAgICAgICAgdGhpcy5lbnRpdHkuX2RpcnRpZnlMb2NhbCgpO1xuXG4gICAgICAgIHRoaXMuZmlyZSgnc2V0OnNjYWxlYmxlbmQnLCB0aGlzLl9zY2FsZUJsZW5kKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gZWxlbWVudC5fb25TY3JlZW5SZXNpemUodGhpcy5fcmVzb2x1dGlvbikpO1xuICAgIH1cblxuICAgIGdldCBzY2FsZUJsZW5kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2NhbGVCbGVuZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmlvcml0eSBkZXRlcm1pbmVzIHRoZSBvcmRlciBpbiB3aGljaCBTY3JlZW4gY29tcG9uZW50cyBpbiB0aGUgc2FtZSBsYXllciBhcmUgcmVuZGVyZWQuXG4gICAgICogTnVtYmVyIG11c3QgYmUgYW4gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIDI1NS4gUHJpb3JpdHkgaXMgc2V0IGludG8gdGhlIHRvcCA4IGJpdHMgb2YgdGhlXG4gICAgICogZHJhd09yZGVyIHByb3BlcnR5IGluIGFuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHNldCBwcmlvcml0eSh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgPiAweEZGKSB7XG4gICAgICAgICAgICBEZWJ1Zy53YXJuKGBDbGFtcGluZyBzY3JlZW4gcHJpb3JpdHkgZnJvbSAke3ZhbHVlfSB0byAyNTVgKTtcbiAgICAgICAgICAgIHZhbHVlID0gMHhGRjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fcHJpb3JpdHkgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wcmlvcml0eSA9IHZhbHVlO1xuICAgICAgICB0aGlzLnN5bmNEcmF3T3JkZXIoKTtcbiAgICB9XG5cbiAgICBnZXQgcHJpb3JpdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wcmlvcml0eTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFNjcmVlbkNvbXBvbmVudCB9O1xuIl0sIm5hbWVzIjpbIl90cmFuc2Zvcm0iLCJNYXQ0IiwiU2NyZWVuQ29tcG9uZW50IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJzeXN0ZW0iLCJlbnRpdHkiLCJfcmVzb2x1dGlvbiIsIlZlYzIiLCJfcmVmZXJlbmNlUmVzb2x1dGlvbiIsIl9zY2FsZU1vZGUiLCJTQ0FMRU1PREVfTk9ORSIsInNjYWxlIiwiX3NjYWxlQmxlbmQiLCJfcHJpb3JpdHkiLCJfc2NyZWVuU3BhY2UiLCJjdWxsIiwiX3NjcmVlbk1hdHJpeCIsIl9lbGVtZW50cyIsIlNldCIsImFwcCIsImdyYXBoaWNzRGV2aWNlIiwib24iLCJfb25SZXNpemUiLCJzeW5jRHJhd09yZGVyIiwicXVldWVEcmF3T3JkZXJTeW5jIiwiZ2V0R3VpZCIsIl9wcm9jZXNzRHJhd09yZGVyU3luYyIsIl9yZWN1cnNlRHJhd09yZGVyU3luYyIsImUiLCJpIiwiRW50aXR5IiwiZWxlbWVudCIsInByZXZEcmF3T3JkZXIiLCJkcmF3T3JkZXIiLCJfYmF0Y2hHcm91cElkIiwiYmF0Y2hlciIsIm1hcmtHcm91cERpcnR5IiwicGFydGljbGVzeXN0ZW0iLCJjaGlsZHJlbiIsImoiLCJsZW5ndGgiLCJmaXJlIiwiX2NhbGNQcm9qZWN0aW9uTWF0cml4IiwidyIsIngiLCJoIiwieSIsImxlZnQiLCJyaWdodCIsImJvdHRvbSIsInRvcCIsIm5lYXIiLCJmYXIiLCJzZXRPcnRobyIsInNldFNjYWxlIiwibXVsMiIsIl91cGRhdGVTY2FsZSIsIl9jYWxjU2NhbGUiLCJyZWZlcmVuY2VSZXNvbHV0aW9uIiwicmVzb2x1dGlvbiIsImx4IiwiTWF0aCIsImxvZzIiLCJseSIsInBvdyIsIndpZHRoIiwiaGVpZ2h0Iiwic2V0IiwiX2JpbmRFbGVtZW50IiwiYWRkIiwiX3VuYmluZEVsZW1lbnQiLCJkZWxldGUiLCJvblJlbW92ZSIsIm9mZiIsImZvckVhY2giLCJfb25TY3JlZW5SZW1vdmUiLCJjbGVhciIsInZhbHVlIiwiX2RpcnR5TG9jYWwiLCJfZGlydGlmeUxvY2FsIiwiX29uU2NyZWVuUmVzaXplIiwic2NyZWVuU3BhY2UiLCJfb25TY3JlZW5TcGFjZUNoYW5nZSIsInNjYWxlTW9kZSIsIlNDQUxF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
