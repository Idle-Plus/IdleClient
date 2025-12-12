import { ClanMember } from "@idleclient/types/clan/ClanMember.ts";
import {
	ClanCategory,
	ClearAllGuildApplicationsMessage,
	CreateGuildMessage,
	DailyGuildQuest,
	GameMode,
	GuildLeaderLeftGuildMessage,
	GuildMemberKickedMessage, GuildMemberLoggedInMessage, GuildMemberLoggedOutMessage,
	GuildRank,
	GuildUpdateMinimumTotalLevelRequirementMessage,
	GuildUpdatePrimaryLanguageMessage,
	GuildUpdateRecruitmentMessageMessage,
	GuildUpdateRecruitmentStateMessage,
	GuildUpdateStatusMessage,
	GuildUpdateTagMessage,
	GuildVaultMessage,
	Int,
	LoginDataMessage,
	PlayerJoinedGuildMessage,
	PlayerLeftGuildMessage,
	PvmStatType,
	ReceiveGuildApplicationMessage,
	ReceiveGuildStateMessage,
	RequestClanPvmStatsMessage,
	Skill,
	UpgradeType
} from "@idleclient/network/NetworkData.ts";
import { ClanHouse, ClanHouseDatabase } from "@idleclient/game/data/ClanHouseDatabase.ts";
import { ItemId } from "@idleclient/types/gameTypes.ts";
import { ManagerContext } from "@context/GameContext.tsx";
import { ClanRank } from "@idleclient/types/clan/ClanRank.ts";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";

export class Clan {

	private readonly _mode: GameMode;
	private readonly _name: string;
	private readonly _members: Map<string, ClanMember> = new Map();

	private _credits: Int;
	private _gold: Int;
	private _purchasedVaultSpace: Int;

	private _skillingQuests: DailyGuildQuest[];
	private _skillingContributors: string[];
	private _combatQuests: DailyGuildQuest[];
	private _combatContributors: string[];
	private _questsResetDate: Date;

	private _houseId: Int;
	private _upgrades: Set<UpgradeType>;
	private _applications: ClanApplication[];

	//

	private _skills: Map<Skill, number> | null = null;
	private _vault: Map<ItemId, number> | null = null; // TODO: Implement

	private _eventStates: string | null = null;
	private _skillingTickets: Map<Skill, Int> = new Map();
	private _skillingPartyCompletions: Int = 0;
	private _recruiting: boolean = false;
	private _category: ClanCategory = ClanCategory.None;
	private _language: string | null = null;
	private _minTotalLevel: Int = 0;
	private _tag: string | null = null;

	private _pvmStats: { stats: Map<PvmStatType, Int>, refreshed: Date } | null = null;

	constructor(mode: GameMode, name: string, members: Map<string, ClanMember>, credits: Int, gold: Int, purchasedVaultSpace: Int,
	            skillingQuests: DailyGuildQuest[], skillingContributors: string[], combatQuests: DailyGuildQuest[],
	            combatContributors: string[], questResetDate: Date, houseId: Int, upgrades: Set<UpgradeType>,
	            applications: ClanApplication[]) {

		this._mode = mode;
		this._name = name;
		this._members = members;

		this._credits = credits;
		this._gold = gold;
		this._purchasedVaultSpace = purchasedVaultSpace;

		this._skillingQuests = skillingQuests;
		this._skillingContributors = skillingContributors;
		this._combatQuests = combatQuests;
		this._combatContributors = combatContributors;
		this._questsResetDate = questResetDate;

		this._houseId = houseId;
		this._upgrades = upgrades;
		this._applications = applications;
	}

	get mode(): GameMode { return this._mode; }
	get name(): string { return this._name; }
	get members(): ReadonlyMap<string, ClanMember> { return this._members; }

	get credits(): Int { return this._credits; }
	get gold(): Int { return this._gold; }
	get purchasedVaultSpace(): Int { return this._purchasedVaultSpace; }

