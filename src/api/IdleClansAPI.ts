import { ClanCategory, GameMode, Skill, UpgradeType } from "@idleclient/network/NetworkData.ts";
import { ClanRank } from "@idleclient/types/clan/ClanRank.ts";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";

const URL = "https://query.idleclans.com/api";

const CLAN_RECRUITMENT = URL + "/Clan/recruitment/"
const CLAN_MOST_ACTIVE = URL + "/Clan/most-active";

const CHAT_RECENT = URL + "/Chat/recent";

const PLAYER_MARKET_ALL_ITEM_PRICES_CURRENT = URL + "/PlayerMarket/items/prices/latest?includeAveragePrice=true";

// Types

export interface ChatRecentResult {
	General: ChatMessage[];
	Trade: ChatMessage[];
	Help: ChatMessage[];
	ClanHub: ChatMessage[];
	CombatLFG: ChatMessage[];
	RaidLFG: ChatMessage[];
}

interface ChatMessage {
	Message: string;
	Sender: string;
	Premium: boolean;
	Gilded: boolean;
	GameMode: number;
	IsModerator: boolean;
}

/*
 * Clan types
 */

type ClanLanguage = "Lithuanian" | "Scottish Gaelic" | "Romanian" | "Slovenian" | "Czech" | "Turkish" | "Swahili" |
	"Icelandic" | "Tamil" | "Hungarian" | "Luxembourgish" | "Russian" | "Spanish" | "Italian" | "Japanese" | "Bengali" |
	"Montenegrin" | "Georgian" | "Maltese" | "Slovak" | "Catalan" | "Bosnian" | "Finnish" | "Swedish" | "German" |
	"Croatian" | "Indonesian" | "Dutch" | "Chinese" | "Galician" | "Polish" | "Welsh" | "Hindi" | "Arabic" | "Thai" |
	"Belarusian" | "Estonian" | "Ukrainian" | "Vietnamese" | "Basque" | "Malay" | "Macedonian" | "Danish" | "English" |
	"Irish" | "Bulgarian" | "Moldovan" | "Korean" | "Portuguese" | "Norwegian" | "Persian" | "Albanian" | "Greek" |
	"French" | "Serbian" | "Latvian";

export type ClanRecruitmentResult =
	| { error: undefined; result: {
		name: string;
		tag: string;
		members: { name: string, rank: ClanRank }[];
		activityScore: number;

		recruiting: boolean;
		recruitmentMessage: string;
		totalLevelRequirement: number;
		language: ClanLanguage;
		category: ClanCategory;
		houseId: number;

		skills: Record<Skill, number>;
		upgrades: UpgradeType[];
	} }
	| { error: "not_found" | "rate_limit"; result: undefined; };

export interface ActiveClan {
	name: string;
	activityScore: number;
	minimumTotalLevel: number;
	memberCount: number;
	isRecruiting: boolean;
	language: string;
	category: ClanCategory;
	gameMode: GameMode;
}

export type ActiveClansResult =
	| { error: undefined; clans: ActiveClan[]; }
	| { error: "not_found" | "rate_limit"; clans: undefined; };


/*
 * Player Market types
 */

type AllItemPriceEntry = { itemId: number, dailyAveragePrice: number, lowestSellPrice: number,
	lowestPriceVolume: number, highestBuyPrice: number, highestPriceVolume: number };
export type AllItemPricesResult =
	| { error: undefined; items: AllItemPriceEntry[] }
	| { error: "rate_limit"; items: undefined; };

// Implementation

const chat_getRecent = async (): Promise<ChatRecentResult> => {
	return new Promise((resolve, reject) => {
		fetch(CHAT_RECENT, {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		}).then((response) => {
			if (!response.ok) {
				console.error("Failed to fetch recent chat messages: ", response);
				reject("Failed to fetch recent chat messages");
				return;
			}

			response.json().then((data) => {
				resolve(data);
			});
		});
	});
}

/*
 * Clan
 */

