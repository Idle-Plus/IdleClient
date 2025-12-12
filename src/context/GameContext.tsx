import { PlayFabSession } from "@idleclient/types/playFabTypes.ts";
import React, { createContext, useContext, useRef, useState } from "react";
import { ConnectionState } from "@idleclient/network/ConnectionState.ts";
import { Network } from "@idleclient/network/Network.ts";
import { CloseReason, NetworkEvent, useNetworkEvent } from "@hooks/network/useNetworkEvent.ts";
import usePacket from "@hooks/network/usePacket.ts";
import { ErrorMessage, ErrorType, LoginDataMessage, PacketType } from "@idleclient/network/NetworkData.ts";
import { InventoryManager, InventoryManagerType } from "@idleclient/game/manager/InventoryManager.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { useLoading } from "@context/LoadingContext.tsx";
import { PlayerManager, PlayerManagerType } from "@idleclient/game/manager/PlayerManager.ts";
import { useConsole } from "@context/ConsoleContext.tsx";
import { SkillManager, SkillManagerType } from "@idleclient/game/manager/SkillManager.ts";
import { TaskManager, TaskManagerType } from "@idleclient/game/manager/TaskManager.ts";
import { EquipmentManager, EquipmentManagerType } from "@idleclient/game/manager/EquipmentManager.ts";
import { GameEvents } from "@idleclient/event/GameEvents.ts";
import { BoostManager, BoostManagerType } from "@idleclient/game/manager/BoostManager.ts";
import { PotionManager, PotionManagerType } from "@idleclient/game/manager/PotionManager.ts";
import { DeferredPromise } from "@idleclient/utils/DeferredPromise";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { useModal } from "@context/ModalContext.tsx";
import GenericTextModal from "@components/modal/GenericTextModal.tsx";
import { useSession } from "@context/SessionContext.tsx";
import { ClanManager, ClanManagerType } from "@idleclient/game/manager/ClanManager.ts";
import { ModalUtils } from "@utils/ModalUtils.tsx";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";

const CONNECTING_LOADING_ID = "gameContext$connecting";

const ERROR_TYPES_TO_LOCALIZATON_KEY = new Map<ErrorType, string>([
	[ErrorType.UpdateInProgress, "client_build_ahead_of_server_info"],
	[ErrorType.ConfigMismatch, "client_build_ahead_of_server_info"],
	[ErrorType.TooManyLogins, "too_many_logged_in_clients"],
	[ErrorType.DailyLoginLimitReached, "daily_login_limit_reached"],
	[ErrorType.OtherPlayerOffline, "other_player_is_offline"],
	[ErrorType.OtherPlayerInventoryFull, "other_player_inventory_is_full"],
	[ErrorType.NotWhiteListed, "player_not_whitelisted"],
	[ErrorType.UnknownError, "operation_couldnt_be_completed"],
	[ErrorType.OtherPlayerIsBusy, "other_player_is_busy"],
	[ErrorType.GroupIsFull, "party_is_full"],
	[ErrorType.CantDoThatWhileInRaid, "cant_do_that_while_in_raid"],
	[ErrorType.CantSendItemToIronman, "cant_send_item_to_ironman"],
	[ErrorType.CantInviteIronmanToClan, "cant_invite_ironman_to_clan"],
	[ErrorType.CantInviteIronmanToParty, "cant_invite_ironman_to_party"],
	[ErrorType.IronmenCantDoThis, "cant_do_that_in_ironman"],
	[ErrorType.CantJoinIronmanClan, "cant_join_ironman_clan"],
	[ErrorType.EventIsCurrentlyRunning, "event_is_already_running"],
	[ErrorType.NoGuildMembersAvailable, "no_online_guild_members"],
	[ErrorType.EventOnCooldown, "event_is_on_cooldown"],
	[ErrorType.DailyEventsAlreadyCompleted, "daily_events_already_completed"],
	[ErrorType.CantJoinGuildEventBecauseOfGuildSwitch, "cant_join_guild_event_because_of_guild_change"],
	[ErrorType.NeedToLeaveGuildEventToDoThis, "cant_do_that_while_in_clan_event"],
	[ErrorType.LoadoutSaveSuccess, "loadout_save_successful"],
	[ErrorType.LoadoutIsEmpty, "loadout_is_empty"],
	[ErrorType.LoadoutAlreadyEquipped, "loadout_already_equipped"],
	[ErrorType.InventoryTooFullToEquipLoadout, "inventory_too_full_to_equip_loadout"],
	[ErrorType.InventoryTooFull, "inventory_is_full2"],
	[ErrorType.LoadoutNameTaken, "loadout_name_taken"],
	[ErrorType.ClanVaultFull, "vault_is_full"],
	[ErrorType.ShopPurchaseFailed, "purchase_failed_server"],
	[ErrorType.ApplicationExpired, "application_has_expired"],
	[ErrorType.FeatureIsDisabled, "feature_is_disabled"],
	[ErrorType.GenericFailure, "operation_couldnt_be_completed"],
	[ErrorType.TooManyItemsSentToPlayer, "too_many_items_sent_to_player"],
	[ErrorType.PlayerHasTooManyItemsInRetrievalService, "player_has_too_many_items_in_retrieval"],
	[ErrorType.PlayerNotFound, "player_not_found_by_username"],
	[ErrorType.OtherPlayerHasBlockedYou, "player_has_blocked_you"],
	[ErrorType.ActionWouldPutPlayerAboveItemLimit, "doing_that_would_put_you_over_the_item_limit"],
	[ErrorType.DailyExperienceCapReached, "daily_experience_cap_reached"],
	[ErrorType.NameTaken, "that_name_is_taken"],
	[ErrorType.PlayerAlreadyBlocked, "player_already_blocked"],
	[ErrorType.PlayerNotBlocked, "player_not_blocked"],
	[ErrorType.OtherPlayerNeedsToBeRegistered, "other_player_needs_to_be_registered"],
	[ErrorType.RequestFailedToProcess, "request_couldnt_be_processed_try_again"],
	[ErrorType.TagUpdateFailed, "tag_update_failed"],
	[ErrorType.GenericCooldown, "please_wait_before_doing_that"]
]);


