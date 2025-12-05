import { InferOutput, Schema } from "./types"

export interface FMap<TContext, TOutput> {
  type: "FMap"
  dependsOn: Schema<TContext>
  transform(input: unknown): TOutput
}

export function fmap<TContext, TDependsOn extends Schema<TContext>, TOutput>(
  dependsOn: TDependsOn,
  transform: (input: InferOutput<TDependsOn>) => TOutput
): FMap<TContext, TOutput> {
  return {
    type: "FMap",
    dependsOn,
    transform
  }
}
