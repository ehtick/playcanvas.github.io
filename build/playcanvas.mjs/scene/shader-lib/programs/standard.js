import { hashCode } from '../../../core/hash.js';
import '../../../core/debug.js';
import { LIGHTTYPE_DIRECTIONAL, SPRITE_RENDERMODE_SLICED, SPRITE_RENDERMODE_TILED, SPECULAR_PHONG, FRESNEL_SCHLICK, BLEND_NONE } from '../../constants.js';
import { ShaderPass } from '../../shader-pass.js';
import { LitShader } from './lit-shader.js';
import { ChunkBuilder } from '../chunk-builder.js';
import { ChunkUtils } from '../chunk-utils.js';
import { StandardMaterialOptions } from '../../materials/standard-material-options.js';

const _matTex2D = [];
const standard = {
	optionsContext: new StandardMaterialOptions(),
	optionsContextMin: new StandardMaterialOptions(),
	generateKey: function (options) {
		const buildPropertiesList = function buildPropertiesList(options) {
			const props = [];
			for (const prop in options) {
				if (options.hasOwnProperty(prop) && prop !== "chunks" && prop !== "lights") props.push(prop);
			}
			return props.sort();
		};
		let props;
		if (options === this.optionsContextMin) {
			if (!this.propsMin) this.propsMin = buildPropertiesList(options);
			props = this.propsMin;
		} else if (options === this.optionsContext) {
			if (!this.props) this.props = buildPropertiesList(options);
			props = this.props;
		} else {
			props = buildPropertiesList(options);
		}
		let key = "standard";
		for (let i = 0; i < props.length; i++) {
			if (options[props[i]]) key += props[i] + options[props[i]];
		}
		if (options.chunks) {
			const chunks = [];
			for (const p in options.chunks) {
				if (options.chunks.hasOwnProperty(p)) {
					chunks.push(p + options.chunks[p]);
				}
			}
			chunks.sort();
			key += chunks;
		}
		if (options.litOptions) {
			for (const m in options.litOptions) {
				if (m === 'lights') {
					const isClustered = options.litOptions.clusteredLightingEnabled;
					for (let i = 0; i < options.litOptions.lights.length; i++) {
						const light = options.litOptions.lights[i];
						if (!isClustered || light._type === LIGHTTYPE_DIRECTIONAL) {
							key += light.key;
						}
					}
				} else {
					key += m + options.litOptions[m];
				}
			}
		}
		return hashCode(key);
	},
	_getUvSourceExpression: function (transformPropName, uVPropName, options) {
		const transformId = options[transformPropName];
		const uvChannel = options[uVPropName];
		const isMainPass = options.isForwardPass;
		let expression;
		if (isMainPass && options.litOptions.nineSlicedMode === SPRITE_RENDERMODE_SLICED) {
			expression = "nineSlicedUv";
		} else if (isMainPass && options.litOptions.nineSlicedMode === SPRITE_RENDERMODE_TILED) {
			expression = "nineSlicedUv";
		} else {
			if (transformId === 0) {
				expression = "vUv" + uvChannel;
			} else {
				expression = "vUV" + uvChannel + "_" + transformId;
			}
			if (options.heightMap && transformPropName !== "heightMapTransform") {
				expression += " + dUvOffset";
			}
		}
		return expression;
	},
	_addMapDef: function (name, enabled) {
		return enabled ? `#define ${name}\n` : `#undef ${name}\n`;
	},
	_addMapDefs: function (float, color, vertex, map, invert) {
		return this._addMapDef("MAPFLOAT", float) + this._addMapDef("MAPCOLOR", color) + this._addMapDef("MAPVERTEX", vertex) + this._addMapDef("MAPTEXTURE", map) + this._addMapDef("MAPINVERT", invert);
	},
	_addMap: function (propName, chunkName, options, chunks, mapping, encoding = null) {
		const mapPropName = propName + "Map";
		const uVPropName = mapPropName + "Uv";
		const identifierPropName = mapPropName + "Identifier";
		const transformPropName = mapPropName + "Transform";
		const channelPropName = mapPropName + "Channel";
		const vertexColorChannelPropName = propName + "VertexColorChannel";
		const tintPropName = propName + "Tint";
		const vertexColorPropName = propName + "VertexColor";
		const detailModePropName = propName + "Mode";
		const invertName = propName + "Invert";
		const tintOption = options[tintPropName];
		const vertexColorOption = options[vertexColorPropName];
		const textureOption = options[mapPropName];
		const textureIdentifier = options[identifierPropName];
		const detailModeOption = options[detailModePropName];
		let subCode = chunks[chunkName];
		if (textureOption) {
			const uv = this._getUvSourceExpression(transformPropName, uVPropName, options);
			subCode = subCode.replace(/\$UV/g, uv).replace(/\$CH/g, options[channelPropName]);
			if (mapping && subCode.search(/\$SAMPLER/g) !== -1) {
				let samplerName = "texture_" + mapPropName;
				const alias = mapping[textureIdentifier];
				if (alias) {
					samplerName = alias;
				} else {
					mapping[textureIdentifier] = samplerName;
				}
				subCode = subCode.replace(/\$SAMPLER/g, samplerName);
			}
			if (encoding) {
				if (options[channelPropName] === 'aaa') {
					subCode = subCode.replace(/\$DECODE/g, 'passThrough');
				} else {
					subCode = subCode.replace(/\$DECODE/g, ChunkUtils.decodeFunc(!options.litOptions.gamma && encoding === 'srgb' ? 'linear' : encoding));
				}
				if (subCode.indexOf('$texture2DSAMPLE')) {
					const decodeTable = {
						linear: 'texture2D',
						srgb: 'texture2DSRGB',
						rgbm: 'texture2DRGBM',
						rgbe: 'texture2DRGBE'
					};
					subCode = subCode.replace(/\$texture2DSAMPLE/g, decodeTable[encoding] || 'texture2D');
				}
			}
		}
		if (vertexColorOption) {
			subCode = subCode.replace(/\$VC/g, options[vertexColorChannelPropName]);
		}
		if (detailModeOption) {
			subCode = subCode.replace(/\$DETAILMODE/g, detailModeOption);
		}
		const isFloatTint = !!(tintOption & 1);
		const isVecTint = !!(tintOption & 2);
		const invertOption = !!options[invertName];
		subCode = this._addMapDefs(isFloatTint, isVecTint, vertexColorOption, textureOption, invertOption) + subCode;
		return subCode.replace(/\$/g, "");
	},
	_correctChannel: function (p, chan, _matTex2D) {
		if (_matTex2D[p] > 0) {
			if (_matTex2D[p] < chan.length) {
				return chan.substring(0, _matTex2D[p]);
			} else if (_matTex2D[p] > chan.length) {
				let str = chan;
				const chr = str.charAt(str.length - 1);
				const addLen = _matTex2D[p] - str.length;
				for (let i = 0; i < addLen; i++) str += chr;
				return str;
			}
			return chan;
		}
	},
	createShaderDefinition: function (device, options) {
		const shaderPassInfo = ShaderPass.get(device).getByIndex(options.pass);
		const isForwardPass = shaderPassInfo.isForward;
		options.isForwardPass = isForwardPass;
		const litShader = new LitShader(device, options.litOptions);
		const useUv = [];
		const useUnmodifiedUv = [];
		const mapTransforms = [];
		const maxUvSets = 2;
		const textureMapping = {};
		for (const p in _matTex2D) {
			const mname = p + "Map";
			if (options[p + "VertexColor"]) {
				const cname = p + "VertexColorChannel";
				options[cname] = this._correctChannel(p, options[cname], _matTex2D);
			}
			if (options[mname]) {
				const cname = mname + "Channel";
				const tname = mname + "Transform";
				const uname = mname + "Uv";
				options[uname] = Math.min(options[uname], maxUvSets - 1);
				options[cname] = this._correctChannel(p, options[cname], _matTex2D);
				const uvSet = options[uname];
				useUv[uvSet] = true;
				useUnmodifiedUv[uvSet] = useUnmodifiedUv[uvSet] || options[mname] && !options[tname];
				if (options[tname]) {
					mapTransforms.push({
						name: p,
						id: options[tname],
						uv: options[uname]
					});
				}
			}
		}
		if (options.forceUv1) {
			useUv[1] = true;
			useUnmodifiedUv[1] = useUnmodifiedUv[1] !== undefined ? useUnmodifiedUv[1] : true;
		}
		litShader.generateVertexShader(useUv, useUnmodifiedUv, mapTransforms);
		if (options.litOptions.shadingModel === SPECULAR_PHONG) {
			options.litOptions.fresnelModel = 0;
			options.litOptions.ambientSH = false;
		} else {
			options.litOptions.fresnelModel = options.litOptions.fresnelModel === 0 ? FRESNEL_SCHLICK : options.litOptions.fresnelModel;
		}
		const decl = new ChunkBuilder();
		const code = new ChunkBuilder();
		const func = new ChunkBuilder();
		const args = new ChunkBuilder();
		let lightingUv = "";
		if (options.litOptions.nineSlicedMode === SPRITE_RENDERMODE_TILED) {
			decl.append(`const float textureBias = -1000.0;`);
		} else {
			decl.append(`uniform float textureBias;`);
		}
		if (isForwardPass) {
			if (options.heightMap) {
				decl.append("vec2 dUvOffset;");
				code.append(this._addMap("height", "parallaxPS", options, litShader.chunks, textureMapping));
				func.append("getParallax();");
			}
			if (options.litOptions.blendType !== BLEND_NONE || options.litOptions.alphaTest || options.litOptions.alphaToCoverage) {
				decl.append("float dAlpha;");
				code.append(this._addMap("opacity", "opacityPS", options, litShader.chunks, textureMapping));
				func.append("getOpacity();");
				args.append("_litShaderArgs.opacity = dAlpha;");
				if (options.litOptions.alphaTest) {
					code.append(litShader.chunks.alphaTestPS);
					func.append("alphaTest(dAlpha);");
				}
			} else {
				decl.append("float dAlpha = 1.0;");
			}
			if (litShader.needsNormal) {
				if (options.normalMap || options.clearCoatNormalMap) {
					code.append(options.packedNormal ? litShader.chunks.normalXYPS : litShader.chunks.normalXYZPS);
					if (!options.litOptions.hasTangents) {
						const baseName = options.normalMap ? "normalMap" : "clearCoatNormalMap";
						lightingUv = this._getUvSourceExpression(`${baseName}Transform`, `${baseName}Uv`, options);
					}
				}
				decl.append("vec3 dNormalW;");
				code.append(this._addMap("normalDetail", "normalDetailMapPS", options, litShader.chunks, textureMapping));
				code.append(this._addMap("normal", "normalMapPS", options, litShader.chunks, textureMapping));
				func.append("getNormal();");
				args.append("_litShaderArgs.worldNormal = dNormalW;");
			}
			if (litShader.needsSceneColor) {
				decl.append("uniform sampler2D uSceneColorMap;");
			}
			if (litShader.needsScreenSize) {
				decl.append("uniform vec4 uScreenSize;");
			}
			if (litShader.needsTransforms) {
				decl.append("uniform mat4 matrix_viewProjection;");
				decl.append("uniform mat4 matrix_model;");
			}
			decl.append("vec3 dAlbedo;");
			if (options.diffuseDetail) {
				code.append(this._addMap("diffuseDetail", "diffuseDetailMapPS", options, litShader.chunks, textureMapping, options.diffuseDetailEncoding));
			}
			code.append(this._addMap("diffuse", "diffusePS", options, litShader.chunks, textureMapping, options.diffuseEncoding));
			func.append("getAlbedo();");
			args.append("_litShaderArgs.albedo = dAlbedo;");
			if (options.litOptions.useRefraction) {
				decl.append("float dTransmission;");
				code.append(this._addMap("refraction", "transmissionPS", options, litShader.chunks, textureMapping));
				func.append("getRefraction();");
				args.append("_litShaderArgs.transmission = dTransmission;");
				decl.append("float dThickness;");
				code.append(this._addMap("thickness", "thicknessPS", options, litShader.chunks, textureMapping));
				func.append("getThickness();");
				args.append("_litShaderArgs.thickness = dThickness;");
			}
			if (options.litOptions.useIridescence) {
				decl.append("float dIridescence;");
				code.append(this._addMap("iridescence", "iridescencePS", options, litShader.chunks, textureMapping));
				func.append("getIridescence();");
				args.append("_litShaderArgs.iridescence.intensity = dIridescence;");
				decl.append("float dIridescenceThickness;");
				code.append(this._addMap("iridescenceThickness", "iridescenceThicknessPS", options, litShader.chunks, textureMapping));
				func.append("getIridescenceThickness();");
				args.append("_litShaderArgs.iridescence.thickness = dIridescenceThickness;");
			}
			if (litShader.lighting && options.litOptions.useSpecular || litShader.reflections) {
				decl.append("vec3 dSpecularity;");
				decl.append("float dGlossiness;");
				if (options.litOptions.useSheen) {
					decl.append("vec3 sSpecularity;");
					code.append(this._addMap("sheen", "sheenPS", options, litShader.chunks, textureMapping, options.sheenEncoding));
					func.append("getSheen();");
					args.append("_litShaderArgs.sheen.specularity = sSpecularity;");
					decl.append("float sGlossiness;");
					code.append(this._addMap("sheenGloss", "sheenGlossPS", options, litShader.chunks, textureMapping));
					func.append("getSheenGlossiness();");
					args.append("_litShaderArgs.sheen.gloss = sGlossiness;");
				}
				if (options.litOptions.useMetalness) {
					decl.append("float dMetalness;");
					code.append(this._addMap("metalness", "metalnessPS", options, litShader.chunks, textureMapping));
					func.append("getMetalness();");
					args.append("_litShaderArgs.metalness = dMetalness;");
				}
				if (options.litOptions.useSpecularityFactor) {
					decl.append("float dSpecularityFactor;");
					code.append(this._addMap("specularityFactor", "specularityFactorPS", options, litShader.chunks, textureMapping));
					func.append("getSpecularityFactor();");
					args.append("_litShaderArgs.specularityFactor = dSpecularityFactor;");
				}
				if (options.litOptions.useSpecularColor) {
					code.append(this._addMap("specular", "specularPS", options, litShader.chunks, textureMapping, options.specularEncoding));
				} else {
					code.append("void getSpecularity() { dSpecularity = vec3(1); }");
				}
				code.append(this._addMap("gloss", "glossPS", options, litShader.chunks, textureMapping));
				func.append("getGlossiness();");
				func.append("getSpecularity();");
				args.append("_litShaderArgs.specularity = dSpecularity;");
				args.append("_litShaderArgs.gloss = dGlossiness;");
			} else {
				decl.append("vec3 dSpecularity = vec3(0.0);");
				decl.append("float dGlossiness = 0.0;");
			}
			if (options.aoDetail) {
				code.append(this._addMap("aoDetail", "aoDetailMapPS", options, litShader.chunks, textureMapping));
			}
			if (options.aoMap || options.aoVertexColor) {
				decl.append("float dAo;");
				code.append(this._addMap("ao", "aoPS", options, litShader.chunks, textureMapping));
				func.append("getAO();");
				args.append("_litShaderArgs.ao = dAo;");
			}
			decl.append("vec3 dEmission;");
			code.append(this._addMap("emissive", "emissivePS", options, litShader.chunks, textureMapping, options.emissiveEncoding));
			func.append("getEmission();");
			args.append("_litShaderArgs.emission = dEmission;");
			if (options.litOptions.useClearCoat) {
				decl.append("float ccSpecularity;");
				decl.append("float ccGlossiness;");
				decl.append("vec3 ccNormalW;");
				code.append(this._addMap("clearCoat", "clearCoatPS", options, litShader.chunks, textureMapping));
				code.append(this._addMap("clearCoatGloss", "clearCoatGlossPS", options, litShader.chunks, textureMapping));
				code.append(this._addMap("clearCoatNormal", "clearCoatNormalPS", options, litShader.chunks, textureMapping));
				func.append("getClearCoat();");
				func.append("getClearCoatGlossiness();");
				func.append("getClearCoatNormal();");
				args.append("_litShaderArgs.clearcoat.specularity = ccSpecularity;");
				args.append("_litShaderArgs.clearcoat.gloss = ccGlossiness;");
				args.append("_litShaderArgs.clearcoat.worldNormal = ccNormalW;");
			}
			if (options.lightMap || options.lightVertexColor) {
				const lightmapDir = options.dirLightMap && options.litOptions.useSpecular;
				const lightmapChunkPropName = lightmapDir ? 'lightmapDirPS' : 'lightmapSinglePS';
				decl.append("vec3 dLightmap;");
				if (lightmapDir) {
					decl.append("vec3 dLightmapDir;");
				}
				code.append(this._addMap("light", lightmapChunkPropName, options, litShader.chunks, textureMapping, options.lightMapEncoding));
				func.append("getLightMap();");
				args.append("_litShaderArgs.lightmap = dLightmap;");
				if (lightmapDir) {
					args.append("_litShaderArgs.lightmapDir = dLightmapDir;");
				}
			}
			if (code.code.indexOf('texture2DSRGB') !== -1 || code.code.indexOf('texture2DRGBM') !== -1 || code.code.indexOf('texture2DRGBE') !== -1) {
				code.prepend(litShader.chunks.textureSamplePS);
			}
		} else {
			if (options.litOptions.alphaTest) {
				decl.append("float dAlpha;");
				code.append(this._addMap("opacity", "opacityPS", options, litShader.chunks, textureMapping));
				code.append(litShader.chunks.alphaTestPS);
				func.append("getOpacity();");
				func.append("alphaTest(dAlpha);");
				args.append("_litShaderArgs.opacity = dAlpha;");
			}
		}
		decl.append(litShader.chunks.litShaderArgsPS);
		code.append(`LitShaderArguments evaluateFrontend() { LitShaderArguments _litShaderArgs; \n${func.code}\n${args.code}\n return _litShaderArgs;\n }\n`);
		func.code = `LitShaderArguments litShaderArgs = evaluateFrontend();`;
		for (const texture in textureMapping) {
			decl.append(`uniform sampler2D ${textureMapping[texture]};`);
		}
		func.code = `\n${func.code.split('\n').map(l => `    ${l}`).join('\n')}\n\n`;
		litShader.generateFragmentShader(decl.code, code.code, func.code, lightingUv);
		return litShader.getDefinition();
	}
};

export { _matTex2D, standard };
