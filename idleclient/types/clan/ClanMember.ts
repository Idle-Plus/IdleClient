import { GameMode, GuildMember, GuildRank } from "@idleclient/network/NetworkData.ts";
import { ClanRank } from "@idleclient/types/clan/ClanRank.ts";

export class ClanMember {

	private readonly _name: string;
	private readonly _mode: GameMode;
	private _online: boolean;
	private _premium: boolean;
	private _gilded: boolean;

	private _server: string | null = null;
	private _rank: ClanRank;
	private _vaultAccess: boolean;

	private readonly _joinDate: Date;
	private _logoutTime: Date;

	constructor(name: string, mode: GameMode, online: boolean, premium: boolean, gilded: boolean, rank: GuildRank,
	            vaultAccess: boolean, joinDate: Date, logoutTime: Date) {
		this._name = name;
		this._mode = mode;
		this._online = online;
		this._premium = premium;
		this._gilded = gilded;
		this._rank = rank as any; // GuildRank and ClanRank have the same IDs.
		this._vaultAccess = vaultAccess;
		this._joinDate = joinDate;
		this._logoutTime = logoutTime;
	}


	get name(): string { return this._name; }
	get mode(): GameMode { return this._mode; }
	get online(): boolean { return this._online; }
	set online(value: boolean) { this._online = value; }
	get premium(): boolean { return this._premium; }
	get gilded(): boolean { return this._gilded; }

	get server(): string | null { return this._server; }
	set server(value: string) { this._server = value; }

	get rank(): ClanRank { return this._rank; }
	set rank(value: ClanRank) { this._rank = value; }
	get vaultAccess(): boolean { return this._vaultAccess; }
	set vaultAccess(value: boolean) { this._vaultAccess = value; }

	get joinDate(): Date { return this._joinDate; }
	get logoutTime(): Date { return this._logoutTime; }
	set logoutTime(value: Date) { this._logoutTime = value; }

	/*
	 * "Constructors"
	 */

	public static fromGuildMember(name: string, data: GuildMember) {
		const joinDate = data.JoinDate === null ? new Date() : new Date(data.JoinDate);
		const logoutTime = data.LogoutTime === null ? new Date() : new Date(data.LogoutTime);

		return new ClanMember(name, data.GameMode, data.IsOnline, data.IsPremium, data.IsPremiumPlus, data.Rank as any,
			data.HasVaultAccess, joinDate, logoutTime);
	}
}