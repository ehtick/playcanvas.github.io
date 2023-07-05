import { LIGHTTYPE_DIRECTIONAL } from '../../constants.js';
import { hashCode } from '../../../core/hash.js';
import { ChunkBuilder } from '../chunk-builder.js';
import { LitShader } from './lit-shader.js';

const custom = {
  /** @type { Function } */
  generateKey: function (options) {
    for (const prop in options) {
      if (options.hasOwnProperty(prop) && prop !== "chunks" && prop !== "lights") ;
    }
    let key = "custom";
    if (options.chunks) {
      const chunks = [];
      for (const p in options.chunks) {
        if (options.chunks.hasOwnProperty(p)) {
          chunks.push(p + options.chunks[p]);
        }
      }
      chunks.sort();
      key += chunks;
    }
    if (options.litOptions) {
      for (const m in options.litOptions) {
        // handle lights in a custom way
        if (m === 'lights') {
          const isClustered = options.litOptions.clusteredLightingEnabled;
          for (let i = 0; i < options.litOptions.lights.length; i++) {
            const light = options.litOptions.lights[i];
            if (!isClustered || light._type === LIGHTTYPE_DIRECTIONAL) {
              key += light.key;
            }
          }
        } else {
          key += m + options.litOptions[m];
        }
      }
    }
    return hashCode(key);
  },
  /**
   * @param {import('../../../platform/graphics/graphics-device.js').GraphicsDevice} device - The
   * graphics device.
   * @param {object} options - The lit options to be passed to the backend.
   * @returns {object} Returns the created shader definition.
   * @ignore
   */
  createShaderDefinition: function (device, options) {
    const litShader = new LitShader(device, options.litOptions);
    const decl = new ChunkBuilder();
    const code = new ChunkBuilder();
    const func = new ChunkBuilder();

    // global texture bias for standard textures
    decl.append(`uniform float textureBias;`);
    decl.append(litShader.chunks.litShaderArgsPS);
    code.append(options.customLitArguments);
    func.code = `LitShaderArguments litShaderArgs = evaluateFrontend();`;
    func.code = `\n${func.code.split('\n').map(l => `    ${l}`).join('\n')}\n\n`;
    const useUv = [];
    const useUnmodifiedUv = [];
    const mapTransforms = [];
    litShader.generateVertexShader(useUv, useUnmodifiedUv, mapTransforms);
    litShader.generateFragmentShader(decl.code, code.code, func.code, "vUv0");
    return litShader.getDefinition();
  }
};

