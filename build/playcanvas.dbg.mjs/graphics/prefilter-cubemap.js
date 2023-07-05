/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Debug } from '../core/debug.js';
import { Vec3 } from '../math/vec3.js';
import { PIXELFORMAT_R8_G8_B8_A8, TEXTURETYPE_DEFAULT, TEXTURETYPE_RGBM } from './constants.js';
import { createShaderFromCode } from './program-lib/utils.js';
import { drawQuadWithShader } from './simple-post-effect.js';
import { shaderChunks } from './program-lib/chunks/chunks.js';
import { RenderTarget } from './render-target.js';
import { Texture } from './texture.js';

function areaElement(x, y) {
  return Math.atan2(x * y, Math.sqrt(x * x + y * y + 1));
}

function texelCoordSolidAngle(u, v, size) {
  let _u = 2.0 * (u + 0.5) / size - 1.0;

  let _v = 2.0 * (v + 0.5) / size - 1.0;

  _u *= 1.0 - 1.0 / size;
  _v *= 1.0 - 1.0 / size;
  const invResolution = 1.0 / size;
  const x0 = _u - invResolution;
  const y0 = _v - invResolution;
  const x1 = _u + invResolution;
  const y1 = _v + invResolution;
  let solidAngle = areaElement(x0, y0) - areaElement(x0, y1) - areaElement(x1, y0) + areaElement(x1, y1);

  if (u === 0 && v === 0 || u === size - 1 && v === 0 || u === 0 && v === size - 1 || u === size - 1 && v === size - 1) {
    solidAngle /= 3;
  } else if (u === 0 || v === 0 || u === size - 1 || v === size - 1) {
    solidAngle *= 0.5;
  }

  return solidAngle;
}

