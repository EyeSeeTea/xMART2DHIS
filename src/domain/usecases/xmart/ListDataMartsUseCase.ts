import { UseCase } from "../../../compositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { DataMart } from "../../entities/XMart";
import { XMartRepository } from "../../repositories/XMartRepository";

export class ListDataMartsUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(): FutureData<DataMart[]> {
        console.log(this.martRepository);

        // TODO: Hardcoded for now
        // return this.martRepository.listDataMarts(mart, table, options);
        return Future.success([
            {
                id: "TRAINING",
                name: "TRAINING",
                type: "UAT",
                apiUrl: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/TRAINING_ARC",
            },
            {
                id: "REFMART",
                name: "REFMART",
                type: "PUBLIC",
                apiUrl: "https://frontdoor-r5quteqglawbs.azurefd.net/REFMART",
            },
            {
                id: "REFMART-UAT",
                name: "REFMART-UAT",
                type: "UAT",
                apiUrl: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/REFMART",
            },
            {
                id: "REFMART-PROD",
                name: "REFMART-PROD",
                type: "PROD",
                apiUrl: "https://dev.eyeseetea.com/cors/extranet.who.int/xmart-api/odata/REFMART",
            },
        ]);
    }
}