export { custom };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2NlbmUvc2hhZGVyLWxpYi9wcm9ncmFtcy9jdXN0b20uanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTElHSFRUWVBFX0RJUkVDVElPTkFMIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmUvY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IGhhc2hDb2RlIH0gZnJvbSAnLi4vLi4vLi4vY29yZS9oYXNoLmpzJztcbmltcG9ydCB7IENodW5rQnVpbGRlciB9IGZyb20gJy4uL2NodW5rLWJ1aWxkZXIuanMnO1xuaW1wb3J0IHsgTGl0U2hhZGVyIH0gZnJvbSAnLi9saXQtc2hhZGVyLmpzJztcblxuY29uc3QgY3VzdG9tICA9IHtcblxuICAgIC8qKiBAdHlwZSB7IEZ1bmN0aW9uIH0gKi9cbiAgICBnZW5lcmF0ZUtleTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgcHJvcHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBwcm9wIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KHByb3ApICYmIHByb3AgIT09IFwiY2h1bmtzXCIgJiYgcHJvcCAhPT0gXCJsaWdodHNcIilcbiAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGtleSA9IFwiY3VzdG9tXCI7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuY2h1bmtzKSB7XG4gICAgICAgICAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcCBpbiBvcHRpb25zLmNodW5rcykge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNodW5rcy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuICAgICAgICAgICAgICAgICAgICBjaHVua3MucHVzaChwICsgb3B0aW9ucy5jaHVua3NbcF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNodW5rcy5zb3J0KCk7XG4gICAgICAgICAgICBrZXkgKz0gY2h1bmtzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubGl0T3B0aW9ucykge1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG0gaW4gb3B0aW9ucy5saXRPcHRpb25zKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBoYW5kbGUgbGlnaHRzIGluIGEgY3VzdG9tIHdheVxuICAgICAgICAgICAgICAgIGlmIChtID09PSAnbGlnaHRzJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc0NsdXN0ZXJlZCA9IG9wdGlvbnMubGl0T3B0aW9ucy5jbHVzdGVyZWRMaWdodGluZ0VuYWJsZWQ7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5saXRPcHRpb25zLmxpZ2h0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGlnaHQgPSBvcHRpb25zLmxpdE9wdGlvbnMubGlnaHRzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0NsdXN0ZXJlZCB8fCBsaWdodC5fdHlwZSA9PT0gTElHSFRUWVBFX0RJUkVDVElPTkFMKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5ICs9IGxpZ2h0LmtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSArPSBtICsgb3B0aW9ucy5saXRPcHRpb25zW21dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoYXNoQ29kZShrZXkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge2ltcG9ydCgnLi4vLi4vLi4vcGxhdGZvcm0vZ3JhcGhpY3MvZ3JhcGhpY3MtZGV2aWNlLmpzJykuR3JhcGhpY3NEZXZpY2V9IGRldmljZSAtIFRoZVxuICAgICAqIGdyYXBoaWNzIGRldmljZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIFRoZSBsaXQgb3B0aW9ucyB0byBiZSBwYXNzZWQgdG8gdGhlIGJhY2tlbmQuXG4gICAgICogQHJldHVybnMge29iamVjdH0gUmV0dXJucyB0aGUgY3JlYXRlZCBzaGFkZXIgZGVmaW5pdGlvbi5cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgY3JlYXRlU2hhZGVyRGVmaW5pdGlvbjogZnVuY3Rpb24gKGRldmljZSwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBsaXRTaGFkZXIgPSBuZXcgTGl0U2hhZGVyKGRldmljZSwgb3B0aW9ucy5saXRPcHRpb25zKTtcblxuICAgICAgICBjb25zdCBkZWNsID0gbmV3IENodW5rQnVpbGRlcigpO1xuICAgICAgICBjb25zdCBjb2RlID0gbmV3IENodW5rQnVpbGRlcigpO1xuICAgICAgICBjb25zdCBmdW5jID0gbmV3IENodW5rQnVpbGRlcigpO1xuXG4gICAgICAgIC8vIGdsb2JhbCB0ZXh0dXJlIGJpYXMgZm9yIHN0YW5kYXJkIHRleHR1cmVzXG4gICAgICAgIGRlY2wuYXBwZW5kKGB1bmlmb3JtIGZsb2F0IHRleHR1cmVCaWFzO2ApO1xuXG4gICAgICAgIGRlY2wuYXBwZW5kKGxpdFNoYWRlci5jaHVua3MubGl0U2hhZGVyQXJnc1BTKTtcbiAgICAgICAgY29kZS5hcHBlbmQob3B0aW9ucy5jdXN0b21MaXRBcmd1bWVudHMpO1xuICAgICAgICBmdW5jLmNvZGUgPSBgTGl0U2hhZGVyQXJndW1lbnRzIGxpdFNoYWRlckFyZ3MgPSBldmFsdWF0ZUZyb250ZW5kKCk7YDtcblxuICAgICAgICBmdW5jLmNvZGUgPSBgXFxuJHtmdW5jLmNvZGUuc3BsaXQoJ1xcbicpLm1hcChsID0+IGAgICAgJHtsfWApLmpvaW4oJ1xcbicpfVxcblxcbmA7XG4gICAgICAgIGNvbnN0IHVzZVV2ID0gW107XG4gICAgICAgIGNvbnN0IHVzZVVubW9kaWZpZWRVdiA9IFtdO1xuICAgICAgICBjb25zdCBtYXBUcmFuc2Zvcm1zID0gW107XG4gICAgICAgIGxpdFNoYWRlci5nZW5lcmF0ZVZlcnRleFNoYWRlcih1c2VVdiwgdXNlVW5tb2RpZmllZFV2LCBtYXBUcmFuc2Zvcm1zKTtcbiAgICAgICAgbGl0U2hhZGVyLmdlbmVyYXRlRnJhZ21lbnRTaGFkZXIoZGVjbC5jb2RlLCBjb2RlLmNvZGUsIGZ1bmMuY29kZSwgXCJ2VXYwXCIpO1xuXG4gICAgICAgIHJldHVybiBsaXRTaGFkZXIuZ2V0RGVmaW5pdGlvbigpO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7IGN1c3RvbSB9O1xuIl0sIm5hbWVzIjpbImN1c3RvbSIsImdlbmVyYXRlS2V5Iiwib3B0aW9ucyIsInByb3AiLCJoYXNPd25Qcm9wZXJ0eSIsInByb3BzIiwia2V5IiwiY2h1bmtzIiwicCIsInB1c2giLCJzb3J0IiwibGl0T3B0aW9ucyIsIm0iLCJpc0NsdXN0ZXJlZCIsImNsdXN0ZXJlZExpZ2h0aW5nRW5hYmxlZCIsImkiLCJsaWdodHMiLCJsZW5ndGgiLCJsaWdodCIsIl90eXBlIiwiTElHSFRUWVBFX0RJUkVDVElPTkFMIiwiaGFzaENvZGUiLCJjcmVhdGVTaGFkZXJEZWZpbml0aW9uIiwiZGV2aWNlIiwibGl0U2hhZGVyIiwiTGl0U2hhZGVyIiwiZGVjbCIsIkNodW5rQnVpbGRlciIsImNvZGUiLCJmdW5jIiwiYXBwZW5kIiwibGl0U2hhZGVyQXJnc1BTIiwiY3VzdG9tTGl0QXJndW1lbnRzIiwic3BsaXQiLCJtYXAiLCJsIiwiam9pbiIsInVzZVV2IiwidXNlVW5tb2RpZmllZFV2IiwibWFwVHJhbnNmb3JtcyIsImdlbmVyYXRlVmVydGV4U2hhZGVyIiwiZ2VuZXJhdGVGcmFnbWVudFNoYWRlciIsImdldERlZmluaXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7O0FBS0EsTUFB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
