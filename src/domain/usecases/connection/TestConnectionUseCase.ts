import { UseCase } from "../../../compositionRoot";
import { Future } from "../../entities/Future";
import { CheckConnectionError } from "../../entities/xmart/CheckConnectionError";
import { DataMart } from "../../entities/xmart/DataMart";
import { XMartRepository } from "../../repositories/XMartRepository";

export class TestConnectionUseCase implements UseCase {
    constructor(private xMartRepository: XMartRepository) {}

    public execute(connection: DataMart): Future<CheckConnectionError, number> {
        return this.xMartRepository.checkConnection(connection);
    }
}
