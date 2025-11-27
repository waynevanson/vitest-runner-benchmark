import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    runner: "./dist/runner.js",
    setupFiles: ["./vitest.setup.ts"],
    reporters: ["default", "./dist/bmf-reporter.js"],
    provide: {
      benchrunner: {
        benchmark: {
          minCycles: 100_000,
          minMs: 10_000
        },
        warmup: {
          minCycles: 1000,
          minMs: 200
        }
      }
    }
  }
})
