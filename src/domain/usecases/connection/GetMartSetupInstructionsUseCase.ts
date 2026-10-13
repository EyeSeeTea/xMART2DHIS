import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { MartSetupInstructions } from "../../entities/xmart/MartSetupInstructions";
import { XMartRepository } from "../../repositories/XMartRepository";

export class GetMartSetupInstructionsUseCase implements UseCase {
    constructor(private xMartRepository: XMartRepository) {}

    public execute(): FutureData<MartSetupInstructions> {
        return this.xMartRepository.getSetupInstructions();
    }
}
