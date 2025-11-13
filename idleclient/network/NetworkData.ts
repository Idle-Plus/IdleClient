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
	MonsterKillsByTaskId: { [key: Int /* i32 */]: Int /* i32 */ } | null;
	PlayerDied: boolean;
	ReceivedLoot: { [key: Int /* i32 */]: Int /* i32 */ } | null;
	TaskId: Byte /* i8 */;
	TimeOfDeathMilliseconds: Double /* f64 */;
	UsedAmmoAmount: Int /* i32 */;
}

export interface DailyGuildQuest {
	AmountContributed: Int /* i32 */;
	EntityId: Int /* i32 */;
	FullAmountRequired: Int /* i32 */;
	IsCompleted: boolean;
	Type: Int /* i32 */;
}

export interface GuildApplicationForLogin {
	ApplicantName: string;
	Message: string;
	TotalLevelAtTimeOfApplication: Int /* i32 */;
}

export interface GuildInvitation {
	Date: string;
	GuildId: string | null;
	GuildName: string | null;
}

export interface GuildMember {
	GameMode: GameMode;
	HasVaultAccess: boolean;
	IsOnline: boolean;
	IsPremium: boolean;
	IsPremiumPlus: boolean;
	JoinDate: string | null;
	LogoutTime: string | null;
	Rank: GuildRank;
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
	constructor() { super(); }

	public static fromJson(json: any): ActiveTaskCancelledMessage {
		return new ActiveTaskCancelledMessage();
	}
}

/**
 * A task has been completed, server to client only.
 */
export class CompleteTaskMessage extends Packet {
	public readonly MsgType: number = 4;
	constructor(public TaskType: TaskType, public TaskId: Byte /* i8 */, public ItemAmount: Int /* i32 */, public UpgradeInteraction: Byte /* i8 */, public PotionInteraction: Byte /* i8 */, public UsedConsumableItemId: Int /* i32 */) { super(); }

	public static fromJson(json: any): CompleteTaskMessage {
		return new CompleteTaskMessage(json.TaskType, json.TaskId, json.ItemAmount, json.UpgradeInteraction, json.PotionInteraction, json.UsedConsumableItemId);
	}
}

export class EquipItemMessage extends Packet {
	public readonly MsgType: number = 13;
	constructor(public ItemId: Int /* i32 */, public Amount: Int /* i32 */) { super(); }

	public static fromJson(json: any): EquipItemMessage {
		return new EquipItemMessage(json.ItemId, json.Amount);
	}
}

export class ErrorMessage extends Packet {
	public readonly MsgType: number = 5;
	constructor(public Error: ErrorType, public LocKey: string | null) { super(); }

	public static fromJson(json: any): ErrorMessage {
		return new ErrorMessage(json.Error, json.LocKey);
	}
}

export class InventoryItemSwapMessage extends Packet {
	public readonly MsgType: number = 69;
	constructor(public FromSlot: Int /* i32 */, public ToSlot: Int /* i32 */) { super(); }

	public static fromJson(json: any): InventoryItemSwapMessage {
		return new InventoryItemSwapMessage(json.FromSlot, json.ToSlot);
	}
}

