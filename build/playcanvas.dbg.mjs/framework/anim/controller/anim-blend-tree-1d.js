import { math } from '../../../core/math/math.js';
import { AnimBlendTree } from './anim-blend-tree.js';

/**
 * An AnimBlendTree that calculates its weights using a 1D algorithm based on the thesis
 * http://runevision.com/thesis/rune_skovbo_johansen_thesis.pdf Chapter 6.
 *
 * @ignore
 */
class AnimBlendTree1D extends AnimBlendTree {
  /**
   * Create a new BlendTree1D instance.
   *
   * @param {import('./anim-state.js').AnimState} state - The AnimState that this AnimBlendTree
   * belongs to.
   * @param {AnimBlendTree|null} parent - The parent of the AnimBlendTree. If not null, the
   * AnimNode is stored as part of a {@link AnimBlendTree} hierarchy.
   * @param {string} name - The name of the BlendTree. Used when assigning an {@link AnimTrack}
   * to its children.
   * @param {number|import('../../../core/math/vec2.js').Vec2} point - The coordinate/vector
   * that's used to determine the weight of this node when it's part of an {@link AnimBlendTree}.
   * @param {string[]} parameters - The anim component parameters which are used to calculate the
   * current weights of the blend trees children.
   * @param {object[]} children - The child nodes that this blend tree should create. Can either
   * be of type {@link AnimNode} or {@link BlendTree}.
   * @param {boolean} syncAnimations - If true, the speed of each blended animation will be
   * synchronized.
   * @param {Function} createTree - Used to create child blend trees of varying types.
   * @param {Function} findParameter - Used at runtime to get the current parameter values.
   */
  constructor(state, parent, name, point, parameters, children, syncAnimations, createTree, findParameter) {
    children.sort((a, b) => a.point - b.point);
    super(state, parent, name, point, parameters, children, syncAnimations, createTree, findParameter);
  }
  calculateWeights() {
    if (this.updateParameterValues()) return;
    let weightedDurationSum = 0.0;
    this._children[0].weight = 0.0;
    for (let i = 0; i < this._children.length; i++) {
      const c1 = this._children[i];
      if (i !== this._children.length - 1) {
        const c2 = this._children[i + 1];
        if (c1.point === c2.point) {
          c1.weight = 0.5;
          c2.weight = 0.5;
        } else if (math.between(this._parameterValues[0], c1.point, c2.point, true)) {
          const child2Distance = Math.abs(c1.point - c2.point);
          const parameterDistance = Math.abs(c1.point - this._parameterValues[0]);
          const weight = (child2Distance - parameterDistance) / child2Distance;
          c1.weight = weight;
          c2.weight = 1.0 - weight;
        } else {
          c2.weight = 0.0;
        }
      }
      if (this._syncAnimations) {
        weightedDurationSum += c1.animTrack.duration / c1.absoluteSpeed * c1.weight;
      }
    }
    if (this._syncAnimations) {
      for (let i = 0; i < this._children.length; i++) {
        const child = this._children[i];
        child.weightedSpeed = child.animTrack.duration / child.absoluteSpeed / weightedDurationSum;
      }
    }
  }
}

