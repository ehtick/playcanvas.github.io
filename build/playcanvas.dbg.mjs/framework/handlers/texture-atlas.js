/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { path } from '../../core/path.js';
import { Vec2 } from '../../core/math/vec2.js';
import { Vec4 } from '../../core/math/vec4.js';
import { TEXTURETYPE_RGBM, TEXTURETYPE_DEFAULT, ADDRESS_REPEAT, ADDRESS_CLAMP_TO_EDGE, ADDRESS_MIRRORED_REPEAT, FILTER_NEAREST, FILTER_LINEAR, FILTER_NEAREST_MIPMAP_NEAREST, FILTER_LINEAR_MIPMAP_NEAREST, FILTER_NEAREST_MIPMAP_LINEAR, FILTER_LINEAR_MIPMAP_LINEAR } from '../../platform/graphics/constants.js';
import { http } from '../../platform/net/http.js';
import { TextureAtlas } from '../../scene/texture-atlas.js';

/** @typedef {import('./handler.js').ResourceHandler} ResourceHandler */

const JSON_ADDRESS_MODE = {
  'repeat': ADDRESS_REPEAT,
  'clamp': ADDRESS_CLAMP_TO_EDGE,
  'mirror': ADDRESS_MIRRORED_REPEAT
};
const JSON_FILTER_MODE = {
  'nearest': FILTER_NEAREST,
  'linear': FILTER_LINEAR,
  'nearest_mip_nearest': FILTER_NEAREST_MIPMAP_NEAREST,
  'linear_mip_nearest': FILTER_LINEAR_MIPMAP_NEAREST,
  'nearest_mip_linear': FILTER_NEAREST_MIPMAP_LINEAR,
  'linear_mip_linear': FILTER_LINEAR_MIPMAP_LINEAR
};
const regexFrame = /^data\.frames\.(\d+)$/;

/**
 * Resource handler used for loading {@link TextureAtlas} resources.
 *
 * @implements {ResourceHandler}
 */
class TextureAtlasHandler {
  /**
   * Type of the resource the handler handles.
   *
   * @type {string}
   */

  /**
   * Create a new TextureAtlasHandler instance.
   *
   * @param {import('../app-base.js').AppBase} app - The running {@link AppBase}.
   * @hideconstructor
   */
  constructor(app) {
    this.handlerType = "textureatlas";
    this._loader = app.loader;
    this.maxRetries = 0;
  }

  // Load the texture atlas texture using the texture resource loader
  load(url, callback) {
    if (typeof url === 'string') {
      url = {
        load: url,
        original: url
      };
    }
    const self = this;
    const handler = this._loader.getHandler('texture');

    // if supplied with a json file url (probably engine-only)
    // load json data then load texture of same name
    if (path.getExtension(url.original) === '.json') {
      http.get(url.load, {
        retry: this.maxRetries > 0,
        maxRetries: this.maxRetries
      }, function (err, response) {
        if (!err) {
          // load texture
          const textureUrl = url.original.replace('.json', '.png');
          self._loader.load(textureUrl, 'texture', function (err, texture) {
            if (err) {
              callback(err);
            } else {
              callback(null, {
                data: response,
                texture: texture
              });
            }
          });
        } else {
          callback(err);
        }
      });
    } else {
      return handler.load(url, callback);
    }
  }

