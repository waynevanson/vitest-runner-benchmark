import { ArgsCache, CACHE_MISS } from "./args-cache.js";
export function of(fn) {
    const cachemaps = new ArgsCache();
    const symbols = new Map();
    function from() {
        let symbol = cachemaps.get();
        if (symbol === CACHE_MISS) {
            symbol = cachemaps.set(...arguments);
            if (symbols.has(symbol)) {
                throw new Error(`Expected symbol not to exist`);
            }
            //@ts-expect-error
            const value = fn.call(this, ...arguments);
            symbols.set(symbol, value);
        }
        return symbols.get(symbol);
    }
    return from;
}
