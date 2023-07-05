import { Debug } from '../../core/debug.js';
import { math } from '../../core/math/math.js';
import { Vec3 } from '../../core/math/vec3.js';
import { DISTANCE_LINEAR, DISTANCE_INVERSE, DISTANCE_EXPONENTIAL } from '../audio/constants.js';
import { hasAudioContext } from '../audio/capabilities.js';
import { SoundInstance } from './instance.js';

// default maxDistance, same as Web Audio API
const MAX_DISTANCE = 10000;

/**
 * A SoundInstance3d plays a {@link Sound} in 3D.
 *
 * @augments SoundInstance
 */
class SoundInstance3d extends SoundInstance {
  /**
   * Create a new SoundInstance3d instance.
   *
   * @param {import('./manager.js').SoundManager} manager - The sound manager.
   * @param {import('./sound.js').Sound} sound - The sound to play.
   * @param {object} options - Options for the instance.
   * @param {number} [options.volume=1] - The playback volume, between 0 and 1.
   * @param {number} [options.pitch=1] - The relative pitch, default of 1, plays at normal pitch.
   * @param {boolean} [options.loop=false] - Whether the sound should loop when it reaches the
   * end or not.
   * @param {number} [options.startTime=0] - The time from which the playback will start. Default
   * is 0 to start at the beginning.
   * @param {number} [options.duration=null] - The total time after the startTime when playback
   * will stop or restart if loop is true.
   * @param {Vec3} [options.position=null] - The position of the sound in 3D space.
   * @param {string} [options.distanceModel=DISTANCE_LINEAR] - Determines which algorithm to use
   * to reduce the volume of the audio as it moves away from the listener. Can be:
   *
   * - {@link DISTANCE_LINEAR}
   * - {@link DISTANCE_INVERSE}
   * - {@link DISTANCE_EXPONENTIAL}
   *
   * Default is {@link DISTANCE_LINEAR}.
   * @param {number} [options.refDistance=1] - The reference distance for reducing volume as the
   * sound source moves further from the listener.
   * @param {number} [options.maxDistance=10000] - The maximum distance from the listener at which
   * audio falloff stops. Note the volume of the audio is not 0 after this distance, but just
   * doesn't fall off anymore.
   * @param {number} [options.rollOffFactor=1] - The factor used in the falloff equation.
   */
  constructor(manager, sound, options = {}) {
    super(manager, sound, options);
    /**
     * @type {Vec3}
     * @private
     */
    this._position = new Vec3();
    /**
     * @type {Vec3}
     * @private
     */
    this._velocity = new Vec3();
    if (options.position) this.position = options.position;
    this.maxDistance = options.maxDistance !== undefined ? Number(options.maxDistance) : MAX_DISTANCE;
    this.refDistance = options.refDistance !== undefined ? Number(options.refDistance) : 1;
    this.rollOffFactor = options.rollOffFactor !== undefined ? Number(options.rollOffFactor) : 1;
    this.distanceModel = options.distanceModel !== undefined ? options.distanceModel : DISTANCE_LINEAR;
  }

  /**
   * Allocate Web Audio resources for this instance.
   *
   * @private
   */
  _initializeNodes() {
    this.gain = this._manager.context.createGain();
    this.panner = this._manager.context.createPanner();
    this.panner.connect(this.gain);
    this._inputNode = this.panner;
    this._connectorNode = this.gain;
    this._connectorNode.connect(this._manager.context.destination);
  }

  /**
   * The position of the sound in 3D space.
   *
   * @type {Vec3}
   */
  set position(value) {
    this._position.copy(value);
    const panner = this.panner;
    if ('positionX' in panner) {
      panner.positionX.value = value.x;
      panner.positionY.value = value.y;
      panner.positionZ.value = value.z;
    } else if (panner.setPosition) {
      // Firefox (and legacy browsers)
      panner.setPosition(value.x, value.y, value.z);
    }
  }
  get position() {
    return this._position;
  }

  /**
   * The velocity of the sound.
   *
   * @type {Vec3}
   * @deprecated
   * @ignore
   */
  set velocity(velocity) {
    Debug.warn('SoundInstance3d#velocity is not implemented.');
    this._velocity.copy(velocity);
  }
  get velocity() {
    Debug.warn('SoundInstance3d#velocity is not implemented.');
    return this._velocity;
  }

