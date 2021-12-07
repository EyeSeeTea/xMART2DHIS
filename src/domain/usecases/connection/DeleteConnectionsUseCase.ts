import { UseCase } from "../../../compositionRoot";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";

export class DeleteConnectionsUseCase implements UseCase {
    constructor(private connectionsRepository: ConnectionsRepository) {}

    public execute(connectionIds: string[]): Promise<void> {
        return this.connectionsRepository.delete(connectionIds);
    }
}
