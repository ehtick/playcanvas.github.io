/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { extend } from '../core.js';
import { CURVE_SMOOTHSTEP } from './constants.js';
import { CurveEvaluator } from './curve-evaluator.js';

/**
 * A curve is a collection of keys (time/value pairs). The shape of the curve is defined by its
 * type that specifies an interpolation scheme for the keys.
 */
class Curve {
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

  /**
   * Controls how {@link CURVE_SPLINE} tangents are calculated. Valid range is between 0 and 1
   * where 0 results in a non-smooth curve (equivalent to linear interpolation) and 1 results in
   * a very smooth curve. Use 0.5 for a Catmull-rom spline.
   *
   * @type {number}
   */

  /**
   * @type {CurveEvaluator}
   * @private
   */

  /**
   * Creates a new Curve instance.
   *
   * @param {number[]} [data] - An array of keys (pairs of numbers with the time first and value
   * second).
   * @example
   * var curve = new pc.Curve([
   *     0, 0,        // At 0 time, value of 0
   *     0.33, 2,     // At 0.33 time, value of 2
   *     0.66, 2.6,   // At 0.66 time, value of 2.6
   *     1, 3         // At 1 time, value of 3
   * ]);
   */
  constructor(data) {
    this.keys = [];
    this.type = CURVE_SMOOTHSTEP;
    this.tension = 0.5;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VydmUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL21hdGgvY3VydmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXh0ZW5kIH0gZnJvbSAnLi4vY29yZS5qcyc7XG5cbmltcG9ydCB7IENVUlZFX1NNT09USFNURVAgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBDdXJ2ZUV2YWx1YXRvciB9IGZyb20gJy4vY3VydmUtZXZhbHVhdG9yLmpzJztcblxuLyoqXG4gKiBBIGN1cnZlIGlzIGEgY29sbGVjdGlvbiBvZiBrZXlzICh0aW1lL3ZhbHVlIHBhaXJzKS4gVGhlIHNoYXBlIG9mIHRoZSBjdXJ2ZSBpcyBkZWZpbmVkIGJ5IGl0c1xuICogdHlwZSB0aGF0IHNwZWNpZmllcyBhbiBpbnRlcnBvbGF0aW9uIHNjaGVtZSBmb3IgdGhlIGtleXMuXG4gKi9cbmNsYXNzIEN1cnZlIHtcbiAgICBrZXlzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY3VydmUgaW50ZXJwb2xhdGlvbiBzY2hlbWUuIENhbiBiZTpcbiAgICAgKlxuICAgICAqIC0ge0BsaW5rIENVUlZFX0xJTkVBUn1cbiAgICAgKiAtIHtAbGluayBDVVJWRV9TTU9PVEhTVEVQfVxuICAgICAqIC0ge0BsaW5rIENVUlZFX1NQTElORX1cbiAgICAgKiAtIHtAbGluayBDVVJWRV9TVEVQfVxuICAgICAqXG4gICAgICogRGVmYXVsdHMgdG8ge0BsaW5rIENVUlZFX1NNT09USFNURVB9LlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0eXBlID0gQ1VSVkVfU01PT1RIU1RFUDtcblxuICAgIC8qKlxuICAgICAqIENvbnRyb2xzIGhvdyB7QGxpbmsgQ1VSVkVfU1BMSU5FfSB0YW5nZW50cyBhcmUgY2FsY3VsYXRlZC4gVmFsaWQgcmFuZ2UgaXMgYmV0d2VlbiAwIGFuZCAxXG4gICAgICogd2hlcmUgMCByZXN1bHRzIGluIGEgbm9uLXNtb290aCBjdXJ2ZSAoZXF1aXZhbGVudCB0byBsaW5lYXIgaW50ZXJwb2xhdGlvbikgYW5kIDEgcmVzdWx0cyBpblxuICAgICAqIGEgdmVyeSBzbW9vdGggY3VydmUuIFVzZSAwLjUgZm9yIGEgQ2F0bXVsbC1yb20gc3BsaW5lLlxuICAgICAqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0ZW5zaW9uID0gMC41O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0N1cnZlRXZhbHVhdG9yfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V2YWwgPSBuZXcgQ3VydmVFdmFsdWF0b3IodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEN1cnZlIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJbXX0gW2RhdGFdIC0gQW4gYXJyYXkgb2Yga2V5cyAocGFpcnMgb2YgbnVtYmVycyB3aXRoIHRoZSB0aW1lIGZpcnN0IGFuZCB2YWx1ZVxuICAgICAqIHNlY29uZCkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgY3VydmUgPSBuZXcgcGMuQ3VydmUoW1xuICAgICAqICAgICAwLCAwLCAgICAgICAgLy8gQXQgMCB0aW1lLCB2YWx1ZSBvZiAwXG4gICAgICogICAgIDAuMzMsIDIsICAgICAvLyBBdCAwLjMzIHRpbWUsIHZhbHVlIG9mIDJcbiAgICAgKiAgICAgMC42NiwgMi42LCAgIC8vIEF0IDAuNjYgdGltZSwgdmFsdWUgb2YgMi42XG4gICAgICogICAgIDEsIDMgICAgICAgICAvLyBBdCAxIHRpbWUsIHZhbHVlIG9mIDNcbiAgICAgKiBdKTtcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoIC0gMTsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzLnB1c2goW2RhdGFbaV0sIGRhdGFbaSArIDFdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNvcnQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG51bWJlciBvZiBrZXlzIGluIHRoZSBjdXJ2ZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5cy5sZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbmV3IGtleSB0byB0aGUgY3VydmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZSAtIFRpbWUgdG8gYWRkIG5ldyBrZXkuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVmFsdWUgb2YgbmV3IGtleS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyW119IFt0aW1lLCB2YWx1ZV0gcGFpci5cbiAgICAgKi9cbiAgICBhZGQodGltZSwgdmFsdWUpIHtcbiAgICAgICAgY29uc3Qga2V5cyA9IHRoaXMua2V5cztcbiAgICAgICAgY29uc3QgbGVuID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGxldCBpID0gMDtcblxuICAgICAgICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoa2V5c1tpXVswXSA+IHRpbWUpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGtleSA9IFt0aW1lLCB2YWx1ZV07XG4gICAgICAgIHRoaXMua2V5cy5zcGxpY2UoaSwgMCwga2V5KTtcbiAgICAgICAgcmV0dXJuIGtleTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYSBzcGVjaWZpYyBrZXkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGtleSB0byByZXR1cm4uXG4gICAgICogQHJldHVybnMge251bWJlcltdfSBUaGUga2V5IGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gICAgICovXG4gICAgZ2V0KGluZGV4KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmtleXNbaW5kZXhdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNvcnQga2V5cyBieSB0aW1lLlxuICAgICAqL1xuICAgIHNvcnQoKSB7XG4gICAgICAgIHRoaXMua2V5cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGludGVycG9sYXRlZCB2YWx1ZSBvZiB0aGUgY3VydmUgYXQgc3BlY2lmaWVkIHRpbWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZSAtIFRoZSB0aW1lIGF0IHdoaWNoIHRvIGNhbGN1bGF0ZSB0aGUgdmFsdWUuXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGludGVycG9sYXRlZCB2YWx1ZS5cbiAgICAgKi9cbiAgICB2YWx1ZSh0aW1lKSB7XG4gICAgICAgIC8vIHdlIGZvcmNlIHJlc2V0IHRoZSBldmFsdWF0aW9uIGJlY2F1c2Uga2V5cyBtYXkgaGF2ZSBjaGFuZ2VkIHNpbmNlIHRoZSBsYXN0IGV2YWx1YXRlXG4gICAgICAgIC8vICh3ZSBjYW4ndCBrbm93KVxuICAgICAgICByZXR1cm4gdGhpcy5fZXZhbC5ldmFsdWF0ZSh0aW1lLCB0cnVlKTtcbiAgICB9XG5cbiAgICBjbG9zZXN0KHRpbWUpIHtcbiAgICAgICAgY29uc3Qga2V5cyA9IHRoaXMua2V5cztcbiAgICAgICAgY29uc3QgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGxldCBtaW4gPSAyO1xuICAgICAgICBsZXQgcmVzdWx0ID0gbnVsbDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBkaWZmID0gTWF0aC5hYnModGltZSAtIGtleXNbaV1bMF0pO1xuICAgICAgICAgICAgaWYgKG1pbiA+PSBkaWZmKSB7XG4gICAgICAgICAgICAgICAgbWluID0gZGlmZjtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBrZXlzW2ldO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGNsb25lIG9mIHRoZSBzcGVjaWZpZWQgY3VydmUgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHJldHVybnMge3RoaXN9IEEgY2xvbmUgb2YgdGhlIHNwZWNpZmllZCBjdXJ2ZS5cbiAgICAgKi9cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgLyoqIEB0eXBlIHt0aGlzfSAqL1xuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcigpO1xuICAgICAgICByZXN1bHQua2V5cyA9IGV4dGVuZChyZXN1bHQua2V5cywgdGhpcy5rZXlzKTtcbiAgICAgICAgcmVzdWx0LnR5cGUgPSB0aGlzLnR5cGU7XG4gICAgICAgIHJlc3VsdC50ZW5zaW9uID0gdGhpcy50ZW5zaW9uO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhbXBsZSB0aGUgY3VydmUgYXQgcmVndWxhciBpbnRlcnZhbHMgb3ZlciB0aGUgcmFuZ2UgWzAuLjFdLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHByZWNpc2lvbiAtIFRoZSBudW1iZXIgb2Ygc2FtcGxlcyB0byByZXR1cm4uXG4gICAgICogQHJldHVybnMge0Zsb2F0MzJBcnJheX0gVGhlIHNldCBvZiBxdWFudGl6ZWQgdmFsdWVzLlxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBxdWFudGl6ZShwcmVjaXNpb24pIHtcbiAgICAgICAgcHJlY2lzaW9uID0gTWF0aC5tYXgocHJlY2lzaW9uLCAyKTtcblxuICAgICAgICBjb25zdCB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KHByZWNpc2lvbik7XG4gICAgICAgIGNvbnN0IHN0ZXAgPSAxLjAgLyAocHJlY2lzaW9uIC0gMSk7XG5cbiAgICAgICAgLy8gcXVhbnRpemUgZ3JhcGggdG8gdGFibGUgb2YgaW50ZXJwb2xhdGVkIHZhbHVlc1xuICAgICAgICB2YWx1ZXNbMF0gPSB0aGlzLl9ldmFsLmV2YWx1YXRlKDAsIHRydWUpO1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHByZWNpc2lvbjsgaSsrKSB7XG4gICAgICAgICAgICB2YWx1ZXNbaV0gPSB0aGlzLl9ldmFsLmV2YWx1YXRlKHN0ZXAgKiBpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2FtcGxlIHRoZSBjdXJ2ZSBhdCByZWd1bGFyIGludGVydmFscyBvdmVyIHRoZSByYW5nZSBbMC4uMV0gYW5kIGNsYW1wIHRoZSByZXN1bHRpbmcgc2FtcGxlc1xuICAgICAqIHRvIFttaW4uLm1heF0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcHJlY2lzaW9uIC0gVGhlIG51bWJlciBvZiBzYW1wbGVzIHRvIHJldHVybi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIC0gVGhlIG1pbmltdW0gb3V0cHV0IHZhbHVlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggLSBUaGUgbWF4aW11bSBvdXRwdXQgdmFsdWUuXG4gICAgICogQHJldHVybnMge0Zsb2F0MzJBcnJheX0gVGhlIHNldCBvZiBxdWFudGl6ZWQgdmFsdWVzLlxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBxdWFudGl6ZUNsYW1wZWQocHJlY2lzaW9uLCBtaW4sIG1heCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnF1YW50aXplKHByZWNpc2lvbik7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICByZXN1bHRbaV0gPSBNYXRoLm1pbihtYXgsIE1hdGgubWF4KG1pbiwgcmVzdWx0W2ldKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59XG5cbmV4cG9ydCB7IEN1cnZlIH07XG4iXSwibmFtZXMiOlsiQ3VydmUiLCJjb25zdHJ1Y3RvciIsImRhdGEiLCJrZXlzIiwidHlwZSIsIkNVUlZFX1NNT09USFNURVAiLCJ0ZW5zaW9uIiwiX2V2YWwiLCJDdXJ2ZUV2YWx1YXRvciIsImkiLCJsZW5ndGgiLCJwdXNoIiwic29ydCIsImFkZCIsInRpbWUiLCJ2YWx1ZSIsImxlbiIsImtleSIsInNwbGljZSIsImdldCIsImluZGV4IiwiYSIsImIiLCJldmFsdWF0ZSIsImNsb3Nlc3QiLCJtaW4iLCJyZXN1bHQiLCJkaWZmIiwiTWF0aCIsImFicyIsImNsb25lIiwiZXh0ZW5kIiwicXVhbnRpemUiLCJwcmVjaXNpb24iLCJtYXgiLCJ2YWx1ZXMiLCJGbG9hdDMyQXJyYXkiLCJzdGVwIiwicXVhbnRpemVDbGFtcGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLEtBQUssQ0FBQztBQUdSO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHSTtBQUNKO0FBQ0E7QUFDQTs7QUFHSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNJQyxXQUFXQSxDQUFDQyxJQUFJLEVBQUU7SUFBQSxJQTVDbEJDLENBQUFBLElBQUksR0FBRyxFQUFFLENBQUE7SUFBQSxJQWNUQyxDQUFBQSxJQUFJLEdBQUdDLGdCQUFn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
