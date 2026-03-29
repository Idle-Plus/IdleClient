// Automatically generated file, do not edit manually.

export abstract class Packet { abstract readonly MsgType: number; }

export type Long = number;
export type Int = number;
export type Short = number;
export type Byte = number;
export type Float = number;
export type Double = number;

/*
 * Data Types
 */

export interface ActiveExterminatingAssignment {
	AssigningExpertId: Int /* i32 */;
	KillsAcquired: Int /* i32 */;
	KillsRequired: Int /* i32 */;
	KillsToCompletion: Int /* i32 */;
	MonsterName: string | null;
}

export interface AfkRaidInfo {
	RaidType: RaidType;
	StartTimeUtc: string;
	WaveMilestoneRecord: WaveMilestoneRecord | null;
}

export interface CombatOfflineProgressNetwork {
	CombatEnded: boolean;
	ConsumedFood: { [key: Int /* i32 */]: Int /* i32 */ } | null;
	ExperiencesReceived: { [key: Byte /* i8 */]: Int /* i32 */ } | null;
	ExterminatingPointsReceived: Int /* i32 */;
	LevelsReceived: { [key: Byte /* i8 */]: Int /* i32 */ } | null;
	LostItems: { [key: Int /* i32 */]: Int /* i32 */ } | null;
	MonsterKillsByTaskId: { [key: Int /* i32 */]: Int /* i32 */ } | null;
	PlayerDied: boolean;
	ReceivedLoot: { [key: Int /* i32 */]: Int /* i32 */ } | null;
	TaskId: Byte /* i8 */;
	TimeOfDeathMilliseconds: Double /* f64 */;
	UsedAmmoAmount: Int /* i32 */;
}

export interface PetOfflineProgression {
	ExperienceReceived: Float /* f32 */;
	ItemsLost: { [key: Int /* i32 */]: Int /* i32 */ };
	ItemsReceived: { [key: Int /* i32 */]: Int /* i32 */ };
	NewLevel: Byte /* i8 */;
	OldLevel: Byte /* i8 */;
	Skill: Skill;
	TaskId: Int /* i32 */;
}

export interface PurchaseLimitScopeCountDto {
	Scope: PurchaseLimitScope;
	Used: Int /* i32 */;
}

export interface PvmBestRecord {
	BestTimeMs: Long /* i64 */;
	HighestWave: Int /* i32 */ | null;
	LastUpdatedUtc: string;
}

export interface ShopListingItem {
	Amount: Int /* i32 */;
	ItemId: Int /* i32 */;
	Price: Int /* i32 */;
}

export interface SkillingOfflineProgressNetwork {
	ElapsedMs: Int /* i32 */;
	ItemsLost: Array<Int /* i32 */> | null;
	ItemsLostAmounts: Array<Int /* i32 */> | null;
	OfflineExperiences: Array<Float /* f32 */> | null;
	OfflineProgressSkills: Array<Skill> | null;
	ReceivedItemAmounts: Array<Int /* i32 */> | null;
	ReceivedItemIds: Array<Int /* i32 */> | null;
	TaskIdToContinue: Byte /* i8 */;
	TaskTypeToContinue: TaskType;
}

export interface WaveMilestoneRecord {
	BestTimeMs: Long /* i64 */;
	LastUpdatedUtc: string;
	Wave: Int /* i32 */;
}

export enum HolidayEvent {
	None,
	Halloween,
	Christmas,
	Valentines,
	Birthday,
	Summer,
}

export enum ClanEventType {
	None,
	Gathering,
	Crafting,
	CombatBigExpDaily,
	CombatBigLootDaily,
	SkillingParty,
}

export interface DailyGuildQuest {
	AmountContributed: Int /* i32 */;
	EntityId: Int /* i32 */;
	FullAmountRequired: Int /* i32 */;
	IsCompleted: boolean;
	Type: TaskType;
}

export interface GuildApplicationData {
	ApplicantName: string;
	Message: string;
	TotalLevelAtTimeOfApplication: Int /* i32 */;
}

export interface GuildEventLobbyState {
	EventIsCurrentlyRunning: boolean;
	EventType: ClanEventType;
	MembersInParty: Byte /* i8 */;
}

export interface GuildInvitation {
	Date: string;
	GuildId: string | null;
	GuildName: string | null;
}

export interface GuildMember {
	DisplayName: string;
	GameMode: GameMode;
	HasVaultAccess: boolean;
	IsOnline: boolean;
	IsPremium: boolean;
	IsPremiumPlus: boolean;
	JoinDate: string | null;
	LogoutTime: string | null;
	Rank: GuildRank;
	ServerId: string | null;
}

export interface GuildMemberDto {
	ActiveServerId: string | null;
	GameMode: GameMode;
	HasVaultAccess: boolean;
	IsGilded: boolean;
	IsPremium: boolean;
	JoinDate: string;
	LogoutTime: string | null;
	Rank: GuildRank;
	Username: string;
}

export interface GuildStateAdmin {
	ActiveGuildApplications: Array<GuildApplicationData> | null;
	Category: ClanCategory | null;
	IsRecruiting: boolean | null;
	MinimumTotalLevelRequired: Int /* i32 */ | null;
	PrimaryLanguage: string | null;
}

export interface GuildStateChangeMessage {
	Args: Array<string>;
	LocalizationKey: string;
}

export interface GuildStateEconomy {
	AccumulatedCredits: Int /* i32 */ | null;
	ClanCredits: Int /* i32 */ | null;
	InvokingPlayerHasClaimableLoot: boolean | null;
	PurchasedVaultSlots: Int /* i32 */ | null;
	UnlockedUpgrades: Array<UpgradeType> | null;
}