function shFromCubemap(device, source, dontFlipX) {
  if (source.format !== PIXELFORMAT_R8_G8_B8_A8) {
    Debug.error("ERROR: SH: cubemap must be RGBA8");
    return null;
  }

  if (!source._levels[0] || !source._levels[0][0]) {
    Debug.error("ERROR: SH: cubemap must be synced to CPU");
    return null;
  }

  const cubeSize = source.width;

  if (!source._levels[0][0].length) {
    if (source._levels[0][0] instanceof HTMLImageElement) {
      const shader = createShaderFromCode(device, shaderChunks.fullscreenQuadVS, shaderChunks.fullscreenQuadPS, "fsQuadSimple");
      const constantTexSource = device.scope.resolve("source");

      for (let face = 0; face < 6; face++) {
        const img = source._levels[0][face];
        const tex = new Texture(device, {
          name: 'prefiltered-cube',
          cubemap: false,
          type: TEXTURETYPE_DEFAULT,
          format: source.format,
          width: cubeSize,
          height: cubeSize,
          mipmaps: false
        });
        tex._levels[0] = img;
        tex.upload();
        const tex2 = new Texture(device, {
          name: 'prefiltered-cube',
          cubemap: false,
          type: TEXTURETYPE_DEFAULT,
          format: source.format,
          width: cubeSize,
          height: cubeSize,
          mipmaps: false
        });
        const targ = new RenderTarget({
          colorBuffer: tex2,
          depth: false
        });
        constantTexSource.setValue(tex);
        drawQuadWithShader(device, targ, shader);
        const gl = device.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, targ.impl._glFrameBuffer);
        const pixels = new Uint8Array(cubeSize * cubeSize * 4);
        gl.readPixels(0, 0, tex.width, tex.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        source._levels[0][face] = pixels;
      }
    } else {
      Debug.error("ERROR: SH: cubemap must be composed of arrays or images");
      return null;
    }
  }

  const dirs = [];

  for (let y = 0; y < cubeSize; y++) {
    for (let x = 0; x < cubeSize; x++) {
      const u = x / (cubeSize - 1) * 2 - 1;
      const v = y / (cubeSize - 1) * 2 - 1;
      dirs[y * cubeSize + x] = new Vec3(u, v, 1.0).normalize();
    }
  }

  const sh = new Float32Array(9 * 3);
  const coef1 = 0;
  const coef2 = 1 * 3;
  const coef3 = 2 * 3;
  const coef4 = 3 * 3;
  const coef5 = 4 * 3;
  const coef6 = 5 * 3;
  const coef7 = 6 * 3;
  const coef8 = 7 * 3;
  const coef9 = 8 * 3;
  const nx = 0;
  const px = 1;
  const ny = 2;
  const py = 3;
  const nz = 4;
  const pz = 5;
  let accum = 0;

  for (let face = 0; face < 6; face++) {
    for (let y = 0; y < cubeSize; y++) {
      for (let x = 0; x < cubeSize; x++) {
        const addr = y * cubeSize + x;
        const weight = texelCoordSolidAngle(x, y, cubeSize);
        const weight1 = weight * 4 / 17;
        const weight2 = weight * 8 / 17;
        const weight3 = weight * 15 / 17;
        const weight4 = weight * 5 / 68;
        const weight5 = weight * 15 / 68;
        const dir = dirs[addr];
        let dx, dy, dz;

        if (face === nx) {
          dx = dir.z;
          dy = -dir.y;
          dz = -dir.x;
        } else if (face === px) {
          dx = -dir.z;
          dy = -dir.y;
          dz = dir.x;
        } else if (face === ny) {
          dx = dir.x;
          dy = dir.z;
          dz = dir.y;
        } else if (face === py) {
          dx = dir.x;
          dy = -dir.z;
          dz = -dir.y;
        } else if (face === nz) {
          dx = dir.x;
          dy = -dir.y;
          dz = dir.z;
        } else if (face === pz) {
          dx = -dir.x;
          dy = -dir.y;
          dz = -dir.z;
        }

        if (!dontFlipX) dx = -dx;
        const a = source._levels[0][face][addr * 4 + 3] / 255.0;

        for (let c = 0; c < 3; c++) {
          let value = source._levels[0][face][addr * 4 + c] / 255.0;

          if (source.type === TEXTURETYPE_RGBM) {
            value *= a * 8.0;
            value *= value;
          } else {
            value = Math.pow(value, 2.2);
          }

          sh[coef1 + c] += value * weight1;
          sh[coef2 + c] += value * weight2 * dx;
          sh[coef3 + c] += value * weight2 * dy;
          sh[coef4 + c] += value * weight2 * dz;
          sh[coef5 + c] += value * weight3 * dx * dz;
          sh[coef6 + c] += value * weight3 * dz * dy;
          sh[coef7 + c] += value * weight3 * dy * dx;
          sh[coef8 + c] += value * weight4 * (3.0 * dz * dz - 1.0);
          sh[coef9 + c] += value * weight5 * (dx * dx - dy * dy);
          accum += weight;
        }
      }
    }
  }

  for (let c = 0; c < sh.length; c++) {
    sh[c] *= 4 * Math.PI / accum;
  }

  return sh;
}

