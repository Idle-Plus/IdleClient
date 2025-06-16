import { ManagerStorage, ManagerType } from "@context/GameContext.tsx";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { InventoryArray, ItemId, ItemStack } from "@idleclient/types/gameTypes.ts";
import {
	Int,
	InventoryItemSwapMessage,
	LoginDataMessage,
	PacketType,
} from "@idleclient/network/NetworkData.ts";
import useIndexEventListener, { IndexEventListener } from "@hooks/useIndexEventListener.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { Network } from "@idleclient/network/Network.ts";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { useLoading } from "@context/LoadingContext.tsx";
import usePacket from "@hooks/network/usePacket.ts";
import { useConsole } from "@context/ConsoleContext.tsx";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";

const LOADING_SWITCH_ITEM = "inventoryManager$switchItem";

export interface InventoryManagerType extends ManagerType {

	/*
	 * Inventory
	 */

	/**
	 * The amount of gold the player currently has.
	 */
	gold: SmartRef<Int>,
	/**
	 * The inventory of the player, empty slots are represented by null
	 * entries. Updating the array will not update the inventory on the server.
	 */
	inventory: SmartRef<InventoryArray>,
	/**
	 * Listener for the inventory stack changes, which can be used to listen
	 * for changes to a specific item in the inventory.
	 */
	inventoryListener: IndexEventListener<ItemStack>;

	/*
	 * Network functions
	 */

	/**
	 * Move an item from one slot to another. Sending a move item packet to the
	 * server.
	 */
	switchItem: (from: number, to: number) => void,

	/*
	 * Functions
	 */

	/**
	 * Add an item to the inventory. This does not notify the server and
	 * should only be used to add client side items.
	 *
	 * An optional amount can be specified, which specifies the number of
	 * items to add to the inventory. If the amount isn't specified, then
	 * one will be used instead.
	 *
	 * It should be noted that the count of items in the ItemStack won't be
	 * used, the ItemStack is only used to get the item id, and nothing else.
	 *
	 * If an empty slot couldn't be found, then an error will be logged and
	 * the item won't be added to the inventory.
	 */
	addItem: (item: ItemId | ItemStack, amount?: number) => void,
	/**
	 * Remove an item from the inventory. This does not notify the server and
	 * should only be used to remove client side items.
	 *
	 * An optional amount can be specified, which specifies the amount of the
	 * item to remove. If an amount is not specified, all items of the item
	 * will be removed.
	 *
	 * It should be noted that the count of items in the ItemStack won't be
	 * used, the ItemStack is only used to get the item id, and nothing else.
	 */
	removeItem: (item: ItemId | ItemStack, amount?: number) => void,
	/**
	 * Check if the inventory has an item.
	 *
	 * An optional amount can be specified, which specifies the amount of the
	 * item to check for.
	 */
	hasItem: (item: ItemId | ItemStack, amount?: number) => boolean,
	/**
	 * Get the count of the specified item in the inventory.
	 */
	getItemCount: (item: ItemId | ItemStack) => number,

	getItemStackInSlot: (slot: number) => ItemStack | null,
	getItemDefinitionInSlot: (slot: number) => ItemDefinition | null,
	//getEquippedItem: (slot: EquipmentSlot) => ItemDefinition | null,

	/**
	 * Check if the specified item is currently equipped.
	 */
	//isItemEquipped: (item: ItemId) => boolean,

	/**
	 * Initialize the inventory manager.
	 */
	initialize: (data: LoginDataMessage) => void,
	/**
	 * Cleans up the inventory manager, should always be called when the player
	 * disconnects from the game server.
	 */
	cleanup: () => void,
}