	get skillingQuests(): ReadonlyArray<DailyGuildQuest> { return this._skillingQuests; }
	get skillingContributors(): ReadonlyArray<string> { return this._skillingContributors; }
	get combatQuests(): ReadonlyArray<DailyGuildQuest> { return this._combatQuests; }
	get combatContributors(): ReadonlyArray<string> { return this._combatContributors; }
	get questsResetDate(): Date { return this._questsResetDate; }

	get skills(): ReadonlyMap<Skill, number> | null { return this._skills; }
	get vault(): ReadonlyMap<ItemId, number> | null { return this._vault; }

	get upgrades(): Set<UpgradeType> { return this._upgrades; }
	get applications(): ReadonlyArray<ClanApplication> { return this._applications; }

	get skillingPartyCompletions(): Int { return this._skillingPartyCompletions; }
	get recruiting(): boolean { return this._recruiting; }
	get category(): ClanCategory { return this._category; }
	get language(): string | null { return this._language; }
	get minTotalLevel(): Int { return this._minTotalLevel; }
	get tag(): string | null { return this._tag; }

	get pvmStats(): { stats: Map<PvmStatType, Int>, refreshed: Date } | null { return this._pvmStats; }

	public isIronmanClan(): boolean {
		return this.mode === GameMode.Ironman;
	}

	public getTotalLevel(): Int {
		let result = 0;
		for (const skill of SkillUtils.getSkills()) {
			result += SkillUtils.getLevelForExperience(this._skills?.get(skill) ?? 0);
		}
		return result;
	}

	public getHouse(): ClanHouse | null {
		if (this._houseId < 0) return null;
		return ClanHouseDatabase.getHouse(this._houseId) ?? null;
	}

	public hasUpgrade(type: UpgradeType): boolean {
		return this._upgrades.has(type);
	}

	public getLeader(): ClanMember {
		const members = Array.from(this._members.values());
		return members.find(member => member.rank === ClanRank.LEADER) ?? members[0];
	}

	public getTotalVaultSpace(): Int {
		const purchasedVaultSpace = this.purchasedVaultSpace;
		const houseVaultSpace = this.getHouse()?.inventorySpace ?? 0;
		const baseVaultSpace = SettingsDatabase.shared().baseClanVaultSpace;
		return purchasedVaultSpace + houseVaultSpace + baseVaultSpace;
	}

	public getUsedVaultSpace(): Int {
		return this.vault?.size ?? 0;
	}

	public hasVaultItem(itemId: ItemId, count: Int = 1): boolean {
		return (this.vault?.get(itemId) ?? 0) >= count;
	}

	public getSkillLevel(skill: Skill): Int {
		return SkillUtils.getLevelForExperience(this._skills?.get(skill) ?? 0);
	}

	/*
	 * Packets
	 */

	public onReceiveGuildStateMessage(packet: ReceiveGuildStateMessage) {
		const skillExperiences = packet.SkillExperiences ?? {};
		this._skills = new Map(Object.keys(skillExperiences).map(value => {
			const skill = Skill[value as keyof typeof Skill]
			if (skill === undefined) throw new Error(`Invalid skill ${value}`);
			return [ skill, skillExperiences[value] ] as [ Skill, number ];
		}));

		// Inventory isn't included.

		this._eventStates = packet.EventStates;

		const skillingTickets = packet.SkillingTickets ?? {};
		this._skillingTickets = new Map(Object.keys(skillingTickets).map(value => {
			const skill = Skill[value as keyof typeof Skill]
			if (skill === undefined) throw new Error(`Invalid skill ${value}`);
			return [ skill, skillingTickets[value] ] as [ Skill, number ];
		}))

		this._skillingPartyCompletions = packet.SkillingPartyCompletions;
		this._recruiting = packet.IsRecruiting;
		this._category = packet.Status;
		this._language = packet.PrimaryLanguage;
		this._minTotalLevel = packet.MinimumTotalLevelRequired;
		this._tag = packet.Tag;
	}

	public onGuildVaultMessage(packet: GuildVaultMessage) {
		this._vault = new Map(Object.entries(packet.Vault)
			.map(([itemId, amount]) => [Number(itemId) as ItemId, amount]));
	}

