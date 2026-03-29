import { Clan } from "@idleclient/types/clan/Clan.ts";
import React, { JSX, useEffect, useState } from "react";
import { useGame } from "@context/GameContext.tsx";
import { ClanRank } from "@idleclient/types/clan/ClanRank.ts";
import NewClanInfoTab from "@pages/game/clan/tabs/NewClanInfoTab.tsx";
import ClanQuestsTab from "@pages/game/clan/tabs/ClanQuestsTab.tsx";
import NewClanQuestsTab from "@pages/game/clan/tabs/NewClanQuestsTab.tsx";
import { Upgrade, UpgradeDatabase } from "@idleclient/game/data/UpgradeDatabase.ts";
import { ClanMember } from "@idleclient/types/clan/ClanMember.ts";
import { GameMode, Skill, UpgradeType } from "@idleclient/network/NetworkData.ts";
import { ItemStack } from "@idleclient/types/gameTypes.ts";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import { ItemIcon, SpriteIcon } from "@components/icon";
import { TextUtils } from "@idleclient/utils/TextUtils.tsx";
import ClanUpgradesTab from "@pages/game/clan/tabs/ClanUpgradesTab.tsx";
import ClanPropertyTab from "@pages/game/clan/tabs/ClanPropertyTab.tsx";
import ClanManagementTab from "@pages/game/clan/tabs/ClanManagementTab.tsx";

const ClanUpgrade: React.FC<{ upgrade: Upgrade, clan: Clan, player: ClanMember }> =
	({upgrade, clan, player}) => {
		const mode = player.mode;

		let skillRequirements: { skill: Skill, level: number }[] | undefined = undefined;
		if (upgrade.skillRequirements !== undefined && upgrade.skillRequirements.length > 0) {
			skillRequirements = [];
			// We only need tier 0, as it looks like clans don't support multiple tiers.
			upgrade.skillRequirements.forEach(entry =>
				skillRequirements!.push({ skill: entry.Skill ?? Skill.None, level: entry.Requirements[0] }));
		}

		let itemRequirements: ItemStack[] | undefined = undefined;
		if (upgrade.itemCosts !== undefined && upgrade.itemCosts.length > 0) {
			itemRequirements = [];
			upgrade.itemCosts.forEach(entry =>
				itemRequirements!.push({ id: entry.Item ?? 0, count: entry.Amount ?? 0 }));
		}

		const cost = upgrade.clanCreditCost ?? -1;

		let meetsWayOfGenie = true;
		let requiredSkillingPartyCompletions = 0;
		if (upgrade.type === UpgradeType.clan_upgrade_ways_of_the_genie) {
			requiredSkillingPartyCompletions = 1000;
			const completions = clan.skillingPartyCompletions;
			const mode = player.mode;
			if (mode === GameMode.Ironman) requiredSkillingPartyCompletions = 100;
			else if (mode === GameMode.GroupIronman) requiredSkillingPartyCompletions = 500;
			meetsWayOfGenie = completions >= requiredSkillingPartyCompletions;
		}

		const meetsRequirements = clan.credits >= cost &&
			meetsWayOfGenie &&
			(itemRequirements === undefined || itemRequirements
				.every(entry => clan.vault?.get(entry.id) ?? 0 > entry.count)) &&
			(skillRequirements === undefined || skillRequirements
				.every(entry => SkillUtils.getLevelForExperience(clan.skills?.get(entry.skill) ?? 0) >= entry.level));

		const hasUnlocked = clan.hasUpgrade(upgrade.type) ||
			(mode === GameMode.Ironman && upgrade.disabledForIronman);

		return (
			<div
				className={"relative w-full h-full p-2 bg-ic-dark-300 shadow-black/25 shadow-md rounded-md " +
					`select-none ${!hasUnlocked ? "cursor-pointer" : ""}`}
				onClick={() => {
					if (!meetsRequirements) return;
					if (player.rank !== ClanRank.DEPUTY && player.rank !== ClanRank.LEADER) return;
				}}
			>
				<div className="h-full flex flex-col space-y-2">
					<div className="flex items-center gap-4">
						<SpriteIcon
							icon={upgrade.getSpriteIconId()}
							size={64}
							className="drop-shadow-md drop-shadow-black/50"
						/>
						<div className="">
							<p className="text-white font-semibold text-2xl">{TextUtils.getStyledMessage(upgrade.getLocalizedName())}</p>
							<p className="text-gray-300">
								<span>Credits: </span>
								<span className={
									(clan.credits >= cost || hasUnlocked) ?
										"text-gray-200" :
										"text-ic-red-200"
								}>
								{Math.min(clan.credits, cost).toLocaleString()}
							</span>
								<span> / </span>
								<span className="text-gray-200">{cost.toLocaleString()}</span>
							</p>
						</div>
					</div>

					<div className="bg-ic-dark-200 p-2 rounded-sm grow text-gray-200">
						{TextUtils.getStyledMessage(upgrade.getLocalizedDescription())}
					</div>

					{ (skillRequirements !== undefined || itemRequirements !== undefined ||
						requiredSkillingPartyCompletions > 0) && (
						<div className="bg-ic-dark-200 px-2 pb-2 space-y-1 rounded-sm text-gray-200">
							<div className="font-semibold text-lg text-gray-200">Requirements</div>

							{ requiredSkillingPartyCompletions > 0 && (
								<p className="text-gray-300 tbox-trim-both-cap">
									<span>Skilling party runs: </span>
									<span className={
										(clan.skillingPartyCompletions >= requiredSkillingPartyCompletions || hasUnlocked) ?
											"text-gray-200" :
											"text-ic-red-200"
									}>
									{Math.min(clan.skillingPartyCompletions, requiredSkillingPartyCompletions).toLocaleString()}
								</span>
									<span> / </span>
									<span className="text-gray-200">{requiredSkillingPartyCompletions.toLocaleString()}</span>
								</p>
							) }

							{ skillRequirements !== undefined && (
								<div className="pl-1 flex gap-2 justify-center 2xs:justify-start">
									{ skillRequirements
										.filter((req) => req.level > 0)
										.map((req, index) => (
											<div
												key={index}
												className="flex flex-col 2xs:flex-row items-center gap-2 2xs:gap-1"
												title={`Lv. ${req.level} ${SkillUtils.getLocalizedSkillName(req.skill)}`}
											>
												<SpriteIcon
													icon={SkillUtils.getSpriteIconId(req.skill, 32)}
													size={28}
													className="drop-shadow-md drop-shadow-black/35"
												/>
												<span className={`tbox-trim-both-cap ${
													(clan.getSkillLevel(req.skill) >= req.level || hasUnlocked) ?
														"text-gray-200" :
														"text-ic-red-200"
												}`}>
													{req.level}
												</span>
											</div>
										))
									}
								</div>
							) }

							{ itemRequirements !== undefined && (
								<div className="pl-1 flex gap-2 justify-center 2xs:justify-start">
									{ itemRequirements.map((req, index) => (
										<div key={index} className="flex flex-col 2xs:flex-row items-center gap-1">
											<ItemIcon
												item={req.id}
												size={28}
												spriteSize={32}
												className="drop-shadow-md drop-shadow-black/35"

												itemTooltip={{
													positionPadding: 4,
												}}
											/>
											<span className={`tbox-trim-both-cap ${
												(clan.hasVaultItem(req.id, req.count) || hasUnlocked) ?
													"text-gray-200" :
													"text-ic-red-200"
											}`}>
										{req.count}
									</span>
										</div>
									)) }
								</div>
							) }
						</div>
					) }
				</div>

				{ hasUnlocked && (
					<div
						className={"absolute inset-0 flex items-center justify-center text-white text-2xl font-bold " +
							"bg-ic-dark-500/75 rounded-md select-none"}
					>
						Unlocked
					</div>
				) }
			</div>
		);
	}

