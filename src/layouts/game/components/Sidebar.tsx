import React, { ReactNode, useEffect, useState } from "react";
import { Skill, TaskType } from "@idleclient/network/NetworkData.ts";
import { useGame } from "@context/GameContext.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { useLocation, useNavigate } from "react-router-dom";
import TaskProgressBar from "@pages/game/task/components/tasks/TaskProgressBar.tsx";
import { SpriteIcon } from "@components/icon";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import logo from "@assets/IdleClansLogo.svg";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";
import { FiSettings } from "react-icons/fi";
import { RiLogoutBoxLine } from "react-icons/ri";
import useSkillWatcher from "@hooks/game/skill/useSkillWatcher.ts";
import Tooltip from "@components/Tooltip.tsx";

interface SidebarEntry {
	icon: ReactNode;
	title: string;
	href: string;
	disabled?: boolean;
	onClick?: () => void;
	style?: { normal?: string; active?: string; disabled?: string; }
	className?: string;
}

interface SidebarSkillEntry extends SidebarEntry {
	skill?: Skill;
	taskType?: TaskType;
}

const SidebarHeader: React.FC<{ title: string }> = ({
	title
}) => {
	return (
		<div className="flex items-center w-full h-6">
			<span className="flex-1 border-b-2 border-ic-light-400 mx-1"/>
			<span className="text-gray-200 text-md font-nunito font-bold">{title}</span>
			<span className="flex-1 border-b-2 border-ic-light-400 mx-1"/>
		</div>
	);
}

const SidebarButton = ({
	icon, title, href, disabled, onClick, style, className
}: SidebarEntry) => {
	const location = useLocation();
	const navigate = useNavigate();
	const active = location.pathname === href;

	let dynamicStyle = active ?
		`text-white bg-ic-light-500 ${style?.active}` :
		`text-gray-300 hover:text-white hover:bg-ic-light-500/50 cursor-pointer ${style?.normal ?? ""}`;
	dynamicStyle = !disabled ? dynamicStyle : `text-gray-300 opacity-50 cursor-not-allowed ${style?.disabled ?? ""}`;

	return (
		<div
			onClick={() => {
				if (disabled || active) return;
				onClick?.();
				navigate(href);
			}}
			className={`flex items-center gap-3 px-2 py-1 transition-all rounded-md select-none ${dynamicStyle} ${className}`}
		>
			<div className="text-xl drop-shadow-ic-dark-600 drop-shadow-sm">{ icon }</div>
			<div className="w-full">
				<div className="flex justify-between items-center">
					<span className="text-lg font-medium tbox-trim-both">{ title }</span>
				</div>
			</div>
		</div>
	);
}

const SidebarSkillButton = ({
	icon, title, href, disabled, onClick, style, className, skill, taskType
}: SidebarSkillEntry) => {
	const game = useGame();
	const task = useSmartRefWatcher(game.task.currentTask);
	const experience = useSkillWatcher(game, skill ?? Skill.None);

	const location = useLocation();
	const navigate = useNavigate();
	const active = location.pathname === href;

	const progress = taskType !== undefined && taskType === task?.task.taskType;
	const level = skill !== undefined ? SkillUtils.getLevelForExperience(experience) : undefined;
	const locked = !game.player.premium.content() && SettingsDatabase.shared().tasksLockedBehindPremium
		.indexOf(taskType ?? TaskType.None) !== -1;

	let dynamicStyle = active ?
		`text-white bg-ic-light-500 ${style?.active}` :
		`text-gray-300 hover:text-white hover:bg-ic-light-500/50 cursor-pointer ${style?.normal ?? ""}`;
	dynamicStyle = !disabled ? dynamicStyle : `text-gray-300 opacity-50 cursor-not-allowed ${style?.disabled ?? ""}`;

	return (
		<div
			onClick={() => {
				if (disabled || active) return;
				onClick?.();
				navigate(href);
			}}
			className={`flex items-center gap-3 px-2 py-1 transition-all rounded-md select-none ${dynamicStyle} ${className}`}
		>
			<div className="text-xl drop-shadow-ic-dark-600 drop-shadow-sm">{ icon }</div>
			<div className="w-full">
				<div className="flex justify-between items-center">
					<span className={`text-lg font-medium tbox-trim-both ${locked ? "text-ic-red-100" : ""}`}>{ title }</span>
					{ (level !== undefined && !locked) && (
						<span className="tbox-trim-both text-white/75">Lv. {level}</span>
					) }

					{ locked && (
						<SpriteIcon icon={"premium_32"} size={26} className="drop-shadow-black/50 drop-shadow-sm" />
					) }
				</div>
				{ progress && (
					<div key={task?.task.taskId ?? -1} className="h-0.75 w-full bg-ic-light-700">
						<TaskProgressBar currentTask={task} />
					</div>
				) }
			</div>
		</div>
	);
}

