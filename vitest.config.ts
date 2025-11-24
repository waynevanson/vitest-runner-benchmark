import { defineConfig } from "vitest/config"

process.env["VITEST_RUNNER_BENCHMARK_OPTIONS"] = JSON.stringify({
  benchmark: {
    minCycles: 100_000,
    minMs: 10_000
  },
  warmup: {
    minCycles: 1000,
    minMs: 200
  }
})

export default defineConfig({
  test: {
    runner: "./dist/runner.js",
    setupFiles: ["./vitest.setup.ts"],
    reporters: ["default", "./dist/bmf-reporter.js"]
  }
})