export { AnimBlendTree1D };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbS1ibGVuZC10cmVlLTFkLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2FuaW0vY29udHJvbGxlci9hbmltLWJsZW5kLXRyZWUtMWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbWF0aCB9IGZyb20gJy4uLy4uLy4uL2NvcmUvbWF0aC9tYXRoLmpzJztcblxuaW1wb3J0IHsgQW5pbUJsZW5kVHJlZSB9IGZyb20gJy4vYW5pbS1ibGVuZC10cmVlLmpzJztcblxuLyoqXG4gKiBBbiBBbmltQmxlbmRUcmVlIHRoYXQgY2FsY3VsYXRlcyBpdHMgd2VpZ2h0cyB1c2luZyBhIDFEIGFsZ29yaXRobSBiYXNlZCBvbiB0aGUgdGhlc2lzXG4gKiBodHRwOi8vcnVuZXZpc2lvbi5jb20vdGhlc2lzL3J1bmVfc2tvdmJvX2pvaGFuc2VuX3RoZXNpcy5wZGYgQ2hhcHRlciA2LlxuICpcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgQW5pbUJsZW5kVHJlZTFEIGV4dGVuZHMgQW5pbUJsZW5kVHJlZSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IEJsZW5kVHJlZTFEIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4vYW5pbS1zdGF0ZS5qcycpLkFuaW1TdGF0ZX0gc3RhdGUgLSBUaGUgQW5pbVN0YXRlIHRoYXQgdGhpcyBBbmltQmxlbmRUcmVlXG4gICAgICogYmVsb25ncyB0by5cbiAgICAgKiBAcGFyYW0ge0FuaW1CbGVuZFRyZWV8bnVsbH0gcGFyZW50IC0gVGhlIHBhcmVudCBvZiB0aGUgQW5pbUJsZW5kVHJlZS4gSWYgbm90IG51bGwsIHRoZVxuICAgICAqIEFuaW1Ob2RlIGlzIHN0b3JlZCBhcyBwYXJ0IG9mIGEge0BsaW5rIEFuaW1CbGVuZFRyZWV9IGhpZXJhcmNoeS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBCbGVuZFRyZWUuIFVzZWQgd2hlbiBhc3NpZ25pbmcgYW4ge0BsaW5rIEFuaW1UcmFja31cbiAgICAgKiB0byBpdHMgY2hpbGRyZW4uXG4gICAgICogQHBhcmFtIHtudW1iZXJ8aW1wb3J0KCcuLi8uLi8uLi9jb3JlL21hdGgvdmVjMi5qcycpLlZlYzJ9IHBvaW50IC0gVGhlIGNvb3JkaW5hdGUvdmVjdG9yXG4gICAgICogdGhhdCdzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSB3ZWlnaHQgb2YgdGhpcyBub2RlIHdoZW4gaXQncyBwYXJ0IG9mIGFuIHtAbGluayBBbmltQmxlbmRUcmVlfS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbWV0ZXJzIC0gVGhlIGFuaW0gY29tcG9uZW50IHBhcmFtZXRlcnMgd2hpY2ggYXJlIHVzZWQgdG8gY2FsY3VsYXRlIHRoZVxuICAgICAqIGN1cnJlbnQgd2VpZ2h0cyBvZiB0aGUgYmxlbmQgdHJlZXMgY2hpbGRyZW4uXG4gICAgICogQHBhcmFtIHtvYmplY3RbXX0gY2hpbGRyZW4gLSBUaGUgY2hpbGQgbm9kZXMgdGhhdCB0aGlzIGJsZW5kIHRyZWUgc2hvdWxkIGNyZWF0ZS4gQ2FuIGVpdGhlclxuICAgICAqIGJlIG9mIHR5cGUge0BsaW5rIEFuaW1Ob2RlfSBvciB7QGxpbmsgQmxlbmRUcmVlfS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN5bmNBbmltYXRpb25zIC0gSWYgdHJ1ZSwgdGhlIHNwZWVkIG9mIGVhY2ggYmxlbmRlZCBhbmltYXRpb24gd2lsbCBiZVxuICAgICAqIHN5bmNocm9uaXplZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjcmVhdGVUcmVlIC0gVXNlZCB0byBjcmVhdGUgY2hpbGQgYmxlbmQgdHJlZXMgb2YgdmFyeWluZyB0eXBlcy5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmaW5kUGFyYW1ldGVyIC0gVXNlZCBhdCBydW50aW1lIHRvIGdldCB0aGUgY3VycmVudCBwYXJhbWV0ZXIgdmFsdWVzLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN0YXRlLCBwYXJlbnQsIG5hbWUsIHBvaW50LCBwYXJhbWV0ZXJzLCBjaGlsZHJlbiwgc3luY0FuaW1hdGlvbnMsIGNyZWF0ZVRyZWUsIGZpbmRQYXJhbWV0ZXIpIHtcbiAgICAgICAgY2hpbGRyZW4uc29ydCgoYSwgYikgPT4gYS5wb2ludCAtIGIucG9pbnQpO1xuICAgICAgICBzdXBlcihzdGF0ZSwgcGFyZW50LCBuYW1lLCBwb2ludCwgcGFyYW1ldGVycywgY2hpbGRyZW4sIHN5bmNBbmltYXRpb25zLCBjcmVhdGVUcmVlLCBmaW5kUGFyYW1ldGVyKTtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVXZWlnaHRzKCkge1xuICAgICAgICBpZiAodGhpcy51cGRhdGVQYXJhbWV0ZXJWYWx1ZXMoKSkgcmV0dXJuO1xuICAgICAgICBsZXQgd2VpZ2h0ZWREdXJhdGlvblN1bSA9IDAuMDtcbiAgICAgICAgdGhpcy5fY2hpbGRyZW5bMF0ud2VpZ2h0ID0gMC4wO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2NoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjMSA9IHRoaXMuX2NoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKGkgIT09IHRoaXMuX2NoaWxkcmVuLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjMiA9IHRoaXMuX2NoaWxkcmVuW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAoYzEucG9pbnQgPT09IGMyLnBvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGMxLndlaWdodCA9IDAuNTtcbiAgICAgICAgICAgICAgICAgICAgYzIud2VpZ2h0ID0gMC41O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWF0aC5iZXR3ZWVuKHRoaXMuX3BhcmFtZXRlclZhbHVlc1swXSwgYzEucG9pbnQsIGMyLnBvaW50LCB0cnVlKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZDJEaXN0YW5jZSA9IE1hdGguYWJzKGMxLnBvaW50IC0gYzIucG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJEaXN0YW5jZSA9IE1hdGguYWJzKGMxLnBvaW50IC0gdGhpcy5fcGFyYW1ldGVyVmFsdWVzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2VpZ2h0ID0gKGNoaWxkMkRpc3RhbmNlIC0gcGFyYW1ldGVyRGlzdGFuY2UpIC8gY2hpbGQyRGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAgIGMxLndlaWdodCA9IHdlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgYzIud2VpZ2h0ID0gKDEuMCAtIHdlaWdodCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYzIud2VpZ2h0ID0gMC4wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9zeW5jQW5pbWF0aW9ucykge1xuICAgICAgICAgICAgICAgIHdlaWdodGVkRHVyYXRpb25TdW0gKz0gYzEuYW5pbVRyYWNrLmR1cmF0aW9uIC8gYzEuYWJzb2x1dGVTcGVlZCAqIGMxLndlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fc3luY0FuaW1hdGlvbnMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHRoaXMuX2NoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgIGNoaWxkLndlaWdodGVkU3BlZWQgPSBjaGlsZC5hbmltVHJhY2suZHVyYXRpb24gLyBjaGlsZC5hYnNvbHV0ZVNwZWVkIC8gd2VpZ2h0ZWREdXJhdGlvblN1bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCB7IEFuaW1CbGVuZFRyZWUxRCB9O1xuIl0sIm5hbWVzIjpbIkFuaW1CbGVuZFRyZWUxRCIsIkFuaW1CbGVuZFRyZWUiLCJjb25zdHJ1Y3RvciIsInN0YXRlIiwicGFyZW50IiwibmFtZSIsInBvaW50IiwicGFyYW1ldGVycyIsImNoaWxkcmVuIiwic3luY0FuaW1hdGlvbnMiLCJjcmVhdGVUcmVlIiwiZmluZFBhcmFtZXRlciIsInNvcnQiLCJhIiwiYiIsImNhbGN1bGF0ZVdlaWdodHMiLCJ1cGRhdGVQYXJhbWV0ZXJWYWx1ZXMiLCJ3ZWlnaHRlZER1cmF0aW9uU3VtIiwiX2NoaWxkcmVuIiwid2VpZ2h0IiwiaSIsImxlbmd0aCIsImMxIiwiYzIiLCJtYXRoIiwiYmV0d2VlbiIsIl9wYXJhbWV0ZXJWYWx1ZXMiLCJjaGlsZDJEaXN0YW5jZSIsIk1hdGgiLCJhYnMiLCJwYXJhbWV0ZXJEaXN0YW5jZSIsIl9zeW5jQW5pbWF0aW9ucyIsImFuaW1UcmFjayIsImR1cmF0aW9uIiwiYWJzb2x1dGVTcGVlZCIsImNoaWxkIiwid2VpZ2h0ZWRTcGVlZCJdLCJtYXBwaW5ncyI6Ijs7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUEsZUFBZSxTQUFTQyxhQUFhLENBQUM7QUFDeEM7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxXQUFXQSxDQUFDQyxLQUFLLEVBQUVDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLFVBQVUsRUFBRUMsUUFBUSxFQUFFQyxjQUFjLEVBQUVDLFVBQVUsRUFBRUMsYUFBYSxFQUFFO0FBQ3JHSCxJQUFBQSxRQUFRLENBQUNJLElBQUksQ0FBQyxDQUFDQyxDQUFDLEVBQUVDLENBQUMsS0FBS0QsQ0FBQyxDQUFDUCxLQUFLLEdBQUdRLENBQUMsQ0FBQ1IsS0FBSyxDQUFDLENBQUE7QUFDMUMsSUFBQSxLQUFLLENBQUNILEtBQUssRUFBRUMsTUFBTSxFQUFFQyxJQUFJLEVBQUVD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