export enum GameState {
	/**
	 * We're currently not connected, or trying to connect.
	 */
	NONE,
	/**
	 * We're planning on connecting.
	 */
	READY,
	/**
	 * We're currently trying to connect.
	 */
	CONNECTING,
	/**
	 * We're currently connected and are in the process of authenticating.
	 */
	AUTHENTICATING,
	/**
	 * We've authenticated and are waiting for a manual change from the
	 * auth state to the play state.
	 */
	AUTHENTICATED,
	/**
	 * We're connected and are currently playing the game.
	 */
	PLAY
}

export interface ManagerType {
	$managerName: string;
}

export interface ManagerContext {
	playerManager: PlayerManagerType | undefined;
	clanManager: ClanManagerType | undefined;
	skillManager: SkillManagerType | undefined;
	inventoryManager: InventoryManagerType | undefined;
	equipmentManager: EquipmentManagerType | undefined;
	potionManager: PotionManagerType | undefined;
	taskManager: TaskManagerType | undefined;
	boostManager: BoostManagerType | undefined;

	game: GameContextType | undefined;
}

function createManagerStorage(): ManagerContext {
	return {
		playerManager: undefined,
		clanManager: undefined,
		skillManager: undefined,
		inventoryManager: undefined,
		equipmentManager: undefined,
		potionManager: undefined,
		taskManager: undefined,
		boostManager: undefined,

		game: undefined,
	}
}

function createManager<T extends ManagerType>(value: T, storage: ManagerContext): T {
	// @ts-expect-error - Yeah yeah, I know.
	storage[value.$managerName] = value;
	return value;
}

export interface GameContextType {

	dummy: number;
	setDummy: (value: number) => void;
	
	player: PlayerManagerType;
	clan: ClanManagerType;
	skill: SkillManagerType;
	inventory: InventoryManagerType;
	equipment: EquipmentManagerType;
	potion: PotionManagerType;
	task: TaskManagerType;
	boost: BoostManagerType;

	/**
	 * The current game state. Used to determine which page to display.
	 *
	 * The game context automatically handles the NONE, CONNECTING, AUTHENTICATING
	 * and the AUTHENTICATED state, while going from AUTHENTICATED to PLAY
	 * requires manual handling. This is to allow the user to respond to
	 * actions required by the server, for example, force login.
	 */
	gameState: SmartRef<GameState>;

	/**
	 * Marks that an error has occurred. The user should be prevented
	 * from doing anything until the error has been fixed (normally by
	 * refreshing the page).
	 */
	error: boolean;

	connect: (session: PlayFabSession) => Promise<{ success: boolean, message?: string, error?: ErrorType }>;
	connectForceLogin: () => void;

	disconnect: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
	children: React.ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
	GameData.initialize();

