import { useRef } from "react";

export interface SmartRef<T> {
	/**
	 * The current value of the ref.
	 */
	content: () => T;
	/**
	 * Set the value of the ref and trigger all subscribers.
	 *
	 * @param   value
	 *          The new value.
	 */
	setContent: (value: T | ((current: T) => T), trigger?: boolean) => void;
	/**
	 * Trigger all subscribers.
	 */
	trigger: (block?: (value: T) => void) => void;
	/**
	 * Subscribe to changes in the ref.
	 *
	 * @param   callback
	 *          The callback to call when the ref changes.
	 */
	subscribe: (callback: () => void) => number;
	/**
	 * Unsubscribe from changes in the ref.
	 *
	 * @param   id
	 *          The id returned from the subscribe function.
	 */
	unsubscribe: (id: number) => void;
}

const useSmartRef = <T>(
	initialValue: T,
): SmartRef<T> => {
	const ref = useRef<T>(initialValue);
	const subscribers = useRef(new Map<number, () => void>());
	const nextId = useRef<number>(0);

	const content = () => ref.current;

	const setContent = (value: T | ((current: T) => T), trigger: boolean = true) => {
		if (typeof value === 'function') value = (value as (current: T) => T)(ref.current);

		ref.current = value;
		if (!trigger) return;
		subscribers.current.forEach((callback) => callback());
	}

	const trigger = (block?: (value: T) => void) => {
		if (block) block(ref.current);
		subscribers.current.forEach((callback) => callback());
	}

	const subscribe = (callback: () => void) => {
		const id = nextId.current++;
		subscribers.current.set(id, callback);
		return id;
	}

	const unsubscribe = (id: number) => subscribers.current.delete(id);

	return { content, setContent, trigger, subscribe, unsubscribe };
}

export default useSmartRef;