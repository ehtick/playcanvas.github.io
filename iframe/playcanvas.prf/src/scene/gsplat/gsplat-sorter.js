import { EventHandler } from '../../core/event-handler.js';

function SortWorker() {
  const compareBits = 16;
  const bucketCount = 2 ** compareBits + 1;
  let data;
  let centers;
  let cameraPosition;
  let cameraDirection;
  let intIndices;
  const lastCameraPosition = {
    x: 0,
    y: 0,
    z: 0
  };
  const lastCameraDirection = {
    x: 0,
    y: 0,
    z: 0
  };
  const boundMin = {
    x: 0,
    y: 0,
    z: 0
  };
  const boundMax = {
    x: 0,
    y: 0,
    z: 0
  };
  let distances;
  let indices;
  let target;
  let countBuffer;
  const update = () => {
    var _distances;
    if (!centers || !data || !cameraPosition || !cameraDirection) return;
    const px = cameraPosition.x;
    const py = cameraPosition.y;
    const pz = cameraPosition.z;
    const dx = cameraDirection.x;
    const dy = cameraDirection.y;
    const dz = cameraDirection.z;
    const epsilon = 0.001;
    if (Math.abs(px - lastCameraPosition.x) < epsilon && Math.abs(py - lastCameraPosition.y) < epsilon && Math.abs(pz - lastCameraPosition.z) < epsilon && Math.abs(dx - lastCameraDirection.x) < epsilon && Math.abs(dy - lastCameraDirection.y) < epsilon && Math.abs(dz - lastCameraDirection.z) < epsilon) {
      return;
    }
    lastCameraPosition.x = px;
    lastCameraPosition.y = py;
    lastCameraPosition.z = pz;
    lastCameraDirection.x = dx;
    lastCameraDirection.y = dy;
    lastCameraDirection.z = dz;
    const numVertices = centers.length / 3;
    if (((_distances = distances) == null ? void 0 : _distances.length) !== numVertices) {
      distances = new Uint32Array(numVertices);
      indices = new Uint32Array(numVertices);
      target = new Float32Array(numVertices * 4);
    }
    let minDist;
    let maxDist;
    for (let i = 0; i < 8; ++i) {
      const x = i & 1 ? boundMin.x : boundMax.x;
      const y = i & 2 ? boundMin.y : boundMax.y;
      const z = i & 4 ? boundMin.z : boundMax.z;
      const d = (x - px) * dx + (y - py) * dy + (z - pz) * dz;
      if (i === 0) {
        minDist = maxDist = d;
      } else {
        minDist = Math.min(minDist, d);
        maxDist = Math.max(maxDist, d);
      }
    }
    if (!countBuffer) countBuffer = new Uint32Array(bucketCount);
    for (let i = 0; i < bucketCount; i++) countBuffer[i] = 0;
    const range = maxDist - minDist;
    const divider = 1 / range * 2 ** compareBits;
    for (let i = 0; i < numVertices; ++i) {
      const istride = i * 3;
      const d = (centers[istride + 0] - px) * dx + (centers[istride + 1] - py) * dy + (centers[istride + 2] - pz) * dz;
      const sortKey = Math.floor((d - minDist) * divider);
      distances[i] = sortKey;
      indices[i] = i;
      countBuffer[sortKey]++;
    }
    for (let i = 1; i < bucketCount; i++) countBuffer[i] += countBuffer[i - 1];
    const outputArray = intIndices ? new Uint32Array(target.buffer) : target;
    const offset = intIndices ? 0 : 0.2;
    for (let i = numVertices - 1; i >= 0; i--) {
      const distance = distances[i];
      const index = indices[i];
      let destIndex = countBuffer[distance] - 1;
      destIndex *= 4;
      const splatIndex = index + offset;
      outputArray[destIndex] = splatIndex;
      outputArray[destIndex + 1] = splatIndex;
      outputArray[destIndex + 2] = splatIndex;
      outputArray[destIndex + 3] = splatIndex;
      countBuffer[distance]--;
    }
    const tmp = data;
    data = target;
    target = tmp;
    self.postMessage({
      data: data.buffer
    }, [data.buffer]);
    data = null;
  };
  self.onmessage = message => {
    if (message.data.data) {
      data = new Float32Array(message.data.data);
    }
    if (message.data.centers) {
      centers = new Float32Array(message.data.centers);
      boundMin.x = boundMax.x = centers[0];
      boundMin.y = boundMax.y = centers[1];
      boundMin.z = boundMax.z = centers[2];
      const numVertices = centers.length / 3;
      for (let i = 1; i < numVertices; ++i) {
        const x = centers[i * 3 + 0];
        const y = centers[i * 3 + 1];
        const z = centers[i * 3 + 2];
        boundMin.x = Math.min(boundMin.x, x);
        boundMin.y = Math.min(boundMin.y, y);
        boundMin.z = Math.min(boundMin.z, z);
        boundMax.x = Math.max(boundMax.x, x);
        boundMax.y = Math.max(boundMax.y, y);
        boundMax.z = Math.max(boundMax.z, z);
      }
    }
    if (message.data.intIndices) {
      intIndices = message.data.intIndices;
    }
    if (message.data.cameraPosition) cameraPosition = message.data.cameraPosition;
    if (message.data.cameraDirection) cameraDirection = message.data.cameraDirection;
    update();
  };
}
class GSplatSorter extends EventHandler {
  constructor() {
    super();
    this.worker = void 0;
    this.vertexBuffer = void 0;
    this.worker = new Worker(URL.createObjectURL(new Blob([`(${SortWorker.toString()})()`], {
      type: 'application/javascript'
    })));
    this.worker.onmessage = message => {
      const newData = message.data.data;
      const oldData = this.vertexBuffer.storage;
      this.worker.postMessage({
        data: oldData
      }, [oldData]);
      setTimeout(() => {
        this.vertexBuffer.setData(newData);
        this.fire('updated');
      });
    };
  }
  destroy() {
    this.worker.terminate();
    this.worker = null;
  }
  init(vertexBuffer, centers, intIndices) {
    this.vertexBuffer = vertexBuffer;
    const buf = vertexBuffer.storage.slice(0);
    this.worker.postMessage({
      data: buf,
      centers: centers.buffer,
      intIndices: intIndices
    }, [buf, centers.buffer]);
  }
  setCamera(pos, dir) {
    this.worker.postMessage({
      cameraPosition: {
        x: pos.x,
        y: pos.y,
        z: pos.z
      },
      cameraDirection: {
        x: dir.x,
        y: dir.y,
        z: dir.z
      }
    });
  }
}

export { GSplatSorter };
