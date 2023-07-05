import { FONT_MSDF } from './constants.js';

/**
 * Represents the resource of a font asset.
 */
class Font {
  /**
   * Create a new Font instance.
   *
   * @param {import('../../platform/graphics/texture.js').Texture[]} textures - The font
   * textures.
   * @param {object} data - The font data.
   */
  constructor(textures, data) {
    this.type = data ? data.type || FONT_MSDF : FONT_MSDF;
    this.em = 1;

    /**
     * The font textures.
     *
     * @type {import('../../platform/graphics/texture.js').Texture[]}
     */
    this.textures = textures;

    /**
     * The font intensity.
     *
     * @type {number}
     */
    this.intensity = 0.0;

    // json data
    this._data = null;
    this.data = data;
  }
  set data(value) {
    this._data = value;
    if (!value) return;
    if (this._data.intensity !== undefined) {
      this.intensity = this._data.intensity;
    }
    if (!this._data.info) this._data.info = {};

    // check if we need to migrate to version 2
    if (!this._data.version || this._data.version < 2) {
      this._data.info.maps = [{
        width: this._data.info.width,
        height: this._data.info.height
      }];
      if (this._data.chars) {
        for (const key in this._data.chars) {
          this._data.chars[key].map = 0;
        }
      }
    }
  }
  get data() {
    return this._data;
  }
}

