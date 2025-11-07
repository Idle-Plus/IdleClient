import React from "react";
import { Upgrade, UpgradeDatabase } from "@idleclient/game/data/UpgradeDatabase.ts";
import { Clan } from "@idleclient/types/clan/Clan.ts";
import { ClanMember } from "@idleclient/types/clan/ClanMember.ts";
import { GameMode, Skill, UpgradeType } from "@idleclient/network/NetworkData.ts";
import { ItemStack } from "@idleclient/types/gameTypes.ts";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import { ClanRank } from "@idleclient/types/clan/ClanRank.ts";
import { ItemIcon, SpriteIcon } from "@components/icon";
import { TextUtils } from "@idleclient/utils/TextUtils.tsx";

const ClanUpgrade: React.FC<{ upgrade: Upgrade, clan: Clan, playerMember: ClanMember }> =
	({upgrade, clan, playerMember}) => {
		const mode = playerMember.mode;

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
			const mode = playerMember.mode;
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
				className={"relative w-full h-full flex flex-col space-y-2 text-white bg-ic-dark-400 p-4 rounded-md " +
					`select-none transition-all duration-200 ${!hasUnlocked ? "cursor-pointer hover:scale-102" : ""}`}
				onClick={() => {
					if (!meetsRequirements) return;
					if (playerMember.rank !== ClanRank.DEPUTY && playerMember.rank !== ClanRank.LEADER) return;
				}}
			>
				<div className="flex items-center gap-4">
					<SpriteIcon
						icon={upgrade.getSpriteIconId()}
						size={64}
						className="drop-shadow-md drop-shadow-black/50"
					/>
					<div className="">
						<p className="font-semibold text-2xl">{TextUtils.getStyledMessage(upgrade.getLocalizedName())}</p>
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
							<div className="pl-1 flex gap-4">
								{ skillRequirements
									.filter((req) => req.level > 0)
									.map((req, index) => (
										<div key={index} className="flex items-center gap-1">
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
							<div className="pl-1 flex gap-4">
								{ itemRequirements.map((req, index) => (
									<div key={index} className="flex items-center gap-1">
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

const ClanUpgradesTab: React.FC<{ clan: Clan, playerMember: ClanMember }> = ({ clan, playerMember }) => {
	const upgrades = UpgradeDatabase.clanUpgrades().filter(upgrade => !upgrade.discontinued);
	const totalUnlocked = upgrades.filter(upgrade => clan.hasUpgrade(upgrade.type)).length;

	return (
		<div className="p-4 space-y-2">

			{/* Credits - Unlocked */}
			<div className="flex justify-between">
				<div className="w-fit px-2 py-1 bg-ic-dark-400 text-gray-300 text-lg rounded-md select-none">
					Credits: <span className="text-gray-100">{clan.credits.toLocaleString()}</span>
				</div>

				<div className="w-fit px-2 py-1 bg-ic-dark-400 text-gray-300 text-lg rounded-md select-none">
					<span>Unlocked: </span>
					<span className="text-gray-100">
						{totalUnlocked}
						<span className="text-gray-300"> / </span>
						{upgrades.length}
					</span>
				</div>
			</div>

			{/* Upgrades */}
			<div className="grid grid-cols-3 place-content-start place-items-center gap-4">
				{ upgrades.map((upgrade, index) => (
					<ClanUpgrade key={index} upgrade={upgrade} clan={clan} playerMember={playerMember} />
				)) }
			</div>
		</div>
	);
}

export default ClanUpgradesTab;