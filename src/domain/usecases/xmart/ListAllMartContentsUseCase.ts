import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { XMartContent } from "../../entities/XMart";
import { ListAllOptions, XMartEndpoint, XMartRepository } from "../../repositories/XMartRepository";

export class ListAllMartContentsUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(endpoint: XMartEndpoint, table: string, options?: ListAllOptions): FutureData<XMartContent[]> {
        return this.martRepository.listAll(endpoint, table, options);
    }
}
