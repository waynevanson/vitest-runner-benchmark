export function calculate(samples, cycles) {
    samples.sort();
    const time = samples.reduce((accu, curr) => accu + curr, 0);
    const latency = {
        minimum_value: samples.reduce((accu, curr) => Math.min(accu, curr)),
        maximum_value: samples.reduce((accu, curr) => Math.max(accu, curr)),
        value: time / samples.length
    };
    const throughput = {
        value: cycles / time,
        minimum_value: cycles / (latency.maximum_value * samples.length),
        maximum_value: cycles / (latency.minimum_value * samples.length)
    };
    // todo: percentiles of these two measures.
    const percentiles = calculatePercentiles(samples, [50, 70, 80, 90, 95, 98, 99]);
    return { latency, throughput, ...percentiles };
}
function calculatePercentiles(samples, percentiles) {
    const measures = {};
    for (const percentile of percentiles) {
        const name = `P${percentile}`;
        measures[name] = {
            value: calculatePercentile(samples, percentile)
        };
    }
    return measures;
}
// Thanks GPT
function calculatePercentile(samples, percentile) {
    samples.sort();
    const m = samples.length - 1;
    const r = (percentile / 100) * m;
    const i = Math.floor(r);
    const f = r - i;
    if (i === m) {
        return samples[i];
    }
    else {
        return samples[i] * (1 - f) + samples[i + 1] * f;
    }
}
