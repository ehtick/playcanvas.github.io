import { BINDGROUP_VIEW } from './constants.js';

/**
 * Options to drive shader processing to add support for bind groups and uniform buffers.
 *
 * @ignore
 */
class ShaderProcessorOptions {
  /**
   * Constructs shader processing options, used to process the shader for uniform buffer support.
   *
   * @param {import('./uniform-buffer-format.js').UniformBufferFormat} [viewUniformFormat] - Format
   * of the uniform buffer.
   * @param {import('./bind-group-format.js').BindGroupFormat} [viewBindGroupFormat] - Format of
   * the bind group.
   * @param {import('./vertex-format.js').VertexFormat} [vertexFormat] - Format of the vertex
   * buffer.
   */
  constructor(viewUniformFormat, viewBindGroupFormat, vertexFormat) {
    /** @type {import('./uniform-buffer-format.js').UniformBufferFormat[]} */
    this.uniformFormats = [];
    /** @type {import('./bind-group-format.js').BindGroupFormat[]} */
    this.bindGroupFormats = [];
    /** @type {import('./vertex-format.js').VertexFormat[]} */
    this.vertexFormat = void 0;
    // construct a sparse array
    this.uniformFormats[BINDGROUP_VIEW] = viewUniformFormat;
    this.bindGroupFormats[BINDGROUP_VIEW] = viewBindGroupFormat;
    this.vertexFormat = vertexFormat;
  }

