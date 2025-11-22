import { test, expect } from "vitest"
const {
  afterEachBoth,
  afterEachOnly,
  beforeEachBoth,
  beforeEachOnly
  //@ts-ignore
} = global["SETUP_FILE_GLOBAL_HOOKS"]

let ran = false
test.skip("should call top level hooks only once", () => {
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
