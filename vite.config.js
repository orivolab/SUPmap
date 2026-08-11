import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      workbox: {
        importScripts: ["/push-sw.js"],
      },

      manifest: {
        name: "SUPmap",
        short_name: "SUPmap",
        description:
          "Mapa miejsc do pływania na SUP",

        start_url: "/",
        scope: "/",

        display: "standalone",

        background_color: "#f7faf8",
        theme_color: "#287b63",

        orientation: "portrait-primary",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});