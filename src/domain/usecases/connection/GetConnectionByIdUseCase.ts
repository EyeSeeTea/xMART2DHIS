import { UseCase } from "../../../compositionRoot";
import { DataMart } from "../../entities/xmart/DataMart";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";
import { FutureData } from "../../entities/Future";

export class GetConnectionByIdUseCase implements UseCase {
    constructor(private connectionsRepository: ConnectionsRepository) {}

    public execute(id: string): FutureData<DataMart> {
        return this.connectionsRepository.getById(id);
    }
}
