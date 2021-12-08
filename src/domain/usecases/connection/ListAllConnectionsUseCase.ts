import { UseCase } from "../../../compositionRoot";
import { DataMart, ConnectionData } from "../../entities/XMart";
import { ConnectionsRepository, ConnectionsFilter } from "../../repositories/ConnectionsRepository";

export class ListAllConnectionsUseCase implements UseCase {
    constructor(private connectionsRepository: ConnectionsRepository) {}

    public execute(filters: ConnectionsFilter = {}): Promise<ConnectionData[]> {
        return this.connectionsRepository.listAll(filters);
    }
}
