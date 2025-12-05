export interface Get<_TContext> {
  type: "Get"
}

export function get<TContext>(): Get<TContext> {
  return { type: "Get" }
}

export interface Gets<TContext, TOutput> {
  type: "Gets"
  fn(context: TContext): TOutput
}

export function gets<TContext, TOutput>(
  fn: (context: TContext) => TOutput
): Gets<TContext, TOutput> {
  return { type: "Gets", fn }
}

export interface Derive<
  TContext,
  TDependsOn extends Schema<TContext>,
  TOutput
> {
  type: "Derive"
  fn(input: InferOutput<TDependsOn>): TOutput
  dependsOn: TDependsOn
}

export function derive<TContext, TDependsOn extends Schema<TContext>, TOutput>(
  dependsOn: TDependsOn,
  fn: (input: InferOutput<TDependsOn>) => TOutput
): Derive<TContext, TDependsOn, TOutput> {
  return { type: "Derive", dependsOn, fn }
}

export type Collapse<
  TCollapsable extends boolean,
  TOutput
> = false extends TCollapsable
  ? true extends TCollapsable
    ? TOutput | undefined
    : undefined
  : TOutput

export interface Conditional<
  TContext,
  TCondition extends boolean,
  TDepends extends Schema<TContext>
> {
  type: "Conditional"
  condition: TCondition
  dependsOn: TDepends
}

export function conditional<
  TContext,
  TCondition extends boolean,
  TDependsOn extends Schema<TContext>
>(
  condition: TCondition,
  dependsOn: TDependsOn
): Conditional<TContext, TCondition, TDependsOn> {
  return { type: "Conditional", condition, dependsOn }
}

export interface FMap<TContext, TDependsOn extends Schema<TContext>, TOutput> {
  type: "FMap"
  dependsOn: TDependsOn
  transform(input: InferOutput<TDependsOn>): TOutput
}

export function fmap<TContext, TDependsOn extends Schema<TContext>, TOutput>(
  dependsOn: TDependsOn,
  transform: (input: InferOutput<TDependsOn>) => TOutput
): FMap<TContext, TDependsOn, TOutput> {
  return {
    type: "FMap",
    dependsOn,
    transform
  }
}

export interface Collapsible<
  TContext,
  TDependsOn extends Record<string, Schema<TContext>>
> {
  type: "Collapsible"
  entries: TDependsOn
}

export function collapsible<
  TContext,
  TEntries extends Record<string, Schema<TContext>>
>(entries: TEntries): Collapsible<TContext, TEntries> {
  return {
    type: "Collapsible",
    entries
  }
}

export interface Structural<
  TContext,
  TEntries extends Record<string, Schema<TContext>>
> {
  type: "Structural"
  entries: TEntries
}

export function structural<
  TContext,
  TEntries extends Record<string, Schema<TContext>>
>(entries: TEntries): Structural<TContext, TEntries> {
  return { type: "Structural", entries }
}

export interface Tuple<TContext, TEntries extends Array<Schema<TContext>>> {
  type: "Tuple"
  entries: TEntries
}

export function tuple<TContext, TEntries extends Array<Schema<TContext>>>(
  entries: TEntries
): Tuple<TContext, TEntries> {
  return { type: "Tuple", entries }
}

export type InferContext<T> = T extends
  | Get<infer Context>
  | Gets<infer Context, any>
  | Derive<infer Context, any, any>
  | Conditional<infer Context, any, any>
  | FMap<infer Context, any, any>
  ? Context
  : never

export type InferOutput<T extends Schema<any>> = T extends
  | Get<infer Output>
  | Gets<any, infer Output>
  | Derive<any, any, infer Output>
  | FMap<any, any, infer Output>
  ? Output
  : T extends Conditional<any, any, infer TDependsOn>
  ? TDependsOn extends Schema<any>
    ? InferOutput<TDependsOn>
    : never
  : T extends Collapsible<any, infer TEntries>
  ? {
      [P in keyof TEntries as InferOutput<TEntries[P]> extends undefined
        ? never
        : P]: InferOutput<TEntries[P]>
    }
  : T extends Structural<any, infer TEntries> | Tuple<any, infer TEntries>
  ? {
      [P in keyof TEntries]: InferOutput<TEntries[P]>
    }
  : never

export type Schema<TContext> =
  | Get<TContext>
  | Gets<TContext, unknown>
  | Derive<TContext, Schema<TContext>, unknown>
  | Conditional<TContext, boolean, Schema<TContext>>
  | FMap<TContext, Schema<TContext>, unknown>
  | Collapsible<TContext, Record<string, Schema<TContext>>>
  | Structural<TContext, Record<string, Schema<TContext>>>
  | Tuple<TContext, Array<Schema<TContext>>>

export function apply<TContext, TSchema extends Schema<TContext>>(
  schema: TSchema,
  context: TContext
): InferOutput<TSchema> {
  const cache = new Map<Schema<TContext>, unknown>()

  function hit(schema: Schema<TContext>, onMiss: () => unknown): unknown {
    if (!cache.has(schema)) {
      cache.set(schema, onMiss())
    }

    return cache.get(schema)!
  }

  let rootReferenced = false

  function walk(schema: Schema<TContext>): unknown {
    switch (schema.type) {
      case "Get": {
        rootReferenced = true
        return context
      }
      case "Gets": {
        rootReferenced = true
        return hit(schema, () => schema.fn(context))
      }
      case "Derive": {
        const input = walk(schema.dependsOn)

        //@ts-expect-error recursion expected
        return hit(schema, () => schema.fn(input))
      }
      case "Conditional": {
        if (schema.condition) {
          return walk(schema.dependsOn)
        } else {
          return undefined
        }
      }
      case "FMap": {
        const input = walk(schema.dependsOn)
        return hit(schema, () => schema.transform(input))
      }
      case "Collapsible": {
        const object: Record<string, unknown> = {}
        let result: undefined | object = undefined

        for (const name in schema.entries) {
          const entry = schema.entries[name]
          const value = walk(entry)

          if (value !== undefined) {
            result = object
            object[name] = value
          }
        }

        return result
      }
      case "Structural": {
        const object: Record<string, unknown> = {}

        for (const name in schema.entries) {
          const entry = schema.entries[name]
          const value = walk(entry)

          object[name] = value
        }

        return object
      }
      case "Tuple": {
        const object: Array<unknown> = schema.entries.map(() => undefined)

        for (const name in schema.entries) {
          const entry = schema.entries[name]
          const value = walk(entry)

          object[name] = value
        }

        return object
      }
      default: {
        const _: never = schema
      }
    }
  }

  const root = walk(schema)

  if (!rootReferenced) {
    throw new Error("Root was not referenced")
  }

  return root as any
}

export function createApply<TContext, TSchema extends Schema<TContext>>(
  schema: TSchema
) {
  return function preapply(context: TContext): InferOutput<TSchema> {
    return apply(schema, context)
  }
}
