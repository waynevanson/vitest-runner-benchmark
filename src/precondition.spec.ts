import { describe, expect, test, vi } from "vitest"
import { createOptions } from "./precondition"

// both are dynamic, but one set of inputs is for optimisation
//
// runtime => dynamic => output
// optimise for staticish conditions
//
// omit from output if false
describe("precondition", () => {
  const options = createOptions<[{ samples: Array<number>; cycles: number }]>()

  test("created", () => {
    const samples = options.create((inputs) => inputs.samples)

    const compiled = options.compile(samples)
    const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })
    expect(result).toStrictEqual([1, 3, 5, 7, 11])
  })

  describe("derive", () => {
    test("dependency only", () => {
      const time = options.create((inputs) =>
        inputs.samples.reduce((accu, curr) => accu + curr, 0)
      )

      const latency = options.derive(time, (time) => time * 2)

      // todo: moving the derive depenendencies to the top is causing some sort of type mismatch.
      const compiled = options.compile(latency)
      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })
      expect(result).toBe(54)
    })

    test("dependencies only", () => {
      const samples = options.create((inputs) => inputs.samples)

      const time = options.create((inputs) =>
        inputs.samples.reduce((accu, curr) => accu + curr, 0)
      )

      const latency = options.derive(
        time,
        samples,
        (time, samples) => time / samples.length
      )

      const compiled = options.compile(latency)
      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })
      expect(result).toBe(5.4)
    })

    test("dependencies and contexts", () => {
      const time = options.create((inputs) =>
        inputs.samples.reduce((accu, curr) => accu + curr, 0)
      )

      const latency = options.derive(
        time,
        (time, context) => time / context.samples.length
      )

      const compiled = options.compile(latency)
      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })
      expect(result).toBe(5.4)
    })
  })

  describe("conditional", () => {
    test("true", () => {
      const samples = options.create((inputs) => inputs.samples)
      const sampled = options.conditional(true as const, samples)

      const compiled = options.compile(sampled)
      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })
      expect(result).toStrictEqual([1, 3, 5, 7, 11])
    })

    test("false", () => {
      const samples = options.create((inputs) => inputs.samples)
      const sampled = options.conditional(false as const, samples)

      const compiled = options.compile(sampled)
      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })
      expect(result).toBeUndefined()
    })

    test("boolean", () => {
      const samples = options.create((inputs) => inputs.samples)
      const sampled = options.conditional(true as boolean, samples)

      const compiled = options.compile(sampled)
      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })
      expect(result).toStrictEqual([1, 3, 5, 7, 11])
    })

    test("true but composed", () => {
      const time = options.create((inputs) =>
        inputs.samples.reduce((accu, curr) => accu + curr, 0)
      )

      const throughput = options.derive(
        time,
        (time, inputs) => inputs.cycles / time
      )

      const structure = options.conditional(true, throughput)

      const compiled = options.compile(structure)

      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })

      expect(result).toBe(0.7407407407407407)
    })
  })

  describe("struct", () => {
    test.only("one field conditional true", () => {
      const samples = options.create((inputs) => inputs.samples)
      const sampled = options.conditional(true, samples)
      const struct = options.struct({
        sampled
      })

      const compiled = options.compile(struct)

      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })

      expect(result).toStrictEqual({
        sampled: [1, 3, 5, 7, 11]
      })
    })

    test.only("one field conditional false", () => {
      const samples = options.create((inputs) => inputs.samples)
      const sampled = options.conditional(false, samples)
      const struct = options.struct({
        sampled
      })

      const compiled = options.compile(struct)

      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })

      expect(result).toStrictEqual({})
    })

    test.only("one field conditional false boolean", () => {
      const samples = options.create((inputs) => inputs.samples)
      const sampled = options.conditional(false as boolean, samples)
      const struct = options.struct({
        sampled
      })

      const compiled = options.compile(struct)

      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })

      expect(result).toStrictEqual({})
    })

    test.only("one field conditional true boolean", () => {
      const samples = options.create((inputs) => inputs.samples)
      const sampled = options.conditional(true as boolean, samples)
      const struct = options.struct({
        sampled
      })

      const compiled = options.compile(struct)

      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })

      expect(result).toStrictEqual({
        sampled: [1, 3, 5, 7, 11]
      })
    })

    test("one field", () => {
      const config = {
        samples: true,
        // omit from output, but still use.
        latency: false,
        throughput: true
      }

      const samples = options.create((inputs) => inputs.samples)

      const time = options.create((inputs) =>
        inputs.samples.reduce((accu, curr) => accu + curr, 0)
      )

      const latency = options.derive(
        time,
        samples,
        (time, samples) => time / samples.length
      )

      const throughput = options.derive(
        time,
        (time, inputs) => inputs.cycles / time
      )

      // partial
      const structure = options.struct({
        // samples: options.conditional(config.samples, samples),
        // latency: options.conditional(config.latency, latency),
        throughput: options.conditional(config.throughput, throughput)
      })

      const compiled = options.compile(structure)

      const result = compiled({ samples: [1, 3, 5, 7, 11], cycles: 20 })

      // if the condition is true, we show it.
      // typ

      expect(result).toStrictEqual({
        throughput: 0.7407407407407407
      })
    })
  })
})
