import { CreatedKindWithContexts, Created } from "./create"
import { DerivedKindWithContexts, Derived, DependenciesKind } from "./derived"
import { ContextsKind } from "./types"

export const CONDITIONAL = Symbol("CONDITIONAL")
export type CONDITIONAL = typeof CONDITIONAL

export interface Conditional<
  Contexts extends ContextsKind,
  Condition extends boolean,
  Fn extends
    | Created<Contexts, unknown>
    | Derived<Contexts, unknown, DependenciesKind>
> {
  condition: Condition
  type: CONDITIONAL
  fn: Fn
  id: symbol
}

export type ConditionalFnKindWithContexts<Contexts extends ContextsKind> =
  | CreatedKindWithContexts<Contexts>
  | DerivedKindWithContexts<ContextsKind>

export type ConditionalFnKind = ConditionalFnKindWithContexts<ContextsKind>

export type ConditionalKindWithContexts<Contexts extends ContextsKind> =
  Conditional<Contexts, boolean, ConditionalFnKindWithContexts<Contexts>>

export type ConditionalKind = ConditionalKindWithContexts<ContextsKind>

export function createConditional<Contexts extends ContextsKind>() {
  return function conditional<
    Condition extends boolean,
    Fn extends
      | Created<Contexts, unknown>
      | Derived<Contexts, unknown, ReadonlyArray<unknown>>
  >(condition: Condition, fn: Fn): Conditional<Contexts, Condition, Fn> {
    return {
      condition,
      fn,
      type: CONDITIONAL,
      id: Symbol()
    }
  }
}
