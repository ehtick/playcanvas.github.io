/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
class AnimEvents {
  constructor(events) {
    this._events = [...events];

    this._events.sort((a, b) => a.time - b.time);
  }

  get events() {
    return this._events;
  }

}

export { AnimEvents };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbS1ldmVudHMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hbmltL2V2YWx1YXRvci9hbmltLWV2ZW50cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEFuaW1FdmVudHMgc3RvcmVzIGEgc29ydGVkIGFycmF5IG9mIGFuaW1hdGlvbiBldmVudHMgd2hpY2ggc2hvdWxkIGZpcmUgc2VxdWVudGlhbGx5IGR1cmluZyB0aGVcbiAqIHBsYXliYWNrIG9mIGFuIHBjLkFuaW1UcmFjay5cbiAqL1xuY2xhc3MgQW5pbUV2ZW50cyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IEFuaW1FdmVudHMgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdFtdfSBldmVudHMgLSBBbiBhcnJheSBvZiBhbmltYXRpb24gZXZlbnRzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZXZlbnRzID0gbmV3IHBjLkFuaW1FdmVudHMoW1xuICAgICAqICAgICB7XG4gICAgICogICAgICAgICBuYW1lOiAnbXlfZXZlbnQnLFxuICAgICAqICAgICAgICAgdGltZTogMS4zLCAvLyBnaXZlbiBpbiBzZWNvbmRzXG4gICAgICogICAgICAgICAvLyBhbnkgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGFkZGVkIGFyZSBvcHRpb25hbCBhbmQgd2lsbCBiZSBhdmFpbGFibGUgaW4gdGhlIEV2ZW50SGFuZGxlciBjYWxsYmFjaydzIGV2ZW50IG9iamVjdFxuICAgICAqICAgICAgICAgbXlQcm9wZXJ0eTogJ3Rlc3QnLFxuICAgICAqICAgICAgICAgbXlPdGhlclByb3BlcnR5OiB0cnVlXG4gICAgICogICAgIH1cbiAgICAgKiBdKTtcbiAgICAgKiBhbmltVHJhY2suZXZlbnRzID0gZXZlbnRzO1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGV2ZW50cykge1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBbLi4uZXZlbnRzXTtcbiAgICAgICAgdGhpcy5fZXZlbnRzLnNvcnQoKGEsIGIpID0+IGEudGltZSAtIGIudGltZSk7XG4gICAgfVxuXG4gICAgZ2V0IGV2ZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50cztcbiAgICB9XG59XG5cbmV4cG9ydCB7IEFuaW1FdmVudHMgfTtcbiJdLCJuYW1lcyI6WyJBbmltRXZlbnRzIiwiY29uc3RydWN0b3IiLCJldmVudHMiLCJfZXZlbnRzIiwic29ydCIsImEiLCJiIiwidGltZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFJQSxNQUFNQSxVQUFOLENBQWlCO0VBaUJiQyxXQUFXLENBQUNDLE1BQUQsRUFBUztBQUNoQixJQUFBLElBQUEsQ0FBS0MsT0FBTCxHQUFlLENBQUMsR0FBR0QsTUFBSixDQUFmLENBQUE7O0FBQ0EsSUFBQSxJQUFBLENBQUtDLE9BQUwsQ0FBYUMsSUFBYixDQUFrQixDQUFDQyxDQUFELEVBQUlDLENBQUosS0FBVUQsQ0FBQyxDQUFDRSxJQUFGLEdBQVNELENBQUMsQ0FBQ0MsSUFBdkMsQ0FBQSxDQUFBO0FBQ0gsR0FBQTs7QUFFUyxFQUFBLElBQU5MLE1BQU0sR0FBRztBQUNULElBQUEsT0FBTyxLQUFLQyxPQUFaLENBQUE7QUFDSCxHQUFBOztBQXhCWTs7OzsifQ==
