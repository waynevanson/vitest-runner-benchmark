import { describe, expect, test } from "vitest"

describe("from setup file", () => {
  const {
    afterEachBoth,
    afterEachOnly,
    beforeEachBoth,
    beforeEachOnly
    //@ts-ignore
  } = global["RUNNER_SPEC_TS"]

  let ran = false
  test("calls hooks", () => {
    expect(beforeEachOnly).toHaveBeenCalled()
    expect(beforeEachBoth).toHaveBeenCalled()

    if (!ran) {
      expect(beforeEachOnly).toBeCalledTimes(1)
      expect(beforeEachBoth).toBeCalledTimes(1)
      expect(afterEachOnly).not.toHaveBeenCalled()
      expect(afterEachBoth).not.toHaveBeenCalled()
      ran = true
    } else {
      expect(beforeEachOnly).toHaveBeenCalled()
      expect(beforeEachBoth).toHaveBeenCalled()
      expect(afterEachOnly).toHaveBeenCalled()
      expect(afterEachBoth).toHaveBeenCalled()
    }
  })
})
