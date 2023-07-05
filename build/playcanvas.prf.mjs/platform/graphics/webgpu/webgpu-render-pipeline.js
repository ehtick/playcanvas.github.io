import '../../../core/debug.js';
import { WebgpuVertexBufferLayout } from './webgpu-vertex-buffer-layout.js';
import './webgpu-debug.js';

const _primitiveTopology = ['point-list', 'line-list', undefined, 'line-strip', 'triangle-list', 'triangle-strip', undefined];
const _blendOperation = ['add', 'subtract', 'reverse-subtract', 'min', 'max'];
const _blendFactor = ['zero', 'one', 'src', 'one-minus-src', 'dst', 'one-minus-dst', 'src-alpha', 'src-alpha-saturated', 'one-minus-src-alpha', 'dst-alpha', 'one-minus-dst-alpha', 'constant', 'one-minus-constant'];
const _compareFunction = ['never', 'less', 'equal', 'less-equal', 'greater', 'not-equal', 'greater-equal', 'always'];
const _cullModes = ['none', 'back', 'front'];
const _stencilOps = ['keep', 'zero', 'replace', 'increment-clamp', 'increment-wrap', 'decrement-clamp', 'decrement-wrap', 'invert'];
const _bindGroupLayouts = [];
class WebgpuRenderPipeline {
	constructor(device) {
		this.device = device;
		this.vertexBufferLayout = new WebgpuVertexBufferLayout();
		this.cache = new Map();
	}
	get(primitive, vertexFormat0, vertexFormat1, shader, renderTarget, bindGroupFormats, blendState, depthState, cullMode, stencilEnabled, stencilFront, stencilBack) {
		const key = this.getKey(primitive, vertexFormat0, vertexFormat1, shader, renderTarget, bindGroupFormats, blendState, depthState, cullMode, stencilEnabled, stencilFront, stencilBack);
		let pipeline = this.cache.get(key);
		if (!pipeline) {
			const primitiveTopology = _primitiveTopology[primitive.type];
			const pipelineLayout = this.getPipelineLayout(bindGroupFormats);
			const vertexBufferLayout = this.vertexBufferLayout.get(vertexFormat0, vertexFormat1);
			pipeline = this.create(primitiveTopology, shader, renderTarget, pipelineLayout, blendState, depthState, vertexBufferLayout, cullMode, stencilEnabled, stencilFront, stencilBack);
			this.cache.set(key, pipeline);
		}
		return pipeline;
	}
	getKey(primitive, vertexFormat0, vertexFormat1, shader, renderTarget, bindGroupFormats, blendState, depthState, cullMode, stencilEnabled, stencilFront, stencilBack) {
		let bindGroupKey = '';
		for (let i = 0; i < bindGroupFormats.length; i++) {
			bindGroupKey += bindGroupFormats[i].key;
		}
		const vertexBufferLayoutKey = this.vertexBufferLayout.getKey(vertexFormat0, vertexFormat1);
		const renderTargetKey = renderTarget.impl.key;
		const stencilKey = stencilEnabled ? stencilFront.key + stencilBack.key : '';
		return vertexBufferLayoutKey + shader.impl.vertexCode + shader.impl.fragmentCode + renderTargetKey + primitive.type + bindGroupKey + blendState.key + depthState.key + cullMode + stencilKey;
	}
	getPipelineLayout(bindGroupFormats) {
		bindGroupFormats.forEach(format => {
			_bindGroupLayouts.push(format.bindGroupLayout);
		});
		const descr = {
			bindGroupLayouts: _bindGroupLayouts
		};
		const pipelineLayout = this.device.wgpu.createPipelineLayout(descr);
		_bindGroupLayouts.length = 0;
		return pipelineLayout;
	}
	getBlend(blendState) {
		let blend;
		if (blendState.blend) {
			blend = {
				color: {
					operation: _blendOperation[blendState.colorOp],
					srcFactor: _blendFactor[blendState.colorSrcFactor],
					dstFactor: _blendFactor[blendState.colorDstFactor]
				},
				alpha: {
					operation: _blendOperation[blendState.alphaOp],
					srcFactor: _blendFactor[blendState.alphaSrcFactor],
					dstFactor: _blendFactor[blendState.alphaDstFactor]
				}
			};
		}
		return blend;
	}
	getDepthStencil(depthState, renderTarget, stencilEnabled, stencilFront, stencilBack) {
		let depthStencil;
		const {
			depth,
			stencil
		} = renderTarget;
		if (depth || stencil) {
			depthStencil = {
				format: renderTarget.impl.depthFormat
			};
			if (depth) {
				depthStencil.depthWriteEnabled = depthState.write;
				depthStencil.depthCompare = _compareFunction[depthState.func];
			} else {
				depthStencil.depthWriteEnabled = false;
				depthStencil.depthCompare = 'always';
			}
			if (stencil && stencilEnabled) {
				depthStencil.stencilReadMas = stencilFront.readMask;
				depthStencil.stencilWriteMask = stencilFront.writeMask;
				depthStencil.stencilFront = {
					compare: _compareFunction[stencilFront.func],
					failOp: _stencilOps[stencilFront.fail],
					passOp: _stencilOps[stencilFront.zpass],
					depthFailOp: _stencilOps[stencilFront.zfail]
				};
				depthStencil.stencilBack = {
					compare: _compareFunction[stencilBack.func],
					failOp: _stencilOps[stencilBack.fail],
					passOp: _stencilOps[stencilBack.zpass],
					depthFailOp: _stencilOps[stencilBack.zfail]
				};
			}
		}
		return depthStencil;
	}
	create(primitiveTopology, shader, renderTarget, pipelineLayout, blendState, depthState, vertexBufferLayout, cullMode, stencilEnabled, stencilFront, stencilBack) {
		const wgpu = this.device.wgpu;
		const webgpuShader = shader.impl;
		const descr = {
			vertex: {
				module: webgpuShader.getVertexShaderModule(),
				entryPoint: webgpuShader.vertexEntryPoint,
				buffers: vertexBufferLayout
			},
			fragment: {
				module: webgpuShader.getFragmentShaderModule(),
				entryPoint: webgpuShader.fragmentEntryPoint,
				targets: []
			},
			primitive: {
				topology: primitiveTopology,
				frontFace: 'ccw',
				cullMode: _cullModes[cullMode]
			},
			depthStencil: this.getDepthStencil(depthState, renderTarget, stencilEnabled, stencilFront, stencilBack),
			multisample: {
				count: renderTarget.samples
			},
			layout: pipelineLayout
		};
		const colorAttachments = renderTarget.impl.colorAttachments;
		if (colorAttachments.length > 0) {
			let writeMask = 0;
			if (blendState.redWrite) writeMask |= GPUColorWrite.RED;
			if (blendState.greenWrite) writeMask |= GPUColorWrite.GREEN;
			if (blendState.blueWrite) writeMask |= GPUColorWrite.BLUE;
			if (blendState.alphaWrite) writeMask |= GPUColorWrite.ALPHA;
			const blend = this.getBlend(blendState);
			colorAttachments.forEach(attachment => {
				descr.fragment.targets.push({
					format: attachment.format,
					writeMask: writeMask,
					blend: blend
				});
			});
		}
		const pipeline = wgpu.createRenderPipeline(descr);
		return pipeline;
	}
}

export { WebgpuRenderPipeline };
