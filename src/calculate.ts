type Calculation = {
  minimum_value?: number
  maximum_value?: number
  value: number
}

export interface Calculations {
  latency: Calculation
  throughput: Calculation
}

export function calculate(
  samples: Array<number>,
  cycles: number
): Calculations {
  const time = samples.reduce((accu, curr) => accu + curr, 0)

  const latency = {
    minimum_value: Math.min(...samples),
    maximum_value: Math.max(...samples),
    value: time / samples.length
  } satisfies Calculation

  const throughput = {
    value: cycles / time,
    minimum_value: cycles / (latency.maximum_value * samples.length),
    maximum_value: cycles / (latency.minimum_value * samples.length)
  } satisfies Calculation

  // todo: percentiles of these two measures.

  return { latency, throughput }
}
