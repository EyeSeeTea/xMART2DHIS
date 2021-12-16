import { IdentifiableObject } from "./Metadata";

export interface Program extends IdentifiableObject {
    programType: "WITH_REGISTRATION" | "WITHOUT_REGISTRATION";
}
