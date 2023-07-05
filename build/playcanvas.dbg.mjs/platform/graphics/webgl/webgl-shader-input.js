import { UNIFORMTYPE_VEC4, UNIFORMTYPE_VEC4ARRAY, UNIFORMTYPE_VEC3, UNIFORMTYPE_VEC3ARRAY, UNIFORMTYPE_VEC2, UNIFORMTYPE_VEC2ARRAY, UNIFORMTYPE_FLOAT, UNIFORMTYPE_FLOATARRAY } from '../constants.js';
import { Version } from '../version.js';

/**
 * Representation of a shader uniform.
 *
 * @ignore
 */
class WebglShaderInput {
  /**
   * Create a new WebglShaderInput instance.
   *
   * @param {import('../graphics-device.js').GraphicsDevice} graphicsDevice - The graphics device
   * used to manage this shader input.
   * @param {string} name - The name of the shader input.
   * @param {number} type - The type of the shader input.
   * @param {number | WebGLUniformLocation} locationId - The location id of the shader input.
   */
  constructor(graphicsDevice, name, type, locationId) {
    // Set the shader attribute location
    this.locationId = locationId;

    // Resolve the ScopeId for the attribute name
    this.scopeId = graphicsDevice.scope.resolve(name);

    // Create the version
    this.version = new Version();

    // custom data type for arrays
    if (name.substring(name.length - 3) === "[0]") {
      switch (type) {
        case UNIFORMTYPE_FLOAT:
          type = UNIFORMTYPE_FLOATARRAY;
          break;
        case UNIFORMTYPE_VEC2:
          type = UNIFORMTYPE_VEC2ARRAY;
          break;
        case UNIFORMTYPE_VEC3:
          type = UNIFORMTYPE_VEC3ARRAY;
          break;
        case UNIFORMTYPE_VEC4:
          type = UNIFORMTYPE_VEC4ARRAY;
          break;
      }
    }

    // Set the data dataType
    this.dataType = type;
    this.value = [null, null, null, null];

    // Array to hold texture unit ids
    this.array = [];
  }
}

