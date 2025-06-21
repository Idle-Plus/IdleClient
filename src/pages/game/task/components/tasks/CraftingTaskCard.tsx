import { GameData } from "@idleclient/game/data/GameData.ts";
import { toFixedNoRoundTrim } from "@idleclient/game/utils/numberUtils.ts";
import { ItemIcon, SpriteIcon } from "@components/icon";
import React, { useRef } from "react";
import { JobTask } from "@idleclient/game/data/TaskDatabase.ts";
import { useGame } from "@context/GameContext.tsx";
import useInventoryItemsWatcher from "@hooks/game/inventory/useInventoryItemsWatcher.ts";
import TaskProgressBar from "@pages/game/task/components/tasks/TaskProgressBar.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import ItemTooltip from "@components/item/ItemTooltip.tsx";

interface CraftingTaskProps {
	task: JobTask
}

const CraftingTaskCard: React.FC<CraftingTaskProps> = ({ task }) => {
	const game = useGame();
	const currentItems = useInventoryItemsWatcher(game, task.costs.map(v => v.Item ?? 0));
	const currentTask = useSmartRefWatcher(game.task.currentTask);

	const infoContainerRef = useRef<HTMLDivElement | null>(null);
	const [hovering, setHovering] = React.useState(false);

	const taskName = GameData.localization().get(task.name);
	const levelRequirement = task.levelRequirement;
	const experience = task.getModifiedExperience(game).toFixed(1).replace(/[.,]0$/, "");
	const time = toFixedNoRoundTrim(task.getModifiedTaskTime(game) / 1000, 1).replace(/[.,]0$/, "");
	const iconDef = GameData.items().item(task.customIconId > 0 ? task.customIconId : task.itemReward);

	const cost = task.getModifiedCosts(game);
	const hasItems = currentItems.every((v, i) => v >= cost[i].amount);
	const hasLevel = game.skill.hasLevel(task.skill, levelRequirement);
	const canDoTask = hasItems && hasLevel;

	const onTaskClicked = () => {
		if (!canDoTask) return;
		game.task.activateTask(task);
	}

	return (
		<div
			key={task.taskId}
			className={`flex flex-col select-none transition-colors duration-200 bg-gradient-to-b from-ic-dark-200/85 ${canDoTask ?
				"to-ic-light-600/85 cursor-pointer hover:to-ic-light-500/85 active:to-ic-light-600/85" :
				"to-ic-red-600/85"} p-3 shadow-black/25 shadow-md`}
			onClick={onTaskClicked}
		>
			{/*<div className="flex justify-center pb-3">
				<span className="text-white font-medium text-2xl">{taskName}</span>
			</div>*/}

			<div className="flex">
				<div className="w-full ml-10 pb-3 text-center text-white font-medium text-2xl">
					{taskName}
				</div>
				<div
					ref={infoContainerRef}
					className="min-w-10 flex items-center justify-center mb-3"
					onMouseEnter={() => setHovering(true)}
					onMouseLeave={() => setHovering(false)}
				>
					<SpriteIcon
						icon={"info_48"}
						size={32}
						canvas={false}
					/>

					{ hovering && infoContainerRef.current !== null && (
						<ItemTooltip
							item={iconDef}
							positions={infoContainerRef.current!}
							positionPadding={4}
							className="shadow-black/25 shadow-md"
						/>
					) }
				</div>
			</div>

			<div className="pb-4 text-center text-gray-200 text-lg/6 grow">
				<div className={!hasLevel ? "text-ic-red-200" : ""}>Level requirement: { levelRequirement }</div>
				<div>{ experience } XP / { task.baseTime > 0 ? `${time} Seconds` : "Instant" }</div>
			</div>

			<div className="flex justify-between pt-8">
				<div className="w-3/5 h-26 pb-2 flex flex-col justify-end drop-shadow-black/25 drop-shadow-sm">
					<div className="text-white font-semibold text-lg">Costs</div>

					{ cost.map((cost, index) => (
						<div
							key={index}
							className={`${ currentItems[index] >= cost.amount ? "text-ic-light-300" : "text-ic-red-200"} whitespace-nowrap font-medium`}
						>
							{ GameData.items().item(cost.itemId).getLocalizedName() }: {cost.amount} ({ currentItems[index].toLocaleString() })
						</div>
					)) }

				</div>
				<div className="w-2/5 flex justify-center">
					<ItemIcon
						item={iconDef}
						size={16 * 5}
						canvas={true}
						className="drop-shadow-black/25 drop-shadow-md"
					/>
				</div>
			</div>

			<div className="w-full h-8 bg-ic-red-500 overflow-hidden shadow-black/20 shadow-sm">
				{ currentTask && currentTask.task.taskType === task.taskType && currentTask.task.taskId === task.taskId && (
					<TaskProgressBar
						currentTask={currentTask.task.taskId === task.taskId ? currentTask : null}
					/>
				) }
			</div>
		</div>
	)
}

export default CraftingTaskCard;