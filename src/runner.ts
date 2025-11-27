import { type Suite, type SuiteHooks, type Test } from "@vitest/runner"
import { inject, type SerializedConfig } from "vitest"
import { VitestTestRunner } from "vitest/runners"
import type { VitestRunner } from "vitest/suite"
import { getFn, getHooks, setHooks } from "vitest/suite"
import { calculate, Calculations } from "./calculate.js"
import { createBeforeEachCycle } from "./hooks.js"

export interface VitestBenchRunnerUserConfig {
  benchmark?: {
    /**
     * @default 1
     */
    minCycles?: number

    /**
     * @default 0
     */
    minMs?: number
  }
  warmup: {
    /**
     * @default 1
     */
    minCycles?: number

    /**
     * @default 0
     */
    minMs?: number
  }
}

export interface VitestBenchRunnerConfig {
  benchmark: {
    minCycles: number
    minMs: number
  }
  warmup: {
    minCycles: number
    minMs: number
  }
}

declare module "vitest" {
  export interface ProvidedContext {
    benchrunner: VitestBenchRunnerUserConfig
  }
}

/**
 * @summary
 * A `VitestRunner` that runs tests as benchmarks.
 */
// todo: remove assertions via vite plugin?
// todo: allow configuring what measures to create
// todo: add tracing
export class VitestBenchRunner
  extends VitestTestRunner
  implements VitestRunner
{
  // Allowing Vitest to run the `each` hooks means we don't have access to the
  // cleanup function from `beforeEach`.
  // Instead we'll move them here before Vitest can read them,
  // and call them per cycle.
  #hooks = new WeakMap<Suite, Pick<SuiteHooks, "afterEach" | "beforeEach">>()

  #config: VitestBenchRunnerConfig

  constructor(config: SerializedConfig) {
    if (config.sequence.concurrent) {
      throw new Error("Expected config.sequence.concurrent to be falsey")
    }

    if (config.sequence.shuffle) {
      throw new Error("Expected config.sequence.shuffle to be falsey")
    }

    super(config)

    const options = inject("benchrunner")

    this.#config = {
      benchmark: {
        minCycles: options?.benchmark?.minCycles ?? 1,
        minMs: options?.benchmark?.minMs ?? 0
      },
      warmup: {
        minCycles: options?.warmup?.minCycles ?? 1,
        minMs: options?.warmup?.minMs ?? 0
      }
    }
  }

  // Move `{before,after}Each` hooks into runner so Vitest can't run them automatically.
  // This may cause some issues for some Vitest internals but we we can get to that later.
  async onBeforeRunSuite(suite: Suite): Promise<void> {
    const hooks = getHooks(suite)

    this.#hooks.set(suite, {
      afterEach: hooks.afterEach,
      beforeEach: hooks.beforeEach
    })

    setHooks(suite, {
      ...hooks,
      beforeEach: [],
      afterEach: []
    })

    await super.onBeforeRunSuite(suite)
  }

  async runTask(test: Test) {
    const fn = getFn(test)

    const beforeEachCycle = createBeforeEachCycle(test, {
      sequence: this.config.sequence.hooks,
      getHooks: this.getHooks.bind(this)
    })

    async function cycle() {
      const start = performance.now()
      const afterEachCycle = await beforeEachCycle()
      await fn()

      // reset `expect.assertions(n)` to `0` because it sums over each test call.
      test.context.expect.setState({ assertionCalls: 0 })

      await afterEachCycle()

      const end = performance.now()
      const delta = end - start
      return delta
    }

    let cycles, duration

    // warmup
    cycles = 0
    duration = 0

    while (
      cycles < this.#config.warmup.minCycles ||
      duration < this.#config.warmup.minMs
    ) {
      duration += await cycle()
      cycles++
    }

    // benchmark
    cycles = 0
    duration = 0
    const samples = []

    while (
      cycles < this.#config.benchmark.minCycles ||
      duration < this.#config.benchmark.minMs
    ) {
      const sample = await cycle()
      duration += sample
      samples.push(sample)
      cycles++
    }

    const calculations = calculate(samples, cycles)

    // A place where reporters can read stuff
    test.meta.bench = {
      expected: cycles,
      calculations
    }
  }

  getHooks(suite: Suite) {
    const hooks = this.#hooks.get(suite)

    if (!hooks) {
      throw new Error(`Expected to get hooks for the suite ${suite.name}`)
    }

    return hooks
  }
}

export default VitestBenchRunner

declare module "@vitest/runner" {
  interface TaskMeta {
    bench?: {
      expected: number
      calculations: Calculations
    }
  }
}
