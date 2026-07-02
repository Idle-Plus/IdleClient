import { ClanMember } from "@idleclient/types/clan/ClanMember.ts";
import {
	ClanCategory,
	ClearAllGuildApplicationsMessage,
	DailyGuildQuest,
	GameMode,
	GuildBulletinBoardInfoMessage,
	GuildMemberLoggedInMessage,
	GuildMemberLoggedOutMessage,
	GuildStateAdmin,
	GuildStateEconomy,
	GuildStateEvents,
	GuildStateHouse,
	GuildStateMembers,
	GuildStateMeta,
	GuildStateProgress,
	GuildStateQuests,
	GuildStateVault,
	GuildVaultMessage,
	Int,
	LoginDataMessage,
	PvmStatType,
	ReceiveGuildApplicationMessage,
	ReceiveGuildStateMessage,
	RequestClanPvmStatsMessage,
	Skill,
	UpgradeType
} from "@idleclient/network/NetworkData.ts";
import { ClanHouse, ClanHouseDatabase } from "@idleclient/game/data/ClanHouseDatabase.ts";
import { ItemId } from "@idleclient/types/gameTypes.ts";
import { ClanRank } from "@idleclient/types/clan/ClanRank.ts";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";

function assertDefined<T>(value: T | null | undefined, message: string): T {
	if (value === null || value === undefined) throw new Error(message);
	return value;
}

export class Clan {

	// Meta
	private readonly _mode: GameMode;
	private _name: string;
	private _tag: string | null;
	private _recruitmentMessage: string | null;
	private _creationDate: Date;
	private _earliestPossibleDeletionDate: Date | null;
	private _recentlyCreated: boolean;

	// Progress
	private _experience: Map<Skill, number>;

	// Members
	private _members: Map<string, ClanMember>;

	// Vault
	private _gold: Int;

	// House
	private _houseId: Int;

	// Economy
	private _purchasedVaultSlots: Int;
	private _credits: Int;
	private _accumulatedCredits: Int;
	private _invokingPlayerHasClaimableLoot: boolean;
	private _upgrades: Set<UpgradeType>;

	// Quests
	private _questsResetDate: Date;
	private _skillingQuests: DailyGuildQuest[];
	private _skillingContributors: string[];
	private _combatQuests: DailyGuildQuest[];
	private _combatContributors: string[];

	// Events
	private _serializedEvents: string | null;
	private _skillingTickets: Map<Skill, Int>;
	private _skillingPartyCompletions: Int = 0;

	// Admin
	private _recruiting: boolean;
	private _category: ClanCategory;
	private _language: string | null;
	private _minTotalLevel: Int;
	private _applications: ClanApplication[];

	// Dynamic properties, loaded when needed.

	private _vault: Map<ItemId, number> | null = null; // Dynamically loaded when needed.
	private _pvmStats: { stats: Map<PvmStatType, Int>, refreshed: Date } | null = null;
	private _bulletinBoard: { message: string, discordCode: string } | null = null;

