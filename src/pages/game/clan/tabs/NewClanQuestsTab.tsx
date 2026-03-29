import React, { JSX } from "react";
import { DailyGuildQuest } from "@idleclient/network/NetworkData.ts";
import { useGame } from "@context/GameContext.tsx";
import { TaskDatabase } from "@idleclient/game/data/TaskDatabase.ts";
import { ItemIcon, SpriteIcon } from "@components/icon";
import { LocalizationDatabase } from "@idleclient/game/data/LocalizationDatabase.ts";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import useInventoryItemsWatcher from "@hooks/game/inventory/useInventoryItemsWatcher.ts";
import { toKMB } from "@idleclient/game/utils/numberUtils.ts";
import { Clan } from "@idleclient/types/clan/Clan.ts";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";
import { DateCountdown } from "@components/DateCountdown.tsx";

const ClanQuestEntry: React.FC<{ quest: DailyGuildQuest, type: "combat" | "item" }> = ({ quest, type }) => {
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
			className={`py-2 relative bg-ic-dark-300 rounded-md shadow-black/25 shadow-md transition-all duration-200 ${
				!complete
					? "cursor-pointer hover:scale-102 hover:bg-ic-dark-200"
					: ""
			}`}
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

const NewClanQuestsTab: React.FC<{ clan: Clan }> = ({ clan }) => {
	const game = useGame();

	let creditsPerQuest = SettingsDatabase.shared().clanCreditsPerClanTaskCompletion;
	if (clan.isIronmanClan()) creditsPerQuest *= 3;
	if (game.player.premium.content()) creditsPerQuest *= 1.25;

	return (
		<div className="h-full flex flex-col gap-2 grow">
			<div className="p-4 bg-ic-dark-500/75">
				<div className="text-center text-3xl font-semibold text-white">
					Clan Quests
					<div className="font-normal text-gray-300/75 text-xl/5">Reset in <DateCountdown date={clan.questsResetDate} /></div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-2">

				<div>
					<div className="p-4 bg-ic-dark-500/75">
						<div className="pb-2 text-center text-2xl text-gray-100">Combat</div>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{ clan.combatQuests.map((quest, index) => (
								<ClanQuestEntry key={index} quest={quest} type={"combat"} />
							)) }
						</div>

						<div className="mt-4 p-4 pt-2 bg-ic-dark-300 shadow-black/25 shadow-md rounded-md">
							<div className="text-center text-xl text-gray-100">Combat Contributors</div>
							<div className='h-0.5 my-1 mb-2 bg-ic-dark-100/75'/>
							<ul className="list-decimal pl-5 text-gray-300">
								{ Array.from({length: 3}).map((_, index) => (
									<li key={index} >
										{ clan.combatContributors[index] !== undefined ?
											<div className="text-gray-100 truncate">{clan.combatContributors[index]}</div> :
											<div className="italic text-gray-200 truncate">None</div>
										}
									</li>
								)) }
							</ul>

							<div className="text-right pt-2 tbox-trim-both-cap text-gray-400">Credits per task: {creditsPerQuest}</div>
						</div>
					</div>
				</div>

				<div className="p-4 bg-ic-dark-500/75">
					<div className="pb-2 text-center text-2xl text-gray-100">Skilling</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{ clan.skillingQuests.map((quest, index) => (
							<ClanQuestEntry key={index} quest={quest} type={"item"} />
						)) }
					</div>

					<div className="mt-4 p-4 pt-2 bg-ic-dark-300 shadow-black/25 shadow-md rounded-md">
						<div className="text-center text-xl text-gray-100">Skilling Contributors</div>
						<div className='h-0.5 my-1 mb-2 bg-ic-dark-100/75'/>
						<ul className="list-decimal pl-5 text-gray-300">
							{ Array.from({length: 3}).map((_, index) => (
								<li key={index} >
									{ clan.skillingContributors[index] !== undefined ?
										<div className="text-gray-100 truncate">{clan.skillingContributors[index]}</div> :
										<div className="italic text-gray-200 truncate">None</div>
									}
								</li>
							)) }
						</ul>

						<div className="text-right pt-2 tbox-trim-both-cap text-gray-400">Credits per task: {creditsPerQuest}</div>
					</div>
				</div>

			</div>

			<div className="p-4 bg-ic-dark-500/75 text-lg text-gray-300">
				Complete daily clan quests to earn clan credits, which can be used to purchase upgrades and boosts.
				Quests reset every day at 00:00 UTC, replacing any unfinished ones.
				Each quest awards 16 clan credits (48 for ironman players), increased to 20 (60 for Ironman players)
				if the completing player has premium membership.
			</div>
		</div>
	);
}

export default NewClanQuestsTab;