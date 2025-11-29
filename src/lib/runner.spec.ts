import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

describe("local", ({}) => {
  const afterEachOnly = vi.fn()
  const afterEachBoth = vi.fn()

  const beforeEachOnly = vi.fn()
  const beforeEachBoth = vi.fn(() => afterEachBoth)

  beforeEach(beforeEachOnly)
  beforeEach(beforeEachBoth)
  afterEach(afterEachOnly)

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

test.skip("Allow skipping a test")
