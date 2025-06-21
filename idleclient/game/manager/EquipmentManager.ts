import { ManagerStorage, ManagerType } from "@context/GameContext.tsx";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { EquipmentMap, ItemId, ItemStack } from "@idleclient/types/gameTypes.ts";
import useIndexEventListener, { IndexEventListener } from "@hooks/useIndexEventListener.ts";
import {
	EquipItemMessage,
	EquipmentSlot,
	Int,
	LoginDataMessage,
	PacketType,
	UnequipItemMessage
} from "@idleclient/network/NetworkData.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import usePacket from "@hooks/network/usePacket.ts";
import { useLoading } from "@context/LoadingContext.tsx";
import { useConsole } from "@context/ConsoleContext.tsx";
import { Network } from "@idleclient/network/Network.ts";
import { EquipmentEvents } from "@idleclient/event/EquipmentEvents.ts";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";

const LOADING_EQUIP_ITEM = "inventoryManager$equipItem";
const LOADING_UNEQUIP_ITEM = "inventoryManager$unequipItem";

export interface EquipmentManagerType extends ManagerType {
	/**
	 * The equipment of the player. Updating the map will not update the
	 * equipment on the server.
	 */
	equipment: SmartRef<EquipmentMap>,
	/**
	 * Listener for equipment changes, which can be used to listen to
	 * changes in a specific equipment slot.
	 */
	equipmentListener: IndexEventListener<ItemId>,
	/**
	 * The amount of ammunition currently equipped.
	 */
	ammunitionAmount: SmartRef<Int>,



	/**
	 * Equip the specified item. Sending an equip item packet to the server.
	 * If the specified item can't be equipped, then nothing will happen.
	 */
	equipItem: (item: ItemStack) => void,
	/**
	 * Unequip an item from the specified slot. Sending an unequip item packet
	 * to the server.
	 */
	unequipItem: (slot: EquipmentSlot) => void,



	/**
	 * Retrieves the equipment item definition for the specified equipment slot.
	 */
	getEquipment: (slot: EquipmentSlot) => ItemDefinition | null
	isItemEquipped: (item: ItemId) => boolean,
	isVariantOrItemEquipped: (item: ItemId) => boolean,



	/**
	 * Initialize the equipment manager.
	 */
	initialize: (data: LoginDataMessage) => void,
	/**
	 * Cleans up the equipment manager, should always be called when the player
	 * disconnects from the game server.
	 */
	cleanup: () => void,
}

