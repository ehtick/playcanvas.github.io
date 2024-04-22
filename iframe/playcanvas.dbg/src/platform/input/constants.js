const ACTION_MOUSE = 'mouse';
const ACTION_KEYBOARD = 'keyboard';
const ACTION_GAMEPAD = 'gamepad';
const AXIS_MOUSE_X = 'mousex';
const AXIS_MOUSE_Y = 'mousey';
const AXIS_PAD_L_X = 'padlx';
const AXIS_PAD_L_Y = 'padly';
const AXIS_PAD_R_X = 'padrx';
const AXIS_PAD_R_Y = 'padry';
const AXIS_KEY = 'key';

/**
 * Name of event fired when a key is pressed.
 *
 * @type {string}
 * @category Input
 */
const EVENT_KEYDOWN = 'keydown';

/**
 * Name of event fired when a key is released.
 *
 * @type {string}
 * @category Input
 */
const EVENT_KEYUP = 'keyup';

/**
 * Name of event fired when a mouse button is pressed.
 *
 * @type {string}
 * @category Input
 */
const EVENT_MOUSEDOWN = 'mousedown';

/**
 * Name of event fired when the mouse is moved.
 *
 * @type {string}
 * @category Input
 */
const EVENT_MOUSEMOVE = 'mousemove';

/**
 * Name of event fired when a mouse button is released.
 *
 * @type {string}
 * @category Input
 */
const EVENT_MOUSEUP = 'mouseup';

/**
 * Name of event fired when the mouse wheel is rotated.
 *
 * @type {string}
 * @category Input
 */
const EVENT_MOUSEWHEEL = 'mousewheel';

/**
 * Name of event fired when a new touch occurs. For example, a finger is placed on the device.
 *
 * @type {string}
 * @category Input
 */
const EVENT_TOUCHSTART = 'touchstart';

/**
 * Name of event fired when touch ends. For example, a finger is lifted off the device.
 *
 * @type {string}
 * @category Input
 */
const EVENT_TOUCHEND = 'touchend';

/**
 * Name of event fired when a touch moves.
 *
 * @type {string}
 * @category Input
 */
const EVENT_TOUCHMOVE = 'touchmove';

/**
 * Name of event fired when a touch point is interrupted in some way. The exact reasons for
 * canceling a touch can vary from device to device. For example, a modal alert pops up during the
 * interaction; the touch point leaves the document area, or there are more touch points than the
 * device supports, in which case the earliest touch point is canceled.
 *
 * @type {string}
 * @category Input
 */
const EVENT_TOUCHCANCEL = 'touchcancel';

/**
 * Name of event fired when a new xr select occurs. For example, primary trigger was pressed.
 *
 * @type {string}
 * @category Input
 */
const EVENT_SELECT = 'select';

/**
 * Name of event fired when a new xr select starts. For example, primary trigger is now pressed.
 *
 * @type {string}
 * @category Input
 */
const EVENT_SELECTSTART = 'selectstart';

/**
 * Name of event fired when xr select ends. For example, a primary trigger is now released.
 *
 * @type {string}
 * @category Input
 */
const EVENT_SELECTEND = 'selectend';

/**
 * @type {number}
 * @category Input
 */
const KEY_BACKSPACE = 8;

/**
 * @type {number}
 * @category Input
 */
const KEY_TAB = 9;

/**
 * @type {number}
 * @category Input
 */
const KEY_RETURN = 13;

/**
 * @type {number}
 * @category Input
 */
const KEY_ENTER = 13;

/**
 * @type {number}
 * @category Input
 */
const KEY_SHIFT = 16;

/**
 * @type {number}
 * @category Input
 */
const KEY_CONTROL = 17;

/**
 * @type {number}
 * @category Input
 */
const KEY_ALT = 18;

/**
 * @type {number}
 * @category Input
 */
const KEY_PAUSE = 19;

/**
 * @type {number}
 * @category Input
 */
const KEY_CAPS_LOCK = 20;

/**
 * @type {number}
 * @category Input
 */
const KEY_ESCAPE = 27;

/**
 * @type {number}
 * @category Input
 */
const KEY_SPACE = 32;

/**
 * @type {number}
 * @category Input
 */
const KEY_PAGE_UP = 33;

/**
 * @type {number}
 * @category Input
 */
const KEY_PAGE_DOWN = 34;

