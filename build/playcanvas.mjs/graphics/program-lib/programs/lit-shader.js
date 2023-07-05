import { SEMANTIC_POSITION, SEMANTIC_ATTR12, SEMANTIC_ATTR13, SEMANTIC_ATTR14, SEMANTIC_ATTR15, SEMANTIC_NORMAL, SEMANTIC_TANGENT, SEMANTIC_COLOR, SEMANTIC_ATTR8, SEMANTIC_ATTR9, SEMANTIC_ATTR10, SEMANTIC_ATTR11, SEMANTIC_BLENDWEIGHT, SEMANTIC_BLENDINDICES, PIXELFORMAT_R8_G8_B8_A8, SHADERTAG_MATERIAL, SEMANTIC_TEXCOORD0, SEMANTIC_TEXCOORD1 } from '../../constants.js';
import { shaderChunks } from '../chunks/chunks.js';
import { ChunkUtils } from '../chunk-utils.js';
import { SPRITE_RENDERMODE_SLICED, SPRITE_RENDERMODE_TILED, LIGHTTYPE_SPOT, LIGHTSHAPE_SPHERE, LIGHTSHAPE_DISK, LIGHTSHAPE_RECT, SHADER_DEPTH, SHADOW_VSM32, SHADOW_PCF3, LIGHTTYPE_OMNI, SHADOW_VSM8, LIGHTTYPE_DIRECTIONAL, SHADOW_PCF5, LIGHTSHAPE_PUNCTUAL, FRESNEL_SCHLICK, SPECOCC_GLOSSDEPENDENT, SPECOCC_AO, SHADOW_VSM16, SPECULAR_PHONG, shadowTypeToString, LIGHTFALLOFF_LINEAR, BLEND_NORMAL, BLEND_PREMULTIPLIED, BLEND_ADDITIVEALPHA, SHADER_PICK } from '../../../scene/constants.js';
import { LightsBuffer } from '../../../scene/lighting/lights-buffer.js';
import { ShaderPass } from '../../../scene/shader-pass.js';
import { skinCode, vertexIntro, fragmentIntro, begin, end, gammaCode, tonemapCode, fogCode } from './common.js';
import '../../../core/tracing.js';

const builtinAttributes = {
  vertex_normal: SEMANTIC_NORMAL,
  vertex_tangent: SEMANTIC_TANGENT,
  vertex_texCoord0: SEMANTIC_TEXCOORD0,
  vertex_texCoord1: SEMANTIC_TEXCOORD1,
  vertex_color: SEMANTIC_COLOR,
  vertex_boneWeights: SEMANTIC_BLENDWEIGHT,
  vertex_boneIndices: SEMANTIC_BLENDINDICES
};
const builtinVaryings = {
  vVertexColor: "vec4",
  vPositionW: "vec3",
  vNormalV: "vec3",
  vNormalW: "vec3",
  vTangentW: "vec3",
  vBinormalW: "vec3",
  vObjectSpaceUpW: "vec3",
  vUv0: "vec2",
  vUv1: "vec2"
};

class LitShader {
  constructor(device, options) {
    this.device = device;
    this.options = options;
    this.attributes = {
      vertex_position: SEMANTIC_POSITION
    };

    if (options.chunks) {
      this.chunks = {};
      const userChunks = options.chunks;

      for (const chunkName in shaderChunks) {
        if (userChunks.hasOwnProperty(chunkName)) {
          const chunk = userChunks[chunkName];

          for (const a in builtinAttributes) {
            if (builtinAttributes.hasOwnProperty(a) && chunk.indexOf(a) >= 0) {
              this.attributes[a] = builtinAttributes[a];
            }
          }

          this.chunks[chunkName] = chunk;
        } else {
          this.chunks[chunkName] = shaderChunks[chunkName];
        }
      }
    } else {
      this.chunks = shaderChunks;
    }

    this.lighting = options.lights.length > 0 || !!options.dirLightMap || !!options.clusteredLightingEnabled;
    this.reflections = !!options.reflectionSource;
    if (!options.useSpecular) options.specularMap = options.glossMap = null;
    this.shadowPass = ShaderPass.isShadow(options.pass);
    this.needsNormal = this.lighting || this.reflections || options.useSpecular || options.ambientSH || options.heightMap || options.enableGGXSpecular || options.clusteredLightingEnabled && !this.shadowPass || options.clearCoatNormalMap;
    this.needsSceneColor = options.useDynamicRefraction;
    this.needsScreenSize = options.useDynamicRefraction;
    this.needsTransforms = options.useDynamicRefraction;
    this.varyings = "";
    this.vshader = null;
    this.frontendDecl = null;
    this.frontendCode = null;
    this.frontendFunc = null;
    this.lightingUv = null;
    this.defines = [];
    this.fshader = null;
  }

  _vsAddBaseCode(code, chunks, options) {
    code += chunks.baseVS;

    if (options.nineSlicedMode === SPRITE_RENDERMODE_SLICED || options.nineSlicedMode === SPRITE_RENDERMODE_TILED) {
      code += chunks.baseNineSlicedVS;
    }

    return code;
  }

  _vsAddTransformCode(code, device, chunks, options) {
    code += this.chunks.transformVS;
    return code;
  }

  _setMapTransform(codes, name, id, uv) {
    const checkId = id + uv * 100;

    if (!codes[3][checkId]) {
      const varName = `texture_${name}MapTransform`;
      codes[0] += `uniform vec3 ${varName}0;\n`;
      codes[0] += `uniform vec3 ${varName}1;\n`;
      codes[1] += `varying vec2 vUV${uv}_${id};\n`;
      codes[2] += `   vUV${uv}_${id} = vec2(dot(vec3(uv${uv}, 1), ${varName}0), dot(vec3(uv${uv}, 1), ${varName}1));\n`;
      codes[3][checkId] = true;
    }

    return codes;
  }

  _fsGetBaseCode() {
    const options = this.options;
    const chunks = this.chunks;
    let result = this.chunks.basePS;

    if (options.nineSlicedMode === SPRITE_RENDERMODE_SLICED) {
      result += chunks.baseNineSlicedPS;
    } else if (options.nineSlicedMode === SPRITE_RENDERMODE_TILED) {
      result += chunks.baseNineSlicedTiledPS;
    }

    return result;
  }

  _fsGetStartCode(code, device, chunks, options) {
    let result = chunks.startPS;

    if (options.nineSlicedMode === SPRITE_RENDERMODE_SLICED) {
      result += chunks.startNineSlicedPS;
    } else if (options.nineSlicedMode === SPRITE_RENDERMODE_TILED) {
      result += chunks.startNineSlicedTiledPS;
    }

    return result;
  }

