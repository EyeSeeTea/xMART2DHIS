import { http, HttpResponse, JsonBodyType, RequestHandler } from "msw";
import { SetupServer, setupServer } from "msw/node";

/*
 * Same wrapper as Bulk-Load and dashboard-reports (MSW 2), with two differences:
 * - `raw`: a copy of the request so a test can read its body (e.g. `await request.raw.formData()`).
 * - `onUnhandledRequest: "error"` instead of "bypass": a request no handler matches fails the test
 *   instead of reaching the real network.
 */

export type Method = "get" | "post" | "put";

export interface MockHandler<T extends JsonBodyType = JsonBodyType> {
    method: Method;
    endpoint: string;
    httpStatusCode: number;
    response: T | ((req: Request) => T);
}

export interface Request {
    headers: Record<string, string>;
    params: URLSearchParams;
    url: URL;
    raw: globalThis.Request;
}

export class MockWebServer {
    server: SetupServer;

    lastRequest?: Request;
    allRequests: ReadonlyArray<Request> = [];

    constructor() {
        this.server = setupServer();
    }

    start(): void {
        this.server.listen({ onUnhandledRequest: "error" });
    }

    resetHandlers(): void {
        this.server.resetHandlers();
        this.resetRequests();
    }

    resetRequests(): void {
        this.lastRequest = undefined;
        this.allRequests = [];
    }

    close(): void {
        this.server.close();
    }

    /* Each handler can answer with a different body type. */
    addRequestHandlers(handlers: ReadonlyArray<MockHandler>): void {
        const mswHandlers = handlers.map(handler => this.createMswHandler(handler));
        this.server.use(...mswHandlers);
    }

    private createMswHandler(handler: MockHandler): RequestHandler {
        const resolver = ({ request }: { request: globalThis.Request }) => {
            const mappedRequest = this.mapRequest(request);
            this.lastRequest = mappedRequest;
            this.allRequests = [...this.allRequests, mappedRequest];

            const body = handler.response instanceof Function ? handler.response(mappedRequest) : handler.response;

            return typeof body === "string"
                ? new HttpResponse(body, { status: handler.httpStatusCode })
                : HttpResponse.json(body, { status: handler.httpStatusCode });
        };

        switch (handler.method) {
            case "get":
                return http.get(handler.endpoint, resolver);
            case "post":
                return http.post(handler.endpoint, resolver);
            case "put":
                return http.put(handler.endpoint, resolver);
        }
    }

    private mapRequest(request: globalThis.Request): Request {
        const url = new URL(request.url);
        return {
            headers: Object.fromEntries(request.headers.entries()),
            params: url.searchParams,
            url,
            raw: request.clone(),
        };
    }
}
