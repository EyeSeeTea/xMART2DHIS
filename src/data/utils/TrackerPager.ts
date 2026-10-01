/**
 * Tracker endpoints are traversed by the nextPage link rather than with totalPages=true, which
 * makes the server count every match on each request. A full page without a link is ambiguous,
 * so it is followed as well: an instance that did not link pages would otherwise be traversed
 * no further than its first.
 */
export function isLastTrackerPage(options: { pager: unknown; itemsInPage: number; pageSize: number }): boolean {
    const { pager, itemsInPage, pageSize } = options;
    return !hasNextPage(pager) && itemsInPage < pageSize;
}

function hasNextPage(pager: unknown): boolean {
    return typeof pager === "object" && pager !== null && "nextPage" in pager;
}
