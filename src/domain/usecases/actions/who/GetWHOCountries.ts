import { Future, FutureData } from "../../../entities/Future";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

export default function action(
    martRepository: XMartRepository,
    _instanceRepository: InstanceRepository
): FutureData<undefined> {
    return martRepository.listAll("WHO_MULTIMEDIA", "countries", { sf_culture: "es" }).flatMap(results => {
        console.log(results);
        
        return Future.success(undefined);
    });
}
