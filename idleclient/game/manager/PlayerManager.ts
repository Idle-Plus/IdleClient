import { ManagerContext, ManagerType } from "@context/GameContext.tsx";
import { GameMode, Int, LoginDataMessage, Skill, UpgradeType } from "@idleclient/network/NetworkData.ts";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { ItemId } from "@idleclient/types/gameTypes.ts";
import { UpgradeDatabase } from "@idleclient/game/data/UpgradeDatabase.ts";

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

	premium: SmartRef<boolean>;
	gilded: SmartRef<boolean>;

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

export const PlayerManager = (managers: ManagerContext): PlayerManagerType => {

	const username = useSmartRef<string>("");
	const mode = useSmartRef<GameMode>(GameMode.NotSelected);
	const adBoost = useSmartRef<AdBoost>({ expires: null, seconds: -1, paused: true });

	const _premiumRef = useSmartRef<boolean>(false);
	const _gildedRef = useSmartRef<boolean>(false);

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

		const upgrade = UpgradeDatabase.getUpgrade(type);
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

				// Quick test to make sure the skill is of type string.
				if (typeof (value as string[])[0] !== "string")
					throw Error("Invalid enchantment data, skill isn't a string.");
				const skills: Skill[] = (value as string[]).map(skillString => Skill[skillString as keyof typeof Skill]);

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

		_premiumRef.setContent(data.PremiumEndDate !== null);
		_gildedRef.setContent(data.IsPremiumPlus);
	}

	const cleanup = () => {
		username.setContent("");
		mode.setContent(GameMode.NotSelected);
		upgrades.setContent(new Map());
		enchantments.setContent(new Map());

		_premiumRef.setContent(false);
		_gildedRef.setContent(false);
	}

	return {
		$managerName: "playerManager",

		username: username,
		mode: mode,
		adBoost: adBoost,

		premium: _premiumRef,
		gilded: _gildedRef,

		upgrades: upgrades,
		enchantments: enchantments,

		isAdBoostActive: isAdBoostActive,

		isUpgradeUnlocked: isUpgradeUnlocked,
		getUpgradeBenefits: getUpgradeBenefits,

		initialize: initialize,
		cleanup: cleanup
	}
}