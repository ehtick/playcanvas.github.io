/**
 * @license
 * PlayCanvas Engine v1.59.0-preview revision 797466563 (DEBUG PROFILER)
 * Copyright 2011-2022 PlayCanvas Ltd. All rights reserved.
 */
const TRACEID_RENDER_FRAME = 'RenderFrame';

const TRACEID_RENDER_PASS = 'RenderPass';

const TRACEID_RENDER_PASS_DETAIL = 'RenderPassDetail';

const TRACEID_RENDER_ACTION = 'RenderAction';

const TRACEID_RENDER_TARGET_ALLOC = 'RenderTargetAlloc';

const TRACEID_TEXTURE_ALLOC = 'TextureAlloc';

const TRACEID_SHADER_ALLOC = 'ShaderAlloc';

const TRACEID_SHADER_COMPILE = 'ShaderCompile';

const TRACEID_VRAM_TEXTURE = 'VRAM.Texture';

const TRACEID_VRAM_VB = 'VRAM.Vb';

const TRACEID_VRAM_IB = 'VRAM.Ib';

const TRACEID_BINDGROUP_ALLOC = 'BindGroupAlloc';

const TRACEID_BINDGROUPFORMAT_ALLOC = 'BindGroupFormatAlloc';

const TRACEID_RENDERPIPELINE_ALLOC = 'RenderPipelineAlloc';

const TRACEID_PIPELINELAYOUT_ALLOC = 'PipelineLayoutAlloc';

