export interface TranslationObject {
    property: string;
    locale: string;
    value: string;
}

export interface TranslatedObject {
    translations: TranslationObject[];
}

export function buildTranslationItem(property: string, locale: string, value: string): TranslationObject {
    return {
        property: property,
        locale: locale,
        value: value,
    };
}
