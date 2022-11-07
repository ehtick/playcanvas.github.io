/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { SkinInstance } from '../skin-instance.js';

class SkinBatchInstance extends SkinInstance {
  constructor(device, nodes, rootNode) {
    super();
    const numBones = nodes.length;
    this.init(device, numBones);
    this.device = device;
    this.rootNode = rootNode;

    this.bones = nodes;
  }
  updateMatrices(rootNode, skinUpdateIndex) {}
  updateMatrixPalette(rootNode, skinUpdateIndex) {
    const mp = this.matrixPalette;
    const count = this.bones.length;
    for (let i = 0; i < count; i++) {
      const pe = this.bones[i].getWorldTransform().data;

      const base = i * 12;
      mp[base] = pe[0];
      mp[base + 1] = pe[4];
      mp[base + 2] = pe[8];
      mp[base + 3] = pe[12];
      mp[base + 4] = pe[1];
      mp[base + 5] = pe[5];
      mp[base + 6] = pe[9];
      mp[base + 7] = pe[13];
      mp[base + 8] = pe[2];
      mp[base + 9] = pe[6];
      mp[base + 10] = pe[10];
      mp[base + 11] = pe[14];
    }
    this.uploadBones(this.device);
  }
}

export { SkinBatchInstance };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2tpbi1iYXRjaC1pbnN0YW5jZS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjZW5lL2JhdGNoaW5nL3NraW4tYmF0Y2gtaW5zdGFuY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2tpbkluc3RhbmNlIH0gZnJvbSAnLi4vc2tpbi1pbnN0YW5jZS5qcyc7XG5cbi8vIENsYXNzIGRlcml2ZWQgZnJvbSBTa2luSW5zdGFuY2Ugd2l0aCBjaGFuZ2VzIHRvIG1ha2UgaXQgc3VpdGFibGUgZm9yIGJhdGNoaW5nXG5jbGFzcyBTa2luQmF0Y2hJbnN0YW5jZSBleHRlbmRzIFNraW5JbnN0YW5jZSB7XG4gICAgY29uc3RydWN0b3IoZGV2aWNlLCBub2Rlcywgcm9vdE5vZGUpIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGNvbnN0IG51bUJvbmVzID0gbm9kZXMubGVuZ3RoO1xuICAgICAgICB0aGlzLmluaXQoZGV2aWNlLCBudW1Cb25lcyk7XG5cbiAgICAgICAgdGhpcy5kZXZpY2UgPSBkZXZpY2U7XG4gICAgICAgIHRoaXMucm9vdE5vZGUgPSByb290Tm9kZTtcblxuICAgICAgICAvLyBVbmlxdWUgYm9uZXMgcGVyIGNsb25lXG4gICAgICAgIHRoaXMuYm9uZXMgPSBub2RlcztcbiAgICB9XG5cbiAgICB1cGRhdGVNYXRyaWNlcyhyb290Tm9kZSwgc2tpblVwZGF0ZUluZGV4KSB7XG4gICAgfVxuXG4gICAgdXBkYXRlTWF0cml4UGFsZXR0ZShyb290Tm9kZSwgc2tpblVwZGF0ZUluZGV4KSB7XG4gICAgICAgIGNvbnN0IG1wID0gdGhpcy5tYXRyaXhQYWxldHRlO1xuXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5ib25lcy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGUgPSB0aGlzLmJvbmVzW2ldLmdldFdvcmxkVHJhbnNmb3JtKCkuZGF0YTtcblxuICAgICAgICAgICAgLy8gQ29weSB0aGUgbWF0cml4IGludG8gdGhlIHBhbGV0dGUsIHJlYWR5IHRvIGJlIHNlbnQgdG8gdGhlIHZlcnRleCBzaGFkZXIsIHRyYW5zcG9zZSBtYXRyaXggZnJvbSA0eDQgdG8gNHgzIGZvcm1hdCBhcyB3ZWxsXG4gICAgICAgICAgICBjb25zdCBiYXNlID0gaSAqIDEyO1xuICAgICAgICAgICAgbXBbYmFzZV0gPSBwZVswXTtcbiAgICAgICAgICAgIG1wW2Jhc2UgKyAxXSA9IHBlWzRdO1xuICAgICAgICAgICAgbXBbYmFzZSArIDJdID0gcGVbOF07XG4gICAgICAgICAgICBtcFtiYXNlICsgM10gPSBwZVsxMl07XG4gICAgICAgICAgICBtcFtiYXNlICsgNF0gPSBwZVsxXTtcbiAgICAgICAgICAgIG1wW2Jhc2UgKyA1XSA9IHBlWzVdO1xuICAgICAgICAgICAgbXBbYmFzZSArIDZdID0gcGVbOV07XG4gICAgICAgICAgICBtcFtiYXNlICsgN10gPSBwZVsxM107XG4gICAgICAgICAgICBtcFtiYXNlICsgOF0gPSBwZVsyXTtcbiAgICAgICAgICAgIG1wW2Jhc2UgKyA5XSA9IHBlWzZdO1xuICAgICAgICAgICAgbXBbYmFzZSArIDEwXSA9IHBlWzEwXTtcbiAgICAgICAgICAgIG1wW2Jhc2UgKyAxMV0gPSBwZVsxNF07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwbG9hZEJvbmVzKHRoaXMuZGV2aWNlKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFNraW5CYXRjaEluc3RhbmNlIH07XG4iXSwibmFtZXMiOlsiU2tpbkJhdGNoSW5zdGFuY2UiLCJTa2luSW5zdGFuY2UiLCJjb25zdHJ1Y3RvciIsImRldmljZSIsIm5vZGVzIiwicm9vdE5vZGUiLCJudW1Cb25lcyIsImxlbmd0aCIsImluaXQiLCJib25lcyIsInVwZGF0ZU1hdHJpY2VzIiwic2tpblVwZGF0ZUluZGV4IiwidXBkYXRlTWF0cml4UGFsZXR0ZSIsIm1wIiwibWF0cml4UGFsZXR0ZSIsImNvdW50IiwiaSIsInBlIiwiZ2V0V29ybGRUcmFuc2Zvcm0iLCJkYXRhIiwiYmFzZSIsInVwbG9hZEJvbmVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBR0EsTUFBTUEsaUJBQWlCLFNBQVNDLFlBQVksQ0FBQztBQUN6Q0MsRUFBQUEsV0FBVyxDQUFDQyxNQUFNLEVBQUVDLEtBQUssRUFBRUMsUUFBUSxFQUFFO0FBRWpDLElBQUEsS0FBSyxFQUFFLENBQUE7QUFFUCxJQUFBLE1BQU1DLFFBQVEsR0FBR0YsS0FBSyxDQUFDRyxNQUFNLENBQUE7QUFDN0IsSUFBQSxJQUFJLENBQUNDLElBQUksQ0FBQ0wsTUFBTSxFQUFFRyxRQUFRLENBQUMsQ0FBQTtJQUUzQixJQUFJLENBQUNILE1BQU0sR0FBR0EsTUFBTSxDQUFBO0lBQ3BCLElBQUksQ0FBQ0UsUUFBUSxHQUFHQSxRQUFRLENBQUE7O0lBR3hCLElBQUksQ0FBQ0ksS0FBSyxHQUFHTCxLQUFLLENBQUE7QUFDdEIsR0FBQTtBQUVBTSxFQUFBQSxjQUFjLENBQUNMLFFBQVEsRUFBRU0sZUFBZSxFQUFFLEVBQzFDO0FBRUFDLEVBQUFBLG1CQUFtQixDQUFDUCxRQUFRLEVBQUVNLGVBQWUsRUFBRTtBQUMzQyxJQUFBLE1BQU1FLEVBQUUsR0FBRyxJQUFJLENBQUNDLGFBQWEsQ0FBQTtBQUU3QixJQUFBLE1BQU1DLEtBQUssR0FBRyxJQUFJLENBQUNOLEtBQUssQ0FBQ0YsTUFBTSxDQUFBO0lBQy9CLEtBQUssSUFBSVMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRCxLQUFLLEVBQUVDLENBQUMsRUFBRSxFQUFFO0FBQzVCLE1BQUEsTUFBTUMsRUFBRSxHQUFHLElBQUksQ0FBQ1IsS0FBSyxDQUFDTyxDQUFDLENBQUMsQ0FBQ0UsaUJBQWlCLEVBQUUsQ0FBQ0MsSUFBSSxDQUFBOztBQUdqRCxNQUFBLE1BQU1DLElBQUksR0FBR0osQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUNuQkgsTUFBQUEsRUFBRSxDQUFDTyxJQUFJLENBQUMsR0FBR0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO01BQ2hCSixFQUFFLENBQUNPLElBQUksR0FBRyxDQUFDLENBQUMsR0FBR0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO01BQ3BCSixFQUFFLENBQUNPLElBQUksR0FBRyxDQUFDLENBQUMsR0FBR0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO01BQ3BCSixFQUFFLENBQUNPLElBQUksR0FBRyxDQUFDLENBQUMsR0FBR0gsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO01BQ3JCSixFQUFFLENBQUNPLElBQUksR0FBRyxDQUFDLENBQUMsR0FBR0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO01BQ3BCSixFQUFFLENBQUNPLElBQUksR0FBRyxDQUFDLENBQUMsR0FBR0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO01BQ3BCSixFQUFFLENBQUNPLElBQUksR0FBRyxDQUFDLENBQUMsR0FBR0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO01BQ3BCSixFQUFFLENBQUNPLElBQUksR0FBRyxDQUFDLENBQUMsR0FBR0gsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO01BQ3JCSixFQUFFLENBQUNPLElBQUksR0FBRyxDQUFDLENBQUMsR0FBR0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO01BQ3BCSixFQUFFLENBQUNPLElBQUksR0FBRyxDQUFDLENBQUMsR0FBR0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO01BQ3BCSixFQUFFLENBQUNPLElBQUksR0FBRyxFQUFFLENBQUMsR0FBR0gsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO01BQ3RCSixFQUFFLENBQUNPLElBQUksR0FBRyxFQUFFLENBQUMsR0FBR0gsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQzFCLEtBQUE7QUFFQSxJQUFBLElBQUksQ0FBQ0ksV0FBVyxDQUFDLElBQUksQ0FBQ2xCLE1BQU0sQ0FBQyxDQUFBO0FBQ2pDLEdBQUE7QUFDSjs7OzsifQ==
