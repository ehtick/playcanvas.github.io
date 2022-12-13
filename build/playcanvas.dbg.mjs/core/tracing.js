/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
class Tracing {

  static set(channel, enabled = true) {
    if (enabled) {
      Tracing._traceChannels.add(channel);
    } else {
      Tracing._traceChannels.delete(channel);
    }
  }

  static get(channel) {
    return Tracing._traceChannels.has(channel);
  }
}
Tracing._traceChannels = new Set();
Tracing.stack = false;

export { Tracing };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2luZy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvdHJhY2luZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIExvZyB0cmFjaW5nIGZ1bmN0aW9uYWxpdHksIGFsbG93aW5nIGZvciB0cmFjaW5nIG9mIHRoZSBpbnRlcm5hbCBmdW5jdGlvbmFsaXR5IG9mIHRoZSBlbmdpbmUuXG4gKiBOb3RlIHRoYXQgdGhlIHRyYWNlIGxvZ2dpbmcgb25seSB0YWtlcyBwbGFjZSBpbiB0aGUgZGVidWcgYnVpbGQgb2YgdGhlIGVuZ2luZSBhbmQgaXMgc3RyaXBwZWRcbiAqIG91dCBpbiBvdGhlciBidWlsZHMuXG4gKi9cbmNsYXNzIFRyYWNpbmcge1xuICAgIC8qKlxuICAgICAqIFNldCBzdG9yaW5nIHRoZSBuYW1lcyBvZiBlbmFibGVkIHRyYWNlIGNoYW5uZWxzLlxuICAgICAqXG4gICAgICogQHR5cGUge1NldDxzdHJpbmc+fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc3RhdGljIF90cmFjZUNoYW5uZWxzID0gbmV3IFNldCgpO1xuXG4gICAgLyoqXG4gICAgICogRW5hYmxlIGNhbGwgc3RhY2sgbG9nZ2luZyBmb3IgdHJhY2UgY2FsbHMuIERlZmF1bHRzIHRvIGZhbHNlLlxuICAgICAqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgc3RhdGljIHN0YWNrID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUgb3IgZGlzYWJsZSBhIHRyYWNlIGNoYW5uZWwuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhbm5lbCAtIE5hbWUgb2YgdGhlIHRyYWNlIGNoYW5uZWwuIENhbiBiZTpcbiAgICAgKlxuICAgICAqIC0ge0BsaW5rIFRSQUNFSURfUkVOREVSX0ZSQU1FfVxuICAgICAqIC0ge0BsaW5rIFRSQUNFSURfUkVOREVSX1BBU1N9XG4gICAgICogLSB7QGxpbmsgVFJBQ0VJRF9SRU5ERVJfUEFTU19ERVRBSUx9XG4gICAgICogLSB7QGxpbmsgVFJBQ0VJRF9SRU5ERVJfQUNUSU9OfVxuICAgICAqIC0ge0BsaW5rIFRSQUNFSURfUkVOREVSX1RBUkdFVF9BTExPQ31cbiAgICAgKiAtIHtAbGluayBUUkFDRUlEX1RFWFRVUkVfQUxMT0N9XG4gICAgICogLSB7QGxpbmsgVFJBQ0VJRF9TSEFERVJfQUxMT0N9XG4gICAgICogLSB7QGxpbmsgVFJBQ0VJRF9TSEFERVJfQ09NUElMRX1cbiAgICAgKiAtIHtAbGluayBUUkFDRUlEX1ZSQU1fVEVYVFVSRX1cbiAgICAgKiAtIHtAbGluayBUUkFDRUlEX1ZSQU1fVkJ9XG4gICAgICogLSB7QGxpbmsgVFJBQ0VJRF9WUkFNX0lCfVxuICAgICAqIC0ge0BsaW5rIFRSQUNFSURfUkVOREVSUElQRUxJTkVfQUxMT0N9XG4gICAgICogLSB7QGxpbmsgVFJBQ0VJRF9QSVBFTElORUxBWU9VVF9BTExPQ31cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5hYmxlZCAtIE5ldyBlbmFibGVkIHN0YXRlIGZvciB0aGUgY2hhbm5lbC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0KGNoYW5uZWwsIGVuYWJsZWQgPSB0cnVlKSB7XG5cbiAgICAgICAgLy8gI2lmIF9ERUJVR1xuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgICAgVHJhY2luZy5fdHJhY2VDaGFubmVscy5hZGQoY2hhbm5lbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBUcmFjaW5nLl90cmFjZUNoYW5uZWxzLmRlbGV0ZShjaGFubmVsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAjZW5kaWZcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUZXN0IGlmIHRoZSB0cmFjZSBjaGFubmVsIGlzIGVuYWJsZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhbm5lbCAtIE5hbWUgb2YgdGhlIHRyYWNlIGNoYW5uZWwuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gVHJ1ZSBpZiB0aGUgdHJhY2UgY2hhbm5lbCBpcyBlbmFibGVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQoY2hhbm5lbCkge1xuICAgICAgICByZXR1cm4gVHJhY2luZy5fdHJhY2VDaGFubmVscy5oYXMoY2hhbm5lbCk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBUcmFjaW5nIH07XG4iXSwibmFtZXMiOlsiVHJhY2luZyIsInNldCIsImNoYW5uZWwiLCJlbmFibGVkIiwiX3RyYWNlQ2hhbm5lbHMiLCJhZGQiLCJkZWxldGUiLCJnZXQiLCJoYXMiLCJTZXQiLCJzdGFjayJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQSxNQUFNQSxPQUFPLENBQUM7O0FBcUNWLEVBQUEsT0FBT0MsR0FBRyxDQUFDQyxPQUFPLEVBQUVDLE9BQU8sR0FBRyxJQUFJLEVBQUU7QUFHaEMsSUFBQSxJQUFJQSxPQUFPLEVBQUU7QUFDVEgsTUFBQUEsT0FBTyxDQUFDSSxjQUFjLENBQUNDLEdBQUcsQ0FBQ0gsT0FBTyxDQUFDLENBQUE7QUFDdkMsS0FBQyxNQUFNO0FBQ0hGLE1BQUFBLE9BQU8sQ0FBQ0ksY0FBYyxDQUFDRSxNQUFNLENBQUNKLE9BQU8sQ0FBQyxDQUFBO0FBQzFDLEtBQUE7QUFFSixHQUFBOztFQVFBLE9BQU9LLEdBQUcsQ0FBQ0wsT0FBTyxFQUFFO0FBQ2hCLElBQUEsT0FBT0YsT0FBTyxDQUFDSSxjQUFjLENBQUNJLEdBQUcsQ0FBQ04sT0FBTyxDQUFDLENBQUE7QUFDOUMsR0FBQTtBQUNKLENBQUE7QUF6RE1GLE9BQU8sQ0FPRkksY0FBYyxHQUFHLElBQUlLLEdBQUcsRUFBRSxDQUFBO0FBUC9CVCxPQUFPLENBY0ZVLEtBQUssR0FBRyxLQUFLOzs7OyJ9
