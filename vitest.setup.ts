import { afterEach, beforeEach, vi } from "vitest"

// this file is being import but it's not being run.
export default {}

const afterEachOnly = vi.fn()
const afterEachBoth = vi.fn()

const beforeEachOnly = vi.fn()
const beforeEachBoth = vi.fn(() => afterEachBoth)

//@ts-ignore
globalThis["SETUP_FILE_GLOBAL_HOOKS"] = {
  afterEachBoth,
  afterEachOnly,
  beforeEachOnly,
  beforeEachBoth
}

beforeEach(beforeEachOnly)
beforeEach(beforeEachBoth)
afterEach(afterEachOnly)
