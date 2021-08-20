import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { XMartTable } from "../../entities/XMart";
import { XMartRepository } from "../../repositories/XMartRepository";

export class ListMartTablesUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(): FutureData<XMartTable[]> {
        return this.martRepository.listTables();
    }
}
