/**
 * @license
 * PlayCanvas Engine v1.58.0-preview revision 1fec26519 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
import { GraphicsDeviceAccess } from '../platform/graphics/graphics-device-access.js';

let currentApplication;
function getApplication() {
  return currentApplication;
}
function setApplication(app) {
  currentApplication = app;
  GraphicsDeviceAccess.set(app == null ? void 0 : app.graphicsDevice);
}

export { getApplication, setApplication };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFscy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9nbG9iYWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEdyYXBoaWNzRGV2aWNlQWNjZXNzIH0gZnJvbSBcIi4uL3BsYXRmb3JtL2dyYXBoaWNzL2dyYXBoaWNzLWRldmljZS1hY2Nlc3MuanNcIjtcblxubGV0IGN1cnJlbnRBcHBsaWNhdGlvbjtcblxuZnVuY3Rpb24gZ2V0QXBwbGljYXRpb24oKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRBcHBsaWNhdGlvbjtcbn1cblxuZnVuY3Rpb24gc2V0QXBwbGljYXRpb24oYXBwKSB7XG4gICAgY3VycmVudEFwcGxpY2F0aW9uID0gYXBwO1xuICAgIEdyYXBoaWNzRGV2aWNlQWNjZXNzLnNldChhcHA/LmdyYXBoaWNzRGV2aWNlKTtcbn1cblxuZXhwb3J0IHtcbiAgICBnZXRBcHBsaWNhdGlvbixcbiAgICBzZXRBcHBsaWNhdGlvblxufTtcbiJdLCJuYW1lcyI6WyJjdXJyZW50QXBwbGljYXRpb24iLCJnZXRBcHBsaWNhdGlvbiIsInNldEFwcGxpY2F0aW9uIiwiYXBwIiwiR3JhcGhpY3NEZXZpY2VBY2Nlc3MiLCJzZXQiLCJncmFwaGljc0RldmljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBLElBQUlBLGtCQUFrQixDQUFBO0FBRXRCLFNBQVNDLGNBQWMsR0FBRztBQUN0QixFQUFBLE9BQU9ELGtCQUFrQixDQUFBO0FBQzdCLENBQUE7QUFFQSxTQUFTRSxjQUFjLENBQUNDLEdBQUcsRUFBRTtBQUN6QkgsRUFBQUEsa0JBQWtCLEdBQUdHLEdBQUcsQ0FBQTtFQUN4QkMsb0JBQW9CLENBQUNDLEdBQUcsQ0FBQ0YsR0FBRyxvQkFBSEEsR0FBRyxDQUFFRyxjQUFjLENBQUMsQ0FBQTtBQUNqRDs7OzsifQ==
