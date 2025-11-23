// `getHooks` and `setHooks` is just hooks added per suite.
// It does not handle execution.

import {
  AfterEachListener,
  BeforeEachListener,
  SequenceHooks,
  Suite,
  SuiteHooks,
  Test
} from "@vitest/runner"

/**
 * @summary
 * Gets all the hooks to run the suite for a test.
 */
function deriveTestListeners(
  test: Test,
  getHooks: (suite: Suite) => Pick<SuiteHooks, "afterEach" | "beforeEach">
) {
  // collect all the `beforeEach` callbacks.
  // we keep these together so the order between cleanups is known.
  const listeners: Array<{
    befores: Array<BeforeEachListener>
    afters: Array<AfterEachListener>
  }> = []

  function collect(suite: Suite) {
    const hooks = getHooks(suite)
    const item = {
      befores: hooks.beforeEach,
      afters: hooks.afterEach
    }
    listeners.unshift(item)
  }

  // only for suites and not files
  let parent: Suite | undefined = test.suite
  while (parent && parent !== test.file) {
    collect(parent)
    parent = parent.suite
  }

  // collect from `config.setupFiles`
  collect(test.file)

  return listeners
}

export interface BeforeEachCycleOptions {
  sequence: SequenceHooks
  /**
   * @param suite
   * @throws
   */
  getHooks(suite: Suite): Pick<SuiteHooks, "afterEach" | "beforeEach">
}

export function createBeforeEachCycle(
  test: Test,
  options: BeforeEachCycleOptions
) {
  return async function beforeEachCycle() {
    const suite = test.suite ?? test.file

    const suitesListeners = deriveTestListeners(test, options.getHooks)

    const traverse = options.sequence === "parallel" ? parallel : series

    const cleanups = await traverse(
      suitesListeners.map((suiteListeners) => async () => {
        const unknowns = await traverse(
          suiteListeners.befores.map(
            (before) => () => before(test.context, suite)
          )
        )

        const befores = unknowns.filter(
          (value): value is () => unknown => typeof value === "function"
        )

        const afters = suiteListeners.afters.map(
          (fn) => () => fn(test.context, suite)
        )

        if (options.sequence === "stack") {
          befores.reverse()
          afters.reverse()
        }

        return async function cleanupEachSuite() {
          await traverse(befores)
          await traverse(afters)
        }
      })
    )

    return async function afterEachCycle() {
      return await traverse(cleanups)
    }
  }
}

async function series<T>(fns: Iterable<() => T>): Promise<Array<Awaited<T>>> {
  const result: Array<Awaited<T>> = []

  for (const fn of fns) {
    result.push(await fn())
  }

  return result
}

async function parallel<T>(fns: Iterable<() => T>): Promise<Array<Awaited<T>>> {
  return Promise.all(Iterator.from(fns).map((fn) => fn()))
}
