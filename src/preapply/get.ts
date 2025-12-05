export interface Get<_TContext> {
  type: "Get"
}

export function get<TContext>(): Get<TContext> {
  return { type: "Get" }
}
