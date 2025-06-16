import RawGameData from "@idleclient/data/gameData.json?raw";
import IconSheetData from "@idleclient/data/sheets/icon_atlas.json";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { SpriteSheet } from "@idleclient/game/sprite/SpriteSheet.ts";
import { LocalizationDatabase } from "@idleclient/game/data/LocalizationDatabase.ts";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";
import { TaskDatabase } from "@idleclient/game/data/TaskDatabase.ts";
import { UpgradeDatabase } from "@idleclient/game/data/UpgradeDatabase.ts";
import { PotionDatabase } from "@idleclient/game/data/PotionDatabase.ts";

const DATA_ID_REGEX = /"_id"\s*:\s*ObjectId\("([a-f0-9]+)"\)/g;
function getGameData(): GameDataType {
	const replaced = RawGameData.replace(DATA_ID_REGEX, (_, id) => {
		return `"_id": "ObjectId(${id})"`;
	});

	return JSON.parse(replaced);
}

interface GameDataType {
	Upgrades: any,
	ShopItems: any,
	RaidsLevelInfos: any,
	ClanBossInfos: any,
	PotionData: any,
	ClanUpgrades: any,
	ExterminatingInfo: any,
	Houses: any,
	Items: any,
	SharedSettings: any,
	HolidayEventInfoDocument: any,
	ClientSettings: any,
	Quests: any,
	Tasks: any
}

export class GameData {

	private static INITIALIZED = false;
	public static FAILED_TO_INITIALIZE = false;

	private static ITEM_DATA: ItemDatabase | null = null;
	private static TASK_DATA: TaskDatabase | null = null;
	private static UPGRADE_DATA: UpgradeDatabase | null = null;
	private static POTION_DATA: PotionDatabase | null = null;
	private static SETTINGS_DATA: SettingsDatabase | null = null;
	private static LOCALIZATION_DATA: LocalizationDatabase | null = null;

	private static ICON_SHEET: SpriteSheet | null = null;

	public static initialize() {
		if (GameData.INITIALIZED) return;
		GameData.INITIALIZED = true;
		GameData.FAILED_TO_INITIALIZE = true;

		// Data
		const data = getGameData();
		GameData.ITEM_DATA = new ItemDatabase(data.Items);
		GameData.TASK_DATA = new TaskDatabase(data.Tasks);
		GameData.UPGRADE_DATA = new UpgradeDatabase(data.Upgrades, data.ClanUpgrades);
		GameData.POTION_DATA = new PotionDatabase(data.PotionData);
		GameData.SETTINGS_DATA = new SettingsDatabase(data.SharedSettings, data.ClientSettings);
		GameData.LOCALIZATION_DATA = new LocalizationDatabase();

		// Icons
		GameData.ICON_SHEET = new SpriteSheet([ { dataSheet: IconSheetData, path: "/atlas/icons" } ]);

		GameData.FAILED_TO_INITIALIZE = false;
	}

	public static isInitialized(): boolean {
		return GameData.INITIALIZED && !GameData.FAILED_TO_INITIALIZE;
	}

	public static items(): ItemDatabase {
		if (GameData.ITEM_DATA) return GameData.ITEM_DATA;
		throw new Error("Game data not initialized");
	}

	public static tasks(): TaskDatabase {
		if (GameData.TASK_DATA) return GameData.TASK_DATA;
		throw new Error("Game data not initialized");
	}

	public static upgrades(): UpgradeDatabase {
		if (GameData.UPGRADE_DATA) return GameData.UPGRADE_DATA;
		throw new Error("Game data not initialized");
	}

	public static potions(): PotionDatabase {
		if (GameData.POTION_DATA) return GameData.POTION_DATA;
		throw new Error("Game data not initialized");
	}

	public static settings(): SettingsDatabase {
		if (GameData.SETTINGS_DATA) return GameData.SETTINGS_DATA;
		throw new Error("Game data not initialized");
	}

	public static localization(): LocalizationDatabase {
		if (GameData.LOCALIZATION_DATA) return GameData.LOCALIZATION_DATA;
		throw new Error("Game data not initialized");
	}

	public static icons(): SpriteSheet {
		if (GameData.ICON_SHEET) return GameData.ICON_SHEET;
		throw new Error("Game data not initialized");
	}
}