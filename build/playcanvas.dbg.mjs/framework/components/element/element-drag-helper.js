/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { platform } from '../../../core/platform.js';
import { EventHandler } from '../../../core/event-handler.js';
import { Quat } from '../../../core/math/quat.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { Vec3 } from '../../../core/math/vec3.js';
import { ElementComponent } from './component.js';
import { Ray } from '../../../core/shape/ray.js';
import { Plane } from '../../../core/shape/plane.js';

const _inputScreenPosition = new Vec2();
const _inputWorldPosition = new Vec3();
const _ray = new Ray();
const _plane = new Plane();
const _normal = new Vec3();
const _point = new Vec3();
const _entityRotation = new Quat();
const OPPOSITE_AXIS = {
  x: 'y',
  y: 'x'
};

/**
 * Helper class that makes it easy to create Elements that can be dragged by the mouse or touch.
 *
 * @augments EventHandler
 */
class ElementDragHelper extends EventHandler {
  /**
   * Create a new ElementDragHelper instance.
   *
   * @param {ElementComponent} element - The Element that should become draggable.
   * @param {string} [axis] - Optional axis to constrain to, either 'x', 'y' or null.
   */
  constructor(element, axis) {
    super();
    if (!element || !(element instanceof ElementComponent)) {
      throw new Error('Element was null or not an ElementComponent');
    }
    if (axis && axis !== 'x' && axis !== 'y') {
      throw new Error('Unrecognized axis: ' + axis);
    }
    this._element = element;
    this._app = element.system.app;
    this._axis = axis || null;
    this._enabled = true;
    this._dragScale = new Vec3();
    this._dragStartMousePosition = new Vec3();
    this._dragStartHandlePosition = new Vec3();
    this._deltaMousePosition = new Vec3();
    this._deltaHandlePosition = new Vec3();
    this._isDragging = false;
    this._toggleLifecycleListeners('on');
  }

  /**
   * Fired when a new drag operation starts.
   *
   * @event ElementDragHelper#drag:start
   */

  /**
   * Fired when the current new drag operation ends.
   *
   * @event ElementDragHelper#drag:end
   */

  /**
   * Fired whenever the position of the dragged element changes.
   *
   * @event ElementDragHelper#drag:move
   * @param {Vec3} value - The current position.
   */

  _toggleLifecycleListeners(onOrOff) {
    this._element[onOrOff]('mousedown', this._onMouseDownOrTouchStart, this);
    this._element[onOrOff]('touchstart', this._onMouseDownOrTouchStart, this);
    this._element[onOrOff]('selectstart', this._onMouseDownOrTouchStart, this);
  }

  /**
   * @param {'on'|'off'} onOrOff - Either 'on' or 'off'.
   * @private
   */
  _toggleDragListeners(onOrOff) {
    const isOn = onOrOff === 'on';

    // Prevent multiple listeners
    if (this._hasDragListeners && isOn) {
      return;
    }

    // mouse events, if mouse is available
    if (this._app.mouse) {
      this._element[onOrOff]('mousemove', this._onMove, this);
      this._element[onOrOff]('mouseup', this._onMouseUpOrTouchEnd, this);
    }

    // touch events, if touch is available
    if (platform.touch) {
      this._element[onOrOff]('touchmove', this._onMove, this);
      this._element[onOrOff]('touchend', this._onMouseUpOrTouchEnd, this);
      this._element[onOrOff]('touchcancel', this._onMouseUpOrTouchEnd, this);
    }

    // webxr events
    this._element[onOrOff]('selectmove', this._onMove, this);
    this._element[onOrOff]('selectend', this._onMouseUpOrTouchEnd, this);
    this._hasDragListeners = isOn;
  }
  _onMouseDownOrTouchStart(event) {
    if (this._element && !this._isDragging && this.enabled) {
      this._dragCamera = event.camera;
      this._calculateDragScale();
      const currentMousePosition = this._screenToLocal(event);
      if (currentMousePosition) {
        this._toggleDragListeners('on');
        this._isDragging = true;
        this._dragStartMousePosition.copy(currentMousePosition);
        this._dragStartHandlePosition.copy(this._element.entity.getLocalPosition());
        this.fire('drag:start');
      }
    }
  }
  _onMouseUpOrTouchEnd() {
    if (this._isDragging) {
      this._isDragging = false;
      this._toggleDragListeners('off');
      this.fire('drag:end');
    }
  }

