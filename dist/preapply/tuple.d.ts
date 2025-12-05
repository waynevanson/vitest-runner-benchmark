import { InferOutput, Schema } from "./types";
export interface Tuple<TContext, _TOutput> {
    type: "Tuple";
    entries: ReadonlyArray<Schema<TContext>>;
}
export type TupleOutput<TEntries extends ReadonlyArray<Schema<unknown>>> = {
    [P in keyof TEntries]: InferOutput<TEntries[P]>;
};
export declare function tuple<TContext, TEntries extends ReadonlyArray<Schema<TContext>>>(entries: TEntries): Tuple<TContext, TupleOutput<TEntries>>;
