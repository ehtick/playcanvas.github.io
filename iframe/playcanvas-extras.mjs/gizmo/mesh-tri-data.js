/**
 * @license
 * PlayCanvas Engine v0.0.0 revision 2a805ddb9
 * Copyright 2011-2024 PlayCanvas Ltd. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Vec3, Mat4, Quat, Mesh } from 'playcanvas';
import { Tri } from './tri.js';

const tmpV1 = new Vec3();
const tmpV2 = new Vec3();
const tmpV3 = new Vec3();
class MeshTriData {
  constructor(mesh, priority = 0) {
    this._priority = 0;
    this._ptm = new Mat4();
    this.tris = void 0;
    this.setTris(mesh);
    this._priority = priority;
  }
  get ptm() {
    return this._ptm;
  }
  get priority() {
    return this._priority;
  }
  _trisFromMesh(mesh, destroy = true) {
    const tris = [];
    const pos = [];
    const indices = [];
    mesh.getPositions(pos);
    mesh.getIndices(indices);
    if (destroy) {
      mesh.destroy();
    }
    for (let k = 0; k < indices.length; k += 3) {
      const i1 = indices[k];
      const i2 = indices[k + 1];
      const i3 = indices[k + 2];
      tmpV1.set(pos[i1 * 3], pos[i1 * 3 + 1], pos[i1 * 3 + 2]);
      tmpV2.set(pos[i2 * 3], pos[i2 * 3 + 1], pos[i2 * 3 + 2]);
      tmpV3.set(pos[i3 * 3], pos[i3 * 3 + 1], pos[i3 * 3 + 2]);
      const tri = new Tri(tmpV1, tmpV2, tmpV3);
      tris.push(tri);
    }
    return tris;
  }
  setTransform(pos = new Vec3(), rot = new Quat(), scale = new Vec3()) {
    this.ptm.setTRS(pos, rot, scale);
  }
  setTris(mesh) {
    if (!mesh || !(mesh instanceof Mesh)) {
      throw new Error('No mesh provided.');
    }
    this.tris = this._trisFromMesh(mesh);
  }
}

export { MeshTriData };
