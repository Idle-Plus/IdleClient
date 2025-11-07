import { Skill, TaskType } from "@idleclient/network/NetworkData.ts";
import React, { useMemo, useState } from "react";
import CraftingTaskCard from "@pages/game/task/components/tasks/CraftingTaskCard.tsx";
import { GameData } from "@idleclient/game/data/GameData.ts";
import BasicTaskHeader from "@pages/game/task/components/BasicTaskHeader.tsx";
import GatheringTaskCard from "@pages/game/task/components/tasks/GatheringTaskCard.tsx";
import { TaskDatabase } from "@idleclient/game/data/TaskDatabase.ts";

const TaskTypeToSkill: Record<TaskType, Skill> = {
	[TaskType.None]: Skill.None,
	[TaskType.Woodcutting]: Skill.Woodcutting,
	[TaskType.Fishing]: Skill.Fishing,
	[TaskType.Mining]: Skill.Mining,
	[TaskType.Carpentry]: Skill.Carpentry,
	[TaskType.Smelting]: Skill.None,
	[TaskType.Smithing]: Skill.Smithing,
	[TaskType.Combat]: Skill.None, // Special case.
	[TaskType.Cooking]: Skill.Cooking,
	[TaskType.Foraging]: Skill.Foraging,
	[TaskType.Farming]: Skill.Farming,
	[TaskType.Crafting]: Skill.Crafting,
	[TaskType.Agility]: Skill.Agility,
	[TaskType.Plundering]: Skill.Plundering,
	[TaskType.Enchanting]: Skill.Enchanting,
	[TaskType.Brewing]: Skill.Brewing,
	[TaskType.Exterminating]: Skill.Exterminating,
	[TaskType.ItemCreation]: Skill.None, // Special case.
}

interface BasicTaskPageProps {
	type: TaskType,
}

const BasicTaskPage: React.FC<BasicTaskPageProps> = ({ type }) => {
	const skill = TaskTypeToSkill[type];

	const [currentCategory, setCurrentCategory] = useState(0);
	const categories = useMemo(() => {
		return TaskDatabase.getTaskCategories(type)?.filter(v => !v.disabled);
	}, [type]);

	if (categories === undefined) return null;

	if (currentCategory >= categories.length) {
		setCurrentCategory(0);
	}

	const onSelectTab = (index: number) => {
		if (index >= categories.length) return;
		if (index < 0) return;
		setCurrentCategory(index);
	}

	return (
		<div className="flex flex-col max-w-7xl mx-auto h-full p-4">

			{ skill !== Skill.None && (
				<BasicTaskHeader skill={skill} />
			) }

			{/* Tab List */}
			{ categories && categories.length > 1 && (
				<div className="bg-ic-dark-500/75 mb-2 text-xl">
					<div className="flex overflow-x-auto text-gray-300">
						{categories.map((category, i) => (
							<button
								key={i}
								className={`px-4 py-2 ${
									i === currentCategory
										? "text-white bg-ic-light-500"
										: "hover:bg-ic-light-500/50 hover:text-gray-200"
								}`}
								onClick={() => onSelectTab(i)}
							>
								{GameData.localization().get(category.customId)}
							</button>
						))}
					</div>
				</div>
			) }

			{/* Tasks Grid */}
			<div
				className="bg-ic-dark-400/0 flex-grow overflow-y-auto ic-scrollbar pr-1"
				style={{ scrollbarGutter: "stable" }}
			>
				<div className="max-w-[calc(100% - 122px)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

					{ categories?.[currentCategory]?.tasks?.filter(v => !v.disabled).map((task, _) => {
						if (task.isHarvestingTask() && task.costs.length === 0) return (
							<GatheringTaskCard key={(type * 1000) + task.taskId} task={task} />
						);

						return (
							<CraftingTaskCard key={(type * 1000) + task.taskId} task={task} />
						);
					}) }
				</div>
			</div>
		</div>
	);
}

export default BasicTaskPage;