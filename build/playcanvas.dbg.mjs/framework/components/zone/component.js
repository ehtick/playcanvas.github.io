/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Vec3 } from '../../../core/math/vec3.js';
import { Component } from '../component.js';

class ZoneComponent extends Component {
  constructor(system, entity) {
    super(system, entity);
    this._oldState = true;
    this._size = new Vec3();
    this.on('set_enabled', this._onSetEnabled, this);
  }

  set size(data) {
    if (data instanceof Vec3) {
      this._size.copy(data);
    } else if (data instanceof Array && data.length >= 3) {
      this.size.set(data[0], data[1], data[2]);
    }
  }
  get size() {
    return this._size;
  }
  onEnable() {
    this._checkState();
  }
  onDisable() {
    this._checkState();
  }
  _onSetEnabled(prop, old, value) {
    this._checkState();
  }
  _checkState() {
    const state = this.enabled && this.entity.enabled;
    if (state === this._oldState) return;
    this._oldState = state;
    this.fire('enable');
    this.fire('state', this.enabled);
  }
  _onBeforeRemove() {
    this.fire('remove');
  }
}

export { ZoneComponent };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvem9uZS9jb21wb25lbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uLy4uLy4uL2NvcmUvbWF0aC92ZWMzLmpzJztcblxuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcblxuLyoqXG4gKiBUaGUgWm9uZUNvbXBvbmVudCBhbGxvd3MgeW91IHRvIGRlZmluZSBhbiBhcmVhIGluIHdvcmxkIHNwYWNlIG9mIGNlcnRhaW4gc2l6ZS4gVGhpcyBjYW4gYmUgdXNlZFxuICogaW4gdmFyaW91cyB3YXlzLCBzdWNoIGFzIGFmZmVjdGluZyBhdWRpbyByZXZlcmIgd2hlbiB7QGxpbmsgQXVkaW9MaXN0ZW5lckNvbXBvbmVudH0gaXMgd2l0aGluXG4gKiB6b25lLiBPciBjcmVhdGUgY3VsbGluZyBzeXN0ZW0gd2l0aCBwb3J0YWxzIGJldHdlZW4gem9uZXMgdG8gaGlkZSB3aG9sZSBpbmRvb3Igc2VjdGlvbnMgZm9yXG4gKiBwZXJmb3JtYW5jZSByZWFzb25zLiBBbmQgbWFueSBvdGhlciBwb3NzaWJsZSBvcHRpb25zLiBab25lcyBhcmUgYnVpbGRpbmcgYmxvY2tzIGFuZCBtZWFudCB0byBiZVxuICogdXNlZCBpbiBtYW55IGRpZmZlcmVudCB3YXlzLlxuICpcbiAqIEBhdWdtZW50cyBDb21wb25lbnRcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgWm9uZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IFpvbmVDb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi9zeXN0ZW0uanMnKS5ab25lQ29tcG9uZW50U3lzdGVtfSBzeXN0ZW0gLSBUaGUgQ29tcG9uZW50U3lzdGVtIHRoYXRcbiAgICAgKiBjcmVhdGVkIHRoaXMgQ29tcG9uZW50LlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi8uLi9lbnRpdHkuanMnKS5FbnRpdHl9IGVudGl0eSAtIFRoZSBFbnRpdHkgdGhhdCB0aGlzIENvbXBvbmVudCBpc1xuICAgICAqIGF0dGFjaGVkIHRvLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN5c3RlbSwgZW50aXR5KSB7XG4gICAgICAgIHN1cGVyKHN5c3RlbSwgZW50aXR5KTtcblxuICAgICAgICB0aGlzLl9vbGRTdGF0ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX3NpemUgPSBuZXcgVmVjMygpO1xuICAgICAgICB0aGlzLm9uKCdzZXRfZW5hYmxlZCcsIHRoaXMuX29uU2V0RW5hYmxlZCwgdGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZWQgd2hlbiBDb21wb25lbnQgYmVjb21lcyBlbmFibGVkLiBOb3RlOiB0aGlzIGV2ZW50IGRvZXMgbm90IHRha2UgaW4gYWNjb3VudCBlbnRpdHkgb3JcbiAgICAgKiBhbnkgb2YgaXRzIHBhcmVudCBlbmFibGVkIHN0YXRlLlxuICAgICAqXG4gICAgICogQGV2ZW50IFpvbmVDb21wb25lbnQjZW5hYmxlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBlbnRpdHkuem9uZS5vbignZW5hYmxlJywgZnVuY3Rpb24gKCkge1xuICAgICAqICAgICAvLyBjb21wb25lbnQgaXMgZW5hYmxlZFxuICAgICAqIH0pO1xuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEZpcmVkIHdoZW4gQ29tcG9uZW50IGJlY29tZXMgZGlzYWJsZWQuIE5vdGU6IHRoaXMgZXZlbnQgZG9lcyBub3QgdGFrZSBpbiBhY2NvdW50IGVudGl0eSBvclxuICAgICAqIGFueSBvZiBpdHMgcGFyZW50IGVuYWJsZWQgc3RhdGUuXG4gICAgICpcbiAgICAgKiBAZXZlbnQgWm9uZUNvbXBvbmVudCNkaXNhYmxlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBlbnRpdHkuem9uZS5vbignZGlzYWJsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgKiAgICAgLy8gY29tcG9uZW50IGlzIGRpc2FibGVkXG4gICAgICogfSk7XG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogRmlyZWQgd2hlbiBDb21wb25lbnQgY2hhbmdlcyBzdGF0ZSB0byBlbmFibGVkIG9yIGRpc2FibGVkLiBOb3RlOiB0aGlzIGV2ZW50IGRvZXMgbm90IHRha2UgaW5cbiAgICAgKiBhY2NvdW50IGVudGl0eSBvciBhbnkgb2YgaXRzIHBhcmVudCBlbmFibGVkIHN0YXRlLlxuICAgICAqXG4gICAgICogQGV2ZW50IFpvbmVDb21wb25lbnQjc3RhdGVcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZWQgLSBUcnVlIGlmIG5vdyBlbmFibGVkLCBGYWxzZSBpZiBkaXNhYmxlZC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGVudGl0eS56b25lLm9uKCdzdGF0ZScsIGZ1bmN0aW9uIChlbmFibGVkKSB7XG4gICAgICogICAgIC8vIGNvbXBvbmVudCBjaGFuZ2VkIHN0YXRlXG4gICAgICogfSk7XG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogRmlyZWQgd2hlbiBhIHpvbmUgaXMgcmVtb3ZlZCBmcm9tIGFuIGVudGl0eS5cbiAgICAgKlxuICAgICAqIEBldmVudCBab25lQ29tcG9uZW50I3JlbW92ZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogZW50aXR5LnpvbmUub24oJ3JlbW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgKiAgICAgLy8gem9uZSBoYXMgYmVlbiByZW1vdmVkIGZyb20gYW4gZW50aXR5XG4gICAgICogfSk7XG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNpemUgb2YgdGhlIGF4aXMtYWxpZ25lZCBib3ggb2YgdGhpcyBab25lQ29tcG9uZW50LlxuICAgICAqXG4gICAgICogQHR5cGUge1ZlYzN9XG4gICAgICovXG4gICAgc2V0IHNpemUoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIFZlYzMpIHtcbiAgICAgICAgICAgIHRoaXMuX3NpemUuY29weShkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhIGluc3RhbmNlb2YgQXJyYXkgJiYgZGF0YS5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgdGhpcy5zaXplLnNldChkYXRhWzBdLCBkYXRhWzFdLCBkYXRhWzJdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBzaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2l6ZTtcbiAgICB9XG5cbiAgICBvbkVuYWJsZSgpIHtcbiAgICAgICAgdGhpcy5fY2hlY2tTdGF0ZSgpO1xuICAgIH1cblxuICAgIG9uRGlzYWJsZSgpIHtcbiAgICAgICAgdGhpcy5fY2hlY2tTdGF0ZSgpO1xuICAgIH1cblxuICAgIF9vblNldEVuYWJsZWQocHJvcCwgb2xkLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLl9jaGVja1N0YXRlKCk7XG4gICAgfVxuXG4gICAgX2NoZWNrU3RhdGUoKSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5lbmFibGVkICYmIHRoaXMuZW50aXR5LmVuYWJsZWQ7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gdGhpcy5fb2xkU3RhdGUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fb2xkU3RhdGUgPSBzdGF0ZTtcblxuICAgICAgICB0aGlzLmZpcmUoJ2VuYWJsZScpO1xuICAgICAgICB0aGlzLmZpcmUoJ3N0YXRlJywgdGhpcy5lbmFibGVkKTtcbiAgICB9XG5cbiAgICBfb25CZWZvcmVSZW1vdmUoKSB7XG4gICAgICAgIHRoaXMuZmlyZSgncmVtb3ZlJyk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBab25lQ29tcG9uZW50IH07XG4iXSwibmFtZXMiOlsiWm9uZUNvbXBvbmVudCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwic3lzdGVtIiwiZW50aXR5IiwiX29sZFN0YXRlIiwiX3NpemUiLCJWZWMzIiwib24iLCJfb25TZXRFbmFibGVkIiwic2l6ZSIsImRhdGEiLCJjb3B5IiwiQXJyYXkiLCJsZW5ndGgiLCJzZXQiLCJvbkVuYWJsZSIsIl9jaGVja1N0YXRlIiwib25EaXNhYmxlIiwicHJvcCIsIm9sZCIsInZhbHVlIiwic3RhdGUiLCJlbmFibGVkIiwiZmlyZSIsIl9vbkJlZm9yZVJlbW92ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFjQSxNQUFNQSxhQUFhLFNBQVNDLFNBQVMsQ0FBQztBQVNsQ0MsRUFBQUEsV0FBVyxDQUFDQyxNQUFNLEVBQUVDLE1BQU0sRUFBRTtBQUN4QixJQUFBLEtBQUssQ0FBQ0QsTUFBTSxFQUFFQyxNQUFNLENBQUMsQ0FBQTtJQUVyQixJQUFJLENBQUNDLFNBQVMsR0FBRyxJQUFJLENBQUE7QUFDckIsSUFBQSxJQUFJLENBQUNDLEtBQUssR0FBRyxJQUFJQyxJQUFJLEVBQUUsQ0FBQTtJQUN2QixJQUFJLENBQUNDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDcEQsR0FBQTs7RUF1REEsSUFBSUMsSUFBSSxDQUFDQyxJQUFJLEVBQUU7SUFDWCxJQUFJQSxJQUFJLFlBQVlKLElBQUksRUFBRTtBQUN0QixNQUFBLElBQUksQ0FBQ0QsS0FBSyxDQUFDTSxJQUFJLENBQUNELElBQUksQ0FBQyxDQUFBO0tBQ3hCLE1BQU0sSUFBSUEsSUFBSSxZQUFZRSxLQUFLLElBQUlGLElBQUksQ0FBQ0csTUFBTSxJQUFJLENBQUMsRUFBRTtBQUNsRCxNQUFBLElBQUksQ0FBQ0osSUFBSSxDQUFDSyxHQUFHLENBQUNKLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM1QyxLQUFBO0FBQ0osR0FBQTtBQUVBLEVBQUEsSUFBSUQsSUFBSSxHQUFHO0lBQ1AsT0FBTyxJQUFJLENBQUNKLEtBQUssQ0FBQTtBQUNyQixHQUFBO0FBRUFVLEVBQUFBLFFBQVEsR0FBRztJQUNQLElBQUksQ0FBQ0MsV0FBVyxFQUFFLENBQUE7QUFDdEIsR0FBQTtBQUVBQyxFQUFBQSxTQUFTLEdBQUc7SUFDUixJQUFJLENBQUNELFdBQVcsRUFBRSxDQUFBO0FBQ3RCLEdBQUE7QUFFQVIsRUFBQUEsYUFBYSxDQUFDVSxJQUFJLEVBQUVDLEdBQUcsRUFBRUMsS0FBSyxFQUFFO0lBQzVCLElBQUksQ0FBQ0osV0FBVyxFQUFFLENBQUE7QUFDdEIsR0FBQTtBQUVBQSxFQUFBQSxXQUFXLEdBQUc7SUFDVixNQUFNSyxLQUFLLEdBQUcsSUFBSSxDQUFDQyxPQUFPLElBQUksSUFBSSxDQUFDbkIsTUFBTSxDQUFDbUIsT0FBTyxDQUFBO0FBQ2pELElBQUEsSUFBSUQsS0FBSyxLQUFLLElBQUksQ0FBQ2pCLFNBQVMsRUFDeEIsT0FBQTtJQUVKLElBQUksQ0FBQ0EsU0FBUyxHQUFHaUIsS0FBSyxDQUFBO0FBRXRCLElBQUEsSUFBSSxDQUFDRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDbkIsSUFBSSxDQUFDQSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQ0QsT0FBTyxDQUFDLENBQUE7QUFDcEMsR0FBQTtBQUVBRSxFQUFBQSxlQUFlLEdBQUc7QUFDZCxJQUFBLElBQUksQ0FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ3ZCLEdBQUE7QUFDSjs7OzsifQ==
