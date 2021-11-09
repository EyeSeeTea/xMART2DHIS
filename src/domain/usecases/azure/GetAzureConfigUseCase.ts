import { Configuration } from "@azure/msal-browser";
import { UseCase } from "../../../compositionRoot";
import { AzureRepository } from "../../repositories/AzureRepository";

export class GetAzureConfigUseCase implements UseCase {
    constructor(private azureRepository: AzureRepository) {}

    public execute(): Configuration {
        return this.azureRepository.getConfig();
    }
}
