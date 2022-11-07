/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Vec2 } from '../../math/vec2.js';
import { math } from '../../math/math.js';
import { AnimBlendTree } from './anim-blend-tree.js';

class AnimBlendTreeDirectional2D extends AnimBlendTree {
  pointCache(i, j) {
    const pointKey = `${i}${j}`;

    if (!this._pointCache[pointKey]) {
      this._pointCache[pointKey] = new Vec2((this._children[j].pointLength - this._children[i].pointLength) / ((this._children[j].pointLength + this._children[i].pointLength) / 2), Vec2.angleRad(this._children[i].point, this._children[j].point) * 2.0);
    }

    return this._pointCache[pointKey];
  }

  calculateWeights() {
    if (this.updateParameterValues()) return;
    let weightSum, weightedDurationSum;

    AnimBlendTreeDirectional2D._p.set(...this._parameterValues);

    const pLength = AnimBlendTreeDirectional2D._p.length();

    weightSum = 0.0;
    weightedDurationSum = 0.0;

    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i];
      const pi = child.point;
      const piLength = child.pointLength;
      let minj = Number.MAX_VALUE;

      for (let j = 0; j < this._children.length; j++) {
        if (i === j) continue;
        const pipj = this.pointCache(i, j);
        const pjLength = this._children[j].pointLength;

        AnimBlendTreeDirectional2D._pip.set((pLength - piLength) / ((pjLength + piLength) / 2), Vec2.angleRad(pi, AnimBlendTreeDirectional2D._p) * 2.0);

        const result = math.clamp(1.0 - Math.abs(AnimBlendTreeDirectional2D._pip.dot(pipj) / pipj.lengthSq()), 0.0, 1.0);
        if (result < minj) minj = result;
      }

      child.weight = minj;
      weightSum += minj;

      if (this._syncAnimations) {
        weightedDurationSum += child.animTrack.duration / child.absoluteSpeed * child.weight;
      }
    }

    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i];
      child.weight = child._weight / weightSum;

      if (this._syncAnimations) {
        const weightedChildDuration = child.animTrack.duration / weightedDurationSum * weightSum;
        child.weightedSpeed = child.absoluteSpeed * weightedChildDuration;
      }
    }
  }

}

AnimBlendTreeDirectional2D._p = new Vec2();
AnimBlendTreeDirectional2D._pip = new Vec2();

