/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../core/debug.js';
import { math } from '../../core/math/math.js';
import { Vec3 } from '../../core/math/vec3.js';
import { DISTANCE_INVERSE, DISTANCE_LINEAR, DISTANCE_EXPONENTIAL } from './constants.js';
import { hasAudioContext } from './capabilities.js';
import { Channel } from './channel.js';

// default maxDistance, same as Web Audio API
const MAX_DISTANCE = 10000;

/**
 * 3D audio channel.
 *
 * @ignore
 */
class Channel3d extends Channel {
  /**
   * Create a new Channel3d instance.
   *
   * @param {import('../sound/manager.js').SoundManager} manager - The SoundManager instance.
   * @param {import('../sound/sound.js').Sound} sound - The sound to playback.
   * @param {object} [options] - Optional options object.
   * @param {number} [options.volume=1] - The playback volume, between 0 and 1.
   * @param {number} [options.pitch=1] - The relative pitch, default of 1, plays at normal pitch.
   * @param {boolean} [options.loop=false] - Whether the sound should loop when it reaches the
   * end or not.
   */
  constructor(manager, sound, options) {
    super(manager, sound, options);
    this.position = new Vec3();
    this.velocity = new Vec3();
    if (hasAudioContext()) {
      this.panner = manager.context.createPanner();
    } else {
      this.maxDistance = MAX_DISTANCE;
      this.minDistance = 1;
      this.rollOffFactor = 1;
      this.distanceModel = DISTANCE_INVERSE;
    }
  }
  getPosition() {
    return this.position;
  }
  setPosition(position) {
    this.position.copy(position);
    const panner = this.panner;
    if ('positionX' in panner) {
      panner.positionX.value = position.x;
      panner.positionY.value = position.y;
      panner.positionZ.value = position.z;
    } else if (panner.setPosition) {
      // Firefox (and legacy browsers)
      panner.setPosition(position.x, position.y, position.z);
    }
  }
  getVelocity() {
    Debug.warn('Channel3d#getVelocity is not implemented.');
    return this.velocity;
  }
  setVelocity(velocity) {
    Debug.warn('Channel3d#setVelocity is not implemented.');
    this.velocity.copy(velocity);
  }
  getMaxDistance() {
    return this.panner.maxDistance;
  }
  setMaxDistance(max) {
    this.panner.maxDistance = max;
  }
  getMinDistance() {
    return this.panner.refDistance;
  }
  setMinDistance(min) {
    this.panner.refDistance = min;
  }
  getRollOffFactor() {
    return this.panner.rolloffFactor;
  }
  setRollOffFactor(factor) {
    this.panner.rolloffFactor = factor;
  }
  getDistanceModel() {
    return this.panner.distanceModel;
  }
  setDistanceModel(distanceModel) {
    this.panner.distanceModel = distanceModel;
  }

  /**
   * Create the buffer source and connect it up to the correct audio nodes.
   *
   * @private
   */
  _createSource() {
    const context = this.manager.context;
    this.source = context.createBufferSource();
    this.source.buffer = this.sound.buffer;

    // Connect up the nodes
    this.source.connect(this.panner);
    this.panner.connect(this.gain);
    this.gain.connect(context.destination);
    if (!this.loop) {
      // mark source as paused when it ends
      this.source.onended = this.pause.bind(this);
    }
  }
}
if (!hasAudioContext()) {
  // temp vector storage
  let offset = new Vec3();

  // Fall off function which should be the same as the one in the Web Audio API
  // Taken from https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/distanceModel
  const fallOff = function fallOff(posOne, posTwo, refDistance, maxDistance, rolloffFactor, distanceModel) {
    offset = offset.sub2(posOne, posTwo);
    const distance = offset.length();
    if (distance < refDistance) {
      return 1;
    } else if (distance > maxDistance) {
      return 0;
    }
    let result = 0;
    if (distanceModel === DISTANCE_LINEAR) {
      result = 1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance);
    } else if (distanceModel === DISTANCE_INVERSE) {
      result = refDistance / (refDistance + rolloffFactor * (distance - refDistance));
    } else if (distanceModel === DISTANCE_EXPONENTIAL) {
      result = Math.pow(distance / refDistance, -rolloffFactor);
    }
    return math.clamp(result, 0, 1);
  };
  Object.assign(Channel3d.prototype, {
    setPosition: function (position) {
      this.position.copy(position);
      if (this.source) {
        const listener = this.manager.listener;
        const lpos = listener.getPosition();
        const factor = fallOff(lpos, this.position, this.minDistance, this.maxDistance, this.rollOffFactor, this.distanceModel);
        const v = this.getVolume();
        this.source.volume = v * factor;
      }
    },
    getMaxDistance: function () {
      return this.maxDistance;
    },
    setMaxDistance: function (max) {
      this.maxDistance = max;
    },
    getMinDistance: function () {
      return this.minDistance;
    },
    setMinDistance: function (min) {
      this.minDistance = min;
    },
    getRollOffFactor: function () {
      return this.rollOffFactor;
    },
    setRollOffFactor: function (factor) {
      this.rollOffFactor = factor;
    },
    getDistanceModel: function () {
      return this.distanceModel;
    },
    setDistanceModel: function (distanceModel) {
      this.distanceModel = distanceModel;
    }
  });
}

