import { IdleEvent } from "@idleclient/event/IdleEvent.ts";
import { useCallback, useEffect, useRef } from "react";

/**
 * A hook that subscribes to an IdleEvent and manages its lifecycle.
 *
 * @template TArgs The tuple type of arguments that the event will emit
 * @param event The IdleEvent instance to subscribe to
 * @param callback The callback function to execute when the event fires
 */
export function useIdleEvent<TArgs extends any[]>(
	event: IdleEvent<TArgs>,
	callback: (...args: TArgs) => void,
): void {
	useEffect(() => {
		const subscriptionId = event.subscribe(callback);
		return () => event.unsubscribe(subscriptionId);
	}, [event, callback]);
}

/**
 * A hook that subscribes to an IdleEvent once and manages its lifecycle.
 *
 * The callback will only be called for the first event, then automatically
 * unsubscribe.
 *
 * @template TArgs The tuple type of arguments that the event will emit
 * @param event The IdleEvent instance to subscribe to
 * @param callback The callback function to execute when the event fires
 */
export function useIdleEventOnce<TArgs extends any[]>(
	event: IdleEvent<TArgs>,
	callback: (...args: TArgs) => void
): void {
	const hasExecuted = useRef(false);

	const wrappedCallback = useCallback((...args: TArgs) => {
		if (!hasExecuted.current) {
			hasExecuted.current = true;
			callback(...args);
		}
	}, [callback]);

	useEffect(() => {
		if (!hasExecuted.current) {
			const subscriptionId = event.subscribe(wrappedCallback);
			return () => event.unsubscribe(subscriptionId);
		}
	}, [event, wrappedCallback]);
}
