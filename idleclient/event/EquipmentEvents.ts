import { IdleEvent } from "@idleclient/event/IdleEvent.ts";
import { EquipmentSlot } from "@idleclient/network/NetworkData.ts";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";

export class EquipmentEvents {

	/**
	 * Called when an item is equipped.
	 *
	 * The event includes the item definition and the slot that the item was
	 * equipped in.
	 */
	public static readonly ItemEquipEvent: IdleEvent<[ItemDefinition, EquipmentSlot]> = new IdleEvent();
	/**
	 * Called when an item is unequipped.
	 *
	 * The event includes the item definition and the slot that the item was
	 * unequipped from.
	 */
	public static readonly ItemUnequipEvent: IdleEvent<[ItemDefinition, EquipmentSlot]> = new IdleEvent();

}