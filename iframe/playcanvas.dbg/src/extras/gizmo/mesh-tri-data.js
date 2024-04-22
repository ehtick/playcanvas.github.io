import { Vec3 } from '../../core/math/vec3.js';
import { Quat } from '../../core/math/quat.js';
import { Mat4 } from '../../core/math/mat4.js';
import { Tri } from '../../core/shape/tri.js';
import { Mesh } from '../../scene/mesh.js';

// temporary variables
const tmpV1 = new Vec3();
const tmpV2 = new Vec3();
const tmpV3 = new Vec3();

/**
 * The class for holding mesh triangle data.
 *
 * @ignore
 */
class MeshTriData {
  constructor(mesh, priority = 0) {
    /**
     * The priority of the triangle data (Used for intersection ordering).
     * priority = 0 - no priority
     * priority > 0 - higher value represents a higher priority
     *
     * @type {number}
     */
    this._priority = 0;
    /**
     * The transform of the mesh.
     *
     * @type {Mat4}
     */
    this._ptm = new Mat4();
    /**
     * The array of triangles for the mesh.
     *
     * @type {Tri[]}
     */
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
