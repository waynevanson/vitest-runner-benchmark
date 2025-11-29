export interface Calculation {
    minimum_value?: number;
    maximum_value?: number;
    value: number;
}
export interface Calculations extends Record<string, Calculation> {
}
export declare function calculate(samples: Array<number>, cycles: number): Calculations;
