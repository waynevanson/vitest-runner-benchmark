import {
  Reporter,
  SerializedError,
  TestModule,
  TestRunEndReason,
  Vitest
} from "vitest/node"
import { writeFileSync } from "node:fs"
import test from "node:test"

export interface Measure {
  value: number
  lower_value?: number
  upper_value?: number
}

export interface Measures {
  [measure: string]: Measure
}

export interface BenchmarkMetricFormat {
  [benchmark: string]: Measures
}

// todo: add to vitest config if possible
export interface BMFReporterConfig {
  outputFile: undefined | string
}

// todo: allow template syntax for saving names
export default class BMFReporter implements Reporter {
  config: BMFReporterConfig = { outputFile: undefined }
  vitest: Vitest | undefined

  onInit(vitest: Vitest) {
    this.config.outputFile =
      typeof vitest.config.outputFile === "string"
        ? vitest.config.outputFile
        : vitest.config.outputFile?.bmf ?? undefined

    this.vitest = vitest
  }

  onTestRunEnd(
    testModules: ReadonlyArray<TestModule>,
    unhandledErrors: ReadonlyArray<SerializedError>,
    reason: TestRunEndReason
  ) {
    if (reason !== "passed" || unhandledErrors.length > 0) return

    const bmf: BenchmarkMetricFormat = {}

    for (const testModule of testModules) {
      for (const testCase of testModule.children.allTests("passed")) {
        const meta = testCase.meta()

        if (!meta.benchrunner) {
          throw new Error("Expected test to report a benchmark")
        }

        // todo: add project name
        const name = [
          //@ts-expect-error`
          testCase.task.fullName
        ]
          .filter(Boolean)
          .join(" # ")

        if (name in bmf) {
          throw new Error(
            [
              `Expected "${name}" not to exist as a benchmark name.`,
              `Please remove duplicate test names.`,
              `If these tests are in two different projects, please add a project name in the vitest config to fix.`
            ].join("\n")
          )
        }

        const results = meta.benchrunner

        const measures = {} as Measures

        applyIfValid(measures, "Latency", {
          value: results?.latency?.average,
          lower_value: results?.latency?.min,
          upper_value: results?.latency?.max
        })

        applyIfValid(measures, "Throughput", {
          value: results?.throughput?.average,
          lower_value: results?.throughput?.min,
          upper_value: results?.throughput?.max
        })

        if (results.latency?.percentiles) {
          for (const percentile in results.latency.percentiles) {
            applyIfValid(measures, `Latency P${percentile}`, {
              value: results.latency.percentiles[percentile]
            })
          }
        }

        if (results.throughput?.percentiles) {
          for (const percentile in results.throughput.percentiles) {
            applyIfValid(measures, `Throughput P${percentile}`, {
              value: results.throughput.percentiles[percentile]
            })
          }
        }

        bmf[name] = measures
      }
    }

    const data = JSON.stringify(bmf)

    if (this.config.outputFile) {
      writeFileSync(this.config.outputFile, data, { encoding: "utf8" })
    } else {
      console.log(data)
    }
  }
}

function applyIfValid(
  bmf: Measures,
  name: string,
  measurable: Partial<Measure>
) {
  for (const property in measurable) {
    //@ts-ignore
    const value = measurable[property]
    if (value === undefined) {
      //@ts-ignore
      delete measurable[property]
    }
  }

  if (Object.keys(measurable).length > 0) {
    bmf[name] = measurable as Measure
  }
}
