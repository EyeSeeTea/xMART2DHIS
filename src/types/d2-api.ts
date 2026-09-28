import { D2Api } from "@eyeseetea/d2-api/2.42";

export * from "@eyeseetea/d2-api/2.42";
export { D2Api };

export type { FilterValueOperator } from "@eyeseetea/d2-api/api/common";
export type { TrackerPostParams, TrackerPostResponse } from "@eyeseetea/d2-api/api/tracker";
export type { D2TrackerEvent, D2TrackerEventSchema, D2TrackerEventToPost } from "@eyeseetea/d2-api/api/trackerEvents";
export type { CancelableResponse } from "@eyeseetea/d2-api/repositories/CancelableResponse";
export type { PartialBy } from "@eyeseetea/d2-api/utils/types";
export { isCancel } from "@eyeseetea/d2-api";

/* The mock adapter is axios-only, and d2-api defaults to the fetch backend. */
export function getMockApi() {
    const api = new D2Api({ backend: "xhr" });
    return { api, mock: api.getMockAdapter() };
}
