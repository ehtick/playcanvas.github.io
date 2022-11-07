/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { ScopeId } from './scope-id.js';

class ScopeSpace {
  constructor(name) {
    this.name = name;

    this.variables = new Map();
  }

  resolve(name) {
    if (!this.variables.has(name)) {
      this.variables.set(name, new ScopeId(name));
    }

    return this.variables.get(name);
  }

  removeValue(value) {
    for (const uniformName in this.variables) {
      const uniform = this.variables[uniformName];
      if (uniform.value === value) {
        uniform.value = null;
      }
    }
  }
}

export { ScopeSpace };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGUtc3BhY2UuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9wbGF0Zm9ybS9ncmFwaGljcy9zY29wZS1zcGFjZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTY29wZUlkIH0gZnJvbSAnLi9zY29wZS1pZC5qcyc7XG5cbi8qKlxuICogVGhlIHNjb3BlIGZvciB2YXJpYWJsZXMuXG4gKi9cbmNsYXNzIFNjb3BlU3BhY2Uge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBTY29wZVNwYWNlIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgc2NvcGUgbmFtZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgc2NvcGUgbmFtZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG5cbiAgICAgICAgLy8gQ3JlYXRlIG1hcCB3aGljaCBtYXBzIGEgdW5pZm9ybSBuYW1lIGludG8gU2NvcGVJZFxuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgKG9yIGNyZWF0ZSwgaWYgaXQgZG9lc24ndCBhbHJlYWR5IGV4aXN0KSBhIHZhcmlhYmxlIGluIHRoZSBzY29wZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIHZhcmlhYmxlIG5hbWUuXG4gICAgICogQHJldHVybnMge1Njb3BlSWR9IFRoZSB2YXJpYWJsZSBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICByZXNvbHZlKG5hbWUpIHtcbiAgICAgICAgLy8gYWRkIG5ldyBTY29wZUlkIGlmIGl0IGRvZXMgbm90IGV4aXN0IHlldFxuICAgICAgICBpZiAoIXRoaXMudmFyaWFibGVzLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgdGhpcy52YXJpYWJsZXMuc2V0KG5hbWUsIG5ldyBTY29wZUlkKG5hbWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJldHVybiB0aGUgU2NvcGVJZCBpbnN0YW5jZVxuICAgICAgICByZXR1cm4gdGhpcy52YXJpYWJsZXMuZ2V0KG5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFycyB2YWx1ZSBmb3IgYW55IHVuaWZvcm0gd2l0aCBtYXRjaGluZyB2YWx1ZSAodXNlZCB0byByZW1vdmUgZGVsZXRlZCB0ZXh0dXJlcykuXG4gICAgICpcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIC0gVGhlIHZhbHVlIHRvIGNsZWFyLlxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICByZW1vdmVWYWx1ZSh2YWx1ZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHVuaWZvcm1OYW1lIGluIHRoaXMudmFyaWFibGVzKSB7XG4gICAgICAgICAgICBjb25zdCB1bmlmb3JtID0gdGhpcy52YXJpYWJsZXNbdW5pZm9ybU5hbWVdO1xuICAgICAgICAgICAgaWYgKHVuaWZvcm0udmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdW5pZm9ybS52YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IFNjb3BlU3BhY2UgfTtcbiJdLCJuYW1lcyI6WyJTY29wZVNwYWNlIiwiY29uc3RydWN0b3IiLCJuYW1lIiwidmFyaWFibGVzIiwiTWFwIiwicmVzb2x2ZSIsImhhcyIsInNldCIsIlNjb3BlSWQiLCJnZXQiLCJyZW1vdmVWYWx1ZSIsInZhbHVlIiwidW5pZm9ybU5hbWUiLCJ1bmlmb3JtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBS0EsTUFBTUEsVUFBVSxDQUFDO0VBTWJDLFdBQVcsQ0FBQ0MsSUFBSSxFQUFFO0lBTWQsSUFBSSxDQUFDQSxJQUFJLEdBQUdBLElBQUksQ0FBQTs7QUFHaEIsSUFBQSxJQUFJLENBQUNDLFNBQVMsR0FBRyxJQUFJQyxHQUFHLEVBQUUsQ0FBQTtBQUM5QixHQUFBOztFQVFBQyxPQUFPLENBQUNILElBQUksRUFBRTtJQUVWLElBQUksQ0FBQyxJQUFJLENBQUNDLFNBQVMsQ0FBQ0csR0FBRyxDQUFDSixJQUFJLENBQUMsRUFBRTtBQUMzQixNQUFBLElBQUksQ0FBQ0MsU0FBUyxDQUFDSSxHQUFHLENBQUNMLElBQUksRUFBRSxJQUFJTSxPQUFPLENBQUNOLElBQUksQ0FBQyxDQUFDLENBQUE7QUFDL0MsS0FBQTs7QUFHQSxJQUFBLE9BQU8sSUFBSSxDQUFDQyxTQUFTLENBQUNNLEdBQUcsQ0FBQ1AsSUFBSSxDQUFDLENBQUE7QUFDbkMsR0FBQTs7RUFRQVEsV0FBVyxDQUFDQyxLQUFLLEVBQUU7QUFDZixJQUFBLEtBQUssTUFBTUMsV0FBVyxJQUFJLElBQUksQ0FBQ1QsU0FBUyxFQUFFO0FBQ3RDLE1BQUEsTUFBTVUsT0FBTyxHQUFHLElBQUksQ0FBQ1YsU0FBUyxDQUFDUyxXQUFXLENBQUMsQ0FBQTtBQUMzQyxNQUFBLElBQUlDLE9BQU8sQ0FBQ0YsS0FBSyxLQUFLQSxLQUFLLEVBQUU7UUFDekJFLE9BQU8sQ0FBQ0YsS0FBSyxHQUFHLElBQUksQ0FBQTtBQUN4QixPQUFBO0FBQ0osS0FBQTtBQUNKLEdBQUE7QUFDSjs7OzsifQ==
