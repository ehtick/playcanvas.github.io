/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { SEMANTIC_POSITION } from '../../constants.js';
import { shaderChunks } from '../chunks/chunks.js';
import { ChunkUtils } from '../chunk-utils.js';
import { precisionCode, gammaCode, tonemapCode } from './common.js';

const skybox = {
  generateKey: function (options) {
    return options.type === 'cubemap' ? `skybox-${options.type}-${options.encoding}-${options.useIntensity}-${options.gamma}-${options.toneMapping}-${options.fixSeams}-${options.mip}` : `skybox-${options.type}-${options.encoding}-${options.useIntensity}-${options.gamma}-${options.toneMapping}`;
  },
  createShaderDefinition: function (device, options) {
    let fshader;

    if (options.type === 'cubemap') {
      const mip2size = [128, 64, 16, 8, 4, 2];
      fshader = precisionCode(device);
      fshader += options.mip ? shaderChunks.fixCubemapSeamsStretchPS : shaderChunks.fixCubemapSeamsNonePS;
      fshader += options.useIntensity ? shaderChunks.envMultiplyPS : shaderChunks.envConstPS;
      fshader += shaderChunks.decodePS;
      fshader += gammaCode(options.gamma);
      fshader += tonemapCode(options.toneMapping);
      fshader += shaderChunks.skyboxHDRPS.replace(/\$DECODE/g, ChunkUtils.decodeFunc(options.encoding)).replace(/\$FIXCONST/g, 1 - 1 / mip2size[options.mip] + "");
    } else {
      fshader = precisionCode(device);
      fshader += options.useIntensity ? shaderChunks.envMultiplyPS : shaderChunks.envConstPS;
      fshader += shaderChunks.decodePS;
      fshader += gammaCode(options.gamma);
      fshader += tonemapCode(options.toneMapping);
      fshader += shaderChunks.sphericalPS;
      fshader += shaderChunks.envAtlasPS;
      fshader += shaderChunks.skyboxEnvPS.replace(/\$DECODE/g, ChunkUtils.decodeFunc(options.encoding));
    }

    return {
      attributes: {
        aPosition: SEMANTIC_POSITION
      },
      vshader: shaderChunks.skyboxVS,
      fshader: fshader
    };
  }
};

