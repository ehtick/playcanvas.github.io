/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Mat4 } from '../../core/math/mat4.js';
import { PRIMITIVE_LINES } from '../../platform/graphics/constants.js';
import { Mesh } from '../mesh.js';
import { MeshInstance } from '../mesh-instance.js';
import { GraphNode } from '../graph-node.js';

const identityGraphNode = new GraphNode();
identityGraphNode.worldTransform = Mat4.IDENTITY;
identityGraphNode._dirtyWorld = identityGraphNode._dirtyNormal = false;

class ImmediateBatch {
  constructor(device, material, layer) {
    this.material = material;
    this.layer = layer;

    this.positions = [];
    this.colors = [];
    this.mesh = new Mesh(device);
    this.meshInstance = null;
  }

  addLines(positions, color) {
    const destPos = this.positions;
    const count = positions.length;
    for (let i = 0; i < count; i++) {
      const pos = positions[i];
      destPos.push(pos.x, pos.y, pos.z);
    }

    const destCol = this.colors;
    if (color.length) {
      for (let i = 0; i < count; i++) {
        const col = color[i];
        destCol.push(col.r, col.g, col.b, col.a);
      }
    } else {
      for (let i = 0; i < count; i++) {
        destCol.push(color.r, color.g, color.b, color.a);
      }
    }
  }

  addLinesArrays(positions, color) {
    const destPos = this.positions;
    for (let i = 0; i < positions.length; i += 3) {
      destPos.push(positions[i], positions[i + 1], positions[i + 2]);
    }

    const destCol = this.colors;
    if (color.length) {
      for (let i = 0; i < color.length; i += 4) {
        destCol.push(color[i], color[i + 1], color[i + 2], color[i + 3]);
      }
    } else {
      const count = positions.length / 3;
      for (let i = 0; i < count; i++) {
        destCol.push(color.r, color.g, color.b, color.a);
      }
    }
  }
  onPreRender(visibleList, transparent) {
    if (this.positions.length > 0 && this.material.transparent === transparent) {
      this.mesh.setPositions(this.positions);
      this.mesh.setColors(this.colors);
      this.mesh.update(PRIMITIVE_LINES, false);
      if (!this.meshInstance) {
        this.meshInstance = new MeshInstance(this.mesh, this.material, identityGraphNode);
      }

      this.positions.length = 0;
      this.colors.length = 0;

      visibleList.list.push(this.meshInstance);
      visibleList.length++;
    }
  }
}

