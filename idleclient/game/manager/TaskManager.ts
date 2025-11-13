import { ManagerContext, ManagerType } from "@context/GameContext.tsx";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { JobTask, TaskDatabase } from "@idleclient/game/data/TaskDatabase.ts";
import usePacket from "@hooks/network/usePacket.ts";
import {
	ActiveTaskCancelledMessage,
	CompleteTaskMessage, LoginDataMessage,
	PacketType,
	Skill, StartTaskMessage,
	TaskPotionInteraction,
	TaskStartedMessage,
	TaskType,
	TaskUpgradeInteraction,
	UpgradeType
} from "@idleclient/network/NetworkData.ts";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { IdleClansMath } from "@idleclient/game/utils/IdleClansMath.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { LogType, useConsole } from "@context/ConsoleContext.tsx";
import { Network } from "@idleclient/network/Network.ts";
import { ItemStack } from "@idleclient/types/gameTypes.ts";
import { useIdleEvent } from "@hooks/event/useIdleEvent.ts";
import { GameEvents } from "@idleclient/event/GameEvents.ts";

export interface CurrentTask {
	task: JobTask,
	start: number,
}

export interface TaskManagerType extends ManagerType {
	/**
	 * The currently active task, or null if we're not doing any tasks.
	 */
	currentTask: SmartRef<CurrentTask | null>,

	/**
	 * Start or stop the provided task. If the task is already active, then
	 * it'll be stopped. Otherwise, it'll be started.
	 *
	 * This doesn't do anything on the client, instead it sends a packet to the
	 * server, requesting the task to be either started or stopped.
	 */
	activateTask: (task: JobTask, useConsumables?: boolean) => void;

	/**
	 * Initialize the task manager.
	 */
	initialize: (data: LoginDataMessage) => void,
	/**
	 * Cleans up the task manager, should always be called when the player
	 * disconnects from the game server.
	 */
	cleanup: () => void,
}

