import { contextualize, createApply } from "../preapply"
import { VitestBenchRunnerConfig, BenchRunnerMeta } from "./config"

export function createCalculator(
  config: VitestBenchRunnerConfig["results"]
): (contex: { samples: Array<number>; cycles: number }) => BenchRunnerMeta {
  const c = contextualize<{ samples: Array<number>; cycles: number }>()
  const context = c.get()

  const duration = c.gets((context) =>
    context.samples.reduce((accu, curr) => accu + curr, 0)
  )

  const latencyAverage = c.derive(
    c.structural({ context, duration }),
    ({ context, duration }) => duration / context.samples.length
  )

  const latencyMin = c.gets((context) =>
    context.samples.reduce((accu, curr) => Math.min(accu, curr))
  )

  const latencyMax = c.gets((context) =>
    context.samples.reduce((accu, curr) => Math.max(accu, curr))
  )

  const throughputAverage = c.derive(
    c.structural({ context, duration }),
    ({ context, duration }) => context.cycles / duration
  )

  const throughputMin = c.derive(
    c.structural({ context, latencyMax }),
    ({ context, latencyMax }) =>
      context.cycles / (context.samples.length * latencyMax)
  )

  const throughputMax = c.derive(
    c.structural({ context, latencyMin }),
    ({ context, latencyMin }) =>
      context.cycles / (context.samples.length * latencyMin)
  )

  const latencyPercentiles = c.gets((context) =>
    calcPer(context.samples, config.latency.percentiles)
  )

  const latency = c.collapsible({
    average: c.conditional(config.latency.average, latencyAverage),
    min: c.conditional(config.latency.min, latencyMin),
    max: c.conditional(config.latency.max, latencyMax),
    percentiles: c.conditional(
      config.latency.percentiles.length > 0,
      latencyPercentiles
    )
  })

  const cyclomes = c.gets((context) =>
    context.samples.map((duration) => 1 / duration)
  )

  function calcPer(samples: Array<number>, percentiles: Array<number>) {
    return percentiles.reduce((accu, percentile) => {
      let name = percentile.toPrecision()
      if (name.length === 3) {
        name = percentile.toPrecision(2)
      }
      name = name.slice(2)

      const value = calculatePercentile(samples, percentile)
      accu[name] = value
      return accu
    }, {} as Record<string, number>)
  }

  const throughputPercentiles = c.derive(cyclomes, (cyclomes) =>
    calcPer(cyclomes, config.throughput.percentiles)
  )

  const throughput = c.collapsible({
    average: c.conditional(config.throughput.average, throughputAverage),
    min: c.conditional(config.throughput.min, throughputMin),
    max: c.conditional(config.throughput.max, throughputMax),
    percentiles: c.conditional(
      config.throughput.percentiles.length > 0,
      throughputPercentiles
    )
  })

  const schema = c.collapsible({
    samples: c.conditional(
      config.samples,
      c.gets((context) => context.samples)
    ),
    latency,
    throughput
  })

  return createApply(schema)
}

// for thoughput, we need to change each sample to be a percentage of the cycle or somthing 1/sample ?
// Thanks GPT
export function calculatePercentile(
  samples: Array<number>,
  percentile: number
): number {
  const m = samples.length - 1

  const r = percentile * m
  const i = Math.floor(r)
  const f = r - i

  if (i === m) {
    return samples[i]
  } else {
    return samples[i] * (1 - f) + samples[i + 1] * f
  }
}
