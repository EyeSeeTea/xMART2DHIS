type Fn<T> = (value: T) => void;
type Cancel = () => void;

export interface Future<E, D> {
    run(onSuccess: Fn<D>, onError: Fn<E>): Cancel;
    map<D2>(mapper: (data: D) => D2): Future<E, D2>;
    mapError<E2>(mapper: (data: E) => E2): Future<E2, D>;
    bimap<E2, D2>(dataMapper: (data: D) => D2, errorMapper: (error: E) => E2): Future<E2, D2>;
    flatMap<D2>(mapper: (data: D) => Future<E, D2>): Future<E, D2>;
    flatMapError<E2>(mapper: (error: E) => Future<E2, D>): Future<E2, D>;
    toPromise(onError?: (error: E) => void): Promise<D>;
    runAsync(): Promise<{ data?: D; error?: E }>;
}

export type FutureData<Data> = Future<string, Data>;
