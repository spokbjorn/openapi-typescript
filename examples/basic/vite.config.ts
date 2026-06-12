import { defineConfig } from "vite";
import openapiTs from "@spokbjorn/vite-plugin-openapi-typescript";

export default defineConfig({
  plugins: [
    openapiTs({
      input: "./petstore.yaml",
      output: "./src/generated/petstore.ts",
    }),
  ],
});
