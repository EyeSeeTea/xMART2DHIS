# Async — the project's own Future

The project has its own `Future` in `src/domain/entities/Future.ts` (built on `fluture`), with `FutureData<T> = Future<string, T>`.

- New code uses **this** `Future` / `FutureData`; never add the reference's `domain/entities/generic/Future.ts` next to it (`dhis2-react/architecture.md` → *Async — Future, not Promise*).
- Its API differs from the reference's: e.g. it has `fromPromise`, `fromPurifyEither` and `futureMap`; check the file before using a method seen in the reference.
- Helpers live in `src/utils/futures.ts` (`apiToFuture`, `timeout`) and `src/webapp/hooks/useFuture.ts`.
