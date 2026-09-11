import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  deps: {
    alwaysBundle: [/@reliance-hvs\/.*/],
  },
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./dist",
});
