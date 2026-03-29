import { ManagerContext, ManagerType } from "@context/GameContext.tsx";
import {
	AcceptGuildInviteMessage,
	ClanCategory,
	ClearAllGuildApplicationsMessage,
	CreateGuildMessage,
	DeclineGuildInviteMessage,
	DeleteGuildMessage,
	GameMode,
	GuildActionResponse,
	GuildBulletinBoardEditResponseMessage,
	GuildBulletinBoardInfoMessage,
	GuildDeletedMessage,
	GuildInvitation,
	GuildLeaderLeftGuildMessage,
	GuildMemberLoggedInMessage,
	GuildMemberLoggedOutMessage,
	GuildRequestResultMessage,
	GuildUpdateMinimumTotalLevelRequirementMessage,
	GuildUpdatePrimaryLanguageMessage,
	GuildUpdateRecruitmentMessageMessage,
	GuildUpdateRecruitmentStateMessage,
	GuildUpdateStatusMessage,
	GuildUpdateTagMessage,
	GuildVaultMessage,
	Int,
	LeaveGuildMessage,
	LoginDataMessage,
	PacketType,
	PlayerLeftGuildMessage,
	ReceiveGuildApplicationMessage,
	ReceiveGuildInviteMessage,
	ReceiveGuildStateMessage,
	RequestClanPvmStatsMessage,
	RequestGuildBulletinInfoMessage,
	RequestGuildPageInfoMessage,
	RequestGuildVaultMessage,
	SendGuildInviteMessage,
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
import { RefObject, useRef } from "react";
import { ActiveClan } from "@/api/IdleClansAPI.ts";
import { TextUtils } from "@idleclient/utils/TextUtils.tsx";
import { ClanInvitationsModalId } from "@pages/game/clan/modals/ClanInvitationsModal.tsx";
import { LocalizationDatabase } from "@idleclient/game/data/LocalizationDatabase.ts";

const CLAN_MANAGEMENT_LOADING = "clan_management_loading";
const CLAN_MANAGEMENT_LOADING_MESSAGE = "Updating clan...";

export interface ClanManagerType extends ManagerType {
	/**
	 * The clan we're currently in, or null if we're not in a clan.
	 */
	clan: SmartRef<Clan | null>;
	//hasClan: SmartRef<boolean>;
	//accumulatedCredits: SmartRef<Int>;
	clanInvitations: SmartRef<GuildInvitation[]>;

	// General clan information.

	/**
	 * Cached clans that are recruiting.
	 */
	cachedRecruitingClans: RefObject<{ clans: ActiveClan[], time: Date } | undefined>;

	network: {
		/**
		 * Accept a specific clan invitation, resulting in the player joining
		 * the clan.
		 */
		acceptClanInvite: (invite: GuildInvitation) => void;
		/**
		 * Decline a specific clan invitation.
		 */
		declineClanInvite: (invite: GuildInvitation) => void;

		/**
		 * Create a new clan with the specified name.
		 */
		createClan: (name: string) => void;
		/**
		 * Delete the clan we're currently in, or if there are other players in
		 * the clan, leadership will be transferred, and we'll leave the clan.
		 *
		 * Should only be called if we're the leader of the clan.
		 */
		deleteClan: () => void;
		/**
		 * Leave the clan we're currently in.
		 */
		leaveClan: () => void;

		/**
		 * Requests an updated clan state from the server.
		 */
		refreshClanPage: () => void;
		/**
		 * Request the server to send us our clan vault contents.
		 */
		refreshClanVault: (force?: boolean) => void;
		/**
		 * Request the server to send us the bulletin board of the clan.
		 */
		refreshClanBulletinBoard: (force?: boolean) => void;

		/**
		 * Update the bulletin board of the clan.
		 */
		updateBulletinBoard: (message: string, discordCode: string) => void;
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

export const ClanManager = (managers: ManagerContext): ClanManagerType => {
	const debug = useConsole();
	const loading = useLoading();
	const modals = useModal();
	const toasts = useToast();

	const _clanRef = useSmartRef<Clan | null>(null);
	const _hasClanRef = useSmartRef<boolean>(false);
	const _clanInvitationsRef = useSmartRef<GuildInvitation[]>([]);

	const _cachedRecruitingClansRef = useRef<{ clans: ActiveClan[], time: Date } | undefined>(undefined);

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

	// Invitations

	const _acceptClanInvite = (invite: GuildInvitation) => {
		if (_clanRef.content() !== null) return;
		Network.send(new AcceptGuildInviteMessage(invite.GuildName ?? ""));
		_clanInvitationsRef.setContent([]);
	}

	const _declineClanInvite = (invite: GuildInvitation) => {
		if (_clanRef.content() !== null) return;
		Network.send(new DeclineGuildInviteMessage(invite.GuildName ?? ""));
		_clanInvitationsRef.setContent(current => current.filter(inv => inv.GuildName !== invite.GuildName));
	}

	// Creation

	const _createClan = (name: string) => {
		if (_clanRef.content() !== null) return;
		Network.send(new CreateGuildMessage(name, null, null, null));
	}

	const _deleteClan = () => {
		if (_clanRef.content() === null) return;
		Network.send(new DeleteGuildMessage(false));
	}

	const _leaveClan = () => {
		if (_clanRef.content() === null) return;
		Network.send(new LeaveGuildMessage());
	}

	// Basic

	const _refreshClanPage = () => {
		if (_clanRef.content() === null) return;
		Network.send(new RequestGuildPageInfoMessage(null, null));
	}

	const _refreshClanVault = (force: boolean = false) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		if (clan.vault !== null && !force) return;
		Network.send(new RequestGuildVaultMessage());
	}

	const _refreshClanBulletinBoard = (force: boolean = false) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		if (clan.bulletinBoard !== null && !force) return;
		Network.send(new RequestGuildBulletinInfoMessage());
	}

	// Update

	const _updateBulletinBoard = (message: string, discordCode: string) => {
		const clan = _clanRef.content();
		if (clan === null) return;
		if (clan.bulletinBoard?.message === message && clan.bulletinBoard?.discordCode === discordCode) return;
		Network.send(new GuildBulletinBoardInfoMessage(message, discordCode));

		clan.bulletinBoard = { message, discordCode };
		_clanRef.trigger();
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

	// Invitations

	usePacket<ReceiveGuildInviteMessage>(packet => {
		_clanInvitationsRef.content().push({
			GuildName: packet.GuildName,
			Date: new Date().toISOString(),
			GuildId: "???"
		});
		_clanRef.trigger();

		toasts.info(
			"Clan Invite",
			TextUtils.getStyledMessage(`<b>${packet.PlayerInviting}</b> invited you to join <b>${packet.GuildName}</b>.`) as any,
			{
				onClick: () => {
					modals.openModal(ClanInvitationsModalId, ModalUtils.clanInvitationModal());
				}
			});
	}, [], PacketType.ReceiveGuildInviteMessage);

	// Update

	usePacket<GuildBulletinBoardEditResponseMessage>(packet => {
		toasts.info("Clan", packet.Success ?
			"Successfully updated your clan's bulletin board." :
			"Failed to update your clan's bulletin board."
		);
	}, [], PacketType.GuildBulletinBoardEditResponseMessage);

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

	// Received clan bulletin info.
	usePacket<GuildBulletinBoardInfoMessage>(packet => {
		const clan = getClanOrWarn("Received GuildBulletinBoardInfoMessage without being in a clan.");
		if (clan === null) return;

		clan.onGuildBulletinBoardInfoMessage(packet);
		_clanRef.trigger();
	}, [], PacketType.GuildBulletinBoardInfoMessage);

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

		// Doesn't seem to be sent anymore when another guild leader leaves the clan?
		console.warn(`Received GuildLeaderLeftGuildMessage, but we aren't the leader?`);
	}, [], PacketType.GuildLeaderLeftGuildMessage);

	/*
	 * Handling player joining and leaving a clan. If we are the player, then
	 * the clan object will either be created or cleared.
	 */

	usePacket<PlayerLeftGuildMessage>(packet => {
		const playerManager = managers.playerManager!;

		// If we're the one leaving the clan, then clear our current clan.
		if (playerManager.username.content() === packet.PlayerName) {

			// TODO: Trigger an event / display a notification.

			setClanRef(null);
			return;
		}

		// Doesn't seem to be sent anymore when other people leave the clan?
		console.warn(`Received PlayerLeftGuildMessage for player ${packet.PlayerName} which isn't us?`);
	}, [], PacketType.PlayerLeftGuildMessage);

	/*
	 * General packets
	 */

	usePacket<ReceiveGuildStateMessage>(packet => {
		let clan = _clanRef.content();

		// If we don't currently have a clan, then we just joined one.
		if (clan === null) {
			if (packet.IsPartialUpdate) {
				console.warn("Received ReceiveGuildStateMessage for a clan we don't have, but it's a partial update?");
				return;
			}

			clan = Clan.fromPacket(managers.playerManager?.mode.content() ?? GameMode.Default, packet);
			setClanRef(clan);
			return;
		}

		if (clan.onReceiveGuildStateMessage(packet))
			_clanRef.trigger();
		loading.remove(CLAN_MANAGEMENT_LOADING);

		if (packet.Message != null) {
			const message = LocalizationDatabase.loc(packet.Message.LocalizationKey, packet.Message.Args);
			toasts.info("Clan", TextUtils.getStyledMessage(message) as any);
		}
	}, [], PacketType.ReceiveGuildStateMessage);

	usePacket<GuildRequestResultMessage>(packet => {
		const localizationKey = GuildActionResponse[packet.MessageType];
		const argument = packet.AssociatedPlayer ?? "";
		modals.openModal("guildRequestResultMessage", ModalUtils.generalTextModalLocalized("Clan", localizationKey, [argument]));
	}, [], PacketType.GuildRequestResultMessage);

	usePacket<GuildMemberLoggedInMessage>(packet => {
		const clan = getClanOrWarn("Received GuildMemberLoggedInMessage without being in a clan.");
		if (clan === null) return;

		if (!clan.onGuildMemberLoggedInMessage(packet)) return;
		_clanRef.trigger();

		toasts.info("Clan", `${packet.GuildMemberName} logged in`);
	}, [], PacketType.GuildMemberLoggedInMessage);

	usePacket<GuildMemberLoggedOutMessage>(packet => {
		const clan = getClanOrWarn("Received GuildMemberLoggedOutMessage without being in a clan.");
		if (clan === null) return;

		if (!clan.onGuildMemberLoggedOutMessage(packet)) return;
		_clanRef.trigger();

		toasts.info("Clan", `${packet.GuildMemberName} logged out`);
	}, [], PacketType.GuildMemberLoggedOutMessage);

	// Delete clan

	usePacket<GuildDeletedMessage>(_ => {
		setClanRef(null);

		// TODO: Trigger an event / display a notification.

	}, [], PacketType.GuildDeletedMessage);

	/*
	 * Initialization
	 */

	const initialize = (data: LoginDataMessage) => {
		if (data.IsInGuild) setClanRef(Clan.fromPacket(data.GameMode ?? GameMode.Default, data.GuildStateMessage!));
		_clanInvitationsRef.setContent(data.GuildInvitations ?? []);
	}

	const cleanup = () => {
		_clanRef.setContent(null);
		_hasClanRef.setContent(false);
		_clanInvitationsRef.setContent([]);
	}

	return {
		$managerName: "clanManager",

		clan: _clanRef,
		clanInvitations: _clanInvitationsRef,

		cachedRecruitingClans: _cachedRecruitingClansRef,

		network: {
			acceptClanInvite: _acceptClanInvite,
			declineClanInvite: _declineClanInvite,

			createClan: _createClan,
			deleteClan: _deleteClan,
			leaveClan: _leaveClan,

			refreshClanPage: _refreshClanPage,
			refreshClanVault: _refreshClanVault,
			refreshClanBulletinBoard: _refreshClanBulletinBoard,

			updateBulletinBoard: _updateBulletinBoard,
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