export const TaskManager = (context: ManagerContext): TaskManagerType => {

	const debug = useConsole();
	const currentTask = useSmartRef<CurrentTask | null>(null);

	/*
	 * Network functions
	 */

	const activateTask = (task: JobTask, useConsumables: boolean = false) => {
		Network.send(new StartTaskMessage(task.taskType, task.taskId, useConsumables));
	}

	/*
	 * Packet listeners
	 */

	usePacket<TaskStartedMessage>(packet => {
		const task = TaskDatabase.getTaskById(packet.TaskType, packet.TaskId);
		if (task === undefined) {
			debug.warn(`TaskManager: TaskStartedMessage / Failed to find task ${packet.TaskId} of type ${packet.TaskType}.`);
			return;
		}

		currentTask.setContent({
			task: task,
			start: Date.now()
		})
	}, [], PacketType.TaskStartedMessage);

	usePacket<ActiveTaskCancelledMessage>(() => {
		debug.debug("TaskManager: ActiveTaskCancelledMessage / Stopping current task.");
		currentTask.setContent(null);
	}, [], PacketType.ActiveTaskCancelledMessage);

	usePacket<CompleteTaskMessage>(packet => {
		const current = currentTask.content();
		const job = current?.task;

		if (current === null || job === undefined) {
			debug.warn("TaskManager: Item Handling / Received CompleteTaskMessage, but we're not doing any tasks.");
			return;
		}

		if (job.taskType !== packet.TaskType || job.taskId !== packet.TaskId) {
			debug.warn(`TaskManager: Item Handling / Received CompleteTaskMessage, but the task type or id doesn't match. Packet: ${packet}, current: ${current}.`);
		}

		// The item we'll give to the player.
		let itemReward = job.itemReward;
		debug.write(LogType.DEBUG, "");
		debug.write(LogType.DEBUG, `TaskManager: Item Handling / Original item reward ${
			GameData.items().item(itemReward).name}.`);

		// Remove any consumables if we used any.
		if (packet.UsedConsumableItemId > 0) {
			debug.write(LogType.DEBUG, `TaskManager: Item Handling / Consumable item used ${packet.UsedConsumableItemId}.`);
			context.inventoryManager!.removeItem(packet.UsedConsumableItemId, 1);
		}

		// Handle the cost.
		for (const entry of job.costs) {
			const itemId = entry.Item ?? 0;
			let amount = entry.Amount ?? 0;

			// Don't do anything if we saved the materials.
			if (packet.UpgradeInteraction === TaskUpgradeInteraction.UpgradeSaveCosts)
				continue;

			if (itemId === ItemDatabase.GOLD_ITEM_ID && job.skill === Skill.Carpentry) {
				const power = context.playerManager!.getUpgradeBenefits(UpgradeType.upgrade_plank_cost);
				if (power > 0) {
					const original = amount;
					amount = IdleClansMath.get().multiply_by_percentage_float_float(amount, -power);
					amount = Math.round(amount); // TODO: Switch to IdleClansMath
					debug.write(LogType.DEBUG, `TaskManager: Item Handling / Carpentry gold cost reduced from ${
						original} to ${amount} due to a ${power}% upgrade boost.`);
				}
			}

			if (job.skill === Skill.Crafting) {
				if (context.playerManager!.isUpgradeUnlocked(UpgradeType.upgrade_delicate_manufacturing) &&
					(itemId === 273 || itemId === 274 || itemId === 275)) {
					// Magical flax, Enchanted flax & Cursed flax
					const original = amount;
					amount = IdleClansMath.get().multiply_by_percentage_int_float(amount, -20.0);
					debug.write(LogType.DEBUG, `TaskManager: Item Handling / Crafting flax cost reduced from ${
						original} to ${amount}.`);
				}
			}

			if (job.skill === Skill.Brewing) {
				if (context.equipmentManager!.isItemEquipped(741, true)) {
					// Guardian's brewing spoon
					const original = amount;
					const itemDef = GameData.items().item(741);
					amount = IdleClansMath.get().multiply_by_percentage_int_float(amount, itemDef.procChance);
					debug.write(LogType.DEBUG, `TaskManager: Item Handling / Brewing flax cost reduced from ${
						original} to ${amount} for item ${GameData.items().item(itemId).name}.`);
				}
			}

			if (amount === 0) continue;
			if (amount < 0) {
				console.warn(`TaskManager: CompleteTaskMessage / Amount is ${amount} for item ${itemId}? skipping.`);
				debug.write(LogType.WARNING, `TaskManager: CompleteTaskMessage / Amount is ${amount} for item ${itemId}? skipping.`);
				continue;
			}

			debug.write(LogType.DEBUG, `TaskManager: CompleteTaskMessage / Removing ${amount} of item ${
				GameData.items().item(itemId).name}.`);
			context.inventoryManager!.removeItem(itemId, amount);
		}

		// If we didn't get any items, then stop here.
		if (job.itemAmount < 1) {
			debug.debug(`TaskManager: Item Handling / Item amount is ${job.itemAmount}, skipping giving of item.`);
			return;
		}

		// Handle any upgrade interactions.
		switch (packet.UpgradeInteraction) {
			case TaskUpgradeInteraction.UpgradeAutoCook: {
				const itemDef = GameData.items().item(job.itemReward);
				itemReward = itemDef.itemCounterpartId;
				debug.write(LogType.DEBUG, `TaskManager: Item Handling / Auto cooking triggered, item reward changed to ${itemDef.name}.`)
				break;
			}
			case TaskUpgradeInteraction.UpgradeWoodcuttingExtraPlank: {
				// Find the carpentry task that consumes this item.
				const task = TaskDatabase
					.getTaskCategories(TaskType.Carpentry)
					?.flatMap(category => category.tasks)
					?.find(task =>
						task.costs.some(cost => cost.Item === itemReward));

				if (!task) {
					console.error(`TaskManager: CompleteTaskMessage / UpgradeWoodcuttingExtraPlank / Failed to find task for item ${itemReward}.`);
					debug.write(LogType.ERROR, `TaskManager: CompleteTaskMessage / UpgradeWoodcuttingExtraPlank / Failed to find task for item ${itemReward}.`);
					return;
				}

				debug.write(LogType.DEBUG, `TaskManager: Item Handling / Woodcutting extra plank triggered, giving 1 ${
					GameData.items().item(task.itemReward).name}.`);
				context.inventoryManager!.addItem(task.itemReward, 1);
				break;
			}
			case TaskUpgradeInteraction.LampExtraCoal: {
				const task = TaskDatabase
					.getTaskCategories(TaskType.Mining)
					?.flatMap(category => category.tasks)
					?.find(task => task.itemReward === 31);

				if (!task) {
					console.warn(`TaskManager: CompleteTaskMessage / LampExtraCoal / Failed to find task for item 31.`);
					debug.write(LogType.WARNING, `TaskManager: CompleteTaskMessage / LampExtraCoal / Failed to find task for item 31.`);
					return;
				}

				const experience = task.getModifiedExperience(context.game!);

				debug.write(LogType.DEBUG, `TaskManager: Item Handling / Lamp extra coal triggered, giving ${
					task.itemAmount} ${GameData.items().item(task.itemReward).name} and ${experience} exp.`);

				context.inventoryManager!.addItem(task.itemReward, 1);
				context.skillManager!.addExperience(task.skill, experience);
			}
		}

		const amountToGive = packet.ItemAmount;
		debug.write(LogType.DEBUG, `TaskManager: Item Handling / Giving ${amountToGive} ${
			GameData.items().item(itemReward).name} as final reward item.`);
		context.inventoryManager!.addItem(itemReward, amountToGive);

		if (packet.PotionInteraction !== TaskPotionInteraction.Trickery) {
			return;
		}

		const itemDef = GameData.items().item(itemReward);
		debug.write(LogType.DEBUG, `TaskManager: Item Handling / Trickery triggered, giving ${
			itemDef.baseValue} gold.`)
		context.inventoryManager!.addItem(ItemDatabase.GOLD_ITEM_ID, itemDef.baseValue);

	}, [], PacketType.CompleteTaskMessage);

	usePacket<CompleteTaskMessage>(packet => {
		const current = currentTask.content();
		const job = current?.task;

		if (current === null || job === undefined) {
			debug.warn("TaskManager: Experience Handling / Received CompleteTaskMessage, but we're not doing any tasks.");
			return;
		}

		if (job.taskType !== packet.TaskType || job.taskId !== packet.TaskId) {
			debug.warn(`TaskManager: Experience Handling / Received CompleteTaskMessage, but the task type or id doesn't match. Packet: ${packet}, current: ${current}.`);
		}

		let xp = job.getModifiedExperience(context.game!);
		debug.debug(`TaskManager: Experience Handling / Original experience ${xp}.`);

		if (packet.UsedConsumableItemId > 0) {
			const itemDef = GameData.items().item(packet.UsedConsumableItemId);
			const original = xp;
			xp = IdleClansMath.get().multiply_by_percentage_float_float(xp, itemDef.inventoryConsumableBoost?.boostPercentage ?? 0);
			debug.debug(`TaskManager: Experience Handling / Consumable item used ${
				packet.UsedConsumableItemId}, original experience ${original}, new experience ${xp}.`);
		}

		if (packet.ItemAmount < 2) {
			context.skillManager!.addExperience(job.skill, xp);
			debug.debug(`TaskManager: Experience Handling / Received less than two items, giving ${
				xp} ${Skill[job.skill]} exp.`);
		} else if (job.taskType !== TaskType.Woodcutting && job.taskType !== TaskType.Fishing) {
			// TODO: Refactor.
			context.skillManager!.addExperience(job.skill, xp);
			debug.debug(`TaskManager: Experience Handling / Type is not woodcutting or fishing, giving ${
				xp} ${Skill[job.skill]} exp.`);
		} else {
			let upgrade: number;
			if (job.taskType === TaskType.Woodcutting) {
				upgrade = UpgradeType.upgrade_upgraded_lumberjack;
				debug.debug(`TaskManager: Experience Handling / We're doing woodcutting, upgraded lumberjack will be checked.`)
			} else if (job.taskType === TaskType.Fishing) {
				upgrade = UpgradeType.upgrade_upgraded_fisherman;
				debug.debug(`TaskManager: Experience Handling / We're  doing fishing, upgraded fisherman will be checked.`)
			} else {
				debug.error(`TaskManager: CompleteTaskMessage / Task type isn't supported at this stage! Task type ${job.taskType}.`);
				return;
			}

			if (!context.playerManager?.isUpgradeUnlocked(upgrade)) {
				context.skillManager!.addExperience(job.skill, xp);
				debug.debug(`TaskManager: Experience Handling / We didn't have the upgrade, giving ${xp} ${Skill[job.skill]} exp.`);
			} else {
				const original = xp;
				xp = IdleClansMath.get().multiply_by_percentage_float_float(xp, 25);
				context.skillManager!.addExperience(job.skill, xp);
				debug.debug(`TaskManager: Experience Handling / We had the upgrade, giving ${xp} ${Skill[job.skill]} exp, up from ${original}.`);
			}
		}

		if (packet.UpgradeInteraction !== TaskUpgradeInteraction.UpgradeAutoCook) {
			return;
		}

		const itemDef = ItemDatabase.item(job.itemReward);
		const cookedItemId = itemDef.itemCounterpartId;

		debug.debug(`TaskManager: Experience Handling / Auto cooking triggered, item to give xp for is ${
			ItemDatabase.item(cookedItemId).name}`);

		// Find the cooking task that produces the cooked item.
		const task = TaskDatabase
			.getTaskCategories(TaskType.Cooking)
			?.flatMap(category => category.tasks)
			?.find(task => task.itemReward === cookedItemId);

		if (!task) {
			debug.error(`TaskManager: CompleteTaskMessage / UpgradeAutoCook / Failed to find task for item ${cookedItemId}.`);
			return;
		}


		const level = context.skillManager!.getLevel(task.skill);
		if (task.levelRequirement > level) {

			debug.debug(`TaskManager: Experience Handling / Auto cooking triggered, but we aren't high enough level to gain the experience. ${
				task.levelRequirement} > ${level}, skill ${Skill[task.skill]}.`);

			return;
		}

		const exp = task.getModifiedExperience(context.game!);
		context.skillManager!.addExperience(task.skill, exp);
		debug.debug(`TaskManager: Experience Handling / Auto cooking triggered, giving ${exp} exp to ${Skill[task.skill]}.`);
	}, [], PacketType.CompleteTaskMessage);

	usePacket<CompleteTaskMessage>(packet => {
		const current = currentTask.content();
		const job = current?.task;

		if (current === null || job === undefined) {
			debug.warn("TaskManager: Task Handling / Received CompleteTaskMessage, but we're not doing any tasks.");
			return;
		}

		if (job.taskType !== packet.TaskType || job.taskId !== packet.TaskId) {
			debug.warn(`TaskManager: Task Handling / Received CompleteTaskMessage, but the task type or id doesn't match. Packet: ${packet}, current: ${current}.`);
		}

		// If we can't afford the task, stop it.
		if (!job.canAfford(context.game!)) {
			// TODO: Notify the player somehow.
			debug.debug(`TaskManager: Task Handling / Can't afford task, stopping current task.`);
			currentTask.setContent(null);
			return;
		}

		// We can afford to do the task again, so restart it.
		debug.debug(`TaskManager: Task Handling / Restarting current task.`);
		current.start = Date.now();

	}, [], PacketType.CompleteTaskMessage);

	/*
	 * Events
	 */

	useIdleEvent(GameEvents.ConnectedPostEvent, data => {
		// Check if we need to continue a task.

		// We do this in the ConnectedPostEvent as we need all managers to have
		// been initialized.

		const progress = data.SkillingOfflineProgress;
		if (progress === null) return;

		if (progress.TaskTypeToContinue !== TaskType.None) {
			const type = progress.TaskTypeToContinue;
			const id = progress.TaskIdToContinue;
			const task = TaskDatabase.getTaskById(type, id);

			if (task !== undefined && task.canAfford(context.game!)) {
				currentTask.setContent({
					task: task,
					start: Date.now()
				});
				debug.debug(`TaskManager: initialize / Continuing task ${task.name} (type: ${type}, id: ${id})`);
			} else if (task === undefined) {
				debug.warn(`TaskManager: initialize / Failed to find task to continue for type ${type} and id ${id}.`);
			}
		}
	});

	/*
	 * Initialization
	 */

	const initialize = (data: LoginDataMessage) => {
		// Check if we need to handle skilling offline progress.
		if (data.SkillingOfflineProgress !== null) {
			const progress = data.SkillingOfflineProgress;

			// Check if we gained any items while offline.
			if (progress.ReceivedItemIds !== null) {
				if (progress.ReceivedItemIds.length !== progress.ReceivedItemAmounts?.length)
					debug.error("TaskManager: initialize / ReceivedItemAmounts and ReceivedItemIds are not the same length.");

				progress.ReceivedItemIds.forEach((id, index) => {
					const count = progress.ReceivedItemAmounts?.[index] ?? 0;
					context.inventoryManager!.addItem(id, count);
					debug.debug(`TaskManager: initialize / Received item ${ItemDatabase.item(id).name} x ${count}.`);
				});
			}

			// Check if we lost any items while offline.
			if (progress.ItemsLost !== null) {
				if (progress.ItemsLost.length !== progress.ItemsLostAmounts?.length)
					debug.error("TaskManager: initialize / ItemsLostAmounts and ItemsLost are not the same length.");

				progress.ItemsLost.forEach((id, index) => {
					const count = progress.ItemsLostAmounts?.[index] ?? 0;
					context.inventoryManager!.removeItem(id, count);
					debug.debug(`TaskManager: initialize / Lost item ${ItemDatabase.item(id).name} x ${count}.`);
				});
			}

			// Check if we gained any experience while offline.
			if (progress.OfflineProgressSkills !== null) {
				if (progress.OfflineProgressSkills.length !== progress.OfflineExperiences?.length)
					debug.error("TaskManager: initialize / OfflineExperiences and OfflineProgressSkills are not the same length.");

				progress.OfflineProgressSkills.forEach((skill, index) => {
					const exp = progress.OfflineExperiences?.[index] ?? 0;
					context.skillManager!.addExperience(skill, exp);
					debug.debug(`TaskManager: initialize / Gained ${exp} exp in skill ${Skill[skill]}.`);
				});
			}
		}
	}

	const cleanup = () => {
		currentTask.setContent(null);
	}

	return {
		$managerName: "taskManager",

		currentTask: currentTask,

		activateTask: activateTask,

		initialize: initialize,
		cleanup: cleanup,
	}
}