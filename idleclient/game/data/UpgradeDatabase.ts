import { Int, Skill, UpgradeType } from "@idleclient/network/NetworkData.ts";

export class Upgrade {

	private readonly Type: UpgradeType = 0;
	private readonly Tiers: Int = 0;
	private readonly CanPurchaseInBulk: boolean = false;
	private readonly TierNameLocKeys?: string[];
	private readonly TierDescriptionLocKeys?: string[];
	private readonly TierUnlocks?: Int[];
	private readonly Costs?: Int[];
	private readonly ItemIdWithCost?: { Item?: Int, Amount?: Int }; // fields marked as optional because omitted default values.
	private readonly SkillRequirements?: { Skill?: Skill, Requirements: Int[] }; // fields marked as optional because omitted default values.
	private readonly CustomRequirementLocKey?: string;
	private readonly ClanCreditCost: Int = 0;
	private readonly DisabledForIronmen: boolean = false;

	constructor(entry: any) {
		Object.assign(this, entry);
	}

	get type(): UpgradeType { return this.Type; }

	get tierUnlocks(): number[] { return this.TierUnlocks ?? []; }
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
			const upgrade = new Upgrade(entry);
			clanUpgrades.push(upgrade);
			upgrades.set(upgrade.type, upgrade);
		}

		this.upgrades = upgrades;
		this.playerUpgrades = playerUpgrades;
		this.clanUpgrades = clanUpgrades;

		const time = Date.now() - startTime;
		console.log(`UpgradeDatabase: Initialized ${upgrades.size} upgrades in ${time}ms.`);
	}

	public getUpgrade(type: UpgradeType): Upgrade | undefined {
		return this.upgrades.get(type);
	}
}