import { PRIMITIVE_TRISTRIP } from '../../platform/graphics/constants.js';
import { BLEND_NORMAL } from '../constants.js';
import { GraphNode } from '../graph-node.js';
import { Mesh } from '../mesh.js';
import { MeshInstance } from '../mesh-instance.js';
import { BasicMaterial } from '../materials/basic-material.js';
import { createShaderFromCode } from '../shader-lib/utils.js';
import { shaderChunks } from '../shader-lib/chunks/chunks.js';
import { ImmediateBatches } from './immediate-batches.js';

const tempPoints = [];
class Immediate {
  constructor(device) {
    this.device = device;
    this.quadMesh = null;
    this.textureShader = null;
    this.depthTextureShader = null;
    this.cubeLocalPos = null;
    this.cubeWorldPos = null;

    // map of Layer to ImmediateBatches, storing line batches for a layer
    this.batchesMap = new Map();

    // set of all batches that were used in the frame
    this.allBatches = new Set();

    // set of all layers updated during this frame
    this.updatedLayers = new Set();

    // line materials
    this._materialDepth = null;
    this._materialNoDepth = null;

    // map of meshes instances added to a layer. The key is layer, the value is an array of mesh instances
    this.layerMeshInstances = new Map();
  }

  // creates material for line rendering
  createMaterial(depthTest) {
    const material = new BasicMaterial();
    material.vertexColors = true;
    material.blendType = BLEND_NORMAL;
    material.depthTest = depthTest;
    material.update();
    return material;
  }

  // material for line rendering with depth testing on
  get materialDepth() {
    if (!this._materialDepth) {
      this._materialDepth = this.createMaterial(true);
    }
    return this._materialDepth;
  }

  // material for line rendering with depth testing off
  get materialNoDepth() {
    if (!this._materialNoDepth) {
      this._materialNoDepth = this.createMaterial(false);
    }
    return this._materialNoDepth;
  }

  // returns a batch for rendering lines to a layer with required depth testing state
  getBatch(layer, depthTest) {
    // get batches for the layer
    let batches = this.batchesMap.get(layer);
    if (!batches) {
      batches = new ImmediateBatches(this.device);
      this.batchesMap.set(layer, batches);
    }

    // add it for rendering
    this.allBatches.add(batches);

    // get batch for the material
    const material = depthTest ? this.materialDepth : this.materialNoDepth;
    return batches.getBatch(material, layer);
  }
  getShader(id, fragment) {
    if (!this[id]) {
      // shared vertex shader for textured quad rendering
      const vertex = `
                attribute vec2 vertex_position;
                uniform mat4 matrix_model;
                varying vec2 uv0;
                void main(void) {
                    gl_Position = matrix_model * vec4(vertex_position, 0, 1);
                    uv0 = vertex_position.xy + 0.5;
                }
            `;
      this[id] = createShaderFromCode(this.device, vertex, fragment, `DebugShader:${id}`);
    }
    return this[id];
  }

  // shader used to display texture
  getTextureShader() {
    return this.getShader('textureShader', `
            varying vec2 uv0;
            uniform sampler2D colorMap;
            void main (void) {
                gl_FragColor = vec4(texture2D(colorMap, uv0).xyz, 1);
            }
        `);
  }

  // shader used to display infilterable texture sampled using texelFetch
  getUnfilterableTextureShader() {
    return this.getShader('textureShaderUnfilterable', `
            varying vec2 uv0;
            uniform highp sampler2D colorMap;
            void main (void) {
                ivec2 uv = ivec2(uv0 * textureSize(colorMap, 0));
                gl_FragColor = vec4(texelFetch(colorMap, uv, 0).xyz, 1);
            }
        `);
  }

  // shader used to display depth texture
  getDepthTextureShader() {
    return this.getShader('depthTextureShader', `
            ${shaderChunks.screenDepthPS}
            varying vec2 uv0;
            void main() {
                float depth = getLinearScreenDepth(uv0) * camera_params.x;
                gl_FragColor = vec4(vec3(depth), 1.0);
            }
        `);
  }

  // creates mesh used to render a quad
  getQuadMesh() {
    if (!this.quadMesh) {
      this.quadMesh = new Mesh(this.device);
      this.quadMesh.setPositions([-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0]);
      this.quadMesh.update(PRIMITIVE_TRISTRIP);
    }
    return this.quadMesh;
  }

