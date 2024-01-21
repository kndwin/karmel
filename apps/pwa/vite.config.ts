import path from "path";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [react(), TanStackRouterVite({})],
    build: {
      minify: true,
      outDir: "./pages",
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
  };
});
