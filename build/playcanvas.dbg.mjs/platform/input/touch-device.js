/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { EventHandler } from '../../core/event-handler.js';
import { TouchEvent } from './touch-event.js';

class TouchDevice extends EventHandler {
  constructor(element) {
    super();
    this._element = null;
    this._startHandler = this._handleTouchStart.bind(this);
    this._endHandler = this._handleTouchEnd.bind(this);
    this._moveHandler = this._handleTouchMove.bind(this);
    this._cancelHandler = this._handleTouchCancel.bind(this);
    this.attach(element);
  }

  attach(element) {
    if (this._element) {
      this.detach();
    }
    this._element = element;
    this._element.addEventListener('touchstart', this._startHandler, false);
    this._element.addEventListener('touchend', this._endHandler, false);
    this._element.addEventListener('touchmove', this._moveHandler, false);
    this._element.addEventListener('touchcancel', this._cancelHandler, false);
  }

  detach() {
    if (this._element) {
      this._element.removeEventListener('touchstart', this._startHandler, false);
      this._element.removeEventListener('touchend', this._endHandler, false);
      this._element.removeEventListener('touchmove', this._moveHandler, false);
      this._element.removeEventListener('touchcancel', this._cancelHandler, false);
    }
    this._element = null;
  }
  _handleTouchStart(e) {
    this.fire('touchstart', new TouchEvent(this, e));
  }
  _handleTouchEnd(e) {
    this.fire('touchend', new TouchEvent(this, e));
  }
  _handleTouchMove(e) {
    e.preventDefault();
    this.fire('touchmove', new TouchEvent(this, e));
  }
  _handleTouchCancel(e) {
    this.fire('touchcancel', new TouchEvent(this, e));
  }
}

