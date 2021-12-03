import { Ref } from "../entities/metadata/Ref";

export interface StorageRepository {
    // Object operations
    getObject<T extends object>(key: string): Promise<T | undefined>;
    getOrCreateObject<T extends object>(key: string, defaultValue: T): Promise<T>;
    saveObject<T extends object>(key: string, value: T): Promise<void>;
    removeObject(key: string): Promise<void>;

    listObjectsInCollection<T extends Ref>(key: string): Promise<T[]>;
    getObjectInCollection<T extends Ref>(key: string, id: string): Promise<T | undefined>;
    saveObjectsInCollection<T extends Ref>(key: string, elements: T[]): Promise<void>;
    saveObjectInCollection<T extends Ref>(key: string, element: T): Promise<void>;
    removeObjectInCollection(key: string, id: string): Promise<void>;
    removeObjectsInCollection(key: string, ids: string[]): Promise<void>;
}
