/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { DEVICETYPE_WEBGL, DEVICETYPE_WEBGPU } from '../../constants.js';
import { GAMMA_SRGB, GAMMA_SRGBFAST, GAMMA_SRGBHDR, TONEMAP_FILMIC, TONEMAP_LINEAR, TONEMAP_HEJL, TONEMAP_ACES, TONEMAP_ACES2 } from '../../../scene/constants.js';
import { ShaderPass } from '../../../scene/shader-pass.js';
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

function precisionCode(device, forcePrecision, shadowPrecision) {
  let code = '';

  if (device.deviceType === DEVICETYPE_WEBGL) {
    if (forcePrecision && forcePrecision !== 'highp' && forcePrecision !== 'mediump' && forcePrecision !== 'lowp') {
      forcePrecision = null;
    }

    if (forcePrecision) {
      if (forcePrecision === 'highp' && device.maxPrecision !== 'highp') {
        forcePrecision = 'mediump';
      }

      if (forcePrecision === 'mediump' && device.maxPrecision === 'lowp') {
        forcePrecision = 'lowp';
      }
    }

    const precision = forcePrecision ? forcePrecision : device.precision;
    code = `precision ${precision} float;\n`;

    if (shadowPrecision && device.webgl2) {
      code += `precision ${precision} sampler2DShadow;\n`;
    }
  }

  return code;
}

function versionCode(device) {
  if (device.deviceType === DEVICETYPE_WEBGPU) {
    return '#version 450\n';
  }

  return device.webgl2 ? "#version 300 es\n" : "";
}

function getShaderNameCode(name) {
  return `#define SHADER_NAME ${name}\n`;
}

function vertexIntro(device, name, pass, extensionCode) {
  let code = versionCode(device);

  if (device.deviceType === DEVICETYPE_WEBGPU) {
    code += shaderChunks.webgpuVS;
  } else {
    if (extensionCode) {
      code += extensionCode + "\n";
    }

    if (device.webgl2) {
      code += shaderChunks.gles3VS;
    }
  }

  code += getShaderNameCode(name);
  code += ShaderPass.getPassShaderDefine(pass);
  return code;
}

function fragmentIntro(device, name, pass, extensionCode, forcePrecision) {
  let code = versionCode(device);

  if (device.deviceType === DEVICETYPE_WEBGPU) {
    code += shaderChunks.webgpuPS;
  } else {
    if (extensionCode) {
      code += extensionCode + "\n";
    }

    if (device.webgl2) {
      code += shaderChunks.gles3PS;
    } else {
      if (device.extStandardDerivatives) {
        code += "#extension GL_OES_standard_derivatives : enable\n";
      }

      if (device.extTextureLod) {
        code += "#extension GL_EXT_shader_texture_lod : enable\n";
        code += "#define SUPPORTS_TEXLOD\n";
      }

      code += shaderChunks.gles2PS;
    }
  }

  code += precisionCode(device, forcePrecision, true);
  code += getShaderNameCode(name);
  code += ShaderPass.getPassShaderDefine(pass);
  return code;
}

function dummyFragmentCode() {
  return "void main(void) {gl_FragColor = vec4(0.0);}";
}

function begin() {
  return 'void main(void)\n{\n';
}

function end() {
  return '}\n';
}

