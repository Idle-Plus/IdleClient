import {
	AttackStyle,
	EquipmentSlot,
	Float,
	Int,
	ItemActivatableType,
	ItemCategory,
	ItemEffectTriggerType,
	MasteryCapeType,
	PotionType,
	Skill,
	TaskType,
	UpgradeType,
	WeaponClassType,
	WeaponEffectType,
	WeaponType
} from "@idleclient/network/NetworkData.ts";
import { SheetIcon, SpriteSheet } from "@idleclient/game/sprite/SpriteSheet.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import { ItemId } from "@idleclient/types/gameTypes";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { GameContextType } from "@context/GameContext.tsx";
import { PotionDatabase } from "@idleclient/game/data/PotionDatabase.ts";
import { LocalizationDatabase } from "@idleclient/game/data/LocalizationDatabase.ts";
import { EnchantmentScrollType } from "@idleclient/game/types/EnchantmentScrollType.ts";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";
import { TaskDatabase } from "@idleclient/game/data/TaskDatabase.ts";

// Safe "parsed" item objects

interface ItemWeaponMonsterIdWeakness {
	damageBoost: Int;
	weakMonsters: Int[];
}

interface ItemWeaponMonsterWeakness {
	damageBoost: Int;
	weakMonsters: string[];
}

interface ItemStatBonus {
	strength: Int;
	accuracy: Int;
	defence: Int;
}

interface ItemSkillBoost {
	skill: Skill;
	boostPercentage: Float;
}

export interface ItemLevelRequirement {
	skill: Skill;
	level: Int;
}

interface ItemTriggerEffect {
	triggerType: ItemEffectTriggerType;
	triggerChancePercentage: Int;
	triggerPower: Float;
}

// Item objects

interface WeaponMonsterIdWeakness {
	DamageBoost?: Int;
	WeakMonsters?: Int[];
}

interface WeaponMonsterWeakness {
	DamageBoost?: Int;
	WeakMonsters?: string[] | null;
}

interface SkillBoost {
	Skill?: Skill;
	BoostPercentage?: Float;
}

interface TriggerEffect {
	TriggerType?: ItemEffectTriggerType;
	TriggerChancePercentage?: Int;
	TriggerPower?: Float;
}

interface LevelRequirement {
	Skill?: Skill;
	Level?: Int;
}

export class ItemDefinition {

	// Everything is private as I don't want to expose the names
	// used inside the gameData.json, it might be changed or
	// removed. So, just to be on the safe side, getters should be
	// provided instead.

