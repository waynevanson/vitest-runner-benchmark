export declare class HashMap<K, V> extends Map<K, V> {
    enforce(key: K): NonNullable<V>;
    setOnce(key: K, value: V): NonNullable<V>;
}
export declare class DefaultMap<K, V> extends HashMap<K, V> {
    private create;
    constructor(create: () => V, iterable?: Iterable<readonly [K, V]> | null);
    ensure(key: K): NonNullable<V>;
}
