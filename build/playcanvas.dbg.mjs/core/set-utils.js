/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
const set = {
  equals: function (set1, set2) {
    if (set1.size !== set2.size) {
      return false;
    }
    for (const item of set1) {
      if (!set2.has(item)) {
        return false;
      }
    }
    return true;
  }
};

export { set };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0LXV0aWxzLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9zZXQtdXRpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc2V0ID0ge1xuXG4gICAgLy8gaGVscGVyIGZ1bmN0aW9uIHRvIGNvbXBhcmUgdHdvIHNldHMgZm9yIGVxdWFsaXR5XG4gICAgZXF1YWxzOiBmdW5jdGlvbiAoc2V0MSwgc2V0Mikge1xuXG4gICAgICAgIGlmIChzZXQxLnNpemUgIT09IHNldDIuc2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBzZXQxKSB7XG4gICAgICAgICAgICBpZiAoIXNldDIuaGFzKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7IHNldCB9O1xuIl0sIm5hbWVzIjpbInNldCIsImVxdWFscyIsInNldDEiLCJzZXQyIiwic2l6ZSIsIml0ZW0iLCJoYXMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsTUFBTUEsR0FBRyxHQUFHO0FBR1JDLEVBQUFBLE1BQU0sRUFBRSxVQUFVQyxJQUFJLEVBQUVDLElBQUksRUFBRTtBQUUxQixJQUFBLElBQUlELElBQUksQ0FBQ0UsSUFBSSxLQUFLRCxJQUFJLENBQUNDLElBQUksRUFBRTtBQUN6QixNQUFBLE9BQU8sS0FBSyxDQUFBO0FBQ2hCLEtBQUE7QUFDQSxJQUFBLEtBQUssTUFBTUMsSUFBSSxJQUFJSCxJQUFJLEVBQUU7QUFDckIsTUFBQSxJQUFJLENBQUNDLElBQUksQ0FBQ0csR0FBRyxDQUFDRCxJQUFJLENBQUMsRUFBRTtBQUNqQixRQUFBLE9BQU8sS0FBSyxDQUFBO0FBQ2hCLE9BQUE7QUFDSixLQUFBO0FBQ0EsSUFBQSxPQUFPLElBQUksQ0FBQTtBQUNmLEdBQUE7QUFDSjs7OzsifQ==
