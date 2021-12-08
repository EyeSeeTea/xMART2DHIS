import { UseCase } from "../../../compositionRoot";
import { ConnectionData } from "../../entities/xmart/XMart";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";
import { FutureData } from "../../entities/Future";

export class SaveConnectionUseCase implements UseCase {
    constructor(private connectionsRepository: ConnectionsRepository) {}

    public execute(connection: ConnectionData): FutureData<void> {
        return this.connectionsRepository.save(connection);
    }
}
