/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { EventHandler } from '../../core/event-handler.js';
import { platform } from '../../core/platform.js';
import { Vec3 } from '../../core/math/vec3.js';
import { XRHAND_LEFT } from './constants.js';
import { XrFinger } from './xr-finger.js';
import { XrJoint } from './xr-joint.js';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHItaGFuZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay94ci94ci1oYW5kLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50SGFuZGxlciB9IGZyb20gJy4uLy4uL2NvcmUvZXZlbnQtaGFuZGxlci5qcyc7XG5pbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gJy4uLy4uL2NvcmUvcGxhdGZvcm0uanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uLy4uL2NvcmUvbWF0aC92ZWMzLmpzJztcblxuaW1wb3J0IHsgWFJIQU5EX0xFRlQgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBYckZpbmdlciB9IGZyb20gJy4veHItZmluZ2VyLmpzJztcbmltcG9ydCB7IFhySm9pbnQgfSBmcm9tICcuL3hyLWpvaW50LmpzJztcblxuXG4vKipcbiAqIEB0eXBlIHtzdHJpbmdbXVtdfVxuICogQGlnbm9yZVxuICovXG5sZXQgZmluZ2VySm9pbnRJZHMgPSBbXTtcblxuY29uc3QgdmVjQSA9IG5ldyBWZWMzKCk7XG5jb25zdCB2ZWNCID0gbmV3IFZlYzMoKTtcbmNvbnN0IHZlY0MgPSBuZXcgVmVjMygpO1xuXG5pZiAocGxhdGZvcm0uYnJvd3NlciAmJiB3aW5kb3cuWFJIYW5kKSB7XG4gICAgZmluZ2VySm9pbnRJZHMgPSBbXG4gICAgICAgIFsndGh1bWItbWV0YWNhcnBhbCcsICd0aHVtYi1waGFsYW54LXByb3hpbWFsJywgJ3RodW1iLXBoYWxhbngtZGlzdGFsJywgJ3RodW1iLXRpcCddLFxuICAgICAgICBbJ2luZGV4LWZpbmdlci1tZXRhY2FycGFsJywgJ2luZGV4LWZpbmdlci1waGFsYW54LXByb3hpbWFsJywgJ2luZGV4LWZpbmdlci1waGFsYW54LWludGVybWVkaWF0ZScsICdpbmRleC1maW5nZXItcGhhbGFueC1kaXN0YWwnLCAnaW5kZXgtZmluZ2VyLXRpcCddLFxuICAgICAgICBbJ21pZGRsZS1maW5nZXItbWV0YWNhcnBhbCcsICdtaWRkbGUtZmluZ2VyLXBoYWxhbngtcHJveGltYWwnLCAnbWlkZGxlLWZpbmdlci1waGFsYW54LWludGVybWVkaWF0ZScsICdtaWRkbGUtZmluZ2VyLXBoYWxhbngtZGlzdGFsJywgJ21pZGRsZS1maW5nZXItdGlwJ10sXG4gICAgICAgIFsncmluZy1maW5nZXItbWV0YWNhcnBhbCcsICdyaW5nLWZpbmdlci1waGFsYW54LXByb3hpbWFsJywgJ3JpbmctZmluZ2VyLXBoYWxhbngtaW50ZXJtZWRpYXRlJywgJ3JpbmctZmluZ2VyLXBoYWxhbngtZGlzdGFsJywgJ3JpbmctZmluZ2VyLXRpcCddLFxuICAgICAgICBbJ3Bpbmt5LWZpbmdlci1tZXRhY2FycGFsJywgJ3Bpbmt5LWZpbmdlci1waGFsYW54LXByb3hpbWFsJywgJ3Bpbmt5LWZpbmdlci1waGFsYW54LWludGVybWVkaWF0ZScsICdwaW5reS1maW5nZXItcGhhbGFueC1kaXN0YWwnLCAncGlua3ktZmluZ2VyLXRpcCddXG4gICAgXTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgaGFuZCB3aXRoIGZpbmdlcnMgYW5kIGpvaW50cy5cbiAqXG4gKiBAYXVnbWVudHMgRXZlbnRIYW5kbGVyXG4gKi9cbmNsYXNzIFhySGFuZCBleHRlbmRzIEV2ZW50SGFuZGxlciB7XG4gICAgLyoqXG4gICAgICogQHR5cGUge2ltcG9ydCgnLi94ci1tYW5hZ2VyLmpzJykuWHJNYW5hZ2VyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21hbmFnZXI7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7aW1wb3J0KCcuL3hyLWlucHV0LXNvdXJjZS5qcycpLlhySW5wdXRTb3VyY2V9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5wdXRTb3VyY2U7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF90cmFja2luZyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1hyRmluZ2VyW119XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmluZ2VycyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1hySm9pbnRbXX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9qb2ludHMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtPYmplY3Q8c3RyaW5nLCBYckpvaW50Pn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9qb2ludHNCeUlkID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7WHJKb2ludFtdfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3RpcHMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtYckpvaW50fG51bGx9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfd3Jpc3QgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogUmVwcmVzZW50cyBhIGhhbmQgd2l0aCBmaW5nZXJzIGFuZCBqb2ludHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi94ci1pbnB1dC1zb3VyY2UuanMnKS5YcklucHV0U291cmNlfSBpbnB1dFNvdXJjZSAtIElucHV0IFNvdXJjZSB0aGF0IGhhbmRcbiAgICAgKiBpcyByZWxhdGVkIHRvLlxuICAgICAqIEBoaWRlY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihpbnB1dFNvdXJjZSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGNvbnN0IHhySGFuZCA9IGlucHV0U291cmNlLl94cklucHV0U291cmNlLmhhbmQ7XG5cbiAgICAgICAgdGhpcy5fbWFuYWdlciA9IGlucHV0U291cmNlLl9tYW5hZ2VyO1xuICAgICAgICB0aGlzLl9pbnB1dFNvdXJjZSA9IGlucHV0U291cmNlO1xuXG4gICAgICAgIGlmICh4ckhhbmQuZ2V0KCd3cmlzdCcpKSB7XG4gICAgICAgICAgICBjb25zdCBqb2ludCA9IG5ldyBYckpvaW50KDAsICd3cmlzdCcsIHRoaXMsIG51bGwpO1xuICAgICAgICAgICAgdGhpcy5fd3Jpc3QgPSBqb2ludDtcbiAgICAgICAgICAgIHRoaXMuX2pvaW50cy5wdXNoKGpvaW50KTtcbiAgICAgICAgICAgIHRoaXMuX2pvaW50c0J5SWQud3Jpc3QgPSBqb2ludDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGYgPSAwOyBmIDwgZmluZ2VySm9pbnRJZHMubGVuZ3RoOyBmKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbmdlciA9IG5ldyBYckZpbmdlcihmLCB0aGlzKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBmaW5nZXJKb2ludElkc1tmXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGpvaW50SWQgPSBmaW5nZXJKb2ludElkc1tmXVtqXTtcbiAgICAgICAgICAgICAgICBpZiAoIXhySGFuZC5nZXQoam9pbnRJZCkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgam9pbnQgPSBuZXcgWHJKb2ludChqLCBqb2ludElkLCB0aGlzLCBmaW5nZXIpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fam9pbnRzLnB1c2goam9pbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2pvaW50c0J5SWRbam9pbnRJZF0gPSBqb2ludDtcbiAgICAgICAgICAgICAgICBpZiAoam9pbnQudGlwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RpcHMucHVzaChqb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbmdlci5fdGlwID0gam9pbnQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZmluZ2VyLl9qb2ludHMucHVzaChqb2ludCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlZCB3aGVuIHRyYWNraW5nIGJlY29tZXMgYXZhaWxhYmxlLlxuICAgICAqXG4gICAgICogQGV2ZW50IFhySGFuZCN0cmFja2luZ1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogRmlyZWQgd2hlbiB0cmFja2luZyBpcyBsb3N0LlxuICAgICAqXG4gICAgICogQGV2ZW50IFhySGFuZCN0cmFja2luZ2xvc3RcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7Kn0gZnJhbWUgLSBYUkZyYW1lIGZyb20gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGNhbGxiYWNrLlxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICB1cGRhdGUoZnJhbWUpIHtcbiAgICAgICAgY29uc3QgeHJJbnB1dFNvdXJjZSA9IHRoaXMuX2lucHV0U291cmNlLl94cklucHV0U291cmNlO1xuXG4gICAgICAgIC8vIGpvaW50c1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuX2pvaW50cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY29uc3Qgam9pbnQgPSB0aGlzLl9qb2ludHNbal07XG4gICAgICAgICAgICBjb25zdCBqb2ludFNwYWNlID0geHJJbnB1dFNvdXJjZS5oYW5kLmdldChqb2ludC5faWQpO1xuICAgICAgICAgICAgaWYgKGpvaW50U3BhY2UpIHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zZTtcblxuICAgICAgICAgICAgICAgIGlmIChmcmFtZS5zZXNzaW9uLnZpc2liaWxpdHlTdGF0ZSAhPT0gJ2hpZGRlbicpXG4gICAgICAgICAgICAgICAgICAgIHBvc2UgPSBmcmFtZS5nZXRKb2ludFBvc2Uoam9pbnRTcGFjZSwgdGhpcy5fbWFuYWdlci5fcmVmZXJlbmNlU3BhY2UpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgam9pbnQudXBkYXRlKHBvc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChqb2ludC53cmlzdCAmJiAhdGhpcy5fdHJhY2tpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RyYWNraW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgndHJhY2tpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoam9pbnQud3Jpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9zdCB0cmFja2luZ1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl90cmFja2luZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdHJhY2tpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgndHJhY2tpbmdsb3N0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgajEgPSB0aGlzLl9qb2ludHNCeUlkWyd0aHVtYi1tZXRhY2FycGFsJ107XG4gICAgICAgIGNvbnN0IGo0ID0gdGhpcy5fam9pbnRzQnlJZFsndGh1bWItdGlwJ107XG4gICAgICAgIGNvbnN0IGo2ID0gdGhpcy5fam9pbnRzQnlJZFsnaW5kZXgtZmluZ2VyLXBoYWxhbngtcHJveGltYWwnXTtcbiAgICAgICAgY29uc3QgajkgPSB0aGlzLl9qb2ludHNCeUlkWydpbmRleC1maW5nZXItdGlwJ107XG4gICAgICAgIGNvbnN0IGoxNiA9IHRoaXMuX2pvaW50c0J5SWRbJ3JpbmctZmluZ2VyLXBoYWxhbngtcHJveGltYWwnXTtcbiAgICAgICAgY29uc3QgajIxID0gdGhpcy5fam9pbnRzQnlJZFsncGlua3ktZmluZ2VyLXBoYWxhbngtcHJveGltYWwnXTtcblxuICAgICAgICAvLyByYXlcbiAgICAgICAgaWYgKGoxICYmIGo0ICYmIGo2ICYmIGo5ICYmIGoxNiAmJiBqMjEpIHtcbiAgICAgICAgICAgIHRoaXMuX2lucHV0U291cmNlLl9kaXJ0eVJheSA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIHJheSBvcmlnaW5cbiAgICAgICAgICAgIC8vIGdldCBwb2ludCBiZXR3ZWVuIHRodW1iIHRpcCBhbmQgaW5kZXggdGlwXG4gICAgICAgICAgICB0aGlzLl9pbnB1dFNvdXJjZS5fcmF5TG9jYWwub3JpZ2luLmxlcnAoajQuX2xvY2FsUG9zaXRpb24sIGo5Ll9sb2NhbFBvc2l0aW9uLCAwLjUpO1xuXG4gICAgICAgICAgICAvLyByYXkgZGlyZWN0aW9uXG4gICAgICAgICAgICBsZXQgam9pbnRMID0gajE7XG4gICAgICAgICAgICBsZXQgam9pbnRSID0gajIxO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5faW5wdXRTb3VyY2UuaGFuZGVkbmVzcyA9PT0gWFJIQU5EX0xFRlQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ID0gam9pbnRMO1xuICAgICAgICAgICAgICAgIGpvaW50TCA9IGpvaW50UjtcbiAgICAgICAgICAgICAgICBqb2ludFIgPSB0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyAoQSkgY2FsY3VsYXRlIG5vcm1hbCB2ZWN0b3IgYmV0d2VlbiAzIGpvaW50czogd3Jpc3QsIHRodW1iIG1ldGFjYXJwYWwsIGxpdHRsZSBwaGFsYW54IHByb3hpbWFsXG4gICAgICAgICAgICB2ZWNBLnN1YjIoam9pbnRMLl9sb2NhbFBvc2l0aW9uLCB0aGlzLl93cmlzdC5fbG9jYWxQb3NpdGlvbik7XG4gICAgICAgICAgICB2ZWNCLnN1YjIoam9pbnRSLl9sb2NhbFBvc2l0aW9uLCB0aGlzLl93cmlzdC5fbG9jYWxQb3NpdGlvbik7XG4gICAgICAgICAgICB2ZWNDLmNyb3NzKHZlY0EsIHZlY0IpLm5vcm1hbGl6ZSgpO1xuXG4gICAgICAgICAgICAvLyBnZXQgcG9pbnQgYmV0d2VlbjogaW5kZXggcGhhbGFueCBwcm94aW1hbCBhbmQgcmlnaHQgcGhhbGFueCBwcm94aW1hbFxuICAgICAgICAgICAgdmVjQS5sZXJwKGo2Ll9sb2NhbFBvc2l0aW9uLCBqMTYuX2xvY2FsUG9zaXRpb24sIDAuNSk7XG4gICAgICAgICAgICAvLyAoQikgZ2V0IHZlY3RvciBiZXR3ZWVuIHRoYXQgcG9pbnQgYW5kIGEgd3Jpc3RcbiAgICAgICAgICAgIHZlY0Euc3ViKHRoaXMuX3dyaXN0Ll9sb2NhbFBvc2l0aW9uKS5ub3JtYWxpemUoKTtcblxuICAgICAgICAgICAgLy8gbWl4IG5vcm1hbCB2ZWN0b3IgKEEpIHdpdGggaGFuZCBkaXJlY3Rpb25hbCB2ZWN0b3IgKEIpXG4gICAgICAgICAgICB0aGlzLl9pbnB1dFNvdXJjZS5fcmF5TG9jYWwuZGlyZWN0aW9uLmxlcnAodmVjQywgdmVjQSwgMC41KS5ub3JtYWxpemUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGVtdWxhdGUgc3F1ZWV6ZSBldmVudHMgYnkgZm9sZGluZyBhbGwgNCBmaW5nZXJzXG4gICAgICAgIGNvbnN0IHNxdWVlemluZyA9IHRoaXMuX2ZpbmdlcklzQ2xvc2VkKDEpICYmIHRoaXMuX2ZpbmdlcklzQ2xvc2VkKDIpICYmIHRoaXMuX2ZpbmdlcklzQ2xvc2VkKDMpICYmIHRoaXMuX2ZpbmdlcklzQ2xvc2VkKDQpO1xuXG4gICAgICAgIGlmIChzcXVlZXppbmcpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faW5wdXRTb3VyY2UuX3NxdWVlemluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lucHV0U291cmNlLl9zcXVlZXppbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2lucHV0U291cmNlLmZpcmUoJ3NxdWVlemVzdGFydCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuX21hbmFnZXIuaW5wdXQuZmlyZSgnc3F1ZWV6ZXN0YXJ0JywgdGhpcy5faW5wdXRTb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lucHV0U291cmNlLl9zcXVlZXppbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnB1dFNvdXJjZS5fc3F1ZWV6aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9pbnB1dFNvdXJjZS5maXJlKCdzcXVlZXplJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fbWFuYWdlci5pbnB1dC5maXJlKCdzcXVlZXplJywgdGhpcy5faW5wdXRTb3VyY2UpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5faW5wdXRTb3VyY2UuZmlyZSgnc3F1ZWV6ZWVuZCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuX21hbmFnZXIuaW5wdXQuZmlyZSgnc3F1ZWV6ZWVuZCcsIHRoaXMuX2lucHV0U291cmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIEZpbmdlciBpbmRleC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBmaW5nZXIgaXMgY2xvc2VkIGFuZCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmluZ2VySXNDbG9zZWQoaW5kZXgpIHtcbiAgICAgICAgY29uc3QgZmluZ2VyID0gdGhpcy5fZmluZ2Vyc1tpbmRleF07XG4gICAgICAgIHZlY0Euc3ViMihmaW5nZXIuam9pbnRzWzBdLl9sb2NhbFBvc2l0aW9uLCBmaW5nZXIuam9pbnRzWzFdLl9sb2NhbFBvc2l0aW9uKS5ub3JtYWxpemUoKTtcbiAgICAgICAgdmVjQi5zdWIyKGZpbmdlci5qb2ludHNbMl0uX2xvY2FsUG9zaXRpb24sIGZpbmdlci5qb2ludHNbM10uX2xvY2FsUG9zaXRpb24pLm5vcm1hbGl6ZSgpO1xuICAgICAgICByZXR1cm4gdmVjQS5kb3QodmVjQikgPCAtMC44O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgam9pbnQgYnkgWFJIYW5kIGlkIGZyb20gbGlzdCBpbiBzcGVjczogaHR0cHM6Ly9pbW1lcnNpdmUtd2ViLmdpdGh1Yi5pby93ZWJ4ci1oYW5kLWlucHV0Ly5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIElkIG9mIGEgam9pbnQgYmFzZWQgb24gc3BlY3MgSUQncyBpbiBYUkhhbmQ6IGh0dHBzOi8vaW1tZXJzaXZlLXdlYi5naXRodWIuaW8vd2VieHItaGFuZC1pbnB1dC8uXG4gICAgICogQHJldHVybnMge1hySm9pbnR8bnVsbH0gSm9pbnQgb3IgbnVsbCBpZiBub3QgYXZhaWxhYmxlLlxuICAgICAqL1xuICAgIGdldEpvaW50QnlJZChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fam9pbnRzQnlJZFtpZF0gfHwgbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGZpbmdlcnMgb2YgYSBoYW5kLlxuICAgICAqXG4gICAgICogQHR5cGUge1hyRmluZ2VyW119XG4gICAgICovXG4gICAgZ2V0IGZpbmdlcnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maW5nZXJzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2Ygam9pbnRzIG9mIGhhbmQuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7WHJKb2ludFtdfVxuICAgICAqL1xuICAgIGdldCBqb2ludHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9qb2ludHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTGlzdCBvZiBqb2ludHMgdGhhdCBhcmUgZmluZ2VydGlwcy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtYckpvaW50W119XG4gICAgICovXG4gICAgZ2V0IHRpcHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90aXBzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyaXN0IG9mIGEgaGFuZCwgb3IgbnVsbCBpZiBpdCBpcyBub3QgYXZhaWxhYmxlIGJ5IFdlYlhSIHVuZGVybHlpbmcgc3lzdGVtLlxuICAgICAqXG4gICAgICogQHR5cGUge1hySm9pbnR8bnVsbH1cbiAgICAgKi9cbiAgICBnZXQgd3Jpc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl93cmlzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcnVlIGlmIHRyYWNraW5nIGlzIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIHRyYWNraW5nIG1pZ2h0IGJlIGxvc3QuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBnZXQgdHJhY2tpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFja2luZztcbiAgICB9XG59XG5cbmV4cG9ydCB7IFhySGFuZCB9O1xuIl0sIm5hbWVzIjpbImZpbmdlckpvaW50SWRzIiwidmVjQSIsIlZlYzMiLCJ2ZWNCIiwidmVjQyIsInBsYXRmb3JtIiwiYnJvd3NlciIsIndpbmRvdyIsIlhSSGFuZCIsIlhySGFuZCIsIkV2ZW50SGFuZGxlciIsImNvbnN0cnVjdG9yIiwiaW5wdXRTb3VyY2UiLCJfbWFuYWdlciIsIl9pbnB1dFNvdXJjZSIsIl90cmFja2luZyIsIl9maW5nZXJzIiwiX2pvaW50cyIsIl9qb2ludHNCeUlkIiwiX3RpcHMiLCJfd3Jpc3QiLCJ4ckhhbmQiLCJfeHJJbnB1dFNvdXJjZSIsImhhbmQiLCJnZXQiLCJqb2ludCIsIlhySm9pbnQiLCJwdXNoIiwid3Jpc3QiLCJmIiwibGVuZ3RoIiwiZmluZ2VyIiwiWHJGaW5nZXIiLCJqIiwiam9pbnRJZCIsInRpcCIsIl90aXAiLCJ1cGRhdGUiLCJmcmFtZSIsInhySW5wdXRTb3VyY2UiLCJqb2ludFNwYWNlIiwiX2lkIiwicG9zZSIsInNlc3Npb24iLCJ2aXNpYmlsaXR5U3RhdGUiLCJnZXRKb2ludFBvc2UiLCJfcmVmZXJlbmNlU3BhY2UiLCJmaXJlIiwiajEiLCJqNCIsImo2IiwiajkiLCJqMTYiLCJqMjEiLCJfZGlydHlSYXkiLCJfcmF5TG9jYWwiLCJvcmlnaW4iLCJsZXJwIiwiX2xvY2FsUG9zaXRpb24iLCJqb2ludEwiLCJqb2ludFIiLCJoYW5kZWRuZXNzIiwiWFJIQU5EX0xFRlQiLCJ0Iiwic3ViMiIsImNyb3NzIiwibm9ybWFsaXplIiwic3ViIiwiZGlyZWN0aW9uIiwic3F1ZWV6aW5nIiwiX2ZpbmdlcklzQ2xvc2VkIiwiX3NxdWVlemluZyIsImlucHV0IiwiaW5kZXgiLCJqb2ludHMiLCJkb3QiLCJnZXRKb2ludEJ5SWQiLCJpZCIsImZpbmdlcnMiLCJ0aXBzIiwidHJhY2tpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQWFBLElBQUlBLGNBQWMsR0FBRyxFQUFFLENBQUE7QUFFdkIsTUFBTUMsSUFBSSxHQUFHLElBQUlDLElBQUksRUFBRSxDQUFBO0FBQ3ZCLE1BQU1DLElBQUksR0FBRyxJQUFJRCxJQUFJLEVBQUUsQ0FBQTtBQUN2QixNQUFNRSxJQUFJLEdBQUcsSUFBSUYsSUFBSSxFQUFFLENBQUE7QUFFdkIsSUFBSUcsUUFBUSxDQUFDQyxPQUFPLElBQUlDLE1BQU0sQ0FBQ0MsTUFBTSxFQUFFO0VBQ25DUixjQUFjLEdBQUcsQ0FDYixDQUFDLGtCQUFrQixFQUFFLHdCQUF3QixFQUFFLHNCQUFzQixFQUFFLFdBQVcsQ0FBQyxFQUNuRixDQUFDLHlCQUF5QixFQUFFLCtCQUErQixFQUFFLG1DQUFtQyxFQUFFLDZCQUE2QixFQUFFLGtCQUFrQixDQUFDLEVBQ3BKLENBQUMsMEJBQTBCLEVBQUUsZ0NBQWdDLEVBQUUsb0NBQW9DLEVBQUUsOEJBQThCLEVBQUUsbUJBQW1CLENBQUMsRUFDekosQ0FBQyx3QkFBd0IsRUFBRSw4QkFBOEIsRUFBRSxrQ0FBa0MsRUFBRSw0QkFBNEIsRUFBRSxpQkFBaUIsQ0FBQyxFQUMvSSxDQUFDLHlCQUF5QixFQUFFLCtCQUErQixFQUFFLG1DQUFtQyxFQUFFLDZCQUE2QixFQUFFLGtCQUFrQixDQUFDLENBQ3ZKLENBQUE7QUFDTCxDQUFBOztBQU9BLE1BQU1TLE1BQU0sU0FBU0MsWUFBWSxDQUFDOztFQXdEOUJDLFdBQVcsQ0FBQ0MsV0FBVyxFQUFFO0FBQ3JCLElBQUEsS0FBSyxFQUFFLENBQUE7QUFBQyxJQUFBLElB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
