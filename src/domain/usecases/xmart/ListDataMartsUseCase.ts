import { UseCase } from "../../../compositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { DataMart } from "../../entities/xmart/DataMart";
import { XMartRepository } from "../../repositories/XMartRepository";

export const dataMarts: DataMart[] = [
    {
        id: "TRAINING",
        name: "[UAT] EST Playground",
        martCode: "TRAINING_ARC",
        environment: "UAT",
        dataEndpoint: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/TRAINING_ARC",
    },
    {
        id: "TRAINING_RJ",
        name: "[UAT] NTD Playground",
        martCode: "TRAINING_RJ",
        environment: "UAT",
        dataEndpoint: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/TRAINING_RJ",
    },
    {
        id: "REFMART-UAT",
        name: "[UAT] REFMART",
        martCode: "REFMART",
        environment: "UAT",
        dataEndpoint: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/REFMART",
    },
    {
        id: "REFMART-UAT-PUBLIC",
        name: "[UAT] REFMART (Public)",
        martCode: "REFMART",
        environment: "UAT",
        dataEndpoint: "https://dev.eyeseetea.com/cors/frontdoor-r5quteqglawbs.azurefd.net/REFMART",
    },
    {
        id: "REFMART-PROD",
        name: "[PROD] REFMART",
        martCode: "REFMART",
        environment: "PROD",
        dataEndpoint: "https://dev.eyeseetea.com/cors/extranet.who.int/xmart-api/odata/REFMART",
    },
    {
        id: "REFMART-PROD-PUBLIC",
        name: "[PROD] REFMART (Public)",
        martCode: "REFMART",
        environment: "PROD",
        dataEndpoint: "https://dev.eyeseetea.com/cors/frontdoor-l4uikgap6gz3m.azurefd.net/REFMART",
    },
] as DataMart[];

export class ListDataMartsUseCase implements UseCase {
    constructor(private martRepository: XMartRepository) {}

    public execute(): FutureData<DataMart[]> {
        console.debug(this.martRepository);

        // TODO: HardmartCoded for now
        // return this.martRepository.listDataMarts(mart, table, options);
        return Future.success(dataMarts);
    }
}