  _directionalShadowMapProjection(light, shadowCoordArgs, shadowParamArg, lightIndex, coordsFunctionName) {
    let code = "";

    if (light.numCascades > 1) {
      code += `getShadowCascadeMatrix(light${lightIndex}_shadowMatrixPalette, light${lightIndex}_shadowCascadeDistances, light${lightIndex}_shadowCascadeCount);\n`;
      shadowCoordArgs = `(cascadeShadowMat, ${shadowParamArg});\n`;
    }

    code += coordsFunctionName + shadowCoordArgs;
    code += `fadeShadow(light${lightIndex}_shadowCascadeDistances);\n`;
    return code;
  }

  _nonPointShadowMapProjection(device, light, shadowMatArg, shadowParamArg, lightIndex) {
    const shadowCoordArgs = `(${shadowMatArg}, ${shadowParamArg});\n`;

    if (!light._normalOffsetBias || light._isVsm) {
      if (light._type === LIGHTTYPE_SPOT) {
        if (light._isPcf && (device.webgl2 || device.extStandardDerivatives)) {
          return "       getShadowCoordPerspZbuffer" + shadowCoordArgs;
        }

        return "       getShadowCoordPersp" + shadowCoordArgs;
      }

      return this._directionalShadowMapProjection(light, shadowCoordArgs, shadowParamArg, lightIndex, "getShadowCoordOrtho");
    }

    if (light._type === LIGHTTYPE_SPOT) {
      if (light._isPcf && (device.webgl2 || device.extStandardDerivatives)) {
        return "       getShadowCoordPerspZbufferNormalOffset" + shadowCoordArgs;
      }

      return "       getShadowCoordPerspNormalOffset" + shadowCoordArgs;
    }

    return this._directionalShadowMapProjection(light, shadowCoordArgs, shadowParamArg, lightIndex, "getShadowCoordOrthoNormalOffset");
  }

  _getLightSourceShapeString(shape) {
    switch (shape) {
      case LIGHTSHAPE_RECT:
        return 'Rect';

      case LIGHTSHAPE_DISK:
        return 'Disk';

      case LIGHTSHAPE_SPHERE:
        return 'Sphere';

      default:
        return '';
    }
  }

  generateVertexShader(useUv, useUnmodifiedUv, mapTransforms) {
    const device = this.device;
    const options = this.options;
    const chunks = this.chunks;
    let code = '';
    let codeBody = '';
    code = this._vsAddBaseCode(code, chunks, options);
    codeBody += "   vPositionW    = getWorldPosition();\n";

    if (this.options.pass === SHADER_DEPTH) {
      code += 'varying float vDepth;\n';
      code += '#ifndef VIEWMATRIX\n';
      code += '#define VIEWMATRIX\n';
      code += 'uniform mat4 matrix_view;\n';
      code += '#endif\n';
      code += '#ifndef CAMERAPLANES\n';
      code += '#define CAMERAPLANES\n';
      code += 'uniform vec4 camera_params;\n\n';
      code += '#endif\n';
      codeBody += "    vDepth = -(matrix_view * vec4(vPositionW,1.0)).z * camera_params.x;\n";
    }

    if (this.options.useInstancing) {
      this.attributes.instance_line1 = SEMANTIC_ATTR12;
      this.attributes.instance_line2 = SEMANTIC_ATTR13;
      this.attributes.instance_line3 = SEMANTIC_ATTR14;
      this.attributes.instance_line4 = SEMANTIC_ATTR15;
      code += chunks.instancingVS;
    }

    if (this.needsNormal) {
      this.attributes.vertex_normal = SEMANTIC_NORMAL;
      codeBody += "   vNormalW = getNormal();\n";

      if (options.reflectionSource === 'sphereMap' && device.fragmentUniformsCount <= 16) {
        code += chunks.viewNormalVS;
        codeBody += "   vNormalV    = getViewNormal();\n";
      }

      if (options.hasTangents && (options.heightMap || options.normalMap || options.enableGGXSpecular)) {
        this.attributes.vertex_tangent = SEMANTIC_TANGENT;
        code += chunks.tangentBinormalVS;
        codeBody += "   vTangentW   = getTangent();\n";
        codeBody += "   vBinormalW  = getBinormal();\n";
      } else if (options.enableGGXSpecular) {
        code += chunks.tangentBinormalVS;
        codeBody += "   vObjectSpaceUpW  = getObjectSpaceUp();\n";
      }
    }

    const maxUvSets = 2;

    for (let i = 0; i < maxUvSets; i++) {
      if (useUv[i]) {
        this.attributes["vertex_texCoord" + i] = "TEXCOORD" + i;
        code += chunks["uv" + i + "VS"];
        codeBody += "   vec2 uv" + i + " = getUv" + i + "();\n";
      }

      if (useUnmodifiedUv[i]) {
        codeBody += "   vUv" + i + " = uv" + i + ";\n";
      }
    }

    const codes = [code, this.varyings, codeBody, []];
    mapTransforms.forEach(mapTransform => {
      this._setMapTransform(codes, mapTransform.name, mapTransform.id, mapTransform.uv);
    });
    code = codes[0];
    this.varyings = codes[1];
    codeBody = codes[2];

    if (options.vertexColors) {
      this.attributes.vertex_color = SEMANTIC_COLOR;
      codeBody += "   vVertexColor = vertex_color;\n";
    }

    if (options.msdf && options.msdfTextAttribute) {
      this.attributes.vertex_outlineParameters = SEMANTIC_ATTR8;
      this.attributes.vertex_shadowParameters = SEMANTIC_ATTR9;
      codeBody += "    unpackMsdfParams();\n";
      code += chunks.msdfVS;
    }

    if (options.useMorphPosition || options.useMorphNormal) {
      if (options.useMorphTextureBased) {
        code += "#define MORPHING_TEXTURE_BASED\n";

        if (options.useMorphPosition) {
          code += "#define MORPHING_TEXTURE_BASED_POSITION\n";
        }

        if (options.useMorphNormal) {
          code += "#define MORPHING_TEXTURE_BASED_NORMAL\n";
        }

        this.attributes.morph_vertex_id = SEMANTIC_ATTR15;
        code += "attribute float morph_vertex_id;\n";
      } else {
        code += "#define MORPHING\n";

        if (options.useMorphPosition) {
          this.attributes.morph_pos0 = SEMANTIC_ATTR8;
          this.attributes.morph_pos1 = SEMANTIC_ATTR9;
          this.attributes.morph_pos2 = SEMANTIC_ATTR10;
          this.attributes.morph_pos3 = SEMANTIC_ATTR11;
          code += "#define MORPHING_POS03\n";
          code += "attribute vec3 morph_pos0;\n";
          code += "attribute vec3 morph_pos1;\n";
          code += "attribute vec3 morph_pos2;\n";
          code += "attribute vec3 morph_pos3;\n";
        } else if (options.useMorphNormal) {
          this.attributes.morph_nrm0 = SEMANTIC_ATTR8;
          this.attributes.morph_nrm1 = SEMANTIC_ATTR9;
          this.attributes.morph_nrm2 = SEMANTIC_ATTR10;
          this.attributes.morph_nrm3 = SEMANTIC_ATTR11;
          code += "#define MORPHING_NRM03\n";
          code += "attribute vec3 morph_nrm0;\n";
          code += "attribute vec3 morph_nrm1;\n";
          code += "attribute vec3 morph_nrm2;\n";
          code += "attribute vec3 morph_nrm3;\n";
        }

        if (!options.useMorphNormal) {
          this.attributes.morph_pos4 = SEMANTIC_ATTR12;
          this.attributes.morph_pos5 = SEMANTIC_ATTR13;
          this.attributes.morph_pos6 = SEMANTIC_ATTR14;
          this.attributes.morph_pos7 = SEMANTIC_ATTR15;
          code += "#define MORPHING_POS47\n";
          code += "attribute vec3 morph_pos4;\n";
          code += "attribute vec3 morph_pos5;\n";
          code += "attribute vec3 morph_pos6;\n";
          code += "attribute vec3 morph_pos7;\n";
        } else {
          this.attributes.morph_nrm4 = SEMANTIC_ATTR12;
          this.attributes.morph_nrm5 = SEMANTIC_ATTR13;
          this.attributes.morph_nrm6 = SEMANTIC_ATTR14;
          this.attributes.morph_nrm7 = SEMANTIC_ATTR15;
          code += "#define MORPHING_NRM47\n";
          code += "attribute vec3 morph_nrm4;\n";
          code += "attribute vec3 morph_nrm5;\n";
          code += "attribute vec3 morph_nrm6;\n";
          code += "attribute vec3 morph_nrm7;\n";
        }
      }
    }

    if (options.skin) {
      this.attributes.vertex_boneWeights = SEMANTIC_BLENDWEIGHT;
      this.attributes.vertex_boneIndices = SEMANTIC_BLENDINDICES;
      code += skinCode(device, chunks);
      code += "#define SKIN\n";
    } else if (options.useInstancing) {
      code += "#define INSTANCING\n";
    }

    if (options.screenSpace) {
      code += "#define SCREENSPACE\n";
    }

    if (options.pixelSnap) {
      code += "#define PIXELSNAP\n";
    }

    code = this._vsAddTransformCode(code, device, chunks, options);

    if (this.needsNormal) {
      code += chunks.normalVS;
    }

    code += "\n";
    code += chunks.startVS;
    code += codeBody;
    code += chunks.endVS;
    code += "}";
    Object.keys(builtinVaryings).forEach(v => {
      if (code.indexOf(v) >= 0) {
        this.varyings += `varying ${builtinVaryings[v]} ${v};\n`;
      }
    });
    const startCode = vertexIntro(device, 'LitShader', this.options.pass, chunks.extensionVS);
    this.vshader = startCode + this.varyings + code;
  }

