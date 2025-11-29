import { ArgsCache, CACHE_MISS } from "./args-cache.js"

//  Basically create AST.
// Dependency graph of functions and values from functions.

export interface Memoized<Args extends ReadonlyArray<unknown>, U> {
  (...args: Args): U
}

export function of<Args extends ReadonlyArray<unknown>, U>(
  fn: (...args: Args) => U
): Memoized<Args, U> {
  const cachemaps = new ArgsCache()
  const symbols = new Map<symbol, U>()

  function from(): U {
    let symbol = cachemaps.get()

    if (symbol === CACHE_MISS) {
      symbol = cachemaps.set(...arguments)

      if (symbols.has(symbol)) {
        throw new Error(`Expected symbol not to exist`)
      }

      //@ts-expect-error
      const value = fn.call(this, ...arguments)

      symbols.set(symbol, value)
    }

    return symbols.get(symbol)!
  }

  return from
}
