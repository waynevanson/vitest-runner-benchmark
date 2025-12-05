import { InferOutput, Schema } from "./types"

export type ConditionalOutput<
  TCondition extends boolean,
  TDependsOn extends Schema<unknown>
> = false extends TCondition
  ? true extends TCondition
    ? InferOutput<TDependsOn> | undefined
    : undefined
  : InferOutput<TDependsOn>

export interface Conditional<TContext, _TOutput> {
  type: "Conditional"
  condition: boolean
  dependsOn: Schema<TContext>
}

export function conditional<
  TContext,
  TCondition extends boolean,
  TDependsOn extends Schema<TContext>
>(
  condition: TCondition,
  dependsOn: TDependsOn
): Conditional<TContext, ConditionalOutput<TCondition, TDependsOn>> {
  return { type: "Conditional", condition, dependsOn }
}