export class LoginDataMessage extends Packet {
	public readonly MsgType: number = 1;
	constructor(public Username: string | null, public SkillExperiencesJson: string | null, public InventoryJson: string | null, public Gold: Double /* f64 */, public EquipmentJson: string | null, public EquippedAmmunitionAmount: Int /* i32 */, public NewPlayer: boolean, public Health: Int /* i32 */, public IsVerified: boolean, public PremiumEndDate: string | null, public IsPremiumPlus: boolean, public UnlockedBossHunter: boolean, public UnlockedAutoLoadouts: boolean, public Upgrades: { [key: string /* Name of: UpgradeType */]: Int /* i32 */ } | null, public CombatStyle: Byte /* i8 */, public ArcheryCombatStyle: Byte /* i8 */, public MagicCombatStyle: Byte /* i8 */, public AutoEatPercentage: Byte /* i8 */, public UsedBossKey: Int /* i32 */, public KronosAttackStyleWeakness: AttackStyle, public TutorialStage: FTUEStage | null, public GameMode: GameMode | null, public ConfigVersion: Int /* i32 */, public GuildName: string | null, public Members: { [key: string]: GuildMember } | null, public ActiveGuildApplications: Array<GuildApplicationForLogin> | null, public VaultGold: Double /* f64 */, public GuildHouseId: Int /* i32 */, public ClanCredits: Int /* i32 */, public NextQuestGenerationTimestamp: string | null, public DailySkillingQuests: Array<DailyGuildQuest> | null, public DailyCombatQuests: Array<DailyGuildQuest> | null, public SkillingContributors: Array<string> | null, public CombatContributors: Array<string> | null, public UnlockedUpgrades: Array<UpgradeType> | null, public AccumulatedCredits: Int /* i32 */, public OfflineHours: Byte /* i8 */, public SkillingOfflineProgress: SkillingOfflineProgressNetwork | null, public CombatOfflineProgress: CombatOfflineProgressNetwork | null, public ItemsSoldOffline: Array<ShopListingItem> | null, public SerializedPlayerToggleableSettings: string | null, public AdsWatchedToday: Byte /* i8 */, public LastAdWatchedTimestampTicks: Long /* i64 */, public AdBoostedSeconds: Int /* i32 */, public AdBoostPaused: boolean, public PurchasedInventorySlots: Int /* i32 */, public ClanVaultSpacePurchased: Int /* i32 */, public ActivePotionEffects: { [key: string /* Name of: PotionType */]: Int /* i32 */ } | null, public SerializedItemEnchantments: string | null, public GuildInvitations: Array<GuildInvitation> | null, public UseInventoryConsumables: boolean, public ShouldShowQuestsNotification: boolean, public QuesterUnlocked: boolean, public PetOfflineProgress: PetOfflineProgression | null, public ActivePetSkill: Skill | null, public PetTaskId: Byte /* i8 */, public ItemsInWithdrawalBox: boolean, public ExterminatingPoints: Int /* i32 */, public ActiveExterminatingAssignment: ActiveExterminatingAssignment | null, public ExterminatorUnlocked: boolean, public UnlockedExterminatingPurchases: Array<ExterminatingShopUnlockType> | null, public PlayerRewards: { [key: string /* Name of: PlayerRewardType */]: Int /* i32 */ } | null, public Stats: { [key: string /* Name of: PvmStatType */]: Int /* i32 */ }, public PvmBestTimes: { [key: string /* Name of: PvmStatType */]: PvmBestRecord } | null, public AfkRaidInfo: AfkRaidInfo | null, public UnlockedAFKRaids: Array<RaidType>, public PurchaseLimitCounts: Array<PurchaseLimitScopeCountDto>) { super(); }

	public static fromJson(json: any): LoginDataMessage {
		return new LoginDataMessage(json.Username, json.SkillExperiencesJson, json.InventoryJson, json.Gold, json.EquipmentJson, json.EquippedAmmunitionAmount, json.NewPlayer, json.Health, json.IsVerified, json.PremiumEndDate, json.IsPremiumPlus, json.UnlockedBossHunter, json.UnlockedAutoLoadouts, json.Upgrades, json.CombatStyle, json.ArcheryCombatStyle, json.MagicCombatStyle, json.AutoEatPercentage, json.UsedBossKey, json.KronosAttackStyleWeakness, json.TutorialStage, json.GameMode, json.ConfigVersion, json.GuildName, json.Members, json.ActiveGuildApplications, json.VaultGold, json.GuildHouseId, json.ClanCredits, json.NextQuestGenerationTimestamp, json.DailySkillingQuests, json.DailyCombatQuests, json.SkillingContributors, json.CombatContributors, json.UnlockedUpgrades, json.AccumulatedCredits, json.OfflineHours, json.SkillingOfflineProgress, json.CombatOfflineProgress, json.ItemsSoldOffline, json.SerializedPlayerToggleableSettings, json.AdsWatchedToday, json.LastAdWatchedTimestampTicks, json.AdBoostedSeconds, json.AdBoostPaused, json.PurchasedInventorySlots, json.ClanVaultSpacePurchased, json.ActivePotionEffects, json.SerializedItemEnchantments, json.GuildInvitations, json.UseInventoryConsumables, json.ShouldShowQuestsNotification, json.QuesterUnlocked, json.PetOfflineProgress, json.ActivePetSkill, json.PetTaskId, json.ItemsInWithdrawalBox, json.ExterminatingPoints, json.ActiveExterminatingAssignment, json.ExterminatorUnlocked, json.UnlockedExterminatingPurchases, json.PlayerRewards, json.Stats, json.PvmBestTimes, json.AfkRaidInfo, json.UnlockedAFKRaids, json.PurchaseLimitCounts);
	}
}

