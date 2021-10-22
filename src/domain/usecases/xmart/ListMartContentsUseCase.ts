import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { XMartResponse } from "../../entities/XMart";
import { ListXMartOptions, XMartEndpoint, XMartRepository } from "../../repositories/XMartRepository";

export class ListMartContentsUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(endpoint: XMartEndpoint, table: string, options?: ListXMartOptions): FutureData<XMartResponse> {
        return this.martRepository.list(endpoint, table, options);
    }
}