export { Font };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9mb250L2ZvbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRk9OVF9NU0RGIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIHJlc291cmNlIG9mIGEgZm9udCBhc3NldC5cbiAqL1xuY2xhc3MgRm9udCB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IEZvbnQgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3MvdGV4dHVyZS5qcycpLlRleHR1cmVbXX0gdGV4dHVyZXMgLSBUaGUgZm9udFxuICAgICAqIHRleHR1cmVzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIC0gVGhlIGZvbnQgZGF0YS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih0ZXh0dXJlcywgZGF0YSkge1xuICAgICAgICB0aGlzLnR5cGUgPSBkYXRhID8gZGF0YS50eXBlIHx8IEZPTlRfTVNERiA6IEZPTlRfTVNERjtcblxuICAgICAgICB0aGlzLmVtID0gMTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGZvbnQgdGV4dHVyZXMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtpbXBvcnQoJy4uLy4uL3BsYXRmb3JtL2dyYXBoaWNzL3RleHR1cmUuanMnKS5UZXh0dXJlW119XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRleHR1cmVzID0gdGV4dHVyZXM7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBmb250IGludGVuc2l0eS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW50ZW5zaXR5ID0gMC4wO1xuXG4gICAgICAgIC8vIGpzb24gZGF0YVxuICAgICAgICB0aGlzLl9kYXRhID0gbnVsbDtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB9XG5cbiAgICBzZXQgZGF0YSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9kYXRhID0gdmFsdWU7XG4gICAgICAgIGlmICghdmFsdWUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgaWYgKHRoaXMuX2RhdGEuaW50ZW5zaXR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaW50ZW5zaXR5ID0gdGhpcy5fZGF0YS5pbnRlbnNpdHk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2RhdGEuaW5mbylcbiAgICAgICAgICAgIHRoaXMuX2RhdGEuaW5mbyA9IHt9O1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIHdlIG5lZWQgdG8gbWlncmF0ZSB0byB2ZXJzaW9uIDJcbiAgICAgICAgaWYgKCF0aGlzLl9kYXRhLnZlcnNpb24gfHwgdGhpcy5fZGF0YS52ZXJzaW9uIDwgMikge1xuICAgICAgICAgICAgdGhpcy5fZGF0YS5pbmZvLm1hcHMgPSBbe1xuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLl9kYXRhLmluZm8ud2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLl9kYXRhLmluZm8uaGVpZ2h0XG4gICAgICAgICAgICB9XTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX2RhdGEuY2hhcnMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLl9kYXRhLmNoYXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGEuY2hhcnNba2V5XS5tYXAgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBkYXRhKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IEZvbnQgfTtcbiJdLCJuYW1lcyI6WyJGb250IiwiY29uc3RydWN0b3IiLCJ0ZXh0dXJlcyIsImRhdGEiLCJ0eXBlIiwiRk9OVF9NU0RGIiwiZW0iLCJpbnRlbnNpdHkiLCJfZGF0YSIsInZhbHVlIiwidW5kZWZpbmVkIiwiaW5mbyIsInZlcnNpb24iLCJtYXBzIiwid2lkdGgiLCJoZWlnaHQiLCJjaGFycyIsImtleSIsIm1hcCJdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQSxJQUFJLENBQUM7QUFDUDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxXQUFXQSxDQUFDQyxRQUFRLEVBQUVDLElBQUksRUFBRTtJQUN4QixJQUFJLENBQUNDLElBQUksR0FBR0QsSUFBSSxHQUFHQSxJQUFJLENBQUNDLElBQUksSUFBSUMsU0FBUyxHQUFHQSxTQUFTLENBQUE7SUFFckQsSUFBSSxDQUFDQyxFQUFFLEdBQUcsQ0FBQyxDQUFBOztBQUVYO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7SUFDUSxJQUFJLENBQUNKLFFBQVEsR0FBR0EsUUFBUSxDQUFBOztBQUV4QjtBQUNSO0FBQ0E7QUFDQTtBQUNBO0lBQ1EsSUFBSSxDQUFDSyxTQUFTLEdBQUcsR0FBRyxDQUFBOztBQUVwQjtJQUNBLElBQUksQ0FBQ0MsS0FBSyxHQUFHLElBQUksQ0FBQTtJQUNqQixJQUFJLENBQUNMLElBQUksR0FBR0EsSUFBSSxDQUFBO0FBQ3BCLEdBQUE7RUFFQSxJQUFJQSxJQUFJQSxDQUFDTSxLQUFLLEVBQUU7SUFDWixJQUFJLENBQUNELEtBQUssR0FBR0MsS0FBSyxDQUFBO0lBQ2xCLElBQUksQ0FBQ0EsS0FBSyxFQUNOLE9BQUE7QUFFSixJQUFBLElBQUksSUFBSSxDQUFDRCxLQUFLLENBQUNELFNBQVMsS0FBS0csU0FBUyxFQUFFO0FBQ3BDLE1BQUEsSUFBSSxDQUFDSCxTQUFTLEdBQUcsSUFBSSxDQUFDQyxLQUFLLENBQUNELFNBQVMsQ0FBQTtBQUN6QyxLQUFBO0FBRUEsSUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDQyxLQUFLLENBQUNHLElBQUksRUFDaEIsSUFBSSxDQUFDSCxLQUFLLENBQUNHLElBQUksR0FBRyxFQUFFLENBQUE7O0FBRXhCO0FBQ0EsSUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDSCxLQUFLLENBQUNJLE9BQU8sSUFBSSxJQUFJLENBQUNKLEtBQUssQ0FBQ0ksT0FBTyxHQUFHLENBQUMsRUFBRTtBQUMvQyxNQUFBLElBQUksQ0FBQ0osS0FBSyxDQUFDRyxJQUFJLENBQUNFLElBQUksR0FBRyxDQUFDO0FBQ3BCQyxRQUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDTixLQUFLLENBQUNHLElBQUksQ0FBQ0csS0FBSztBQUM1QkMsUUFBQUEsTUFBTSxFQUFFLElBQUksQ0FBQ1AsS0FBSyxDQUFDRyxJQUFJLENBQUNJLE1BQUFBO0FBQzVCLE9BQUMsQ0FBQyxDQUFBO0FBRUYsTUFBQSxJQUFJLElBQUksQ0FBQ1AsS0FBSyxDQUFDUSxLQUFLLEVBQUU7UUFDbEIsS0FBSyxNQUFNQyxHQUFHLElBQUksSUFBSSxDQUFDVCxLQUFLLENBQUNRLEtBQUssRUFBRTtVQUNoQyxJQUFJLENBQUNSLEtBQUssQ0FBQ1EsS0FBSyxDQUFDQyxHQUFHLENBQUMsQ0FBQ0MsR0FBRyxHQUFHLENBQUMsQ0FBQTtBQUNqQyxTQUFBO0FBQ0osT0FBQTtBQUNKLEtBQUE7QUFDSixHQUFBO0VBRUEsSUFBSWYsSUFBSUEsR0FBRztJQUNQLE9BQU8sSUFBSSxDQUFDSyxLQUFLLENBQUE7QUFDckIsR0FBQTtBQUNKOzs7OyJ9