/**
 * @type {number}
 * @category Input
 */
const KEY_END = 35;

/**
 * @type {number}
 * @category Input
 */
const KEY_HOME = 36;

/**
 * @type {number}
 * @category Input
 */
const KEY_LEFT = 37;

/**
 * @type {number}
 * @category Input
 */
const KEY_UP = 38;

/**
 * @type {number}
 * @category Input
 */
const KEY_RIGHT = 39;

/**
 * @type {number}
 * @category Input
 */
const KEY_DOWN = 40;

/**
 * @type {number}
 * @category Input
 */
const KEY_PRINT_SCREEN = 44;

/**
 * @type {number}
 * @category Input
 */
const KEY_INSERT = 45;

/**
 * @type {number}
 * @category Input
 */
const KEY_DELETE = 46;

/**
 * @type {number}
 * @category Input
 */
const KEY_0 = 48;

/**
 * @type {number}
 * @category Input
 */
const KEY_1 = 49;

/**
 * @type {number}
 * @category Input
 */
const KEY_2 = 50;

/**
 * @type {number}
 * @category Input
 */
const KEY_3 = 51;

/**
 * @type {number}
 * @category Input
 */
const KEY_4 = 52;

/**
 * @type {number}
 * @category Input
 */
const KEY_5 = 53;

/**
 * @type {number}
 * @category Input
 */
const KEY_6 = 54;

/**
 * @type {number}
 * @category Input
 */
const KEY_7 = 55;

/**
 * @type {number}
 * @category Input
 */
const KEY_8 = 56;

/**
 * @type {number}
 * @category Input
 */
const KEY_9 = 57;

/**
 * @type {number}
 * @category Input
 */
const KEY_SEMICOLON = 59;

/**
 * @type {number}
 * @category Input
 */
const KEY_EQUAL = 61;

/**
 * @type {number}
 * @category Input
 */
const KEY_A = 65;

/**
 * @type {number}
 * @category Input
 */
const KEY_B = 66;

/**
 * @type {number}
 * @category Input
 */
const KEY_C = 67;

/**
 * @type {number}
 * @category Input
 */
const KEY_D = 68;

/**
 * @type {number}
 * @category Input
 */
const KEY_E = 69;

/**
 * @type {number}
 * @category Input
 */
const KEY_F = 70;

/**
 * @type {number}
 * @category Input
 */
const KEY_G = 71;

/**
 * @type {number}
 * @category Input
 */
const KEY_H = 72;

/**
 * @type {number}
 * @category Input
 */
const KEY_I = 73;

/**
 * @type {number}
 * @category Input
 */
const KEY_J = 74;

/**
 * @type {number}
 * @category Input
 */
const KEY_K = 75;

/**
 * @type {number}
 * @category Input
 */
const KEY_L = 76;

/**
 * @type {number}
 * @category Input
 */
const KEY_M = 77;

/**
 * @type {number}
 * @category Input
 */
const KEY_N = 78;

/**
 * @type {number}
 * @category Input
 */
const KEY_O = 79;

/**
 * @type {number}
 * @category Input
 */
const KEY_P = 80;

/**
 * @type {number}
 * @category Input
 */
const KEY_Q = 81;

/**
 * @type {number}
 * @category Input
 */
const KEY_R = 82;

/**
 * @type {number}
 * @category Input
 */
const KEY_S = 83;

/**
 * @type {number}
 * @category Input
 */
const KEY_T = 84;

/**
 * @type {number}
 * @category Input
 */
const KEY_U = 85;

/**
 * @type {number}
 * @category Input
 */
const KEY_V = 86;

/**
 * @type {number}
 * @category Input
 */
const KEY_W = 87;

/**
 * @type {number}
 * @category Input
 */
const KEY_X = 88;

/**
 * @type {number}
 * @category Input
 */
const KEY_Y = 89;

/**
 * @type {number}
 * @category Input
 */
const KEY_Z = 90;

/**
 * @type {number}
 * @category Input
 */
const KEY_WINDOWS = 91;

/**
 * @type {number}
 * @category Input
 */
const KEY_CONTEXT_MENU = 93;

/**
 * @type {number}
 * @category Input
 */
const KEY_NUMPAD_0 = 96;

/**
 * @type {number}
 * @category Input
 */
const KEY_NUMPAD_1 = 97;

