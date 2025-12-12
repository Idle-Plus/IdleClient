import React, { useLayoutEffect, useRef, useState } from "react";
import { Clan } from "@idleclient/types/clan/Clan.ts";
import { PvmStatType, Skill } from "@idleclient/network/NetworkData.ts";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";
import { ClanRank } from "@idleclient/types/clan/ClanRank.ts";
import { ItemIcon, SpriteIcon } from "@components/icon";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { useGame } from "@context/GameContext.tsx";
import { ModalUtils } from "@utils/ModalUtils.tsx";
import { useModal } from "@context/ModalContext.tsx";
import { ClanMember } from "@idleclient/types/clan/ClanMember.ts";
import { RecruitmentCenterModal, RecruitmentCenterModalId } from "@pages/game/clan/modals/RecruitmentCenterModal.tsx";
import Tooltip from "@components/Tooltip.tsx";
import { GameData } from "@idleclient/game/data/GameData.ts";
import {
	toFixedNoRoundLocale,
	toFixedNoRoundTrim,
	toFixedNoRoundTrimLocale
} from "@idleclient/game/utils/numberUtils.ts";
import { ClanInfoModal, ClanInfoModalId } from "@pages/game/clan/modals/ClanInfoModal.tsx";

const ClanMembers: React.FC<{ clan: Clan }> = ({ clan }) => {
	return (
		<div className="absolute inset-0 flex flex-col p-4 pt-2 bg-ic-dark-500 text-gray-200 rounded-md">
			<h1 className="text-2xl font-semibold pb-1">
				Members: {clan.members.size} / {SettingsDatabase.shared().guildMaxMembers}
			</h1>

			<ul
				className="list-decimal flex-1 flex flex-col p-2 pl-9 bg-ic-dark-200/50 rounded-md
						text-lg text-white/75 overflow-y-auto ic-scrollbar"
			>
				{ Array.from(clan.members.values()).map((member, index) => (
					<li
						key={index}
						className={`py-0.25 not-last:border-b-2 not-last:border-b-ic-dark-100/50
								${member.online ? "text-ic-light-300" : "text-ic-red-300"}`}
					>
						<div className="flex items-center">
							{/* Dirty hack to center the icons. */}
							<span className="opacity-0 select-none">.</span>

							{/* Icons */}
							{ (member.vaultAccess || member.rank > ClanRank.MEMBER) && (
								<ItemIcon item={19} spriteSize={32} size={22} className="mr-1" />) }
							{ member.premium && (<SpriteIcon icon={"premium_32"} size={22} className="mr-1" />) }
							{ member.gilded && (<SpriteIcon icon={"gilded_32"} size={22} className="mr-1" />) }

							{/* Name */}
							<span className="truncate">{ member.name }</span>

							{/* Rank */}
							{ member.rank > ClanRank.MEMBER && (
								<>
									<span className="px-1">-</span>
									<span className="capitalize">{ ClanRank[member.rank].toLowerCase() }</span>
								</>
							) }

							{/* Offline time */}
							{ !member.online && (
								<>
									<span className="px-1">-</span>
									<span>{Math.floor((Date.now() - member.logoutTime.getTime()) / (1000 * 60 * 60))}h</span>
								</>
							) }
						</div>
					</li>
				)) }
			</ul>
		</div>
	)
}

const ClanSkill: React.FC<{ clan: Clan, skill: Skill }> = ({ clan, skill }) => {
	const level = SkillUtils.getLevelForExperience(clan.skills?.get(skill) ?? 0);
	const progress = SkillUtils.getLevelProgress(clan.skills?.get(skill) ?? 0);

	return (
		<Tooltip
			value={(
				<div className="flex flex-col text-gray-300 text-base/5">
					<p className="font-bold text-center text-white mb-1">{SkillUtils.getLocalizedSkillName(skill)}</p>
					<p>Total: <span className="text-gray-100">{toFixedNoRoundTrimLocale(progress.totalXp, 1)}</span></p>
					<p>
						Current:
						<span className="text-gray-100"> {toFixedNoRoundTrimLocale(progress.currentXp, 1)} </span>
						/
						<span className="text-gray-100"> {toFixedNoRoundTrimLocale(progress.targetXp, 1)}</span>
					</p>
					<p>
						Remaining: <span className="text-gray-100">{toFixedNoRoundTrimLocale(progress.targetXp - progress.currentXp, 1)}</span>
					</p>
				</div>
			)}
			delay={300}
			direction="bottom"
			offset={4}
			className="w-full flex flex-col items-center pt-2 pb-3 px-2 bg-ic-dark-200/50 rounded-md"
		>
			<SpriteIcon icon={SkillUtils.getSpriteIconId(skill, 32)} size={32} className="mb-1" />
			<p className="text-gray-200">Lv. <span className="text-white"> {level}</span></p>
			<div className="w-full relative">
				<div className="absolute w-full h-1 bg-ic-light-700 rounded-md" />
				<div className="absolute h-1 bg-ic-light-200 rounded-md" style={{ width: (progress.progress * 100) + "%" }} />
			</div>
		</Tooltip>
	);
}

const ClanSkills: React.FC<{ clan: Clan }> = ({ clan }) => {
	return (
		<div className="space-y-1 p-4 pt-2 bg-ic-dark-500 text-gray-300 rounded-md">
			<div className="flex justify-between text-2xl pb-1">
				<div className="font-semibold text-gray-100">Skills</div>
				<div>Total level: <span className="text-gray-100">{clan.getTotalLevel()}</span></div>
			</div>

			<div className="grid grid-cols-5 gap-1 select-none">
				{ SkillUtils.getSkills().map((skill, index) => (
					<ClanSkill key={index} clan={clan} skill={skill} />
				)) }
			</div>
		</div>
	)
}

