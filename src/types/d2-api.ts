import { D2Api } from "@eyeseetea/d2-api/2.42";
import { getMockApiFromClass } from "@eyeseetea/d2-api";

export * from "@eyeseetea/d2-api/2.42";

export type { FilterValueOperator } from "@eyeseetea/d2-api/api/common";
export type { TrackerPostParams, TrackerPostResponse } from "@eyeseetea/d2-api/api/tracker";
export type { D2TrackerEvent, D2TrackerEventSchema, D2TrackerEventToPost } from "@eyeseetea/d2-api/api/trackerEvents";
export type { CancelableResponse } from "@eyeseetea/d2-api/repositories/CancelableResponse";
export type { PartialBy } from "@eyeseetea/d2-api/utils/types";
export { isCancel } from "@eyeseetea/d2-api";

export const getMockApi = getMockApiFromClass(D2Api);
