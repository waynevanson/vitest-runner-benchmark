import { InferOutput, Schema } from "./types";
export interface Structural<TContext, _TOutput> {
    type: "Structural";
    entries: Record<string, Schema<TContext>>;
}
export type StructuralOutput<TEntries extends Record<string, Schema<unknown>>> = {
    [P in keyof TEntries]: InferOutput<TEntries[P]>;
};
export declare function structural<TContext, TEntries extends Record<string, Schema<TContext>>>(entries: TEntries): Structural<TContext, StructuralOutput<TEntries>>;
