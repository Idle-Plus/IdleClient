import { Int, Skill } from "@idleclient/network/NetworkData.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";

export class ClanHouse {

	private readonly Name: string = "null";
	private readonly Description: string | null = null;

	private readonly ClanCreditCost: Int = 0;
	private readonly Costs: { Item?: Int, Amount?: Int }[] = [];
	private readonly SkillRequirements: { Skill: Skill, Level?: Int }[] = [];

	private readonly GlobalSkillingBoost: Int = 0;
	private readonly InventorySpace: Int = 0;

	// -

	public readonly houseId: Int;

	public readonly costCredits: Int = 0;
	public readonly costItems: { item: Int, amount: Int }[] = [];
	public readonly skillRequirements: { skill: Skill, level: Int }[] = [];

	constructor(entry: any, id: Int) {
		Object.assign(this, entry);
		this.houseId = id;

		this.costCredits = this.ClanCreditCost;
		this.costItems = this.Costs.map(value => ({ item: value.Item ?? 0, amount: value.Amount ?? 0 }));
		this.skillRequirements = this.SkillRequirements.map(value => ({ skill: value.Skill, level: value.Level ?? 0 }));
	}

	get name(): string { return this.Name; }
	get description(): string | null { return this.Description; }

	get globalSkillingBoost(): Int { return this.GlobalSkillingBoost; }
	get inventorySpace(): Int { return this.InventorySpace; }
}

export class ClanHouseDatabase {

	public readonly houses: ReadonlyArray<ClanHouse>;

	constructor(houseData: any) {
		const startTime = Date.now();

		const result = [];
		const items = houseData.Items as any[];
		let index = 0;

		for (const entry of items) {
			const house = new ClanHouse(entry, index);
			result.push(house);
			index++;
		}

		this.houses = result;

		const timeTaken = Date.now() - startTime;
		console.log(`ClanHouseDatabase: Initialized ${this.houses.length} houses in ${timeTaken}ms.`);
	}

	public static getHouses(): ReadonlyArray<ClanHouse> {
		return GameData.houses().houses;
	}

	public static getHouse(id: Int): ClanHouse | undefined {
		return GameData.houses().houses[id];
	}
}