  /**
   * Get the bind group index for the uniform name.
   *
   * @param {string} name - The name of the uniform.
   * @returns {boolean} - Returns true if the uniform exists, false otherwise.
   */
  hasUniform(name) {
    for (let i = 0; i < this.uniformFormats.length; i++) {
      const uniformFormat = this.uniformFormats[i];
      if (uniformFormat != null && uniformFormat.get(name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the bind group texture slot for the texture uniform name.
   *
   * @param {string} name - The name of the texture uniform.
   * @returns {boolean} - Returns true if the texture uniform exists, false otherwise.
   */
  hasTexture(name) {
    for (let i = 0; i < this.bindGroupFormats.length; i++) {
      const groupFormat = this.bindGroupFormats[i];
      if (groupFormat != null && groupFormat.getTexture(name)) {
        return true;
      }
    }
    return false;
  }
  getVertexElement(semantic) {
    var _this$vertexFormat;
    return (_this$vertexFormat = this.vertexFormat) == null ? void 0 : _this$vertexFormat.elements.find(element => element.name === semantic);
  }

  /**
   * Generate unique key represending the processing options.
   *
   * @returns {string} - Returns the key.
   */
  generateKey() {
    var _this$vertexFormat2;
    // TODO: Optimize. Uniform and BindGroup formats should have their keys evaluated in their
    // constructors, and here we should simply concatenate those.
    return JSON.stringify(this.uniformFormats) + JSON.stringify(this.bindGroupFormats) + ((_this$vertexFormat2 = this.vertexFormat) == null ? void 0 : _this$vertexFormat2.renderingHashString);
  }
}

export { ShaderProcessorOptions };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZGVyLXByb2Nlc3Nvci1vcHRpb25zLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcGxhdGZvcm0vZ3JhcGhpY3Mvc2hhZGVyLXByb2Nlc3Nvci1vcHRpb25zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJJTkRHUk9VUF9WSUVXIH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5cbi8qKlxuICogT3B0aW9ucyB0byBkcml2ZSBzaGFkZXIgcHJvY2Vzc2luZyB0byBhZGQgc3VwcG9ydCBmb3IgYmluZCBncm91cHMgYW5kIHVuaWZvcm0gYnVmZmVycy5cbiAqXG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIFNoYWRlclByb2Nlc3Nvck9wdGlvbnMge1xuICAgIC8qKiBAdHlwZSB7aW1wb3J0KCcuL3VuaWZvcm0tYnVmZmVyLWZvcm1hdC5qcycpLlVuaWZvcm1CdWZmZXJGb3JtYXRbXX0gKi9cbiAgICB1bmlmb3JtRm9ybWF0cyA9IFtdO1xuXG4gICAgLyoqIEB0eXBlIHtpbXBvcnQoJy4vYmluZC1ncm91cC1mb3JtYXQuanMnKS5CaW5kR3JvdXBGb3JtYXRbXX0gKi9cbiAgICBiaW5kR3JvdXBGb3JtYXRzID0gW107XG5cbiAgICAvKiogQHR5cGUge2ltcG9ydCgnLi92ZXJ0ZXgtZm9ybWF0LmpzJykuVmVydGV4Rm9ybWF0W119ICovXG4gICAgdmVydGV4Rm9ybWF0O1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBzaGFkZXIgcHJvY2Vzc2luZyBvcHRpb25zLCB1c2VkIHRvIHByb2Nlc3MgdGhlIHNoYWRlciBmb3IgdW5pZm9ybSBidWZmZXIgc3VwcG9ydC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuL3VuaWZvcm0tYnVmZmVyLWZvcm1hdC5qcycpLlVuaWZvcm1CdWZmZXJGb3JtYXR9IFt2aWV3VW5pZm9ybUZvcm1hdF0gLSBGb3JtYXRcbiAgICAgKiBvZiB0aGUgdW5pZm9ybSBidWZmZXIuXG4gICAgICogQHBhcmFtIHtpbXBvcnQoJy4vYmluZC1ncm91cC1mb3JtYXQuanMnKS5CaW5kR3JvdXBGb3JtYXR9IFt2aWV3QmluZEdyb3VwRm9ybWF0XSAtIEZvcm1hdCBvZlxuICAgICAqIHRoZSBiaW5kIGdyb3VwLlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuL3ZlcnRleC1mb3JtYXQuanMnKS5WZXJ0ZXhGb3JtYXR9IFt2ZXJ0ZXhGb3JtYXRdIC0gRm9ybWF0IG9mIHRoZSB2ZXJ0ZXhcbiAgICAgKiBidWZmZXIuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iodmlld1VuaWZvcm1Gb3JtYXQsIHZpZXdCaW5kR3JvdXBGb3JtYXQsIHZlcnRleEZvcm1hdCkge1xuXG4gICAgICAgIC8vIGNvbnN0cnVjdCBhIHNwYXJzZSBhcnJheVxuICAgICAgICB0aGlzLnVuaWZvcm1Gb3JtYXRzW0JJTkRHUk9VUF9WSUVXXSA9IHZpZXdVbmlmb3JtRm9ybWF0O1xuICAgICAgICB0aGlzLmJpbmRHcm91cEZvcm1hdHNbQklOREdST1VQX1ZJRVddID0gdmlld0JpbmRHcm91cEZvcm1hdDtcblxuICAgICAgICB0aGlzLnZlcnRleEZvcm1hdCA9IHZlcnRleEZvcm1hdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGJpbmQgZ3JvdXAgaW5kZXggZm9yIHRoZSB1bmlmb3JtIG5hbWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB1bmlmb3JtLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIFJldHVybnMgdHJ1ZSBpZiB0aGUgdW5pZm9ybSBleGlzdHMsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBoYXNVbmlmb3JtKG5hbWUpIHtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudW5pZm9ybUZvcm1hdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1Gb3JtYXQgPSB0aGlzLnVuaWZvcm1Gb3JtYXRzW2ldO1xuICAgICAgICAgICAgaWYgKHVuaWZvcm1Gb3JtYXQ/LmdldChuYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYmluZCBncm91cCB0ZXh0dXJlIHNsb3QgZm9yIHRoZSB0ZXh0dXJlIHVuaWZvcm0gbmFtZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHRleHR1cmUgdW5pZm9ybS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBSZXR1cm5zIHRydWUgaWYgdGhlIHRleHR1cmUgdW5pZm9ybSBleGlzdHMsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBoYXNUZXh0dXJlKG5hbWUpIHtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYmluZEdyb3VwRm9ybWF0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZ3JvdXBGb3JtYXQgPSB0aGlzLmJpbmRHcm91cEZvcm1hdHNbaV07XG4gICAgICAgICAgICBpZiAoZ3JvdXBGb3JtYXQ/LmdldFRleHR1cmUobmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRWZXJ0ZXhFbGVtZW50KHNlbWFudGljKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZlcnRleEZvcm1hdD8uZWxlbWVudHMuZmluZChlbGVtZW50ID0+IGVsZW1lbnQubmFtZSA9PT0gc2VtYW50aWMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIHVuaXF1ZSBrZXkgcmVwcmVzZW5kaW5nIHRoZSBwcm9jZXNzaW5nIG9wdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIFJldHVybnMgdGhlIGtleS5cbiAgICAgKi9cbiAgICBnZW5lcmF0ZUtleSgpIHtcbiAgICAgICAgLy8gVE9ETzogT3B0aW1pemUuIFVuaWZvcm0gYW5kIEJpbmRHcm91cCBmb3JtYXRzIHNob3VsZCBoYXZlIHRoZWlyIGtleXMgZXZhbHVhdGVkIGluIHRoZWlyXG4gICAgICAgIC8vIGNvbnN0cnVjdG9ycywgYW5kIGhlcmUgd2Ugc2hvdWxkIHNpbXBseSBjb25jYXRlbmF0ZSB0aG9zZS5cbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMudW5pZm9ybUZvcm1hdHMpICtcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy5iaW5kR3JvdXBGb3JtYXRzKSArXG4gICAgICAgIHRoaXMudmVydGV4Rm9ybWF0Py5yZW5kZXJpbmdIYXNoU3RyaW5nO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgU2hhZGVyUHJvY2Vzc29yT3B0aW9ucyB9O1xuIl0sIm5hbWVzIjpbIlNoYWRlclByb2Nlc3Nvck9wdGlvbnMiLCJjb25zdHJ1Y3RvciIsInZpZXdVbmlmb3JtRm9ybWF0Iiwidmlld0JpbmRHcm91cEZvcm1hdCIsInZlcnRleEZvcm1hdCIsInVuaWZvcm1Gb3JtYXRzIiwiYmluZEdyb3VwRm9ybWF0cyIsIkJJTkRHUk9VUF9WSUVXIiwiaGFzVW5pZm9ybSIsIm5hbWUiLCJpIiwibGVuZ3RoIiwidW5pZm9ybUZvcm1hdCIsImdldCIsImhhc1RleHR1cmUiLCJncm91cEZvcm1hdCIsImdldFRleHR1cmUiLCJnZXRWZXJ0ZXhFbGVtZW50Iiwic2VtYW50aWMiLCJfdGhpcyR2ZXJ0ZXhGb3JtYXQiLCJlbGVtZW50cyIsImZpbmQiLCJlbGVtZW50IiwiZ2VuZXJhdGVLZXkiLCJfdGhpcyR2ZXJ0ZXhGb3JtYXQyIiwiSlNPTiIsInN0cmluZ2lmeSIsInJlbmRlcmluZ0hhc2hTdHJpbmciXSwibWFwcGluZ3MiOiI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLHNCQUFzQixDQUFDO0FBVXpCO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLFdBQVdBLENBQUNDLGlCQUFpQixFQUFFQyxtQkFBbUIsRUFBRUMsWUFBWSxFQUFFO0FBbkJsRTtJQUFBLElBQ0FDLENBQUFBLGNBQWMsR0FBRyxFQUFFLENBQUE7QUFFbkI7SUFBQSxJQUNBQyxDQUFBQSxnQkFBZ0IsR0FBRyxFQUFFLENBQUE7QUFFckI7QUFBQSxJQUFBLElBQUEsQ0FDQUYsWUFBWSxHQUFBLEtBQUEsQ0FBQSxDQUFBO0FBY1I7QUFDQSxJQUFBLElBQUksQ0FBQ0MsY0FBYyxDQUFDRSxjQUFjLENBQUMsR0FBR0wsaUJBQWlCLENBQUE7QUFDdkQsSUFBQSxJQUFJLENBQUNJLGdCQUFnQixDQUFDQyxjQUFjLENBQUMsR0FBR0osbUJBQW1CLENBQUE7SUFFM0QsSUFBSSxDQUFDQyxZQUFZLEdBQUdBLFlBQVksQ0FBQTtBQUNwQyxHQUFBOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNJSSxVQUFVQSxDQUFDQyxJQUFJLEVBQUU7QUFFYixJQUFBLEtBQUssSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ0wsY0FBYyxDQUFDTSxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFFO0FBQ2pELE1BQUEsTUFBTUUsYUFBYSxHQUFHLElBQUksQ0FBQ1AsY0FBYyxDQUFDSyxDQUFDLENBQUMsQ0FBQTtNQUM1QyxJQUFJRSxhQUFhLFlBQWJBLGFBQWEsQ0FBRUMsR0FBRyxDQUFDSixJQUFJLENBQUMsRUFBRTtBQUMxQixRQUFBLE9BQU8sSUFBSSxDQUFBO0FBQ2YsT0FBQTtBQUNKLEtBQUE7QUFFQSxJQUFBLE9BQU8sS0FBSyxDQUFBO0FBQ2hCLEdBQUE7O0FBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0lLLFVBQVVBLENBQUNMLElBQUksRUFBRTtBQUViLElBQUEsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDSixnQkFBZ0IsQ0FBQ0ssTUFBTSxFQUFFRCxDQUFDLEVBQUUsRUFBRTtBQUNuRCxNQUFBLE1BQU1LLFdBQVcsR0FBRyxJQUFJLENBQUNULGdCQUFnQixDQUFDSSxDQUFDLENBQUMsQ0FBQTtNQUM1QyxJQUFJSyxXQUFXLFlBQVhBLFdBQVcsQ0FBRUMsVUFBVSxDQUFDUCxJQUFJLENBQUMsRUFBRTtBQUMvQixRQUFBLE9BQU8sSUFBSSxDQUFBO0FBQ2YsT0FBQTtBQUNKLEtBQUE7QUFFQSxJQUFBLE9BQU8sS0FBSyxDQUFBO0FBQ2hCLEdBQUE7RUFFQVEsZ0JBQWdCQSxDQUFDQyxRQUFRLEVBQUU7QUFBQSxJQUFBLElBQUFDLGtCQUFBLENBQUE7QUFDdkIsSUFBQSxPQUFBLENBQUFBLGtCQUFBLEdBQU8sSUFBSSxDQUFDZixZQUFZLEtBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFqQmUsa0JBQUEsQ0FBbUJDLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDQyxPQUFPLElBQUlBLE9BQU8sQ0FBQ2IsSUFBSSxLQUFLUyxRQUFRLENBQUMsQ0FBQTtBQUNqRixHQUFBOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDSUssRUFBQUEsV0FBV0EsR0FBRztBQUFBLElBQUEsSUFBQUMsbUJBQUEsQ0FBQTtBQUNWO0FBQ0E7SUFDQSxPQUFPQyxJQUFJLENBQUNDLFNBQVMsQ0FBQyxJQUFJLENBQUNyQixjQUFjLENBQUMsR0FDMUNvQixJQUFJLENBQUNDLFNBQVMsQ0FBQyxJQUFJLENBQUNwQixnQkFBZ0IsQ0FBQyxJQUFBLENBQUFrQixtQkFBQSxHQUNyQyxJQUFJLENBQUNwQixZQUFZLEtBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFqQm9CLG1CQUFBLENBQW1CRyxtQkFBbUIsQ0FBQSxDQUFBO0FBQzFDLEdBQUE7QUFDSjs7OzsifQ==
