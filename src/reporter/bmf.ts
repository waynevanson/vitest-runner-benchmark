import {
  Reporter,
  SerializedError,
  TestCase,
  TestModule,
  TestRunEndReason,
  Vitest
} from "vitest/node"
import { writeFileSync } from "node:fs"

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
        const name = createBenchmarkName(testCase)

        if (name in bmf) {
          throw new Error(
            [
              `Expected "${name}" not to exist as a benchmark name.`,
              `Please remove duplicate test names.`,
              `If these tests are in two different projects, please add a project name in the vitest config to fix.`
            ].join("\n")
          )
        }

        const measures = createBenchmarkMeasures(testCase)

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

function createBenchmarkName(testCase: TestCase): string {
  // todo: add project name
  //@ts-expect-error`
  return [testCase.task.fullName].filter(Boolean).join(" # ")
}

export function createBenchmarkMeasures(testCase: TestCase) {
  const meta = testCase.meta()

  if (!meta.benchrunner) {
    throw new Error("Expected test to report a benchmark")
  }

  const results = meta.benchrunner

  const latency = createMeasure({
    value: results?.latency?.average,
    lower_value: results?.latency?.min,
    upper_value: results?.latency?.max
  })

  const throughput = createMeasure({
    value: results?.throughput?.average,
    lower_value: results?.throughput?.min,
    upper_value: results?.throughput?.max
  })

  const latencyPercentiles = createPercentiles(
    "Latency",
    results.latency?.percentiles
  )

  const throughputPercentiles = createPercentiles(
    "Throughput",
    results?.throughput?.percentiles
  )

  const measurables = {
    ...latencyPercentiles,
    ...throughputPercentiles
  } as Measures

  if (latency) {
    measurables.Latency = latency
  }

  if (throughput) {
    measurables.Throughput = throughput
  }

  return measurables
}

function createMeasure(partial: Partial<Measure>) {
  const measure = {} as Measure

  if (partial.value === undefined) {
    return undefined
  }

  measure.value = partial.value

  for (const property of ["lower_value", "upper_value"] as const) {
    const value = partial[property]

    if (value === undefined) {
      continue
    }

    measure[property] = partial[property]
  }

  return measure
}

export function createPercentiles(
  category: string,
  percentiles: Record<string, number> = {}
): Record<string, Measure> | undefined {
  if (Object.keys(percentiles).length === 0) {
    return undefined
  }

  const measures = {} as Record<string, Measure>

  for (const percentile in percentiles) {
    const name = `${category} P${percentile}`
    const value = percentiles[percentile]
    measures[name] = { value }
  }

  return measures
}
