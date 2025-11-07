import React, { JSX } from "react";
import { Clan } from "@idleclient/types/clan/Clan.ts";
import { DateCountdown } from "@components/DateCountdown.tsx";
import { DailyGuildQuest } from "@idleclient/network/NetworkData.ts";
import { useGame } from "@context/GameContext.tsx";
import { TaskDatabase } from "@idleclient/game/data/TaskDatabase.ts";
import { ItemIcon, SpriteIcon } from "@components/icon";
import { LocalizationDatabase } from "@idleclient/game/data/LocalizationDatabase.ts";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { toKMB } from "@idleclient/game/utils/numberUtils.ts";
import useInventoryItemsWatcher from "@hooks/game/inventory/useInventoryItemsWatcher.ts";

export const ClanQuestEntry: React.FC<{ quest: DailyGuildQuest, type: "combat" | "item" }> = ({ quest, type }) => {
	const game = useGame();
	let name: string;
	let icon: JSX.Element;

	if (type === "combat") {
		name = TaskDatabase.getTaskById(quest.Type, quest.EntityId)?.name ?? "unknown_task_name";
		icon = <SpriteIcon icon={`task/combat/${name}`} size={64} canvas={true} />
		name = LocalizationDatabase.get(name);
	} else {
		const item = ItemDatabase.item(quest.EntityId);
		name = item.getLocalizedName();
		icon = <ItemIcon item={quest.EntityId} size={64} canvas={true} />
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const itemCount = type === "item" ? useInventoryItemsWatcher(game, [quest.EntityId])[0] : 0;
	const complete = quest.AmountContributed >= quest.FullAmountRequired;

	const onClick = () => {
		if (complete) return;
	}

	return (
		<div
			className={`bg-ic-dark-200/50 py-2 rounded-md relative transition-all duration-200 ${!complete ?
				"cursor-pointer hover:scale-103 hover:bg-ic-dark-100/80!" : ""}`}
			onClick={onClick}
		>
			<div className="space-y-2">
				<div className="text-center font-semibold text-xl text-ic-light-300">
					{name}
				</div>

				<div className="flex justify-center drop-shadow-md drop-shadow-black/33">
					{icon}
				</div>

				<div className={`text-center ${complete ? "text-ic-light-300" : "text-gray-200"}`}>
					{quest.AmountContributed} / {quest.FullAmountRequired}
					{ (type === "item" && !complete) &&
						<span className="text-gray-400">{` (${toKMB(itemCount, { minK: 1000 })})`}</span>
					}
				</div>
			</div>

			{ complete && (
				<div
					className="absolute inset-0 flex items-center justify-center text-white text-xl select-none
					bg-ic-dark-500/50 border-2 border-ic-dark-600 rounded-md"
				>
					Completed
				</div>
			) }
		</div>
	)
}

const ClanQuestsTab: React.FC<{ clan: Clan }> = ({ clan }) => {
	return (
		<div className="h-full flex flex-col p-4">
			<div className="text-center">
				<p className="text-3xl font-semibold text-white">Daily Quests</p>
				<p className="text-lg text-gray-300">Resets in <DateCountdown date={clan.questsResetDate} /></p>
			</div>

			<div className="grid grid-cols-2 gap-8 mt-2">

				{/* Combat */}
				<div className="bg-ic-dark-500 p-4 mx-auto rounded-md">
					<div className="pb-2 mx-auto text-center">
						<p className="text-2xl text-gray-100">Combat</p>
						<div className='h-0.5 my-1 bg-ic-dark-100/75'/>
						<p className="text-lg text-gray-200">The townsfolk are in trouble! They need your clan to exterminate the following enemies.</p>
					</div>

					<div className="grid grid-cols-[1fr_1fr] justify-center gap-4 mx-auto">
						{ clan.combatQuests.map((quest, index) => (
							<ClanQuestEntry key={index} quest={quest} type={"combat"} />
						)) }
					</div>

					<div className="mt-4 p-2 bg-ic-dark-200/50 rounded-md">
						<h2 className="text-center text-xl text-gray-200">Top Contributors</h2>
						<div className='h-0.5 my-1 bg-ic-dark-100/75'/>
						<ul className="list-decimal pl-5 text-gray-300">
							{ Array.from({length: 3}).map((_, index) => (
								<li key={index} >
									{ clan.combatContributors[index] !== undefined ?
										<span className="text-gray-100">{clan.combatContributors[index]}</span> :
										<span className="italic text-gray-300">None</span>
									}
								</li>
							)) }
						</ul>
					</div>
				</div>

				{/* Items */}
				<div className="bg-ic-dark-500 p-4 mx-auto rounded-md">
					<div className="pb-2 mx-auto text-center">
						<p className="text-2xl text-gray-100">Skilling</p>
						<div className='h-0.5 my-1 bg-ic-dark-100/75'/>
						<p className="text-lg text-gray-200">The townsfolk have requested the following resources from your clan.</p>
					</div>

					<div className="grid grid-cols-[1fr_1fr] justify-center gap-4 mx-auto">
						{ clan.skillingQuests.map((quest, index) => (
							<ClanQuestEntry key={index} quest={quest} type={"item"} />
						)) }
					</div>

					<div className="mt-4 p-2 bg-ic-dark-200/50 rounded-md">
						<h2 className="text-center text-xl text-gray-200">Top Contributors</h2>
						<div className='h-0.5 my-1 bg-ic-dark-100/75'/>
						<ul className="list-decimal pl-5 text-gray-300">
							{ Array.from({length: 3}).map((_, index) => (
								<li key={index} >
									{ clan.skillingContributors[index] !== undefined ?
										<span className="text-gray-100">{clan.skillingContributors[index]}</span> :
										<span className="italic text-gray-300">None</span>
									}
								</li>
							)) }
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ClanQuestsTab;