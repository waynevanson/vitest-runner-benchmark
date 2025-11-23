import { VitestTestRunner } from "vitest/runners";
import { getFn, getHooks, setHooks } from "vitest/suite";
import { calculate } from "./calculate.js";
import { createBeforeEachCycle } from "./hooks.js";
/**
 * @summary
 * A `VitestRunner` that runs tests as benchmarks.
 */
// todo: remove assertions via vite plugin?
export class VitestBenchRunner extends VitestTestRunner {
    // todo: ensure this can take multiple things like minimum time of cycles.
    #config;
    // Allowing Vitest to run the `each` hooks means we don't have access to the
    // cleanup function from `beforeEach`.
    // Instead we'll move them here before Vitest can read them,
    // and call them per cycle.
    #hooks = new WeakMap();
    constructor(config) {
        if (config.sequence.concurrent) {
            throw new Error("Expected config.sequence.concurrent to be falsey");
        }
        if (config.sequence.shuffle) {
            throw new Error("Expected config.sequence.shuffle to be falsey");
        }
        super(config);
        const options = JSON.parse(process.env["VITEST_RUNNER_BENCHMARK_OPTIONS"] ?? "{}");
        const bcycles = options?.benchmark?.cycles ?? 64;
        const wcycles = options?.warmup?.cycles ?? 10;
        this.#config = {
            benchmark: { cycles: bcycles },
            warmup: { cycles: wcycles }
        };
    }
    // Move `{before,after}Each` hooks into runner so Vitest can't run them automatically.
    // This may cause some issues for some Vitest internals but we we can get to that later.
    async onBeforeRunSuite(suite) {
        const hooks = getHooks(suite);
        this.#hooks.set(suite, {
            afterEach: hooks.afterEach,
            beforeEach: hooks.beforeEach
        });
        setHooks(suite, {
            ...hooks,
            beforeEach: [],
            afterEach: []
        });
        await super.onBeforeRunSuite(suite);
    }
    async runTask(test) {
        const fn = getFn(test);
        const beforeEachCycle = createBeforeEachCycle(test, {
            sequence: this.config.sequence.hooks,
            getHooks: this.getHooks.bind(this)
        });
        for (let count = 1; count <= this.#config.warmup.cycles; count++) {
            const afterEachCycle = await beforeEachCycle();
            await fn();
            await afterEachCycle();
        }
        const samples = [];
        for (let count = 1; count <= this.#config.benchmark.cycles; count++) {
            const afterEachCycle = await beforeEachCycle();
            const start = performance.now();
            // todo: log a cycle event
            await fn();
            const end = performance.now();
            const delta = end - start;
            samples.push(delta);
            // reset `expect.assertions(n)` to `0` because it sums over each test call.
            test.context.expect.setState({ assertionCalls: 0 });
            // todo: log a cycle event
            await afterEachCycle();
        }
        const calculations = calculate(samples, this.#config.benchmark.cycles);
        // A place where reporters can read stuff
        test.meta.bench = {
            expected: this.#config.benchmark.cycles,
            calculations
        };
    }
    getHooks(suite) {
        const hooks = this.#hooks.get(suite);
        if (!hooks) {
            throw new Error(`Expected to get hooks for the suite ${suite.name}`);
        }
        return hooks;
    }
}
export default VitestBenchRunner;
