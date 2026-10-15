import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The chat worker loads transformers.js, which imports the ONNX runtime dynamically,
// so the worker has to be an ES module. Pre-bundling breaks its WASM loading in dev.
export default defineConfig({
  plugins: [react()],
  base: '/',
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['@huggingface/transformers'] },
});