export { ImmediateBatch };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1tZWRpYXRlLWJhdGNoLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NlbmUvaW1tZWRpYXRlL2ltbWVkaWF0ZS1iYXRjaC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vLi4vY29yZS9tYXRoL21hdDQuanMnO1xuXG5pbXBvcnQgeyBQUklNSVRJVkVfTElORVMgfSBmcm9tICcuLi8uLi9wbGF0Zm9ybS9ncmFwaGljcy9jb25zdGFudHMuanMnO1xuXG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vbWVzaC5qcyc7XG5pbXBvcnQgeyBNZXNoSW5zdGFuY2UgfSBmcm9tICcuLi9tZXNoLWluc3RhbmNlLmpzJztcbmltcG9ydCB7IEdyYXBoTm9kZSB9IGZyb20gJy4uL2dyYXBoLW5vZGUuanMnO1xuXG5jb25zdCBpZGVudGl0eUdyYXBoTm9kZSA9IG5ldyBHcmFwaE5vZGUoKTtcbmlkZW50aXR5R3JhcGhOb2RlLndvcmxkVHJhbnNmb3JtID0gTWF0NC5JREVOVElUWTtcbmlkZW50aXR5R3JhcGhOb2RlLl9kaXJ0eVdvcmxkID0gaWRlbnRpdHlHcmFwaE5vZGUuX2RpcnR5Tm9ybWFsID0gZmFsc2U7XG5cbi8vIGhlbHBlciBjbGFzcyBzdG9yaW5nIGRhdGEgZm9yIGEgc2luZ2xlIGJhdGNoIG9mIGxpbmUgcmVuZGVyaW5nIHVzaW5nIGEgc2luZ2xlIG1hdGVyaWFsXG5jbGFzcyBJbW1lZGlhdGVCYXRjaCB7XG4gICAgY29uc3RydWN0b3IoZGV2aWNlLCBtYXRlcmlhbCwgbGF5ZXIpIHtcbiAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsO1xuICAgICAgICB0aGlzLmxheWVyID0gbGF5ZXI7XG5cbiAgICAgICAgLy8gbGluZSBkYXRhLCBhcnJheXMgb2YgbnVtYmVyc1xuICAgICAgICB0aGlzLnBvc2l0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLmNvbG9ycyA9IFtdO1xuXG4gICAgICAgIHRoaXMubWVzaCA9IG5ldyBNZXNoKGRldmljZSk7XG4gICAgICAgIHRoaXMubWVzaEluc3RhbmNlID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBhZGQgbGluZSBwb3NpdGlvbnMgYW5kIGNvbG9ycyB0byB0aGUgYmF0Y2hcbiAgICAvLyB0aGlzIGZ1bmN0aW9uIGV4cGVjdHMgcG9zaXRpb24gaW4gVmVjMyBhbmQgY29sb3JzIGluIENvbG9yIGZvcm1hdFxuICAgIGFkZExpbmVzKHBvc2l0aW9ucywgY29sb3IpIHtcblxuICAgICAgICAvLyBwb3NpdGlvbnNcbiAgICAgICAgY29uc3QgZGVzdFBvcyA9IHRoaXMucG9zaXRpb25zO1xuICAgICAgICBjb25zdCBjb3VudCA9IHBvc2l0aW9ucy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcG9zID0gcG9zaXRpb25zW2ldO1xuICAgICAgICAgICAgZGVzdFBvcy5wdXNoKHBvcy54LCBwb3MueSwgcG9zLnopO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29sb3JzXG4gICAgICAgIGNvbnN0IGRlc3RDb2wgPSB0aGlzLmNvbG9ycztcbiAgICAgICAgaWYgKGNvbG9yLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gbXVsdGkgY29sb3JlZCBsaW5lXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2wgPSBjb2xvcltpXTtcbiAgICAgICAgICAgICAgICBkZXN0Q29sLnB1c2goY29sLnIsIGNvbC5nLCBjb2wuYiwgY29sLmEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2luZ2xlIGNvbG9yZWQgbGluZVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZGVzdENvbC5wdXNoKGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIsIGNvbG9yLmEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gYWRkIGxpbmUgcG9zaXRpb25zIGFuZCBjb2xvcnMgdG8gdGhlIGJhdGNoXG4gICAgLy8gdGhpcyBmdW5jdGlvbiBleHBlY3RzIHBvc2l0aW9ucyBhcyBhcnJheXMgb2YgbnVtYmVyc1xuICAgIC8vIGFuZCBjb2xvciBhcyBpbnN0YW5jZSBvZiBDb2xvciBvciBhcnJheSBvZiBudW1iZXIgc3BlY2lmeWluZyB0aGUgc2FtZSBudW1iZXIgb2YgdmVydGljZXMgYXMgcG9zaXRpb25zXG4gICAgYWRkTGluZXNBcnJheXMocG9zaXRpb25zLCBjb2xvcikge1xuXG4gICAgICAgIC8vIHBvc2l0aW9uc1xuICAgICAgICBjb25zdCBkZXN0UG9zID0gdGhpcy5wb3NpdGlvbnM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zaXRpb25zLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgICAgICBkZXN0UG9zLnB1c2gocG9zaXRpb25zW2ldLCBwb3NpdGlvbnNbaSArIDFdLCBwb3NpdGlvbnNbaSArIDJdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbG9yc1xuICAgICAgICBjb25zdCBkZXN0Q29sID0gdGhpcy5jb2xvcnM7XG4gICAgICAgIGlmIChjb2xvci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sb3IubGVuZ3RoOyBpICs9IDQpIHtcbiAgICAgICAgICAgICAgICBkZXN0Q29sLnB1c2goY29sb3JbaV0sIGNvbG9yW2kgKyAxXSwgY29sb3JbaSArIDJdLCBjb2xvcltpICsgM10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2luZ2xlIGNvbG9yZWQgbGluZVxuICAgICAgICAgICAgY29uc3QgY291bnQgPSBwb3NpdGlvbnMubGVuZ3RoIC8gMztcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgIGRlc3RDb2wucHVzaChjb2xvci5yLCBjb2xvci5nLCBjb2xvci5iLCBjb2xvci5hKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUHJlUmVuZGVyKHZpc2libGVMaXN0LCB0cmFuc3BhcmVudCkge1xuXG4gICAgICAgIC8vIHByZXBhcmUgbWVzaCBpZiBpdHMgdHJhbnNwYXJlbmN5IG1hdGNoZXNcbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb25zLmxlbmd0aCA+IDAgJiYgdGhpcy5tYXRlcmlhbC50cmFuc3BhcmVudCA9PT0gdHJhbnNwYXJlbnQpIHtcblxuICAgICAgICAgICAgLy8gdXBkYXRlIG1lc2ggdmVydGljZXNcbiAgICAgICAgICAgIHRoaXMubWVzaC5zZXRQb3NpdGlvbnModGhpcy5wb3NpdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5tZXNoLnNldENvbG9ycyh0aGlzLmNvbG9ycyk7XG4gICAgICAgICAgICB0aGlzLm1lc2gudXBkYXRlKFBSSU1JVElWRV9MSU5FUywgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1lc2hJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWVzaEluc3RhbmNlID0gbmV3IE1lc2hJbnN0YW5jZSh0aGlzLm1lc2gsIHRoaXMubWF0ZXJpYWwsIGlkZW50aXR5R3JhcGhOb2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY2xlYXIgbGluZXMgd2hlbiBhZnRlciB0aGV5IHdlcmUgcmVuZGVyZWQgYXMgdGhlaXIgbGlmZXRpbWUgaXMgb25lIGZyYW1lXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9ucy5sZW5ndGggPSAwO1xuICAgICAgICAgICAgdGhpcy5jb2xvcnMubGVuZ3RoID0gMDtcblxuICAgICAgICAgICAgLy8gaW5qZWN0IG1lc2ggaW5zdGFuY2UgaW50byB2aXNpYmxlIGxpc3QgdG8gYmUgcmVuZGVyZWRcbiAgICAgICAgICAgIHZpc2libGVMaXN0Lmxpc3QucHVzaCh0aGlzLm1lc2hJbnN0YW5jZSk7XG4gICAgICAgICAgICB2aXNpYmxlTGlzdC5sZW5ndGgrKztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgSW1tZWRpYXRlQmF0Y2ggfTtcbiJdLCJuYW1lcyI6WyJpZGVudGl0eUdyYXBoTm9kZSIsIkdyYXBoTm9kZSIsIndvcmxkVHJhbnNmb3JtIiwiTWF0NCIsIklERU5USVRZIiwiX2RpcnR5V29ybGQiLCJfZGlydHlOb3JtYWwiLCJJbW1lZGlhdGVCYXRjaCIsImNvbnN0cnVjdG9yIiwiZGV2aWNlIiwibWF0ZXJpYWwiLCJsYXllciIsInBvc2l0aW9ucyIsImNvbG9ycyIsIm1lc2giLCJNZXNoIiwibWVzaEluc3RhbmNlIiwiYWRkTGluZXMiLCJjb2xvciIsImRlc3RQb3MiLCJjb3VudCIsImxlbmd0aCIsImkiLCJwb3MiLCJwdXNoIiwieCIsInkiLCJ6IiwiZGVzdENvbCIsImNvbCIsInIiLCJnIiwiYiIsImEiLCJhZGRMaW5lc0FycmF5cyIsIm9uUHJlUmVuZGVyIiwidmlzaWJsZUxpc3QiLCJ0cmFuc3BhcmVudCIsInNldFBvc2l0aW9ucyIsInNldENvbG9ycyIsInVwZGF0ZSIsIlBSSU1JVElWRV9MSU5FUyIsIk1lc2hJbnN0YW5jZSIsImxpc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsTUFBTUEsaUJBQWlCLEdBQUcsSUFBSUMsU0FBUyxFQUFFLENBQUE7QUFDekNELGlCQUFpQixDQUFDRSxjQUFjLEdBQUdDLElBQUksQ0FBQ0MsUUFBUSxDQUFBO0FBQ2hESixpQkFBaUIsQ0FBQ0ssV0FBVyxHQUFHTCxpQkFBaUIsQ0FBQ00sWUFBWSxHQUFHLEtBQUssQ0FBQTs7QUFHdEUsTUFBTUMsY0FBYyxDQUFDO0FBQ2pCQyxFQUFBQSxXQUFXLENBQUNDLE1BQU0sRUFBRUMsUUFBUSxFQUFFQyxLQUFLLEVBQUU7SUFDakMsSUFBSSxDQUFDRCxRQUFRLEdBQUdBLFFBQVEsQ0FB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
