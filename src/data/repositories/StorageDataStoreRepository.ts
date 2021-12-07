import { Instance } from "../../domain/entities/Instance";
import { D2Api, DataStore, DataStoreKeyMetadata } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { dataStoreNamespace } from "../utils/Namespaces";
import { ObjectSharing, StorageDefaultRepository } from "./StorageDefaultRepository";

export class StorageDataStoreRepository extends StorageDefaultRepository {
    private api: D2Api;
    private dataStore: DataStore;

    constructor(type: "user" | "global", instance: Instance) {
        super();
        this.api = getD2APiFromInstance(instance);
        this.dataStore =
            type === "user" ? this.api.userDataStore(dataStoreNamespace) : this.api.dataStore(dataStoreNamespace);
    }

    public async getObject<T extends object>(key: string): Promise<T | undefined> {
        const value = await this.dataStore.get<T>(key).getData();
        return value;
    }

    public async getOrCreateObject<T extends object>(key: string, defaultValue: T): Promise<T> {
        const value = await this.getObject<T>(key);
        if (!value) await this.saveObject(key, defaultValue);
        return value ?? defaultValue;
    }

    public async saveObject<T extends object>(key: string, value: T): Promise<void> {
        await this.dataStore.save(key, value).getData();
    }

    public async removeObject(key: string): Promise<void> {
        try {
            await this.dataStore.delete(key).getData();
        } catch (error: any) {
            if (!error.response || error.response.status !== 404) {
                throw error;
            }
        }
    }

    public async getObjectSharing(key: string): Promise<ObjectSharing | undefined> {
        const metadata = await this.getMetadataByKey(key);
        if (!metadata) return undefined;

        return {
            user: { name: "", ...metadata.user },
            userAccesses: metadata.userAccesses,
            userGroupAccesses: metadata.userGroupAccesses,
            publicAccess: metadata.publicAccess,
            externalAccess: metadata.externalAccess,
        };
    }

    public async saveObjectSharing(key: string, object: ObjectSharing): Promise<void> {
        const metadata = await this.getMetadataByKey(key);
        if (!metadata) return;

        await this.api.sharing.post({ type: "dataStore", id: metadata.id }, object).getData();
    }

    private async getMetadataByKey(key: string): Promise<DataStoreKeyMetadata | undefined> {
        try {
            const data = await this.dataStore.getMetadata(key).getData();
            if (!data) throw new Error(`Invalid dataStore key ${key}`);

            return data;
        } catch (error: any) {
            console.error(error);
            return undefined;
        }
    }
}
