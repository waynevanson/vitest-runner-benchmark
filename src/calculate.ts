export interface Calculation {
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
    minimum_value: samples.reduce((accu, curr) => Math.min(accu, curr)),
    maximum_value: samples.reduce((accu, curr) => Math.max(accu, curr)),
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

function calculatePercentilesLatency() {}

function calculatePercentileSum(
  samples: Array<number>,
  percentile: number
): number {
  // percentile => (0, length] -> (0, 100]
  function scale(value: number) {
    return (value * samples.length) / 100
  }

  const float = scale(percentile)
  const wholeIndex = Math.ceil(float)

  const aa = samples.slice(wholeIndex)
  const whole = aa.reduce((accu, curr) => accu + curr, 0)
  // todo: get the remainding floating bit at the bottom

  return whole / aa.length
}
