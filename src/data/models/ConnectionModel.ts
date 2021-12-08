import { ConnectionData } from "../../domain/entities/xmart/XMart";
import { SharingSetting } from "../../domain/entities/metadata/SharingSetting";
import { Codec, Schema } from "../../utils/codec";
import { NamedRefModel } from "./DHIS2Model";

export const SharingSettingModel: Codec<SharingSetting> = Schema.object({
    access: Schema.string,
    displayName: Schema.string,
    id: Schema.string,
    name: Schema.optional(Schema.string),
});

export const ConnectionModel: Codec<ConnectionData> = Schema.object({
    id: Schema.nonEmptyString,
    name: Schema.nonEmptyString,
    code: Schema.string,
    apiUrl: Schema.nonEmptyString,
    type: Schema.oneOf([Schema.exact("PUBLIC"), Schema.exact("PROD"), Schema.exact("UAT")]),
    owner: NamedRefModel,
    created: Schema.date,
    lastUpdated: Schema.date,
    lastUpdatedBy: NamedRefModel,
    publicAccess: Schema.string,
    userAccesses: Schema.array(SharingSettingModel),
    userGroupAccesses: Schema.array(SharingSettingModel),
});