  // Create texture atlas resource using the texture from the texture loader
  open(url, data) {
    const resource = new TextureAtlas();
    if (data.texture && data.data) {
      resource.texture = data.texture;
      resource.__data = data.data; // store data temporarily to be copied into asset
    } else {
      const handler = this._loader.getHandler('texture');
      const texture = handler.open(url, data);
      if (!texture) return null;
      resource.texture = texture;
    }
    return resource;
  }
  patch(asset, assets) {
    // during editor update the underlying texture is temporarily null. just return in that case.
    if (!asset.resource) {
      return;
    }
    if (asset.resource.__data) {
      // engine-only, so copy temporary asset data from texture atlas into asset and delete temp property
      if (asset.resource.__data.minfilter !== undefined) asset.data.minfilter = asset.resource.__data.minfilter;
      if (asset.resource.__data.magfilter !== undefined) asset.data.magfilter = asset.resource.__data.magfilter;
      if (asset.resource.__data.addressu !== undefined) asset.data.addressu = asset.resource.__data.addressu;
      if (asset.resource.__data.addressv !== undefined) asset.data.addressv = asset.resource.__data.addressv;
      if (asset.resource.__data.mipmaps !== undefined) asset.data.mipmaps = asset.resource.__data.mipmaps;
      if (asset.resource.__data.anisotropy !== undefined) asset.data.anisotropy = asset.resource.__data.anisotropy;
      if (asset.resource.__data.rgbm !== undefined) asset.data.rgbm = !!asset.resource.__data.rgbm;
      asset.data.frames = asset.resource.__data.frames;
      delete asset.resource.__data;
    }

    // pass texture data
    const texture = asset.resource.texture;
    if (texture) {
      texture.name = asset.name;
      if (asset.data.hasOwnProperty('minfilter') && texture.minFilter !== JSON_FILTER_MODE[asset.data.minfilter]) texture.minFilter = JSON_FILTER_MODE[asset.data.minfilter];
      if (asset.data.hasOwnProperty('magfilter') && texture.magFilter !== JSON_FILTER_MODE[asset.data.magfilter]) texture.magFilter = JSON_FILTER_MODE[asset.data.magfilter];
      if (asset.data.hasOwnProperty('addressu') && texture.addressU !== JSON_ADDRESS_MODE[asset.data.addressu]) texture.addressU = JSON_ADDRESS_MODE[asset.data.addressu];
      if (asset.data.hasOwnProperty('addressv') && texture.addressV !== JSON_ADDRESS_MODE[asset.data.addressv]) texture.addressV = JSON_ADDRESS_MODE[asset.data.addressv];
      if (asset.data.hasOwnProperty('mipmaps') && texture.mipmaps !== asset.data.mipmaps) texture.mipmaps = asset.data.mipmaps;
      if (asset.data.hasOwnProperty('anisotropy') && texture.anisotropy !== asset.data.anisotropy) texture.anisotropy = asset.data.anisotropy;
      if (asset.data.hasOwnProperty('rgbm')) {
        const type = asset.data.rgbm ? TEXTURETYPE_RGBM : TEXTURETYPE_DEFAULT;
        if (texture.type !== type) {
          texture.type = type;
        }
      }
    }
    asset.resource.texture = texture;

    // set frames
    const frames = {};
    for (const key in asset.data.frames) {
      const frame = asset.data.frames[key];
      frames[key] = {
        rect: new Vec4(frame.rect),
        pivot: new Vec2(frame.pivot),
        border: new Vec4(frame.border)
      };
    }
    asset.resource.frames = frames;
    asset.off('change', this._onAssetChange, this);
    asset.on('change', this._onAssetChange, this);
  }
  _onAssetChange(asset, attribute, value) {
    let frame;
    if (attribute === 'data' || attribute === 'data.frames') {
      // set frames
      const frames = {};
      for (const key in value.frames) {
        frame = value.frames[key];
        frames[key] = {
          rect: new Vec4(frame.rect),
          pivot: new Vec2(frame.pivot),
          border: new Vec4(frame.border)
        };
      }
      asset.resource.frames = frames;
    } else {
      const match = attribute.match(regexFrame);
      if (match) {
        const frameKey = match[1];
        if (value) {
          // add or update frame
          if (!asset.resource.frames[frameKey]) {
            asset.resource.frames[frameKey] = {
              rect: new Vec4(value.rect),
              pivot: new Vec2(value.pivot),
              border: new Vec4(value.border)
            };
          } else {
            frame = asset.resource.frames[frameKey];
            frame.rect.set(value.rect[0], value.rect[1], value.rect[2], value.rect[3]);
            frame.pivot.set(value.pivot[0], value.pivot[1]);
            frame.border.set(value.border[0], value.border[1], value.border[2], value.border[3]);
          }
          asset.resource.fire('set:frame', frameKey, asset.resource.frames[frameKey]);
        } else {
          // delete frame
          if (asset.resource.frames[frameKey]) {
            delete asset.resource.frames[frameKey];
            asset.resource.fire('remove:frame', frameKey);
          }
        }
      }
    }
  }
}

