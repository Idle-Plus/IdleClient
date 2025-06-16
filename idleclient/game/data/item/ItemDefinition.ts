import {
	AttackStyle,
	EquipmentSlot,
	Float,
	Int,
	ItemActivatableType,
	ItemEffectTriggerType,
	MasteryCapeType,
	PotionType,
	Skill,
	WeaponClassType,
	WeaponEffectType,
    WeaponType
} from "@idleclient/network/NetworkData.ts";
import { SheetIcon, SpriteSheet } from "@idleclient/game/sprite/SpriteSheet.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import { ItemId } from "@idleclient/types/gameTypes";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";

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
	triggerType: ItemEffectTriggerType,
	triggerChancePercentage: Int,
	triggerPower: Float,
}

export class ItemDefinition {

	// Everything is private as I don't want to expose the names
	// used inside the gameData.json, it might be changed or
	// removed. So, just to be on the safe side, getters should be
	// provided instead.

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

	private readonly MonsterDefensiveBoost: object = {}; // TODO
	private readonly Style: AttackStyle = AttackStyle.None;
	private readonly WeaponType: WeaponType = WeaponType.None;
	private readonly WeaponClass: WeaponClassType = WeaponClassType.None;
	//
	private readonly ActivatableType: ItemActivatableType = ItemActivatableType.None;
	private readonly PotionType: PotionType = PotionType.None;
	private readonly PotionEffectDurationSeconds: Int = 0;
	private readonly HealthAppliedOnConsume: Int = 0;
	private readonly SkillBoost?: any; // SkillBoost object
	private readonly TriggerEffects?: any[]; // TriggerEffect object
	private readonly InventoryConsumableBoost?: any; // SkillBoost object
	private readonly LevelRequirement?: any; // LevelRequirement object

	private readonly CosmeticScrollEffect: WeaponEffectType = WeaponEffectType.None;

	private readonly EnchantedVersionItemId: Int = 0;
	private readonly EnchantmentBoost: Float = 0;

	private readonly ProcChance: Int = 0;

	/*
	 * Custom properties
	 */

	public readonly meleeBonus: ItemStatBonus | null;
	public readonly archeryBonus: ItemStatBonus | null;
	public readonly magicBonus: ItemStatBonus | null;

	public readonly skillBoost: ItemSkillBoost | null;
	public readonly triggerEffects: ItemTriggerEffect[] | null;
	public readonly inventoryConsumableBoost: ItemSkillBoost | null;
	public readonly levelRequirement: ItemLevelRequirement | null;

	public readonly originalItemId: ItemId | null;
	public readonly cosmeticVariant: WeaponEffectType;

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

	public getLocalizedName(): string {
		if (this.isCosmeticVariant()) {
			const baseName = ItemDatabase.get(this.getOriginalItemId()).getLocalizedName();
			return `${baseName} (${WeaponEffectType[this.cosmeticVariant]})`
		}

		// Handle mastery capes.
		if (this.MasteryCapeType !== MasteryCapeType.None) {
			return this.getMasteryCapeLocalizedName();
		}

		return GameData.localization().get(this.name);
	}

	public getLocalizedDescription(): string | null {
		// Handle mastery capes.
		if (this.MasteryCapeType !== MasteryCapeType.None) {
			return this.getMasteryCapeLocalizedDescription();
		}

		return this.description != null ? GameData.localization().get(this.description) : null;
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

	/*
	 * Private methods
	 */

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
}