/**
 * Start a task, client to server only.
 */
export class StartTaskMessage extends Packet {
	public readonly MsgType: number = 3;
	constructor(public TaskType: TaskType, public TaskId: Int /* i32 */, public UseInventoryConsumables: boolean) { super(); }

	public static fromJson(json: any): StartTaskMessage {
		return new StartTaskMessage(json.TaskType, json.TaskId, json.UseInventoryConsumables);
	}
}

/**
 * Confirmation that the task has been started, server to client only.
 */
export class TaskStartedMessage extends Packet {
	public readonly MsgType: number = 191;
	constructor(public TaskType: TaskType, public TaskId: Int /* i32 */) { super(); }

	public static fromJson(json: any): TaskStartedMessage {
		return new TaskStartedMessage(json.TaskType, json.TaskId);
	}
}

export class UnequipItemMessage extends Packet {
	public readonly MsgType: number = 14;
	constructor(public ItemId: Int /* i32 */) { super(); }

	public static fromJson(json: any): UnequipItemMessage {
		return new UnequipItemMessage(json.ItemId);
	}
}

export class AbortGuildDeletionMessage extends Packet {
	public readonly MsgType: number = 266;
	constructor() { super(); }

	public static fromJson(json: any): AbortGuildDeletionMessage {
		return new AbortGuildDeletionMessage();
	}
}

export class AcceptGuildInviteMessage extends Packet {
	public readonly MsgType: number = 37;
	constructor(public GuildName: string) { super(); }

	public static fromJson(json: any): AcceptGuildInviteMessage {
		return new AcceptGuildInviteMessage(json.GuildName);
	}
}

export class ClearAllGuildApplicationsMessage extends Packet {
	public readonly MsgType: number = 132;
	constructor() { super(); }

	public static fromJson(json: any): ClearAllGuildApplicationsMessage {
		return new ClearAllGuildApplicationsMessage();
	}
}

export class CreateGuildMessage extends Packet {
	public readonly MsgType: number = 32;
	constructor(public GuildName: string, public NextQuestGenerationTimestamp: string | null, public DailySkillingQuests: Array<DailyGuildQuest> | null, public DailyCombatQuests: Array<DailyGuildQuest> | null) { super(); }

	public static fromJson(json: any): CreateGuildMessage {
		return new CreateGuildMessage(json.GuildName, json.NextQuestGenerationTimestamp, json.DailySkillingQuests, json.DailyCombatQuests);
	}
}

export class DeleteGuildMessage extends Packet {
	public readonly MsgType: number = 47;
	constructor(public ViewingDeletionState: boolean) { super(); }

	public static fromJson(json: any): DeleteGuildMessage {
		return new DeleteGuildMessage(json.ViewingDeletionState);
	}
}

export class GuildBulletinBoardEditResponseMessage extends Packet {
	public readonly MsgType: number = 190;
	constructor(public Success: boolean) { super(); }

	public static fromJson(json: any): GuildBulletinBoardEditResponseMessage {
		return new GuildBulletinBoardEditResponseMessage(json.Success);
	}
}

export class GuildBulletinBoardInfoMessage extends Packet {
	public readonly MsgType: number = 189;
	constructor(public Message: string | null, public DiscordInvitationCode: string | null) { super(); }

	public static fromJson(json: any): GuildBulletinBoardInfoMessage {
		return new GuildBulletinBoardInfoMessage(json.Message, json.DiscordInvitationCode);
	}
}

export class GuildDeletedMessage extends Packet {
	public readonly MsgType: number = 49;
	constructor() { super(); }

	public static fromJson(json: any): GuildDeletedMessage {
		return new GuildDeletedMessage();
	}
}

export class GuildDeletionResponseMessage extends Packet {
	public readonly MsgType: number = 265;
	constructor(public EarliestPossibleDeletionDate: string) { super(); }

	public static fromJson(json: any): GuildDeletionResponseMessage {
		return new GuildDeletionResponseMessage(json.EarliestPossibleDeletionDate);
	}
}

