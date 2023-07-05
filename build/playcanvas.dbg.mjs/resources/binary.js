/**
 * @license
 * PlayCanvas Engine v1.58.0-dev revision e102f2b2a (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { http, Http } from '../net/http.js';

class BinaryHandler {
  constructor(app) {
    this.handlerType = "binary";
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
      responseType: Http.ResponseType.ARRAY_BUFFER,
      retry: this.maxRetries > 0,
      maxRetries: this.maxRetries
    }, function (err, response) {
      if (!err) {
        callback(null, response);
      } else {
        callback(`Error loading binary resource: ${url.original} [${err}]`);
      }
    });
  }

  open(url, data) {
    return data;
  }

  patch(asset, assets) {}

}

export { BinaryHandler };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluYXJ5LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb3VyY2VzL2JpbmFyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBodHRwLCBIdHRwIH0gZnJvbSAnLi4vbmV0L2h0dHAuanMnO1xuXG5jbGFzcyBCaW5hcnlIYW5kbGVyIHtcbiAgICAvKipcbiAgICAgKiBUeXBlIG9mIHRoZSByZXNvdXJjZSB0aGUgaGFuZGxlciBoYW5kbGVzLlxuICAgICAqXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBoYW5kbGVyVHlwZSA9IFwiYmluYXJ5XCI7XG5cbiAgICBjb25zdHJ1Y3RvcihhcHApIHtcbiAgICAgICAgdGhpcy5tYXhSZXRyaWVzID0gMDtcbiAgICB9XG5cbiAgICBsb2FkKHVybCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB1cmwgPSB7XG4gICAgICAgICAgICAgICAgbG9hZDogdXJsLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB1cmxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBodHRwLmdldCh1cmwubG9hZCwge1xuICAgICAgICAgICAgcmVzcG9uc2VUeXBlOiBIdHRwLlJlc3BvbnNlVHlwZS5BUlJBWV9CVUZGRVIsXG4gICAgICAgICAgICByZXRyeTogdGhpcy5tYXhSZXRyaWVzID4gMCxcbiAgICAgICAgICAgIG1heFJldHJpZXM6IHRoaXMubWF4UmV0cmllc1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZSkge1xuICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXNwb25zZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGBFcnJvciBsb2FkaW5nIGJpbmFyeSByZXNvdXJjZTogJHt1cmwub3JpZ2luYWx9IFske2Vycn1dYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9wZW4odXJsLCBkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIHBhdGNoKGFzc2V0LCBhc3NldHMpIHtcbiAgICB9XG59XG5cbmV4cG9ydCB7IEJpbmFyeUhhbmRsZXIgfTtcbiJdLCJuYW1lcyI6WyJCaW5hcnlIYW5kbGVyIiwiY29uc3RydWN0b3IiLCJhcHAiLCJoYW5kbGVyVHlwZSIsIm1heFJldHJpZXMiLCJsb2FkIiwidXJsIiwiY2FsbGJhY2siLCJvcmlnaW5hbCIsImh0dHAiLCJnZXQiLCJyZXNwb25zZVR5cGUiLCJIdHRwIiwiUmVzcG9uc2VUeXBlIiwiQVJSQVlfQlVGRkVSIiwicmV0cnkiLCJlcnIiLCJyZXNwb25zZSIsIm9wZW4iLCJkYXRhIiwicGF0Y2giLCJhc3NldCIsImFzc2V0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBLE1BQU1BLGFBQU4sQ0FBb0I7RUFRaEJDLFdBQVcsQ0FBQ0MsR0FBRCxFQUFNO0lBQUEsSUFGakJDLENBQUFBLFdBRWlCLEdBRkgsUUFFRyxDQUFBO0lBQ2IsSUFBS0MsQ0FBQUEsVUFBTCxHQUFrQixDQUFsQixDQUFBO0FBQ0gsR0FBQTs7QUFFREMsRUFBQUEsSUFBSSxDQUFDQyxHQUFELEVBQU1DLFFBQU4sRUFBZ0I7QUFDaEIsSUFBQSxJQUFJLE9BQU9ELEdBQVAsS0FBZSxRQUFuQixFQUE2QjtBQUN6QkEsTUFBQUEsR0FBRyxHQUFHO0FBQ0ZELFFBQUFBLElBQUksRUFBRUMsR0FESjtBQUVGRSxRQUFBQSxRQUFRLEVBQUVGLEdBQUFBO09BRmQsQ0FBQTtBQUlILEtBQUE7O0FBRURHLElBQUFBLElBQUksQ0FBQ0MsR0FBTCxDQUFTSixHQUFHLENBQUNELElBQWIsRUFBbUI7QUFDZk0sTUFBQUEsWUFBWSxFQUFFQyxJQUFJLENBQUNDLFlBQUwsQ0FBa0JDLFlBRGpCO0FBRWZDLE1BQUFBLEtBQUssRUFBRSxJQUFBLENBQUtYLFVBQUwsR0FBa0IsQ0FGVjtBQUdmQSxNQUFBQSxVQUFVLEVBQUUsSUFBS0EsQ0FBQUEsVUFBQUE7QUFIRixLQUFuQixFQUlHLFVBQVVZLEdBQVYsRUFBZUMsUUFBZixFQUF5QjtNQUN4QixJQUFJLENBQUNELEdBQUwsRUFBVTtBQUNOVCxRQUFBQSxRQUFRLENBQUMsSUFBRCxFQUFPVSxRQUFQLENBQVIsQ0FBQTtBQUNILE9BRkQsTUFFTztRQUNIVixRQUFRLENBQUUsa0NBQWlDRCxHQUFHLENBQUNFLFFBQVMsQ0FBSVEsRUFBQUEsRUFBQUEsR0FBSSxHQUF4RCxDQUFSLENBQUE7QUFDSCxPQUFBO0tBVEwsQ0FBQSxDQUFBO0FBV0gsR0FBQTs7QUFFREUsRUFBQUEsSUFBSSxDQUFDWixHQUFELEVBQU1hLElBQU4sRUFBWTtBQUNaLElBQUEsT0FBT0EsSUFBUCxDQUFBO0FBQ0gsR0FBQTs7QUFFREMsRUFBQUEsS0FBSyxDQUFDQyxLQUFELEVBQVFDLE1BQVIsRUFBZ0IsRUFDcEI7O0FBdENlOzs7OyJ9
