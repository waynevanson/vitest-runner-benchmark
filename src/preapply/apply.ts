import { InferOutput, Schema } from "./types"

export function apply<TContext, TSchema extends Schema<TContext>>(
  schema: TSchema,
  context: TContext
): InferOutput<TSchema> {
  const cache = new Map<Schema<TContext>, any>()

  function hit(schema: Schema<TContext>, onMiss: () => any): any {
    if (!cache.has(schema)) {
      cache.set(schema, onMiss())
    }

    return cache.get(schema)!
  }

  let rootReferenced = false

  function walk(schema: Schema<TContext>): any {
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
        const object: Record<string, any> = {}
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
        const object: Record<string, any> = {}

        for (const name in schema.entries) {
          const entry = schema.entries[name]
          const value = walk(entry)

          object[name] = value
        }

        return object
      }
      case "Tuple": {
        const object: Array<any> = schema.entries.map(() => undefined)

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

export function createApply<
  TContext extends any,
  TSchema extends Schema<TContext>
>(schema: TSchema) {
  return function preapply(context: TContext): InferOutput<TSchema> {
    return apply(schema, context)
  }
}
