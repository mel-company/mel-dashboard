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
    server: {
      proxy: {
        // Same-origin /api/v1 in dev → upstream API (Gateway-like)
        "/api/v1": {
          target: env.VITE_API_PROXY_TARGET || "https://api.mel.iq",
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
})
