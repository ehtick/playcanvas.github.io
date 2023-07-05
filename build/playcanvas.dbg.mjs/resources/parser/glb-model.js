/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { GlbContainerResource } from './glb-container-resource.js';
import { GlbParser } from './glb-parser.js';

class GlbModelParser {
  constructor(device, defaultMaterial) {
    this._device = device;
    this._defaultMaterial = defaultMaterial;
  }

  parse(data) {
    const glbResources = GlbParser.parse('filename.glb', data, this._device);

    if (glbResources) {
      const model = GlbContainerResource.createModel(glbResources, this._defaultMaterial);
      glbResources.destroy();
      return model;
    }

    return null;
  }

}

export { GlbModelParser };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xiLW1vZGVsLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmVzb3VyY2VzL3BhcnNlci9nbGItbW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgR2xiQ29udGFpbmVyUmVzb3VyY2UgfSBmcm9tICcuL2dsYi1jb250YWluZXItcmVzb3VyY2UuanMnO1xuaW1wb3J0IHsgR2xiUGFyc2VyIH0gZnJvbSAnLi9nbGItcGFyc2VyLmpzJztcblxuY2xhc3MgR2xiTW9kZWxQYXJzZXIge1xuICAgIGNvbnN0cnVjdG9yKGRldmljZSwgZGVmYXVsdE1hdGVyaWFsKSB7XG4gICAgICAgIHRoaXMuX2RldmljZSA9IGRldmljZTtcbiAgICAgICAgdGhpcy5fZGVmYXVsdE1hdGVyaWFsID0gZGVmYXVsdE1hdGVyaWFsO1xuICAgIH1cblxuICAgIHBhcnNlKGRhdGEpIHtcbiAgICAgICAgY29uc3QgZ2xiUmVzb3VyY2VzID0gR2xiUGFyc2VyLnBhcnNlKCdmaWxlbmFtZS5nbGInLCBkYXRhLCB0aGlzLl9kZXZpY2UpO1xuICAgICAgICBpZiAoZ2xiUmVzb3VyY2VzKSB7XG4gICAgICAgICAgICBjb25zdCBtb2RlbCA9IEdsYkNvbnRhaW5lclJlc291cmNlLmNyZWF0ZU1vZGVsKGdsYlJlc291cmNlcywgdGhpcy5fZGVmYXVsdE1hdGVyaWFsKTtcbiAgICAgICAgICAgIGdsYlJlc291cmNlcy5kZXN0cm95KCk7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5leHBvcnQgeyBHbGJNb2RlbFBhcnNlciB9O1xuIl0sIm5hbWVzIjpbIkdsYk1vZGVsUGFyc2VyIiwiY29uc3RydWN0b3IiLCJkZXZpY2UiLCJkZWZhdWx0TWF0ZXJpYWwiLCJfZGV2aWNlIiwiX2RlZmF1bHRNYXRlcmlhbCIsInBhcnNlIiwiZGF0YSIsImdsYlJlc291cmNlcyIsIkdsYlBhcnNlciIsIm1vZGVsIiwiR2xiQ29udGFpbmVyUmVzb3VyY2UiLCJjcmVhdGVNb2RlbCIsImRlc3Ryb3kiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBR0EsTUFBTUEsY0FBTixDQUFxQjtBQUNqQkMsRUFBQUEsV0FBVyxDQUFDQyxNQUFELEVBQVNDLGVBQVQsRUFBMEI7SUFDakMsSUFBS0MsQ0FBQUEsT0FBTCxHQUFlRixNQUFmLENBQUE7SUFDQSxJQUFLRyxDQUFBQSxnQkFBTCxHQUF3QkYsZUFBeEIsQ0FBQTtBQUNILEdBQUE7O0VBRURHLEtBQUssQ0FBQ0MsSUFBRCxFQUFPO0FBQ1IsSUFBQSxNQUFNQyxZQUFZLEdBQUdDLFNBQVMsQ0FBQ0gsS0FBVixDQUFnQixjQUFoQixFQUFnQ0MsSUFBaEMsRUFBc0MsSUFBS0gsQ0FBQUEsT0FBM0MsQ0FBckIsQ0FBQTs7QUFDQSxJQUFBLElBQUlJLFlBQUosRUFBa0I7TUFDZCxNQUFNRSxLQUFLLEdBQUdDLG9CQUFvQixDQUFDQyxXQUFyQixDQUFpQ0osWUFBakMsRUFBK0MsSUFBS0gsQ0FBQUEsZ0JBQXBELENBQWQsQ0FBQTtBQUNBRyxNQUFBQSxZQUFZLENBQUNLLE9BQWIsRUFBQSxDQUFBO0FBQ0EsTUFBQSxPQUFPSCxLQUFQLENBQUE7QUFDSCxLQUFBOztBQUNELElBQUEsT0FBTyxJQUFQLENBQUE7QUFDSCxHQUFBOztBQWRnQjs7OzsifQ==
