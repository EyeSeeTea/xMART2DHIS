import { User } from "../entities/User";

export interface InstanceRepository {
    getCurrentUser(): Promise<User>;
    getInstanceVersion(): Promise<string>;
}