  /**
   * This method calculates the `Vec3` intersection point of plane/ray intersection based on
   * the mouse/touch input event. If there is no intersection, it returns `null`.
   *
   * @param {import('../../input/element-input').ElementTouchEvent | import('../../input/element-input').ElementMouseEvent | import('../../input/element-input').ElementSelectEvent} event - The event.
   * @returns {Vec3|null} The `Vec3` intersection point of plane/ray intersection, if there
   * is an intersection, otherwise `null`
   * @private
   */
  _screenToLocal(event) {
    if (event.inputSource) {
      _ray.set(event.inputSource.getOrigin(), event.inputSource.getDirection());
    } else {
      this._determineInputPosition(event);
      this._chooseRayOriginAndDirection();
    }
    _normal.copy(this._element.entity.forward).mulScalar(-1);
    _plane.setFromPointNormal(this._element.entity.getPosition(), _normal);
    if (_plane.intersectsRay(_ray, _point)) {
      _entityRotation.copy(this._element.entity.getRotation()).invert().transformVector(_point, _point);
      _point.mul(this._dragScale);
      return _point;
    }
    return null;
  }
  _determineInputPosition(event) {
    const devicePixelRatio = this._app.graphicsDevice.maxPixelRatio;
    if (typeof event.x !== 'undefined' && typeof event.y !== 'undefined') {
      _inputScreenPosition.x = event.x * devicePixelRatio;
      _inputScreenPosition.y = event.y * devicePixelRatio;
    } else if (event.changedTouches) {
      _inputScreenPosition.x = event.changedTouches[0].x * devicePixelRatio;
      _inputScreenPosition.y = event.changedTouches[0].y * devicePixelRatio;
    } else {
      console.warn('Could not determine position from input event');
    }
  }
  _chooseRayOriginAndDirection() {
    if (this._element.screen && this._element.screen.screen.screenSpace) {
      _ray.origin.set(_inputScreenPosition.x, -_inputScreenPosition.y, 0);
      _ray.direction.copy(Vec3.FORWARD);
    } else {
      _inputWorldPosition.copy(this._dragCamera.screenToWorld(_inputScreenPosition.x, _inputScreenPosition.y, 1));
      _ray.origin.copy(this._dragCamera.entity.getPosition());
      _ray.direction.copy(_inputWorldPosition).sub(_ray.origin).normalize();
    }
  }
  _calculateDragScale() {
    let current = this._element.entity.parent;
    const screen = this._element.screen && this._element.screen.screen;
    const isWithin2DScreen = screen && screen.screenSpace;
    const screenScale = isWithin2DScreen ? screen.scale : 1;
    const dragScale = this._dragScale;
    dragScale.set(screenScale, screenScale, screenScale);
    while (current) {
      dragScale.mul(current.getLocalScale());
      current = current.parent;
      if (isWithin2DScreen && current.screen) {
        break;
      }
    }
    dragScale.x = 1 / dragScale.x;
    dragScale.y = 1 / dragScale.y;
    dragScale.z = 0;
  }

  /**
   * This method is linked to `_element` events: `mousemove` and `touchmove`
   *
   * @param {import('../../input/element-input').ElementTouchEvent} event - The event.
   * @private
   */
  _onMove(event) {
    const {
      _element: element,
      _deltaMousePosition: deltaMousePosition,
      _deltaHandlePosition: deltaHandlePosition,
      _axis: axis
    } = this;
    if (element && this._isDragging && this.enabled && element.enabled && element.entity.enabled) {
      const currentMousePosition = this._screenToLocal(event);
      if (currentMousePosition) {
        deltaMousePosition.sub2(currentMousePosition, this._dragStartMousePosition);
        deltaHandlePosition.add2(this._dragStartHandlePosition, deltaMousePosition);
        if (axis) {
          const currentPosition = element.entity.getLocalPosition();
          const constrainedAxis = OPPOSITE_AXIS[axis];
          deltaHandlePosition[constrainedAxis] = currentPosition[constrainedAxis];
        }
        element.entity.setLocalPosition(deltaHandlePosition);
        this.fire('drag:move', deltaHandlePosition);
      }
    }
  }
  destroy() {
    this._toggleLifecycleListeners('off');
    this._toggleDragListeners('off');
  }
  set enabled(value) {
    this._enabled = value;
  }
  get enabled() {
    return this._enabled;
  }
  get isDragging() {
    return this._isDragging;
  }
}

