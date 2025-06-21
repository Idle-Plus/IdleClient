import { deserialize, Packet } from "@idleclient/network/NetworkData.ts";

const address: string = import.meta.env.VITE_RELAY_ADDRESS;

let nextListenerId = 0;
const packetListeners: { [packet: number]: { [id: number]: (packet: any) => void } } = {};
const onConnectListeners: { [id: number]: () => void } = {};
const onDisconnectListeners: { [id: number]: (connected: boolean, code: number, message: string | null) => void } = {};
const onErrorListeners: { [id: number]: () => void } = {};

export class Network {

	private static socket: WebSocket | null;
	private static connected: boolean = false;

	public static on(packet: number, listener: (packet: any) => void, register?: number[]): number {
		if (!packetListeners[packet]) packetListeners[packet] = {};
		const id = nextListenerId++;
		packetListeners[packet][id] = listener;
		register?.push(id);
		return id;
	}

	/**
	 * Register a listener for when the WebSocket client connects to the
	 * server.
	 * <p>
	 * This isn't a listener for when the user has been authenticated, just
	 * when the WebSocket client has connected to the server and is ready to
	 * send and receive data.
	 *
	 * @param   listener
	 *          The listener to call when the WebSocket client connects to the
	 *          server.
	 * @param   register
	 *          Optional array to register the listener ID in.
	 *
	 * @return  The ID of the listener.
	 */
	public static onConnect(listener: () => void, register?: number[]): number {
		const id = nextListenerId++;
		onConnectListeners[id] = () => { listener() };
		register?.push(id);
		return id;
	}

	/**
	 * Register a listener for when the WebSocket client disconnects from the
	 * server.
	 *
	 * @param   listener
	 *          The listener to call when the WebSocket client disconnects from
	 *          the server. The listener will be called with a boolean specifying
	 *          if the client was connected before being disconnected. This can
	 *          be used to determine if we failed to connect, or if we were
	 *          disconnected after a successful connection.
	 * @param   register
	 *          Optional array to register the listener ID in.
	 *
	 * @return  The ID of the listener.
	 */
	public static onDisconnect(listener: (connected: boolean, code: number, message: string | null) => void,
	                           register?: number[]): number {
		const id = nextListenerId++;
		onDisconnectListeners[id] = listener;
		register?.push(id);
		return id;
	}

	public static onError(listener: () => void, register?: number[]): number {
		const id = nextListenerId++;
		onErrorListeners[id] = listener;
		register?.push(id);
		return id;
	}

	/**
	 * Unregister a listener by its ID or an array of IDs.
	 *
	 * @param   id
	 *          The ID of the listener to unregister, or an array of IDs.
	 * @param   packetType
	 *          An optional hint to specify which type of packet the listener
	 *          is listening for. This is used to unregister packet listeners
	 *          more efficiently.
	 */
	public static unregister(id: number | number[], packetType?: number): boolean | undefined {
		if (Array.isArray(id)) {
			for (const key in id) this.unregister(id[key], packetType);
			return;
		}

		if (packetType) {
			if (id in packetListeners[packetType]) {
				delete packetListeners[packetType][id];
				return true;
			}
			return false;
		}

		for (const key in packetListeners) {
			if (id in packetListeners[key]) {
				delete packetListeners[key][id];
				return;
			}
		}

		if (id in onConnectListeners) {
			delete onConnectListeners[id];
		}

		delete onDisconnectListeners[id];
	}

	public static data(data: string) {
		if (!this.connected) throw new Error('Not connected');
		this.socket!.send(data);
	}

	public static send(packet: Packet) {
		if (!this.connected) throw new Error('Not connected');
		this.socket!.send(JSON.stringify(packet));
	}

	public static connect() {
		if (this.connected) throw new Error('Already connected');

		this.socket = new WebSocket(address);
		this.socket.binaryType = "arraybuffer";

		this.socket.addEventListener('message', function (event) {
			if (typeof event.data !== 'string') {
				console.error("Network: Received unknown message type:", event.data);
				return;
			}

			const packet = JSON.parse(event.data);
			if (packet.MsgType === undefined || typeof packet.MsgType !== 'number') {
				console.error("Network: Received packet without a type:", packet);
				return;
			}

			//const type: number = packet.MsgType;
			const parsedPacket = deserialize(packet);
			if (!parsedPacket) {
				console.error("Network: Unknown packet type received:", packet.MsgType, "packet", packet);
				return;
			}

			console.log("Network: Received packet:", parsedPacket);

			for (const key in packetListeners[parsedPacket.MsgType]) {
				packetListeners[parsedPacket.MsgType][key](parsedPacket);
			}
		});

		this.socket.addEventListener('open', function (_event) {
			Network.connected = true;
			console.log("Network: Connected to the WebSocket server", _event);
			for (const key in onConnectListeners) onConnectListeners[key]();
		});

		this.socket.addEventListener('close', function (event: CloseEvent) {
			const wasConnected = Network.connected;
			Network.connected = false;
			console.log("Network: Disconnected from the WebSocket server", event);
			for (const key in onDisconnectListeners)
				onDisconnectListeners[key](wasConnected, event.code, event.reason);
		});

		this.socket.addEventListener('error', function (event) {
			console.error("Network: WebSocket error:", event);
			for (const key in onErrorListeners) onErrorListeners[key]();
		});
	}

	public static close() {
		if (this.socket) this.socket.close(1000, "CLIENT_CLOSE");
		this.socket = null;
	}
}