/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { platform } from '../core/platform.js';
import { EventHandler } from '../core/event-handler.js';
import { XRHAND_LEFT } from './constants.js';
import { XrFinger } from './xr-finger.js';
import { XrJoint } from './xr-joint.js';
import { Vec3 } from '../math/vec3.js';

let fingerJointIds = [];
const vecA = new Vec3();
const vecB = new Vec3();
const vecC = new Vec3();

if (platform.browser && window.XRHand) {
  fingerJointIds = [['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip'], ['index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip'], ['middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip'], ['ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip'], ['pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip']];
}

class XrHand extends EventHandler {
  constructor(inputSource) {
    super();
    this._manager = void 0;
    this._inputSource = void 0;
    this._tracking = false;
    this._fingers = [];
    this._joints = [];
    this._jointsById = {};
    this._tips = [];
    this._wrist = null;
    const xrHand = inputSource._xrInputSource.hand;
    this._manager = inputSource._manager;
    this._inputSource = inputSource;

    if (xrHand.get('wrist')) {
      const joint = new XrJoint(0, 'wrist', this, null);
      this._wrist = joint;

      this._joints.push(joint);

      this._jointsById.wrist = joint;
    }

    for (let f = 0; f < fingerJointIds.length; f++) {
      const finger = new XrFinger(f, this);

      for (let j = 0; j < fingerJointIds[f].length; j++) {
        const jointId = fingerJointIds[f][j];
        if (!xrHand.get(jointId)) continue;
        const joint = new XrJoint(j, jointId, this, finger);

        this._joints.push(joint);

        this._jointsById[jointId] = joint;

        if (joint.tip) {
          this._tips.push(joint);

          finger._tip = joint;
        }

        finger._joints.push(joint);
      }
    }
  }

  update(frame) {
    const xrInputSource = this._inputSource._xrInputSource;

    for (let j = 0; j < this._joints.length; j++) {
      const joint = this._joints[j];
      const jointSpace = xrInputSource.hand.get(joint._id);

      if (jointSpace) {
        let pose;
        if (frame.session.visibilityState !== 'hidden') pose = frame.getJointPose(jointSpace, this._manager._referenceSpace);

        if (pose) {
          joint.update(pose);

          if (joint.wrist && !this._tracking) {
            this._tracking = true;
            this.fire('tracking');
          }
        } else if (joint.wrist) {
          if (this._tracking) {
            this._tracking = false;
            this.fire('trackinglost');
          }

          break;
        }
      }
    }

    const j1 = this._jointsById['thumb-metacarpal'];
    const j4 = this._jointsById['thumb-tip'];
    const j6 = this._jointsById['index-finger-phalanx-proximal'];
    const j9 = this._jointsById['index-finger-tip'];
    const j16 = this._jointsById['ring-finger-phalanx-proximal'];
    const j21 = this._jointsById['pinky-finger-phalanx-proximal'];

    if (j1 && j4 && j6 && j9 && j16 && j21) {
      this._inputSource._dirtyRay = true;

      this._inputSource._rayLocal.origin.lerp(j4._localPosition, j9._localPosition, 0.5);

      let jointL = j1;
      let jointR = j21;

      if (this._inputSource.handedness === XRHAND_LEFT) {
        const t = jointL;
        jointL = jointR;
        jointR = t;
      }

      vecA.sub2(jointL._localPosition, this._wrist._localPosition);
      vecB.sub2(jointR._localPosition, this._wrist._localPosition);
      vecC.cross(vecA, vecB).normalize();
      vecA.lerp(j6._localPosition, j16._localPosition, 0.5);
      vecA.sub(this._wrist._localPosition).normalize();

      this._inputSource._rayLocal.direction.lerp(vecC, vecA, 0.5).normalize();
    }

    const squeezing = this._fingerIsClosed(1) && this._fingerIsClosed(2) && this._fingerIsClosed(3) && this._fingerIsClosed(4);

    if (squeezing) {
      if (!this._inputSource._squeezing) {
        this._inputSource._squeezing = true;

        this._inputSource.fire('squeezestart');

        this._manager.input.fire('squeezestart', this._inputSource);
      }
    } else {
      if (this._inputSource._squeezing) {
        this._inputSource._squeezing = false;

        this._inputSource.fire('squeeze');

        this._manager.input.fire('squeeze', this._inputSource);

        this._inputSource.fire('squeezeend');

        this._manager.input.fire('squeezeend', this._inputSource);
      }
    }
  }

