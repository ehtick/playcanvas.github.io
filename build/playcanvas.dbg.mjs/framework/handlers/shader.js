/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { http } from '../../platform/net/http.js';

class ShaderHandler {

  constructor(app) {
    this.handlerType = "shader";
    this.maxRetries = 0;
  }
  load(url, callback) {
    if (typeof url === 'string') {
      url = {
        load: url,
        original: url
      };
    }
    http.get(url.load, {
      retry: this.maxRetries > 0,
      maxRetries: this.maxRetries
    }, function (err, response) {
      if (!err) {
        callback(null, response);
      } else {
        callback(`Error loading shader resource: ${url.original} [${err}]`);
      }
    });
  }
  open(url, data) {
    return data;
  }
  patch(asset, assets) {}
}

export { ShaderHandler };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZGVyLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2hhbmRsZXJzL3NoYWRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBodHRwIH0gZnJvbSAnLi4vLi4vcGxhdGZvcm0vbmV0L2h0dHAuanMnO1xuXG5jbGFzcyBTaGFkZXJIYW5kbGVyIHtcbiAgICAvKipcbiAgICAgKiBUeXBlIG9mIHRoZSByZXNvdXJjZSB0aGUgaGFuZGxlciBoYW5kbGVzLlxuICAgICAqXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBoYW5kbGVyVHlwZSA9IFwic2hhZGVyXCI7XG5cbiAgICBjb25zdHJ1Y3RvcihhcHApIHtcbiAgICAgICAgdGhpcy5tYXhSZXRyaWVzID0gMDtcbiAgICB9XG5cbiAgICBsb2FkKHVybCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB1cmwgPSB7XG4gICAgICAgICAgICAgICAgbG9hZDogdXJsLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB1cmxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBodHRwLmdldCh1cmwubG9hZCwge1xuICAgICAgICAgICAgcmV0cnk6IHRoaXMubWF4UmV0cmllcyA+IDAsXG4gICAgICAgICAgICBtYXhSZXRyaWVzOiB0aGlzLm1heFJldHJpZXNcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhgRXJyb3IgbG9hZGluZyBzaGFkZXIgcmVzb3VyY2U6ICR7dXJsLm9yaWdpbmFsfSBbJHtlcnJ9XWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvcGVuKHVybCwgZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICBwYXRjaChhc3NldCwgYXNzZXRzKSB7XG4gICAgfVxufVxuXG5leHBvcnQgeyBTaGFkZXJIYW5kbGVyIH07XG4iXSwibmFtZXMiOlsiU2hhZGVySGFuZGxlciIsImNvbnN0cnVjdG9yIiwiYXBwIiwiaGFuZGxlclR5cGUiLCJtYXhSZXRyaWVzIiwibG9hZCIsInVybCIsImNhbGxiYWNrIiwib3JpZ2luYWwiLCJodHRwIiwiZ2V0IiwicmV0cnkiLCJlcnIiLCJyZXNwb25zZSIsIm9wZW4iLCJkYXRhIiwicGF0Y2giLCJhc3NldCIsImFzc2V0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBLE1BQU1BLGFBQWEsQ0FBQzs7RUFRaEJDLFdBQVcsQ0FBQ0MsR0FBRyxFQUFFO0lBQUEsSUFGakJDLENBQUFBLFdBQVcsR0FBRyxRQUFRLENBQUE7SUFHbEIsSUFBSSxDQUFDQyxVQUFVLEdBQUcsQ0FBQyxDQUFBO0FBQ3ZCLEdBQUE7QUFFQUMsRUFBQUEsSUFBSSxDQUFDQyxHQUFHLEVBQUVDLFFBQVEsRUFBRTtBQUNoQixJQUFBLElBQUksT0FBT0QsR0FBRyxLQUFLLFFBQVEsRUFBRTtBQUN6QkEsTUFBQUEsR0FBRyxHQUFHO0FBQ0ZELFFBQUFBLElBQUksRUFBRUMsR0FBRztBQUNURSxRQUFBQSxRQUFRLEVBQUVGLEdBQUFBO09BQ2IsQ0FBQTtBQUNMLEtBQUE7QUFFQUcsSUFBQUEsSUFBSSxDQUFDQyxHQUFHLENBQUNKLEdBQUcsQ0FBQ0QsSUFBSSxFQUFFO0FBQ2ZNLE1BQUFBLEtBQUssRUFBRSxJQUFJLENBQUNQLFVBQVUsR0FBRyxDQUFDO01BQzFCQSxVQUFVLEVBQUUsSUFBSSxDQUFDQSxVQUFBQTtBQUNyQixLQUFDLEVBQUUsVUFBVVEsR0FBRyxFQUFFQyxRQUFRLEVBQUU7TUFDeEIsSUFBSSxDQUFDRCxHQUFHLEVBQUU7QUFDTkwsUUFBQUEsUUFBUSxDQUFDLElBQUksRUFBRU0sUUFBUSxDQUFDLENBQUE7QUFDNUIsT0FBQyxNQUFNO1FBQ0hOLFFBQVEsQ0FBRSxrQ0FBaUNELEdBQUcsQ0FBQ0UsUUFBUyxDQUFJSSxFQUFBQSxFQUFBQSxHQUFJLEdBQUUsQ0FBQyxDQUFBO0FBQ3ZFLE9BQUE7QUFDSixLQUFDLENBQUMsQ0FBQTtBQUNOLEdBQUE7QUFFQUUsRUFBQUEsSUFBSSxDQUFDUixHQUFHLEVBQUVTLElBQUksRUFBRTtBQUNaLElBQUEsT0FBT0EsSUFBSSxDQUFBO0FBQ2YsR0FBQTtBQUVBQyxFQUFBQSxLQUFLLENBQUNDLEtBQUssRUFBRUMsTUFBTSxFQUFFLEVBQ3JCO0FBQ0o7Ozs7In0=
