import { IdleEvent } from "@idleclient/event/IdleEvent.ts";
import { LoginDataMessage } from "@idleclient/network/NetworkData.ts";

export class GameEvents {

	public static readonly ConnectedPreEvent: IdleEvent = new IdleEvent();
	public static readonly ConnectedPostEvent: IdleEvent<[LoginDataMessage]> = new IdleEvent();

	public static readonly DisconnectEvent: IdleEvent = new IdleEvent();

}