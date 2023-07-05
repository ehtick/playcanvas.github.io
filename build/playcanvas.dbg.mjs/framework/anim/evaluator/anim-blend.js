class AnimBlend {
  static dot(a, b) {
    const len = a.length;
    let result = 0;
    for (let i = 0; i < len; ++i) {
      result += a[i] * b[i];
    }
    return result;
  }
  static normalize(a) {
    let l = AnimBlend.dot(a, a);
    if (l > 0) {
      l = 1.0 / Math.sqrt(l);
      const len = a.length;
      for (let i = 0; i < len; ++i) {
        a[i] *= l;
      }
    }
  }
  static set(a, b, type) {
    const len = a.length;
    if (type === 'quaternion') {
      let l = AnimBlend.dot(b, b);
      if (l > 0) {
        l = 1.0 / Math.sqrt(l);
      }
      for (let i = 0; i < len; ++i) {
        a[i] = b[i] * l;
      }
    } else {
      for (let i = 0; i < len; ++i) {
        a[i] = b[i];
      }
    }
  }
  static blendVec(a, b, t, additive) {
    const it = additive ? 1.0 : 1.0 - t;
    const len = a.length;
    for (let i = 0; i < len; ++i) {
      a[i] = a[i] * it + b[i] * t;
    }
  }
  static blendQuat(a, b, t, additive) {
    const len = a.length;
    const it = additive ? 1.0 : 1.0 - t;

    // negate b if a and b don't lie in the same winding (due to
    // double cover). if we don't do this then often rotations from
    // one orientation to another go the long way around.
    if (AnimBlend.dot(a, b) < 0) {
      t = -t;
    }
    for (let i = 0; i < len; ++i) {
      a[i] = a[i] * it + b[i] * t;
    }
    if (!additive) {
      AnimBlend.normalize(a);
    }
  }
  static blend(a, b, t, type, additive) {
    if (type === 'quaternion') {
      AnimBlend.blendQuat(a, b, t, additive);
    } else {
      AnimBlend.blendVec(a, b, t, additive);
    }
  }
  static stableSort(a, lessFunc) {
    const len = a.length;
    for (let i = 0; i < len - 1; ++i) {
      for (let j = i + 1; j < len; ++j) {
        if (lessFunc(a[j], a[i])) {
          const tmp = a[i];
          a[i] = a[j];
          a[j] = tmp;
        }
      }
    }
  }
}

export { AnimBlend };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbS1ibGVuZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9hbmltL2V2YWx1YXRvci9hbmltLWJsZW5kLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFuaW1CbGVuZCB7XG4gICAgc3RhdGljIGRvdChhLCBiKSB7XG4gICAgICAgIGNvbnN0IGxlbiAgPSBhLmxlbmd0aDtcbiAgICAgICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBhW2ldICogYltpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHN0YXRpYyBub3JtYWxpemUoYSkge1xuICAgICAgICBsZXQgbCA9IEFuaW1CbGVuZC5kb3QoYSwgYSk7XG4gICAgICAgIGlmIChsID4gMCkge1xuICAgICAgICAgICAgbCA9IDEuMCAvIE1hdGguc3FydChsKTtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IGEubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgICAgIGFbaV0gKj0gbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBzZXQoYSwgYiwgdHlwZSkge1xuICAgICAgICBjb25zdCBsZW4gID0gYS5sZW5ndGg7XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdxdWF0ZXJuaW9uJykge1xuICAgICAgICAgICAgbGV0IGwgPSBBbmltQmxlbmQuZG90KGIsIGIpO1xuICAgICAgICAgICAgaWYgKGwgPiAwKSB7XG4gICAgICAgICAgICAgICAgbCA9IDEuMCAvIE1hdGguc3FydChsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICBhW2ldID0gYltpXSAqIGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgYVtpXSA9IGJbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgYmxlbmRWZWMoYSwgYiwgdCwgYWRkaXRpdmUpIHtcbiAgICAgICAgY29uc3QgaXQgPSBhZGRpdGl2ZSA/IDEuMCA6IDEuMCAtIHQ7XG4gICAgICAgIGNvbnN0IGxlbiA9IGEubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICBhW2ldID0gYVtpXSAqIGl0ICsgYltpXSAqIHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgYmxlbmRRdWF0KGEsIGIsIHQsIGFkZGl0aXZlKSB7XG4gICAgICAgIGNvbnN0IGxlbiA9IGEubGVuZ3RoO1xuICAgICAgICBjb25zdCBpdCA9IGFkZGl0aXZlID8gMS4wIDogMS4wIC0gdDtcblxuICAgICAgICAvLyBuZWdhdGUgYiBpZiBhIGFuZCBiIGRvbid0IGxpZSBpbiB0aGUgc2FtZSB3aW5kaW5nIChkdWUgdG9cbiAgICAgICAgLy8gZG91YmxlIGNvdmVyKS4gaWYgd2UgZG9uJ3QgZG8gdGhpcyB0aGVuIG9mdGVuIHJvdGF0aW9ucyBmcm9tXG4gICAgICAgIC8vIG9uZSBvcmllbnRhdGlvbiB0byBhbm90aGVyIGdvIHRoZSBsb25nIHdheSBhcm91bmQuXG4gICAgICAgIGlmIChBbmltQmxlbmQuZG90KGEsIGIpIDwgMCkge1xuICAgICAgICAgICAgdCA9IC10O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgYVtpXSA9IGFbaV0gKiBpdCArIGJbaV0gKiB0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFhZGRpdGl2ZSkge1xuICAgICAgICAgICAgQW5pbUJsZW5kLm5vcm1hbGl6ZShhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBibGVuZChhLCBiLCB0LCB0eXBlLCBhZGRpdGl2ZSkge1xuICAgICAgICBpZiAodHlwZSA9PT0gJ3F1YXRlcm5pb24nKSB7XG4gICAgICAgICAgICBBbmltQmxlbmQuYmxlbmRRdWF0KGEsIGIsIHQsIGFkZGl0aXZlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIEFuaW1CbGVuZC5ibGVuZFZlYyhhLCBiLCB0LCBhZGRpdGl2ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgc3RhYmxlU29ydChhLCBsZXNzRnVuYykge1xuICAgICAgICBjb25zdCBsZW4gPSBhLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4gLSAxOyArK2kpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IGxlbjsgKytqKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxlc3NGdW5jKGFbal0sIGFbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRtcCA9IGFbaV07XG4gICAgICAgICAgICAgICAgICAgIGFbaV0gPSBhW2pdO1xuICAgICAgICAgICAgICAgICAgICBhW2pdID0gdG1wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgQW5pbUJsZW5kIH07XG4iXSwibmFtZXMiOlsiQW5pbUJsZW5kIiwiZG90IiwiYSIsImIiLCJsZW4iLCJsZW5ndGgiLCJyZXN1bHQiLCJpIiwibm9ybWFsaXplIiwibCIsIk1hdGgiLCJzcXJ0Iiwic2V0IiwidHlwZSIsImJsZW5kVmVjIiwidCIsImFkZGl0aXZlIiwiaXQiLCJibGVuZFF1YXQiLCJibGVuZCIsInN0YWJsZVNvcnQiLCJsZXNzRnVuYyIsImoiLCJ0bXAiXSwibWFwcGluZ3MiOiJBQUFBLE1B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
