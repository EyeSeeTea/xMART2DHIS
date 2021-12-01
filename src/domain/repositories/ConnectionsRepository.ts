import { DataMart } from "../entities/XMart";

export interface ConnectionsRepository {
    listAll({ search }: ConnectionsFilter): Promise<DataMart[]>;
    save(instance: DataMart): Promise<void>;

}

export interface ConnectionsFilter {
    search?: string;
}
