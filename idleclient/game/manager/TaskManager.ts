import { ManagerContext, ManagerType } from "@context/GameContext.tsx";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { JobTask, TaskDatabase } from "@idleclient/game/data/TaskDatabase.ts";
import usePacket from "@hooks/network/usePacket.ts";
import {
	ActiveTaskCancelledMessage,
	CompleteTaskMessage, LoginDataMessage,
	PacketType,
	Skill, StartTaskMessage,
	TaskStartedMessage,
	TaskType,
} from "@idleclient/network/NetworkData.ts";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { LogType, useConsole } from "@context/ConsoleContext.tsx";
import { Network } from "@idleclient/network/Network.ts";
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
			debug.warn("TaskManager: Task Handling / Received CompleteTaskMessage, but we're not doing any tasks.");
			return;
		}

		if (job.taskType !== packet.TaskType || job.taskId !== packet.TaskId) {
			debug.warn(`TaskManager: Task Handling / Received CompleteTaskMessage, but the task type or id doesn't match. Packet: ${packet}, current: ${current}.`);
		}

		// Update items
		for (const entry of packet.ItemChanges) {
			const itemDef = ItemDatabase.item(entry.ItemId);
			if (entry.Amount > 0) {
				context.inventoryManager!.addItem(entry.ItemId, entry.Amount);
				debug.write(LogType.DEBUG, `TaskManager: Item Handling / Added ${itemDef.name} x ${entry.Amount} to inventory, task ${job.name}`)
			} else if (entry.Amount < 0) {
				context.inventoryManager!.removeItem(entry.ItemId, -entry.Amount);
				debug.write(LogType.DEBUG, `TaskManager: Item Handling / Removed ${itemDef.name} x ${-entry.Amount} from inventory, task ${job.name}`)
			}
		}

		// Update experience
		for (const entry of packet.ExpChanges) {
			context.skillManager!.addExperience(entry.Skill, entry.Amount);
			debug.write(LogType.DEBUG, `TaskManager: Experience Handling / Added ${entry.Amount} exp to ${Skill[entry.Skill]}, task ${job.name}`)
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
					start: Date.now() - progress.ElapsedMs
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