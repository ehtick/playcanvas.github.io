/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
class ChunkBuilder {
  constructor() {
    this.code = '';
  }
  append(...chunks) {
    chunks.forEach(chunk => {
      if (chunk.endsWith('\n')) {
        this.code += chunk;
      } else {
        this.code += chunk + '\n';
      }
    });
  }
  prepend(...chunks) {
    chunks.forEach(chunk => {
      if (chunk.endsWith('\n')) {
        this.code = chunk + this.code;
      } else {
        this.code = chunk + '\n' + this.code;
      }
    });
  }
}

export { ChunkBuilder };