export { skybox };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2t5Ym94LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZ3JhcGhpY3MvcHJvZ3JhbS1saWIvcHJvZ3JhbXMvc2t5Ym94LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNFTUFOVElDX1BPU0lUSU9OIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IHNoYWRlckNodW5rcyB9IGZyb20gJy4uL2NodW5rcy9jaHVua3MuanMnO1xuaW1wb3J0IHsgQ2h1bmtVdGlscyB9IGZyb20gJy4uL2NodW5rLXV0aWxzLmpzJztcblxuaW1wb3J0IHsgZ2FtbWFDb2RlLCBwcmVjaXNpb25Db2RlLCB0b25lbWFwQ29kZSB9IGZyb20gJy4vY29tbW9uLmpzJztcblxuY29uc3Qgc2t5Ym94ID0ge1xuICAgIGdlbmVyYXRlS2V5OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gb3B0aW9ucy50eXBlID09PSAnY3ViZW1hcCcgP1xuICAgICAgICAgICAgYHNreWJveC0ke29wdGlvbnMudHlwZX0tJHtvcHRpb25zLmVuY29kaW5nfS0ke29wdGlvbnMudXNlSW50ZW5zaXR5fS0ke29wdGlvbnMuZ2FtbWF9LSR7b3B0aW9ucy50b25lTWFwcGluZ30tJHtvcHRpb25zLmZpeFNlYW1zfS0ke29wdGlvbnMubWlwfWAgOlxuICAgICAgICAgICAgYHNreWJveC0ke29wdGlvbnMudHlwZX0tJHtvcHRpb25zLmVuY29kaW5nfS0ke29wdGlvbnMudXNlSW50ZW5zaXR5fS0ke29wdGlvbnMuZ2FtbWF9LSR7b3B0aW9ucy50b25lTWFwcGluZ31gO1xuICAgIH0sXG5cbiAgICBjcmVhdGVTaGFkZXJEZWZpbml0aW9uOiBmdW5jdGlvbiAoZGV2aWNlLCBvcHRpb25zKSB7XG4gICAgICAgIGxldCBmc2hhZGVyO1xuICAgICAgICBpZiAob3B0aW9ucy50eXBlID09PSAnY3ViZW1hcCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG1pcDJzaXplID0gWzEyOCwgNjQsIC8qIDMyICovIDE2LCA4LCA0LCAyXTtcblxuICAgICAgICAgICAgZnNoYWRlciA9IHByZWNpc2lvbkNvZGUoZGV2aWNlKTtcbiAgICAgICAgICAgIGZzaGFkZXIgKz0gb3B0aW9ucy5taXAgPyBzaGFkZXJDaHVua3MuZml4Q3ViZW1hcFNlYW1zU3RyZXRjaFBTIDogc2hhZGVyQ2h1bmtzLmZpeEN1YmVtYXBTZWFtc05vbmVQUztcbiAgICAgICAgICAgIGZzaGFkZXIgKz0gb3B0aW9ucy51c2VJbnRlbnNpdHkgPyBzaGFkZXJDaHVua3MuZW52TXVsdGlwbHlQUyA6IHNoYWRlckNodW5rcy5lbnZDb25zdFBTO1xuICAgICAgICAgICAgZnNoYWRlciArPSBzaGFkZXJDaHVua3MuZGVjb2RlUFM7XG4gICAgICAgICAgICBmc2hhZGVyICs9IGdhbW1hQ29kZShvcHRpb25zLmdhbW1hKTtcbiAgICAgICAgICAgIGZzaGFkZXIgKz0gdG9uZW1hcENvZGUob3B0aW9ucy50b25lTWFwcGluZyk7XG4gICAgICAgICAgICBmc2hhZGVyICs9IHNoYWRlckNodW5rcy5za3lib3hIRFJQU1xuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCRERUNPREUvZywgQ2h1bmtVdGlscy5kZWNvZGVGdW5jKG9wdGlvbnMuZW5jb2RpbmcpKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCRGSVhDT05TVC9nLCAoMSAtIDEgLyBtaXAyc2l6ZVtvcHRpb25zLm1pcF0pICsgXCJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmc2hhZGVyID0gcHJlY2lzaW9uQ29kZShkZXZpY2UpO1xuICAgICAgICAgICAgZnNoYWRlciArPSBvcHRpb25zLnVzZUludGVuc2l0eSA/IHNoYWRlckNodW5rcy5lbnZNdWx0aXBseVBTIDogc2hhZGVyQ2h1bmtzLmVudkNvbnN0UFM7XG4gICAgICAgICAgICBmc2hhZGVyICs9IHNoYWRlckNodW5rcy5kZWNvZGVQUztcbiAgICAgICAgICAgIGZzaGFkZXIgKz0gZ2FtbWFDb2RlKG9wdGlvbnMuZ2FtbWEpO1xuICAgICAgICAgICAgZnNoYWRlciArPSB0b25lbWFwQ29kZShvcHRpb25zLnRvbmVNYXBwaW5nKTtcbiAgICAgICAgICAgIGZzaGFkZXIgKz0gc2hhZGVyQ2h1bmtzLnNwaGVyaWNhbFBTO1xuICAgICAgICAgICAgZnNoYWRlciArPSBzaGFkZXJDaHVua3MuZW52QXRsYXNQUztcbiAgICAgICAgICAgIGZzaGFkZXIgKz0gc2hhZGVyQ2h1bmtzLnNreWJveEVudlBTLnJlcGxhY2UoL1xcJERFQ09ERS9nLCBDaHVua1V0aWxzLmRlY29kZUZ1bmMob3B0aW9ucy5lbmNvZGluZykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICBhUG9zaXRpb246IFNFTUFOVElDX1BPU0lUSU9OXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdnNoYWRlcjogc2hhZGVyQ2h1bmtzLnNreWJveFZTLFxuICAgICAgICAgICAgZnNoYWRlcjogZnNoYWRlclxuICAgICAgICB9O1xuICAgIH1cbn07XG5cbmV4cG9ydCB7IHNreWJveCB9O1xuIl0sIm5hbWVzIjpbInNreWJveCIsImdlbmVyYXRlS2V5Iiwib3B0aW9ucyIsInR5cGUiLCJlbmNvZGluZyIsInVzZUludGVuc2l0eSIsImdhbW1hIiwidG9uZU1hcHBpbmciLCJmaXhTZWFtcyIsIm1pcCIsImNyZWF0ZVNoYWRlckRlZmluaXRpb24iLCJkZXZpY2UiLCJmc2hhZGVyIiwibWlwMnNpemUiLCJwcmVjaXNpb25Db2RlIiwic2hhZGVyQ2h1bmtzIiwiZml4Q3ViZW1hcFNlYW1zU3RyZXRjaFBTIiwiZml4Q3ViZW1hcFNlYW1zTm9uZVBTIiwiZW52TXVsdGlwbHlQUyIsImVudkNvbnN0UFMiLCJkZWNvZGVQUyIsImdhbW1hQ29kZSIsInRvbmVtYXBDb2RlIiwic2t5Ym94SERSUFMiLCJyZXBsYWNlIiwiQ2h1bmtVdGlscyIsImRlY29kZUZ1bmMiLCJzcGhlcmljYWxQUyIsImVudkF0bGFzUFMiLCJza3lib3hFbnZQUyIsImF0dHJpYnV0ZXMiLCJhUG9zaXRpb24iLCJTRU1BTlRJQ19QT1NJVElPTiIsInZzaGFkZXIiLCJza3lib3hWUyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQU1BLE1BQU1BLE1BQU0sR0FBRztFQUNYQyxXQUFXLEVBQUUsVUFBVUMsT0FBVixFQUFtQjtJQUM1QixPQUFPQSxPQUFPLENBQUNDLElBQVIsS0FBaUIsU0FBakIsR0FDRixDQUFBLE9BQUEsRUFBU0QsT0FBTyxDQUFDQyxJQUFLLENBQUEsQ0FBQSxFQUFHRCxPQUFPLENBQUNFLFFBQVMsQ0FBR0YsQ0FBQUEsRUFBQUEsT0FBTyxDQUFDRyxZQUFhLENBQUdILENBQUFBLEVBQUFBLE9BQU8sQ0FBQ0ksS0FBTSxDQUFHSixDQUFBQSxFQUFBQSxPQUFPLENBQUNLLFdBQVksQ0FBR0wsQ0FBQUEsRUFBQUEsT0FBTyxDQUFDTSxRQUFTLENBQUEsQ0FBQSxFQUFHTixPQUFPLENBQUNPLEdBQUksQ0FBQSxDQUQzSSxHQUVGLENBQUEsT0FBQSxFQUFTUCxPQUFPLENBQUNDLElBQUssQ0FBQSxDQUFBLEVBQUdELE9BQU8sQ0FBQ0UsUUFBUyxDQUFHRixDQUFBQSxFQUFBQSxPQUFPLENBQUNHLFlBQWEsQ0FBR0gsQ0FBQUEsRUFBQUEsT0FBTyxDQUFDSSxLQUFNLENBQUdKLENBQUFBLEVBQUFBLE9BQU8sQ0FBQ0ssV0FBWSxDQUYvRyxDQUFBLENBQUE7R0FGTztBQU9YRyxFQUFBQSxzQkFBc0IsRUFBRSxVQUFVQyxNQUFWLEVBQWtCVCxPQUFsQixFQUEyQjtBQUMvQyxJQUFBLElBQUlVLE9BQUosQ0FBQTs7QUFDQSxJQUFBLElBQUlWLE9BQU8sQ0FBQ0MsSUFBUixLQUFpQixTQUFyQixFQUFnQztBQUM1QixNQUFBLE1BQU1VLFFBQVEsR0FBRyxDQUFDLEdBQUQsRUFBTSxFQUFOLEVBQW1CLEVBQW5CLEVBQXVCLENBQXZCLEVBQTBCLENBQTFCLEVBQTZCLENBQTdCLENBQWpCLENBQUE7QUFFQUQsTUFBQUEsT0FBTyxHQUFHRSxhQUFhLENBQUNILE1BQUQsQ0FBdkIsQ0FBQTtNQUNBQyxPQUFPLElBQUlWLE9BQU8sQ0FBQ08sR0FBUixHQUFjTSxZQUFZLENBQUNDLHdCQUEzQixHQUFzREQsWUFBWSxDQUFDRSxxQkFBOUUsQ0FBQTtNQUNBTCxPQUFPLElBQUlWLE9BQU8sQ0FBQ0csWUFBUixHQUF1QlUsWUFBWSxDQUFDRyxhQUFwQyxHQUFvREgsWUFBWSxDQUFDSSxVQUE1RSxDQUFBO01BQ0FQLE9BQU8sSUFBSUcsWUFBWSxDQUFDSyxRQUF4QixDQUFBO0FBQ0FSLE1BQUFBLE9BQU8sSUFBSVMsU0FBUyxDQUFDbkIsT0FBTyxDQUFDSSxLQUFULENBQXBCLENBQUE7QUFDQU0sTUFBQUEsT0FBTyxJQUFJVSxXQUFXLENBQUNwQixPQUFPLENBQUNLLFdBQVQsQ0FBdEIsQ0FBQTtBQUNBSyxNQUFBQSxPQUFPLElBQUlHLFlBQVksQ0FBQ1EsV0FBYixDQUNOQyxPQURNLENBQ0UsV0FERixFQUNlQyxVQUFVLENBQUNDLFVBQVgsQ0FBc0J4QixPQUFPLENBQUNFLFFBQTlCLENBRGYsQ0FBQSxDQUVOb0IsT0FGTSxDQUVFLGFBRkYsRUFFa0IsSUFBSSxDQUFJWCxHQUFBQSxRQUFRLENBQUNYLE9BQU8sQ0FBQ08sR0FBVCxDQUFqQixHQUFrQyxFQUZuRCxDQUFYLENBQUE7QUFHSCxLQVpELE1BWU87QUFDSEcsTUFBQUEsT0FBTyxHQUFHRSxhQUFhLENBQUNILE1BQUQsQ0FBdkIsQ0FBQTtNQUNBQyxPQUFPLElBQUlWLE9BQU8sQ0FBQ0csWUFBUixHQUF1QlUsWUFBWSxDQUFDRyxhQUFwQyxHQUFvREgsWUFBWSxDQUFDSSxVQUE1RSxDQUFBO01BQ0FQLE9BQU8sSUFBSUcsWUFBWSxDQUFDSyxRQUF4QixDQUFBO0FBQ0FSLE1BQUFBLE9BQU8sSUFBSVMsU0FBUyxDQUFDbkIsT0FBTyxDQUFDSSxLQUFULENBQXBCLENBQUE7QUFDQU0sTUFBQUEsT0FBTyxJQUFJVSxXQUFXLENBQUNwQixPQUFPLENBQUNLLFdBQVQsQ0FBdEIsQ0FBQTtNQUNBSyxPQUFPLElBQUlHLFlBQVksQ0FBQ1ksV0FBeEIsQ0FBQTtNQUNBZixPQUFPLElBQUlHLFlBQVksQ0FBQ2EsVUFBeEIsQ0FBQTtBQUNBaEIsTUFBQUEsT0FBTyxJQUFJRyxZQUFZLENBQUNjLFdBQWIsQ0FBeUJMLE9BQXpCLENBQWlDLFdBQWpDLEVBQThDQyxVQUFVLENBQUNDLFVBQVgsQ0FBc0J4QixPQUFPLENBQUNFLFFBQTlCLENBQTlDLENBQVgsQ0FBQTtBQUNILEtBQUE7O0lBRUQsT0FBTztBQUNIMEIsTUFBQUEsVUFBVSxFQUFFO0FBQ1JDLFFBQUFBLFNBQVMsRUFBRUMsaUJBQUFBO09BRlo7TUFJSEMsT0FBTyxFQUFFbEIsWUFBWSxDQUFDbUIsUUFKbkI7QUFLSHRCLE1BQUFBLE9BQU8sRUFBRUEsT0FBQUE7S0FMYixDQUFBO0FBT0gsR0FBQTtBQXZDVTs7OzsifQ==
