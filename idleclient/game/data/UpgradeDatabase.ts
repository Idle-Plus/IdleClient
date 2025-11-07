import { Int, Skill, UpgradeType } from "@idleclient/network/NetworkData.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { LocalizationDatabase } from "@idleclient/game/data/LocalizationDatabase.ts";
import { UpgradeTypes } from "@idleclient/game/utils/gameEnumsUtils.ts";

export class Upgrade {

	public readonly isClanUpgrade: boolean = false;

	private readonly Type: UpgradeType = 0;
	private readonly Tiers: Int = 0;
	private readonly CanPurchaseInBulk: boolean = false;
	private readonly TierNameLocKeys?: string[];
	private readonly TierDescriptionLocKeys?: string[];
	private readonly TierUnlocks?: Int[];
	private readonly Costs?: Int[];
	private readonly ItemCosts?: { Item?: Int, Amount?: Int }[]; // fields marked as optional because omitted default values.
	private readonly ItemIdWithCost?: { Item?: Int, Amount?: Int }[]; // fields marked as optional because omitted default values.
	private readonly SkillRequirements?: { Skill?: Skill, Requirements: Int[] }[]; // fields marked as optional because omitted default values.
	private readonly CustomRequirementLocKey?: string;
	private readonly ClanCreditCost: Int = 0;
	private readonly DisabledForIronmen: boolean = false;
	private readonly Discontinued: boolean = false;

	constructor(entry: any, isClanUpgrade: boolean = false) {
		Object.assign(this, entry);
		this.isClanUpgrade = isClanUpgrade;
	}

	get type(): UpgradeType { return this.Type; }

	get tierUnlocks(): Int[] { return this.TierUnlocks ?? []; }
	get costs(): Int[] | undefined { return this.Costs; }
	get itemCosts(): { Item?: Int, Amount?: Int }[] | undefined { return this.ItemCosts; }
	get itemIdWithCost(): { Item?: Int, Amount?: Int }[] | undefined { return this.ItemIdWithCost; }
	get skillRequirements(): { Skill?: Skill, Requirements: Int[] }[] | undefined { return this.SkillRequirements; }
	get customRequirementLocKey(): string | undefined { return this.CustomRequirementLocKey; }
	get clanCreditCost(): Int { return this.ClanCreditCost; }

	get tierNameLocalizationKeys(): string[] { return this.TierNameLocKeys ?? []; }
	get tierDescriptionLocalizationKeys(): string[] { return this.TierDescriptionLocKeys ?? []; }

	get disabledForIronman(): boolean { return this.DisabledForIronmen; }
	get discontinued(): boolean { return this.Discontinued; }

	public getLocalizedName(tier?: Int): string {
		const names = this.tierNameLocalizationKeys;

		if (tier !== undefined) {
			if (tier < 0 || tier >= names.length)
				return `unknown tier for name ${UpgradeTypes.name(this.type)} ${tier}`;

			return LocalizationDatabase.get(names[tier]);
		}

		if (names.length > 0) {
			return LocalizationDatabase.get(names[0]);
		}

		return LocalizationDatabase.get(UpgradeTypes.name(this.type));
	}

	public getLocalizedDescription(tier?: Int): string {
		const descriptions = this.tierDescriptionLocalizationKeys;
		const decorations = this.getDecorateDescription(tier ?? 0);

		if (tier !== undefined) {
			if (tier < 0 || tier >= descriptions.length)
				return `unknown tier for description ${UpgradeTypes.name(this.type)} ${tier}`;

			return LocalizationDatabase.get(descriptions[tier], decorations);
		}

		// Special cases.
		switch (this.type) {
			case UpgradeType.upgrade_bounty_hunter:
				return LocalizationDatabase.get("bounty_hunter_description", decorations);
			case UpgradeType.upgrade_boss_slayer:
				return LocalizationDatabase.get("boss_slayer_description", decorations);
		}

		// Check if we have a default description.
		if (descriptions.length > 0) {
			return LocalizationDatabase.get(descriptions[0], decorations);
		}

		// Okay, time to guess.
		const upgradeType = UpgradeTypes.name(this.type);
		let description = LocalizationDatabase.get(`${upgradeType}_desc`, decorations);
		if (description !== `${upgradeType}_desc`) return description;
		description = LocalizationDatabase.get(`${upgradeType}_description`, decorations);
		if (description !== `${upgradeType}_description`) return description;

		return "unknown description for " + upgradeType;
	}

	public getSpriteIconId(tier: number = 0): string {
		if (this.type === UpgradeType.upgrade_housing)
			return `upgrade/${this.tierNameLocalizationKeys[tier]}`;
		return `upgrade/${UpgradeTypes.name(this.type)}`;
	}

	private getDecorateDescription(tier: number = 0): any[] | undefined {
		if (this.tierUnlocks.length > 0) {
			return [this.tierUnlocks[tier]];
		}

		return undefined;
	}
}

export class UpgradeDatabase {

	private readonly upgrades: Map<UpgradeType, Upgrade>;
	private readonly playerUpgrades: Upgrade[];
	private readonly clanUpgrades: Upgrade[];

	constructor(playerUpgradesData: any, clanUpgradesData: any) {
		const startTime = Date.now();

		const upgrades = new Map<UpgradeType, Upgrade>();
		const playerUpgrades: Upgrade[] = [];
		const clanUpgrades: Upgrade[] = [];

		const playerEntries = playerUpgradesData.Items;
		for (let i = 0; i < playerEntries.length; i++) {
			const entry = playerEntries[i];
			const upgrade = new Upgrade(entry);
			playerUpgrades.push(upgrade);
			upgrades.set(upgrade.type, upgrade);
		}

		const clanEntries = clanUpgradesData.Items;
		for (let i = 0; i < clanEntries.length; i++) {
			const entry = clanEntries[i];
			const upgrade = new Upgrade(entry, true);
			clanUpgrades.push(upgrade);
			upgrades.set(upgrade.type, upgrade);
		}

		this.upgrades = upgrades;
		this.playerUpgrades = playerUpgrades;
		this.clanUpgrades = clanUpgrades;

		const time = Date.now() - startTime;
		console.log(`UpgradeDatabase: Initialized ${upgrades.size} upgrades in ${time}ms.`);
	}

	public static getUpgrade(type: UpgradeType): Upgrade | undefined {
		return GameData.upgrades().upgrades.get(type);
	}

	public static playerUpgrades(): ReadonlyArray<Upgrade> {
		return GameData.upgrades().playerUpgrades;
	}

	public static clanUpgrades(): ReadonlyArray<Upgrade> {
		return GameData.upgrades().clanUpgrades;
	}
}