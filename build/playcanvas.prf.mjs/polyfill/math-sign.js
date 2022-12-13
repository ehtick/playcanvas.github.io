/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
if (!Math.sign) {
  Math.sign = function (x) {
    return (x > 0) - (x < 0) || +x;
  };
}
