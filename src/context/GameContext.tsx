import { PlayFabSession } from "@idleclient/types/playFabTypes.ts";
import React, { createContext, useContext, useState } from "react";
import { ConnectionState } from "@idleclient/network/ConnectionState.ts";
import { Network } from "@idleclient/network/Network.ts";
import { CloseReason, NetworkEvent, useNetworkEvent } from "@hooks/network/useNetworkEvent.ts";
import { useUser } from "@context/UserContext.tsx";
import { DisconnectCause } from "@idleclient/network/DisconnectCause.ts";
import usePacket from "@hooks/network/usePacket.ts";
import { LoginDataMessage, PacketType } from "@idleclient/network/NetworkData.ts";
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

const CONNECTING_LOADING_ID = "gameContext$connecting";

export interface ManagerType {
	$managerName: string;
}

export interface ManagerStorage {
	boostManager: BoostManagerType | undefined;

	playerManager: PlayerManagerType | undefined;
	skillManager: SkillManagerType | undefined;
	inventoryManager: InventoryManagerType | undefined;
	equipmentManager: EquipmentManagerType | undefined;
	potionManager: PotionManagerType | undefined;
	taskManager: TaskManagerType | undefined;

	game: GameContextType | undefined;
}

function createManagerStorage(): ManagerStorage {
	return {
		boostManager: undefined,

		playerManager: undefined,
		skillManager: undefined,
		inventoryManager: undefined,
		equipmentManager: undefined,
		potionManager: undefined,
		taskManager: undefined,

		game: undefined,
	}
}

function createManager<T extends ManagerType>(value: T, storage: ManagerStorage): T {
	// @ts-expect-error - Yeah yeah, I know.
	storage[value.$managerName] = value;
	return value;
}

export interface GameContextType {

	// Data managers - Stores data.
	boost: BoostManagerType;

	// Functional managers - Handles data.
	player: PlayerManagerType;
	skill: SkillManagerType;
	inventory: InventoryManagerType;
	equipment: EquipmentManagerType;
	potion: PotionManagerType;
	task: TaskManagerType;

	/**
	 * Marks that an error has occurred. The user should be prevented
	 * from doing anything until the error has been fixed (normally by
	 * refreshing the page).
	 */
	error: boolean;
	/**
	 * If we're currently connected to the game server.
	 */
	connected: boolean;

	connect: (session: PlayFabSession) => void;
	disconnect: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
	children: React.ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
	GameData.initialize();

	const loading = useLoading();
	const debug = useConsole();
	const user = useUser();

	/*
	 * Managers
	 */

	const managers: ManagerStorage = createManagerStorage();
	const boost: BoostManagerType = createManager(BoostManager(managers), managers);

	const player: PlayerManagerType = createManager(PlayerManager(managers), managers);
	const skill: SkillManagerType = createManager(SkillManager(managers), managers);
	const inventory: InventoryManagerType = createManager(InventoryManager(managers), managers);
	const equipment: EquipmentManagerType = createManager(EquipmentManager(managers), managers);
	const potion: PotionManagerType = createManager(PotionManager(managers), managers);
	const task: TaskManagerType = createManager(TaskManager(managers), managers);

	/*
	 * States
	 */

	const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.OFFLINE);
	const [disconnectCause, setDisconnectCause] = useState<DisconnectCause | null>(null);

	/*
	 * Functions
	 */

	const connect = async (session: PlayFabSession) => {
		if (connectionState !== ConnectionState.OFFLINE)
			throw new Error("Already connected, state: " + connectionState);

		loading.set(CONNECTING_LOADING_ID, "Connecting to Idle Clans");
		setConnectionState(ConnectionState.CONNECTING);
		Network.connect();
	}

	const disconnect = () => {
		if (connectionState === ConnectionState.OFFLINE)
			throw new Error("Already disconnected");

		setConnectionState(ConnectionState.OFFLINE);
		Network.close();
	}

	/*
	 * General packet listeners
	 */

	usePacket<LoginDataMessage>(async packet => {
		// Mark ourselves as connected and initialize the managers.
		setConnectionState(ConnectionState.CONNECTED);

		player.initialize(packet);
		skill.initialize(packet);
		inventory.initialize(packet);
		equipment.initialize(packet);

		GameEvents.ConnectedPostEvent.fire();

		debug.log("Game: Successfully authenticated with the Idle Clans game server.");
		console.log(packet);

		loading.remove(CONNECTING_LOADING_ID);
	}, [], PacketType.LoginDataMessage)

	/*
	 * Network event listeners
	 */

	useNetworkEvent(() => {
		debug.log("Game: Connected opened to the Idle Clans game server, sending authentication packet.");

		GameEvents.ConnectedPreEvent.fire();

		Network.data(JSON.stringify({
			"MsgType": 2,
			"SessionTicket": user.session?.sessionTicket,
			"ClientVersion": "1.5706",
			"ConfigVersion": 296
		}));
	}, [user], NetworkEvent.CONNECT)

	useNetworkEvent((reason: CloseReason, message: string | null) => {
		debug.log("Disconnected from server, reason:", CloseReason[reason], "message:", message);

		setConnectionState(ConnectionState.OFFLINE);
		inventory.cleanup();

		// Set connection failed state.
		if (reason == CloseReason.UNKNOWN) {
			setDisconnectCause({ type: "server", error: "Unknown error, server closed connection, message: " + message });
		} else {
			setDisconnectCause({ type: "unknown", error: "Connection lost, message: " + message });
		}
	}, [], NetworkEvent.DISCONNECT)

	useNetworkEvent(() => {
		setDisconnectCause({ type: "client", error: "Failed to connect to the server." });
	}, [], NetworkEvent.FAILED_TO_CONNECT)

	/*
	 * Create the game context.
	 */

	const gameContext = {
		boost: boost,

		player: player,
		skill: skill,
		inventory: inventory,
		equipment: equipment,
		potion: potion,
		task: task,

		error: GameData.FAILED_TO_INITIALIZE,
		connected: connectionState === ConnectionState.CONNECTED,

		connect: connect,
		disconnect: disconnect
	};

	managers.game = gameContext;

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