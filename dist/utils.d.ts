export declare function memo<TOutput>(thunk: () => TOutput): () => TOutput;
export declare function conditional<TOutput>(condition: boolean, lazy: () => TOutput): TOutput | undefined;
export declare function collapse<T extends Partial<Record<string, unknown>>>(object: T): T | undefined;
