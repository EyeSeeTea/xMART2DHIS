import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { XMartResponse } from "../../entities/XMart";
import { ListOptions, XMartRepository } from "../../repositories/XMartRepository";

export class ListMartContentsUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(table: string, options?: ListOptions): FutureData<XMartResponse> {
        return this.martRepository.list(table, options);
    }
}
