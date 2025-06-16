import { useEffect, useRef } from "react";

interface RangeSubscriber<T> {
	id: number;
	start: number;
	end: number;
	callback: (index: number, value: T | null) => void;
}

export interface IndexEventListener <T>{
	set: (index: number, value: T | null, trigger?: boolean) => void;
	remove: (index: number, trigger?: boolean) => void;
	reinitialize: (init: (ctx: IndexEventInitializer<T>) => void) => void;

	trigger: (index: number) => void;

	subscribe: (index: number, callback: (value: T | null) => void) => number;
	unsubscribe: (index: number, id: number) => void;

	subscribeRange: (start: number, end: number, callback: (index: number, value: T | null) => void) => number;
	unsubscribeRange: (id: number) => void;
}

export interface IndexEventInitializer<T> {
	set: (index: number, value: T) => void;
}

const useIndexEventListener = <T>(
	initializer?: (ctx: IndexEventInitializer<T>) => void,
): IndexEventListener<T> => {
	
	const refs = useRef(new Map<number, T>());
	useEffect(() => {
		if (!initializer) return;
		const map = new Map<number, T>();
		const initializerCtx = { set: (index: number, value: T) => map.set(index, value) };
		initializer(initializerCtx);
		refs.current = map;
	}, []);

	const rangeSubscribers = useRef<RangeSubscriber<T>[]>([]);
	const subscribers = useRef(new Map<number, Map<number, (value: T | null) => void>>());
	const nextId = useRef<number>(0);

	const set = (index: number, value: T | null, trigger: boolean = true) => {
		if (value === null) return remove(index, trigger);
		refs.current.set(index, value);
		if (trigger) {
			subscribers.current.get(index)?.forEach((callback) => callback(value));
			rangeSubscribers.current.forEach(({ start, end, callback }) => {
				if (index >= start && index <= end) callback(index, value);
			});
		}
	}

	const remove = (index: number, trigger: boolean = true) => {
		refs.current.delete(index);
		if (trigger) {
			subscribers.current.get(index)?.forEach((callback) => callback(null));
			rangeSubscribers.current.forEach(({ start, end, callback }) => {
				if (index >= start && index <= end) callback(index, null);
			});
		}
	}

	const reinitialize = (init: (ctx: IndexEventInitializer<T>) => void) => {
		const previous = refs.current;
		const map = new Map<number, T>();
		const initializerCtx = { set: (index: number, value: T) => map.set(index, value) };
		init(initializerCtx);
		refs.current = map;

		// Notify subscribers
		subscribers.current.forEach((subscribers, index) => {
			const value = refs.current.get(index) ?? null;
			subscribers.forEach((callback) => callback(value));
		});

		// Skip handling range subscribers if there are none
		if (rangeSubscribers.current.length === 0) return;

		// Notify range subscribers of new/updated values
		map.forEach((value, index) => {
			for (const { start, end, callback } of rangeSubscribers.current) {
				if (index >= start && index <= end) {
					callback(index, value);
				}
			}
		});

		// Notify range subscribers of removed values
		previous.forEach((_, index) => {
			if (!map.has(index)) {
				for (const { start, end, callback } of rangeSubscribers.current) {
					if (index >= start && index <= end) {
						callback(index, null);
					}
				}
			}
		});
	}

	const trigger = (index: number) => {
		subscribers.current.get(index)?.forEach((callback) => callback(refs.current.get(index) ?? null));
		rangeSubscribers.current.forEach(({ start, end, callback }) => {
			if (index >= start && index <= end) callback(index, refs.current.get(index) ?? null);
		});
	}

	const subscribe = (index: number, callback: (value: T | null) => void) => {
		if (!subscribers.current.has(index)) {
			subscribers.current.set(index, new Map());
		}
		const id = nextId.current++;
		subscribers.current.get(index)?.set(id, callback);
		return id;
	}

	const unsubscribe = (index: number, id: number) => {
		subscribers.current.get(index)?.delete(id);
	}

	const subscribeRange = (start: number, end: number, callback: (index: number, value: T | null) => void) => {
		const id = nextId.current++;
		rangeSubscribers.current.push({ id, start, end, callback });
		return id;
	};

	const unsubscribeRange = (id: number) => {
		rangeSubscribers.current = rangeSubscribers.current.filter(sub => sub.id !== id);
	};

	return {
		set: set,
		remove: remove,
		reinitialize: reinitialize,
		trigger: trigger,
		subscribe: subscribe,
		unsubscribe: unsubscribe,
		subscribeRange: subscribeRange,
		unsubscribeRange: unsubscribeRange,
	};
}

export default useIndexEventListener;