	private readonly ExtraBoostAgainstWeakEnemiesPercentage: Int = 0;
	private readonly ExtraBoostPercentageAgainstQuestMonsters: Int = 0;
	//
	private readonly ItemId: ItemId;
	private readonly Name: string;
	private readonly DescriptionLocKey?: string;
	//
	private readonly Discontinued: boolean = false;
	private readonly ItemCounterpartId: Int = 0;
	private readonly BaseValue: Int = 0;
	private readonly AssociatedSkill: Skill = Skill.None;
	private readonly CanNotBeSoldToGameShop: boolean = false;
	private readonly CanNotBeTraded: boolean = false;
	private readonly TradeableWithClan: boolean = false;
	private readonly FlipSprite: boolean = false;
	private readonly IsTool: boolean = false;
	private readonly MasteryCapeType: MasteryCapeType = MasteryCapeType.None;
	private readonly Category: ItemCategory = ItemCategory.None;
	private readonly EquipmentSlot: EquipmentSlot = EquipmentSlot.None;
	//
	private readonly StrengthBonus: Int = 0;
	private readonly AccuracyBonus: Int = 0;
	private readonly DefenceBonus: Int = 0;
	private readonly ArcheryStrengthBonus: Int = 0;
	private readonly ArcheryAccuracyBonus: Int = 0;
	private readonly ArcheryDefenceBonus: Int = 0;
	private readonly MagicStrengthBonus: Int = 0;
	private readonly MagicAccuracyBonus: Int = 0;
	private readonly MagicDefenceBonus: Int = 0;
	//
	private readonly AttackInterval: Int = 0;
	private readonly TwoHanded: boolean = false;
	private readonly NeverConsume: boolean = false;
	private readonly WeaponMonsterWeakness?: WeaponMonsterIdWeakness; // ItemWeaponMonsterIdWeakness object
	private readonly MonsterDefensiveBoost?: WeaponMonsterWeakness; // ItemWeaponMonsterWeakness object
	private readonly Style: AttackStyle = AttackStyle.None;
	private readonly WeaponType: WeaponType = WeaponType.None;
	private readonly WeaponClass: WeaponClassType = WeaponClassType.None;
	//
	private readonly ActivatableType: ItemActivatableType = ItemActivatableType.None;
	private readonly PotionType: PotionType = PotionType.None;
	private readonly PotionEffectDurationSeconds: Int = 0;
	private readonly HealthAppliedOnConsume: Int = 0;
	private readonly SkillBoost?: SkillBoost; // ItemSkillBoost object
	private readonly TriggerEffects?: TriggerEffect[]; // ItemTriggerEffect object
	private readonly InventoryConsumableBoost?: SkillBoost; // ItemSkillBoost object
	private readonly LevelRequirement?: LevelRequirement; // ItemLevelRequirement object
	private readonly CosmeticScrollEffect: WeaponEffectType = WeaponEffectType.None;
	//
	private readonly UsableEnchantmentScroll: EnchantmentScrollType = EnchantmentScrollType.None;
	private readonly EnchantedVersionItemId: Int = 0;
	private readonly EnchantmentBoost: Float = 0;
	private readonly EnchantingSkillType: Skill = Skill.None;
	private readonly ScrollType: EnchantmentScrollType = EnchantmentScrollType.None;
	private readonly ProcChance: Int = 0;

	/*
	 * Custom properties
	 */

	public readonly meleeBonus: ItemStatBonus | null;
	public readonly archeryBonus: ItemStatBonus | null;
	public readonly magicBonus: ItemStatBonus | null;

	public readonly weaponMonsterWeakness: ItemWeaponMonsterIdWeakness | null;
	public readonly monsterDefensiveBoost: ItemWeaponMonsterWeakness | null;

	public readonly skillBoost: ItemSkillBoost | null;
	public readonly triggerEffects: ItemTriggerEffect[] | null;
	public readonly inventoryConsumableBoost: ItemSkillBoost | null;
	public readonly levelRequirement: ItemLevelRequirement | null;

	public readonly originalItemId: ItemId | null;
	public readonly cosmeticVariant: WeaponEffectType;

	/*
	 * Other
	 */

	private readonly cosmeticVariantIds: Partial<Record<WeaponEffectType, ItemId>> = {};
	private readonly icon: SheetIcon | null = null;
	private readonly icon32: SheetIcon | null = null;
	private readonly icon48: SheetIcon | null = null;

	/*
	 * Cached values
	 */

	private _masteryCapeTier: Int | null = null;

