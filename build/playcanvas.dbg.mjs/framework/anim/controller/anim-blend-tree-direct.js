/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { AnimBlendTree } from './anim-blend-tree.js';

/**
 * An AnimBlendTree that calculates normalized weight values based on the total weight.
 *
 * @ignore
 */
class AnimBlendTreeDirect extends AnimBlendTree {
  calculateWeights() {
    if (this.updateParameterValues()) return;
    let weightSum = 0.0;
    let weightedDurationSum = 0.0;
    for (let i = 0; i < this._children.length; i++) {
      weightSum += Math.max(this._parameterValues[i], 0.0);
      if (this._syncAnimations) {
        const child = this._children[i];
        weightedDurationSum += child.animTrack.duration / child.absoluteSpeed * child.weight;
      }
    }
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i];
      const weight = Math.max(this._parameterValues[i], 0.0);
      if (weightSum) {
        child.weight = weight / weightSum;
        if (this._syncAnimations) {
          child.weightedSpeed = child.animTrack.duration / child.absoluteSpeed / weightedDurationSum;
        }
      } else {
        child.weight = 0.0;
        if (this._syncAnimations) {
          child.weightedSpeed = 0;
        }
      }
    }
  }
}

export { AnimBlendTreeDirect };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbS1ibGVuZC10cmVlLWRpcmVjdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9hbmltL2NvbnRyb2xsZXIvYW5pbS1ibGVuZC10cmVlLWRpcmVjdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBbmltQmxlbmRUcmVlIH0gZnJvbSAnLi9hbmltLWJsZW5kLXRyZWUuanMnO1xuXG4vKipcbiAqIEFuIEFuaW1CbGVuZFRyZWUgdGhhdCBjYWxjdWxhdGVzIG5vcm1hbGl6ZWQgd2VpZ2h0IHZhbHVlcyBiYXNlZCBvbiB0aGUgdG90YWwgd2VpZ2h0LlxuICpcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgQW5pbUJsZW5kVHJlZURpcmVjdCBleHRlbmRzIEFuaW1CbGVuZFRyZWUge1xuICAgIGNhbGN1bGF0ZVdlaWdodHMoKSB7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZVBhcmFtZXRlclZhbHVlcygpKSByZXR1cm47XG4gICAgICAgIGxldCB3ZWlnaHRTdW0gPSAwLjA7XG4gICAgICAgIGxldCB3ZWlnaHRlZER1cmF0aW9uU3VtID0gMC4wO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2NoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB3ZWlnaHRTdW0gKz0gTWF0aC5tYXgodGhpcy5fcGFyYW1ldGVyVmFsdWVzW2ldLCAwLjApO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N5bmNBbmltYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLl9jaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICB3ZWlnaHRlZER1cmF0aW9uU3VtICs9IGNoaWxkLmFuaW1UcmFjay5kdXJhdGlvbiAvIGNoaWxkLmFic29sdXRlU3BlZWQgKiBjaGlsZC53ZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLl9jaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGNvbnN0IHdlaWdodCA9IE1hdGgubWF4KHRoaXMuX3BhcmFtZXRlclZhbHVlc1tpXSwgMC4wKTtcbiAgICAgICAgICAgIGlmICh3ZWlnaHRTdW0pIHtcbiAgICAgICAgICAgICAgICBjaGlsZC53ZWlnaHQgPSB3ZWlnaHQgLyB3ZWlnaHRTdW07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3N5bmNBbmltYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLndlaWdodGVkU3BlZWQgPSBjaGlsZC5hbmltVHJhY2suZHVyYXRpb24gLyBjaGlsZC5hYnNvbHV0ZVNwZWVkIC8gd2VpZ2h0ZWREdXJhdGlvblN1bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoaWxkLndlaWdodCA9IDAuMDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc3luY0FuaW1hdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQud2VpZ2h0ZWRTcGVlZCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBBbmltQmxlbmRUcmVlRGlyZWN0IH07XG4iXSwibmFtZXMiOlsiQW5pbUJsZW5kVHJlZURpcmVjdCIsIkFuaW1CbGVuZFRyZWUiLCJjYWxjdWxhdGVXZWlnaHRzIiwidXBkYXRlUGFyYW1ldGVyVmFsdWVzIiwid2VpZ2h0U3VtIiwid2VpZ2h0ZWREdXJhdGlvblN1bSIsImkiLCJfY2hpbGRyZW4iLCJsZW5ndGgiLCJNYXRoIiwibWF4IiwiX3BhcmFtZXRlclZhbHVlcyIsIl9zeW5jQW5pbWF0aW9ucyIsImNoaWxkIiwiYW5pbVRyYWNrIiwiZHVyYXRpb24iLCJhYnNvbHV0ZVNwZWVkIiwid2VpZ2h0Iiwid2VpZ2h0ZWRTcGVlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQSxtQkFBbUIsU0FBU0MsYUFBYSxDQUFDO0FBQzVDQyxFQUFBQSxnQkFBZ0JBLEdBQUc7QUFDZixJQUFBLElBQUksSUFBSSxDQUFDQyxxQkFBcUIsRUFBRSxFQUFFLE9BQUE7SUFDbEMsSUFBSUMsU0FBUyxHQUFHLEdBQUcsQ0FBQTtJQUNuQixJQUFJQyxtQkFBbUIsR0FBRyxHQUFHLENBQUE7QUFDN0IsSUFBQSxLQUFLLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNDLFNBQVMsQ0FBQ0MsTUFBTSxFQUFFRixDQUFDLEVBQUUsRUFBRTtBQUM1Q0YsTUFBQUEsU0FBUyxJQUFJSyxJQUFJLENBQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUNDLGdCQUFnQixDQUFDTCxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtNQUNwRCxJQUFJLElBQUksQ0FBQ00sZUFBZSxFQUFFO0FBQ3RCLFFBQUEsTUFBTUMsS0FBSyxHQUFHLElBQUksQ0FBQ04sU0FBUyxDQUFDRCxDQUFDLENBQUMsQ0FBQTtBQUMvQkQsUUFBQUEsbUJBQW1CLElBQUlRLEtBQUssQ0FBQ0MsU0FBUyxDQUFDQyxRQUFRLEdBQUdGLEtBQUssQ0FBQ0csYUFBYSxHQUFHSCxLQUFLLENBQUNJLE1BQU0sQ0FBQTtBQUN4RixPQUFBO0FBQ0osS0FBQTtBQUNBLElBQUEsS0FBSyxJQUFJWCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDQyxTQUFTLENBQUNDLE1BQU0sRUFBRUYsQ0FBQyxFQUFFLEVBQUU7QUFDNUMsTUFBQSxNQUFNTyxLQUFLLEdBQUcsSUFBSSxDQUFDTixTQUFTLENBQUNELENBQUMsQ0FBQyxDQUFBO0FBQy9CLE1BQUEsTUFBTVcsTUFBTSxHQUFHUixJQUFJLENBQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUNDLGdCQUFnQixDQUFDTCxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUN0RCxNQUFBLElBQUlGLFNBQVMsRUFBRTtBQUNYUyxRQUFBQSxLQUFLLENBQUNJLE1BQU0sR0FBR0EsTUFBTSxHQUFHYixTQUFTLENBQUE7UUFDakMsSUFBSSxJQUFJLENBQUNRLGVBQWUsRUFBRTtBQUN0QkMsVUFBQUEsS0FBSyxDQUFDSyxhQUFhLEdBQUdMLEtBQUssQ0FBQ0MsU0FBUyxDQUFDQyxRQUFRLEdBQUdGLEtBQUssQ0FBQ0csYUFBYSxHQUFHWCxtQkFBbUIsQ0FBQTtBQUM5RixTQUFBO0FBQ0osT0FBQyxNQUFNO1FBQ0hRLEtBQUssQ0FBQ0ksTUFBTSxHQUFHLEdBQUcsQ0FBQTtRQUNsQixJQUFJLElBQUksQ0FBQ0wsZUFBZSxFQUFFO1VBQ3RCQyxLQUFLLENBQUNLLGFBQWEsR0FBRyxDQUFDLENBQUE7QUFDM0IsU0FBQTtBQUNKLE9BQUE7QUFDSixLQUFBO0FBQ0osR0FBQTtBQUNKOzs7OyJ9
