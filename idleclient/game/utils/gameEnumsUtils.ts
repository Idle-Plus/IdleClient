import { GameMode, UpgradeType } from "@idleclient/network/NetworkData.ts";

export class UpgradeTypes {
	public static name(type: UpgradeType): string {
		return typeof type === "number" ? UpgradeType[type] : (type as string);
	}
}

export class GameModes {
	public static isIronman(mode: GameMode): boolean {
		return mode === GameMode.Ironman || mode === GameMode.GroupIronman;
	}
}