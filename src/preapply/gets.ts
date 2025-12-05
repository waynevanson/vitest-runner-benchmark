export interface Gets<TContext, TOutput> {
  type: "Gets"
  fn(context: TContext): TOutput
}

export function gets<TContext, TOutput>(
  fn: (context: TContext) => TOutput
): Gets<TContext, TOutput> {
  return { type: "Gets", fn }
}
