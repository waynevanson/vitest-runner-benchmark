import { Collapsible, CollapsibleOutput } from "./collapsible";
import { Conditional, ConditionalOutput } from "./conditional";
import { Derive } from "./derive";
import { FMap } from "./fmap";
import { Get } from "./get";
import { Gets } from "./gets";
import { Structural, StructuralOutput } from "./structural";
import { Tuple, TupleOutput } from "./tuple";
import { InferOutput, Schema } from "./types";
export interface Contextualize<TContext> {
    get(): Get<TContext>;
    gets<TOutput>(fn: (context: TContext) => TOutput): Gets<TContext, TOutput>;
    derive<TDependsOn extends Schema<TContext>, TOutput>(dependsOn: TDependsOn, fn: (input: InferOutput<TDependsOn>) => TOutput): Derive<TContext, TOutput>;
    conditional<TCondition extends boolean, TDependsOn extends Schema<TContext>>(condition: TCondition, dependsOn: TDependsOn): Conditional<TContext, ConditionalOutput<TCondition, TDependsOn>>;
    structural<TEntries extends Record<string, Schema<TContext>>>(entries: TEntries): Structural<TContext, StructuralOutput<TEntries>>;
    collapsible<TEntries extends Record<string, Schema<TContext>>>(entries: TEntries): Collapsible<TContext, CollapsibleOutput<TEntries>>;
    tuple<TEntries extends ReadonlyArray<Schema<TContext>>>(entries: TEntries): Tuple<TContext, TupleOutput<TEntries>>;
    fmap<TDependsOn extends Schema<TContext>, TOutput>(dependsOn: TDependsOn, transform: (input: InferOutput<TDependsOn>) => TOutput): FMap<TContext, TOutput>;
}
export declare function contextualize<TContext>(): Contextualize<TContext>;
