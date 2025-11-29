import { defineConfig } from "vitest/config"

const BENCHMARK = process.env.BENCHMARK === "1"

const runner = BENCHMARK ? "@waynevanson/vitest-benchmark/runner" : undefined

export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
    // exclude the fixtures in test files
    exclude: ["./test/*/**", "node_modules/"],
    runner,
    provide: {
      benchrunner: {
        warmup: {
          minMs: 2_000
        },
        benchmark: {
          minMs: 60_000
        }
      }
    }
  }
})
