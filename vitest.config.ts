import { defineConfig } from "vitest/config"

process.env["VITEST_RUNNER_BENCHMARK_OPTIONS"] = JSON.stringify({
  benchmark: {
    cycles: 1_000
  },
  warmup: {
    cycles: 1_000
  }
})

export default defineConfig({
  test: {
    runner: "./dist/runner.js",
    reporters: ["./dist/reporter.js", "default"],
    setupFiles: ["./vitest.setup.ts"]
  }
})
