import {
	EquipmentSlot,
	Float,
	Int,
	PotionType,
	Skill,
	TaskType,
	UpgradeType
} from "@idleclient/network/NetworkData.ts";
import { ItemId } from "@idleclient/types/gameTypes.ts";
import { GameContextType } from "@context/GameContext.tsx";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { IdleClansMath } from "@idleclient/game/utils/IdleClansMath.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { ToolbeltUtils } from "@idleclient/game/utils/ToolbeltUtils.ts";
import { EnchantmentUtils } from "@idleclient/game/utils/EnchantmentUtils.ts";
import { PotionDatabase } from "@idleclient/game/data/PotionDatabase.ts";

interface TaskCost {
	itemId: ItemId,
	amount: Int,
}

export class JobTask {

	private readonly TaskId: Int = 0;
	private readonly Name: string = "";
	private readonly Disabled: boolean = false;

	private readonly Skill: Skill = Skill.None;
	private readonly LevelRequirement: Int = 0;
	private readonly BaseTime: Float = 0;
	private readonly CustomPetTimeMs: Float = 0;
	private readonly ExpReward: Float = 0;
	private readonly CustomPetExpReward: Float = 0;
	private readonly ItemReward: Int = 0;
	private readonly ItemAmount: Int = 0;
	private readonly IsSymbolTask: boolean = false;
	private readonly Costs: { Item?: Int, Amount?: Int }[] = []; // fields marked as optional because omitted default values.
	private readonly CustomIconId: Int = 0;

	// The id of the "category" this task is in.
	public readonly identifiableType: string = "";
	public readonly taskType: TaskType = TaskType.None;

	constructor(entry: any) {
		Object.assign(this, entry);
	}

	/*
	 * Getters
	 */

	get taskId(): Int { return this.TaskId; }
	get name(): string { return this.Name; }
	get disabled(): boolean { return this.Disabled; }

	get skill(): Skill { return this.Skill; }
	get levelRequirement(): Int { return this.LevelRequirement; }
	get baseTime(): Float { return this.BaseTime; }
	get customPetTimeMs(): Float { return this.CustomPetTimeMs; }
	get expReward(): Float { return this.ExpReward; }
	get customPetExpReward(): Float { return this.CustomPetExpReward; }
	get itemReward(): Int { return this.ItemReward; }
	get itemAmount(): Int { return this.ItemAmount; }

	get costs() { return this.Costs; }
	get customIconId() { return this.CustomIconId; }

	/*
	 * Public methods
	 */

	public getUniqueTaskId(): number {
		return (this.taskType * 1000) + this.taskId;
	}

	public isHarvestingTask() {
		switch (this.Skill) {
			case Skill.Woodcutting:
			case Skill.Fishing:
			case Skill.Mining:
			case Skill.Foraging:
				return true;
			default:
				return false;
		}
	}

	public isCombatTask() {
		switch (this.Skill) {
			case Skill.Rigour:
			case Skill.Strength:
			case Skill.Defence:
			case Skill.Archery:
			case Skill.Magic:
			case Skill.Health:
			case Skill.Exterminating:
				return true;
			default:
				return false;
		}
	}

	public canAfford(game: GameContextType, multiplier: number = 1): boolean {
		// TODO: There might be cases where this doesn't work correctly.
		if (this.costs.length === 0) return true;

		const cost = this.getModifiedCosts(game, multiplier);

		for (const entry of cost) {
			const itemId = entry.itemId;
			const amount = entry.amount;
			if (!game.inventory.hasItem(itemId, amount)) return false;
		}

		return true;
	}

	public getModifiedCosts(game: GameContextType, multiplier: number = 1): TaskCost[] {
		const result: TaskCost[] = [];

		for (let i = 0; i < this.Costs.length; i++) {
			const entry = this.Costs[i];
			const itemId = entry.Item ?? 0;
			let amount = (entry.Amount ?? 0) * multiplier;

			if (itemId === ItemDatabase.GOLD_ITEM_ID && this.Skill === Skill.Carpentry) {
				const power = game.player.getUpgradeBenefits(UpgradeType.upgrade_plank_cost);
				if (power > 0) {
					amount = IdleClansMath.get().multiply_by_percentage_float_float(amount, -power);
					amount = IdleClansMath.get().bankers_round(amount);
					//amount = Math.round(amount); // TODO: ^ Check if the above works
				}
			}

			if (this.Skill === Skill.Crafting) {
				if (game.player.isUpgradeUnlocked(UpgradeType.upgrade_delicate_manufacturing) &&
					(itemId === 273 || itemId === 274 || itemId === 275)) {
					// Magical flax, Enchanted flax & Cursed flax

					amount = IdleClansMath.get().multiply_by_percentage_int_float(amount, -20.0);
				}
			}

			if (this.Skill === Skill.Brewing) {
				if (game.equipment.isItemEquipped(741, true)) {
					// Guardian's brewing spoon

					const itemDef = ItemDatabase.item(741);
					amount = IdleClansMath.get().multiply_by_percentage_int_float(amount, itemDef.procChance);
				}
			}

			result.push({ itemId, amount });
		}

		return result;
	}

