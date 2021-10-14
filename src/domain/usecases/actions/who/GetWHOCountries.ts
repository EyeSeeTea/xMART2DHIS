import _ from "lodash";
import { FutureData } from "../../../entities/Future";
import { ImportResult } from "../../../entities/ImportResult";
import { buildTranslationItem, TranslationObject } from "../../../entities/TranslationObject";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { MetadataRepository } from "../../../repositories/MetadataRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

export default function action(
    martRepository: XMartRepository,
    metadataRepository: MetadataRepository,
    _instanceRepository: InstanceRepository,
    lang: string
): FutureData<ImportResult> {
    return martRepository.listAll("WHO_MULTIMEDIA", "countries", { sf_culture: lang }).flatMap(results => {
        const codes = results.map(item => {
            return item.Code as string;
        });

        const codeTranslation = Object.assign(
            {},
            results.map(item => {
                return {
                    [item.Code as string]: buildTranslationItem(
                        "NAME",
                        lang,
                        item.OfficialName as string
                    ) as TranslationObject,
                };
            })
        );

        const response$ = metadataRepository.getMetadata(codes).flatMap(payload => {
            /* payload["organisationUnits"]?.map(item => { }
            )
        
            payload["options"]?.map(item => { }
            ) */
            //const categoryOptions = payload["categoryOptions"];
            const categoryOptionCombos = payload["categoryOptions"] ? ["categoryOptionCombos"] : undefined;
            //const organisationUnits = payload["organisationUnits"];
            //const options = payload["options"];

            payload["organisationUnits"]?.map(organisationUnits => {
                return _.find(codeTranslation, obj => {
                    if (Object.keys(obj)[0] === organisationUnits.code) {
                        if (organisationUnits["translations"] === undefined) {
                            organisationUnits["translations"] = [];
                        } else {
                            //remove old value
                            _.find(organisationUnits["translations"],)
                        }
                        return organisationUnits["translations"].push(obj[organisationUnits.code]);
                    }
                });
            });

            payload["options"]?.map(option => {
                return _.find(codeTranslation, obj => {
                    if (Object.keys(obj)[0] === option.code) {
                        if (option["translations"] === undefined) {
                            option["translations"] = [];
                        } else {
                            //remove old value
                        }
                        return option["translations"].push(obj[option.code]);
                    }
                });
            });
            /* 
                        payload["categoryOptions"]?.map(categoryOption => {
                            //delete categoryOption.categories;
                            delete categoryOption.categoryOptionCombos;
                            delete categoryOption.categoryOptionGroups;
                            return categoryOption;
                        }); */
            payload["categoryOptions"]?.map(categoryOption => {
                return _.find(codeTranslation, obj => {
                    if (Object.keys(obj)[0] === categoryOption.code) {
                        if (categoryOption["translations"] === undefined) {
                            categoryOption["translations"] = [];
                        } else {
                            //remove old value
                        }
                        categoryOption["translations"].push(obj[categoryOption.code]);
                        /* categoryOption["categoryOptionCombos"].map((categoryOptionCombo: any) => { 
                            return categoryOptionCombo ? ["translations"].push(obj[categoryOption.code]);
                        }) */
                    }
                });
            });
            debugger;

            delete payload.system;
            console.log(categoryOptionCombos);
            //const values$ = categoryOptions?.flatMap(organisationUnits?.flatMap(options?.flatMap(categoryOptionCombos)))
            return metadataRepository.save(payload);
        });

        return response$;
    });
}
