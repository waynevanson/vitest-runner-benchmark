import { VitestBenchRunnerConfig, BenchRunnerMeta } from "./config";
export declare function createCalculator(config: VitestBenchRunnerConfig["results"]): (contex: {
    samples: Array<number>;
    cycles: number;
}) => BenchRunnerMeta;
export declare function calculatePercentile(samples: Array<number>, percentile: number): number;
