import { Id } from "./Ref";

export type Program = {
    id: Id;
    name: string;
    displayName: string;
    programType: "WITH_REGISTRATION" | "WITHOUT_REGISTRATION";
};
