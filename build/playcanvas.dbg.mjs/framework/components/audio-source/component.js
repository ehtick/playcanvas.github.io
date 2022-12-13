/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Asset } from '../../asset/asset.js';
import { Channel3d } from '../../../platform/audio/channel3d.js';
import { Component } from '../component.js';

class AudioSourceComponent extends Component {
  constructor(system, entity) {
    super(system, entity);
    this.on('set_assets', this.onSetAssets, this);
    this.on('set_loop', this.onSetLoop, this);
    this.on('set_volume', this.onSetVolume, this);
    this.on('set_pitch', this.onSetPitch, this);
    this.on('set_minDistance', this.onSetMinDistance, this);
    this.on('set_maxDistance', this.onSetMaxDistance, this);
    this.on('set_rollOffFactor', this.onSetRollOffFactor, this);
    this.on('set_distanceModel', this.onSetDistanceModel, this);
    this.on('set_3d', this.onSet3d, this);
  }

  play(name) {
    if (!this.enabled || !this.entity.enabled) {
      return;
    }
    if (this.channel) {
      this.stop();
    }
    let channel;
    const componentData = this.data;
    if (componentData.sources[name]) {
      if (!componentData['3d']) {
        channel = this.system.manager.playSound(componentData.sources[name], componentData);
        componentData.currentSource = name;
        componentData.channel = channel;
      } else {
        const pos = this.entity.getPosition();
        channel = this.system.manager.playSound3d(componentData.sources[name], pos, componentData);
        componentData.currentSource = name;
        componentData.channel = channel;
      }
    }
  }

  pause() {
    if (this.channel) {
      this.channel.pause();
    }
  }

  unpause() {
    if (this.channel && this.channel.paused) {
      this.channel.unpause();
    }
  }

