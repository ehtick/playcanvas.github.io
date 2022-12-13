/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { Http, http } from '../../platform/net/http.js';
import { AnimStateGraph } from '../anim/state-graph/anim-state-graph.js';

class AnimStateGraphHandler {

  constructor(app) {
    this.handlerType = "animstategraph";
    this.maxRetries = 0;
  }
  load(url, callback) {
    if (typeof url === 'string') {
      url = {
        load: url,
        original: url
      };
    }

    const options = {
      retry: this.maxRetries > 0,
      maxRetries: this.maxRetries
    };
    if (url.load.startsWith('blob:')) {
      options.responseType = Http.ResponseType.JSON;
    }
    http.get(url.load, options, function (err, response) {
      if (err) {
        callback(`Error loading animation state graph resource: ${url.original} [${err}]`);
      } else {
        callback(null, response);
      }
    });
  }
  open(url, data) {
    return new AnimStateGraph(data);
  }
  patch(asset, assets) {}
}

export { AnimStateGraphHandler };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbS1zdGF0ZS1ncmFwaC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9oYW5kbGVycy9hbmltLXN0YXRlLWdyYXBoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGh0dHAsIEh0dHAgfSBmcm9tICcuLi8uLi9wbGF0Zm9ybS9uZXQvaHR0cC5qcyc7XG5pbXBvcnQgeyBBbmltU3RhdGVHcmFwaCB9IGZyb20gJy4uL2FuaW0vc3RhdGUtZ3JhcGgvYW5pbS1zdGF0ZS1ncmFwaC5qcyc7XG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL2hhbmRsZXIuanMnKS5SZXNvdXJjZUhhbmRsZXJ9IFJlc291cmNlSGFuZGxlciAqL1xuXG4vKipcbiAqIFJlc291cmNlIGhhbmRsZXIgdXNlZCBmb3IgbG9hZGluZyB7QGxpbmsgQW5pbVN0YXRlR3JhcGh9IHJlc291cmNlcy5cbiAqXG4gKiBAaW1wbGVtZW50cyB7UmVzb3VyY2VIYW5kbGVyfVxuICogQGlnbm9yZVxuICovXG5jbGFzcyBBbmltU3RhdGVHcmFwaEhhbmRsZXIge1xuICAgIC8qKlxuICAgICAqIFR5cGUgb2YgdGhlIHJlc291cmNlIHRoZSBoYW5kbGVyIGhhbmRsZXMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIGhhbmRsZXJUeXBlID0gXCJhbmltc3RhdGVncmFwaFwiO1xuXG4gICAgY29uc3RydWN0b3IoYXBwKSB7XG4gICAgICAgIHRoaXMubWF4UmV0cmllcyA9IDA7XG4gICAgfVxuXG4gICAgbG9hZCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdXJsID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdXJsID0ge1xuICAgICAgICAgICAgICAgIGxvYWQ6IHVybCxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbDogdXJsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UgbmVlZCB0byBzcGVjaWZ5IEpTT04gZm9yIGJsb2IgVVJMc1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgcmV0cnk6IHRoaXMubWF4UmV0cmllcyA+IDAsXG4gICAgICAgICAgICBtYXhSZXRyaWVzOiB0aGlzLm1heFJldHJpZXNcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodXJsLmxvYWQuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xuICAgICAgICAgICAgb3B0aW9ucy5yZXNwb25zZVR5cGUgPSBIdHRwLlJlc3BvbnNlVHlwZS5KU09OO1xuICAgICAgICB9XG5cbiAgICAgICAgaHR0cC5nZXQodXJsLmxvYWQsIG9wdGlvbnMsIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soYEVycm9yIGxvYWRpbmcgYW5pbWF0aW9uIHN0YXRlIGdyYXBoIHJlc291cmNlOiAke3VybC5vcmlnaW5hbH0gWyR7ZXJyfV1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvcGVuKHVybCwgZGF0YSkge1xuICAgICAgICByZXR1cm4gbmV3IEFuaW1TdGF0ZUdyYXBoKGRhdGEpO1xuICAgIH1cblxuICAgIHBhdGNoKGFzc2V0LCBhc3NldHMpIHtcbiAgICB9XG59XG5cbmV4cG9ydCB7IEFuaW1TdGF0ZUdyYXBoSGFuZGxlciB9O1xuIl0sIm5hbWVzIjpbIkFuaW1TdGF0ZUdyYXBoSGFuZGxlciIsImNvbnN0cnVjdG9yIiwiYXBwIiwiaGFuZGxlclR5cGUiLCJtYXhSZXRyaWVzIiwibG9hZCIsInVybCIsImNhbGxiYWNrIiwib3JpZ2luYWwiLCJvcHRpb25zIiwicmV0cnkiLCJzdGFydHNXaXRoIiwicmVzcG9uc2VUeXBlIiwiSHR0cCIsIlJlc3BvbnNlVHlwZSIsIkpTT04iLCJodHRwIiwiZ2V0IiwiZXJyIiwicmVzcG9uc2UiLCJvcGVuIiwiZGF0YSIsIkFuaW1TdGF0ZUdyYXBoIiwicGF0Y2giLCJhc3NldCIsImFzc2V0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFXQSxNQUFNQSxxQkFBcUIsQ0FBQzs7RUFReEJDLFdBQVcsQ0FBQ0MsR0FBRyxFQUFFO0lBQUEsSUFGakJDLENBQUFBLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQTtJQUcxQixJQUFJLENBQUNDLFVBQVUsR0FBRyxDQUFDLENBQUE7QUFDdkIsR0FBQTtBQUVBQyxFQUFBQSxJQUFJLENBQUNDLEdBQUcsRUFBRUMsUUFBUSxFQUFFO0FBQ2hCLElBQUEsSUFBSSxPQUFPRCxHQUFHLEtBQUssUUFBUSxFQUFFO0FBQ3pCQSxNQUFBQSxHQUFHLEdBQUc7QUFDRkQsUUFBQUEsSUFBSSxFQUFFQyxHQUFHO0FBQ1RFLFFBQUFBLFFBQVEsRUFBRUYsR0FBQUE7T0FDYixDQUFBO0FBQ0wsS0FBQTs7QUFHQSxJQUFBLE1BQU1HLE9BQU8sR0FBRztBQUNaQyxNQUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDTixVQUFVLEdBQUcsQ0FBQztNQUMxQkEsVUFBVSxFQUFFLElBQUksQ0FBQ0EsVUFBQUE7S0FDcEIsQ0FBQTtJQUVELElBQUlFLEdBQUcsQ0FBQ0QsSUFBSSxDQUFDTSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDOUJGLE1BQUFBLE9BQU8sQ0FBQ0csWUFBWSxHQUFHQyxJQUFJLENBQUNDLFlBQVksQ0FBQ0MsSUFBSSxDQUFBO0FBQ2pELEtBQUE7QUFFQUMsSUFBQUEsSUFBSSxDQUFDQyxHQUFHLENBQUNYLEdBQUcsQ0FBQ0QsSUFBSSxFQUFFSSxPQUFPLEVBQUUsVUFBVVMsR0FBRyxFQUFFQyxRQUFRLEVBQUU7QUFDakQsTUFBQSxJQUFJRCxHQUFHLEVBQUU7UUFDTFgsUUFBUSxDQUFFLGlEQUFnREQsR0FBRyxDQUFDRSxRQUFTLENBQUlVLEVBQUFBLEVBQUFBLEdBQUksR0FBRSxDQUFDLENBQUE7QUFDdEYsT0FBQyxNQUFNO0FBQ0hYLFFBQUFBLFFBQVEsQ0FBQyxJQUFJLEVBQUVZLFFBQVEsQ0FBQyxDQUFBO0FBQzVCLE9BQUE7QUFDSixLQUFDLENBQUMsQ0FBQTtBQUNOLEdBQUE7QUFFQUMsRUFBQUEsSUFBSSxDQUFDZCxHQUFHLEVBQUVlLElBQUksRUFBRTtBQUNaLElBQUEsT0FBTyxJQUFJQyxjQUFjLENBQUNELElBQUksQ0FBQyxDQUFBO0FBQ25DLEdBQUE7QUFFQUUsRUFBQUEsS0FBSyxDQUFDQyxLQUFLLEVBQUVDLE1BQU0sRUFBRSxFQUNyQjtBQUNKOzs7OyJ9
