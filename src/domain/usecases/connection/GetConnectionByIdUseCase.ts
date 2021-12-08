import { UseCase } from "../../../compositionRoot";
import { ConnectionData } from "../../entities/xmart/XMart";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";
import { FutureData } from "../../entities/Future";

export class GetConnectionByIdUseCase implements UseCase {
    constructor(private connectionsRepository: ConnectionsRepository) {}

    public execute(id: string): FutureData<ConnectionData> {
        return this.connectionsRepository.getById(id);
    }
}
