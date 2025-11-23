import { defineConfig } from "vitest/config"

process.env["VITEST_RUNNER_BENCHMARK_OPTIONS"] = JSON.stringify({
  benchmark: {
    cycles: 100_00
  },
  warmup: {
    cycles: 1000
  }
})

export default defineConfig({
  test: {
    runner: "./dist/runner.js",
    setupFiles: ["./vitest.setup.ts"],
    reporters: ["default", "./dist/bmf-reporter.js"]
  }
})
