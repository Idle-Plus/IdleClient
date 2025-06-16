import { Float, Int, WeaponType } from "@idleclient/network/NetworkData.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";

class SharedSettings {

	private readonly RequiredBuildVersion: string = ""; // Hopefully this will never be empty.
	private readonly LatestBuildVersion: string = ""; // ^
	private readonly ConfigVersion: Int = 0;
	private readonly EnemyRespawnTimeMS: Int = 0;
	private readonly CombatExpPerHit: Int = 0;
	private readonly HealthExpPerHit: Int = 0;
	private readonly StarterInventorySlotsUnlockedAmount: Int = 0;
	private readonly MaxAvailableInventorySlots: Int = 0;
	private readonly BaseClanVaultSpace: Int = 0;
	private readonly PremiumOneMonthItemId: Int = 0;
	private readonly PremiumPermanentItemId: Int = 0;
	private readonly TasksLockedBehindPremium: Int[] = [];
	private readonly BaseOfflineProgressCapHours: Int = 0;
	private readonly OfflineHoursFromPremium: Int = 0;
	private readonly ChatEnabled: boolean = false;
	private readonly UnarmedAttackSpeedMS: Int = 0;
	private readonly MaxPlayerShopSlots: Int = 0;
	private readonly PlayerShopSlotsWithoutPremium: Int = 0;
	private readonly ClanCreditsPerClanTaskCompletion: Int = 0;
	private readonly TutorialCombatLoot: { ItemId?: Int, ItemAmount?: Int }[] = [] // fields marked as optional because omitted default values.
	private readonly AccountAgeHoursRequiredToSellRMItems: Int = 0;
	private readonly CombatNpcWeaknessDefenceReductionPct: Int = 0;
	private readonly CombatNpcWeaknessDamageBoostPct: Int = 0;
	private readonly MinigameSkillAttackInterval: Int = 0;
	private readonly MinigameDurationMinutes: Int = 0;
	private readonly CombatExperienceEventExpMultiplier: Int = 0;
	private readonly DailyAdsLimit: Int = 0;
	private readonly DailyAdsBoostDurationMinutes: Int = 0;
	private readonly DailyAdsWatchCooldownMinutes: Int = 0;
	private readonly DailyAdsExperienceBoostPct: Int = 0;
	private readonly TotalLevelRequirementForClanCreation: Int = 0;
	private readonly GoldCostForClanCreation: Int = 0;
	private readonly GuildMinCharacters: Int = 0;
	private readonly GuildMaxCharacters: Int = 0;
	private readonly GuildMaxMembers: Int = 0;
	private readonly PremiumClanCreditBoostPercentage: Int = 0;
	private readonly ClanCreditsPerMinigameParticipant: Int = 0;
	private readonly ClanCreditsPerBossKill: Int = 0;
	private readonly ClanCreditsPerRefinement: { RefinementType?: WeaponType, Credits?: Int }[] = []; // fields marked as optional because omitted default values.
	private readonly ClanCreditsPerChest: { ChestName: string, Credits?: Int }[] = []; // fields marked as optional because omitted default values.
	private readonly IAPInventorySpacePerPurchase: Int = 0;
	private readonly IAPMaxPurchasableInventorySpace: Int = 0;
	private readonly IAPMinigameBoostDurationHours: Int = 0;
	private readonly IAPGemstoneBoostDurationHours: Int = 0;
	private readonly IAPClanVaultSpacePerPurchase: Int = 0;
	private readonly IAPMaxPurchasableClanVaultSpace: Int = 0;
	private readonly IAPMaxPurchasableClanVaultSpaceIronman: Int = 0;
	private readonly IAPCreditBoostDurationHours: Int = 0;
	private readonly MaxSkillLevel: Int = 0;
	private readonly MaxChatMessageCharacters: Int = 0;
	private readonly ChatTotalLevelRequirement: Int = 0;
	private readonly UntradeablePremiumUnlockCost: Int = 0;
	private readonly MaxWhiteListedPlayers: Int = 0;
	private readonly MaxPlayerSkillExperience: Int = 0;
	private readonly GuildAmountOfLatestLogsStored: Int = 0;
	private readonly GuildAmountOfPlayerLogsStored: Int = 0;
	private readonly RaidsStarterItems: Int[] = [];
	private readonly RaidHealthPercentageToRecoverToAfterBattle: Int = 0;
	private readonly CreditsPerReckoningOfTheGodsRun: Int = 0;
	private readonly MaxPlayerGold: Float = 0; // HUH? FLOAT?
	private readonly LeaderInactiveDaysUntilDeputyCanClaimLeadership: Int = 0;
	private readonly ExperienceBoostPercentagePerDailyGatheringEventParticipant: Int = 0;
	private readonly HealthBoostPercentagePerParticipantInClanCombatExperienceEvent: Int = 0;
	private readonly PlayerShopTaxPercentage: Float = 0;
	private readonly LeaderInactiveDaysUntilRegularMemberCanClaimLeadership: Int = 0;
	private readonly TwoFactorAuthenticationEnabled: boolean = false;
	private readonly MaximumItemsInWithdrawalPerPlayer: Int = 0;
	private readonly MaximumTotalItemsInWithdrawal: Int = 0;
	private readonly WeeklyQuestCompletionModifier: Int = 0;
	private readonly WeeklyQuestRewardModifier: Int = 0;
	private readonly PetTaskLengthModifier: Int = 0;
	private readonly PlayerShareOfPetTaskWithoutCostsPercentage: Int = 0;
	private readonly PlayerShareOfPetTaskWithCostsPercentage: Int = 0;
	private readonly CombatPetExperienceSharePercentage: Int = 0;
	private readonly ClanCupCreditRewards: Int[] = [];
	private readonly ClanCupCreditRewardsIronman: Int[] = [];

	constructor(entry: any) {
		Object.assign(this, entry);
	}

	get dailyAdsExperienceBoostPct(): Int { return this.DailyAdsExperienceBoostPct; }
	get maxSkillLevel(): Int { return this.MaxSkillLevel; }
	get maxPlayerSkillExperience(): Int { return this.MaxPlayerSkillExperience; }
}

class ClientSettings {

	private readonly LeaderboardsEnabled: boolean = false;
	private readonly PlayerShopRefreshCooldownSeconds: Int = 0;
	private readonly MaxPlayerShopTradingHistoryEntries: Int = 0;
	private readonly ItemSellMinimumGoldValueForConfirmationPopup: Int = 0;
	private readonly LocalNotificationRetentionReminderDays: Int[] = [];
	private readonly MaxDropPercentageToShowRareLootNotification: Float = 0;
	private readonly TopClanCountDisplayedInGuildPage: Int = 0;
	private readonly DefaultFpsTarget: Int = 0;

	constructor(entry: any) {
		Object.assign(this, entry);
	}
}

export class SettingsDatabase {

	private readonly sharedSettings: SharedSettings;
	private readonly clientSettings: ClientSettings;

	constructor(sharedData: { _id: string, Settings: any }, clientData: { _id: string, Settings: any }) {
		this.sharedSettings = new SharedSettings(sharedData.Settings);
		this.clientSettings = new ClientSettings(clientData.Settings);
	}

	public shared(): SharedSettings {
		return this.sharedSettings;
	}

	public client(): ClientSettings {
		return this.clientSettings;
	}

	public static getSharedSettings(): SharedSettings {
		return GameData.settings().shared();
	}

	public static getClientSettings(): ClientSettings {
		return GameData.settings().client();
	}
}