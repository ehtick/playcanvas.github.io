/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../../../core/debug.js';
import { PIXELFORMAT_RGB8, TEXHINT_ASSET, ADDRESS_CLAMP_TO_EDGE, ADDRESS_REPEAT, PIXELFORMAT_DXT1, PIXELFORMAT_DXT5, PIXELFORMAT_RGBA16F, PIXELFORMAT_RGBA32F, PIXELFORMAT_ETC1, PIXELFORMAT_PVRTC_2BPP_RGB_1, PIXELFORMAT_PVRTC_2BPP_RGBA_1, PIXELFORMAT_PVRTC_4BPP_RGB_1, PIXELFORMAT_PVRTC_4BPP_RGBA_1, PIXELFORMAT_RGBA8 } from '../../../platform/graphics/constants.js';
import { Texture } from '../../../platform/graphics/texture.js';
import { Asset } from '../../asset/asset.js';

class DdsParser {
  constructor(registry) {
    this.maxRetries = 0;
  }
  load(url, callback, asset) {
    Asset.fetchArrayBuffer(url.load, callback, asset, this.maxRetries);
  }
  open(url, data, device) {
    const header = new Uint32Array(data, 0, 128 / 4);
    const width = header[4];
    const height = header[3];
    const mips = Math.max(header[7], 1);
    const isFourCc = header[20] === 4;
    const fcc = header[21];
    const bpp = header[22];
    const isCubemap = header[28] === 65024;

    const FCC_DXT1 = 827611204;
    const FCC_DXT5 = 894720068;
    const FCC_FP16 = 113;
    const FCC_FP32 = 116;

    const FCC_ETC1 = 826496069;
    const FCC_PVRTC_2BPP_RGB_1 = 825438800;
    const FCC_PVRTC_2BPP_RGBA_1 = 825504336;
    const FCC_PVRTC_4BPP_RGB_1 = 825439312;
    const FCC_PVRTC_4BPP_RGBA_1 = 825504848;
    let compressed = false;
    let etc1 = false;
    let pvrtc2 = false;
    let pvrtc4 = false;
    let format = null;
    let componentSize = 1;
    let texture;
    if (isFourCc) {
      if (fcc === FCC_DXT1) {
        format = PIXELFORMAT_DXT1;
        compressed = true;
      } else if (fcc === FCC_DXT5) {
        format = PIXELFORMAT_DXT5;
        compressed = true;
      } else if (fcc === FCC_FP16) {
        format = PIXELFORMAT_RGBA16F;
        componentSize = 2;
      } else if (fcc === FCC_FP32) {
        format = PIXELFORMAT_RGBA32F;
        componentSize = 4;
      } else if (fcc === FCC_ETC1) {
        format = PIXELFORMAT_ETC1;
        compressed = true;
        etc1 = true;
      } else if (fcc === FCC_PVRTC_2BPP_RGB_1 || fcc === FCC_PVRTC_2BPP_RGBA_1) {
        format = fcc === FCC_PVRTC_2BPP_RGB_1 ? PIXELFORMAT_PVRTC_2BPP_RGB_1 : PIXELFORMAT_PVRTC_2BPP_RGBA_1;
        compressed = true;
        pvrtc2 = true;
      } else if (fcc === FCC_PVRTC_4BPP_RGB_1 || fcc === FCC_PVRTC_4BPP_RGBA_1) {
        format = fcc === FCC_PVRTC_4BPP_RGB_1 ? PIXELFORMAT_PVRTC_4BPP_RGB_1 : PIXELFORMAT_PVRTC_4BPP_RGBA_1;
        compressed = true;
        pvrtc4 = true;
      }
    } else {
      if (bpp === 32) {
        format = PIXELFORMAT_RGBA8;
      }
    }
    if (!format) {
      Debug.error('This DDS pixel format is currently unsupported. Empty texture will be created instead.');
      texture = new Texture(device, {
        width: 4,
        height: 4,
        format: PIXELFORMAT_RGB8,
        name: 'dds-legacy-empty'
      });
      return texture;
    }
    texture = new Texture(device, {
      name: url,
      profilerHint: TEXHINT_ASSET,
      addressU: isCubemap ? ADDRESS_CLAMP_TO_EDGE : ADDRESS_REPEAT,
      addressV: isCubemap ? ADDRESS_CLAMP_TO_EDGE : ADDRESS_REPEAT,
      width: width,
      height: height,
      format: format,
      cubemap: isCubemap,
      mipmaps: mips > 1
    });
    let offset = 128;
    const faces = isCubemap ? 6 : 1;
    let mipSize;
    const DXT_BLOCK_WIDTH = 4;
    const DXT_BLOCK_HEIGHT = 4;
    const blockSize = fcc === FCC_DXT1 ? 8 : 16;
    let numBlocksAcross, numBlocksDown, numBlocks;
    for (let face = 0; face < faces; face++) {
      let mipWidth = width;
      let mipHeight = height;
      for (let i = 0; i < mips; i++) {
        if (compressed) {
          if (etc1) {
            mipSize = Math.floor((mipWidth + 3) / 4) * Math.floor((mipHeight + 3) / 4) * 8;
          } else if (pvrtc2) {
            mipSize = Math.max(mipWidth, 16) * Math.max(mipHeight, 8) / 4;
          } else if (pvrtc4) {
            mipSize = Math.max(mipWidth, 8) * Math.max(mipHeight, 8) / 2;
          } else {
            numBlocksAcross = Math.floor((mipWidth + DXT_BLOCK_WIDTH - 1) / DXT_BLOCK_WIDTH);
            numBlocksDown = Math.floor((mipHeight + DXT_BLOCK_HEIGHT - 1) / DXT_BLOCK_HEIGHT);
            numBlocks = numBlocksAcross * numBlocksDown;
            mipSize = numBlocks * blockSize;
          }
        } else {
          mipSize = mipWidth * mipHeight * 4;
        }
        const mipBuff = format === PIXELFORMAT_RGBA32F ? new Float32Array(data, offset, mipSize) : format === PIXELFORMAT_RGBA16F ? new Uint16Array(data, offset, mipSize) : new Uint8Array(data, offset, mipSize);
        if (!isCubemap) {
          texture._levels[i] = mipBuff;
        } else {
          if (!texture._levels[i]) texture._levels[i] = [];
          texture._levels[i][face] = mipBuff;
        }
        offset += mipSize * componentSize;
        mipWidth = Math.max(mipWidth * 0.5, 1);
        mipHeight = Math.max(mipHeight * 0.5, 1);
      }
    }
    texture.upload();
    return texture;
  }
}