export class GuildLeaderLeftGuildMessage extends Packet {
	public readonly MsgType: number = 124;
	constructor(public NewLeader: string) { super(); }

	public static fromJson(json: any): GuildLeaderLeftGuildMessage {
		return new GuildLeaderLeftGuildMessage(json.NewLeader);
	}
}

export class GuildMemberKickedMessage extends Packet {
	public readonly MsgType: number = 51;
	constructor(public PlayerName: string) { super(); }

	public static fromJson(json: any): GuildMemberKickedMessage {
		return new GuildMemberKickedMessage(json.PlayerName);
	}
}

export class GuildMemberLoggedInMessage extends Packet {
	public readonly MsgType: number = 42;
	constructor(public GuildMemberName: string) { super(); }

	public static fromJson(json: any): GuildMemberLoggedInMessage {
		return new GuildMemberLoggedInMessage(json.GuildMemberName);
	}
}

export class GuildMemberLoggedOutMessage extends Packet {
	public readonly MsgType: number = 43;
	constructor(public GuildMemberName: string) { super(); }

	public static fromJson(json: any): GuildMemberLoggedOutMessage {
		return new GuildMemberLoggedOutMessage(json.GuildMemberName);
	}
}

export class GuildRequestResultMessage extends Packet {
	public readonly MsgType: number = 41;
	constructor(public AssociatedPlayer: string | null, public MessageType: GuildActionResponse) { super(); }

	public static fromJson(json: any): GuildRequestResultMessage {
		return new GuildRequestResultMessage(json.AssociatedPlayer, json.MessageType);
	}
}

export class GuildUpdateMinimumTotalLevelRequirementMessage extends Packet {
	public readonly MsgType: number = 216;
	constructor(public MinimumTotalLevel: Int /* i32 */) { super(); }

	public static fromJson(json: any): GuildUpdateMinimumTotalLevelRequirementMessage {
		return new GuildUpdateMinimumTotalLevelRequirementMessage(json.MinimumTotalLevel);
	}
}

export class GuildUpdatePrimaryLanguageMessage extends Packet {
	public readonly MsgType: number = 214;
	constructor(public Language: string) { super(); }

	public static fromJson(json: any): GuildUpdatePrimaryLanguageMessage {
		return new GuildUpdatePrimaryLanguageMessage(json.Language);
	}
}

export class GuildUpdateRecruitmentMessageMessage extends Packet {
	public readonly MsgType: number = 215;
	constructor(public RecruitmentMessage: string) { super(); }

	public static fromJson(json: any): GuildUpdateRecruitmentMessageMessage {
		return new GuildUpdateRecruitmentMessageMessage(json.RecruitmentMessage);
	}
}

export class GuildUpdateRecruitmentStateMessage extends Packet {
	public readonly MsgType: number = 212;
	constructor(public Value: boolean) { super(); }

	public static fromJson(json: any): GuildUpdateRecruitmentStateMessage {
		return new GuildUpdateRecruitmentStateMessage(json.Value);
	}
}

export class GuildUpdateStatusMessage extends Packet {
	public readonly MsgType: number = 213;
	constructor(public Status: ClanCategory) { super(); }

	public static fromJson(json: any): GuildUpdateStatusMessage {
		return new GuildUpdateStatusMessage(json.Status);
	}
}

export class GuildUpdateTagMessage extends Packet {
	public readonly MsgType: number = 354;
	constructor(public Tag: string | null) { super(); }

	public static fromJson(json: any): GuildUpdateTagMessage {
		return new GuildUpdateTagMessage(json.Tag);
	}
}

export class GuildVaultMessage extends Packet {
	public readonly MsgType: number = 219;
	constructor(public Vault: { [key: Int /* i32 */]: Int /* i32 */ }) { super(); }

	public static fromJson(json: any): GuildVaultMessage {
		return new GuildVaultMessage(json.Vault);
	}
}

export class KickGuildMemberMessage extends Packet {
	public readonly MsgType: number = 50;
	constructor(public Username: string) { super(); }

	public static fromJson(json: any): KickGuildMemberMessage {
		return new KickGuildMemberMessage(json.Username);
	}
}

export class LeaveGuildMessage extends Packet {
	public readonly MsgType: number = 46;
	constructor() { super(); }

	public static fromJson(json: any): LeaveGuildMessage {
		return new LeaveGuildMessage();
	}
}

