import { Debug } from '../../core/debug.js';
import { CULLFACE_BACK, BLENDMODE_ONE, BLENDEQUATION_REVERSE_SUBTRACT, BLENDMODE_ZERO, BLENDEQUATION_ADD, BLENDMODE_SRC_ALPHA, BLENDMODE_ONE_MINUS_SRC_ALPHA, BLENDMODE_DST_COLOR, BLENDMODE_SRC_COLOR, BLENDMODE_ONE_MINUS_DST_COLOR, BLENDEQUATION_MIN, BLENDEQUATION_MAX } from '../../platform/graphics/constants.js';
import { BlendState } from '../../platform/graphics/blend-state.js';
import { DepthState } from '../../platform/graphics/depth-state.js';
import { ShaderProcessorOptions } from '../../platform/graphics/shader-processor-options.js';
import { BLEND_NONE, BLEND_NORMAL, BLEND_SUBTRACTIVE, BLEND_PREMULTIPLIED, BLEND_ADDITIVE, BLEND_ADDITIVEALPHA, BLEND_MULTIPLICATIVE2X, BLEND_SCREEN, BLEND_MULTIPLICATIVE, BLEND_MIN, BLEND_MAX } from '../constants.js';
import { processShader } from '../shader-lib/utils.js';
import { getDefaultMaterial } from './default-material.js';

// blend mode mapping to op, srcBlend and dstBlend
const blendModes = [];
blendModes[BLEND_SUBTRACTIVE] = {
  src: BLENDMODE_ONE,
  dst: BLENDMODE_ONE,
  op: BLENDEQUATION_REVERSE_SUBTRACT
};
blendModes[BLEND_NONE] = {
  src: BLENDMODE_ONE,
  dst: BLENDMODE_ZERO,
  op: BLENDEQUATION_ADD
};
blendModes[BLEND_NORMAL] = {
  src: BLENDMODE_SRC_ALPHA,
  dst: BLENDMODE_ONE_MINUS_SRC_ALPHA,
  op: BLENDEQUATION_ADD
};
blendModes[BLEND_PREMULTIPLIED] = {
  src: BLENDMODE_ONE,
  dst: BLENDMODE_ONE_MINUS_SRC_ALPHA,
  op: BLENDEQUATION_ADD
};
blendModes[BLEND_ADDITIVE] = {
  src: BLENDMODE_ONE,
  dst: BLENDMODE_ONE,
  op: BLENDEQUATION_ADD
};
blendModes[BLEND_ADDITIVEALPHA] = {
  src: BLENDMODE_SRC_ALPHA,
  dst: BLENDMODE_ONE,
  op: BLENDEQUATION_ADD
};
blendModes[BLEND_MULTIPLICATIVE2X] = {
  src: BLENDMODE_DST_COLOR,
  dst: BLENDMODE_SRC_COLOR,
  op: BLENDEQUATION_ADD
};
blendModes[BLEND_SCREEN] = {
  src: BLENDMODE_ONE_MINUS_DST_COLOR,
  dst: BLENDMODE_ONE,
  op: BLENDEQUATION_ADD
};
blendModes[BLEND_MULTIPLICATIVE] = {
  src: BLENDMODE_DST_COLOR,
  dst: BLENDMODE_ZERO,
  op: BLENDEQUATION_ADD
};
blendModes[BLEND_MIN] = {
  src: BLENDMODE_ONE,
  dst: BLENDMODE_ONE,
  op: BLENDEQUATION_MIN
};
blendModes[BLEND_MAX] = {
  src: BLENDMODE_ONE,
  dst: BLENDMODE_ONE,
  op: BLENDEQUATION_MAX
};
let id = 0;

/**
 * A material determines how a particular mesh instance is rendered. It specifies the shader and
 * render state that is set before the mesh instance is submitted to the graphics device.
 */
class Material {
  constructor() {
    /**
     * A shader used to render the material. Note that this is used only by materials where the
     * user specifies the shader. Most material types generate multiple shader variants, and do not
     * set this.
     *
     * @type {import('../../platform/graphics/shader.js').Shader}
     * @private
     */
    this._shader = null;
    /**
     * The mesh instances referencing this material
     *
     * @type {import('../mesh-instance.js').MeshInstance[]}
     * @private
     */
    this.meshInstances = [];
    /**
     * The name of the material.
     *
     * @type {string}
     */
    this.name = 'Untitled';
    this.id = id++;
    this.variants = {};
    this.parameters = {};
    /**
     * The alpha test reference value to control which fragments are written to the currently
     * active render target based on alpha value. All fragments with an alpha value of less than
     * the alphaTest reference value will be discarded. alphaTest defaults to 0 (all fragments
     * pass).
     *
     * @type {number}
     */
    this.alphaTest = 0;
    /**
     * Enables or disables alpha to coverage (WebGL2 only). When enabled, and if hardware
     * anti-aliasing is on, limited order-independent transparency can be achieved. Quality depends
     * on the number of MSAA samples of the current render target. It can nicely soften edges of
     * otherwise sharp alpha cutouts, but isn't recommended for large area semi-transparent
     * surfaces. Note, that you don't need to enable blending to make alpha to coverage work. It
     * will work without it, just like alphaTest.
     *
     * @type {boolean}
     */
    this.alphaToCoverage = false;
    /** @ignore */
    this._blendState = new BlendState();
    /** @ignore */
    this._depthState = new DepthState();
    /**
     * Controls how triangles are culled based on their face direction with respect to the
     * viewpoint. Can be:
     *
     * - {@link CULLFACE_NONE}: Do not cull triangles based on face direction.
     * - {@link CULLFACE_BACK}: Cull the back faces of triangles (do not render triangles facing
     * away from the view point).
     * - {@link CULLFACE_FRONT}: Cull the front faces of triangles (do not render triangles facing
     * towards the view point).
     *
     * Defaults to {@link CULLFACE_BACK}.
     *
     * @type {number}
     */
    this.cull = CULLFACE_BACK;
    /**
     * Stencil parameters for front faces (default is null).
     *
     * @type {import('../../platform/graphics/stencil-parameters.js').StencilParameters|null}
     */
    this.stencilFront = null;
    /**
     * Stencil parameters for back faces (default is null).
     *
     * @type {import('../../platform/graphics/stencil-parameters.js').StencilParameters|null}
     */
    this.stencilBack = null;
    /**
     * Offsets the output depth buffer value. Useful for decals to prevent z-fighting.
     *
     * @type {number}
     */
    this.depthBias = 0;
    /**
     * Same as {@link Material#depthBias}, but also depends on the slope of the triangle relative
     * to the camera.
     *
     * @type {number}
     */
    this.slopeDepthBias = 0;
    this._shaderVersion = 0;
    this._scene = null;
    this._dirtyBlend = false;
    this.dirty = true;
  }
  /**
   * If true, the red component of fragments generated by the shader of this material is written
   * to the color buffer of the currently active render target. If false, the red component will
   * not be written. Defaults to true.
   *
   * @type {boolean}
   */
  set redWrite(value) {
    this._blendState.redWrite = value;
  }
  get redWrite() {
    return this._blendState.redWrite;
  }

  /**
   * If true, the green component of fragments generated by the shader of this material is
   * written to the color buffer of the currently active render target. If false, the green
   * component will not be written. Defaults to true.
   *
   * @type {boolean}
   */
  set greenWrite(value) {
    this._blendState.greenWrite = value;
  }
  get greenWrite() {
    return this._blendState.greenWrite;
  }

  /**
   * If true, the blue component of fragments generated by the shader of this material is
   * written to the color buffer of the currently active render target. If false, the blue
   * component will not be written. Defaults to true.
   *
   * @type {boolean}
   */
  set blueWrite(value) {
    this._blendState.blueWrite = value;
  }
  get blueWrite() {
    return this._blendState.blueWrite;
  }

  /**
   * If true, the alpha component of fragments generated by the shader of this material is
   * written to the color buffer of the currently active render target. If false, the alpha
   * component will not be written. Defaults to true.
   *
   * @type {boolean}
   */
  set alphaWrite(value) {
    this._blendState.alphaWrite = value;
  }
  get alphaWrite() {
    return this._blendState.alphaWrite;
  }

  /**
   * The shader used by this material to render mesh instances (default is null).
   *
   * @type {import('../../platform/graphics/shader.js').Shader|null}
   */
  set shader(shader) {
    this._shader = shader;
  }
  get shader() {
    return this._shader;
  }

  // returns boolean depending on material being transparent
  get transparent() {
    return this._blendState.blend;
  }

  // called when material changes transparency, for layer composition to add it to appropriate
  // queue (opaque or transparent)
  _markBlendDirty() {
    if (this._scene) {
      this._scene.layers._dirtyBlend = true;
    } else {
      this._dirtyBlend = true;
    }
  }

  /**
   * Controls how fragment shader outputs are blended when being written to the currently active
   * render target. This overwrites blending type set using {@link Material#blendType}, and
   * offers more control over blending.
   *
   * @type { BlendState }
   */
  set blendState(value) {
    if (this._blendState.blend !== value.blend) {
      this._markBlendDirty();
    }
    this._blendState.copy(value);
  }
  get blendState() {
    return this._blendState;
  }

