import { extend } from '../core.js';
import { CURVE_SMOOTHSTEP } from './constants.js';
import { CurveEvaluator } from './curve-evaluator.js';

/**
 * A curve is a collection of keys (time/value pairs). The shape of the curve is defined by its
 * type that specifies an interpolation scheme for the keys.
 */
class Curve {
  /**
   * Creates a new Curve instance.
   *
   * @param {number[]} [data] - An array of keys (pairs of numbers with the time first and value
   * second).
   * @example
   * const curve = new pc.Curve([
   *     0, 0,        // At 0 time, value of 0
   *     0.33, 2,     // At 0.33 time, value of 2
   *     0.66, 2.6,   // At 0.66 time, value of 2.6
   *     1, 3         // At 1 time, value of 3
   * ]);
   */
  constructor(data) {
    this.keys = [];
    /**
     * The curve interpolation scheme. Can be:
     *
     * - {@link CURVE_LINEAR}
     * - {@link CURVE_SMOOTHSTEP}
     * - {@link CURVE_SPLINE}
     * - {@link CURVE_STEP}
     *
     * Defaults to {@link CURVE_SMOOTHSTEP}.
     *
     * @type {number}
     */
    this.type = CURVE_SMOOTHSTEP;
    /**
     * Controls how {@link CURVE_SPLINE} tangents are calculated. Valid range is between 0 and 1
     * where 0 results in a non-smooth curve (equivalent to linear interpolation) and 1 results in
     * a very smooth curve. Use 0.5 for a Catmull-rom spline.
     *
     * @type {number}
     */
    this.tension = 0.5;
    /**
     * @type {CurveEvaluator}
     * @private
     */
    this._eval = new CurveEvaluator(this);
    if (data) {
      for (let i = 0; i < data.length - 1; i += 2) {
        this.keys.push([data[i], data[i + 1]]);
      }
    }
    this.sort();
  }

  /**
   * Get the number of keys in the curve.
   *
   * @type {number}
   */
  get length() {
    return this.keys.length;
  }

  /**
   * Add a new key to the curve.
   *
   * @param {number} time - Time to add new key.
   * @param {number} value - Value of new key.
   * @returns {number[]} [time, value] pair.
   */
  add(time, value) {
    const keys = this.keys;
    const len = keys.length;
    let i = 0;
    for (; i < len; i++) {
      if (keys[i][0] > time) {
        break;
      }
    }
    const key = [time, value];
    this.keys.splice(i, 0, key);
    return key;
  }

  /**
   * Return a specific key.
   *
   * @param {number} index - The index of the key to return.
   * @returns {number[]} The key at the specified index.
   */
  get(index) {
    return this.keys[index];
  }

  /**
   * Sort keys by time.
   */
  sort() {
    this.keys.sort(function (a, b) {
      return a[0] - b[0];
    });
  }

  /**
   * Returns the interpolated value of the curve at specified time.
   *
   * @param {number} time - The time at which to calculate the value.
   * @returns {number} The interpolated value.
   */
  value(time) {
    // we force reset the evaluation because keys may have changed since the last evaluate
    // (we can't know)
    return this._eval.evaluate(time, true);
  }
  closest(time) {
    const keys = this.keys;
    const length = keys.length;
    let min = 2;
    let result = null;
    for (let i = 0; i < length; i++) {
      const diff = Math.abs(time - keys[i][0]);
      if (min >= diff) {
        min = diff;
        result = keys[i];
      } else {
        break;
      }
    }
    return result;
  }

  /**
   * Returns a clone of the specified curve object.
   *
   * @returns {this} A clone of the specified curve.
   */
  clone() {
    /** @type {this} */
    const result = new this.constructor();
    result.keys = extend(result.keys, this.keys);
    result.type = this.type;
    result.tension = this.tension;
    return result;
  }

  /**
   * Sample the curve at regular intervals over the range [0..1].
   *
   * @param {number} precision - The number of samples to return.
   * @returns {Float32Array} The set of quantized values.
   * @ignore
   */
  quantize(precision) {
    precision = Math.max(precision, 2);
    const values = new Float32Array(precision);
    const step = 1.0 / (precision - 1);

    // quantize graph to table of interpolated values
    values[0] = this._eval.evaluate(0, true);
    for (let i = 1; i < precision; i++) {
      values[i] = this._eval.evaluate(step * i);
    }
    return values;
  }

