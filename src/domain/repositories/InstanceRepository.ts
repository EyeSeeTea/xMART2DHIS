import { FutureData } from "../entities/Future";
import { UserSearch } from "../entities/SearchUser";
import { User } from "../entities/metadata/User";
import { Instance } from "../entities/instance/Instance";

export interface InstanceRepository {
    getInstance(): Instance;
    getBaseUrl(): string;
    getCurrentUser(): FutureData<User>;
    getInstanceVersion(): FutureData<string>;
    isAdmin(user: User): boolean;
    searchUsers(query: string): Promise<UserSearch>;
}