export { WebglShaderInput };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ2wtc2hhZGVyLWlucHV0LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvcGxhdGZvcm0vZ3JhcGhpY3Mvd2ViZ2wvd2ViZ2wtc2hhZGVyLWlucHV0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFVOSUZPUk1UWVBFX0ZMT0FULCBVTklGT1JNVFlQRV9GTE9BVEFSUkFZLCBVTklGT1JNVFlQRV9WRUMyLCBVTklGT1JNVFlQRV9WRUMzLCBVTklGT1JNVFlQRV9WRUM0LFxuICAgIFVOSUZPUk1UWVBFX1ZFQzJBUlJBWSwgVU5JRk9STVRZUEVfVkVDM0FSUkFZLCBVTklGT1JNVFlQRV9WRUM0QVJSQVkgfSBmcm9tICcuLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgVmVyc2lvbiB9IGZyb20gJy4uL3ZlcnNpb24uanMnO1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2hhZGVyIHVuaWZvcm0uXG4gKlxuICogQGlnbm9yZVxuICovXG5jbGFzcyBXZWJnbFNoYWRlcklucHV0IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgV2ViZ2xTaGFkZXJJbnB1dCBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuLi9ncmFwaGljcy1kZXZpY2UuanMnKS5HcmFwaGljc0RldmljZX0gZ3JhcGhpY3NEZXZpY2UgLSBUaGUgZ3JhcGhpY3MgZGV2aWNlXG4gICAgICogdXNlZCB0byBtYW5hZ2UgdGhpcyBzaGFkZXIgaW5wdXQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgc2hhZGVyIGlucHV0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0eXBlIC0gVGhlIHR5cGUgb2YgdGhlIHNoYWRlciBpbnB1dC5cbiAgICAgKiBAcGFyYW0ge251bWJlciB8IFdlYkdMVW5pZm9ybUxvY2F0aW9ufSBsb2NhdGlvbklkIC0gVGhlIGxvY2F0aW9uIGlkIG9mIHRoZSBzaGFkZXIgaW5wdXQuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZ3JhcGhpY3NEZXZpY2UsIG5hbWUsIHR5cGUsIGxvY2F0aW9uSWQpIHtcbiAgICAgICAgLy8gU2V0IHRoZSBzaGFkZXIgYXR0cmlidXRlIGxvY2F0aW9uXG4gICAgICAgIHRoaXMubG9jYXRpb25JZCA9IGxvY2F0aW9uSWQ7XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgU2NvcGVJZCBmb3IgdGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICAgIHRoaXMuc2NvcGVJZCA9IGdyYXBoaWNzRGV2aWNlLnNjb3BlLnJlc29sdmUobmFtZSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSB2ZXJzaW9uXG4gICAgICAgIHRoaXMudmVyc2lvbiA9IG5ldyBWZXJzaW9uKCk7XG5cbiAgICAgICAgLy8gY3VzdG9tIGRhdGEgdHlwZSBmb3IgYXJyYXlzXG4gICAgICAgIGlmIChuYW1lLnN1YnN0cmluZyhuYW1lLmxlbmd0aCAtIDMpID09PSBcIlswXVwiKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFVOSUZPUk1UWVBFX0ZMT0FUOiB0eXBlID0gVU5JRk9STVRZUEVfRkxPQVRBUlJBWTsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBVTklGT1JNVFlQRV9WRUMyOiB0eXBlID0gVU5JRk9STVRZUEVfVkVDMkFSUkFZOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFVOSUZPUk1UWVBFX1ZFQzM6IHR5cGUgPSBVTklGT1JNVFlQRV9WRUMzQVJSQVk7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgVU5JRk9STVRZUEVfVkVDNDogdHlwZSA9IFVOSUZPUk1UWVBFX1ZFQzRBUlJBWTsgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIGRhdGEgZGF0YVR5cGVcbiAgICAgICAgdGhpcy5kYXRhVHlwZSA9IHR5cGU7XG5cbiAgICAgICAgdGhpcy52YWx1ZSA9IFtudWxsLCBudWxsLCBudWxsLCBudWxsXTtcblxuICAgICAgICAvLyBBcnJheSB0byBob2xkIHRleHR1cmUgdW5pdCBpZHNcbiAgICAgICAgdGhpcy5hcnJheSA9IFtdO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgV2ViZ2xTaGFkZXJJbnB1dCB9O1xuIl0sIm5hbWVzIjpbIldlYmdsU2hhZGVySW5wdXQiLCJjb25zdHJ1Y3RvciIsImdyYXBoaWNzRGV2aWNlIiwibmFtZSIsInR5cGUiLCJsb2NhdGlvbklkIiwic2NvcGVJZCIsInNjb3BlIiwicmVzb2x2ZSIsInZlcnNpb24iLCJWZXJzaW9uIiwic3Vic3RyaW5nIiwibGVuZ3RoIiwiVU5JRk9STVRZUEVfRkxPQVQiLCJVTklGT1JNVFlQRV9GTE9BVEFSUkFZIiwiVU5JRk9STVRZUEVfVkVDMiIsIlVOSUZPUk1UWVBFX1ZFQzJBUlJBWSIsIlVOSUZPUk1UWVBFX1ZFQzMiLCJVTklGT1JNVFlQRV9WRUMzQVJSQVkiLCJVTklGT1JNVFlQRV9WRUM0IiwiVU5JRk9STVRZUEVfVkVDNEFSUkFZIiwiZGF0YVR5cGUiLCJ2YWx1ZSIsImFycmF5Il0sIm1hcHBpbmdzIjoiOzs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUEsZ0JBQWdCLENBQUM7QUFDbkI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0lDLFdBQVdBLENBQUNDLGNBQWMsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFVBQVUsRUFBRTtBQUNoRDtJQUNBLElBQUksQ0FBQ0EsVUFBVSxHQUFHQSxVQUFVLENBQUE7O0FBRTVCO0lBQ0EsSUFBSSxDQUFDQyxPQUFPLEdBQUdKLGNBQWMsQ0FBQ0ssS0FBSyxDQUFDQyxPQUFPLENBQUNMLElBQUksQ0FBQyxDQUFBOztBQUVqRDtBQUNBLElBQUEsSUFBSSxDQUFDTSxPQUFPLEdBQUcsSUFBSUMsT0FBTyxFQUFFLENBQUE7O0FBRTVCO0FBQ0EsSUFBQSxJQUFJUCxJQUFJLENBQUNRLFNBQVMsQ0FBQ1IsSUFBSSxDQUFDUyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFO0FBQzNDLE1BQUEsUUFBUVIsSUFBSTtBQUNSLFFBQUEsS0FBS1MsaUJBQWlCO0FBQUVULFVBQUFBLElBQUksR0FBR1Usc0JBQXNCLENBQUE7QUFBRSxVQUFBLE1BQUE7QUFDdkQsUUFBQSxLQUFLQyxnQkFBZ0I7QUFBRVgsVUFBQUEsSUFBSSxHQUFHWSxxQkFBcUIsQ0FBQTtBQUFFLFVBQUEsTUFBQTtBQUNyRCxRQUFBLEtBQUtDLGdCQUFnQjtBQUFFYixVQUFBQSxJQUFJLEdBQUdjLHFCQUFxQixDQUFBO0FBQUUsVUFBQSxNQUFBO0FBQ3JELFFBQUEsS0FBS0MsZ0JBQWdCO0FBQUVmLFVBQUFBLElBQUksR0FBR2dCLHFCQUFxQixDQUFBO0FBQUUsVUFBQSxNQUFBO0FBQ3pELE9BQUE7QUFDSixLQUFBOztBQUVBO0lBQ0EsSUFBSSxDQUFDQyxRQUFRLEdBQUdqQixJQUFJLENBQUE7SUFFcEIsSUFBSSxDQUFDa0IsS0FBSyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7O0FBRXJDO0lBQ0EsSUFBSSxDQUFDQyxLQUFLLEdBQUcsRUFBRSxDQUFBO0FBQ25CLEdBQUE7QUFDSjs7OzsifQ==
