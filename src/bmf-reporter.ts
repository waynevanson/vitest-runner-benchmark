import {
  Reporter,
  SerializedError,
  TestModule,
  TestRunEndReason
} from "vitest/node"

// where to save this shit to?
export default class BMFReporter implements Reporter {
  async onTestRunEnd(
    testModules: ReadonlyArray<TestModule>,
    unhandledErrors: ReadonlyArray<SerializedError>,
    reason: TestRunEndReason
  ) {
    if (reason !== "passed" || unhandledErrors.length > 0) return

    const bmf = {}

    for (const testModule of testModules) {
      for (const testCase of testModule.children.allTests()) {
        const meta = testCase.meta()

        if (!meta.bench) {
          throw new Error("Expected test to report a benchmark")
        }

        const name = [testModule.project.name, testCase.fullName]
          .filter(Boolean)
          .join(" # ")
        const measures = meta.bench.calculations

        //@ts-expect-error
        bmf[name] = measures
      }
    }

    console.log(bmf)
  }
}