export { DdsParser };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGRzLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL3BhcnNlcnMvdGV4dHVyZS9kZHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGVidWcgfSBmcm9tICcuLi8uLi8uLi9jb3JlL2RlYnVnLmpzJztcblxuaW1wb3J0IHtcbiAgICBBRERSRVNTX0NMQU1QX1RPX0VER0UsIEFERFJFU1NfUkVQRUFULFxuICAgIFBJWEVMRk9STUFUX0RYVDEsIFBJWEVMRk9STUFUX0RYVDUsXG4gICAgUElYRUxGT1JNQVRfRVRDMSxcbiAgICBQSVhFTEZPUk1BVF9QVlJUQ180QlBQX1JHQl8xLCBQSVhFTEZPUk1BVF9QVlJUQ18yQlBQX1JHQl8xLCBQSVhFTEZPUk1BVF9QVlJUQ180QlBQX1JHQkFfMSwgUElYRUxGT1JNQVRfUFZSVENfMkJQUF9SR0JBXzEsXG4gICAgUElYRUxGT1JNQVRfUkdCOCwgUElYRUxGT1JNQVRfUkdCQTgsXG4gICAgUElYRUxGT1JNQVRfUkdCQTE2RiwgUElYRUxGT1JNQVRfUkdCQTMyRixcbiAgICBURVhISU5UX0FTU0VUXG59IGZyb20gJy4uLy4uLy4uL3BsYXRmb3JtL2dyYXBoaWNzL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi4vLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3MvdGV4dHVyZS5qcyc7XG5cbmltcG9ydCB7IEFzc2V0IH0gZnJvbSAnLi4vLi4vYXNzZXQvYXNzZXQuanMnO1xuXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi4vLi4vaGFuZGxlcnMvdGV4dHVyZS5qcycpLlRleHR1cmVQYXJzZXJ9IFRleHR1cmVQYXJzZXIgKi9cblxuLyoqXG4gKiBMZWdhY3kgdGV4dHVyZSBwYXJzZXIgZm9yIGRkcyBmaWxlcy5cbiAqXG4gKiBAaW1wbGVtZW50cyB7VGV4dHVyZVBhcnNlcn1cbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgRGRzUGFyc2VyIHtcbiAgICBjb25zdHJ1Y3RvcihyZWdpc3RyeSkge1xuICAgICAgICB0aGlzLm1heFJldHJpZXMgPSAwO1xuICAgIH1cblxuICAgIGxvYWQodXJsLCBjYWxsYmFjaywgYXNzZXQpIHtcbiAgICAgICAgQXNzZXQuZmV0Y2hBcnJheUJ1ZmZlcih1cmwubG9hZCwgY2FsbGJhY2ssIGFzc2V0LCB0aGlzLm1heFJldHJpZXMpO1xuICAgIH1cblxuICAgIG9wZW4odXJsLCBkYXRhLCBkZXZpY2UpIHtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gbmV3IFVpbnQzMkFycmF5KGRhdGEsIDAsIDEyOCAvIDQpO1xuXG4gICAgICAgIGNvbnN0IHdpZHRoID0gaGVhZGVyWzRdO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSBoZWFkZXJbM107XG4gICAgICAgIGNvbnN0IG1pcHMgPSBNYXRoLm1heChoZWFkZXJbN10sIDEpO1xuICAgICAgICBjb25zdCBpc0ZvdXJDYyA9IGhlYWRlclsyMF0gPT09IDQ7XG4gICAgICAgIGNvbnN0IGZjYyA9IGhlYWRlclsyMV07XG4gICAgICAgIGNvbnN0IGJwcCA9IGhlYWRlclsyMl07XG4gICAgICAgIGNvbnN0IGlzQ3ViZW1hcCA9IGhlYWRlclsyOF0gPT09IDY1MDI0OyAvLyBUT0RPOiBjaGVjayBieSBiaXRmbGFnXG5cbiAgICAgICAgY29uc3QgRkNDX0RYVDEgPSA4Mjc2MTEyMDQ7IC8vIERYVDFcbiAgICAgICAgY29uc3QgRkNDX0RYVDUgPSA4OTQ3MjAwNjg7IC8vIERYVDVcbiAgICAgICAgY29uc3QgRkNDX0ZQMTYgPSAxMTM7ICAgICAgIC8vIFJHQkExNmZcbiAgICAgICAgY29uc3QgRkNDX0ZQMzIgPSAxMTY7ICAgICAgIC8vIFJHQkEzMmZcblxuICAgICAgICAvLyBub24gc3RhbmRhcmRcbiAgICAgICAgY29uc3QgRkNDX0VUQzEgPSA4MjY0OTYwNjk7XG4gICAgICAgIGNvbnN0IEZDQ19QVlJUQ18yQlBQX1JHQl8xID0gODI1NDM4ODAwO1xuICAgICAgICBjb25zdCBGQ0NfUFZSVENfMkJQUF9SR0JBXzEgPSA4MjU1MDQzMzY7XG4gICAgICAgIGNvbnN0IEZDQ19QVlJUQ180QlBQX1JHQl8xID0gODI1NDM5MzEyO1xuICAgICAgICBjb25zdCBGQ0NfUFZSVENfNEJQUF9SR0JBXzEgPSA4MjU1MDQ4NDg7XG5cbiAgICAgICAgbGV0IGNvbXByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGV0YzEgPSBmYWxzZTtcbiAgICAgICAgbGV0IHB2cnRjMiA9IGZhbHNlO1xuICAgICAgICBsZXQgcHZydGM0ID0gZmFsc2U7XG4gICAgICAgIGxldCBmb3JtYXQgPSBudWxsO1xuICAgICAgICBsZXQgY29tcG9uZW50U2l6ZSA9IDE7XG5cbiAgICAgICAgbGV0IHRleHR1cmU7XG5cbiAgICAgICAgaWYgKGlzRm91ckNjKSB7XG4gICAgICAgICAgICBpZiAoZmNjID09PSBGQ0NfRFhUMSkge1xuICAgICAgICAgICAgICAgIGZvcm1hdCA9IFBJWEVMRk9STUFUX0RYVDE7XG4gICAgICAgICAgICAgICAgY29tcHJlc3NlZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZjYyA9PT0gRkNDX0RYVDUpIHtcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSBQSVhFTEZPUk1BVF9EWFQ1O1xuICAgICAgICAgICAgICAgIGNvbXByZXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmY2MgPT09IEZDQ19GUDE2KSB7XG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gUElYRUxGT1JNQVRfUkdCQTE2RjtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRTaXplID0gMjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmNjID09PSBGQ0NfRlAzMikge1xuICAgICAgICAgICAgICAgIGZvcm1hdCA9IFBJWEVMRk9STUFUX1JHQkEzMkY7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50U2l6ZSA9IDQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZjYyA9PT0gRkNDX0VUQzEpIHtcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSBQSVhFTEZPUk1BVF9FVEMxO1xuICAgICAgICAgICAgICAgIGNvbXByZXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGV0YzEgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmY2MgPT09IEZDQ19QVlJUQ18yQlBQX1JHQl8xIHx8IGZjYyA9PT0gRkNDX1BWUlRDXzJCUFBfUkdCQV8xKSB7XG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gZmNjID09PSBGQ0NfUFZSVENfMkJQUF9SR0JfMSA/IFBJWEVMRk9STUFUX1BWUlRDXzJCUFBfUkdCXzEgOiBQSVhFTEZPUk1BVF9QVlJUQ18yQlBQX1JHQkFfMTtcbiAgICAgICAgICAgICAgICBjb21wcmVzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBwdnJ0YzIgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmY2MgPT09IEZDQ19QVlJUQ180QlBQX1JHQl8xIHx8IGZjYyA9PT0gRkNDX1BWUlRDXzRCUFBfUkdCQV8xKSB7XG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gZmNjID09PSBGQ0NfUFZSVENfNEJQUF9SR0JfMSA/IFBJWEVMRk9STUFUX1BWUlRDXzRCUFBfUkdCXzEgOiBQSVhFTEZPUk1BVF9QVlJUQ180QlBQX1JHQkFfMTtcbiAgICAgICAgICAgICAgICBjb21wcmVzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBwdnJ0YzQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGJwcCA9PT0gMzIpIHtcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSBQSVhFTEZPUk1BVF9SR0JBODtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZm9ybWF0KSB7XG4gICAgICAgICAgICBEZWJ1Zy5lcnJvcignVGhpcyBERFMgcGl4ZWwgZm9ybWF0IGlzIGN1cnJlbnRseSB1bnN1cHBvcnRlZC4gRW1wdHkgdGV4dHVyZSB3aWxsIGJlIGNyZWF0ZWQgaW5zdGVhZC4nKTtcbiAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgVGV4dHVyZShkZXZpY2UsIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDQsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBQSVhFTEZPUk1BVF9SR0I4LFxuICAgICAgICAgICAgICAgIG5hbWU6ICdkZHMtbGVnYWN5LWVtcHR5J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRleHR1cmUgPSBuZXcgVGV4dHVyZShkZXZpY2UsIHtcbiAgICAgICAgICAgIG5hbWU6IHVybCxcbiAgICAgICAgICAgIC8vICNpZiBfUFJPRklMRVJcbiAgICAgICAgICAgIHByb2ZpbGVySGludDogVEVYSElOVF9BU1NFVCxcbiAgICAgICAgICAgIC8vICNlbmRpZlxuICAgICAgICAgICAgYWRkcmVzc1U6IGlzQ3ViZW1hcCA/IEFERFJFU1NfQ0xBTVBfVE9fRURHRSA6IEFERFJFU1NfUkVQRUFULFxuICAgICAgICAgICAgYWRkcmVzc1Y6IGlzQ3ViZW1hcCA/IEFERFJFU1NfQ0xBTVBfVE9fRURHRSA6IEFERFJFU1NfUkVQRUFULFxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICBmb3JtYXQ6IGZvcm1hdCxcbiAgICAgICAgICAgIGN1YmVtYXA6IGlzQ3ViZW1hcCxcbiAgICAgICAgICAgIG1pcG1hcHM6IG1pcHMgPiAxXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBvZmZzZXQgPSAxMjg7XG4gICAgICAgIGNvbnN0IGZhY2VzID0gaXNDdWJlbWFwID8gNiA6IDE7XG4gICAgICAgIGxldCBtaXBTaXplO1xuICAgICAgICBjb25zdCBEWFRfQkxPQ0tfV0lEVEggPSA0O1xuICAgICAgICBjb25zdCBEWFRfQkxPQ0tfSEVJR0hUID0gNDtcbiAgICAgICAgY29uc3QgYmxvY2tTaXplID0gZmNjID09PSBGQ0NfRFhUMSA/IDggOiAxNjtcbiAgICAgICAgbGV0IG51bUJsb2Nrc0Fjcm9zcywgbnVtQmxvY2tzRG93biwgbnVtQmxvY2tzO1xuICAgICAgICBmb3IgKGxldCBmYWNlID0gMDsgZmFjZSA8IGZhY2VzOyBmYWNlKyspIHtcbiAgICAgICAgICAgIGxldCBtaXBXaWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgbGV0IG1pcEhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWlwczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV0YzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pcFNpemUgPSBNYXRoLmZsb29yKChtaXBXaWR0aCArIDMpIC8gNCkgKiBNYXRoLmZsb29yKChtaXBIZWlnaHQgKyAzKSAvIDQpICogODtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwdnJ0YzIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pcFNpemUgPSBNYXRoLm1heChtaXBXaWR0aCwgMTYpICogTWF0aC5tYXgobWlwSGVpZ2h0LCA4KSAvIDQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHZydGM0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaXBTaXplID0gTWF0aC5tYXgobWlwV2lkdGgsIDgpICogTWF0aC5tYXgobWlwSGVpZ2h0LCA4KSAvIDI7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBudW1CbG9ja3NBY3Jvc3MgPSBNYXRoLmZsb29yKChtaXBXaWR0aCArIERYVF9CTE9DS19XSURUSCAtIDEpIC8gRFhUX0JMT0NLX1dJRFRIKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bUJsb2Nrc0Rvd24gPSBNYXRoLmZsb29yKChtaXBIZWlnaHQgKyBEWFRfQkxPQ0tfSEVJR0hUIC0gMSkgLyBEWFRfQkxPQ0tfSEVJR0hUKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bUJsb2NrcyA9IG51bUJsb2Nrc0Fjcm9zcyAqIG51bUJsb2Nrc0Rvd247XG4gICAgICAgICAgICAgICAgICAgICAgICBtaXBTaXplID0gbnVtQmxvY2tzICogYmxvY2tTaXplO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWlwU2l6ZSA9IG1pcFdpZHRoICogbWlwSGVpZ2h0ICogNDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBtaXBCdWZmID0gZm9ybWF0ID09PSBQSVhFTEZPUk1BVF9SR0JBMzJGID8gbmV3IEZsb2F0MzJBcnJheShkYXRhLCBvZmZzZXQsIG1pcFNpemUpIDpcbiAgICAgICAgICAgICAgICAgICAgKGZvcm1hdCA9PT0gUElYRUxGT1JNQVRfUkdCQTE2RiA/IG5ldyBVaW50MTZBcnJheShkYXRhLCBvZmZzZXQsIG1pcFNpemUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KGRhdGEsIG9mZnNldCwgbWlwU2l6ZSkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFpc0N1YmVtYXApIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5fbGV2ZWxzW2ldID0gbWlwQnVmZjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRleHR1cmUuX2xldmVsc1tpXSkgdGV4dHVyZS5fbGV2ZWxzW2ldID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmUuX2xldmVsc1tpXVtmYWNlXSA9IG1pcEJ1ZmY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9mZnNldCArPSBtaXBTaXplICogY29tcG9uZW50U2l6ZTtcbiAgICAgICAgICAgICAgICBtaXBXaWR0aCA9IE1hdGgubWF4KG1pcFdpZHRoICogMC41LCAxKTtcbiAgICAgICAgICAgICAgICBtaXBIZWlnaHQgPSBNYXRoLm1heChtaXBIZWlnaHQgKiAwLjUsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGV4dHVyZS51cGxvYWQoKTtcblxuICAgICAgICByZXR1cm4gdGV4dHVyZTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IERkc1BhcnNlciB9O1xuIl0sIm5hbWVzIjpbIkRkc1BhcnNlciIsImNvbnN0cnVjdG9yIiwicmVnaXN0cnkiLCJtYXhSZXRyaWVzIiwibG9hZCIsInVybCIsImNhbGxiYWNrIiwiYXNzZXQiLCJBc3NldCIsImZldGNoQXJyYXlCdWZmZXIiLCJvcGVuIiwiZGF0YSIsImRldmljZSIsImhlYWRlciIsIlVpbnQzMkFycmF5Iiwid2lkdGgiLCJoZWlnaHQiLCJtaXBzIiwiTWF0aCIsIm1heCIsImlzRm91ckNjIiwiZmNjIiwiYnBwIiwiaXNDdWJlbWFwIiwiRkNDX0RYVDEiLCJGQ0NfRFhUNSIsIkZDQ19GUDE2IiwiRkNDX0ZQMzIiLCJGQ0NfRVRDMSIsIkZDQ19QVlJUQ18yQlBQX1JHQl8xIiwiRkNDX1BWUlRDXzJCUFBfUkdCQV8xIiwiRkNDX1BWUlRDXzRCUFBfUkdCXzEiLCJGQ0NfUFZSVENfNEJQUF9SR0JBXzEiLCJjb21wcmVzc2VkIiwiZXRjMSIsInB2cnRjMiIsInB2cnRjNCIsImZvcm1hdCIsImNvbXBvbmVudFNpemUiLCJ0ZXh0dXJlIiwiUElYRUxGT1JNQVRfRFhUMSIsIlBJWEVMRk9STUFUX0RYVDUiLCJQSVhFTEZPUk1BVF9SR0JBMTZGIiwiUElYRUxGT1JNQVRfUkdCQTMyRiIsIlBJWEVMRk9STUFUX0VUQzEiLCJQSVhFTEZPUk1BVF9QVlJUQ18yQlBQX1JHQl8xIiwiUElYRUxGT1JNQVRfUFZSVENfMkJQUF9SR0JBXzEiLCJQSVhFTEZPUk1BVF9QVlJUQ180QlBQX1JHQl8xIiwiUElYRUxGT1JNQVRfUFZSVENfNEJQUF9SR0JBXzEiLCJQSVhFTEZPUk1BVF9SR0JBOCIsIkRlYnVnIiwiZXJyb3IiLCJUZXh0dXJlIiwiUElYRUxGT1JNQVRfUkdCOCIsIm5hbWUiLCJwcm9maWxlckhpbnQiLCJURVhISU5UX0FTU0VUIiwiYWRkcmVzc1UiLCJBRERSRVNTX0NMQU1QX1RPX0VER0UiLCJBRERSRVNTX1JFUEVBVCIsImFkZHJlc3NWIiwiY3ViZW1hcCIsIm1pcG1hcHMiLCJvZmZzZXQiLCJmYWNlcyIsIm1pcFNpemUiLCJEWFRfQkxPQ0tfV0lEVEgiLCJEWFRfQkxPQ0tfSEVJR0hUIiwiYmxvY2tTaXplIiwibnVtQmxvY2tzQWNyb3NzIiwibnVtQmxvY2tzRG93biIsIm51bUJsb2NrcyIsImZhY2UiLCJtaXBXaWR0aCIsIm1pcEhlaWdodCIsImkiLCJmbG9vciIsIm1pcEJ1ZmYiLCJGbG9hdDMyQXJyYXkiLCJVaW50MTZBcnJheSIsIlVpbnQ4QXJyYXkiLCJfbGV2ZWxzIiwidXBsb2FkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBdUJBLE1BQU1BLFNBQVMsQ0FBQztFQUNaQyxXQUFXLENBQUNDLFFBQVEsRUFBRTtJQUNsQixJQUFJLENBQUNDLFVBQVUsR0FBRyxDQUFDLENBQUE7QUFDdkIsR0FBQTtBQUVBQyxFQUFBQSxJQUFJLENBQUNDLEdBQUcsRUFBRUMsUUFBUSxFQUFFQyxLQUFLLEVBQUU7QUFDdkJDLElBQUFBLEtBQUssQ0FBQ0MsZ0JBQWdCLENBQUNKLEdBQUcsQ0FBQ0QsSUFBSSxFQUFFRSxRQUFRLEVBQUVDLEtBQUssRUFBRSxJQUFJLENBQUNKLFVBQVUsQ0FBQyxDQUFBO0FBQ3RFLEdBQUE7QUFFQU8sRUFBQUEsSUFBSSxDQUFDTCxHQUFHLEVBQUVNLElBQUksRUFBRUMsTUFBTSxFQUFFO0FBQ3BCLElBQUEsTUFBTUMsTUFBTSxHQUFHLElBQUlDLFdBQVcsQ0FBQ0gsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFFaEQsSUFBQSxNQUFNSSxL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