	const VERSION = SettingsDatabase.shared().latestBuildVersion;
	const CONFIG_VERSION = SettingsDatabase.shared().configVersion;

	const loading = useLoading();
	const sessions = useSession();
	const { openModal } = useModal();
	const debug = useConsole();

	/*
	 * Managers
	 */

	const _managers: ManagerContext = createManagerStorage();

	const _player: PlayerManagerType = createManager(PlayerManager(_managers), _managers);
	const _clan: ClanManagerType = createManager(ClanManager(_managers), _managers);
	const _skill: SkillManagerType = createManager(SkillManager(_managers), _managers);
	const _inventory: InventoryManagerType = createManager(InventoryManager(_managers), _managers);
	const _equipment: EquipmentManagerType = createManager(EquipmentManager(_managers), _managers);
	const _potion: PotionManagerType = createManager(PotionManager(_managers), _managers);
	const _task: TaskManagerType = createManager(TaskManager(_managers), _managers);
	const _boost: BoostManagerType = createManager(BoostManager(_managers), _managers);

	/*
	 * States
	 */

	const [dummy, setDummy] = useState(0);
	//const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.OFFLINE);
	//const [disconnectCause, setDisconnectCause] = useState<string | null>(null);

	/*
	 * Refs
	 */

	const _accountSession = useRef<PlayFabSession | null>(null);
	const _connectionPromiseRef = useRef<DeferredPromise<{ success: boolean, message?: string, error?: ErrorType }> | null>(null);

	/*
	 * Smart refs
	 */

	const _connectionStateRef = useSmartRef<ConnectionState>(ConnectionState.OFFLINE);
	const _gameState = useSmartRef<GameState>(GameState.NONE);

	/*
	 * Functions
	 */

	const connect = (session: PlayFabSession) => {
		if (_connectionStateRef.content() !== ConnectionState.OFFLINE)
			throw new Error("Already connected, state: " + _connectionStateRef.content());

		const promise = new DeferredPromise<{ success: boolean, message?: string }>();
		_connectionPromiseRef.current = promise;
		_accountSession.current = session;

		try {
			loading.set(CONNECTING_LOADING_ID, "Connecting to Idle Clans", -1);
			_connectionStateRef.setContent(ConnectionState.CONNECTING);
			_gameState.setContent(GameState.CONNECTING);
			Network.connect();
		} catch (e) {
			console.error(e);
			promise.resolve({ success: false, message: "An exception occurred while trying to connect to the game server." });
			_connectionPromiseRef.current = null;
		}

		return promise.getPromise();
	}

	const disconnect = () => {
		if (_connectionStateRef.content() === ConnectionState.OFFLINE)
			return;

		_gameState.setContent(GameState.NONE);
		_connectionStateRef.setContent(ConnectionState.OFFLINE);
		loading.remove(CONNECTING_LOADING_ID);

		Network.close();
	}

	const connectForceLogin = () => {
		if (_connectionStateRef.content() === ConnectionState.OFFLINE)
			return;

		const session = _accountSession.current;
		if (session === null) throw new Error("No session to authenticate with");

		Network.data(JSON.stringify({
			"MsgType": 2,
			"SessionTicket": session.sessionTicket,
			"ClientVersion": VERSION,
			"ConfigVersion": CONFIG_VERSION,
			"ForceLogIn": true,
		}));

		disconnect();
	}

	/*
	 * General packet listeners
	 */

	usePacket<LoginDataMessage>(async packet => {
		// Mark ourselves as connected and initialize the managers.
		_connectionStateRef.setContent(ConnectionState.CONNECTED);

		_player.initialize(packet)
		_clan.initialize(packet);
		_skill.initialize(packet);
		_inventory.initialize(packet);
		_equipment.initialize(packet);
		_potion.initialize(packet);
		_task.initialize(packet);
		_boost.initialize(packet);
		document.title = `Idle Client - ${packet.Username}`;

		// Update the stored account if we have it stored.
		const storedAccount = sessions.storedAccounts.content()
			.find(value => value.name === _accountSession.current?.displayName);
		if (storedAccount && storedAccount.mode !== _player.mode.content()) {
			storedAccount.mode = _player.mode.content();
			sessions.updateStoredAccounts();
		}

		GameEvents.ConnectedPostEvent.fire(packet);

		if (_connectionPromiseRef.current) {
			_connectionPromiseRef.current.resolve({ success: true });
			_connectionPromiseRef.current = null;
		}

		debug.log("Game: Successfully authenticated with the Idle Clans game server.");
		console.log(packet);

		loading.remove(CONNECTING_LOADING_ID);
	}, [], PacketType.LoginDataMessage);

