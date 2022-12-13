/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { GAMMA_SRGB, GAMMA_SRGBFAST, GAMMA_SRGBHDR, TONEMAP_FILMIC, TONEMAP_LINEAR, TONEMAP_HEJL, TONEMAP_ACES, TONEMAP_ACES2 } from '../../constants.js';
import { shaderChunks } from '../chunks/chunks.js';

function gammaCode(value, chunks) {
  if (!chunks) chunks = shaderChunks;
  if (value === GAMMA_SRGB || value === GAMMA_SRGBFAST) {
    return chunks.gamma2_2PS ? chunks.gamma2_2PS : shaderChunks.gamma2_2PS;
  } else if (value === GAMMA_SRGBHDR) {
    return "#define HDR\n" + (chunks.gamma2_2PS ? chunks.gamma2_2PS : shaderChunks.gamma2_2PS);
  }
  return chunks.gamma1_0PS ? chunks.gamma1_0PS : shaderChunks.gamma1_0PS;
}
function tonemapCode(value, chunks) {
  if (!chunks) chunks = shaderChunks;
  if (value === TONEMAP_FILMIC) {
    return chunks.tonemappingFilmicPS ? chunks.tonemappingFilmicPS : shaderChunks.tonemappingFilmicPS;
  } else if (value === TONEMAP_LINEAR) {
    return chunks.tonemappingLinearPS ? chunks.tonemappingLinearPS : shaderChunks.tonemappingLinearPS;
  } else if (value === TONEMAP_HEJL) {
    return chunks.tonemappingHejlPS ? chunks.tonemappingHejlPS : shaderChunks.tonemappingHejlPS;
  } else if (value === TONEMAP_ACES) {
    return chunks.tonemappingAcesPS ? chunks.tonemappingAcesPS : shaderChunks.tonemappingAcesPS;
  } else if (value === TONEMAP_ACES2) {
    return chunks.tonemappingAces2PS ? chunks.tonemappingAces2PS : shaderChunks.tonemappingAces2PS;
  }
  return chunks.tonemapingNonePS ? chunks.tonemapingNonePS : shaderChunks.tonemappingNonePS;
}
function fogCode(value, chunks) {
  if (!chunks) chunks = shaderChunks;
  if (value === 'linear') {
    return chunks.fogLinearPS ? chunks.fogLinearPS : shaderChunks.fogLinearPS;
  } else if (value === 'exp') {
    return chunks.fogExpPS ? chunks.fogExpPS : shaderChunks.fogExpPS;
  } else if (value === 'exp2') {
    return chunks.fogExp2PS ? chunks.fogExp2PS : shaderChunks.fogExp2PS;
  }
  return chunks.fogNonePS ? chunks.fogNonePS : shaderChunks.fogNonePS;
}
function skinCode(device, chunks) {
  if (!chunks) chunks = shaderChunks;
  if (device.supportsBoneTextures) {
    return chunks.skinTexVS;
  }
  return "#define BONE_LIMIT " + device.getBoneLimit() + "\n" + chunks.skinConstVS;
}
function begin() {
  return 'void main(void)\n{\n';
}
function end() {
  return '}\n';
}

