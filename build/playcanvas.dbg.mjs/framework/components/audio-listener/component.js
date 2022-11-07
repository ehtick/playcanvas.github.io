/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Component } from '../component.js';

class AudioListenerComponent extends Component {
  constructor(system, entity) {
    super(system, entity);
  }
  setCurrentListener() {
    if (this.enabled && this.entity.audiolistener && this.entity.enabled) {
      this.system.current = this.entity;
      const position = this.system.current.getPosition();
      this.system.manager.listener.setPosition(position);
    }
  }
  onEnable() {
    this.setCurrentListener();
  }
  onDisable() {
    if (this.system.current === this.entity) {
      this.system.current = null;
    }
  }
}

export { AudioListenerComponent };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvYXVkaW8tbGlzdGVuZXIvY29tcG9uZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC5qcyc7XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuLi8uLi9lbnRpdHkuanMnKS5FbnRpdHl9IEVudGl0eSAqL1xuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4vc3lzdGVtLmpzJykuQXVkaW9MaXN0ZW5lckNvbXBvbmVudFN5c3RlbX0gQXVkaW9MaXN0ZW5lckNvbXBvbmVudFN5c3RlbSAqL1xuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIGF1ZGlvIGxpc3RlbmVyIGluIHRoZSAzRCB3b3JsZCwgc28gdGhhdCAzRCBwb3NpdGlvbmVkIGF1ZGlvIHNvdXJjZXMgYXJlIGhlYXJkXG4gKiBjb3JyZWN0bHkuXG4gKlxuICogQGF1Z21lbnRzIENvbXBvbmVudFxuICovXG5jbGFzcyBBdWRpb0xpc3RlbmVyQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgQXVkaW9MaXN0ZW5lckNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QXVkaW9MaXN0ZW5lckNvbXBvbmVudFN5c3RlbX0gc3lzdGVtIC0gVGhlIENvbXBvbmVudFN5c3RlbSB0aGF0IGNyZWF0ZWQgdGhpcyBDb21wb25lbnQuXG4gICAgICogQHBhcmFtIHtFbnRpdHl9IGVudGl0eSAtIFRoZSBFbnRpdHkgdGhhdCB0aGlzIENvbXBvbmVudCBpcyBhdHRhY2hlZCB0by5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzeXN0ZW0sIGVudGl0eSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVzZWxlc3MtY29uc3RydWN0b3JcbiAgICAgICAgc3VwZXIoc3lzdGVtLCBlbnRpdHkpO1xuICAgIH1cblxuICAgIHNldEN1cnJlbnRMaXN0ZW5lcigpIHtcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlZCAmJiB0aGlzLmVudGl0eS5hdWRpb2xpc3RlbmVyICYmIHRoaXMuZW50aXR5LmVuYWJsZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc3lzdGVtLmN1cnJlbnQgPSB0aGlzLmVudGl0eTtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5zeXN0ZW0uY3VycmVudC5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5zeXN0ZW0ubWFuYWdlci5saXN0ZW5lci5zZXRQb3NpdGlvbihwb3NpdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbkVuYWJsZSgpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50TGlzdGVuZXIoKTtcbiAgICB9XG5cbiAgICBvbkRpc2FibGUoKSB7XG4gICAgICAgIGlmICh0aGlzLnN5c3RlbS5jdXJyZW50ID09PSB0aGlzLmVudGl0eSkge1xuICAgICAgICAgICAgdGhpcy5zeXN0ZW0uY3VycmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IEF1ZGlvTGlzdGVuZXJDb21wb25lbnQgfTtcbiJdLCJuYW1lcyI6WyJBdWRpb0xpc3RlbmVyQ29tcG9uZW50IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJzeXN0ZW0iLCJlbnRpdHkiLCJzZXRDdXJyZW50TGlzdGVuZXIiLCJlbmFibGVkIiwiYXVkaW9saXN0ZW5lciIsImN1cnJlbnQiLCJwb3NpdGlvbiIsImdldFBvc2l0aW9uIiwibWFuYWdlciIsImxpc3RlbmVyIiwic2V0UG9zaXRpb24iLCJvbkVuYWJsZSIsIm9uRGlzYWJsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQVdBLE1BQU1BLHNCQUFzQixTQUFTQyxTQUFTLENBQUM7QUFPM0NDLEVBQUFBLFdBQVcsQ0FBQ0MsTUFBTSxFQUFFQyxNQUFNLEVBQUU7QUFDeEIsSUFBQSxLQUFLLENBQUNELE1BQU0sRUFBRUMsTUFBTSxDQUFDLENBQUE7QUFDekIsR0FBQTtBQUVBQyxFQUFBQSxrQkFBa0IsR0FBRztBQUNqQixJQUFBLElBQUksSUFBSSxDQUFDQyxPQUFPLElBQUksSUFBSSxDQUFDRixNQUFNLENBQUNHLGFBQWEsSUFBSSxJQUFJLENBQUNILE1BQU0sQ0FBQ0UsT0FBTyxFQUFFO0FBQ2xFLE1BQUEsSUFBSSxDQUFDSCxNQUFNLENBQUNLLE9BQU8sR0FBRyxJQUFJLENBQUNKLE1BQU0sQ0FBQTtNQUNqQyxNQUFNSyxRQUFRLEdBQUcsSUFBSSxDQUFDTixNQUFNLENBQUNLLE9BQU8sQ0FBQ0UsV0FBVyxFQUFFLENBQUE7TUFDbEQsSUFBSSxDQUFDUCxNQUFNLENBQUNRLE9BQU8sQ0FBQ0MsUUFBUSxDQUFDQyxXQUFXLENBQUNKLFFBQVEsQ0FBQyxDQUFBO0FBQ3RELEtBQUE7QUFDSixHQUFBO0FBRUFLLEVBQUFBLFFBQVEsR0FBRztJQUNQLElBQUksQ0FBQ1Qsa0JBQWtCLEVBQUUsQ0FBQTtBQUM3QixHQUFBO0FBRUFVLEVBQUFBLFNBQVMsR0FBRztJQUNSLElBQUksSUFBSSxDQUFDWixNQUFNLENBQUNLLE9BQU8sS0FBSyxJQUFJLENBQUNKLE1BQU0sRUFBRTtBQUNyQyxNQUFBLElBQUksQ0FBQ0QsTUFBTSxDQUFDSyxPQUFPLEdBQUcsSUFBSSxDQUFBO0FBQzlCLEtBQUE7QUFDSixHQUFBO0FBQ0o7Ozs7In0=
