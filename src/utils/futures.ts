import { Future, FutureData } from "../domain/entities/Future";
import { CancelableResponse } from "../types/d2-api";

export function apiToFuture<Data>(res: CancelableResponse<Data>): FutureData<Data> {
    return Future.fromComputation((resolve, reject) => {
        res.getData()
            .then(resolve)
            .catch(err => {
                reject(err.response?.data ? err.response.data.message : err ? err.message : "Unknown error");
            });
        return res.cancel;
    });
}

export const timeout = (ms: number): FutureData<void> => {
    return Future.fromComputation(resolve => {
        const id = setTimeout(resolve, ms);
        return () => clearTimeout(id);
    });
};
