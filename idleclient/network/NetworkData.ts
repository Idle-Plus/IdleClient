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
	constructor(public Username: string | null, public SkillExperiencesJson: string | null, public InventoryJson: string | null, public Gold: Double /* f64 */, public EquipmentJson: string | null, public EquippedAmmunitionAmount: Int /* i32 */, public NewPlayer: boolean, public Health: Int /* i32 */, public IsVerified: boolean, public PremiumEndDate: string | null, public IsPremiumPlus: boolean, public UnlockedBossHunter: boolean, public UnlockedAutoLoadouts: boolean, public Upgrades: { [key: string /* Name of: UpgradeType */]: Int /* i32 */ } | null, public CombatStyle: Byte /* i8 */, public ArcheryCombatStyle: Byte /* i8 */, public MagicCombatStyle: Byte /* i8 */, public AutoEatPercentage: Byte /* i8 */, public UsedBossKey: Int /* i32 */, public KronosAttackStyleWeakness: AttackStyle, public TutorialStage: FTUEStage | null, public GameMode: GameMode | null, public ConfigVersion: Int /* i32 */, public GuildName: string | null, public Members: { [key: string]: GuildMember } | null, public ActiveGuildApplications: Array<GuildApplicationForLogin> | null, public VaultGold: Double /* f64 */, public GuildHouseId: Int /* i32 */, public ClanCredits: Int /* i32 */, public NextQuestGenerationTimestamp: string | null, public DailySkillingQuests: Array<DailyGuildQuest> | null, public DailyCombatQuests: Array<DailyGuildQuest> | null, public SkillingContributors: Array<string> | null, public CombatContributors: Array<string> | null, public UnlockedUpgrades: Array<UpgradeType> | null, public AccumulatedCredits: Int /* i32 */, public OfflineHours: Byte /* i8 */, public SkillingOfflineProgress: SkillingOfflineProgressNetwork | null, public CombatOfflineProgress: CombatOfflineProgressNetwork | null, public ItemsSoldOffline: Array<ShopListingItem> | null, public SerializedPlayerToggleableSettings: string | null, public AdsWatchedToday: Byte /* i8 */, public LastAdWatchedTimestampTicks: Long /* i64 */, public AdBoostedSeconds: Int /* i32 */, public AdBoostPaused: boolean, public PurchasedInventorySlots: Int /* i32 */, public ClanVaultSpacePurchased: Int /* i32 */, public ActivePotionEffects: { [key: string /* Name of: PotionType */]: Int /* i32 */ } | null, public SerializedItemEnchantments: string | null, public GuildInvitations: Array<GuildInvitation> | null, public UseInventoryConsumables: boolean, public ShouldShowQuestsNotification: boolean, public QuesterUnlocked: boolean, public PetOfflineProgress: PetOfflineProgression | null, public ActivePetSkill: Skill | null, public PetTaskId: Byte /* i8 */, public ItemsInWithdrawalBox: boolean, public ExterminatingPoints: Int /* i32 */, public ActiveExterminatingAssignment: ActiveExterminatingAssignment | null, public ExterminatorUnlocked: boolean, public UnlockedExterminatingPurchases: Array<ExterminatingShopUnlockType> | null, public PlayerRewards: { [key: string /* Name of: PlayerRewardType */]: Int /* i32 */ } | null) { super(); }

	public static fromJson(json: any): LoginDataMessage {
		return new LoginDataMessage(json.Username, json.SkillExperiencesJson, json.InventoryJson, json.Gold, json.EquipmentJson, json.EquippedAmmunitionAmount, json.NewPlayer, json.Health, json.IsVerified, json.PremiumEndDate, json.IsPremiumPlus, json.UnlockedBossHunter, json.UnlockedAutoLoadouts, json.Upgrades, json.CombatStyle, json.ArcheryCombatStyle, json.MagicCombatStyle, json.AutoEatPercentage, json.UsedBossKey, json.KronosAttackStyleWeakness, json.TutorialStage, json.GameMode, json.ConfigVersion, json.GuildName, json.Members, json.ActiveGuildApplications, json.VaultGold, json.GuildHouseId, json.ClanCredits, json.NextQuestGenerationTimestamp, json.DailySkillingQuests, json.DailyCombatQuests, json.SkillingContributors, json.CombatContributors, json.UnlockedUpgrades, json.AccumulatedCredits, json.OfflineHours, json.SkillingOfflineProgress, json.CombatOfflineProgress, json.ItemsSoldOffline, json.SerializedPlayerToggleableSettings, json.AdsWatchedToday, json.LastAdWatchedTimestampTicks, json.AdBoostedSeconds, json.AdBoostPaused, json.PurchasedInventorySlots, json.ClanVaultSpacePurchased, json.ActivePotionEffects, json.SerializedItemEnchantments, json.GuildInvitations, json.UseInventoryConsumables, json.ShouldShowQuestsNotification, json.QuesterUnlocked, json.PetOfflineProgress, json.ActivePetSkill, json.PetTaskId, json.ItemsInWithdrawalBox, json.ExterminatingPoints, json.ActiveExterminatingAssignment, json.ExterminatorUnlocked, json.UnlockedExterminatingPurchases, json.PlayerRewards);
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
