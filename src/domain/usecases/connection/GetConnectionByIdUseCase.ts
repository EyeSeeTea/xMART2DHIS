import { UseCase } from "../../../compositionRoot";
import { DataMart, ConnectionData } from "../../entities/XMart";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";

export class GetConnectionByIdUseCase implements UseCase {
    constructor(private connectionsRepository: ConnectionsRepository) {}

    public execute(id: string): Promise<ConnectionData | undefined> {
        return this.connectionsRepository.getById(id);
    }
}
