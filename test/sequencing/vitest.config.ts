import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    maxWorkers: 1,
    setupFiles: ["./vitest.setup.ts"],
    runner: "@waynevanson/vitest-benchmark/runner"
  }
})