  /**
   * Controls how fragment shader outputs are blended when being written to the currently active
   * render target. Can be:
   *
   * - {@link BLEND_SUBTRACTIVE}: Subtract the color of the source fragment from the destination
   * fragment and write the result to the frame buffer.
   * - {@link BLEND_ADDITIVE}: Add the color of the source fragment to the destination fragment
   * and write the result to the frame buffer.
   * - {@link BLEND_NORMAL}: Enable simple translucency for materials such as glass. This is
   * equivalent to enabling a source blend mode of {@link BLENDMODE_SRC_ALPHA} and a destination
   * blend mode of {@link BLENDMODE_ONE_MINUS_SRC_ALPHA}.
   * - {@link BLEND_NONE}: Disable blending.
   * - {@link BLEND_PREMULTIPLIED}: Similar to {@link BLEND_NORMAL} expect the source fragment is
   * assumed to have already been multiplied by the source alpha value.
   * - {@link BLEND_MULTIPLICATIVE}: Multiply the color of the source fragment by the color of the
   * destination fragment and write the result to the frame buffer.
   * - {@link BLEND_ADDITIVEALPHA}: Same as {@link BLEND_ADDITIVE} except the source RGB is
   * multiplied by the source alpha.
   * - {@link BLEND_MULTIPLICATIVE2X}: Multiplies colors and doubles the result.
   * - {@link BLEND_SCREEN}: Softer version of additive.
   * - {@link BLEND_MIN}: Minimum color. Check app.graphicsDevice.extBlendMinmax for support.
   * - {@link BLEND_MAX}: Maximum color. Check app.graphicsDevice.extBlendMinmax for support.
   *
   * Defaults to {@link BLEND_NONE}.
   *
   * @type {number}
   */
  set blendType(type) {
    const blendMode = blendModes[type];
    Debug.assert(blendMode, `Unknown blend mode ${type}`);
    this._blendState.setColorBlend(blendMode.op, blendMode.src, blendMode.dst);
    this._blendState.setAlphaBlend(blendMode.op, blendMode.src, blendMode.dst);
    const blend = type !== BLEND_NONE;
    if (this._blendState.blend !== blend) {
      this._blendState.blend = blend;
      this._markBlendDirty();
    }
    this._updateMeshInstanceKeys();
  }
  get blendType() {
    if (!this.transparent) {
      return BLEND_NONE;
    }
    const {
      colorOp,
      colorSrcFactor,
      colorDstFactor,
      alphaOp,
      alphaSrcFactor,
      alphaDstFactor
    } = this._blendState;
    for (let i = 0; i < blendModes.length; i++) {
      const blendMode = blendModes[i];
      if (blendMode.src === colorSrcFactor && blendMode.dst === colorDstFactor && blendMode.op === colorOp && blendMode.src === alphaSrcFactor && blendMode.dst === alphaDstFactor && blendMode.op === alphaOp) {
        return i;
      }
    }
    return BLEND_NORMAL;
  }

  /**
   * Sets the depth state. Note that this can also be done by using {@link Material#depthTest},
   * {@link Material#depthFunc} and {@link Material#depthWrite}.
   *
   * @type { DepthState }
   */
  set depthState(value) {
    this._depthState.copy(value);
  }
  get depthState() {
    return this._depthState;
  }

  /**
   * If true, fragments generated by the shader of this material are only written to the current
   * render target if they pass the depth test. If false, fragments generated by the shader of
   * this material are written to the current render target regardless of what is in the depth
   * buffer. Defaults to true.
   *
   * @type {boolean}
   */
  set depthTest(value) {
    this._depthState.test = value;
  }
  get depthTest() {
    return this._depthState.test;
  }

  /**
   * Controls how the depth of new fragments is compared against the current depth contained in
   * the depth buffer. Can be:
   *
   * - {@link FUNC_NEVER}: don't draw
   * - {@link FUNC_LESS}: draw if new depth < depth buffer
   * - {@link FUNC_EQUAL}: draw if new depth == depth buffer
   * - {@link FUNC_LESSEQUAL}: draw if new depth <= depth buffer
   * - {@link FUNC_GREATER}: draw if new depth > depth buffer
   * - {@link FUNC_NOTEQUAL}: draw if new depth != depth buffer
   * - {@link FUNC_GREATEREQUAL}: draw if new depth >= depth buffer
   * - {@link FUNC_ALWAYS}: always draw
   *
   * Defaults to {@link FUNC_LESSEQUAL}.
   *
   * @type {number}
   */
  set depthFunc(value) {
    this._depthState.func = value;
  }
  get depthFunc() {
    return this._depthState.func;
  }

  /**
   * If true, fragments generated by the shader of this material write a depth value to the depth
   * buffer of the currently active render target. If false, no depth value is written. Defaults
   * to true.
   *
   * @type {boolean}
   */
  set depthWrite(value) {
    this._depthState.write = value;
  }
  get depthWrite() {
    return this._depthState.write;
  }

  /**
   * Copy a material.
   *
   * @param {Material} source - The material to copy.
   * @returns {Material} The destination material.
   */
  copy(source) {
    var _source$stencilFront;
    this.name = source.name;
    this._shader = source._shader;

    // Render states
    this.alphaTest = source.alphaTest;
    this.alphaToCoverage = source.alphaToCoverage;
    this._blendState.copy(source._blendState);
    this._depthState.copy(source._depthState);
    this.cull = source.cull;
    this.depthBias = source.depthBias;
    this.slopeDepthBias = source.slopeDepthBias;
    this.stencilFront = (_source$stencilFront = source.stencilFront) == null ? void 0 : _source$stencilFront.clone();
    if (source.stencilBack) {
      this.stencilBack = source.stencilFront === source.stencilBack ? this.stencilFront : source.stencilBack.clone();
    }
    return this;
  }

  /**
   * Clone a material.
   *
   * @returns {this} A newly cloned material.
   */
  clone() {
    const clone = new this.constructor();
    return clone.copy(this);
  }
  _updateMeshInstanceKeys() {
    const meshInstances = this.meshInstances;
    for (let i = 0; i < meshInstances.length; i++) {
      meshInstances[i].updateKey();
    }
  }
  updateUniforms(device, scene) {}
  getShaderVariant(device, scene, objDefs, staticLightList, pass, sortedLights, viewUniformFormat, viewBindGroupFormat, vertexFormat) {
    // generate shader variant - its the same shader, but with different processing options
    const processingOptions = new ShaderProcessorOptions(viewUniformFormat, viewBindGroupFormat, vertexFormat);
    return processShader(this._shader, processingOptions);
  }

  /**
   * Applies any changes made to the material's properties.
   */
  update() {
    this.dirty = true;
    if (this._shader) this._shader.failed = false;
  }

  // Parameter management
  clearParameters() {
    this.parameters = {};
  }
  getParameters() {
    return this.parameters;
  }
  clearVariants() {
    // clear variants on the material
    this.variants = {};

    // but also clear them from all materials that reference them
    const meshInstances = this.meshInstances;
    const count = meshInstances.length;
    for (let i = 0; i < count; i++) {
      meshInstances[i].clearShaders();
    }
  }

  /**
   * Retrieves the specified shader parameter from a material.
   *
   * @param {string} name - The name of the parameter to query.
   * @returns {object} The named parameter.
   */
  getParameter(name) {
    return this.parameters[name];
  }

  /**
   * Sets a shader parameter on a material.
   *
   * @param {string} name - The name of the parameter to set.
   * @param {number|number[]|Float32Array|import('../../platform/graphics/texture.js').Texture} data -
   * The value for the specified parameter.
   */
  setParameter(name, data) {
    if (data === undefined && typeof name === 'object') {
      const uniformObject = name;
      if (uniformObject.length) {
        for (let i = 0; i < uniformObject.length; i++) {
          this.setParameter(uniformObject[i]);
        }
        return;
      }
      name = uniformObject.name;
      data = uniformObject.value;
    }
    const param = this.parameters[name];
    if (param) {
      param.data = data;
    } else {
      this.parameters[name] = {
        scopeId: null,
        data: data
      };
    }
  }

  /**
   * Deletes a shader parameter on a material.
   *
   * @param {string} name - The name of the parameter to delete.
   */
  deleteParameter(name) {
    if (this.parameters[name]) {
      delete this.parameters[name];
    }
  }

  // used to apply parameters from this material into scope of uniforms, called internally by forward-renderer
  // optional list of parameter names to be set can be specified, otherwise all parameters are set
  setParameters(device, names) {
    const parameters = this.parameters;
    if (names === undefined) names = parameters;
    for (const paramName in names) {
      const parameter = parameters[paramName];
      if (parameter) {
        if (!parameter.scopeId) {
          parameter.scopeId = device.scope.resolve(paramName);
        }
        parameter.scopeId.setValue(parameter.data);
      }
    }
  }

  /**
   * Removes this material from the scene and possibly frees up memory from its shaders (if there
   * are no other materials using it).
   */
  destroy() {
    this.variants = {};
    this._shader = null;
    for (let i = 0; i < this.meshInstances.length; i++) {
      const meshInstance = this.meshInstances[i];
      meshInstance.clearShaders();
      meshInstance._material = null;
      if (meshInstance.mesh) {
        const defaultMaterial = getDefaultMaterial(meshInstance.mesh.device);
        if (this !== defaultMaterial) {
          meshInstance.material = defaultMaterial;
        }
      } else {
        Debug.warn('pc.Material: MeshInstance.mesh is null, default material cannot be assigned to the MeshInstance');
      }
    }
    this.meshInstances.length = 0;
  }

