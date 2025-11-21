import {
  afterAll,
  afterEach,
  beforeEach,
  beforeAll,
  describe,
  expect,
  test
} from "vitest"

describe("sequencing", () => {
  let number = 0

  const after = (name: "all" | "each", scoped: boolean) => () => {
    number--
    // console.log(number, "after", name, scoped)
  }

  const before = (name: "all" | "each", scoped: boolean) => () => {
    number++
    // console.log(number, "before", name, scoped)
  }

  const both = (name: "all" | "each") => () => {
    before(name, true)()
    return after(name, true)
  }

  beforeEach(both("each"))
  beforeAll(both("all"))

  beforeAll(before("all", false))
  afterAll(after("all", false))

  beforeEach(before("each", false))
  afterEach(after("each", false))

  test("calls hooks", () => {
    // console.log("test", number)
    expect(number).toBe(4)
  })
})
