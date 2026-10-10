import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { DataMart } from "../../entities/xmart/DataMart";
import { XMartRepository } from "../../repositories/XMartRepository";

export class TestConnectionUseCase implements UseCase {
    constructor(private xMartRepository: XMartRepository) {}

    public execute(connection: DataMart): FutureData<number> {
        return this.xMartRepository.checkConnection(connection);
    }
}
