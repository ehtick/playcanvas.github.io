/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Asset } from '../../asset/asset.js';
import { Texture } from '../../../platform/graphics/texture.js';
import { basisTranscode } from '../../handlers/basis.js';
import { TEXHINT_ASSET, ADDRESS_CLAMP_TO_EDGE, ADDRESS_REPEAT } from '../../../platform/graphics/constants.js';

class BasisParser {
  constructor(registry, device) {
    this.device = device;
    this.maxRetries = 0;
  }
  load(url, callback, asset) {
    const device = this.device;
    const transcode = data => {
      var _asset$file, _asset$file$variants, _asset$file$variants$;
      const basisModuleFound = basisTranscode(device, url.load, data, callback, {
        isGGGR: ((asset == null ? void 0 : (_asset$file = asset.file) == null ? void 0 : (_asset$file$variants = _asset$file.variants) == null ? void 0 : (_asset$file$variants$ = _asset$file$variants.basis) == null ? void 0 : _asset$file$variants$.opt) & 8) !== 0
      });
      if (!basisModuleFound) {
        callback(`Basis module not found. Asset '${asset.name}' basis texture variant will not be loaded.`);
      }
    };
    Asset.fetchArrayBuffer(url.load, (err, result) => {
      if (err) {
        callback(err);
      } else {
        transcode(result);
      }
    }, asset, this.maxRetries);
  }

  open(url, data, device) {
    const texture = new Texture(device, {
      name: url,
      profilerHint: TEXHINT_ASSET,
      addressU: data.cubemap ? ADDRESS_CLAMP_TO_EDGE : ADDRESS_REPEAT,
      addressV: data.cubemap ? ADDRESS_CLAMP_TO_EDGE : ADDRESS_REPEAT,
      width: data.width,
      height: data.height,
      format: data.format,
      cubemap: data.cubemap,
      levels: data.levels
    });
    texture.upload();
    return texture;
  }
}

