import { UseCase } from "../../../compositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { DataMart } from "../../entities/XMart";
import { XMartRepository } from "../../repositories/XMartRepository";

export class ListDataMartsUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(): FutureData<DataMart[]> {
        console.debug(this.martRepository);

        // TODO: Hardcoded for now
        // return this.martRepository.listDataMarts(mart, table, options);
        return Future.success([
            {
                id: "TRAINING",
                name: "[UAT] EST Playground",
                code: "TRAINING_ARC",
                type: "UAT",
                apiUrl: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/TRAINING_ARC",
            },
            {
                id: "TRAINING_RJ",
                name: "[UAT] NTD Playground",
                code: "TRAINING_RJ",
                type: "UAT",
                apiUrl: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/TRAINING_RJ",
            },
            {
                id: "REFMART-UAT",
                name: "[UAT] REFMART",
                code: "REFMART",
                type: "UAT",
                apiUrl: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/REFMART",
            },
            {
                id: "REFMART-UAT-PUBLIC",
                name: "[UAT] REFMART (Public)",
                code: "REFMART",
                type: "PUBLIC",
                apiUrl: "https://dev.eyeseetea.com/cors/frontdoor-r5quteqglawbs.azurefd.net/REFMART",
            },
            {
                id: "REFMART-PROD",
                name: "[PROD] REFMART",
                code: "REFMART",
                type: "PROD",
                apiUrl: "https://dev.eyeseetea.com/cors/extranet.who.int/xmart-api/odata/REFMART",
            },
            {
                id: "REFMART-PROD-PUBLIC",
                name: "[PROD] REFMART (Public)",
                code: "REFMART",
                type: "PUBLIC",
                apiUrl: "https://dev.eyeseetea.com/cors/frontdoor-l4uikgap6gz3m.azurefd.net/REFMART",
            },
        ]);
    }
}
