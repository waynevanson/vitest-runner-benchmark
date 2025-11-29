import path from "node:path"
import { describe, expect, test } from "vitest"
import { runVitest } from "./lib"

describe("sequencing", () => {
  test("should run hooks in an order", async () => {
    const vitest = await runVitest(
      path.join(import.meta.dirname, "sequencing"),
      "defaults"
    )

    expect(vitest).toHaveNumberOfTests(2)
    expect(vitest).not.toHaveFailedTests()
  })

  test("should use global hooks", async () => {
    const vitest = await runVitest(
      path.join(import.meta.dirname, "sequencing"),
      "global"
    )

    expect(vitest).toHaveNumberOfTests(1)
    expect(vitest).not.toHaveFailedTests()
  })
})
