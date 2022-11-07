/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
class RefCountedObject {
  constructor() {
    this._refCount = 0;
  }
  incRefCount() {
    this._refCount++;
  }

  decRefCount() {
    this._refCount--;
  }

  get refCount() {
    return this._refCount;
  }
}

export { RefCountedObject };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmLWNvdW50ZWQtb2JqZWN0LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9yZWYtY291bnRlZC1vYmplY3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBCYXNlIGNsYXNzIHRoYXQgaW1wbGVtZW50cyByZWZlcmVuY2UgY291bnRpbmcgZm9yIG9iamVjdHMuXG4gKlxuICogQGlnbm9yZVxuICovXG5jbGFzcyBSZWZDb3VudGVkT2JqZWN0IHtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlZkNvdW50ID0gMDtcblxuICAgIC8qKlxuICAgICAqIEluY3JlbWVudHMgdGhlIHJlZmVyZW5jZSBjb3VudGVyLlxuICAgICAqL1xuICAgIGluY1JlZkNvdW50KCkge1xuICAgICAgICB0aGlzLl9yZWZDb3VudCsrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlY3JlbWVudHMgdGhlIHJlZmVyZW5jZSBjb3VudGVyLlxuICAgICAqL1xuICAgIGRlY1JlZkNvdW50KCkge1xuICAgICAgICB0aGlzLl9yZWZDb3VudC0tO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHJlZmVyZW5jZSBjb3VudC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0IHJlZkNvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVmQ291bnQ7XG4gICAgfVxufVxuXG5leHBvcnQgeyBSZWZDb3VudGVkT2JqZWN0IH07XG4iXSwibmFtZXMiOlsiUmVmQ291bnRlZE9iamVjdCIsIl9yZWZDb3VudCIsImluY1JlZkNvdW50IiwiZGVjUmVmQ291bnQiLCJyZWZDb3VudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQSxNQUFNQSxnQkFBZ0IsQ0FBQztBQUFBLEVBQUEsV0FBQSxHQUFBO0lBQUEsSUFLbkJDLENBQUFBLFNBQVMsR0FBRyxDQUFDLENBQUE7QUFBQSxHQUFBO0FBS2JDLEVBQUFBLFdBQVcsR0FBRztJQUNWLElBQUksQ0FBQ0QsU0FBUyxFQUFFLENBQUE7QUFDcEIsR0FBQTs7QUFLQUUsRUFBQUEsV0FBVyxHQUFHO0lBQ1YsSUFBSSxDQUFDRixTQUFTLEVBQUUsQ0FBQTtBQUNwQixHQUFBOztBQU9BLEVBQUEsSUFBSUcsUUFBUSxHQUFHO0lBQ1gsT0FBTyxJQUFJLENBQUNILFNBQVMsQ0FBQTtBQUN6QixHQUFBO0FBQ0o7Ozs7In0=
