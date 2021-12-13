import { UseCase } from "../../../compositionRoot";
import { DataMart } from "../../entities/xmart/DataMart";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";
import { FutureData } from "../../entities/Future";

export class SaveConnectionUseCase implements UseCase {
    constructor(private connectionsRepository: ConnectionsRepository) {}

    public execute(connection: DataMart): FutureData<void> {
        return this.connectionsRepository.save(connection);
    }
}
