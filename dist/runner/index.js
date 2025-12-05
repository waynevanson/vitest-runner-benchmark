import * as v from "valibot";
import { inject } from "vitest";
import { VitestTestRunner } from "vitest/runners";
import { getFn, getHooks, setHooks } from "vitest/suite";
import { createCalculator } from "./calculate.js";
import { schema } from "./config.js";
import { createBeforeEachCycle } from "./hooks.js";
/**
 * @summary
 * A `VitestRunner` that runs tests as benchmarks.
 */
// todo: remove assertions via vite plugin?
// todo: allow configuring what measures to create
// todo: add tracing
export default class VitestBenchRunner extends VitestTestRunner {
    // Allowing Vitest to run the `each` hooks means we don't have access to the
    // cleanup function from `beforeEach`.
    // Instead we'll move them here before Vitest can read them,
    // and call them per cycle.
    #hooks = new WeakMap();
    #config;
    constructor(config) {
        if (config.sequence.concurrent) {
            throw new Error("Expected config.sequence.concurrent to be falsey");
        }
        if (config.sequence.shuffle) {
            throw new Error("Expected config.sequence.shuffle to be falsey");
        }
        super(config);
        const provided = v.parse(schema, inject("benchrunner"));
        this.#config = {
            provided,
            calculate: createCalculator(provided.results)
        };
    }
    // Move `{before,after}Each` hooks into runner so Vitest can't run them automatically.
    // This may cause some issues for some Vitest internals but we we can get to that later.
    async onBeforeRunSuite(suite) {
        const hooks = getHooks(suite);
        this.#hooks.set(suite, {
            afterEach: hooks.afterEach ?? [],
            beforeEach: hooks.beforeEach ?? []
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
        // todo: get hooks only once per test? I don't think it changes over each test
        const beforeEachCycle = createBeforeEachCycle(test, {
            sequence: this.config.sequence.hooks,
            getHooks: this.getHooks.bind(this)
        });
        async function cycle() {
            const afterEachCycle = await beforeEachCycle();
            const start = performance.now();
            await fn();
            const end = performance.now();
            await afterEachCycle();
            // reset `expect.assertions(n)` to `0` because it sums over each test call.
            test.context.expect.setState({ assertionCalls: 0 });
            const delta = end - start;
            return delta;
        }
        let cycles, duration;
        // warmup
        cycles = 0;
        duration = 0;
        while (cycles < this.#config.provided.warmup.minCycles ||
            duration < this.#config.provided.warmup.minMs) {
            duration += await cycle();
            cycles++;
        }
        // benchmark
        cycles = 0;
        duration = 0;
        const samples = [];
        while (cycles < this.#config.provided.benchmark.minCycles ||
            duration < this.#config.provided.benchmark.minMs) {
            const sample = await cycle();
            duration += sample;
            samples.push(sample);
            cycles++;
        }
        const meta = this.#config.calculate({ samples, cycles });
        // A place where reporters can read stuff
        test.meta.benchrunner = meta;
    }
    getHooks(suite) {
        const hooks = this.#hooks.get(suite);
        if (!hooks) {
            throw new Error(`Expected to get hooks for the suite ${suite.name}`);
        }
        return hooks;
    }
}
