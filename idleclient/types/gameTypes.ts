import { EquipmentSlot, Skill } from "../network/NetworkData";

export type InventoryArray = ReadonlyArray<ItemStack | null>;
export type EquipmentMap = ReadonlyMap<EquipmentSlot, ItemId>;
export type SkillMap = ReadonlyMap<Skill, number>;

export type ItemId = number;

export interface ItemStack {
	id: ItemId;
	count: number;
}