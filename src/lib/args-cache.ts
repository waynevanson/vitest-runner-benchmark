type ArgsItem = [args: Array<WeakRef<any>>, symbol: symbol]

export const CACHE_MISS = Symbol("NONE")
export type CACHE_MISS = typeof CACHE_MISS

/**
 * @summary
 * Hashes the following together into a symbol.
 */
// todo: add type system integration
export class ArgsCache {
  private cache = new Map<number, Array<ArgsItem>>()
  private empty: undefined | symbol

  get(...args: any): symbol | CACHE_MISS
  get() {
    if (arguments.length === 0) {
      return this.empty
    }

    const combinations = this.cache.get(arguments.length)
    if (!combinations) return

    for (const [args, symbol] of combinations) {
      let hit = true

      for (let index = 0; index < arguments.length; index++) {
        const a = arguments[index]
        const b = args[index].deref()

        if (!Object.is(a, b)) {
          hit = false
          break
        }
      }

      if (hit) {
        return symbol
      }
    }

    return CACHE_MISS
  }

  set(...args: any): symbol
  set() {
    if (this.has.call(this, ...arguments)) {
      throw new Error(`Expected arguments not to exist in the cache`)
    }

    if (!this.cache.has(arguments.length)) {
      this.cache.set(arguments.length, [])
    }

    const args = Array.from(arguments, (value) => new WeakRef(value))

    const symbol = Symbol()
    this.cache.get(arguments.length)!.push([args, symbol])

    return symbol
  }

  has(...args: any): boolean
  has(): boolean {
    return this.get.call(this, ...arguments) === undefined
  }
}
