import { InferOutput, Schema } from "./types";
export interface Collapsible<TContext, _TOutput> {
    type: "Collapsible";
    entries: Record<string, Schema<TContext>>;
}
export type CollapsibleOutput<TEntries extends Record<string, Schema<unknown>>> = {
    [P in keyof TEntries as InferOutput<TEntries[P]> extends undefined ? never : P]: InferOutput<TEntries[P]>;
};
export declare function collapsible<TContext, TEntries extends Record<string, Schema<TContext>>>(entries: TEntries): Collapsible<TContext, CollapsibleOutput<TEntries>>;