export { Channel3d };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbDNkLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcGxhdGZvcm0vYXVkaW8vY2hhbm5lbDNkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERlYnVnIH0gZnJvbSAnLi4vLi4vY29yZS9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBtYXRoIH0gZnJvbSAnLi4vLi4vY29yZS9tYXRoL21hdGguanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uLy4uL2NvcmUvbWF0aC92ZWMzLmpzJztcblxuaW1wb3J0IHsgRElTVEFOQ0VfRVhQT05FTlRJQUwsIERJU1RBTkNFX0lOVkVSU0UsIERJU1RBTkNFX0xJTkVBUiB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGhhc0F1ZGlvQ29udGV4dCB9IGZyb20gJy4vY2FwYWJpbGl0aWVzLmpzJztcbmltcG9ydCB7IENoYW5uZWwgfSBmcm9tICcuL2NoYW5uZWwuanMnO1xuXG4vLyBkZWZhdWx0IG1heERpc3RhbmNlLCBzYW1lIGFzIFdlYiBBdWRpbyBBUElcbmNvbnN0IE1BWF9ESVNUQU5DRSA9IDEwMDAwO1xuXG4vKipcbiAqIDNEIGF1ZGlvIGNoYW5uZWwuXG4gKlxuICogQGlnbm9yZVxuICovXG5jbGFzcyBDaGFubmVsM2QgZXh0ZW5kcyBDaGFubmVsIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgQ2hhbm5lbDNkIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4uL3NvdW5kL21hbmFnZXIuanMnKS5Tb3VuZE1hbmFnZXJ9IG1hbmFnZXIgLSBUaGUgU291bmRNYW5hZ2VyIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi9zb3VuZC9zb3VuZC5qcycpLlNvdW5kfSBzb3VuZCAtIFRoZSBzb3VuZCB0byBwbGF5YmFjay5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIC0gT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnZvbHVtZT0xXSAtIFRoZSBwbGF5YmFjayB2b2x1bWUsIGJldHdlZW4gMCBhbmQgMS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGl0Y2g9MV0gLSBUaGUgcmVsYXRpdmUgcGl0Y2gsIGRlZmF1bHQgb2YgMSwgcGxheXMgYXQgbm9ybWFsIHBpdGNoLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubG9vcD1mYWxzZV0gLSBXaGV0aGVyIHRoZSBzb3VuZCBzaG91bGQgbG9vcCB3aGVuIGl0IHJlYWNoZXMgdGhlXG4gICAgICogZW5kIG9yIG5vdC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtYW5hZ2VyLCBzb3VuZCwgb3B0aW9ucykge1xuICAgICAgICBzdXBlcihtYW5hZ2VyLCBzb3VuZCwgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBuZXcgVmVjMygpO1xuXG4gICAgICAgIGlmIChoYXNBdWRpb0NvbnRleHQoKSkge1xuICAgICAgICAgICAgdGhpcy5wYW5uZXIgPSBtYW5hZ2VyLmNvbnRleHQuY3JlYXRlUGFubmVyKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1heERpc3RhbmNlID0gTUFYX0RJU1RBTkNFO1xuICAgICAgICAgICAgdGhpcy5taW5EaXN0YW5jZSA9IDE7XG4gICAgICAgICAgICB0aGlzLnJvbGxPZmZGYWN0b3IgPSAxO1xuICAgICAgICAgICAgdGhpcy5kaXN0YW5jZU1vZGVsID0gRElTVEFOQ0VfSU5WRVJTRTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFBvc2l0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbjtcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgICAgICB0aGlzLnBvc2l0aW9uLmNvcHkocG9zaXRpb24pO1xuICAgICAgICBjb25zdCBwYW5uZXIgPSB0aGlzLnBhbm5lcjtcbiAgICAgICAgaWYgKCdwb3NpdGlvblgnIGluIHBhbm5lcikge1xuICAgICAgICAgICAgcGFubmVyLnBvc2l0aW9uWC52YWx1ZSA9IHBvc2l0aW9uLng7XG4gICAgICAgICAgICBwYW5uZXIucG9zaXRpb25ZLnZhbHVlID0gcG9zaXRpb24ueTtcbiAgICAgICAgICAgIHBhbm5lci5wb3NpdGlvbloudmFsdWUgPSBwb3NpdGlvbi56O1xuICAgICAgICB9IGVsc2UgaWYgKHBhbm5lci5zZXRQb3NpdGlvbikgeyAvLyBGaXJlZm94IChhbmQgbGVnYWN5IGJyb3dzZXJzKVxuICAgICAgICAgICAgcGFubmVyLnNldFBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIHBvc2l0aW9uLnopO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0VmVsb2NpdHkoKSB7XG4gICAgICAgIERlYnVnLndhcm4oJ0NoYW5uZWwzZCNnZXRWZWxvY2l0eSBpcyBub3QgaW1wbGVtZW50ZWQuJyk7XG4gICAgICAgIHJldHVybiB0aGlzLnZlbG9jaXR5O1xuICAgIH1cblxuICAgIHNldFZlbG9jaXR5KHZlbG9jaXR5KSB7XG4gICAgICAgIERlYnVnLndhcm4oJ0NoYW5uZWwzZCNzZXRWZWxvY2l0eSBpcyBub3QgaW1wbGVtZW50ZWQuJyk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkuY29weSh2ZWxvY2l0eSk7XG4gICAgfVxuXG4gICAgZ2V0TWF4RGlzdGFuY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhbm5lci5tYXhEaXN0YW5jZTtcbiAgICB9XG5cbiAgICBzZXRNYXhEaXN0YW5jZShtYXgpIHtcbiAgICAgICAgdGhpcy5wYW5uZXIubWF4RGlzdGFuY2UgPSBtYXg7XG4gICAgfVxuXG4gICAgZ2V0TWluRGlzdGFuY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhbm5lci5yZWZEaXN0YW5jZTtcbiAgICB9XG5cbiAgICBzZXRNaW5EaXN0YW5jZShtaW4pIHtcbiAgICAgICAgdGhpcy5wYW5uZXIucmVmRGlzdGFuY2UgPSBtaW47XG4gICAgfVxuXG4gICAgZ2V0Um9sbE9mZkZhY3RvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFubmVyLnJvbGxvZmZGYWN0b3I7XG4gICAgfVxuXG4gICAgc2V0Um9sbE9mZkZhY3RvcihmYWN0b3IpIHtcbiAgICAgICAgdGhpcy5wYW5uZXIucm9sbG9mZkZhY3RvciA9IGZhY3RvcjtcbiAgICB9XG5cbiAgICBnZXREaXN0YW5jZU1vZGVsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYW5uZXIuZGlzdGFuY2VNb2RlbDtcbiAgICB9XG5cbiAgICBzZXREaXN0YW5jZU1vZGVsKGRpc3RhbmNlTW9kZWwpIHtcbiAgICAgICAgdGhpcy5wYW5uZXIuZGlzdGFuY2VNb2RlbCA9IGRpc3RhbmNlTW9kZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRoZSBidWZmZXIgc291cmNlIGFuZCBjb25uZWN0IGl0IHVwIHRvIHRoZSBjb3JyZWN0IGF1ZGlvIG5vZGVzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlU291cmNlKCkge1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5tYW5hZ2VyLmNvbnRleHQ7XG5cbiAgICAgICAgdGhpcy5zb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICB0aGlzLnNvdXJjZS5idWZmZXIgPSB0aGlzLnNvdW5kLmJ1ZmZlcjtcblxuICAgICAgICAvLyBDb25uZWN0IHVwIHRoZSBub2Rlc1xuICAgICAgICB0aGlzLnNvdXJjZS5jb25uZWN0KHRoaXMucGFubmVyKTtcbiAgICAgICAgdGhpcy5wYW5uZXIuY29ubmVjdCh0aGlzLmdhaW4pO1xuICAgICAgICB0aGlzLmdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcblxuICAgICAgICBpZiAoIXRoaXMubG9vcCkge1xuICAgICAgICAgICAgLy8gbWFyayBzb3VyY2UgYXMgcGF1c2VkIHdoZW4gaXQgZW5kc1xuICAgICAgICAgICAgdGhpcy5zb3VyY2Uub25lbmRlZCA9IHRoaXMucGF1c2UuYmluZCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuaWYgKCFoYXNBdWRpb0NvbnRleHQoKSkge1xuICAgIC8vIHRlbXAgdmVjdG9yIHN0b3JhZ2VcbiAgICBsZXQgb2Zmc2V0ID0gbmV3IFZlYzMoKTtcblxuICAgIC8vIEZhbGwgb2ZmIGZ1bmN0aW9uIHdoaWNoIHNob3VsZCBiZSB0aGUgc2FtZSBhcyB0aGUgb25lIGluIHRoZSBXZWIgQXVkaW8gQVBJXG4gICAgLy8gVGFrZW4gZnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUGFubmVyTm9kZS9kaXN0YW5jZU1vZGVsXG4gICAgY29uc3QgZmFsbE9mZiA9IGZ1bmN0aW9uIChwb3NPbmUsIHBvc1R3bywgcmVmRGlzdGFuY2UsIG1heERpc3RhbmNlLCByb2xsb2ZmRmFjdG9yLCBkaXN0YW5jZU1vZGVsKSB7XG4gICAgICAgIG9mZnNldCA9IG9mZnNldC5zdWIyKHBvc09uZSwgcG9zVHdvKTtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBvZmZzZXQubGVuZ3RoKCk7XG5cbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgcmVmRGlzdGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgICAgIGlmIChkaXN0YW5jZU1vZGVsID09PSBESVNUQU5DRV9MSU5FQVIpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IDEgLSByb2xsb2ZmRmFjdG9yICogKGRpc3RhbmNlIC0gcmVmRGlzdGFuY2UpIC8gKG1heERpc3RhbmNlIC0gcmVmRGlzdGFuY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGRpc3RhbmNlTW9kZWwgPT09IERJU1RBTkNFX0lOVkVSU0UpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlZkRpc3RhbmNlIC8gKHJlZkRpc3RhbmNlICsgcm9sbG9mZkZhY3RvciAqIChkaXN0YW5jZSAtIHJlZkRpc3RhbmNlKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlzdGFuY2VNb2RlbCA9PT0gRElTVEFOQ0VfRVhQT05FTlRJQUwpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IE1hdGgucG93KGRpc3RhbmNlIC8gcmVmRGlzdGFuY2UsIC1yb2xsb2ZmRmFjdG9yKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF0aC5jbGFtcChyZXN1bHQsIDAsIDEpO1xuICAgIH07XG5cbiAgICBPYmplY3QuYXNzaWduKENoYW5uZWwzZC5wcm90b3R5cGUsIHtcbiAgICAgICAgc2V0UG9zaXRpb246IGZ1bmN0aW9uIChwb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc291cmNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLm1hbmFnZXIubGlzdGVuZXI7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBscG9zID0gbGlzdGVuZXIuZ2V0UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGZhY3RvciA9IGZhbGxPZmYobHBvcywgdGhpcy5wb3NpdGlvbiwgdGhpcy5taW5EaXN0YW5jZSwgdGhpcy5tYXhEaXN0YW5jZSwgdGhpcy5yb2xsT2ZmRmFjdG9yLCB0aGlzLmRpc3RhbmNlTW9kZWwpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMuZ2V0Vm9sdW1lKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2Uudm9sdW1lID0gdiAqIGZhY3RvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRNYXhEaXN0YW5jZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4RGlzdGFuY2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0TWF4RGlzdGFuY2U6IGZ1bmN0aW9uIChtYXgpIHtcbiAgICAgICAgICAgIHRoaXMubWF4RGlzdGFuY2UgPSBtYXg7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TWluRGlzdGFuY2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1pbkRpc3RhbmNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldE1pbkRpc3RhbmNlOiBmdW5jdGlvbiAobWluKSB7XG4gICAgICAgICAgICB0aGlzLm1pbkRpc3RhbmNlID0gbWluO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFJvbGxPZmZGYWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJvbGxPZmZGYWN0b3I7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0Um9sbE9mZkZhY3RvcjogZnVuY3Rpb24gKGZhY3Rvcikge1xuICAgICAgICAgICAgdGhpcy5yb2xsT2ZmRmFjdG9yID0gZmFjdG9yO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERpc3RhbmNlTW9kZWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlTW9kZWw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RGlzdGFuY2VNb2RlbDogZnVuY3Rpb24gKGRpc3RhbmNlTW9kZWwpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzdGFuY2VNb2RlbCA9IGRpc3RhbmNlTW9kZWw7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZXhwb3J0IHsgQ2hhbm5lbDNkIH07XG4iXSwibmFtZXMiOlsiTUFYX0RJU1RBTkNFIiwiQ2hhbm5lbDNkIiwiQ2hhbm5lbCIsImNvbnN0cnVjdG9yIiwibWFuYWdlciIsInNvdW5kIiwib3B0aW9ucyIsInBvc2l0aW9uIiwiVmVjMyIsInZlbG9jaXR5IiwiaGFzQXVkaW9Db250ZXh0IiwicGFubmVyIiwiY29udGV4dCIsImNyZWF0ZVBhbm5lciIsIm1heERpc3RhbmNlIiwibWluRGlzdGFuY2UiLCJyb2xsT2ZmRmFjdG9yIiwiZGlzdGFuY2VNb2RlbCIsIkRJU1RBTkNFX0lOVkVSU0UiLCJnZXRQb3NpdGlvbiIsInNldFBvc2l0aW9uIiwiY29weSIsInBvc2l0aW9uWCIsInZhbHVlIiwieCIsInBvc2l0aW9uWSIsInkiLCJwb3NpdGlvbloiLCJ6IiwiZ2V0VmVsb2NpdHkiLCJEZWJ1ZyIsIndhcm4iLCJzZXRWZWxvY2l0eSIsImdldE1heERpc3RhbmNlIiwic2V0TWF4RGlzdGFuY2UiLCJtYXgiLCJnZXRNaW5EaXN0YW5jZSIsInJlZkRpc3RhbmNlIiwic2V0TWluRGlzdGFuY2UiLCJtaW4iLCJnZXRSb2xsT2ZmRmFjdG9yIiwicm9sbG9mZkZhY3RvciIsInNldFJvbGxPZmZGYWN0b3IiLCJmYWN0b3IiLCJnZXREaXN0YW5jZU1vZGVsIiwic2V0RGlzdGFuY2VNb2RlbCIsIl9jcmVhdGVTb3VyY2UiLCJzb3VyY2UiLCJjcmVhdGVCdWZmZXJTb3VyY2UiLCJidWZmZXIiLCJjb25uZWN0IiwiZ2FpbiIsImRlc3RpbmF0aW9uIiwibG9vcCIsIm9uZW5kZWQiLCJwYXVzZSIsImJpbmQiLCJvZmZzZXQiLCJmYWxsT2ZmIiwicG9zT25lIiwicG9zVHdvIiwic3ViMiIsImRpc3RhbmNlIiwibGVuZ3RoIiwicmVzdWx0IiwiRElTVEFOQ0VfTElORUFSIiwiRElTVEFOQ0VfRVhQT05FTlRJQUwiLCJNYXRoIiwicG93IiwibWF0aCIsImNsYW1wIiwiT2JqZWN0IiwiYXNzaWduIiwicHJvdG90eXBlIiwibGlzdGVuZXIiLCJscG9zIiwidiIsImdldFZvbHVtZSIsInZvbHVtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUE7QUFDQSxNQUFNQSxZQUFZLEdBQUcsS0FBSyxDQUFBOztBQUUxQjtBQUNB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
