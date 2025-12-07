import { describe, expect, test, vi } from "vitest"
import { memo } from "./utils.js"

describe(memo, () => {
  test("Calculate function only when consumed", () => {
    const context = {
      durations: [0.038434, 0.384734, 0.26736, 0.8734],
      cycles: 32
    }

    // wrapped in `fn` for testing.
    const totalDuration_ = vi.fn(() =>
      context.durations.reduce((accu, curr) => accu + curr, 0)
    )
    const totalDuration = memo(totalDuration_)

    const totalThroughput_ = vi.fn(() => context.cycles / totalDuration())
    const totalThroughput = memo(totalThroughput_)

    // unused
    expect(totalDuration_).toHaveReturnedTimes(0)
    expect(totalThroughput_).toHaveReturnedTimes(0)

    const a = false ? totalThroughput() : undefined
    // not evaluated
    expect(a).toBeUndefined()
    expect(totalDuration_).toHaveReturnedTimes(0)
    expect(totalThroughput_).toHaveReturnedTimes(0)

    // evaluated, cache miss
    const b = true ? totalThroughput() : undefined
    expect(b).toBeDefined()
    expect(totalDuration_).toHaveReturnedTimes(1)
    expect(totalThroughput_).toHaveReturnedTimes(1)

    // evaluated, cache hit so still only called once
    const c = totalThroughput()
    expect(c).toBeDefined()
    expect(totalDuration_).toHaveReturnedTimes(1)
    expect(totalThroughput_).toHaveReturnedTimes(1)
  })
})
