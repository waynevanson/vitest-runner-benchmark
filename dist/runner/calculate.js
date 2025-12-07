import { collapse, conditional, memo } from "../utils.js";
export function calculate(config, context) {
    // side effect here will be okay.
    const sorted = memo(() => context.durations.sort());
    const rates = memo(() => sorted().map((duration) => 1 / duration));
    const totalDuration = memo(() => context.durations.reduce((accu, curr) => accu + curr, 0));
    const latencyAverage = memo(() => totalDuration() / context.durations.length);
    const latencyMin = memo(() => context.durations.reduce((accu, curr) => Math.min(accu, curr)));
    const latencyMax = memo(() => context.durations.reduce((accu, curr) => Math.max(accu, curr)));
    const throughputAverage = memo(() => context.cycles / totalDuration());
    const throughputMin = memo(() => context.cycles / (context.durations.length * latencyMax()));
    const throughputMax = memo(() => context.cycles / (context.durations.length * latencyMin()));
    const latencyPercentiles = memo(() => calculatePercentiles(sorted(), config.latency.percentiles));
    const latency = collapse({
        average: conditional(config.latency.average, latencyAverage),
        min: conditional(config.latency.min, latencyMin),
        max: conditional(config.latency.max, latencyMax),
        percentiles: conditional(config.latency.percentiles.length > 0, latencyPercentiles)
    });
    const throughputPercentiles = memo(() => calculatePercentiles(rates(), config.throughput.percentiles));
    const throughput = collapse({
        average: conditional(config.throughput.average, throughputAverage),
        min: conditional(config.throughput.min, throughputMin),
        max: conditional(config.throughput.max, throughputMax),
        percentiles: conditional(config.throughput.percentiles.length > 0, throughputPercentiles)
    });
    const schema = collapse({
        samples: conditional(config.samples, () => context.durations),
        latency,
        throughput
    });
    return schema;
}
// Thanks GPT
export function calculatePercentile(samples, percentile) {
    const m = samples.length - 1;
    const r = percentile * m;
    const i = Math.floor(r);
    const f = r - i;
    if (i === m) {
        return samples[i];
    }
    else {
        return samples[i] * (1 - f) + samples[i + 1] * f;
    }
}
export function calculatePercentiles(samples, percentiles) {
    return percentiles.reduce((accu, percentile) => {
        // 1, 01, 001, 90, 99, 999
        let name = percentile.toPrecision();
        if (name.length === 3) {
            name = percentile.toPrecision(2);
        }
        name = name.slice(2);
        const value = calculatePercentile(samples, percentile);
        accu[name] = value;
        return accu;
    }, {});
}