  _fingerIsClosed(index) {
    const finger = this._fingers[index];
    vecA.sub2(finger.joints[0]._localPosition, finger.joints[1]._localPosition).normalize();
    vecB.sub2(finger.joints[2]._localPosition, finger.joints[3]._localPosition).normalize();
    return vecA.dot(vecB) < -0.8;
  }

  getJointById(id) {
    return this._jointsById[id] || null;
  }

  get fingers() {
    return this._fingers;
  }

  get joints() {
    return this._joints;
  }

  get tips() {
    return this._tips;
  }

  get wrist() {
    return this._wrist;
  }

  get tracking() {
    return this._tracking;
  }

}

export { XrHand };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHItaGFuZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3hyL3hyLWhhbmQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGxhdGZvcm0gfSBmcm9tICcuLi9jb3JlL3BsYXRmb3JtLmpzJztcbmltcG9ydCB7IEV2ZW50SGFuZGxlciB9IGZyb20gJy4uL2NvcmUvZXZlbnQtaGFuZGxlci5qcyc7XG5cbmltcG9ydCB7IFhSSEFORF9MRUZUIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuXG5pbXBvcnQgeyBYckZpbmdlciB9IGZyb20gJy4veHItZmluZ2VyLmpzJztcbmltcG9ydCB7IFhySm9pbnQgfSBmcm9tICcuL3hyLWpvaW50LmpzJztcblxuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvdmVjMy5qcyc7XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL3hyLWlucHV0LXNvdXJjZS5qcycpLlhySW5wdXRTb3VyY2V9IFhySW5wdXRTb3VyY2UgKi9cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL3hyLW1hbmFnZXIuanMnKS5Yck1hbmFnZXJ9IFhyTWFuYWdlciAqL1xuXG4vKipcbiAqIEB0eXBlIHtzdHJpbmdbXVtdfVxuICogQGlnbm9yZVxuICovXG5sZXQgZmluZ2VySm9pbnRJZHMgPSBbXTtcblxuY29uc3QgdmVjQSA9IG5ldyBWZWMzKCk7XG5jb25zdCB2ZWNCID0gbmV3IFZlYzMoKTtcbmNvbnN0IHZlY0MgPSBuZXcgVmVjMygpO1xuXG5pZiAocGxhdGZvcm0uYnJvd3NlciAmJiB3aW5kb3cuWFJIYW5kKSB7XG4gICAgZmluZ2VySm9pbnRJZHMgPSBbXG4gICAgICAgIFsndGh1bWItbWV0YWNhcnBhbCcsICd0aHVtYi1waGFsYW54LXByb3hpbWFsJywgJ3RodW1iLXBoYWxhbngtZGlzdGFsJywgJ3RodW1iLXRpcCddLFxuICAgICAgICBbJ2luZGV4LWZpbmdlci1tZXRhY2FycGFsJywgJ2luZGV4LWZpbmdlci1waGFsYW54LXByb3hpbWFsJywgJ2luZGV4LWZpbmdlci1waGFsYW54LWludGVybWVkaWF0ZScsICdpbmRleC1maW5nZXItcGhhbGFueC1kaXN0YWwnLCAnaW5kZXgtZmluZ2VyLXRpcCddLFxuICAgICAgICBbJ21pZGRsZS1maW5nZXItbWV0YWNhcnBhbCcsICdtaWRkbGUtZmluZ2VyLXBoYWxhbngtcHJveGltYWwnLCAnbWlkZGxlLWZpbmdlci1waGFsYW54LWludGVybWVkaWF0ZScsICdtaWRkbGUtZmluZ2VyLXBoYWxhbngtZGlzdGFsJywgJ21pZGRsZS1maW5nZXItdGlwJ10sXG4gICAgICAgIFsncmluZy1maW5nZXItbWV0YWNhcnBhbCcsICdyaW5nLWZpbmdlci1waGFsYW54LXByb3hpbWFsJywgJ3JpbmctZmluZ2VyLXBoYWxhbngtaW50ZXJtZWRpYXRlJywgJ3JpbmctZmluZ2VyLXBoYWxhbngtZGlzdGFsJywgJ3JpbmctZmluZ2VyLXRpcCddLFxuICAgICAgICBbJ3Bpbmt5LWZpbmdlci1tZXRhY2FycGFsJywgJ3Bpbmt5LWZpbmdlci1waGFsYW54LXByb3hpbWFsJywgJ3Bpbmt5LWZpbmdlci1waGFsYW54LWludGVybWVkaWF0ZScsICdwaW5reS1maW5nZXItcGhhbGFueC1kaXN0YWwnLCAncGlua3ktZmluZ2VyLXRpcCddXG4gICAgXTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgaGFuZCB3aXRoIGZpbmdlcnMgYW5kIGpvaW50cy5cbiAqXG4gKiBAYXVnbWVudHMgRXZlbnRIYW5kbGVyXG4gKi9cbmNsYXNzIFhySGFuZCBleHRlbmRzIEV2ZW50SGFuZGxlciB7XG4gICAgLyoqXG4gICAgICogQHR5cGUge1hyTWFuYWdlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYW5hZ2VyO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1hySW5wdXRTb3VyY2V9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5wdXRTb3VyY2U7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF90cmFja2luZyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1hyRmluZ2VyW119XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmluZ2VycyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1hySm9pbnRbXX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9qb2ludHMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtPYmplY3Q8c3RyaW5nLCBYckpvaW50Pn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9qb2ludHNCeUlkID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7WHJKb2ludFtdfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3RpcHMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtYckpvaW50fG51bGx9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfd3Jpc3QgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogUmVwcmVzZW50cyBhIGhhbmQgd2l0aCBmaW5nZXJzIGFuZCBqb2ludHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1hySW5wdXRTb3VyY2V9IGlucHV0U291cmNlIC0gSW5wdXQgU291cmNlIHRoYXQgaGFuZCBpcyByZWxhdGVkIHRvLlxuICAgICAqIEBoaWRlY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihpbnB1dFNvdXJjZSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGNvbnN0IHhySGFuZCA9IGlucHV0U291cmNlLl94cklucHV0U291cmNlLmhhbmQ7XG5cbiAgICAgICAgdGhpcy5fbWFuYWdlciA9IGlucHV0U291cmNlLl9tYW5hZ2VyO1xuICAgICAgICB0aGlzLl9pbnB1dFNvdXJjZSA9IGlucHV0U291cmNlO1xuXG4gICAgICAgIGlmICh4ckhhbmQuZ2V0KCd3cmlzdCcpKSB7XG4gICAgICAgICAgICBjb25zdCBqb2ludCA9IG5ldyBYckpvaW50KDAsICd3cmlzdCcsIHRoaXMsIG51bGwpO1xuICAgICAgICAgICAgdGhpcy5fd3Jpc3QgPSBqb2ludDtcbiAgICAgICAgICAgIHRoaXMuX2pvaW50cy5wdXNoKGpvaW50KTtcbiAgICAgICAgICAgIHRoaXMuX2pvaW50c0J5SWQud3Jpc3QgPSBqb2ludDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGYgPSAwOyBmIDwgZmluZ2VySm9pbnRJZHMubGVuZ3RoOyBmKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbmdlciA9IG5ldyBYckZpbmdlcihmLCB0aGlzKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBmaW5nZXJKb2ludElkc1tmXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGpvaW50SWQgPSBmaW5nZXJKb2ludElkc1tmXVtqXTtcbiAgICAgICAgICAgICAgICBpZiAoIXhySGFuZC5nZXQoam9pbnRJZCkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgam9pbnQgPSBuZXcgWHJKb2ludChqLCBqb2ludElkLCB0aGlzLCBmaW5nZXIpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fam9pbnRzLnB1c2goam9pbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2pvaW50c0J5SWRbam9pbnRJZF0gPSBqb2ludDtcbiAgICAgICAgICAgICAgICBpZiAoam9pbnQudGlwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RpcHMucHVzaChqb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbmdlci5fdGlwID0gam9pbnQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZmluZ2VyLl9qb2ludHMucHVzaChqb2ludCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlZCB3aGVuIHRyYWNraW5nIGJlY29tZXMgYXZhaWxhYmxlLlxuICAgICAqXG4gICAgICogQGV2ZW50IFhySGFuZCN0cmFja2luZ1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogRmlyZWQgd2hlbiB0cmFja2luZyBpcyBsb3N0LlxuICAgICAqXG4gICAgICogQGV2ZW50IFhySGFuZCN0cmFja2luZ2xvc3RcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7Kn0gZnJhbWUgLSBYUkZyYW1lIGZyb20gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGNhbGxiYWNrLlxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICB1cGRhdGUoZnJhbWUpIHtcbiAgICAgICAgY29uc3QgeHJJbnB1dFNvdXJjZSA9IHRoaXMuX2lucHV0U291cmNlLl94cklucHV0U291cmNlO1xuXG4gICAgICAgIC8vIGpvaW50c1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuX2pvaW50cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY29uc3Qgam9pbnQgPSB0aGlzLl9qb2ludHNbal07XG4gICAgICAgICAgICBjb25zdCBqb2ludFNwYWNlID0geHJJbnB1dFNvdXJjZS5oYW5kLmdldChqb2ludC5faWQpO1xuICAgICAgICAgICAgaWYgKGpvaW50U3BhY2UpIHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zZTtcblxuICAgICAgICAgICAgICAgIGlmIChmcmFtZS5zZXNzaW9uLnZpc2liaWxpdHlTdGF0ZSAhPT0gJ2hpZGRlbicpXG4gICAgICAgICAgICAgICAgICAgIHBvc2UgPSBmcmFtZS5nZXRKb2ludFBvc2Uoam9pbnRTcGFjZSwgdGhpcy5fbWFuYWdlci5fcmVmZXJlbmNlU3BhY2UpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgam9pbnQudXBkYXRlKHBvc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChqb2ludC53cmlzdCAmJiAhdGhpcy5fdHJhY2tpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RyYWNraW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgndHJhY2tpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoam9pbnQud3Jpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9zdCB0cmFja2luZ1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl90cmFja2luZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdHJhY2tpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgndHJhY2tpbmdsb3N0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgajEgPSB0aGlzLl9qb2ludHNCeUlkWyd0aHVtYi1tZXRhY2FycGFsJ107XG4gICAgICAgIGNvbnN0IGo0ID0gdGhpcy5fam9pbnRzQnlJZFsndGh1bWItdGlwJ107XG4gICAgICAgIGNvbnN0IGo2ID0gdGhpcy5fam9pbnRzQnlJZFsnaW5kZXgtZmluZ2VyLXBoYWxhbngtcHJveGltYWwnXTtcbiAgICAgICAgY29uc3QgajkgPSB0aGlzLl9qb2ludHNCeUlkWydpbmRleC1maW5nZXItdGlwJ107XG4gICAgICAgIGNvbnN0IGoxNiA9IHRoaXMuX2pvaW50c0J5SWRbJ3JpbmctZmluZ2VyLXBoYWxhbngtcHJveGltYWwnXTtcbiAgICAgICAgY29uc3QgajIxID0gdGhpcy5fam9pbnRzQnlJZFsncGlua3ktZmluZ2VyLXBoYWxhbngtcHJveGltYWwnXTtcblxuICAgICAgICAvLyByYXlcbiAgICAgICAgaWYgKGoxICYmIGo0ICYmIGo2ICYmIGo5ICYmIGoxNiAmJiBqMjEpIHtcbiAgICAgICAgICAgIHRoaXMuX2lucHV0U291cmNlLl9kaXJ0eVJheSA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIHJheSBvcmlnaW5cbiAgICAgICAgICAgIC8vIGdldCBwb2ludCBiZXR3ZWVuIHRodW1iIHRpcCBhbmQgaW5kZXggdGlwXG4gICAgICAgICAgICB0aGlzLl9pbnB1dFNvdXJjZS5fcmF5TG9jYWwub3JpZ2luLmxlcnAoajQuX2xvY2FsUG9zaXRpb24sIGo5Ll9sb2NhbFBvc2l0aW9uLCAwLjUpO1xuXG4gICAgICAgICAgICAvLyByYXkgZGlyZWN0aW9uXG4gICAgICAgICAgICBsZXQgam9pbnRMID0gajE7XG4gICAgICAgICAgICBsZXQgam9pbnRSID0gajIxO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5faW5wdXRTb3VyY2UuaGFuZGVkbmVzcyA9PT0gWFJIQU5EX0xFRlQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ID0gam9pbnRMO1xuICAgICAgICAgICAgICAgIGpvaW50TCA9IGpvaW50UjtcbiAgICAgICAgICAgICAgICBqb2ludFIgPSB0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyAoQSkgY2FsY3VsYXRlIG5vcm1hbCB2ZWN0b3IgYmV0d2VlbiAzIGpvaW50czogd3Jpc3QsIHRodW1iIG1ldGFjYXJwYWwsIGxpdHRsZSBwaGFsYW54IHByb3hpbWFsXG4gICAgICAgICAgICB2ZWNBLnN1YjIoam9pbnRMLl9sb2NhbFBvc2l0aW9uLCB0aGlzLl93cmlzdC5fbG9jYWxQb3NpdGlvbik7XG4gICAgICAgICAgICB2ZWNCLnN1YjIoam9pbnRSLl9sb2NhbFBvc2l0aW9uLCB0aGlzLl93cmlzdC5fbG9jYWxQb3NpdGlvbik7XG4gICAgICAgICAgICB2ZWNDLmNyb3NzKHZlY0EsIHZlY0IpLm5vcm1hbGl6ZSgpO1xuXG4gICAgICAgICAgICAvLyBnZXQgcG9pbnQgYmV0d2VlbjogaW5kZXggcGhhbGFueCBwcm94aW1hbCBhbmQgcmlnaHQgcGhhbGFueCBwcm94aW1hbFxuICAgICAgICAgICAgdmVjQS5sZXJwKGo2Ll9sb2NhbFBvc2l0aW9uLCBqMTYuX2xvY2FsUG9zaXRpb24sIDAuNSk7XG4gICAgICAgICAgICAvLyAoQikgZ2V0IHZlY3RvciBiZXR3ZWVuIHRoYXQgcG9pbnQgYW5kIGEgd3Jpc3RcbiAgICAgICAgICAgIHZlY0Euc3ViKHRoaXMuX3dyaXN0Ll9sb2NhbFBvc2l0aW9uKS5ub3JtYWxpemUoKTtcblxuICAgICAgICAgICAgLy8gbWl4IG5vcm1hbCB2ZWN0b3IgKEEpIHdpdGggaGFuZCBkaXJlY3Rpb25hbCB2ZWN0b3IgKEIpXG4gICAgICAgICAgICB0aGlzLl9pbnB1dFNvdXJjZS5fcmF5TG9jYWwuZGlyZWN0aW9uLmxlcnAodmVjQywgdmVjQSwgMC41KS5ub3JtYWxpemUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGVtdWxhdGUgc3F1ZWV6ZSBldmVudHMgYnkgZm9sZGluZyBhbGwgNCBmaW5nZXJzXG4gICAgICAgIGNvbnN0IHNxdWVlemluZyA9IHRoaXMuX2ZpbmdlcklzQ2xvc2VkKDEpICYmIHRoaXMuX2ZpbmdlcklzQ2xvc2VkKDIpICYmIHRoaXMuX2ZpbmdlcklzQ2xvc2VkKDMpICYmIHRoaXMuX2ZpbmdlcklzQ2xvc2VkKDQpO1xuXG4gICAgICAgIGlmIChzcXVlZXppbmcpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faW5wdXRTb3VyY2UuX3NxdWVlemluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lucHV0U291cmNlLl9zcXVlZXppbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2lucHV0U291cmNlLmZpcmUoJ3NxdWVlemVzdGFydCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuX21hbmFnZXIuaW5wdXQuZmlyZSgnc3F1ZWV6ZXN0YXJ0JywgdGhpcy5faW5wdXRTb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lucHV0U291cmNlLl9zcXVlZXppbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnB1dFNvdXJjZS5fc3F1ZWV6aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9pbnB1dFNvdXJjZS5maXJlKCdzcXVlZXplJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fbWFuYWdlci5pbnB1dC5maXJlKCdzcXVlZXplJywgdGhpcy5faW5wdXRTb3VyY2UpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5faW5wdXRTb3VyY2UuZmlyZSgnc3F1ZWV6ZWVuZCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuX21hbmFnZXIuaW5wdXQuZmlyZSgnc3F1ZWV6ZWVuZCcsIHRoaXMuX2lucHV0U291cmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIEZpbmdlciBpbmRleC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBmaW5nZXIgaXMgY2xvc2VkIGFuZCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmluZ2VySXNDbG9zZWQoaW5kZXgpIHtcbiAgICAgICAgY29uc3QgZmluZ2VyID0gdGhpcy5fZmluZ2Vyc1tpbmRleF07XG4gICAgICAgIHZlY0Euc3ViMihmaW5nZXIuam9pbnRzWzBdLl9sb2NhbFBvc2l0aW9uLCBmaW5nZXIuam9pbnRzWzFdLl9sb2NhbFBvc2l0aW9uKS5ub3JtYWxpemUoKTtcbiAgICAgICAgdmVjQi5zdWIyKGZpbmdlci5qb2ludHNbMl0uX2xvY2FsUG9zaXRpb24sIGZpbmdlci5qb2ludHNbM10uX2xvY2FsUG9zaXRpb24pLm5vcm1hbGl6ZSgpO1xuICAgICAgICByZXR1cm4gdmVjQS5kb3QodmVjQikgPCAtMC44O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgam9pbnQgYnkgWFJIYW5kIGlkIGZyb20gbGlzdCBpbiBzcGVjczogaHR0cHM6Ly9pbW1lcnNpdmUtd2ViLmdpdGh1Yi5pby93ZWJ4ci1oYW5kLWlucHV0Ly5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIElkIG9mIGEgam9pbnQgYmFzZWQgb24gc3BlY3MgSUQncyBpbiBYUkhhbmQ6IGh0dHBzOi8vaW1tZXJzaXZlLXdlYi5naXRodWIuaW8vd2VieHItaGFuZC1pbnB1dC8uXG4gICAgICogQHJldHVybnMge1hySm9pbnR8bnVsbH0gSm9pbnQgb3IgbnVsbCBpZiBub3QgYXZhaWxhYmxlLlxuICAgICAqL1xuICAgIGdldEpvaW50QnlJZChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fam9pbnRzQnlJZFtpZF0gfHwgbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGZpbmdlcnMgb2YgYSBoYW5kLlxuICAgICAqXG4gICAgICogQHR5cGUge1hyRmluZ2VyW119XG4gICAgICovXG4gICAgZ2V0IGZpbmdlcnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maW5nZXJzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2Ygam9pbnRzIG9mIGhhbmQuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7WHJKb2ludFtdfVxuICAgICAqL1xuICAgIGdldCBqb2ludHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9qb2ludHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTGlzdCBvZiBqb2ludHMgdGhhdCBhcmUgZmluZ2VydGlwcy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtYckpvaW50W119XG4gICAgICovXG4gICAgZ2V0IHRpcHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90aXBzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXN0IG9mIGEgaGFuZCwgb3IgbnVsbCBpZiBpdCBpcyBub3QgYXZhaWxhYmxlIGJ5IFdlYlhSIHVuZGVybHlpbmcgc3lzdGVtLlxuICAgICAqXG4gICAgICogQHR5cGUge1hySm9pbnR8bnVsbH1cbiAgICAgKi9cbiAgICBnZXQgd3Jpc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl93cmlzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcnVlIGlmIHRyYWNraW5nIGlzIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIHRyYWNraW5nIG1pZ2h0IGJlIGxvc3QuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBnZXQgdHJhY2tpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFja2luZztcbiAgICB9XG59XG5cbmV4cG9ydCB7IFhySGFuZCB9O1xuIl0sIm5hbWVzIjpbImZpbmdlckpvaW50SWRzIiwidmVjQSIsIlZlYzMiLCJ2ZWNCIiwidmVjQyIsInBsYXRmb3JtIiwiYnJvd3NlciIsIndpbmRvdyIsIlhSSGFuZCIsIlhySGFuZCIsIkV2ZW50SGFuZGxlciIsImNvbnN0cnVjdG9yIiwiaW5wdXRTb3VyY2UiLCJfbWFuYWdlciIsIl9pbnB1dFNvdXJjZSIsIl90cmFja2luZyIsIl9maW5nZXJzIiwiX2pvaW50cyIsIl9qb2ludHNCeUlkIiwiX3RpcHMiLCJfd3Jpc3QiLCJ4ckhhbmQiLCJfeHJJbnB1dFNvdXJjZSIsImhhbmQiLCJnZXQiLCJqb2ludCIsIlhySm9pbnQiLCJwdXNoIiwid3Jpc3QiLCJmIiwibGVuZ3RoIiwiZmluZ2VyIiwiWHJGaW5nZXIiLCJqIiwiam9pbnRJZCIsInRpcCIsIl90aXAiLCJ1cGRhdGUiLCJmcmFtZSIsInhySW5wdXRTb3VyY2UiLCJqb2ludFNwYWNlIiwiX2lkIiwicG9zZSIsInNlc3Npb24iLCJ2aXNpYmlsaXR5U3RhdGUiLCJnZXRKb2ludFBvc2UiLCJfcmVmZXJlbmNlU3BhY2UiLCJmaXJlIiwiajEiLCJqNCIsImo2IiwiajkiLCJqMTYiLCJqMjEiLCJfZGlydHlSYXkiLCJfcmF5TG9jYWwiLCJvcmlnaW4iLCJsZXJwIiwiX2xvY2FsUG9zaXRpb24iLCJqb2ludEwiLCJqb2ludFIiLCJoYW5kZWRuZXNzIiwiWFJIQU5EX0xFRlQiLCJ0Iiwic3ViMiIsImNyb3NzIiwibm9ybWFsaXplIiwic3ViIiwiZGlyZWN0aW9uIiwic3F1ZWV6aW5nIiwiX2ZpbmdlcklzQ2xvc2VkIiwiX3NxdWVlemluZyIsImlucHV0IiwiaW5kZXgiLCJqb2ludHMiLCJkb3QiLCJnZXRKb2ludEJ5SWQiLCJpZCIsImZpbmdlcnMiLCJ0aXBzIiwidHJhY2tpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQWlCQSxJQUFJQSxjQUFjLEdBQUcsRUFBckIsQ0FBQTtBQUVBLE1BQU1DLElBQUksR0FBRyxJQUFJQyxJQUFKLEVBQWIsQ0FBQTtBQUNBLE1BQU1DLElBQUksR0FBRyxJQUFJRCxJQUFKLEVBQWIsQ0FBQTtBQUNBLE1BQU1FLElBQUksR0FBRyxJQUFJRixJQUFKLEVBQWIsQ0FBQTs7QUFFQSxJQUFJRyxRQUFRLENBQUNDLE9BQVQsSUFBb0JDLE1BQU0sQ0FBQ0MsTUFBL0IsRUFBdUM7RUFDbkNSLGNBQWMsR0FBRyxDQUNiLENBQUMsa0JBQUQsRUFBcUIsd0JBQXJCLEVBQStDLHNCQUEvQyxFQUF1RSxXQUF2RSxDQURhLEVBRWIsQ0FBQyx5QkFBRCxFQUE0QiwrQkFBNUIsRUFBNkQsbUNBQTdELEVBQWtHLDZCQUFsRyxFQUFpSSxrQkFBakksQ0FGYSxFQUdiLENBQUMsMEJBQUQsRUFBNkIsZ0NBQTdCLEVBQStELG9DQUEvRCxFQUFxRyw4QkFBckcsRUFBcUksbUJBQXJJLENBSGEsRUFJYixDQUFDLHdCQUFELEVBQTJCLDhCQUEzQixFQUEyRCxrQ0FBM0QsRUFBK0YsNEJBQS9GLEVBQTZILGlCQUE3SCxDQUphLEVBS2IsQ0FBQyx5QkFBRCxFQUE0QiwrQkFBNUIsRUFBNkQsbUNBQTdELEVBQWtHLDZCQUFsRyxFQUFpSSxrQkFBakksQ0FMYSxDQUFqQixDQUFBO0FBT0gsQ0FBQTs7QUFPRCxNQUFNUyxNQUFOLFNBQXFCQyxZQUFyQixDQUFrQztFQXVEOUJDLFdBQVcsQ0FBQ0MsV0FBRCxFQUFj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
