import { SequenceHooks, Suite, SuiteHooks, Test } from "@vitest/runner";
export interface BeforeEachCycleOptions {
    sequence: SequenceHooks;
    /**
     * @param suite
     * @throws
     */
    getHooks(suite: Suite): Pick<SuiteHooks, "afterEach" | "beforeEach">;
}
export declare function createBeforeEachCycle(test: Test, options: BeforeEachCycleOptions): () => Promise<() => Promise<void[]>>;
