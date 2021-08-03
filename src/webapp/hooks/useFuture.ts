import { useState } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { Future, FutureData } from "../../domain/entities/Future";

type Callback = () => void;
type ResultType<Obj> = {
    data?: Obj;
    error?: string;
    loading: boolean;
    cancel: Callback;
};

export function useFuture<Obj, Params extends any[]>(
    future: (...params: Params) => FutureData<Obj>,
    params: Params
): ResultType<Obj> {
    const [data, setData] = useState<Obj>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>();
    const [cancel, setCancel] = useState<Callback>(Future.noCancel);

    useDeepCompareEffect(() => {
        const cancel = future(...params).run(
            data => {
                setData(data);
                setLoading(false);
            },
            error => {
                setError(error);
            }
        );

        setCancel(() => cancel);
        return cancel;
    }, [future, params]);

    return { data, loading, cancel, error };
}