/**
 * @type {number}
 * @category Input
 */
const KEY_NUMPAD_2 = 98;

/**
 * @type {number}
 * @category Input
 */
const KEY_NUMPAD_3 = 99;

/**
 * @type {number}
 * @category Input
 */
const KEY_NUMPAD_4 = 100;

/**
 * @type {number}
 * @category Input
 */
const KEY_NUMPAD_5 = 101;

/**
 * @type {number}
 * @category Input
 */
const KEY_NUMPAD_6 = 102;

/**
 * @type {number}
 * @category Input
 */
const KEY_NUMPAD_7 = 103;

/**
 * @type {number}
 * @category Input
 */
const KEY_NUMPAD_8 = 104;

/**
 * @type {number}
 * @category Input
 */
const KEY_NUMPAD_9 = 105;

/**
 * @type {number}
 * @category Input
 */
const KEY_MULTIPLY = 106;

/**
 * @type {number}
 * @category Input
 */
const KEY_ADD = 107;

/**
 * @type {number}
 * @category Input
 */
const KEY_SEPARATOR = 108;

/**
 * @type {number}
 * @category Input
 */
const KEY_SUBTRACT = 109;

/**
 * @type {number}
 * @category Input
 */
const KEY_DECIMAL = 110;

/**
 * @type {number}
 * @category Input
 */
const KEY_DIVIDE = 111;

/**
 * @type {number}
 * @category Input
 */
const KEY_F1 = 112;

/**
 * @type {number}
 * @category Input
 */
const KEY_F2 = 113;

/**
 * @type {number}
 * @category Input
 */
const KEY_F3 = 114;

/**
 * @type {number}
 * @category Input
 */
const KEY_F4 = 115;

/**
 * @type {number}
 * @category Input
 */
const KEY_F5 = 116;

/**
 * @type {number}
 * @category Input
 */
const KEY_F6 = 117;

/**
 * @type {number}
 * @category Input
 */
const KEY_F7 = 118;

/**
 * @type {number}
 * @category Input
 */
const KEY_F8 = 119;

/**
 * @type {number}
 * @category Input
 */
const KEY_F9 = 120;

/**
 * @type {number}
 * @category Input
 */
const KEY_F10 = 121;

/**
 * @type {number}
 * @category Input
 */
const KEY_F11 = 122;

/**
 * @type {number}
 * @category Input
 */
const KEY_F12 = 123;

/**
 * @type {number}
 * @category Input
 */
const KEY_COMMA = 188;

/**
 * @type {number}
 * @category Input
 */
const KEY_PERIOD = 190;

/**
 * @type {number}
 * @category Input
 */
const KEY_SLASH = 191;

/**
 * @type {number}
 * @category Input
 */
const KEY_OPEN_BRACKET = 219;

/**
 * @type {number}
 * @category Input
 */
const KEY_BACK_SLASH = 220;

/**
 * @type {number}
 * @category Input
 */
const KEY_CLOSE_BRACKET = 221;

/**
 * @type {number}
 * @category Input
 */
const KEY_META = 224;

/**
 * No mouse buttons pressed.
 *
 * @type {number}
 * @category Input
 */
const MOUSEBUTTON_NONE = -1;

/**
 * The left mouse button.
 *
 * @type {number}
 * @category Input
 */
const MOUSEBUTTON_LEFT = 0;

/**
 * The middle mouse button.
 *
 * @type {number}
 * @category Input
 */
const MOUSEBUTTON_MIDDLE = 1;

/**
 * The right mouse button.
 *
 * @type {number}
 * @category Input
 */
const MOUSEBUTTON_RIGHT = 2;

/**
 * Index for pad 1.
 *
 * @type {number}
 * @category Input
 */
const PAD_1 = 0;

/**
 * Index for pad 2.
 *
 * @type {number}
 * @category Input
 */
const PAD_2 = 1;

/**
 * Index for pad 3.
 *
 * @type {number}
 * @category Input
 */
const PAD_3 = 2;

/**
 * Index for pad 4.
 *
 * @type {number}
 * @category Input
 */
const PAD_4 = 3;

/**
 * The first face button, from bottom going clockwise.
 *
 * @type {number}
 * @category Input
 */
const PAD_FACE_1 = 0;

/**
 * The second face button, from bottom going clockwise.
 *
 * @type {number}
 * @category Input
 */
