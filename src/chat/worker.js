// Runs the embedding model off the main thread so loading and inference never
// block scrolling. Model weights come from the Hugging Face CDN and are kept in the
// browser cache, so later visits load from disk.
import { pipeline, env } from '@huggingface/transformers';
import asyncifyWasm from 'onnxruntime-web/ort-wasm-simd-threaded.asyncify.wasm?url';
import asyncifyMjs from 'onnxruntime-web/ort-wasm-simd-threaded.asyncify.mjs?url';
import plainWasm from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url';
import plainMjs from 'onnxruntime-web/ort-wasm-simd-threaded.mjs?url';

env.allowLocalModels = false;
// transformers.js points the ONNX runtime at jsDelivr, which intermittently answered
// 503 for this (dev) runtime version in testing. Serve it from this site instead,
// keeping transformers.js's own choice of build (plain is for Safari < 26 without WebGPU).
const onnx = env.backends.onnx.wasm;
onnx.wasmPaths = String(onnx.wasmPaths?.wasm ?? '').includes('.asyncify.')
  ? { wasm: asyncifyWasm, mjs: asyncifyMjs }
  : { wasm: plainWasm, mjs: plainMjs };

let extract;

self.onmessage = async ({ data }) => {
  if (data.type === 'load') {
    try {
      extract = await pipeline('feature-extraction', data.model, {
        dtype: data.dtype,
        device: 'wasm',
        progress_callback: p => p.status === 'progress' && self.postMessage({ type: 'progress', file: p.file, loaded: p.loaded, total: p.total }),
      });
      self.postMessage({ type: 'ready' });
    } catch (err) {
      self.postMessage({ type: 'error', message: String(err?.message ?? err) });
    }
  } else if (data.type === 'embed') {
    try {
      const out = await extract('query: ' + data.text, { pooling: 'mean', normalize: true });
      self.postMessage({ type: 'vector', id: data.id, vector: out.data });
    } catch (err) {
      self.postMessage({ type: 'vector', id: data.id, error: String(err?.message ?? err) });
    }
  }
};
