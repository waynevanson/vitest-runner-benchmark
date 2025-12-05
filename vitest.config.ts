import { defineConfig } from "vitest/config"

const BENCHMARK = process.env.BENCHMARK === "1"

const runner = BENCHMARK ? "./src/runner/index.ts" : undefined

export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
    // exclude the fixtures in test files
    exclude: ["./test/*/**", "node_modules/"],
    reporters: ["default"],
    runner,
    provide: {
      benchrunner: {
        warmup: {
          minMs: 2_000
        },
        benchmark: {
          minMs: 60_000
        },
        results: {
          latency: {
            average: true,
            max: true,
            min: true,
            percentiles: [0.999, 0.99, 0.9, 0.75, 0.5, 0.01]
          },
          throughput: {
            average: true,
            max: true,
            min: true,
            percentiles: [0.999, 0.99, 0.9, 0.75, 0.5, 0.1, 0.01]
          }
        }
      }
    }
  }
})