export { BasisParser };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzaXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvcGFyc2Vycy90ZXh0dXJlL2Jhc2lzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0IH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL2Fzc2V0L2Fzc2V0LmpzJztcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi8uLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy90ZXh0dXJlLmpzJztcbmltcG9ydCB7IGJhc2lzVHJhbnNjb2RlIH0gZnJvbSAnLi4vLi4vaGFuZGxlcnMvYmFzaXMuanMnO1xuaW1wb3J0IHsgQUREUkVTU19DTEFNUF9UT19FREdFLCBBRERSRVNTX1JFUEVBVCwgVEVYSElOVF9BU1NFVCB9IGZyb20gJy4uLy4uLy4uL3BsYXRmb3JtL2dyYXBoaWNzL2NvbnN0YW50cy5qcyc7XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuLi8uLi9oYW5kbGVycy90ZXh0dXJlLmpzJykuVGV4dHVyZVBhcnNlcn0gVGV4dHVyZVBhcnNlciAqL1xuXG4vKipcbiAqIFBhcnNlciBmb3IgYmFzaXMgZmlsZXMuXG4gKlxuICogQGltcGxlbWVudHMge1RleHR1cmVQYXJzZXJ9XG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIEJhc2lzUGFyc2VyIHtcbiAgICBjb25zdHJ1Y3RvcihyZWdpc3RyeSwgZGV2aWNlKSB7XG4gICAgICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xuICAgICAgICB0aGlzLm1heFJldHJpZXMgPSAwO1xuICAgIH1cblxuICAgIGxvYWQodXJsLCBjYWxsYmFjaywgYXNzZXQpIHtcbiAgICAgICAgY29uc3QgZGV2aWNlID0gdGhpcy5kZXZpY2U7XG5cbiAgICAgICAgY29uc3QgdHJhbnNjb2RlID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJhc2lzTW9kdWxlRm91bmQgPSBiYXNpc1RyYW5zY29kZShcbiAgICAgICAgICAgICAgICBkZXZpY2UsXG4gICAgICAgICAgICAgICAgdXJsLmxvYWQsXG4gICAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjayxcbiAgICAgICAgICAgICAgICB7IGlzR0dHUjogKGFzc2V0Py5maWxlPy52YXJpYW50cz8uYmFzaXM/Lm9wdCAmIDgpICE9PSAwIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmICghYmFzaXNNb2R1bGVGb3VuZCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGBCYXNpcyBtb2R1bGUgbm90IGZvdW5kLiBBc3NldCAnJHthc3NldC5uYW1lfScgYmFzaXMgdGV4dHVyZSB2YXJpYW50IHdpbGwgbm90IGJlIGxvYWRlZC5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBBc3NldC5mZXRjaEFycmF5QnVmZmVyKHVybC5sb2FkLCAoZXJyLCByZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0cmFuc2NvZGUocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgYXNzZXQsIHRoaXMubWF4UmV0cmllcyk7XG4gICAgfVxuXG4gICAgLy8gb3VyIGFzeW5jIHRyYW5zY29kZSBjYWxsIHByb3ZpZGVzIHRoZSBuZWF0IHN0cnVjdHVyZSB3ZSBuZWVkIHRvIGNyZWF0ZSB0aGUgdGV4dHVyZSBpbnN0YW5jZVxuICAgIG9wZW4odXJsLCBkYXRhLCBkZXZpY2UpIHtcbiAgICAgICAgY29uc3QgdGV4dHVyZSA9IG5ldyBUZXh0dXJlKGRldmljZSwge1xuICAgICAgICAgICAgbmFtZTogdXJsLFxuICAgICAgICAgICAgLy8gI2lmIF9QUk9GSUxFUlxuICAgICAgICAgICAgcHJvZmlsZXJIaW50OiBURVhISU5UX0FTU0VULFxuICAgICAgICAgICAgLy8gI2VuZGlmXG4gICAgICAgICAgICBhZGRyZXNzVTogZGF0YS5jdWJlbWFwID8gQUREUkVTU19DTEFNUF9UT19FREdFIDogQUREUkVTU19SRVBFQVQsXG4gICAgICAgICAgICBhZGRyZXNzVjogZGF0YS5jdWJlbWFwID8gQUREUkVTU19DTEFNUF9UT19FREdFIDogQUREUkVTU19SRVBFQVQsXG4gICAgICAgICAgICB3aWR0aDogZGF0YS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogZGF0YS5oZWlnaHQsXG4gICAgICAgICAgICBmb3JtYXQ6IGRhdGEuZm9ybWF0LFxuICAgICAgICAgICAgY3ViZW1hcDogZGF0YS5jdWJlbWFwLFxuICAgICAgICAgICAgbGV2ZWxzOiBkYXRhLmxldmVsc1xuICAgICAgICB9KTtcblxuICAgICAgICB0ZXh0dXJlLnVwbG9hZCgpO1xuXG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgQmFzaXNQYXJzZXIgfTtcbiJdLCJuYW1lcyI6WyJCYXNpc1BhcnNlciIsImNvbnN0cnVjdG9yIiwicmVnaXN0cnkiLCJkZXZpY2UiLCJtYXhSZXRyaWVzIiwibG9hZCIsInVybCIsImNhbGxiYWNrIiwiYXNzZXQiLCJ0cmFuc2NvZGUiLCJkYXRhIiwiYmFzaXNNb2R1bGVGb3VuZCIsImJhc2lzVHJhbnNjb2RlIiwiaXNHR0dSIiwiZmlsZSIsInZhcmlhbnRzIiwiYmFzaXMiLCJvcHQiLCJuYW1lIiwiQXNzZXQiLCJmZXRjaEFycmF5QnVmZmVyIiwiZXJyIiwicmVzdWx0Iiwib3BlbiIsInRleHR1cmUiLCJUZXh0dXJlIiwicHJvZmlsZXJIaW50IiwiVEVYSElOVF9BU1NFVCIsImFkZHJlc3NVIiwiY3ViZW1hcCIsIkFERFJFU1NfQ0xBTVBfVE9fRURHRSIsIkFERFJFU1NfUkVQRUFUIiwiYWRkcmVzc1YiLCJ3aWR0aCIsImhlaWdodCIsImZvcm1hdCIsImxldmVscyIsInVwbG9hZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQWFBLE1BQU1BLFdBQVcsQ0FBQztBQUNk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
