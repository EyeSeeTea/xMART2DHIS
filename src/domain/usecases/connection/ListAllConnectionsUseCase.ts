import { UseCase } from "../../../compositionRoot";
import { DataMart } from "../../entities/XMart";
import { ConnectionsRepository, ConnectionsFilter } from "../../repositories/ConnectionsRepository";

export class ListAllConnectionsUseCase implements UseCase {
    constructor(private connectionsRepository: ConnectionsRepository) {}

    public execute(filters: ConnectionsFilter = {}): Promise<DataMart[]> {
        return this.connectionsRepository.listAll(filters);
    }
}
