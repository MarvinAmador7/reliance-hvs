import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3001,
    // Let other machines on the LAN open the dev server by its Bonjour name (e.g. marvins-mac-mini.local).
    allowedHosts: [".local"],
  },
  // Bundle all SSR deps for production: Vercel functions have no node_modules at runtime.
  // In dev, bundling React as ESM breaks (`module is not defined`), so keep externals there.
  ssr: command === "build" ? { noExternal: true } : undefined,
}));