	public getModifiedExperience(game: GameContextType, ignoreAdsBoost: boolean = false): Float {
		let exp = this.ExpReward;

		const boostFromHouse = this.getBoostFromHouse(game);
		if (boostFromHouse > 0) {
			exp = IdleClansMath.get().multiply_by_percentage_float_float(exp, boostFromHouse);
		}

		if (!ignoreAdsBoost && game.player.isAdBoostActive()) {
			exp = IdleClansMath.get().multiply_by_percentage_float_float(exp,
				GameData.settings().shared().dailyAdsExperienceBoostPct);
		}

		if (this.Skill === Skill.Crafting && game.equipment.isItemEquipped(744, true) &&
			this.Costs.some(entry => ItemDatabase.GEMSTONES.has(entry.Item ?? 0))) {
			const chisel = ItemDatabase.item(744);
			exp = IdleClansMath.get().multiply_by_percentage_float_float(exp, chisel.procChance);
		}

		if (this.BaseTime > 0) {
			return IdleClansMath.get().safe_round_to_one_decimal(exp);
		}

		let bonusPercentage = 0;
		bonusPercentage += this.getSkillSpeedBoost(game);

		// TODO: Get clan upgrade.
		//       Huh, is there a clan upgrade for experience?
		/*if (this.isHarvestingTask() && game.clan.isInClan &&
			game.clan.hasUpgrade(UpgradeType.clan_upgrade_gatherers)) {
			const upgrade = GameData.upgrades().getUpgrade(UpgradeType.clan_upgrade_gatherers);
			bonusPercentage += IdleClansMath.get().multiply_by_percentage_float_float(bonusPercentage, upgrade?.tierUnlocks[0]);
		}*/

		if (bonusPercentage < 1) {
			return IdleClansMath.get().safe_round_to_one_decimal(exp);
		}

		const modifiedExperience = IdleClansMath.get().multiply_by_percentage_float_float(exp, bonusPercentage);
		return IdleClansMath.get().safe_round_to_one_decimal(modifiedExperience);
	}

	public getModifiedTaskTime(game: GameContextType): Float {
		const skillingBoost = this.getSkillSpeedBoost(game);
		let time = IdleClansMath.get().calc_negative_percentage_float_float(this.baseTime, skillingBoost);

		if (this.isHarvestingTask() && game.clan.isUpgradeUnlocked(UpgradeType.clan_upgrade_gatherers)) {
			const boost = game.clan.getUpgradeBenefits(UpgradeType.clan_upgrade_gatherers);
			time = IdleClansMath.get().calc_negative_percentage_float_float(time, boost);
		}

		if (this.baseTime * 0.2 > time) {
			time = ~~(this.baseTime * 0.2);
		}

		if (time < 1) return 1;
		return time;
	}

	private getBoostFromHouse(game: GameContextType) {
		let boost = 0;

		// TODO: TEMP METHOD! WILL BE MOVED LATER!

		if (game.player.isUpgradeUnlocked(UpgradeType.upgrade_housing)) {
			boost = game.player.getUpgradeBenefits(UpgradeType.upgrade_housing);
		}

		const clanHouse = game.clan.clan.content()?.getHouse();
		if (clanHouse) boost += clanHouse.globalSkillingBoost;

		return boost;
	}

	private getSkillSpeedBoost(game: GameContextType) {

		// TODO: TEMP METHOD! WILL BE MOVED LATER!

		const boostFromGear = game.boost.getSkillBoost(this.Skill);
		const boostFromToolbelt = this.getBoostPercentageFromToolbelt(game);
		const baseBoost = boostFromGear + boostFromToolbelt;

		// If we don't have any enchantment boost, then return here, as a potion
		// of ancient knowledge only changes the enchantment boost.
		const boostFromEnchantments = EnchantmentUtils.getEnchantmentBoostForSkill(game, this.Skill);
		if (boostFromEnchantments <= 0) return baseBoost;
		if (!game.potion.isPotionActive(PotionType.AncientKnowledge)) return baseBoost + boostFromEnchantments;

		const potionData = PotionDatabase.getPotion(PotionType.AncientKnowledge);
		if (!potionData) {
			console.error("Ancient Knowledge potion not found while calculating skill boost.");
			return baseBoost + boostFromEnchantments;
		}

		const boostedEnchantments = IdleClansMath.get()
			.multiply_by_percentage_float_float(boostFromEnchantments, potionData.effectStrengthPercentage);
		return baseBoost + boostedEnchantments;
	}