  // Draw mesh at this frame
  drawMesh(material, matrix, mesh, meshInstance, layer) {
    // create a mesh instance for the mesh if needed
    if (!meshInstance) {
      const graphNode = this.getGraphNode(matrix);
      meshInstance = new MeshInstance(mesh, material, graphNode);
    }

    // add the mesh instance to an array per layer, they get added to layers before rendering
    let layerMeshInstances = this.layerMeshInstances.get(layer);
    if (!layerMeshInstances) {
      layerMeshInstances = [];
      this.layerMeshInstances.set(layer, layerMeshInstances);
    }
    layerMeshInstances.push(meshInstance);
  }
  drawWireAlignedBox(min, max, color, depthTest, layer) {
    tempPoints.push(min.x, min.y, min.z, min.x, max.y, min.z, min.x, max.y, min.z, max.x, max.y, min.z, max.x, max.y, min.z, max.x, min.y, min.z, max.x, min.y, min.z, min.x, min.y, min.z, min.x, min.y, max.z, min.x, max.y, max.z, min.x, max.y, max.z, max.x, max.y, max.z, max.x, max.y, max.z, max.x, min.y, max.z, max.x, min.y, max.z, min.x, min.y, max.z, min.x, min.y, min.z, min.x, min.y, max.z, min.x, max.y, min.z, min.x, max.y, max.z, max.x, max.y, min.z, max.x, max.y, max.z, max.x, min.y, min.z, max.x, min.y, max.z);
    const batch = this.getBatch(layer, depthTest);
    batch.addLinesArrays(tempPoints, color);
    tempPoints.length = 0;
  }
  drawWireSphere(center, radius, color, numSegments, depthTest, layer) {
    const step = 2 * Math.PI / numSegments;
    let angle = 0;
    for (let i = 0; i < numSegments; i++) {
      const sin0 = Math.sin(angle);
      const cos0 = Math.cos(angle);
      angle += step;
      const sin1 = Math.sin(angle);
      const cos1 = Math.cos(angle);
      tempPoints.push(center.x + radius * sin0, center.y, center.z + radius * cos0);
      tempPoints.push(center.x + radius * sin1, center.y, center.z + radius * cos1);
      tempPoints.push(center.x + radius * sin0, center.y + radius * cos0, center.z);
      tempPoints.push(center.x + radius * sin1, center.y + radius * cos1, center.z);
      tempPoints.push(center.x, center.y + radius * sin0, center.z + radius * cos0);
      tempPoints.push(center.x, center.y + radius * sin1, center.z + radius * cos1);
    }
    const batch = this.getBatch(layer, depthTest);
    batch.addLinesArrays(tempPoints, color);
    tempPoints.length = 0;
  }
  getGraphNode(matrix) {
    const graphNode = new GraphNode('ImmediateDebug');
    graphNode.worldTransform = matrix;
    graphNode._dirtyWorld = graphNode._dirtyNormal = false;
    return graphNode;
  }

  // This is called just before the layer is rendered to allow lines for the layer to be added from inside
  // the frame getting rendered
  onPreRenderLayer(layer, visibleList, transparent) {
    // update line batches for the specified sub-layer
    this.batchesMap.forEach((batches, batchLayer) => {
      if (batchLayer === layer) {
        batches.onPreRender(visibleList, transparent);
      }
    });

    // only update meshes once for each layer (they're not per sub-layer at the moment)
    if (!this.updatedLayers.has(layer)) {
      this.updatedLayers.add(layer);

      // add mesh instances for specified layer to visible list
      const meshInstances = this.layerMeshInstances.get(layer);
      if (meshInstances) {
        for (let i = 0; i < meshInstances.length; i++) {
          visibleList.list[visibleList.length + i] = meshInstances[i];
        }
        visibleList.length += meshInstances.length;
        meshInstances.length = 0;
      }
    }
  }

  // called after the frame was rendered, clears data
  onPostRender() {
    // clean up line batches
    this.allBatches.clear();

    // all batches need updating next frame
    this.updatedLayers.clear();
  }
}

