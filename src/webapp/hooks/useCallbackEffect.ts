import React from "react";

// Wrap the args into an object so identical values still run a new effect.
type ArgsValue<Args extends any[]> = { value: Args };
type Effect = void;
type EffectFn<Args extends any[]> = (...args: Args) => Effect;
type Cancel = { (): void };

/*  Merge the features of React.useCallback and React.useEffect to start a cancellable effect from
    a callback. Any time the function is called, a new effect will be started and the old one cancelled,
    so only one effect will be running concurrently.
*/

export function useCallbackEffect<Args extends any[]>(callback: (...args: Args) => Cancel | undefined): EffectFn<Args> {
    const [args, setArgs] = React.useState<ArgsValue<Args>>();

    const runEffect = React.useCallback<EffectFn<Args>>(
        (...args) => {
            setArgs({ value: args });
        },
        [setArgs]
    );

    React.useEffect(() => {
        if (args) {
            const cancelFn = callback(...args.value);
            return cancelFn;
        }
    }, [args]); // eslint-disable-line react-hooks/exhaustive-deps

    /* Remove callback from the dependency list to avoid loops. Only an explicit call to runEffect
       should trigger it. Typically we'd have a useCallback to build callback that can catch them. */

    return runEffect;
}
