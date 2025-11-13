import { Int, PotionType } from "@idleclient/network/NetworkData.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";

export class PotionData {

	private readonly PotionId: Int = 0;
	private readonly PotionType: PotionType = PotionType.None;
	private readonly ChanceOfTriggeringEffect: Int = 0;
	private readonly EffectStrengthPercentage: Int = 0;
	private readonly Duration: Int = 0;

	constructor(entry: any) {
		Object.assign(this, entry);
	}

	get potionId(): Int { return this.PotionId; }
	get potionType(): PotionType { return this.PotionType; }
	get chanceOfTriggeringEffect(): Int { return this.ChanceOfTriggeringEffect; }
	get effectStrengthPercentage(): Int { return this.EffectStrengthPercentage; }
	get duration(): Int { return this.Duration; }

}

export class PotionDatabase {

	public readonly potions: Map<PotionType, PotionData> = new Map();

	constructor(potionData: any) {
		const startTime = Date.now();

		const items = potionData.Items;
		for (const entry of items) {
			const potion = new PotionData(entry);
			this.potions.set(potion.potionType, potion);
		}

		const timeTaken = Date.now() - startTime;
		console.log(`PotionDatabase: Initialized ${this.potions.size} potions in ${timeTaken}ms.`);
	}

	public static getPotion(type: PotionType): PotionData | undefined {
		return GameData.potions().potions.get(type);
	}

	public static potion(type: PotionType): PotionData | undefined {
		return GameData.potions().potions.get(type);
	}
}