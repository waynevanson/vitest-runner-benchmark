import { Created } from "./create"
import { ContextsKind } from "./types"

export const DERIVED = Symbol("DERIVED")
export type DERIVED = typeof DERIVED

export interface Derived<
  Contexts extends ReadonlyArray<unknown>,
  Output,
  Dependencies extends ReadonlyArray<unknown>
> {
  fn(...args: [...dependencies: Dependencies, ...contexts: Contexts]): Output
  deps: {
    [P in keyof Dependencies]: Created<Contexts, Dependencies[P]>
  }
  type: DERIVED
  id: symbol
}

export type DerivedKindWithContexts<Contexts extends ContextsKind> = Derived<
  Contexts,
  unknown,
  DependenciesKind
>

export type DependenciesKind = ReadonlyArray<unknown>

export type DerivedKind = DerivedKindWithContexts<ContextsKind>

export function createDerived<Contexts extends ContextsKind>() {
  return function derive<Dependencies extends ReadonlyArray<unknown>, Output>(
    ...args: [
      ...dependencies: {
        [P in keyof Dependencies]:
          | Created<Contexts, Dependencies[P]>
          | Derived<Contexts, Dependencies[P], any>
      },
      fn: (
        ...args: [...dependencies: Dependencies, ...contexts: Contexts]
      ) => Output
    ]
  ): Derived<Contexts, Output, Dependencies> {
    const deps = args.slice(0, args.length - 1) as {
      [P in keyof Dependencies]: Created<Contexts, Dependencies[P]>
    }

    const fn = args[args.length - 1] as (
      ...args: [...dependencies: Dependencies, ...contexts: Contexts]
    ) => Output

    return {
      deps,
      fn,
      type: DERIVED,
      id: Symbol()
    }
  }
}