const NewClanUpgradesTab: React.FC<{ clan: Clan, player: ClanMember }> = ({ clan, player }) => {
	const upgrades = UpgradeDatabase.clanUpgrades().filter(upgrade => !upgrade.discontinued);
	const totalUnlocked = upgrades.filter(upgrade => clan.hasUpgrade(upgrade.type)).length;

	return (
		<div className="p-4 bg-ic-dark-500/75">
			<div className="flex justify-between pb-2">
				<div className="w-fit px-2 bg-ic-dark-400/0 text-gray-300 text-lg rounded-md select-none">
					Credits: <span className="text-gray-100">{clan.credits.toLocaleString()}</span>
				</div>

				<div className="w-fit px-2 bg-ic-dark-400/0 text-gray-300 text-lg rounded-md select-none">
					<span>Unlocked: </span>
					<span className="text-gray-100">
						{totalUnlocked}
						<span className="text-gray-300"> / </span>
						{upgrades.length}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 place-content-start place-items-center gap-4">
				{ upgrades.map((upgrade, index) => (
					<ClanUpgrade key={index} upgrade={upgrade} clan={clan} player={player} />
				)) }
			</div>
		</div>
	);
}

enum ClanTab {
	Clan,
	Quests,
	Property,
	Upgrades,
	Management
}

const NewClanView = ({
	clan
}: { clan: Clan }) => {
	const game = useGame();
	const [currentTab, setCurrentTab] = useState<ClanTab>(ClanTab.Clan);

	const name = game.player.username.content();
	const player = clan.members.get(name)!;
	const rank = player.rank;
	const isDeputyOrHigher = rank === ClanRank.DEPUTY || rank === ClanRank.LEADER;

	// Refresh the clan state when we visit the clan page.
	useEffect(() => {
		game.clan.network.refreshClanPage();
		game.clan.network.refreshClanVault();
		game.clan.network.refreshClanBulletinBoard();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="max-w-7xl min-h-full flex flex-col mx-auto">
			<div className="flex bg-ic-dark-500/75 p-1 mb-2 text-xl text-gray-200 gap-1 overflow-x-auto select-none">
				{ Object.keys(ClanTab).map(Number)
					.filter(v => !isNaN(v)).filter(v => v !== ClanTab.Management || isDeputyOrHigher)
					.map((tab, index) => (
						<div
							key={index}
							className={`px-4 py-1 transition-colors ${
								currentTab === tab
									? "text-white bg-ic-light-500"
									: "cursor-pointer bg-ic-light-500/50  hover:bg-ic-light-400/50 hover:text-white"
							}`}
							onClick={() => setCurrentTab(tab)}
						>
							{ ClanTab[tab] }
						</div>
					)) }
			</div>

			{ currentTab === ClanTab.Clan && (<NewClanInfoTab clan={clan} player={player} />) }
			{ currentTab === ClanTab.Quests && (<NewClanQuestsTab clan={clan} />) }
			{ currentTab === ClanTab.Property && (<ClanPropertyTab clan={clan} playerMember={player} />) }
			{ currentTab === ClanTab.Upgrades && (<NewClanUpgradesTab clan={clan} player={player} />) }
			{ isDeputyOrHigher && currentTab === ClanTab.Management && (<ClanManagementTab clan={clan} />) }
		</div>
	);
}

export default NewClanView;