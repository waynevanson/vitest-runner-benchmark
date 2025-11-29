import { Reporter, SerializedError, TestModule, TestRunEndReason, Vitest } from "vitest/node";
export interface BMFReporterConfig {
    outputFile: undefined | string;
}
export declare class BMFReporter implements Reporter {
    config: BMFReporterConfig;
    vitest: Vitest | undefined;
    onInit(vitest: Vitest): void;
    onTestRunEnd(testModules: ReadonlyArray<TestModule>, unhandledErrors: ReadonlyArray<SerializedError>, reason: TestRunEndReason): void;
}
export default BMFReporter;
