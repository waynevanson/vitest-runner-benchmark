const CACHE_MISS = Symbol("CACHE_MISS");
export function memo(thunk) {
    let result = CACHE_MISS;
    return function get() {
        if (result === CACHE_MISS) {
            result = thunk();
        }
        return result;
    };
}
export function conditional(condition, lazy) {
    return condition ? lazy() : undefined;
}
export function collapse(object) {
    const result = {};
    let empty = true;
    for (const property in object) {
        const value = object[property];
        if (value === undefined) {
            continue;
        }
        empty = false;
        result[property] = value;
    }
    if (empty) {
        return undefined;
    }
    return result;
}
