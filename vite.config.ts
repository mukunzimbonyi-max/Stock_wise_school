import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    start: { entry: "src/server.ts" },
  },
  vite: {
    server: {
      port: 5173,
      host: "127.0.0.1",
      strictPort: false,
    },
    resolve: {
      tsconfigPaths: true,
    },
  },
});
