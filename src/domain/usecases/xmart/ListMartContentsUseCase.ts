import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { DataMart, XMartResponse } from "../../entities/XMart";
import { ListXMartOptions, XMartRepository } from "../../repositories/XMartRepository";

export class ListMartContentsUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(mart: DataMart, table: string, options?: ListXMartOptions): FutureData<XMartResponse> {
        return this.martRepository.listTableContent(mart, table, options);
    }
}
