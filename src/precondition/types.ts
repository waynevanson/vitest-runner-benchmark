import { ConditionalKind, ConditionalKindWithContexts } from "./conditional"
import { CreatedKind, CreatedKindWithContexts } from "./create"
import { DerivedKind } from "./derived"
import { StructKind, StructKindWithContexts } from "./struct"

export type SchemaKind =
  | CreatedKind
  | DerivedKind
  | ConditionalKind
  | StructKind

export type ContextsKind = Array<unknown>