	public onRequestClanPvmStatsMessage(packet: RequestClanPvmStatsMessage) {
		const stats = packet.Stats;
		if (stats === null) throw new Error("Stats is null while handling RequestClanPvmStats.");

		this._pvmStats = {
			stats: new Map(Object.entries(stats)
				.map(([stat, value]) => [PvmStatType[stat as keyof typeof PvmStatType], value])),
			refreshed: new Date()
		};
	}

	public onGuildLeaderLeftGuildMessage(packet: GuildLeaderLeftGuildMessage) {
		this._members.delete(this.getLeader().name);
		const member = Array.from(this._members.values())
			.find(value => value.name === packet.NewLeader);

		if (member === undefined)
			throw new Error(`New leader ${packet.NewLeader} not found in clan ${this.name}.`);

		member.rank = ClanRank.LEADER;
	}

	public onGuildMemberKickedMessage(packet: GuildMemberKickedMessage) {
		this._members.delete(packet.PlayerName);
	}

	public onPlayerJoinedGuildMessage(mode: GameMode, packet: PlayerJoinedGuildMessage) {
		const clanMember = new ClanMember(packet.PlayerJoining, mode, packet.IsOnline, packet.IsPremium,
			packet.IsPremiumPlus, GuildRank.member, false, new Date(), packet.LogOutTime === null ?
				new Date() : new Date(packet.LogOutTime));
		this._members.set(packet.PlayerJoining, clanMember);
	}

	public onPlayerLeftGuildMessage(packet: PlayerLeftGuildMessage) {
		this._members.delete(packet.PlayerName);
	}

	public onClearAllGuildApplicationsMessage(packet: ClearAllGuildApplicationsMessage) {
		this._applications = [];
	}

	// General

	public onGuildMemberLoggedInMessage(packet: GuildMemberLoggedInMessage) {
		const member = this._members.get(packet.GuildMemberName);
		if (member === undefined) return;
		member.online = true;
	}

	public onGuildMemberLoggedOutMessage(packet: GuildMemberLoggedOutMessage) {
		const member = this._members.get(packet.GuildMemberName);
		if (member === undefined) return;
		member.online = false;
		member.logoutTime = new Date();
	}

	// Applications

	public onReceiveGuildApplicationMessage(packet: ReceiveGuildApplicationMessage) {
		this._applications.push({
			name: packet.PlayerApplying,
			level: packet.PlayerTotalLevel,
			message: packet.Message
		});
	}

	// Recruitment

	public onGuildUpdateRecruitmentStateMessage(packet: GuildUpdateRecruitmentStateMessage) {
		this._recruiting = packet.Value;
	}

	public onGuildUpdateStatusMessage(packet: GuildUpdateStatusMessage) {
		this._category = packet.Status;
	}

	public onGuildUpdatePrimaryLanguageMessage(packet: GuildUpdatePrimaryLanguageMessage) {
		this._language = packet.Language;
	}

	public onGuildUpdateRecruitmentMessageMessage(packet: GuildUpdateRecruitmentMessageMessage) {
		// TODO: Store the recruitment message?
	}

	public onGuildUpdateMinimumTotalLevelRequirementMessage(packet: GuildUpdateMinimumTotalLevelRequirementMessage) {
		this._minTotalLevel = packet.MinimumTotalLevel;
	}

	public onGuildUpdateTagMessage(packet: GuildUpdateTagMessage) {
		this._tag = packet.Tag;
	}

	/*
	 * "Constructors"
	 */

