import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { XMartTable } from "../../entities/XMart";
import { XMartEndpoint, XMartRepository } from "../../repositories/XMartRepository";

export class ListMartTablesUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(endpoint: XMartEndpoint): FutureData<XMartTable[]> {
        return this.martRepository.listTables(endpoint);
    }
}
