const CACHE_MISS = Symbol("CACHE_MISS")

export function lazy<TOutput>(thunk: () => TOutput) {
  let result: typeof CACHE_MISS | TOutput = CACHE_MISS

  return function get(): TOutput {
    if (result === CACHE_MISS) {
      result = thunk()
    }

    return result
  }
}

export function conditional<TOutput>(
  condition: boolean,
  lazy: () => TOutput
): TOutput | undefined {
  return condition ? lazy() : undefined
}

export function collapse<T extends Partial<Record<string, unknown>>>(
  object: T
): T | undefined {
  const result = {} as Required<T>

  let empty = true
  for (const property in object) {
    const value = object[property]

    if (value === undefined) {
      continue
    }

    empty = false
    result[property] = value
  }

  if (empty) {
    return undefined
  }

  return result
}
