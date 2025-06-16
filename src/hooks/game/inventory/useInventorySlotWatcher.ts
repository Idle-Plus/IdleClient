import { GameContextType } from "@context/GameContext.tsx";
import { InventoryArray, ItemStack } from "@idleclient/types/gameTypes.ts";
import { useEffect, useRef, useState } from "react";

/**
 * Null if the slot is empty, or undefined if the slot isn't in the inventory.
 */
type SlotArray = (ItemStack | null | undefined)[];

function getInventorySlots(inventory: InventoryArray, slot: [ number, number ]): SlotArray {
	const array = [];

	const min = slot[0];
	const max = slot[1];

	for (let i = min; i <= max; i++) {
		const item = inventory[i];
		array.push(item ? { ...item } : item);
	}

	return array;
}

const useInventorySlotWatcher = (
	game: GameContextType,
	slot: [ number, number ]
): SlotArray => {
	const manager = game.inventory;

	const [_, setForceRender] = useState<number>(0);
	const resultRef = useRef<SlotArray>(getInventorySlots(manager.inventory.content(), slot));

	// Initialize the array.
	useEffect(() => {
		resultRef.current = getInventorySlots(manager.inventory.content(), slot);
	}, [ slot[0], slot[1] ]);

	useEffect(() => {
		const compareArrays = (a: SlotArray, b: SlotArray) => {
			if (a.length !== b.length) return false;
			for (let i = 0; i < a.length; i++) {
				const aItem = a[i];
				const bItem = b[i];

				if (aItem?.id !== bItem?.id || aItem?.count !== bItem?.count) {
					return false;
				}
			}
			return true;
		};

		const id = manager.inventory.subscribe(() => {
			const previous = resultRef.current;
			const current = getInventorySlots(manager.inventory.content(), slot);

			if (!compareArrays(previous, current)) {
				resultRef.current = current;
				setForceRender(prevState => (prevState + 1) % 10_000);
			}
		});

		return () => manager.inventory.unsubscribe(id);
	});

	return resultRef.current;
}

export default useInventorySlotWatcher;