/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
const math = {
  DEG_TO_RAD: Math.PI / 180,
  RAD_TO_DEG: 180 / Math.PI,
  clamp: function (value, min, max) {
    if (value >= max) return max;
    if (value <= min) return min;
    return value;
  },
  intToBytes24: function (i) {
    const r = i >> 16 & 0xff;
    const g = i >> 8 & 0xff;
    const b = i & 0xff;
    return [r, g, b];
  },
  intToBytes32: function (i) {
    const r = i >> 24 & 0xff;
    const g = i >> 16 & 0xff;
    const b = i >> 8 & 0xff;
    const a = i & 0xff;
    return [r, g, b, a];
  },
  bytesToInt24: function (r, g, b) {
    if (r.length) {
      b = r[2];
      g = r[1];
      r = r[0];
    }
    return r << 16 | g << 8 | b;
  },
  bytesToInt32: function (r, g, b, a) {
    if (r.length) {
      a = r[3];
      b = r[2];
      g = r[1];
      r = r[0];
    }

    return (r << 24 | g << 16 | b << 8 | a) >>> 0;
  },
  lerp: function (a, b, alpha) {
    return a + (b - a) * math.clamp(alpha, 0, 1);
  },
  lerpAngle: function (a, b, alpha) {
    if (b - a > 180) {
      b -= 360;
    }
    if (b - a < -180) {
      b += 360;
    }
    return math.lerp(a, b, math.clamp(alpha, 0, 1));
  },
  powerOfTwo: function (x) {
    return x !== 0 && !(x & x - 1);
  },
  nextPowerOfTwo: function (val) {
    val--;
    val |= val >> 1;
    val |= val >> 2;
    val |= val >> 4;
    val |= val >> 8;
    val |= val >> 16;
    val++;
    return val;
  },
  nearestPowerOfTwo: function (val) {
    return Math.pow(2, Math.round(Math.log(val) / Math.log(2)));
  },
  random: function (min, max) {
    const diff = max - min;
    return Math.random() * diff + min;
  },
  smoothstep: function (min, max, x) {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * (3 - 2 * x);
  },
  smootherstep: function (min, max, x) {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * x * (x * (x * 6 - 15) + 10);
  },
  roundUp: function (numToRound, multiple) {
    if (multiple === 0) return numToRound;
    return Math.ceil(numToRound / multiple) * multiple;
  },
  between: function (num, a, b, inclusive) {
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    return inclusive ? num >= min && num <= max : num > min && num < max;
  }
};

