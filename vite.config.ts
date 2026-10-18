import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // ONNX Runtime (background removal in the image editor) finds its
    // WebAssembly binary next to its own module; pre-bundled into
    // `.vite/deps` that lookup 404s, so removal would fail in dev only.
    optimizeDeps: {
      exclude: ["onnxruntime-web"],
    },
    server: {
      proxy: {
        // Dev: /api/v1 → local backend (VITE_API_PROXY_TARGET) or remote API
        "/api/v1": {
          target: env.VITE_API_PROXY_TARGET || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})
