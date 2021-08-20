import { UseCase } from "../../../compositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { ProgramEvent } from "../../entities/ProgramEvent";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

// TODO: Rename file and use case to a more appropriate name
export class Action1UseCase implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) { }

    public execute(): FutureData<void> {
        // TODO: Implement use-case logic
        // Use mart repository to get the data from xMART
        // Use instance repository to save the data to DHIS2

        this.martRepository.listAll("FACT_MOLECULAR_TEST").run(
            options => {
                const event = options?.map(item => {
                    return <ProgramEvent>{
                        //event: item["TEST_ID"],
                        orgUnit: item["SITE_FK__SITE"],
                        program: "Rw3oD4ExD8U",
                        status: "COMPLETED",
                        eventDate: item["Sys_CommitDateUtc"],
                        attributeOptionCombo: item["INSTITUTION_TYPE"],
                        programStage: "GeOxsjpEjSY",
                        dataValues: [
                            {
                                dataElement: "yGY1TUqZsNf",
                                value: item["SPECIES_CONTROL_FK__CODE"],
                            },
                            {
                                dataElement: "gXKPOItwUlb",
                                value: item["SPECIES_FK__CODE"],
                            },
                            {
                                dataElement: "gqhSHmY7Etl",
                                value: item["STAGE_ORIGIN_FK__CODE"],
                            },
                            {
                                dataElement: "sxLgkqTWM1c",
                                value: item["YEAR_END"],
                            },
                            {
                                dataElement: "EvSWXtVdh6h",
                                value: item["YEAR_START"],
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
                                dataElement: "l7iRc4fVcRO",
                                value: item["INSTITUTION_FK"],
                            },
                            {
                                dataElement: "Gwa8bf0Xh6Z",
                                value: item["ADJ_MORTALITY_PERCENT_1X"],
                            },
                            {
                                dataElement: "Gwa8bf0Xh6Z",
                                value: item["CITATION"],
                            },
                            {
                                dataElement: "l7iRc4fVcRO",
                                value: item["INSECTICIDE_FK"],
                            },
                            {
                                dataElement: "FvbJ0tU5elQ",
                                value: item["IR_STATUS_FK"],
                            },
                            {
                                dataElement: "NGU9TjLZcBg",
                                value: item["METHOD_DETAILS"],
                            },
                            {
                                dataElement: "i4KoaSwzufn",
                                value: item["MORTALITY_CONTROL"],
                            },
                            {
                                dataElement: "RosQioM91PZ",
                                value: item["MORTALITY_NUMBER"],
                            },
                            {
                                dataElement: "d2yWBe9n1wr",
                                value: item["MORTALITY_PERCENT"],
                            },
                            {
                                dataElement: "L42iFDUW1h7",
                                value: item["NUMBER_MOSQ_CONTROL"],
                            },
                            {
                                dataElement: "FhshaqyCFQw",
                                value: item["NUMBER_MOSQ_EXP"],
                            },
                            {
                                dataElement: "WJYxfzHrmQj",
                                value: item["PUB_LINK"],
                            },
                            {
                                dataElement: "WJYxfzHrmQj",
                                value: item["SPECIES_CONTROL_FK"],
                            },
                            {
                                dataElement: "WJYxfzHrmQj",
                                value: item["PUB_LINK"],
                            },
                            {
                                dataElement: "v86CHHosXCi",
                                value: item["TEST_TIME_FK"],
                            },
                            {
                                dataElement: "NGU9TjLZcBg",
                                value: item["TEST_TYPE_FK"],
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
