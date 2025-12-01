import { DefaultMap, HashMap } from "../hashmap"
import { Conditional, CONDITIONAL } from "./conditional"
import { Created, CREATED, CreatedKind } from "./create"
import { Derived, DERIVED, DerivedKind } from "./derived"
import { Struct, STRUCT } from "./struct"
import { ContextsKind, SchemaKindWithContexts } from "./types"

export type Id = symbol
export type Fn = (...args: any) => any

interface ParentObject {
  [key: string]: Parent | Id
}

type ParentArray = Array<Parent | Id>

type Parent = ParentObject
type Leaf = Parent | Id

export function createCompile<Contexts extends ContextsKind>() {
  return function compile<T extends SchemaKindWithContexts<Contexts>>(
    schema: T
  ) {
    // empty set means top of the graph
    const dependsOn = new DefaultMap<symbol, Set<symbol>>(() => new Set())
    const fns = new HashMap<Id, Fn>()
    const objects = new HashMap<symbol, Parent>()

    function resolve(object: Leaf, results: Map<Id, unknown>) {
      switch (typeof object) {
        case "symbol": {
          return results.get(object)!
        }
        case "object":
          if (object != null) {
            const result = {} as Record<string, unknown>

            for (const name in object) {
              result[name] = resolve(object[name], results)
            }

            return result
          }

        default:
          throw new Error("Cmon mate you can do it")
      }
    }

    function walk<T extends SchemaKindWithContexts<Contexts>>(
      schema: T,
      parent: Array<unknown> | Record<string, unknown> | undefined
    ) {
      switch (schema.type) {
        // just apply it
        case CREATED:
          fns.setOnce(schema.id, schema)
          break

        case DERIVED: {
          fns.setOnce(schema.id, schema)

          const friends = dependsOn.ensure(schema.id)

          for (const dep of schema.dependencies) {
            friends.add(dep.id)
            walk(dep, undefined)
          }

          break
        }

        case CONDITIONAL:
          if (!schema.condition) {
            return
          }

          walk(schema.fn, undefined)

          break

        case STRUCT: {
          // todo: how about nested parent objects?
          // we probably need to reference child objects
          const parent = {} as ParentObject
          objects.setOnce(schema.id, parent)

          const friends = dependsOn.ensure(schema.id)
          for (const name in schema.entries) {
            // schema
            const entry = schema.entries[name]

            if (entry.type !== CONDITIONAL || entry.condition) {
              parent[name] = entry.id

              friends.add(entry.id)

              walk(entry, parent)
            }
          }

          break
        }
        default:
          throw new Error("we bad boys")
      }
    }

    // first we need to traverse the whole schema and save stuff
    walk(schema, undefined)

    return function compiled(...contexts: Contexts): InferOutput<T> {
      // todo: what about derivations that implement structures?
      // we need to resolve an object
      const results = new Map<Id, unknown>()

      function applyFn(id: Id): unknown {
        if (!results.has(id)) {
          const dependencies = applyDependencies(id)
          const inputs = [...dependencies, ...contexts]
          const fn = fns.get(id)!
          results.set(id, fn(...inputs))
        }

        return results.get(id)!
      }

      function applyDependencies(id: Id): Array<unknown> {
        const result = []

        for (const dep of dependsOn.get(id) ?? new Set()) {
          result.push(applyFn(dep))
        }

        return result
      }

      // actuall call everything
      for (const id of fns.keys()) {
        applyFn(id)
      }

      // then walk through the leaves of an object, replacing ID's with actual values

      switch (schema.type) {
        case CONDITIONAL: {
          if (!schema.condition) {
            return undefined as never
          }
        }

        case CREATED:
        case DERIVED:
          return results.get(schema.id) as never

        case STRUCT:
          return resolve(objects.get(schema.id)!, results) as never

        default:
          throw new Error("We are not good boys")
      }
    }
  }
}

// how to partition required and non-required keys?
export type InferOutput<T> = T extends Created<any, infer Output>
  ? Output
  : T extends Conditional<any, infer Condition, infer Fn>
  ? boolean extends Condition
    ? undefined | InferOutput<Fn>
    : true extends Condition
    ? InferOutput<Fn>
    : undefined
  : T extends Struct<any, infer U>
  ? // ignore when false
    {
      [P in keyof U as U[P] extends
        | CreatedKind
        | DerivedKind
        | Struct<any, Record<string, never>>
        | Conditional<any, true, any>
        ? P
        : never]: InferOutput<U[P]>
    } & {
      [P in keyof U as U[P] extends Conditional<any, infer Condition, any>
        ? boolean extends Condition
          ? P
          : never
        : never]?: InferOutput<U[P]>
    }
  : T extends Derived<any, infer Output, any>
  ? Output
  : never