export { TRACEID_BINDGROUPFORMAT_ALLOC, TRACEID_BINDGROUP_ALLOC, TRACEID_PIPELINELAYOUT_ALLOC, TRACEID_RENDERPIPELINE_ALLOC, TRACEID_RENDER_ACTION, TRACEID_RENDER_FRAME, TRACEID_RENDER_PASS, TRACEID_RENDER_PASS_DETAIL, TRACEID_RENDER_TARGET_ALLOC, TRACEID_SHADER_ALLOC, TRACEID_SHADER_COMPILE, TRACEID_TEXTURE_ALLOC, TRACEID_VRAM_IB, TRACEID_VRAM_TEXTURE, TRACEID_VRAM_VB };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9jb25zdGFudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBMb2dzIGEgZnJhbWUgbnVtYmVyLlxuICpcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBUUkFDRUlEX1JFTkRFUl9GUkFNRSA9ICdSZW5kZXJGcmFtZSc7XG5cbi8qKlxuICogTG9ncyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCBnZW5lcmF0ZWQgcmVuZGVyIHBhc3Nlcy5cbiAqXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgVFJBQ0VJRF9SRU5ERVJfUEFTUyA9ICdSZW5kZXJQYXNzJztcblxuLyoqXG4gKiBMb2dzIGFkZGl0aW9uYWwgZGV0YWlsIGZvciByZW5kZXIgcGFzc2VzLlxuICpcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBUUkFDRUlEX1JFTkRFUl9QQVNTX0RFVEFJTCA9ICdSZW5kZXJQYXNzRGV0YWlsJztcblxuLyoqXG4gKiBMb2dzIHJlbmRlciBhY3Rpb25zIGNyZWF0ZWQgYnkgdGhlIGxheWVyIGNvbXBvc2l0aW9uLiBPbmx5IGV4ZWN1dGVzIHdoZW4gdGhlXG4gKiBsYXllciBjb21wb3NpdGlvbiBjaGFuZ2VzLlxuICpcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBUUkFDRUlEX1JFTkRFUl9BQ1RJT04gPSAnUmVuZGVyQWN0aW9uJztcblxuLyoqXG4gKiBMb2dzIHRoZSBhbGxvY2F0aW9uIG9mIHJlbmRlciB0YXJnZXRzLlxuICpcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBUUkFDRUlEX1JFTkRFUl9UQVJHRVRfQUxMT0MgPSAnUmVuZGVyVGFyZ2V0QWxsb2MnO1xuXG4vKipcbiAqIExvZ3MgdGhlIGFsbG9jYXRpb24gb2YgdGV4dHVyZXMuXG4gKlxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFRSQUNFSURfVEVYVFVSRV9BTExPQyA9ICdUZXh0dXJlQWxsb2MnO1xuXG4vKipcbiAqIExvZ3MgdGhlIGNyZWF0aW9uIG9mIHNoYWRlcnMuXG4gKlxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFRSQUNFSURfU0hBREVSX0FMTE9DID0gJ1NoYWRlckFsbG9jJztcblxuLyoqXG4gKiBMb2dzIHRoZSBjb21waWxhdGlvbiB0aW1lIG9mIHNoYWRlcnMuXG4gKlxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFRSQUNFSURfU0hBREVSX0NPTVBJTEUgPSAnU2hhZGVyQ29tcGlsZSc7XG5cbi8qKlxuICogTG9ncyB0aGUgdnJhbSB1c2UgYnkgdGhlIHRleHR1cmVzLlxuICpcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBUUkFDRUlEX1ZSQU1fVEVYVFVSRSA9ICdWUkFNLlRleHR1cmUnO1xuXG4vKipcbiAqIExvZ3MgdGhlIHZyYW0gdXNlIGJ5IHRoZSB2ZXJ0ZXggYnVmZmVycy5cbiAqXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgVFJBQ0VJRF9WUkFNX1ZCID0gJ1ZSQU0uVmInO1xuXG4vKipcbiAqIExvZ3MgdGhlIHZyYW0gdXNlIGJ5IHRoZSBpbmRleCBidWZmZXJzLlxuICpcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBUUkFDRUlEX1ZSQU1fSUIgPSAnVlJBTS5JYic7XG5cbi8qKlxuICogTG9ncyB0aGUgY3JlYXRpb24gb2YgYmluZCBncm91cHMuXG4gKlxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFRSQUNFSURfQklOREdST1VQX0FMTE9DID0gJ0JpbmRHcm91cEFsbG9jJztcblxuLyoqXG4gKiBMb2dzIHRoZSBjcmVhdGlvbiBvZiBiaW5kIGdyb3VwIGZvcm1hdHMuXG4gKlxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFRSQUNFSURfQklOREdST1VQRk9STUFUX0FMTE9DID0gJ0JpbmRHcm91cEZvcm1hdEFsbG9jJztcblxuLyoqXG4gKiBMb2dzIHRoZSBjcmVhdGlvbiBvZiByZW5kZXIgcGlwZWxpbmVzLiBXZWJCUFUgb25seS5cbiAqXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgVFJBQ0VJRF9SRU5ERVJQSVBFTElORV9BTExPQyA9ICdSZW5kZXJQaXBlbGluZUFsbG9jJztcblxuLyoqXG4gKiBMb2dzIHRoZSBjcmVhdGlvbiBvZiBwaXBlbGluZSBsYXlvdXRzLiBXZWJCUFUgb25seS5cbiAqXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgVFJBQ0VJRF9QSVBFTElORUxBWU9VVF9BTExPQyA9ICdQaXBlbGluZUxheW91dEFsbG9jJztcbiJdLCJuYW1lcyI6WyJUUkFDRUlEX1JFTkRFUl9GUkFNRSIsIlRSQUNFSURfUkVOREVSX1BBU1MiLCJUUkFDRUlEX1JFTkRFUl9QQVNTX0RFVEFJTCIsIlRSQUNFSURfUkVOREVSX0FDVElPTiIsIlRSQUNFSURfUkVOREVSX1RBUkdFVF9BTExPQyIsIlRSQUNFSURfVEVYVFVSRV9BTExPQyIsIlRSQUNFSURfU0hBREVSX0FMTE9DIiwiVFJBQ0VJRF9TSEFERVJfQ09NUElMRSIsIlRSQUNFSURfVlJBTV9URVhUVVJFIiwiVFJBQ0VJRF9WUkFNX1ZCIiwiVFJBQ0VJRF9WUkFNX0lCIiwiVFJBQ0VJRF9CSU5ER1JPVVBfQUxMT0MiLCJUUkFDRUlEX0JJTkRHUk9VUEZPUk1BVF9BTExPQyIsIlRSQUNFSURfUkVOREVSUElQRUxJTkVfQUxMT0MiLCJUUkFDRUlEX1BJUEVMSU5FTEFZT1VUX0FMTE9DIl0sIm1hcHBpbmdzIjoiOzs7OztBQUtPLE1BQU1BLG9CQUFvQixHQUFHLGNBQWE7O0FBTzFDLE1BQU1DLG1CQUFtQixHQUFHLGFBQVk7O0FBT3hDLE1BQU1DLDBCQUEwQixHQUFHLG1CQUFrQjs7QUFRckQsTUFBTUMscUJBQXFCLEdBQUcsZUFBYzs7QUFPNUMsTUFBTUMsMkJBQTJCLEdBQUcsb0JBQW1COztBQU92RCxNQUFNQyxxQkFBcUIsR0FBRyxlQUFjOztBQU81QyxNQUFNQyxvQkFBb0IsR0FBRyxjQUFhOztBQU8xQyxNQUFNQyxzQkFBc0IsR0FBRyxnQkFBZTs7QUFPOUMsTUFBTUMsb0JBQW9CLEdBQUcsZUFBYzs7QUFPM0MsTUFBTUMsZUFBZSxHQUFHLFVBQVM7O0FBT2pDLE1BQU1DLGVBQWUsR0FBRyxVQUFTOztBQU9qQyxNQUFNQyx1QkFBdUIsR0FBRyxpQkFBZ0I7O0FBT2hELE1BQU1DLDZCQUE2QixHQUFHLHVCQUFzQjs7QUFPNUQsTUFBTUMsNEJBQTRCLEdBQUcsc0JBQXFCOztBQU8xRCxNQUFNQyw0QkFBNEIsR0FBRzs7OzsifQ==
