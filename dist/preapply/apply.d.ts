import { InferContext, InferOutput, Schema } from "./types";
export declare function apply<TSchema extends Schema<unknown>>(schema: TSchema, context: InferContext<TSchema>): InferOutput<TSchema>;
export declare function createApply<TSchema extends Schema<unknown>>(schema: TSchema): (context: InferContext<TSchema>) => InferOutput<TSchema>;
