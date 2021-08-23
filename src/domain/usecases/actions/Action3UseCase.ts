import { UseCase } from "../../../compositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { ProgramEvent } from "../../entities/ProgramEvent";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

// TODO: Rename file and use case to a more appropriate name
export class Action3UseCase implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) {}

    public execute(): FutureData<void> {
        // TODO: Implement use-case logic
        // Use mart repository to get the data from xMART
        // Use instance repository to save the data to DHIS2
        console.debug("Action 3", this.martRepository, this.instanceRepository);

        this.martRepository.listAll("FACT_INTENSITY_TEST").run(
            options => {
                const event = options?.map(item => {
                    return <ProgramEvent>{
                        //event: item["TEST_ID"],
                        orgUnit: item["SITE_FK__SITE"],
                        program: "FUzFm6UEmRn",
                        status: "COMPLETED",
                        eventDate: item["Sys_CommitDateUtc"],
                        attributeOptionCombo: item["INSTITUTION_TYPE"],
                        programStage: "VkFvRbbpVng",
                        dataValues: [
                            {
                                dataElement: "mcRgVtgwevL",
                                value: item["ADJ_MORTALITY_PERCENT_1X"],
                            },
                            {
                                dataElement: "SPA9WRC0s7V",
                                value: item["CITATION"],
                            },
                            {
                                dataElement: "xiFX4d6U2WG",
                                value: item["INSECTICIDE_FK"],
                            },
                            {
                                dataElement: "l7iRc4fVcRO",
                                value: item["INSTITUTION_FK"],
                            },
                            {
                                dataElement: "nJGsnuqueOI",
                                value: item["MONTH_END"],
                            },
                            {
                                dataElement: "aNTjTSnE4n3",
                                value: item["MONTH_START"],
                            },
                            {
                                dataElement: "Dz489B9dDqQ",
                                value: item["MORTALITY_NUMBER"],
                            },
                            {
                                dataElement: "yo1z2WcralS",
                                value: item["MORTALITY_PERCENT"],
                            },
                            {
                                dataElement: "LFxCOJqeFxz",
                                value: item["NUMBER_MOSQ_CONTROL"],
                            },
                            {
                                dataElement: "NkFOQ7gLyqW",
                                value: item["MONTH_NUMBER_MOSQ_EXPEND"],
                            },
                            {
                                dataElement: "WJYxfzHrmQj",
                                value: item["PUB_LINK"],
                            },
                            {
                                dataElement: "z5o0lM2Cbus",
                                value: item["PUBLISHED"],
                            },
                            {
                                dataElement: "yGY1TUqZsNf",
                                value: item["SPECIES_CONTROL_FK"],
                            },
                            {
                                dataElement: "gXKPOItwUlb",
                                value: item["SPECIES_FK"],
                            },
                            {
                                dataElement: "gqhSHmY7Etl",
                                value: item["STAGE_ORIGIN_FK"],
                            },
                            {
                                dataElement: "v86CHHosXCi",
                                value: item["TEST_TIME_FK"],
                            },
                            {
                                dataElement: "NGU9TjLZcBg",
                                value: item["TEST_TYPE_FK"],
                            },
                            {
                                dataElement: "sxLgkqTWM1c",
                                value: item["YEAR_END"],
                            },
                            {
                                dataElement: "EvSWXtVdh6h",
                                value: item["YEAR_START"],
                            },
                        ],
                    };
                });
                this.instanceRepository.postEvents(event);
            },
            error => console.debug(error)
        );
        return Future.success(undefined);
    }
}

function 