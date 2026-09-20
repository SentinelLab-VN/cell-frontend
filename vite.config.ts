import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const gateway = env.VITE_GATEWAY_URL || "http://localhost:8080";

  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
    test: { include: ["src/**/*.test.ts"] },
    // The gateway sends no CORS headers: in production the app is served from
    // the same origin, behind the same proxy. This keeps development the same.
    server: {
      proxy: {
        "/api": gateway,
        "/auth": gateway,
      },
    },
  };
});
