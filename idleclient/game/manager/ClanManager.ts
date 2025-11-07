import { ManagerStorage, ManagerType } from "@context/GameContext.tsx";
import {
	ClanCategory,
	ClearAllGuildApplicationsMessage,
	CreateGuildMessage, GuildActionResponse,
	GuildDeletedMessage,
	GuildLeaderLeftGuildMessage,
	GuildMemberKickedMessage, GuildRequestResultMessage, GuildUpdateMinimumTotalLevelRequirementMessage,
	GuildUpdatePrimaryLanguageMessage, GuildUpdateRecruitmentMessageMessage,
	GuildUpdateRecruitmentStateMessage,
	GuildUpdateStatusMessage, GuildUpdateTagMessage,
	GuildVaultMessage,
	Int,
	LoginDataMessage,
	PacketType,
	PlayerJoinedGuildMessage,
	PlayerLeftGuildMessage,
	ReceiveGuildApplicationMessage,
	ReceiveGuildStateMessage,
	RequestClanPvmStatsMessage,
	RequestGuildStateMessage,
	RequestGuildVaultMessage, SendGuildInviteMessage,
	UpgradeType
} from "@idleclient/network/NetworkData.ts";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { Clan } from "@idleclient/types/clan/Clan.ts";
import usePacket from "@hooks/network/usePacket.ts";
import { useConsole } from "@context/ConsoleContext.tsx";
import { Network } from "@idleclient/network/Network.ts";
import { UpgradeDatabase } from "@idleclient/game/data/UpgradeDatabase.ts";
import { useLoading } from "@context/LoadingContext.tsx";
import { useModal } from "@context/ModalContext.tsx";
import { ModalUtils } from "@utils/ModalUtils.tsx";
import { useToast } from "@context/ToastContext.tsx";

const CLAN_MANAGEMENT_LOADING = "clan_management_loading";
const CLAN_MANAGEMENT_LOADING_MESSAGE = "Updating clan...";

export interface ClanManagerType extends ManagerType {
	/**
	 * The clan we're currently in, or null if we're not in a clan.
	 */
	clan: SmartRef<Clan | null>;
	hasClan: SmartRef<boolean>;

	accumulatedCredits: SmartRef<Int>;

	network: {
		/**
		 * Requests an updated clan state from the server.
		 */
		refreshClanState: () => void;
		/**
		 * Request the server to send us our clan vault contents.
		 */
		refreshClanVault: (force?: boolean) => void;
		/**
		 * Request the server to send us our pve stats.
		 */
		refreshClanPveStats: (force?: boolean) => void;

		/**
		 * Update the recruitment status of the clan.
		 */
		updateRecruitmentStatus: (recruiting: boolean) => void;
		/**
		 * Update the category of the clan.
		 */
		updateCategory: (category: ClanCategory) => void;
		/**
		 * Update the primary language of the clan.
		 */
		updateLanguage: (language: string) => void;
		/**
		 * Update the recruitment message of the clan.
		 */
		updateRecruitmentMessage: (message: string) => void;
		/**
		 * Update the total level requirement of the clan.
		 */
		updateTotalLevelRequirement: (totalLevel: Int) => void;
		/**
		 * Update the tag of the clan.
		 */
		updateTag: (tag: string | null) => void;

		/**
		 * Send a clan invite to the specified player.
		 */
		sendClanInvite: (player: string) => void;
		/**
		 * Request that all clan applications should be declined and cleared.
		 */
		clearAllApplications: () => void;
	}

	/*
	 * Helpers
	 */

	/**
	 * Returns true if the clan we're currently in has the specified upgrade.
	 * If we're not in a clan, then this will always return false.
	 */
	isUpgradeUnlocked: (upgrade: UpgradeType) => boolean;
	/**
	 * Get the benefits from the specified upgrade.
	 */
	getUpgradeBenefits: (upgrade: UpgradeType) => Int;

	/*
	 * Initialize / Cleanup
	 */

	/**
	 * Initialize the clan manager.
	 */
	initialize: (data: LoginDataMessage) => void;
	/**
	 * Cleans up the clan manager, should always be called when the player
	 * disconnects from the game server.
	 */
	cleanup: () => void;
}

