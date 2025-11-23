type Calculation = {
    minimum_value?: number;
    maximum_value?: number;
    value: number;
};
export interface Calculations {
    latency: Calculation;
    throughput: Calculation;
}
export declare function calculate(samples: Array<number>, cycles: number): Calculations;
export {};