	constructor(
		entry: any,
		sheet: SpriteSheet | null,
		originalItemId?: ItemDefinition,
		cosmeticVariant?: WeaponEffectType
	) {
		Object.assign(this, entry);
		this.ItemId = entry.ItemId ?? 0;
		if (!entry.Name) throw new Error(`Item name is null: ${entry}`);
		this.Name = entry.Name;

		// Cosmetic info.
		this.originalItemId = originalItemId?.id ?? null;
		this.cosmeticVariant = cosmeticVariant ?? WeaponEffectType.None;

		// Pre-fetch the item icon.
		if (originalItemId) this.icon = originalItemId.icon;
		else {
			let textureName = this.name;
			if (textureName.endsWith("_enchanted"))
				textureName = textureName.replace("_enchanted", "");

			this.icon = sheet != null ? sheet.getIcon(textureName) : null;
			this.icon32 = sheet != null ? sheet.getIcon(textureName + "_32") : null;
			this.icon48 = sheet != null ? sheet.getIcon(textureName + "_48") : null;
		}

		// Combat bonuses.
		this.meleeBonus = this.StrengthBonus !== 0 || this.AccuracyBonus !== 0 || this.DefenceBonus !== 0
			? {strength: this.StrengthBonus ?? 0, accuracy: this.AccuracyBonus ?? 0, defence: this.DefenceBonus ?? 0}
			: null;
		this.archeryBonus = this.ArcheryStrengthBonus !== 0 || this.ArcheryAccuracyBonus !== 0 || this.ArcheryDefenceBonus !== 0
			? { strength: this.ArcheryStrengthBonus ?? 0, accuracy: this.ArcheryAccuracyBonus ?? 0, defence: this.ArcheryDefenceBonus ?? 0 }
			: null;
		this.magicBonus = this.MagicStrengthBonus !== 0 || this.MagicAccuracyBonus !== 0 || this.MagicDefenceBonus !== 0
			? { strength: this.MagicStrengthBonus ?? 0, accuracy: this.MagicAccuracyBonus ?? 0, defence: this.MagicDefenceBonus ?? 0 }
			: null;

		// Weapon monster weakness.
		this.weaponMonsterWeakness = this.WeaponMonsterWeakness
			? { damageBoost: this.WeaponMonsterWeakness.DamageBoost ?? 0, weakMonsters: this.WeaponMonsterWeakness.WeakMonsters ?? [] }
			: null;

		// Monster defensive boost.
		// We only create the custom object if there is actually some data and
		// not just an empty object.
		if (this.MonsterDefensiveBoost) {
			const damageBoost = this.MonsterDefensiveBoost.DamageBoost ?? 0;
			const weakMonsters = this.MonsterDefensiveBoost.WeakMonsters ?? [];
			if (damageBoost !== 0 && weakMonsters.length > 0) this.monsterDefensiveBoost = { damageBoost, weakMonsters };
			else this.monsterDefensiveBoost = null;
		} else this.monsterDefensiveBoost = null;

		// Skill boost.
		this.skillBoost = this.SkillBoost
			? {skill: this.SkillBoost.Skill ?? Skill.None, boostPercentage: this.SkillBoost.BoostPercentage ?? 0}
			: null;

		// Trigger effects.
		this.triggerEffects = this.TriggerEffects
			? this.TriggerEffects.map(triggerEffect => {
				return { triggerType: triggerEffect.TriggerType ?? ItemEffectTriggerType.None, triggerChancePercentage:
						triggerEffect.TriggerChancePercentage ?? 0, triggerPower: triggerEffect.TriggerPower ?? 0 }
			}) : null;

		// Inventory consumable boost.
		this.inventoryConsumableBoost = this.InventoryConsumableBoost
			? { skill: this.InventoryConsumableBoost.Skill ?? Skill.None, boostPercentage: this.InventoryConsumableBoost.BoostPercentage ?? 0 }
			: null;

		// Level requirement.
		this.levelRequirement = this.LevelRequirement
			? {skill: this.LevelRequirement.Skill ?? Skill.None, level: this.LevelRequirement.Level ?? 0}
			: null;
	}

	/*
	 * Getters
	 */

	get id(): ItemId { return this.ItemId; }
	get name(): string { return this.Name; }
	get description(): string | null { return this.DescriptionLocKey ?? null; }
	//
	get discontinued(): boolean { return this.Discontinued; }
	get itemCounterpartId(): Int { return this.ItemCounterpartId; }
	get baseValue(): Int { return this.BaseValue; }
	get associatedSkill(): Skill { return this.AssociatedSkill; }
	get canNotBeSoldToGameShop(): boolean { return this.CanNotBeSoldToGameShop; }
	get canNotBeTraded(): boolean { return this.CanNotBeTraded; }
	get tradeableWithClan(): boolean { return this.TradeableWithClan; }
	get flipSprite(): boolean { return this.FlipSprite; }
	get isTool(): boolean { return this.IsTool; }
	get masteryCapeType(): MasteryCapeType { return this.MasteryCapeType; }
	get equipmentSlot(): EquipmentSlot { return this.EquipmentSlot; }

	// Combat bonuses

