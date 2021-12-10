export function joinUrl(...urls: string[]): string {
    return urls
        .join("/")
        .replace(/([^:/]|^)\/{2,}/g, "$1/")
        .replace(/^(?!(?:\/\/|[^:/]+:))/, "https://");
}
