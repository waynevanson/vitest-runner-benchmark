export declare const CACHE_MISS: unique symbol;
export type CACHE_MISS = typeof CACHE_MISS;
/**
 * @summary
 * Hashes the following together into a symbol.
 */
export declare class ArgsCache {
    private cache;
    private empty;
    get(...args: any): symbol | CACHE_MISS;
    set(...args: any): symbol;
    has(...args: any): boolean;
}
