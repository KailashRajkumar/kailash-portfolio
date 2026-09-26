import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served from https://kailashrajkumar.github.io/kailash-portfolio/ on GitHub Pages.
// Override with BASE_PATH=/ for local dev or a custom domain.
const base = process.env["BASE_PATH"] ?? "/kailash-portfolio/";

export default defineConfig({
  base,
  server: { port: 3000 },
  plugins: [
    tailwindcss(),
    // Static SPA build: the app talks to Supabase directly from the browser,
    // so no server runtime is needed and the output can be hosted on GitHub Pages.
    tanstackStart({
      spa: { enabled: true, prerender: { outputPath: "/index.html" } },
    }),
    viteReact(),
  ],
  resolve: { tsconfigPaths: true, dedupe: ["react", "react-dom", "@tanstack/react-router"] },
});