export { TouchDevice };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG91Y2gtZGV2aWNlLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcGxhdGZvcm0vaW5wdXQvdG91Y2gtZGV2aWNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50SGFuZGxlciB9IGZyb20gJy4uLy4uL2NvcmUvZXZlbnQtaGFuZGxlci5qcyc7XG5cbmltcG9ydCB7IFRvdWNoRXZlbnQgfSBmcm9tICcuL3RvdWNoLWV2ZW50LmpzJztcblxuLyoqXG4gKiBBdHRhY2ggYSBUb3VjaERldmljZSB0byBhbiBlbGVtZW50IGFuZCBpdCB3aWxsIHJlY2VpdmUgYW5kIGZpcmUgZXZlbnRzIHdoZW4gdGhlIGVsZW1lbnQgaXNcbiAqIHRvdWNoZWQuIFNlZSBhbHNvIHtAbGluayBUb3VjaH0gYW5kIHtAbGluayBUb3VjaEV2ZW50fS5cbiAqXG4gKiBAYXVnbWVudHMgRXZlbnRIYW5kbGVyXG4gKi9cbmNsYXNzIFRvdWNoRGV2aWNlIGV4dGVuZHMgRXZlbnRIYW5kbGVyIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgdG91Y2ggZGV2aWNlIGFuZCBhdHRhY2ggaXQgdG8gYW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHRvIGF0dGFjaCBsaXN0ZW4gZm9yIGV2ZW50cyBvbi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5fc3RhcnRIYW5kbGVyID0gdGhpcy5faGFuZGxlVG91Y2hTdGFydC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9lbmRIYW5kbGVyID0gdGhpcy5faGFuZGxlVG91Y2hFbmQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fbW92ZUhhbmRsZXIgPSB0aGlzLl9oYW5kbGVUb3VjaE1vdmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fY2FuY2VsSGFuZGxlciA9IHRoaXMuX2hhbmRsZVRvdWNoQ2FuY2VsLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5hdHRhY2goZWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGEgZGV2aWNlIHRvIGFuIGVsZW1lbnQgaW4gdGhlIERPTS4gSWYgdGhlIGRldmljZSBpcyBhbHJlYWR5IGF0dGFjaGVkIHRvIGFuIGVsZW1lbnRcbiAgICAgKiB0aGlzIG1ldGhvZCB3aWxsIGRldGFjaCBpdCBmaXJzdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHRvIGF0dGFjaCB0by5cbiAgICAgKi9cbiAgICBhdHRhY2goZWxlbWVudCkge1xuICAgICAgICBpZiAodGhpcy5fZWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5kZXRhY2goKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX3N0YXJ0SGFuZGxlciwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fZW5kSGFuZGxlciwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX21vdmVIYW5kbGVyLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9jYW5jZWxIYW5kbGVyLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0YWNoIGEgZGV2aWNlIGZyb20gdGhlIGVsZW1lbnQgaXQgaXMgYXR0YWNoZWQgdG8uXG4gICAgICovXG4gICAgZGV0YWNoKCkge1xuICAgICAgICBpZiAodGhpcy5fZWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fc3RhcnRIYW5kbGVyLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fZW5kSGFuZGxlciwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9tb3ZlSGFuZGxlciwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMuX2NhbmNlbEhhbmRsZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICBfaGFuZGxlVG91Y2hTdGFydChlKSB7XG4gICAgICAgIHRoaXMuZmlyZSgndG91Y2hzdGFydCcsIG5ldyBUb3VjaEV2ZW50KHRoaXMsIGUpKTtcbiAgICB9XG5cbiAgICBfaGFuZGxlVG91Y2hFbmQoZSkge1xuICAgICAgICB0aGlzLmZpcmUoJ3RvdWNoZW5kJywgbmV3IFRvdWNoRXZlbnQodGhpcywgZSkpO1xuICAgIH1cblxuICAgIF9oYW5kbGVUb3VjaE1vdmUoZSkge1xuICAgICAgICAvLyBjYWxsIHByZXZlbnREZWZhdWx0IHRvIGF2b2lkIGlzc3VlcyBpbiBDaHJvbWUgQW5kcm9pZDpcbiAgICAgICAgLy8gaHR0cDovL3dpbHNvbnBhZ2UuY28udWsvdG91Y2gtZXZlbnRzLWluLWNocm9tZS1hbmRyb2lkL1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZmlyZSgndG91Y2htb3ZlJywgbmV3IFRvdWNoRXZlbnQodGhpcywgZSkpO1xuICAgIH1cblxuICAgIF9oYW5kbGVUb3VjaENhbmNlbChlKSB7XG4gICAgICAgIHRoaXMuZmlyZSgndG91Y2hjYW5jZWwnLCBuZXcgVG91Y2hFdmVudCh0aGlzLCBlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBUb3VjaERldmljZSB9O1xuIl0sIm5hbWVzIjpbIlRvdWNoRGV2aWNlIiwiRXZlbnRIYW5kbGVyIiwiY29uc3RydWN0b3IiLCJlbGVtZW50IiwiX2VsZW1lbnQiLCJfc3RhcnRIYW5kbGVyIiwiX2hhbmRsZVRvdWNoU3RhcnQiLCJiaW5kIiwiX2VuZEhhbmRsZXIiLCJfaGFuZGxlVG91Y2hFbmQiLCJfbW92ZUhhbmRsZXIiLCJfaGFuZGxlVG91Y2hNb3ZlIiwiX2NhbmNlbEhhbmRsZXIiLCJfaGFuZGxlVG91Y2hDYW5jZWwiLCJhdHRhY2giLCJkZXRhY2giLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImUiLCJmaXJlIiwiVG91Y2hFdmVudCIsInByZXZlbnREZWZhdWx0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQVVBLE1BQU1BLFdBQVcsU0FBU0MsWUFBWSxDQUFDO0VBTW5DQyxXQUFXLENBQUNDLE9BQU8sRUFBRTtBQUNqQixJQUFBLEtBQUssRUFBRSxDQUFBO0lBRVAsSUFBSSxDQUFDQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0lBRXBCLElBQUksQ0FBQ0MsYUFBYSxHQUFHLElBQUksQ0FBQ0MsaUJBQWlCLENBQUNDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN0RCxJQUFJLENBQUNDLFdBQVcsR0FBRyxJQUFJLENBQUNDLGVBQWUsQ0FBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2xELElBQUksQ0FBQ0csWUFBWSxHQUFHLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNwRCxJQUFJLENBQUNLLGNBQWMsR0FBRyxJQUFJLENBQUNDLGtCQUFrQixDQUFDTixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFFeEQsSUFBQSxJQUFJLENBQUNPLE1BQU0s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
