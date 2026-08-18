export declare class Persisted<T extends string = string> {
    #private;
    constructor(key: string, fallback: T, storage?: Storage | undefined);
    get current(): T;
    set current(v: T);
}
