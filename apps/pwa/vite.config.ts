import { defineConfig } from "vite";
import path from "path";

import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

const root = process.cwd().split(path.sep).slice(0, -2).join(path.sep);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert({
      savePath: "./certs", // save the generated certificate into certs directory
      force: true, // force generation of certs even without setting https property in the vite config
    }),
    TanStackRouterVite({
      routesDirectory: path.resolve(__dirname, "./src/routes"),
      generatedRouteTree: "./src/shared/router/tree.ts",
    }),
    VitePWA({
      mode: "development",
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: false,
      injectManifest: {
        minify: false,
        enableWorkboxModulesLogs: true,
      },
      workbox: {
        globDirectory: "./src/",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
      },
      manifest: {
        name: "Karmel",
        short_name: "Karmel: Online games",
        description: "Online games for the modern web.",
        theme_color: "#ced4da",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "/index.html",
      },
    }),
  ],
  build: {
    minify: true,
  },
  server: {
    https: {
      cert: "./certs/cert.pem",
      key: "./certs/dev.pem",
    },
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
    cors: {
      origin: "*",
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(process.cwd(), "./src/"),
      // pop the last 2 elements off the path
      "/modules": path.resolve(root, "modules"),
      "/apps": path.resolve(root, "apps"),
      "/shared": path.resolve(root, "shared"),
    },
  },
});
