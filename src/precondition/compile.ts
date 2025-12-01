import { DefaultMap, HashMap } from "../hashmap"
import { CONDITIONAL, ConditionalKindWithContexts } from "./conditional"
import { CREATED, CreatedKindWithContexts } from "./create"
import { DERIVED, DerivedKindWithContexts } from "./derived"
import { STRUCT, StructKindWithContexts } from "./struct"
import { ContextsKind, SchemaKind } from "./types"

export type Id = symbol
export type Fn = (...args: any) => any

interface ParentObject {
  [key: string]: Parent | Id
}

type ParentArray = Array<Parent | Id>

type Parent = ParentObject
type Leaf = Parent | Id

export function createCompile<Contexts extends ContextsKind>() {
  return function compile<T extends SchemaKind>(schema: T) {
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

    function walk<
      T extends
        | CreatedKindWithContexts<Contexts>
        | DerivedKindWithContexts<Contexts>
        // todo: make partial on output. true means required, false means removed, boolean means partial.
        | ConditionalKindWithContexts<Contexts>
        | StructKindWithContexts<Contexts>
    >(schema: T, parent: Array<unknown> | Record<string, unknown> | undefined) {
      switch (schema.type) {
        // just apply it
        case CREATED:
          fns.setOnce(schema.id, schema)
          break

        case DERIVED: {
          fns.setOnce(schema.id, schema.fn)

          const friends = dependsOn.ensure(schema.id)

          for (const dep of schema.deps) {
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
          const parent = {} as ParentObject
          objects.setOnce(schema.id, parent)

          const friends = dependsOn.ensure(schema.id)
          for (const name in schema.entries) {
            // schema
            const entry = schema.entries[name]
            parent[name] = entry.type === CONDITIONAL ? entry.fn.id : entry.id

            friends.add(entry.id)

            walk(entry, parent)
          }

          break
        }
        default:
          throw new Error("we bad boys")
      }
    }

    // first we need to traverse the whole schema and save stuff
    walk(schema, undefined)

    return function compiled(...contexts: Contexts) {
      // todo: what about derivations that implement structures?
      // we need to resolve an object
      const results = new Map<Id, unknown>()

      function applyFn(id: Id): unknown {
        if (!results.has(id)) {
          const dependencies = applyDependencies(id)
          const inputs = [...dependencies, ...contexts]
          // console.log(inputs)
          const fn = fns.get(id)!
          results.set(id, fn(...inputs))
        }

        return results.get(id)!
      }

      function applyDependencies(id: Id): ReadonlyArray<unknown> {
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
            return
          }

          return results.get(schema.fn.id)
        }

        case CREATED:
        case DERIVED:
          return results.get(schema.id)!

        case STRUCT:
          return resolve(objects.get(schema.id)!, results)

        default:
          throw new Error("We are not good boys")
      }
    }
  }
}
