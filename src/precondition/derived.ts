import { InferOutput } from "./compile"
import { Created, CreatedKind, CreatedKindWithContexts } from "./create"
import { ContextsKind } from "./types"

// need to unfold the thing.
export const DERIVED = Symbol("DERIVED")
export type DERIVED = typeof DERIVED

export interface Derived<
  Contexts extends ContextsKind,
  Inputs extends Array<unknown>,
  Output
> {
  (...args: [...inputs: Inputs, ...contexts: Contexts]): Output
  dependencies: Inputs
  type: DERIVED
  id: symbol
}

export type InputsKind = Array<unknown>
export type DerivedKind = Derived<ContextsKind, InputsKind, unknown>

export function createDerived<Contexts extends ContextsKind>() {
  // make dependencies the input types
  return function derive<Inputs extends InputsKind, Output>(
    ...args: [
      ...schemas: {
        [P in keyof Inputs]:
          | Derived<Contexts, InputsKind, Inputs[P]>
          | Created<Contexts, Inputs[P]>
      },
      fn: (...args: [...inputs: Inputs, ...Contexts]) => Output
    ]
  ): Derived<Contexts, Inputs, Output> {
    const dependencies = args.slice(0, args.length - 1) as Inputs

    const fn = args[args.length - 1] as (
      ...args: [...inputs: Inputs, ...Contexts]
    ) => Output

    function derive(...args: [...inputs: Inputs, ...Contexts]) {
      return fn(...args)
    }

    derive.type = DERIVED
    derive.id = Symbol()
    derive.dependencies = dependencies

    return derive
  }
}
