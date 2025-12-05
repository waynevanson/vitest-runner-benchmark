import { Collapsible } from "./collapsible"
import { Conditional } from "./conditional"
import { Derive } from "./derive"
import { FMap } from "./fmap"
import { Get } from "./get"
import { Gets } from "./gets"
import { Structural } from "./structural"
import { Tuple } from "./tuple"

export type InferOutput<T extends Schema<unknown>> = T extends
  | Collapsible<any, infer Output>
  | Conditional<any, infer Output>
  | Derive<any, infer Output>
  | FMap<any, infer Output>
  | Get<infer Output>
  | Gets<any, infer Output>
  | Structural<any, infer Output>
  | Tuple<any, infer Output>
  ? Output
  : never

export type Schema<TContext> =
  | Collapsible<TContext, Record<string, Schema<TContext>>>
  | Conditional<TContext, unknown>
  | Derive<TContext, unknown>
  | FMap<TContext, unknown>
  | Get<TContext>
  | Gets<TContext, unknown>
  | Structural<TContext, Record<string, Schema<TContext>>>
  | Tuple<TContext, Array<Schema<TContext>>>
