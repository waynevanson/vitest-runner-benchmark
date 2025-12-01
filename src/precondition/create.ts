import { ContextsKind } from "./types"

export interface Created<Contexts extends ContextsKind, Output> {
  (...contexts: Contexts): Output
  type: "CREATED"
  id: symbol
}

export type CreatedKindWithContexts<Contexts extends ContextsKind> = Created<
  Contexts,
  unknown
>

export type CreatedKind = CreatedKindWithContexts<ContextsKind>

export function createCreate<Contexts extends ContextsKind>() {
  return function create<Output>(
    fn: (...contexts: Contexts) => Output
  ): Created<Contexts, Output> {
    function create(...contexts: Contexts): Output {
      return fn(...contexts)
    }

    create.id = Symbol()
    create.type = "CREATED" as const

    return create
  }
}
