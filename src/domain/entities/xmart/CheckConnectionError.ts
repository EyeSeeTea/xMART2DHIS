/**
 * Why a mart is not ready to receive the app's data:
 * - `martNeedsSetup`: the mart has not been set up to receive the app's data.
 * - `failed`: any other failure, with its message.
 */
export type CheckConnectionError = { type: "martNeedsSetup" } | { type: "failed"; message: string };