export { begin, dummyFragmentCode, end, fogCode, fragmentIntro, gammaCode, precisionCode, skinCode, tonemapCode, versionCode, vertexIntro };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZ3JhcGhpY3MvcHJvZ3JhbS1saWIvcHJvZ3JhbXMvY29tbW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgREVWSUNFVFlQRV9XRUJHUFUsIERFVklDRVRZUEVfV0VCR0xcbn0gZnJvbSAnLi4vLi4vLi4vZ3JhcGhpY3MvY29uc3RhbnRzLmpzJztcblxuaW1wb3J0IHtcbiAgICBHQU1NQV9TUkdCLCBHQU1NQV9TUkdCRkFTVCwgR0FNTUFfU1JHQkhEUixcbiAgICBUT05FTUFQX0FDRVMsIFRPTkVNQVBfQUNFUzIsIFRPTkVNQVBfRklMTUlDLCBUT05FTUFQX0hFSkwsIFRPTkVNQVBfTElORUFSXG59IGZyb20gJy4uLy4uLy4uL3NjZW5lL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBTaGFkZXJQYXNzIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmUvc2hhZGVyLXBhc3MuanMnO1xuXG5pbXBvcnQgeyBzaGFkZXJDaHVua3MgfSBmcm9tICcuLi9jaHVua3MvY2h1bmtzLmpzJztcblxuZnVuY3Rpb24gZ2FtbWFDb2RlKHZhbHVlLCBjaHVua3MpIHtcbiAgICBpZiAoIWNodW5rcykgY2h1bmtzID0gc2hhZGVyQ2h1bmtzO1xuICAgIGlmICh2YWx1ZSA9PT0gR0FNTUFfU1JHQiB8fCB2YWx1ZSA9PT0gR0FNTUFfU1JHQkZBU1QpIHtcbiAgICAgICAgcmV0dXJuIGNodW5rcy5nYW1tYTJfMlBTID8gY2h1bmtzLmdhbW1hMl8yUFMgOiBzaGFkZXJDaHVua3MuZ2FtbWEyXzJQUztcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBHQU1NQV9TUkdCSERSKSB7XG4gICAgICAgIHJldHVybiBcIiNkZWZpbmUgSERSXFxuXCIgKyAoY2h1bmtzLmdhbW1hMl8yUFMgPyBjaHVua3MuZ2FtbWEyXzJQUyA6IHNoYWRlckNodW5rcy5nYW1tYTJfMlBTKTtcbiAgICB9XG4gICAgcmV0dXJuIGNodW5rcy5nYW1tYTFfMFBTID8gY2h1bmtzLmdhbW1hMV8wUFMgOiBzaGFkZXJDaHVua3MuZ2FtbWExXzBQUztcbn1cblxuZnVuY3Rpb24gdG9uZW1hcENvZGUodmFsdWUsIGNodW5rcykge1xuICAgIGlmICghY2h1bmtzKSBjaHVua3MgPSBzaGFkZXJDaHVua3M7XG4gICAgaWYgKHZhbHVlID09PSBUT05FTUFQX0ZJTE1JQykge1xuICAgICAgICByZXR1cm4gY2h1bmtzLnRvbmVtYXBwaW5nRmlsbWljUFMgPyBjaHVua3MudG9uZW1hcHBpbmdGaWxtaWNQUyA6IHNoYWRlckNodW5rcy50b25lbWFwcGluZ0ZpbG1pY1BTO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IFRPTkVNQVBfTElORUFSKSB7XG4gICAgICAgIHJldHVybiBjaHVua3MudG9uZW1hcHBpbmdMaW5lYXJQUyA/IGNodW5rcy50b25lbWFwcGluZ0xpbmVhclBTIDogc2hhZGVyQ2h1bmtzLnRvbmVtYXBwaW5nTGluZWFyUFM7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gVE9ORU1BUF9IRUpMKSB7XG4gICAgICAgIHJldHVybiBjaHVua3MudG9uZW1hcHBpbmdIZWpsUFMgPyBjaHVua3MudG9uZW1hcHBpbmdIZWpsUFMgOiBzaGFkZXJDaHVua3MudG9uZW1hcHBpbmdIZWpsUFM7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gVE9ORU1BUF9BQ0VTKSB7XG4gICAgICAgIHJldHVybiBjaHVua3MudG9uZW1hcHBpbmdBY2VzUFMgPyBjaHVua3MudG9uZW1hcHBpbmdBY2VzUFMgOiBzaGFkZXJDaHVua3MudG9uZW1hcHBpbmdBY2VzUFM7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gVE9ORU1BUF9BQ0VTMikge1xuICAgICAgICByZXR1cm4gY2h1bmtzLnRvbmVtYXBwaW5nQWNlczJQUyA/IGNodW5rcy50b25lbWFwcGluZ0FjZXMyUFMgOiBzaGFkZXJDaHVua3MudG9uZW1hcHBpbmdBY2VzMlBTO1xuICAgIH1cbiAgICByZXR1cm4gY2h1bmtzLnRvbmVtYXBpbmdOb25lUFMgPyBjaHVua3MudG9uZW1hcGluZ05vbmVQUyA6IHNoYWRlckNodW5rcy50b25lbWFwcGluZ05vbmVQUztcbn1cblxuZnVuY3Rpb24gZm9nQ29kZSh2YWx1ZSwgY2h1bmtzKSB7XG4gICAgaWYgKCFjaHVua3MpIGNodW5rcyA9IHNoYWRlckNodW5rcztcbiAgICBpZiAodmFsdWUgPT09ICdsaW5lYXInKSB7XG4gICAgICAgIHJldHVybiBjaHVua3MuZm9nTGluZWFyUFMgPyBjaHVua3MuZm9nTGluZWFyUFMgOiBzaGFkZXJDaHVua3MuZm9nTGluZWFyUFM7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gJ2V4cCcpIHtcbiAgICAgICAgcmV0dXJuIGNodW5rcy5mb2dFeHBQUyA/IGNodW5rcy5mb2dFeHBQUyA6IHNoYWRlckNodW5rcy5mb2dFeHBQUztcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAnZXhwMicpIHtcbiAgICAgICAgcmV0dXJuIGNodW5rcy5mb2dFeHAyUFMgPyBjaHVua3MuZm9nRXhwMlBTIDogc2hhZGVyQ2h1bmtzLmZvZ0V4cDJQUztcbiAgICB9XG4gICAgcmV0dXJuIGNodW5rcy5mb2dOb25lUFMgPyBjaHVua3MuZm9nTm9uZVBTIDogc2hhZGVyQ2h1bmtzLmZvZ05vbmVQUztcbn1cblxuZnVuY3Rpb24gc2tpbkNvZGUoZGV2aWNlLCBjaHVua3MpIHtcbiAgICBpZiAoIWNodW5rcykgY2h1bmtzID0gc2hhZGVyQ2h1bmtzO1xuICAgIGlmIChkZXZpY2Uuc3VwcG9ydHNCb25lVGV4dHVyZXMpIHtcbiAgICAgICAgcmV0dXJuIGNodW5rcy5za2luVGV4VlM7XG4gICAgfVxuICAgIHJldHVybiBcIiNkZWZpbmUgQk9ORV9MSU1JVCBcIiArIGRldmljZS5nZXRCb25lTGltaXQoKSArIFwiXFxuXCIgKyBjaHVua3Muc2tpbkNvbnN0VlM7XG59XG5cbmZ1bmN0aW9uIHByZWNpc2lvbkNvZGUoZGV2aWNlLCBmb3JjZVByZWNpc2lvbiwgc2hhZG93UHJlY2lzaW9uKSB7XG5cbiAgICBsZXQgY29kZSA9ICcnO1xuXG4gICAgaWYgKGRldmljZS5kZXZpY2VUeXBlID09PSBERVZJQ0VUWVBFX1dFQkdMKSB7XG5cbiAgICAgICAgaWYgKGZvcmNlUHJlY2lzaW9uICYmIGZvcmNlUHJlY2lzaW9uICE9PSAnaGlnaHAnICYmIGZvcmNlUHJlY2lzaW9uICE9PSAnbWVkaXVtcCcgJiYgZm9yY2VQcmVjaXNpb24gIT09ICdsb3dwJykge1xuICAgICAgICAgICAgZm9yY2VQcmVjaXNpb24gPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZvcmNlUHJlY2lzaW9uKSB7XG4gICAgICAgICAgICBpZiAoZm9yY2VQcmVjaXNpb24gPT09ICdoaWdocCcgJiYgZGV2aWNlLm1heFByZWNpc2lvbiAhPT0gJ2hpZ2hwJykge1xuICAgICAgICAgICAgICAgIGZvcmNlUHJlY2lzaW9uID0gJ21lZGl1bXAnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZvcmNlUHJlY2lzaW9uID09PSAnbWVkaXVtcCcgJiYgZGV2aWNlLm1heFByZWNpc2lvbiA9PT0gJ2xvd3AnKSB7XG4gICAgICAgICAgICAgICAgZm9yY2VQcmVjaXNpb24gPSAnbG93cCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcmVjaXNpb24gPSBmb3JjZVByZWNpc2lvbiA/IGZvcmNlUHJlY2lzaW9uIDogZGV2aWNlLnByZWNpc2lvbjtcbiAgICAgICAgY29kZSA9IGBwcmVjaXNpb24gJHtwcmVjaXNpb259IGZsb2F0O1xcbmA7XG5cbiAgICAgICAgLy8gVE9ETzogdGhpcyBjYW4gYmUgb25seSBzZXQgb24gc2hhZGVycyB3aXRoIHZlcnNpb24gMzAwIG9yIG1vcmUsIHNvIG1ha2UgdGhpcyBvcHRpb25hbCBhcyBtYW55XG4gICAgICAgIC8vIGludGVybmFsIHNoYWRlcnMgKHBhcnRpY2xlcy4uKSBhcmUgZnJvbSB3ZWJnbDEgZXJhIGFuZCBkb24ndCBzZXQgYW55IHByZWNpc2lvbi4gTW9kaWZpZWQgd2hlbiB1cGdyYWRlZC5cbiAgICAgICAgaWYgKHNoYWRvd1ByZWNpc2lvbiAmJiBkZXZpY2Uud2ViZ2wyKSB7XG4gICAgICAgICAgICBjb2RlICs9IGBwcmVjaXNpb24gJHtwcmVjaXNpb259IHNhbXBsZXIyRFNoYWRvdztcXG5gO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvZGU7XG59XG5cbmZ1bmN0aW9uIHZlcnNpb25Db2RlKGRldmljZSkge1xuICAgIGlmIChkZXZpY2UuZGV2aWNlVHlwZSA9PT0gREVWSUNFVFlQRV9XRUJHUFUpIHtcbiAgICAgICAgcmV0dXJuICcjdmVyc2lvbiA0NTBcXG4nO1xuICAgIH1cblxuICAgIHJldHVybiBkZXZpY2Uud2ViZ2wyID8gXCIjdmVyc2lvbiAzMDAgZXNcXG5cIiA6IFwiXCI7XG59XG5cbi8vIFNwZWN0b3JKUyBpbnRlZ3JhdGlvblxuZnVuY3Rpb24gZ2V0U2hhZGVyTmFtZUNvZGUobmFtZSkge1xuICAgIHJldHVybiBgI2RlZmluZSBTSEFERVJfTkFNRSAke25hbWV9XFxuYDtcbn1cblxuZnVuY3Rpb24gdmVydGV4SW50cm8oZGV2aWNlLCBuYW1lLCBwYXNzLCBleHRlbnNpb25Db2RlKSB7XG5cbiAgICBsZXQgY29kZSA9IHZlcnNpb25Db2RlKGRldmljZSk7XG5cbiAgICBpZiAoZGV2aWNlLmRldmljZVR5cGUgPT09IERFVklDRVRZUEVfV0VCR1BVKSB7XG5cbiAgICAgICAgY29kZSArPSBzaGFkZXJDaHVua3Mud2ViZ3B1VlM7XG5cbiAgICB9IGVsc2UgeyAgICAvLyBXZWJHTFxuXG4gICAgICAgIGlmIChleHRlbnNpb25Db2RlKSB7XG4gICAgICAgICAgICBjb2RlICs9IGV4dGVuc2lvbkNvZGUgKyBcIlxcblwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRldmljZS53ZWJnbDIpIHtcbiAgICAgICAgICAgIGNvZGUgKz0gc2hhZGVyQ2h1bmtzLmdsZXMzVlM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb2RlICs9IGdldFNoYWRlck5hbWVDb2RlKG5hbWUpO1xuICAgIGNvZGUgKz0gU2hhZGVyUGFzcy5nZXRQYXNzU2hhZGVyRGVmaW5lKHBhc3MpO1xuXG4gICAgcmV0dXJuIGNvZGU7XG59XG5cbmZ1bmN0aW9uIGZyYWdtZW50SW50cm8oZGV2aWNlLCBuYW1lLCBwYXNzLCBleHRlbnNpb25Db2RlLCBmb3JjZVByZWNpc2lvbikge1xuXG4gICAgbGV0IGNvZGUgPSB2ZXJzaW9uQ29kZShkZXZpY2UpO1xuXG4gICAgaWYgKGRldmljZS5kZXZpY2VUeXBlID09PSBERVZJQ0VUWVBFX1dFQkdQVSkge1xuXG4gICAgICAgIGNvZGUgKz0gc2hhZGVyQ2h1bmtzLndlYmdwdVBTO1xuXG4gICAgfSBlbHNlIHsgICAgLy8gV2ViR0xcblxuICAgICAgICBpZiAoZXh0ZW5zaW9uQ29kZSkge1xuICAgICAgICAgICAgY29kZSArPSBleHRlbnNpb25Db2RlICsgXCJcXG5cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZXZpY2Uud2ViZ2wyKSB7ICAgIC8vIFdlYkdMIDJcblxuICAgICAgICAgICAgY29kZSArPSBzaGFkZXJDaHVua3MuZ2xlczNQUztcblxuICAgICAgICB9IGVsc2UgeyAgICAvLyBXZWJHTCAxXG5cbiAgICAgICAgICAgIGlmIChkZXZpY2UuZXh0U3RhbmRhcmREZXJpdmF0aXZlcykge1xuICAgICAgICAgICAgICAgIGNvZGUgKz0gXCIjZXh0ZW5zaW9uIEdMX09FU19zdGFuZGFyZF9kZXJpdmF0aXZlcyA6IGVuYWJsZVxcblwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRldmljZS5leHRUZXh0dXJlTG9kKSB7XG4gICAgICAgICAgICAgICAgY29kZSArPSBcIiNleHRlbnNpb24gR0xfRVhUX3NoYWRlcl90ZXh0dXJlX2xvZCA6IGVuYWJsZVxcblwiO1xuICAgICAgICAgICAgICAgIGNvZGUgKz0gXCIjZGVmaW5lIFNVUFBPUlRTX1RFWExPRFxcblwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb2RlICs9IHNoYWRlckNodW5rcy5nbGVzMlBTO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29kZSArPSBwcmVjaXNpb25Db2RlKGRldmljZSwgZm9yY2VQcmVjaXNpb24sIHRydWUpO1xuICAgIGNvZGUgKz0gZ2V0U2hhZGVyTmFtZUNvZGUobmFtZSk7XG4gICAgY29kZSArPSBTaGFkZXJQYXNzLmdldFBhc3NTaGFkZXJEZWZpbmUocGFzcyk7XG5cbiAgICByZXR1cm4gY29kZTtcbn1cblxuZnVuY3Rpb24gZHVtbXlGcmFnbWVudENvZGUoKSB7XG4gICAgcmV0dXJuIFwidm9pZCBtYWluKHZvaWQpIHtnbF9GcmFnQ29sb3IgPSB2ZWM0KDAuMCk7fVwiO1xufVxuXG5mdW5jdGlvbiBiZWdpbigpIHtcbiAgICByZXR1cm4gJ3ZvaWQgbWFpbih2b2lkKVxcbntcXG4nO1xufVxuXG5mdW5jdGlvbiBlbmQoKSB7XG4gICAgcmV0dXJuICd9XFxuJztcbn1cblxuZXhwb3J0IHsgdmVydGV4SW50cm8sIGZyYWdtZW50SW50cm8sIGJlZ2luLCBlbmQsIGR1bW15RnJhZ21lbnRDb2RlLCBmb2dDb2RlLCBnYW1tYUNvZGUsIHByZWNpc2lvbkNvZGUsIHNraW5Db2RlLCB0b25lbWFwQ29kZSwgdmVyc2lvbkNvZGUgfTtcbiJdLCJuYW1lcyI6WyJnYW1tYUNvZGUiLCJ2YWx1ZSIsImNodW5rcyIsInNoYWRlckNodW5rcyIsIkdBTU1BX1NSR0IiLCJHQU1NQV9TUkdCRkFTVCIsImdhbW1hMl8yUFMiLCJHQU1NQV9TUkdCSERSIiwiZ2FtbWExXzBQUyIsInRvbmVtYXBDb2RlIiwiVE9ORU1BUF9GSUxNSUMiLCJ0b25lbWFwcGluZ0ZpbG1pY1BTIiwiVE9ORU1BUF9MSU5FQVIiLCJ0b25lbWFwcGluZ0xpbmVhclBTIiwiVE9ORU1BUF9IRUpMIiwidG9uZW1hcHBpbmdIZWpsUFMiLCJUT05FTUFQX0FDRVMiLCJ0b25lbWFwcGluZ0FjZXNQUyIsIlRPTkVNQVBfQUNFUzIiLCJ0b25lbWFwcGluZ0FjZXMyUFMiLCJ0b25lbWFwaW5nTm9uZVBTIiwidG9uZW1hcHBpbmdOb25lUFMiLCJmb2dDb2RlIiwiZm9nTGluZWFyUFMiLCJmb2dFeHBQUyIsImZvZ0V4cDJQUyIsImZvZ05vbmVQUyIsInNraW5Db2RlIiwiZGV2aWNlIiwic3VwcG9ydHNCb25lVGV4dHVyZXMiLCJza2luVGV4VlMiLCJnZXRCb25lTGltaXQiLCJza2luQ29uc3RWUyIsInByZWNpc2lvbkNvZGUiLCJmb3JjZVByZWNpc2lvbiIsInNoYWRvd1ByZWNpc2lvbiIsImNvZGUiLCJkZXZpY2VUeXBlIiwiREVWSUNFVFlQRV9XRUJHTCIsIm1heFByZWNpc2lvbiIsInByZWNpc2lvbiIsIndlYmdsMiIsInZlcnNpb25Db2RlIiwiREVWSUNFVFlQRV9XRUJHUFUiLCJnZXRTaGFkZXJOYW1lQ29kZSIsIm5hbWUiLCJ2ZXJ0ZXhJbnRybyIsInBhc3MiLCJleHRlbnNpb25Db2RlIiwid2ViZ3B1VlMiLCJnbGVzM1ZTIiwiU2hhZGVyUGFzcyIsImdldFBhc3NTaGFkZXJEZWZpbmUiLCJmcmFnbWVudEludHJvIiwid2ViZ3B1UFMiLCJnbGVzM1BTIiwiZXh0U3RhbmRhcmREZXJpdmF0aXZlcyIsImV4dFRleHR1cmVMb2QiLCJnbGVzMlBTIiwiZHVtbXlGcmFnbWVudENvZGUiLCJiZWdpbiIsImVuZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVlBLFNBQVNBLFNBQVQsQ0FBbUJDLEtBQW5CLEVBQTBCQyxNQUExQixFQUFrQztBQUM5QixFQUFBLElBQUksQ0FBQ0EsTUFBTCxFQUFhQSxNQUFNLEdBQUdDLFlBQVQsQ0FBQTs7QUFDYixFQUFBLElBQUlGLEtBQUssS0FBS0csVUFBVixJQUF3QkgsS0FBSyxLQUFLSSxjQUF0QyxFQUFzRDtJQUNsRCxPQUFPSCxNQUFNLENBQUNJLFVBQVAsR0FBb0JKLE1BQU0sQ0FBQ0ksVUFBM0IsR0FBd0NILFlBQVksQ0FBQ0csVUFBNUQsQ0FBQTtBQUNILEdBRkQsTUFFTyxJQUFJTCxLQUFLLEtBQUtNLGFBQWQsRUFBNkI7QUFDaEMsSUFBQSxPQUFPLGVBQW1CTCxJQUFBQSxNQUFNLENBQUNJLFVBQVAsR0FBb0JKLE1BQU0sQ0FBQ0ksVUFBM0IsR0FBd0NILFlBQVksQ0FBQ0csVUFBeEUsQ0FBUCxDQUFBO0FBQ0gsR0FBQTs7RUFDRCxPQUFPSixNQUFNLENBQUNNLFVBQVAsR0FBb0JOLE1BQU0sQ0FBQ00sVUFBM0IsR0FBd0NMLFlBQVksQ0FBQ0ssVUFBNUQsQ0FBQTtBQUNILENBQUE7O0FBRUQsU0FBU0MsV0FBVCxDQUFxQlIsS0FBckIsRUFBNEJDLE1BQTVCLEVBQW9DO0FBQ2hDLEVBQUEsSUFBSSxDQUFDQSxNQUFMLEVBQWFBLE1BQU0sR0FBR0MsWUFBVCxDQUFBOztFQUNiLElBQUlGLEtBQUssS0FBS1MsY0FBZCxFQUE4QjtJQUMxQixPQUFPUixNQUFNLENBQUNTLG1CQUFQLEdBQTZCVCxNQUFNLENBQUNTLG1CQUFwQyxHQUEwRFIsWUFBWSxDQUFDUSxtQkFBOUUsQ0FBQTtBQUNILEdBRkQsTUFFTyxJQUFJVixLQUFLLEtBQUtXLGNBQWQsRUFBOEI7SUFDakMsT0FBT1YsTUFBTSxDQUFDVyxtQkFBUCxHQUE2QlgsTUFBTSxDQUFDVyxtQkFBcEMsR0FBMERWLFlBQVksQ0FBQ1UsbUJBQTlFLENBQUE7QUFDSCxHQUZNLE1BRUEsSUFBSVosS0FBSyxLQUFLYSxZQUFkLEVBQTRCO0lBQy9CLE9BQU9aLE1BQU0sQ0FBQ2EsaUJBQVAsR0FBMkJiLE1BQU0sQ0FBQ2EsaUJBQWxDLEdBQXNEWixZQUFZLENBQUNZLGlCQUExRSxDQUFBO0FBQ0gsR0FGTSxNQUVBLElBQUlkLEtBQUssS0FBS2UsWUFBZCxFQUE0QjtJQUMvQixPQUFPZCxNQUFNLENBQUNlLGlCQUFQLEdBQTJCZixNQUFNLENBQUNlLGlCQUFsQyxHQUFzRGQsWUFBWSxDQUFDYyxpQkFBMUUsQ0FBQTtBQUNILEdBRk0sTUFFQSxJQUFJaEIsS0FBSyxLQUFLaUIsYUFBZCxFQUE2QjtJQUNoQyxPQUFPaEIsTUFBTSxDQUFDaUIsa0JBQVAsR0FBNEJqQixNQUFNLENBQUNpQixrQkFBbkMsR0FBd0RoQixZQUFZLENBQUNnQixrQkFBNUUsQ0FBQTtBQUNILEdBQUE7O0VBQ0QsT0FBT2pCLE1BQU0sQ0FBQ2tCLGdCQUFQLEdBQTBCbEIsTUFBTSxDQUFDa0IsZ0JBQWpDLEdBQW9EakIsWUFBWSxDQUFDa0IsaUJBQXhFLENBQUE7QUFDSCxDQUFBOztBQUVELFNBQVNDLE9BQVQsQ0FBaUJyQixLQUFqQixFQUF3QkMsTUFBeEIsRUFBZ0M7QUFDNUIsRUFBQSxJQUFJLENBQUNBLE1BQUwsRUFBYUEsTUFBTSxHQUFHQyxZQUFULENBQUE7O0VBQ2IsSUFBSUYsS0FBSyxLQUFLLFFBQWQsRUFBd0I7SUFDcEIsT0FBT0MsTUFBTSxDQUFDcUIsV0FBUCxHQUFxQnJCLE1BQU0sQ0FBQ3FCLFdBQTVCLEdBQTBDcEIsWUFBWSxDQUFDb0IsV0FBOUQsQ0FBQTtBQUNILEdBRkQsTUFFTyxJQUFJdEIsS0FBSyxLQUFLLEtBQWQsRUFBcUI7SUFDeEIsT0FBT0MsTUFBTSxDQUFDc0IsUUFBUCxHQUFrQnRCLE1BQU0sQ0FBQ3NCLFFBQXpCLEdBQW9DckIsWUFBWSxDQUFDcUIsUUFBeEQsQ0FBQTtBQUNILEdBRk0sTUFFQSxJQUFJdkIsS0FBSyxLQUFLLE1BQWQsRUFBc0I7SUFDekIsT0FBT0MsTUFBTSxDQUFDdUIsU0FBUCxHQUFtQnZCLE1BQU0sQ0FBQ3VCLFNBQTFCLEdBQXNDdEIsWUFBWSxDQUFDc0IsU0FBMUQsQ0FBQTtBQUNILEdBQUE7O0VBQ0QsT0FBT3ZCLE1BQU0sQ0FBQ3dCLFNBQVAsR0FBbUJ4QixNQUFNLENBQUN3QixTQUExQixHQUFzQ3ZCLFlBQVksQ0FBQ3VCLFNBQTFELENBQUE7QUFDSCxDQUFBOztBQUVELFNBQVNDLFFBQVQsQ0FBa0JDLE1BQWxCLEVBQTBCMUIsTUFBMUIsRUFBa0M7QUFDOUIsRUFBQSxJQUFJLENBQUNBLE1BQUwsRUFBYUEsTUFBTSxHQUFHQyxZQUFULENBQUE7O0VBQ2IsSUFBSXlCLE1BQU0sQ0FBQ0Msb0JBQVgsRUFBaUM7SUFDN0IsT0FBTzNCLE1BQU0sQ0FBQzRCLFNBQWQsQ0FBQTtBQUNILEdBQUE7O0VBQ0QsT0FBTyxxQkFBQSxHQUF3QkYsTUFBTSxDQUFDRyxZQUFQLEVBQXhCLEdBQWdELElBQWhELEdBQXVEN0IsTUFBTSxDQUFDOEIsV0FBckUsQ0FBQTtBQUNILENBQUE7O0FBRUQsU0FBU0MsYUFBVCxDQUF1QkwsTUFBdkIsRUFBK0JNLGNBQS9CLEVBQStDQyxlQUEvQyxFQUFnRTtFQUU1RCxJQUFJQyxJQUFJLEdBQUcsRUFBWCxDQUFBOztBQUVBLEVBQUEsSUFBSVIsTUFBTSxDQUFDUyxVQUFQLEtBQXNCQyxnQkFBMUIsRUFBNEM7QUFFeEMsSUFBQSxJQUFJSixjQUFjLElBQUlBLGNBQWMsS0FBSyxPQUFyQyxJQUFnREEsY0FBYyxLQUFLLFNBQW5FLElBQWdGQSxjQUFjLEtBQUssTUFBdkcsRUFBK0c7QUFDM0dBLE1BQUFBLGNBQWMsR0FBRyxJQUFqQixDQUFBO0FBQ0gsS0FBQTs7QUFFRCxJQUFBLElBQUlBLGNBQUosRUFBb0I7TUFDaEIsSUFBSUEsY0FBYyxLQUFLLE9BQW5CLElBQThCTixNQUFNLENBQUNXLFlBQVAsS0FBd0IsT0FBMUQsRUFBbUU7QUFDL0RMLFFBQUFBLGNBQWMsR0FBRyxTQUFqQixDQUFBO0FBQ0gsT0FBQTs7TUFDRCxJQUFJQSxjQUFjLEtBQUssU0FBbkIsSUFBZ0NOLE1BQU0sQ0FBQ1csWUFBUCxLQUF3QixNQUE1RCxFQUFvRTtBQUNoRUwsUUFBQUEsY0FBYyxHQUFHLE1BQWpCLENBQUE7QUFDSCxPQUFBO0FBQ0osS0FBQTs7SUFFRCxNQUFNTSxTQUFTLEdBQUdOLGNBQWMsR0FBR0EsY0FBSCxHQUFvQk4sTUFBTSxDQUFDWSxTQUEzRCxDQUFBO0lBQ0FKLElBQUksR0FBSSxDQUFZSSxVQUFBQSxFQUFBQSxTQUFVLENBQTlCLFNBQUEsQ0FBQSxDQUFBOztBQUlBLElBQUEsSUFBSUwsZUFBZSxJQUFJUCxNQUFNLENBQUNhLE1BQTlCLEVBQXNDO01BQ2xDTCxJQUFJLElBQUssQ0FBWUksVUFBQUEsRUFBQUEsU0FBVSxDQUEvQixtQkFBQSxDQUFBLENBQUE7QUFDSCxLQUFBO0FBQ0osR0FBQTs7QUFFRCxFQUFBLE9BQU9KLElBQVAsQ0FBQTtBQUNILENBQUE7O0FBRUQsU0FBU00sV0FBVCxDQUFxQmQsTUFBckIsRUFBNkI7QUFDekIsRUFBQSxJQUFJQSxNQUFNLENBQUNTLFVBQVAsS0FBc0JNLGlCQUExQixFQUE2QztBQUN6QyxJQUFBLE9BQU8sZ0JBQVAsQ0FBQTtBQUNILEdBQUE7O0FBRUQsRUFBQSxPQUFPZixNQUFNLENBQUNhLE1BQVAsR0FBZ0IsbUJBQWhCLEdBQXNDLEVBQTdDLENBQUE7QUFDSCxDQUFBOztBQUdELFNBQVNHLGlCQUFULENBQTJCQyxJQUEzQixFQUFpQztFQUM3QixPQUFRLENBQUEsb0JBQUEsRUFBc0JBLElBQUssQ0FBbkMsRUFBQSxDQUFBLENBQUE7QUFDSCxDQUFBOztBQUVELFNBQVNDLFdBQVQsQ0FBcUJsQixNQUFyQixFQUE2QmlCLElBQTdCLEVBQW1DRSxJQUFuQyxFQUF5Q0MsYUFBekMsRUFBd0Q7QUFFcEQsRUFBQSxJQUFJWixJQUFJLEdBQUdNLFdBQVcsQ0FBQ2QsTUFBRCxDQUF0QixDQUFBOztBQUVBLEVBQUEsSUFBSUEsTUFBTSxDQUFDUyxVQUFQLEtBQXNCTSxpQkFBMUIsRUFBNkM7SUFFekNQLElBQUksSUFBSWpDLFlBQVksQ0FBQzhDLFFBQXJCLENBQUE7QUFFSCxHQUpELE1BSU87QUFFSCxJQUFBLElBQUlELGFBQUosRUFBbUI7TUFDZlosSUFBSSxJQUFJWSxhQUFhLEdBQUcsSUFBeEIsQ0FBQTtBQUNILEtBQUE7O0lBRUQsSUFBSXBCLE1BQU0sQ0FBQ2EsTUFBWCxFQUFtQjtNQUNmTCxJQUFJLElBQUlqQyxZQUFZLENBQUMrQyxPQUFyQixDQUFBO0FBQ0gsS0FBQTtBQUNKLEdBQUE7O0FBRURkLEVBQUFBLElBQUksSUFBSVEsaUJBQWlCLENBQUNDLElBQUQsQ0FBekIsQ0FBQTtBQUNBVCxFQUFBQSxJQUFJLElBQUllLFVBQVUsQ0FBQ0MsbUJBQVgsQ0FBK0JMLElBQS9CLENBQVIsQ0FBQTtBQUVBLEVBQUEsT0FBT1gsSUFBUCxDQUFBO0FBQ0gsQ0FBQTs7QUFFRCxTQUFTaUIsYUFBVCxDQUF1QnpCLE1BQXZCLEVBQStCaUIsSUFBL0IsRUFBcUNFLElBQXJDLEVBQTJDQyxhQUEzQyxFQUEwRGQsY0FBMUQsRUFBMEU7QUFFdEUsRUFBQSxJQUFJRSxJQUFJLEdBQUdNLFdBQVcsQ0FBQ2QsTUFBRCxDQUF0QixDQUFBOztBQUVBLEVBQUEsSUFBSUEsTUFBTSxDQUFDUyxVQUFQLEtBQXNCTSxpQkFBMUIsRUFBNkM7SUFFekNQLElBQUksSUFBSWpDLFlBQVksQ0FBQ21ELFFBQXJCLENBQUE7QUFFSCxHQUpELE1BSU87QUFFSCxJQUFBLElBQUlOLGFBQUosRUFBbUI7TUFDZlosSUFBSSxJQUFJWSxhQUFhLEdBQUcsSUFBeEIsQ0FBQTtBQUNILEtBQUE7O0lBRUQsSUFBSXBCLE1BQU0sQ0FBQ2EsTUFBWCxFQUFtQjtNQUVmTCxJQUFJLElBQUlqQyxZQUFZLENBQUNvRCxPQUFyQixDQUFBO0FBRUgsS0FKRCxNQUlPO01BRUgsSUFBSTNCLE1BQU0sQ0FBQzRCLHNCQUFYLEVBQW1DO0FBQy9CcEIsUUFBQUEsSUFBSSxJQUFJLG1EQUFSLENBQUE7QUFDSCxPQUFBOztNQUNELElBQUlSLE1BQU0sQ0FBQzZCLGFBQVgsRUFBMEI7QUFDdEJyQixRQUFBQSxJQUFJLElBQUksaURBQVIsQ0FBQTtBQUNBQSxRQUFBQSxJQUFJLElBQUksMkJBQVIsQ0FBQTtBQUNILE9BQUE7O01BRURBLElBQUksSUFBSWpDLFlBQVksQ0FBQ3VELE9BQXJCLENBQUE7QUFDSCxLQUFBO0FBQ0osR0FBQTs7RUFFRHRCLElBQUksSUFBSUgsYUFBYSxDQUFDTCxNQUFELEVBQVNNLGNBQVQsRUFBeUIsSUFBekIsQ0FBckIsQ0FBQTtBQUNBRSxFQUFBQSxJQUFJLElBQUlRLGlCQUFpQixDQUFDQyxJQUFELENBQXpCLENBQUE7QUFDQVQsRUFBQUEsSUFBSSxJQUFJZSxVQUFVLENBQUNDLG1CQUFYLENBQStCTCxJQUEvQixDQUFSLENBQUE7QUFFQSxFQUFBLE9BQU9YLElBQVAsQ0FBQTtBQUNILENBQUE7O0FBRUQsU0FBU3VCLGlCQUFULEdBQTZCO0FBQ3pCLEVBQUEsT0FBTyw2Q0FBUCxDQUFBO0FBQ0gsQ0FBQTs7QUFFRCxTQUFTQyxLQUFULEdBQWlCO0FBQ2IsRUFBQSxPQUFPLHNCQUFQLENBQUE7QUFDSCxDQUFBOztBQUVELFNBQVNDLEdBQVQsR0FBZTtBQUNYLEVBQUEsT0FBTyxLQUFQLENBQUE7QUFDSDs7OzsifQ==