export const EquipmentManager = (managers: ManagerStorage): EquipmentManagerType => {
	const loading = useLoading();
	const debug = useConsole();

	const ammunitionAmount = useSmartRef<Int>(0);
	const equipment = useSmartRef<EquipmentMap>(new Map<EquipmentSlot, ItemId>());
	const equipmentListener = useIndexEventListener<ItemId>(ctx => {
		for (const [slot, item] of equipment.content()) {
			if (item === null) continue;
			ctx.set(slot, item);
		}
	})

	/*
	 * Private functions
	 */

	const setEquipment = (content: EquipmentMap) => {

		for (const [slot, item] of content) {
			const itemDef = GameData.items().item(item);
			EquipmentEvents.ItemEquipEvent.fire(itemDef, slot);
		}

		equipment.setContent(content);
		equipmentListener.reinitialize(ctx => {
			for (const [slot, item] of content) {
				if (item === null) continue;
				ctx.set(slot, item);
			}
		});
	}

	/*
	 * Network functions
	 */

	const equipItem = (item: ItemStack) => {
		const itemDef = GameData.items().item(item.id);
		if (itemDef.equipmentSlot === EquipmentSlot.None) return;

		// Check if we actually have the item.
		if (!managers.inventoryManager!.hasItem(item.id, Math.max(1, item.count))) return;

		if (loading.is(LOADING_EQUIP_ITEM)) return;
		loading.set(LOADING_EQUIP_ITEM, "Equipping item");
		debug.log(`Inventory: Equipping item ${item.id}.`)
		Network.send(new EquipItemMessage(item.id, item.count));
	}

	const unequipItem = (slot: EquipmentSlot) => {
		const content = equipment.content();
		const equipped = content.get(slot);
		if (equipped === undefined)
			throw new Error(`Tried to unequip item from invalid slot ${slot}.`);

		// Notify the server.
		if (loading.is(LOADING_UNEQUIP_ITEM)) return;
		loading.set(LOADING_UNEQUIP_ITEM, "Unequipping item");
		debug.log(`Inventory: Unequipping item ${equipped}.`)
		Network.send(new UnequipItemMessage(equipped));
	}

	/*
	 * Functions
	 */

	const getEquipment = (slot: EquipmentSlot) => {
		const content = equipment.content();
		const id = content.get(slot);
		if (id === undefined) return null;
		return GameData.items().item(id);
	}

	const isItemEquipped = (item: ItemId) => {
		const content = equipment.content();
		for (const [_, id] of content) {
			if (id === item) return true;
		}
		return false;
	}

	const isVariantOrItemEquipped = (item: ItemId) => {
		const content = equipment.content();
		for (const [_, id] of content) {
			const itemDef = GameData.items().item(id);
			let itemId = itemDef.originalItemId;
			if (itemId === null) itemId = itemDef.id;
			if (itemId === item) return true;
		}
		return false;
	}

	/*
	 * Helpers
	 */

	const removeEquipmentSlot = (slot: EquipmentSlot) => {
		const content = equipment.content() as Map<EquipmentSlot, ItemId>;
		const current = content.get(slot) && { id: content.get(slot)!, count: 1 };
		if (!current) return;

		// Remove the current item.
		content.delete(slot);

		// If the slot was the ammunition slot, then also update the count.
		if (slot === EquipmentSlot.Ammunition) {
			current.count = ammunitionAmount.content();
			ammunitionAmount.setContent(0);
		}

		// Add the current item to the inventory.
		managers.inventoryManager!.addItem(current, current.count); // We want to throw if this is null.
		EquipmentEvents.ItemUnequipEvent.fire(GameData.items().item(current.id), slot);
	}

	const setEquipmentSlot = (slot: EquipmentSlot, itemId: ItemId, amount: number) => {
		// Remove the item from the inventory.
		managers.inventoryManager!.removeItem(itemId, amount); // We want to throw if this is null.

		// Equip the item.
		const content = equipment.content() as Map<EquipmentSlot, ItemId>;
		content.set(slot, itemId);
		equipment.trigger();
		EquipmentEvents.ItemEquipEvent.fire(GameData.items().item(itemId), slot);

		// If the slot was the ammunition slot, then also update the
		// ammunition amount.
		if (slot !== EquipmentSlot.Ammunition) return;
		ammunitionAmount.setContent(amount);
	}

	/*
	 * Packet listeners
	 */

	usePacket<EquipItemMessage>(packet => {
		const itemId = packet.ItemId;
		let amount = packet.Amount;

		const itemDef = GameData.items().item(itemId);
		const slot = itemDef.equipmentSlot;
		if (slot !== EquipmentSlot.Ammunition) amount = 1;

		removeEquipmentSlot(slot);
		setEquipmentSlot(slot, itemId, amount);

		loading.remove(LOADING_EQUIP_ITEM);
	}, [], PacketType.EquipItemMessage);

	usePacket<UnequipItemMessage>(packet => {
		const itemId = packet.ItemId;

		const content = equipment.content() as Map<EquipmentSlot, ItemId>;
		const entry = Array.from(content.entries())
			.find(([_, item]) => item === itemId);

		if (entry) {
			const slot = entry[0];
			const current = { id: entry[1], count: 1 };

			content.delete(slot);
			equipment.trigger();

			if (slot === EquipmentSlot.Ammunition) {
				current.count = ammunitionAmount.content();
				ammunitionAmount.setContent(0);
			}

			// Add the item to the inventory.
			managers.inventoryManager!.addItem(current, current.count); // We want to throw if this is null.
			EquipmentEvents.ItemUnequipEvent.fire(GameData.items().item(current.id), slot);
		}

		loading.remove(LOADING_UNEQUIP_ITEM);
	}, [], PacketType.UnequipItemMessage);

	/*
	 * Initialization
	 */

	const initialize = (data: LoginDataMessage) => {
		if (data.EquipmentJson === undefined || data.EquipmentJson === null)
			throw new Error("InventoryManager: Received login data without equipment.");
		const parsedEquipment: ItemId[] = JSON.parse(data.EquipmentJson);
		const equipment = new Map<EquipmentSlot, ItemId>(parsedEquipment.map(value => {
			const item = GameData.items().item(value);
			if (item.equipmentSlot === EquipmentSlot.None) {
				console.error(`InventoryManager: Received equipment item without equipment slot: ${value}`);
				return [EquipmentSlot.None, item.id];
			}

			return [item.equipmentSlot, item.id];
		}));
		const ammunition = data.EquippedAmmunitionAmount;

		setEquipment(equipment);
		ammunitionAmount.setContent(ammunition);
	}

	const cleanup = () =>  {
		setEquipment(new Map<EquipmentSlot, ItemId>());
		ammunitionAmount.setContent(0);
	}

	return {
		$managerName: "equipmentManager",

		equipment: equipment,
		equipmentListener: equipmentListener,
		ammunitionAmount: ammunitionAmount,

		equipItem: equipItem,
		unequipItem: unequipItem,

		getEquipment: getEquipment,
		isItemEquipped: isItemEquipped,
		isVariantOrItemEquipped: isVariantOrItemEquipped,

		initialize: initialize,
		cleanup: cleanup
	}
}