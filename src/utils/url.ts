export function joinUrl(...urls: string[]): string {
    return urls.join("/").replace(/\/+/g, "/");
}