	get meleeStrengthBonus(): Int { return this.StrengthBonus;}
	get meleeAccuracyBonus(): Int { return this.AccuracyBonus; }
	get meleeDefenceBonus(): Int { return this.DefenceBonus; }
	get archeryStrengthBonus(): Int { return this.ArcheryStrengthBonus; }
	get archeryAccuracyBonus(): Int { return this.ArcheryAccuracyBonus; }
	get archeryDefenceBonus(): Int { return this.ArcheryDefenceBonus; }
	get magicStrengthBonus(): Int { return this.MagicStrengthBonus; }
	get magicAccuracyBonus(): Int { return this.MagicAccuracyBonus; }
	get magicDefenceBonus(): Int { return this.MagicDefenceBonus; }

	get attackInterval(): Int { return this.AttackInterval; }
	get twoHanded(): boolean { return this.TwoHanded; }

	get attackStyle(): AttackStyle { return this.Style; }
	get weaponType(): WeaponType { return this.WeaponType; }

	get activatableType(): ItemActivatableType { return this.ActivatableType; }
	get potionType(): PotionType { return this.PotionType; }
	get potionEffectDurationSeconds(): Int { return this.PotionEffectDurationSeconds; }
	get healthAppliedOnConsume(): Int { return this.HealthAppliedOnConsume; }

	get enchantmentBoost(): Float { return this.EnchantmentBoost; }

	get procChance(): Int { return this.ProcChance; }

	/*
	 * Methods
	 */

	public isUnknown(): boolean {
		return this.id === -1;
	}

	public getOriginalItemId(): ItemId {
		return this.originalItemId ?? this.id;
	}

	public isItem(itemId: ItemId): boolean {
		return this.id === itemId || this.originalItemId === itemId;
	}

	public getLocalizedName(): string {
		if (this.isCosmeticVariant()) {
			const baseName = ItemDatabase.item(this.getOriginalItemId()).getLocalizedName();
			return `${baseName} (${WeaponEffectType[this.cosmeticVariant]})`
		}

		// Handle mastery capes.
		if (this.MasteryCapeType !== MasteryCapeType.None) {
			return this.getMasteryCapeLocalizedName();
		}

		return GameData.localization().get(this.name);
	}

