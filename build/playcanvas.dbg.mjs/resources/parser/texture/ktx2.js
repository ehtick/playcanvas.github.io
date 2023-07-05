/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../../core/debug.js';
import { Asset } from '../../../asset/asset.js';
import { Texture } from '../../../graphics/texture.js';
import { basisTranscode } from '../../basis.js';
import { ReadStream } from '../../../core/read-stream.js';
import { TEXHINT_ASSET, ADDRESS_CLAMP_TO_EDGE, ADDRESS_REPEAT } from '../../../graphics/constants.js';

const KHRConstants = {
  KHR_DF_MODEL_ETC1S: 163,
  KHR_DF_MODEL_UASTC: 166
};

class Ktx2Parser {
  constructor(registry, device) {
    this.maxRetries = 0;
    this.device = device;
  }

  load(url, callback, asset) {
    Asset.fetchArrayBuffer(url.load, (err, result) => {
      if (err) {
        callback(err, result);
      } else {
        this.parse(result, url, callback, asset);
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

  parse(arraybuffer, url, callback, asset) {
    const rs = new ReadStream(arraybuffer);
    const magic = [rs.readU32be(), rs.readU32be(), rs.readU32be()];

    if (magic[0] !== 0xAB4B5458 || magic[1] !== 0x203230BB || magic[2] !== 0x0D0A1A0A) {
      Debug.warn('Invalid definition header found in KTX2 file. Expected 0xAB4B5458, 0x203131BB, 0x0D0A1A0A');
      return null;
    }

    const header = {
      vkFormat: rs.readU32(),
      typeSize: rs.readU32(),
      pixelWidth: rs.readU32(),
      pixelHeight: rs.readU32(),
      pixelDepth: rs.readU32(),
      layerCount: rs.readU32(),
      faceCount: rs.readU32(),
      levelCount: rs.readU32(),
      supercompressionScheme: rs.readU32()
    };
    const index = {
      dfdByteOffset: rs.readU32(),
      dfdByteLength: rs.readU32(),
      kvdByteOffset: rs.readU32(),
      kvdByteLength: rs.readU32(),
      sgdByteOffset: rs.readU64(),
      sgdByteLength: rs.readU64()
    };
    const levels = [];

    for (let i = 0; i < Math.max(1, header.levelCount); ++i) {
      levels.push({
        byteOffset: rs.readU64(),
        byteLength: rs.readU64(),
        uncompressedByteLength: rs.readU64()
      });
    }

    const dfdTotalSize = rs.readU32();

    if (dfdTotalSize !== index.kvdByteOffset - index.dfdByteOffset) {
      Debug.warn('Invalid file data encountered.');
      return null;
    }

    rs.skip(8);
    const colorModel = rs.readU8();
    rs.skip(index.dfdByteLength - 9);
    rs.skip(index.kvdByteLength);

    if (header.supercompressionScheme === 1 || colorModel === KHRConstants.KHR_DF_MODEL_UASTC) {
      var _asset$file, _asset$file$variants, _asset$file$variants$;

      const basisModuleFound = basisTranscode(this.device, url.load, arraybuffer, callback, {
        isGGGR: ((asset == null ? void 0 : (_asset$file = asset.file) == null ? void 0 : (_asset$file$variants = _asset$file.variants) == null ? void 0 : (_asset$file$variants$ = _asset$file$variants.basis) == null ? void 0 : _asset$file$variants$.opt) & 8) !== 0,
        isKTX2: true
      });

      if (!basisModuleFound) {
        callback('Basis module not found. Asset "' + asset.name + '" basis texture variant will not be loaded.');
      }
    } else {
      callback('unsupported KTX2 pixel format');
    }
  }

}

export { Ktx2Parser };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3R4Mi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Jlc291cmNlcy9wYXJzZXIvdGV4dHVyZS9rdHgyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERlYnVnIH0gZnJvbSAnLi4vLi4vLi4vY29yZS9kZWJ1Zy5qcyc7XG5pbXBvcnQgeyBBc3NldCB9IGZyb20gJy4uLy4uLy4uL2Fzc2V0L2Fzc2V0LmpzJztcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi8uLi8uLi9ncmFwaGljcy90ZXh0dXJlLmpzJztcbmltcG9ydCB7IGJhc2lzVHJhbnNjb2RlIH0gZnJvbSAnLi4vLi4vYmFzaXMuanMnO1xuaW1wb3J0IHsgUmVhZFN0cmVhbSB9IGZyb20gJy4uLy4uLy4uL2NvcmUvcmVhZC1zdHJlYW0uanMnO1xuaW1wb3J0IHsgQUREUkVTU19DTEFNUF9UT19FREdFLCBBRERSRVNTX1JFUEVBVCwgVEVYSElOVF9BU1NFVCB9IGZyb20gJy4uLy4uLy4uL2dyYXBoaWNzL2NvbnN0YW50cy5qcyc7XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuLi8uLi90ZXh0dXJlLmpzJykuVGV4dHVyZVBhcnNlcn0gVGV4dHVyZVBhcnNlciAqL1xuXG5jb25zdCBLSFJDb25zdGFudHMgPSB7XG4gICAgS0hSX0RGX01PREVMX0VUQzFTOiAxNjMsXG4gICAgS0hSX0RGX01PREVMX1VBU1RDOiAxNjZcbn07XG5cbi8qKlxuICogVGV4dHVyZSBwYXJzZXIgZm9yIGt0eDIgZmlsZXMuXG4gKlxuICogQGltcGxlbWVudHMge1RleHR1cmVQYXJzZXJ9XG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIEt0eDJQYXJzZXIge1xuICAgIGNvbnN0cnVjdG9yKHJlZ2lzdHJ5LCBkZXZpY2UpIHtcbiAgICAgICAgdGhpcy5tYXhSZXRyaWVzID0gMDtcbiAgICAgICAgdGhpcy5kZXZpY2UgPSBkZXZpY2U7XG4gICAgfVxuXG4gICAgbG9hZCh1cmwsIGNhbGxiYWNrLCBhc3NldCkge1xuICAgICAgICBBc3NldC5mZXRjaEFycmF5QnVmZmVyKHVybC5sb2FkLCAoZXJyLCByZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyc2UocmVzdWx0LCB1cmwsIGNhbGxiYWNrLCBhc3NldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGFzc2V0LCB0aGlzLm1heFJldHJpZXMpO1xuICAgIH1cblxuICAgIG9wZW4odXJsLCBkYXRhLCBkZXZpY2UpIHtcbiAgICAgICAgY29uc3QgdGV4dHVyZSA9IG5ldyBUZXh0dXJlKGRldmljZSwge1xuICAgICAgICAgICAgbmFtZTogdXJsLFxuICAgICAgICAgICAgLy8gI2lmIF9QUk9GSUxFUlxuICAgICAgICAgICAgcHJvZmlsZXJIaW50OiBURVhISU5UX0FTU0VULFxuICAgICAgICAgICAgLy8gI2VuZGlmXG4gICAgICAgICAgICBhZGRyZXNzVTogZGF0YS5jdWJlbWFwID8gQUREUkVTU19DTEFNUF9UT19FREdFIDogQUREUkVTU19SRVBFQVQsXG4gICAgICAgICAgICBhZGRyZXNzVjogZGF0YS5jdWJlbWFwID8gQUREUkVTU19DTEFNUF9UT19FREdFIDogQUREUkVTU19SRVBFQVQsXG4gICAgICAgICAgICB3aWR0aDogZGF0YS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogZGF0YS5oZWlnaHQsXG4gICAgICAgICAgICBmb3JtYXQ6IGRhdGEuZm9ybWF0LFxuICAgICAgICAgICAgY3ViZW1hcDogZGF0YS5jdWJlbWFwLFxuICAgICAgICAgICAgbGV2ZWxzOiBkYXRhLmxldmVsc1xuICAgICAgICB9KTtcblxuICAgICAgICB0ZXh0dXJlLnVwbG9hZCgpO1xuXG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgIH1cblxuICAgIHBhcnNlKGFycmF5YnVmZmVyLCB1cmwsIGNhbGxiYWNrLCBhc3NldCkge1xuICAgICAgICBjb25zdCBycyA9IG5ldyBSZWFkU3RyZWFtKGFycmF5YnVmZmVyKTtcblxuICAgICAgICAvLyBjaGVjayBtYWdpYyBoZWFkZXIgYml0czogICfCqycsICdLJywgJ1QnLCAnWCcsICcgJywgJzInLCAnMCcsICfCuycsICdcXHInLCAnXFxuJywgJ1xceDFBJywgJ1xcbidcXFxuICAgICAgICBjb25zdCBtYWdpYyA9IFtycy5yZWFkVTMyYmUoKSwgcnMucmVhZFUzMmJlKCksIHJzLnJlYWRVMzJiZSgpXTtcbiAgICAgICAgaWYgKG1hZ2ljWzBdICE9PSAweEFCNEI1NDU4IHx8IG1hZ2ljWzFdICE9PSAweDIwMzIzMEJCIHx8IG1hZ2ljWzJdICE9PSAweDBEMEExQTBBKSB7XG4gICAgICAgICAgICBEZWJ1Zy53YXJuKCdJbnZhbGlkIGRlZmluaXRpb24gaGVhZGVyIGZvdW5kIGluIEtUWDIgZmlsZS4gRXhwZWN0ZWQgMHhBQjRCNTQ1OCwgMHgyMDMxMzFCQiwgMHgwRDBBMUEwQScpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1bnBhY2sgaGVhZGVyXG4gICAgICAgIGNvbnN0IGhlYWRlciA9IHtcbiAgICAgICAgICAgIHZrRm9ybWF0OiBycy5yZWFkVTMyKCksXG4gICAgICAgICAgICB0eXBlU2l6ZTogcnMucmVhZFUzMigpLFxuICAgICAgICAgICAgcGl4ZWxXaWR0aDogcnMucmVhZFUzMigpLFxuICAgICAgICAgICAgcGl4ZWxIZWlnaHQ6IHJzLnJlYWRVMzIoKSxcbiAgICAgICAgICAgIHBpeGVsRGVwdGg6IHJzLnJlYWRVMzIoKSxcbiAgICAgICAgICAgIGxheWVyQ291bnQ6IHJzLnJlYWRVMzIoKSxcbiAgICAgICAgICAgIGZhY2VDb3VudDogcnMucmVhZFUzMigpLFxuICAgICAgICAgICAgbGV2ZWxDb3VudDogcnMucmVhZFUzMigpLFxuICAgICAgICAgICAgc3VwZXJjb21wcmVzc2lvblNjaGVtZTogcnMucmVhZFUzMigpXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gdW5wYWNrIGluZGV4XG4gICAgICAgIGNvbnN0IGluZGV4ID0ge1xuICAgICAgICAgICAgZGZkQnl0ZU9mZnNldDogcnMucmVhZFUzMigpLFxuICAgICAgICAgICAgZGZkQnl0ZUxlbmd0aDogcnMucmVhZFUzMigpLFxuICAgICAgICAgICAga3ZkQnl0ZU9mZnNldDogcnMucmVhZFUzMigpLFxuICAgICAgICAgICAga3ZkQnl0ZUxlbmd0aDogcnMucmVhZFUzMigpLFxuICAgICAgICAgICAgc2dkQnl0ZU9mZnNldDogcnMucmVhZFU2NCgpLFxuICAgICAgICAgICAgc2dkQnl0ZUxlbmd0aDogcnMucmVhZFU2NCgpXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gdW5wYWNrIGxldmVsc1xuICAgICAgICBjb25zdCBsZXZlbHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNYXRoLm1heCgxLCBoZWFkZXIubGV2ZWxDb3VudCk7ICsraSkge1xuICAgICAgICAgICAgbGV2ZWxzLnB1c2goe1xuICAgICAgICAgICAgICAgIGJ5dGVPZmZzZXQ6IHJzLnJlYWRVNjQoKSxcbiAgICAgICAgICAgICAgICBieXRlTGVuZ3RoOiBycy5yZWFkVTY0KCksXG4gICAgICAgICAgICAgICAgdW5jb21wcmVzc2VkQnl0ZUxlbmd0aDogcnMucmVhZFU2NCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVucGFjayBkYXRhIGZvcm1hdCBkZXNjcmlwdG9yXG4gICAgICAgIGNvbnN0IGRmZFRvdGFsU2l6ZSA9IHJzLnJlYWRVMzIoKTtcbiAgICAgICAgaWYgKGRmZFRvdGFsU2l6ZSAhPT0gaW5kZXgua3ZkQnl0ZU9mZnNldCAtIGluZGV4LmRmZEJ5dGVPZmZzZXQpIHtcbiAgICAgICAgICAgIERlYnVnLndhcm4oJ0ludmFsaWQgZmlsZSBkYXRhIGVuY291bnRlcmVkLicpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBycy5za2lwKDgpO1xuICAgICAgICBjb25zdCBjb2xvck1vZGVsID0gcnMucmVhZFU4KCk7XG4gICAgICAgIHJzLnNraXAoaW5kZXguZGZkQnl0ZUxlbmd0aCAtIDkpO1xuXG4gICAgICAgIC8vIHNraXAga2V5L3ZhbHVlIHBhaXJzXG4gICAgICAgIHJzLnNraXAoaW5kZXgua3ZkQnl0ZUxlbmd0aCk7XG5cbiAgICAgICAgaWYgKGhlYWRlci5zdXBlcmNvbXByZXNzaW9uU2NoZW1lID09PSAxIHx8IGNvbG9yTW9kZWwgPT09IEtIUkNvbnN0YW50cy5LSFJfREZfTU9ERUxfVUFTVEMpIHtcbiAgICAgICAgICAgIC8vIGFzc3VtZSBmb3Igbm93IGFsbCBzdXBlciBjb21wcmVzc2VkIGltYWdlcyBhcmUgYmFzaXNcbiAgICAgICAgICAgIGNvbnN0IGJhc2lzTW9kdWxlRm91bmQgPSBiYXNpc1RyYW5zY29kZShcbiAgICAgICAgICAgICAgICB0aGlzLmRldmljZSxcbiAgICAgICAgICAgICAgICB1cmwubG9hZCxcbiAgICAgICAgICAgICAgICBhcnJheWJ1ZmZlcixcbiAgICAgICAgICAgICAgICBjYWxsYmFjayxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlzR0dHUjogKGFzc2V0Py5maWxlPy52YXJpYW50cz8uYmFzaXM/Lm9wdCAmIDgpICE9PSAwLFxuICAgICAgICAgICAgICAgICAgICBpc0tUWDI6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoIWJhc2lzTW9kdWxlRm91bmQpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygnQmFzaXMgbW9kdWxlIG5vdCBmb3VuZC4gQXNzZXQgXCInICsgYXNzZXQubmFtZSArICdcIiBiYXNpcyB0ZXh0dXJlIHZhcmlhbnQgd2lsbCBub3QgYmUgbG9hZGVkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ETzogbG9hZCBub24tc3VwZXJjb21wcmVzc2VkIGZvcm1hdHNcbiAgICAgICAgICAgIGNhbGxiYWNrKCd1bnN1cHBvcnRlZCBLVFgyIHBpeGVsIGZvcm1hdCcpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQge1xuICAgIEt0eDJQYXJzZXJcbn07XG4iXSwibmFtZXMiOlsiS0hSQ29uc3RhbnRzIiwiS0hSX0RGX01PREVMX0VUQzFTIiwiS0hSX0RGX01PREVMX1VBU1RDIiwiS3R4MlBhcnNlciIsImNvbnN0cnVjdG9yIiwicmVnaXN0cnkiLCJkZXZpY2UiLCJtYXhSZXRyaWVzIiwibG9hZCIsInVybCIsImNhbGxiYWNrIiwiYXNzZXQiLCJBc3NldCIsImZldGNoQXJyYXlCdWZmZXIiLCJlcnIiLCJyZXN1bHQiLCJwYXJzZSIsIm9wZW4iLCJkYXRhIiwidGV4dHVyZSIsIlRleHR1cmUiLCJuYW1lIiwicHJvZmlsZXJIaW50IiwiVEVYSElOVF9BU1NFVCIsImFkZHJlc3NVIiwiY3ViZW1hcCIsIkFERFJFU1NfQ0xBTVBfVE9fRURHRSIsIkFERFJFU1NfUkVQRUFUIiwiYWRkcmVzc1YiLCJ3aWR0aCIsImhlaWdodCIsImZvcm1hdCIsImxldmVscyIsInVwbG9hZCIsImFycmF5YnVmZmVyIiwicnMiLCJSZWFkU3RyZWFtIiwibWFnaWMiLCJyZWFkVTMyYmUiLCJEZWJ1ZyIsIndhcm4iLCJoZWFkZXIiLCJ2a0Zvcm1hdCIsInJlYWRVMzIiLCJ0eXBlU2l6ZSIsInBpeGVsV2lkdGgiLCJwaXhlbEhlaWdodCIsInBpeGVsRGVwdGgiLCJsYXllckNvdW50IiwiZmFjZUNvdW50IiwibGV2ZWxDb3VudCIsInN1cGVyY29tcHJlc3Npb25TY2hlbWUiLCJpbmRleCIsImRmZEJ5dGVPZmZzZXQiLCJkZmRCeXRlTGVuZ3RoIiwia3ZkQnl0ZU9mZnNldCIsImt2ZEJ5dGVMZW5ndGgiLCJzZ2RCeXRlT2Zmc2V0IiwicmVhZFU2NCIsInNnZEJ5dGVMZW5ndGgiLCJpIiwiTWF0aCIsIm1heCIsInB1c2giLCJieXRlT2Zmc2V0IiwiYnl0ZUxlbmd0aCIsInVuY29tcHJlc3NlZEJ5dGVMZW5ndGgiLCJkZmRUb3RhbFNpemUiLCJza2lwIiwiY29sb3JNb2RlbCIsInJlYWRVOCIsImJhc2lzTW9kdWxlRm91bmQiLCJiYXNpc1RyYW5zY29kZSIsImlzR0dHUiIsImZpbGUiLCJ2YXJpYW50cyIsImJhc2lzIiwib3B0IiwiaXNLVFgyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFTQSxNQUFNQSxZQUFZLEdBQUc7QUFDakJDLEVBQUFBLGtCQUFrQixFQUFFLEdBREg7QUFFakJDLEVBQUFBLGtCQUFrQixFQUFFLEdBQUE7QUFGSCxDQUFyQixDQUFBOztBQVdBLE1BQU1DLFVBQU4sQ0FBaUI7QUFDYkMsRUFBQUEsV0FBVyxDQUFDQyxRQUFELEVBQVdDLE1BQVgsRUFBbUI7SUFDMUIsSUFBS0MsQ0FBQUEsVUFBTCxHQUFrQixDQUFsQixDQUFBO0lBQ0EsSUFBS0QsQ0FBQUEsTUFBTCxHQUFjQSxNQUFkLENBQUE7QUFDSCxHQUFBOztBQUVERSxFQUFBQSxJQUFJLENBQUNDLEdBQUQsRUFBTUMsUUFBTixFQUFnQkMsS0FBaEIsRUFBdUI7SUFDdkJDLEtBQUssQ0FBQ0MsZ0JBQU4sQ0FBdUJKLEdBQUcsQ0FBQ0QsSUFBM0IsRUFBaUMsQ0FBQ00sR0FBRCxFQUFNQyxNQUFOLEtBQWlCO0FBQzlDLE1BQUEsSUFBSUQsR0FBSixFQUFTO0FBQ0xKLFFBQUFBLFFBQVEsQ0FBQ0ksR0FBRCxFQUFNQyxNQUFOLENBQVIsQ0FBQTtBQUNILE9BRkQsTUFFTztRQUNILElBQUtDLENBQUFBLEtBQUwsQ0FBV0QsTUFBWCxFQUFtQk4sR0FBbkIsRUFBd0JDLFFBQXhCLEVBQWtDQyxLQUFsQyxDQUFBLENBQUE7QUFDSCxPQUFBO0FBQ0osS0FORCxFQU1HQSxLQU5ILEVBTVUsSUFBQSxDQUFLSixVQU5mLENBQUEsQ0FBQTtBQU9ILEdBQUE7O0FBRURVLEVBQUFBLElBQUksQ0FBQ1IsR0FBRCxFQUFNUyxJ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
