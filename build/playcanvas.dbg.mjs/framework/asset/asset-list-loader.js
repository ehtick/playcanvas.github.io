/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { EventHandler } from '../../core/event-handler.js';
import { Asset } from './asset.js';

class AssetListLoader extends EventHandler {
  constructor(assetList, assetRegistry) {
    super();
    this._assets = new Set();
    this._loadingAssets = new Set();
    this._waitingAssets = new Set();
    this._registry = assetRegistry;
    this._loading = false;
    this._loaded = false;
    this._failed = [];

    assetList.forEach(a => {
      if (a instanceof Asset) {
        if (!a.registry) {
          a.registry = assetRegistry;
        }
        this._assets.add(a);
      } else {
        const asset = assetRegistry.get(a);
        if (asset) {
          this._assets.add(asset);
        } else {
          this._waitForAsset(a);
        }
      }
    });
  }

  destroy() {
    const self = this;
    this._registry.off("load", this._onLoad);
    this._registry.off("error", this._onError);
    this._waitingAssets.forEach(function (id) {
      self._registry.off("add:" + id, this._onAddAsset);
    });
    this.off("progress");
    this.off("load");
  }
  _assetHasDependencies(asset) {
    var _asset$file;
    return asset.type === 'model' && ((_asset$file = asset.file) == null ? void 0 : _asset$file.url) && asset.file.url && asset.file.url.match(/.json$/g);
  }

  load(done, scope) {
    if (this._loading) {
      console.debug("AssetListLoader: Load function called multiple times.");
      return;
    }
    this._loading = true;
    this._callback = done;
    this._scope = scope;
    this._registry.on("load", this._onLoad, this);
    this._registry.on("error", this._onError, this);
    let loadingAssets = false;
    this._assets.forEach(asset => {
      if (!asset.loaded) {
        loadingAssets = true;
        if (this._assetHasDependencies(asset)) {
          this._registry.loadFromUrl(asset.file.url, asset.type, (err, loadedAsset) => {
            if (err) {
              this._onError(err, asset);
              return;
            }
            this._onLoad(asset);
          });
        }
        this._loadingAssets.add(asset);
        this._registry.add(asset);
      }
    });
    this._loadingAssets.forEach(asset => {
      if (!this._assetHasDependencies(asset)) {
        this._registry.load(asset);
      }
    });
    if (!loadingAssets && this._waitingAssets.size === 0) {
      this._loadingComplete();
    }
  }

  ready(done, scope = this) {
    if (this._loaded) {
      done.call(scope, Array.from(this._assets));
    } else {
      this.once("load", function (assets) {
        done.call(scope, assets);
      });
    }
  }

  _loadingComplete() {
    if (this._loaded) return;
    this._loaded = true;
    this._registry.off("load", this._onLoad, this);
    this._registry.off("error", this._onError, this);
    if (this._failed.length) {
      if (this._callback) {
        this._callback.call(this._scope, "Failed to load some assets", this._failed);
      }
      this.fire("error", this._failed);
    } else {
      if (this._callback) {
        this._callback.call(this._scope);
      }
      this.fire("load", Array.from(this._assets));
    }
  }

  _onLoad(asset) {
    if (this._loadingAssets.has(asset)) {
      this.fire("progress", asset);
      this._loadingAssets.delete(asset);
    }
    if (this._loadingAssets.size === 0) {
      setTimeout(() => {
        this._loadingComplete(this._failed);
      }, 0);
    }
  }

  _onError(err, asset) {
    if (this._loadingAssets.has(asset)) {
      this._failed.push(asset);
      this._loadingAssets.delete(asset);
    }
    if (this._loadingAssets.size === 0) {
      setTimeout(() => {
        this._loadingComplete(this._failed);
      }, 0);
    }
  }

  _onAddAsset(asset) {
    this._waitingAssets.delete(asset);
    this._assets.add(asset);
    if (!asset.loaded) {
      this._loadingAssets.add(asset);
      this._registry.load(asset);
    }
  }
  _waitForAsset(assetId) {
    this._waitingAssets.add(assetId);
    this._registry.once('add:' + assetId, this._onAddAsset, this);
  }
}

