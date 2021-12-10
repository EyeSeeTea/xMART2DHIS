import { UseCase } from "../../../compositionRoot";
import { UserSearch } from "../../entities/SearchUser";
import { InstanceRepository } from "../../repositories/InstanceRepository";

export class SearchUsersUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(query: string): Promise<UserSearch> {
        return this.instanceRepository.searchUsers(query);
    }
}