export { shFromCubemap };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmlsdGVyLWN1YmVtYXAuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaGljcy9wcmVmaWx0ZXItY3ViZW1hcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZWJ1ZyB9IGZyb20gJy4uL2NvcmUvZGVidWcuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvdmVjMy5qcyc7XG5cbmltcG9ydCB7XG4gICAgUElYRUxGT1JNQVRfUjhfRzhfQjhfQTgsIFRFWFRVUkVUWVBFX0RFRkFVTFQsIFRFWFRVUkVUWVBFX1JHQk1cbn0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgY3JlYXRlU2hhZGVyRnJvbUNvZGUgfSBmcm9tICcuL3Byb2dyYW0tbGliL3V0aWxzLmpzJztcbmltcG9ydCB7IGRyYXdRdWFkV2l0aFNoYWRlciB9IGZyb20gJy4vc2ltcGxlLXBvc3QtZWZmZWN0LmpzJztcbmltcG9ydCB7IHNoYWRlckNodW5rcyB9IGZyb20gJy4vcHJvZ3JhbS1saWIvY2h1bmtzL2NodW5rcy5qcyc7XG5pbXBvcnQgeyBSZW5kZXJUYXJnZXQgfSBmcm9tICcuL3JlbmRlci10YXJnZXQuanMnO1xuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4vdGV4dHVyZS5qcyc7XG5cbi8vIGh0dHBzOi8vc2VibGFnYXJkZS53b3JkcHJlc3MuY29tLzIwMTIvMDYvMTAvYW1kLWN1YmVtYXBnZW4tZm9yLXBoeXNpY2FsbHktYmFzZWQtcmVuZGVyaW5nL1xuZnVuY3Rpb24gYXJlYUVsZW1lbnQoeCwgeSkge1xuICAgIHJldHVybiBNYXRoLmF0YW4yKHggKiB5LCBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIDEpKTtcbn1cblxuZnVuY3Rpb24gdGV4ZWxDb29yZFNvbGlkQW5nbGUodSwgdiwgc2l6ZSkge1xuICAgIC8vIFNjYWxlIHVwIHRvIFstMSwgMV0gcmFuZ2UgKGluY2x1c2l2ZSksIG9mZnNldCBieSAwLjUgdG8gcG9pbnQgdG8gdGV4ZWwgY2VudGVyLlxuICAgIGxldCBfdSA9ICgyLjAgKiAodSArIDAuNSkgLyBzaXplKSAtIDEuMDtcbiAgICBsZXQgX3YgPSAoMi4wICogKHYgKyAwLjUpIC8gc2l6ZSkgLSAxLjA7XG5cbiAgICAvLyBmaXhTZWFtc1xuICAgIF91ICo9IDEuMCAtIDEuMCAvIHNpemU7XG4gICAgX3YgKj0gMS4wIC0gMS4wIC8gc2l6ZTtcblxuICAgIGNvbnN0IGludlJlc29sdXRpb24gPSAxLjAgLyBzaXplO1xuXG4gICAgLy8gVSBhbmQgViBhcmUgdGhlIC0xLi4xIHRleHR1cmUgY29vcmRpbmF0ZSBvbiB0aGUgY3VycmVudCBmYWNlLlxuICAgIC8vIEdldCBwcm9qZWN0ZWQgYXJlYSBmb3IgdGhpcyB0ZXhlbFxuICAgIGNvbnN0IHgwID0gX3UgLSBpbnZSZXNvbHV0aW9uO1xuICAgIGNvbnN0IHkwID0gX3YgLSBpbnZSZXNvbHV0aW9uO1xuICAgIGNvbnN0IHgxID0gX3UgKyBpbnZSZXNvbHV0aW9uO1xuICAgIGNvbnN0IHkxID0gX3YgKyBpbnZSZXNvbHV0aW9uO1xuICAgIGxldCBzb2xpZEFuZ2xlID0gYXJlYUVsZW1lbnQoeDAsIHkwKSAtIGFyZWFFbGVtZW50KHgwLCB5MSkgLSBhcmVhRWxlbWVudCh4MSwgeTApICsgYXJlYUVsZW1lbnQoeDEsIHkxKTtcblxuICAgIC8vIGZpeFNlYW1zIGN1dFxuICAgIGlmICgodSA9PT0gMCAmJiB2ID09PSAwKSB8fCAodSA9PT0gc2l6ZSAtIDEgJiYgdiA9PT0gMCkgfHwgKHUgPT09IDAgJiYgdiA9PT0gc2l6ZSAtIDEpIHx8ICh1ID09PSBzaXplIC0gMSAmJiB2ID09PSBzaXplIC0gMSkpIHtcbiAgICAgICAgc29saWRBbmdsZSAvPSAzO1xuICAgIH0gZWxzZSBpZiAodSA9PT0gMCB8fCB2ID09PSAwIHx8IHUgPT09IHNpemUgLSAxIHx8IHYgPT09IHNpemUgLSAxKSB7XG4gICAgICAgIHNvbGlkQW5nbGUgKj0gMC41O1xuICAgIH1cblxuICAgIHJldHVybiBzb2xpZEFuZ2xlO1xufVxuXG5mdW5jdGlvbiBzaEZyb21DdWJlbWFwKGRldmljZSwgc291cmNlLCBkb250RmxpcFgpIHtcbiAgICBpZiAoc291cmNlLmZvcm1hdCAhPT0gUElYRUxGT1JNQVRfUjhfRzhfQjhfQTgpIHtcbiAgICAgICAgRGVidWcuZXJyb3IoXCJFUlJPUjogU0g6IGN1YmVtYXAgbXVzdCBiZSBSR0JBOFwiKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICghc291cmNlLl9sZXZlbHNbMF0gfHwgIXNvdXJjZS5fbGV2ZWxzWzBdWzBdKSB7XG4gICAgICAgIERlYnVnLmVycm9yKFwiRVJST1I6IFNIOiBjdWJlbWFwIG11c3QgYmUgc3luY2VkIHRvIENQVVwiKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgY3ViZVNpemUgPSBzb3VyY2Uud2lkdGg7XG5cbiAgICBpZiAoIXNvdXJjZS5fbGV2ZWxzWzBdWzBdLmxlbmd0aCkge1xuICAgICAgICAvLyBDdWJlbWFwIGlzIG5vdCBjb21wb3NlZCBvZiBhcnJheXNcbiAgICAgICAgaWYgKHNvdXJjZS5fbGV2ZWxzWzBdWzBdIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCkge1xuICAgICAgICAgICAgLy8gQ3ViZW1hcCBpcyBtYWRlIG9mIGltZ3MgLSBjb252ZXJ0IHRvIGFycmF5c1xuICAgICAgICAgICAgY29uc3Qgc2hhZGVyID0gY3JlYXRlU2hhZGVyRnJvbUNvZGUoZGV2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhZGVyQ2h1bmtzLmZ1bGxzY3JlZW5RdWFkVlMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFkZXJDaHVua3MuZnVsbHNjcmVlblF1YWRQUyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZnNRdWFkU2ltcGxlXCIpO1xuICAgICAgICAgICAgY29uc3QgY29uc3RhbnRUZXhTb3VyY2UgPSBkZXZpY2Uuc2NvcGUucmVzb2x2ZShcInNvdXJjZVwiKTtcbiAgICAgICAgICAgIGZvciAobGV0IGZhY2UgPSAwOyBmYWNlIDwgNjsgZmFjZSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW1nID0gc291cmNlLl9sZXZlbHNbMF1bZmFjZV07XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0ZXggPSBuZXcgVGV4dHVyZShkZXZpY2UsIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3ByZWZpbHRlcmVkLWN1YmUnLFxuICAgICAgICAgICAgICAgICAgICBjdWJlbWFwOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVEVYVFVSRVRZUEVfREVGQVVMVCxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBzb3VyY2UuZm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogY3ViZVNpemUsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogY3ViZVNpemUsXG4gICAgICAgICAgICAgICAgICAgIG1pcG1hcHM6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGV4Ll9sZXZlbHNbMF0gPSBpbWc7XG4gICAgICAgICAgICAgICAgdGV4LnVwbG9hZCgpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4MiA9IG5ldyBUZXh0dXJlKGRldmljZSwge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAncHJlZmlsdGVyZWQtY3ViZScsXG4gICAgICAgICAgICAgICAgICAgIGN1YmVtYXA6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBURVhUVVJFVFlQRV9ERUZBVUxULFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IHNvdXJjZS5mb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBjdWJlU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBjdWJlU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgbWlwbWFwczogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmcgPSBuZXcgUmVuZGVyVGFyZ2V0KHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3JCdWZmZXI6IHRleDIsXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0YW50VGV4U291cmNlLnNldFZhbHVlKHRleCk7XG4gICAgICAgICAgICAgICAgZHJhd1F1YWRXaXRoU2hhZGVyKGRldmljZSwgdGFyZywgc2hhZGVyKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGdsID0gZGV2aWNlLmdsO1xuICAgICAgICAgICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGFyZy5pbXBsLl9nbEZyYW1lQnVmZmVyKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHBpeGVscyA9IG5ldyBVaW50OEFycmF5KGN1YmVTaXplICogY3ViZVNpemUgKiA0KTtcbiAgICAgICAgICAgICAgICBnbC5yZWFkUGl4ZWxzKDAsIDAsIHRleC53aWR0aCwgdGV4LmhlaWdodCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgcGl4ZWxzKTtcblxuICAgICAgICAgICAgICAgIHNvdXJjZS5fbGV2ZWxzWzBdW2ZhY2VdID0gcGl4ZWxzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgRGVidWcuZXJyb3IoXCJFUlJPUjogU0g6IGN1YmVtYXAgbXVzdCBiZSBjb21wb3NlZCBvZiBhcnJheXMgb3IgaW1hZ2VzXCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBkaXJzID0gW107XG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCBjdWJlU2l6ZTsgeSsrKSB7XG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgY3ViZVNpemU7IHgrKykge1xuICAgICAgICAgICAgY29uc3QgdSA9ICh4IC8gKGN1YmVTaXplIC0gMSkpICogMiAtIDE7XG4gICAgICAgICAgICBjb25zdCB2ID0gKHkgLyAoY3ViZVNpemUgLSAxKSkgKiAyIC0gMTtcbiAgICAgICAgICAgIGRpcnNbeSAqIGN1YmVTaXplICsgeF0gPSBuZXcgVmVjMyh1LCB2LCAxLjApLm5vcm1hbGl6ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc2ggPSBuZXcgRmxvYXQzMkFycmF5KDkgKiAzKTtcbiAgICBjb25zdCBjb2VmMSA9IDA7XG4gICAgY29uc3QgY29lZjIgPSAxICogMztcbiAgICBjb25zdCBjb2VmMyA9IDIgKiAzO1xuICAgIGNvbnN0IGNvZWY0ID0gMyAqIDM7XG4gICAgY29uc3QgY29lZjUgPSA0ICogMztcbiAgICBjb25zdCBjb2VmNiA9IDUgKiAzO1xuICAgIGNvbnN0IGNvZWY3ID0gNiAqIDM7XG4gICAgY29uc3QgY29lZjggPSA3ICogMztcbiAgICBjb25zdCBjb2VmOSA9IDggKiAzO1xuXG4gICAgY29uc3QgbnggPSAwO1xuICAgIGNvbnN0IHB4ID0gMTtcbiAgICBjb25zdCBueSA9IDI7XG4gICAgY29uc3QgcHkgPSAzO1xuICAgIGNvbnN0IG56ID0gNDtcbiAgICBjb25zdCBweiA9IDU7XG5cbiAgICBsZXQgYWNjdW0gPSAwO1xuXG4gICAgZm9yIChsZXQgZmFjZSA9IDA7IGZhY2UgPCA2OyBmYWNlKyspIHtcbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBjdWJlU2l6ZTsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGN1YmVTaXplOyB4KyspIHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGFkZHIgPSB5ICogY3ViZVNpemUgKyB4O1xuICAgICAgICAgICAgICAgIGNvbnN0IHdlaWdodCA9IHRleGVsQ29vcmRTb2xpZEFuZ2xlKHgsIHksIGN1YmVTaXplKTtcblxuICAgICAgICAgICAgICAgIC8vIGh0dHA6Ly9ob21lLmNvbWNhc3QubmV0L350b21fZm9yc3l0aC9ibG9nLndpa2kuaHRtbCNbW1NwaGVyaWNhbCUyMEhhcm1vbmljcyUyMGluJTIwQWN0dWFsJTIwR2FtZXMlMjBub3Rlc11dXG4gICAgICAgICAgICAgICAgY29uc3Qgd2VpZ2h0MSA9IHdlaWdodCAqIDQgLyAxNztcbiAgICAgICAgICAgICAgICBjb25zdCB3ZWlnaHQyID0gd2VpZ2h0ICogOCAvIDE3O1xuICAgICAgICAgICAgICAgIGNvbnN0IHdlaWdodDMgPSB3ZWlnaHQgKiAxNSAvIDE3O1xuICAgICAgICAgICAgICAgIGNvbnN0IHdlaWdodDQgPSB3ZWlnaHQgKiA1IC8gNjg7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2VpZ2h0NSA9IHdlaWdodCAqIDE1IC8gNjg7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkaXIgPSBkaXJzW2FkZHJdO1xuXG4gICAgICAgICAgICAgICAgbGV0IGR4LCBkeSwgZHo7XG4gICAgICAgICAgICAgICAgaWYgKGZhY2UgPT09IG54KSB7XG4gICAgICAgICAgICAgICAgICAgIGR4ID0gZGlyLno7XG4gICAgICAgICAgICAgICAgICAgIGR5ID0gLWRpci55O1xuICAgICAgICAgICAgICAgICAgICBkeiA9IC1kaXIueDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZhY2UgPT09IHB4KSB7XG4gICAgICAgICAgICAgICAgICAgIGR4ID0gLWRpci56O1xuICAgICAgICAgICAgICAgICAgICBkeSA9IC1kaXIueTtcbiAgICAgICAgICAgICAgICAgICAgZHogPSBkaXIueDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZhY2UgPT09IG55KSB7XG4gICAgICAgICAgICAgICAgICAgIGR4ID0gZGlyLng7XG4gICAgICAgICAgICAgICAgICAgIGR5ID0gZGlyLno7XG4gICAgICAgICAgICAgICAgICAgIGR6ID0gZGlyLnk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmYWNlID09PSBweSkge1xuICAgICAgICAgICAgICAgICAgICBkeCA9IGRpci54O1xuICAgICAgICAgICAgICAgICAgICBkeSA9IC1kaXIuejtcbiAgICAgICAgICAgICAgICAgICAgZHogPSAtZGlyLnk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmYWNlID09PSBueikge1xuICAgICAgICAgICAgICAgICAgICBkeCA9IGRpci54O1xuICAgICAgICAgICAgICAgICAgICBkeSA9IC1kaXIueTtcbiAgICAgICAgICAgICAgICAgICAgZHogPSBkaXIuejtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZhY2UgPT09IHB6KSB7XG4gICAgICAgICAgICAgICAgICAgIGR4ID0gLWRpci54O1xuICAgICAgICAgICAgICAgICAgICBkeSA9IC1kaXIueTtcbiAgICAgICAgICAgICAgICAgICAgZHogPSAtZGlyLno7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFkb250RmxpcFgpIGR4ID0gLWR4OyAvLyBmbGlwIG9yaWdpbmFsIGN1YmVtYXAgeCBpbnN0ZWFkIG9mIGRvaW5nIGl0IGF0IHJ1bnRpbWVcblxuICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBzb3VyY2UuX2xldmVsc1swXVtmYWNlXVthZGRyICogNCArIDNdIC8gMjU1LjA7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IDM7IGMrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSAgc291cmNlLl9sZXZlbHNbMF1bZmFjZV1bYWRkciAqIDQgKyBjXSAvIDI1NS4wO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlLnR5cGUgPT09IFRFWFRVUkVUWVBFX1JHQk0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlICo9IGEgKiA4LjA7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSAqPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gTWF0aC5wb3codmFsdWUsIDIuMik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzaFtjb2VmMSArIGNdICs9IHZhbHVlICogd2VpZ2h0MTtcbiAgICAgICAgICAgICAgICAgICAgc2hbY29lZjIgKyBjXSArPSB2YWx1ZSAqIHdlaWdodDIgKiBkeDtcbiAgICAgICAgICAgICAgICAgICAgc2hbY29lZjMgKyBjXSArPSB2YWx1ZSAqIHdlaWdodDIgKiBkeTtcbiAgICAgICAgICAgICAgICAgICAgc2hbY29lZjQgKyBjXSArPSB2YWx1ZSAqIHdlaWdodDIgKiBkejtcblxuICAgICAgICAgICAgICAgICAgICBzaFtjb2VmNSArIGNdICs9IHZhbHVlICogd2VpZ2h0MyAqIGR4ICogZHo7XG4gICAgICAgICAgICAgICAgICAgIHNoW2NvZWY2ICsgY10gKz0gdmFsdWUgKiB3ZWlnaHQzICogZHogKiBkeTtcbiAgICAgICAgICAgICAgICAgICAgc2hbY29lZjcgKyBjXSArPSB2YWx1ZSAqIHdlaWdodDMgKiBkeSAqIGR4O1xuXG4gICAgICAgICAgICAgICAgICAgIHNoW2NvZWY4ICsgY10gKz0gdmFsdWUgKiB3ZWlnaHQ0ICogKDMuMCAqIGR6ICogZHogLSAxLjApO1xuICAgICAgICAgICAgICAgICAgICBzaFtjb2VmOSArIGNdICs9IHZhbHVlICogd2VpZ2h0NSAqIChkeCAqIGR4IC0gZHkgKiBkeSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYWNjdW0gKz0gd2VpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IGMgPSAwOyBjIDwgc2gubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgc2hbY10gKj0gNCAqIE1hdGguUEkgLyBhY2N1bTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2g7XG59XG5cbmV4cG9ydCB7IHNoRnJvbUN1YmVtYXAgfTtcbiJdLCJuYW1lcyI6WyJhcmVhRWxlbWVudCIsIngiLCJ5IiwiTWF0aCIsImF0YW4yIiwic3FydCIsInRleGVsQ29vcmRTb2xpZEFuZ2xlIiwidSIsInYiLCJzaXplIiwiX3UiLCJfdiIsImludlJlc29sdXRpb24iLCJ4MCIsInkwIiwieDEiLCJ5MSIsInNvbGlkQW5nbGUiLCJzaEZyb21DdWJlbWFwIiwiZGV2aWNlIiwic291cmNlIiwiZG9udEZsaXBYIiwiZm9ybWF0IiwiUElYRUxGT1JNQVRfUjhfRzhfQjhfQTgiLCJEZWJ1ZyIsImVycm9yIiwiX2xldmVscyIsImN1YmVTaXplIiwid2lkdGgiLCJsZW5ndGgiLCJIVE1MSW1hZ2VFbGVtZW50Iiwic2hhZGVyIiwiY3JlYXRlU2hhZGVyRnJvbUNvZGUiLCJzaGFkZXJDaHVua3MiLCJmdWxsc2NyZWVuUXVhZFZTIiwiZnVsbHNjcmVlblF1YWRQUyIsImNvbnN0YW50VGV4U291cmNlIiwic2NvcGUiLCJyZXNvbHZlIiwiZmFjZSIsImltZyIsInRleCIsIlRleHR1cmUiLCJuYW1lIiwiY3ViZW1hcCIsInR5cGUiLCJURVhUVVJFVFlQRV9ERUZBVUxUIiwiaGVpZ2h0IiwibWlwbWFwcyIsInVwbG9hZCIsInRleDIiLCJ0YXJnIiwiUmVuZGVyVGFyZ2V0IiwiY29sb3JCdWZmZXIiLCJkZXB0aCIsInNldFZhbHVlIiwiZHJhd1F1YWRXaXRoU2hhZGVyIiwiZ2wiLCJiaW5kRnJhbWVidWZmZXIiLCJGUkFNRUJVRkZFUiIsImltcGwiLCJfZ2xGcmFtZUJ1ZmZlciIsInBpeGVscyIsIlVpbnQ4QXJyYXkiLCJyZWFkUGl4ZWxzIiwiUkdCQSIsIlVOU0lHTkVEX0JZVEUiLCJkaXJzIiwiVmVjMyIsIm5vcm1hbGl6ZSIsInNoIiwiRmxvYXQzMkFycmF5IiwiY29lZjEiLCJjb2VmMiIsImNvZWYzIiwiY29lZjQiLCJjb2VmNSIsImNvZWY2IiwiY29lZjciLCJjb2VmOCIsImNvZWY5IiwibngiLCJweCIsIm55IiwicHkiLCJueiIsInB6IiwiYWNjdW0iLCJhZGRyIiwid2VpZ2h0Iiwid2VpZ2h0MSIsIndlaWdodDIiLCJ3ZWlnaHQzIiwid2VpZ2h0NCIsIndlaWdodDUiLCJkaXIiLCJkeCIsImR5IiwiZHoiLCJ6IiwiYSIsImMiLCJ2YWx1ZSIsIlRFWFRVUkVUWVBFX1JHQk0iLCJwb3ciLCJQSSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFhQSxTQUFTQSxXQUFULENBQXFCQyxDQUFyQixFQUF3QkMsQ0FBeEIsRUFBMkI7RUFDdkIsT0FBT0MsSUFBSSxDQUFDQyxLQUFMLENBQVdILENBQUMsR0FBR0MsQ0FBZixFQUFrQkMsSUFBSSxDQUFDRSxJQUFMLENBQVVKLENBQUMsR0FBR0EsQ0FBSixHQUFRQyxDQUFDLEdBQUdBLENBQVosR0FBZ0IsQ0FBMUIsQ0FBbEIsQ0FBUCxDQUFBO0FBQ0gsQ0FBQTs7QUFFRCxTQUFTSSxvQkFBVCxDQUE4QkMsQ0FBOUIsRUFBaUNDLENBQWpDLEVBQW9DQyxJQUFwQyxFQUEwQztFQUV0QyxJQUFJQyxFQUFFLEdBQUksR0FBT0gsSUFBQUEsQ0FBQyxHQUFHLEdBQVgsQ0FBQSxHQUFrQkUsSUFBbkIsR0FBMkIsR0FBcEMsQ0FBQTs7RUFDQSxJQUFJRSxFQUFFLEdBQUksR0FBT0gsSUFBQUEsQ0FBQyxHQUFHLEdBQVgsQ0FBQSxHQUFrQkMsSUFBbkIsR0FBMkIsR0FBcEMsQ0FBQTs7RUFHQUMsRUFBRSxJQUFJLEdBQU0sR0FBQSxHQUFBLEdBQU1ELElBQWxCLENBQUE7RUFDQUUsRUFBRSxJQUFJLEdBQU0sR0FBQSxHQUFBLEdBQU1GLElBQWxCLENBQUE7RUFFQSxNQUFNRyxhQUFhLEdBQUcsR0FBQSxHQUFNSCxJQUE1QixDQUFBO0FBSUEsRUFBQSxNQUFNSSxFQUFFLEdBQUdILEVBQUUsR0FBR0UsYUFBaEIsQ0FBQTtBQUNBLEVBQUEsTUFBTUUsRUFBRSxHQUFHSCxFQUFFLEdBQUdDLGFBQWhCLENBQUE7QUFDQSxFQUFBLE1BQU1HLEVBQUUsR0FBR0wsRUFB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