export interface GuildStateEvents {
	Serialized: string | null;
	SkillingPartyCompletions: Int /* i32 */ | null;
	SkillingTickets: { [key: string /* Name of: Skill */]: Int /* i32 */ } | null;
}

export interface GuildStateHouse {
	GuildHouseId: Int /* i32 */ | null;
}

export interface GuildStateMembers {
	Members: Array<GuildMemberDto> | null;
}

export interface GuildStateMeta {
	CreationDate: string | null;
	EarliestPossibleDeletionDate: string | null;
	GuildName: string | null;
	RecentlyCreated: boolean | null;
	RecruitmentMessage: string | null;
	Tag: string | null;
}

export interface GuildStateProgress {
	Experiences: { [key: string /* Name of: Skill */]: Float /* f32 */ } | null;
}

export interface GuildStateQuests {
	CombatContributors: Array<string> | null;
	DailyCombatQuests: Array<DailyGuildQuest> | null;
	DailySkillingQuests: Array<DailyGuildQuest> | null;
	NextQuestGenerationTimestamp: string | null;
	SkillingContributors: Array<string> | null;
}

export interface GuildStateVault {
	Gold: Double /* f64 */ | null;
}

export interface ItemDelta {
	Amount: Int /* i32 */;
	ItemId: Int /* i32 */;
}

export interface PlayerActivity {
	ActivityIdentifierId: Int /* i32 */;
	StartTime: string | null;
	TaskType: Int /* i32 */;
	Type: PlayerActivityType;
}

export enum PlayerActivityType {
	Unknown,
	Idle,
	Task,
	ClanEvent,
	ClanBoss,
	Raid,
	AFKRaid,
	InLobby,
}

export interface QuestLoginObject {
	AvailableDailyQuestCount: Int /* i32 */;
	AvailableWeeklyQuestCount: Int /* i32 */;
	HasAvailableQuests: boolean;
}

export interface ExpDelta {
	Amount: Int /* i32 */;
	Skill: Skill;
}

export enum AttackStyle {
	None,
	Stab,
	Slash,
	Pound,
	Crush,
	Archery,
	Magic,
	RandomizeOnCombatStart,
	ApplyAll,
	Dragonfire,
}

export enum ClanBossModifierType {
	None,
	AttackSpeed,
	LootRolls,
}

export enum ClanCategory {
	None,
	Casual,
	Competitive,
	Hardcore,
}

export enum ClanEventBossType {
	None,
	OtherWorldlyGolem,
	SkeletonWarrior,
	MalignantSpider,
}

export enum EquipmentSlot {
	None,
	Boots,
	Jewellery,
	Gloves,
	Legs,
	Body,
	LeftHand,
	RightHand,
	Amulet,
	Ammunition,
	Cape,
	Head,
	BootsLeft,
	Bracelet,
	Belt,
	Pet,
	Earrings,
}

export enum ErrorType {
	None,
	AlreadyLoggedIn,
	OutdatedClient,
	ConfigMismatch,
	UpdateInProgress,
	InventoryMismatch,
	TooManyLogins,
	DailyLoginLimitReached,
	OtherPlayerOffline,
	OtherPlayerInventoryFull,
	UnknownError,
	NotWhiteListed,
	OtherPlayerIsBusy,
	InvitationExpired,
	GroupIsFull,
	CantDoThatWhileInRaid,
	CantSendItemToIronman,
	CantInviteIronmanToClan,
	CantInviteIronmanToParty,
	IronmenCantDoThis,
	CantJoinIronmanClan,
	EventIsCurrentlyRunning,
	NoGuildMembersAvailable,
	EventOnCooldown,
	DailyEventsAlreadyCompleted,
	CantJoinGuildEventBecauseOfGuildSwitch,
	NeedToLeaveGuildEventToDoThis,
	GenericSuccess,
	NotTester,
	PlayerCantReceiveItemsRightNow,
	LoadoutSaveSuccess,
	LoadoutIsEmpty,
	LoadoutAlreadyEquipped,
	InventoryTooFullToEquipLoadout,
	InventoryTooFull,
	LoadoutNameTaken,
	ClanVaultFull,
	ShopPurchaseFailed,
	ApplicationExpired,
	FeatureIsDisabled,
	GenericFailure,
	TooManyItemsSentToPlayer,
	PlayerHasTooManyItemsInRetrievalService,
	PlayerNotFound,
	OtherPlayerHasBlockedYou,
	ActionWouldPutPlayerAboveItemLimit,
	DailyExperienceCapReached,
	NameTaken,
	PlayerAlreadyBlocked,
	PlayerNotBlocked,
	OtherPlayerNeedsToBeRegistered,
	RequestFailedToProcess,
	PlayerAndGuildGameModeMismatch,
	InvalidServer,
	TagUpdateFailed,
	GenericCooldown,
}

export enum ExterminatingShopUnlockType {
	None,
	CancelTask,
	AutoComplete,
	AssignmentExtension,
	BloodmoonEquipment,
	ExterminatingSupplyCrate,
}

export enum FTUEStage {
	BeginTutorialStage,
	MiningStage,
	SmeltingStage,
	WoodcuttingStage,
	ArrowCraftingStage,
	PurchaseBowStage,
	EquipItemsStage,
	KillTurkeyStage,
	Completed,
}

export enum GameMode {
	NotSelected,
	Default,
	Ironman,
	GroupIronman,
}

