/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { Vec2 } from '../../core/math/vec2.js';
import { random } from '../../core/math/random.js';
import { LIGHTTYPE_DIRECTIONAL } from '../../scene/constants.js';
import { BakeLight } from './bake-light.js';

const _tempPoint = new Vec2();

// a bake light representing a directional, omni or spot type of light
class BakeLightSimple extends BakeLight {
  get numVirtualLights() {
    // only directional lights support multiple samples
    if (this.light.type === LIGHTTYPE_DIRECTIONAL) {
      return this.light.bakeNumSamples;
    }
    return 1;
  }
  prepareVirtualLight(index, numVirtualLights) {
    // set to original rotation
    const light = this.light;
    light._node.setLocalRotation(this.rotation);

    // random adjustment to the directional light facing
    if (index > 0) {
      const directionalSpreadAngle = light.bakeArea;
      random.circlePointDeterministic(_tempPoint, index, numVirtualLights);
      _tempPoint.mulScalar(directionalSpreadAngle * 0.5);
      light._node.rotateLocal(_tempPoint.x, 0, _tempPoint.y);
    }

    // update transform
    light._node.getWorldTransform();

    // divide intensity by number of virtual lights (in linear space)
    const gamma = this.scene.gammaCorrection ? 2.2 : 1;
    const linearIntensity = Math.pow(this.intensity, gamma);
    light.intensity = Math.pow(linearIntensity / numVirtualLights, 1 / gamma);
  }
}

