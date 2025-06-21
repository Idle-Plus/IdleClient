import { useEffect, useRef } from "react";
import { Network } from "@idleclient/network/Network.ts";

export enum NetworkEvent {
	CONNECT,
	DISCONNECT,
	ERROR,

	// "Custom" events

	FAILED_TO_CONNECT,
}

export enum CloseReason {
	UNKNOWN,
	CLIENT_INITIATED,
	FAILED_TO_CONNECT,
}

export function useNetworkEvent(callback: () => void, deps: any[], event: Exclude<NetworkEvent, NetworkEvent.DISCONNECT>): void;
export function useNetworkEvent(callback: (reason: CloseReason, message: string | null) => void, deps: any[], event: NetworkEvent.DISCONNECT): void

export function useNetworkEvent(
	callback: (...args: any[]) => void,
	deps: any[],
	event: NetworkEvent,
): void {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		let id: number;

		switch (event) {
			case NetworkEvent.CONNECT:
				id = Network.onConnect(callbackRef.current);
				break;
			case NetworkEvent.DISCONNECT:
				id = Network.onDisconnect((connected: boolean, code: number, message: string | null) => {
					if (!connected) callbackRef.current(CloseReason.FAILED_TO_CONNECT, message);
					else if (code === 1000 && message === "CLIENT_DISCONNECT") callbackRef.current(CloseReason.CLIENT_INITIATED, null);
					else callbackRef.current(CloseReason.UNKNOWN, message)
				});
				break;
			case NetworkEvent.ERROR:
				id = Network.onError(callbackRef.current);
				break;
			case NetworkEvent.FAILED_TO_CONNECT:
				id = Network.onDisconnect((connected: boolean) => {
					if (!connected) callbackRef.current();
				});
				break;
		}

		return () => {Network.unregister(id);};
	}, [...deps]);
}