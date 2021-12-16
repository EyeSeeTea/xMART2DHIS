import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { XMartRepository, MartSuggestions } from "../../repositories/XMartRepository";

export class ListMartSuggestionsUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(): FutureData<MartSuggestions> {
        return this.martRepository.listMartSuggestions();
    }
}
