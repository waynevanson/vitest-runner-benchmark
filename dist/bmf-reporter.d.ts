import { Reporter, SerializedError, TestModule, TestRunEndReason } from "vitest/node";
export default class BMFReporter implements Reporter {
    onTestRunEnd(testModules: ReadonlyArray<TestModule>, unhandledErrors: ReadonlyArray<SerializedError>, reason: TestRunEndReason): Promise<void>;
}