const Sidebar: React.FC<{ setSidebar: (value: boolean) => void, sidebar: boolean }> = ({ setSidebar, sidebar }) => {
	const [debug, setDebug] = useState(0);

	useEffect(() => {
		if (debug <= 0) return;
		const id = setTimeout(() => setDebug(0), 1500);
		return () => clearTimeout(id);
	}, [debug]);

	const iconSize = 26;

	const topEntries: SidebarEntry[] = [
		{ icon: <SpriteIcon icon={"home_page_32"} size={iconSize} />, title: "Profile", href: '/game' },
		{ icon: <SpriteIcon icon={"inventory_32"} size={iconSize} />, title: "Inventory", href: '/game/inventory' },
	];

	const communityEntries: SidebarEntry[] = [
		{ icon: <SpriteIcon icon={"clan_32"} size={iconSize} />, title: "Clan", href: '/game/clan' },
		{ icon: <SpriteIcon icon={"local_market_32"} size={iconSize} />, title: "Local Market", href: '/game/local-market', disabled: true },
		{ icon: <SpriteIcon icon={"auction_house_32"} size={iconSize} />, title: "Player Market", href: '/game/player-market', disabled: true },
	];

	const activitiesEntries: SidebarSkillEntry[] = [
		{ icon: <SpriteIcon icon={"raids_32"} size={iconSize} />, title: 'Raids', href: '/game/raid', disabled: true },
		{ icon: <SpriteIcon icon={"combat_32"} size={iconSize} />, title: 'Combat', href: '/game/combat', disabled: true },
		{ skill: Skill.Exterminating, icon: null, title: 'Exterminating', href: '/game/skill/exterminating', disabled: true },
		{ taskType: TaskType.Crafting, skill: Skill.Crafting, icon: null, title: 'Crafting', href: '/game/skill/crafting' },
		{ taskType: TaskType.Plundering, skill: Skill.Plundering, icon: null, title: 'Plundering', href: '/game/skill/plundering', disabled: true },
		{ taskType: TaskType.Woodcutting, skill: Skill.Woodcutting, icon: null, title: 'Woodcutting', href: '/game/skill/woodcutting' },
		{ taskType: TaskType.Fishing, skill: Skill.Fishing, icon: null, title: 'Fishing', href: '/game/skill/fishing' },
		{ taskType: TaskType.Mining, skill: Skill.Mining, icon: null, title: 'Mining', href: '/game/skill/mining' },
		{ taskType: TaskType.Smithing, skill: Skill.Smithing, icon: null, title: 'Smithing', href: '/game/skill/smithing' },
		{ taskType: TaskType.Cooking, skill: Skill.Cooking, icon: null, title: 'Cooking', href: '/game/skill/cooking' },
		{ taskType: TaskType.Enchanting, skill: Skill.Enchanting, icon: null, title: 'Enchanting', href: '/game/skill/enchanting', disabled: true },
		{ taskType: TaskType.Foraging, skill: Skill.Foraging, icon: null, title: 'Foraging', href: '/game/skill/foraging' },
		{ taskType: TaskType.Farming, skill: Skill.Farming, icon: null, title: 'Farming', href: '/game/skill/farming' },
		{ taskType: TaskType.Brewing, skill: Skill.Brewing, icon: null, title: 'Brewing', href: '/game/skill/brewing' },
		{ taskType: TaskType.Carpentry, skill: Skill.Carpentry, icon: null, title: 'Carpentry', href: '/game/skill/carpentry' },
		{ taskType: TaskType.Agility, skill: Skill.Agility, icon: null, title: 'Agility', href: '/game/skill/agility', disabled: true },
		{ taskType: TaskType.ItemCreation, icon: <SpriteIcon icon={"item_creation_32"} size={iconSize} />, title: 'Item Creation', href: '/game/skill/itemcreation' },
	];

	const onSidebarButtonClick = () => {
		if (!sidebar) return;
		setSidebar(false);
	}

	return (
		<div className={`fixed top-0 w-64 h-full left-0 flex flex-col bg-ic-dark-500 transition-all duration-300 ${!sidebar && "-left-64! xl:left-0!"} z-3000`}>
			<div className="h-16 min-h-16 flex items-center gap-2 pl-2 select-none">
				<img
					src={logo}
					alt="Idle Clans Logo"
					className={`transition-all duration-300 select-none drop-shadow drop-shadow-black/30`}
					style={{height: "3rem", pointerEvents: "none"}}
				/>
				<div>
					<p className="text-white text-2xl tbox-trim-both-cap font-bold pb-1.5">Idle Client</p>
					<p
						onClick={() => setDebug(prev => (prev + 1) % 4)}
						className="text-gray-300/75 text-sm tbox-trim-both-cap italic cursor-pointer"
					>
						v0.1.0 / v{SettingsDatabase.shared().latestBuildVersion}
						{debug > 0 && <span key={debug} className="text-gray-400/75 scale-pop pl-1"> ({debug}/4)</span>}
					</p>
				</div>
			</div>

			<div className="flex flex-col grow p-2 space-y-1 bg-ic-dark-300 overflow-y-auto sidebar-scrollbar">

				<SidebarHeader title="GENERAL" />

				{ topEntries.map((value, index) => (
					<SidebarButton key={index} {...value} onClick={onSidebarButtonClick} />
				)) }

				<SidebarHeader title="COMMUNITY" />

				{ communityEntries.map((value, index) => (
					<SidebarButton key={index} {...value} onClick={onSidebarButtonClick} />
				)) }

				<SidebarHeader title="ACTIVITIES" />

				{ activitiesEntries.map((value, index) => {
					if (value?.skill !== undefined || value.taskType !== undefined) {
						if (value.icon === null)
							value.icon = <SpriteIcon icon={SkillUtils.getSpriteIconId(value.skill ??
								Skill.None, 32)} size={iconSize} />;
						return (
							<SidebarSkillButton
								key={index}
								{...value}
								onClick={onSidebarButtonClick}
							/>
						);
					}

					return <SidebarButton key={index} {...value} onClick={onSidebarButtonClick} />;
				}) }

				<SidebarHeader title="OTHER" />

				<SidebarButton
					icon={<div className="flex justify-center items-center w-6.5 h-6.5"><FiSettings /></div>}
					title="Settings"
					href="/game/settings"
					onClick={onSidebarButtonClick}
				/>

				<SidebarButton
					icon={<div className="flex justify-center items-center w-6.5 h-6.5"><RiLogoutBoxLine /></div>}
					title="Logout"
					href="/logout"
					style={{ normal: "text-ic-red-100! hover:text-ic-red-100!" }}
					onClick={onSidebarButtonClick}
				/>
			</div>
		</div>
	);
}

export default Sidebar;