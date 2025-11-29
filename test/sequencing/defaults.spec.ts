import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

describe("default local", () => {
  const afterEachOnly = vi.fn()
  const afterEachBoth = vi.fn()

  const beforeEachOnly = vi.fn()
  const beforeEachBoth = vi.fn(() => afterEachBoth)

  beforeEach(beforeEachOnly)
  beforeEach(beforeEachBoth)
  afterEach(afterEachOnly)

  let ran = false
  test("calls a test twice", () => {
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
      expect(afterEachOnly).toHaveBeenCalledTimes(1)
      expect(afterEachBoth).toHaveBeenCalledTimes(1)
    }
  })
})

// todo: make a separate task states fixture
test.skip("Allow skipping a test")