export { AssetListLoader };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQtbGlzdC1sb2FkZXIuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvYXNzZXQvYXNzZXQtbGlzdC1sb2FkZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vY29yZS9ldmVudC1oYW5kbGVyLmpzJztcblxuaW1wb3J0IHsgQXNzZXQgfSBmcm9tICcuL2Fzc2V0LmpzJztcblxuLyoqXG4gKiBVc2VkIHRvIGxvYWQgYSBncm91cCBvZiBhc3NldHMgYW5kIGZpcmVzIGEgY2FsbGJhY2sgd2hlbiBhbGwgYXNzZXRzIGFyZSBsb2FkZWQuXG4gKlxuICogQGF1Z21lbnRzIEV2ZW50SGFuZGxlclxuICogQGV4YW1wbGVcbiAqICBjb25zdCBhc3NldHMgPSBbXG4gKiAgICAgIG5ldyBBc3NldCgnbW9kZWwnLCAnY29udGFpbmVyJywgeyB1cmw6IGBodHRwOi8vZXhhbXBsZS5jb20vYXNzZXQuZ2xiYCB9KSxcbiAqICAgICAgbmV3IEFzc2V0KCdzdHlsaW5nJywgJ2NzcycsIHsgdXJsOiBgaHR0cDovL2V4YW1wbGUuY29tL2Fzc2V0LmNzc2AgfSlcbiAqICBdO1xuICogIGNvbnN0IGFzc2V0TGlzdExvYWRlciA9IG5ldyBBc3NldExpc3RMb2FkZXIoYXNzZXRzLCBhcHAuYXNzZXRzKTtcbiAqICBhc3NldExpc3RMb2FkZXIubG9hZCgoZXJyLCBmYWlsZWQpID0+IHtcbiAqICAgICAgaWYgKGVycikge1xuICogICAgICAgICAgY29uc29sZS5lcnJvcihgJHtmYWlsZWQubGVuZ3RofSBhc3NldHMgZmFpbGVkIHRvIGxvYWRgKTtcbiAqICAgICAgfSBlbHNlIHtcbiAqICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Fzc2V0cy5sZW5ndGh9IGFzc2V0cyBsb2FkZWRgKTtcbiAqICAgICB9XG4gKiAgfSk7XG4gKi9cbmNsYXNzIEFzc2V0TGlzdExvYWRlciBleHRlbmRzIEV2ZW50SGFuZGxlciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IEFzc2V0TGlzdExvYWRlciB1c2luZyBhIGxpc3Qgb2YgYXNzZXRzIHRvIGxvYWQgYW5kIHRoZSBhc3NldCByZWdpc3RyeSB1c2VkIHRvIGxvYWQgYW5kIG1hbmFnZSB0aGVtLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtBc3NldFtdfG51bWJlcltdfSBhc3NldExpc3QgLSBBbiBhcnJheSBvZiB7QGxpbmsgQXNzZXR9IG9iamVjdHMgdG8gbG9hZCBvciBhbiBhcnJheSBvZiBBc3NldCBJRHMgdG8gbG9hZC5cbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi9hc3NldC1yZWdpc3RyeS5qcycpLkFzc2V0UmVnaXN0cnl9IGFzc2V0UmVnaXN0cnkgLSBUaGUgYXBwbGljYXRpb24ncyBhc3NldCByZWdpc3RyeS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGFzc2V0TGlzdExvYWRlciA9IG5ldyBwYy5Bc3NldExpc3RMb2FkZXIoW1xuICAgICAqICAgICBuZXcgcGMuQXNzZXQoXCJ0ZXh0dXJlMVwiLCBcInRleHR1cmVcIiwgeyB1cmw6ICdodHRwOi8vZXhhbXBsZS5jb20vbXkvYXNzZXRzL2hlcmUvdGV4dHVyZTEucG5nJykgfSksXG4gICAgICogICAgIG5ldyBwYy5Bc3NldChcInRleHR1cmUyXCIsIFwidGV4dHVyZVwiLCB7IHVybDogJ2h0dHA6Ly9leGFtcGxlLmNvbS9teS9hc3NldHMvaGVyZS90ZXh0dXJlMi5wbmcnKSB9KVxuICAgICAqIF0sIHBjLmFwcC5hc3NldHMpO1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGFzc2V0TGlzdCwgYXNzZXRSZWdpc3RyeSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLl9hc3NldHMgPSBuZXcgU2V0KCk7XG4gICAgICAgIHRoaXMuX2xvYWRpbmdBc3NldHMgPSBuZXcgU2V0KCk7XG4gICAgICAgIHRoaXMuX3dhaXRpbmdBc3NldHMgPSBuZXcgU2V0KCk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdHJ5ID0gYXNzZXRSZWdpc3RyeTtcbiAgICAgICAgdGhpcy5fbG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9sb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZmFpbGVkID0gW107IC8vIGxpc3Qgb2YgYXNzZXRzIHRoYXQgZmFpbGVkIHRvIGxvYWRcblxuICAgICAgICBhc3NldExpc3QuZm9yRWFjaCgoYSkgPT4ge1xuICAgICAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBBc3NldCkge1xuICAgICAgICAgICAgICAgIGlmICghYS5yZWdpc3RyeSkge1xuICAgICAgICAgICAgICAgICAgICBhLnJlZ2lzdHJ5ID0gYXNzZXRSZWdpc3RyeTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fYXNzZXRzLmFkZChhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXNzZXQgPSBhc3NldFJlZ2lzdHJ5LmdldChhKTtcbiAgICAgICAgICAgICAgICBpZiAoYXNzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXNzZXRzLmFkZChhc3NldCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fd2FpdEZvckFzc2V0KGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgcmVmZXJlbmNlcyB0byB0aGlzIGFzc2V0IGxpc3QgbG9hZGVyLlxuICAgICAqL1xuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIC8vIHJlbW92ZSBhbnkgb3V0c3RhbmRpbmcgbGlzdGVuZXJzXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuX3JlZ2lzdHJ5Lm9mZihcImxvYWRcIiwgdGhpcy5fb25Mb2FkKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0cnkub2ZmKFwiZXJyb3JcIiwgdGhpcy5fb25FcnJvcik7XG5cbiAgICAgICAgdGhpcy5fd2FpdGluZ0Fzc2V0cy5mb3JFYWNoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgc2VsZi5fcmVnaXN0cnkub2ZmKFwiYWRkOlwiICsgaWQsIHRoaXMuX29uQWRkQXNzZXQpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm9mZihcInByb2dyZXNzXCIpO1xuICAgICAgICB0aGlzLm9mZihcImxvYWRcIik7XG4gICAgfVxuXG4gICAgX2Fzc2V0SGFzRGVwZW5kZW5jaWVzKGFzc2V0KSB7XG4gICAgICAgIHJldHVybiAoYXNzZXQudHlwZSA9PT0gJ21vZGVsJyAmJiBhc3NldC5maWxlPy51cmwgJiYgYXNzZXQuZmlsZS51cmwgJiYgYXNzZXQuZmlsZS51cmwubWF0Y2goLy5qc29uJC9nKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgbG9hZGluZyBhc3NldCBsaXN0LCBjYWxsIGRvbmUoKSB3aGVuIGFsbCBhc3NldHMgaGF2ZSBsb2FkZWQgb3IgZmFpbGVkIHRvIGxvYWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBkb25lIC0gQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYWxsIGFzc2V0cyBpbiB0aGUgbGlzdCBhcmUgbG9hZGVkLiBQYXNzZWQgKGVyciwgZmFpbGVkKSB3aGVyZSBlcnIgaXMgdGhlIHVuZGVmaW5lZCBpZiBubyBlcnJvcnMgYXJlIGVuY291bnRlcmVkIGFuZCBmYWlsZWQgY29udGFpbnMgYSBsaXN0IG9mIGFzc2V0cyB0aGF0IGZhaWxlZCB0byBsb2FkLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbc2NvcGVdIC0gU2NvcGUgdG8gdXNlIHdoZW4gY2FsbGluZyBjYWxsYmFjay5cbiAgICAgKi9cbiAgICBsb2FkKGRvbmUsIHNjb3BlKSB7XG4gICAgICAgIGlmICh0aGlzLl9sb2FkaW5nKSB7XG4gICAgICAgICAgICAvLyAjaWYgX0RFQlVHXG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKFwiQXNzZXRMaXN0TG9hZGVyOiBMb2FkIGZ1bmN0aW9uIGNhbGxlZCBtdWx0aXBsZSB0aW1lcy5cIik7XG4gICAgICAgICAgICAvLyAjZW5kaWZcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fY2FsbGJhY2sgPSBkb25lO1xuICAgICAgICB0aGlzLl9zY29wZSA9IHNjb3BlO1xuXG4gICAgICAgIHRoaXMuX3JlZ2lzdHJ5Lm9uKFwibG9hZFwiLCB0aGlzLl9vbkxvYWQsIHRoaXMpO1xuICAgICAgICB0aGlzLl9yZWdpc3RyeS5vbihcImVycm9yXCIsIHRoaXMuX29uRXJyb3IsIHRoaXMpO1xuXG4gICAgICAgIGxldCBsb2FkaW5nQXNzZXRzID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2Fzc2V0cy5mb3JFYWNoKChhc3NldCkgPT4ge1xuICAgICAgICAgICAgLy8gVHJhY2sgYXNzZXRzIHRoYXQgYXJlIG5vdCBsb2FkZWQgb3IgYXJlIGN1cnJlbnRseSBsb2FkaW5nXG4gICAgICAgICAgICAvLyBhcyBzb21lIGFzc2V0cyBtYXkgYmUgbG9hZGluZyBieSB0aGlzIGNhbGxcbiAgICAgICAgICAgIGlmICghYXNzZXQubG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgbG9hZGluZ0Fzc2V0cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgLy8ganNvbiBiYXNlZCBtb2RlbHMgc2hvdWxkIGJlIGxvYWRlZCB3aXRoIHRoZSBsb2FkRnJvbVVybCBmdW5jdGlvbiBzbyB0aGF0IHRoZWlyIGRlcGVuZGVuY2llcyBjYW4gYmUgbG9hZGVkIHRvby5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fYXNzZXRIYXNEZXBlbmRlbmNpZXMoYXNzZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlZ2lzdHJ5LmxvYWRGcm9tVXJsKGFzc2V0LmZpbGUudXJsLCBhc3NldC50eXBlLCAoZXJyLCBsb2FkZWRBc3NldCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRXJyb3IoZXJyLCBhc3NldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Mb2FkKGFzc2V0KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdBc3NldHMuYWRkKGFzc2V0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWdpc3RyeS5hZGQoYXNzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fbG9hZGluZ0Fzc2V0cy5mb3JFYWNoKChhc3NldCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9hc3NldEhhc0RlcGVuZGVuY2llcyhhc3NldCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWdpc3RyeS5sb2FkKGFzc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghbG9hZGluZ0Fzc2V0cyAmJiB0aGlzLl93YWl0aW5nQXNzZXRzLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdDb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyBhIGNhbGxiYWNrIHdoaWNoIHdpbGwgYmUgY2FsbGVkIHdoZW4gYWxsIGFzc2V0cyBpbiB0aGUgbGlzdCBoYXZlIGJlZW4gbG9hZGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZG9uZSAtIENhbGxiYWNrIGNhbGxlZCB3aGVuIGFsbCBhc3NldHMgaW4gdGhlIGxpc3QgYXJlIGxvYWRlZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW3Njb3BlXSAtIFNjb3BlIHRvIHVzZSB3aGVuIGNhbGxpbmcgY2FsbGJhY2suXG4gICAgICovXG4gICAgcmVhZHkoZG9uZSwgc2NvcGUgPSB0aGlzKSB7XG4gICAgICAgIGlmICh0aGlzLl9sb2FkZWQpIHtcbiAgICAgICAgICAgIGRvbmUuY2FsbChzY29wZSwgQXJyYXkuZnJvbSh0aGlzLl9hc3NldHMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25jZShcImxvYWRcIiwgZnVuY3Rpb24gKGFzc2V0cykge1xuICAgICAgICAgICAgICAgIGRvbmUuY2FsbChzY29wZSwgYXNzZXRzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2FsbGVkIHdoZW4gYWxsIGFzc2V0cyBhcmUgbG9hZGVkXG4gICAgX2xvYWRpbmdDb21wbGV0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2xvYWRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sb2FkZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9yZWdpc3RyeS5vZmYoXCJsb2FkXCIsIHRoaXMuX29uTG9hZCwgdGhpcyk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdHJ5Lm9mZihcImVycm9yXCIsIHRoaXMuX29uRXJyb3IsIHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLl9mYWlsZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWxsYmFjay5jYWxsKHRoaXMuX3Njb3BlLCBcIkZhaWxlZCB0byBsb2FkIHNvbWUgYXNzZXRzXCIsIHRoaXMuX2ZhaWxlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZpcmUoXCJlcnJvclwiLCB0aGlzLl9mYWlsZWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FsbGJhY2suY2FsbCh0aGlzLl9zY29wZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZpcmUoXCJsb2FkXCIsIEFycmF5LmZyb20odGhpcy5fYXNzZXRzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjYWxsZWQgd2hlbiBhbiAoYW55KSBhc3NldCBpcyBsb2FkZWRcbiAgICBfb25Mb2FkKGFzc2V0KSB7XG4gICAgICAgIC8vIGNoZWNrIHRoaXMgaXMgYW4gYXNzZXQgd2UgY2FyZSBhYm91dFxuICAgICAgICBpZiAodGhpcy5fbG9hZGluZ0Fzc2V0cy5oYXMoYXNzZXQpKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoXCJwcm9ncmVzc1wiLCBhc3NldCk7XG4gICAgICAgICAgICB0aGlzLl9sb2FkaW5nQXNzZXRzLmRlbGV0ZShhc3NldCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fbG9hZGluZ0Fzc2V0cy5zaXplID09PSAwKSB7XG4gICAgICAgICAgICAvLyBjYWxsIG5leHQgdGljayBiZWNhdXNlIHdlIHdhbnRcbiAgICAgICAgICAgIC8vIHRoaXMgdG8gYmUgZmlyZWQgYWZ0ZXIgYW55IG90aGVyXG4gICAgICAgICAgICAvLyBhc3NldCBsb2FkIGV2ZW50c1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZGluZ0NvbXBsZXRlKHRoaXMuX2ZhaWxlZCk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNhbGxlZCB3aGVuIGFuIGFzc2V0IGZhaWxzIHRvIGxvYWRcbiAgICBfb25FcnJvcihlcnIsIGFzc2V0KSB7XG4gICAgICAgIC8vIGNoZWNrIHRoaXMgaXMgYW4gYXNzZXQgd2UgY2FyZSBhYm91dFxuICAgICAgICBpZiAodGhpcy5fbG9hZGluZ0Fzc2V0cy5oYXMoYXNzZXQpKSB7XG4gICAgICAgICAgICB0aGlzLl9mYWlsZWQucHVzaChhc3NldCk7XG4gICAgICAgICAgICB0aGlzLl9sb2FkaW5nQXNzZXRzLmRlbGV0ZShhc3NldCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fbG9hZGluZ0Fzc2V0cy5zaXplID09PSAwKSB7XG4gICAgICAgICAgICAvLyBjYWxsIG5leHQgdGljayBiZWNhdXNlIHdlIHdhbnRcbiAgICAgICAgICAgIC8vIHRoaXMgdG8gYmUgZmlyZWQgYWZ0ZXIgYW55IG90aGVyXG4gICAgICAgICAgICAvLyBhc3NldCBsb2FkIGV2ZW50c1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZGluZ0NvbXBsZXRlKHRoaXMuX2ZhaWxlZCk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNhbGxlZCB3aGVuIGEgZXhwZWN0ZWQgYXNzZXQgaXMgYWRkZWQgdG8gdGhlIGFzc2V0IHJlZ2lzdHJ5XG4gICAgX29uQWRkQXNzZXQoYXNzZXQpIHtcbiAgICAgICAgLy8gcmVtb3ZlIGZyb20gd2FpdGluZyBsaXN0XG4gICAgICAgIHRoaXMuX3dhaXRpbmdBc3NldHMuZGVsZXRlKGFzc2V0KTtcblxuICAgICAgICB0aGlzLl9hc3NldHMuYWRkKGFzc2V0KTtcbiAgICAgICAgaWYgKCFhc3NldC5sb2FkZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdBc3NldHMuYWRkKGFzc2V0KTtcbiAgICAgICAgICAgIHRoaXMuX3JlZ2lzdHJ5LmxvYWQoYXNzZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3dhaXRGb3JBc3NldChhc3NldElkKSB7XG4gICAgICAgIHRoaXMuX3dhaXRpbmdBc3NldHMuYWRkKGFzc2V0SWQpO1xuICAgICAgICB0aGlzLl9yZWdpc3RyeS5vbmNlKCdhZGQ6JyArIGFzc2V0SWQsIHRoaXMuX29uQWRkQXNzZXQsIHRoaXMpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgQXNzZXRMaXN0TG9hZGVyIH07XG4iXSwibmFtZXMiOlsiQXNzZXRMaXN0TG9hZGVyIiwiRXZlbnRIYW5kbGVyIiwiY29uc3RydWN0b3IiLCJhc3NldExpc3QiLCJhc3NldFJlZ2lzdHJ5IiwiX2Fzc2V0cyIsIlNldCIsIl9sb2FkaW5nQXNzZXRzIiwiX3dhaXRpbmdBc3NldHMiLCJfcmVnaXN0cnkiLCJfbG9hZGluZyIsIl9sb2FkZWQiLCJfZmFpbGVkIiwiZm9yRWFjaCIsImEiLCJBc3NldCIsInJlZ2lzdHJ5IiwiYWRkIiwiYXNzZXQiLCJnZXQiLCJfd2FpdEZvckFzc2V0IiwiZGVzdHJveSIsInNlbGYiLCJvZmYiLCJfb25Mb2FkIiwiX29uRXJyb3IiLCJpZCIsIl9vbkFkZEFzc2V0IiwiX2Fzc2V0SGFzRGVwZW5kZW5jaWVzIiwidHlwZSIsImZpbGUiLCJ1cmwiLCJtYXRjaCIsImxvYWQiLCJkb25lIiwic2NvcGUiLCJjb25zb2xlIiwiZGVidWciLCJfY2FsbGJhY2siLCJfc2NvcGUiLCJvbiIsImxvYWRpbmdBc3NldHMiLCJsb2FkZWQiLCJsb2FkRnJvbVVybCIsImVyciIsImxvYWRlZEFzc2V0Iiwic2l6ZSIsIl9sb2FkaW5nQ29tcGxldGUiLCJyZWFkeSIsImNhbGwiLCJBcnJheSIsImZyb20iLCJvbmNlIiwiYXNzZXRzIiwibGVuZ3RoIiwiZmlyZSIsImhhcyIsImRlbGV0ZSIsInNldFRpbWVvdXQiLCJwdXNoIiwiYXNzZXRJZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFzQkEsTUFBTUEsZUFBZSxTQUFTQyxZQUFZLENBQUM7QUFZdkNDLEVBQUFBLFdBQVcsQ0FBQ0MsU0FBUyxFQUFFQyxhQUFhLEVBQUU7QUFDbEMsSUFBQSxLQUFLLEVBQUUsQ0FBQTtBQUNQLElBQUEsSUFBSSxDQUFDQyxPQUFPLEdBQUcsSUFBSUMsR0FBRyxFQUFFLENBQUE7QUFDeEIsSUFBQSxJQUFJLENBQUNDLGNBQWMsR0FBRyxJQUFJRCxHQUFHLEVBQUUsQ0FBQTtBQUMvQixJQUFBLElBQUksQ0FBQ0UsY0FBYyxHQUFHLElBQUlGLEdBQUcs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