export { ElementDragHelper };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudC1kcmFnLWhlbHBlci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9jb21wb25lbnRzL2VsZW1lbnQvZWxlbWVudC1kcmFnLWhlbHBlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gJy4uLy4uLy4uL2NvcmUvcGxhdGZvcm0uanMnO1xuaW1wb3J0IHsgRXZlbnRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vLi4vY29yZS9ldmVudC1oYW5kbGVyLmpzJztcblxuaW1wb3J0IHsgUXVhdCB9IGZyb20gJy4uLy4uLy4uL2NvcmUvbWF0aC9xdWF0LmpzJztcbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuLi8uLi8uLi9jb3JlL21hdGgvdmVjMi5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vLi4vLi4vY29yZS9tYXRoL3ZlYzMuanMnO1xuXG5pbXBvcnQgeyBFbGVtZW50Q29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnQuanMnO1xuaW1wb3J0IHsgUmF5IH0gZnJvbSAnLi4vLi4vLi4vY29yZS9zaGFwZS9yYXkuanMnO1xuaW1wb3J0IHsgUGxhbmUgfSBmcm9tICcuLi8uLi8uLi9jb3JlL3NoYXBlL3BsYW5lLmpzJztcblxuY29uc3QgX2lucHV0U2NyZWVuUG9zaXRpb24gPSBuZXcgVmVjMigpO1xuY29uc3QgX2lucHV0V29ybGRQb3NpdGlvbiA9IG5ldyBWZWMzKCk7XG5jb25zdCBfcmF5ID0gbmV3IFJheSgpO1xuY29uc3QgX3BsYW5lID0gbmV3IFBsYW5lKCk7XG5jb25zdCBfbm9ybWFsID0gbmV3IFZlYzMoKTtcbmNvbnN0IF9wb2ludCA9IG5ldyBWZWMzKCk7XG5jb25zdCBfZW50aXR5Um90YXRpb24gPSBuZXcgUXVhdCgpO1xuXG5jb25zdCBPUFBPU0lURV9BWElTID0ge1xuICAgIHg6ICd5JyxcbiAgICB5OiAneCdcbn07XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIHRoYXQgbWFrZXMgaXQgZWFzeSB0byBjcmVhdGUgRWxlbWVudHMgdGhhdCBjYW4gYmUgZHJhZ2dlZCBieSB0aGUgbW91c2Ugb3IgdG91Y2guXG4gKlxuICogQGF1Z21lbnRzIEV2ZW50SGFuZGxlclxuICovXG5jbGFzcyBFbGVtZW50RHJhZ0hlbHBlciBleHRlbmRzIEV2ZW50SGFuZGxlciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IEVsZW1lbnREcmFnSGVscGVyIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFbGVtZW50Q29tcG9uZW50fSBlbGVtZW50IC0gVGhlIEVsZW1lbnQgdGhhdCBzaG91bGQgYmVjb21lIGRyYWdnYWJsZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2F4aXNdIC0gT3B0aW9uYWwgYXhpcyB0byBjb25zdHJhaW4gdG8sIGVpdGhlciAneCcsICd5JyBvciBudWxsLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGF4aXMpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBpZiAoIWVsZW1lbnQgfHwgIShlbGVtZW50IGluc3RhbmNlb2YgRWxlbWVudENvbXBvbmVudCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRWxlbWVudCB3YXMgbnVsbCBvciBub3QgYW4gRWxlbWVudENvbXBvbmVudCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGF4aXMgJiYgYXhpcyAhPT0gJ3gnICYmIGF4aXMgIT09ICd5Jykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlY29nbml6ZWQgYXhpczogJyArIGF4aXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX2FwcCA9IGVsZW1lbnQuc3lzdGVtLmFwcDtcbiAgICAgICAgdGhpcy5fYXhpcyA9IGF4aXMgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5fZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX2RyYWdTY2FsZSA9IG5ldyBWZWMzKCk7XG4gICAgICAgIHRoaXMuX2RyYWdTdGFydE1vdXNlUG9zaXRpb24gPSBuZXcgVmVjMygpO1xuICAgICAgICB0aGlzLl9kcmFnU3RhcnRIYW5kbGVQb3NpdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgICAgIHRoaXMuX2RlbHRhTW91c2VQb3NpdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgICAgIHRoaXMuX2RlbHRhSGFuZGxlUG9zaXRpb24gPSBuZXcgVmVjMygpO1xuICAgICAgICB0aGlzLl9pc0RyYWdnaW5nID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fdG9nZ2xlTGlmZWN5Y2xlTGlzdGVuZXJzKCdvbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVkIHdoZW4gYSBuZXcgZHJhZyBvcGVyYXRpb24gc3RhcnRzLlxuICAgICAqXG4gICAgICogQGV2ZW50IEVsZW1lbnREcmFnSGVscGVyI2RyYWc6c3RhcnRcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEZpcmVkIHdoZW4gdGhlIGN1cnJlbnQgbmV3IGRyYWcgb3BlcmF0aW9uIGVuZHMuXG4gICAgICpcbiAgICAgKiBAZXZlbnQgRWxlbWVudERyYWdIZWxwZXIjZHJhZzplbmRcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEZpcmVkIHdoZW5ldmVyIHRoZSBwb3NpdGlvbiBvZiB0aGUgZHJhZ2dlZCBlbGVtZW50IGNoYW5nZXMuXG4gICAgICpcbiAgICAgKiBAZXZlbnQgRWxlbWVudERyYWdIZWxwZXIjZHJhZzptb3ZlXG4gICAgICogQHBhcmFtIHtWZWMzfSB2YWx1ZSAtIFRoZSBjdXJyZW50IHBvc2l0aW9uLlxuICAgICAqL1xuXG4gICAgX3RvZ2dsZUxpZmVjeWNsZUxpc3RlbmVycyhvbk9yT2ZmKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRbb25Pck9mZl0oJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duT3JUb3VjaFN0YXJ0LCB0aGlzKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudFtvbk9yT2ZmXSgndG91Y2hzdGFydCcsIHRoaXMuX29uTW91c2VEb3duT3JUb3VjaFN0YXJ0LCB0aGlzKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudFtvbk9yT2ZmXSgnc2VsZWN0c3RhcnQnLCB0aGlzLl9vbk1vdXNlRG93bk9yVG91Y2hTdGFydCwgdGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHsnb24nfCdvZmYnfSBvbk9yT2ZmIC0gRWl0aGVyICdvbicgb3IgJ29mZicuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdG9nZ2xlRHJhZ0xpc3RlbmVycyhvbk9yT2ZmKSB7XG4gICAgICAgIGNvbnN0IGlzT24gPSBvbk9yT2ZmID09PSAnb24nO1xuXG4gICAgICAgIC8vIFByZXZlbnQgbXVsdGlwbGUgbGlzdGVuZXJzXG4gICAgICAgIGlmICh0aGlzLl9oYXNEcmFnTGlzdGVuZXJzICYmIGlzT24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1vdXNlIGV2ZW50cywgaWYgbW91c2UgaXMgYXZhaWxhYmxlXG4gICAgICAgIGlmICh0aGlzLl9hcHAubW91c2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRbb25Pck9mZl0oJ21vdXNlbW92ZScsIHRoaXMuX29uTW92ZSwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50W29uT3JPZmZdKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwT3JUb3VjaEVuZCwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0b3VjaCBldmVudHMsIGlmIHRvdWNoIGlzIGF2YWlsYWJsZVxuICAgICAgICBpZiAocGxhdGZvcm0udG91Y2gpIHtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRbb25Pck9mZl0oJ3RvdWNobW92ZScsIHRoaXMuX29uTW92ZSwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50W29uT3JPZmZdKCd0b3VjaGVuZCcsIHRoaXMuX29uTW91c2VVcE9yVG91Y2hFbmQsIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudFtvbk9yT2ZmXSgndG91Y2hjYW5jZWwnLCB0aGlzLl9vbk1vdXNlVXBPclRvdWNoRW5kLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdlYnhyIGV2ZW50c1xuICAgICAgICB0aGlzLl9lbGVtZW50W29uT3JPZmZdKCdzZWxlY3Rtb3ZlJywgdGhpcy5fb25Nb3ZlLCB0aGlzKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudFtvbk9yT2ZmXSgnc2VsZWN0ZW5kJywgdGhpcy5fb25Nb3VzZVVwT3JUb3VjaEVuZCwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5faGFzRHJhZ0xpc3RlbmVycyA9IGlzT247XG4gICAgfVxuXG4gICAgX29uTW91c2VEb3duT3JUb3VjaFN0YXJ0KGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLl9lbGVtZW50ICYmICF0aGlzLl9pc0RyYWdnaW5nICYmIHRoaXMuZW5hYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5fZHJhZ0NhbWVyYSA9IGV2ZW50LmNhbWVyYTtcbiAgICAgICAgICAgIHRoaXMuX2NhbGN1bGF0ZURyYWdTY2FsZSgpO1xuXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50TW91c2VQb3NpdGlvbiA9IHRoaXMuX3NjcmVlblRvTG9jYWwoZXZlbnQpO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudE1vdXNlUG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90b2dnbGVEcmFnTGlzdGVuZXJzKCdvbicpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdTdGFydE1vdXNlUG9zaXRpb24uY29weShjdXJyZW50TW91c2VQb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhZ1N0YXJ0SGFuZGxlUG9zaXRpb24uY29weSh0aGlzLl9lbGVtZW50LmVudGl0eS5nZXRMb2NhbFBvc2l0aW9uKCkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKCdkcmFnOnN0YXJ0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25Nb3VzZVVwT3JUb3VjaEVuZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzRHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX3RvZ2dsZURyYWdMaXN0ZW5lcnMoJ29mZicpO1xuXG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2RyYWc6ZW5kJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBjYWxjdWxhdGVzIHRoZSBgVmVjM2AgaW50ZXJzZWN0aW9uIHBvaW50IG9mIHBsYW5lL3JheSBpbnRlcnNlY3Rpb24gYmFzZWQgb25cbiAgICAgKiB0aGUgbW91c2UvdG91Y2ggaW5wdXQgZXZlbnQuIElmIHRoZXJlIGlzIG5vIGludGVyc2VjdGlvbiwgaXQgcmV0dXJucyBgbnVsbGAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vLi4vaW5wdXQvZWxlbWVudC1pbnB1dCcpLkVsZW1lbnRUb3VjaEV2ZW50IHwgaW1wb3J0KCcuLi8uLi9pbnB1dC9lbGVtZW50LWlucHV0JykuRWxlbWVudE1vdXNlRXZlbnQgfCBpbXBvcnQoJy4uLy4uL2lucHV0L2VsZW1lbnQtaW5wdXQnKS5FbGVtZW50U2VsZWN0RXZlbnR9IGV2ZW50IC0gVGhlIGV2ZW50LlxuICAgICAqIEByZXR1cm5zIHtWZWMzfG51bGx9IFRoZSBgVmVjM2AgaW50ZXJzZWN0aW9uIHBvaW50IG9mIHBsYW5lL3JheSBpbnRlcnNlY3Rpb24sIGlmIHRoZXJlXG4gICAgICogaXMgYW4gaW50ZXJzZWN0aW9uLCBvdGhlcndpc2UgYG51bGxgXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2NyZWVuVG9Mb2NhbChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuaW5wdXRTb3VyY2UpIHtcbiAgICAgICAgICAgIF9yYXkuc2V0KGV2ZW50LmlucHV0U291cmNlLmdldE9yaWdpbigpLCBldmVudC5pbnB1dFNvdXJjZS5nZXREaXJlY3Rpb24oKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9kZXRlcm1pbmVJbnB1dFBvc2l0aW9uKGV2ZW50KTtcbiAgICAgICAgICAgIHRoaXMuX2Nob29zZVJheU9yaWdpbkFuZERpcmVjdGlvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgX25vcm1hbC5jb3B5KHRoaXMuX2VsZW1lbnQuZW50aXR5LmZvcndhcmQpLm11bFNjYWxhcigtMSk7XG4gICAgICAgIF9wbGFuZS5zZXRGcm9tUG9pbnROb3JtYWwodGhpcy5fZWxlbWVudC5lbnRpdHkuZ2V0UG9zaXRpb24oKSwgX25vcm1hbCk7XG5cbiAgICAgICAgaWYgKF9wbGFuZS5pbnRlcnNlY3RzUmF5KF9yYXksIF9wb2ludCkpIHtcbiAgICAgICAgICAgIF9lbnRpdHlSb3RhdGlvbi5jb3B5KHRoaXMuX2VsZW1lbnQuZW50aXR5LmdldFJvdGF0aW9uKCkpLmludmVydCgpLnRyYW5zZm9ybVZlY3RvcihfcG9pbnQsIF9wb2ludCk7XG4gICAgICAgICAgICBfcG9pbnQubXVsKHRoaXMuX2RyYWdTY2FsZSk7XG4gICAgICAgICAgICByZXR1cm4gX3BvaW50O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgX2RldGVybWluZUlucHV0UG9zaXRpb24oZXZlbnQpIHtcbiAgICAgICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMuX2FwcC5ncmFwaGljc0RldmljZS5tYXhQaXhlbFJhdGlvO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZXZlbnQueCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV2ZW50LnkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBfaW5wdXRTY3JlZW5Qb3NpdGlvbi54ID0gZXZlbnQueCAqIGRldmljZVBpeGVsUmF0aW87XG4gICAgICAgICAgICBfaW5wdXRTY3JlZW5Qb3NpdGlvbi55ID0gZXZlbnQueSAqIGRldmljZVBpeGVsUmF0aW87XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2hhbmdlZFRvdWNoZXMpIHtcbiAgICAgICAgICAgIF9pbnB1dFNjcmVlblBvc2l0aW9uLnggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS54ICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgICAgIF9pbnB1dFNjcmVlblBvc2l0aW9uLnkgPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS55ICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IGRldGVybWluZSBwb3NpdGlvbiBmcm9tIGlucHV0IGV2ZW50Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY2hvb3NlUmF5T3JpZ2luQW5kRGlyZWN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fZWxlbWVudC5zY3JlZW4gJiYgdGhpcy5fZWxlbWVudC5zY3JlZW4uc2NyZWVuLnNjcmVlblNwYWNlKSB7XG4gICAgICAgICAgICBfcmF5Lm9yaWdpbi5zZXQoX2lucHV0U2NyZWVuUG9zaXRpb24ueCwgLV9pbnB1dFNjcmVlblBvc2l0aW9uLnksIDApO1xuICAgICAgICAgICAgX3JheS5kaXJlY3Rpb24uY29weShWZWMzLkZPUldBUkQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2lucHV0V29ybGRQb3NpdGlvbi5jb3B5KHRoaXMuX2RyYWdDYW1lcmEuc2NyZWVuVG9Xb3JsZChfaW5wdXRTY3JlZW5Qb3NpdGlvbi54LCBfaW5wdXRTY3JlZW5Qb3NpdGlvbi55LCAxKSk7XG4gICAgICAgICAgICBfcmF5Lm9yaWdpbi5jb3B5KHRoaXMuX2RyYWdDYW1lcmEuZW50aXR5LmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgX3JheS5kaXJlY3Rpb24uY29weShfaW5wdXRXb3JsZFBvc2l0aW9uKS5zdWIoX3JheS5vcmlnaW4pLm5vcm1hbGl6ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NhbGN1bGF0ZURyYWdTY2FsZSgpIHtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLl9lbGVtZW50LmVudGl0eS5wYXJlbnQ7XG4gICAgICAgIGNvbnN0IHNjcmVlbiA9IHRoaXMuX2VsZW1lbnQuc2NyZWVuICYmIHRoaXMuX2VsZW1lbnQuc2NyZWVuLnNjcmVlbjtcbiAgICAgICAgY29uc3QgaXNXaXRoaW4yRFNjcmVlbiA9IHNjcmVlbiAmJiBzY3JlZW4uc2NyZWVuU3BhY2U7XG4gICAgICAgIGNvbnN0IHNjcmVlblNjYWxlID0gaXNXaXRoaW4yRFNjcmVlbiA/IHNjcmVlbi5zY2FsZSA6IDE7XG4gICAgICAgIGNvbnN0IGRyYWdTY2FsZSA9IHRoaXMuX2RyYWdTY2FsZTtcblxuICAgICAgICBkcmFnU2NhbGUuc2V0KHNjcmVlblNjYWxlLCBzY3JlZW5TY2FsZSwgc2NyZWVuU2NhbGUpO1xuXG4gICAgICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICAgICAgICBkcmFnU2NhbGUubXVsKGN1cnJlbnQuZ2V0TG9jYWxTY2FsZSgpKTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudDtcblxuICAgICAgICAgICAgaWYgKGlzV2l0aGluMkRTY3JlZW4gJiYgY3VycmVudC5zY3JlZW4pIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRyYWdTY2FsZS54ID0gMSAvIGRyYWdTY2FsZS54O1xuICAgICAgICBkcmFnU2NhbGUueSA9IDEgLyBkcmFnU2NhbGUueTtcbiAgICAgICAgZHJhZ1NjYWxlLnogPSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGxpbmtlZCB0byBgX2VsZW1lbnRgIGV2ZW50czogYG1vdXNlbW92ZWAgYW5kIGB0b3VjaG1vdmVgXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vLi4vaW5wdXQvZWxlbWVudC1pbnB1dCcpLkVsZW1lbnRUb3VjaEV2ZW50fSBldmVudCAtIFRoZSBldmVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbk1vdmUoZXZlbnQpIHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgX2VsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICBfZGVsdGFNb3VzZVBvc2l0aW9uOiBkZWx0YU1vdXNlUG9zaXRpb24sXG4gICAgICAgICAgICBfZGVsdGFIYW5kbGVQb3NpdGlvbjogZGVsdGFIYW5kbGVQb3NpdGlvbixcbiAgICAgICAgICAgIF9heGlzOiBheGlzXG4gICAgICAgIH0gPSB0aGlzO1xuICAgICAgICBpZiAoZWxlbWVudCAmJiB0aGlzLl9pc0RyYWdnaW5nICYmIHRoaXMuZW5hYmxlZCAmJiBlbGVtZW50LmVuYWJsZWQgJiYgZWxlbWVudC5lbnRpdHkuZW5hYmxlZCkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudE1vdXNlUG9zaXRpb24gPSB0aGlzLl9zY3JlZW5Ub0xvY2FsKGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50TW91c2VQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGRlbHRhTW91c2VQb3NpdGlvbi5zdWIyKGN1cnJlbnRNb3VzZVBvc2l0aW9uLCB0aGlzLl9kcmFnU3RhcnRNb3VzZVBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICBkZWx0YUhhbmRsZVBvc2l0aW9uLmFkZDIodGhpcy5fZHJhZ1N0YXJ0SGFuZGxlUG9zaXRpb24sIGRlbHRhTW91c2VQb3NpdGlvbik7XG5cbiAgICAgICAgICAgICAgICBpZiAoYXhpcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSBlbGVtZW50LmVudGl0eS5nZXRMb2NhbFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnN0cmFpbmVkQXhpcyA9IE9QUE9TSVRFX0FYSVNbYXhpc107XG4gICAgICAgICAgICAgICAgICAgIGRlbHRhSGFuZGxlUG9zaXRpb25bY29uc3RyYWluZWRBeGlzXSA9IGN1cnJlbnRQb3NpdGlvbltjb25zdHJhaW5lZEF4aXNdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVsZW1lbnQuZW50aXR5LnNldExvY2FsUG9zaXRpb24oZGVsdGFIYW5kbGVQb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKCdkcmFnOm1vdmUnLCBkZWx0YUhhbmRsZVBvc2l0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZUxpZmVjeWNsZUxpc3RlbmVycygnb2ZmJyk7XG4gICAgICAgIHRoaXMuX3RvZ2dsZURyYWdMaXN0ZW5lcnMoJ29mZicpO1xuICAgIH1cblxuICAgIHNldCBlbmFibGVkKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZWQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgZW5hYmxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWQ7XG4gICAgfVxuXG4gICAgZ2V0IGlzRHJhZ2dpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0RyYWdnaW5nO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgRWxlbWVudERyYWdIZWxwZXIgfTtcbiJdLCJuYW1lcyI6WyJfaW5wdXRTY3JlZW5Qb3NpdGlvbiIsIlZlYzIiLCJfaW5wdXRXb3JsZFBvc2l0aW9uIiwiVmVjMyIsIl9yYXkiLCJSYXkiLCJfcGxhbmUiLCJQbGFuZSIsIl9ub3JtYWwiLCJfcG9pbnQiLCJfZW50aXR5Um90YXRpb24iLCJRdWF0IiwiT1BQT1NJVEVfQVhJUyIsIngiLCJ5IiwiRWxlbWVudERyYWdIZWxwZXIiLCJFdmVudEhhbmRsZXIiLCJjb25zdHJ1Y3RvciIsImVsZW1lbnQiLCJheGlzIiwiRWxlbWVudENvbXBvbmVudCIsIkVycm9yIiwiX2VsZW1lbnQiLCJfYXBwIiwic3lzdGVtIiwiYXBwIiwiX2F4aXMiLCJfZW5hYmxlZCIsIl9kcmFnU2NhbGUiLCJfZHJhZ1N0YXJ0TW91c2VQb3NpdGlvbiIsIl9kcmFnU3RhcnRIYW5kbGVQb3NpdGlvbiIsIl9kZWx0YU1vdXNlUG9zaXRpb24iLCJfZGVsdGFIYW5kbGVQb3NpdGlvbiIsIl9pc0RyYWdnaW5nIiwiX3RvZ2dsZUxpZmVjeWNsZUxpc3RlbmVycyIsIm9uT3JPZmYiLCJfb25Nb3VzZURvd25PclRvdWNoU3RhcnQiLCJfdG9nZ2xlRHJhZ0xpc3RlbmVycyIsImlzT24iLCJfaGFzRHJhZ0xpc3RlbmVycyIsIm1vdXNlIiwiX29uTW92ZSIsIl9vbk1vdXNlVXBPclRvdWNoRW5kIiwicGxhdGZvcm0iLCJ0b3VjaCIsImV2ZW50IiwiZW5hYmxlZCIsIl9kcmFnQ2FtZXJhIiwiY2FtZXJhIiwiX2NhbGN1bGF0ZURyYWdTY2FsZSIsImN1cnJlbnRNb3VzZVBvc2l0aW9uIiwiX3NjcmVlblRvTG9jYWwiLCJjb3B5IiwiZW50aXR5IiwiZ2V0TG9jYWxQb3NpdGlvbiIsImZpcmUiLCJpbnB1dFNvdXJjZSIsInNldCIsImdldE9yaWdpbiIsImdldERpcmVjdGlvbiIsIl9kZXRlcm1pbmVJbnB1dFBvc2l0aW9uIiwiX2Nob29zZVJheU9yaWdpbkFuZERpcmVjdGlvbiIsImZvcndhcmQiLCJtdWxTY2FsYXIiLCJzZXRGcm9tUG9pbnROb3JtYWwiLCJnZXRQb3NpdGlvbiIsImludGVyc2VjdHNSYXkiLCJnZXRSb3RhdGlvbiIsImludmVydCIsInRyYW5zZm9ybVZlY3RvciIsIm11bCIsImRldmljZVBpeGVsUmF0aW8iLCJncmFwaGljc0RldmljZSIsIm1heFBpeGVsUmF0aW8iLCJjaGFuZ2VkVG91Y2hlcyIsImNvbnNvbGUiLCJ3YXJuIiwic2NyZWVuIiwic2NyZWVuU3BhY2UiLCJvcmlnaW4iLCJkaXJlY3Rpb24iLCJGT1JXQVJEIiwic2NyZWVuVG9Xb3JsZCIsInN1YiIsIm5vcm1hbGl6ZSIsImN1cnJlbnQiLCJwYXJlbnQiLCJpc1dpdGhpbjJEU2NyZWVuIiwic2NyZWVuU2NhbGUiLCJzY2FsZSIsImRyYWdTY2FsZSIsImdldExvY2FsU2NhbGUiLCJ6IiwiZGVsdGFNb3VzZVBvc2l0aW9uIiwiZGVsdGFIYW5kbGVQb3NpdGlvbiIsInN1YjIiLCJhZGQyIiwiY3VycmVudFBvc2l0aW9uIiwiY29uc3RyYWluZWRBeGlzIiwic2V0TG9jYWxQb3NpdGlvbiIsImRlc3Ryb3kiLCJ2YWx1ZSIsImlzRHJhZ2dpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBV0EsTUFBTUEsb0JBQW9CLEdBQUcsSUFBSUMsSUFBSSxFQUFFLENBQUE7QUFDdkMsTUFBTUMsbUJBQW1CLEdBQUcsSUFBSUMsSUFBSSxFQUFFLENBQUE7QUFDdEMsTUFBTUMsSUFBSSxHQUFHLElBQUlDLEdBQUcsRUFBRSxDQUFBO0FBQ3RCLE1BQU1DLE1BQU0sR0FBRyxJQUFJQyxLQUFLLEVBQUUsQ0FBQTtBQUMxQixNQUFNQyxPQUFPLEdBQUcsSUFBSUwsSUFBSSxFQUFFLENBQUE7QUFDMUIsTUFBTU0sTUFBTSxHQUFHLElBQUlOLElBQUksRUFBRSxDQUFBO0FBQ3pCLE1BQU1PLGVBQWUsR0FBRyxJQUFJQyxJQUFJLEVBQUUsQ0FBQTtBQUVsQyxNQUFNQyxhQUFhLEdBQUc7QUFDbEJDLEVBQUFBLENBQUMsRUFBRSxHQUFHO0FBQ05DLEVBQUFBLENBQUMsRUFBRSxHQUFBO0FBQ1AsQ0FBQyxDQUFBOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxpQkFBaUIsU0FBU0MsWUFBWSxDQUFDO0FBQ3pDO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxXQUFXQSxDQUFDQyxPQUFPLEVBQUVDLElBQUksRUFBRTtBQUN2QixJQUFBLEtBQUssRUFBRSxDQUFBO0lBRVAsSUFBSSxDQUFDRCxPQUFPLElBQUksRUFBRUEs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