export class PlayerJoinedGuildMessage extends Packet {
	public readonly MsgType: number = 38;
	constructor(public PlayerJoining: string, public IsPremium: boolean, public IsPremiumPlus: boolean, public IsOnline: boolean, public LogOutTime: string | null, public GuildName: string | null, public Members: { [key: string]: GuildMember } | null, public NextQuestGenerationTimestamp: string | null, public DailySkillingQuests: Array<DailyGuildQuest> | null, public SkillingContributors: Array<string> | null, public DailyCombatQuests: Array<DailyGuildQuest> | null, public CombatContributors: Array<string> | null, public SkillExperiences: { [key: string /* Name of: Skill */]: Float /* f32 */ } | null, public OwnedHouseId: Int /* i32 */, public Vault: { [key: Int /* i32 */]: Int /* i32 */ } | null, public Gold: Double /* f64 */, public UnlockedUpgrades: Array<UpgradeType> | null, public ClanVaultSpacePurchased: Int /* i32 */, public Credits: Int /* i32 */, public SerializedEventStates: string | null, public SkillingTickets: { [key: string /* Name of: Skill */]: Int /* i32 */ } | null, public SkillingPartyCompletions: Int /* i32 */, public Tag: string | null) { super(); }

	public static fromJson(json: any): PlayerJoinedGuildMessage {
		return new PlayerJoinedGuildMessage(json.PlayerJoining, json.IsPremium, json.IsPremiumPlus, json.IsOnline, json.LogOutTime, json.GuildName, json.Members, json.NextQuestGenerationTimestamp, json.DailySkillingQuests, json.SkillingContributors, json.DailyCombatQuests, json.CombatContributors, json.SkillExperiences, json.OwnedHouseId, json.Vault, json.Gold, json.UnlockedUpgrades, json.ClanVaultSpacePurchased, json.Credits, json.SerializedEventStates, json.SkillingTickets, json.SkillingPartyCompletions, json.Tag);
	}
}

export class PlayerLeftGuildMessage extends Packet {
	public readonly MsgType: number = 48;
	constructor(public PlayerName: string) { super(); }

	public static fromJson(json: any): PlayerLeftGuildMessage {
		return new PlayerLeftGuildMessage(json.PlayerName);
	}
}

export class ReceiveGuildApplicationMessage extends Packet {
	public readonly MsgType: number = 34;
	constructor(public PlayerApplying: string, public Message: string, public PlayerTotalLevel: Int /* i32 */) { super(); }

	public static fromJson(json: any): ReceiveGuildApplicationMessage {
		return new ReceiveGuildApplicationMessage(json.PlayerApplying, json.Message, json.PlayerTotalLevel);
	}
}

export class ReceiveGuildInviteMessage extends Packet {
	public readonly MsgType: number = 36;
	constructor(public PlayerInviting: string, public GuildName: string) { super(); }

	public static fromJson(json: any): ReceiveGuildInviteMessage {
		return new ReceiveGuildInviteMessage(json.PlayerInviting, json.GuildName);
	}
}

export class ReceiveGuildStateMessage extends Packet {
	public readonly MsgType: number = 60;
	constructor(public SkillExperiences: { [key: string /* Name of: Skill */]: Float /* f32 */ } | null, public ClanCredits: Int /* i32 */, public EventStates: string, public SkillingTickets: { [key: string /* Name of: Skill */]: Int /* i32 */ } | null, public SkillingPartyCompletions: Int /* i32 */, public IsRecruiting: boolean, public Status: ClanCategory, public PrimaryLanguage: string | null, public MinimumTotalLevelRequired: Int /* i32 */, public LocalPlayerHasClaimableLoot: boolean, public Tag: string | null) { super(); }

	public static fromJson(json: any): ReceiveGuildStateMessage {
		return new ReceiveGuildStateMessage(json.SkillExperiences, json.ClanCredits, json.EventStates, json.SkillingTickets, json.SkillingPartyCompletions, json.IsRecruiting, json.Status, json.PrimaryLanguage, json.MinimumTotalLevelRequired, json.LocalPlayerHasClaimableLoot, json.Tag);
	}
}

/**
 * <->
 */