const PAD_FACE_2 = 1;

/**
 * The third face button, from bottom going clockwise.
 *
 * @type {number}
 * @category Input
 */
const PAD_FACE_3 = 2;

/**
 * The fourth face button, from bottom going clockwise.
 *
 * @type {number}
 * @category Input
 */
const PAD_FACE_4 = 3;

/**
 * The first shoulder button on the left.
 *
 * @type {number}
 * @category Input
 */
const PAD_L_SHOULDER_1 = 4;

/**
 * The first shoulder button on the right.
 *
 * @type {number}
 * @category Input
 */
const PAD_R_SHOULDER_1 = 5;

/**
 * The second shoulder button on the left.
 *
 * @type {number}
 * @category Input
 */
const PAD_L_SHOULDER_2 = 6;

/**
 * The second shoulder button on the right.
 *
 * @type {number}
 * @category Input
 */
const PAD_R_SHOULDER_2 = 7;

/**
 * The select button.
 *
 * @type {number}
 * @category Input
 */
const PAD_SELECT = 8;

/**
 * The start button.
 *
 * @type {number}
 * @category Input
 */
const PAD_START = 9;

/**
 * The button when depressing the left analogue stick.
 *
 * @type {number}
 * @category Input
 */
const PAD_L_STICK_BUTTON = 10;

/**
 * The button when depressing the right analogue stick.
 *
 * @type {number}
 * @category Input
 */
const PAD_R_STICK_BUTTON = 11;

/**
 * Direction pad up.
 *
 * @type {number}
 * @category Input
 */
const PAD_UP = 12;

/**
 * Direction pad down.
 *
 * @type {number}
 * @category Input
 */
const PAD_DOWN = 13;

/**
 * Direction pad left.
 *
 * @type {number}
 * @category Input
 */
const PAD_LEFT = 14;

/**
 * Direction pad right.
 *
 * @type {number}
 * @category Input
 */
const PAD_RIGHT = 15;

/**
 * Vendor specific button.
 *
 * @type {number}
 * @category Input
 */
const PAD_VENDOR = 16;

/**
 * Horizontal axis on the left analogue stick.
 *
 * @type {number}
 * @category Input
 */
const PAD_L_STICK_X = 0;

/**
 * Vertical axis on the left analogue stick.
 *
 * @type {number}
 * @category Input
 */
const PAD_L_STICK_Y = 1;

/**
 * Horizontal axis on the right analogue stick.
 *
 * @type {number}
 * @category Input
 */
const PAD_R_STICK_X = 2;

/**
 * Vertical axis on the right analogue stick.
 *
 * @type {number}
 * @category Input
 */
const PAD_R_STICK_Y = 3;

/**
 * Name of event fired when a gamepad connects.
 *
 * @type {string}
 * @category Input
 */
const EVENT_GAMEPADCONNECTED = 'gamepadconnected';

/**
 * Name of event fired when a gamepad disconnects.
 *
 * @type {string}
 * @category Input
 */
const EVENT_GAMEPADDISCONNECTED = 'gamepaddisconnected';

/**
 * Horizontal axis on the touchpad of a XR pad.
 *
 * @type {number}
 * @category Input
 */
const XRPAD_TOUCHPAD_X = 0;

/**
 * Vertical axis on the thouchpad of a XR pad.
 *
 * @type {number}
 * @category Input
 */
const XRPAD_TOUCHPAD_Y = 1;

/**
 * Horizontal axis on the stick of a XR pad.
 *
 * @type {number}
 * @category Input
 */
const XRPAD_STICK_X = 2;

/**
 * Vertical axis on the stick of a XR pad.
 *
 * @type {number}
 * @category Input
 */
const XRPAD_STICK_Y = 3;

/**
 * The button when pressing the XR pad's touchpad.
 *
 * @type {number}
 * @category Input
 */
const XRPAD_TOUCHPAD_BUTTON = 2;

/**
 * The trigger button from XR pad.
 *
 * @type {number}
 * @category Input
 */
const XRPAD_TRIGGER = 0;

/**
 * The squeeze button from XR pad.
 *
 * @type {number}
 * @category Input
 */
const XRPAD_SQUEEZE = 1;

/**
 * The button when pressing the XR pad's stick.
 *
 * @type {number}
 * @category Input
 */
const XRPAD_STICK_BUTTON = 3;

