import { FutureData } from "../../../entities/Future";
import { ImportResult } from "../../../entities/ImportResult";
import { buildTranslationItem } from "../../../entities/TranslationObject";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { MetadataRepository } from "../../../repositories/MetadataRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

export default function action(
    martRepository: XMartRepository,
    metadataRepository: MetadataRepository,
    _instanceRepository: InstanceRepository
): FutureData<ImportResult> {
    return martRepository.listAll("WHO_MULTIMEDIA", "countries", { sf_culture: "es" }).flatMap(results => {
        console.log(results);
        const codes = results.map(item => {
            return item.Code as string
        })

        const codeTranslation: any[] = results.map(item => {
            return { code: item.Code, "translations": buildTranslationItem("name", "es", item.OfficialName as string) }
            //return { code: item.Code, name: item.OfficialName, shortName: item.OfficialName }
        })

        debugger;
        const response$ = metadataRepository.getMetadata(codes).flatMap(payload => {
            debugger;
            /* payload["organisationUnits"]?.map(item => { }
            )

            payload["options"]?.map(item => { }
            ) */
            console.log(codeTranslation);
            const categoryOptions = payload["categoryOptions"]
            const categoryOptionCombos = payload["categoryOptions"] ? ["categoryOptionCombos"] : ""
            const organisationUnits = payload["organisationUnits"]
            const options = payload["options"]
            console.log(categoryOptionCombos)
            console.log(categoryOptions)
            console.log(organisationUnits)
            console.log(options)
            console.log(payload)
            return metadataRepository.save(payload)
        });

        return response$;
    });
}