  _fsGetBeginCode() {
    const device = this.device;
    const chunks = this.chunks;
    const precision = this.options.forceFragmentPrecision;
    let code = fragmentIntro(device, 'LitShader', this.options.pass, chunks.extensionPS, precision);

    for (let i = 0; i < this.defines.length; i++) {
      code += `#define ${this.defines[i]}\n`;
    }

    return code;
  }

  _fsGetPickPassCode() {
    let code = this._fsGetBeginCode();

    code += "uniform vec4 uColor;\n";
    code += this.varyings;
    code += this.frontendDecl;
    code += this.frontendCode;
    code += begin();
    code += this.frontendFunc;
    code += "    gl_FragColor = uColor;\n";
    code += end();
    return code;
  }

  _fsGetDepthPassCode() {
    const chunks = this.chunks;

    let code = this._fsGetBeginCode();

    code += 'varying float vDepth;\n';
    code += this.varyings;
    code += chunks.packDepthPS;
    code += this.frontendDecl;
    code += this.frontendCode;
    code += begin();
    code += this.frontendFunc;
    code += "    gl_FragColor = packFloat(vDepth);\n";
    code += end();
    return code;
  }

  _fsGetShadowPassCode() {
    const device = this.device;
    const options = this.options;
    const chunks = this.chunks;
    const varyings = this.varyings;
    const lightType = ShaderPass.toLightType(options.pass);
    const shadowType = ShaderPass.toShadowType(options.pass);

    let code = this._fsGetBeginCode();

    if (device.extStandardDerivatives && !device.webgl2) {
      code += 'uniform vec2 polygonOffset;\n';
    }

    if (shadowType === SHADOW_VSM32) {
      if (device.textureFloatHighPrecision) {
        code += '#define VSM_EXPONENT 15.0\n\n';
      } else {
        code += '#define VSM_EXPONENT 5.54\n\n';
      }
    } else if (shadowType === SHADOW_VSM16) {
      code += '#define VSM_EXPONENT 5.54\n\n';
    }

    if (lightType !== LIGHTTYPE_DIRECTIONAL) {
      code += 'uniform vec3 view_position;\n';
      code += 'uniform float light_radius;\n';
    }

    code += varyings;
    code += this.frontendDecl;
    code += this.frontendCode;

    if (shadowType === SHADOW_PCF3 && (!device.webgl2 || lightType === LIGHTTYPE_OMNI)) {
      code += chunks.packDepthPS;
    } else if (shadowType === SHADOW_VSM8) {
      code += "vec2 encodeFloatRG( float v ) {\n";
      code += "    vec2 enc = vec2(1.0, 255.0) * v;\n";
      code += "    enc = fract(enc);\n";
      code += "    enc -= enc.yy * vec2(1.0/255.0, 1.0/255.0);\n";
      code += "    return enc;\n";
      code += "}\n\n";
    }

    code += begin();
    code += this.frontendFunc;
    const isVsm = shadowType === SHADOW_VSM8 || shadowType === SHADOW_VSM16 || shadowType === SHADOW_VSM32;
    const applySlopeScaleBias = !device.webgl2 && device.extStandardDerivatives;

    if (lightType === LIGHTTYPE_OMNI || isVsm && lightType !== LIGHTTYPE_DIRECTIONAL) {
      code += "    float depth = min(distance(view_position, vPositionW) / light_radius, 0.99999);\n";
    } else {
      code += "    float depth = gl_FragCoord.z;\n";
    }

    if (applySlopeScaleBias) {
      code += "    float minValue = 2.3374370500153186e-10; //(1.0 / 255.0) / (256.0 * 256.0 * 256.0);\n";
      code += "    depth += polygonOffset.x * max(abs(dFdx(depth)), abs(dFdy(depth))) + minValue * polygonOffset.y;\n";
    }

    if (shadowType === SHADOW_PCF3 && (!device.webgl2 || lightType === LIGHTTYPE_OMNI && !options.clusteredLightingEnabled)) {
      code += "    gl_FragColor = packFloat(depth);\n";
    } else if (shadowType === SHADOW_PCF3 || shadowType === SHADOW_PCF5) {
      code += "    gl_FragColor = vec4(1.0);\n";

      if (options.clusteredLightingEnabled && lightType === LIGHTTYPE_OMNI && device.webgl2) {
        code += "    gl_FragDepth = depth;\n";
      }
    } else if (shadowType === SHADOW_VSM8) {
      code += "    gl_FragColor = vec4(encodeFloatRG(depth), encodeFloatRG(depth*depth));\n";
    } else {
      code += chunks.storeEVSMPS;
    }

    code += end();
    return code;
  }

