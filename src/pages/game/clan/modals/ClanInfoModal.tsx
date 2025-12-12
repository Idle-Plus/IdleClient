import React, { useEffect, useRef, useState } from "react";
import BaseModal, { BaseModalCloseButton, BaseModalProps } from "@components/modal/BaseModal.tsx";
import { ClanRecruitmentResult, IdleClansAPI } from "@/api/IdleClansAPI.ts";
import { Loader } from "@components/Loader.tsx";
import { ClanRank } from "@idleclient/types/clan/ClanRank.ts";
import { UpgradeDatabase } from "@idleclient/game/data/UpgradeDatabase.ts";
import { SpriteIcon } from "@components/icon";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import Tooltip from "@components/Tooltip.tsx";
import { toFixedNoRoundTrimLocale as toFixedNRTL } from "@idleclient/game/utils/numberUtils.ts";
import { ClanCategory, Skill } from "@idleclient/network/NetworkData.ts";
import AutoSizer from "react-virtualized-auto-sizer";
import { FaCheck } from "react-icons/fa";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { ClanHouseDatabase } from "@idleclient/game/data/ClanHouseDatabase.ts";
import { LocalizationDatabase } from "@idleclient/game/data/LocalizationDatabase.ts";

const ClanInfoContainer: React.FC<{ data: ClanRecruitmentResult, mounted: boolean }> = ({ data, mounted }) => {
	const clan = data.result!;

	const totalLevel = Object.values(clan.skills)
		.reduce((a, b) => a + SkillUtils.getLevelForExperience(b), 0);
	const skillProgress = Object.fromEntries(SkillUtils.getSkills()
		.map(skill => [skill, SkillUtils.getLevelProgress(clan.skills[skill] ?? 0)]));

	const getSkillTooltip = (skill: Skill) => {
		const progress = skillProgress[skill];
		return (
			<div className="flex flex-col text-gray-300 text-base/5">
				<p className="font-bold text-center text-white mb-1">{SkillUtils.getLocalizedSkillName(skill)}</p>
				<p>Total: <span className="text-gray-100">{toFixedNRTL(progress.totalXp, 1)}</span></p>
				<p>
					Current:
					<span className="text-gray-100"> {toFixedNRTL(progress.currentXp, 1)} </span>
					/
					<span className="text-gray-100"> {toFixedNRTL(progress.targetXp, 1)}</span>
				</p>
				<p>
					Remaining: <span className="text-gray-100">{toFixedNRTL(progress.targetXp - progress.currentXp, 1)}</span>
				</p>
			</div>
		);
	}

	// Sections

	const Members = (width: number, height: number) => {
		return (
			<div className="p-2 overflow-y-auto ic-scrollbar" style={{width: width, height: height}}>
				{ clan.members.map((member, index) => (
					<div key={index} className="text-gray-300">
						{index + 1}. <span className="text-ic-light-200">{member.name}</span>
						{ member.rank === ClanRank.LEADER ? " - Leader" :
							member.rank === ClanRank.DEPUTY ? " - Deputy" : "" }
					</div>
				)) }
			</div>
		);
	}

	const Upgrades = (width: number, height: number) => {
		return (
			<div className="p-2 space-y-1 overflow-y-auto ic-scrollbar" style={{width: width, height: height}}>
				{ UpgradeDatabase.clanUpgrades().map((upgrade, index) => (
					<div
						key={index}
						className={`w-full flex items-center p-0.5 rounded ${clan.upgrades.indexOf(upgrade.type) !== -1 ?
							"bg-ic-light-500" : "bg-ic-red-500"}`}
					>
						<SpriteIcon
							icon={upgrade.getSpriteIconId() + "_32"}
							size={32}
							className="drop-shadow-black/50 drop-shadow-sm select-none"
						/>

						<span className="ml-1">{upgrade.getLocalizedName()}</span>

						{clan.upgrades.indexOf(upgrade.type) !== -1 && (
							<FaCheck className="ml-auto mr-2 text-ic-light-000" />
						)}
					</div>
				)) }
			</div>
		);
	}

	const Skills = (width: number, height: number) => {
		return (
			<div
				className="grid grid-cols-2 p-2 gap-2 place-content-start overflow-y-auto ic-scrollbar"
				style={{width: width, height: height}}
			>
				{ SkillUtils.getSkills().map((skill, index) => (
					<Tooltip
						key={index}
						value={getSkillTooltip(skill)}
						delay={300}
						className="flex items-center gap-2 p-2 bg-ic-dark-300 rounded"
					>
						<SpriteIcon
							icon={SkillUtils.getSpriteIconId(skill, 32)}
							size={32}
							className="drop-shadow-black/50 drop-shadow-sm"
						/>
						<div className="w-full">
							<span>Lv. <span className="text-gray-100">{skillProgress[skill].level}</span></span>
							<div className="relative w-full h-1 bg-ic-light-700 rounded-md">
								<div
									className="absolute h-1 bg-ic-light-200 rounded-md"
									style={{ width: (skillProgress[skill].progress * 100) + "%" }}
								/>
							</div>
						</div>
					</Tooltip>
				)) }
			</div>
		);
	}

	return (
		<div className="w-full grow grid grid-cols-1 lg:grid-cols-4 gap-4">
			<div className="flex flex-col">
				<p className="pl-1 text-xl font-bold text-gray-100">Members ({clan.members.length} / {SettingsDatabase.shared().guildMaxMembers})</p>
				<div className="w-full h-full min-h-96 bg-ic-dark-600 text-lg">
					{ !mounted ? (
						<div className="w-full h-full content-center">
							<Loader title="" />
						</div>
					) : (
						<AutoSizer>
							{({ width, height }) => Members(width, height)}
						</AutoSizer>
					)}
				</div>
			</div>

			{/* Upgrades */}
			<div className="flex flex-col">
				<p className="pl-1 text-xl font-bold text-gray-100">Upgrades ({clan.upgrades.length} / {UpgradeDatabase.clanUpgrades().length})</p>
				<div className="w-full h-full min-h-128 bg-ic-dark-600 text-lg text-gray-100">
					{ !mounted ? (
						<div className="w-full h-full content-center">
							<Loader title="" />
						</div>
					) : (
						<AutoSizer>
							{({ width, height }) => Upgrades(width, height)}
						</AutoSizer>
					)}
				</div>
			</div>

			{/* Skills */}
			<div className="flex flex-col">
				<p className="pl-1 text-xl font-bold text-gray-100">Skills ({totalLevel})</p>
				<div className="w-full h-full min-h-128 bg-ic-dark-600 text-lg text-gray-300 select-none">
					{ !mounted ? (
						<div className="w-full h-full content-center">
							<Loader title="" />
						</div>
					) : (
						<AutoSizer>
							{({ width, height }) => Skills(width, height)}
						</AutoSizer>
					)}
				</div>
			</div>
			<div className="flex flex-col">
				<p className="pl-1 text-xl font-bold text-gray-100">Recruitment</p>
				<div className="w-full h-full flex flex-col gap-2 p-3 pt-1 pb-4 bg-ic-dark-600">

					<div className="w-full h-full flex flex-col text-lg text-gray-300">
						<p>Activity score: <span className="text-gray-100">{clan.activityScore} / 100</span></p>
						<p>Recruiting: <span className="text-gray-100">{clan.recruiting ? "Yes" : "No"}</span></p>
						<p>Clan House: <span className="text-gray-100">{clan.houseId === -1 ? "None" :
							LocalizationDatabase.get(ClanHouseDatabase.getHouse(clan.houseId)?.name ?? "null")} (T{clan.houseId + 1})</span></p>
						<p>Language: <span className="text-gray-100">{clan.language}</span></p>
						<p>Category: <span className="text-gray-100">{ClanCategory[clan.category]}</span></p>
						<p>Total level required: <span className="text-gray-100">{clan.totalLevelRequirement}</span></p>

						<p className="pt-4 font-semibold text-white">Recruitment Message</p>
						<div className="h-full overflow-y-auto">
							{clan.recruitmentMessage}
						</div>
					</div>

					<div className="w-full">
						<IdleButton
							title={"Apply"}
							className="w-full"
						></IdleButton>
					</div>
				</div>
			</div>
		</div>
	);
}

