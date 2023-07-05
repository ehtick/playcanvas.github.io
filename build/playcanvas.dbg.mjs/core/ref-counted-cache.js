/**
 * Class implementing reference counting cache for objects.
 *
 * @ignore
 */
class RefCountedCache {
  constructor() {
    /**
     * The cache. The key is the object being stored in the cache. The value is ref count of the
     * object. When that reaches zero, destroy function on the object gets called and object is
     * removed from the cache.
     *
     * @type {Map<object, number>}
     */
    this.cache = new Map();
  }
  /**
   * Destroy all stored objects.
   */
  destroy() {
    this.cache.forEach((refCount, object) => {
      object.destroy();
    });
    this.cache.clear();
  }

  /**
   * Add object reference to the cache.
   *
   * @param {object} object - The object to add.
   */
  incRef(object) {
    const refCount = (this.cache.get(object) || 0) + 1;
    this.cache.set(object, refCount);
  }

  /**
   * Remove object reference from the cache.
   *
   * @param {object} object - The object to remove.
   */
  decRef(object) {
    if (object) {
      let refCount = this.cache.get(object);
      if (refCount) {
        refCount--;
        if (refCount === 0) {
          // destroy object and remove it from cache
          this.cache.delete(object);
          object.destroy();
        } else {
          // update new ref count in the cache
          this.cache.set(object, refCount);
        }
      }
    }
  }
}