export const InventoryManager = (managers: ManagerStorage): InventoryManagerType => {
	const loading = useLoading();
	const debug = useConsole();

	const usingPlaceholders = true;

	const testInventory = new Array<ItemStack | null>(60).fill(null);

	// TODO: We could probably add an map containing the item id to index
	//       mapping, so we can use that to get the index of an item, instead
	//       of looping through the array.

	const gold = useSmartRef<Int>(0);

	const inventory = useSmartRef<InventoryArray>(testInventory);
	const inventorySize = useSmartRef<number>(inventory.content().length);
	const inventoryListener = useIndexEventListener<ItemStack>(ctx => {
		for (let i = 0; i < inventory.content().length; i++) {
			const item = inventory.content()[i];
			if (item === null) continue;
			ctx.set(item.id, item);
		}
	});

	/*
	 * Private functions
	 */

	const setInventory = (content: InventoryArray) => {
		inventory.setContent(content);
		inventorySize.setContent(content.length);
		inventoryListener.reinitialize(ctx => {
			for (let i = 0; i < content.length; i++) {
				const item = content[i];
				if (item === null) continue;
				ctx.set(item.id, item);
			}
		});
	}

	/*
	 * Network functions
	 */

	const switchItem = (from: number, to: number) => {
		const content = inventory.content();
		if (content.length <= 0) return; // We're not connected.
		if (from < 0 || from >= content.length)
			throw new Error(`Tried to switch item from invalid slot ${from}.`);
		if (to < 0 || to >= content.length)
			throw new Error(`Tried to switch item to invalid slot ${to}.`);

		// Notify the server.
		if (loading.is(LOADING_SWITCH_ITEM)) return;
		debug.log(`Inventory: Switching item from ${from} to ${to}.`)
		loading.set(LOADING_SWITCH_ITEM, "Switching items");
		Network.send(new InventoryItemSwapMessage(from, to));
	}

	/*
	 * Functions
	 */

	const addItem = (item: ItemId | ItemStack, amount?: number) => {
		if (inventory.content().length <= 0) return; // If we aren't connected.
		const content = inventory.content() as Array<ItemStack | null>;

		// TODO: Drop support for using ItemStack's count as the amount.
		amount = amount === undefined ? (typeof item === "number" ? 1 : item.count) : amount;
		item = typeof item === "number" ? item : item.id;

		if (item === ItemDatabase.GOLD_ITEM_ID) {
			gold.setContent(gold.content() + amount);
			return;
		}

		// Check if we should add to a specific slot.
		/*if (slot !== undefined) {
			if (slot < 0 || slot >= content.length)
				throw new Error(`Tried to add item to invalid slot ${slot}.`);
			const current = content[slot];
			if (current === null) {
				content[slot] = item;
				// Update Inventory - start
				inventory.trigger();
				inventoryListener.set(item.id, item);
				// Update Inventory - end
				return;
			}

			if (current.id !== item.id)
				throw new Error(`Tried to add item to slot ${slot} with different item.`);
			current.count += item.count;
			// Update Inventory - start
			inventory.trigger();
			inventoryListener.set(item.id, current);
			// Update Inventory - end
			return;
		}*/

		// Try to find the item in the inventory.
		for (let i = 0; i < content.length; i++) {
			// TODO: If we indexed each item in the inventory, we wouldn't have
			//       to do this.
			const current = content[i];
			if (current === null) continue;
			if (current.id !== item) continue;
			current.count += amount;
			// Update Inventory - start
			inventory.trigger();
			inventoryListener.set(item, current);
			// Update Inventory - end
			return;
		}

		// Try to find an empty slot in the inventory.
		for (let i = 0; i < content.length; i++) {
			if (content[i] !== null) continue;
			const stack = { id: item, count: amount };
			content[i] = stack;
			// Update Inventory - start
			inventory.trigger();
			inventoryListener.set(item, stack);
			// Update Inventory - end
			return;
		}

		// Something went wrong, we're most likely de-synced with the server.
		console.error(`Tried to add item ${item} to inventory, but no empty slots were found.`);
	}

	const removeItem = (item: ItemId | ItemStack, amount?: number, ignorePlaceholder?: boolean) => {
		if (inventory.content().length <= 0) return; // If we aren't connected.
		const content = inventory.content() as Array<ItemStack | null>;
		const id = typeof item === "number" ? item : item.id;
		amount = amount === undefined ? 1 : amount;

		if (id === ItemDatabase.GOLD_ITEM_ID) {
			gold.setContent(gold.content() - amount);
			return;
		}

		for (let i = 0; i < content.length; i++) {
			const current = content[i];
			if (current === null) continue;
			if (current.id !== id) continue;
			if (current.count <= amount) {

				// Either remove the item or set the count to 0 if we have
				// placeholders enabled.
				if (usingPlaceholders && !ignorePlaceholder) content[i] = { id: id, count: 0 };
				else content[i] = null;

				// Update Inventory - start
				inventory.trigger();
				if (usingPlaceholders && !ignorePlaceholder) inventoryListener.set(id, { id: id, count: 0 });
				else inventoryListener.remove(id)
				// Update Inventory - end
				return;
			}
			current.count -= amount;
			// Update Inventory - start
			inventory.trigger();
			inventoryListener.set(id, current);
			// Update Inventory - end
			return;
		}

		// Something went wrong, we're most likely de-synced with the server.
		console.error(`Tried to remove item ${item} from inventory, but no item was found.`);
	}

	const hasItem = (item: ItemId | ItemStack, amount?: number) => {
		if (inventory.content().length <= 0) return false; // If we aren't connected.
		const content = inventory.content(); // Array<ItemStack | null>
		const id = typeof item === "number" ? item : item.id;
		amount = amount ?? 1;

		if (id === ItemDatabase.GOLD_ITEM_ID) {
			return gold.content() >= amount;
		}

		for (const item of content) {
			if (item === null) continue;
			if (item.id !== id) continue;
			if (amount === undefined) return true;
			if (item.count >= amount) return true;
		}

		return false;
	}

	const getItemCount = (item: ItemId | ItemStack) => {
		if (inventory.content().length <= 0) return 0; // If we aren't connected.
		const content = inventory.content(); // Array<ItemStack | null>
		const id = typeof item === "number" ? item : item.id;

		if (id === ItemDatabase.GOLD_ITEM_ID) {
			return gold.content();
		}

		let count = 0;
		for (const item of content) {
			if (item === null) continue;
			if (item.id !== id) continue;
			count = item.count;
			break;
		}

		return count;
	}

	const getItemStackInSlot = (slot: number) => {
		const content = inventory.content();
		if (slot < 0 || slot >= content.length)
			throw new Error(`Tried to get item in invalid slot ${slot}.`);
		return content[slot];
	}

	const getItemDefinitionInSlot = (slot: number) => {
		const item = getItemStackInSlot(slot);
		if (item === null) return null;
		return GameData.items().item(item.id);
	}

	const initialize = (data: LoginDataMessage) => {
		if (data.InventoryJson === undefined || data.InventoryJson === null)
			throw new Error("InventoryManager: Received login data without inventory.");
		const parsedInventory = JSON.parse(data.InventoryJson) as { ItemId: number, Amount: number }[];
		const inventory = parsedInventory.map(item => {
			if (item == null) return null;
			return { id: item.ItemId, count: item.Amount};
		});

		gold.setContent(data.Gold);
		setInventory(inventory);
	}

	const cleanup = () =>  {
		gold.setContent(0);
		setInventory([]);
	}

	/*
	 * Packet listeners.
	 */

	usePacket<InventoryItemSwapMessage>(packet => {
		const from = packet.FromSlot;
		const to = packet.ToSlot;

		const content = inventory.content() as Array<ItemStack | null>;
		const temp = content[from];
		content[from] = content[to];
		content[to] = temp;
		inventory.trigger();

		loading.remove(LOADING_SWITCH_ITEM);
	}, [], PacketType.InventoryItemSwapMessage);

	return {
		$managerName: "inventoryManager",

		gold: gold,
		inventory: inventory,
		inventoryListener: inventoryListener,

		switchItem: switchItem,

		addItem: addItem,
		removeItem: removeItem,
		hasItem: hasItem,
		getItemCount: getItemCount,

		getItemStackInSlot: getItemStackInSlot,
		getItemDefinitionInSlot: getItemDefinitionInSlot,

		initialize: initialize,
		cleanup: cleanup,
	}
}