	public getLocalizedDescription(game?: GameContextType): string | null {
		// Monster defensive boost
		if (this.monsterDefensiveBoost !== null) {
			const data = this.monsterDefensiveBoost;
			// We don't need to check if the object contains empty / default data,
			// as that is filtered in the constructor.
			return LocalizationDatabase.loc(this.description ?? "",
				[ data.damageBoost, LocalizationDatabase.loc(data.weakMonsters[0]) ]);
		}

		// Quest monster boost
		if (this.ExtraBoostPercentageAgainstQuestMonsters > 0 && (this.description?.length ?? 0) > 0)
			return LocalizationDatabase.loc(this.description!, [this.ExtraBoostPercentageAgainstQuestMonsters]);

		// Bloodmoon helmet
		if (this.isItem(889)) {
			let bloodmoonHelmetBonus = 6;
			if (game?.player.isUpgradeUnlocked(UpgradeType.upgrade_bloodmoon_helmet_upgrade))
				bloodmoonHelmetBonus *= 2;

			return LocalizationDatabase.loc(this.description ?? "", [bloodmoonHelmetBonus]);
		}

		// Inventory and clan vault tokens
		switch (this.id) {
			case 600: // Inventory space token
				return LocalizationDatabase.loc(this.description ?? "",
					[SettingsDatabase.shared().iapInventorySpacePerPurchase]);
			case 684: { // Clan vault space token
				const clan = game?.clan?.clan?.content();
				if (!clan) {
					return LocalizationDatabase.loc("clan_vault_space_token_description_no_clan",
						[SettingsDatabase.shared().iapClanVaultSpacePerPurchase]);
				}

				const purchasedSpace = clan.purchasedVaultSpace;
				return LocalizationDatabase.loc(this.description ?? "", [
					SettingsDatabase.shared().iapClanVaultSpacePerPurchase,
					purchasedSpace,
					clan.isIronmanClan() ? SettingsDatabase.shared().iapMaxPurchasableClanVaultSpaceIronman :
						SettingsDatabase.shared().iapMaxPurchasableClanVaultSpace
				]);
			}
			default:
				break;
		}

		// Inventory consumable boost
		if (this.inventoryConsumableBoost !== null)
			return LocalizationDatabase.loc(this.description ?? "", [this.inventoryConsumableBoost.boostPercentage,
				LocalizationDatabase.loc(SkillUtils.getLocalizedSkillName(this.inventoryConsumableBoost.skill))]);

		// Belt localization is skipped as we're not adding skill icons.

		// Mastery capes
		if (this.MasteryCapeType !== MasteryCapeType.None)
			return this.getMasteryCapeLocalizedDescription();

		// Potion
		if (this.potionType !== PotionType.None)
			return this.getPotionDescription(game);

		// Trigger effects
		if ((this.triggerEffects?.length ?? 0) > 0)
			return this.getTriggerEffectLocalizations();

		// Boost against weak enemies
		if (this.ExtraBoostAgainstWeakEnemiesPercentage > 0 && (this.description?.length ?? 0) > 0)
			return LocalizationDatabase.loc(this.description!, [this.ExtraBoostAgainstWeakEnemiesPercentage]);

		if ((this.description?.length ?? 0) === 0 && this.weaponMonsterWeakness !== null &&
			this.weaponMonsterWeakness.weakMonsters.length > 0) {
			const combatTasks = (TaskDatabase.getTaskCategories(TaskType.Combat) ?? [])
				.flatMap(category => category.tasks);

			const monsterNames = this.weaponMonsterWeakness.weakMonsters
				.map(id => combatTasks.find(task => task.taskId === id)?.name)
				.filter(task => task !== undefined)
				.map(name => LocalizationDatabase.loc(name))
				.join(", ");

			if (this.ExtraBoostPercentageAgainstQuestMonsters > 0) {
				const p1 = LocalizationDatabase.loc("strong_against_monster_item_with_boost_description",
					[this.weaponMonsterWeakness.damageBoost, monsterNames]);
				const p2 = LocalizationDatabase.loc("otherworldly_weapon_description",
					[this.ExtraBoostPercentageAgainstQuestMonsters]);
				return `${p1}.<br><br>${p2}`
			}

			return LocalizationDatabase.loc("strong_against_monster_item_with_boost_description",
				[this.weaponMonsterWeakness.damageBoost, monsterNames]);
		}

		return this.description != null ? LocalizationDatabase.loc(this.description) : null;
	}

	/**
	 * Get the tier of the mastery cape, or -1 if this item isn't a mastery
	 * cape.
	 */
	public getMasteryCapeTier(): Int {
		if (this._masteryCapeTier !== null) return this._masteryCapeTier;

		if (this.MasteryCapeType === MasteryCapeType.None) {
			this._masteryCapeTier = -1;
			return -1;
		}

		const index = this.name.indexOf("_tier_");
		let tier = index > 0 ? parseInt(this.name.substring(index + 6)) : 1;
		if (isNaN(tier)) tier = 1;
		this._masteryCapeTier = tier;
		return tier;
	}

	public isEnchanted(): boolean {
		return this.EnchantmentBoost > 0;
	}

	public isCosmeticVariant(): boolean {
		return this.originalItemId !== null && this.cosmeticVariant !== null;
	}

	public getCosmeticEffect(): WeaponEffectType | null {
		if (this.isCosmeticVariant()) return this.cosmeticVariant;
		if (this.CosmeticScrollEffect === WeaponEffectType.None) return null;
		return this.CosmeticScrollEffect;
	}

	public getIcon(size?: number): SheetIcon | null {
		switch (size) {
			case 32: return this.icon32;
			case 48: return this.icon48;
			case undefined: return this.icon;
			default: return null;
		}
	}

	public getMarketPrice(): { average: Int, sell: Int, buy: Int } | null {
		return ItemDatabase.cachedItemPrices.get(this.id) ?? null;
	}

