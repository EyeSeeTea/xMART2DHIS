import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { DataMart, MartTable } from "../../entities/XMart";
import { XMartRepository } from "../../repositories/XMartRepository";

export class ListMartTablesUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(mart: DataMart): FutureData<MartTable[]> {
        return this.martRepository.listTables(mart);
    }
}
