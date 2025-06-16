import { ManagerStorage, ManagerType } from "@context/GameContext.tsx";
import { GameMode, Int, LoginDataMessage, Skill, UpgradeType } from "@idleclient/network/NetworkData.ts";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { ItemId } from "@idleclient/types/gameTypes.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";

interface AdBoost {
	/**
	 * The time the boost will expire, or null if the boost is paused.
	 */
	expires: Date | null;
	/**
	 * The number of seconds left of the boost. The value is only updated when
	 * the boost is paused.
	 *
	 * Will be 0 if the boost has expired.
	 */
	seconds: number;
	/**
	 * If the boost is currently paused or not.
	 */
	paused: boolean;
}

export interface PlayerManagerType extends ManagerType {
	username: SmartRef<string>;
	mode: SmartRef<GameMode>;
	adBoost: SmartRef<AdBoost>;

	upgrades: SmartRef<Map<UpgradeType, Int>>;
	enchantments: SmartRef<Map<ItemId, Skill[]>>;

	/**
	 * If the ad boost is currently active or not.
	 */
	isAdBoostActive: () => boolean;

	isUpgradeUnlocked: (upgrade: UpgradeType) => boolean;
	getUpgradeBenefits: (upgrade: UpgradeType) => Int;

	initialize: (data: LoginDataMessage) => void;
	cleanup: () => void;
}

export const PlayerManager = (managers: ManagerStorage): PlayerManagerType => {

	const username = useSmartRef<string>("");
	const mode = useSmartRef<GameMode>(GameMode.NotSelected);
	const adBoost = useSmartRef<AdBoost>({ expires: null, seconds: -1, paused: true });

	const upgrades = useSmartRef<Map<UpgradeType, Int>>(new Map());
	const enchantments = useSmartRef<Map<ItemId, Skill[]>>(new Map());

	const isAdBoostActive = () => {
		const boost = adBoost.content();
		if (boost.paused) return false;
		if (boost.expires === null) return false;
		return boost.expires.getTime() > Date.now();
	}

	const isUpgradeUnlocked = (type: UpgradeType) => {
		return upgrades.content().has(type);
	}

	const getUpgradeBenefits = (type: UpgradeType) => {
		const currentTier = upgrades.content().get(type);
		if (currentTier === undefined) return 0;

		const upgrade = GameData.upgrades().getUpgrade(type);
		if (!upgrade) throw new Error("Upgrade not found");
		const unlocks = upgrade.tierUnlocks;

		if (currentTier < 0)
			throw new Error("Upgrade tier is below 0.");
		if (currentTier >= unlocks.length)
			throw new Error("Upgrade tier is above unlocks length.");

		return unlocks[currentTier];
	}

	const initialize = (data: LoginDataMessage) => {
		username.setContent(data.Username ?? "");
		mode.setContent(data.GameMode ?? GameMode.NotSelected)

		upgrades.setContent(() => {
			const map = new Map<UpgradeType, Int>();
			for (const [key, value] of Object.entries(data.Upgrades ?? {})) {
				const upgradeType = UpgradeType[key as keyof typeof UpgradeType];

				console.log(`Me has ${key}`);

				if (upgradeType != undefined) map.set(upgradeType, value as Int);
			}
			return map;
		});

		enchantments.setContent(() => {
			const map = new Map<ItemId, Skill[]>();
			if (!data.SerializedItemEnchantments) return map;
			for (const [key, value] of Object.entries(JSON.parse(data.SerializedItemEnchantments))) {
				const itemId = parseInt(key);
				const skills = value as Skill[];
				map.set(itemId, skills);
			}
			return map;
		});

		const adBoostSeconds = data.AdBoostedSeconds;
		const adBoostPaused = data.AdBoostPaused;
		const adBoostExpires = adBoostSeconds > 0 && !adBoostPaused ?
			new Date(Date.now() + adBoostSeconds * 1000) : null;
		adBoost.setContent(() => ({
			expires: adBoostExpires,
			seconds: adBoostSeconds,
			paused: adBoostPaused
		}));
	}

	const cleanup = () => {
		username.setContent("");
		mode.setContent(GameMode.NotSelected);
		upgrades.setContent(new Map());
		enchantments.setContent(new Map());
	}

	return {
		$managerName: "playerManager",

		username: username,
		mode: mode,
		adBoost: adBoost,

		upgrades: upgrades,
		enchantments: enchantments,

		isAdBoostActive: isAdBoostActive,

		isUpgradeUnlocked: isUpgradeUnlocked,
		getUpgradeBenefits: getUpgradeBenefits,

		initialize: initialize,
		cleanup: cleanup
	}
}