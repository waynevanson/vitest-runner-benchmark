export class HashMap extends Map {
    enforce(key) {
        if (this.has(key)) {
            throw new Error(`Expected ${key} not to be present in HashMap`);
        }
        return this.get(key);
    }
    setOnce(key, value) {
        if (!this.has(key)) {
            this.set(key, value);
        }
        return this.get(key);
    }
}
export class DefaultMap extends HashMap {
    create;
    constructor(create, iterable) {
        super(iterable);
        this.create = create;
    }
    ensure(key) {
        if (!this.has(key)) {
            this.set(key, this.create());
        }
        return this.get(key);
    }
}
