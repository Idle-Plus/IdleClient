import { IdleEvent } from "@idleclient/event/IdleEvent.ts";

export class GameEvents {

	public static readonly ConnectedPreEvent: IdleEvent = new IdleEvent();
	public static readonly ConnectedPostEvent: IdleEvent = new IdleEvent();

	public static readonly DisconnectEvent: IdleEvent = new IdleEvent();

}