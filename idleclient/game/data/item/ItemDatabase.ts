import {
	EquipmentSlot,
	Float,
	Int,
	ItemEffectTriggerType,
	Skill,
	WeaponEffectType
} from "@idleclient/network/NetworkData.ts";
import { ItemId, ItemStack } from "@idleclient/types/gameTypes.ts";
import { SpriteSheet } from "@idleclient/game/sprite/SpriteSheet.ts";
import ItemSheet from "@idleclient/data/sheets/item_atlas.json";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";

export class ItemDatabase {

	public static readonly GOLD_ITEM_ID = 19;
	public static readonly NULL_ITEM_ID = 452;

	public static readonly GEMSTONES = new Set([225, 226, 227, 228, 229, 230, 787]);

	public static readonly SKILLING_CAPES_TIER_1 = new Set([463, 456, 464, 454, 468, 457, 470, 453, 455, 462, 469, 467, 471, 461, 465, 458, 460, 459, 466]);
	public static readonly SKILLING_CAPES_TIER_2 = new Set([479, 478, 477, 476, 472, 474, 473, 475, 481, 480, 483, 484, 485, 486, 487, 488, 489, 490, 482]);
	public static readonly SKILLING_CAPES_TIER_3 = new Set([497, 496, 495, 491, 493, 492, 499, 494, 500, 498, 502, 508, 507, 506, 509, 504, 503, 501, 505]);
	public static readonly SKILLING_CAPES_TIER_4 = new Set([516, 515, 514, 510, 512, 511, 518, 513, 519, 517, 521, 527, 526, 525, 528, 523, 522, 520, 524]);
	public static readonly SKILLING_CAPES_BY_TIER = new Map<number, Set<number>>([
		[1, ItemDatabase.SKILLING_CAPES_TIER_1], [2, ItemDatabase.SKILLING_CAPES_TIER_2],
		[3, ItemDatabase.SKILLING_CAPES_TIER_3], [4, ItemDatabase.SKILLING_CAPES_TIER_4]
	]);

	public static readonly TOOLS_BY_SKILL: Map<Skill, Set<number>> = new Map();

	public readonly sheet: SpriteSheet;
	private readonly itemsById: Map<number, ItemDefinition> = new Map();
	private readonly itemsByName: Map<string, ItemDefinition> = new Map();

	private readonly unknownItem: ItemDefinition = new ItemDefinition({
		ItemId: -1,
		Name: "UNKNOWN_ITEM"
	}, null);

	constructor(itemData: { _id: string, Items: any[] }) {
		const startTime = Date.now();

		// Register the item sheet.
		this.sheet = new SpriteSheet([{dataSheet: ItemSheet, path: "/atlas/items"}]);

		// Register the items.
		for (const entry of itemData.Items) {
			const item = new ItemDefinition(entry, this.sheet);
			this.itemsById.set(item.id, item);
			this.itemsByName.set(item.name, item);

			if (item.isTool && item.skillBoost?.skill) {
				const tools = ItemDatabase.TOOLS_BY_SKILL.get(item.skillBoost.skill) ?? new Set<number>();
				tools.add(item.id);
				ItemDatabase.TOOLS_BY_SKILL.set(item.skillBoost.skill, tools);
			}

			// Register the cosmetic variants if this item is equipable.
			if (item.equipmentSlot === EquipmentSlot.None ||
				item.equipmentSlot === EquipmentSlot.Ammunition ||
				item.equipmentSlot === EquipmentSlot.Pet) continue;

			for (let effect = WeaponEffectType.Flaming; effect <= 4; effect++) {
				const id = Number(`${item.id}100${effect}`);
				const name = `${item.name}_${WeaponEffectType[effect].toLowerCase()}`;

				entry.ItemId = id;
				entry.Name = name;

				const cosmeticItem = new ItemDefinition(entry, this.sheet, item, effect);
				this.itemsById.set(cosmeticItem.id, cosmeticItem);
				this.itemsByName.set(cosmeticItem.name, cosmeticItem);

				if (item.isTool && item.skillBoost?.skill) {
					const tools = ItemDatabase.TOOLS_BY_SKILL.get(item.skillBoost.skill) ?? new Set<number>();
					tools.add(cosmeticItem.id);
					ItemDatabase.TOOLS_BY_SKILL.set(item.skillBoost.skill, tools);
				}

				// Hacky solution to set a private field without complaints.
				((item as any).cosmeticVariantIds as Partial<Record<WeaponEffectType, ItemId>>)[effect] = cosmeticItem.id;
			}
		}

		/*console.log("Skill tools:")
		for (const [skill, tools] of ItemDatabase.TOOLS_BY_SKILL) {
			console.log(`>\t${Skill[skill]}: ` + tools.map(tool => tool.name).join(","))
		}*/

		const count = this.itemsById.size;
		const cosmetics = Array.from(this.itemsById.values())
			.filter(item => item.isCosmeticVariant())
			.length;

		const timeTaken = Date.now() - startTime;
		console.log(`ItemDatabase: Initialized ${count} items, ${cosmetics} of which are cosmetic variants, in ${timeTaken}ms.`);
	}

	public item(id: ItemId | string | ItemStack): ItemDefinition {
		if (typeof id === "string") {
			const item = this.itemsByName.get(id);
			if (item) return item;
			console.warn(`ItemDatabase: Item with name "${id}" not found.`);
			return this.unknownItem;
		}

		if (typeof id === "object") {
			const item = this.itemsById.get(id.id);
			if (item) return item;
			console.warn(`ItemDatabase: Item with id "${id.id}" not found.`);
			return this.unknownItem;
		}

		const item = this.itemsById.get(id);
		if (item) return item;
		console.warn(`ItemDatabase: Item with id "${id}" not found.`);
		return this.unknownItem;
	}

	/**
	 * Get an {@link ItemDefinition} matching the provided id or {@link ItemStack}.
	 *
	 * The returned value will always be an item definition, even if it doesn't
	 * exist. To check if the returned item actually exists or not, use
	 * {@link ItemDefinition#isUnknown}.
	 */
	public static get(id: ItemId | ItemStack): ItemDefinition {
		return GameData.items().item(id);
	}
}