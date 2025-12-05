export function apply(schema, context) {
    const cache = new Map();
    function hit(schema, onMiss) {
        if (!cache.has(schema)) {
            cache.set(schema, onMiss());
        }
        return cache.get(schema);
    }
    function walk(schema) {
        switch (schema.type) {
            case "Get": {
                return context;
            }
            case "Gets": {
                return hit(schema, () => schema.fn(context));
            }
            case "Derive": {
                const input = walk(schema.dependsOn);
                return hit(schema, () => schema.fn(input));
            }
            case "Conditional": {
                if (schema.condition) {
                    return walk(schema.dependsOn);
                }
                else {
                    return undefined;
                }
            }
            case "FMap": {
                const input = walk(schema.dependsOn);
                return hit(schema, () => schema.transform(input));
            }
            case "Collapsible": {
                const object = {};
                let result = undefined;
                for (const name in schema.entries) {
                    const entry = schema.entries[name];
                    const value = walk(entry);
                    if (value !== undefined) {
                        result = object;
                        object[name] = value;
                    }
                }
                return result;
            }
            case "Structural": {
                const object = {};
                for (const name in schema.entries) {
                    const entry = schema.entries[name];
                    const value = walk(entry);
                    object[name] = value;
                }
                return object;
            }
            case "Tuple": {
                const object = schema.entries.map(() => undefined);
                for (const name in schema.entries) {
                    const entry = schema.entries[name];
                    const value = walk(entry);
                    object[name] = value;
                }
                return object;
            }
            default: {
                const _ = schema;
            }
        }
    }
    return walk(schema);
}
export function createApply(schema) {
    return function preapply(context) {
        return apply(schema, context);
    };
}
