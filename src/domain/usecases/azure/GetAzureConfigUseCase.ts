import { PublicClientApplication } from "@azure/msal-browser";
import { UseCase } from "../../../compositionRoot";
import { AzureRepository } from "../../repositories/AzureRepository";

export class GetAzureInstanceUseCase implements UseCase {
    constructor(private azureRepository: AzureRepository) {}

    public execute(): PublicClientApplication {
        return this.azureRepository.getInstance();
    }
}