	public static fromLoginPacket(data: LoginDataMessage): Clan {
		const mode = data.GameMode ?? GameMode.NotSelected;
		const name = data.GuildName ?? "?null?";
		const members = new Map(Object.entries(data.Members || {})
			.map(([name, member], _) =>
				[name, ClanMember.fromGuildMember(name, member)]));

		// TODO: Temp for testing.
		/*if (members.size < 20) {
			const toFill = 10 - members.size;
			for (let i = 0; i < toFill; i++) {
				members.set(`test${i}`, new ClanMember(`test${i}`, GameMode.Default, Math.random() > 0.55,
					Math.random() > 0.75, Math.random() > 0.85, Math.random() < 0.75 ? GuildRank.member : GuildRank.deputy,
					false, new Date(), new Date()));
			}
		}*/

		const credits = data.ClanCredits ?? 0;
		const gold = data.VaultGold ?? 0;
		const vaultSpace = data.ClanVaultSpacePurchased;

		const skillingQuests = data.DailySkillingQuests ?? [];
		const skillingContributors = data.SkillingContributors ?? [];
		const combatQuests = data.DailyCombatQuests ?? [];
		const combatContributors = data.CombatContributors ?? [];
		const questsResetDate = data.NextQuestGenerationTimestamp !== null ?
			new Date(data.NextQuestGenerationTimestamp) : new Date();

		const houseId = data.GuildHouseId ?? -1;
		const upgrades = new Set(data.UnlockedUpgrades ?? []);
		const applications = data.ActiveGuildApplications
			?.map(v => ({ name: v.ApplicantName, message: v.Message,
				level: v.TotalLevelAtTimeOfApplication })) ?? [];

		return new Clan(mode, name, members, credits, gold, vaultSpace, skillingQuests, skillingContributors, combatQuests,
			combatContributors, questsResetDate, houseId, upgrades, applications);
	}

	public static fromJoinPacket(data: PlayerJoinedGuildMessage): Clan {
		if (data.GuildName === null) throw new Error("PlayerJoinedGuildMessage doesn't contain clan name.");

		const name = data.GuildName;
		const members = new Map(Object.entries(data.Members || {})
			.map(([name, member], _) =>
				[name, ClanMember.fromGuildMember(name, member)]));
		// Get the mode from the first member.
		const mode = members.entries().next().value?.[1]?.mode ?? GameMode.NotSelected;


		const credits = data.Credits ?? 0;
		const gold = data.Gold ?? 0;
		const vaultSpace = data.ClanVaultSpacePurchased;

		const skillingQuests = data.DailySkillingQuests ?? [];
		const skillingContributors = data.SkillingContributors ?? [];
		const combatQuests = data.DailyCombatQuests ?? [];
		const combatContributors = data.CombatContributors ?? [];
		const questsResetDate = data.NextQuestGenerationTimestamp !== null ?
			new Date(data.NextQuestGenerationTimestamp) : new Date();

		const houseId = data.OwnedHouseId ?? -1;
		const upgrades = new Set(data.UnlockedUpgrades ?? []);
		// NOTE: Applications aren't sent when you join a clan, meaning if you join a clan that
		//       has an application, get promoted, then you won't be able to see any applications
		//       until you relog.
		const applications: ClanApplication[] = [];

		return new Clan(mode, name, members, credits, gold, vaultSpace, skillingQuests, skillingContributors, combatQuests,
			combatContributors, questsResetDate, houseId, upgrades, applications);
	}

	public static fromCreatePacket(context: ManagerContext, data: CreateGuildMessage): Clan {
		const playerManager = context.playerManager!;

		const mode = playerManager.mode.content();
		const name = data.GuildName;
		const members = new Map([[playerManager.username.content(), new ClanMember(
			playerManager.username.content(), playerManager.mode.content(), true,
			playerManager.premium.content(), playerManager.gilded.content(), GuildRank.leader,
			true, new Date(), new Date()
		)]]);

		const credits = 0;
		const gold = 0;
		const vaultSpace = 0;

		const skillingQuests = data.DailySkillingQuests ?? [];
		const skillingContributors: string[] = [];
		const combatQuests = data.DailyCombatQuests ?? [];
		const combatContributors: string[] = [];
		const questsResetDate = data.NextQuestGenerationTimestamp !== null ?
			new Date(data.NextQuestGenerationTimestamp) : new Date();

		const houseId = -1;
		const upgrades: Set<UpgradeType> = new Set();
		const applications: ClanApplication[] = [];

		return new Clan(mode, name, members, credits, gold, vaultSpace, skillingQuests, skillingContributors, combatQuests,
			combatContributors, questsResetDate, houseId, upgrades, applications);
	}
}

export interface ClanApplication {
	name: string,
	message: string,
	level: Int
}