export { Immediate };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1tZWRpYXRlLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NlbmUvaW1tZWRpYXRlL2ltbWVkaWF0ZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQUklNSVRJVkVfVFJJU1RSSVAgfSBmcm9tICcuLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy9jb25zdGFudHMuanMnO1xuXG5pbXBvcnQgeyBCTEVORF9OT1JNQUwgfSBmcm9tICcuLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgR3JhcGhOb2RlIH0gZnJvbSAnLi4vZ3JhcGgtbm9kZS5qcyc7XG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vbWVzaC5qcyc7XG5pbXBvcnQgeyBNZXNoSW5zdGFuY2UgfSBmcm9tICcuLi9tZXNoLWluc3RhbmNlLmpzJztcbmltcG9ydCB7IEJhc2ljTWF0ZXJpYWwgfSBmcm9tICcuLi9tYXRlcmlhbHMvYmFzaWMtbWF0ZXJpYWwuanMnO1xuaW1wb3J0IHsgY3JlYXRlU2hhZGVyRnJvbUNvZGUgfSBmcm9tICcuLi9zaGFkZXItbGliL3V0aWxzLmpzJztcbmltcG9ydCB7IHNoYWRlckNodW5rcyB9IGZyb20gJy4uL3NoYWRlci1saWIvY2h1bmtzL2NodW5rcy5qcyc7XG5pbXBvcnQgeyBJbW1lZGlhdGVCYXRjaGVzIH0gZnJvbSAnLi9pbW1lZGlhdGUtYmF0Y2hlcy5qcyc7XG5cbmNvbnN0IHRlbXBQb2ludHMgPSBbXTtcblxuY2xhc3MgSW1tZWRpYXRlIHtcbiAgICBjb25zdHJ1Y3RvcihkZXZpY2UpIHtcbiAgICAgICAgdGhpcy5kZXZpY2UgPSBkZXZpY2U7XG4gICAgICAgIHRoaXMucXVhZE1lc2ggPSBudWxsO1xuICAgICAgICB0aGlzLnRleHR1cmVTaGFkZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmRlcHRoVGV4dHVyZVNoYWRlciA9IG51bGw7XG4gICAgICAgIHRoaXMuY3ViZUxvY2FsUG9zID0gbnVsbDtcbiAgICAgICAgdGhpcy5jdWJlV29ybGRQb3MgPSBudWxsO1xuXG4gICAgICAgIC8vIG1hcCBvZiBMYXllciB0byBJbW1lZGlhdGVCYXRjaGVzLCBzdG9yaW5nIGxpbmUgYmF0Y2hlcyBmb3IgYSBsYXllclxuICAgICAgICB0aGlzLmJhdGNoZXNNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLy8gc2V0IG9mIGFsbCBiYXRjaGVzIHRoYXQgd2VyZSB1c2VkIGluIHRoZSBmcmFtZVxuICAgICAgICB0aGlzLmFsbEJhdGNoZXMgPSBuZXcgU2V0KCk7XG5cbiAgICAgICAgLy8gc2V0IG9mIGFsbCBsYXllcnMgdXBkYXRlZCBkdXJpbmcgdGhpcyBmcmFtZVxuICAgICAgICB0aGlzLnVwZGF0ZWRMYXllcnMgPSBuZXcgU2V0KCk7XG5cbiAgICAgICAgLy8gbGluZSBtYXRlcmlhbHNcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWxEZXB0aCA9IG51bGw7XG4gICAgICAgIHRoaXMuX21hdGVyaWFsTm9EZXB0aCA9IG51bGw7XG5cbiAgICAgICAgLy8gbWFwIG9mIG1lc2hlcyBpbnN0YW5jZXMgYWRkZWQgdG8gYSBsYXllci4gVGhlIGtleSBpcyBsYXllciwgdGhlIHZhbHVlIGlzIGFuIGFycmF5IG9mIG1lc2ggaW5zdGFuY2VzXG4gICAgICAgIHRoaXMubGF5ZXJNZXNoSW5zdGFuY2VzID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZXMgbWF0ZXJpYWwgZm9yIGxpbmUgcmVuZGVyaW5nXG4gICAgY3JlYXRlTWF0ZXJpYWwoZGVwdGhUZXN0KSB7XG4gICAgICAgIGNvbnN0IG1hdGVyaWFsID0gbmV3IEJhc2ljTWF0ZXJpYWwoKTtcbiAgICAgICAgbWF0ZXJpYWwudmVydGV4Q29sb3JzID0gdHJ1ZTtcbiAgICAgICAgbWF0ZXJpYWwuYmxlbmRUeXBlID0gQkxFTkRfTk9STUFMO1xuICAgICAgICBtYXRlcmlhbC5kZXB0aFRlc3QgPSBkZXB0aFRlc3Q7XG4gICAgICAgIG1hdGVyaWFsLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gbWF0ZXJpYWw7XG4gICAgfVxuXG4gICAgLy8gbWF0ZXJpYWwgZm9yIGxpbmUgcmVuZGVyaW5nIHdpdGggZGVwdGggdGVzdGluZyBvblxuICAgIGdldCBtYXRlcmlhbERlcHRoKCkge1xuICAgICAgICBpZiAoIXRoaXMuX21hdGVyaWFsRGVwdGgpIHtcbiAgICAgICAgICAgIHRoaXMuX21hdGVyaWFsRGVwdGggPSB0aGlzLmNyZWF0ZU1hdGVyaWFsKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXRlcmlhbERlcHRoO1xuICAgIH1cblxuICAgIC8vIG1hdGVyaWFsIGZvciBsaW5lIHJlbmRlcmluZyB3aXRoIGRlcHRoIHRlc3Rpbmcgb2ZmXG4gICAgZ2V0IG1hdGVyaWFsTm9EZXB0aCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9tYXRlcmlhbE5vRGVwdGgpIHtcbiAgICAgICAgICAgIHRoaXMuX21hdGVyaWFsTm9EZXB0aCA9IHRoaXMuY3JlYXRlTWF0ZXJpYWwoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXRlcmlhbE5vRGVwdGg7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyBhIGJhdGNoIGZvciByZW5kZXJpbmcgbGluZXMgdG8gYSBsYXllciB3aXRoIHJlcXVpcmVkIGRlcHRoIHRlc3Rpbmcgc3RhdGVcbiAgICBnZXRCYXRjaChsYXllciwgZGVwdGhUZXN0KSB7XG5cbiAgICAgICAgLy8gZ2V0IGJhdGNoZXMgZm9yIHRoZSBsYXllclxuICAgICAgICBsZXQgYmF0Y2hlcyA9IHRoaXMuYmF0Y2hlc01hcC5nZXQobGF5ZXIpO1xuICAgICAgICBpZiAoIWJhdGNoZXMpIHtcbiAgICAgICAgICAgIGJhdGNoZXMgPSBuZXcgSW1tZWRpYXRlQmF0Y2hlcyh0aGlzLmRldmljZSk7XG4gICAgICAgICAgICB0aGlzLmJhdGNoZXNNYXAuc2V0KGxheWVyLCBiYXRjaGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCBpdCBmb3IgcmVuZGVyaW5nXG4gICAgICAgIHRoaXMuYWxsQmF0Y2hlcy5hZGQoYmF0Y2hlcyk7XG5cbiAgICAgICAgLy8gZ2V0IGJhdGNoIGZvciB0aGUgbWF0ZXJpYWxcbiAgICAgICAgY29uc3QgbWF0ZXJpYWwgPSBkZXB0aFRlc3QgPyB0aGlzLm1hdGVyaWFsRGVwdGggOiB0aGlzLm1hdGVyaWFsTm9EZXB0aDtcbiAgICAgICAgcmV0dXJuIGJhdGNoZXMuZ2V0QmF0Y2gobWF0ZXJpYWwsIGxheWVyKTtcbiAgICB9XG5cbiAgICBnZXRTaGFkZXIoaWQsIGZyYWdtZW50KSB7XG4gICAgICAgIGlmICghdGhpc1tpZF0pIHtcbiAgICAgICAgICAgIC8vIHNoYXJlZCB2ZXJ0ZXggc2hhZGVyIGZvciB0ZXh0dXJlZCBxdWFkIHJlbmRlcmluZ1xuICAgICAgICAgICAgY29uc3QgdmVydGV4ID0gYFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZSB2ZWMyIHZlcnRleF9wb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB1bmlmb3JtIG1hdDQgbWF0cml4X21vZGVsO1xuICAgICAgICAgICAgICAgIHZhcnlpbmcgdmVjMiB1djA7XG4gICAgICAgICAgICAgICAgdm9pZCBtYWluKHZvaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSBtYXRyaXhfbW9kZWwgKiB2ZWM0KHZlcnRleF9wb3NpdGlvbiwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIHV2MCA9IHZlcnRleF9wb3NpdGlvbi54eSArIDAuNTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBgO1xuXG4gICAgICAgICAgICB0aGlzW2lkXSA9IGNyZWF0ZVNoYWRlckZyb21Db2RlKHRoaXMuZGV2aWNlLCB2ZXJ0ZXgsIGZyYWdtZW50LCBgRGVidWdTaGFkZXI6JHtpZH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1tpZF07XG4gICAgfVxuXG4gICAgLy8gc2hhZGVyIHVzZWQgdG8gZGlzcGxheSB0ZXh0dXJlXG4gICAgZ2V0VGV4dHVyZVNoYWRlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2hhZGVyKCd0ZXh0dXJlU2hhZGVyJywgYFxuICAgICAgICAgICAgdmFyeWluZyB2ZWMyIHV2MDtcbiAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIGNvbG9yTWFwO1xuICAgICAgICAgICAgdm9pZCBtYWluICh2b2lkKSB7XG4gICAgICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNCh0ZXh0dXJlMkQoY29sb3JNYXAsIHV2MCkueHl6LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYCk7XG4gICAgfVxuXG4gICAgLy8gc2hhZGVyIHVzZWQgdG8gZGlzcGxheSBpbmZpbHRlcmFibGUgdGV4dHVyZSBzYW1wbGVkIHVzaW5nIHRleGVsRmV0Y2hcbiAgICBnZXRVbmZpbHRlcmFibGVUZXh0dXJlU2hhZGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTaGFkZXIoJ3RleHR1cmVTaGFkZXJVbmZpbHRlcmFibGUnLCBgXG4gICAgICAgICAgICB2YXJ5aW5nIHZlYzIgdXYwO1xuICAgICAgICAgICAgdW5pZm9ybSBoaWdocCBzYW1wbGVyMkQgY29sb3JNYXA7XG4gICAgICAgICAgICB2b2lkIG1haW4gKHZvaWQpIHtcbiAgICAgICAgICAgICAgICBpdmVjMiB1diA9IGl2ZWMyKHV2MCAqIHRleHR1cmVTaXplKGNvbG9yTWFwLCAwKSk7XG4gICAgICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNCh0ZXhlbEZldGNoKGNvbG9yTWFwLCB1diwgMCkueHl6LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYCk7XG4gICAgfVxuXG4gICAgLy8gc2hhZGVyIHVzZWQgdG8gZGlzcGxheSBkZXB0aCB0ZXh0dXJlXG4gICAgZ2V0RGVwdGhUZXh0dXJlU2hhZGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTaGFkZXIoJ2RlcHRoVGV4dHVyZVNoYWRlcicsIGBcbiAgICAgICAgICAgICR7c2hhZGVyQ2h1bmtzLnNjcmVlbkRlcHRoUFN9XG4gICAgICAgICAgICB2YXJ5aW5nIHZlYzIgdXYwO1xuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIGZsb2F0IGRlcHRoID0gZ2V0TGluZWFyU2NyZWVuRGVwdGgodXYwKSAqIGNhbWVyYV9wYXJhbXMueDtcbiAgICAgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZlYzMoZGVwdGgpLCAxLjApO1xuICAgICAgICAgICAgfVxuICAgICAgICBgKTtcbiAgICB9XG5cbiAgICAvLyBjcmVhdGVzIG1lc2ggdXNlZCB0byByZW5kZXIgYSBxdWFkXG4gICAgZ2V0UXVhZE1lc2goKSB7XG4gICAgICAgIGlmICghdGhpcy5xdWFkTWVzaCkge1xuICAgICAgICAgICAgdGhpcy5xdWFkTWVzaCA9IG5ldyBNZXNoKHRoaXMuZGV2aWNlKTtcbiAgICAgICAgICAgIHRoaXMucXVhZE1lc2guc2V0UG9zaXRpb25zKFtcbiAgICAgICAgICAgICAgICAtMC41LCAtMC41LCAwLFxuICAgICAgICAgICAgICAgIDAuNSwgLTAuNSwgMCxcbiAgICAgICAgICAgICAgICAtMC41LCAwLjUsIDAsXG4gICAgICAgICAgICAgICAgMC41LCAwLjUsIDBcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgdGhpcy5xdWFkTWVzaC51cGRhdGUoUFJJTUlUSVZFX1RSSVNUUklQKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5xdWFkTWVzaDtcbiAgICB9XG5cbiAgICAvLyBEcmF3IG1lc2ggYXQgdGhpcyBmcmFtZVxuICAgIGRyYXdNZXNoKG1hdGVyaWFsLCBtYXRyaXgsIG1lc2gsIG1lc2hJbnN0YW5jZSwgbGF5ZXIpIHtcblxuICAgICAgICAvLyBjcmVhdGUgYSBtZXNoIGluc3RhbmNlIGZvciB0aGUgbWVzaCBpZiBuZWVkZWRcbiAgICAgICAgaWYgKCFtZXNoSW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IGdyYXBoTm9kZSA9IHRoaXMuZ2V0R3JhcGhOb2RlKG1hdHJpeCk7XG4gICAgICAgICAgICBtZXNoSW5zdGFuY2UgPSBuZXcgTWVzaEluc3RhbmNlKG1lc2gsIG1hdGVyaWFsLCBncmFwaE5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHRoZSBtZXNoIGluc3RhbmNlIHRvIGFuIGFycmF5IHBlciBsYXllciwgdGhleSBnZXQgYWRkZWQgdG8gbGF5ZXJzIGJlZm9yZSByZW5kZXJpbmdcbiAgICAgICAgbGV0IGxheWVyTWVzaEluc3RhbmNlcyA9IHRoaXMubGF5ZXJNZXNoSW5zdGFuY2VzLmdldChsYXllcik7XG4gICAgICAgIGlmICghbGF5ZXJNZXNoSW5zdGFuY2VzKSB7XG4gICAgICAgICAgICBsYXllck1lc2hJbnN0YW5jZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMubGF5ZXJNZXNoSW5zdGFuY2VzLnNldChsYXllciwgbGF5ZXJNZXNoSW5zdGFuY2VzKTtcbiAgICAgICAgfVxuICAgICAgICBsYXllck1lc2hJbnN0YW5jZXMucHVzaChtZXNoSW5zdGFuY2UpO1xuICAgIH1cblxuICAgIGRyYXdXaXJlQWxpZ25lZEJveChtaW4sIG1heCwgY29sb3IsIGRlcHRoVGVzdCwgbGF5ZXIpIHtcbiAgICAgICAgdGVtcFBvaW50cy5wdXNoKFxuICAgICAgICAgICAgbWluLngsIG1pbi55LCBtaW4ueiwgbWluLngsIG1heC55LCBtaW4ueixcbiAgICAgICAgICAgIG1pbi54LCBtYXgueSwgbWluLnosIG1heC54LCBtYXgueSwgbWluLnosXG4gICAgICAgICAgICBtYXgueCwgbWF4LnksIG1pbi56LCBtYXgueCwgbWluLnksIG1pbi56LFxuICAgICAgICAgICAgbWF4LngsIG1pbi55LCBtaW4ueiwgbWluLngsIG1pbi55LCBtaW4ueixcbiAgICAgICAgICAgIG1pbi54LCBtaW4ueSwgbWF4LnosIG1pbi54LCBtYXgueSwgbWF4LnosXG4gICAgICAgICAgICBtaW4ueCwgbWF4LnksIG1heC56LCBtYXgueCwgbWF4LnksIG1heC56LFxuICAgICAgICAgICAgbWF4LngsIG1heC55LCBtYXgueiwgbWF4LngsIG1pbi55LCBtYXgueixcbiAgICAgICAgICAgIG1heC54LCBtaW4ueSwgbWF4LnosIG1pbi54LCBtaW4ueSwgbWF4LnosXG4gICAgICAgICAgICBtaW4ueCwgbWluLnksIG1pbi56LCBtaW4ueCwgbWluLnksIG1heC56LFxuICAgICAgICAgICAgbWluLngsIG1heC55LCBtaW4ueiwgbWluLngsIG1heC55LCBtYXgueixcbiAgICAgICAgICAgIG1heC54LCBtYXgueSwgbWluLnosIG1heC54LCBtYXgueSwgbWF4LnosXG4gICAgICAgICAgICBtYXgueCwgbWluLnksIG1pbi56LCBtYXgueCwgbWluLnksIG1heC56XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgYmF0Y2ggPSB0aGlzLmdldEJhdGNoKGxheWVyLCBkZXB0aFRlc3QpO1xuICAgICAgICBiYXRjaC5hZGRMaW5lc0FycmF5cyh0ZW1wUG9pbnRzLCBjb2xvcik7XG4gICAgICAgIHRlbXBQb2ludHMubGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICBkcmF3V2lyZVNwaGVyZShjZW50ZXIsIHJhZGl1cywgY29sb3IsIG51bVNlZ21lbnRzLCBkZXB0aFRlc3QsIGxheWVyKSB7XG5cbiAgICAgICAgY29uc3Qgc3RlcCA9IDIgKiBNYXRoLlBJIC8gbnVtU2VnbWVudHM7XG4gICAgICAgIGxldCBhbmdsZSA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1TZWdtZW50czsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzaW4wID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgY29uc3QgY29zMCA9IE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgICAgIGFuZ2xlICs9IHN0ZXA7XG4gICAgICAgICAgICBjb25zdCBzaW4xID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgY29uc3QgY29zMSA9IE1hdGguY29zKGFuZ2xlKTtcblxuICAgICAgICAgICAgdGVtcFBvaW50cy5wdXNoKGNlbnRlci54ICsgcmFkaXVzICogc2luMCwgY2VudGVyLnksIGNlbnRlci56ICsgcmFkaXVzICogY29zMCk7XG4gICAgICAgICAgICB0ZW1wUG9pbnRzLnB1c2goY2VudGVyLnggKyByYWRpdXMgKiBzaW4xLCBjZW50ZXIueSwgY2VudGVyLnogKyByYWRpdXMgKiBjb3MxKTtcbiAgICAgICAgICAgIHRlbXBQb2ludHMucHVzaChjZW50ZXIueCArIHJhZGl1cyAqIHNpbjAsIGNlbnRlci55ICsgcmFkaXVzICogY29zMCwgY2VudGVyLnopO1xuICAgICAgICAgICAgdGVtcFBvaW50cy5wdXNoKGNlbnRlci54ICsgcmFkaXVzICogc2luMSwgY2VudGVyLnkgKyByYWRpdXMgKiBjb3MxLCBjZW50ZXIueik7XG4gICAgICAgICAgICB0ZW1wUG9pbnRzLnB1c2goY2VudGVyLngsIGNlbnRlci55ICsgcmFkaXVzICogc2luMCwgY2VudGVyLnogKyByYWRpdXMgKiBjb3MwKTtcbiAgICAgICAgICAgIHRlbXBQb2ludHMucHVzaChjZW50ZXIueCwgY2VudGVyLnkgKyByYWRpdXMgKiBzaW4xLCBjZW50ZXIueiArIHJhZGl1cyAqIGNvczEpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYmF0Y2ggPSB0aGlzLmdldEJhdGNoKGxheWVyLCBkZXB0aFRlc3QpO1xuICAgICAgICBiYXRjaC5hZGRMaW5lc0FycmF5cyh0ZW1wUG9pbnRzLCBjb2xvcik7XG4gICAgICAgIHRlbXBQb2ludHMubGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICBnZXRHcmFwaE5vZGUobWF0cml4KSB7XG4gICAgICAgIGNvbnN0IGdyYXBoTm9kZSA9IG5ldyBHcmFwaE5vZGUoJ0ltbWVkaWF0ZURlYnVnJyk7XG4gICAgICAgIGdyYXBoTm9kZS53b3JsZFRyYW5zZm9ybSA9IG1hdHJpeDtcbiAgICAgICAgZ3JhcGhOb2RlLl9kaXJ0eVdvcmxkID0gZ3JhcGhOb2RlLl9kaXJ0eU5vcm1hbCA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiBncmFwaE5vZGU7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBpcyBjYWxsZWQganVzdCBiZWZvcmUgdGhlIGxheWVyIGlzIHJlbmRlcmVkIHRvIGFsbG93IGxpbmVzIGZvciB0aGUgbGF5ZXIgdG8gYmUgYWRkZWQgZnJvbSBpbnNpZGVcbiAgICAvLyB0aGUgZnJhbWUgZ2V0dGluZyByZW5kZXJlZFxuICAgIG9uUHJlUmVuZGVyTGF5ZXIobGF5ZXIsIHZpc2libGVMaXN0LCB0cmFuc3BhcmVudCkge1xuXG4gICAgICAgIC8vIHVwZGF0ZSBsaW5lIGJhdGNoZXMgZm9yIHRoZSBzcGVjaWZpZWQgc3ViLWxheWVyXG4gICAgICAgIHRoaXMuYmF0Y2hlc01hcC5mb3JFYWNoKChiYXRjaGVzLCBiYXRjaExheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoYmF0Y2hMYXllciA9PT0gbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICBiYXRjaGVzLm9uUHJlUmVuZGVyKHZpc2libGVMaXN0LCB0cmFuc3BhcmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG9ubHkgdXBkYXRlIG1lc2hlcyBvbmNlIGZvciBlYWNoIGxheWVyICh0aGV5J3JlIG5vdCBwZXIgc3ViLWxheWVyIGF0IHRoZSBtb21lbnQpXG4gICAgICAgIGlmICghdGhpcy51cGRhdGVkTGF5ZXJzLmhhcyhsYXllcikpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlZExheWVycy5hZGQobGF5ZXIpO1xuXG4gICAgICAgICAgICAvLyBhZGQgbWVzaCBpbnN0YW5jZXMgZm9yIHNwZWNpZmllZCBsYXllciB0byB2aXNpYmxlIGxpc3RcbiAgICAgICAgICAgIGNvbnN0IG1lc2hJbnN0YW5jZXMgPSB0aGlzLmxheWVyTWVzaEluc3RhbmNlcy5nZXQobGF5ZXIpO1xuICAgICAgICAgICAgaWYgKG1lc2hJbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lc2hJbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZUxpc3QubGlzdFt2aXNpYmxlTGlzdC5sZW5ndGggKyBpXSA9IG1lc2hJbnN0YW5jZXNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZpc2libGVMaXN0Lmxlbmd0aCArPSBtZXNoSW5zdGFuY2VzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBtZXNoSW5zdGFuY2VzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjYWxsZWQgYWZ0ZXIgdGhlIGZyYW1lIHdhcyByZW5kZXJlZCwgY2xlYXJzIGRhdGFcbiAgICBvblBvc3RSZW5kZXIoKSB7XG5cbiAgICAgICAgLy8gY2xlYW4gdXAgbGluZSBiYXRjaGVzXG4gICAgICAgIHRoaXMuYWxsQmF0Y2hlcy5jbGVhcigpO1xuXG4gICAgICAgIC8vIGFsbCBiYXRjaGVzIG5lZWQgdXBkYXRpbmcgbmV4dCBmcmFtZVxuICAgICAgICB0aGlzLnVwZGF0ZWRMYXllcnMuY2xlYXIoKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IEltbWVkaWF0ZSB9O1xuIl0sIm5hbWVzIjpbInRlbXBQb2ludHMiLCJJbW1lZGlhdGUiLCJjb25zdHJ1Y3RvciIsImRldmljZSIsInF1YWRNZXNoIiwidGV4dHVyZVNoYWRlciIsImRlcHRoVGV4dHVyZVNoYWRlciIsImN1YmVMb2NhbFBvcyIsImN1YmVXb3JsZFBvcyIsImJhdGNoZXNNYXAiLCJNYXAiLCJhbGxCYXRjaGVzIiwiU2V0IiwidXBkYXRlZExheWVycyIsIl9tYXRlcmlhbERlcHRoIiwiX21hdGVyaWFsTm9EZXB0aCIsImxheWVyTWVzaEluc3RhbmNlcyIsImNyZWF0ZU1hdGVyaWFsIiwiZGVwdGhUZXN0IiwibWF0ZXJpYWwiLCJCYXNpY01hdGVyaWFsIiwidmVydGV4Q29sb3JzIiwiYmxlbmRUeXBlIiwiQkxFTkRfTk9STUFMIiwidXBkYXRlIiwibWF0ZXJpYWxEZXB0aCIsIm1hdGVyaWFsTm9EZXB0aCIsImdldEJhdGNoIiwibGF5ZXIiLCJiYXRjaGVzIiwiZ2V0IiwiSW1tZWRpYXRlQmF0Y2hlcyIsInNldCIsImFkZCIsImdldFNoYWRlciIsImlkIiwiZnJhZ21lbnQiLCJ2ZXJ0ZXgiLCJjcmVhdGVTaGFkZXJGcm9tQ29kZSIsImdldFRleHR1cmVTaGFkZXIiLCJnZXRVbmZpbHRlcmFibGVUZXh0dXJlU2hhZGVyIiwiZ2V0RGVwdGhUZXh0dXJlU2hhZGVyIiwic2hhZGVyQ2h1bmtzIiwic2NyZWVuRGVwdGhQUyIsImdldFF1YWRNZXNoIiwiTWVzaCIsInNldFBvc2l0aW9ucyIsIlBSSU1JVElWRV9UUklTVFJJUCIsImRyYXdNZXNoIiwibWF0cml4IiwibWVzaCIsIm1lc2hJbnN0YW5jZSIsImdyYXBoTm9kZSIsImdldEdyYXBoTm9kZSIsIk1lc2hJbnN0YW5jZSIsInB1c2giLCJkcmF3V2lyZUFsaWduZWRCb3giLCJtaW4iLCJtYXgiLCJjb2xvciIsIngiLCJ5IiwieiIsImJhdGNoIiwiYWRkTGluZXNBcnJheXMiLCJsZW5ndGgiLCJkcmF3V2lyZVNwaGVyZSIsImNlbnRlciIsInJhZGl1cyIsIm51bVNlZ21lbnRzIiwic3RlcCIsIk1hdGgiLCJQSSIsImFuZ2xlIiwiaSIsInNpbjAiLCJzaW4iLCJjb3MwIiwiY29zIiwic2luMSIsImNvczEiLCJHcmFwaE5vZGUiLCJ3b3JsZFRyYW5zZm9ybSIsIl9kaXJ0eVdvcmxkIiwiX2RpcnR5Tm9ybWFsIiwib25QcmVSZW5kZXJMYXllciIsInZpc2libGVMaXN0IiwidHJhbnNwYXJlbnQiLCJmb3JFYWNoIiwiYmF0Y2hMYXllciIsIm9uUHJlUmVuZGVyIiwiaGFzIiwibWVzaEluc3RhbmNlcyIsImxpc3QiLCJvblBvc3RSZW5kZXIiLCJjbGVhciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVdBLE1BQU1BLFVBQVUsR0FBRyxFQUFFLENBQUE7QUFFckIsTUFBTUMsU0FBUyxDQUFDO0VBQ1pDLFdBQVdBLENB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QUFDLEVBQ3hDSixHQUFHLENBQUNFLENBQUMsRUFBRUYsR0FBRyxDQUFDRyxDQUFDLEVBQUVILEdBQUcsQ0FBQ0ksQ0FBQyxFQUFFSixHQUFHLENBQUNFLENBQUMsRUFBRUgsR0FBRyxDQUFDSSxDQUFDLEVBQUVILEdBQUcsQ0FBQ0ksQ0FBQyxFQUN4Q0osR0FBRyxDQUFDRSxDQUFDLEVBQUVILEdBQUcsQ0FBQ0ksQ0FBQyxFQUFFSCxHQUFHLENBQUNJLENBQUMsRUFBRUwsR0FBRyxDQUFDRyxDQUFDLEVBQUVILEdBQUcsQ0FBQ0ksQ0FBQyxFQUFFSCxHQUFHLENBQUNJLENBQUMsRUFDeENMLEdBQUcsQ0FBQ0csQ0FBQyxFQUFFSCxHQUFHLENBQUNJLENBQUMsRUFBRUosR0FBRyxDQUFDSyxDQUFDLEVBQUVMLEdBQUcsQ0FBQ0csQ0FBQyxFQUFFSCxHQUFHLENBQUNJLENBQUMsRUFBRUgsR0FBRyxDQUFDSSxDQUFDLEVBQ3hDTCxHQUFHLENBQUNHLENBQUMsRUFBRUYsR0FBRyxDQUFDRyxDQUFDLEVBQUVKLEdBQUcsQ0FBQ0ssQ0FBQyxFQUFFTCxHQUFHLENBQUNHLENBQUMsRUFBRUYsR0FBRyxDQUFDRyxDQUFDLEVBQUVILEdBQUcsQ0FBQ0ksQ0FBQyxFQUN4Q0osR0FBRyxDQUFDRSxDQUFDLEVBQUVGLEdBQUcsQ0FBQ0csQ0FBQyxFQUFFSixHQUFHLENBQUNLLENBQUMsRUFBRUosR0FBRyxDQUFDRSxDQUFDLEVBQUVGLEdBQUcsQ0FBQ0csQ0FBQyxFQUFFSCxHQUFHLENBQUNJLENBQUMsRUFDeENKLEdBQUcsQ0FBQ0UsQ0FBQyxFQUFFSCxHQUFHLENBQUNJLENBQUMsRUFBRUosR0FBRyxDQUFDSyxDQUFDLEVBQUVKLEdBQUcsQ0FBQ0UsQ0FBQyxFQUFFSCxHQUFHLENBQUNJLENBQUMsRUFBRUgsR0FBRyxDQUFDSSxDQUMzQyxDQUFDLENBQUE7SUFFRCxNQUFNQyxLQUFLLEdBQUcsSUFBSSxDQUFDcEMsUUFBUSxDQUFDQyxLQUFLLEVBQUVWLFNBQVMsQ0FBQyxDQUFBO0FBQzdDNkMsSUFBQUEsS0FB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
