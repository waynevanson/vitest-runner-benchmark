import { vi, beforeEach, afterEach } from "vitest"

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
globalThis["TOP_LEVEL_SPEC_TS"] = createGlobalEachListeners()