export class RequestClanBossInfoMessage extends Packet {
	public readonly MsgType: number = 337;
	constructor(public BossType: ClanEventBossType, public Stats: { [key: string /* Name of: PvmStatType */]: Int /* i32 */ } | null, public PlayersInFight: Byte /* i8 */ | null, public ActiveModifiers: { [key: string /* Name of: ClanBossModifierType */]: Int /* i32 */ } | null) { super(); }

	public static fromJson(json: any): RequestClanBossInfoMessage {
		return new RequestClanBossInfoMessage(json.BossType, json.Stats, json.PlayersInFight, json.ActiveModifiers);
	}
}

export class RequestClanPvmStatsMessage extends Packet {
	public readonly MsgType: number = 323;
	constructor(public Stats: { [key: string /* Name of: PvmStatType */]: Int /* i32 */ } | null) { super(); }

	public static fromJson(json: any): RequestClanPvmStatsMessage {
		return new RequestClanPvmStatsMessage(json.Stats);
	}
}

export class RequestGuildBulletinInfoMessage extends Packet {
	public readonly MsgType: number = 188;
	constructor() { super(); }

	public static fromJson(json: any): RequestGuildBulletinInfoMessage {
		return new RequestGuildBulletinInfoMessage();
	}
}

export class RequestGuildStateMessage extends Packet {
	public readonly MsgType: number = 59;
	constructor() { super(); }

	public static fromJson(json: any): RequestGuildStateMessage {
		return new RequestGuildStateMessage();
	}
}

export class RequestGuildVaultMessage extends Packet {
	public readonly MsgType: number = 218;
	constructor() { super(); }

	public static fromJson(json: any): RequestGuildVaultMessage {
		return new RequestGuildVaultMessage();
	}
}

export class SendGuildApplicationMessage extends Packet {
	public readonly MsgType: number = 33;
	constructor(public GuildName: string, public Message: string) { super(); }

	public static fromJson(json: any): SendGuildApplicationMessage {
		return new SendGuildApplicationMessage(json.GuildName, json.Message);
	}
}

export class SendGuildInviteMessage extends Packet {
	public readonly MsgType: number = 35;
	constructor(public PlayerReceivingInvite: string) { super(); }

	public static fromJson(json: any): SendGuildInviteMessage {
		return new SendGuildInviteMessage(json.PlayerReceivingInvite);
	}
}

export class SellItemMessage extends Packet {
	public readonly MsgType: number = 6;
	constructor(public ItemId: Int /* i32 */, public ItemAmount: Int /* i32 */) { super(); }

	public static fromJson(json: any): SellItemMessage {
		return new SellItemMessage(json.ItemId, json.ItemAmount);
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
	47: DeleteGuildMessage,
	190: GuildBulletinBoardEditResponseMessage,
	189: GuildBulletinBoardInfoMessage,
	49: GuildDeletedMessage,
	265: GuildDeletionResponseMessage,
	124: GuildLeaderLeftGuildMessage,
	51: GuildMemberKickedMessage,
	42: GuildMemberLoggedInMessage,
	43: GuildMemberLoggedOutMessage,
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
	38: PlayerJoinedGuildMessage,
	48: PlayerLeftGuildMessage,
	34: ReceiveGuildApplicationMessage,
	36: ReceiveGuildInviteMessage,
	60: ReceiveGuildStateMessage,
	337: RequestClanBossInfoMessage,
	323: RequestClanPvmStatsMessage,
	188: RequestGuildBulletinInfoMessage,
	59: RequestGuildStateMessage,
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
	DeleteGuildMessage = 47,
	GuildBulletinBoardEditResponseMessage = 190,
	GuildBulletinBoardInfoMessage = 189,
	GuildDeletedMessage = 49,
	GuildDeletionResponseMessage = 265,
	GuildLeaderLeftGuildMessage = 124,
	GuildMemberKickedMessage = 51,
	GuildMemberLoggedInMessage = 42,
	GuildMemberLoggedOutMessage = 43,
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
	PlayerJoinedGuildMessage = 38,
	PlayerLeftGuildMessage = 48,
	ReceiveGuildApplicationMessage = 34,
	ReceiveGuildInviteMessage = 36,
	ReceiveGuildStateMessage = 60,
	RequestClanBossInfoMessage = 337,
	RequestClanPvmStatsMessage = 323,
	RequestGuildBulletinInfoMessage = 188,
	RequestGuildStateMessage = 59,
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
