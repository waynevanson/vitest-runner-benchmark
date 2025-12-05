import { InferOutput, Schema } from "./types"

export interface Derive<TContext, TOutput> {
  type: "Derive"
  fn(input: unknown): TOutput
  dependsOn: Schema<TContext>
}

export function derive<
  const TContext,
  const TDependsOn extends Schema<TContext>,
  const TOutput
>(
  dependsOn: TDependsOn,
  fn: (input: InferOutput<TDependsOn>) => TOutput
): Derive<TContext, TOutput> {
  return { type: "Derive", dependsOn, fn }
}
