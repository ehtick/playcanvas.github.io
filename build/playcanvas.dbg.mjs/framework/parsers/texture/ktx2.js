/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../../core/debug.js';
import { Asset } from '../../asset/asset.js';
import { Texture } from '../../../platform/graphics/texture.js';
import { basisTranscode } from '../../handlers/basis.js';
import { ReadStream } from '../../../core/read-stream.js';
import { TEXHINT_ASSET, ADDRESS_CLAMP_TO_EDGE, ADDRESS_REPEAT } from '../../../platform/graphics/constants.js';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3R4Mi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9wYXJzZXJzL3RleHR1cmUva3R4Mi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZWJ1ZyB9IGZyb20gJy4uLy4uLy4uL2NvcmUvZGVidWcuanMnO1xuaW1wb3J0IHsgQXNzZXQgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvYXNzZXQvYXNzZXQuanMnO1xuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uLy4uLy4uL3BsYXRmb3JtL2dyYXBoaWNzL3RleHR1cmUuanMnO1xuaW1wb3J0IHsgYmFzaXNUcmFuc2NvZGUgfSBmcm9tICcuLi8uLi9oYW5kbGVycy9iYXNpcy5qcyc7XG5pbXBvcnQgeyBSZWFkU3RyZWFtIH0gZnJvbSAnLi4vLi4vLi4vY29yZS9yZWFkLXN0cmVhbS5qcyc7XG5pbXBvcnQgeyBBRERSRVNTX0NMQU1QX1RPX0VER0UsIEFERFJFU1NfUkVQRUFULCBURVhISU5UX0FTU0VUIH0gZnJvbSAnLi4vLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3MvY29uc3RhbnRzLmpzJztcblxuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4uLy4uL2hhbmRsZXJzL3RleHR1cmUuanMnKS5UZXh0dXJlUGFyc2VyfSBUZXh0dXJlUGFyc2VyICovXG5cbmNvbnN0IEtIUkNvbnN0YW50cyA9IHtcbiAgICBLSFJfREZfTU9ERUxfRVRDMVM6IDE2MyxcbiAgICBLSFJfREZfTU9ERUxfVUFTVEM6IDE2NlxufTtcblxuLyoqXG4gKiBUZXh0dXJlIHBhcnNlciBmb3Iga3R4MiBmaWxlcy5cbiAqXG4gKiBAaW1wbGVtZW50cyB7VGV4dHVyZVBhcnNlcn1cbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgS3R4MlBhcnNlciB7XG4gICAgY29uc3RydWN0b3IocmVnaXN0cnksIGRldmljZSkge1xuICAgICAgICB0aGlzLm1heFJldHJpZXMgPSAwO1xuICAgICAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICB9XG5cbiAgICBsb2FkKHVybCwgY2FsbGJhY2ssIGFzc2V0KSB7XG4gICAgICAgIEFzc2V0LmZldGNoQXJyYXlCdWZmZXIodXJsLmxvYWQsIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZShyZXN1bHQsIHVybCwgY2FsbGJhY2ssIGFzc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgYXNzZXQsIHRoaXMubWF4UmV0cmllcyk7XG4gICAgfVxuXG4gICAgb3Blbih1cmwsIGRhdGEsIGRldmljZSkge1xuICAgICAgICBjb25zdCB0ZXh0dXJlID0gbmV3IFRleHR1cmUoZGV2aWNlLCB7XG4gICAgICAgICAgICBuYW1lOiB1cmwsXG4gICAgICAgICAgICAvLyAjaWYgX1BST0ZJTEVSXG4gICAgICAgICAgICBwcm9maWxlckhpbnQ6IFRFWEhJTlRfQVNTRVQsXG4gICAgICAgICAgICAvLyAjZW5kaWZcbiAgICAgICAgICAgIGFkZHJlc3NVOiBkYXRhLmN1YmVtYXAgPyBBRERSRVNTX0NMQU1QX1RPX0VER0UgOiBBRERSRVNTX1JFUEVBVCxcbiAgICAgICAgICAgIGFkZHJlc3NWOiBkYXRhLmN1YmVtYXAgPyBBRERSRVNTX0NMQU1QX1RPX0VER0UgOiBBRERSRVNTX1JFUEVBVCxcbiAgICAgICAgICAgIHdpZHRoOiBkYXRhLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBkYXRhLmhlaWdodCxcbiAgICAgICAgICAgIGZvcm1hdDogZGF0YS5mb3JtYXQsXG4gICAgICAgICAgICBjdWJlbWFwOiBkYXRhLmN1YmVtYXAsXG4gICAgICAgICAgICBsZXZlbHM6IGRhdGEubGV2ZWxzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRleHR1cmUudXBsb2FkKCk7XG5cbiAgICAgICAgcmV0dXJuIHRleHR1cmU7XG4gICAgfVxuXG4gICAgcGFyc2UoYXJyYXlidWZmZXIsIHVybCwgY2FsbGJhY2ssIGFzc2V0KSB7XG4gICAgICAgIGNvbnN0IHJzID0gbmV3IFJlYWRTdHJlYW0oYXJyYXlidWZmZXIpO1xuXG4gICAgICAgIC8vIGNoZWNrIG1hZ2ljIGhlYWRlciBiaXRzOiAgJ8KrJywgJ0snLCAnVCcsICdYJywgJyAnLCAnMicsICcwJywgJ8K7JywgJ1xccicsICdcXG4nLCAnXFx4MUEnLCAnXFxuJ1xcXG4gICAgICAgIGNvbnN0IG1hZ2ljID0gW3JzLnJlYWRVMzJiZSgpLCBycy5yZWFkVTMyYmUoKSwgcnMucmVhZFUzMmJlKCldO1xuICAgICAgICBpZiAobWFnaWNbMF0gIT09IDB4QUI0QjU0NTggfHwgbWFnaWNbMV0gIT09IDB4MjAzMjMwQkIgfHwgbWFnaWNbMl0gIT09IDB4MEQwQTFBMEEpIHtcbiAgICAgICAgICAgIERlYnVnLndhcm4oJ0ludmFsaWQgZGVmaW5pdGlvbiBoZWFkZXIgZm91bmQgaW4gS1RYMiBmaWxlLiBFeHBlY3RlZCAweEFCNEI1NDU4LCAweDIwMzEzMUJCLCAweDBEMEExQTBBJyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVucGFjayBoZWFkZXJcbiAgICAgICAgY29uc3QgaGVhZGVyID0ge1xuICAgICAgICAgICAgdmtGb3JtYXQ6IHJzLnJlYWRVMzIoKSxcbiAgICAgICAgICAgIHR5cGVTaXplOiBycy5yZWFkVTMyKCksXG4gICAgICAgICAgICBwaXhlbFdpZHRoOiBycy5yZWFkVTMyKCksXG4gICAgICAgICAgICBwaXhlbEhlaWdodDogcnMucmVhZFUzMigpLFxuICAgICAgICAgICAgcGl4ZWxEZXB0aDogcnMucmVhZFUzMigpLFxuICAgICAgICAgICAgbGF5ZXJDb3VudDogcnMucmVhZFUzMigpLFxuICAgICAgICAgICAgZmFjZUNvdW50OiBycy5yZWFkVTMyKCksXG4gICAgICAgICAgICBsZXZlbENvdW50OiBycy5yZWFkVTMyKCksXG4gICAgICAgICAgICBzdXBlcmNvbXByZXNzaW9uU2NoZW1lOiBycy5yZWFkVTMyKClcbiAgICAgICAgfTtcblxuICAgICAgICAvLyB1bnBhY2sgaW5kZXhcbiAgICAgICAgY29uc3QgaW5kZXggPSB7XG4gICAgICAgICAgICBkZmRCeXRlT2Zmc2V0OiBycy5yZWFkVTMyKCksXG4gICAgICAgICAgICBkZmRCeXRlTGVuZ3RoOiBycy5yZWFkVTMyKCksXG4gICAgICAgICAgICBrdmRCeXRlT2Zmc2V0OiBycy5yZWFkVTMyKCksXG4gICAgICAgICAgICBrdmRCeXRlTGVuZ3RoOiBycy5yZWFkVTMyKCksXG4gICAgICAgICAgICBzZ2RCeXRlT2Zmc2V0OiBycy5yZWFkVTY0KCksXG4gICAgICAgICAgICBzZ2RCeXRlTGVuZ3RoOiBycy5yZWFkVTY0KClcbiAgICAgICAgfTtcblxuICAgICAgICAvLyB1bnBhY2sgbGV2ZWxzXG4gICAgICAgIGNvbnN0IGxldmVscyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgubWF4KDEsIGhlYWRlci5sZXZlbENvdW50KTsgKytpKSB7XG4gICAgICAgICAgICBsZXZlbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgYnl0ZU9mZnNldDogcnMucmVhZFU2NCgpLFxuICAgICAgICAgICAgICAgIGJ5dGVMZW5ndGg6IHJzLnJlYWRVNjQoKSxcbiAgICAgICAgICAgICAgICB1bmNvbXByZXNzZWRCeXRlTGVuZ3RoOiBycy5yZWFkVTY0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdW5wYWNrIGRhdGEgZm9ybWF0IGRlc2NyaXB0b3JcbiAgICAgICAgY29uc3QgZGZkVG90YWxTaXplID0gcnMucmVhZFUzMigpO1xuICAgICAgICBpZiAoZGZkVG90YWxTaXplICE9PSBpbmRleC5rdmRCeXRlT2Zmc2V0IC0gaW5kZXguZGZkQnl0ZU9mZnNldCkge1xuICAgICAgICAgICAgRGVidWcud2FybignSW52YWxpZCBmaWxlIGRhdGEgZW5jb3VudGVyZWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJzLnNraXAoOCk7XG4gICAgICAgIGNvbnN0IGNvbG9yTW9kZWwgPSBycy5yZWFkVTgoKTtcbiAgICAgICAgcnMuc2tpcChpbmRleC5kZmRCeXRlTGVuZ3RoIC0gOSk7XG5cbiAgICAgICAgLy8gc2tpcCBrZXkvdmFsdWUgcGFpcnNcbiAgICAgICAgcnMuc2tpcChpbmRleC5rdmRCeXRlTGVuZ3RoKTtcblxuICAgICAgICBpZiAoaGVhZGVyLnN1cGVyY29tcHJlc3Npb25TY2hlbWUgPT09IDEgfHwgY29sb3JNb2RlbCA9PT0gS0hSQ29uc3RhbnRzLktIUl9ERl9NT0RFTF9VQVNUQykge1xuICAgICAgICAgICAgLy8gYXNzdW1lIGZvciBub3cgYWxsIHN1cGVyIGNvbXByZXNzZWQgaW1hZ2VzIGFyZSBiYXNpc1xuICAgICAgICAgICAgY29uc3QgYmFzaXNNb2R1bGVGb3VuZCA9IGJhc2lzVHJhbnNjb2RlKFxuICAgICAgICAgICAgICAgIHRoaXMuZGV2aWNlLFxuICAgICAgICAgICAgICAgIHVybC5sb2FkLFxuICAgICAgICAgICAgICAgIGFycmF5YnVmZmVyLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaXNHR0dSOiAoYXNzZXQ/LmZpbGU/LnZhcmlhbnRzPy5iYXNpcz8ub3B0ICYgOCkgIT09IDAsXG4gICAgICAgICAgICAgICAgICAgIGlzS1RYMjogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmICghYmFzaXNNb2R1bGVGb3VuZCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCdCYXNpcyBtb2R1bGUgbm90IGZvdW5kLiBBc3NldCBcIicgKyBhc3NldC5uYW1lICsgJ1wiIGJhc2lzIHRleHR1cmUgdmFyaWFudCB3aWxsIG5vdCBiZSBsb2FkZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBsb2FkIG5vbi1zdXBlcmNvbXByZXNzZWQgZm9ybWF0c1xuICAgICAgICAgICAgY2FsbGJhY2soJ3Vuc3VwcG9ydGVkIEtUWDIgcGl4ZWwgZm9ybWF0Jyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7XG4gICAgS3R4MlBhcnNlclxufTtcbiJdLCJuYW1lcyI6WyJLSFJDb25zdGFudHMiLCJLSFJfREZfTU9ERUxfRVRDMVMiLCJLSFJfREZfTU9ERUxfVUFTVEMiLCJLdHgyUGFyc2VyIiwiY29uc3RydWN0b3IiLCJyZWdpc3RyeSIsImRldmljZSIsIm1heFJldHJpZXMiLCJsb2FkIiwidXJsIiwiY2FsbGJhY2siLCJhc3NldCIsIkFzc2V0IiwiZmV0Y2hBcnJheUJ1ZmZlciIsImVyciIsInJlc3VsdCIsInBhcnNlIiwib3BlbiIsImRhdGEiLCJ0ZXh0dXJlIiwiVGV4dHVyZSIsIm5hbWUiLCJwcm9maWxlckhpbnQiLCJURVhISU5UX0FTU0VUIiwiYWRkcmVzc1UiLCJjdWJlbWFwIiwiQUREUkVTU19DTEFNUF9UT19FREdFIiwiQUREUkVTU19SRVBFQVQiLCJhZGRyZXNzViIsIndpZHRoIiwiaGVpZ2h0IiwiZm9ybWF0IiwibGV2ZWxzIiwidXBsb2FkIiwiYXJyYXlidWZmZXIiLCJycyIsIlJlYWRTdHJlYW0iLCJtYWdpYyIsInJlYWRVMzJiZSIsIkRlYnVnIiwid2FybiIsImhlYWRlciIsInZrRm9ybWF0IiwicmVhZFUzMiIsInR5cGVTaXplIiwicGl4ZWxXaWR0aCIsInBpeGVsSGVpZ2h0IiwicGl4ZWxEZXB0aCIsImxheWVyQ291bnQiLCJmYWNlQ291bnQiLCJsZXZlbENvdW50Iiwic3VwZXJjb21wcmVzc2lvblNjaGVtZSIsImluZGV4IiwiZGZkQnl0ZU9mZnNldCIsImRmZEJ5dGVMZW5ndGgiLCJrdmRCeXRlT2Zmc2V0Iiwia3ZkQnl0ZUxlbmd0aCIsInNnZEJ5dGVPZmZzZXQiLCJyZWFkVTY0Iiwic2dkQnl0ZUxlbmd0aCIsImkiLCJNYXRoIiwibWF4IiwicHVzaCIsImJ5dGVPZmZzZXQiLCJieXRlTGVuZ3RoIiwidW5jb21wcmVzc2VkQnl0ZUxlbmd0aCIsImRmZFRvdGFsU2l6ZSIsInNraXAiLCJjb2xvck1vZGVsIiwicmVhZFU4IiwiYmFzaXNNb2R1bGVGb3VuZCIsImJhc2lzVHJhbnNjb2RlIiwiaXNHR0dSIiwiZmlsZSIsInZhcmlhbnRzIiwiYmFzaXMiLCJvcHQiLCJpc0tUWDIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVNBLE1BQU1BLFlBQVksR0FBRztBQUNqQkMsRUFBQUEsa0JBQWtCLEVBQUUsR0FBRztBQUN2QkMsRUFBQUEsa0JBQWtCLEVBQUUsR0FBQTtBQUN4QixDQUFDLENBQUE7O0FBUUQsTUFBTUMsVUFBVSxDQUFDO0FBQ2JDLEVBQUFBLFdBQVcsQ0FBQ0MsUUFBUSxFQUFFQyxNQUFNLEVBQUU7SUFDMUIsSUFBSSxDQUFDQyxVQUFVLEdBQUcsQ0FBQyxDQUFBO0lBQ25CLElBQUksQ0FBQ0QsTUFBTSxHQUFHQSxNQUFNLENBQUE7QUFDeEIsR0FBQTtBQUVBRSxFQUFBQSxJQUFJLENBQUNDLEdBQUcsRUFBRUMsUUFBUSxFQUFFQyxLQUFLLEVBQUU7SUFDdkJDLEtBQUssQ0FBQ0MsZ0JBQWdCLENBQUNKLEdBQUcsQ0FBQ0QsSUFBSSxFQUFFLENBQUNNLEdBQUcsRUFBRUMsTUFBTSxLQUFLO0FBQzlDLE1BQUEsSUFBSUQsR0FBRyxFQUFFO0FBQ0xKLFFBQUFBLFFBQVEsQ0FBQ0ksR0FBRyxFQUFFQyxNQUFNLENBQUMsQ0FBQTtBQUN6QixPQUFDLE1BQU07UUFDSCxJQUFJLENBQUNDLEtBQUssQ0FBQ0QsTUFBTSxFQUFFTixHQUFHLEVBQUVDLFFBQVEsRUFBRUMsS0FBSyxDQUFDLENBQUE7QUFDNUMsT0FBQTtBQUNKLEtBQUMsRUFBRUEsS0FBSyxFQUFFLElBQUksQ0FBQ0osVUFBVSxDQUFDLENBQUE7QUFDOUIsR0FBQTtBQUVB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