  stop() {
    if (this.channel) {
      this.channel.stop();
      this.channel = null;
    }
  }
  onSetAssets(name, oldValue, newValue) {
    const newAssets = [];
    const len = newValue.length;
    if (oldValue && oldValue.length) {
      for (let i = 0; i < oldValue.length; i++) {
        if (oldValue[i]) {
          const asset = this.system.app.assets.get(oldValue[i]);
          if (asset) {
            asset.off('change', this.onAssetChanged, this);
            asset.off('remove', this.onAssetRemoved, this);
            if (this.currentSource === asset.name) {
              this.stop();
            }
          }
        }
      }
    }
    if (len) {
      for (let i = 0; i < len; i++) {
        if (oldValue.indexOf(newValue[i]) < 0) {
          if (newValue[i] instanceof Asset) {
            newAssets.push(newValue[i].id);
          } else {
            newAssets.push(newValue[i]);
          }
        }
      }
    }

    if (!this.system._inTools && newAssets.length) {
      this.loadAudioSourceAssets(newAssets);
    }
  }
  onAssetChanged(asset, attribute, newValue, oldValue) {
    if (attribute === 'resource') {
      const sources = this.data.sources;
      if (sources) {
        this.data.sources[asset.name] = newValue;
        if (this.data.currentSource === asset.name) {
          if (this.channel) {
            if (this.channel.paused) {
              this.play(asset.name);
              this.pause();
            } else {
              this.play(asset.name);
            }
          }
        }
      }
    }
  }
  onAssetRemoved(asset) {
    asset.off('remove', this.onAssetRemoved, this);
    if (this.data.sources[asset.name]) {
      delete this.data.sources[asset.name];
      if (this.data.currentSource === asset.name) {
        this.stop();
        this.data.currentSource = null;
      }
    }
  }
  onSetLoop(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (this.channel) {
        this.channel.setLoop(newValue);
      }
    }
  }
  onSetVolume(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (this.channel) {
        this.channel.setVolume(newValue);
      }
    }
  }
  onSetPitch(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (this.channel) {
        this.channel.setPitch(newValue);
      }
    }
  }
  onSetMaxDistance(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (this.channel instanceof Channel3d) {
        this.channel.setMaxDistance(newValue);
      }
    }
  }
  onSetMinDistance(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (this.channel instanceof Channel3d) {
        this.channel.setMinDistance(newValue);
      }
    }
  }
  onSetRollOffFactor(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (this.channel instanceof Channel3d) {
        this.channel.setRollOffFactor(newValue);
      }
    }
  }
  onSetDistanceModel(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (this.channel instanceof Channel3d) {
        this.channel.setDistanceModel(newValue);
      }
    }
  }
  onSet3d(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (this.system.initialized && this.currentSource) {
        let paused = false;
        let suspended = false;
        if (this.channel) {
          paused = this.channel.paused;
          suspended = this.channel.suspended;
        }
        this.play(this.currentSource);
        if (this.channel) {
          this.channel.paused = paused;
          this.channel.suspended = suspended;
        }
      }
    }
  }
  onEnable() {
    const assets = this.data.assets;
    if (assets) {
      const registry = this.system.app.assets;
      for (let i = 0, len = assets.length; i < len; i++) {
        let asset = assets[i];
        if (!(asset instanceof Asset)) asset = registry.get(asset);
        if (asset && !asset.resource) {
          registry.load(asset);
        }
      }
    }
    if (this.system.initialized) {
      if (this.data.activate && !this.channel) {
        this.play(this.currentSource);
      } else {
        this.unpause();
      }
    }
  }
  onDisable() {
    this.pause();
  }
  loadAudioSourceAssets(ids) {
    const assets = ids.map(id => {
      return this.system.app.assets.get(id);
    });
    const sources = {};
    let currentSource = null;
    let count = assets.length;

    const _error = e => {
      count--;
    };

    const _done = () => {
      this.data.sources = sources;
      this.data.currentSource = currentSource;
      if (this.enabled && this.activate && currentSource) {
        this.onEnable();
      }
    };
    assets.forEach((asset, index) => {
      if (asset) {
        currentSource = currentSource || asset.name;

        asset.off('change', this.onAssetChanged, this);
        asset.on('change', this.onAssetChanged, this);
        asset.off('remove', this.onAssetRemoved, this);
        asset.on('remove', this.onAssetRemoved, this);
        asset.off('error', _error, this);
        asset.on('error', _error, this);
        asset.ready(asset => {
          sources[asset.name] = asset.resource;
          count--;
          if (count === 0) {
            _done();
          }
        });
        if (!asset.resource && this.enabled && this.entity.enabled) this.system.app.assets.load(asset);
      } else {
        count--;
        if (count === 0) {
          _done();
        }
        this.system.app.assets.on('add:' + ids[index], asset => {
          asset.ready(asset => {
            this.data.sources[asset.name] = asset.resource;
          });
          if (!asset.resource) this.system.app.assets.load(asset);
        });
      }
    });
  }
}

