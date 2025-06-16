/**
 * A generic event handling class that manages subscriptions and event firing.
 *
 * @template TArgs A tuple type containing the types of all arguments that will
 * be passed when the event is fired.
 */
export class IdleEvent<TArgs extends any[] = [void]> {
	/**
	 * The next unique ID to use for subscriptions.
	 */
	private nextId: number = 0;
	/**
	 * The map of callbacks subscribed to the event.
	 */
	private callbacks: Map<number, EventCallback<TArgs>> = new Map();

	/**
	 * Subscribes to an event, and will be called when said event is fired.
	 *
	 * An optional `once` parameter can be passed to indicate whether the
	 * callback should be executed only once. When true, the callback will
	 * automatically be unsubscribed after being called.
	 *
	 * @param {function(...args: TArgs): void} callback - The function to execute
	 * with the emitted data.
	 * @param {boolean} [once=false] - Indicates whether the callback should
	 * be executed only once.
	 * @return {number} The unique identifier for the subscription.
	 */
	public subscribe(callback: (...args: TArgs) => void, once?: boolean): number {
		const id = this.nextId++;
		this.callbacks.set(id, { id, callback, once: once ?? false });
		return id;
	}

	/**
	 * Unsubscribes a callback from the event using its subscription ID.
	 *
	 * @param {number} id - The unique identifier returned from the subscribe
	 * method.
	 */
	public unsubscribe(id: number): void {
		this.callbacks.delete(id);
	}

	/**
	 * Fires the event, executing all subscribed callbacks with the provided
	 * arguments.
	 *
	 * Callbacks marked as 'once' will be automatically unsubscribed after
	 * execution.
	 *
	 * If a callback throws an error, it will be caught and logged without
	 * affecting other callbacks.
	 *
	 * @param {...TArgs} args - The arguments to pass to each callback function.
	 */
	public fire(...args: TArgs): void {
		const removeIds: number[] = [];

		this.callbacks.forEach((callback, id) => {
			try {
				if (callback.once) removeIds.push(id);
				callback.callback(...args);
			} catch (error) {
				console.error(`Error in event callback (ID: ${id}):`, error);
			}
		});

		removeIds.forEach(id => this.callbacks.delete(id));
	}


	/**
	 * Removes all subscribed callbacks from the event.
	 */
	public clear(): void {
		this.callbacks.clear();
	}

	/**
	 * Returns the current number of subscribed callbacks.
	 *
	 * @return {number} The number of active subscriptions.
	 */
	public count(): number {
		return this.callbacks.size;
	}
}

/**
 * Represents a callback subscription to an event.
 *
 * @template TArgs A tuple type containing the types of all arguments for the
 * callback.
 */
interface EventCallback<TArgs extends any[]> {
	/**
	 * The unique identifier for this callback subscription
	 */
	id: number;
	/**
	 * The function to be called when the event fires
	 */
	callback: (...args: TArgs) => void;
	/**
	 * Whether this callback should be executed only once
	 */
	once?: boolean;
}
