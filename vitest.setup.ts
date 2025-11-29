import { afterEach, beforeEach, expect, TestError, vi } from "vitest"
import { Vitest } from "vitest/node"

function createGlobalEachListeners() {
  const beforeEachOnly = vi.fn()
  beforeEach(beforeEachOnly)

  const afterEachOnly = vi.fn()
  afterEach(afterEachOnly)

  const afterEachBoth = vi.fn()
  const beforeEachBoth = vi.fn(() => afterEachBoth)
  beforeEach(beforeEachBoth)

  return {
    beforeEachOnly,
    afterEachOnly,
    beforeEachBoth,
    afterEachBoth
  }
}

//@ts-ignore
globalThis["RUNNER_SPEC_TS"] = createGlobalEachListeners()

expect.extend({
  toHaveFailedTests(recieved) {
    const vitest = recieved as Vitest
    const modules = vitest.state.getTestModules()

    const failedTests = modules.flatMap((module) =>
      Array.from(module.children.allTests("failed"))
    )

    // todo: sort failing tests from non-failing
    const errors = failedTests.reduce((accu, failedTest) => {
      accu[failedTest.fullName] =
        failedTest.result().errors?.map?.((error) => error.message) ?? []

      return accu
    }, {} as Record<string, Array<string>>)

    if (failedTests.length > 0) {
      return {
        pass: true,
        message() {
          return `Expected to have more than 0 failed tests`
        },
        expected: {},
        actual: errors
      }
    } else {
      return {
        message() {
          return `Expected to have 0 failed tests`
        },
        pass: false,
        expected: errors
      }
    }
  },
  toHaveNumberOfTests(recieved, count) {
    const vitest = recieved as Vitest

    const tests = vitest.state
      .getTestModules()
      .flatMap((testModule) => Array.from(testModule.children.allTests()))

    if (tests.length === count) {
      return {
        pass: true,
        message() {
          return `Expected not to have exactly ${count} tests`
        }
      }
    } else {
      return {
        pass: false,
        message() {
          return `Expected to have exactly ${count} tests but received ${tests.length} test`
        }
      }
    }
  }
})

interface VitestCustomTestMatchers<T = unknown> {
  toHaveFailedTests(): T
  toHaveNumberOfTests(count: number): T
}

declare module "vitest" {
  interface Assertion<T = any> extends VitestCustomTestMatchers<T> {}
  interface AssertionAsymmetricMatchersContaining
    extends VitestCustomTestMatchers {}
}