export enum GuildActionResponse {
	guild_already_exists,
	guild_invalid_characters,
	guild_name_too_long,
	guild_name_too_short,
	guild_creation_requirements_not_met,
	invited_player_is_already_in_a_guild,
	other_player_is_offline,
	guild_is_full,
	application_already_active,
	application_has_expired,
	invitation_has_expired,
	guild_not_found,
	guild_application_sent,
	guild_invitation_sent,
	guild_not_recruiting,
	guild_gamemode_mismatch,
	guild_not_high_enough_rank,
	application_accepted,
}

export enum GuildRank {
	member,
	deputy,
	leader,
}

export enum ItemActivatableType {
	None,
	Premium,
	WeaponEffect,
	TreasureChest,
	Potion,
	BossHunter,
	Prestige,
	InventorySpaceToken,
	AutoLoadout,
	ClanVaultSpaceToken,
	BossPage,
	QuestingToken,
	ExterminatingToken,
	RaidAFKToken,
	ClanBossRareBoundDrop,
	ExterminatingSupplyCrate,
}

export enum ItemCategory {
	None,
	Weapons,
	Tools,
	Armours,
	Jewelry,
	MasteryCapes,
	SkillingOutfits,
	Food,
	Potions,
	Consumables,
	Gemstones,
	Keys,
	OresAndBars,
	LogsAndPlanks,
	SeedsAndHarvest,
	EnchantmentScrolls,
	Activatables,
	Miscellaneous,
	Pets,
}

export enum ItemEffectTriggerType {
	None,
	Lifesteal,
	DoubleLoot,
}

export enum MasteryCapeType {
	None,
	Completionist,
	Skilling,
	Combat,
}

export enum PlayerRewardType {
	None,
	BloodmoonRoll,
	BloodmoonHighRoller,
}

export enum PotionType {
	None,
	Swiftness,
	Negotiation,
	Resurrection,
	Forgery,
	GreatSight,
	Trickery,
	DarkMagic,
	PurePower,
	AncientKnowledge,
	DragonfirePotion,
}

export enum PurchaseLimitScope {
	None,
	ExterminatingCrate,
}

export enum PvmStatType {
	None,
	Griffin,
	Devil,
	Hades,
	Zeus,
	Medusa,
	Chimera,
	Kronos,
	ReckoningOfTheGods,
	GuardiansOfTheCitadel,
	MalignantSpider,
	SkeletonWarrior,
	OtherworldlyGolem,
	BloodmoonMassacre,
	Sobek,
	Mesines,
}

export enum RaidType {
	None,
	ReckoningOfTheGods,
	GuardiansOfTheCitadel,
	BloodmoonMassacre,
}

export enum Skill {
	None,
	Rigour,
	Strength,
	Defence,
	Archery,
	Magic,
	Health,
	Crafting,
	Woodcutting,
	Carpentry,
	Fishing,
	Cooking,
	Mining,
	Smithing,
	Foraging,
	Farming,
	Agility,
	Plundering,
	Enchanting,
	Brewing,
	Exterminating,
}

export enum TaskPotionInteraction {
	None,
	Trickery,
}

export enum TaskType {
	None,
	Woodcutting,
	Fishing,
	Mining,
	Carpentry,
	Smelting,
	Smithing,
	Combat,
	Cooking,
	Foraging,
	Farming,
	Crafting,
	Agility,
	Plundering,
	Enchanting,
	Brewing,
	Exterminating,
	ItemCreation,
}

export enum TaskUpgradeInteraction {
	None,
	UpgradeSaveCosts,
	UpgradeAutoCook,
	UpgradePlankGoldDecrease,
	UpgradeWoodcuttingExtraPlank,
	LampExtraCoal,
}

export enum UpgradeType {
	upgrade_housing,
	upgrade_bank_space,
	upgrade_woodcutting_boost,
	upgrade_fishing_boost,
	upgrade_automatic_eating,
	upgrade_automatic_looting,
	upgrade_offline_progression,
	upgrade_guild_quests,
	upgrade_farming,
	upgrade_foraging,
	upgrade_smelting_cost,
	upgrade_auto_cook,
	upgrade_plank_cost,
	upgrade_save_ammo,
	upgrade_combat_dodge,
	upgrade_combat_quest_boost,
	clan_upgrade_get_up,
	clan_upgrade_strength_in_numbers,
	clan_upgrade_bigger_bottles,
	clan_upgrade_group_effort,
	clan_upgrade_an_offer_they_cant_refuse,
	clan_upgrade_yoink,
	clan_upgrade_bullseye,
	clan_upgrade_gatherers,
	upgrade_teamwork,
	upgrade_boss_slayer,
	upgrade_toolbelt,
	upgrade_lazy_raider,
	upgrade_ancient_wisdom,
	upgrade_master_crafter,
	clan_upgrade_gatherer_event_completions,
	clan_upgrade_gatherer_event_cooldown,
	clan_upgrade_crafting_event_completions,
	clan_upgrade_crafting_event_cooldown,
	upgrade_loadouts,
	clan_upgrade_easy_events,
	upgrade_kronos_protection,
	clan_upgrade_turkey_chasers,
	clan_upgrade_line_the_turkeys_up,
	upgrade_auto_cook_meat_combat,
	upgrade_better_skinner,
	upgrade_upgraded_fisherman,
	upgrade_upgraded_lumberjack,
	upgrade_arrow_crafter,
	upgrade_delicate_manufacturing,
	upgrade_responsible_drinking,
	upgrade_last_negotiation,
	upgrade_kronos_item_boost,
	upgrade_picky_eater,
	upgrade_prestigious_woodworking,
	upgrade_getting_in_sync,
	clan_upgrade_auto_clan_boss,
	clan_upgrade_clan_boss_boost,
	upgrade_bounty_hunter,
	clan_upgrade_ways_of_the_genie,
	upgrade_bloodmoon_preparation,
	upgrade_bloodmoon_exterminator,
	upgrade_bloodmoon_fisherman,
	upgrade_bloodmoon_helmet_upgrade,
	upgrade_skilling_ticket_boost,
}

