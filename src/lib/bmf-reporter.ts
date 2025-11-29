import {
  Reporter,
  SerializedError,
  TestModule,
  TestRunEndReason,
  Vitest
} from "vitest/node"
import { Calculations } from "./calculate.js"
import { writeFileSync } from "node:fs"

export interface BMFReporterConfig {
  outputFile: undefined | string
}

// todo: allow template syntax for saving names
export class BMFReporter implements Reporter {
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

    const bmf: Record<string, Calculations> = {}

    for (const testModule of testModules) {
      for (const testCase of testModule.children.allTests("passed")) {
        const meta = testCase.meta()

        if (!meta.bench) {
          throw new Error("Expected test to report a benchmark")
        }

        const name = [testModule.project.name, testCase.fullName]
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

        bmf[name] = meta.bench.calculations
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

export default BMFReporter