	usePacket<ErrorMessage>(packet => {
		if (_gameState.content() !== GameState.PLAY) {
			loading.remove(CONNECTING_LOADING_ID);
		}

		// Connection result
		if (_connectionPromiseRef.current) {
			_connectionPromiseRef.current.resolve({ success: false, message: "error", error: packet.Error });
			_connectionPromiseRef.current = null;
			return;
		}

		// Display the error message

		// Prioritize using the localization key if it's available.
		if (packet.LocKey !== null) {
			openModal("gameContext$errorMessage", ModalUtils.generalTextModalLocalized(null, packet.LocKey));
			return;
		}

		// Falling back to the error type.
		const errorType = ERROR_TYPES_TO_LOCALIZATON_KEY.get(packet.Error);
		if (errorType !== undefined) {
			openModal("gameContext$errorMessage", ModalUtils.generalTextModalLocalized(null, errorType));
			return;
		}

		// welp..
		debug.warn(`Game: Received ErrorMessage containing unknown ErrorType: ${packet.Error}`);
	}, [], PacketType.ErrorMessage);

	/*
	 * Network event listeners
	 */

	useNetworkEvent(() => {
		debug.log("Game: Connected opened to the Idle Clans game server, sending authentication packet.");

		// Make sure we have a session we can use.
		const session = _accountSession.current;
		if (!session) {
			_connectionPromiseRef.current?.resolve({ success: false, message: "Couldn't find session to authenticate with" });
			_connectionPromiseRef.current = null;

			Network.close();
			debug.error("Game: Failed to send authentication packet, no session.");
			return;
		}

		_gameState.setContent(GameState.AUTHENTICATING);
		GameEvents.ConnectedPreEvent.fire();

		Network.data(JSON.stringify({
			"MsgType": 2,
			"SessionTicket": session.sessionTicket,
			"ClientVersion": VERSION,
			"ConfigVersion": CONFIG_VERSION
		}));
	}, [], NetworkEvent.CONNECT)

	useNetworkEvent((reason: CloseReason, message: string | null) => {
		debug.log("Disconnected from server, reason:", CloseReason[reason], "message:", message);
		const currentState = _gameState.content();

		loading.remove(CONNECTING_LOADING_ID);
		_gameState.setContent(GameState.NONE);
		_connectionStateRef.setContent(ConnectionState.OFFLINE);

		_player.cleanup();
		_clan.cleanup();
		_skill.cleanup();
		_inventory.cleanup();
		_equipment.cleanup();
		_potion.cleanup();
		_task.cleanup();
		_boost.cleanup();
		document.title = "Idle Client";

		let reasonMessage: string;
		switch (reason) {
			case CloseReason.FAILED_TO_CONNECT: reasonMessage = "Failed to connect to the server."; break;
			case CloseReason.CLIENT_INITIATED: reasonMessage = "Client initiated disconnect."; break;
			default: reasonMessage = `Connection lost, reason: ${CloseReason[reason]} message: ${message}`; break;
		}

		//setDisconnectCause(reasonMessage);
		_connectionPromiseRef.current?.resolve({ success: false, message: reasonMessage });
		_connectionPromiseRef.current = null;

		// Display a popup if we were connected and it wasn't client initiated.
		if (currentState === GameState.PLAY && reason !== CloseReason.CLIENT_INITIATED) {
			openModal(
				"gameContext$disconnected",
				<GenericTextModal title="Connection lost" message="Lost connection to the server! Please try again in a minute." />
			)
		}

	}, [], NetworkEvent.DISCONNECT)

	/*
	 * Create the game context.
	 */

	const gameContext = {
		dummy: dummy,
		setDummy: (value: number) => setDummy(value),
		
		player: _player,
		clan: _clan,
		skill: _skill,
		inventory: _inventory,
		equipment: _equipment,
		potion: _potion,
		task: _task,
		boost: _boost,

		gameState: _gameState,

		error: GameData.FAILED_TO_INITIALIZE,
		//connected: connectionState === ConnectionState.CONNECTED,

		connect: connect,
		connectForceLogin: connectForceLogin,

		disconnect: disconnect
	};

	_managers.game = gameContext;

	return (
		<GameContext.Provider value={gameContext}>
			{children}
		</GameContext.Provider>
	)
}

export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) throw new Error("useGame must be used within a GameProvider");
	return context;
}