/**
 * The A button from XR pad.
 *
 * @type {number}
 * @category Input
 */
const XRPAD_A = 4;

/**
 * The B button from XR pad.
 *
 * @type {number}
 * @category Input
 */
const XRPAD_B = 5;

export { ACTION_GAMEPAD, ACTION_KEYBOARD, ACTION_MOUSE, AXIS_KEY, AXIS_MOUSE_X, AXIS_MOUSE_Y, AXIS_PAD_L_X, AXIS_PAD_L_Y, AXIS_PAD_R_X, AXIS_PAD_R_Y, EVENT_GAMEPADCONNECTED, EVENT_GAMEPADDISCONNECTED, EVENT_KEYDOWN, EVENT_KEYUP, EVENT_MOUSEDOWN, EVENT_MOUSEMOVE, EVENT_MOUSEUP, EVENT_MOUSEWHEEL, EVENT_SELECT, EVENT_SELECTEND, EVENT_SELECTSTART, EVENT_TOUCHCANCEL, EVENT_TOUCHEND, EVENT_TOUCHMOVE, EVENT_TOUCHSTART, KEY_0, KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6, KEY_7, KEY_8, KEY_9, KEY_A, KEY_ADD, KEY_ALT, KEY_B, KEY_BACKSPACE, KEY_BACK_SLASH, KEY_C, KEY_CAPS_LOCK, KEY_CLOSE_BRACKET, KEY_COMMA, KEY_CONTEXT_MENU, KEY_CONTROL, KEY_D, KEY_DECIMAL, KEY_DELETE, KEY_DIVIDE, KEY_DOWN, KEY_E, KEY_END, KEY_ENTER, KEY_EQUAL, KEY_ESCAPE, KEY_F, KEY_F1, KEY_F10, KEY_F11, KEY_F12, KEY_F2, KEY_F3, KEY_F4, KEY_F5, KEY_F6, KEY_F7, KEY_F8, KEY_F9, KEY_G, KEY_H, KEY_HOME, KEY_I, KEY_INSERT, KEY_J, KEY_K, KEY_L, KEY_LEFT, KEY_M, KEY_META, KEY_MULTIPLY, KEY_N, KEY_NUMPAD_0, KEY_NUMPAD_1, KEY_NUMPAD_2, KEY_NUMPAD_3, KEY_NUMPAD_4, KEY_NUMPAD_5, KEY_NUMPAD_6, KEY_NUMPAD_7, KEY_NUMPAD_8, KEY_NUMPAD_9, KEY_O, KEY_OPEN_BRACKET, KEY_P, KEY_PAGE_DOWN, KEY_PAGE_UP, KEY_PAUSE, KEY_PERIOD, KEY_PRINT_SCREEN, KEY_Q, KEY_R, KEY_RETURN, KEY_RIGHT, KEY_S, KEY_SEMICOLON, KEY_SEPARATOR, KEY_SHIFT, KEY_SLASH, KEY_SPACE, KEY_SUBTRACT, KEY_T, KEY_TAB, KEY_U, KEY_UP, KEY_V, KEY_W, KEY_WINDOWS, KEY_X, KEY_Y, KEY_Z, MOUSEBUTTON_LEFT, MOUSEBUTTON_MIDDLE, MOUSEBUTTON_NONE, MOUSEBUTTON_RIGHT, PAD_1, PAD_2, PAD_3, PAD_4, PAD_DOWN, PAD_FACE_1, PAD_FACE_2, PAD_FACE_3, PAD_FACE_4, PAD_LEFT, PAD_L_SHOULDER_1, PAD_L_SHOULDER_2, PAD_L_STICK_BUTTON, PAD_L_STICK_X, PAD_L_STICK_Y, PAD_RIGHT, PAD_R_SHOULDER_1, PAD_R_SHOULDER_2, PAD_R_STICK_BUTTON, PAD_R_STICK_X, PAD_R_STICK_Y, PAD_SELECT, PAD_START, PAD_UP, PAD_VENDOR, XRPAD_A, XRPAD_B, XRPAD_SQUEEZE, XRPAD_STICK_BUTTON, XRPAD_STICK_X, XRPAD_STICK_Y, XRPAD_TOUCHPAD_BUTTON, XRPAD_TOUCHPAD_X, XRPAD_TOUCHPAD_Y, XRPAD_TRIGGER };