export { AudioSourceComponent };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbXBvbmVudHMvYXVkaW8tc291cmNlL2NvbXBvbmVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBc3NldCB9IGZyb20gJy4uLy4uL2Fzc2V0L2Fzc2V0LmpzJztcblxuaW1wb3J0IHsgQ2hhbm5lbDNkIH0gZnJvbSAnLi4vLi4vLi4vcGxhdGZvcm0vYXVkaW8vY2hhbm5lbDNkLmpzJztcblxuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50LmpzJztcblxuLyoqXG4gKiBUaGUgQXVkaW9Tb3VyY2UgQ29tcG9uZW50IGNvbnRyb2xzIHBsYXliYWNrIG9mIGFuIGF1ZGlvIHNhbXBsZS4gVGhpcyBjbGFzcyB3aWxsIGJlIGRlcHJlY2F0ZWRcbiAqIGluIGZhdm9yIG9mIHtAbGluayBTb3VuZENvbXBvbmVudH0uXG4gKlxuICogQHByb3BlcnR5IHtBc3NldFtdfSBhc3NldHMgVGhlIGxpc3Qgb2YgYXVkaW8gYXNzZXRzIC0gY2FuIGFsc28gYmUgYW4gYXJyYXkgb2YgYXNzZXQgaWRzLlxuICogQHByb3BlcnR5IHtib29sZWFufSBhY3RpdmF0ZSBJZiB0cnVlIHRoZSBhdWRpbyB3aWxsIGJlZ2luIHBsYXlpbmcgYXMgc29vbiBhcyB0aGUgc2NlbmUgaXNcbiAqIGxvYWRlZC5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB2b2x1bWUgVGhlIHZvbHVtZSBtb2RpZmllciB0byBwbGF5IHRoZSBhdWRpbyB3aXRoLiBJbiByYW5nZSAwLTEuXG4gKiBAcHJvcGVydHkge251bWJlcn0gcGl0Y2ggVGhlIHBpdGNoIG1vZGlmaWVyIHRvIHBsYXkgdGhlIGF1ZGlvIHdpdGguIE11c3QgYmUgbGFyZ2VyIHRoYW4gMC4wMS5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gbG9vcCBJZiB0cnVlIHRoZSBhdWRpbyB3aWxsIHJlc3RhcnQgd2hlbiBpdCBmaW5pc2hlcyBwbGF5aW5nLlxuICogQHByb3BlcnR5IHtib29sZWFufSAzZCBJZiB0cnVlIHRoZSBhdWRpbyB3aWxsIHBsYXkgYmFjayBhdCB0aGUgbG9jYXRpb24gb2YgdGhlIGVudGl0eSBpbiBzcGFjZSxcbiAqIHNvIHRoZSBhdWRpbyB3aWxsIGJlIGFmZmVjdCBieSB0aGUgcG9zaXRpb24gb2YgdGhlIHtAbGluayBBdWRpb0xpc3RlbmVyQ29tcG9uZW50fS5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBkaXN0YW5jZU1vZGVsIERldGVybWluZXMgd2hpY2ggYWxnb3JpdGhtIHRvIHVzZSB0byByZWR1Y2UgdGhlIHZvbHVtZSBvZiB0aGVcbiAqIGF1ZGlvIGFzIGl0IG1vdmVzIGF3YXkgZnJvbSB0aGUgbGlzdGVuZXIuIENhbiBiZTpcbiAqXG4gKiAtIFwibGluZWFyXCJcbiAqIC0gXCJpbnZlcnNlXCJcbiAqIC0gXCJleHBvbmVudGlhbFwiXG4gKlxuICogRGVmYXVsdCBpcyBcImludmVyc2VcIi5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBtaW5EaXN0YW5jZSBUaGUgbWluaW11bSBkaXN0YW5jZSBmcm9tIHRoZSBsaXN0ZW5lciBhdCB3aGljaCBhdWRpbyBmYWxsb2ZmXG4gKiBiZWdpbnMuXG4gKiBAcHJvcGVydHkge251bWJlcn0gbWF4RGlzdGFuY2UgVGhlIG1heGltdW0gZGlzdGFuY2UgZnJvbSB0aGUgbGlzdGVuZXIgYXQgd2hpY2ggYXVkaW8gZmFsbG9mZlxuICogc3RvcHMuIE5vdGUgdGhlIHZvbHVtZSBvZiB0aGUgYXVkaW8gaXMgbm90IDAgYWZ0ZXIgdGhpcyBkaXN0YW5jZSwgYnV0IGp1c3QgZG9lc24ndCBmYWxsIG9mZlxuICogYW55bW9yZS5cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSByb2xsT2ZmRmFjdG9yIFRoZSBmYWN0b3IgdXNlZCBpbiB0aGUgZmFsbG9mZiBlcXVhdGlvbi5cbiAqIEBhdWdtZW50cyBDb21wb25lbnRcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgQXVkaW9Tb3VyY2VDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBBdWRpb1NvdXJjZSBDb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi9zeXN0ZW0uanMnKS5BdWRpb1NvdXJjZUNvbXBvbmVudFN5c3RlbX0gc3lzdGVtIC0gVGhlIENvbXBvbmVudFN5c3RlbSB0aGF0XG4gICAgICogY3JlYXRlZCB0aGlzIGNvbXBvbmVudC5cbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vLi4vZW50aXR5LmpzJykuRW50aXR5fSBlbnRpdHkgLSBUaGUgZW50aXR5IHRoYXQgdGhlIENvbXBvbmVudCBpcyBhdHRhY2hlZFxuICAgICAqIHRvLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN5c3RlbSwgZW50aXR5KSB7XG4gICAgICAgIHN1cGVyKHN5c3RlbSwgZW50aXR5KTtcblxuICAgICAgICB0aGlzLm9uKCdzZXRfYXNzZXRzJywgdGhpcy5vblNldEFzc2V0cywgdGhpcyk7XG4gICAgICAgIHRoaXMub24oJ3NldF9sb29wJywgdGhpcy5vblNldExvb3AsIHRoaXMpO1xuICAgICAgICB0aGlzLm9uKCdzZXRfdm9sdW1lJywgdGhpcy5vblNldFZvbHVtZSwgdGhpcyk7XG4gICAgICAgIHRoaXMub24oJ3NldF9waXRjaCcsIHRoaXMub25TZXRQaXRjaCwgdGhpcyk7XG4gICAgICAgIHRoaXMub24oJ3NldF9taW5EaXN0YW5jZScsIHRoaXMub25TZXRNaW5EaXN0YW5jZSwgdGhpcyk7XG4gICAgICAgIHRoaXMub24oJ3NldF9tYXhEaXN0YW5jZScsIHRoaXMub25TZXRNYXhEaXN0YW5jZSwgdGhpcyk7XG4gICAgICAgIHRoaXMub24oJ3NldF9yb2xsT2ZmRmFjdG9yJywgdGhpcy5vblNldFJvbGxPZmZGYWN0b3IsIHRoaXMpO1xuICAgICAgICB0aGlzLm9uKCdzZXRfZGlzdGFuY2VNb2RlbCcsIHRoaXMub25TZXREaXN0YW5jZU1vZGVsLCB0aGlzKTtcbiAgICAgICAgdGhpcy5vbignc2V0XzNkJywgdGhpcy5vblNldDNkLCB0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCZWdpbiBwbGF5YmFjayBvZiBhbiBhdWRpbyBhc3NldCBpbiB0aGUgY29tcG9uZW50IGF0dGFjaGVkIHRvIGFuIGVudGl0eS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIEFzc2V0IHRvIHBsYXkuXG4gICAgICovXG4gICAgcGxheShuYW1lKSB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkIHx8ICF0aGlzLmVudGl0eS5lbmFibGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jaGFubmVsKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBhcmUgY3VycmVudGx5IHBsYXlpbmcgYSBjaGFubmVsLCBzdG9wIGl0LlxuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY2hhbm5lbDtcbiAgICAgICAgY29uc3QgY29tcG9uZW50RGF0YSA9IHRoaXMuZGF0YTtcbiAgICAgICAgaWYgKGNvbXBvbmVudERhdGEuc291cmNlc1tuYW1lXSkge1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnREYXRhWyczZCddKSB7XG4gICAgICAgICAgICAgICAgY2hhbm5lbCA9IHRoaXMuc3lzdGVtLm1hbmFnZXIucGxheVNvdW5kKGNvbXBvbmVudERhdGEuc291cmNlc1tuYW1lXSwgY29tcG9uZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50RGF0YS5jdXJyZW50U291cmNlID0gbmFtZTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnREYXRhLmNoYW5uZWwgPSBjaGFubmVsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSB0aGlzLmVudGl0eS5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIGNoYW5uZWwgPSB0aGlzLnN5c3RlbS5tYW5hZ2VyLnBsYXlTb3VuZDNkKGNvbXBvbmVudERhdGEuc291cmNlc1tuYW1lXSwgcG9zLCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnREYXRhLmN1cnJlbnRTb3VyY2UgPSBuYW1lO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudERhdGEuY2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYXVzZSBwbGF5YmFjayBvZiB0aGUgYXVkaW8gdGhhdCBpcyBwbGF5aW5nIG9uIHRoZSBFbnRpdHkuIFBsYXliYWNrIGNhbiBiZSByZXN1bWVkIGJ5XG4gICAgICogY2FsbGluZyB7QGxpbmsgQXVkaW9Tb3VyY2VDb21wb25lbnQjdW5wYXVzZX0uXG4gICAgICovXG4gICAgcGF1c2UoKSB7XG4gICAgICAgIGlmICh0aGlzLmNoYW5uZWwpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5wYXVzZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzdW1lIHBsYXliYWNrIG9mIHRoZSBhdWRpbyBpZiBwYXVzZWQuIFBsYXliYWNrIGlzIHJlc3VtZWQgYXQgdGhlIHRpbWUgaXQgd2FzIHBhdXNlZC5cbiAgICAgKi9cbiAgICB1bnBhdXNlKCkge1xuICAgICAgICBpZiAodGhpcy5jaGFubmVsICYmIHRoaXMuY2hhbm5lbC5wYXVzZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbC51bnBhdXNlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9wIHBsYXliYWNrIG9uIGFuIEVudGl0eS4gUGxheWJhY2sgY2FuIG5vdCBiZSByZXN1bWVkIGFmdGVyIGJlaW5nIHN0b3BwZWQuXG4gICAgICovXG4gICAgc3RvcCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hhbm5lbCkge1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsLnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblNldEFzc2V0cyhuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgY29uc3QgbmV3QXNzZXRzID0gW107XG4gICAgICAgIGNvbnN0IGxlbiA9IG5ld1ZhbHVlLmxlbmd0aDtcblxuICAgICAgICBpZiAob2xkVmFsdWUgJiYgb2xkVmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZFZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gdW5zdWJzY3JpYmUgZnJvbSBjaGFuZ2UgZXZlbnQgZm9yIG9sZCBhc3NldHNcbiAgICAgICAgICAgICAgICBpZiAob2xkVmFsdWVbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXNzZXQgPSB0aGlzLnN5c3RlbS5hcHAuYXNzZXRzLmdldChvbGRWYWx1ZVtpXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhc3NldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXQub2ZmKCdjaGFuZ2UnLCB0aGlzLm9uQXNzZXRDaGFuZ2VkLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0Lm9mZigncmVtb3ZlJywgdGhpcy5vbkFzc2V0UmVtb3ZlZCwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRTb3VyY2UgPT09IGFzc2V0Lm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkVmFsdWUuaW5kZXhPZihuZXdWYWx1ZVtpXSkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZVtpXSBpbnN0YW5jZW9mIEFzc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBc3NldHMucHVzaChuZXdWYWx1ZVtpXS5pZCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBc3NldHMucHVzaChuZXdWYWx1ZVtpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICAvLyBPbmx5IGxvYWQgYXVkaW8gZGF0YSBpZiB3ZSBhcmUgbm90IGluIHRoZSB0b29scyBhbmQgaWYgY2hhbmdlcyBoYXZlIGJlZW4gbWFkZVxuICAgICAgICBpZiAoIXRoaXMuc3lzdGVtLl9pblRvb2xzICYmIG5ld0Fzc2V0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEF1ZGlvU291cmNlQXNzZXRzKG5ld0Fzc2V0cyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbkFzc2V0Q2hhbmdlZChhc3NldCwgYXR0cmlidXRlLCBuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZSA9PT0gJ3Jlc291cmNlJykge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlcyA9IHRoaXMuZGF0YS5zb3VyY2VzO1xuICAgICAgICAgICAgaWYgKHNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEuc291cmNlc1thc3NldC5uYW1lXSA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGEuY3VycmVudFNvdXJjZSA9PT0gYXNzZXQubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXBsYWNlIGN1cnJlbnQgc291bmQgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYW5uZWwucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5KGFzc2V0Lm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGF1c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5KGFzc2V0Lm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Bc3NldFJlbW92ZWQoYXNzZXQpIHtcbiAgICAgICAgYXNzZXQub2ZmKCdyZW1vdmUnLCB0aGlzLm9uQXNzZXRSZW1vdmVkLCB0aGlzKTtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5zb3VyY2VzW2Fzc2V0Lm5hbWVdKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5kYXRhLnNvdXJjZXNbYXNzZXQubmFtZV07XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhLmN1cnJlbnRTb3VyY2UgPT09IGFzc2V0Lm5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEuY3VycmVudFNvdXJjZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblNldExvb3AobmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWwuc2V0TG9vcChuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblNldFZvbHVtZShuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5zZXRWb2x1bWUobmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TZXRQaXRjaChuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbC5zZXRQaXRjaChuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblNldE1heERpc3RhbmNlKG5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAob2xkVmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGFubmVsIGluc3RhbmNlb2YgQ2hhbm5lbDNkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsLnNldE1heERpc3RhbmNlKG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uU2V0TWluRGlzdGFuY2UobmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNoYW5uZWwgaW5zdGFuY2VvZiBDaGFubmVsM2QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWwuc2V0TWluRGlzdGFuY2UobmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TZXRSb2xsT2ZmRmFjdG9yKG5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAob2xkVmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGFubmVsIGluc3RhbmNlb2YgQ2hhbm5lbDNkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsLnNldFJvbGxPZmZGYWN0b3IobmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TZXREaXN0YW5jZU1vZGVsKG5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAob2xkVmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGFubmVsIGluc3RhbmNlb2YgQ2hhbm5lbDNkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsLnNldERpc3RhbmNlTW9kZWwobmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TZXQzZChuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3lzdGVtLmluaXRpYWxpemVkICYmIHRoaXMuY3VycmVudFNvdXJjZSkge1xuICAgICAgICAgICAgICAgIGxldCBwYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsZXQgc3VzcGVuZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgICAgICBwYXVzZWQgPSB0aGlzLmNoYW5uZWwucGF1c2VkO1xuICAgICAgICAgICAgICAgICAgICBzdXNwZW5kZWQgPSB0aGlzLmNoYW5uZWwuc3VzcGVuZGVkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMucGxheSh0aGlzLmN1cnJlbnRTb3VyY2UpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWwucGF1c2VkID0gcGF1c2VkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWwuc3VzcGVuZGVkID0gc3VzcGVuZGVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uRW5hYmxlKCkge1xuICAgICAgICAvLyBsb2FkIGFzc2V0cyB0aGF0IGhhdmVuJ3QgYmVlbiBsb2FkZWQgeWV0XG4gICAgICAgIGNvbnN0IGFzc2V0cyA9IHRoaXMuZGF0YS5hc3NldHM7XG4gICAgICAgIGlmIChhc3NldHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gdGhpcy5zeXN0ZW0uYXBwLmFzc2V0cztcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGFzc2V0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBhc3NldCA9IGFzc2V0c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoIShhc3NldCBpbnN0YW5jZW9mIEFzc2V0KSlcbiAgICAgICAgICAgICAgICAgICAgYXNzZXQgPSByZWdpc3RyeS5nZXQoYXNzZXQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFzc2V0ICYmICFhc3NldC5yZXNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICByZWdpc3RyeS5sb2FkKGFzc2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zeXN0ZW0uaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGEuYWN0aXZhdGUgJiYgIXRoaXMuY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxheSh0aGlzLmN1cnJlbnRTb3VyY2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVucGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uRGlzYWJsZSgpIHtcbiAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgIH1cblxuICAgIGxvYWRBdWRpb1NvdXJjZUFzc2V0cyhpZHMpIHtcbiAgICAgICAgY29uc3QgYXNzZXRzID0gaWRzLm1hcCgoaWQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN5c3RlbS5hcHAuYXNzZXRzLmdldChpZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHNvdXJjZXMgPSB7fTtcbiAgICAgICAgbGV0IGN1cnJlbnRTb3VyY2UgPSBudWxsO1xuXG4gICAgICAgIGxldCBjb3VudCA9IGFzc2V0cy5sZW5ndGg7XG5cbiAgICAgICAgLy8gbWFrZSBzdXJlIHByb2dyZXNzIGNvbnRpbnVlcyBldmVuIGlmIHNvbWUgYXVkaW8gZG9lc24ndCBsb2FkXG4gICAgICAgIGNvbnN0IF9lcnJvciA9IChlKSA9PiB7XG4gICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIG9uY2UgYWxsIGFzc2V0cyBhcmUgYWNjb3VudGVkIGZvciBjb250aW51ZVxuICAgICAgICBjb25zdCBfZG9uZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5zb3VyY2VzID0gc291cmNlcztcbiAgICAgICAgICAgIHRoaXMuZGF0YS5jdXJyZW50U291cmNlID0gY3VycmVudFNvdXJjZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZW5hYmxlZCAmJiB0aGlzLmFjdGl2YXRlICYmIGN1cnJlbnRTb3VyY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRW5hYmxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgYXNzZXRzLmZvckVhY2goKGFzc2V0LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgaWYgKGFzc2V0KSB7XG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBjdXJyZW50IHNvdXJjZSB0byB0aGUgZmlyc3QgZW50cnkgKGJlZm9yZSBjYWxsaW5nIHNldCwgc28gdGhhdCBpdCBjYW4gcGxheSBpZiBuZWVkZWQpXG4gICAgICAgICAgICAgICAgY3VycmVudFNvdXJjZSA9IGN1cnJlbnRTb3VyY2UgfHwgYXNzZXQubmFtZTtcblxuICAgICAgICAgICAgICAgIC8vIHN1YnNjcmliZSB0byBjaGFuZ2UgZXZlbnRzIHRvIHJlbG9hZCBzb3VuZHMgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgICAgICAgYXNzZXQub2ZmKCdjaGFuZ2UnLCB0aGlzLm9uQXNzZXRDaGFuZ2VkLCB0aGlzKTtcbiAgICAgICAgICAgICAgICBhc3NldC5vbignY2hhbmdlJywgdGhpcy5vbkFzc2V0Q2hhbmdlZCwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICBhc3NldC5vZmYoJ3JlbW92ZScsIHRoaXMub25Bc3NldFJlbW92ZWQsIHRoaXMpO1xuICAgICAgICAgICAgICAgIGFzc2V0Lm9uKCdyZW1vdmUnLCB0aGlzLm9uQXNzZXRSZW1vdmVkLCB0aGlzKTtcblxuICAgICAgICAgICAgICAgIGFzc2V0Lm9mZignZXJyb3InLCBfZXJyb3IsIHRoaXMpO1xuICAgICAgICAgICAgICAgIGFzc2V0Lm9uKCdlcnJvcicsIF9lcnJvciwgdGhpcyk7XG4gICAgICAgICAgICAgICAgYXNzZXQucmVhZHkoKGFzc2V0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZXNbYXNzZXQubmFtZV0gPSBhc3NldC5yZXNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWFzc2V0LnJlc291cmNlICYmIHRoaXMuZW5hYmxlZCAmJiB0aGlzLmVudGl0eS5lbmFibGVkKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN5c3RlbS5hcHAuYXNzZXRzLmxvYWQoYXNzZXQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBkb24ndCB3YWl0IGZvciBhc3NldHMgdGhhdCBhcmVuJ3QgaW4gdGhlIHJlZ2lzdHJ5XG4gICAgICAgICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgX2RvbmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gYnV0IGlmIHRoZXkgYXJlIGFkZGVkIGluc2VydCB0aGVtIGludG8gc291cmNlIGxpc3RcbiAgICAgICAgICAgICAgICB0aGlzLnN5c3RlbS5hcHAuYXNzZXRzLm9uKCdhZGQ6JyArIGlkc1tpbmRleF0sIChhc3NldCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhc3NldC5yZWFkeSgoYXNzZXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5zb3VyY2VzW2Fzc2V0Lm5hbWVdID0gYXNzZXQucmVzb3VyY2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghYXNzZXQucmVzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN5c3RlbS5hcHAuYXNzZXRzLmxvYWQoYXNzZXQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IEF1ZGlvU291cmNlQ29tcG9uZW50IH07XG4iXSwibmFtZXMiOlsiQXVkaW9Tb3VyY2VDb21wb25lbnQiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInN5c3RlbSIsImVudGl0eSIsIm9uIiwib25TZXRBc3NldHMiLCJvblNldExvb3AiLCJvblNldFZvbHVtZSIsIm9uU2V0UGl0Y2giLCJvblNldE1pbkRpc3RhbmNlIiwib25TZXRNYXhEaXN0YW5jZSIsIm9uU2V0Um9sbE9mZkZhY3RvciIsIm9uU2V0RGlzdGFuY2VNb2RlbCIsIm9uU2V0M2QiLCJwbGF5IiwibmFtZSIsImVuYWJsZWQiLCJjaGFubmVsIiwic3RvcCIsImNvbXBvbmVudERhdGEiLCJkYXRhIiwic291cmNlcyIsIm1hbmFnZXIiLCJwbGF5U291bmQiLCJjdXJyZW50U291cmNlIiwicG9zIiwiZ2V0UG9zaXRpb24iLCJwbGF5U291bmQzZCIsInBhdXNlIiwidW5wYXVzZSIsInBhdXNlZCIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJuZXdBc3NldHMiLCJsZW4iLCJsZW5ndGgiLCJpIiwiYXNzZXQiLCJhcHAiLCJhc3NldHMiLCJnZXQiLCJvZmYiLCJvbkFzc2V0Q2hhbmdlZCIsIm9uQXNzZXRSZW1vdmVkIiwiaW5kZXhPZiIsIkFzc2V0IiwicHVzaCIsImlkIiwiX2luVG9vbHMiLCJsb2FkQXVkaW9Tb3VyY2VBc3NldHMiLCJhdHRyaWJ1dGUiLCJzZXRMb29wIiwic2V0Vm9sdW1lIiwic2V0UGl0Y2giLCJDaGFubmVsM2QiLCJzZXRNYXhEaXN0YW5jZSIsInNldE1pbkRpc3RhbmNlIiwic2V0Um9sbE9mZkZhY3RvciIsInNldERpc3RhbmNlTW9kZWwiLCJpbml0aWFsaXplZCIsInN1c3BlbmRlZCIsIm9uRW5hYmxlIiwicmVnaXN0cnkiLCJyZXNvdXJjZSIsImxvYWQiLCJhY3RpdmF0ZSIsIm9uRGlzYWJsZSIsImlkcyIsIm1hcCIsImNvdW50IiwiX2Vycm9yIiwiZSIsIl9kb25lIiwiZm9yRWFjaCIsImluZGV4IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQW1DQSxNQUFNQSxvQkFBb0IsU0FBU0MsU0FBUyxDQUFDO0FBU3pDQyxFQUFBQSxXQUFX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