	constructor(
		mode: GameMode,
		meta: GuildStateMeta,
		progress: GuildStateProgress,
		members: GuildStateMembers,
		vault: GuildStateVault,
		house: GuildStateHouse,
		economy: GuildStateEconomy,
		quests: GuildStateQuests,
		events: GuildStateEvents,
		admin: GuildStateAdmin | null
	) {
		// Meta
		this._mode = mode;
		this._name = assertDefined(meta.GuildName, "GuildName is null");
		this._tag = meta.Tag;
		this._recruitmentMessage = meta.RecruitmentMessage;
		this._creationDate = meta.CreationDate ? new Date(meta.CreationDate) : new Date();
		this._earliestPossibleDeletionDate = meta.EarliestPossibleDeletionDate ? new Date(meta.EarliestPossibleDeletionDate) : null;
		this._recentlyCreated = meta.RecentlyCreated ?? false;

		// Progress
		this._experience = new Map(Object.keys(progress.Experiences ?? {}).map(value => {
			const skill = Skill[value as keyof typeof Skill]
			if (skill === undefined) throw new Error(`Invalid skill ${value}`);
			return [ skill, (progress.Experiences ?? {})[value] ] as [ Skill, number ];
		}));

		// Members
		this._members = new Map((members.Members ?? [])
			.map((member, _) =>
				[member.Username, ClanMember.fromGuildMember(member)]));

		// Vault
		this._gold = vault.Gold ?? 0;

		// House
		this._houseId = house.GuildHouseId ?? -1;

		// Economy
		this._purchasedVaultSlots = economy.PurchasedVaultSlots ?? 0;
		this._credits = economy.ClanCredits ?? 0;
		this._accumulatedCredits = economy.AccumulatedCredits ?? 0;
		this._invokingPlayerHasClaimableLoot = economy.InvokingPlayerHasClaimableLoot ?? false;
		this._upgrades = new Set(economy.UnlockedUpgrades ?? []);

		// Quests
		this._questsResetDate = new Date(assertDefined(quests.NextQuestGenerationTimestamp, "NextQuestGenerationTimestamp is null"));
		this._skillingQuests = quests.DailySkillingQuests ?? [];
		this._skillingContributors = quests.SkillingContributors ?? [];
		this._combatQuests = quests.DailyCombatQuests ?? [];
		this._combatContributors = quests.CombatContributors ?? [];

		// Events
		this._serializedEvents = events.Serialized;
		this._skillingTickets = new Map(Object.keys(events.SkillingTickets ?? {}).map(value => {
			const skill = Skill[value as keyof typeof Skill];
			if (skill === undefined) throw new Error(`Invalid skill ${value}`);
			return [ skill, (events.SkillingTickets ?? {})[value] ] as [ Skill, number ];
		}));
		this._skillingPartyCompletions = events.SkillingPartyCompletions ?? 0;

		// Admin
		this._recruiting = admin?.IsRecruiting ?? true;
		this._category = admin?.Category ?? ClanCategory.None;
		this._language = admin?.PrimaryLanguage ?? null;
		this._minTotalLevel = admin?.MinimumTotalLevelRequired ?? 0;
		this._applications = admin?.ActiveGuildApplications
			?.map(v => ({name: v.ApplicantName, message: v.Message,
				level: v.TotalLevelAtTimeOfApplication})) ?? [];
	}

	// Meta
	get mode(): GameMode { return this._mode; }
	get name(): string { return this._name; }
	get tag(): string | null { return this._tag; }

	get members(): ReadonlyMap<string, ClanMember> { return this._members; }

	get credits(): Int { return this._credits; }
	get accumulatedCredits(): Int { return this._accumulatedCredits; }
	get invokingPlayerHasClaimableLoot(): boolean { return this._invokingPlayerHasClaimableLoot; }
	get gold(): Int { return this._gold; }
	get purchasedVaultSlots(): Int { return this._purchasedVaultSlots; }

	get skillingQuests(): ReadonlyArray<DailyGuildQuest> { return this._skillingQuests; }
	get skillingContributors(): ReadonlyArray<string> { return this._skillingContributors; }
	get combatQuests(): ReadonlyArray<DailyGuildQuest> { return this._combatQuests; }
	get combatContributors(): ReadonlyArray<string> { return this._combatContributors; }
	get questsResetDate(): Date { return this._questsResetDate; }

	get skills(): ReadonlyMap<Skill, number> | null { return this._experience; }
	get vault(): ReadonlyMap<ItemId, number> | null { return this._vault; }

	get upgrades(): Set<UpgradeType> { return this._upgrades; }
	get applications(): ReadonlyArray<ClanApplication> { return this._applications; }

	get skillingPartyCompletions(): Int { return this._skillingPartyCompletions; }
	get recruiting(): boolean { return this._recruiting; }
	get category(): ClanCategory { return this._category; }
	get language(): string | null { return this._language; }
	get minTotalLevel(): Int { return this._minTotalLevel; }

