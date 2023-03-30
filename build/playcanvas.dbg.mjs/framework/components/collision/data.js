/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { Quat } from '../../../core/math/quat.js';
import { Vec3 } from '../../../core/math/vec3.js';

class CollisionComponentData {
  constructor() {
    this.enabled = true;
    this.type = 'box';
    this.halfExtents = new Vec3(0.5, 0.5, 0.5);
    this.linearOffset = new Vec3();
    this.angularOffset = new Quat();
    this.radius = 0.5;
    this.axis = 1;
    this.height = 2;
    this.asset = null;
    this.renderAsset = null;

    // Non-serialized properties
    this.shape = null;
    this.model = null;
    this.render = null;
    this.initialized = false;
  }
}

export { CollisionComponentData };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9jb21wb25lbnRzL2NvbGxpc2lvbi9kYXRhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFF1YXQgfSBmcm9tICcuLi8uLi8uLi9jb3JlL21hdGgvcXVhdC5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vLi4vLi4vY29yZS9tYXRoL3ZlYzMuanMnO1xuXG5jbGFzcyBDb2xsaXNpb25Db21wb25lbnREYXRhIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2JveCc7XG4gICAgICAgIHRoaXMuaGFsZkV4dGVudHMgPSBuZXcgVmVjMygwLjUsIDAuNSwgMC41KTtcbiAgICAgICAgdGhpcy5saW5lYXJPZmZzZXQgPSBuZXcgVmVjMygpO1xuICAgICAgICB0aGlzLmFuZ3VsYXJPZmZzZXQgPSBuZXcgUXVhdCgpO1xuICAgICAgICB0aGlzLnJhZGl1cyA9IDAuNTtcbiAgICAgICAgdGhpcy5heGlzID0gMTtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAyO1xuICAgICAgICB0aGlzLmFzc2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZW5kZXJBc3NldCA9IG51bGw7XG5cbiAgICAgICAgLy8gTm9uLXNlcmlhbGl6ZWQgcHJvcGVydGllc1xuICAgICAgICB0aGlzLnNoYXBlID0gbnVsbDtcbiAgICAgICAgdGhpcy5tb2RlbCA9IG51bGw7XG4gICAgICAgIHRoaXMucmVuZGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgQ29sbGlzaW9uQ29tcG9uZW50RGF0YSB9O1xuIl0sIm5hbWVzIjpbIkNvbGxpc2lvbkNvbXBvbmVudERhdGEiLCJjb25zdHJ1Y3RvciIsImVuYWJsZWQiLCJ0eXBlIiwiaGFsZkV4dGVudHMiLCJWZWMzIiwibGluZWFyT2Zmc2V0IiwiYW5ndWxhck9mZnNldCIsIlF1YXQiLCJyYWRpdXMiLCJheGlzIiwiaGVpZ2h0IiwiYXNzZXQiLCJyZW5kZXJBc3NldCIsInNoYXBlIiwibW9kZWwiLCJyZW5kZXIiLCJpbml0aWFsaXplZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFHQSxNQUFNQSxzQkFBc0IsQ0FBQztBQUN6QkMsRUFBQUEsV0FBV0EsR0FBRztJQUNWLElBQUksQ0FBQ0MsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNuQixJQUFJLENBQUNDLElBQUksR0FBRyxLQUFLLENBQUE7SUFDakIsSUFBSSxDQUFDQyxXQUFXLEdBQUcsSUFBSUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDMUMsSUFBQSxJQUFJLENBQUNDLFlBQVksR0FBRyxJQUFJRCxJQUFJLEVBQUUsQ0FBQTtBQUM5QixJQUFBLElBQUksQ0FBQ0UsYUFBYSxHQUFHLElBQUlDLElBQUksRUFBRSxDQUFBO0lBQy9CLElBQUksQ0FBQ0MsTUFBTSxHQUFHLEdBQUcsQ0FBQTtJQUNqQixJQUFJLENBQUNDLElBQUksR0FBRyxDQUFDLENBQUE7SUFDYixJQUFJLENBQUNDLE1BQU0sR0FBRyxDQUFDLENBQUE7SUFDZixJQUFJLENBQUNDLEtBQUssR0FBRyxJQUFJLENBQUE7SUFDakIsSUFBSSxDQUFDQyxXQUFXLEdBQUcsSUFBSSxDQUFBOztBQUV2QjtJQUNBLElBQUksQ0FBQ0MsS0FBSyxHQUFHLElBQUksQ0FBQTtJQUNqQixJQUFJLENBQUNDLEtBQUssR0FBRyxJQUFJLENBQUE7SUFDakIsSUFBSSxDQUFDQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0lBQ2xCLElBQUksQ0FBQ0MsV0FBVyxHQUFHLEtBQUssQ0FBQTtBQUM1QixHQUFBO0FBQ0o7Ozs7In0=
