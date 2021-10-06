import { Future, FutureData } from "../../../entities/Future";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { MetadataRepository } from "../../../repositories/MetadataRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

export default function action(
    martRepository: XMartRepository,
    metadataRepository: MetadataRepository,
    _instanceRepository: InstanceRepository
): FutureData<undefined> {
    return martRepository.listAll("WHO_MULTIMEDIA", "countries", { sf_culture: "es" }).flatMap(results => {
        console.log(results);
        debugger;
        metadataRepository.getOrganisationUnit(["er", "32"]);
        return Future.success(undefined);
    });
}