	private getBoostPercentageFromToolbelt(game: GameContextType) {

		// TODO: TEMP METHOD! WILL BE MOVED LATER!

		const equippedBelt = game.equipment.getEquipment(EquipmentSlot.Belt);
		if (!equippedBelt) return 0;

		if (!game.player.isUpgradeUnlocked(UpgradeType.upgrade_toolbelt)) return 0;
		const power = game.player.getUpgradeBenefits(UpgradeType.upgrade_toolbelt);

		// TODO: I think your equipped tool takes priority over the best tool found.

		return ToolbeltUtils.getToolbeltBoostForSkill(game, power, this.Skill);
	}
}

export class JobTaskCategory {

	public readonly tasks: JobTask[] = [];
	public readonly customId: string = "";
	public readonly sortOrder: number = 0;

	public readonly disabled: boolean = false;
	private readonly tasksById: Map<Int, JobTask> = new Map();

	constructor(tasks: JobTask[], customId: string, sortOrder: number) {
		this.tasks = tasks;
		this.customId = customId;
		this.sortOrder = sortOrder;

		const tasksById = new Map<Int, JobTask>();

		let disabled = true;
		for (let i = 0; i < tasks.length; i++) {
			const task = tasks[i];
			if (!task.disabled) disabled = false;
			tasksById.set(task.taskId, task);
		}

		this.disabled = disabled;
		this.tasksById = tasksById;
	}

	public getTaskById(id: Int): JobTask | undefined {
		return this.tasksById.get(id);
	}

	public getTaskByName(name: string): JobTask | undefined {
		for (const task of this.tasks) {
			if (task.name === name) return task;
		}
		return undefined;
	}
}

export class TaskDatabase {

	public readonly jobs: Map<TaskType, Map<Int, JobTask>> = new Map();
	public readonly categories: Map<TaskType, JobTaskCategory[]> = new Map();
	public readonly tasksByName: Map<string, JobTask> = new Map();

	constructor(taskData: any) {
		const startTime = Date.now();

		const jobs = new Map<TaskType, Map<Int, JobTask>>();
		const categories = new Map<TaskType, JobTaskCategory[]>();
		const tasksByName = new Map<string, JobTask>();

		const keys = Object.keys(taskData);
		for (const key of keys) {
			// Try to convert the key to the TaskType enum.
			const type = TaskType[key as keyof typeof TaskType];
			if (type === undefined) {
				console.warn(`Unknown task type ${key} while parsing task data.`);
				continue;
			}

			// Sort the entries by sort order, lowest to highest.
			const entries = taskData[key] as { Items: any[], CustomId: string, SortOrder: number }[];
			entries.sort((a, b) =>
				(a.SortOrder ?? 0) - (b.SortOrder ?? 0));

			const jobsMap = new Map<Int, JobTask>();
			const categoriesArray: JobTaskCategory[] = [];

			for (let i = 0; i < entries.length; i++) {
				const entry = entries[i];
				const items = entry.Items;
				const customId = entry.CustomId ?? "";
				const sortOrder = entry.SortOrder ?? 0;

				// The tasks that will be added to the category.
				const tasksArray: JobTask[] = [];

				for (let j = 0; j < items.length; j++) {
					const item = items[j];

					item.identifiableType = customId;
					item.taskType = type;

					const job = new JobTask(item);
					jobsMap.set(item.TaskId, job);
					tasksArray.push(job);

					if (tasksByName.has(job.name))
						console.warn(`TaskDatabase: Found duplicate task name: ${job.name}.`)
					tasksByName.set(job.name, job);
				}

				// Store the category and increase the start id.
				categoriesArray.push(new JobTaskCategory(tasksArray, customId, sortOrder));
			}

			jobs.set(type, jobsMap);
			categories.set(type, categoriesArray);
		}

		this.jobs = jobs;
		this.categories = categories;
		this.tasksByName = tasksByName;

		const total = Array.from(jobs.values()).reduce((a, b) => a + b.size, 0);
		const disabled = Array.from(categories.values())
			.flatMap(entries => entries)
			.flatMap(entry => entry.tasks)
			.filter(task => task.disabled)
			.length;

		const time = Date.now() - startTime;
		console.log(`TaskDatabase: Initialized ${total} tasks, ${disabled} of which are disabled, in ${time}ms.`);
	}

	public static getTaskCategories(type: TaskType): ReadonlyArray<JobTaskCategory> | undefined {
		const database = GameData.tasks();
		return database.categories.get(type);
	}

	public static getTaskCategory(type: TaskType, customId: string): JobTaskCategory | undefined {
		const database = GameData.tasks();
		const categories = database.categories.get(type);
		if (categories === undefined) return undefined;

		for (const category of categories) {
			if (category.customId === customId) return category;
		}

		return undefined;
	}

	public static getTaskById(type: TaskType, id: Int): JobTask | undefined {
		const database = GameData.tasks();
		const jobs = database.jobs.get(type);
		if (jobs === undefined) return undefined;
		return jobs.get(id);
	}

	public static getTaskByName(type: TaskType, name: string): JobTask | undefined {
		const database = GameData.tasks();
		return database.tasksByName.get(name);
	}
}