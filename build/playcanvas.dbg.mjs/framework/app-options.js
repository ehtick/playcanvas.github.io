/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
class AppOptions {
  constructor() {
    this.elementInput = void 0;
    this.keyboard = void 0;
    this.mouse = void 0;
    this.touch = void 0;
    this.gamepads = void 0;
    this.scriptPrefix = void 0;
    this.assetPrefix = void 0;
    this.scriptsOrder = void 0;
    this.soundManager = void 0;
    this.graphicsDevice = void 0;
    this.lightmapper = void 0;
    this.batchManager = void 0;
    this.xr = void 0;
    this.componentSystems = [];
    this.resourceHandlers = [];
  }
}

export { AppOptions };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLW9wdGlvbnMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvYXBwLW9wdGlvbnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXBwT3B0aW9ucyB7XG4gICAgLyoqXG4gICAgICogSW5wdXQgaGFuZGxlciBmb3Ige0BsaW5rIEVsZW1lbnRDb21wb25lbnR9cy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtpbXBvcnQoJy4vaW5wdXQvZWxlbWVudC1pbnB1dC5qcycpLkVsZW1lbnRJbnB1dH1cbiAgICAgKi9cbiAgICBlbGVtZW50SW5wdXQ7XG5cbiAgICAvKipcbiAgICAgKiBLZXlib2FyZCBoYW5kbGVyIGZvciBpbnB1dC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtpbXBvcnQoJy4uL3BsYXRmb3JtL2lucHV0L2tleWJvYXJkLmpzJykuS2V5Ym9hcmR9XG4gICAgICovXG4gICAga2V5Ym9hcmQ7XG5cbiAgICAvKipcbiAgICAgKiBNb3VzZSBoYW5kbGVyIGZvciBpbnB1dC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtpbXBvcnQoJy4uL3BsYXRmb3JtL2lucHV0L21vdXNlLmpzJykuTW91c2V9XG4gICAgICovXG4gICAgbW91c2U7XG5cbiAgICAvKipcbiAgICAgKiBUb3VjaERldmljZSBoYW5kbGVyIGZvciBpbnB1dC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtpbXBvcnQoJy4uL3BsYXRmb3JtL2lucHV0L3RvdWNoLWRldmljZS5qcycpLlRvdWNoRGV2aWNlfVxuICAgICAqL1xuICAgIHRvdWNoO1xuXG4gICAgLyoqXG4gICAgICogR2FtZXBhZCBoYW5kbGVyIGZvciBpbnB1dC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtpbXBvcnQoJy4uL3BsYXRmb3JtL2lucHV0L2dhbWUtcGFkcy5qcycpLkdhbWVQYWRzfVxuICAgICAqL1xuICAgIGdhbWVwYWRzO1xuXG4gICAgLyoqXG4gICAgICogUHJlZml4IHRvIGFwcGx5IHRvIHNjcmlwdCB1cmxzIGJlZm9yZSBsb2FkaW5nLlxuICAgICAqXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBzY3JpcHRQcmVmaXg7XG5cbiAgICAvKipcbiAgICAgKiBQcmVmaXggdG8gYXBwbHkgdG8gYXNzZXQgdXJscyBiZWZvcmUgbG9hZGluZy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgYXNzZXRQcmVmaXg7XG5cbiAgICAvKipcbiAgICAgKiBTY3JpcHRzIGluIG9yZGVyIG9mIGxvYWRpbmcgZmlyc3QuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7c3RyaW5nW119XG4gICAgICovXG4gICAgc2NyaXB0c09yZGVyO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNvdW5kIG1hbmFnZXJcbiAgICAgKlxuICAgICAqIEB0eXBlIHtpbXBvcnQoJy4uL3BsYXRmb3JtL3NvdW5kL21hbmFnZXIuanMnKS5Tb3VuZE1hbmFnZXJ9XG4gICAgICovXG4gICAgc291bmRNYW5hZ2VyO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGdyYXBoaWNzIGRldmljZS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtpbXBvcnQoJy4uL3BsYXRmb3JtL2dyYXBoaWNzL2dyYXBoaWNzLWRldmljZS5qcycpLkdyYXBoaWNzRGV2aWNlfVxuICAgICAqL1xuICAgIGdyYXBoaWNzRGV2aWNlO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGxpZ2h0bWFwcGVyLlxuICAgICAqXG4gICAgICogQHR5cGUge2ltcG9ydCgnLi9saWdodG1hcHBlci9saWdodG1hcHBlci5qcycpLkxpZ2h0bWFwcGVyfVxuICAgICAqL1xuICAgIGxpZ2h0bWFwcGVyO1xuXG4gICAgLyoqXG4gICAgICogVGhlIEJhdGNoTWFuYWdlci5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtpbXBvcnQoJy4uL3NjZW5lL2JhdGNoaW5nL2JhdGNoLW1hbmFnZXIuanMnKS5CYXRjaE1hbmFnZXJ9XG4gICAgICovXG4gICAgYmF0Y2hNYW5hZ2VyO1xuXG4gICAgLyoqXG4gICAgICogVGhlIFhyTWFuYWdlci5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtpbXBvcnQoJy4veHIveHItbWFuYWdlci5qcycpLlhyTWFuYWdlcn1cbiAgICAgKi9cbiAgICB4cjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQgc3lzdGVtcyB0aGUgYXBwIHJlcXVpcmVzLlxuICAgICAqXG4gICAgICogQHR5cGUge2ltcG9ydCgnLi9jb21wb25lbnRzL3N5c3RlbS5qcycpLkNvbXBvbmVudFN5c3RlbVtdfVxuICAgICAqL1xuICAgIGNvbXBvbmVudFN5c3RlbXMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSByZXNvdXJjZSBoYW5kbGVycyB0aGUgYXBwIHJlcXVpcmVzLlxuICAgICAqXG4gICAgICogQHR5cGUge2ltcG9ydCgnLi9oYW5kbGVycy9oYW5kbGVyLmpzJykuUmVzb3VyY2VIYW5kbGVyW119XG4gICAgICovXG4gICAgcmVzb3VyY2VIYW5kbGVycyA9IFtdO1xufVxuXG5leHBvcnQgeyBBcHBPcHRpb25zIH07XG4iXSwibmFtZXMiOlsiQXBwT3B0aW9ucyIsImVsZW1lbnRJbnB1dCIsImtleWJvYXJkIiwibW91c2UiLCJ0b3VjaCIsImdhbWVwYWRzIiwic2NyaXB0UHJlZml4IiwiYXNzZXRQcmVmaXgiLCJzY3JpcHRzT3JkZXIiLCJzb3VuZE1hbmFnZXIiLCJncmFwaGljc0RldmljZSIsImxpZ2h0bWFwcGVyIiwiYmF0Y2hNYW5hZ2VyIiwieHIiLCJjb21wb25lbnRTeXN0ZW1zIiwicmVzb3VyY2VIYW5kbGVycyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxNQUFNQSxVQUFVLENBQUM7QUFBQSxFQUFBLFdBQUEsR0FBQTtBQUFBLElBQUEsSUFBQSxDQU1iQyxZQUFZLEdBQUEsS0FBQSxDQUFBLENBQUE7QUFBQSxJQUFBLElBQUEsQ0FPWkMsUUFBUSxHQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFBLENBT1JDLEtBQUssR0FBQSxLQUFBLENBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQSxDQU9MQyxLQUFLLEdBQUEsS0FBQSxDQUFBLENBQUE7QUFBQSxJQUFBLElBQUEsQ0FPTEMsUUFBUSxHQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFBLENBT1JDLFlBQVksR0FBQSxLQUFBLENBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQSxDQU9aQyxXQUFXLEdBQUEsS0FBQSxDQUFBLENBQUE7QUFBQSxJQUFBLElBQUEsQ0FPWEMsWUFBWSxHQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFBLENBT1pDLFlBQVksR0FBQSxLQUFBLENBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQSxDQU9aQyxjQUFjLEdBQUEsS0FBQSxDQUFBLENBQUE7QUFBQSxJQUFBLElBQUEsQ0FPZEMsV0FBVyxHQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEsSUFBQSxJQUFBLENBT1hDLFlBQVksR0FBQSxLQUFBLENBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQSxDQU9aQyxFQUFFLEdBQUEsS0FBQSxDQUFBLENBQUE7SUFBQSxJQU9GQyxDQUFBQSxnQkFBZ0IsR0FBRyxFQUFFLENBQUE7SUFBQSxJQU9yQkMsQ0FBQUEsZ0JBQWdCLEdBQUcsRUFBRSxDQUFBO0FBQUEsR0FBQTtBQUN6Qjs7OzsifQ==
