import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { DataMart, XMartContent } from "../../entities/xmart/DataMart";
import { ListAllOptions, XMartRepository } from "../../repositories/XMartRepository";

export class ListAllMartContentsUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(mart: DataMart, table: string, options?: ListAllOptions): FutureData<XMartContent[]> {
        return this.martRepository.listAllTableContent(mart, table, options);
    }
}
