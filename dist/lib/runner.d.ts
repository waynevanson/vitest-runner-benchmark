import { type Suite, type SuiteHooks, type Test } from "@vitest/runner";
import { type SerializedConfig } from "vitest";
import { VitestTestRunner } from "vitest/runners";
import type { VitestRunner } from "vitest/suite";
import { Calculations } from "./calculate.js";
export interface VitestBenchRunnerUserConfig {
    benchmark?: {
        /**
         * @default 1
         */
        minCycles?: number;
        /**
         * @default 0
         */
        minMs?: number;
    };
    warmup?: {
        /**
         * @default 1
         */
        minCycles?: number;
        /**
         * @default 0
         */
        minMs?: number;
    };
}
export interface VitestBenchRunnerConfig {
    benchmark: {
        minCycles: number;
        minMs: number;
    };
    warmup: {
        minCycles: number;
        minMs: number;
    };
}
declare module "vitest" {
    interface ProvidedContext {
        benchrunner: VitestBenchRunnerUserConfig;
    }
}
/**
 * @summary
 * A `VitestRunner` that runs tests as benchmarks.
 */
export declare class VitestBenchRunner extends VitestTestRunner implements VitestRunner {
    #private;
    constructor(config: SerializedConfig);
    onBeforeRunSuite(suite: Suite): Promise<void>;
    runTask(test: Test): Promise<void>;
    getHooks(suite: Suite): Pick<SuiteHooks<object>, "afterEach" | "beforeEach">;
}
declare module "@vitest/runner" {
    interface TaskMeta {
        bench?: {
            expected: number;
            calculations: Calculations;
        };
    }
}