export { begin, end, fogCode, gammaCode, skinCode, tonemapCode };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2NlbmUvc2hhZGVyLWxpYi9wcm9ncmFtcy9jb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBHQU1NQV9TUkdCLCBHQU1NQV9TUkdCRkFTVCwgR0FNTUFfU1JHQkhEUixcbiAgICBUT05FTUFQX0FDRVMsIFRPTkVNQVBfQUNFUzIsIFRPTkVNQVBfRklMTUlDLCBUT05FTUFQX0hFSkwsIFRPTkVNQVBfTElORUFSXG59IGZyb20gJy4uLy4uL2NvbnN0YW50cy5qcyc7XG5cbmltcG9ydCB7IHNoYWRlckNodW5rcyB9IGZyb20gJy4uL2NodW5rcy9jaHVua3MuanMnO1xuXG5mdW5jdGlvbiBnYW1tYUNvZGUodmFsdWUsIGNodW5rcykge1xuICAgIGlmICghY2h1bmtzKSBjaHVua3MgPSBzaGFkZXJDaHVua3M7XG4gICAgaWYgKHZhbHVlID09PSBHQU1NQV9TUkdCIHx8IHZhbHVlID09PSBHQU1NQV9TUkdCRkFTVCkge1xuICAgICAgICByZXR1cm4gY2h1bmtzLmdhbW1hMl8yUFMgPyBjaHVua3MuZ2FtbWEyXzJQUyA6IHNoYWRlckNodW5rcy5nYW1tYTJfMlBTO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IEdBTU1BX1NSR0JIRFIpIHtcbiAgICAgICAgcmV0dXJuIFwiI2RlZmluZSBIRFJcXG5cIiArIChjaHVua3MuZ2FtbWEyXzJQUyA/IGNodW5rcy5nYW1tYTJfMlBTIDogc2hhZGVyQ2h1bmtzLmdhbW1hMl8yUFMpO1xuICAgIH1cbiAgICByZXR1cm4gY2h1bmtzLmdhbW1hMV8wUFMgPyBjaHVua3MuZ2FtbWExXzBQUyA6IHNoYWRlckNodW5rcy5nYW1tYTFfMFBTO1xufVxuXG5mdW5jdGlvbiB0b25lbWFwQ29kZSh2YWx1ZSwgY2h1bmtzKSB7XG4gICAgaWYgKCFjaHVua3MpIGNodW5rcyA9IHNoYWRlckNodW5rcztcbiAgICBpZiAodmFsdWUgPT09IFRPTkVNQVBfRklMTUlDKSB7XG4gICAgICAgIHJldHVybiBjaHVua3MudG9uZW1hcHBpbmdGaWxtaWNQUyA/IGNodW5rcy50b25lbWFwcGluZ0ZpbG1pY1BTIDogc2hhZGVyQ2h1bmtzLnRvbmVtYXBwaW5nRmlsbWljUFM7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gVE9ORU1BUF9MSU5FQVIpIHtcbiAgICAgICAgcmV0dXJuIGNodW5rcy50b25lbWFwcGluZ0xpbmVhclBTID8gY2h1bmtzLnRvbmVtYXBwaW5nTGluZWFyUFMgOiBzaGFkZXJDaHVua3MudG9uZW1hcHBpbmdMaW5lYXJQUztcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBUT05FTUFQX0hFSkwpIHtcbiAgICAgICAgcmV0dXJuIGNodW5rcy50b25lbWFwcGluZ0hlamxQUyA/IGNodW5rcy50b25lbWFwcGluZ0hlamxQUyA6IHNoYWRlckNodW5rcy50b25lbWFwcGluZ0hlamxQUztcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBUT05FTUFQX0FDRVMpIHtcbiAgICAgICAgcmV0dXJuIGNodW5rcy50b25lbWFwcGluZ0FjZXNQUyA/IGNodW5rcy50b25lbWFwcGluZ0FjZXNQUyA6IHNoYWRlckNodW5rcy50b25lbWFwcGluZ0FjZXNQUztcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBUT05FTUFQX0FDRVMyKSB7XG4gICAgICAgIHJldHVybiBjaHVua3MudG9uZW1hcHBpbmdBY2VzMlBTID8gY2h1bmtzLnRvbmVtYXBwaW5nQWNlczJQUyA6IHNoYWRlckNodW5rcy50b25lbWFwcGluZ0FjZXMyUFM7XG4gICAgfVxuICAgIHJldHVybiBjaHVua3MudG9uZW1hcGluZ05vbmVQUyA/IGNodW5rcy50b25lbWFwaW5nTm9uZVBTIDogc2hhZGVyQ2h1bmtzLnRvbmVtYXBwaW5nTm9uZVBTO1xufVxuXG5mdW5jdGlvbiBmb2dDb2RlKHZhbHVlLCBjaHVua3MpIHtcbiAgICBpZiAoIWNodW5rcykgY2h1bmtzID0gc2hhZGVyQ2h1bmtzO1xuICAgIGlmICh2YWx1ZSA9PT0gJ2xpbmVhcicpIHtcbiAgICAgICAgcmV0dXJuIGNodW5rcy5mb2dMaW5lYXJQUyA/IGNodW5rcy5mb2dMaW5lYXJQUyA6IHNoYWRlckNodW5rcy5mb2dMaW5lYXJQUztcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAnZXhwJykge1xuICAgICAgICByZXR1cm4gY2h1bmtzLmZvZ0V4cFBTID8gY2h1bmtzLmZvZ0V4cFBTIDogc2hhZGVyQ2h1bmtzLmZvZ0V4cFBTO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICdleHAyJykge1xuICAgICAgICByZXR1cm4gY2h1bmtzLmZvZ0V4cDJQUyA/IGNodW5rcy5mb2dFeHAyUFMgOiBzaGFkZXJDaHVua3MuZm9nRXhwMlBTO1xuICAgIH1cbiAgICByZXR1cm4gY2h1bmtzLmZvZ05vbmVQUyA/IGNodW5rcy5mb2dOb25lUFMgOiBzaGFkZXJDaHVua3MuZm9nTm9uZVBTO1xufVxuXG5mdW5jdGlvbiBza2luQ29kZShkZXZpY2UsIGNodW5rcykge1xuICAgIGlmICghY2h1bmtzKSBjaHVua3MgPSBzaGFkZXJDaHVua3M7XG4gICAgaWYgKGRldmljZS5zdXBwb3J0c0JvbmVUZXh0dXJlcykge1xuICAgICAgICByZXR1cm4gY2h1bmtzLnNraW5UZXhWUztcbiAgICB9XG4gICAgcmV0dXJuIFwiI2RlZmluZSBCT05FX0xJTUlUIFwiICsgZGV2aWNlLmdldEJvbmVMaW1pdCgpICsgXCJcXG5cIiArIGNodW5rcy5za2luQ29uc3RWUztcbn1cblxuZnVuY3Rpb24gYmVnaW4oKSB7XG4gICAgcmV0dXJuICd2b2lkIG1haW4odm9pZClcXG57XFxuJztcbn1cblxuZnVuY3Rpb24gZW5kKCkge1xuICAgIHJldHVybiAnfVxcbic7XG59XG5cbmV4cG9ydCB7IGJlZ2luLCBlbmQsIGZvZ0NvZGUsIGdhbW1hQ29kZSwgc2tpbkNvZGUsIHRvbmVtYXBDb2RlIH07XG4iXSwibmFtZXMiOlsiZ2FtbWFDb2RlIiwidmFsdWUiLCJjaHVua3MiLCJzaGFkZXJDaHVua3MiLCJHQU1NQV9TUkdCIiwiR0FNTUFfU1JHQkZBU1QiLCJnYW1tYTJfMlBTIiwiR0FNTUFfU1JHQkhEUiIsImdhbW1hMV8wUFMiLCJ0b25lbWFwQ29kZSIsIlRPTkVNQVBfRklMTUlDIiwidG9uZW1hcHBpbmdGaWxtaWNQUyIsIlRPTkVNQVBfTElORUFSIiwidG9uZW1hcHBpbmdMaW5lYXJQUyIsIlRPTkVNQVBfSEVKTCIsInRvbmVtYXBwaW5nSGVqbFBTIiwiVE9ORU1BUF9BQ0VTIiwidG9uZW1hcHBpbmdBY2VzUFMiLCJUT05FTUFQX0FDRVMyIiwidG9uZW1hcHBpbmdBY2VzMlBTIiwidG9uZW1hcGluZ05vbmVQUyIsInRvbmVtYXBwaW5nTm9uZVBTIiwiZm9nQ29kZSIsImZvZ0xpbmVhclBTIiwiZm9nRXhwUFMiLCJmb2dFeHAyUFMiLCJmb2dOb25lUFMiLCJza2luQ29kZSIsImRldmljZSIsInN1cHBvcnRzQm9uZVRleHR1cmVzIiwic2tpblRleFZTIiwiZ2V0Qm9uZUxpbWl0Iiwic2tpbkNvbnN0VlMiLCJiZWdpbiIsImVuZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFPQSxTQUFTQSxTQUFTLENBQUNDLEtBQUssRUFBRUMsTUFBTSxFQUFFO0FBQzlCLEVBQUEsSUFBSSxDQUFDQSxNQUFNLEVBQUVBLE1BQU0sR0FBR0MsWUFBWSxDQUFBO0FBQ2xDLEVBQUEsSUFBSUYsS0FBSyxLQUFLRyxVQUFVLElBQUlILEtBQUssS0FBS0ksY0FBYyxFQUFFO0lBQ2xELE9BQU9ILE1BQU0sQ0FBQ0ksVUFBVSxHQUFHSixNQUFNLENBQUNJLFVBQVUsR0FBR0gsWUFBWSxDQUFDRyxVQUFVLENBQUE7QUFDMUUsR0FBQyxNQUFNLElBQUlMLEtBQUssS0FBS00sYUFBYSxFQUFFO0FBQ2hDLElBQUEsT0FBTyxlQUFlLElBQUlMLE1BQU0sQ0FBQ0ksVUFBVSxHQUFHSixNQUFNLENBQUNJLFVBQVUsR0FBR0gsWUFBWSxDQUFDRyxVQUFVLENBQUMsQ0FBQTtBQUM5RixHQUFBO0VBQ0EsT0FBT0osTUFBTSxDQUFD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
