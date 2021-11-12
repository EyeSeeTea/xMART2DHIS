import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { DataMart, XMartContent } from "../../entities/XMart";
import { ListAllOptions, XMartRepository } from "../../repositories/XMartRepository";

export class ListAllMartContentsUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(mart: DataMart, table: string, options?: ListAllOptions): FutureData<XMartContent[]> {
        return this.martRepository.listAll(mart, table, options);
    }
}