export { math };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0aC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvbWF0aC9tYXRoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTWF0aCBBUEkuXG4gKlxuICogQG5hbWVzcGFjZVxuICovXG5jb25zdCBtYXRoID0ge1xuICAgIC8qKlxuICAgICAqIENvbnZlcnNpb24gZmFjdG9yIGJldHdlZW4gZGVncmVlcyBhbmQgcmFkaWFucy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgREVHX1RPX1JBRDogTWF0aC5QSSAvIDE4MCxcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnNpb24gZmFjdG9yIGJldHdlZW4gZGVncmVlcyBhbmQgcmFkaWFucy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgUkFEX1RPX0RFRzogMTgwIC8gTWF0aC5QSSxcblxuICAgIC8qKlxuICAgICAqIENsYW1wIGEgbnVtYmVyIGJldHdlZW4gbWluIGFuZCBtYXggaW5jbHVzaXZlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gTnVtYmVyIHRvIGNsYW1wLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gLSBNaW4gdmFsdWUuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCAtIE1heCB2YWx1ZS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgY2xhbXBlZCB2YWx1ZS5cbiAgICAgKi9cbiAgICBjbGFtcDogZnVuY3Rpb24gKHZhbHVlLCBtaW4sIG1heCkge1xuICAgICAgICBpZiAodmFsdWUgPj0gbWF4KSByZXR1cm4gbWF4O1xuICAgICAgICBpZiAodmFsdWUgPD0gbWluKSByZXR1cm4gbWluO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgYW4gMjQgYml0IGludGVnZXIgaW50byBhbiBhcnJheSBvZiAzIGJ5dGVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGkgLSBOdW1iZXIgaG9sZGluZyBhbiBpbnRlZ2VyIHZhbHVlLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJbXX0gQW4gYXJyYXkgb2YgMyBieXRlcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFNldCBieXRlcyB0byBbMHgxMSwgMHgyMiwgMHgzM11cbiAgICAgKiB2YXIgYnl0ZXMgPSBwYy5tYXRoLmludFRvQnl0ZXMyNCgweDExMjIzMyk7XG4gICAgICovXG4gICAgaW50VG9CeXRlczI0OiBmdW5jdGlvbiAoaSkge1xuICAgICAgICBjb25zdCByID0gKGkgPj4gMTYpICYgMHhmZjtcbiAgICAgICAgY29uc3QgZyA9IChpID4+IDgpICYgMHhmZjtcbiAgICAgICAgY29uc3QgYiA9IChpKSAmIDB4ZmY7XG5cbiAgICAgICAgcmV0dXJuIFtyLCBnLCBiXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29udmVydCBhbiAzMiBiaXQgaW50ZWdlciBpbnRvIGFuIGFycmF5IG9mIDQgYnl0ZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaSAtIE51bWJlciBob2xkaW5nIGFuIGludGVnZXIgdmFsdWUuXG4gICAgICogQHJldHVybnMge251bWJlcltdfSBBbiBhcnJheSBvZiA0IGJ5dGVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gU2V0IGJ5dGVzIHRvIFsweDExLCAweDIyLCAweDMzLCAweDQ0XVxuICAgICAqIHZhciBieXRlcyA9IHBjLm1hdGguaW50VG9CeXRlczMyKDB4MTEyMjMzNDQpO1xuICAgICAqL1xuICAgIGludFRvQnl0ZXMzMjogZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgY29uc3QgciA9IChpID4+IDI0KSAmIDB4ZmY7XG4gICAgICAgIGNvbnN0IGcgPSAoaSA+PiAxNikgJiAweGZmO1xuICAgICAgICBjb25zdCBiID0gKGkgPj4gOCkgJiAweGZmO1xuICAgICAgICBjb25zdCBhID0gKGkpICYgMHhmZjtcblxuICAgICAgICByZXR1cm4gW3IsIGcsIGIsIGFdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IDMgOCBiaXQgTnVtYmVycyBpbnRvIGEgc2luZ2xlIHVuc2lnbmVkIDI0IGJpdCBOdW1iZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gciAtIEEgc2luZ2xlIGJ5dGUgKDAtMjU1KS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZyAtIEEgc2luZ2xlIGJ5dGUgKDAtMjU1KS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYiAtIEEgc2luZ2xlIGJ5dGUgKDAtMjU1KS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBBIHNpbmdsZSB1bnNpZ25lZCAyNCBiaXQgTnVtYmVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gU2V0IHJlc3VsdDEgdG8gMHgxMTIyMzMgZnJvbSBhbiBhcnJheSBvZiAzIHZhbHVlc1xuICAgICAqIHZhciByZXN1bHQxID0gcGMubWF0aC5ieXRlc1RvSW50MjQoWzB4MTEsIDB4MjIsIDB4MzNdKTtcbiAgICAgKlxuICAgICAqIC8vIFNldCByZXN1bHQyIHRvIDB4MTEyMjMzIGZyb20gMyBkaXNjcmV0ZSB2YWx1ZXNcbiAgICAgKiB2YXIgcmVzdWx0MiA9IHBjLm1hdGguYnl0ZXNUb0ludDI0KDB4MTEsIDB4MjIsIDB4MzMpO1xuICAgICAqL1xuICAgIGJ5dGVzVG9JbnQyNDogZnVuY3Rpb24gKHIsIGcsIGIpIHtcbiAgICAgICAgaWYgKHIubGVuZ3RoKSB7XG4gICAgICAgICAgICBiID0gclsyXTtcbiAgICAgICAgICAgIGcgPSByWzFdO1xuICAgICAgICAgICAgciA9IHJbMF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgociA8PCAxNikgfCAoZyA8PCA4KSB8IGIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IDQgMS1ieXRlIE51bWJlcnMgaW50byBhIHNpbmdsZSB1bnNpZ25lZCAzMmJpdCBOdW1iZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gciAtIEEgc2luZ2xlIGJ5dGUgKDAtMjU1KS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZyAtIEEgc2luZ2xlIGJ5dGUgKDAtMjU1KS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYiAtIEEgc2luZ2xlIGJ5dGUgKDAtMjU1KS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYSAtIEEgc2luZ2xlIGJ5dGUgKDAtMjU1KS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBBIHNpbmdsZSB1bnNpZ25lZCAzMmJpdCBOdW1iZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBTZXQgcmVzdWx0MSB0byAweDExMjIzMzQ0IGZyb20gYW4gYXJyYXkgb2YgNCB2YWx1ZXNcbiAgICAgKiB2YXIgcmVzdWx0MSA9IHBjLm1hdGguYnl0ZXNUb0ludDMyKFsweDExLCAweDIyLCAweDMzLCAweDQ0XSk7XG4gICAgICpcbiAgICAgKiAvLyBTZXQgcmVzdWx0MiB0byAweDExMjIzMzQ0IGZyb20gNCBkaXNjcmV0ZSB2YWx1ZXNcbiAgICAgKiB2YXIgcmVzdWx0MiA9IHBjLm1hdGguYnl0ZXNUb0ludDMyKDB4MTEsIDB4MjIsIDB4MzMsIDB4NDQpO1xuICAgICAqL1xuICAgIGJ5dGVzVG9JbnQzMjogZnVuY3Rpb24gKHIsIGcsIGIsIGEpIHtcbiAgICAgICAgaWYgKHIubGVuZ3RoKSB7XG4gICAgICAgICAgICBhID0gclszXTtcbiAgICAgICAgICAgIGIgPSByWzJdO1xuICAgICAgICAgICAgZyA9IHJbMV07XG4gICAgICAgICAgICByID0gclswXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdoeSAoKHIgPDwgMjQpPj4+MCk/XG4gICAgICAgIC8vIDw8IG9wZXJhdG9yIHVzZXMgc2lnbmVkIDMyIGJpdCBudW1iZXJzLCBzbyAxMjg8PDI0IGlzIG5lZ2F0aXZlLlxuICAgICAgICAvLyA+Pj4gdXNlZCB1bnNpZ25lZCBzbyA+Pj4wIGNvbnZlcnRzIGJhY2sgdG8gYW4gdW5zaWduZWQuXG4gICAgICAgIC8vIFNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE5MDg0OTIvdW5zaWduZWQtaW50ZWdlci1pbi1qYXZhc2NyaXB0XG4gICAgICAgIHJldHVybiAoKHIgPDwgMjQpIHwgKGcgPDwgMTYpIHwgKGIgPDwgOCkgfCBhKSA+Pj4gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgbGluZWFyIGludGVycG9sYXRpb24gb2YgdHdvIG51bWJlcnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYSAtIE51bWJlciB0byBsaW5lYXJseSBpbnRlcnBvbGF0ZSBmcm9tLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBiIC0gTnVtYmVyIHRvIGxpbmVhcmx5IGludGVycG9sYXRlIHRvLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbHBoYSAtIFRoZSB2YWx1ZSBjb250cm9sbGluZyB0aGUgcmVzdWx0IG9mIGludGVycG9sYXRpb24uIFdoZW4gYWxwaGEgaXMgMCxcbiAgICAgKiBhIGlzIHJldHVybmVkLiBXaGVuIGFscGhhIGlzIDEsIGIgaXMgcmV0dXJuZWQuIEJldHdlZW4gMCBhbmQgMSwgYSBsaW5lYXIgaW50ZXJwb2xhdGlvblxuICAgICAqIGJldHdlZW4gYSBhbmQgYiBpcyByZXR1cm5lZC4gYWxwaGEgaXMgY2xhbXBlZCBiZXR3ZWVuIDAgYW5kIDEuXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGxpbmVhciBpbnRlcnBvbGF0aW9uIG9mIHR3byBudW1iZXJzLlxuICAgICAqL1xuICAgIGxlcnA6IGZ1bmN0aW9uIChhLCBiLCBhbHBoYSkge1xuICAgICAgICByZXR1cm4gYSArIChiIC0gYSkgKiBtYXRoLmNsYW1wKGFscGhhLCAwLCAxKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgbGluZWFyIGludGVycG9sYXRpb24gb2YgdHdvIGFuZ2xlcyBlbnN1cmluZyB0aGF0IGludGVycG9sYXRpb24gaXMgY29ycmVjdGx5XG4gICAgICogcGVyZm9ybWVkIGFjcm9zcyB0aGUgMzYwIHRvIDAgZGVncmVlIGJvdW5kYXJ5LiBBbmdsZXMgYXJlIHN1cHBsaWVkIGluIGRlZ3JlZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYSAtIEFuZ2xlIChpbiBkZWdyZWVzKSB0byBsaW5lYXJseSBpbnRlcnBvbGF0ZSBmcm9tLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBiIC0gQW5nbGUgKGluIGRlZ3JlZXMpIHRvIGxpbmVhcmx5IGludGVycG9sYXRlIHRvLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbHBoYSAtIFRoZSB2YWx1ZSBjb250cm9sbGluZyB0aGUgcmVzdWx0IG9mIGludGVycG9sYXRpb24uIFdoZW4gYWxwaGEgaXMgMCxcbiAgICAgKiBhIGlzIHJldHVybmVkLiBXaGVuIGFscGhhIGlzIDEsIGIgaXMgcmV0dXJuZWQuIEJldHdlZW4gMCBhbmQgMSwgYSBsaW5lYXIgaW50ZXJwb2xhdGlvblxuICAgICAqIGJldHdlZW4gYSBhbmQgYiBpcyByZXR1cm5lZC4gYWxwaGEgaXMgY2xhbXBlZCBiZXR3ZWVuIDAgYW5kIDEuXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGxpbmVhciBpbnRlcnBvbGF0aW9uIG9mIHR3byBhbmdsZXMuXG4gICAgICovXG4gICAgbGVycEFuZ2xlOiBmdW5jdGlvbiAoYSwgYiwgYWxwaGEpIHtcbiAgICAgICAgaWYgKGIgLSBhID4gMTgwKSB7XG4gICAgICAgICAgICBiIC09IDM2MDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYiAtIGEgPCAtMTgwKSB7XG4gICAgICAgICAgICBiICs9IDM2MDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF0aC5sZXJwKGEsIGIsIG1hdGguY2xhbXAoYWxwaGEsIDAsIDEpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIGFyZ3VtZW50IGlzIGEgcG93ZXItb2YtdHdvIGFuZCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIE51bWJlciB0byBjaGVjayBmb3IgcG93ZXItb2YtdHdvIHByb3BlcnR5LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHBvd2VyLW9mLXR3byBhbmQgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHBvd2VyT2ZUd286IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiAoKHggIT09IDApICYmICEoeCAmICh4IC0gMSkpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbmV4dCBwb3dlciBvZiAyIGZvciB0aGUgc3BlY2lmaWVkIHZhbHVlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbCAtIFRoZSB2YWx1ZSBmb3Igd2hpY2ggdG8gY2FsY3VsYXRlIHRoZSBuZXh0IHBvd2VyIG9mIDIuXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIG5leHQgcG93ZXIgb2YgMi5cbiAgICAgKi9cbiAgICBuZXh0UG93ZXJPZlR3bzogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB2YWwtLTtcbiAgICAgICAgdmFsIHw9ICh2YWwgPj4gMSk7XG4gICAgICAgIHZhbCB8PSAodmFsID4+IDIpO1xuICAgICAgICB2YWwgfD0gKHZhbCA+PiA0KTtcbiAgICAgICAgdmFsIHw9ICh2YWwgPj4gOCk7XG4gICAgICAgIHZhbCB8PSAodmFsID4+IDE2KTtcbiAgICAgICAgdmFsKys7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG5lYXJlc3QgKHNtYWxsZXIgb3IgbGFyZ2VyKSBwb3dlciBvZiAyIGZvciB0aGUgc3BlY2lmaWVkIHZhbHVlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbCAtIFRoZSB2YWx1ZSBmb3Igd2hpY2ggdG8gY2FsY3VsYXRlIHRoZSBuZWFyZXN0IHBvd2VyIG9mIDIuXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIG5lYXJlc3QgcG93ZXIgb2YgMi5cbiAgICAgKi9cbiAgICBuZWFyZXN0UG93ZXJPZlR3bzogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICByZXR1cm4gTWF0aC5wb3coMiwgTWF0aC5yb3VuZChNYXRoLmxvZyh2YWwpIC8gTWF0aC5sb2coMikpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgcHNldWRvLXJhbmRvbSBudW1iZXIgYmV0d2VlbiBtaW4gYW5kIG1heC4gVGhlIG51bWJlciBnZW5lcmF0ZWQgaXMgaW4gdGhlIHJhbmdlXG4gICAgICogW21pbiwgbWF4KSwgdGhhdCBpcyBpbmNsdXNpdmUgb2YgdGhlIG1pbmltdW0gYnV0IGV4Y2x1c2l2ZSBvZiB0aGUgbWF4aW11bS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gLSBMb3dlciBib3VuZCBmb3IgcmFuZ2UuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCAtIFVwcGVyIGJvdW5kIGZvciByYW5nZS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBQc2V1ZG8tcmFuZG9tIG51bWJlciBiZXR3ZWVuIHRoZSBzdXBwbGllZCByYW5nZS5cbiAgICAgKi9cbiAgICByYW5kb206IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICAgICAgICBjb25zdCBkaWZmID0gbWF4IC0gbWluO1xuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIGRpZmYgKyBtaW47XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBmdW5jdGlvbiBpbnRlcnBvbGF0ZXMgc21vb3RobHkgYmV0d2VlbiB0d28gaW5wdXQgdmFsdWVzIGJhc2VkIG9uIGEgdGhpcmQgb25lIHRoYXQgc2hvdWxkXG4gICAgICogYmUgYmV0d2VlbiB0aGUgZmlyc3QgdHdvLiBUaGUgcmV0dXJuZWQgdmFsdWUgaXMgY2xhbXBlZCBiZXR3ZWVuIDAgYW5kIDEuXG4gICAgICpcbiAgICAgKiBUaGUgc2xvcGUgKGkuZS4gZGVyaXZhdGl2ZSkgb2YgdGhlIHNtb290aHN0ZXAgZnVuY3Rpb24gc3RhcnRzIGF0IDAgYW5kIGVuZHMgYXQgMC4gVGhpcyBtYWtlc1xuICAgICAqIGl0IGVhc3kgdG8gY3JlYXRlIGEgc2VxdWVuY2Ugb2YgdHJhbnNpdGlvbnMgdXNpbmcgc21vb3Roc3RlcCB0byBpbnRlcnBvbGF0ZSBlYWNoIHNlZ21lbnRcbiAgICAgKiByYXRoZXIgdGhhbiB1c2luZyBhIG1vcmUgc29waGlzdGljYXRlZCBvciBleHBlbnNpdmUgaW50ZXJwb2xhdGlvbiB0ZWNobmlxdWUuXG4gICAgICpcbiAgICAgKiBTZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TbW9vdGhzdGVwIGZvciBtb3JlIGRldGFpbHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluIC0gVGhlIGxvd2VyIGJvdW5kIG9mIHRoZSBpbnRlcnBvbGF0aW9uIHJhbmdlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXggLSBUaGUgdXBwZXIgYm91bmQgb2YgdGhlIGludGVycG9sYXRpb24gcmFuZ2UuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBUaGUgdmFsdWUgdG8gaW50ZXJwb2xhdGUuXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHNtb290aGx5IGludGVycG9sYXRlZCB2YWx1ZSBjbGFtcGVkIGJldHdlZW4gemVybyBhbmQgb25lLlxuICAgICAqL1xuICAgIHNtb290aHN0ZXA6IGZ1bmN0aW9uIChtaW4sIG1heCwgeCkge1xuICAgICAgICBpZiAoeCA8PSBtaW4pIHJldHVybiAwO1xuICAgICAgICBpZiAoeCA+PSBtYXgpIHJldHVybiAxO1xuXG4gICAgICAgIHggPSAoeCAtIG1pbikgLyAobWF4IC0gbWluKTtcblxuICAgICAgICByZXR1cm4geCAqIHggKiAoMyAtIDIgKiB4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW4gaW1wcm92ZWQgdmVyc2lvbiBvZiB0aGUge0BsaW5rIG1hdGguc21vb3Roc3RlcH0gZnVuY3Rpb24gd2hpY2ggaGFzIHplcm8gMXN0IGFuZCAybmQgb3JkZXJcbiAgICAgKiBkZXJpdmF0aXZlcyBhdCB0PTAgYW5kIHQ9MS5cbiAgICAgKlxuICAgICAqIFNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1Ntb290aHN0ZXAgZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gLSBUaGUgbG93ZXIgYm91bmQgb2YgdGhlIGludGVycG9sYXRpb24gcmFuZ2UuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCAtIFRoZSB1cHBlciBib3VuZCBvZiB0aGUgaW50ZXJwb2xhdGlvbiByYW5nZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIFRoZSB2YWx1ZSB0byBpbnRlcnBvbGF0ZS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgc21vb3RobHkgaW50ZXJwb2xhdGVkIHZhbHVlIGNsYW1wZWQgYmV0d2VlbiB6ZXJvIGFuZCBvbmUuXG4gICAgICovXG4gICAgc21vb3RoZXJzdGVwOiBmdW5jdGlvbiAobWluLCBtYXgsIHgpIHtcbiAgICAgICAgaWYgKHggPD0gbWluKSByZXR1cm4gMDtcbiAgICAgICAgaWYgKHggPj0gbWF4KSByZXR1cm4gMTtcblxuICAgICAgICB4ID0gKHggLSBtaW4pIC8gKG1heCAtIG1pbik7XG5cbiAgICAgICAgcmV0dXJuIHggKiB4ICogeCAqICh4ICogKHggKiA2IC0gMTUpICsgMTApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3VuZHMgYSBudW1iZXIgdXAgdG8gbmVhcmVzdCBtdWx0aXBsZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBudW1Ub1JvdW5kIC0gVGhlIG51bWJlciB0byByb3VuZCB1cC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbXVsdGlwbGUgLSBUaGUgbXVsdGlwbGUgdG8gcm91bmQgdXAgdG8uXG4gICAgICogQHJldHVybnMge251bWJlcn0gQSBudW1iZXIgcm91bmRlZCB1cCB0byBuZWFyZXN0IG11bHRpcGxlLlxuICAgICAqL1xuICAgIHJvdW5kVXA6IGZ1bmN0aW9uIChudW1Ub1JvdW5kLCBtdWx0aXBsZSkge1xuICAgICAgICBpZiAobXVsdGlwbGUgPT09IDApXG4gICAgICAgICAgICByZXR1cm4gbnVtVG9Sb3VuZDtcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbChudW1Ub1JvdW5kIC8gbXVsdGlwbGUpICogbXVsdGlwbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gbnVtYmVyIHJlc2lkZXMgYmV0d2VlbiB0d28gb3RoZXIgZ2l2ZW4gbnVtYmVycy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBudW0gLSBUaGUgbnVtYmVyIHRvIGNoZWNrIHRoZSBwb3NpdGlvbiBvZi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYSAtIFRoZSBmaXJzdCB1cHBlciBvciBsb3dlciB0aHJlc2hvbGQgdG8gY2hlY2sgYmV0d2Vlbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYiAtIFRoZSBzZWNvbmQgdXBwZXIgb3IgbG93ZXIgdGhyZXNob2xkIHRvIGNoZWNrIGJldHdlZW4uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpbmNsdXNpdmUgLSBJZiB0cnVlLCBhIG51bSBwYXJhbSB3aGljaCBpcyBlcXVhbCB0byBhIG9yIGIgd2lsbCByZXR1cm4gdHJ1ZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBiZXR3ZWVuIG9yIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgYmV0d2VlbjogZnVuY3Rpb24gKG51bSwgYSwgYiwgaW5jbHVzaXZlKSB7XG4gICAgICAgIGNvbnN0IG1pbiA9IE1hdGgubWluKGEsIGIpO1xuICAgICAgICBjb25zdCBtYXggPSBNYXRoLm1heChhLCBiKTtcbiAgICAgICAgcmV0dXJuIGluY2x1c2l2ZSA/IG51bSA+PSBtaW4gJiYgbnVtIDw9IG1heCA6IG51bSA+IG1pbiAmJiBudW0gPCBtYXg7XG4gICAgfVxufTtcblxuZXhwb3J0IHsgbWF0aCB9O1xuIl0sIm5hbWVzIjpbIm1hdGgiLCJERUdfVE9fUkFEIiwiTWF0aCIsIlBJIiwiUkFEX1RPX0RFRyIsImNsYW1wIiwidmFsdWUiLCJtaW4iLCJtYXgiLCJpbnRUb0J5dGVzMjQiLCJpIiwiciIsImciLCJiIiwiaW50VG9CeXRlczMyIiwiYSIsImJ5dGVzVG9JbnQyNCIsImxlbmd0aCIsImJ5dGVzVG9JbnQzMiIsImxlcnAiLCJhbHBoYSIsImxlcnBBbmdsZSIsInBvd2VyT2ZUd28iLCJ4IiwibmV4dFBvd2VyT2ZUd28iLCJ2YWwiLCJuZWFyZXN0UG93ZXJPZlR3byIsInBvdyIsInJvdW5kIiwibG9nIiwicmFuZG9tIiwiZGlmZiIsInNtb290aHN0ZXAiLCJzbW9vdGhlcnN0ZXAiLCJyb3VuZFVwIiwibnVtVG9Sb3VuZCIsIm11bHRpcGxlIiwiY2VpbCIsImJldHdlZW4iLCJudW0iLCJpbmNsdXNpdmUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBS0EsTUFBTUEsSUFBSSxHQUFHO0FBTVRDLEVBQUFBLFVBQVUsRUFBRUMsSUFBSSxDQUFDQyxFQUFFLEdBQUcsR0FBRztBQU96QkMsRUFBQUEsVUFBVSxFQUFFLEdBQUcsR0FBR0YsSUFBSSxDQUFDQyxFQUFFO0FBVXpCRSxFQUFBQSxLQUFLLEVBQUUsVUFBVUMsS0FBSyxFQUFFQyxHQUFHLEVBQUVDLEdBQUcsRUFBRTtBQUM5QixJQUFBLElBQUlGLEtBQUssSUFBSUUsR0FBRyxFQUFFLE9BQU9BLEdBQUcsQ0FBQTtBQUM1QixJQUFBLElBQUlGLEtBQUssSUFBSUMsR0FBRyxFQUFFLE9BQU9BLEdBQUcsQ0FBQTtBQUM1QixJQUFBLE9BQU9ELEtBQUssQ0FBQTtHQUNmO0VBV0RHLFlBQVksRUFBRSxVQUFVQyxDQUFDLEVBQUU7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
