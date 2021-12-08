import { UseCase } from "../../../compositionRoot";
import { ConnectionData } from "../../entities/xmart/XMart";
import { ConnectionsRepository, ConnectionsFilter } from "../../repositories/ConnectionsRepository";
import { FutureData } from "../../entities/Future";

export class ListAllConnectionsUseCase implements UseCase {
    constructor(private connectionsRepository: ConnectionsRepository) {}

    public execute(filters: ConnectionsFilter = {}): FutureData<ConnectionData[]> {
        return this.connectionsRepository.listAll(filters);
    }
}