  /**
   * Sample the curve at regular intervals over the range [0..1] and clamp the resulting samples
   * to [min..max].
   *
   * @param {number} precision - The number of samples to return.
   * @param {number} min - The minimum output value.
   * @param {number} max - The maximum output value.
   * @returns {Float32Array} The set of quantized values.
   * @ignore
   */
  quantizeClamped(precision, min, max) {
    const result = this.quantize(precision);
    for (let i = 0; i < result.length; ++i) {
      result[i] = Math.min(max, Math.max(min, result[i]));
    }
    return result;
  }
}

export { Curve };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VydmUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL21hdGgvY3VydmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXh0ZW5kIH0gZnJvbSAnLi4vY29yZS5qcyc7XG5cbmltcG9ydCB7IENVUlZFX1NNT09USFNURVAgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBDdXJ2ZUV2YWx1YXRvciB9IGZyb20gJy4vY3VydmUtZXZhbHVhdG9yLmpzJztcblxuLyoqXG4gKiBBIGN1cnZlIGlzIGEgY29sbGVjdGlvbiBvZiBrZXlzICh0aW1lL3ZhbHVlIHBhaXJzKS4gVGhlIHNoYXBlIG9mIHRoZSBjdXJ2ZSBpcyBkZWZpbmVkIGJ5IGl0c1xuICogdHlwZSB0aGF0IHNwZWNpZmllcyBhbiBpbnRlcnBvbGF0aW9uIHNjaGVtZSBmb3IgdGhlIGtleXMuXG4gKi9cbmNsYXNzIEN1cnZlIHtcbiAgICBrZXlzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY3VydmUgaW50ZXJwb2xhdGlvbiBzY2hlbWUuIENhbiBiZTpcbiAgICAgKlxuICAgICAqIC0ge0BsaW5rIENVUlZFX0xJTkVBUn1cbiAgICAgKiAtIHtAbGluayBDVVJWRV9TTU9PVEhTVEVQfVxuICAgICAqIC0ge0BsaW5rIENVUlZFX1NQTElORX1cbiAgICAgKiAtIHtAbGluayBDVVJWRV9TVEVQfVxuICAgICAqXG4gICAgICogRGVmYXVsdHMgdG8ge0BsaW5rIENVUlZFX1NNT09USFNURVB9LlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0eXBlID0gQ1VSVkVfU01PT1RIU1RFUDtcblxuICAgIC8qKlxuICAgICAqIENvbnRyb2xzIGhvdyB7QGxpbmsgQ1VSVkVfU1BMSU5FfSB0YW5nZW50cyBhcmUgY2FsY3VsYXRlZC4gVmFsaWQgcmFuZ2UgaXMgYmV0d2VlbiAwIGFuZCAxXG4gICAgICogd2hlcmUgMCByZXN1bHRzIGluIGEgbm9uLXNtb290aCBjdXJ2ZSAoZXF1aXZhbGVudCB0byBsaW5lYXIgaW50ZXJwb2xhdGlvbikgYW5kIDEgcmVzdWx0cyBpblxuICAgICAqIGEgdmVyeSBzbW9vdGggY3VydmUuIFVzZSAwLjUgZm9yIGEgQ2F0bXVsbC1yb20gc3BsaW5lLlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0ZW5zaW9uID0gMC41O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0N1cnZlRXZhbHVhdG9yfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V2YWwgPSBuZXcgQ3VydmVFdmFsdWF0b3IodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEN1cnZlIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJbXX0gW2RhdGFdIC0gQW4gYXJyYXkgb2Yga2V5cyAocGFpcnMgb2YgbnVtYmVycyB3aXRoIHRoZSB0aW1lIGZpcnN0IGFuZCB2YWx1ZVxuICAgICAqIHNlY29uZCkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBjdXJ2ZSA9IG5ldyBwYy5DdXJ2ZShbXG4gICAgICogICAgIDAsIDAsICAgICAgICAvLyBBdCAwIHRpbWUsIHZhbHVlIG9mIDBcbiAgICAgKiAgICAgMC4zMywgMiwgICAgIC8vIEF0IDAuMzMgdGltZSwgdmFsdWUgb2YgMlxuICAgICAqICAgICAwLjY2LCAyLjYsICAgLy8gQXQgMC42NiB0aW1lLCB2YWx1ZSBvZiAyLjZcbiAgICAgKiAgICAgMSwgMyAgICAgICAgIC8vIEF0IDEgdGltZSwgdmFsdWUgb2YgM1xuICAgICAqIF0pO1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGggLSAxOyBpICs9IDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMucHVzaChbZGF0YVtpXSwgZGF0YVtpICsgMV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc29ydCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbnVtYmVyIG9mIGtleXMgaW4gdGhlIGN1cnZlLlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlzLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBuZXcga2V5IHRvIHRoZSBjdXJ2ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lIC0gVGltZSB0byBhZGQgbmV3IGtleS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZSBvZiBuZXcga2V5LlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJbXX0gW3RpbWUsIHZhbHVlXSBwYWlyLlxuICAgICAqL1xuICAgIGFkZCh0aW1lLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBrZXlzID0gdGhpcy5rZXlzO1xuICAgICAgICBjb25zdCBsZW4gPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgbGV0IGkgPSAwO1xuXG4gICAgICAgIGZvciAoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChrZXlzW2ldWzBdID4gdGltZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qga2V5ID0gW3RpbWUsIHZhbHVlXTtcbiAgICAgICAgdGhpcy5rZXlzLnNwbGljZShpLCAwLCBrZXkpO1xuICAgICAgICByZXR1cm4ga2V5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIHNwZWNpZmljIGtleS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIFRoZSBpbmRleCBvZiB0aGUga2V5IHRvIHJldHVybi5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyW119IFRoZSBrZXkgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICAgKi9cbiAgICBnZXQoaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5c1tpbmRleF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU29ydCBrZXlzIGJ5IHRpbWUuXG4gICAgICovXG4gICAgc29ydCgpIHtcbiAgICAgICAgdGhpcy5rZXlzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhWzBdIC0gYlswXTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaW50ZXJwb2xhdGVkIHZhbHVlIG9mIHRoZSBjdXJ2ZSBhdCBzcGVjaWZpZWQgdGltZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lIC0gVGhlIHRpbWUgYXQgd2hpY2ggdG8gY2FsY3VsYXRlIHRoZSB2YWx1ZS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgaW50ZXJwb2xhdGVkIHZhbHVlLlxuICAgICAqL1xuICAgIHZhbHVlKHRpbWUpIHtcbiAgICAgICAgLy8gd2UgZm9yY2UgcmVzZXQgdGhlIGV2YWx1YXRpb24gYmVjYXVzZSBrZXlzIG1heSBoYXZlIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgZXZhbHVhdGVcbiAgICAgICAgLy8gKHdlIGNhbid0IGtub3cpXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmFsLmV2YWx1YXRlKHRpbWUsIHRydWUpO1xuICAgIH1cblxuICAgIGNsb3Nlc3QodGltZSkge1xuICAgICAgICBjb25zdCBrZXlzID0gdGhpcy5rZXlzO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgbGV0IG1pbiA9IDI7XG4gICAgICAgIGxldCByZXN1bHQgPSBudWxsO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGRpZmYgPSBNYXRoLmFicyh0aW1lIC0ga2V5c1tpXVswXSk7XG4gICAgICAgICAgICBpZiAobWluID49IGRpZmYpIHtcbiAgICAgICAgICAgICAgICBtaW4gPSBkaWZmO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGtleXNbaV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgY2xvbmUgb2YgdGhlIHNwZWNpZmllZCBjdXJ2ZSBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7dGhpc30gQSBjbG9uZSBvZiB0aGUgc3BlY2lmaWVkIGN1cnZlLlxuICAgICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICAvKiogQHR5cGUge3RoaXN9ICovXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKCk7XG4gICAgICAgIHJlc3VsdC5rZXlzID0gZXh0ZW5kKHJlc3VsdC5rZXlzLCB0aGlzLmtleXMpO1xuICAgICAgICByZXN1bHQudHlwZSA9IHRoaXMudHlwZTtcbiAgICAgICAgcmVzdWx0LnRlbnNpb24gPSB0aGlzLnRlbnNpb247XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2FtcGxlIHRoZSBjdXJ2ZSBhdCByZWd1bGFyIGludGVydmFscyBvdmVyIHRoZSByYW5nZSBbMC4uMV0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcHJlY2lzaW9uIC0gVGhlIG51bWJlciBvZiBzYW1wbGVzIHRvIHJldHVybi5cbiAgICAgKiBAcmV0dXJucyB7RmxvYXQzMkFycmF5fSBUaGUgc2V0IG9mIHF1YW50aXplZCB2YWx1ZXMuXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIHF1YW50aXplKHByZWNpc2lvbikge1xuICAgICAgICBwcmVjaXNpb24gPSBNYXRoLm1heChwcmVjaXNpb24sIDIpO1xuXG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkocHJlY2lzaW9uKTtcbiAgICAgICAgY29uc3Qgc3RlcCA9IDEuMCAvIChwcmVjaXNpb24gLSAxKTtcblxuICAgICAgICAvLyBxdWFudGl6ZSBncmFwaCB0byB0YWJsZSBvZiBpbnRlcnBvbGF0ZWQgdmFsdWVzXG4gICAgICAgIHZhbHVlc1swXSA9IHRoaXMuX2V2YWwuZXZhbHVhdGUoMCwgdHJ1ZSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgcHJlY2lzaW9uOyBpKyspIHtcbiAgICAgICAgICAgIHZhbHVlc1tpXSA9IHRoaXMuX2V2YWwuZXZhbHVhdGUoc3RlcCAqIGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYW1wbGUgdGhlIGN1cnZlIGF0IHJlZ3VsYXIgaW50ZXJ2YWxzIG92ZXIgdGhlIHJhbmdlIFswLi4xXSBhbmQgY2xhbXAgdGhlIHJlc3VsdGluZyBzYW1wbGVzXG4gICAgICogdG8gW21pbi4ubWF4XS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwcmVjaXNpb24gLSBUaGUgbnVtYmVyIG9mIHNhbXBsZXMgdG8gcmV0dXJuLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gLSBUaGUgbWluaW11bSBvdXRwdXQgdmFsdWUuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCAtIFRoZSBtYXhpbXVtIG91dHB1dCB2YWx1ZS5cbiAgICAgKiBAcmV0dXJucyB7RmxvYXQzMkFycmF5fSBUaGUgc2V0IG9mIHF1YW50aXplZCB2YWx1ZXMuXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIHF1YW50aXplQ2xhbXBlZChwcmVjaXNpb24sIG1pbiwgbWF4KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucXVhbnRpemUocHJlY2lzaW9uKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHQubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHJlc3VsdFtpXSA9IE1hdGgubWluKG1heCwgTWF0aC5tYXgobWluLCByZXN1bHRbaV0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn1cblxuZXhwb3J0IHsgQ3VydmUgfTtcbiJdLCJuYW1lcyI6WyJDdXJ2ZSIsImNvbnN0cnVjdG9yIiwiZGF0YSIsImtleXMiLCJ0eXBlIiwiQ1VSVkVfU01PT1RIU1RFUCIsInRlbnNpb24iLCJfZXZhbCIsIkN1cnZlRXZhbHVhdG9yIiwiaSIsImxlbmd0aCIsInB1c2giLCJzb3J0IiwiYWRkIiwidGltZSIsInZhbHVlIiwibGVuIiwia2V5Iiwic3BsaWNlIiwiZ2V0IiwiaW5kZXgiLCJhIiwiYiIsImV2YWx1YXRlIiwiY2xvc2VzdCIsIm1pbiIsInJlc3VsdCIsImRpZmYiLCJNYXRoIiwiYWJzIiwiY2xvbmUiLCJleHRlbmQiLCJxdWFudGl6ZSIsInByZWNpc2lvbiIsIm1heCIsInZhbHVlcyIsIkZsb2F0MzJBcnJheSIsInN0ZXAiLCJxdWFudGl6ZUNsYW1wZWQiXSwibWFwcGluZ3MiOiI7Ozs7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLEtBQUssQ0FBQztBQWdDUjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNJQyxXQUFXQSxDQUFDQyxJQUFJLEVBQUU7SUFBQSxJQTVDbEJDLENBQUFBLElBQUksR0FBRyxFQUFFLENBQUE7QUFFVDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFYSSxJQVlBQyxDQUFBQSxJQUFJLEdBQUdDLGdCQUFnQixDQUFBO0FBRXZCO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBTkksSUFPQUMsQ0FBQUEs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
