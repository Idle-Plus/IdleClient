import { useEffect, useRef } from "react";
import { Network } from "@idleclient/network/Network.ts";
import { Packet } from "@idleclient/network/NetworkData.ts";

const usePacket = <T extends Packet>(
	listener: (packet: T) => void,
	deps: any[] = [],
	type: number,
) => {
	const listenerRef = useRef<(packet: T) => void>(listener);

	useEffect(() => {
		listenerRef.current = listener;
	}, [listener]);

	useEffect(() => {
		const id = Network.on(type, listenerRef.current);
		return () => {Network.unregister(id);};
	}, [...deps]);
}

export default usePacket;