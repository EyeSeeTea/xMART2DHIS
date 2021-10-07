import { NamedRef } from "./Ref";

export interface TranslationObject extends NamedRef {
    property: string;
    locale: string;
    value: string;
}

export interface TranslatedObject {
    translations: TranslationObject[];
}

export function buildTranslationItem(property: string, locale: string, value: string): TranslationObject {
    return {
        name: "",
        id: "",
        property: property,
        locale: locale,
        value: value,
    };
}