export const ClanManager = (managers: ManagerStorage): ClanManagerType => {
	const debug = useConsole();
	const loading = useLoading();
	const modals = useModal();
	const toasts = useToast();

	const _clanRef = useSmartRef<Clan | null>(null);
	const _hasClanRef = useSmartRef<boolean>(false);

	const _accumulatedCreditsRef = useSmartRef<Int>(0);

	const setClanRef = (value: Clan | null) => {
		_clanRef.setContent(value);
		_hasClanRef.setContent(value !== null);
	}

	const getClanOrWarn = (error: string): Clan | null => {
		const clan = _clanRef.content();
		if (clan === null) {
			debug.warn(error);
			return null;
		}

		return clan;
	}

	/*
	 * Network
	 */

	// Basic

	const _refreshClanState = () => {
		if (_clanRef.content() === null) return;
		Network.send(new RequestGuildStateMessage());
	}

	const _refreshClanVault = (force: boolean = false) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		if (clan.vault !== null && !force) return;
		Network.send(new RequestGuildVaultMessage());
	}

	const _refreshClanPveStats = (force: boolean = false) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		if (clan.pvmStats !== null && !force) return;
		Network.send(new RequestClanPvmStatsMessage(null));
	}

	// Recruitment

	const _updateRecruitmentStatus = (recruiting: boolean) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		if (clan.recruiting === recruiting) return;

		if (loading.is(CLAN_MANAGEMENT_LOADING)) return;
		loading.set(CLAN_MANAGEMENT_LOADING, CLAN_MANAGEMENT_LOADING_MESSAGE);
		Network.send(new GuildUpdateRecruitmentStateMessage(recruiting));
	}

	const _updateCategory = (category: ClanCategory) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		if (clan.category === category) return;

		if (loading.is(CLAN_MANAGEMENT_LOADING)) return;
		loading.set(CLAN_MANAGEMENT_LOADING, CLAN_MANAGEMENT_LOADING_MESSAGE);
		Network.send(new GuildUpdateStatusMessage(category));
	}

	const _updateLanguage = (language: string) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		if (clan.language === language) return;

		if (loading.is(CLAN_MANAGEMENT_LOADING)) return;
		loading.set(CLAN_MANAGEMENT_LOADING, CLAN_MANAGEMENT_LOADING_MESSAGE);
		Network.send(new GuildUpdatePrimaryLanguageMessage(language));
	}

	const _updateRecruitmentMessage = (message: string) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		// TODO: Check if the message is the same as the current one.

		if (loading.is(CLAN_MANAGEMENT_LOADING)) return;
		loading.set(CLAN_MANAGEMENT_LOADING, CLAN_MANAGEMENT_LOADING_MESSAGE);
		Network.send(new GuildUpdateRecruitmentMessageMessage(message));
	}

	const _updateTotalLevelRequirement = (totalLevel: Int) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		if (clan.minTotalLevel === totalLevel) return;

		if (loading.is(CLAN_MANAGEMENT_LOADING)) return;
		loading.set(CLAN_MANAGEMENT_LOADING, CLAN_MANAGEMENT_LOADING_MESSAGE);
		Network.send(new GuildUpdateMinimumTotalLevelRequirementMessage(totalLevel));
	}

	const _updateTag = (tag: string | null) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		if (clan.tag === tag) return;

		Network.send(new GuildUpdateTagMessage(tag));
	}

	// Applications

	const _sendClanInvite = (player: string) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		Network.send(new SendGuildInviteMessage(player));
	}

	const _clearAllApplications = () => {
		const clan = _clanRef.content();
		if (clan === null) return;
		if (clan.applications.length === 0) return;
		Network.send(new ClearAllGuildApplicationsMessage());
	}

	/*
	 * Helpers
	 */

	const _isUpgradeUnlocked = (type: UpgradeType) => {
		const clan = _clanRef.content();
		if (clan === null) return false;
		return clan.upgrades.has(type);
	}

	const _getUpgradeBenefits = (type: UpgradeType) => {
		const clan = _clanRef.content();
		if (clan === null) return 0;
		if (!clan.upgrades.has(type)) return 0;
		const currentTier = 0; // NOTE: At the moment, it seems like clans can only have one tier.

		const upgrade = UpgradeDatabase.getUpgrade(type);
		if (!upgrade) throw new Error(`Upgrade '${type}' not found.`);
		const unlocks = upgrade.tierUnlocks;

		if (currentTier < 0)
			throw new Error(`Upgrade tier is below 0 (${currentTier})`);
		if (currentTier >= unlocks.length)
			throw new Error(`Upgrade tier is above unlocks length (${currentTier} >= ${unlocks.length})`);

		return unlocks[currentTier];
	}

	/*
	 * Packets
	 */

	// Recruitment

	// Called when our clans' recruitment status has been updated.
	usePacket<GuildUpdateRecruitmentStateMessage>(packet => {
		loading.remove(CLAN_MANAGEMENT_LOADING);
		const clan = getClanOrWarn("Received GuildUpdateRecruitmentStateMessage without being in a clan.");
		if (clan === null) return;

		clan.onGuildUpdateRecruitmentStateMessage(packet);
		_clanRef.trigger();

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.GuildUpdateRecruitmentStateMessage);

	// Called when our clan category has been updated.
	usePacket<GuildUpdateStatusMessage>(packet => {
		loading.remove(CLAN_MANAGEMENT_LOADING);
		const clan = getClanOrWarn("Received GuildUpdateStatusMessage without being in a clan.");
		if (clan === null) return;

		clan.onGuildUpdateStatusMessage(packet);
		_clanRef.trigger();

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.GuildUpdateStatusMessage);

	// Called when our clan language has been updated.
	usePacket<GuildUpdatePrimaryLanguageMessage>(packet => {
		loading.remove(CLAN_MANAGEMENT_LOADING);
		const clan = getClanOrWarn("Received GuildUpdatePrimaryLanguageMessage without being in a clan.");
		if (clan === null) return;

		clan.onGuildUpdatePrimaryLanguageMessage(packet);
		_clanRef.trigger();

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.GuildUpdatePrimaryLanguageMessage);

	// Called when our clan recruitment message has been updated.
	usePacket<GuildUpdateRecruitmentMessageMessage>(packet => {
		loading.remove(CLAN_MANAGEMENT_LOADING);
		const clan = getClanOrWarn("Received GuildUpdateRecruitmentMessageMessage without being in a clan.");
		if (clan === null) return;

		clan.onGuildUpdateRecruitmentMessageMessage(packet);
		_clanRef.trigger();

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.GuildUpdateRecruitmentMessageMessage);

	// Called when our clans' minimum total level requirement has been updated.
	usePacket<GuildUpdateMinimumTotalLevelRequirementMessage>(packet => {
		loading.remove(CLAN_MANAGEMENT_LOADING);
		const clan = getClanOrWarn("Received GuildUpdateMinimumTotalLevelRequirementMessage without being in a clan.");
		if (clan === null) return;

		clan.onGuildUpdateMinimumTotalLevelRequirementMessage(packet);
		_clanRef.trigger();

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.GuildUpdateMinimumTotalLevelRequirementMessage);

	// Called when our clan tag has been updated.
	usePacket<GuildUpdateTagMessage>(packet => {
		const clan = getClanOrWarn("Received GuildUpdateTagMessage without being in a clan.");
		if (clan === null) return;

		clan.onGuildUpdateTagMessage(packet);
		_clanRef.trigger();

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.GuildUpdateTagMessage);

	// Applications

	// Called when the clan we're in receives a new clan application.
	usePacket<ReceiveGuildApplicationMessage>(packet => {
		const clan = getClanOrWarn("Received ReceiveGuildApplicationMessage without being in a clan.");
		if (clan === null) return;

		clan.onReceiveGuildApplicationMessage(packet);
		_clanRef.trigger();

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.ReceiveGuildApplicationMessage);

	// Called when someone has cleared all active clan applications in the clan
	usePacket<ClearAllGuildApplicationsMessage>(packet => {
		const clan = getClanOrWarn("Received ClearAllGuildApplicationsMessage without being in a clan.");
		if (clan === null) return;

		clan.onClearAllGuildApplicationsMessage(packet);
		_clanRef.trigger();
	}, [], PacketType.ClearAllGuildApplicationsMessage);

	/**
	 * Update our clans' state when we receive ReceiveGuildStateMessage.
	 */
	usePacket<ReceiveGuildStateMessage>(packet => {
		const clan = getClanOrWarn("Received ReceiveGuildStateMessage without being in a clan.");
		if (clan === null) return;

		clan.onReceiveGuildStateMessage(packet);
		_clanRef.trigger();
	}, [], PacketType.ReceiveGuildStateMessage);

	// Clan vault has been updated.
	usePacket<GuildVaultMessage>(packet => {
		const clan = getClanOrWarn("Received GuildVaultMessage without being in a clan.");
		if (clan === null) return;

		clan.onGuildVaultMessage(packet);
		_clanRef.trigger();
	}, [], PacketType.GuildVaultMessage);

	// Received clan pvm stats.
	usePacket<RequestClanPvmStatsMessage>(packet => {
		const clan = getClanOrWarn("Received RequestClanPvmStatsMessage without being in a clan.");
		if (clan === null) return;

		clan.onRequestClanPvmStatsMessage(packet);
		_clanRef.trigger();
	}, [], PacketType.RequestClanPvmStatsMessage);

	// The clan leader (another member or us) left the clan.
	usePacket<GuildLeaderLeftGuildMessage>(packet => {
		const playerManager = managers.playerManager!;

		const clan = getClanOrWarn("Received GuildLeaderLeftGuildMessage without being in a clan.");
		if (clan === null) return;

		// If we're the leader, then set our clan to null.
		if (playerManager.username.content() === clan.getLeader().name) {
			setClanRef(null);
			return;
		}

		clan.onGuildLeaderLeftGuildMessage(packet);
		_clanRef.trigger()

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.GuildLeaderLeftGuildMessage);

	// A member was kicked from the clan (could be us).
	usePacket<GuildMemberKickedMessage>(packet => {
		const playerManager = managers.playerManager!;

		const clan = getClanOrWarn("Received GuildMemberKickedMessage without being in a clan.");
		if (clan === null) return;

		// If we're the one being kicked, then set our clan to null.
		if (playerManager.username.content() === packet.PlayerName) {
			setClanRef(null);

			// TODO: Trigger an event / display a notification.

			return;
		}

		clan.onGuildMemberKickedMessage(packet);
		_clanRef.trigger();

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.GuildMemberKickedMessage);

	/*
	 * Handling player joining and leaving a clan. If we are the player, then
	 * the clan object will either be created or cleared.
	 */

	usePacket<PlayerJoinedGuildMessage>(packet => {
		const playerManager = managers.playerManager!;

		// If we're the one joining a clan, then create the clan object.
		if (playerManager.username.content() === packet.PlayerJoining) {
			setClanRef(Clan.fromJoinPacket(packet));
			return;
		}

		// Someone else joined the clan we're in.
		const clan = getClanOrWarn("Received PlayerJoinedGuildMessage without being in a clan.");
		if (clan === null) return;

		clan.onPlayerJoinedGuildMessage(playerManager.mode.content(), packet);
		_clanRef.trigger();

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.PlayerJoinedGuildMessage);

	usePacket<PlayerLeftGuildMessage>(packet => {
		const playerManager = managers.playerManager!;

		// If we're the one leaving the clan, then clear our current clan.
		if (playerManager.username.content() === packet.PlayerName) {
			setClanRef(null);
			return;
		}

		// Someone else left the clan.
		const clan = getClanOrWarn("Received PlayerLeftGuildMessage without being in a clan.");
		if (clan === null) return;

		clan.onPlayerLeftGuildMessage(packet);
		_clanRef.trigger();

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.PlayerLeftGuildMessage);

	// General

	usePacket<GuildRequestResultMessage>(packet => {
		const localizationKey = GuildActionResponse[packet.MessageType];
		const argument = packet.AssociatedPlayer ?? "";
		modals.openModal("guildRequestResultMessage", ModalUtils.generalTextModalLocalized("Clan", localizationKey, [argument]));
	}, [], PacketType.GuildRequestResultMessage);

	// Create and delete

	usePacket<CreateGuildMessage>(packet => {
		setClanRef(Clan.fromCreatePacket(managers, packet));

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.CreateGuildMessage);

	usePacket<GuildDeletedMessage>(_ => {
		setClanRef(null);

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.GuildDeletedMessage);

	/*
	 * Initialization
	 */

	const initialize = (data: LoginDataMessage) => {
		if (data.GuildName === null) return;
		setClanRef(Clan.fromLoginPacket(data));
		_accumulatedCreditsRef.setContent(data.AccumulatedCredits);
	}

	const cleanup = () => {
		_clanRef.setContent(null);
		_hasClanRef.setContent(false);
		_accumulatedCreditsRef.setContent(0);
	}

	return {
		$managerName: "clanManager",

		clan: _clanRef,
		hasClan: _hasClanRef,

		accumulatedCredits: _accumulatedCreditsRef,

		network: {
			refreshClanState: _refreshClanState,
			refreshClanVault: _refreshClanVault,
			refreshClanPveStats: _refreshClanPveStats,

			updateRecruitmentStatus: _updateRecruitmentStatus,
			updateCategory: _updateCategory,
			updateLanguage: _updateLanguage,
			updateRecruitmentMessage: _updateRecruitmentMessage,
			updateTotalLevelRequirement: _updateTotalLevelRequirement,
			updateTag: _updateTag,

			sendClanInvite: _sendClanInvite,
			clearAllApplications: _clearAllApplications,
		},

		isUpgradeUnlocked: _isUpgradeUnlocked,
		getUpgradeBenefits: _getUpgradeBenefits,

		initialize: initialize,
		cleanup: cleanup
	}
}