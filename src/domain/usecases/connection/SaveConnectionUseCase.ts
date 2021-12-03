import { UseCase } from "../../../compositionRoot";
import { DataMart } from "../../entities/XMart";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";

export class SaveConnectionUseCase implements UseCase {
    constructor(private connectionsRepository: ConnectionsRepository) {}

    public execute(connections: Omit<DataMart, "id">[]): Promise<void> {
        return this.connectionsRepository.save(connections);
    }
}
