/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (DEBUG PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
import { Vec3 } from './vec3.js';

/**
 * A 3x3 matrix.
 */
class Mat3 {
  /**
   * Matrix elements in the form of a flat array.
   *
   * @type {Float32Array}
   */

  /**
   * Create a new Mat3 instance. It is initialized to the identity matrix.
   */
  constructor() {
    this.data = new Float32Array(9);
    // Create an identity matrix. Note that a new Float32Array has all elements set
    // to zero by default, so we only need to set the relevant elements to one.
    this.data[0] = this.data[4] = this.data[8] = 1;
  }

  /**
   * Creates a duplicate of the specified matrix.
   *
   * @returns {this} A duplicate matrix.
   * @example
   * var src = new pc.Mat3().translate(10, 20, 30);
   * var dst = src.clone();
   * console.log("The two matrices are " + (src.equals(dst) ? "equal" : "different"));
   */
  clone() {
    /** @type {this} */
    const cstr = this.constructor;
    return new cstr().copy(this);
  }

  /**
   * Copies the contents of a source 3x3 matrix to a destination 3x3 matrix.
   *
   * @param {Mat3} rhs - A 3x3 matrix to be copied.
   * @returns {Mat3} Self for chaining.
   * @example
   * var src = new pc.Mat3().translate(10, 20, 30);
   * var dst = new pc.Mat3();
   * dst.copy(src);
   * console.log("The two matrices are " + (src.equals(dst) ? "equal" : "different"));
   */
  copy(rhs) {
    const src = rhs.data;
    const dst = this.data;
    dst[0] = src[0];
    dst[1] = src[1];
    dst[2] = src[2];
    dst[3] = src[3];
    dst[4] = src[4];
    dst[5] = src[5];
    dst[6] = src[6];
    dst[7] = src[7];
    dst[8] = src[8];
    return this;
  }

  /**
   * Copies the contents of a source array[9] to a destination 3x3 matrix.
   *
   * @param {number[]} src - An array[9] to be copied.
   * @returns {Mat3} Self for chaining.
   * @example
   * var dst = new pc.Mat3();
   * dst.set([0, 1, 2, 3, 4, 5, 6, 7, 8]);
   */
  set(src) {
    const dst = this.data;
    dst[0] = src[0];
    dst[1] = src[1];
    dst[2] = src[2];
    dst[3] = src[3];
    dst[4] = src[4];
    dst[5] = src[5];
    dst[6] = src[6];
    dst[7] = src[7];
    dst[8] = src[8];
    return this;
  }

  /**
   * Reports whether two matrices are equal.
   *
   * @param {Mat3} rhs - The other matrix.
   * @returns {boolean} True if the matrices are equal and false otherwise.
   * @example
   * var a = new pc.Mat3().translate(10, 20, 30);
   * var b = new pc.Mat3();
   * console.log("The two matrices are " + (a.equals(b) ? "equal" : "different"));
   */
  equals(rhs) {
    const l = this.data;
    const r = rhs.data;
    return l[0] === r[0] && l[1] === r[1] && l[2] === r[2] && l[3] === r[3] && l[4] === r[4] && l[5] === r[5] && l[6] === r[6] && l[7] === r[7] && l[8] === r[8];
  }

  /**
   * Reports whether the specified matrix is the identity matrix.
   *
   * @returns {boolean} True if the matrix is identity and false otherwise.
   * @example
   * var m = new pc.Mat3();
   * console.log("The matrix is " + (m.isIdentity() ? "identity" : "not identity"));
   */
  isIdentity() {
    const m = this.data;
    return m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 0 && m[4] === 1 && m[5] === 0 && m[6] === 0 && m[7] === 0 && m[8] === 1;
  }

  /**
   * Sets the matrix to the identity matrix.
   *
   * @returns {Mat3} Self for chaining.
   * @example
   * m.setIdentity();
   * console.log("The matrix is " + (m.isIdentity() ? "identity" : "not identity"));
   */
  setIdentity() {
    const m = this.data;
    m[0] = 1;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;
    m[4] = 1;
    m[5] = 0;
    m[6] = 0;
    m[7] = 0;
    m[8] = 1;
    return this;
  }

  /**
   * Converts the matrix to string form.
   *
   * @returns {string} The matrix in string form.
   * @example
   * var m = new pc.Mat3();
   * // Outputs [1, 0, 0, 0, 1, 0, 0, 0, 1]
   * console.log(m.toString());
   */
  toString() {
    return '[' + this.data.join(', ') + ']';
  }

  /**
   * Generates the transpose of the specified 3x3 matrix.
   *
   * @returns {Mat3} Self for chaining.
   * @example
   * var m = new pc.Mat3();
   *
   * // Transpose in place
   * m.transpose();
   */
  transpose() {
    const m = this.data;
    let tmp;
    tmp = m[1];
    m[1] = m[3];
    m[3] = tmp;
    tmp = m[2];
    m[2] = m[6];
    m[6] = tmp;
    tmp = m[5];
    m[5] = m[7];
    m[7] = tmp;
    return this;
  }

  /**
   * Converts the specified 4x4 matrix to a Mat3.
   *
   * @param {import('./mat4.js').Mat4} m - The 4x4 matrix to convert.
   * @returns {Mat3} Self for chaining.
   */
  setFromMat4(m) {
    const src = m.data;
    const dst = this.data;
    dst[0] = src[0];
    dst[1] = src[1];
    dst[2] = src[2];
    dst[3] = src[4];
    dst[4] = src[5];
    dst[5] = src[6];
    dst[6] = src[8];
    dst[7] = src[9];
    dst[8] = src[10];
    return this;
  }

  /**
   * Transforms a 3-dimensional vector by a 3x3 matrix.
   *
   * @param {Vec3} vec - The 3-dimensional vector to be transformed.
   * @param {Vec3} [res] - An optional 3-dimensional vector to receive the result of the
   * transformation.
   * @returns {Vec3} The input vector v transformed by the current instance.
   */
  transformVector(vec, res = new Vec3()) {
    const m = this.data;
    const x = vec.x;
    const y = vec.y;
    const z = vec.z;
    res.x = x * m[0] + y * m[3] + z * m[6];
    res.y = x * m[1] + y * m[4] + z * m[7];
    res.z = x * m[2] + y * m[5] + z * m[8];
    return res;
  }

  /**
   * A constant matrix set to the identity.
   *
   * @type {Mat3}
   * @readonly
   */
}
Mat3.IDENTITY = Object.freeze(new Mat3());
Mat3.ZERO = Object.freeze(new Mat3().set([0, 0, 0, 0, 0, 0, 0, 0, 0]));

export { Mat3 };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0My5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvbWF0aC9tYXQzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZlYzMgfSBmcm9tICcuL3ZlYzMuanMnO1xuXG4vKipcbiAqIEEgM3gzIG1hdHJpeC5cbiAqL1xuY2xhc3MgTWF0MyB7XG4gICAgLyoqXG4gICAgICogTWF0cml4IGVsZW1lbnRzIGluIHRoZSBmb3JtIG9mIGEgZmxhdCBhcnJheS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtGbG9hdDMyQXJyYXl9XG4gICAgICovXG4gICAgZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoOSk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgTWF0MyBpbnN0YW5jZS4gSXQgaXMgaW5pdGlhbGl6ZWQgdG8gdGhlIGlkZW50aXR5IG1hdHJpeC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGFuIGlkZW50aXR5IG1hdHJpeC4gTm90ZSB0aGF0IGEgbmV3IEZsb2F0MzJBcnJheSBoYXMgYWxsIGVsZW1lbnRzIHNldFxuICAgICAgICAvLyB0byB6ZXJvIGJ5IGRlZmF1bHQsIHNvIHdlIG9ubHkgbmVlZCB0byBzZXQgdGhlIHJlbGV2YW50IGVsZW1lbnRzIHRvIG9uZS5cbiAgICAgICAgdGhpcy5kYXRhWzBdID0gdGhpcy5kYXRhWzRdID0gdGhpcy5kYXRhWzhdID0gMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZHVwbGljYXRlIG9mIHRoZSBzcGVjaWZpZWQgbWF0cml4LlxuICAgICAqXG4gICAgICogQHJldHVybnMge3RoaXN9IEEgZHVwbGljYXRlIG1hdHJpeC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBzcmMgPSBuZXcgcGMuTWF0MygpLnRyYW5zbGF0ZSgxMCwgMjAsIDMwKTtcbiAgICAgKiB2YXIgZHN0ID0gc3JjLmNsb25lKCk7XG4gICAgICogY29uc29sZS5sb2coXCJUaGUgdHdvIG1hdHJpY2VzIGFyZSBcIiArIChzcmMuZXF1YWxzKGRzdCkgPyBcImVxdWFsXCIgOiBcImRpZmZlcmVudFwiKSk7XG4gICAgICovXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIC8qKiBAdHlwZSB7dGhpc30gKi9cbiAgICAgICAgY29uc3QgY3N0ciA9IHRoaXMuY29uc3RydWN0b3I7XG4gICAgICAgIHJldHVybiBuZXcgY3N0cigpLmNvcHkodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29waWVzIHRoZSBjb250ZW50cyBvZiBhIHNvdXJjZSAzeDMgbWF0cml4IHRvIGEgZGVzdGluYXRpb24gM3gzIG1hdHJpeC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TWF0M30gcmhzIC0gQSAzeDMgbWF0cml4IHRvIGJlIGNvcGllZC5cbiAgICAgKiBAcmV0dXJucyB7TWF0M30gU2VsZiBmb3IgY2hhaW5pbmcuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgc3JjID0gbmV3IHBjLk1hdDMoKS50cmFuc2xhdGUoMTAsIDIwLCAzMCk7XG4gICAgICogdmFyIGRzdCA9IG5ldyBwYy5NYXQzKCk7XG4gICAgICogZHN0LmNvcHkoc3JjKTtcbiAgICAgKiBjb25zb2xlLmxvZyhcIlRoZSB0d28gbWF0cmljZXMgYXJlIFwiICsgKHNyYy5lcXVhbHMoZHN0KSA/IFwiZXF1YWxcIiA6IFwiZGlmZmVyZW50XCIpKTtcbiAgICAgKi9cbiAgICBjb3B5KHJocykge1xuICAgICAgICBjb25zdCBzcmMgPSByaHMuZGF0YTtcbiAgICAgICAgY29uc3QgZHN0ID0gdGhpcy5kYXRhO1xuXG4gICAgICAgIGRzdFswXSA9IHNyY1swXTtcbiAgICAgICAgZHN0WzFdID0gc3JjWzFdO1xuICAgICAgICBkc3RbMl0gPSBzcmNbMl07XG4gICAgICAgIGRzdFszXSA9IHNyY1szXTtcbiAgICAgICAgZHN0WzRdID0gc3JjWzRdO1xuICAgICAgICBkc3RbNV0gPSBzcmNbNV07XG4gICAgICAgIGRzdFs2XSA9IHNyY1s2XTtcbiAgICAgICAgZHN0WzddID0gc3JjWzddO1xuICAgICAgICBkc3RbOF0gPSBzcmNbOF07XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29waWVzIHRoZSBjb250ZW50cyBvZiBhIHNvdXJjZSBhcnJheVs5XSB0byBhIGRlc3RpbmF0aW9uIDN4MyBtYXRyaXguXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcltdfSBzcmMgLSBBbiBhcnJheVs5XSB0byBiZSBjb3BpZWQuXG4gICAgICogQHJldHVybnMge01hdDN9IFNlbGYgZm9yIGNoYWluaW5nLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGRzdCA9IG5ldyBwYy5NYXQzKCk7XG4gICAgICogZHN0LnNldChbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOF0pO1xuICAgICAqL1xuICAgIHNldChzcmMpIHtcbiAgICAgICAgY29uc3QgZHN0ID0gdGhpcy5kYXRhO1xuXG4gICAgICAgIGRzdFswXSA9IHNyY1swXTtcbiAgICAgICAgZHN0WzFdID0gc3JjWzFdO1xuICAgICAgICBkc3RbMl0gPSBzcmNbMl07XG4gICAgICAgIGRzdFszXSA9IHNyY1szXTtcbiAgICAgICAgZHN0WzRdID0gc3JjWzRdO1xuICAgICAgICBkc3RbNV0gPSBzcmNbNV07XG4gICAgICAgIGRzdFs2XSA9IHNyY1s2XTtcbiAgICAgICAgZHN0WzddID0gc3JjWzddO1xuICAgICAgICBkc3RbOF0gPSBzcmNbOF07XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVwb3J0cyB3aGV0aGVyIHR3byBtYXRyaWNlcyBhcmUgZXF1YWwuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge01hdDN9IHJocyAtIFRoZSBvdGhlciBtYXRyaXguXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCBhbmQgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGEgPSBuZXcgcGMuTWF0MygpLnRyYW5zbGF0ZSgxMCwgMjAsIDMwKTtcbiAgICAgKiB2YXIgYiA9IG5ldyBwYy5NYXQzKCk7XG4gICAgICogY29uc29sZS5sb2coXCJUaGUgdHdvIG1hdHJpY2VzIGFyZSBcIiArIChhLmVxdWFscyhiKSA/IFwiZXF1YWxcIiA6IFwiZGlmZmVyZW50XCIpKTtcbiAgICAgKi9cbiAgICBlcXVhbHMocmhzKSB7XG4gICAgICAgIGNvbnN0IGwgPSB0aGlzLmRhdGE7XG4gICAgICAgIGNvbnN0IHIgPSByaHMuZGF0YTtcblxuICAgICAgICByZXR1cm4gKChsWzBdID09PSByWzBdKSAmJlxuICAgICAgICAgICAgICAgIChsWzFdID09PSByWzFdKSAmJlxuICAgICAgICAgICAgICAgIChsWzJdID09PSByWzJdKSAmJlxuICAgICAgICAgICAgICAgIChsWzNdID09PSByWzNdKSAmJlxuICAgICAgICAgICAgICAgIChsWzRdID09PSByWzRdKSAmJlxuICAgICAgICAgICAgICAgIChsWzVdID09PSByWzVdKSAmJlxuICAgICAgICAgICAgICAgIChsWzZdID09PSByWzZdKSAmJlxuICAgICAgICAgICAgICAgIChsWzddID09PSByWzddKSAmJlxuICAgICAgICAgICAgICAgIChsWzhdID09PSByWzhdKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVwb3J0cyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgbWF0cml4IGlzIHRoZSBpZGVudGl0eSBtYXRyaXguXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cml4IGlzIGlkZW50aXR5IGFuZCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbSA9IG5ldyBwYy5NYXQzKCk7XG4gICAgICogY29uc29sZS5sb2coXCJUaGUgbWF0cml4IGlzIFwiICsgKG0uaXNJZGVudGl0eSgpID8gXCJpZGVudGl0eVwiIDogXCJub3QgaWRlbnRpdHlcIikpO1xuICAgICAqL1xuICAgIGlzSWRlbnRpdHkoKSB7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLmRhdGE7XG4gICAgICAgIHJldHVybiAoKG1bMF0gPT09IDEpICYmXG4gICAgICAgICAgICAgICAgKG1bMV0gPT09IDApICYmXG4gICAgICAgICAgICAgICAgKG1bMl0gPT09IDApICYmXG4gICAgICAgICAgICAgICAgKG1bM10gPT09IDApICYmXG4gICAgICAgICAgICAgICAgKG1bNF0gPT09IDEpICYmXG4gICAgICAgICAgICAgICAgKG1bNV0gPT09IDApICYmXG4gICAgICAgICAgICAgICAgKG1bNl0gPT09IDApICYmXG4gICAgICAgICAgICAgICAgKG1bN10gPT09IDApICYmXG4gICAgICAgICAgICAgICAgKG1bOF0gPT09IDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBtYXRyaXggdG8gdGhlIGlkZW50aXR5IG1hdHJpeC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtNYXQzfSBTZWxmIGZvciBjaGFpbmluZy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIG0uc2V0SWRlbnRpdHkoKTtcbiAgICAgKiBjb25zb2xlLmxvZyhcIlRoZSBtYXRyaXggaXMgXCIgKyAobS5pc0lkZW50aXR5KCkgPyBcImlkZW50aXR5XCIgOiBcIm5vdCBpZGVudGl0eVwiKSk7XG4gICAgICovXG4gICAgc2V0SWRlbnRpdHkoKSB7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLmRhdGE7XG4gICAgICAgIG1bMF0gPSAxO1xuICAgICAgICBtWzFdID0gMDtcbiAgICAgICAgbVsyXSA9IDA7XG5cbiAgICAgICAgbVszXSA9IDA7XG4gICAgICAgIG1bNF0gPSAxO1xuICAgICAgICBtWzVdID0gMDtcblxuICAgICAgICBtWzZdID0gMDtcbiAgICAgICAgbVs3XSA9IDA7XG4gICAgICAgIG1bOF0gPSAxO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBtYXRyaXggdG8gc3RyaW5nIGZvcm0uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgbWF0cml4IGluIHN0cmluZyBmb3JtLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIG0gPSBuZXcgcGMuTWF0MygpO1xuICAgICAqIC8vIE91dHB1dHMgWzEsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDFdXG4gICAgICogY29uc29sZS5sb2cobS50b1N0cmluZygpKTtcbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdbJyArIHRoaXMuZGF0YS5qb2luKCcsICcpICsgJ10nO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyB0aGUgdHJhbnNwb3NlIG9mIHRoZSBzcGVjaWZpZWQgM3gzIG1hdHJpeC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtNYXQzfSBTZWxmIGZvciBjaGFpbmluZy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBtID0gbmV3IHBjLk1hdDMoKTtcbiAgICAgKlxuICAgICAqIC8vIFRyYW5zcG9zZSBpbiBwbGFjZVxuICAgICAqIG0udHJhbnNwb3NlKCk7XG4gICAgICovXG4gICAgdHJhbnNwb3NlKCkge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5kYXRhO1xuXG4gICAgICAgIGxldCB0bXA7XG4gICAgICAgIHRtcCA9IG1bMV07IG1bMV0gPSBtWzNdOyBtWzNdID0gdG1wO1xuICAgICAgICB0bXAgPSBtWzJdOyBtWzJdID0gbVs2XTsgbVs2XSA9IHRtcDtcbiAgICAgICAgdG1wID0gbVs1XTsgbVs1XSA9IG1bN107IG1bN10gPSB0bXA7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgdGhlIHNwZWNpZmllZCA0eDQgbWF0cml4IHRvIGEgTWF0My5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW1wb3J0KCcuL21hdDQuanMnKS5NYXQ0fSBtIC0gVGhlIDR4NCBtYXRyaXggdG8gY29udmVydC5cbiAgICAgKiBAcmV0dXJucyB7TWF0M30gU2VsZiBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgc2V0RnJvbU1hdDQobSkge1xuICAgICAgICBjb25zdCBzcmMgPSBtLmRhdGE7XG4gICAgICAgIGNvbnN0IGRzdCA9IHRoaXMuZGF0YTtcblxuICAgICAgICBkc3RbMF0gPSBzcmNbMF07XG4gICAgICAgIGRzdFsxXSA9IHNyY1sxXTtcbiAgICAgICAgZHN0WzJdID0gc3JjWzJdO1xuXG4gICAgICAgIGRzdFszXSA9IHNyY1s0XTtcbiAgICAgICAgZHN0WzRdID0gc3JjWzVdO1xuICAgICAgICBkc3RbNV0gPSBzcmNbNl07XG5cbiAgICAgICAgZHN0WzZdID0gc3JjWzhdO1xuICAgICAgICBkc3RbN10gPSBzcmNbOV07XG4gICAgICAgIGRzdFs4XSA9IHNyY1sxMF07XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJhbnNmb3JtcyBhIDMtZGltZW5zaW9uYWwgdmVjdG9yIGJ5IGEgM3gzIG1hdHJpeC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VmVjM30gdmVjIC0gVGhlIDMtZGltZW5zaW9uYWwgdmVjdG9yIHRvIGJlIHRyYW5zZm9ybWVkLlxuICAgICAqIEBwYXJhbSB7VmVjM30gW3Jlc10gLSBBbiBvcHRpb25hbCAzLWRpbWVuc2lvbmFsIHZlY3RvciB0byByZWNlaXZlIHRoZSByZXN1bHQgb2YgdGhlXG4gICAgICogdHJhbnNmb3JtYXRpb24uXG4gICAgICogQHJldHVybnMge1ZlYzN9IFRoZSBpbnB1dCB2ZWN0b3IgdiB0cmFuc2Zvcm1lZCBieSB0aGUgY3VycmVudCBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICB0cmFuc2Zvcm1WZWN0b3IodmVjLCByZXMgPSBuZXcgVmVjMygpKSB7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLmRhdGE7XG5cbiAgICAgICAgY29uc3QgeCA9IHZlYy54O1xuICAgICAgICBjb25zdCB5ID0gdmVjLnk7XG4gICAgICAgIGNvbnN0IHogPSB2ZWMuejtcblxuICAgICAgICByZXMueCA9IHggKiBtWzBdICsgeSAqIG1bM10gKyB6ICogbVs2XTtcbiAgICAgICAgcmVzLnkgPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN107XG4gICAgICAgIHJlcy56ID0geCAqIG1bMl0gKyB5ICogbVs1XSArIHogKiBtWzhdO1xuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBjb25zdGFudCBtYXRyaXggc2V0IHRvIHRoZSBpZGVudGl0eS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtNYXQzfVxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIHN0YXRpYyBJREVOVElUWSA9IE9iamVjdC5mcmVlemUobmV3IE1hdDMoKSk7XG5cbiAgICAvKipcbiAgICAgKiBBIGNvbnN0YW50IG1hdHJpeCB3aXRoIGFsbCBlbGVtZW50cyBzZXQgdG8gMC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtNYXQzfVxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIHN0YXRpYyBaRVJPID0gT2JqZWN0LmZyZWV6ZShuZXcgTWF0MygpLnNldChbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0pKTtcbn1cblxuZXhwb3J0IHsgTWF0MyB9O1xuIl0sIm5hbWVzIjpbIk1hdDMiLCJjb25zdHJ1Y3RvciIsImRhdGEiLCJGbG9hdDMyQXJyYXkiLCJjbG9uZSIsImNzdHIiLCJjb3B5IiwicmhzIiwic3JjIiwiZHN0Iiwic2V0IiwiZXF1YWxzIiwibCIsInIiLCJpc0lkZW50aXR5IiwibSIsInNldElkZW50aXR5IiwidG9TdHJpbmciLCJqb2luIiwidHJhbnNwb3NlIiwidG1wIiwic2V0RnJvbU1hdDQiLCJ0cmFuc2Zvcm1WZWN0b3IiLCJ2ZWMiLCJyZXMiLCJWZWMzIiwieCIsInkiLCJ6IiwiSURFTlRJVFkiLCJPYmplY3QiLCJmcmVlemUiLCJaRVJPIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTUEsSUFBSSxDQUFDO0FBQ1A7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFHSTtBQUNKO0FBQ0E7QUFDSUMsRUFBQUEsV0FBV0EsR0FBRztBQUFBLElBQUEsSUFBQSxDQUxkQyxJQUFJLEdBQUcsSUFBSUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBTXRCO0FBQ0E7SUFDQSxJQUFJLENBQUNELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNBLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNBLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDbEQsR0FBQTs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSUUsRUFBQUEsS0FBS0EsR0FBRztBQUNKO0FBQ0EsSUFBQSxNQUFNQyxJQUFJLEdBQUcsSUFBSSxDQUFDSixXQUFXLENBQUE7QUFDN0IsSUFBQSxPQUFPLElBQUlJLElBQUksRUFBRSxDQUFDQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEMsR0FBQTs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0lBLElBQUlBLENBQUNDLEdBQUcsRUFBRTtBQUNOLElBQUEsTUFBTUMsR0FBRyxHQUFHRCxHQUFHLENBQUNMLElBQUksQ0FBQTtBQUNwQixJQUFBLE1BQU1PLEdBQUcsR0FBRyxJQUFJLENBQUNQLElBQUksQ0FBQTtBQUVyQk8sSUFBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHRCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDZkMsSUFBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHRCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDZkMsSUFBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHRCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDZkMsSUFBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHRCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDZkMsSUFBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHRCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDZkMsSUFBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHRCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDZkMsSUFBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHRCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDZkMsSUFBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHRCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDZkMsSUFBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHRCxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFFZixJQUFBLE9BQU8sSUFBSSxDQUFBO0FBQ2YsR0FBQTs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDSUUsR0FBR0EsQ0FBQ0YsR0FBRyxFQUFFO0FBQ0wsSUFBQSxNQUFNQyxHQUFHLEdBQUcsSUFBSSxDQUFDUCxJQUFJLENBQUE7QUFFckJPLElBQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2ZDLElBQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2ZDLElBQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2ZDLElBQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2ZDLElBQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2ZDLElBQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2ZDLElBQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2ZDLElBQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2ZDLElBQUFBLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBR0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRWYsSUFBQSxPQUFPLElBQUksQ0FBQTtBQUNmLEdBQUE7O0FBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDSUcsTUFBTUEsQ0FBQ0osR0FBRyxFQUFFO0FBQ1IsSUFBQSxNQUFNSyxDQUFDLEdBQUcsSUFBSSxDQUFDVixJQUFJLENBQUE7QUFDbkIsSUFBQSxNQUFNVyxDQUFDLEdBQUdOLEdBQUcsQ0FBQ0wsSUFBSSxDQUFBO0FBRWxCLElBQUEsT0FBU1UsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQ2JELENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBS0MsQ0FBQyxDQUFDLENBQUMsQ0FBRSxJQUNkRCxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUtDLENBQUMsQ0FBQyxDQUFDLENBQUUsSUFDZEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLQyxDQUFDLENBQUMsQ0FBQyxDQUFFLElBQ2RELENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBS0MsQ0FBQyxDQUFDLENBQUMsQ0FBRSxJQUNkRCxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUtDLENBQUMsQ0FBQyxDQUFDLENBQUUsSUFDZEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLQyxDQUFDLENBQUMsQ0FBQyxDQUFFLElBQ2RELENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBS0MsQ0FBQyxDQUFDLENBQUMsQ0FBRSxJQUNkRCxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUtDLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQTtBQUMzQixHQUFBOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSUMsRUFBQUEsVUFBVUEsR0FBRztBQUNULElBQUEsTUFBTUMsQ0FBQyxHQUFHLElBQUksQ0FBQ2IsSUFBSSxDQUFBO0FBQ25CLElBQUEsT0FBU2EsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFDVkEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUUsSUFDWEEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUUsSUFDWEEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUUsSUFDWEEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUUsSUFDWEEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUUsSUFDWEEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUUsSUFDWEEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUUsSUFDWEEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUUsQ0FBQTtBQUN4QixHQUFBOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSUMsRUFBQUEsV0FBV0EsR0FBRztBQUNWLElBQUEsTUFBTUQsQ0FBQyxHQUFHLElBQUksQ0FBQ2IsSUFBSSxDQUFBO0FBQ25CYSxJQUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1JBLElBQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDUkEsSUFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUVSQSxJQUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1JBLElBQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDUkEsSUFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUVSQSxJQUFBQSxD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
