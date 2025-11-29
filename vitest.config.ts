import { defineConfig } from "vitest/config"
import dts from "vite-plugin-dts"
import { globSync as glob } from "glob"

const BENCHMARK = process.env.BENCHMARK === "1"

const runner = BENCHMARK ? "@waynevanson/vitest-benchmark/runner" : undefined

// todo: move non-unit tests into integrated tests
export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
    // exclude the fixtures in test files
    exclude: [BENCHMARK ? "./test/" : "./test/*/**", "node_modules/"],
    runner,
    provide: {
      benchrunner: {
        warmup: {
          minMs: 1_000
        },
        benchmark: {
          minMs: 10_000
        }
      }
    }
  }
})
