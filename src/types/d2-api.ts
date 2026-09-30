import { D2Api } from "@eyeseetea/d2-api/2.34";
import { getMockApiFromClass } from "@eyeseetea/d2-api";

export * from "@eyeseetea/d2-api/2.34";
export { D2Api };
export const getMockApi = getMockApiFromClass(D2Api);
