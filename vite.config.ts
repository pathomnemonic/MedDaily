import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { target: "es2022", sourcemap: true },
  // Several data-integrity tests brute-force every puzzle; the default 5 s limit can trip on a slow or busy CI runner
  test: { testTimeout: 30000 }
});