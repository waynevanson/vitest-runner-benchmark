import { startVitest } from "vitest/node"

export async function runVitest(fixture: string, suite: string) {
  return await startVitest(
    "test",
    [`${suite}.spec.ts`],
    {
      watch: false,
      setupFiles: [`./${suite}.setup.ts`],
      maxWorkers: 1,
      root: fixture,
      reporters: ["@waynevanson/vitest-benchmark/reporter/silent"],
      provide: {
        benchrunner: {
          benchmark: { minCycles: 1 },
          warmup: { minCycles: 1 }
        }
      }
    },
    {
      test: {
        runner: "@waynevanson/vitest-benchmark/runner"
      }
    }
  )
}
