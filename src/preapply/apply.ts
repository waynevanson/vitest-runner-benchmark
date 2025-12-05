import { InferContext, InferOutput, Schema } from "./types"

export function apply<TSchema extends Schema<unknown>>(
  schema: TSchema,
  context: InferContext<TSchema>
): InferOutput<TSchema> {
  const cache = new Map<Schema<InferContext<TSchema>>, any>()

  function hit(schema: Schema<InferContext<TSchema>>, onMiss: () => any): any {
    if (!cache.has(schema)) {
      cache.set(schema, onMiss())
    }

    return cache.get(schema)!
  }

  function walk(schema: Schema<InferContext<TSchema>>): any {
    switch (schema.type) {
      case "Get": {
        return context
      }
      case "Gets": {
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

  return walk(schema)
}

export function createApply<TSchema extends Schema<unknown>>(schema: TSchema) {
  return function preapply(
    context: InferContext<TSchema>
  ): InferOutput<TSchema> {
    return apply(schema, context)
  }
}