	get pvmStats(): { stats: Map<PvmStatType, Int>, refreshed: Date } | null { return this._pvmStats; }
	get bulletinBoard(): { message: string, discordCode: string } | null { return this._bulletinBoard; }
	set bulletinBoard(value: { message: string, discordCode: string } | null) { this._bulletinBoard = value; }

	public isIronmanClan(): boolean {
		return this.mode === GameMode.Ironman;
	}

	public getTotalLevel(): Int {
		let result = 0;
		for (const skill of SkillUtils.getSkills()) {
			result += SkillUtils.getLevelForExperience(this._experience?.get(skill) ?? 0);
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
		const purchasedVaultSpace = this.purchasedVaultSlots;
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
		return SkillUtils.getLevelForExperience(this._experience?.get(skill) ?? 0);
	}

	/*
	 * Packets
	 */

	public onReceiveGuildStateMessage(packet: ReceiveGuildStateMessage): boolean {
		let result = false;

		if (packet.Meta != null) {
			const meta = packet.Meta;
			if (meta.GuildName != null) this._name = meta.GuildName;
			if (meta.Tag != null) this._tag = meta.Tag;
			if (meta.RecruitmentMessage != null) this._recruitmentMessage = meta.RecruitmentMessage;
			if (meta.CreationDate != null) this._creationDate = new Date(meta.CreationDate);
			if (meta.EarliestPossibleDeletionDate != null) this._earliestPossibleDeletionDate = new Date(meta.EarliestPossibleDeletionDate);
			if (meta.RecentlyCreated != null) this._recentlyCreated = meta.RecentlyCreated;
			result = true;
		}

		if (packet.Progress != null) {
			const progress = packet.Progress;
			if (progress.Experiences != null) {
				const updatedExperience = new Map(Object.keys(progress.Experiences ?? {}).map(v => {
					const skill = Skill[v as keyof typeof Skill]
					if (skill === undefined) throw new Error(`Invalid skill ${v}`);
					return [ skill, (progress.Experiences ?? {})[v] ] as [ Skill, number ];
				}));
				// If this is a partial update, then only change the updated experience,
				// if not, replace the whole map.
				if (packet.IsPartialUpdate ?? false) {
					for (const [skill, experience] of updatedExperience) {
						this._experience?.set(skill, experience);
					}
				} else {
					this._experience = updatedExperience;
				}
			}
			result = true;
		}

		if (packet.Members != null) {
			const members = packet.Members;
			if (members.Members != null) {
				this._members = new Map((members.Members ?? [])
					.map((member, _) =>
						[member.Username, ClanMember.fromGuildMember(member)]));
			}
			result = true;
		}

		if (packet.Vault != null) {
			const vault = packet.Vault;
			if (vault.Gold != null) this._gold = vault.Gold;
			result = true;
		}

		if (packet.House != null) {
			const house = packet.House;
			if (house.GuildHouseId != null) this._houseId = house.GuildHouseId;
			result = true;
		}

		if (packet.Economy != null) {
			const economy = packet.Economy;
			if (economy.PurchasedVaultSlots != null) this._purchasedVaultSlots = economy.PurchasedVaultSlots;
			if (economy.ClanCredits != null) this._credits = economy.ClanCredits;
			if (economy.AccumulatedCredits != null) this._accumulatedCredits = economy.AccumulatedCredits;
			if (economy.InvokingPlayerHasClaimableLoot != null) this._invokingPlayerHasClaimableLoot = economy.InvokingPlayerHasClaimableLoot;
			if (economy.UnlockedUpgrades != null) this._upgrades = new Set(economy.UnlockedUpgrades);
			result = true;
		}

		if (packet.Quests != null) {
			const quests = packet.Quests;
			if (quests.NextQuestGenerationTimestamp != null) this._questsResetDate = new Date(quests.NextQuestGenerationTimestamp);
			if (quests.DailySkillingQuests != null) this._skillingQuests = quests.DailySkillingQuests;
			if (quests.DailyCombatQuests != null) this._combatQuests = quests.DailyCombatQuests;
			if (quests.SkillingContributors != null) this._skillingContributors = quests.SkillingContributors;
			if (quests.CombatContributors != null) this._combatContributors = quests.CombatContributors;
			result = true;
		}

		if (packet.Events != null) {
			const events = packet.Events;
			if (events.Serialized != null) this._serializedEvents = events.Serialized;
			if (events.SkillingTickets != null) {
				this._skillingTickets = new Map(Object.keys(events.SkillingTickets ?? {}).map(v => {
					const skill = Skill[v as keyof typeof Skill];
					if (skill === undefined) throw new Error(`Invalid skill ${v}`);
					return [ skill, (events.SkillingTickets ?? {})[v] ] as [ Skill, number ];
				}));
			}
			if (events.SkillingPartyCompletions != null) this._skillingPartyCompletions = events.SkillingPartyCompletions;
			result = true;
		}

		if (packet.Admin != null) {
			const admin = packet.Admin;
			if (admin.IsRecruiting != null) this._recruiting = admin.IsRecruiting;
			if (admin.Category != null) this._category = admin.Category;
			if (admin.PrimaryLanguage != null) this._language = admin.PrimaryLanguage;
			if (admin.MinimumTotalLevelRequired != null) this._minTotalLevel = admin.MinimumTotalLevelRequired;
			if (admin.ActiveGuildApplications != null) {
				this._applications = admin.ActiveGuildApplications
					?.map(v => ({name: v.ApplicantName, message: v.Message,
						level: v.TotalLevelAtTimeOfApplication})) ?? [];
			}
			result = true;
		}

		return result;
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

	public onGuildBulletinBoardInfoMessage(packet: GuildBulletinBoardInfoMessage) {
		this._bulletinBoard = {
			message: packet.Message ?? "",
			discordCode: packet.DiscordInvitationCode ?? ""
		};
	}

	public onClearAllGuildApplicationsMessage(packet: ClearAllGuildApplicationsMessage) {
		this._applications = [];
	}

	// General

	public onGuildMemberLoggedInMessage(packet: GuildMemberLoggedInMessage): boolean {
		const member = this._members.get(packet.GuildMemberName);
		if (member === undefined) return false;
		member.online = true;
		member.server = packet.ActiveServerId;
		return true;
	}

	public onGuildMemberLoggedOutMessage(packet: GuildMemberLoggedOutMessage): boolean {
		const member = this._members.get(packet.GuildMemberName);
		if (member === undefined) return false;
		member.online = false;
		member.server = null;
		member.logoutTime = new Date();
		return true;
	}

	// Applications

	public onReceiveGuildApplicationMessage(packet: ReceiveGuildApplicationMessage) {
		this._applications.push({
			name: packet.PlayerApplying,
			level: packet.PlayerTotalLevel,
			message: packet.Message
		});
	}

	/*
	 * "Constructors"
	 */

	public static fromPacket(mode: GameMode, data: ReceiveGuildStateMessage): Clan {
		const meta = assertDefined(data.Meta, "Meta is null");
		const progress = assertDefined(data.Progress, "Progress is null");
		const members = assertDefined(data.Members, "Members is null");
		const vault = assertDefined(data.Vault, "Vault is null");
		const house = assertDefined(data.House, "House is null");
		const economy = assertDefined(data.Economy, "Economy is null");
		const quests = assertDefined(data.Quests, "Quests is null");
		const events = assertDefined(data.Events, "Events is null");

		return new Clan(mode, meta, progress, members, vault, house, economy, quests, events, data.Admin);
	}
}

export interface ClanApplication {
	name: string,
	message: string,
	level: Int
}