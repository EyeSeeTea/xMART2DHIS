import { DataMart } from "../entities/XMart";

export interface ConnectionsRepository {
    listAll({ search }: ConnectionsFilter): Promise<DataMart[]>;

}

export interface ConnectionsFilter {
    search?: string;
}