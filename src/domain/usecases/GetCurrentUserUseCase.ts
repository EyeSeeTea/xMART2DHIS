import { UseCase } from "../../compositionRoot";
import { User } from "../entities/User";
import { InstanceRepository } from "../repositories/InstanceRepository";

export class GetCurrentUserUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(): Promise<User> {
        return this.instanceRepository.getCurrentUser();
    }
}
