/**
 * @license
 * PlayCanvas Engine v1.63.0-dev revision 9f3635a4e (PROFILER)
 * Copyright 2011-2023 PlayCanvas Ltd. All rights reserved.
 */
var particle_billboardVS = `
		quadXY = rotate(quadXY, inAngle, rotMatrix);
		vec3 localPos = billboard(particlePos, quadXY);
`;

export { particle_billboardVS as default };
