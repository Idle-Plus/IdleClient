import { EquipmentSlot, Skill, UpgradeType, WeaponType } from "@idleclient/network/NetworkData.ts";
import { GameContextType } from "@context/GameContext.tsx";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";

export class ToolbeltUtils {

	public static readonly TOOLBELT_SKILLS = new Map<number, Skill[]>([
		[ 1, [ Skill.Woodcutting, Skill.Fishing ] ],
		[ 2, [ Skill.Woodcutting, Skill.Fishing, Skill.Mining, Skill.Smithing ] ],
		[ 3, [ Skill.Woodcutting, Skill.Fishing, Skill.Mining, Skill.Smithing, Skill.Cooking, Skill.Crafting ] ],
		[ 4, [ Skill.Woodcutting, Skill.Fishing, Skill.Mining, Skill.Smithing, Skill.Cooking, Skill.Crafting,
			Skill.Agility, Skill.Plundering ] ],
		[ 5, [ Skill.Woodcutting, Skill.Fishing, Skill.Mining, Skill.Smithing, Skill.Cooking, Skill.Crafting,
			Skill.Agility, Skill.Plundering, Skill.Foraging, Skill.Farming ] ],
		[ 6, [ Skill.Woodcutting, Skill.Fishing, Skill.Mining, Skill.Smithing, Skill.Cooking, Skill.Crafting,
			Skill.Agility, Skill.Plundering, Skill.Foraging, Skill.Farming, Skill.Brewing, Skill.Carpentry ] ],
	]);

	public static isToolbeltUnlockedForSkill(toolbeltTier: number, skill: Skill): boolean {
		return this.TOOLBELT_SKILLS.get(toolbeltTier)?.includes(skill) ?? false;
	}

	public static getUnlockedSkills(game: GameContextType): Skill[] {
		if (!game.player.isUpgradeUnlocked(UpgradeType.upgrade_toolbelt)) return [];
		const tier = game.player.getUpgradeBenefits(UpgradeType.upgrade_toolbelt);
		return this.TOOLBELT_SKILLS.get(tier) ?? [];
	}

	public static getToolbeltBoostForSkill(game: GameContextType, toolbeltTier: number, skill: Skill): number {
		if (!this.isToolbeltUnlockedForSkill(toolbeltTier, skill)) return 0;
		const toolsBySkill = ItemDatabase.TOOLS_BY_SKILL.get(skill);

		const highest = Object.keys(WeaponType).length / 2 - 1;
		let highestFoundTier = WeaponType.None;
		let highestFoundTool: ItemDefinition | null = null;

		// Check if we have a tool equipped.
		const equipped = game.equipment.getEquipment(EquipmentSlot.RightHand);
		if (equipped?.isTool && equipped.skillBoost?.skill === skill &&
			toolsBySkill?.has(equipped.getOriginalItemId()) && (equipped.levelRequirement == null ||
				game.skill.hasLevel(equipped.levelRequirement))) {

			// TODO: Check if vanilla uses the tool even if it doesn't match the
			//       skill.

			// Vanilla uses the tool boost percentage of the tool equipped in the toolbelt slot.
			return equipped.skillBoost.boostPercentage;
		}

		// Find the highest tier tool in our inventory.
		const inventory = game.inventory.inventory.content();
		for (const entry of inventory) {
			if (!entry || entry.count <= 0) continue;
			if (!toolsBySkill?.has(entry.id)) continue;

			const itemDef = ItemDatabase.item(entry.id);
			if (itemDef.weaponType < highestFoundTier) continue;
			if (itemDef.levelRequirement != null && !game.skill.hasLevel(itemDef.levelRequirement)) continue;

			highestFoundTool = itemDef;
			highestFoundTier = itemDef.weaponType;

			if (highestFoundTier >= highest) {
				const percentage = highestFoundTool?.skillBoost?.boostPercentage ?? -1;
				if (percentage >= 0) return percentage;
				else throw new Error("Invalid tool boost percentage: " + percentage + ", ");
			}
		}

		if (!highestFoundTool) return 0;
		const percentage = highestFoundTool.skillBoost?.boostPercentage ?? -1;
		if (percentage < 0) throw new Error("Invalid tool boost percentage: " + percentage);
		return percentage;
	}
}