	/*
	 * Private methods
	 */

	// Localizations

	private getMasteryCapeLocalizedName(): string {
		const index = this.name.indexOf("_tier_");
		let tier = index > 0 ? parseInt(this.name.substring(index + 6)) : 1;
		if (isNaN(tier)) tier = 1;

		let skill;
		if (this.MasteryCapeType === MasteryCapeType.Completionist) skill = "Completionist";
		else if (this.skillBoost !== null) skill = SkillUtils.getLocalizedSkillName(this.skillBoost.skill);
		else skill = "?unknown?"

		return GameData.localization().get("mastery_cape_name", [skill, tier]);
	}

	private getMasteryCapeLocalizedDescription(): string | null {
		if (this.description === null) return null;
		if (this.MasteryCapeType === MasteryCapeType.Completionist)
			return GameData.localization().get("mastery_cape_completionist_description");

		const effectDescription = this.getTriggerEffectLocalizations();

		let key;
		let skill;
		let percentage;

		if (this.MasteryCapeType === MasteryCapeType.Skilling) {
			if (this.skillBoost === null) return null;
			key = "mastery_cape_skill_description";
			skill = SkillUtils.getLocalizedSkillName(this.skillBoost.skill);
			percentage = this.skillBoost.boostPercentage;
		} else {
			if (this.MasteryCapeType !== MasteryCapeType.Combat || this.skillBoost === null) {
				return effectDescription;
			}

			if (this.skillBoost.boostPercentage <= 0.0) {
				return effectDescription;
			}

			if (this.skillBoost.skill === Skill.Rigour) {
				const percentage = this.skillBoost.boostPercentage;
				return GameData.localization().get("mastery_cape_attack_description", [percentage]);
			}

			if (this.skillBoost.skill === Skill.Defence) {
				const percentage = this.skillBoost.boostPercentage;
				return GameData.localization().get("mastery_cape_defence_description", [percentage]);
			}

			key = "mastery_cape_combat_description";
			skill = SkillUtils.getLocalizedSkillName(this.skillBoost.skill);
			percentage = this.skillBoost.boostPercentage;
		}

		const result = GameData.localization().get(key, [skill, percentage]);
		return effectDescription + result;
	}

	private getTriggerEffectLocalizations(): string {
		let result = "";
		for (const effect of this.triggerEffects ?? [])
			result = result + "\n" + this.getTriggerEffectLocalized(effect);
		return result;
	}

	private getTriggerEffectLocalized(effect: ItemTriggerEffect): string {
		if (effect.triggerType === ItemEffectTriggerType.Lifesteal) {
			const percentage = effect.triggerChancePercentage;
			const power = effect.triggerPower;
			return GameData.localization().get("lifesteal_description", [percentage, power]);
		}

		if (effect.triggerType !== ItemEffectTriggerType.DoubleLoot) {
			return `Trigger effect ${effect.triggerType} localization not defined`;
		}

		if (!this.description) return "";
		return GameData.localization().get(this.description);
	}

	private getPotionDescription(game?: GameContextType): string {
		const potion = PotionDatabase.getPotion(this.potionType);
		if (potion === undefined) return "";

		const key = this.description ?? "";
		const seconds = Math.trunc(this.potionEffectDurationSeconds / 60);

		switch (potion.potionType) {
			case PotionType.Swiftness:
			case PotionType.Negotiation:
			case PotionType.Resurrection:
			case PotionType.GreatSight:
			case PotionType.PurePower:
			case PotionType.AncientKnowledge:
			case PotionType.DragonfirePotion:
				return LocalizationDatabase.get(key, [potion.effectStrengthPercentage, seconds]);
			case PotionType.Forgery:
			case PotionType.Trickery:
				return LocalizationDatabase.get(key, [potion.chanceOfTriggeringEffect, seconds]);
			case PotionType.DarkMagic:
				return LocalizationDatabase.get(key, [potion.chanceOfTriggeringEffect, potion.effectStrengthPercentage, seconds]);
			default:
				return key;
		}
	}
}