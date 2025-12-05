import * as v from "valibot";
export declare const schema: v.OptionalSchema<v.ObjectSchema<{
    readonly benchmark: v.ExactOptionalSchema<v.ObjectSchema<{
        readonly minCycles: v.SchemaWithPipe<readonly [v.ExactOptionalSchema<v.NumberSchema<undefined>, 1>, v.MinValueAction<number, 1, undefined>]>;
        readonly minMs: v.SchemaWithPipe<readonly [v.ExactOptionalSchema<v.NumberSchema<undefined>, 0>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, {
        minCycles: 1;
        minMs: 0;
    }>;
    readonly warmup: v.ExactOptionalSchema<v.ObjectSchema<{
        readonly minCycles: v.SchemaWithPipe<readonly [v.ExactOptionalSchema<v.NumberSchema<undefined>, 0>, v.MinValueAction<number, 0, undefined>]>;
        readonly minMs: v.SchemaWithPipe<readonly [v.ExactOptionalSchema<v.NumberSchema<undefined>, 0>, v.MinValueAction<number, 0, undefined>]>;
    }, undefined>, {
        minCycles: 0;
        minMs: 0;
    }>;
    readonly results: v.ExactOptionalSchema<v.ObjectSchema<{
        readonly samples: v.ExactOptionalSchema<v.BooleanSchema<undefined>, false>;
        readonly latency: v.ExactOptionalSchema<v.ObjectSchema<{
            readonly average: v.ExactOptionalSchema<v.BooleanSchema<undefined>, false>;
            readonly min: v.ExactOptionalSchema<v.BooleanSchema<undefined>, false>;
            readonly max: v.ExactOptionalSchema<v.BooleanSchema<undefined>, false>;
            readonly percentiles: v.ExactOptionalSchema<v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.GtValueAction<number, 0, undefined>, v.LtValueAction<number, 1, undefined>]>, undefined>]>, number[]>;
        }, undefined>, {
            average: false;
            min: false;
            max: false;
            percentiles: number[];
        }>;
        readonly throughput: v.ExactOptionalSchema<v.ObjectSchema<{
            readonly average: v.ExactOptionalSchema<v.BooleanSchema<undefined>, false>;
            readonly min: v.ExactOptionalSchema<v.BooleanSchema<undefined>, false>;
            readonly max: v.ExactOptionalSchema<v.BooleanSchema<undefined>, false>;
            readonly percentiles: v.ExactOptionalSchema<v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.GtValueAction<number, 0, undefined>, v.LtValueAction<number, 1, undefined>]>, undefined>]>, number[]>;
        }, undefined>, {
            average: false;
            min: false;
            max: false;
            percentiles: number[];
        }>;
    }, undefined>, {
        samples: false;
        latency: {
            average: false;
            min: false;
            max: false;
            percentiles: number[];
        };
        throughput: {
            average: false;
            min: false;
            max: false;
            percentiles: number[];
        };
    }>;
}, undefined>, {
    benchmark: {
        minCycles: 1;
        minMs: 0;
    };
    warmup: {
        minCycles: 0;
        minMs: 0;
    };
    results: {
        samples: false;
        latency: {
            average: false;
            min: false;
            max: false;
            percentiles: number[];
        };
        throughput: {
            average: false;
            min: false;
            max: false;
            percentiles: number[];
        };
    };
}>;
export type VitestBenchRunnerUserConfig = v.InferInput<typeof schema>;
export type VitestBenchRunnerConfig = v.InferOutput<typeof schema>;
export type BenchRunnerMeta = {
    samples?: Array<number>;
    latency?: {
        min?: number;
        max?: number;
        average?: number;
        percentiles?: Record<string, number>;
    };
    throughput?: {
        min?: number;
        max?: number;
        average?: number;
        percentiles?: Record<string, number>;
    };
};
