import type { Suite, SuiteHooks, Test, TestContext } from "@vitest/runner"
import type { SerializedConfig } from "vitest"
import { VitestTestRunner } from "vitest/runners"
import type { VitestRunner } from "vitest/suite"
import { getFn, getHooks, setHooks } from "vitest/suite"
import { createBeforeEachCycle } from "./hooks.js"
import { increments } from "./iterator.js"

/**
 * @summary
 * A `VitestRunner` that runs tests as benchmarks.
 */
// todo: remove assertions via vite plugin?
export default class VitestBenchRunner
  extends VitestTestRunner
  implements VitestRunner
{
  // todo: ensure this can take multiple things like minimum time of cycles.
  #config = {
    benchmark: {
      cycles: 64
    },
    warmup: {
      cycles: 64
    }
  }
  #tests = new Set<Test>()

  #hooks = new WeakMap<Suite, Pick<SuiteHooks, "afterEach" | "beforeEach">>()

  constructor(config: SerializedConfig) {
    if (config.sequence.concurrent) {
      throw new Error("Expected config.sequence.concurrent to be falsey")
    }

    if (config.sequence.shuffle) {
      throw new Error("Expected config.sequence.shuffle to be falsey")
    }

    super(config)
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

  getHooks(suite: Suite) {
    const hooks = this.#hooks.get(suite)

    if (!hooks) {
      throw new Error(`Expected to get hooks for the suite ${suite.name}`)
    }

    return hooks
  }

  async runTask(test: Test) {
    const fn = getFn(test)

    const beforeEachCycle = createBeforeEachCycle(test, {
      sequence: this.config.sequence.hooks,
      getHooks: this.getHooks.bind(this)
    })

    for (const _ of increments(1, this.#config.warmup.cycles)) {
      const afterEachCycle = await beforeEachCycle()
      await fn()
      await afterEachCycle()
    }

    for (const count of increments(1, this.#config.benchmark.cycles)) {
      const afterEachCycle = await beforeEachCycle()
      performance.mark(`${test.id}:open:${count}`)
      await fn()
      performance.mark(`${test.id}:shut:${count}`)
      await afterEachCycle()
    }

    this.#tests.add(test)
  }

  // Format details
  // https://bencher.dev/docs/reference/bencher-metric-format/
  async onAfterRunFiles() {
    // const filename = new Date().toISOString()
    // const filepath = path.resolve(this.config.root, ".benchmark", filename)

    // const results = this.#tests.values().reduce((accu, test) => {
    //   const measures = getMeasures(test.id, this.#config.benchmark.cycles)
    //   const min = measures.reduce((accu, curr) => Math.min(accu, curr), 0)
    //   const max = measures.reduce((accu, curr) => Math.max(accu, curr), 0)
    //   const average =
    //     measures.reduce((accu, curr) => accu + curr, 0) / measures.length

    //   const measure = { value: average, lower_value: min, higher_value: max }

    //   const name = [test.file.filepath + test.name].join(":")

    //   accu[name] = { duration: measure }

    //   return accu
    // }, {} as BMF)

    // const data = JSON.stringify(results, null, 4)

    // fs.mkdirSync(path.dirname(filepath), { recursive: true })
    // fs.writeFileSync(filepath, data, { encoding: "utf8" })

    super.onAfterRunFiles()
  }
}

type BMF = Record<
  string,
  Record<string, { value: number; lower_value?: number; higher_value?: number }>
>

// function* window<T>(iterator: IterableIterator<T>): Generator<[T, T]> {
//   let a = iterator.next();
//   let b = iterator.next();

//   while (!a.done && !b.done) {
//     yield [a.value, b.value];

//     a = b;
//     b = iterator.next();
//   }
// }

function getMeasures(id: string, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const counter = index + 1
    const open = `${id}:open:${counter}`
    const shut = `${id}:shut:${counter}`
    const measure = performance.measure(open, shut)
    return measure.duration
  })
}
