import { test, expect } from "vitest"
const {
  afterEachBoth,
  afterEachOnly,
  beforeEachBoth,
  beforeEachOnly
  //@ts-ignore
} = global["TOP_LEVEL_SPEC_TS"]

let ran = false
test("should call top level hooks only once", async () => {
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
