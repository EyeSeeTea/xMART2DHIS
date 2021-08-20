import { UseCase } from "../../../compositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

// TODO: Rename file and use case to a more appropriate name
export class Action4UseCase implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) {}

    public execute(): FutureData<void> {
        // TODO: Implement use-case logic
        // Use mart repository to get the data from xMART
        // Use instance repository to save the data to DHIS2
        console.debug("Action 4", this.martRepository, this.instanceRepository);

        return Future.success(undefined);
    }
}
