import { describe, expect, test } from "vitest"

describe("from setup file", () => {
  const {
    afterEachBoth,
    afterEachOnly,
    beforeEachBoth,
    beforeEachOnly
    //@ts-ignore
  } = global["GLOBAL_SPEC_TS"]

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
      expect(beforeEachOnly).toHaveBeenCalledTimes(2)
      expect(beforeEachBoth).toHaveBeenCalledTimes(2)
      expect(afterEachOnly).toHaveBeenCalled()
      expect(afterEachBoth).toHaveBeenCalled()
    }
  })
})
