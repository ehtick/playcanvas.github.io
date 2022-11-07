/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { path } from '../core/path.js';
import { http } from '../net/http.js';
import { Vec2 } from '../math/vec2.js';
import { Vec4 } from '../math/vec4.js';
import { TEXTURETYPE_RGBM, TEXTURETYPE_DEFAULT, ADDRESS_REPEAT, ADDRESS_CLAMP_TO_EDGE, ADDRESS_MIRRORED_REPEAT, FILTER_NEAREST, FILTER_LINEAR, FILTER_NEAREST_MIPMAP_NEAREST, FILTER_LINEAR_MIPMAP_NEAREST, FILTER_NEAREST_MIPMAP_LINEAR, FILTER_LINEAR_MIPMAP_LINEAR } from '../graphics/constants.js';
import { TextureAtlas } from '../scene/texture-atlas.js';

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

class TextureAtlasHandler {
  constructor(app) {
    this.handlerType = "textureatlas";
    this._loader = app.loader;
    this.maxRetries = 0;
  }

  load(url, callback) {
    if (typeof url === 'string') {
      url = {
        load: url,
        original: url
      };
    }

    const self = this;

    const handler = this._loader.getHandler('texture');

    if (path.getExtension(url.original) === '.json') {
      http.get(url.load, {
        retry: this.maxRetries > 0,
        maxRetries: this.maxRetries
      }, function (err, response) {
        if (!err) {
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

  open(url, data) {
    const resource = new TextureAtlas();

    if (data.texture && data.data) {
      resource.texture = data.texture;
      resource.__data = data.data;
    } else {
      const handler = this._loader.getHandler('texture');

      const texture = handler.open(url, data);
      if (!texture) return null;
      resource.texture = texture;
    }

    return resource;
  }

  patch(asset, assets) {
    if (!asset.resource) {
      return;
    }

    if (asset.resource.__data) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dHVyZS1hdGxhcy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc291cmNlcy90ZXh0dXJlLWF0bGFzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHBhdGggfSBmcm9tICcuLi9jb3JlL3BhdGguanMnO1xuXG5pbXBvcnQgeyBodHRwIH0gZnJvbSAnLi4vbmV0L2h0dHAuanMnO1xuXG5pbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi4vbWF0aC92ZWMyLmpzJztcbmltcG9ydCB7IFZlYzQgfSBmcm9tICcuLi9tYXRoL3ZlYzQuanMnO1xuXG5pbXBvcnQge1xuICAgIEFERFJFU1NfQ0xBTVBfVE9fRURHRSwgQUREUkVTU19NSVJST1JFRF9SRVBFQVQsIEFERFJFU1NfUkVQRUFULFxuICAgIEZJTFRFUl9MSU5FQVIsIEZJTFRFUl9ORUFSRVNULCBGSUxURVJfTkVBUkVTVF9NSVBNQVBfTkVBUkVTVCwgRklMVEVSX05FQVJFU1RfTUlQTUFQX0xJTkVBUiwgRklMVEVSX0xJTkVBUl9NSVBNQVBfTkVBUkVTVCwgRklMVEVSX0xJTkVBUl9NSVBNQVBfTElORUFSLFxuICAgIFRFWFRVUkVUWVBFX0RFRkFVTFQsIFRFWFRVUkVUWVBFX1JHQk1cbn0gZnJvbSAnLi4vZ3JhcGhpY3MvY29uc3RhbnRzLmpzJztcblxuaW1wb3J0IHsgVGV4dHVyZUF0bGFzIH0gZnJvbSAnLi4vc2NlbmUvdGV4dHVyZS1hdGxhcy5qcyc7XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL2hhbmRsZXIuanMnKS5SZXNvdXJjZUhhbmRsZXJ9IFJlc291cmNlSGFuZGxlciAqL1xuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ZyYW1ld29yay9hcHAtYmFzZS5qcycpLkFwcEJhc2V9IEFwcEJhc2UgKi9cblxuY29uc3QgSlNPTl9BRERSRVNTX01PREUgPSB7XG4gICAgJ3JlcGVhdCc6IEFERFJFU1NfUkVQRUFULFxuICAgICdjbGFtcCc6IEFERFJFU1NfQ0xBTVBfVE9fRURHRSxcbiAgICAnbWlycm9yJzogQUREUkVTU19NSVJST1JFRF9SRVBFQVRcbn07XG5cbmNvbnN0IEpTT05fRklMVEVSX01PREUgPSB7XG4gICAgJ25lYXJlc3QnOiBGSUxURVJfTkVBUkVTVCxcbiAgICAnbGluZWFyJzogRklMVEVSX0xJTkVBUixcbiAgICAnbmVhcmVzdF9taXBfbmVhcmVzdCc6IEZJTFRFUl9ORUFSRVNUX01JUE1BUF9ORUFSRVNULFxuICAgICdsaW5lYXJfbWlwX25lYXJlc3QnOiBGSUxURVJfTElORUFSX01JUE1BUF9ORUFSRVNULFxuICAgICduZWFyZXN0X21pcF9saW5lYXInOiBGSUxURVJfTkVBUkVTVF9NSVBNQVBfTElORUFSLFxuICAgICdsaW5lYXJfbWlwX2xpbmVhcic6IEZJTFRFUl9MSU5FQVJfTUlQTUFQX0xJTkVBUlxufTtcblxuY29uc3QgcmVnZXhGcmFtZSA9IC9eZGF0YVxcLmZyYW1lc1xcLihcXGQrKSQvO1xuXG4vKipcbiAqIFJlc291cmNlIGhhbmRsZXIgdXNlZCBmb3IgbG9hZGluZyB7QGxpbmsgVGV4dHVyZUF0bGFzfSByZXNvdXJjZXMuXG4gKlxuICogQGltcGxlbWVudHMge1Jlc291cmNlSGFuZGxlcn1cbiAqL1xuY2xhc3MgVGV4dHVyZUF0bGFzSGFuZGxlciB7XG4gICAgLyoqXG4gICAgICogVHlwZSBvZiB0aGUgcmVzb3VyY2UgdGhlIGhhbmRsZXIgaGFuZGxlcy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgaGFuZGxlclR5cGUgPSBcInRleHR1cmVhdGxhc1wiO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IFRleHR1cmVBdGxhc0hhbmRsZXIgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FwcEJhc2V9IGFwcCAtIFRoZSBydW5uaW5nIHtAbGluayBBcHBCYXNlfS5cbiAgICAgKiBAaGlkZWNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXBwKSB7XG4gICAgICAgIHRoaXMuX2xvYWRlciA9IGFwcC5sb2FkZXI7XG4gICAgICAgIHRoaXMubWF4UmV0cmllcyA9IDA7XG4gICAgfVxuXG4gICAgLy8gTG9hZCB0aGUgdGV4dHVyZSBhdGxhcyB0ZXh0dXJlIHVzaW5nIHRoZSB0ZXh0dXJlIHJlc291cmNlIGxvYWRlclxuICAgIGxvYWQodXJsLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIHVybCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHVybCA9IHtcbiAgICAgICAgICAgICAgICBsb2FkOiB1cmwsXG4gICAgICAgICAgICAgICAgb3JpZ2luYWw6IHVybFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fbG9hZGVyLmdldEhhbmRsZXIoJ3RleHR1cmUnKTtcblxuICAgICAgICAvLyBpZiBzdXBwbGllZCB3aXRoIGEganNvbiBmaWxlIHVybCAocHJvYmFibHkgZW5naW5lLW9ubHkpXG4gICAgICAgIC8vIGxvYWQganNvbiBkYXRhIHRoZW4gbG9hZCB0ZXh0dXJlIG9mIHNhbWUgbmFtZVxuICAgICAgICBpZiAocGF0aC5nZXRFeHRlbnNpb24odXJsLm9yaWdpbmFsKSA9PT0gJy5qc29uJykge1xuICAgICAgICAgICAgaHR0cC5nZXQodXJsLmxvYWQsIHtcbiAgICAgICAgICAgICAgICByZXRyeTogdGhpcy5tYXhSZXRyaWVzID4gMCxcbiAgICAgICAgICAgICAgICBtYXhSZXRyaWVzOiB0aGlzLm1heFJldHJpZXNcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9hZCB0ZXh0dXJlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHR1cmVVcmwgPSB1cmwub3JpZ2luYWwucmVwbGFjZSgnLmpzb24nLCAnLnBuZycpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9sb2FkZXIubG9hZCh0ZXh0dXJlVXJsLCAndGV4dHVyZScsIGZ1bmN0aW9uIChlcnIsIHRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlOiB0ZXh0dXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlci5sb2FkKHVybCwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRleHR1cmUgYXRsYXMgcmVzb3VyY2UgdXNpbmcgdGhlIHRleHR1cmUgZnJvbSB0aGUgdGV4dHVyZSBsb2FkZXJcbiAgICBvcGVuKHVybCwgZGF0YSkge1xuICAgICAgICBjb25zdCByZXNvdXJjZSA9IG5ldyBUZXh0dXJlQXRsYXMoKTtcbiAgICAgICAgaWYgKGRhdGEudGV4dHVyZSAmJiBkYXRhLmRhdGEpIHtcbiAgICAgICAgICAgIHJlc291cmNlLnRleHR1cmUgPSBkYXRhLnRleHR1cmU7XG4gICAgICAgICAgICByZXNvdXJjZS5fX2RhdGEgPSBkYXRhLmRhdGE7IC8vIHN0b3JlIGRhdGEgdGVtcG9yYXJpbHkgdG8gYmUgY29waWVkIGludG8gYXNzZXRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9sb2FkZXIuZ2V0SGFuZGxlcigndGV4dHVyZScpO1xuICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9IGhhbmRsZXIub3Blbih1cmwsIGRhdGEpO1xuICAgICAgICAgICAgaWYgKCF0ZXh0dXJlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJlc291cmNlLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvdXJjZTtcbiAgICB9XG5cbiAgICBwYXRjaChhc3NldCwgYXNzZXRzKSB7XG4gICAgICAgIC8vIGR1cmluZyBlZGl0b3IgdXBkYXRlIHRoZSB1bmRlcmx5aW5nIHRleHR1cmUgaXMgdGVtcG9yYXJpbHkgbnVsbC4ganVzdCByZXR1cm4gaW4gdGhhdCBjYXNlLlxuICAgICAgICBpZiAoIWFzc2V0LnJlc291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXNzZXQucmVzb3VyY2UuX19kYXRhKSB7XG4gICAgICAgICAgICAvLyBlbmdpbmUtb25seSwgc28gY29weSB0ZW1wb3JhcnkgYXNzZXQgZGF0YSBmcm9tIHRleHR1cmUgYXRsYXMgaW50byBhc3NldCBhbmQgZGVsZXRlIHRlbXAgcHJvcGVydHlcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEubWluZmlsdGVyICE9PSB1bmRlZmluZWQpIGFzc2V0LmRhdGEubWluZmlsdGVyID0gYXNzZXQucmVzb3VyY2UuX19kYXRhLm1pbmZpbHRlcjtcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEubWFnZmlsdGVyICE9PSB1bmRlZmluZWQpIGFzc2V0LmRhdGEubWFnZmlsdGVyID0gYXNzZXQucmVzb3VyY2UuX19kYXRhLm1hZ2ZpbHRlcjtcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEuYWRkcmVzc3UgIT09IHVuZGVmaW5lZCkgYXNzZXQuZGF0YS5hZGRyZXNzdSA9IGFzc2V0LnJlc291cmNlLl9fZGF0YS5hZGRyZXNzdTtcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEuYWRkcmVzc3YgIT09IHVuZGVmaW5lZCkgYXNzZXQuZGF0YS5hZGRyZXNzdiA9IGFzc2V0LnJlc291cmNlLl9fZGF0YS5hZGRyZXNzdjtcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEubWlwbWFwcyAhPT0gdW5kZWZpbmVkKSBhc3NldC5kYXRhLm1pcG1hcHMgPSBhc3NldC5yZXNvdXJjZS5fX2RhdGEubWlwbWFwcztcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEuYW5pc290cm9weSAhPT0gdW5kZWZpbmVkKSBhc3NldC5kYXRhLmFuaXNvdHJvcHkgPSBhc3NldC5yZXNvdXJjZS5fX2RhdGEuYW5pc290cm9weTtcbiAgICAgICAgICAgIGlmIChhc3NldC5yZXNvdXJjZS5fX2RhdGEucmdibSAhPT0gdW5kZWZpbmVkKSBhc3NldC5kYXRhLnJnYm0gPSAhIWFzc2V0LnJlc291cmNlLl9fZGF0YS5yZ2JtO1xuXG4gICAgICAgICAgICBhc3NldC5kYXRhLmZyYW1lcyA9IGFzc2V0LnJlc291cmNlLl9fZGF0YS5mcmFtZXM7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBhc3NldC5yZXNvdXJjZS5fX2RhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwYXNzIHRleHR1cmUgZGF0YVxuICAgICAgICBjb25zdCB0ZXh0dXJlID0gYXNzZXQucmVzb3VyY2UudGV4dHVyZTtcbiAgICAgICAgaWYgKHRleHR1cmUpIHtcbiAgICAgICAgICAgIHRleHR1cmUubmFtZSA9IGFzc2V0Lm5hbWU7XG5cbiAgICAgICAgICAgIGlmIChhc3NldC5kYXRhLmhhc093blByb3BlcnR5KCdtaW5maWx0ZXInKSAmJiB0ZXh0dXJlLm1pbkZpbHRlciAhPT0gSlNPTl9GSUxURVJfTU9ERVthc3NldC5kYXRhLm1pbmZpbHRlcl0pXG4gICAgICAgICAgICAgICAgdGV4dHVyZS5taW5GaWx0ZXIgPSBKU09OX0ZJTFRFUl9NT0RFW2Fzc2V0LmRhdGEubWluZmlsdGVyXTtcblxuICAgICAgICAgICAgaWYgKGFzc2V0LmRhdGEuaGFzT3duUHJvcGVydHkoJ21hZ2ZpbHRlcicpICYmIHRleHR1cmUubWFnRmlsdGVyICE9PSBKU09OX0ZJTFRFUl9NT0RFW2Fzc2V0LmRhdGEubWFnZmlsdGVyXSlcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLm1hZ0ZpbHRlciA9IEpTT05fRklMVEVSX01PREVbYXNzZXQuZGF0YS5tYWdmaWx0ZXJdO1xuXG4gICAgICAgICAgICBpZiAoYXNzZXQuZGF0YS5oYXNPd25Qcm9wZXJ0eSgnYWRkcmVzc3UnKSAmJiB0ZXh0dXJlLmFkZHJlc3NVICE9PSBKU09OX0FERFJFU1NfTU9ERVthc3NldC5kYXRhLmFkZHJlc3N1XSlcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLmFkZHJlc3NVID0gSlNPTl9BRERSRVNTX01PREVbYXNzZXQuZGF0YS5hZGRyZXNzdV07XG5cbiAgICAgICAgICAgIGlmIChhc3NldC5kYXRhLmhhc093blByb3BlcnR5KCdhZGRyZXNzdicpICYmIHRleHR1cmUuYWRkcmVzc1YgIT09IEpTT05fQUREUkVTU19NT0RFW2Fzc2V0LmRhdGEuYWRkcmVzc3ZdKVxuICAgICAgICAgICAgICAgIHRleHR1cmUuYWRkcmVzc1YgPSBKU09OX0FERFJFU1NfTU9ERVthc3NldC5kYXRhLmFkZHJlc3N2XTtcblxuICAgICAgICAgICAgaWYgKGFzc2V0LmRhdGEuaGFzT3duUHJvcGVydHkoJ21pcG1hcHMnKSAmJiB0ZXh0dXJlLm1pcG1hcHMgIT09IGFzc2V0LmRhdGEubWlwbWFwcylcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLm1pcG1hcHMgPSBhc3NldC5kYXRhLm1pcG1hcHM7XG5cbiAgICAgICAgICAgIGlmIChhc3NldC5kYXRhLmhhc093blByb3BlcnR5KCdhbmlzb3Ryb3B5JykgJiYgdGV4dHVyZS5hbmlzb3Ryb3B5ICE9PSBhc3NldC5kYXRhLmFuaXNvdHJvcHkpXG4gICAgICAgICAgICAgICAgdGV4dHVyZS5hbmlzb3Ryb3B5ID0gYXNzZXQuZGF0YS5hbmlzb3Ryb3B5O1xuXG4gICAgICAgICAgICBpZiAoYXNzZXQuZGF0YS5oYXNPd25Qcm9wZXJ0eSgncmdibScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGFzc2V0LmRhdGEucmdibSA/IFRFWFRVUkVUWVBFX1JHQk0gOiBURVhUVVJFVFlQRV9ERUZBVUxUO1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0dXJlLnR5cGUgIT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS50eXBlID0gdHlwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhc3NldC5yZXNvdXJjZS50ZXh0dXJlID0gdGV4dHVyZTtcblxuICAgICAgICAvLyBzZXQgZnJhbWVzXG4gICAgICAgIGNvbnN0IGZyYW1lcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhc3NldC5kYXRhLmZyYW1lcykge1xuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBhc3NldC5kYXRhLmZyYW1lc1trZXldO1xuICAgICAgICAgICAgZnJhbWVzW2tleV0gPSB7XG4gICAgICAgICAgICAgICAgcmVjdDogbmV3IFZlYzQoZnJhbWUucmVjdCksXG4gICAgICAgICAgICAgICAgcGl2b3Q6IG5ldyBWZWMyKGZyYW1lLnBpdm90KSxcbiAgICAgICAgICAgICAgICBib3JkZXI6IG5ldyBWZWM0KGZyYW1lLmJvcmRlcilcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgYXNzZXQucmVzb3VyY2UuZnJhbWVzID0gZnJhbWVzO1xuXG4gICAgICAgIGFzc2V0Lm9mZignY2hhbmdlJywgdGhpcy5fb25Bc3NldENoYW5nZSwgdGhpcyk7XG4gICAgICAgIGFzc2V0Lm9uKCdjaGFuZ2UnLCB0aGlzLl9vbkFzc2V0Q2hhbmdlLCB0aGlzKTtcbiAgICB9XG5cbiAgICBfb25Bc3NldENoYW5nZShhc3NldCwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgICBsZXQgZnJhbWU7XG5cbiAgICAgICAgaWYgKGF0dHJpYnV0ZSA9PT0gJ2RhdGEnIHx8IGF0dHJpYnV0ZSA9PT0gJ2RhdGEuZnJhbWVzJykge1xuICAgICAgICAgICAgLy8gc2V0IGZyYW1lc1xuICAgICAgICAgICAgY29uc3QgZnJhbWVzID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB2YWx1ZS5mcmFtZXMpIHtcbiAgICAgICAgICAgICAgICBmcmFtZSA9IHZhbHVlLmZyYW1lc1trZXldO1xuICAgICAgICAgICAgICAgIGZyYW1lc1trZXldID0ge1xuICAgICAgICAgICAgICAgICAgICByZWN0OiBuZXcgVmVjNChmcmFtZS5yZWN0KSxcbiAgICAgICAgICAgICAgICAgICAgcGl2b3Q6IG5ldyBWZWMyKGZyYW1lLnBpdm90KSxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiBuZXcgVmVjNChmcmFtZS5ib3JkZXIpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFzc2V0LnJlc291cmNlLmZyYW1lcyA9IGZyYW1lcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gYXR0cmlidXRlLm1hdGNoKHJlZ2V4RnJhbWUpO1xuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZnJhbWVLZXkgPSBtYXRjaFsxXTtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgb3IgdXBkYXRlIGZyYW1lXG4gICAgICAgICAgICAgICAgICAgIGlmICghYXNzZXQucmVzb3VyY2UuZnJhbWVzW2ZyYW1lS2V5XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXQucmVzb3VyY2UuZnJhbWVzW2ZyYW1lS2V5XSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN0OiBuZXcgVmVjNCh2YWx1ZS5yZWN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaXZvdDogbmV3IFZlYzIodmFsdWUucGl2b3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogbmV3IFZlYzQodmFsdWUuYm9yZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lID0gYXNzZXQucmVzb3VyY2UuZnJhbWVzW2ZyYW1lS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lLnJlY3Quc2V0KHZhbHVlLnJlY3RbMF0sIHZhbHVlLnJlY3RbMV0sIHZhbHVlLnJlY3RbMl0sIHZhbHVlLnJlY3RbM10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhbWUucGl2b3Quc2V0KHZhbHVlLnBpdm90WzBdLCB2YWx1ZS5waXZvdFsxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZS5ib3JkZXIuc2V0KHZhbHVlLmJvcmRlclswXSwgdmFsdWUuYm9yZGVyWzFdLCB2YWx1ZS5ib3JkZXJbMl0sIHZhbHVlLmJvcmRlclszXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBhc3NldC5yZXNvdXJjZS5maXJlKCdzZXQ6ZnJhbWUnLCBmcmFtZUtleSwgYXNzZXQucmVzb3VyY2UuZnJhbWVzW2ZyYW1lS2V5XSk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBkZWxldGUgZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFzc2V0LnJlc291cmNlLmZyYW1lc1tmcmFtZUtleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhc3NldC5yZXNvdXJjZS5mcmFtZXNbZnJhbWVLZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXQucmVzb3VyY2UuZmlyZSgncmVtb3ZlOmZyYW1lJywgZnJhbWVLZXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IFRleHR1cmVBdGxhc0hhbmRsZXIgfTtcbiJdLCJuYW1lcyI6WyJKU09OX0FERFJFU1NfTU9ERSIsIkFERFJFU1NfUkVQRUFUIiwiQUREUkVTU19DTEFNUF9UT19FREdFIiwiQUREUkVTU19NSVJST1JFRF9SRVBFQVQiLCJKU09OX0ZJTFRFUl9NT0RFIiwiRklMVEVSX05FQVJFU1QiLCJGSUxURVJfTElORUFSIiwiRklMVEVSX05FQVJFU1RfTUlQTUFQX05FQVJFU1QiLCJGSUxURVJfTElORUFSX01JUE1BUF9ORUFSRVNUIiwiRklMVEVSX05FQVJFU1RfTUlQTUFQX0xJTkVBUiIsIkZJTFRFUl9MSU5FQVJfTUlQTUFQX0xJTkVBUiIsInJlZ2V4RnJhbWUiLCJUZXh0dXJlQXRsYXNIYW5kbGVyIiwiY29uc3RydWN0b3IiLCJhcHAiLCJoYW5kbGVyVHlwZSIsIl9sb2FkZXIiLCJsb2FkZXIiLCJtYXhSZXRyaWVzIiwibG9hZCIsInVybCIsImNhbGxiYWNrIiwib3JpZ2luYWwiLCJzZWxmIiwiaGFuZGxlciIsImdldEhhbmRsZXIiLCJwYXRoIiwiZ2V0RXh0ZW5zaW9uIiwiaHR0cCIsImdldCIsInJldHJ5IiwiZXJyIiwicmVzcG9uc2UiLCJ0ZXh0dXJlVXJsIiwicmVwbGFjZSIsInRleHR1cmUiLCJkYXRhIiwib3BlbiIsInJlc291cmNlIiwiVGV4dHVyZUF0bGFzIiwiX19kYXRhIiwicGF0Y2giLCJhc3NldCIsImFzc2V0cyIsIm1pbmZpbHRlciIsInVuZGVmaW5lZCIsIm1hZ2ZpbHRlciIsImFkZHJlc3N1IiwiYWRkcmVzc3YiLCJtaXBtYXBzIiwiYW5pc290cm9weSIsInJnYm0iLCJmcmFtZXMiLCJuYW1lIiwiaGFzT3duUHJvcGVydHkiLCJtaW5GaWx0ZXIiLCJtYWdGaWx0ZXIiLCJhZGRyZXNzVSIsImFkZHJlc3NWIiwidHlwZSIsIlRFWFRVUkVUWVBFX1JHQk0iLCJURVhUVVJFVFlQRV9ERUZBVUxUIiwia2V5IiwiZnJhbWUiLCJyZWN0IiwiVmVjNCIsInBpdm90IiwiVmVjMiIsImJvcmRlciIsIm9mZiIsIl9vbkFzc2V0Q2hhbmdlIiwib24iLCJhdHRyaWJ1dGUiLCJ2YWx1ZSIsIm1hdGNoIiwiZnJhbWVLZXkiLCJzZXQiLCJmaXJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFrQkEsTUFBTUEsaUJBQWlCLEdBQUc7QUFDdEIsRUFBQSxRQUFBLEVBQVVDLGNBRFk7QUFFdEIsRUFBQSxPQUFBLEVBQVNDLHFCQUZhO0VBR3RCLFFBQVVDLEVBQUFBLHVCQUFBQTtBQUhZLENBQTFCLENBQUE7QUFNQSxNQUFNQyxnQkFBZ0IsR0FBRztBQUNyQixFQUFBLFNBQUEsRUFBV0MsY0FEVTtBQUVyQixFQUFBLFFBQUEsRUFBVUMsYUFGVztBQUdyQixFQUFBLHFCQUFBLEVBQXVCQyw2QkFIRjtBQUlyQixFQUFBLG9CQUFBLEVBQXNCQyw0QkFKRDtBQUtyQixFQUFBLG9CQUFBLEVBQXNCQyw0QkFMRDtFQU1yQixtQkFBcUJDLEVBQUFBLDJCQUFBQTtBQU5BLENBQXpCLENBQUE7QUFTQSxNQUFNQyxVQUFVLEdBQUcsdUJBQW5CLENBQUE7O0FBT0EsTUFBTUMsbUJBQU4sQ0FBMEI7RUFjdEJDLFdBQVcsQ0FBQ0MsR0FBRCxFQUFNO0lBQUEsSUFSakJDLENBQUFBLFdBUWlCLEdBUkgsY0FRRyxDQUFBO0FBQ2IsSUFBQSxJQUFBLENBQUtDLE9BQUwsR0FBZUYsR0FBRyxDQUFDRyxNQUFuQixDQUFBO0lBQ0EsSUFBS0MsQ0FBQUEsVUFBTCxHQUFrQixDQUFsQixD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
