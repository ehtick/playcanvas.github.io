/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
const BLEND_SUBTRACTIVE = 0;
const BLEND_ADDITIVE = 1;
const BLEND_NORMAL = 2;
const BLEND_NONE = 3;
const BLEND_PREMULTIPLIED = 4;
const BLEND_MULTIPLICATIVE = 5;
const BLEND_ADDITIVEALPHA = 6;
const BLEND_MULTIPLICATIVE2X = 7;
const BLEND_SCREEN = 8;
const BLEND_MIN = 9;
const BLEND_MAX = 10;
const FOG_NONE = 'none';
const FOG_LINEAR = 'linear';
const FOG_EXP = 'exp';
const FOG_EXP2 = 'exp2';
const FRESNEL_NONE = 0;
const FRESNEL_SCHLICK = 2;
const LAYER_HUD = 0;
const LAYER_GIZMO = 1;
const LAYER_FX = 2;
const LAYER_WORLD = 15;
const LAYERID_WORLD = 0;
const LAYERID_DEPTH = 1;
const LAYERID_SKYBOX = 2;
const LAYERID_IMMEDIATE = 3;
const LAYERID_UI = 4;
const LIGHTTYPE_DIRECTIONAL = 0;
const LIGHTTYPE_OMNI = 1;
const LIGHTTYPE_POINT = LIGHTTYPE_OMNI;
const LIGHTTYPE_SPOT = 2;
const LIGHTTYPE_COUNT = 3;
const LIGHTSHAPE_PUNCTUAL = 0;
const LIGHTSHAPE_RECT = 1;
const LIGHTSHAPE_DISK = 2;
const LIGHTSHAPE_SPHERE = 3;
const LIGHTFALLOFF_LINEAR = 0;
const LIGHTFALLOFF_INVERSESQUARED = 1;
const SHADOW_PCF3 = 0;
const SHADOW_DEPTH = 0;
const SHADOW_VSM8 = 1;
const SHADOW_VSM16 = 2;
const SHADOW_VSM32 = 3;
const SHADOW_PCF5 = 4;
const SHADOW_PCF1 = 5;
const SHADOW_COUNT = 6;
const shadowTypeToString = {};
shadowTypeToString[SHADOW_PCF3] = 'PCF3';
shadowTypeToString[SHADOW_VSM8] = 'VSM8';
shadowTypeToString[SHADOW_VSM16] = 'VSM16';
shadowTypeToString[SHADOW_VSM32] = 'VSM32';
shadowTypeToString[SHADOW_PCF5] = 'PCF5';
shadowTypeToString[SHADOW_PCF1] = 'PCF1';
const BLUR_BOX = 0;
const BLUR_GAUSSIAN = 1;
const PARTICLESORT_NONE = 0;
const PARTICLESORT_DISTANCE = 1;
const PARTICLESORT_NEWER_FIRST = 2;
const PARTICLESORT_OLDER_FIRST = 3;
const PARTICLEMODE_GPU = 0;
const PARTICLEMODE_CPU = 1;
const EMITTERSHAPE_BOX = 0;
const EMITTERSHAPE_SPHERE = 1;
const PARTICLEORIENTATION_SCREEN = 0;
const PARTICLEORIENTATION_WORLD = 1;
const PARTICLEORIENTATION_EMITTER = 2;
const PROJECTION_PERSPECTIVE = 0;
const PROJECTION_ORTHOGRAPHIC = 1;
const RENDERSTYLE_SOLID = 0;
const RENDERSTYLE_WIREFRAME = 1;
const RENDERSTYLE_POINTS = 2;
const CUBEPROJ_NONE = 0;
const CUBEPROJ_BOX = 1;
const SPECULAR_PHONG = 0;
const SPECULAR_BLINN = 1;
const DETAILMODE_MUL = 'mul';
const DETAILMODE_ADD = 'add';
const DETAILMODE_SCREEN = 'screen';
const DETAILMODE_OVERLAY = 'overlay';
const DETAILMODE_MIN = 'min';
const DETAILMODE_MAX = 'max';
const GAMMA_NONE = 0;
const GAMMA_SRGB = 1;
const GAMMA_SRGBFAST = 2;
const GAMMA_SRGBHDR = 3;
const TONEMAP_LINEAR = 0;
const TONEMAP_FILMIC = 1;
const TONEMAP_HEJL = 2;
const TONEMAP_ACES = 3;
const TONEMAP_ACES2 = 4;
const SPECOCC_NONE = 0;
const SPECOCC_AO = 1;
const SPECOCC_GLOSSDEPENDENT = 2;
const SHADERDEF_NOSHADOW = 1;
const SHADERDEF_SKIN = 2;
const SHADERDEF_UV0 = 4;
const SHADERDEF_UV1 = 8;
const SHADERDEF_VCOLOR = 16;
const SHADERDEF_INSTANCING = 32;
const SHADERDEF_LM = 64;
const SHADERDEF_DIRLM = 128;
const SHADERDEF_SCREENSPACE = 256;
const SHADERDEF_TANGENTS = 512;
const SHADERDEF_MORPH_POSITION = 1024;
const SHADERDEF_MORPH_NORMAL = 2048;
const SHADERDEF_MORPH_TEXTURE_BASED = 4096;
const SHADERDEF_LMAMBIENT = 8192;
const LINEBATCH_WORLD = 0;
const LINEBATCH_OVERLAY = 1;
const LINEBATCH_GIZMO = 2;
const SHADOWUPDATE_NONE = 0;
const SHADOWUPDATE_THISFRAME = 1;
const SHADOWUPDATE_REALTIME = 2;
const SORTKEY_FORWARD = 0;
const SORTKEY_DEPTH = 1;
const MASK_AFFECT_DYNAMIC = 1;
const MASK_AFFECT_LIGHTMAPPED = 2;
const MASK_BAKE = 4;
const SHADER_FORWARD = 0;
const SHADER_FORWARDHDR = 1;
const SHADER_DEPTH = 2;
const SHADER_PICK = 3;
const SHADER_SHADOW = 4;
const SHADERTYPE_FORWARD = 'forward';
const SHADERTYPE_DEPTH = 'depth';
const SHADERTYPE_PICK = 'pick';
const SHADERTYPE_SHADOW = 'shadow';
const SPRITE_RENDERMODE_SIMPLE = 0;
const SPRITE_RENDERMODE_SLICED = 1;
const SPRITE_RENDERMODE_TILED = 2;
const BAKE_COLOR = 0;
const BAKE_COLORDIR = 1;
const VIEW_CENTER = 0;
const VIEW_LEFT = 1;
const VIEW_RIGHT = 2;
const SORTMODE_NONE = 0;
const SORTMODE_MANUAL = 1;
const SORTMODE_MATERIALMESH = 2;
const SORTMODE_BACK2FRONT = 3;
const SORTMODE_FRONT2BACK = 4;
const SORTMODE_CUSTOM = 5;
const COMPUPDATED_INSTANCES = 1;
const COMPUPDATED_LIGHTS = 2;
const COMPUPDATED_CAMERAS = 4;
const COMPUPDATED_BLEND = 8;
const ASPECT_AUTO = 0;
const ASPECT_MANUAL = 1;
const ORIENTATION_HORIZONTAL = 0;
const ORIENTATION_VERTICAL = 1;