export { BakeLightSimple };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFrZS1saWdodC1zaW1wbGUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvbGlnaHRtYXBwZXIvYmFrZS1saWdodC1zaW1wbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmVjMiB9IGZyb20gJy4uLy4uL2NvcmUvbWF0aC92ZWMyLmpzJztcbmltcG9ydCB7IHJhbmRvbSB9IGZyb20gJy4uLy4uL2NvcmUvbWF0aC9yYW5kb20uanMnO1xuaW1wb3J0IHsgTElHSFRUWVBFX0RJUkVDVElPTkFMIH0gZnJvbSAnLi4vLi4vc2NlbmUvY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IEJha2VMaWdodCB9IGZyb20gJy4vYmFrZS1saWdodC5qcyc7XG5cbmNvbnN0IF90ZW1wUG9pbnQgPSBuZXcgVmVjMigpO1xuXG4vLyBhIGJha2UgbGlnaHQgcmVwcmVzZW50aW5nIGEgZGlyZWN0aW9uYWwsIG9tbmkgb3Igc3BvdCB0eXBlIG9mIGxpZ2h0XG5jbGFzcyBCYWtlTGlnaHRTaW1wbGUgZXh0ZW5kcyBCYWtlTGlnaHQge1xuICAgIGdldCBudW1WaXJ0dWFsTGlnaHRzKCkge1xuICAgICAgICAvLyBvbmx5IGRpcmVjdGlvbmFsIGxpZ2h0cyBzdXBwb3J0IG11bHRpcGxlIHNhbXBsZXNcbiAgICAgICAgaWYgKHRoaXMubGlnaHQudHlwZSA9PT0gTElHSFRUWVBFX0RJUkVDVElPTkFMKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saWdodC5iYWtlTnVtU2FtcGxlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAxO1xuICAgIH1cblxuICAgIHByZXBhcmVWaXJ0dWFsTGlnaHQoaW5kZXgsIG51bVZpcnR1YWxMaWdodHMpIHtcblxuICAgICAgICAvLyBzZXQgdG8gb3JpZ2luYWwgcm90YXRpb25cbiAgICAgICAgY29uc3QgbGlnaHQgPSB0aGlzLmxpZ2h0O1xuICAgICAgICBsaWdodC5fbm9kZS5zZXRMb2NhbFJvdGF0aW9uKHRoaXMucm90YXRpb24pO1xuXG4gICAgICAgIC8vIHJhbmRvbSBhZGp1c3RtZW50IHRvIHRoZSBkaXJlY3Rpb25hbCBsaWdodCBmYWNpbmdcbiAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aW9uYWxTcHJlYWRBbmdsZSA9IGxpZ2h0LmJha2VBcmVhO1xuICAgICAgICAgICAgcmFuZG9tLmNpcmNsZVBvaW50RGV0ZXJtaW5pc3RpYyhfdGVtcFBvaW50LCBpbmRleCwgbnVtVmlydHVhbExpZ2h0cyk7XG4gICAgICAgICAgICBfdGVtcFBvaW50Lm11bFNjYWxhcihkaXJlY3Rpb25hbFNwcmVhZEFuZ2xlICogMC41KTtcbiAgICAgICAgICAgIGxpZ2h0Ll9ub2RlLnJvdGF0ZUxvY2FsKF90ZW1wUG9pbnQueCwgMCwgX3RlbXBQb2ludC55KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSB0cmFuc2Zvcm1cbiAgICAgICAgbGlnaHQuX25vZGUuZ2V0V29ybGRUcmFuc2Zvcm0oKTtcblxuICAgICAgICAvLyBkaXZpZGUgaW50ZW5zaXR5IGJ5IG51bWJlciBvZiB2aXJ0dWFsIGxpZ2h0cyAoaW4gbGluZWFyIHNwYWNlKVxuICAgICAgICBjb25zdCBnYW1tYSA9IHRoaXMuc2NlbmUuZ2FtbWFDb3JyZWN0aW9uID8gMi4yIDogMTtcbiAgICAgICAgY29uc3QgbGluZWFySW50ZW5zaXR5ID0gTWF0aC5wb3codGhpcy5pbnRlbnNpdHksIGdhbW1hKTtcbiAgICAgICAgbGlnaHQuaW50ZW5zaXR5ID0gTWF0aC5wb3cobGluZWFySW50ZW5zaXR5IC8gbnVtVmlydHVhbExpZ2h0cywgMSAvIGdhbW1hKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IEJha2VMaWdodFNpbXBsZSB9O1xuIl0sIm5hbWVzIjpbIl90ZW1wUG9pbnQiLCJWZWMyIiwiQmFrZUxpZ2h0U2ltcGxlIiwiQmFrZUxpZ2h0IiwibnVtVmlydHVhbExpZ2h0cyIsImxpZ2h0IiwidHlwZSIsIkxJR0hUVFlQRV9ESVJFQ1RJT05BTCIsImJha2VOdW1TYW1wbGVzIiwicHJlcGFyZVZpcnR1YWxMaWdodCIsImluZGV4IiwiX25vZGUiLCJzZXRMb2NhbFJvdGF0aW9uIiwicm90YXRpb24iLCJkaXJlY3Rpb25hbFNwcmVhZEFuZ2xlIiwiYmFrZUFyZWEiLCJyYW5kb20iLCJjaXJjbGVQb2ludERldGVybWluaXN0aWMiLCJtdWxTY2FsYXIiLCJyb3RhdGVMb2NhbCIsIngiLCJ5IiwiZ2V0V29ybGRUcmFuc2Zvcm0iLCJnYW1tYSIsInNjZW5lIiwiZ2FtbWFDb3JyZWN0aW9uIiwibGluZWFySW50ZW5zaXR5IiwiTWF0aCIsInBvdyIsImludGVuc2l0eSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUtBLE1BQU1BLFVBQVUsR0FBRyxJQUFJQyxJQUFJLEVBQUUsQ0FBQTs7QUFFN0I7QUFDQSxNQUFNQyxlQUFlLFNBQVNDLFNBQVMsQ0FBQztFQUNwQyxJQUFJQyxnQkFBZ0JBLEdBQUc7QUFDbkI7QUFDQSxJQUFBLElBQUksSUFBSSxDQUFDQyxLQUFLLENBQUNDLElBQUksS0FBS0MscUJBQXFCLEVBQUU7QUFDM0MsTUFBQSxPQUFPLElBQUksQ0FBQ0YsS0FBSyxDQUFDRyxjQUFjLENBQUE7QUFDcEMsS0FBQTtBQUVBLElBQUEsT0FBTyxDQUFDLENBQUE7QUFDWixHQUFBO0FBRUFDLEVBQUFBLG1CQUFtQkEsQ0FBQ0MsS0FBSyxFQUFFTixnQkFBZ0IsRUFBRTtBQUV6QztBQUNBLElBQUEsTUFBTUMsS0FBSyxHQUFHLElBQUksQ0FBQ0EsS0FBSyxDQUFBO0lBQ3hCQSxLQUFLLENBQUNNLEtBQUssQ0FBQ0MsZ0JBQWdCLENBQUMsSUFBSSxDQUFDQyxRQUFRLENBQUMsQ0FBQTs7QUFFM0M7SUFDQSxJQUFJSCxLQUFLLEdBQUcsQ0FBQyxFQUFFO0FBQ1gsTUFBQSxNQUFNSSxzQkFBc0IsR0FBR1QsS0FBSyxDQUFDVSxRQUFRLENBQUE7TUFDN0NDLE1BQU0sQ0FBQ0Msd0JBQXdCLENBQUNqQixVQUFVLEVBQUVVLEtBQUssRUFBRU4sZ0JBQWdCLENBQUMsQ0FBQTtBQUNwRUosTUFBQUEsVUFBVSxDQUFDa0IsU0FBUyxDQUFDSixzQkFBc0IsR0FBRyxHQUFHLENBQUMsQ0FBQTtBQUNsRFQsTUFBQUEsS0FBSyxDQUFDTSxLQUFLLENBQUNRLFdBQVcsQ0FBQ25CLFVBQVUsQ0FBQ29CLENBQUMsRUFBRSxDQUFDLEVBQUVwQixVQUFVLENBQUNxQixDQUFDLENBQUMsQ0FBQTtBQUMxRCxLQUFBOztBQUVBO0FBQ0FoQixJQUFBQSxLQUFLLENBQUNNLEtBQUssQ0FBQ1csaUJBQWlCLEVBQUUsQ0FBQTs7QUFFL0I7SUFDQSxNQUFNQyxLQUFLLEdBQUcsSUFBSSxDQUFDQyxLQUFLLENBQUNDLGVBQWUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQ2xELE1BQU1DLGVBQWUsR0FBR0MsSUFBSSxDQUFDQyxHQUFHLENBQUMsSUFBSSxDQUFDQyxTQUFTLEVBQUVOLEtBQUssQ0FBQyxDQUFBO0FBQ3ZEbEIsSUFBQUEsS0FBSyxDQUFDd0IsU0FBUyxHQUFHRixJQUFJLENBQUNDLEdBQUcsQ0FBQ0YsZUFBZSxHQUFHdEIsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHbUIsS0FBSyxDQUFDLENBQUE7QUFDN0UsR0FBQTtBQUNKOzs7OyJ9
