import { GameContextType } from "@context/GameContext.tsx";
import { EquipmentSlot, Skill } from "@idleclient/network/NetworkData.ts";

export class EnchantmentUtils {

	public static ENCHANTABLE_EQUIPMENT_SLOTS = [ EquipmentSlot.Earrings, EquipmentSlot.Amulet,
		EquipmentSlot.Jewellery, EquipmentSlot.Bracelet ];

	public static getEnchantmentBoostForSkill(game: GameContextType, skill: Skill): number {
		const enchantments = game.player.enchantments.content();
		let boost = 0;

		for (const slot of this.ENCHANTABLE_EQUIPMENT_SLOTS) {
			const equipped = game.equipment.getEquipment(slot);
			if (equipped === null || !equipped.isEnchanted()) continue;

			const skillsEnchanted = enchantments.get(equipped.getOriginalItemId() ?? -1);
			if (skillsEnchanted === undefined) continue;
			if (!skillsEnchanted.includes(skill)) continue;

			boost += equipped.enchantmentBoost;
		}

		return boost;
	}
}