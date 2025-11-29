export interface Memoized<Args extends ReadonlyArray<unknown>, U> {
    (...args: Args): U;
}
export declare function of<Args extends ReadonlyArray<unknown>, U>(fn: (...args: Args) => U): Memoized<Args, U>;
