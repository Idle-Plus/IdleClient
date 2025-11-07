import Papa from 'papaparse';
import VanillaLocalization from "@idleclient/data/vanillaLocalization.csv?raw";
import { GameData } from "@idleclient/game/data/GameData.ts";

export class LocalizationDatabase {

	private readonly vanillaLocalization: Map<string, string> = new Map();

	constructor() {
		// noinspection JSVoidFunctionReturnValueUsed
		const data = Papa.parse<{
			"": string; // key
			English: string;
		}>(VanillaLocalization, {
			header: true,
			skipEmptyLines: false,
			worker: false,
			download: false,
		});

		data.data.forEach(row => {
			this.vanillaLocalization.set(row[""], row["English"]);
		})
	}

	public static get(key: string, args?: any[]): string {
		return GameData.localization().get(key, args);
	}

	get(key: string, args?: any[]): string {
		let value = this.vanillaLocalization.get(key) || key;
		if (!args) return value;

		for (let i = 0; i < args.length; i++) {
			value = value.replace(`{${i}}`, args[i]);
		}

		return value;
	}
}