interface ClanInfoModalProps extends BaseModalProps {
	name: string;
	value?: ClanRecruitmentResult;
}

export const ClanInfoModalId = "ClanInfoModal";
export const ClanInfoModal: React.FC<ClanInfoModalProps> = ({ active, onClose, name, value }) => {
	const [mounted, setMounted] = useState(false);
	const [data, setData] = useState<ClanRecruitmentResult | null>(value ?? null);
	const [error, setError] = useState<string | null>(null);
	const workingRef = useRef(value !== undefined);

	useEffect(() => {
		if (workingRef.current) return;
		workingRef.current = true;

		IdleClansAPI.Clan.getRecruitment(name)
			.then(result => {
				if (result.error === undefined) {
					setData(result);
					return;
				}

				switch (result.error) {
					case "not_found":
						setError(`Couldn't find a clan named ${name}.`);
						break;
					case "rate_limit":
						setError("You are being rate limited, try again soon.");
						break;
				}
			}).catch(_ => setError("Failed to load clan info, try again soon."))
			.finally(() => workingRef.current = false);
	}, [name]);

	return (
		<BaseModal
			active={active}
			onClose={onClose}
			onMounted={() => setMounted(true)}
			className="xl:px-10! 2xl:px-48!"
		>
			<div className="relative w-full h-full flex flex-col py-4 px-4 bg-ic-dark-500 shadow-black/25 shadow-md rounded-md overflow-y-auto ic-scrollbar">
				<p className="w-full text-center text-3xl font-bold text-white">
					{data?.result?.name ?? name}
					{((data?.result?.tag ?? "").length > 0) && <span className="font-medium text-gray-300"> [{(data?.result?.tag ?? "")}]</span>}
				</p>
				<BaseModalCloseButton close={onClose} className="absolute top-2 right-2" />

				{ (() => {
					if (error === null && data === null) {
						return (
							<div className="h-full flex justify-center items-center">
								<Loader title="Loading" />
							</div>
						);
					}

					if (error !== null) {
						return (
							<div className="h-full flex justify-center items-center">
								<p className="text-2xl text-ic-red-200">{error}</p>
							</div>
						);
					}

					return <ClanInfoContainer data={data!} mounted={mounted} />;
				})() }
			</div>
		</BaseModal>
	)
}