export { AnimBlendTreeDirectional2D };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbS1ibGVuZC10cmVlLTJkLWRpcmVjdGlvbmFsLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYW5pbS9jb250cm9sbGVyL2FuaW0tYmxlbmQtdHJlZS0yZC1kaXJlY3Rpb25hbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi4vLi4vbWF0aC92ZWMyLmpzJztcbmltcG9ydCB7IG1hdGggfSBmcm9tICcuLi8uLi9tYXRoL21hdGguanMnO1xuXG5pbXBvcnQgeyBBbmltQmxlbmRUcmVlIH0gZnJvbSAnLi9hbmltLWJsZW5kLXRyZWUuanMnO1xuXG4vKipcbiAqIEFuIEFuaW1CbGVuZFRyZWUgdGhhdCBjYWxjdWxhdGVzIGl0cyB3ZWlnaHRzIHVzaW5nIGEgMkQgZGlyZWN0aW9uYWwgYWxnb3JpdGhtIGJhc2VkIG9uIHRoZSB0aGVzaXNcbiAqIGh0dHA6Ly9ydW5ldmlzaW9uLmNvbS90aGVzaXMvcnVuZV9za292Ym9fam9oYW5zZW5fdGhlc2lzLnBkZiBDaGFwdGVyIDYuXG4gKlxuICogQGlnbm9yZVxuICovXG5jbGFzcyBBbmltQmxlbmRUcmVlRGlyZWN0aW9uYWwyRCBleHRlbmRzIEFuaW1CbGVuZFRyZWUge1xuICAgIHN0YXRpYyBfcCA9IG5ldyBWZWMyKCk7XG5cbiAgICBzdGF0aWMgX3BpcCA9IG5ldyBWZWMyKCk7XG5cbiAgICBwb2ludENhY2hlKGksIGopIHtcbiAgICAgICAgY29uc3QgcG9pbnRLZXkgPSBgJHtpfSR7an1gO1xuICAgICAgICBpZiAoIXRoaXMuX3BvaW50Q2FjaGVbcG9pbnRLZXldKSB7XG4gICAgICAgICAgICB0aGlzLl9wb2ludENhY2hlW3BvaW50S2V5XSA9IG5ldyBWZWMyKFxuICAgICAgICAgICAgICAgICh0aGlzLl9jaGlsZHJlbltqXS5wb2ludExlbmd0aCAtIHRoaXMuX2NoaWxkcmVuW2ldLnBvaW50TGVuZ3RoKSAvICgodGhpcy5fY2hpbGRyZW5bal0ucG9pbnRMZW5ndGggKyB0aGlzLl9jaGlsZHJlbltpXS5wb2ludExlbmd0aCkgLyAyKSxcbiAgICAgICAgICAgICAgICBWZWMyLmFuZ2xlUmFkKHRoaXMuX2NoaWxkcmVuW2ldLnBvaW50LCB0aGlzLl9jaGlsZHJlbltqXS5wb2ludCkgKiAyLjBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3BvaW50Q2FjaGVbcG9pbnRLZXldO1xuICAgIH1cblxuICAgIGNhbGN1bGF0ZVdlaWdodHMoKSB7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZVBhcmFtZXRlclZhbHVlcygpKSByZXR1cm47XG4gICAgICAgIGxldCB3ZWlnaHRTdW0sIHdlaWdodGVkRHVyYXRpb25TdW07XG4gICAgICAgIEFuaW1CbGVuZFRyZWVEaXJlY3Rpb25hbDJELl9wLnNldCguLi50aGlzLl9wYXJhbWV0ZXJWYWx1ZXMpO1xuICAgICAgICBjb25zdCBwTGVuZ3RoID0gQW5pbUJsZW5kVHJlZURpcmVjdGlvbmFsMkQuX3AubGVuZ3RoKCk7XG4gICAgICAgIHdlaWdodFN1bSA9IDAuMDtcbiAgICAgICAgd2VpZ2h0ZWREdXJhdGlvblN1bSA9IDAuMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLl9jaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGNvbnN0IHBpID0gY2hpbGQucG9pbnQ7XG4gICAgICAgICAgICBjb25zdCBwaUxlbmd0aCA9IGNoaWxkLnBvaW50TGVuZ3RoO1xuICAgICAgICAgICAgbGV0IG1pbmogPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSBqKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBwaXBqID0gdGhpcy5wb2ludENhY2hlKGksIGopO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBqTGVuZ3RoID0gdGhpcy5fY2hpbGRyZW5bal0ucG9pbnRMZW5ndGg7XG4gICAgICAgICAgICAgICAgQW5pbUJsZW5kVHJlZURpcmVjdGlvbmFsMkQuX3BpcC5zZXQoKHBMZW5ndGggLSBwaUxlbmd0aCkgLyAoKHBqTGVuZ3RoICsgcGlMZW5ndGgpIC8gMiksIFZlYzIuYW5nbGVSYWQocGksIEFuaW1CbGVuZFRyZWVEaXJlY3Rpb25hbDJELl9wKSAqIDIuMCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWF0aC5jbGFtcCgxLjAgLSBNYXRoLmFicygoQW5pbUJsZW5kVHJlZURpcmVjdGlvbmFsMkQuX3BpcC5kb3QocGlwaikgLyBwaXBqLmxlbmd0aFNxKCkpKSwgMC4wLCAxLjApO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPCBtaW5qKSBtaW5qID0gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpbGQud2VpZ2h0ID0gbWluajtcbiAgICAgICAgICAgIHdlaWdodFN1bSArPSBtaW5qO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N5bmNBbmltYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgd2VpZ2h0ZWREdXJhdGlvblN1bSArPSAoY2hpbGQuYW5pbVRyYWNrLmR1cmF0aW9uIC8gY2hpbGQuYWJzb2x1dGVTcGVlZCkgKiBjaGlsZC53ZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLl9jaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGNoaWxkLndlaWdodCA9IGNoaWxkLl93ZWlnaHQgLyB3ZWlnaHRTdW07XG4gICAgICAgICAgICBpZiAodGhpcy5fc3luY0FuaW1hdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3ZWlnaHRlZENoaWxkRHVyYXRpb24gPSAoY2hpbGQuYW5pbVRyYWNrLmR1cmF0aW9uIC8gd2VpZ2h0ZWREdXJhdGlvblN1bSkgKiB3ZWlnaHRTdW07XG4gICAgICAgICAgICAgICAgY2hpbGQud2VpZ2h0ZWRTcGVlZCA9ICBjaGlsZC5hYnNvbHV0ZVNwZWVkICogd2VpZ2h0ZWRDaGlsZER1cmF0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBBbmltQmxlbmRUcmVlRGlyZWN0aW9uYWwyRCB9O1xuIl0sIm5hbWVzIjpbIkFuaW1CbGVuZFRyZWVEaXJlY3Rpb25hbDJEIiwiQW5pbUJsZW5kVHJlZSIsInBvaW50Q2FjaGUiLCJpIiwiaiIsInBvaW50S2V5IiwiX3BvaW50Q2FjaGUiLCJWZWMyIiwiX2NoaWxkcmVuIiwicG9pbnRMZW5ndGgiLCJhbmdsZVJhZCIsInBvaW50IiwiY2FsY3VsYXRlV2VpZ2h0cyIsInVwZGF0ZVBhcmFtZXRlclZhbHVlcyIsIndlaWdodFN1bSIsIndlaWdodGVkRHVyYXRpb25TdW0iLCJfcCIsInNldCIsIl9wYXJhbWV0ZXJWYWx1ZXMiLCJwTGVuZ3RoIiwibGVuZ3RoIiwiY2hpbGQiLCJwaSIsInBpTGVuZ3RoIiwibWluaiIsIk51bWJlciIsIk1BWF9WQUxVRSIsInBpcGoiLCJwakxlbmd0aCIsIl9waXAiLCJyZXN1bHQiLCJtYXRoIiwiY2xhbXAiLCJNYXRoIiwiYWJzIiwiZG90IiwibGVuZ3RoU3EiLCJ3ZWlnaHQiLCJfc3luY0FuaW1hdGlvbnMiLCJhbmltVHJhY2siLCJkdXJhdGlvbiIsImFic29sdXRlU3BlZWQiLCJfd2VpZ2h0Iiwid2VpZ2h0ZWRDaGlsZER1cmF0aW9uIiwid2VpZ2h0ZWRTcGVlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBV0EsTUFBTUEsMEJBQU4sU0FBeUNDLGFBQXpDLENBQXVEO0FBS25EQyxFQUFBQSxVQUFVLENBQUNDLENBQUQsRUFBSUMsQ0FBSixFQUFPO0FBQ2IsSUFBQSxNQUFNQyxR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