  /**
   * The maximum distance from the listener at which audio falloff stops. Note the volume of the
   * audio is not 0 after this distance, but just doesn't fall off anymore.
   *
   * @type {number}
   */
  set maxDistance(value) {
    this.panner.maxDistance = value;
  }
  get maxDistance() {
    return this.panner.maxDistance;
  }

  /**
   * The reference distance for reducing volume as the sound source moves further from the
   * listener.
   *
   * @type {number}
   */
  set refDistance(value) {
    this.panner.refDistance = value;
  }
  get refDistance() {
    return this.panner.refDistance;
  }

  /**
   * The factor used in the falloff equation.
   *
   * @type {number}
   */
  set rollOffFactor(value) {
    this.panner.rolloffFactor = value;
  }
  get rollOffFactor() {
    return this.panner.rolloffFactor;
  }

  /**
   * Determines which algorithm to use to reduce the volume of the audio as it moves away from
   * the listener. Can be:
   *
   * - {@link DISTANCE_LINEAR}
   * - {@link DISTANCE_INVERSE}
   * - {@link DISTANCE_EXPONENTIAL}
   *
   * Default is {@link DISTANCE_LINEAR}.
   *
   * @type {string}
   */
  set distanceModel(value) {
    this.panner.distanceModel = value;
  }
  get distanceModel() {
    return this.panner.distanceModel;
  }
}
if (!hasAudioContext()) {
  // temp vector storage
  let offset = new Vec3();

  // Fall off function which should be the same as the one in the Web Audio API
  // Taken from https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/distanceModel
  const fallOff = function fallOff(posOne, posTwo, refDistance, maxDistance, rollOffFactor, distanceModel) {
    offset = offset.sub2(posOne, posTwo);
    const distance = offset.length();
    if (distance < refDistance) {
      return 1;
    } else if (distance > maxDistance) {
      return 0;
    }
    let result = 0;
    if (distanceModel === DISTANCE_LINEAR) {
      result = 1 - rollOffFactor * (distance - refDistance) / (maxDistance - refDistance);
    } else if (distanceModel === DISTANCE_INVERSE) {
      result = refDistance / (refDistance + rollOffFactor * (distance - refDistance));
    } else if (distanceModel === DISTANCE_EXPONENTIAL) {
      result = Math.pow(distance / refDistance, -rollOffFactor);
    }
    return math.clamp(result, 0, 1);
  };
  Object.defineProperty(SoundInstance3d.prototype, 'position', {
    get: function () {
      return this._position;
    },
    set: function (position) {
      this._position.copy(position);
      if (this.source) {
        const listener = this._manager.listener;
        const lpos = listener.getPosition();
        const factor = fallOff(lpos, this._position, this.refDistance, this.maxDistance, this.rollOffFactor, this.distanceModel);
        const v = this.volume;
        this.source.volume = v * factor * this._manager.volume;
      }
    }
  });
  Object.defineProperty(SoundInstance3d.prototype, 'maxDistance', {
    get: function () {
      return this._maxDistance;
    },
    set: function (value) {
      this._maxDistance = value;
    }
  });
  Object.defineProperty(SoundInstance3d.prototype, 'refDistance', {
    get: function () {
      return this._refDistance;
    },
    set: function (value) {
      this._refDistance = value;
    }
  });
  Object.defineProperty(SoundInstance3d.prototype, 'rollOffFactor', {
    get: function () {
      return this._rollOffFactor;
    },
    set: function (value) {
      this._rollOffFactor = value;
    }
  });
  Object.defineProperty(SoundInstance3d.prototype, 'distanceModel', {
    get: function () {
      return this._distanceModel;
    },
    set: function (value) {
      this._distanceModel = value;
    }
  });
}

