import { UseCase } from "../../../compositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { SyncAction } from "../../entities/SyncAction";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { XMartRepository } from "../../repositories/XMartRepository";
import EntoDiscriminatingConcentrationUseCase from "./ento/EntoDiscriminatingConcentration";
import EntoIRIntensityConcentrationUseCase from "./ento/EntoIRIntensityConcentration";
import EntoIRMechanismsUseCase from "./ento/EntoIRMechanisms";
import EntoIRSynergistInsecticideUseCase from "./ento/EntoIRSynergistInsecticide";

export class GetActionsUseCase implements UseCase {
    constructor(
        private martRepository: XMartRepository,
        private instanceRepository: InstanceRepository,
        private metadataRepository: MetadataRepository
    ) {}

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
                execute: () =>
                    EntoIRSynergistInsecticideUseCase(
                        this.martRepository,
                        this.instanceRepository,
                        this.metadataRepository
                    ),
            },
            {
                id: "ento-ir-intensity-concentration",
                name: "ENTO IR Intensity Concentration",
                execute: () =>
                    EntoIRIntensityConcentrationUseCase(
                        this.martRepository,
                        this.instanceRepository,
                        this.metadataRepository
                    ),
            },
            {
                id: "ento-discriminating-concentration",
                name: "ENTO Discriminating Concentration",
                execute: () =>
                    EntoDiscriminatingConcentrationUseCase(
                        this.martRepository,
                        this.instanceRepository,
                        this.metadataRepository
                    ),
            },
        ]);
    }
}