export { TextureAtlasHandler };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dHVyZS1hdGxhcy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9oYW5kbGVycy90ZXh0dXJlLWF0bGFzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHBhdGggfSBmcm9tICcuLi8uLi9jb3JlL3BhdGguanMnO1xuaW1wb3J0IHsgVmVjMiB9IGZyb20gJy4uLy4uL2NvcmUvbWF0aC92ZWMyLmpzJztcbmltcG9ydCB7IFZlYzQgfSBmcm9tICcuLi8uLi9jb3JlL21hdGgvdmVjNC5qcyc7XG5cbmltcG9ydCB7XG4gICAgQUREUkVTU19DTEFNUF9UT19FREdFLCBBRERSRVNTX01JUlJPUkVEX1JFUEVBVCwgQUREUkVTU19SRVBFQVQsXG4gICAgRklMVEVSX0xJTkVBUiwgRklMVEVSX05FQVJFU1QsIEZJTFRFUl9ORUFSRVNUX01JUE1BUF9ORUFSRVNULCBGSUxURVJfTkVBUkVTVF9NSVBNQVBfTElORUFSLCBGSUxURVJfTElORUFSX01JUE1BUF9ORUFSRVNULCBGSUxURVJfTElORUFSX01JUE1BUF9MSU5FQVIsXG4gICAgVEVYVFVSRVRZUEVfREVGQVVMVCwgVEVYVFVSRVRZUEVfUkdCTVxufSBmcm9tICcuLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgaHR0cCB9IGZyb20gJy4uLy4uL3BsYXRmb3JtL25ldC9odHRwLmpzJztcblxuaW1wb3J0IHsgVGV4dHVyZUF0bGFzIH0gZnJvbSAnLi4vLi4vc2NlbmUvdGV4dHVyZS1hdGxhcy5qcyc7XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL2hhbmRsZXIuanMnKS5SZXNvdXJjZUhhbmRsZXJ9IFJlc291cmNlSGFuZGxlciAqL1xuXG5jb25zdCBKU09OX0FERFJFU1NfTU9ERSA9IHtcbiAgICAncmVwZWF0JzogQUREUkVTU19SRVBFQVQsXG4gICAgJ2NsYW1wJzogQUREUkVTU19DTEFNUF9UT19FREdFLFxuICAgICdtaXJyb3InOiBBRERSRVNTX01JUlJPUkVEX1JFUEVBVFxufTtcblxuY29uc3QgSlNPTl9GSUxURVJfTU9ERSA9IHtcbiAgICAnbmVhcmVzdCc6IEZJTFRFUl9ORUFSRVNULFxuICAgICdsaW5lYXInOiBGSUxURVJfTElORUFSLFxuICAgICduZWFyZXN0X21pcF9uZWFyZXN0JzogRklMVEVSX05FQVJFU1RfTUlQTUFQX05FQVJFU1QsXG4gICAgJ2xpbmVhcl9taXBfbmVhcmVzdCc6IEZJTFRFUl9MSU5FQVJfTUlQTUFQX05FQVJFU1QsXG4gICAgJ25lYXJlc3RfbWlwX2xpbmVhcic6IEZJTFRFUl9ORUFSRVNUX01JUE1BUF9MSU5FQVIsXG4gICAgJ2xpbmVhcl9taXBfbGluZWFyJzogRklMVEVSX0xJTkVBUl9NSVBNQVBfTElORUFSXG59O1xuXG5jb25zdCByZWdleEZyYW1lID0gL15kYXRhXFwuZnJhbWVzXFwuKFxcZCspJC87XG5cbi8qKlxuICogUmVzb3VyY2UgaGFuZGxlciB1c2VkIGZvciBsb2FkaW5nIHtAbGluayBUZXh0dXJlQXRsYXN9IHJlc291cmNlcy5cbiAqXG4gKiBAaW1wbGVtZW50cyB7UmVzb3VyY2VIYW5kbGVyfVxuICovXG5jbGFzcyBUZXh0dXJlQXRsYXNIYW5kbGVyIHtcbiAgICAvKipcbiAgICAgKiBUeXBlIG9mIHRoZSByZXNvdXJjZSB0aGUgaGFuZGxlciBoYW5kbGVzLlxuICAgICAqXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBoYW5kbGVyVHlwZSA9IFwidGV4dHVyZWF0bGFzXCI7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgVGV4dHVyZUF0bGFzSGFuZGxlciBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi9hcHAtYmFzZS5qcycpLkFwcEJhc2V9IGFwcCAtIFRoZSBydW5uaW5nIHtAbGluayBBcHBCYXNlfS5cbiAgICAgKiBAaGlkZWNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXBwKSB7XG4gICAgICAgIHRoaXMuX2xvYWRlciA9IGFwcC5sb2FkZXI7XG4gICAgICAgIHRoaXMubWF4UmV0cmllcyA9IDA7XG4gICAgfVxuXG4gICAgLy8gTG9hZCB0aGUgdGV4dHVyZSBhdGxhcyB0ZXh0dXJlIHVzaW5nIHRoZSB0ZXh0dXJlIHJlc291cmNlIGxvYWRlclxuICAgIGxvYWQodXJsLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIHVybCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHVybCA9IHtcbiAgICAgICAgICAgICAgICBsb2FkOiB1cmwsXG4gICAgICAgICAgICAgICAgb3JpZ2luYWw6IHVybFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fbG9hZGVyLmdldEhhbmRsZXIoJ3RleHR1cmUnKTtcblxuICAgICAgICAvLyBpZiBzdXBwbGllZCB3aXRoIGEganNvbiBmaWxlIHVybCAocHJvYmFibHkgZW5naW5lLW9ubHkpXG4gICAgICAgIC8vIGxvYWQganNvbiBkYXRhIHRoZW4gbG9hZCB0ZXh0dXJlIG9mIHNhbWUgbmFtZVxuICAgICAgICBpZiAocGF0aC5nZXRFeHRlbnNpb24odXJsLm9yaWdpbmFsKSA9PT0gJy5qc29uJykge1xuICAgICAgICAgICAgaHR0cC5nZXQodXJsLmxvYWQsIHtcbiAgICAgICAgICAgICAgICByZXRyeTogdGhpcy5tYXhSZXRyaWVzID4gMCxcbiAgICAgICAgICAgICAgICBtYXhSZXRyaWVzOiB0aGlzLm1heFJldHJpZXNcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9hZCB0ZXh0dXJlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHR1cmVVcmwgPSB1cmwub3JpZ2luYWwucmVwbGFjZSgnLmpzb24nLCAnLnBuZycpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9sb2FkZXIubG9hZCh0ZXh0dXJlVXJsLCAndGV4dHVyZScsIGZ1bmN0aW9uIChlcnIsIHRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlOiB0ZXh0dXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlci5sb2FkKHVybCwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRleHR1cmUgYXRsYXMgcmVzb3VyY2UgdXNpbmcgdGhlIHRleHR1cmUgZnJvbSB0aGUgdGV4dHVyZSBsb2FkZXJcbiAgICBvcGVuKHVybCwgZGF0YSkge1xuICAgICAgICBjb25zdCByZXNvdXJjZSA9IG5ldyBUZXh0dXJlQXRsYXMoKTtcbiAgICAgICAgaWYgKGRhdGEudGV4dHVyZSAmJiBkYXRhLmRhdGEpIHtcbiAgICAgICAgICAgIHJlc291cmNlLnRleHR1cmUgPSBkYXRhLnRleHR1cmU7XG4gICAgICAgICAgICByZXNvdXJjZS5fX2RhdGEgPSBkYXRhLmRhdGE7IC8vIHN0b3JlIGRhdGEgdGVtcG9yYXJpbHkgdG8gYmUgY29waWVkIGludG8gYXNzZXRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9sb2FkZXIuZ2V0SGFuZGxlcigndGV4dHVyZScpO1xuICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9IGhhbmRsZXIub3Blbih1cmwsIGRhdGEpO1xuICAgICAgICAgICAgaWYgKCF0ZXh0dXJlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJlc291cmNlLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvdXJjZTtcbiAgICB9XG5cbiAgICBwYXRjaChhc3NldCwgYXNzZXRzKSB7XG4gICAgICAgIC8vIGR1cmluZyBlZGl0b3IgdXBkYXRlIHRoZSB1bmRlcmx5aW5nIHRleHR1cmUgaXMgdGVtcG9yYXJpbHkgbnVsbC4ganVzdCByZXR1cm4gaW4gdGhhdCBjYXNlLlxuICAgICAgICBpZiAoIWFzc2V0LnJlc291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXNzZXQucmVzb3VyY2UuX19kYXRhKSB7XG4gICAgICAgICAgICAvLyBlbmdpbmUtb25seSwgc28gY29weSB0ZW1wb3JhcnkgYXNzZXQgZGF0YSBmcm9tIHRleHR1cmUgYXRsYXMgaW50byBhc3NldCBhbmQgZGVsZXRlIHRlbXAgcHJvcGVydHlcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEubWluZmlsdGVyICE9PSB1bmRlZmluZWQpIGFzc2V0LmRhdGEubWluZmlsdGVyID0gYXNzZXQucmVzb3VyY2UuX19kYXRhLm1pbmZpbHRlcjtcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEubWFnZmlsdGVyICE9PSB1bmRlZmluZWQpIGFzc2V0LmRhdGEubWFnZmlsdGVyID0gYXNzZXQucmVzb3VyY2UuX19kYXRhLm1hZ2ZpbHRlcjtcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEuYWRkcmVzc3UgIT09IHVuZGVmaW5lZCkgYXNzZXQuZGF0YS5hZGRyZXNzdSA9IGFzc2V0LnJlc291cmNlLl9fZGF0YS5hZGRyZXNzdTtcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEuYWRkcmVzc3YgIT09IHVuZGVmaW5lZCkgYXNzZXQuZGF0YS5hZGRyZXNzdiA9IGFzc2V0LnJlc291cmNlLl9fZGF0YS5hZGRyZXNzdjtcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEubWlwbWFwcyAhPT0gdW5kZWZpbmVkKSBhc3NldC5kYXRhLm1pcG1hcHMgPSBhc3NldC5yZXNvdXJjZS5fX2RhdGEubWlwbWFwcztcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEuYW5pc290cm9weSAhPT0gdW5kZWZpbmVkKSBhc3NldC5kYXRhLmFuaXNvdHJvcHkgPSBhc3NldC5yZXNvdXJjZS5fX2RhdGEuYW5pc290cm9weTtcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEucmdibSAhPT0gdW5kZWZpbmVkKSBhc3NldC5kYXRhLnJnYm0gPSAhIWFzc2V0LnJlc291cmNlLl9fZGF0YS5yZ2JtO1xuXG4gICAgICAgICAgICBhc3NldC5kYXRhLmZyYW1lcyA9IGFzc2V0LnJlc291cmNlLl9fZGF0YS5mcmFtZXM7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBhc3NldC5yZXNvdXJjZS5fX2RhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwYXNzIHRleHR1cmUgZGF0YVxuICAgICAgICBjb25zdCB0ZXh0dXJlID0gYXNzZXQucmVzb3VyY2UudGV4dHVyZTtcbiAgICAgICAgaWYgKHRleHR1cmUpIHtcbiAgICAgICAgICAgIHRleHR1cmUubmFtZSA9IGFzc2V0Lm5hbWU7XG5cbiAgICAgICAgICAgIGlmIChhc3NldC5kYXRhLmhhc093blByb3BlcnR5KCdtaW5maWx0ZXInKSAmJiB0ZXh0dXJlLm1pbkZpbHRlciAhPT0gSlNPTl9GSUxURVJfTU9ERVthc3NldC5kYXRhLm1pbmZpbHRlcl0pXG4gICAgICAgICAgICAgICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBKU09OX0ZJTFRFUl9NT0RFW2Fzc2V0LmRhdGEubWluZmlsdGVyXTtcblxuICAgICAgICAgICAgaWYgKGFzc2V0LmRhdGEuaGFzT3duUHJvcGVydHkoJ21hZ2ZpbHRlcicpICYmIHRleHR1cmUubWFnRmlsdGVyICE9PSBKU09OX0ZJTFRFUl9NT0RFW2Fzc2V0LmRhdGEubWFnZmlsdGVyXSlcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLm1hZ0ZpbHRlciA9IEpTT05fRklMVEVSX01PREVbYXNzZXQuZGF0YS5tYWdmaWx0ZXJdO1xuXG4gICAgICAgICAgICBpZiAoYXNzZXQuZGF0YS5oYXNPd25Qcm9wZXJ0eSgnYWRkcmVzc3UnKSAmJiB0ZXh0dXJlLmFkZHJlc3NVICE9PSBKU09OX0FERFJFU1NfTU9ERVthc3NldC5kYXRhLmFkZHJlc3N1XSlcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLmFkZHJlc3NVID0gSlNPTl9BRERSRVNTX01PREVbYXNzZXQuZGF0YS5hZGRyZXNzdV07XG5cbiAgICAgICAgICAgIGlmIChhc3NldC5kYXRhLmhhc093blByb3BlcnR5KCdhZGRyZXNzdicpICYmIHRleHR1cmUuYWRkcmVzc1YgIT09IEpTT05fQUREUkVTU19NT0RFW2Fzc2V0LmRhdGEuYWRkcmVzc3ZdKVxuICAgICAgICAgICAgICAgIHRleHR1cmUuYWRkcmVzc1YgPSBKU09OX0FERFJFU1NfTU9ERVthc3NldC5kYXRhLmFkZHJlc3N2XTtcblxuICAgICAgICAgICAgaWYgKGFzc2V0LmRhdGEuaGFzT3duUHJvcGVydHkoJ21pcG1hcHMnKSAmJiB0ZXh0dXJlLm1pcG1hcHMgIT09IGFzc2V0LmRhdGEubWlwbWFwcylcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLm1pcG1hcHMgPSBhc3NldC5kYXRhLm1pcG1hcHM7XG5cbiAgICAgICAgICAgIGlmIChhc3NldC5kYXRhLmhhc093blByb3BlcnR5KCdhbmlzb3Ryb3B5JykgJiYgdGV4dHVyZS5hbmlzb3Ryb3B5ICE9PSBhc3NldC5kYXRhLmFuaXNvdHJvcHkpXG4gICAgICAgICAgICAgICAgdGV4dHVyZS5hbmlzb3Ryb3B5ID0gYXNzZXQuZGF0YS5hbmlzb3Ryb3B5O1xuXG4gICAgICAgICAgICBpZiAoYXNzZXQuZGF0YS5oYXNPd25Qcm9wZXJ0eSgncmdibScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGFzc2V0LmRhdGEucmdibSA/IFRFWFRVUkVUWVBFX1JHQk0gOiBURVhUVVJFVFlQRV9ERUZBVUxUO1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0dXJlLnR5cGUgIT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS50eXBlID0gdHlwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhc3NldC5yZXNvdXJjZS50ZXh0dXJlID0gdGV4dHVyZTtcblxuICAgICAgICAvLyBzZXQgZnJhbWVzXG4gICAgICAgIGNvbnN0IGZyYW1lcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhc3NldC5kYXRhLmZyYW1lcykge1xuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBhc3NldC5kYXRhLmZyYW1lc1trZXldO1xuICAgICAgICAgICAgZnJhbWVzW2tleV0gPSB7XG4gICAgICAgICAgICAgICAgcmVjdDogbmV3IFZlYzQoZnJhbWUucmVjdCksXG4gICAgICAgICAgICAgICAgcGl2b3Q6IG5ldyBWZWMyKGZyYW1lLnBpdm90KSxcbiAgICAgICAgICAgICAgICBib3JkZXI6IG5ldyBWZWM0KGZyYW1lLmJvcmRlcilcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgYXNzZXQucmVzb3VyY2UuZnJhbWVzID0gZnJhbWVzO1xuXG4gICAgICAgIGFzc2V0Lm9mZignY2hhbmdlJywgdGhpcy5fb25Bc3NldENoYW5nZSwgdGhpcyk7XG4gICAgICAgIGFzc2V0Lm9uKCdjaGFuZ2UnLCB0aGlzLl9vbkFzc2V0Q2hhbmdlLCB0aGlzKTtcbiAgICB9XG5cbiAgICBfb25Bc3NldENoYW5nZShhc3NldCwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgICBsZXQgZnJhbWU7XG5cbiAgICAgICAgaWYgKGF0dHJpYnV0ZSA9PT0gJ2RhdGEnIHx8IGF0dHJpYnV0ZSA9PT0gJ2RhdGEuZnJhbWVzJykge1xuICAgICAgICAgICAgLy8gc2V0IGZyYW1lc1xuICAgICAgICAgICAgY29uc3QgZnJhbWVzID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB2YWx1ZS5mcmFtZXMpIHtcbiAgICAgICAgICAgICAgICBmcmFtZSA9IHZhbHVlLmZyYW1lc1trZXldO1xuICAgICAgICAgICAgICAgIGZyYW1lc1trZXldID0ge1xuICAgICAgICAgICAgICAgICAgICByZWN0OiBuZXcgVmVjNChmcmFtZS5yZWN0KSxcbiAgICAgICAgICAgICAgICAgICAgcGl2b3Q6IG5ldyBWZWMyKGZyYW1lLnBpdm90KSxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiBuZXcgVmVjNChmcmFtZS5ib3JkZXIpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFzc2V0LnJlc291cmNlLmZyYW1lcyA9IGZyYW1lcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gYXR0cmlidXRlLm1hdGNoKHJlZ2V4RnJhbWUpO1xuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZnJhbWVLZXkgPSBtYXRjaFsxXTtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgb3IgdXBkYXRlIGZyYW1lXG4gICAgICAgICAgICAgICAgICAgIGlmICghYXNzZXQucmVzb3VyY2UuZnJhbWVzW2ZyYW1lS2V5XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXQucmVzb3VyY2UuZnJhbWVzW2ZyYW1lS2V5XSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN0OiBuZXcgVmVjNCh2YWx1ZS5yZWN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaXZvdDogbmV3IFZlYzIodmFsdWUucGl2b3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogbmV3IFZlYzQodmFsdWUuYm9yZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lID0gYXNzZXQucmVzb3VyY2UuZnJhbWVzW2ZyYW1lS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lLnJlY3Quc2V0KHZhbHVlLnJlY3RbMF0sIHZhbHVlLnJlY3RbMV0sIHZhbHVlLnJlY3RbMl0sIHZhbHVlLnJlY3RbM10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhbWUucGl2b3Quc2V0KHZhbHVlLnBpdm90WzBdLCB2YWx1ZS5waXZvdFsxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZS5ib3JkZXIuc2V0KHZhbHVlLmJvcmRlclswXSwgdmFsdWUuYm9yZGVyWzFdLCB2YWx1ZS5ib3JkZXJbMl0sIHZhbHVlLmJvcmRlclszXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBhc3NldC5yZXNvdXJjZS5maXJlKCdzZXQ6ZnJhbWUnLCBmcmFtZUtleSwgYXNzZXQucmVzb3VyY2UuZnJhbWVzW2ZyYW1lS2V5XSk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBkZWxldGUgZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFzc2V0LnJlc291cmNlLmZyYW1lc1tmcmFtZUtleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhc3NldC5yZXNvdXJjZS5mcmFtZXNbZnJhbWVLZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXQucmVzb3VyY2UuZmlyZSgncmVtb3ZlOmZyYW1lJywgZnJhbWVLZXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IFRleHR1cmVBdGxhc0hhbmRsZXIgfTtcbiJdLCJuYW1lcyI6WyJKU09OX0FERFJFU1NfTU9ERSIsIkFERFJFU1NfUkVQRUFUIiwiQUREUkVTU19DTEFNUF9UT19FREdFIiwiQUREUkVTU19NSVJST1JFRF9SRVBFQVQiLCJKU09OX0ZJTFRFUl9NT0RFIiwiRklMVEVSX05FQVJFU1QiLCJGSUxURVJfTElORUFSIiwiRklMVEVSX05FQVJFU1RfTUlQTUFQX05FQVJFU1QiLCJGSUxURVJfTElORUFSX01JUE1BUF9ORUFSRVNUIiwiRklMVEVSX05FQVJFU1RfTUlQTUFQX0xJTkVBUiIsIkZJTFRFUl9MSU5FQVJfTUlQTUFQX0xJTkVBUiIsInJlZ2V4RnJhbWUiLCJUZXh0dXJlQXRsYXNIYW5kbGVyIiwiY29uc3RydWN0b3IiLCJhcHAiLCJoYW5kbGVyVHlwZSIsIl9sb2FkZXIiLCJsb2FkZXIiLCJtYXhSZXRyaWVzIiwibG9hZCIsInVybCIsImNhbGxiYWNrIiwib3JpZ2luYWwiLCJzZWxmIiwiaGFuZGxlciIsImdldEhhbmRsZXIiLCJwYXRoIiwiZ2V0RXh0ZW5zaW9uIiwiaHR0cCIsImdldCIsInJldHJ5IiwiZXJyIiwicmVzcG9uc2UiLCJ0ZXh0dXJlVXJsIiwicmVwbGFjZSIsInRleHR1cmUiLCJkYXRhIiwib3BlbiIsInJlc291cmNlIiwiVGV4dHVyZUF0bGFzIiwiX19kYXRhIiwicGF0Y2giLCJhc3NldCIsImFzc2V0cyIsIm1pbmZpbHRlciIsInVuZGVmaW5lZCIsIm1hZ2ZpbHRlciIsImFkZHJlc3N1IiwiYWRkcmVzc3YiLCJtaXBtYXBzIiwiYW5pc290cm9weSIsInJnYm0iLCJmcmFtZXMiLCJuYW1lIiwiaGFzT3duUHJvcGVydHkiLCJtaW5GaWx0ZXIiLCJtYWdGaWx0ZXIiLCJhZGRyZXNzVSIsImFkZHJlc3NWIiwidHlwZSIsIlRFWFRVUkVUWVBFX1JHQk0iLCJURVhUVVJFVFlQRV9ERUZBVUxUIiwia2V5IiwiZnJhbWUiLCJyZWN0IiwiVmVjNCIsInBpdm90IiwiVmVjMiIsImJvcmRlciIsIm9mZiIsIl9vbkFzc2V0Q2hhbmdlIiwib24iLCJhdHRyaWJ1dGUiLCJ2YWx1ZSIsIm1hdGNoIiwiZnJhbWVLZXkiLCJzZXQiLCJmaXJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFhQTs7QUFFQSxNQUFNQSxpQkFBaUIsR0FBRztBQUN0QixFQUFBLFFBQVEsRUFBRUMsY0FBYztBQUN4QixFQUFBLE9BQU8sRUFBRUMscUJBQXFCO0FBQzlCLEVBQUEsUUFBUSxFQUFFQyx1QkFBQUE7QUFDZCxDQUFDLENBQUE7QUFFRCxNQUFNQyxnQkFBZ0IsR0FBRztBQUNyQixFQUFBLFNBQVMsRUFBRUMsY0FBYztBQUN6QixFQUFBLFFBQVEsRUFBRUMsYUFBYTtBQUN2QixFQUFBLHFCQUFxQixFQUFFQyw2QkFBNkI7QUFDcEQsRUFBQSxvQkFBb0IsRUFBRUMsNEJBQTRCO0FBQ2xELEVBQUEsb0JBQW9CLEVBQUVDLDRCQUE0QjtBQUNsRCxFQUFBLG1CQUFtQixFQUFFQywyQkFBQUE7QUFDekIsQ0FBQyxDQUFBO0FBRUQsTUFBTUMsVUFBVSxHQUFHLHVCQUF1QixDQUFBOztBQUUxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsbUJBQW1CLENBQUM7QUFDdEI7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFHSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDSUMsV0FBV0EsQ0FBQ0MsR0FBRyxFQUFFO0lBQUEsSUFSakJDLENBQUFBLFdB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
