import { UseCase } from "../../../compositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { SyncAction } from "../../entities/SyncAction";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { XMartRepository } from "../../repositories/XMartRepository";
import EntoDiscriminatingConcentrationUseCase from "./ento/EntoDiscriminatingConcentration";
import EntoIRIntensityConcentrationUseCase from "./ento/EntoIRIntensityConcentration";
import EntoIRMechanismsUseCase from "./ento/EntoIRMechanisms";
import EntoIRSynergistInsecticideUseCase from "./ento/EntoIRSynergistInsecticide";
import GHOLifeExpentancyAtAge60UseCase from "./gho/GHOLifeExpentancyAtAge60UseCase";
import GHOLifeExpentancyAtBirthUseCase from "./gho/GHOLifeExpentancyAtBirthUseCase";
import GHOLifeExpentancyHALEAtAge60UseCase from "./gho/GHOLifeExpentancyHALEAtAge60UseCase";
import GHOLifeExpentancyHALEAtBirthUseCase from "./gho/GHOLifeExpentancyHALEAtBirthUseCase";

export class GetActionsUseCase implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) {}

    public execute(): FutureData<SyncAction[]> {
        return Future.success([
            {
                id: "ento-ir-mechanisms",
                name: "ENTO IR Mechanisms",
                execute: () => EntoIRMechanismsUseCase(this.martRepository, this.instanceRepository),
            },
            {
                id: "ento-ir-synergist-insecticide",
                name: "ENTO IR Synergist Insecticide",
                execute: () => EntoIRSynergistInsecticideUseCase(this.martRepository, this.instanceRepository),
            },
            {
                id: "ento-ir-intensity-concentration",
                name: "ENTO IR Intensity Concentration",
                execute: () => EntoIRIntensityConcentrationUseCase(this.martRepository, this.instanceRepository),
            },
            {
                id: "ento-discriminating-concentration",
                name: "ENTO Discriminating Concentration",
                execute: () => EntoDiscriminatingConcentrationUseCase(this.martRepository, this.instanceRepository),
            },
            {
                id: "gho-life-expectancy-at-birth (years)",
                name: "GHO - Life expectancy at birth (years)",
                execute: () => GHOLifeExpentancyAtBirthUseCase(this.martRepository, this.instanceRepository),
            },
            {
                id: "gho-life-expectancy-at-age-60-years",
                name: "GHO - Life expectancy at age 60 years",
                execute: () => GHOLifeExpentancyAtAge60UseCase(this.martRepository, this.instanceRepository),
            },
            {
                id: "gho-life-expectancy-hale-at-birth (years)",
                name: "GHO - Life expectancy (HALE) at birth (years)",
                execute: () => GHOLifeExpentancyHALEAtBirthUseCase(this.martRepository, this.instanceRepository),
            },
            {
                id: "gho-life-expectancy-hale-at-age-60-years",
                name: "GHO - Life expectancy (HALE) at age 60 years",
                execute: () => GHOLifeExpentancyHALEAtAge60UseCase(this.martRepository, this.instanceRepository),
            },
        ]);
    }
}
