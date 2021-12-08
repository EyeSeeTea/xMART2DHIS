import { UseCase } from "../../../compositionRoot";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";
import { FutureData } from "../../entities/Future";

export class DeleteConnectionsUseCase implements UseCase {
    constructor(private connectionsRepository: ConnectionsRepository) {}

    public execute(connectionIds: string[]): FutureData<void> {
        return this.connectionsRepository.delete(connectionIds);
    }
}
