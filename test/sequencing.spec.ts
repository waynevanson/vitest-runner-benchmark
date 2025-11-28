import path from "node:path"
import { describe, expect, test } from "vitest"
import { startVitest } from "vitest/node"

function aliases<K extends string>(names: Array<K>) {
  return names.reduce((accu, curr) => {
    accu[curr] = curr
    return accu
  }, {} as { [P in K]: P })
}

const fixture = aliases(["sequencing"])

describe(fixture.sequencing, () => {
  test("should run hooks in an order", async () => {
    const vitest = await startVitest("test", [], {
      watch: false,
      maxWorkers: 1,
      root: path.join(import.meta.dirname, fixture.sequencing),
      reporters: ["../../silent-reporter"]
    })

    expect(vitest).toHaveFailedTests()
  })
})
