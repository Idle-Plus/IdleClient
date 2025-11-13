import { ManagerContext, ManagerType } from "@context/GameContext.tsx";
import { LoginDataMessage, PotionType } from "@idleclient/network/NetworkData.ts";
import useSmartRef from "@hooks/smartref/useSmartRef.ts";

export interface PotionManagerType extends ManagerType {
	isPotionActive: (type: PotionType) => boolean;

	/**
	 * Initialize the potion manager.
	 */
	initialize: (data: LoginDataMessage) => void,
	/**
	 * Cleans up the potion manager, should always be called when the player
	 * disconnects from the game server.
	 */
	cleanup: () => void,
}

export const PotionManager = (managers: ManagerContext): PotionManagerType => {
	const _activePotions = useSmartRef(new Map<PotionType, number>);

	/*
	 * Functions
	 */

	const isPotionActive = (type: PotionType) => {
		const content = _activePotions.content();
		const potion = content.get(type);
		if (potion === undefined) return false;
		return potion > 0;
	}

	/*
	 * Initialization
	 */

	const initialize = (data: LoginDataMessage) => {
		const potions = data.ActivePotionEffects === undefined || data.ActivePotionEffects === null ?
			{} : data.ActivePotionEffects;
		const potionsMap = new Map<PotionType, number>(Object.keys(potions)
			.map(key => {
				const potion = PotionType[key as keyof typeof PotionType] ?? PotionType.None;
				const duration = potions[key] ?? -1;
				return [potion, duration];
			}));

		_activePotions.setContent(potionsMap);
	}

	const cleanup = () => {
		_activePotions.setContent(new Map());
	}

	return {
		$managerName: "potionManager",

		isPotionActive: isPotionActive,

		initialize: initialize,
		cleanup: cleanup
	}
}