const ClanPvmStats: React.FC<{ clan: Clan }> = ({ clan }) => {
	const raids = [
		{ type: PvmStatType.ReckoningOfTheGods, icon: "raid/raid_reckoning_of_the_gods", text: "Completions: " },
		{ type: PvmStatType.GuardiansOfTheCitadel, icon: "raid/raid_guardians_of_the_citadel", text: "Completions: " },
		{ type: PvmStatType.BloodmoonMassacre, icon: "raid/raid_bloodmoon_massacre", text: "Highest wave: " },
	]

	const bosses = [
		{ type: PvmStatType.Griffin, icon: "task/combat/griffin" },
		{ type: PvmStatType.Devil, icon: "task/combat/devil" },
		{ type: PvmStatType.Hades, icon: "task/combat/hades" },
		{ type: PvmStatType.Zeus, icon: "task/combat/zeus" },
		{ type: PvmStatType.Medusa, icon: "task/combat/medusa" },
		{ type: PvmStatType.Chimera, icon: "task/combat/chimera" },
		{ type: PvmStatType.Kronos, icon: "task/combat/kronos" },
		{ type: PvmStatType.Sobek, icon: "task/combat/sobek" },
		{ type: PvmStatType.Mesines, icon: "task/combat/mesines" },
		{ type: PvmStatType.MalignantSpider, icon: "task/combat/malignant_spider" },
		{ type: PvmStatType.SkeletonWarrior, icon: "task/combat/skeleton_warrior" },
		{ type: PvmStatType.OtherworldlyGolem, icon: "task/combat/otherworldly_golem" },
	]

	return (
		<div className="space-y-1 p-4 pt-2 bg-ic-dark-500 text-gray-200 rounded-md">
			<h1 className="text-2xl font-semibold pb-1">
				PvM Stats
			</h1>

			{/* Raids */}
			<div className="grid grid-cols-3 gap-1">

				{ raids.map((raid, index) => (
					<div key={index} className="flex flex-col items-center p-2 bg-ic-dark-200/50 rounded-md">
						<SpriteIcon icon={raid.icon + "_48"} size={48} className="drop-shadow-md drop-shadow-black/25" />
						<span>{raid.text}{clan.pvmStats?.stats.get(raid.type) ?? 0}</span>
					</div>
				)) }
			</div>

			{/* Bosses */}
			<div className="grid grid-cols-6 gap-1 pt-1">
				{ bosses.map((boss, index) => (
					<div key={index} className="flex flex-col items-center p-2 pb-1 bg-ic-dark-200/50 rounded-md">
						<SpriteIcon icon={boss.icon + "_48"} size={48} className="drop-shadow-md drop-shadow-black/25" />
						<span>{clan.pvmStats?.stats.get(boss.type) ?? 0}</span>
					</div>
				)) }
			</div>
		</div>
	)
}

const LeaveClanButton = ({ clan, player }: { clan: Clan, player: ClanMember }) => {
	const game = useGame();
	const modals = useModal();
	const action = clan.members.size === 1 ? "Delete" : "Leave";

	const getConfirmationText = () => {
		if (player.rank === ClanRank.LEADER && clan.members.size === 1) return (
			<>
				Are you sure you want to <b>delete</b> your clan? All of its progress will be <b>lost</b>.
				This cannot be undone.
			</>
		);

		if (player.rank === ClanRank.LEADER) return (
			<>
				Are you sure you want to <b>leave</b> your clan? Since you're not alone in the clan,
				leaving will kick you out and leadership will be passed onto someone else.
				Deputy leaders will be prioritized.
			</>
		);

		return <>Are you sure you want to <b>leave</b> your clan?</>;
	}

	const onClick = () => {
		modals.openModal("leaveClanModal", ModalUtils.generalConfirmationModal(
			getConfirmationText(), () => {
				if (player.rank === ClanRank.LEADER) game.clan.network.deleteClan();
				else game.clan.network.leaveClan();
			}, null, { confirmText: action, delay: 10 })
		);
	}

	return (
		<IdleButton
			title={`${action} clan`}
			onClick={onClick}
			bgColor="bg-ic-red-500"
			bgColorHover="hover:bg-ic-red-400"
			bgColorActive="active:bg-ic-red-400"
		/>
	);
}

const ClanInfoTab: React.FC<{ clan: Clan, player: ClanMember }> = ({ clan, player }) => {
	const modals = useModal();

	return (
		<div className="w-full flex flex-col gap-2 p-4">
			<div className="flex justify-between">

				{/*Clan Name*/}
				<span className="text-3xl font-semibold text-white">
					{clan.name}
					{ clan.tag && (<>{` [${clan.tag}]`}</>) }
				</span>

				{/*Buttons*/}
				<div className="space-x-2 text-xl text-white">
					<IdleButton
						title="Recruitment center"
						onClick={() => modals.openModal(RecruitmentCenterModalId, <RecruitmentCenterModal />)}
					/>

					<IdleButton
						title="Bulletin board"
					/>

					<LeaveClanButton clan={clan} player={player} />
				</div>
			</div>

			{/* Members and Stats */}
			<div className="h-full grid grid-cols-[1fr_1.5fr] items-start gap-4">

				{/* Members */}
				<div className="h-full relative">
					<ClanMembers clan={clan} />
				</div>

				{/* Stats */}
				<div className="h-full flex flex-col gap-4">
					{/* Skills */}
					<ClanSkills clan={clan} />
					{/* PvM Stats */}
					<ClanPvmStats clan={clan} />
				</div>
			</div>
		</div>
	)
}

export default ClanInfoTab;