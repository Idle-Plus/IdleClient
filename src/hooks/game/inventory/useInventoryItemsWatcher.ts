import { GameContextType } from "@context/GameContext.tsx";
import { ItemId, ItemStack } from "@idleclient/types/gameTypes.ts";
import { useEffect, useRef, useState } from "react";

const useInventoryItemsWatcher = (
	game: GameContextType,
	items: ItemId[]
): number[] => {
	const { inventory } = game;

	const [_, setForceRender] = useState<number>(0);
	const lastCountRef = useRef<number[]>((() => {
		const result: ItemId[] = [];
		for (const itemId of items) {
			const count = inventory.getItemCount(itemId);
			result.push(count);
		}
		return result;
	})());

	// Subscribe to the inventory listener.
	useEffect(() => {
		const listener = inventory.inventoryListener;
		const listenerIds: number[] = [];

		for (let i = 0; i < items.length; i++) {
			const itemId = items[i];
			listenerIds.push(listener.subscribe(itemId, (stack: ItemStack | null) => {
				const count = stack === null ? 0 : stack.count;
				if (count === lastCountRef.current[i]) return;
				lastCountRef.current[i] = count;
				setForceRender(prevState => (prevState + 1) % 10_000);
			}));
		}

		return () => {
			for (let i = 0; i < listenerIds.length; i++) {
				listener.unsubscribe(items[i], listenerIds[i]);
			}
		}
	});

	return lastCountRef.current;
}

export default useInventoryItemsWatcher;