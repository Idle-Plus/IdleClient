import { Int, PotionType } from "@idleclient/network/NetworkData.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";

export class PotionData {

	private readonly PotionId: Int = 0;
	private readonly PotionType: PotionType = PotionType.None;
	private readonly ChanceOfTriggeringEffect: Int = 0;
	private readonly EffectStrengthPercentage: Int = 0;
	private readonly Duration: Int = 0;

	constructor(entry: any) {
		Object.assign(this, entry);
	}

	get potionType(): PotionType { return this.PotionType; }
	get effectStrengthPercentage(): number { return this.EffectStrengthPercentage; }

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
}