export enum WeaponClassType {
	None,
	Scimitar,
	Longsword,
	Club,
	BattleAxe,
	HeavyHammer,
	Bow,
	Crossbow,
	Staff,
	Spear,
}

export enum WeaponEffectType {
	None,
	Flaming,
	Ghostly,
	Void,
	Nature,
}

export enum WeaponType {
	None,
	Normal,
	Refined,
	Great,
	Elite,
	Superior,
	Outstanding,
	Godlike,
	Otherworldly,
}

/**
 * Confirmation that the active task has been cancelled, server to client only.
 */
export class ActiveTaskCancelledMessage extends Packet {
	public readonly MsgType: number = 192;
	public OriginServerId: string | null = null;
	constructor() { super(); }

	public static fromJson(json: any): ActiveTaskCancelledMessage {
		const _data_ = new ActiveTaskCancelledMessage();
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

/**
 * A task has been completed, server to client only.
 */
export class CompleteTaskMessage extends Packet {
	public readonly MsgType: number = 4;
	public OriginServerId: string | null = null;
	constructor(public TaskType: TaskType, public TaskId: Byte /* i8 */, public ItemChanges: Array<ItemDelta>, public ExpChanges: Array<ExpDelta>) { super(); }

	public static fromJson(json: any): CompleteTaskMessage {
		const _data_ = new CompleteTaskMessage(json.TaskType, json.TaskId, json.ItemChanges, json.ExpChanges);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class EquipItemMessage extends Packet {
	public readonly MsgType: number = 13;
	public OriginServerId: string | null = null;
	constructor(public ItemId: Int /* i32 */, public Amount: Int /* i32 */) { super(); }

	public static fromJson(json: any): EquipItemMessage {
		const _data_ = new EquipItemMessage(json.ItemId, json.Amount);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class ErrorMessage extends Packet {
	public readonly MsgType: number = 5;
	public OriginServerId: string | null = null;
	constructor(public Error: ErrorType, public LocKey: string | null) { super(); }

	public static fromJson(json: any): ErrorMessage {
		const _data_ = new ErrorMessage(json.Error, json.LocKey);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class InventoryItemSwapMessage extends Packet {
	public readonly MsgType: number = 69;
	public OriginServerId: string | null = null;
	constructor(public FromSlot: Int /* i32 */, public ToSlot: Int /* i32 */) { super(); }

	public static fromJson(json: any): InventoryItemSwapMessage {
		const _data_ = new InventoryItemSwapMessage(json.FromSlot, json.ToSlot);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class LoginDataMessage extends Packet {
	public readonly MsgType: number = 1;
	public OriginServerId: string | null = null;
	constructor(public Username: string | null, public SkillExperiencesJson: string | null, public InventoryJson: string | null, public Gold: Double /* f64 */, public EquipmentJson: string | null, public EquippedAmmunitionAmount: Int /* i32 */, public NewPlayer: boolean, public Health: Int /* i32 */, public IsVerified: boolean, public PremiumEndDate: string | null, public IsPremiumPlus: boolean, public UnlockedBossHunter: boolean, public UnlockedAutoLoadouts: boolean, public Upgrades: { [key: string /* Name of: UpgradeType */]: Int /* i32 */ } | null, public CombatStyle: Byte /* i8 */, public ArcheryCombatStyle: Byte /* i8 */, public MagicCombatStyle: Byte /* i8 */, public AutoEatPercentage: Byte /* i8 */, public UsedBossKey: Int /* i32 */, public KronosAttackStyleWeakness: AttackStyle, public TutorialStage: FTUEStage | null, public GameMode: GameMode | null, public ConfigVersion: Int /* i32 */, public GuildStateMessage: ReceiveGuildStateMessage | null, public GuildLobbyStates: Array<GuildEventLobbyState> | null, public OfflineTime: string, public SkillingOfflineProgress: SkillingOfflineProgressNetwork | null, public CombatOfflineProgress: CombatOfflineProgressNetwork | null, public ItemsSoldOffline: Array<ShopListingItem> | null, public SerializedPlayerToggleableSettings: string | null, public AdsWatchedToday: Byte /* i8 */, public LastAdWatchedTimestampTicks: Long /* i64 */, public AdBoostedSeconds: Int /* i32 */, public AdBoostPaused: boolean, public PurchasedInventorySlots: Int /* i32 */, public ClanVaultSpacePurchased: Int /* i32 */, public ActivePotionEffects: { [key: string /* Name of: PotionType */]: Int /* i32 */ } | null, public SerializedItemEnchantments: string | null, public GuildInvitations: Array<GuildInvitation> | null, public UseInventoryConsumables: boolean, public QuestLoginObject: QuestLoginObject, public QuesterUnlocked: boolean, public PetOfflineProgress: PetOfflineProgression | null, public ActivePetSkill: Skill | null, public PetTaskId: Byte /* i8 */, public ItemsInWithdrawalBox: boolean, public ExterminatingPoints: Int /* i32 */, public ActiveExterminatingAssignment: ActiveExterminatingAssignment | null, public ExterminatorUnlocked: boolean, public UnlockedExterminatingPurchases: Array<ExterminatingShopUnlockType> | null, public PlayerRewards: { [key: string /* Name of: PlayerRewardType */]: Int /* i32 */ } | null, public Stats: { [key: string /* Name of: PvmStatType */]: Int /* i32 */ }, public PvmBestTimes: { [key: string /* Name of: PvmStatType */]: PvmBestRecord } | null, public AfkRaidInfo: AfkRaidInfo | null, public UnlockedAFKRaids: Array<RaidType>, public PurchaseLimitCounts: Array<PurchaseLimitScopeCountDto>, public ServerId: string, public ActiveHolidayEvent: HolidayEvent, public IsInGuild: boolean) { super(); }

	public static fromJson(json: any): LoginDataMessage {
		const _data_ = new LoginDataMessage(json.Username, json.SkillExperiencesJson, json.InventoryJson, json.Gold, json.EquipmentJson, json.EquippedAmmunitionAmount, json.NewPlayer, json.Health, json.IsVerified, json.PremiumEndDate, json.IsPremiumPlus, json.UnlockedBossHunter, json.UnlockedAutoLoadouts, json.Upgrades, json.CombatStyle, json.ArcheryCombatStyle, json.MagicCombatStyle, json.AutoEatPercentage, json.UsedBossKey, json.KronosAttackStyleWeakness, json.TutorialStage, json.GameMode, json.ConfigVersion, json.GuildStateMessage, json.GuildLobbyStates, json.OfflineTime, json.SkillingOfflineProgress, json.CombatOfflineProgress, json.ItemsSoldOffline, json.SerializedPlayerToggleableSettings, json.AdsWatchedToday, json.LastAdWatchedTimestampTicks, json.AdBoostedSeconds, json.AdBoostPaused, json.PurchasedInventorySlots, json.ClanVaultSpacePurchased, json.ActivePotionEffects, json.SerializedItemEnchantments, json.GuildInvitations, json.UseInventoryConsumables, json.QuestLoginObject, json.QuesterUnlocked, json.PetOfflineProgress, json.ActivePetSkill, json.PetTaskId, json.ItemsInWithdrawalBox, json.ExterminatingPoints, json.ActiveExterminatingAssignment, json.ExterminatorUnlocked, json.UnlockedExterminatingPurchases, json.PlayerRewards, json.Stats, json.PvmBestTimes, json.AfkRaidInfo, json.UnlockedAFKRaids, json.PurchaseLimitCounts, json.ServerId, json.ActiveHolidayEvent, json.IsInGuild);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

/**
 * Start a task, client to server only.
 */
export class StartTaskMessage extends Packet {
	public readonly MsgType: number = 3;
	public OriginServerId: string | null = null;
	constructor(public TaskType: TaskType, public TaskId: Int /* i32 */, public UseInventoryConsumables: boolean) { super(); }

	public static fromJson(json: any): StartTaskMessage {
		const _data_ = new StartTaskMessage(json.TaskType, json.TaskId, json.UseInventoryConsumables);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

/**
 * Confirmation that the task has been started, server to client only.
 */
export class TaskStartedMessage extends Packet {
	public readonly MsgType: number = 191;
	public OriginServerId: string | null = null;
	constructor(public TaskType: TaskType, public TaskId: Int /* i32 */, public ElapsedMs: Int /* i32 */) { super(); }

	public static fromJson(json: any): TaskStartedMessage {
		const _data_ = new TaskStartedMessage(json.TaskType, json.TaskId, json.ElapsedMs);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class UnequipItemMessage extends Packet {
	public readonly MsgType: number = 14;
	public OriginServerId: string | null = null;
	constructor(public ItemId: Int /* i32 */) { super(); }

	public static fromJson(json: any): UnequipItemMessage {
		const _data_ = new UnequipItemMessage(json.ItemId);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class AbortGuildDeletionMessage extends Packet {
	public readonly MsgType: number = 266;
	public OriginServerId: string | null = null;
	constructor() { super(); }

	public static fromJson(json: any): AbortGuildDeletionMessage {
		const _data_ = new AbortGuildDeletionMessage();
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class AcceptGuildInviteMessage extends Packet {
	public readonly MsgType: number = 37;
	public OriginServerId: string | null = null;
	constructor(public GuildName: string) { super(); }

	public static fromJson(json: any): AcceptGuildInviteMessage {
		const _data_ = new AcceptGuildInviteMessage(json.GuildName);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class ClearAllGuildApplicationsMessage extends Packet {
	public readonly MsgType: number = 132;
	public OriginServerId: string | null = null;
	constructor() { super(); }

	public static fromJson(json: any): ClearAllGuildApplicationsMessage {
		const _data_ = new ClearAllGuildApplicationsMessage();
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class CreateGuildMessage extends Packet {
	public readonly MsgType: number = 32;
	public OriginServerId: string | null = null;
	constructor(public GuildName: string, public NextQuestGenerationTimestamp: string | null, public DailySkillingQuests: Array<DailyGuildQuest> | null, public DailyCombatQuests: Array<DailyGuildQuest> | null) { super(); }

	public static fromJson(json: any): CreateGuildMessage {
		const _data_ = new CreateGuildMessage(json.GuildName, json.NextQuestGenerationTimestamp, json.DailySkillingQuests, json.DailyCombatQuests);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class DeclineGuildInviteMessage extends Packet {
	public readonly MsgType: number = 56;
	public OriginServerId: string | null = null;
	constructor(public GuildName: string) { super(); }

	public static fromJson(json: any): DeclineGuildInviteMessage {
		const _data_ = new DeclineGuildInviteMessage(json.GuildName);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class DeleteGuildMessage extends Packet {
	public readonly MsgType: number = 47;
	public OriginServerId: string | null = null;
	constructor(public ViewingDeletionState: boolean) { super(); }

	public static fromJson(json: any): DeleteGuildMessage {
		const _data_ = new DeleteGuildMessage(json.ViewingDeletionState);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildBulletinBoardEditResponseMessage extends Packet {
	public readonly MsgType: number = 190;
	public OriginServerId: string | null = null;
	constructor(public Success: boolean) { super(); }

	public static fromJson(json: any): GuildBulletinBoardEditResponseMessage {
		const _data_ = new GuildBulletinBoardEditResponseMessage(json.Success);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildBulletinBoardInfoMessage extends Packet {
	public readonly MsgType: number = 189;
	public OriginServerId: string | null = null;
	constructor(public Message: string | null, public DiscordInvitationCode: string | null) { super(); }

	public static fromJson(json: any): GuildBulletinBoardInfoMessage {
		const _data_ = new GuildBulletinBoardInfoMessage(json.Message, json.DiscordInvitationCode);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildDeletedMessage extends Packet {
	public readonly MsgType: number = 49;
	public OriginServerId: string | null = null;
	constructor() { super(); }

	public static fromJson(json: any): GuildDeletedMessage {
		const _data_ = new GuildDeletedMessage();
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildDeletionResponseMessage extends Packet {
	public readonly MsgType: number = 265;
	public OriginServerId: string | null = null;
	constructor(public EarliestPossibleDeletionDate: string) { super(); }

	public static fromJson(json: any): GuildDeletionResponseMessage {
		const _data_ = new GuildDeletionResponseMessage(json.EarliestPossibleDeletionDate);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

/**
 * Sent by the server to a guild leader when they left the clan. Only the leaving
 * guild leader will receive the message, no one else.
 */
export class GuildLeaderLeftGuildMessage extends Packet {
	public readonly MsgType: number = 124;
	public OriginServerId: string | null = null;
	constructor(public NewLeader: string) { super(); }

	public static fromJson(json: any): GuildLeaderLeftGuildMessage {
		const _data_ = new GuildLeaderLeftGuildMessage(json.NewLeader);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildMemberLoggedInMessage extends Packet {
	public readonly MsgType: number = 42;
	public OriginServerId: string | null = null;
	constructor(public GuildMemberName: string, public ActiveServerId: string) { super(); }

	public static fromJson(json: any): GuildMemberLoggedInMessage {
		const _data_ = new GuildMemberLoggedInMessage(json.GuildMemberName, json.ActiveServerId);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildMemberLoggedOutMessage extends Packet {
	public readonly MsgType: number = 43;
	public OriginServerId: string | null = null;
	constructor(public GuildMemberName: string) { super(); }

	public static fromJson(json: any): GuildMemberLoggedOutMessage {
		const _data_ = new GuildMemberLoggedOutMessage(json.GuildMemberName);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildRequestRecruitmentMessageMessage extends Packet {
	public readonly MsgType: number = 217;
	public OriginServerId: string | null = null;
	constructor(public RecruitmentMessage: string | null) { super(); }

	public static fromJson(json: any): GuildRequestRecruitmentMessageMessage {
		const _data_ = new GuildRequestRecruitmentMessageMessage(json.RecruitmentMessage);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildRequestResultMessage extends Packet {
	public readonly MsgType: number = 41;
	public OriginServerId: string | null = null;
	constructor(public AssociatedPlayer: string | null, public MessageType: GuildActionResponse) { super(); }

	public static fromJson(json: any): GuildRequestResultMessage {
		const _data_ = new GuildRequestResultMessage(json.AssociatedPlayer, json.MessageType);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildUpdateMinimumTotalLevelRequirementMessage extends Packet {
	public readonly MsgType: number = 216;
	public OriginServerId: string | null = null;
	constructor(public MinimumTotalLevel: Int /* i32 */) { super(); }

	public static fromJson(json: any): GuildUpdateMinimumTotalLevelRequirementMessage {
		const _data_ = new GuildUpdateMinimumTotalLevelRequirementMessage(json.MinimumTotalLevel);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildUpdatePrimaryLanguageMessage extends Packet {
	public readonly MsgType: number = 214;
	public OriginServerId: string | null = null;
	constructor(public Language: string) { super(); }

	public static fromJson(json: any): GuildUpdatePrimaryLanguageMessage {
		const _data_ = new GuildUpdatePrimaryLanguageMessage(json.Language);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildUpdateRecruitmentMessageMessage extends Packet {
	public readonly MsgType: number = 215;
	public OriginServerId: string | null = null;
	constructor(public RecruitmentMessage: string) { super(); }

	public static fromJson(json: any): GuildUpdateRecruitmentMessageMessage {
		const _data_ = new GuildUpdateRecruitmentMessageMessage(json.RecruitmentMessage);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildUpdateRecruitmentStateMessage extends Packet {
	public readonly MsgType: number = 212;
	public OriginServerId: string | null = null;
	constructor(public Value: boolean) { super(); }

	public static fromJson(json: any): GuildUpdateRecruitmentStateMessage {
		const _data_ = new GuildUpdateRecruitmentStateMessage(json.Value);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildUpdateStatusMessage extends Packet {
	public readonly MsgType: number = 213;
	public OriginServerId: string | null = null;
	constructor(public Status: ClanCategory) { super(); }

	public static fromJson(json: any): GuildUpdateStatusMessage {
		const _data_ = new GuildUpdateStatusMessage(json.Status);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildUpdateTagMessage extends Packet {
	public readonly MsgType: number = 354;
	public OriginServerId: string | null = null;
	constructor(public Tag: string | null) { super(); }

	public static fromJson(json: any): GuildUpdateTagMessage {
		const _data_ = new GuildUpdateTagMessage(json.Tag);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class GuildVaultMessage extends Packet {
	public readonly MsgType: number = 219;
	public OriginServerId: string | null = null;
	constructor(public Vault: { [key: Int /* i32 */]: Int /* i32 */ }) { super(); }

	public static fromJson(json: any): GuildVaultMessage {
		const _data_ = new GuildVaultMessage(json.Vault);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class KickGuildMemberMessage extends Packet {
	public readonly MsgType: number = 50;
	public OriginServerId: string | null = null;
	constructor(public Username: string) { super(); }

	public static fromJson(json: any): KickGuildMemberMessage {
		const _data_ = new KickGuildMemberMessage(json.Username);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class LeaveGuildMessage extends Packet {
	public readonly MsgType: number = 46;
	public OriginServerId: string | null = null;
	constructor() { super(); }

	public static fromJson(json: any): LeaveGuildMessage {
		const _data_ = new LeaveGuildMessage();
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

/**
 * Sent by the server to a player that left or was kicked from the clan. Only the
 * player being removed will receive the message, no one else.
 */
export class PlayerLeftGuildMessage extends Packet {
	public readonly MsgType: number = 48;
	public OriginServerId: string | null = null;
	constructor(public PlayerName: string) { super(); }

	public static fromJson(json: any): PlayerLeftGuildMessage {
		const _data_ = new PlayerLeftGuildMessage(json.PlayerName);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class ReceiveGuildApplicationMessage extends Packet {
	public readonly MsgType: number = 34;
	public OriginServerId: string | null = null;
	constructor(public PlayerApplying: string, public Message: string, public PlayerTotalLevel: Int /* i32 */) { super(); }

	public static fromJson(json: any): ReceiveGuildApplicationMessage {
		const _data_ = new ReceiveGuildApplicationMessage(json.PlayerApplying, json.Message, json.PlayerTotalLevel);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class ReceiveGuildInviteMessage extends Packet {
	public readonly MsgType: number = 36;
	public OriginServerId: string | null = null;
	constructor(public PlayerInviting: string, public GuildName: string) { super(); }

	public static fromJson(json: any): ReceiveGuildInviteMessage {
		const _data_ = new ReceiveGuildInviteMessage(json.PlayerInviting, json.GuildName);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class ReceiveGuildStateMessage extends Packet {
	public readonly MsgType: number = 60;
	public OriginServerId: string | null = null;
	constructor(public IsPartialUpdate: boolean, public Meta: GuildStateMeta | null, public Progress: GuildStateProgress | null, public Members: GuildStateMembers | null, public Vault: GuildStateVault | null, public House: GuildStateHouse | null, public Economy: GuildStateEconomy | null, public Quests: GuildStateQuests | null, public Events: GuildStateEvents | null, public Message: GuildStateChangeMessage | null, public Admin: GuildStateAdmin | null) { super(); }

	public static fromJson(json: any): ReceiveGuildStateMessage {
		const _data_ = new ReceiveGuildStateMessage(json.IsPartialUpdate, json.Meta, json.Progress, json.Members, json.Vault, json.House, json.Economy, json.Quests, json.Events, json.Message, json.Admin);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

/**
 * <->
 */
export class RequestClanBossInfoMessage extends Packet {
	public readonly MsgType: number = 337;
	public OriginServerId: string | null = null;
	constructor(public BossType: ClanEventBossType, public Stats: { [key: string /* Name of: PvmStatType */]: Int /* i32 */ } | null, public PlayersInFight: Byte /* i8 */ | null, public ActiveModifiers: { [key: string /* Name of: ClanBossModifierType */]: Int /* i32 */ } | null) { super(); }

	public static fromJson(json: any): RequestClanBossInfoMessage {
		const _data_ = new RequestClanBossInfoMessage(json.BossType, json.Stats, json.PlayersInFight, json.ActiveModifiers);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class RequestClanPvmStatsMessage extends Packet {
	public readonly MsgType: number = 323;
	public OriginServerId: string | null = null;
	constructor(public Stats: { [key: string /* Name of: PvmStatType */]: Int /* i32 */ } | null) { super(); }

	public static fromJson(json: any): RequestClanPvmStatsMessage {
		const _data_ = new RequestClanPvmStatsMessage(json.Stats);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class RequestGuildBulletinInfoMessage extends Packet {
	public readonly MsgType: number = 188;
	public OriginServerId: string | null = null;
	constructor() { super(); }

	public static fromJson(json: any): RequestGuildBulletinInfoMessage {
		const _data_ = new RequestGuildBulletinInfoMessage();
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class RequestGuildPageInfoMessage extends Packet {
	public readonly MsgType: number = 59;
	public OriginServerId: string | null = null;
	constructor(public PvmStats: { [key: string /* Name of: PvmStatType */]: Int /* i32 */ } | null, public ClanMemberActivities: { [key: string]: PlayerActivity } | null) { super(); }

	public static fromJson(json: any): RequestGuildPageInfoMessage {
		const _data_ = new RequestGuildPageInfoMessage(json.PvmStats, json.ClanMemberActivities);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class RequestGuildVaultMessage extends Packet {
	public readonly MsgType: number = 218;
	public OriginServerId: string | null = null;
	constructor() { super(); }

	public static fromJson(json: any): RequestGuildVaultMessage {
		const _data_ = new RequestGuildVaultMessage();
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class SendGuildApplicationMessage extends Packet {
	public readonly MsgType: number = 33;
	public OriginServerId: string | null = null;
	constructor(public GuildName: string, public Message: string) { super(); }

	public static fromJson(json: any): SendGuildApplicationMessage {
		const _data_ = new SendGuildApplicationMessage(json.GuildName, json.Message);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class SendGuildInviteMessage extends Packet {
	public readonly MsgType: number = 35;
	public OriginServerId: string | null = null;
	constructor(public PlayerReceivingInvite: string) { super(); }

	public static fromJson(json: any): SendGuildInviteMessage {
		const _data_ = new SendGuildInviteMessage(json.PlayerReceivingInvite);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

export class SellItemMessage extends Packet {
	public readonly MsgType: number = 6;
	public OriginServerId: string | null = null;
	constructor(public ItemId: Int /* i32 */, public ItemAmount: Int /* i32 */) { super(); }

	public static fromJson(json: any): SellItemMessage {
		const _data_ = new SellItemMessage(json.ItemId, json.ItemAmount);
		_data_.OriginServerId = json.OriginServerId;
		return _data_;
	}
}

/*
 * Packet Registry
 * Mapping packet IDs to their respective classes.
 */

const PacketRegistry: any = {
	192: ActiveTaskCancelledMessage,
	4: CompleteTaskMessage,
	13: EquipItemMessage,
	5: ErrorMessage,
	69: InventoryItemSwapMessage,
	1: LoginDataMessage,
	3: StartTaskMessage,
	191: TaskStartedMessage,
	14: UnequipItemMessage,
	266: AbortGuildDeletionMessage,
	37: AcceptGuildInviteMessage,
	132: ClearAllGuildApplicationsMessage,
	32: CreateGuildMessage,
	56: DeclineGuildInviteMessage,
	47: DeleteGuildMessage,
	190: GuildBulletinBoardEditResponseMessage,
	189: GuildBulletinBoardInfoMessage,
	49: GuildDeletedMessage,
	265: GuildDeletionResponseMessage,
	124: GuildLeaderLeftGuildMessage,
	42: GuildMemberLoggedInMessage,
	43: GuildMemberLoggedOutMessage,
	217: GuildRequestRecruitmentMessageMessage,
	41: GuildRequestResultMessage,
	216: GuildUpdateMinimumTotalLevelRequirementMessage,
	214: GuildUpdatePrimaryLanguageMessage,
	215: GuildUpdateRecruitmentMessageMessage,
	212: GuildUpdateRecruitmentStateMessage,
	213: GuildUpdateStatusMessage,
	354: GuildUpdateTagMessage,
	219: GuildVaultMessage,
	50: KickGuildMemberMessage,
	46: LeaveGuildMessage,
	48: PlayerLeftGuildMessage,
	34: ReceiveGuildApplicationMessage,
	36: ReceiveGuildInviteMessage,
	60: ReceiveGuildStateMessage,
	337: RequestClanBossInfoMessage,
	323: RequestClanPvmStatsMessage,
	188: RequestGuildBulletinInfoMessage,
	59: RequestGuildPageInfoMessage,
	218: RequestGuildVaultMessage,
	33: SendGuildApplicationMessage,
	35: SendGuildInviteMessage,
	6: SellItemMessage,
};

/*
 * Packet Type
 * Enum with all the available packets the client can send.
 */

export enum PacketType {
	ActiveTaskCancelledMessage = 192,
	CompleteTaskMessage = 4,
	EquipItemMessage = 13,
	ErrorMessage = 5,
	InventoryItemSwapMessage = 69,
	LoginDataMessage = 1,
	StartTaskMessage = 3,
	TaskStartedMessage = 191,
	UnequipItemMessage = 14,
	AbortGuildDeletionMessage = 266,
	AcceptGuildInviteMessage = 37,
	ClearAllGuildApplicationsMessage = 132,
	CreateGuildMessage = 32,
	DeclineGuildInviteMessage = 56,
	DeleteGuildMessage = 47,
	GuildBulletinBoardEditResponseMessage = 190,
	GuildBulletinBoardInfoMessage = 189,
	GuildDeletedMessage = 49,
	GuildDeletionResponseMessage = 265,
	GuildLeaderLeftGuildMessage = 124,
	GuildMemberLoggedInMessage = 42,
	GuildMemberLoggedOutMessage = 43,
	GuildRequestRecruitmentMessageMessage = 217,
	GuildRequestResultMessage = 41,
	GuildUpdateMinimumTotalLevelRequirementMessage = 216,
	GuildUpdatePrimaryLanguageMessage = 214,
	GuildUpdateRecruitmentMessageMessage = 215,
	GuildUpdateRecruitmentStateMessage = 212,
	GuildUpdateStatusMessage = 213,
	GuildUpdateTagMessage = 354,
	GuildVaultMessage = 219,
	KickGuildMemberMessage = 50,
	LeaveGuildMessage = 46,
	PlayerLeftGuildMessage = 48,
	ReceiveGuildApplicationMessage = 34,
	ReceiveGuildInviteMessage = 36,
	ReceiveGuildStateMessage = 60,
	RequestClanBossInfoMessage = 337,
	RequestClanPvmStatsMessage = 323,
	RequestGuildBulletinInfoMessage = 188,
	RequestGuildPageInfoMessage = 59,
	RequestGuildVaultMessage = 218,
	SendGuildApplicationMessage = 33,
	SendGuildInviteMessage = 35,
	SellItemMessage = 6,
}

export function deserialize(json: any): Packet | null {
	try {
		const packetType = PacketRegistry[json.MsgType];
		if (!packetType) return null;

		return packetType.fromJson(json);
	} catch (e) {
		console.error("Failed to deserialize packet:", e);
		return null;
	}
}
