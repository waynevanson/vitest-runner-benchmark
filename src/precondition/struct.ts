import { ConditionalKindWithContexts } from "./conditional"
import { CreatedKindWithContexts } from "./create"
import { DerivedKindWithContexts } from "./derived"
import { ContextsKind, SchemaKindWithContexts } from "./types"

export const STRUCT = Symbol("STRUCT")
export type STRUCT = typeof STRUCT

export interface Struct<
  Contexts extends ContextsKind,
  T extends Record<string, SchemaKindWithContexts<Contexts>>
> {
  entries: T
  type: STRUCT
  id: symbol
}

export type StructKindWithContexts<Contexts extends ContextsKind> = Struct<
  Contexts,
  Record<string, SchemaKindWithContexts<Contexts>>
>
export type StructKind = StructKindWithContexts<ContextsKind>

export function createStruct<Contexts extends ContextsKind>() {
  return function struct<
    T extends Record<
      string,
      | CreatedKindWithContexts<Contexts>
      | DerivedKindWithContexts<Contexts>
      // todo: make partial on output. true means required, false means removed, boolean means partial.
      | ConditionalKindWithContexts<Contexts>
    >
  >(entries: T): Struct<Contexts, T> {
    return {
      type: STRUCT,
      entries,
      id: Symbol()
    }
  }
}