export { SoundInstance3d };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFuY2UzZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3BsYXRmb3JtL3NvdW5kL2luc3RhbmNlM2QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGVidWcgfSBmcm9tICcuLi8uLi9jb3JlL2RlYnVnLmpzJztcbmltcG9ydCB7IG1hdGggfSBmcm9tICcuLi8uLi9jb3JlL21hdGgvbWF0aC5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vLi4vY29yZS9tYXRoL3ZlYzMuanMnO1xuXG5pbXBvcnQgeyBESVNUQU5DRV9FWFBPTkVOVElBTCwgRElTVEFOQ0VfSU5WRVJTRSwgRElTVEFOQ0VfTElORUFSIH0gZnJvbSAnLi4vYXVkaW8vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGhhc0F1ZGlvQ29udGV4dCB9IGZyb20gJy4uL2F1ZGlvL2NhcGFiaWxpdGllcy5qcyc7XG5cbmltcG9ydCB7IFNvdW5kSW5zdGFuY2UgfSBmcm9tICcuL2luc3RhbmNlLmpzJztcblxuLy8gZGVmYXVsdCBtYXhEaXN0YW5jZSwgc2FtZSBhcyBXZWIgQXVkaW8gQVBJXG5jb25zdCBNQVhfRElTVEFOQ0UgPSAxMDAwMDtcblxuLyoqXG4gKiBBIFNvdW5kSW5zdGFuY2UzZCBwbGF5cyBhIHtAbGluayBTb3VuZH0gaW4gM0QuXG4gKlxuICogQGF1Z21lbnRzIFNvdW5kSW5zdGFuY2VcbiAqL1xuY2xhc3MgU291bmRJbnN0YW5jZTNkIGV4dGVuZHMgU291bmRJbnN0YW5jZSB7XG4gICAgLyoqXG4gICAgICogQHR5cGUge1ZlYzN9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcG9zaXRpb24gPSBuZXcgVmVjMygpO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1ZlYzN9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdmVsb2NpdHkgPSBuZXcgVmVjMygpO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IFNvdW5kSW5zdGFuY2UzZCBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuL21hbmFnZXIuanMnKS5Tb3VuZE1hbmFnZXJ9IG1hbmFnZXIgLSBUaGUgc291bmQgbWFuYWdlci5cbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi9zb3VuZC5qcycpLlNvdW5kfSBzb3VuZCAtIFRoZSBzb3VuZCB0byBwbGF5LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy52b2x1bWU9MV0gLSBUaGUgcGxheWJhY2sgdm9sdW1lLCBiZXR3ZWVuIDAgYW5kIDEuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBpdGNoPTFdIC0gVGhlIHJlbGF0aXZlIHBpdGNoLCBkZWZhdWx0IG9mIDEsIHBsYXlzIGF0IG5vcm1hbCBwaXRjaC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxvb3A9ZmFsc2VdIC0gV2hldGhlciB0aGUgc291bmQgc2hvdWxkIGxvb3Agd2hlbiBpdCByZWFjaGVzIHRoZVxuICAgICAqIGVuZCBvciBub3QuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnN0YXJ0VGltZT0wXSAtIFRoZSB0aW1lIGZyb20gd2hpY2ggdGhlIHBsYXliYWNrIHdpbGwgc3RhcnQuIERlZmF1bHRcbiAgICAgKiBpcyAwIHRvIHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmR1cmF0aW9uPW51bGxdIC0gVGhlIHRvdGFsIHRpbWUgYWZ0ZXIgdGhlIHN0YXJ0VGltZSB3aGVuIHBsYXliYWNrXG4gICAgICogd2lsbCBzdG9wIG9yIHJlc3RhcnQgaWYgbG9vcCBpcyB0cnVlLlxuICAgICAqIEBwYXJhbSB7VmVjM30gW29wdGlvbnMucG9zaXRpb249bnVsbF0gLSBUaGUgcG9zaXRpb24gb2YgdGhlIHNvdW5kIGluIDNEIHNwYWNlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXN0YW5jZU1vZGVsPURJU1RBTkNFX0xJTkVBUl0gLSBEZXRlcm1pbmVzIHdoaWNoIGFsZ29yaXRobSB0byB1c2VcbiAgICAgKiB0byByZWR1Y2UgdGhlIHZvbHVtZSBvZiB0aGUgYXVkaW8gYXMgaXQgbW92ZXMgYXdheSBmcm9tIHRoZSBsaXN0ZW5lci4gQ2FuIGJlOlxuICAgICAqXG4gICAgICogLSB7QGxpbmsgRElTVEFOQ0VfTElORUFSfVxuICAgICAqIC0ge0BsaW5rIERJU1RBTkNFX0lOVkVSU0V9XG4gICAgICogLSB7QGxpbmsgRElTVEFOQ0VfRVhQT05FTlRJQUx9XG4gICAgICpcbiAgICAgKiBEZWZhdWx0IGlzIHtAbGluayBESVNUQU5DRV9MSU5FQVJ9LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yZWZEaXN0YW5jZT0xXSAtIFRoZSByZWZlcmVuY2UgZGlzdGFuY2UgZm9yIHJlZHVjaW5nIHZvbHVtZSBhcyB0aGVcbiAgICAgKiBzb3VuZCBzb3VyY2UgbW92ZXMgZnVydGhlciBmcm9tIHRoZSBsaXN0ZW5lci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4RGlzdGFuY2U9MTAwMDBdIC0gVGhlIG1heGltdW0gZGlzdGFuY2UgZnJvbSB0aGUgbGlzdGVuZXIgYXQgd2hpY2hcbiAgICAgKiBhdWRpbyBmYWxsb2ZmIHN0b3BzLiBOb3RlIHRoZSB2b2x1bWUgb2YgdGhlIGF1ZGlvIGlzIG5vdCAwIGFmdGVyIHRoaXMgZGlzdGFuY2UsIGJ1dCBqdXN0XG4gICAgICogZG9lc24ndCBmYWxsIG9mZiBhbnltb3JlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yb2xsT2ZmRmFjdG9yPTFdIC0gVGhlIGZhY3RvciB1c2VkIGluIHRoZSBmYWxsb2ZmIGVxdWF0aW9uLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1hbmFnZXIsIHNvdW5kLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgc3VwZXIobWFuYWdlciwgc291bmQsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnBvc2l0aW9uKVxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG9wdGlvbnMucG9zaXRpb247XG5cbiAgICAgICAgdGhpcy5tYXhEaXN0YW5jZSA9IG9wdGlvbnMubWF4RGlzdGFuY2UgIT09IHVuZGVmaW5lZCA/IE51bWJlcihvcHRpb25zLm1heERpc3RhbmNlKSA6IE1BWF9ESVNUQU5DRTtcbiAgICAgICAgdGhpcy5yZWZEaXN0YW5jZSA9IG9wdGlvbnMucmVmRGlzdGFuY2UgIT09IHVuZGVmaW5lZCA/IE51bWJlcihvcHRpb25zLnJlZkRpc3RhbmNlKSA6IDE7XG4gICAgICAgIHRoaXMucm9sbE9mZkZhY3RvciA9IG9wdGlvbnMucm9sbE9mZkZhY3RvciAhPT0gdW5kZWZpbmVkID8gTnVtYmVyKG9wdGlvbnMucm9sbE9mZkZhY3RvcikgOiAxO1xuICAgICAgICB0aGlzLmRpc3RhbmNlTW9kZWwgPSBvcHRpb25zLmRpc3RhbmNlTW9kZWwgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuZGlzdGFuY2VNb2RlbCA6IERJU1RBTkNFX0xJTkVBUjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbGxvY2F0ZSBXZWIgQXVkaW8gcmVzb3VyY2VzIGZvciB0aGlzIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdGlhbGl6ZU5vZGVzKCkge1xuICAgICAgICB0aGlzLmdhaW4gPSB0aGlzLl9tYW5hZ2VyLmNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB0aGlzLnBhbm5lciA9IHRoaXMuX21hbmFnZXIuY29udGV4dC5jcmVhdGVQYW5uZXIoKTtcbiAgICAgICAgdGhpcy5wYW5uZXIuY29ubmVjdCh0aGlzLmdhaW4pO1xuICAgICAgICB0aGlzLl9pbnB1dE5vZGUgPSB0aGlzLnBhbm5lcjtcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yTm9kZSA9IHRoaXMuZ2FpbjtcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yTm9kZS5jb25uZWN0KHRoaXMuX21hbmFnZXIuY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIHBvc2l0aW9uIG9mIHRoZSBzb3VuZCBpbiAzRCBzcGFjZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtWZWMzfVxuICAgICAqL1xuICAgIHNldCBwb3NpdGlvbih2YWx1ZSkge1xuICAgICAgICB0aGlzLl9wb3NpdGlvbi5jb3B5KHZhbHVlKTtcbiAgICAgICAgY29uc3QgcGFubmVyID0gdGhpcy5wYW5uZXI7XG4gICAgICAgIGlmICgncG9zaXRpb25YJyBpbiBwYW5uZXIpIHtcbiAgICAgICAgICAgIHBhbm5lci5wb3NpdGlvblgudmFsdWUgPSB2YWx1ZS54O1xuICAgICAgICAgICAgcGFubmVyLnBvc2l0aW9uWS52YWx1ZSA9IHZhbHVlLnk7XG4gICAgICAgICAgICBwYW5uZXIucG9zaXRpb25aLnZhbHVlID0gdmFsdWUuejtcbiAgICAgICAgfSBlbHNlIGlmIChwYW5uZXIuc2V0UG9zaXRpb24pIHsgLy8gRmlyZWZveCAoYW5kIGxlZ2FjeSBicm93c2VycylcbiAgICAgICAgICAgIHBhbm5lci5zZXRQb3NpdGlvbih2YWx1ZS54LCB2YWx1ZS55LCB2YWx1ZS56KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBwb3NpdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSB2ZWxvY2l0eSBvZiB0aGUgc291bmQuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7VmVjM31cbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBzZXQgdmVsb2NpdHkodmVsb2NpdHkpIHtcbiAgICAgICAgRGVidWcud2FybignU291bmRJbnN0YW5jZTNkI3ZlbG9jaXR5IGlzIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgICAgICAgdGhpcy5fdmVsb2NpdHkuY29weSh2ZWxvY2l0eSk7XG4gICAgfVxuXG4gICAgZ2V0IHZlbG9jaXR5KCkge1xuICAgICAgICBEZWJ1Zy53YXJuKCdTb3VuZEluc3RhbmNlM2QjdmVsb2NpdHkgaXMgbm90IGltcGxlbWVudGVkLicpO1xuICAgICAgICByZXR1cm4gdGhpcy5fdmVsb2NpdHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIG1heGltdW0gZGlzdGFuY2UgZnJvbSB0aGUgbGlzdGVuZXIgYXQgd2hpY2ggYXVkaW8gZmFsbG9mZiBzdG9wcy4gTm90ZSB0aGUgdm9sdW1lIG9mIHRoZVxuICAgICAqIGF1ZGlvIGlzIG5vdCAwIGFmdGVyIHRoaXMgZGlzdGFuY2UsIGJ1dCBqdXN0IGRvZXNuJ3QgZmFsbCBvZmYgYW55bW9yZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgc2V0IG1heERpc3RhbmNlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFubmVyLm1heERpc3RhbmNlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IG1heERpc3RhbmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYW5uZXIubWF4RGlzdGFuY2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIHJlZmVyZW5jZSBkaXN0YW5jZSBmb3IgcmVkdWNpbmcgdm9sdW1lIGFzIHRoZSBzb3VuZCBzb3VyY2UgbW92ZXMgZnVydGhlciBmcm9tIHRoZVxuICAgICAqIGxpc3RlbmVyLlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBzZXQgcmVmRGlzdGFuY2UodmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYW5uZXIucmVmRGlzdGFuY2UgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgcmVmRGlzdGFuY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhbm5lci5yZWZEaXN0YW5jZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZmFjdG9yIHVzZWQgaW4gdGhlIGZhbGxvZmYgZXF1YXRpb24uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHNldCByb2xsT2ZmRmFjdG9yKHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFubmVyLnJvbGxvZmZGYWN0b3IgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgcm9sbE9mZkZhY3RvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFubmVyLnJvbGxvZmZGYWN0b3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGljaCBhbGdvcml0aG0gdG8gdXNlIHRvIHJlZHVjZSB0aGUgdm9sdW1lIG9mIHRoZSBhdWRpbyBhcyBpdCBtb3ZlcyBhd2F5IGZyb21cbiAgICAgKiB0aGUgbGlzdGVuZXIuIENhbiBiZTpcbiAgICAgKlxuICAgICAqIC0ge0BsaW5rIERJU1RBTkNFX0xJTkVBUn1cbiAgICAgKiAtIHtAbGluayBESVNUQU5DRV9JTlZFUlNFfVxuICAgICAqIC0ge0BsaW5rIERJU1RBTkNFX0VYUE9ORU5USUFMfVxuICAgICAqXG4gICAgICogRGVmYXVsdCBpcyB7QGxpbmsgRElTVEFOQ0VfTElORUFSfS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgc2V0IGRpc3RhbmNlTW9kZWwodmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYW5uZXIuZGlzdGFuY2VNb2RlbCA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCBkaXN0YW5jZU1vZGVsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYW5uZXIuZGlzdGFuY2VNb2RlbDtcbiAgICB9XG59XG5cbmlmICghaGFzQXVkaW9Db250ZXh0KCkpIHtcbiAgICAvLyB0ZW1wIHZlY3RvciBzdG9yYWdlXG4gICAgbGV0IG9mZnNldCA9IG5ldyBWZWMzKCk7XG5cbiAgICAvLyBGYWxsIG9mZiBmdW5jdGlvbiB3aGljaCBzaG91bGQgYmUgdGhlIHNhbWUgYXMgdGhlIG9uZSBpbiB0aGUgV2ViIEF1ZGlvIEFQSVxuICAgIC8vIFRha2VuIGZyb20gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1Bhbm5lck5vZGUvZGlzdGFuY2VNb2RlbFxuICAgIGNvbnN0IGZhbGxPZmYgPSBmdW5jdGlvbiAocG9zT25lLCBwb3NUd28sIHJlZkRpc3RhbmNlLCBtYXhEaXN0YW5jZSwgcm9sbE9mZkZhY3RvciwgZGlzdGFuY2VNb2RlbCkge1xuICAgICAgICBvZmZzZXQgPSBvZmZzZXQuc3ViMihwb3NPbmUsIHBvc1R3byk7XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gb2Zmc2V0Lmxlbmd0aCgpO1xuXG4gICAgICAgIGlmIChkaXN0YW5jZSA8IHJlZkRpc3RhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSBlbHNlIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByZXN1bHQgPSAwO1xuICAgICAgICBpZiAoZGlzdGFuY2VNb2RlbCA9PT0gRElTVEFOQ0VfTElORUFSKSB7XG4gICAgICAgICAgICByZXN1bHQgPSAxIC0gcm9sbE9mZkZhY3RvciAqIChkaXN0YW5jZSAtIHJlZkRpc3RhbmNlKSAvIChtYXhEaXN0YW5jZSAtIHJlZkRpc3RhbmNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChkaXN0YW5jZU1vZGVsID09PSBESVNUQU5DRV9JTlZFUlNFKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZWZEaXN0YW5jZSAvIChyZWZEaXN0YW5jZSArIHJvbGxPZmZGYWN0b3IgKiAoZGlzdGFuY2UgLSByZWZEaXN0YW5jZSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGRpc3RhbmNlTW9kZWwgPT09IERJU1RBTkNFX0VYUE9ORU5USUFMKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBNYXRoLnBvdyhkaXN0YW5jZSAvIHJlZkRpc3RhbmNlLCAtcm9sbE9mZkZhY3Rvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdGguY2xhbXAocmVzdWx0LCAwLCAxKTtcbiAgICB9O1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kSW5zdGFuY2UzZC5wcm90b3R5cGUsICdwb3NpdGlvbicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcG9zaXRpb247XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl9wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc291cmNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLl9tYW5hZ2VyLmxpc3RlbmVyO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbHBvcyA9IGxpc3RlbmVyLmdldFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBmYWN0b3IgPSBmYWxsT2ZmKGxwb3MsIHRoaXMuX3Bvc2l0aW9uLCB0aGlzLnJlZkRpc3RhbmNlLCB0aGlzLm1heERpc3RhbmNlLCB0aGlzLnJvbGxPZmZGYWN0b3IsIHRoaXMuZGlzdGFuY2VNb2RlbCk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gdGhpcy52b2x1bWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZS52b2x1bWUgPSB2ICogZmFjdG9yICogdGhpcy5fbWFuYWdlci52b2x1bWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEluc3RhbmNlM2QucHJvdG90eXBlLCAnbWF4RGlzdGFuY2UnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21heERpc3RhbmNlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbWF4RGlzdGFuY2UgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kSW5zdGFuY2UzZC5wcm90b3R5cGUsICdyZWZEaXN0YW5jZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVmRGlzdGFuY2U7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWZEaXN0YW5jZSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRJbnN0YW5jZTNkLnByb3RvdHlwZSwgJ3JvbGxPZmZGYWN0b3InLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JvbGxPZmZGYWN0b3I7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9yb2xsT2ZmRmFjdG9yID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEluc3RhbmNlM2QucHJvdG90eXBlLCAnZGlzdGFuY2VNb2RlbCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGlzdGFuY2VNb2RlbDtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3RhbmNlTW9kZWwgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5leHBvcnQgeyBTb3VuZEluc3RhbmNlM2QgfTtcbiJdLCJuYW1lcyI6WyJNQVhfRElTVEFOQ0UiLCJTb3VuZEluc3RhbmNlM2QiLCJTb3VuZEluc3RhbmNlIiwiY29uc3RydWN0b3IiLCJtYW5hZ2VyIiwic291bmQiLCJvcHRpb25zIiwiX3Bvc2l0aW9uIiwiVmVjMyIsIl92ZWxvY2l0eSIsInBvc2l0aW9uIiwibWF4RGlzdGFuY2UiLCJ1bmRlZmluZWQiLCJOdW1iZXIiLCJyZWZEaXN0YW5jZSIsInJvbGxPZmZGYWN0b3IiLCJkaXN0YW5jZU1vZGVsIiwiRElTVEFOQ0VfTElORUFSIiwiX2luaXRpYWxpemVOb2RlcyIsImdhaW4iLCJfbWFuYWdlciIsImNvbnRleHQiLCJjcmVhdGVHYWluIiwicGFubmVyIiwiY3JlYXRlUGFubmVyIiwiY29ubmVjdCIsIl9pbnB1dE5vZGUiLCJfY29ubmVjdG9yTm9kZSIsImRlc3RpbmF0aW9uIiwidmFsdWUiLCJjb3B5IiwicG9zaXRpb25YIiwieCIsInBvc2l0aW9uWSIsInkiLCJwb3NpdGlvbloiLCJ6Iiwic2V0UG9zaXRpb24iLCJ2ZWxvY2l0eSIsIkRlYnVnIiwid2FybiIsInJvbGxvZmZGYWN0b3IiLCJoYXNBdWRpb0NvbnRleHQiLCJvZmZzZXQiLCJmYWxsT2ZmIiwicG9zT25lIiwicG9zVHdvIiwic3ViMiIsImRpc3RhbmNlIiwibGVuZ3RoIiwicmVzdWx0IiwiRElTVEFOQ0VfSU5WRVJTRSIsIkRJU1RBTkNFX0VYUE9ORU5USUFMIiwiTWF0aCIsInBvdyIsIm1hdGgiLCJjbGFtcCIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwicHJvdG90eXBlIiwiZ2V0Iiwic2V0Iiwic291cmNlIiwibGlzdGVuZXIiLCJscG9zIiwiZ2V0UG9zaXRpb24iLCJmYWN0b3IiLCJ2Iiwidm9sdW1lIiwiX21heERpc3RhbmNlIiwiX3JlZkRpc3RhbmNlIiwiX3JvbGxPZmZGYWN0b3IiLCJfZGlzdGFuY2VNb2RlbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQVNBO0FBQ0EsTUFBTUEsWUFBWSxHQUFHLEtBQUssQ0FBQTs7QUFFMUI7QUFDQTtBQUNBO0FB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