export { RefCountedCache };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmLWNvdW50ZWQtY2FjaGUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3JlZi1jb3VudGVkLWNhY2hlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ2xhc3MgaW1wbGVtZW50aW5nIHJlZmVyZW5jZSBjb3VudGluZyBjYWNoZSBmb3Igb2JqZWN0cy5cbiAqXG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIFJlZkNvdW50ZWRDYWNoZSB7XG4gICAgLyoqXG4gICAgICogVGhlIGNhY2hlLiBUaGUga2V5IGlzIHRoZSBvYmplY3QgYmVpbmcgc3RvcmVkIGluIHRoZSBjYWNoZS4gVGhlIHZhbHVlIGlzIHJlZiBjb3VudCBvZiB0aGVcbiAgICAgKiBvYmplY3QuIFdoZW4gdGhhdCByZWFjaGVzIHplcm8sIGRlc3Ryb3kgZnVuY3Rpb24gb24gdGhlIG9iamVjdCBnZXRzIGNhbGxlZCBhbmQgb2JqZWN0IGlzXG4gICAgICogcmVtb3ZlZCBmcm9tIHRoZSBjYWNoZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtNYXA8b2JqZWN0LCBudW1iZXI+fVxuICAgICAqL1xuICAgIGNhY2hlID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogRGVzdHJveSBhbGwgc3RvcmVkIG9iamVjdHMuXG4gICAgICovXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5jYWNoZS5mb3JFYWNoKChyZWZDb3VudCwgb2JqZWN0KSA9PiB7XG4gICAgICAgICAgICBvYmplY3QuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jYWNoZS5jbGVhcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBvYmplY3QgcmVmZXJlbmNlIHRvIHRoZSBjYWNoZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3QgLSBUaGUgb2JqZWN0IHRvIGFkZC5cbiAgICAgKi9cbiAgICBpbmNSZWYob2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IHJlZkNvdW50ID0gKHRoaXMuY2FjaGUuZ2V0KG9iamVjdCkgfHwgMCkgKyAxO1xuICAgICAgICB0aGlzLmNhY2hlLnNldChvYmplY3QsIHJlZkNvdW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgb2JqZWN0IHJlZmVyZW5jZSBmcm9tIHRoZSBjYWNoZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3QgLSBUaGUgb2JqZWN0IHRvIHJlbW92ZS5cbiAgICAgKi9cbiAgICBkZWNSZWYob2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3QpIHtcbiAgICAgICAgICAgIGxldCByZWZDb3VudCA9IHRoaXMuY2FjaGUuZ2V0KG9iamVjdCk7XG4gICAgICAgICAgICBpZiAocmVmQ291bnQpIHtcbiAgICAgICAgICAgICAgICByZWZDb3VudC0tO1xuICAgICAgICAgICAgICAgIGlmIChyZWZDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBkZXN0cm95IG9iamVjdCBhbmQgcmVtb3ZlIGl0IGZyb20gY2FjaGVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZS5kZWxldGUob2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgbmV3IHJlZiBjb3VudCBpbiB0aGUgY2FjaGVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZS5zZXQob2JqZWN0LCByZWZDb3VudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBSZWZDb3VudGVkQ2FjaGUgfTtcbiJdLCJuYW1lcyI6WyJSZWZDb3VudGVkQ2FjaGUiLCJjb25zdHJ1Y3RvciIsImNhY2hlIiwiTWFwIiwiZGVzdHJveSIsImZvckVhY2giLCJyZWZDb3VudCIsIm9iamVjdCIsImNsZWFyIiwiaW5jUmVmIiwiZ2V0Iiwic2V0IiwiZGVjUmVmIiwiZGVsZXRlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUEsZUFBZSxDQUFDO0VBQUFDLFdBQUEsR0FBQTtBQUNsQjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU5JLElBQUEsSUFBQSxDQU9BQyxLQUFLLEdBQUcsSUFBSUMsR0FBRyxFQUFFLENBQUE7QUFBQSxHQUFBO0FBRWpCO0FBQ0o7QUFDQTtBQUNJQyxFQUFBQSxPQUFPQSxHQUFHO0lBQ04sSUFBSSxDQUFDRixLQUFLLENBQUNHLE9BQU8sQ0FBQyxDQUFDQyxRQUFRLEVBQUVDLE1BQU0sS0FBSztNQUNyQ0EsTUFBTSxDQUFDSCxPQUFPLEVBQUUsQ0FBQTtBQUNwQixLQUFDLENBQUMsQ0FBQTtBQUNGLElBQUEsSUFBSSxDQUFDRixLQUFLLENBQUNNLEtBQUssRUFBRSxDQUFBO0FBQ3RCLEdBQUE7O0FBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtFQUNJQyxNQUFNQSxDQUFDRixNQUFNLEVBQUU7QUFDWCxJQUFBLE1BQU1ELFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQ0osS0FBSyxDQUFDUSxHQUFHLENBQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDbEQsSUFBSSxDQUFDTCxLQUFLLENBQUNTLEdBQUcsQ0FBQ0osTUFBTSxFQUFFRCxRQUFRLENBQUMsQ0FBQTtBQUNwQyxHQUFBOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7RUFDSU0sTUFBTUEsQ0FBQ0wsTUFBTSxFQUFFO0FBQ1gsSUFBQSxJQUFJQSxNQUFNLEVBQUU7TUFDUixJQUFJRCxRQUFRLEdBQUcsSUFBSSxDQUFDSixLQUFLLENBQUNRLEdBQUcsQ0FBQ0gsTUFBTSxDQUFDLENBQUE7QUFDckMsTUFBQSxJQUFJRCxRQUFRLEVBQUU7QUFDVkEsUUFBQUEsUUFBUSxFQUFFLENBQUE7UUFDVixJQUFJQSxRQUFRLEtBQUssQ0FBQyxFQUFFO0FBQ2hCO0FBQ0EsVUFBQSxJQUFJLENBQUNKLEtBQUssQ0FBQ1csTUFBTSxDQUFDTixNQUFNLENBQUMsQ0FBQTtVQUN6QkEsTUFBTSxDQUFDSCxPQUFPLEVBQUUsQ0FBQTtBQUNwQixTQUFDLE1BQU07QUFDSDtVQUNBLElBQUksQ0FBQ0YsS0FBSyxDQUFDUyxHQUFHLENBQUNKLE1BQU0sRUFBRUQsUUFBUSxDQUFDLENBQUE7QUFDcEMsU0FBQTtBQUNKLE9BQUE7QUFDSixLQUFBO0FBQ0osR0FBQTtBQUNKOzs7OyJ9