const clan_getRecruitment = async (name: string): Promise<ClanRecruitmentResult> => {
	const url = CLAN_RECRUITMENT + encodeURIComponent(name);

	try {
		const response = await fetch(url, { method: "GET" });

		// Not found
		if (response.status === 404)
			return { error: "not_found", result: undefined };
		// Rate limit
		if (response.status === 429)
			return { error: "rate_limit", result: undefined };

		if (!response.ok) {
			console.error("Failed to fetch clan recruitment: ", response);
			throw new Error("Failed to fetch clan recruitment");
		}

		const data = await response.json();
		console.log(data);

		return {
			error: undefined,
			result: {
				name: data.clanName,
				tag: data.tag,
				members: (data.memberlist as any[]).map(value => ({ name: value.memberName, rank: value.rank })),
				activityScore: data.activityScore,

				recruiting: data.isRecruiting,
				recruitmentMessage: data.recruitmentMessage,
				totalLevelRequirement: data.minimumTotalLevelRequired,
				language: data.language,
				category: parseInt(data.category as string),
				houseId: data.houseId,

				skills: Object.fromEntries(
					Object.entries(JSON.parse(data.serializedSkills) as Record<string, number>)
						.map(value => [Skill[value[0] as keyof typeof Skill] ?? Skill.None, value[1]])
				) as Record<Skill, number>,
				upgrades: data.serializedUpgrades.length <= 0 ? [] : JSON.parse(data.serializedUpgrades) as UpgradeType[],
			}
		};
	} catch (error) {
		console.error("Error while fetching clan recruitment:", error);
		throw error;
	}
}

const clan_getMostActive = async (options?: {
	minActivityScore?: number,
	totalLevelRange?: [number, number],
	language?: ClanLanguage,
	recruiting?: boolean,
	category?: ClanCategory,
	gameMode?: GameMode,
}): Promise<ActiveClansResult> => {
	let url = CLAN_MOST_ACTIVE;
	if (options) {
		const params: any = {};
		if (options.minActivityScore !== undefined) params["MinimumActivityScore"] = options.minActivityScore;
		if (options.totalLevelRange !== undefined) {
			params["MinimumTotalLevel"] = options.totalLevelRange[0];
			params["MaximumTotalLevel"] = options.totalLevelRange[1];
		}
		if (options.language !== undefined) params["Language"] = options.language;
		if (options.recruiting !== undefined) params["IsRecruiting"] = options.recruiting;
		if (options.category !== undefined && options.category > 0) params["Category"] = options.category;
		if (options.gameMode !== undefined && options.gameMode > 0) params["GameMode"] = options.gameMode;
		url += "?clanQueryInfoJson=" + JSON.stringify(params);
	}

	try {
		const response = await fetch(encodeURI(url), { method: "GET" });

		// Not found
		if (response.status === 404)
			return { error: "not_found", clans: undefined };
		// Rate limit
		if (response.status === 429)
			return { error: "rate_limit", clans: undefined };

		// Other errors
		if (!response.ok) {
			console.error("Failed to fetch most active clans: ", response);
			throw new Error("Failed to fetch most active clans");
		}

		const data = await response.json();
		return {
			error: undefined,
			clans: (data as any[]).map((entry: any) => ({
				...entry,
				category: parseInt(entry.category as string)
			}))
		};
	} catch (error) {
		console.error("Error while fetching most active clans:", error);
		throw error;
	}
}

/*
 * Player Market
 */

const playerMarket_getItemPrices = async (): Promise<AllItemPricesResult> => {
	try {
		const response = await fetch(PLAYER_MARKET_ALL_ITEM_PRICES_CURRENT, { method: "GET" });

		// Rate limit
		if (response.status === 429)
			return { error: "rate_limit", items: undefined };

		if (!response.ok) {
			console.error("Failed to fetch item prices: ", response);
			throw new Error("Failed to fetch item prices");
		}

		const data = await response.json();
		return {
			error: undefined,
			items: data
		}
	} catch (error) {
		console.error("Error while fetching item prices:", error);
		throw error;
	}
}

/*
 * Export
 */

export const IdleClansAPI = {
	Clan: {
		getRecruitment: clan_getRecruitment,
		getMostActive: clan_getMostActive,
	},
	PlayerMarket: {
		getItemPrices: playerMarket_getItemPrices,
	},
	Chat: {
		getRecent: chat_getRecent,
	}
}