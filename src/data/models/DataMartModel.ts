import { DataMart } from "../../domain/entities/xmart/DataMart";
import { SharingSetting } from "../../domain/entities/metadata/SharingSetting";
import { Codec, Schema } from "../../utils/codec";
import { NamedRefModel } from "./RefModel";

export const SharingSettingModel: Codec<SharingSetting> = Schema.object({
    access: Schema.string,
    displayName: Schema.string,
    id: Schema.string,
    name: Schema.optional(Schema.string),
});

export const DataMartModel: Codec<DataMart> = Schema.object({
    id: Schema.string,
    name: Schema.string,
    martCode: Schema.string,
    environment: Schema.oneOf([Schema.exact("PROD"), Schema.exact("UAT")]),
    dataEndpoint: Schema.nonEmptyString,
    connectionWorks: Schema.boolean,
    owner: NamedRefModel,
    created: Schema.date,
    lastUpdated: Schema.date,
    lastUpdatedBy: NamedRefModel,
    publicAccess: Schema.string,
    userAccesses: Schema.array(SharingSettingModel),
    userGroupAccesses: Schema.array(SharingSettingModel),
});