export { ASPECT_AUTO, ASPECT_MANUAL, BAKE_COLOR, BAKE_COLORDIR, BLEND_ADDITIVE, BLEND_ADDITIVEALPHA, BLEND_MAX, BLEND_MIN, BLEND_MULTIPLICATIVE, BLEND_MULTIPLICATIVE2X, BLEND_NONE, BLEND_NORMAL, BLEND_PREMULTIPLIED, BLEND_SCREEN, BLEND_SUBTRACTIVE, BLUR_BOX, BLUR_GAUSSIAN, COMPUPDATED_BLEND, COMPUPDATED_CAMERAS, COMPUPDATED_INSTANCES, COMPUPDATED_LIGHTS, CUBEPROJ_BOX, CUBEPROJ_NONE, DETAILMODE_ADD, DETAILMODE_MAX, DETAILMODE_MIN, DETAILMODE_MUL, DETAILMODE_OVERLAY, DETAILMODE_SCREEN, EMITTERSHAPE_BOX, EMITTERSHAPE_SPHERE, FOG_EXP, FOG_EXP2, FOG_LINEAR, FOG_NONE, FRESNEL_NONE, FRESNEL_SCHLICK, GAMMA_NONE, GAMMA_SRGB, GAMMA_SRGBFAST, GAMMA_SRGBHDR, LAYERID_DEPTH, LAYERID_IMMEDIATE, LAYERID_SKYBOX, LAYERID_UI, LAYERID_WORLD, LAYER_FX, LAYER_GIZMO, LAYER_HUD, LAYER_WORLD, LIGHTFALLOFF_INVERSESQUARED, LIGHTFALLOFF_LINEAR, LIGHTSHAPE_DISK, LIGHTSHAPE_PUNCTUAL, LIGHTSHAPE_RECT, LIGHTSHAPE_SPHERE, LIGHTTYPE_COUNT, LIGHTTYPE_DIRECTIONAL, LIGHTTYPE_OMNI, LIGHTTYPE_POINT, LIGHTTYPE_SPOT, LINEBATCH_GIZMO, LINEBATCH_OVERLAY, LINEBATCH_WORLD, MASK_AFFECT_DYNAMIC, MASK_AFFECT_LIGHTMAPPED, MASK_BAKE, ORIENTATION_HORIZONTAL, ORIENTATION_VERTICAL, PARTICLEMODE_CPU, PARTICLEMODE_GPU, PARTICLEORIENTATION_EMITTER, PARTICLEORIENTATION_SCREEN, PARTICLEORIENTATION_WORLD, PARTICLESORT_DISTANCE, PARTICLESORT_NEWER_FIRST, PARTICLESORT_NONE, PARTICLESORT_OLDER_FIRST, PROJECTION_ORTHOGRAPHIC, PROJECTION_PERSPECTIVE, RENDERSTYLE_POINTS, RENDERSTYLE_SOLID, RENDERSTYLE_WIREFRAME, SHADERDEF_DIRLM, SHADERDEF_INSTANCING, SHADERDEF_LM, SHADERDEF_LMAMBIENT, SHADERDEF_MORPH_NORMAL, SHADERDEF_MORPH_POSITION, SHADERDEF_MORPH_TEXTURE_BASED, SHADERDEF_NOSHADOW, SHADERDEF_SCREENSPACE, SHADERDEF_SKIN, SHADERDEF_TANGENTS, SHADERDEF_UV0, SHADERDEF_UV1, SHADERDEF_VCOLOR, SHADERTYPE_DEPTH, SHADERTYPE_FORWARD, SHADERTYPE_PICK, SHADERTYPE_SHADOW, SHADER_DEPTH, SHADER_FORWARD, SHADER_FORWARDHDR, SHADER_PICK, SHADER_SHADOW, SHADOWUPDATE_NONE, SHADOWUPDATE_REALTIME, SHADOWUPDATE_THISFRAME, SHADOW_COUNT, SHADOW_DEPTH, SHADOW_PCF1, SHADOW_PCF3, SHADOW_PCF5, SHADOW_VSM16, SHADOW_VSM32, SHADOW_VSM8, SORTKEY_DEPTH, SORTKEY_FORWARD, SORTMODE_BACK2FRONT, SORTMODE_CUSTOM, SORTMODE_FRONT2BACK, SORTMODE_MANUAL, SORTMODE_MATERIALMESH, SORTMODE_NONE, SPECOCC_AO, SPECOCC_GLOSSDEPENDENT, SPECOCC_NONE, SPECULAR_BLINN, SPECULAR_PHONG, SPRITE_RENDERMODE_SIMPLE, SPRITE_RENDERMODE_SLICED, SPRITE_RENDERMODE_TILED, TONEMAP_ACES, TONEMAP_ACES2, TONEMAP_FILMIC, TONEMAP_HEJL, TONEMAP_LINEAR, VIEW_CENTER, VIEW_LEFT, VIEW_RIGHT, shadowTypeToString };
