import { ConnectionData, DataMartEndpoint } from "../../domain/entities/XMart";
import { SharingSetting } from "../../domain/entities/SharingSetting";

import { Codec, Schema, FromType } from "../../utils/codec";
import { NamedRefModel } from "./DHIS2Model";

export const SharingSettingModel: Codec<SharingSetting> = Schema.object({
    access: Schema.nonEmptyString,
    displayName: Schema.nonEmptyString,
    id: Schema.nonEmptyString,
    name: Schema.optional(Schema.string),
});

/*FromType<DataMartEndpoint>*/
export const ConnectionModel: Codec<ConnectionData> = Schema.object({
    id: Schema.nonEmptyString,
    name: Schema.nonEmptyString,
    code: Schema.nonEmptyString,
    apiUrl: Schema.nonEmptyString,
    type: Schema.nonEmptyString,
    user: NamedRefModel,
    created: Schema.date,
    lastUpdated: Schema.date,
    lastUpdatedBy: NamedRefModel,
    publicAccess: Schema.nonEmptyString,
    userAccesses: Schema.array(SharingSettingModel),
    userGroupAccesses: Schema.array(SharingSettingModel),
});