  _fsGetLitPassCode() {
    const device = this.device;
    const options = this.options;
    const chunks = this.chunks;
    let code = "";

    if (options.opacityFadesSpecular === false) {
      code += 'uniform float material_alphaFade;\n';
    }

    if (options.useSpecular) {
      this.defines.push("LIT_SPECULAR");

      if (this.reflections) {
        this.defines.push("LIT_REFLECTIONS");
      }

      if (options.clearCoat) {
        this.defines.push("LIT_CLEARCOAT");
      }

      if (options.fresnelModel > 0) {
        this.defines.push("LIT_SPECULAR_FRESNEL");
      }

      if (options.conserveEnergy) {
        this.defines.push("LIT_CONSERVE_ENERGY");
      }

      if (options.sheen) {
        this.defines.push("LIT_SHEEN");
      }

      if (options.iridescence) {
        this.defines.push("LIT_IRIDESCENCE");
      }
    }

    const shadowTypeUsed = [];
    let numShadowLights = 0;
    let shadowedDirectionalLightUsed = false;
    let useVsm = false;
    let usePerspZbufferShadow = false;
    let hasAreaLights = options.lights.some(function (light) {
      return light._shape && light._shape !== LIGHTSHAPE_PUNCTUAL;
    });

    if (options.clusteredLightingEnabled && options.clusteredLightingAreaLightsEnabled) {
      hasAreaLights = true;
    }

    let areaLutsPrecision = 'highp';

    if (device.areaLightLutFormat === PIXELFORMAT_R8_G8_B8_A8) {
      code += "#define AREA_R8_G8_B8_A8_LUTS\n";
      areaLutsPrecision = 'lowp';
    }

    if (hasAreaLights || options.clusteredLightingEnabled) {
      code += "#define AREA_LIGHTS\n";
      code += `uniform ${areaLutsPrecision} sampler2D areaLightsLutTex1;\n`;
      code += `uniform ${areaLutsPrecision} sampler2D areaLightsLutTex2;\n`;
    }

    for (let i = 0; i < options.lights.length; i++) {
      const light = options.lights[i];
      const lightType = light._type;
      if (options.clusteredLightingEnabled && lightType !== LIGHTTYPE_DIRECTIONAL) continue;
      const lightShape = hasAreaLights && light._shape ? light._shape : LIGHTSHAPE_PUNCTUAL;
      code += "uniform vec3 light" + i + "_color;\n";

      if (lightType === LIGHTTYPE_DIRECTIONAL) {
        code += "uniform vec3 light" + i + "_direction;\n";
      } else {
        code += "uniform vec3 light" + i + "_position;\n";
        code += "uniform float light" + i + "_radius;\n";

        if (lightType === LIGHTTYPE_SPOT) {
          code += "uniform vec3 light" + i + "_direction;\n";
          code += "uniform float light" + i + "_innerConeAngle;\n";
          code += "uniform float light" + i + "_outerConeAngle;\n";
        }
      }

      if (lightShape !== LIGHTSHAPE_PUNCTUAL) {
        if (lightType === LIGHTTYPE_DIRECTIONAL) {
          code += "uniform vec3 light" + i + "_position;\n";
        }

        code += "uniform vec3 light" + i + "_halfWidth;\n";
        code += "uniform vec3 light" + i + "_halfHeight;\n";
      }

      if (light.castShadows && !options.noShadow) {
        code += "uniform mat4 light" + i + "_shadowMatrix;\n";
        code += "uniform float light" + i + "_shadowIntensity;\n";

        if (lightType === LIGHTTYPE_DIRECTIONAL) {
          code += "uniform mat4 light" + i + "_shadowMatrixPalette[4];\n";
          code += "uniform float light" + i + "_shadowCascadeDistances[4];\n";
          code += "uniform float light" + i + "_shadowCascadeCount;\n";
        }

        if (lightType !== LIGHTTYPE_DIRECTIONAL) {
          code += "uniform vec4 light" + i + "_shadowParams;\n";
        } else {
          shadowedDirectionalLightUsed = true;
          code += "uniform vec3 light" + i + "_shadowParams;\n";
        }

        if (lightType === LIGHTTYPE_OMNI) {
          code += "uniform samplerCube light" + i + "_shadowMap;\n";
        } else {
          if (light._isPcf && device.webgl2) {
            code += "uniform sampler2DShadow light" + i + "_shadowMap;\n";
          } else {
            code += "uniform sampler2D light" + i + "_shadowMap;\n";
          }
        }

        numShadowLights++;
        shadowTypeUsed[light._shadowType] = true;
        if (light._isVsm) useVsm = true;
        if (light._isPcf && (device.webgl2 || device.extStandardDerivatives) && lightType === LIGHTTYPE_SPOT) usePerspZbufferShadow = true;
      }

      if (light._cookie) {
        if (light._cookie._cubemap) {
          if (lightType === LIGHTTYPE_OMNI) {
            code += "uniform samplerCube light" + i + "_cookie;\n";
            code += "uniform float light" + i + "_cookieIntensity;\n";
            if (!light.castShadows || options.noShadow) code += "uniform mat4 light" + i + "_shadowMatrix;\n";
          }
        } else {
          if (lightType === LIGHTTYPE_SPOT) {
            code += "uniform sampler2D light" + i + "_cookie;\n";
            code += "uniform float light" + i + "_cookieIntensity;\n";
            if (!light.castShadows || options.noShadow) code += "uniform mat4 light" + i + "_shadowMatrix;\n";

            if (light._cookieTransform) {
              code += "uniform vec4 light" + i + "_cookieMatrix;\n";
              code += "uniform vec2 light" + i + "_cookieOffset;\n";
            }
          }
        }
      }
    }

    code += "\n";
    const hasTBN = this.needsNormal && (options.normalMap || options.clearCoatNormalMap || options.enableGGXSpecular && !options.heightMap);

    if (hasTBN) {
      if (options.hasTangents) {
        code += options.fastTbn ? chunks.TBNfastPS : chunks.TBNPS;
      } else {
        if (device.extStandardDerivatives && (options.normalMap || options.clearCoatNormalMap)) {
          code += chunks.TBNderivativePS.replace(/\$UV/g, this.lightingUv);
        } else {
          code += chunks.TBNObjectSpacePS;
        }
      }
    }

    code += chunks.sphericalPS;
    code += chunks.decodePS;
    code += gammaCode(options.gamma, chunks);
    code += tonemapCode(options.toneMap, chunks);
    code += fogCode(options.fog, chunks);
    code += this.frontendCode;

    if (options.useCubeMapRotation) {
      code += "#define CUBEMAP_ROTATION\n";
    }

    if (this.needsNormal) {
      code += chunks.cubeMapRotatePS;
      code += options.cubeMapProjection > 0 ? chunks.cubeMapProjectBoxPS : chunks.cubeMapProjectNonePS;
      code += options.skyboxIntensity ? chunks.envMultiplyPS : chunks.envConstPS;
    }

    if (this.lighting && options.useSpecular || this.reflections) {
      if (options.useMetalness) {
        code += chunks.metalnessModulatePS;
      }

      if (options.fresnelModel === FRESNEL_SCHLICK) {
        code += chunks.fresnelSchlickPS;
      }

      if (options.iridescence) {
        code += chunks.iridescenceDiffractionPS;
      }
    }

    const useAo = options.aoMap || options.aoVertexColor;

    if (useAo) {
      code += chunks.aoDiffuseOccPS;

      switch (options.occludeSpecular) {
        case SPECOCC_AO:
          code += options.occludeSpecularFloat ? chunks.aoSpecOccSimplePS : chunks.aoSpecOccConstSimplePS;
          break;

        case SPECOCC_GLOSSDEPENDENT:
          code += options.occludeSpecularFloat ? chunks.aoSpecOccPS : chunks.aoSpecOccConstPS;
          break;
      }
    }

    if (options.reflectionSource === 'envAtlasHQ') {
      code += options.fixSeams ? chunks.fixCubemapSeamsStretchPS : chunks.fixCubemapSeamsNonePS;
      code += chunks.envAtlasPS;
      code += chunks.reflectionEnvHQPS.replace(/\$DECODE/g, ChunkUtils.decodeFunc(options.reflectionEncoding));
    } else if (options.reflectionSource === 'envAtlas') {
      code += chunks.envAtlasPS;
      code += chunks.reflectionEnvPS.replace(/\$DECODE/g, ChunkUtils.decodeFunc(options.reflectionEncoding));
    } else if (options.reflectionSource === 'cubeMap') {
      code += options.fixSeams ? chunks.fixCubemapSeamsStretchPS : chunks.fixCubemapSeamsNonePS;
      code += chunks.reflectionCubePS.replace(/\$DECODE/g, ChunkUtils.decodeFunc(options.reflectionEncoding));
    } else if (options.reflectionSource === 'sphereMap') {
      const scode = device.fragmentUniformsCount > 16 ? chunks.reflectionSpherePS : chunks.reflectionSphereLowPS;
      code += scode.replace(/\$DECODE/g, ChunkUtils.decodeFunc(options.reflectionEncoding));
    }

    if (this.reflections) {
      if (options.clearCoat) {
        code += chunks.reflectionCCPS;
      }

      if (options.sheen) {
        code += chunks.reflectionSheenPS;
      }
    }

    if (options.refraction) {
      if (options.useDynamicRefraction) {
        code += chunks.refractionDynamicPS;
      } else if (this.reflections) {
        code += chunks.refractionCubePS;
      }
    }

    if (options.sheen) {
      code += chunks.lightSheenPS;
    }

    if (options.clusteredLightingEnabled) {
      code += chunks.clusteredLightUtilsPS;
      if (options.clusteredLightingCookiesEnabled) code += chunks.clusteredLightCookiesPS;

      if (options.clusteredLightingShadowsEnabled && !options.noShadow) {
        shadowTypeUsed[SHADOW_PCF3] = true;
        shadowTypeUsed[SHADOW_PCF5] = true;
      }

      usePerspZbufferShadow = true;
    }

    if (numShadowLights > 0 || options.clusteredLightingEnabled) {
      if (shadowedDirectionalLightUsed) {
        code += chunks.shadowCascadesPS;
      }

      if (shadowTypeUsed[SHADOW_PCF3]) {
        code += chunks.shadowStandardPS;
      }

      if (shadowTypeUsed[SHADOW_PCF5] && device.webgl2) {
        code += chunks.shadowStandardGL2PS;
      }

      if (useVsm) {
        code += chunks.shadowVSM_commonPS;

        if (shadowTypeUsed[SHADOW_VSM8]) {
          code += chunks.shadowVSM8PS;
        }

        if (shadowTypeUsed[SHADOW_VSM16]) {
          code += device.extTextureHalfFloatLinear ? chunks.shadowEVSMPS.replace(/\$/g, "16") : chunks.shadowEVSMnPS.replace(/\$/g, "16");
        }

        if (shadowTypeUsed[SHADOW_VSM32]) {
          code += device.extTextureFloatLinear ? chunks.shadowEVSMPS.replace(/\$/g, "32") : chunks.shadowEVSMnPS.replace(/\$/g, "32");
        }
      }

      if (!(device.webgl2 || device.extStandardDerivatives)) {
        code += chunks.biasConstPS;
      }

      code += chunks.shadowCoordPS + chunks.shadowCommonPS;
      if (usePerspZbufferShadow) code += chunks.shadowCoordPerspZbufferPS;
    }

    if (options.enableGGXSpecular) code += "uniform float material_anisotropy;\n";

    if (this.lighting) {
      code += chunks.lightDiffuseLambertPS;
      if (hasAreaLights || options.clusteredLightingEnabled) code += chunks.ltc;
    }

    code += '\n';
    let useOldAmbient = false;

    if (options.useSpecular) {
      if (this.lighting) {
        code += options.shadingModel === SPECULAR_PHONG ? chunks.lightSpecularPhongPS : options.enableGGXSpecular ? chunks.lightSpecularAnisoGGXPS : chunks.lightSpecularBlinnPS;
      }

      if (!options.fresnelModel && !this.reflections && !options.diffuseMap) {
        code += "    uniform vec3 material_ambient;\n";
        code += "#define LIT_OLD_AMBIENT";
        useOldAmbient = true;
      }
    }

    code += chunks.combinePS;

    if (options.lightMap || options.lightVertexColor) {
      code += options.useSpecular && options.dirLightMap ? chunks.lightmapDirAddPS : chunks.lightmapAddPS;
    }

    const addAmbient = !options.lightMap && !options.lightVertexColor || options.lightMapWithoutAmbient;

    if (addAmbient) {
      if (options.ambientSource === 'ambientSH') {
        code += chunks.ambientSHPS;
      } else if (options.ambientSource === 'envAtlas') {
        if (options.reflectionSource !== 'envAtlas' && options.reflectionSource !== 'envAtlasHQ') {
          code += chunks.envAtlasPS;
        }

        code += chunks.ambientEnvPS.replace(/\$DECODE/g, ChunkUtils.decodeFunc(options.ambientEncoding));
      } else {
        code += chunks.ambientConstantPS;
      }
    }

    if (options.ambientTint && !useOldAmbient) {
      code += "uniform vec3 material_ambient;\n";
    }

    if (options.msdf) {
      if (!options.msdfTextAttribute) {
        code += "\n#define UNIFORM_TEXT_PARAMETERS";
      }

      code += chunks.msdfPS;
    }

    if (this.needsNormal) {
      code += chunks.viewDirPS;

      if (options.useSpecular) {
        code += options.enableGGXSpecular ? chunks.reflDirAnisoPS : chunks.reflDirPS;
      }
    }

    let hasPointLights = false;
    let usesLinearFalloff = false;
    let usesInvSquaredFalloff = false;
    let usesSpot = false;
    let usesCookie = false;
    let usesCookieNow;

    if (options.clusteredLightingEnabled && this.lighting) {
      usesSpot = true;
      hasPointLights = true;
      usesLinearFalloff = true;
      usesCookie = true;
      code += chunks.floatUnpackingPS;
      if (options.lightMaskDynamic) code += "\n#define CLUSTER_MESH_DYNAMIC_LIGHTS";
      if (options.clusteredLightingCookiesEnabled) code += "\n#define CLUSTER_COOKIES";

      if (options.clusteredLightingShadowsEnabled && !options.noShadow) {
        code += "\n#define CLUSTER_SHADOWS";
        code += "\n#define CLUSTER_SHADOW_TYPE_" + shadowTypeToString[options.clusteredLightingShadowType];
      }

      if (options.clusteredLightingAreaLightsEnabled) code += "\n#define CLUSTER_AREALIGHTS";
      code += LightsBuffer.shaderDefines;

      if (options.clusteredLightingShadowsEnabled && !options.noShadow) {
        code += chunks.clusteredLightShadowsPS;
      }

      code += chunks.clusteredLightPS;
    }

    if (options.twoSidedLighting) code += "uniform float twoSidedLightingNegScaleFactor;\n";
    code += this._fsGetStartCode(code, device, chunks, options);

    if (this.needsNormal) {
      if (options.twoSidedLighting) {
        code += "    dVertexNormalW = normalize(gl_FrontFacing ? vNormalW * twoSidedLightingNegScaleFactor : -vNormalW * twoSidedLightingNegScaleFactor);\n";
      } else {
        code += "    dVertexNormalW = normalize(vNormalW);\n";
      }

      if ((options.heightMap || options.normalMap) && options.hasTangents) {
        if (options.twoSidedLighting) {
          code += "    dTangentW = gl_FrontFacing ? vTangentW * twoSidedLightingNegScaleFactor : -vTangentW * twoSidedLightingNegScaleFactor;\n";
          code += "    dBinormalW = gl_FrontFacing ? vBinormalW * twoSidedLightingNegScaleFactor : -vBinormalW * twoSidedLightingNegScaleFactor;\n";
        } else {
          code += "    dTangentW = vTangentW;\n";
          code += "    dBinormalW = vBinormalW;\n";
        }
      }

      code += "    getViewDir();\n";

      if (hasTBN) {
        code += "    getTBN();\n";
      }
    }

    code += this.frontendFunc;

    if (this.needsNormal) {
      if (options.useSpecular) {
        code += "    getReflDir();\n";
      }

      if (options.clearCoat) {
        code += "    ccReflDirW = normalize(-reflect(dViewDirW, ccNormalW));\n";
      }
    }

    if (this.lighting && options.useSpecular || this.reflections) {
      if (options.useMetalness) {
        code += "    getMetalnessModulate();\n";
      }

      if (options.iridescence) {
        code += "    getIridescence(saturate(dot(dViewDirW, dNormalW)));\n";
      }
    }

    if (addAmbient) {
      code += "    addAmbient();\n";

      if (options.separateAmbient) {
        code += `
                    vec3 dAmbientLight = dDiffuseLight;
                    dDiffuseLight = vec3(0);
                `;
      }
    }

    if (options.ambientTint && !useOldAmbient) {
      code += "    dDiffuseLight *= material_ambient;\n";
    }

    if (useAo && !options.occludeDirect) {
      code += "    occludeDiffuse();\n";
    }

    if (options.lightMap || options.lightVertexColor) {
      code += "    addLightMap();\n";
    }

    if (this.lighting || this.reflections) {
      if (this.reflections) {
        if (options.clearCoat) {
          code += "    addReflectionCC();\n";

          if (options.fresnelModel > 0) {
            code += "    ccFresnel = getFresnelCC(dot(dViewDirW, ccNormalW));\n";
            code += "    ccReflection.rgb *= ccFresnel;\n";
          } else {
            code += "    ccFresnel = 0.0;\n";
            code += "    ccReflection.rgb *= ccSpecularity;\n";
          }
        }

        if (options.useSpecularityFactor) {
          code += "    ccReflection.rgb *= dSpecularityFactor;\n";
        }

        if (options.sheen) {
          code += "    addReflectionSheen();\n";
          code += "    sReflection.rgb *= sSpecularity;\n";
        }

        code += "    addReflection();\n";

        if (options.fresnelModel > 0) {
          code += "    dReflection.rgb *= getFresnel(dot(dViewDirW, dNormalW), dSpecularity);\n";
        } else {
          code += "    dReflection.rgb *= dSpecularity;\n";
        }

        if (options.useSpecularityFactor) {
          code += "    dReflection.rgb *= dSpecularityFactor;\n";
        }
      }

      if (hasAreaLights) {
        code += "    dSpecularLight *= dSpecularity;\n";

        if (options.useSpecular) {
          code += "    calcLTCLightValues();\n";
        }
      }

      for (let i = 0; i < options.lights.length; i++) {
        const light = options.lights[i];
        const lightType = light._type;

        if (options.clusteredLightingEnabled && lightType !== LIGHTTYPE_DIRECTIONAL) {
          continue;
        }

        usesCookieNow = false;
        const lightShape = hasAreaLights && light._shape ? light.shape : LIGHTSHAPE_PUNCTUAL;
        const shapeString = hasAreaLights && light._shape ? this._getLightSourceShapeString(lightShape) : '';

        if (lightShape !== LIGHTSHAPE_PUNCTUAL) {
          code += "    calc" + shapeString + "LightValues(light" + i + "_position, light" + i + "_halfWidth, light" + i + "_halfHeight);\n";
        }

        if (lightType === LIGHTTYPE_DIRECTIONAL) {
          code += "    dLightDirNormW = light" + i + "_direction;\n";
          code += "    dAtten = 1.0;\n";
        } else {
          if (light._cookie) {
            if (lightType === LIGHTTYPE_SPOT && !light._cookie._cubemap) {
              usesCookie = true;
              usesCookieNow = true;
            } else if (lightType === LIGHTTYPE_OMNI && light._cookie._cubemap) {
              usesCookie = true;
              usesCookieNow = true;
            }
          }

          code += "    getLightDirPoint(light" + i + "_position);\n";
          hasPointLights = true;

          if (usesCookieNow) {
            if (lightType === LIGHTTYPE_SPOT) {
              code += "    dAtten3 = getCookie2D" + (light._cookieFalloff ? "" : "Clip") + (light._cookieTransform ? "Xform" : "") + "(light" + i + "_cookie, light" + i + "_shadowMatrix, light" + i + "_cookieIntensity" + (light._cookieTransform ? ", light" + i + "_cookieMatrix, light" + i + "_cookieOffset" : "") + ")." + light._cookieChannel + ";\n";
            } else {
              code += "    dAtten3 = getCookieCube(light" + i + "_cookie, light" + i + "_shadowMatrix, light" + i + "_cookieIntensity)." + light._cookieChannel + ";\n";
            }
          }

          if (lightShape === LIGHTSHAPE_PUNCTUAL) {
            if (light._falloffMode === LIGHTFALLOFF_LINEAR) {
              code += "    dAtten = getFalloffLinear(light" + i + "_radius);\n";
              usesLinearFalloff = true;
            } else {
              code += "    dAtten = getFalloffInvSquared(light" + i + "_radius);\n";
              usesInvSquaredFalloff = true;
            }
          } else {
            code += "    dAtten = getFalloffWindow(light" + i + "_radius);\n";
            usesInvSquaredFalloff = true;
          }

          code += "    if (dAtten > 0.00001) {\n";

          if (lightType === LIGHTTYPE_SPOT) {
            if (!(usesCookieNow && !light._cookieFalloff)) {
              code += "    dAtten *= getSpotEffect(light" + i + "_direction, light" + i + "_innerConeAngle, light" + i + "_outerConeAngle);\n";
              usesSpot = true;
            }
          }
        }

        if (lightShape !== LIGHTSHAPE_PUNCTUAL) {
          if (lightType === LIGHTTYPE_DIRECTIONAL) {
            code += "    dAttenD = getLightDiffuse();\n";
          } else {
            code += "    dAttenD = get" + shapeString + "LightDiffuse() * 16.0;\n";
          }
        } else {
          code += "    dAtten *= getLightDiffuse();\n";
        }

        if (light.castShadows && !options.noShadow) {
          let shadowReadMode = null;
          let evsmExp;

          if (light._shadowType === SHADOW_VSM8) {
            shadowReadMode = "VSM8";
            evsmExp = "0.0";
          } else if (light._shadowType === SHADOW_VSM16) {
            shadowReadMode = "VSM16";
            evsmExp = "5.54";
          } else if (light._shadowType === SHADOW_VSM32) {
            shadowReadMode = "VSM32";

            if (device.textureFloatHighPrecision) {
              evsmExp = "15.0";
            } else {
              evsmExp = "5.54";
            }
          } else if (light._shadowType === SHADOW_PCF5) {
            shadowReadMode = "PCF5x5";
          } else {
            shadowReadMode = "PCF3x3";
          }

          if (shadowReadMode !== null) {
            if (lightType === LIGHTTYPE_OMNI) {
              const shadowCoordArgs = "(light" + i + "_shadowMap, light" + i + "_shadowParams);\n";

              if (light._normalOffsetBias) {
                code += "    normalOffsetPointShadow(light" + i + "_shadowParams);\n";
              }

              code += `    float shadow${i} = getShadowPoint${shadowReadMode}${shadowCoordArgs}`;
              code += `    dAtten *= mix(1.0, shadow${i}, light${i}_shadowIntensity);\n`;
            } else {
              const shadowMatArg = `light${i}_shadowMatrix`;
              const shadowParamArg = `light${i}_shadowParams`;
              code += this._nonPointShadowMapProjection(device, options.lights[i], shadowMatArg, shadowParamArg, i);
              if (lightType === LIGHTTYPE_SPOT) shadowReadMode = "Spot" + shadowReadMode;
              code += `    float shadow${i} = getShadow${shadowReadMode}(light${i}_shadowMap, light${i}_shadowParams${light._isVsm ? ", " + evsmExp : ""});\n`;
              code += `    dAtten *= mix(1.0, shadow${i}, light${i}_shadowIntensity);\n`;
            }
          }
        }

        if (lightShape !== LIGHTSHAPE_PUNCTUAL) {
          if (options.conserveEnergy && options.useSpecular) {
            code += "    dDiffuseLight += mix((dAttenD * dAtten) * light" + i + "_color" + (usesCookieNow ? " * dAtten3" : "") + ", vec3(0), dLTCSpecFres);\n";
          } else {
            code += "    dDiffuseLight += (dAttenD * dAtten) * light" + i + "_color" + (usesCookieNow ? " * dAtten3" : "") + ";\n";
          }
        } else {
          if (hasAreaLights && options.conserveEnergy && options.useSpecular) {
            code += "    dDiffuseLight += mix(dAtten * light" + i + "_color" + (usesCookieNow ? " * dAtten3" : "") + ", vec3(0), dSpecularity);\n";
          } else {
            code += "    dDiffuseLight += dAtten * light" + i + "_color" + (usesCookieNow ? " * dAtten3" : "") + ";\n";
          }
        }

        if (options.useSpecular) {
          code += "    dHalfDirW = normalize(-dLightDirNormW + dViewDirW);\n";
        }

        if (lightShape !== LIGHTSHAPE_PUNCTUAL) {
          if (options.clearCoat) code += "    ccSpecularLight += ccLTCSpecFres * get" + shapeString + "LightSpecularCC() * dAtten * light" + i + "_color" + (usesCookieNow ? " * dAtten3" : "") + ";\n";
          if (options.useSpecular) code += "    dSpecularLight += dLTCSpecFres * get" + shapeString + "LightSpecular() * dAtten * light" + i + "_color" + (usesCookieNow ? " * dAtten3" : "") + ";\n";
        } else {
          var calcFresnel = false;

          if (lightType === LIGHTTYPE_DIRECTIONAL && options.fresnelModel > 0) {
            calcFresnel = true;
          }

          if (options.clearCoat) {
            code += "    ccSpecularLight += getLightSpecularCC(dHalfDirW) * dAtten * light" + i + "_color";
            code += usesCookieNow ? " * dAtten3" : "";
            code += calcFresnel ? " * getFresnel(dot(dViewDirW, dHalfDirW), vec3(ccSpecularity))" : " * vec3(ccSpecularity)";
            code += ";\n";
          }

          if (options.sheen) {
            code += "    sSpecularLight += getLightSpecularSheen(dHalfDirW) * dAtten * light" + i + "_color * sSpecularity";
            code += usesCookieNow ? " * dAtten3" : "";
            code += ";\n";
          }

          if (options.useSpecular) {
            code += "    dSpecularLight += getLightSpecular(dHalfDirW) * dAtten * light" + i + "_color";
            code += usesCookieNow ? " * dAtten3" : "";
            code += calcFresnel ? " * getFresnel(dot(dViewDirW, dHalfDirW), dSpecularity)" : " * dSpecularity";
            code += ";\n";
          }
        }

        if (lightType !== LIGHTTYPE_DIRECTIONAL) {
          code += "    }\n";
        }

        code += "\n";
      }

      if (options.clusteredLightingEnabled && this.lighting) {
        usesLinearFalloff = true;
        usesInvSquaredFalloff = true;
        hasPointLights = true;
        code += "    addClusteredLights();\n";
      }

      if (hasAreaLights) {
        if (options.clearCoat) {
          code += "    ccSpecularity = 1.0;\n";
        }

        if (options.useSpecular) {
          code += "    dSpecularity = vec3(1);\n";
        }
      }

      if (options.refraction) {
        code += "    addRefraction();\n";
      }
    }

    code += "\n";

    if (useAo) {
      if (options.occludeDirect) {
        code += "    occludeDiffuse();\n";
      }

      if (options.occludeSpecular === SPECOCC_AO || options.occludeSpecular === SPECOCC_GLOSSDEPENDENT) {
        code += "    occludeSpecular();\n";
      }
    }

    if (options.useSpecularityFactor) {
      code += "    dSpecularLight *= dSpecularityFactor;\n";
    }

    if (options.opacityFadesSpecular === false) {
      if (options.blendType === BLEND_NORMAL || options.blendType === BLEND_PREMULTIPLIED) {
        code += "float specLum = dot((dSpecularLight + dReflection.rgb * dReflection.a), vec3( 0.2126, 0.7152, 0.0722 ));\n";
        code += "#ifdef LIT_CLEARCOAT\n specLum += dot(ccSpecularLight * ccSpecularity + ccReflection.rgb * ccSpecularity, vec3( 0.2126, 0.7152, 0.0722 ));\n#endif\n";
        code += "dAlpha = clamp(dAlpha + gammaCorrectInput(specLum), 0.0, 1.0);\n";
      }

      code += "dAlpha *= material_alphaFade;\n";
    }

    code += chunks.endPS;

    if (options.blendType === BLEND_NORMAL || options.blendType === BLEND_ADDITIVEALPHA || options.alphaToCoverage) {
      code += chunks.outputAlphaPS;
    } else if (options.blendType === BLEND_PREMULTIPLIED) {
      code += chunks.outputAlphaPremulPS;
    } else {
      code += chunks.outputAlphaOpaquePS;
    }

    if (options.msdf) {
      code += "    gl_FragColor = applyMsdf(gl_FragColor);\n";
    }

    code += "\n";
    code += end();

    if (hasPointLights) {
      code = chunks.lightDirPointPS + code;
    }

    if (usesLinearFalloff) {
      code = chunks.falloffLinearPS + code;
    }

    if (usesInvSquaredFalloff) {
      code = chunks.falloffInvSquaredPS + code;
    }

    if (usesSpot) {
      code = chunks.spotPS + code;
    }

    if (usesCookie && !options.clusteredLightingEnabled) {
      code = chunks.cookiePS + code;
    }

    let structCode = "";
    if (code.includes("dReflection")) structCode += "vec4 dReflection;\n";
    if (code.includes("dTBN")) structCode += "mat3 dTBN;\n";
    if (code.includes("dVertexNormalW")) structCode += "vec3 dVertexNormalW;\n";
    if (code.includes("dTangentW")) structCode += "vec3 dTangentW;\n";
    if (code.includes("dBinormalW")) structCode += "vec3 dBinormalW;\n";
    if (code.includes("dViewDirW")) structCode += "vec3 dViewDirW;\n";
    if (code.includes("dReflDirW")) structCode += "vec3 dReflDirW;\n";
    if (code.includes("dHalfDirW")) structCode += "vec3 dHalfDirW;\n";
    if (code.includes("dDiffuseLight")) structCode += "vec3 dDiffuseLight;\n";
    if (code.includes("dSpecularLight")) structCode += "vec3 dSpecularLight;\n";
    if (code.includes("dLightDirNormW")) structCode += "vec3 dLightDirNormW;\n";
    if (code.includes("dLightDirW")) structCode += "vec3 dLightDirW;\n";
    if (code.includes("dLightPosW")) structCode += "vec3 dLightPosW;\n";
    if (code.includes("dShadowCoord")) structCode += "vec3 dShadowCoord;\n";
    if (code.includes("dAtten")) structCode += "float dAtten;\n";
    if (code.includes("dAttenD")) structCode += "float dAttenD;\n";
    if (code.includes("dAtten3")) structCode += "vec3 dAtten3;\n";
    if (code.includes("dMsdf")) structCode += "vec4 dMsdf;\n";
    if (code.includes("ccFresnel")) structCode += "float ccFresnel;\n";
    if (code.includes("ccReflection")) structCode += "vec3 ccReflection;\n";
    if (code.includes("ccReflDirW")) structCode += "vec3 ccReflDirW;\n";
    if (code.includes("ccSpecularLight")) structCode += "vec3 ccSpecularLight;\n";
    if (code.includes("ccSpecularityNoFres")) structCode += "float ccSpecularityNoFres;\n";
    if (code.includes("sSpecularLight")) structCode += "vec3 sSpecularLight;\n";
    if (code.includes("sReflection")) structCode += "vec4 sReflection;\n";
    const result = this._fsGetBeginCode() + this.varyings + this._fsGetBaseCode() + (options.detailModes ? chunks.detailModesPS : "") + structCode + this.frontendDecl + code;
    return result;
  }

  generateFragmentShader(frontendDecl, frontendCode, frontendFunc, lightingUv) {
    const options = this.options;
    this.frontendDecl = frontendDecl;
    this.frontendCode = frontendCode;
    this.frontendFunc = frontendFunc;
    this.lightingUv = lightingUv;

    if (options.pass === SHADER_PICK) {
      this.fshader = this._fsGetPickPassCode();
    } else if (options.pass === SHADER_DEPTH) {
      this.fshader = this._fsGetDepthPassCode();
    } else if (this.shadowPass) {
      this.fshader = this._fsGetShadowPassCode();
    } else if (options.customFragmentShader) {
      this.fshader = this._fsGetBeginCode() + options.customFragmentShader;
    } else {
      this.fshader = this._fsGetLitPassCode();
    }
  }

  getDefinition() {
    const result = {
      attributes: this.attributes,
      vshader: this.vshader,
      fshader: this.fshader
    };

    if (ShaderPass.isForward(this.options.pass)) {
      result.tag = SHADERTAG_MATERIAL;
    }

    return result;
  }

}

export { LitShader };
