import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { User } from "../../entities/metadata/User";
import { InstanceRepository } from "../../repositories/InstanceRepository";

export class GetCurrentUserUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public execute(): FutureData<User> {
        return this.instanceRepository.getCurrentUser();
    }
}
