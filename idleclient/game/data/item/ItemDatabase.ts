import {
	EquipmentSlot, Int, PotionType,
	Skill, UpgradeType,
	WeaponEffectType
} from "@idleclient/network/NetworkData.ts";
import { ItemId, ItemStack } from "@idleclient/types/gameTypes.ts";
import { SpriteSheet } from "@idleclient/game/sprite/SpriteSheet.ts";
import ItemSheet from "@idleclient/data/sheets/item_atlas.json";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";
import { AllItemPricesResult, IdleClansAPI } from "@/api/IdleClansAPI.ts";
import { GameContextType } from "@context/GameContext.tsx";
import { PotionDatabase } from "@idleclient/game/data/PotionDatabase.ts";
import { IdleClansMath } from "@idleclient/game/utils/IdleClansMath.ts";
import { UpgradeDatabase } from "@idleclient/game/data/UpgradeDatabase.ts";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";

export class ItemDatabase {

	/**
	 * Item Price
	 */

	public static readonly cachedItemPrices: Map<number, { average: number, sell: number, buy: number }> = new Map();
	private static itemPriceIntervalId: ReturnType<typeof setInterval> | undefined = undefined;

	/*
	 * Items
	 */

	public static readonly GOLD_ITEM_ID = 19;
	public static readonly NULL_ITEM_ID = 452;
	public static readonly GEMSTONES = new Set([225, 226, 227, 228, 229, 230, 787]);

	public static readonly SKILLING_CAPES_TIER_1 = new Set([463, 456, 464, 454, 468, 457, 470, 453, 455, 462, 469, 467, 471, 461, 465, 458, 460, 459, 466, 930]);
	public static readonly SKILLING_CAPES_TIER_2 = new Set([479, 478, 477, 476, 472, 474, 473, 475, 481, 480, 483, 484, 485, 486, 487, 488, 489, 490, 482, 931]);
	public static readonly SKILLING_CAPES_TIER_3 = new Set([497, 496, 495, 491, 493, 492, 499, 494, 500, 498, 502, 508, 507, 506, 509, 504, 503, 501, 505, 932]);
	public static readonly SKILLING_CAPES_TIER_4 = new Set([516, 515, 514, 510, 512, 511, 518, 513, 519, 517, 521, 527, 526, 525, 528, 523, 522, 520, 524, 933]);
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

		const count = this.itemsById.size;
		const cosmetics = Array.from(this.itemsById.values())
			.filter(item => item.isCosmeticVariant())
			.length;

		// Market price API, fetch prices every 5 minutes?
		if (ItemDatabase.itemPriceIntervalId === undefined) {
			const handleItemPriceInterval = (value: AllItemPricesResult) => {
				if (value.error !== undefined) {
					console.error(`ItemDatabase: Failed to fetch item prices: ${value.error}`);
					return;
				}

				ItemDatabase.cachedItemPrices.clear();
				value.items.forEach(item => {
					ItemDatabase.cachedItemPrices.set(item.itemId, {
						average: item.dailyAveragePrice,
						sell: item.lowestSellPrice,
						buy: item.highestBuyPrice,
					});
				});

				console.log(`ItemDatabase: Fetched ${ItemDatabase.cachedItemPrices.size} item prices.`);
			}

			ItemDatabase.itemPriceIntervalId = setInterval(() => {
				IdleClansAPI.PlayerMarket.getItemPrices().then(value => handleItemPriceInterval(value));
			}, 2 * 60 * 1000);

			// Run it once manually.
			IdleClansAPI.PlayerMarket.getItemPrices().then(value => handleItemPriceInterval(value));
		}

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
	public static item(id: ItemId | string | ItemStack): ItemDefinition {
		return GameData.items().item(id);
	}

	/*
	 * Helpers
	 */

	public static getSellValue(item: ItemDefinition, game: GameContextType | undefined): Int {
		if (item.baseValue === 0) return 0;
		let value = item.baseValue;

		const hasLastNegotiation = game?.player?.isUpgradeUnlocked(UpgradeType.upgrade_last_negotiation) === true;
		if (hasLastNegotiation || game?.potion?.isPotionActive(PotionType.Negotiation) === true) {
			const potion = PotionDatabase.getPotion(PotionType.Negotiation);
			if (potion === undefined) throw new Error("Potion is undefined (Negotiation)");
			const power = potion.effectStrengthPercentage;

			value = IdleClansMath.get().multiply_by_percentage_double_double(value, power);
		}

		if (game?.clan?.isUpgradeUnlocked(UpgradeType.clan_upgrade_an_offer_they_cant_refuse) === true) {
			const upgrade = UpgradeDatabase.getUpgrade(UpgradeType.clan_upgrade_an_offer_they_cant_refuse);
			if (upgrade === undefined) throw new Error("Upgrade is undefined (clan_upgrade_an_offer_they_cant_refuse)");
			const power = upgrade.tierUnlocks.length > 0 ? upgrade.tierUnlocks[0] : undefined;
			if (power === undefined) throw new Error("Upgrade power is undefined (clan_upgrade_an_offer_they_cant_refuse)");

			value = IdleClansMath.get().multiply_by_percentage_double_double(value, power);
		}

		if (item.associatedSkill === Skill.Carpentry &&
			(this.name.includes("plank") || this.name.includes("heartwood"))) {
			if (game?.player?.isUpgradeUnlocked(UpgradeType.upgrade_plank_cost) === true) {
				const power = game.player.getUpgradeBenefits(UpgradeType.upgrade_plank_cost);

				value = IdleClansMath.get().multiply_by_percentage_double_double(value, power);
			}
		}

		if (value > SettingsDatabase.shared().maxPlayerGold)
			value = SettingsDatabase.shared().maxPlayerGold;

		// (int)value
		return Math.trunc(value);
	}

	public static getPotionTime(item: ItemDefinition, game: GameContextType | undefined): number {
		if (item.potionEffectDurationSeconds === 0) return 0;
		const time = item.potionEffectDurationSeconds;
		let modifier = 1;

		if (game?.player?.isUpgradeUnlocked(UpgradeType.upgrade_responsible_drinking) === true) modifier *= 1.1;
		if (game?.clan?.isUpgradeUnlocked(UpgradeType.clan_upgrade_bigger_bottles)) modifier *= 1.25;

		return Math.trunc(time * modifier);
	}
}