  /**
   * Registers mesh instance as referencing the material.
   *
   * @param {import('../mesh-instance.js').MeshInstance} meshInstance - The mesh instance to
   * de-register.
   * @ignore
   */
  addMeshInstanceRef(meshInstance) {
    this.meshInstances.push(meshInstance);
  }

  /**
   * De-registers mesh instance as referencing the material.
   *
   * @param {import('../mesh-instance.js').MeshInstance} meshInstance - The mesh instance to
   * de-register.
   * @ignore
   */
  removeMeshInstanceRef(meshInstance) {
    const meshInstances = this.meshInstances;
    const i = meshInstances.indexOf(meshInstance);
    if (i !== -1) {
      meshInstances.splice(i, 1);
    }
  }
}

export { Material };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY2VuZS9tYXRlcmlhbHMvbWF0ZXJpYWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGVidWcgfSBmcm9tICcuLi8uLi9jb3JlL2RlYnVnLmpzJztcblxuaW1wb3J0IHtcbiAgICBCTEVORE1PREVfWkVSTywgQkxFTkRNT0RFX09ORSwgQkxFTkRNT0RFX1NSQ19DT0xPUixcbiAgICBCTEVORE1PREVfRFNUX0NPTE9SLCBCTEVORE1PREVfT05FX01JTlVTX0RTVF9DT0xPUiwgQkxFTkRNT0RFX1NSQ19BTFBIQSxcbiAgICBCTEVORE1PREVfT05FX01JTlVTX1NSQ19BTFBIQSxcbiAgICBCTEVOREVRVUFUSU9OX0FERCwgQkxFTkRFUVVBVElPTl9SRVZFUlNFX1NVQlRSQUNULFxuICAgIEJMRU5ERVFVQVRJT05fTUlOLCBCTEVOREVRVUFUSU9OX01BWCxcbiAgICBDVUxMRkFDRV9CQUNLXG59IGZyb20gJy4uLy4uL3BsYXRmb3JtL2dyYXBoaWNzL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBCbGVuZFN0YXRlIH0gZnJvbSAnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3MvYmxlbmQtc3RhdGUuanMnO1xuaW1wb3J0IHsgRGVwdGhTdGF0ZSB9IGZyb20gJy4uLy4uL3BsYXRmb3JtL2dyYXBoaWNzL2RlcHRoLXN0YXRlLmpzJztcbmltcG9ydCB7IFNoYWRlclByb2Nlc3Nvck9wdGlvbnMgfSBmcm9tICcuLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy9zaGFkZXItcHJvY2Vzc29yLW9wdGlvbnMuanMnO1xuXG5pbXBvcnQge1xuICAgIEJMRU5EX0FERElUSVZFLCBCTEVORF9OT1JNQUwsIEJMRU5EX05PTkUsIEJMRU5EX1BSRU1VTFRJUExJRUQsXG4gICAgQkxFTkRfTVVMVElQTElDQVRJVkUsIEJMRU5EX0FERElUSVZFQUxQSEEsIEJMRU5EX01VTFRJUExJQ0FUSVZFMlgsIEJMRU5EX1NDUkVFTixcbiAgICBCTEVORF9NSU4sIEJMRU5EX01BWCwgQkxFTkRfU1VCVFJBQ1RJVkVcbn0gZnJvbSAnLi4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IHByb2Nlc3NTaGFkZXIgfSBmcm9tICcuLi9zaGFkZXItbGliL3V0aWxzLmpzJztcbmltcG9ydCB7IGdldERlZmF1bHRNYXRlcmlhbCB9IGZyb20gJy4vZGVmYXVsdC1tYXRlcmlhbC5qcyc7XG5cbi8vIGJsZW5kIG1vZGUgbWFwcGluZyB0byBvcCwgc3JjQmxlbmQgYW5kIGRzdEJsZW5kXG5jb25zdCBibGVuZE1vZGVzID0gW107XG5ibGVuZE1vZGVzW0JMRU5EX1NVQlRSQUNUSVZFXSA9IHsgc3JjOiBCTEVORE1PREVfT05FLCBkc3Q6IEJMRU5ETU9ERV9PTkUsIG9wOiBCTEVOREVRVUFUSU9OX1JFVkVSU0VfU1VCVFJBQ1QgfTtcbmJsZW5kTW9kZXNbQkxFTkRfTk9ORV0gPSB7IHNyYzogQkxFTkRNT0RFX09ORSwgZHN0OiBCTEVORE1PREVfWkVSTywgb3A6IEJMRU5ERVFVQVRJT05fQUREIH07XG5ibGVuZE1vZGVzW0JMRU5EX05PUk1BTF0gPSB7IHNyYzogQkxFTkRNT0RFX1NSQ19BTFBIQSwgZHN0OiBCTEVORE1PREVfT05FX01JTlVTX1NSQ19BTFBIQSwgb3A6IEJMRU5ERVFVQVRJT05fQUREIH07XG5ibGVuZE1vZGVzW0JMRU5EX1BSRU1VTFRJUExJRURdID0geyBzcmM6IEJMRU5ETU9ERV9PTkUsIGRzdDogQkxFTkRNT0RFX09ORV9NSU5VU19TUkNfQUxQSEEsIG9wOiBCTEVOREVRVUFUSU9OX0FERCB9O1xuYmxlbmRNb2Rlc1tCTEVORF9BRERJVElWRV0gPSB7IHNyYzogQkxFTkRNT0RFX09ORSwgZHN0OiBCTEVORE1PREVfT05FLCBvcDogQkxFTkRFUVVBVElPTl9BREQgfTtcbmJsZW5kTW9kZXNbQkxFTkRfQURESVRJVkVBTFBIQV0gPSB7IHNyYzogQkxFTkRNT0RFX1NSQ19BTFBIQSwgZHN0OiBCTEVORE1PREVfT05FLCBvcDogQkxFTkRFUVVBVElPTl9BREQgfTtcbmJsZW5kTW9kZXNbQkxFTkRfTVVMVElQTElDQVRJVkUyWF0gPSB7IHNyYzogQkxFTkRNT0RFX0RTVF9DT0xPUiwgZHN0OiBCTEVORE1PREVfU1JDX0NPTE9SLCBvcDogQkxFTkRFUVVBVElPTl9BREQgfTtcbmJsZW5kTW9kZXNbQkxFTkRfU0NSRUVOXSA9IHsgc3JjOiBCTEVORE1PREVfT05FX01JTlVTX0RTVF9DT0xPUiwgZHN0OiBCTEVORE1PREVfT05FLCBvcDogQkxFTkRFUVVBVElPTl9BREQgfTtcbmJsZW5kTW9kZXNbQkxFTkRfTVVMVElQTElDQVRJVkVdID0geyBzcmM6IEJMRU5ETU9ERV9EU1RfQ09MT1IsIGRzdDogQkxFTkRNT0RFX1pFUk8sIG9wOiBCTEVOREVRVUFUSU9OX0FERCB9O1xuYmxlbmRNb2Rlc1tCTEVORF9NSU5dID0geyBzcmM6IEJMRU5ETU9ERV9PTkUsIGRzdDogQkxFTkRNT0RFX09ORSwgb3A6IEJMRU5ERVFVQVRJT05fTUlOIH07XG5ibGVuZE1vZGVzW0JMRU5EX01BWF0gPSB7IHNyYzogQkxFTkRNT0RFX09ORSwgZHN0OiBCTEVORE1PREVfT05FLCBvcDogQkxFTkRFUVVBVElPTl9NQVggfTtcblxubGV0IGlkID0gMDtcblxuLyoqXG4gKiBBIG1hdGVyaWFsIGRldGVybWluZXMgaG93IGEgcGFydGljdWxhciBtZXNoIGluc3RhbmNlIGlzIHJlbmRlcmVkLiBJdCBzcGVjaWZpZXMgdGhlIHNoYWRlciBhbmRcbiAqIHJlbmRlciBzdGF0ZSB0aGF0IGlzIHNldCBiZWZvcmUgdGhlIG1lc2ggaW5zdGFuY2UgaXMgc3VibWl0dGVkIHRvIHRoZSBncmFwaGljcyBkZXZpY2UuXG4gKi9cbmNsYXNzIE1hdGVyaWFsIHtcbiAgICAvKipcbiAgICAgKiBBIHNoYWRlciB1c2VkIHRvIHJlbmRlciB0aGUgbWF0ZXJpYWwuIE5vdGUgdGhhdCB0aGlzIGlzIHVzZWQgb25seSBieSBtYXRlcmlhbHMgd2hlcmUgdGhlXG4gICAgICogdXNlciBzcGVjaWZpZXMgdGhlIHNoYWRlci4gTW9zdCBtYXRlcmlhbCB0eXBlcyBnZW5lcmF0ZSBtdWx0aXBsZSBzaGFkZXIgdmFyaWFudHMsIGFuZCBkbyBub3RcbiAgICAgKiBzZXQgdGhpcy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtpbXBvcnQoJy4uLy4uL3BsYXRmb3JtL2dyYXBoaWNzL3NoYWRlci5qcycpLlNoYWRlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zaGFkZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG1lc2ggaW5zdGFuY2VzIHJlZmVyZW5jaW5nIHRoaXMgbWF0ZXJpYWxcbiAgICAgKlxuICAgICAqIEB0eXBlIHtpbXBvcnQoJy4uL21lc2gtaW5zdGFuY2UuanMnKS5NZXNoSW5zdGFuY2VbXX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIG1lc2hJbnN0YW5jZXMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSBtYXRlcmlhbC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZSA9ICdVbnRpdGxlZCc7XG5cbiAgICBpZCA9IGlkKys7XG5cbiAgICB2YXJpYW50cyA9IHt9O1xuXG4gICAgcGFyYW1ldGVycyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGFscGhhIHRlc3QgcmVmZXJlbmNlIHZhbHVlIHRvIGNvbnRyb2wgd2hpY2ggZnJhZ21lbnRzIGFyZSB3cml0dGVuIHRvIHRoZSBjdXJyZW50bHlcbiAgICAgKiBhY3RpdmUgcmVuZGVyIHRhcmdldCBiYXNlZCBvbiBhbHBoYSB2YWx1ZS4gQWxsIGZyYWdtZW50cyB3aXRoIGFuIGFscGhhIHZhbHVlIG9mIGxlc3MgdGhhblxuICAgICAqIHRoZSBhbHBoYVRlc3QgcmVmZXJlbmNlIHZhbHVlIHdpbGwgYmUgZGlzY2FyZGVkLiBhbHBoYVRlc3QgZGVmYXVsdHMgdG8gMCAoYWxsIGZyYWdtZW50c1xuICAgICAqIHBhc3MpLlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBhbHBoYVRlc3QgPSAwO1xuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyBvciBkaXNhYmxlcyBhbHBoYSB0byBjb3ZlcmFnZSAoV2ViR0wyIG9ubHkpLiBXaGVuIGVuYWJsZWQsIGFuZCBpZiBoYXJkd2FyZVxuICAgICAqIGFudGktYWxpYXNpbmcgaXMgb24sIGxpbWl0ZWQgb3JkZXItaW5kZXBlbmRlbnQgdHJhbnNwYXJlbmN5IGNhbiBiZSBhY2hpZXZlZC4gUXVhbGl0eSBkZXBlbmRzXG4gICAgICogb24gdGhlIG51bWJlciBvZiBNU0FBIHNhbXBsZXMgb2YgdGhlIGN1cnJlbnQgcmVuZGVyIHRhcmdldC4gSXQgY2FuIG5pY2VseSBzb2Z0ZW4gZWRnZXMgb2ZcbiAgICAgKiBvdGhlcndpc2Ugc2hhcnAgYWxwaGEgY3V0b3V0cywgYnV0IGlzbid0IHJlY29tbWVuZGVkIGZvciBsYXJnZSBhcmVhIHNlbWktdHJhbnNwYXJlbnRcbiAgICAgKiBzdXJmYWNlcy4gTm90ZSwgdGhhdCB5b3UgZG9uJ3QgbmVlZCB0byBlbmFibGUgYmxlbmRpbmcgdG8gbWFrZSBhbHBoYSB0byBjb3ZlcmFnZSB3b3JrLiBJdFxuICAgICAqIHdpbGwgd29yayB3aXRob3V0IGl0LCBqdXN0IGxpa2UgYWxwaGFUZXN0LlxuICAgICAqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgYWxwaGFUb0NvdmVyYWdlID0gZmFsc2U7XG5cbiAgICAvKiogQGlnbm9yZSAqL1xuICAgIF9ibGVuZFN0YXRlID0gbmV3IEJsZW5kU3RhdGUoKTtcblxuICAgIC8qKiBAaWdub3JlICovXG4gICAgX2RlcHRoU3RhdGUgPSBuZXcgRGVwdGhTdGF0ZSgpO1xuXG4gICAgLyoqXG4gICAgICogQ29udHJvbHMgaG93IHRyaWFuZ2xlcyBhcmUgY3VsbGVkIGJhc2VkIG9uIHRoZWlyIGZhY2UgZGlyZWN0aW9uIHdpdGggcmVzcGVjdCB0byB0aGVcbiAgICAgKiB2aWV3cG9pbnQuIENhbiBiZTpcbiAgICAgKlxuICAgICAqIC0ge0BsaW5rIENVTExGQUNFX05PTkV9OiBEbyBub3QgY3VsbCB0cmlhbmdsZXMgYmFzZWQgb24gZmFjZSBkaXJlY3Rpb24uXG4gICAgICogLSB7QGxpbmsgQ1VMTEZBQ0VfQkFDS306IEN1bGwgdGhlIGJhY2sgZmFjZXMgb2YgdHJpYW5nbGVzIChkbyBub3QgcmVuZGVyIHRyaWFuZ2xlcyBmYWNpbmdcbiAgICAgKiBhd2F5IGZyb20gdGhlIHZpZXcgcG9pbnQpLlxuICAgICAqIC0ge0BsaW5rIENVTExGQUNFX0ZST05UfTogQ3VsbCB0aGUgZnJvbnQgZmFjZXMgb2YgdHJpYW5nbGVzIChkbyBub3QgcmVuZGVyIHRyaWFuZ2xlcyBmYWNpbmdcbiAgICAgKiB0b3dhcmRzIHRoZSB2aWV3IHBvaW50KS5cbiAgICAgKlxuICAgICAqIERlZmF1bHRzIHRvIHtAbGluayBDVUxMRkFDRV9CQUNLfS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgY3VsbCA9IENVTExGQUNFX0JBQ0s7XG5cbiAgICAvKipcbiAgICAgKiBTdGVuY2lsIHBhcmFtZXRlcnMgZm9yIGZyb250IGZhY2VzIChkZWZhdWx0IGlzIG51bGwpLlxuICAgICAqXG4gICAgICogQHR5cGUge2ltcG9ydCgnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3Mvc3RlbmNpbC1wYXJhbWV0ZXJzLmpzJykuU3RlbmNpbFBhcmFtZXRlcnN8bnVsbH1cbiAgICAgKi9cbiAgICBzdGVuY2lsRnJvbnQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogU3RlbmNpbCBwYXJhbWV0ZXJzIGZvciBiYWNrIGZhY2VzIChkZWZhdWx0IGlzIG51bGwpLlxuICAgICAqXG4gICAgICogQHR5cGUge2ltcG9ydCgnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3Mvc3RlbmNpbC1wYXJhbWV0ZXJzLmpzJykuU3RlbmNpbFBhcmFtZXRlcnN8bnVsbH1cbiAgICAgKi9cbiAgICBzdGVuY2lsQmFjayA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBPZmZzZXRzIHRoZSBvdXRwdXQgZGVwdGggYnVmZmVyIHZhbHVlLiBVc2VmdWwgZm9yIGRlY2FscyB0byBwcmV2ZW50IHotZmlnaHRpbmcuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIGRlcHRoQmlhcyA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBTYW1lIGFzIHtAbGluayBNYXRlcmlhbCNkZXB0aEJpYXN9LCBidXQgYWxzbyBkZXBlbmRzIG9uIHRoZSBzbG9wZSBvZiB0aGUgdHJpYW5nbGUgcmVsYXRpdmVcbiAgICAgKiB0byB0aGUgY2FtZXJhLlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBzbG9wZURlcHRoQmlhcyA9IDA7XG5cbiAgICBfc2hhZGVyVmVyc2lvbiA9IDA7XG5cbiAgICBfc2NlbmUgPSBudWxsO1xuXG4gICAgX2RpcnR5QmxlbmQgPSBmYWxzZTtcblxuICAgIGRpcnR5ID0gdHJ1ZTtcblxuICAgIC8qKlxuICAgICAqIElmIHRydWUsIHRoZSByZWQgY29tcG9uZW50IG9mIGZyYWdtZW50cyBnZW5lcmF0ZWQgYnkgdGhlIHNoYWRlciBvZiB0aGlzIG1hdGVyaWFsIGlzIHdyaXR0ZW5cbiAgICAgKiB0byB0aGUgY29sb3IgYnVmZmVyIG9mIHRoZSBjdXJyZW50bHkgYWN0aXZlIHJlbmRlciB0YXJnZXQuIElmIGZhbHNlLCB0aGUgcmVkIGNvbXBvbmVudCB3aWxsXG4gICAgICogbm90IGJlIHdyaXR0ZW4uIERlZmF1bHRzIHRvIHRydWUuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBzZXQgcmVkV3JpdGUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fYmxlbmRTdGF0ZS5yZWRXcml0ZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCByZWRXcml0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JsZW5kU3RhdGUucmVkV3JpdGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWYgdHJ1ZSwgdGhlIGdyZWVuIGNvbXBvbmVudCBvZiBmcmFnbWVudHMgZ2VuZXJhdGVkIGJ5IHRoZSBzaGFkZXIgb2YgdGhpcyBtYXRlcmlhbCBpc1xuICAgICAqIHdyaXR0ZW4gdG8gdGhlIGNvbG9yIGJ1ZmZlciBvZiB0aGUgY3VycmVudGx5IGFjdGl2ZSByZW5kZXIgdGFyZ2V0LiBJZiBmYWxzZSwgdGhlIGdyZWVuXG4gICAgICogY29tcG9uZW50IHdpbGwgbm90IGJlIHdyaXR0ZW4uIERlZmF1bHRzIHRvIHRydWUuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBzZXQgZ3JlZW5Xcml0ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9ibGVuZFN0YXRlLmdyZWVuV3JpdGUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgZ3JlZW5Xcml0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JsZW5kU3RhdGUuZ3JlZW5Xcml0ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiB0cnVlLCB0aGUgYmx1ZSBjb21wb25lbnQgb2YgZnJhZ21lbnRzIGdlbmVyYXRlZCBieSB0aGUgc2hhZGVyIG9mIHRoaXMgbWF0ZXJpYWwgaXNcbiAgICAgKiB3cml0dGVuIHRvIHRoZSBjb2xvciBidWZmZXIgb2YgdGhlIGN1cnJlbnRseSBhY3RpdmUgcmVuZGVyIHRhcmdldC4gSWYgZmFsc2UsIHRoZSBibHVlXG4gICAgICogY29tcG9uZW50IHdpbGwgbm90IGJlIHdyaXR0ZW4uIERlZmF1bHRzIHRvIHRydWUuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBzZXQgYmx1ZVdyaXRlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2JsZW5kU3RhdGUuYmx1ZVdyaXRlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IGJsdWVXcml0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JsZW5kU3RhdGUuYmx1ZVdyaXRlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIHRydWUsIHRoZSBhbHBoYSBjb21wb25lbnQgb2YgZnJhZ21lbnRzIGdlbmVyYXRlZCBieSB0aGUgc2hhZGVyIG9mIHRoaXMgbWF0ZXJpYWwgaXNcbiAgICAgKiB3cml0dGVuIHRvIHRoZSBjb2xvciBidWZmZXIgb2YgdGhlIGN1cnJlbnRseSBhY3RpdmUgcmVuZGVyIHRhcmdldC4gSWYgZmFsc2UsIHRoZSBhbHBoYVxuICAgICAqIGNvbXBvbmVudCB3aWxsIG5vdCBiZSB3cml0dGVuLiBEZWZhdWx0cyB0byB0cnVlLlxuICAgICAqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgc2V0IGFscGhhV3JpdGUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fYmxlbmRTdGF0ZS5hbHBoYVdyaXRlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IGFscGhhV3JpdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ibGVuZFN0YXRlLmFscGhhV3JpdGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIHNoYWRlciB1c2VkIGJ5IHRoaXMgbWF0ZXJpYWwgdG8gcmVuZGVyIG1lc2ggaW5zdGFuY2VzIChkZWZhdWx0IGlzIG51bGwpLlxuICAgICAqXG4gICAgICogQHR5cGUge2ltcG9ydCgnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3Mvc2hhZGVyLmpzJykuU2hhZGVyfG51bGx9XG4gICAgICovXG4gICAgc2V0IHNoYWRlcihzaGFkZXIpIHtcbiAgICAgICAgdGhpcy5fc2hhZGVyID0gc2hhZGVyO1xuICAgIH1cblxuICAgIGdldCBzaGFkZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFkZXI7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyBib29sZWFuIGRlcGVuZGluZyBvbiBtYXRlcmlhbCBiZWluZyB0cmFuc3BhcmVudFxuICAgIGdldCB0cmFuc3BhcmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JsZW5kU3RhdGUuYmxlbmQ7XG4gICAgfVxuXG4gICAgLy8gY2FsbGVkIHdoZW4gbWF0ZXJpYWwgY2hhbmdlcyB0cmFuc3BhcmVuY3ksIGZvciBsYXllciBjb21wb3NpdGlvbiB0byBhZGQgaXQgdG8gYXBwcm9wcmlhdGVcbiAgICAvLyBxdWV1ZSAob3BhcXVlIG9yIHRyYW5zcGFyZW50KVxuICAgIF9tYXJrQmxlbmREaXJ0eSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NjZW5lKSB7XG4gICAgICAgICAgICB0aGlzLl9zY2VuZS5sYXllcnMuX2RpcnR5QmxlbmQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZGlydHlCbGVuZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb250cm9scyBob3cgZnJhZ21lbnQgc2hhZGVyIG91dHB1dHMgYXJlIGJsZW5kZWQgd2hlbiBiZWluZyB3cml0dGVuIHRvIHRoZSBjdXJyZW50bHkgYWN0aXZlXG4gICAgICogcmVuZGVyIHRhcmdldC4gVGhpcyBvdmVyd3JpdGVzIGJsZW5kaW5nIHR5cGUgc2V0IHVzaW5nIHtAbGluayBNYXRlcmlhbCNibGVuZFR5cGV9LCBhbmRcbiAgICAgKiBvZmZlcnMgbW9yZSBjb250cm9sIG92ZXIgYmxlbmRpbmcuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7IEJsZW5kU3RhdGUgfVxuICAgICAqL1xuICAgIHNldCBibGVuZFN0YXRlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLl9ibGVuZFN0YXRlLmJsZW5kICE9PSB2YWx1ZS5ibGVuZCkge1xuICAgICAgICAgICAgdGhpcy5fbWFya0JsZW5kRGlydHkoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ibGVuZFN0YXRlLmNvcHkodmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBibGVuZFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYmxlbmRTdGF0ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb250cm9scyBob3cgZnJhZ21lbnQgc2hhZGVyIG91dHB1dHMgYXJlIGJsZW5kZWQgd2hlbiBiZWluZyB3cml0dGVuIHRvIHRoZSBjdXJyZW50bHkgYWN0aXZlXG4gICAgICogcmVuZGVyIHRhcmdldC4gQ2FuIGJlOlxuICAgICAqXG4gICAgICogLSB7QGxpbmsgQkxFTkRfU1VCVFJBQ1RJVkV9OiBTdWJ0cmFjdCB0aGUgY29sb3Igb2YgdGhlIHNvdXJjZSBmcmFnbWVudCBmcm9tIHRoZSBkZXN0aW5hdGlvblxuICAgICAqIGZyYWdtZW50IGFuZCB3cml0ZSB0aGUgcmVzdWx0IHRvIHRoZSBmcmFtZSBidWZmZXIuXG4gICAgICogLSB7QGxpbmsgQkxFTkRfQURESVRJVkV9OiBBZGQgdGhlIGNvbG9yIG9mIHRoZSBzb3VyY2UgZnJhZ21lbnQgdG8gdGhlIGRlc3RpbmF0aW9uIGZyYWdtZW50XG4gICAgICogYW5kIHdyaXRlIHRoZSByZXN1bHQgdG8gdGhlIGZyYW1lIGJ1ZmZlci5cbiAgICAgKiAtIHtAbGluayBCTEVORF9OT1JNQUx9OiBFbmFibGUgc2ltcGxlIHRyYW5zbHVjZW5jeSBmb3IgbWF0ZXJpYWxzIHN1Y2ggYXMgZ2xhc3MuIFRoaXMgaXNcbiAgICAgKiBlcXVpdmFsZW50IHRvIGVuYWJsaW5nIGEgc291cmNlIGJsZW5kIG1vZGUgb2Yge0BsaW5rIEJMRU5ETU9ERV9TUkNfQUxQSEF9IGFuZCBhIGRlc3RpbmF0aW9uXG4gICAgICogYmxlbmQgbW9kZSBvZiB7QGxpbmsgQkxFTkRNT0RFX09ORV9NSU5VU19TUkNfQUxQSEF9LlxuICAgICAqIC0ge0BsaW5rIEJMRU5EX05PTkV9OiBEaXNhYmxlIGJsZW5kaW5nLlxuICAgICAqIC0ge0BsaW5rIEJMRU5EX1BSRU1VTFRJUExJRUR9OiBTaW1pbGFyIHRvIHtAbGluayBCTEVORF9OT1JNQUx9IGV4cGVjdCB0aGUgc291cmNlIGZyYWdtZW50IGlzXG4gICAgICogYXNzdW1lZCB0byBoYXZlIGFscmVhZHkgYmVlbiBtdWx0aXBsaWVkIGJ5IHRoZSBzb3VyY2UgYWxwaGEgdmFsdWUuXG4gICAgICogLSB7QGxpbmsgQkxFTkRfTVVMVElQTElDQVRJVkV9OiBNdWx0aXBseSB0aGUgY29sb3Igb2YgdGhlIHNvdXJjZSBmcmFnbWVudCBieSB0aGUgY29sb3Igb2YgdGhlXG4gICAgICogZGVzdGluYXRpb24gZnJhZ21lbnQgYW5kIHdyaXRlIHRoZSByZXN1bHQgdG8gdGhlIGZyYW1lIGJ1ZmZlci5cbiAgICAgKiAtIHtAbGluayBCTEVORF9BRERJVElWRUFMUEhBfTogU2FtZSBhcyB7QGxpbmsgQkxFTkRfQURESVRJVkV9IGV4Y2VwdCB0aGUgc291cmNlIFJHQiBpc1xuICAgICAqIG11bHRpcGxpZWQgYnkgdGhlIHNvdXJjZSBhbHBoYS5cbiAgICAgKiAtIHtAbGluayBCTEVORF9NVUxUSVBMSUNBVElWRTJYfTogTXVsdGlwbGllcyBjb2xvcnMgYW5kIGRvdWJsZXMgdGhlIHJlc3VsdC5cbiAgICAgKiAtIHtAbGluayBCTEVORF9TQ1JFRU59OiBTb2Z0ZXIgdmVyc2lvbiBvZiBhZGRpdGl2ZS5cbiAgICAgKiAtIHtAbGluayBCTEVORF9NSU59OiBNaW5pbXVtIGNvbG9yLiBDaGVjayBhcHAuZ3JhcGhpY3NEZXZpY2UuZXh0QmxlbmRNaW5tYXggZm9yIHN1cHBvcnQuXG4gICAgICogLSB7QGxpbmsgQkxFTkRfTUFYfTogTWF4aW11bSBjb2xvci4gQ2hlY2sgYXBwLmdyYXBoaWNzRGV2aWNlLmV4dEJsZW5kTWlubWF4IGZvciBzdXBwb3J0LlxuICAgICAqXG4gICAgICogRGVmYXVsdHMgdG8ge0BsaW5rIEJMRU5EX05PTkV9LlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBzZXQgYmxlbmRUeXBlKHR5cGUpIHtcblxuICAgICAgICBjb25zdCBibGVuZE1vZGUgPSBibGVuZE1vZGVzW3R5cGVdO1xuICAgICAgICBEZWJ1Zy5hc3NlcnQoYmxlbmRNb2RlLCBgVW5rbm93biBibGVuZCBtb2RlICR7dHlwZX1gKTtcbiAgICAgICAgdGhpcy5fYmxlbmRTdGF0ZS5zZXRDb2xvckJsZW5kKGJsZW5kTW9kZS5vcCwgYmxlbmRNb2RlLnNyYywgYmxlbmRNb2RlLmRzdCk7XG4gICAgICAgIHRoaXMuX2JsZW5kU3RhdGUuc2V0QWxwaGFCbGVuZChibGVuZE1vZGUub3AsIGJsZW5kTW9kZS5zcmMsIGJsZW5kTW9kZS5kc3QpO1xuXG4gICAgICAgIGNvbnN0IGJsZW5kID0gdHlwZSAhPT0gQkxFTkRfTk9ORTtcbiAgICAgICAgaWYgKHRoaXMuX2JsZW5kU3RhdGUuYmxlbmQgIT09IGJsZW5kKSB7XG4gICAgICAgICAgICB0aGlzLl9ibGVuZFN0YXRlLmJsZW5kID0gYmxlbmQ7XG4gICAgICAgICAgICB0aGlzLl9tYXJrQmxlbmREaXJ0eSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3VwZGF0ZU1lc2hJbnN0YW5jZUtleXMoKTtcbiAgICB9XG5cbiAgICBnZXQgYmxlbmRUeXBlKCkge1xuICAgICAgICBpZiAoIXRoaXMudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBCTEVORF9OT05FO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeyBjb2xvck9wLCBjb2xvclNyY0ZhY3RvciwgY29sb3JEc3RGYWN0b3IsIGFscGhhT3AsIGFscGhhU3JjRmFjdG9yLCBhbHBoYURzdEZhY3RvciB9ID0gdGhpcy5fYmxlbmRTdGF0ZTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJsZW5kTW9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJsZW5kTW9kZSA9IGJsZW5kTW9kZXNbaV07XG4gICAgICAgICAgICBpZiAoYmxlbmRNb2RlLnNyYyA9PT0gY29sb3JTcmNGYWN0b3IgJiYgYmxlbmRNb2RlLmRzdCA9PT0gY29sb3JEc3RGYWN0b3IgJiYgYmxlbmRNb2RlLm9wID09PSBjb2xvck9wICYmXG4gICAgICAgICAgICAgICAgYmxlbmRNb2RlLnNyYyA9PT0gYWxwaGFTcmNGYWN0b3IgJiYgYmxlbmRNb2RlLmRzdCA9PT0gYWxwaGFEc3RGYWN0b3IgJiYgYmxlbmRNb2RlLm9wID09PSBhbHBoYU9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gQkxFTkRfTk9STUFMO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGRlcHRoIHN0YXRlLiBOb3RlIHRoYXQgdGhpcyBjYW4gYWxzbyBiZSBkb25lIGJ5IHVzaW5nIHtAbGluayBNYXRlcmlhbCNkZXB0aFRlc3R9LFxuICAgICAqIHtAbGluayBNYXRlcmlhbCNkZXB0aEZ1bmN9IGFuZCB7QGxpbmsgTWF0ZXJpYWwjZGVwdGhXcml0ZX0uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7IERlcHRoU3RhdGUgfVxuICAgICAqL1xuICAgIHNldCBkZXB0aFN0YXRlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2RlcHRoU3RhdGUuY29weSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGRlcHRoU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZXB0aFN0YXRlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIHRydWUsIGZyYWdtZW50cyBnZW5lcmF0ZWQgYnkgdGhlIHNoYWRlciBvZiB0aGlzIG1hdGVyaWFsIGFyZSBvbmx5IHdyaXR0ZW4gdG8gdGhlIGN1cnJlbnRcbiAgICAgKiByZW5kZXIgdGFyZ2V0IGlmIHRoZXkgcGFzcyB0aGUgZGVwdGggdGVzdC4gSWYgZmFsc2UsIGZyYWdtZW50cyBnZW5lcmF0ZWQgYnkgdGhlIHNoYWRlciBvZlxuICAgICAqIHRoaXMgbWF0ZXJpYWwgYXJlIHdyaXR0ZW4gdG8gdGhlIGN1cnJlbnQgcmVuZGVyIHRhcmdldCByZWdhcmRsZXNzIG9mIHdoYXQgaXMgaW4gdGhlIGRlcHRoXG4gICAgICogYnVmZmVyLiBEZWZhdWx0cyB0byB0cnVlLlxuICAgICAqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgc2V0IGRlcHRoVGVzdCh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9kZXB0aFN0YXRlLnRlc3QgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgZGVwdGhUZXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVwdGhTdGF0ZS50ZXN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnRyb2xzIGhvdyB0aGUgZGVwdGggb2YgbmV3IGZyYWdtZW50cyBpcyBjb21wYXJlZCBhZ2FpbnN0IHRoZSBjdXJyZW50IGRlcHRoIGNvbnRhaW5lZCBpblxuICAgICAqIHRoZSBkZXB0aCBidWZmZXIuIENhbiBiZTpcbiAgICAgKlxuICAgICAqIC0ge0BsaW5rIEZVTkNfTkVWRVJ9OiBkb24ndCBkcmF3XG4gICAgICogLSB7QGxpbmsgRlVOQ19MRVNTfTogZHJhdyBpZiBuZXcgZGVwdGggPCBkZXB0aCBidWZmZXJcbiAgICAgKiAtIHtAbGluayBGVU5DX0VRVUFMfTogZHJhdyBpZiBuZXcgZGVwdGggPT0gZGVwdGggYnVmZmVyXG4gICAgICogLSB7QGxpbmsgRlVOQ19MRVNTRVFVQUx9OiBkcmF3IGlmIG5ldyBkZXB0aCA8PSBkZXB0aCBidWZmZXJcbiAgICAgKiAtIHtAbGluayBGVU5DX0dSRUFURVJ9OiBkcmF3IGlmIG5ldyBkZXB0aCA+IGRlcHRoIGJ1ZmZlclxuICAgICAqIC0ge0BsaW5rIEZVTkNfTk9URVFVQUx9OiBkcmF3IGlmIG5ldyBkZXB0aCAhPSBkZXB0aCBidWZmZXJcbiAgICAgKiAtIHtAbGluayBGVU5DX0dSRUFURVJFUVVBTH06IGRyYXcgaWYgbmV3IGRlcHRoID49IGRlcHRoIGJ1ZmZlclxuICAgICAqIC0ge0BsaW5rIEZVTkNfQUxXQVlTfTogYWx3YXlzIGRyYXdcbiAgICAgKlxuICAgICAqIERlZmF1bHRzIHRvIHtAbGluayBGVU5DX0xFU1NFUVVBTH0uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHNldCBkZXB0aEZ1bmModmFsdWUpIHtcbiAgICAgICAgdGhpcy5fZGVwdGhTdGF0ZS5mdW5jID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IGRlcHRoRnVuYygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlcHRoU3RhdGUuZnVuYztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiB0cnVlLCBmcmFnbWVudHMgZ2VuZXJhdGVkIGJ5IHRoZSBzaGFkZXIgb2YgdGhpcyBtYXRlcmlhbCB3cml0ZSBhIGRlcHRoIHZhbHVlIHRvIHRoZSBkZXB0aFxuICAgICAqIGJ1ZmZlciBvZiB0aGUgY3VycmVudGx5IGFjdGl2ZSByZW5kZXIgdGFyZ2V0LiBJZiBmYWxzZSwgbm8gZGVwdGggdmFsdWUgaXMgd3JpdHRlbi4gRGVmYXVsdHNcbiAgICAgKiB0byB0cnVlLlxuICAgICAqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgc2V0IGRlcHRoV3JpdGUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fZGVwdGhTdGF0ZS53cml0ZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCBkZXB0aFdyaXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVwdGhTdGF0ZS53cml0ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb3B5IGEgbWF0ZXJpYWwuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge01hdGVyaWFsfSBzb3VyY2UgLSBUaGUgbWF0ZXJpYWwgdG8gY29weS5cbiAgICAgKiBAcmV0dXJucyB7TWF0ZXJpYWx9IFRoZSBkZXN0aW5hdGlvbiBtYXRlcmlhbC5cbiAgICAgKi9cbiAgICBjb3B5KHNvdXJjZSkge1xuICAgICAgICB0aGlzLm5hbWUgPSBzb3VyY2UubmFtZTtcbiAgICAgICAgdGhpcy5fc2hhZGVyID0gc291cmNlLl9zaGFkZXI7XG5cbiAgICAgICAgLy8gUmVuZGVyIHN0YXRlc1xuICAgICAgICB0aGlzLmFscGhhVGVzdCA9IHNvdXJjZS5hbHBoYVRlc3Q7XG4gICAgICAgIHRoaXMuYWxwaGFUb0NvdmVyYWdlID0gc291cmNlLmFscGhhVG9Db3ZlcmFnZTtcblxuICAgICAgICB0aGlzLl9ibGVuZFN0YXRlLmNvcHkoc291cmNlLl9ibGVuZFN0YXRlKTtcbiAgICAgICAgdGhpcy5fZGVwdGhTdGF0ZS5jb3B5KHNvdXJjZS5fZGVwdGhTdGF0ZSk7XG5cbiAgICAgICAgdGhpcy5jdWxsID0gc291cmNlLmN1bGw7XG5cbiAgICAgICAgdGhpcy5kZXB0aEJpYXMgPSBzb3VyY2UuZGVwdGhCaWFzO1xuICAgICAgICB0aGlzLnNsb3BlRGVwdGhCaWFzID0gc291cmNlLnNsb3BlRGVwdGhCaWFzO1xuXG4gICAgICAgIHRoaXMuc3RlbmNpbEZyb250ID0gc291cmNlLnN0ZW5jaWxGcm9udD8uY2xvbmUoKTtcbiAgICAgICAgaWYgKHNvdXJjZS5zdGVuY2lsQmFjaykge1xuICAgICAgICAgICAgdGhpcy5zdGVuY2lsQmFjayA9IHNvdXJjZS5zdGVuY2lsRnJvbnQgPT09IHNvdXJjZS5zdGVuY2lsQmFjayA/IHRoaXMuc3RlbmNpbEZyb250IDogc291cmNlLnN0ZW5jaWxCYWNrLmNsb25lKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9uZSBhIG1hdGVyaWFsLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3RoaXN9IEEgbmV3bHkgY2xvbmVkIG1hdGVyaWFsLlxuICAgICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjbG9uZSA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKCk7XG4gICAgICAgIHJldHVybiBjbG9uZS5jb3B5KHRoaXMpO1xuICAgIH1cblxuICAgIF91cGRhdGVNZXNoSW5zdGFuY2VLZXlzKCkge1xuICAgICAgICBjb25zdCBtZXNoSW5zdGFuY2VzID0gdGhpcy5tZXNoSW5zdGFuY2VzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lc2hJbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG1lc2hJbnN0YW5jZXNbaV0udXBkYXRlS2V5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVVbmlmb3JtcyhkZXZpY2UsIHNjZW5lKSB7XG4gICAgfVxuXG4gICAgZ2V0U2hhZGVyVmFyaWFudChkZXZpY2UsIHNjZW5lLCBvYmpEZWZzLCBzdGF0aWNMaWdodExpc3QsIHBhc3MsIHNvcnRlZExpZ2h0cywgdmlld1VuaWZvcm1Gb3JtYXQsIHZpZXdCaW5kR3JvdXBGb3JtYXQsIHZlcnRleEZvcm1hdCkge1xuXG4gICAgICAgIC8vIGdlbmVyYXRlIHNoYWRlciB2YXJpYW50IC0gaXRzIHRoZSBzYW1lIHNoYWRlciwgYnV0IHdpdGggZGlmZmVyZW50IHByb2Nlc3Npbmcgb3B0aW9uc1xuICAgICAgICBjb25zdCBwcm9jZXNzaW5nT3B0aW9ucyA9IG5ldyBTaGFkZXJQcm9jZXNzb3JPcHRpb25zKHZpZXdVbmlmb3JtRm9ybWF0LCB2aWV3QmluZEdyb3VwRm9ybWF0LCB2ZXJ0ZXhGb3JtYXQpO1xuICAgICAgICByZXR1cm4gcHJvY2Vzc1NoYWRlcih0aGlzLl9zaGFkZXIsIHByb2Nlc3NpbmdPcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGFueSBjaGFuZ2VzIG1hZGUgdG8gdGhlIG1hdGVyaWFsJ3MgcHJvcGVydGllcy5cbiAgICAgKi9cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5fc2hhZGVyKSB0aGlzLl9zaGFkZXIuZmFpbGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gUGFyYW1ldGVyIG1hbmFnZW1lbnRcbiAgICBjbGVhclBhcmFtZXRlcnMoKSB7XG4gICAgICAgIHRoaXMucGFyYW1ldGVycyA9IHt9O1xuICAgIH1cblxuICAgIGdldFBhcmFtZXRlcnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtZXRlcnM7XG4gICAgfVxuXG4gICAgY2xlYXJWYXJpYW50cygpIHtcblxuICAgICAgICAvLyBjbGVhciB2YXJpYW50cyBvbiB0aGUgbWF0ZXJpYWxcbiAgICAgICAgdGhpcy52YXJpYW50cyA9IHt9O1xuXG4gICAgICAgIC8vIGJ1dCBhbHNvIGNsZWFyIHRoZW0gZnJvbSBhbGwgbWF0ZXJpYWxzIHRoYXQgcmVmZXJlbmNlIHRoZW1cbiAgICAgICAgY29uc3QgbWVzaEluc3RhbmNlcyA9IHRoaXMubWVzaEluc3RhbmNlcztcbiAgICAgICAgY29uc3QgY291bnQgPSBtZXNoSW5zdGFuY2VzLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBtZXNoSW5zdGFuY2VzW2ldLmNsZWFyU2hhZGVycygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIHRoZSBzcGVjaWZpZWQgc2hhZGVyIHBhcmFtZXRlciBmcm9tIGEgbWF0ZXJpYWwuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIgdG8gcXVlcnkuXG4gICAgICogQHJldHVybnMge29iamVjdH0gVGhlIG5hbWVkIHBhcmFtZXRlci5cbiAgICAgKi9cbiAgICBnZXRQYXJhbWV0ZXIobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbWV0ZXJzW25hbWVdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgYSBzaGFkZXIgcGFyYW1ldGVyIG9uIGEgbWF0ZXJpYWwuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIgdG8gc2V0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfG51bWJlcltdfEZsb2F0MzJBcnJheXxpbXBvcnQoJy4uLy4uL3BsYXRmb3JtL2dyYXBoaWNzL3RleHR1cmUuanMnKS5UZXh0dXJlfSBkYXRhIC1cbiAgICAgKiBUaGUgdmFsdWUgZm9yIHRoZSBzcGVjaWZpZWQgcGFyYW1ldGVyLlxuICAgICAqL1xuICAgIHNldFBhcmFtZXRlcihuYW1lLCBkYXRhKSB7XG5cbiAgICAgICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1PYmplY3QgPSBuYW1lO1xuICAgICAgICAgICAgaWYgKHVuaWZvcm1PYmplY3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1bmlmb3JtT2JqZWN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UGFyYW1ldGVyKHVuaWZvcm1PYmplY3RbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuYW1lID0gdW5pZm9ybU9iamVjdC5uYW1lO1xuICAgICAgICAgICAgZGF0YSA9IHVuaWZvcm1PYmplY3QudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJhbSA9IHRoaXMucGFyYW1ldGVyc1tuYW1lXTtcbiAgICAgICAgaWYgKHBhcmFtKSB7XG4gICAgICAgICAgICBwYXJhbS5kYXRhID0gZGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGFyYW1ldGVyc1tuYW1lXSA9IHtcbiAgICAgICAgICAgICAgICBzY29wZUlkOiBudWxsLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIGEgc2hhZGVyIHBhcmFtZXRlciBvbiBhIG1hdGVyaWFsLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyIHRvIGRlbGV0ZS5cbiAgICAgKi9cbiAgICBkZWxldGVQYXJhbWV0ZXIobmFtZSkge1xuICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzW25hbWVdKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5wYXJhbWV0ZXJzW25hbWVdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gdXNlZCB0byBhcHBseSBwYXJhbWV0ZXJzIGZyb20gdGhpcyBtYXRlcmlhbCBpbnRvIHNjb3BlIG9mIHVuaWZvcm1zLCBjYWxsZWQgaW50ZXJuYWxseSBieSBmb3J3YXJkLXJlbmRlcmVyXG4gICAgLy8gb3B0aW9uYWwgbGlzdCBvZiBwYXJhbWV0ZXIgbmFtZXMgdG8gYmUgc2V0IGNhbiBiZSBzcGVjaWZpZWQsIG90aGVyd2lzZSBhbGwgcGFyYW1ldGVycyBhcmUgc2V0XG4gICAgc2V0UGFyYW1ldGVycyhkZXZpY2UsIG5hbWVzKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlcnM7XG4gICAgICAgIGlmIChuYW1lcyA9PT0gdW5kZWZpbmVkKSBuYW1lcyA9IHBhcmFtZXRlcnM7XG4gICAgICAgIGZvciAoY29uc3QgcGFyYW1OYW1lIGluIG5hbWVzKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXIgPSBwYXJhbWV0ZXJzW3BhcmFtTmFtZV07XG4gICAgICAgICAgICBpZiAocGFyYW1ldGVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbWV0ZXIuc2NvcGVJZCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXIuc2NvcGVJZCA9IGRldmljZS5zY29wZS5yZXNvbHZlKHBhcmFtTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhcmFtZXRlci5zY29wZUlkLnNldFZhbHVlKHBhcmFtZXRlci5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhpcyBtYXRlcmlhbCBmcm9tIHRoZSBzY2VuZSBhbmQgcG9zc2libHkgZnJlZXMgdXAgbWVtb3J5IGZyb20gaXRzIHNoYWRlcnMgKGlmIHRoZXJlXG4gICAgICogYXJlIG5vIG90aGVyIG1hdGVyaWFscyB1c2luZyBpdCkuXG4gICAgICovXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy52YXJpYW50cyA9IHt9O1xuICAgICAgICB0aGlzLl9zaGFkZXIgPSBudWxsO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5tZXNoSW5zdGFuY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNoSW5zdGFuY2UgPSB0aGlzLm1lc2hJbnN0YW5jZXNbaV07XG4gICAgICAgICAgICBtZXNoSW5zdGFuY2UuY2xlYXJTaGFkZXJzKCk7XG4gICAgICAgICAgICBtZXNoSW5zdGFuY2UuX21hdGVyaWFsID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKG1lc2hJbnN0YW5jZS5tZXNoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdE1hdGVyaWFsID0gZ2V0RGVmYXVsdE1hdGVyaWFsKG1lc2hJbnN0YW5jZS5tZXNoLmRldmljZSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMgIT09IGRlZmF1bHRNYXRlcmlhbCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNoSW5zdGFuY2UubWF0ZXJpYWwgPSBkZWZhdWx0TWF0ZXJpYWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBEZWJ1Zy53YXJuKCdwYy5NYXRlcmlhbDogTWVzaEluc3RhbmNlLm1lc2ggaXMgbnVsbCwgZGVmYXVsdCBtYXRlcmlhbCBjYW5ub3QgYmUgYXNzaWduZWQgdG8gdGhlIE1lc2hJbnN0YW5jZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tZXNoSW5zdGFuY2VzLmxlbmd0aCA9IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIG1lc2ggaW5zdGFuY2UgYXMgcmVmZXJlbmNpbmcgdGhlIG1hdGVyaWFsLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4uL21lc2gtaW5zdGFuY2UuanMnKS5NZXNoSW5zdGFuY2V9IG1lc2hJbnN0YW5jZSAtIFRoZSBtZXNoIGluc3RhbmNlIHRvXG4gICAgICogZGUtcmVnaXN0ZXIuXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIGFkZE1lc2hJbnN0YW5jZVJlZihtZXNoSW5zdGFuY2UpIHtcbiAgICAgICAgdGhpcy5tZXNoSW5zdGFuY2VzLnB1c2gobWVzaEluc3RhbmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZS1yZWdpc3RlcnMgbWVzaCBpbnN0YW5jZSBhcyByZWZlcmVuY2luZyB0aGUgbWF0ZXJpYWwuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vbWVzaC1pbnN0YW5jZS5qcycpLk1lc2hJbnN0YW5jZX0gbWVzaEluc3RhbmNlIC0gVGhlIG1lc2ggaW5zdGFuY2UgdG9cbiAgICAgKiBkZS1yZWdpc3Rlci5cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgcmVtb3ZlTWVzaEluc3RhbmNlUmVmKG1lc2hJbnN0YW5jZSkge1xuICAgICAgICBjb25zdCBtZXNoSW5zdGFuY2VzID0gdGhpcy5tZXNoSW5zdGFuY2VzO1xuICAgICAgICBjb25zdCBpID0gbWVzaEluc3RhbmNlcy5pbmRleE9mKG1lc2hJbnN0YW5jZSk7XG4gICAgICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgICAgICAgbWVzaEluc3RhbmNlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IE1hdGVyaWFsIH07XG4iXSwibmFtZXMiOlsiYmxlbmRNb2RlcyIsIkJMRU5EX1NVQlRSQUNUSVZFIiwic3JjIiwiQkxFTkRNT0RFX09ORSIsImRzdCIsIm9wIiwiQkxFTkRFUVVBVElPTl9SRVZFUlNFX1NVQlRSQUNUIiwiQkxFTkRfTk9ORSIsIkJMRU5ETU9ERV9aRVJPIiwiQkxFTkRFUVVBVElPTl9BREQiLCJCTEVORF9OT1JNQUwiLCJCTEVORE1PREVfU1JDX0FMUEhBIiwiQkxFTkRNT0RFX09ORV9NSU5VU19TUkNfQUxQSEEiLCJCTEVORF9QUkVNVUxUSVBMSUVEIiwiQkxFTkRfQURESVRJVkUiLCJCTEVORF9BRERJVElWRUFMUEhBIiwiQkxFTkRfTVVMVElQTElDQVRJVkUyWCIsIkJMRU5ETU9ERV9EU1RfQ09MT1IiLCJCTEVORE1PREVfU1JDX0NPTE9SIiwiQkxFTkRfU0NSRUVOIiwiQkxFTkRNT0RFX09ORV9NSU5VU19EU1RfQ09MT1IiLCJCTEVORF9NVUxUSVBMSUNBVElWRSIsIkJMRU5EX01JTiIsIkJMRU5ERVFVQVRJT05fTUlOIiwiQkxFTkRfTUFYIiwiQkxFTkRFUVVBVElPTl9NQVgiLCJpZCIsIk1hdGVyaWFsIiwiY29uc3RydWN0b3IiLCJfc2hhZGVyIiwibWVzaEluc3RhbmNlcyIsIm5hbWUiLCJ2YXJpYW50cyIsInBhcmFtZXRlcnMiLCJhbHBoYVRlc3QiLCJhbHBoYVRvQ292ZXJhZ2UiLCJfYmxlbmRTdGF0ZSIsIkJsZW5kU3RhdGUiLCJfZGVwdGhTdGF0ZSIsIkRlcHRoU3RhdGUiLCJjdWxsIiwiQ1VMTEZBQ0VfQkFDSyIsInN0ZW5jaWxGcm9udCIsInN0ZW5jaWxCYWNrIiwiZGVwdGhCaWFzIiwic2xvcGVEZXB0aEJpYXMiLCJfc2hhZGVyVmVyc2lvbiIsIl9zY2VuZSIsIl9kaXJ0eUJsZW5kIiwiZGlydHkiLCJyZWRXcml0ZSIsInZhbHVlIiwiZ3JlZW5Xcml0ZSIsImJsdWVXcml0ZSIsImFscGhhV3JpdGUiLCJzaGFkZXIiLCJ0cmFuc3BhcmVudCIsImJsZW5kIiwiX21hcmtCbGVuZERpcnR5IiwibGF5ZXJzIiwiYmxlbmRTdGF0ZSIsImNvcHkiLCJibGVuZFR5cGUiLCJ0eXBlIiwiYmxlbmRNb2RlIiwiRGVidWciLCJhc3NlcnQiLCJzZXRDb2xvckJsZW5kIiwic2V0QWxwaGFCbGVuZCIsIl91cGRhdGVNZXNoSW5zdGFuY2VLZXlzIiwiY29sb3JPcCIsImNvbG9yU3JjRmFjdG9yIiwiY29sb3JEc3RGYWN0b3IiLCJhbHBoYU9wIiwiYWxwaGFTcmNGYWN0b3IiLCJhbHBoYURzdEZhY3RvciIsImkiLCJsZW5ndGgiLCJkZXB0aFN0YXRlIiwiZGVwdGhUZXN0IiwidGVzdCIsImRlcHRoRnVuYyIsImZ1bmMiLCJkZXB0aFdyaXRlIiwid3JpdGUiLCJzb3VyY2UiLCJfc291cmNlJHN0ZW5jaWxGcm9udCIsImNsb25lIiwidXBkYXRlS2V5IiwidXBkYXRlVW5pZm9ybXMiLCJkZXZpY2UiLCJzY2VuZSIsImdldFNoYWRlclZhcmlhbnQiLCJvYmpEZWZzIiwic3RhdGljTGlnaHRMaXN0IiwicGFzcyIsInNvcnRlZExpZ2h0cyIsInZpZXdVbmlmb3JtRm9ybWF0Iiwidmlld0JpbmRHcm91cEZvcm1hdCIsInZlcnRleEZvcm1hdCIsInByb2Nlc3NpbmdPcHRpb25zIiwiU2hhZGVyUHJvY2Vzc29yT3B0aW9ucyIsInByb2Nlc3NTaGFkZXIiLCJ1cGRhdGUiLCJmYWlsZWQiLCJjbGVhclBhcmFtZXRlcnMiLCJnZXRQYXJhbWV0ZXJzIiwiY2xlYXJWYXJpYW50cyIsImNvdW50IiwiY2xlYXJTaGFkZXJzIiwiZ2V0UGFyYW1ldGVyIiwic2V0UGFyYW1ldGVyIiwiZGF0YSIsInVuZGVmaW5lZCIsInVuaWZvcm1PYmplY3QiLCJwYXJhbSIsInNjb3BlSWQiLCJkZWxldGVQYXJhbWV0ZXIiLCJzZXRQYXJhbWV0ZXJzIiwibmFtZXMiLCJwYXJhbU5hbWUiLCJwYXJhbWV0ZXIiLCJzY29wZSIsInJlc29sdmUiLCJzZXRWYWx1ZSIsImRlc3Ryb3kiLCJtZXNoSW5zdGFuY2UiLCJfbWF0ZXJpYWwiLCJtZXNoIiwiZGVmYXVsdE1hdGVyaWFsIiwiZ2V0RGVmYXVsdE1hdGVyaWFsIiwibWF0ZXJpYWwiLCJ3YXJuIiwiYWRkTWVzaEluc3RhbmNlUmVmIiwicHVzaCIsInJlbW92ZU1lc2hJbnN0YW5jZVJlZiIsImluZGV4T2YiLCJzcGxpY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQXNCQTtBQUNBLE1BQU1BLFVBQVUs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
