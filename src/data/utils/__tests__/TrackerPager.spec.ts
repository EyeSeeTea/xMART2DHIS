import { describe, expect, it } from "vitest";
import { isLastTrackerPage } from "../TrackerPager";

const pageSize = 250;
const nextPageLink = "https://dhis2.test/api/tracker/events?page=2";

function whenCheckingPage(pager: unknown, itemsInPage: number): boolean {
    return isLastTrackerPage({ pager, itemsInPage, pageSize });
}

describe("isLastTrackerPage", () => {
    describe("with a nextPage link", () => {
        it("is not the last page", () => {
            expect(whenCheckingPage({ page: 1, pageSize, nextPage: nextPageLink }, pageSize)).toBe(false);
        });
    });

    describe("without a nextPage link", () => {
        it("is the last page when the page is not full", () => {
            expect(whenCheckingPage({ page: 1, pageSize }, 10)).toBe(true);
        });

        /* An instance that did not link pages would otherwise be traversed no further than its first. */
        it("is not the last page when the page is full", () => {
            expect(whenCheckingPage({ page: 1, pageSize }, pageSize)).toBe(false);
        });

        it("is the last page when the response has no pager and the page is not full", () => {
            expect(whenCheckingPage(undefined, 10)).toBe(true);
        });
    });
});
