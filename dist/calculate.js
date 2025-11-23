export function calculate(samples, cycles) {
    const time = samples.reduce((accu, curr) => accu + curr, 0);
    const latency = {
        minimum_value: Math.min(...samples),
        maximum_value: Math.max(...samples),
        value: time / samples.length
    };
    const throughput = {
        value: cycles / time,
        minimum_value: cycles / (latency.maximum_value * samples.length),
        maximum_value: cycles / (latency.minimum_value * samples.length)
    };
    // todo: percentiles of these two measures.
    return { latency, throughput };
}
