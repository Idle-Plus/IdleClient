import { Clan } from "@idleclient/types/clan/Clan.ts";
import React, { useEffect, useState } from "react";
import { useGame } from "@context/GameContext.tsx";
import { ClanRank } from "@idleclient/types/clan/ClanRank.ts";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { ClanMember } from "@idleclient/types/clan/ClanMember.ts";
import { useModal } from "@context/ModalContext.tsx";
import { ModalUtils } from "@utils/ModalUtils.tsx";
import { PvmStatType, Skill } from "@idleclient/network/NetworkData.ts";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import Tooltip from "@components/Tooltip.tsx";
import { toFixedNoRoundTrimLocale } from "@idleclient/game/utils/numberUtils.ts";
import { SpriteIcon } from "@components/icon";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";
import { FaEdit, FaSave } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import App from "@/App.tsx";
import { ClanPage, InventoryPage, TaskPage } from "@pages/game";
import { GameLayout } from "@layouts/game";
import AutoResizeTextarea from "@components/input/AutoResizeTextarea.tsx";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { Loader } from "@components/Loader.tsx";

enum ClanTab {
	Clan,
	Quests,
	Property,
	Upgrades,
	Management
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
			className="w-full"
		/>
	);
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
			className="w-full flex flex-col items-center pt-2 pb-3 px-2 bg-ic-dark-300 rounded-md shadow-black/25 shadow-md"
		>
			<SpriteIcon icon={SkillUtils.getSpriteIconId(skill, 32)} size={28} className="mb-1 drop-shadow-md drop-shadow-black/25" />
			<p className="text-gray-200 tbox-trim-both">Lv. <span className="text-white"> {level}</span></p>
			<div className="w-full relative">
				<div className="absolute w-full h-1 bg-ic-light-700 rounded-md" />
				<div className="absolute h-1 bg-ic-light-200 rounded-md" style={{ width: (progress.progress * 100) + "%" }} />
			</div>
		</Tooltip>
	);
}

/*const ClanBulletinBoard: React.FC<{ clan: Clan, player: ClanMember }> = ({ clan, player }) => {
	return (
		<div className="bg-ic-dark-500/75 space-y-1 p-4 pt-2">
			<div className="text-2xl font-semibold text-gray-100">Bulletin Board</div>

			<div className="p-1 bg-ic-dark-300 rounded-md shadow-black/25 shadow-md">
			</div>
		</div>
	);
}*/

const MARKDOWN_TEST = `# FOR REAL!
What are we doing? no consistent events, no tickets, and worst of all: boss keys are being burned solo. That's a massive waste and straight up throws away clan credits.

And let's be honest, how have we farmed Golem for over 6 months and received zero drops? At this point we're just running around like headless chickens.
## What's next?
>- Daily clan events at 10 AM
>- Skilling tickets every Monday at 12 AM
>- No more AFK raids - Stop being money hungry, AFK raiding gives **zero** XP`

const MARKDOWN_TEST_2 = `
# Markdown Test

## Headers

# This is a Heading h1
## This is a Heading h2
### This is a Heading h3
#### This is a Heading h4
##### This is a Heading h5
###### This is a Heading h6

## Emphasis

*This text will be italic*  
_This will also be italic_

**This text will be bold**  
__This will also be bold__

_You **can** combine them_

## Lists

### Unordered

* Item 1
* Item 2
* Item 2a
* Item 2b
    * Item 3a
    * Item 3b
        * Item 3b1
        * Item 3b2
            * Item 3b2a
            * Item 3b2b

### Ordered

1. Item 1
2. Item 2
3. Item 3
    1. Item 3a
    2. Item 3b
        1. Item 3b1
        2. Item 3b2
            1. Item 3b2a
            2. Item 3b2b

## Images

![Image](https://i.imgur.com/MGkSKG2.jpeg "This is a sample image.")

## Links

The official Idle Clans wiki is located [here](https://wiki.idleclans.com/).

## Blockquotes

> Markdown is a lightweight markup language with plain-text-formatting syntax, created in 2004 by John Gruber with Aaron Swartz.
>
>> Markdown is often used to format readme files, for writing messages in online discussion forums, and to create rich text using a plain text editor.

## Blocks of code

\`\`\`
let message = 'Hello world';
alert(message);
\`\`\`

## Inline code

Lets play a game \`[ $(( $RANDOM % 6 )) -eq 0 ] && rm -rf / || echo "Click!"\`.
`


const ClanBulletinBoard: React.FC<{ clan: Clan, player: ClanMember }> = ({ clan, player }) => {
	const game = useGame();
	const [collapsed, setCollapsed] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const [editMessage, setEditMessage] = useState("");
	const [editDiscordCode, setEditDiscordCode] = useState("");

	const message = clan.bulletinBoard?.message ?? "";
	const discordCode = clan.bulletinBoard?.discordCode ?? "";
	const canEdit = player.rank === ClanRank.DEPUTY || player.rank === ClanRank.LEADER;
	const isEmpty = (message.length <= 0 && discordCode.length <= 0) || (message === " " && discordCode === " ");

	// If the bulletin board is empty, and we don't have permission to edit it,
	// then don't render anything.
	if (isEmpty && !canEdit)
		return null;

	// Edit functions

	const handleEdit = () => {
		setIsEditing(true);
		setEditMessage(message === " " ? "" : message);
		setEditDiscordCode(discordCode === " " ? "" : discordCode);
	}

	const handleSave = () => {
		setIsEditing(false);

		// Hacky fix to allow the packet to go through
		let fixedMessage = editMessage;
		let fixedDiscordCode = editDiscordCode;
		if (editMessage.length === 0) fixedMessage = " ";
		if (editDiscordCode.length === 0) fixedDiscordCode = " ";

		game.clan.network.updateBulletinBoard(fixedMessage, fixedDiscordCode);
	};

	const handleCancel = () => {
		setIsEditing(false);
	}

	return (
		<div className={`bg-ic-dark-500/75 space-y-2 p-4 pt-2 ${collapsed ? "pb-2 space-y-0!" : ""}`}>
			<div className="flex justify-between items-center">
				<div className="text-2xl font-semibold text-gray-100">Bulletin Board</div>

				<div
					onClick={() => setCollapsed(!collapsed)}
					className="text-3xl text-gray-300/75 hover:text-gray-300 transition-colors cursor-pointer select-none"
				>
					{ collapsed ? <BiSolidHide /> : <BiSolidShow /> }
				</div>
			</div>

			{ (clan.bulletinBoard === null) && (
				<Loader title={""} spinnerClass="h-10! w-10! border-4!" />
			) }

			<div className={`relative p-2 bg-ic-dark-300 rounded-md shadow-black/25 shadow-md ${collapsed ? "hidden" : ""} ${clan.bulletinBoard === null ? "hidden" : ""}`}>
				{ (isEditing && canEdit) ? (
					<>
						<div className="relative">
							<AutoResizeTextarea
								placeholder="Enter bulletin board message"
								value={editMessage}
								onChange={value => setEditMessage(value)}
								maxLength={500}
								className="w-full p-2 bg-ic-dark-400 text-gray-300 focus:text-gray-100 rounded-md focus:outline-none"
							/>

							<div className="absolute top-2 right-2 flex gap-2 text-2xl text-gray-300/50 select-none">
								<div className="transition-colors cursor-pointer hover:text-gray-300" onClick={handleCancel}><FaXmark /></div>
								<div className="transition-colors cursor-pointer hover:text-gray-300" onClick={handleSave}><FaSave /></div>
							</div>

							<div
								className={`absolute bottom-2 right-2 text-sm select-none text-gray-400 ${
									editMessage.length >= 500 ? "text-ic-red-100" : editMessage.length > 400 ? "text-ic-orange-000" : "" 
								}`}
							>
								{editMessage.length} / 500
							</div>
						</div>

						<div className="relative">
							<input
								placeholder="Enter discord invite code"
								maxLength={20}
								value={editDiscordCode}
								onChange={(e) => setEditDiscordCode(e.target.value)}
								className="w-full p-2 bg-ic-dark-400 text-gray-300 focus:text-gray-100 rounded-md focus:outline-none"
							/>

							<div className={`absolute right-2 top-2.5 text-sm text-gray-400 select-none ${editDiscordCode.length >= 20 ? "text-ic-red-100" : ""}`}>
								{editDiscordCode.length} / 20
							</div>
						</div>
					</>
				) : (
					<>
						{ (message.trim().length <= 0 && discordCode.trim().length <= 0) && (
							<div className="w-full p-2 text-lg text-gray-300">
								No bulletin board message or discord invite has been set.
							</div>
						) }

						{ (message.trim().length > 0) && (
							<div
								className="p-2 pb-0 text-gray-200 markdown-container"
								style={{
									"--md-link-color": "var(--color-ic-light-200)",
									"--md-link-color-hover": "var(--color-ic-light-000)"
								} as React.CSSProperties}
							>
								<Markdown remarkPlugins={[]}>
									{message.length > 0 ? message : ""}
								</Markdown>
							</div>
						) }

						{ (discordCode.trim().length > 0) && (
							<div className={`w-full p-2 pt-0 text-gray-300 ${message.trim().length <= 0 ? "pt-2!" : ""}`}>
								{"Click "}
								<a
									href={`https://discord.gg/${discordCode}`}
									target="_blank"
									rel="noreferrer"
									className="text-ic-light-200"
								>here</a>
								{" to join the clan discord"}
							</div>
						) }

						{ canEdit && (
							<div
								onClick={handleEdit}
								className="absolute top-4 right-4 text-2xl text-gray-300/50 hover:text-gray-300 transition-colors cursor-pointer select-none"
							>
								<FaEdit />
							</div>
						) }
					</>
				)}
			</div>
		</div>
	);
}


const ClanSkills: React.FC<{ clan: Clan }> = ({ clan }) => {
	return (
		<div className="bg-ic-dark-500/75 space-y-1 p-4 pt-2">
			<div className="flex justify-between text-2xl pb-1">
				<div className="font-semibold text-gray-100">Skills</div>
				<div className="text-gray-300">Total level: <span className="text-gray-100">{clan.getTotalLevel()}</span></div>
			</div>

			<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 select-none">
				{ SkillUtils.getSkills().map((skill, index) => (
					<ClanSkill key={index} clan={clan} skill={skill} />
				)) }
			</div>
		</div>
	);
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
		<div className="space-y-1 p-4 pt-2 bg-ic-dark-500/75 text-gray-200">
			<h1 className="text-2xl font-semibold pb-1">
				PvM Stats
			</h1>

			{/* Raids */}
			<div className="grid grid-cols-3 gap-1">

				{ raids.map((raid, index) => (
					<div key={index} className="flex flex-col items-center p-1 bg-ic-dark-300 rounded-md shadow-black/25 shadow-md">
						<SpriteIcon icon={raid.icon + "_48"} size={48} className="drop-shadow-md drop-shadow-black/25" />
						<span className="tbox-trim-both"><span className="hidden sm:inline">{raid.text}</span>{clan.pvmStats?.stats.get(raid.type) ?? 0}</span>
					</div>
				)) }
			</div>

			{/* Bosses */}
			<div className="grid grid-cols-4 sm:grid-cols-6 gap-1 pt-1">
				{ bosses.map((boss, index) => (
					<div key={index} className="flex flex-col items-center p-2 pb-1 bg-ic-dark-300 rounded-md shadow-black/25 shadow-md">
						<SpriteIcon icon={boss.icon + "_48"} size={48} className="drop-shadow-md drop-shadow-black/25" />
						<span className="tbox-trim-both">{clan.pvmStats?.stats.get(boss.type) ?? 0}</span>
					</div>
				)) }
			</div>
		</div>
	)
}

const MemberEntry = ({
	member,
	player
}: { member: ClanMember, player: ClanMember }) => {

	const offlineTime = Date.now() - member.logoutTime.getTime();
	const offlineHours = Math.floor(offlineTime / 1000 / 60 / 60);
	const server = member.server;
	const ourServer = server === player.server;

	const status = !member.online ? `OFFLINE (${offlineHours}h)` : `ONLINE (${server})`
	const statusClass = !member.online ? "text-ic-red-100" :
		ourServer ? "text-ic-light-100" : "text-ic-orange-000";
	const nameClass = !member.online ? "text-ic-red-200" :
		ourServer ? "text-ic-light-200" : "text-ic-orange-100";

	return (
		<div className="w-full px-2 pb-2 pt-0.5 bg-ic-dark-300 rounded-md shadow-black/25 shadow-md">
			<div className="flex flex-col 2xs:flex-row items-center justify-between pb-2 2xs:pb-0">
				<div className={`w-full flex justify-center 2xs:justify-start items-center text-lg font-semibold truncate 2xs:pr-2 ${nameClass}`}>
					{/*<div className="truncate">HHHHHGGGGGHHHHHGGGGG</div>*/}
					<div className="truncate">{ member.name }</div>

					{ member.premium && (<SpriteIcon icon={"premium_32"} size={22} className="ml-1" />) }
					{ member.gilded && (<SpriteIcon icon={"gilded_32"} size={22} className="ml-1" />) }
				</div>
				<div className={`tbox-trim-both-cap whitespace-nowrap ${statusClass}`}>{status}</div>
			</div>

			<div className="flex justify-between">
				<div className="tbox-trim-both-cap text-gray-300 pl-1">
					{ member.rank === ClanRank.LEADER ? "Leader" : member.rank === ClanRank.DEPUTY ? "Deputy" : "" }
					{ (member.rank !== ClanRank.LEADER && member.vaultAccess) && (member.rank === ClanRank.DEPUTY ?
						<>
							<span className="hidden 2xs:inline"> - Vault access</span>
							<span className="2xs:hidden"> - Vault</span>
						</> : "Vault access")
					}
				</div>
				<div className="tbox-trim-both-cap text-gray-400">Joined {member.joinDate.toLocaleDateString()}</div>
			</div>
		</div>
	)
}

const MemberList = ({
	clan,
	player
}: { clan: Clan, player: ClanMember }) => {
	const ourServer = "stage-1";
	clan.members.forEach(member => {
		member.server = member.rank === ClanRank.LEADER ? ourServer : Math.random() < 0.5 ? "stage-1" : "stage-2";
	})

	const managementMembers = Array.from(clan.members.values())
		.filter(member => member.rank === ClanRank.LEADER || member.rank === ClanRank.DEPUTY)
		.sort((a, b) => {
			// Leader is ALWAYS first, no matter what.
			if (a.rank !== b.rank)
				return b.rank - a.rank;
			// Online status
			if (a.online !== b.online)
				return a.online ? -1 : 1;
			// Server
			if (a.online && b.online) {
				if (a.server === ourServer && b.server !== ourServer) return -1;
				if (b.server === ourServer && a.server !== ourServer) return 1;
			}
			// Name
			return a.name.localeCompare(b.name);
		});

	const normalMembers = Array.from(clan.members.values())
		.filter(member => member.rank === ClanRank.MEMBER)
		.sort((a, b) => {
			// Online status
			if (a.online !== b.online)
				return a.online ? -1 : 1;
			// Server
			if (a.online && b.online) {
				if (a.server === ourServer && b.server !== ourServer) return -1;
				if (b.server === ourServer && a.server !== ourServer) return 1;
			}
			// Vault access
			if (a.vaultAccess !== b.vaultAccess)
				return b.vaultAccess ? 1 : -1;
			// Name
			return a.name.localeCompare(b.name);
		});

	return (
		<>
			{/*<div className="text-2xl font-semibold text-gray-100">{ normalMembers.length > 0 ? "Management" : "Members" }</div>*/}
			<div className="flex justify-between items-end mt-2">
				<span className="text-2xl font-semibold text-gray-100">{ normalMembers.length > 0 ? "Management" : "Members" }</span>
				<span className="text-lg text-gray-400">({clan.members.size} / {SettingsDatabase.shared().guildMaxMembers})</span>
			</div>
			<div className="grid grid-cols-1 gap-2">
				{ managementMembers.map((member, index) => (
					<MemberEntry key={index} member={member} player={player} />
				)) }
			</div>

			{ normalMembers.length > 0 && (
				<>
					<div className="flex justify-between items-end mt-2">
						<span className="text-2xl font-semibold text-gray-100">Members</span>
						<span className="text-lg text-gray-400">({clan.members.size} / {SettingsDatabase.shared().guildMaxMembers})</span>
					</div>
					<div className="grid grid-cols-1 gap-2">
						{ normalMembers.map((member, index) => (
							<MemberEntry key={index} member={member} player={player} />
						)) }
					</div>
				</>
			) }
		</>
	)
}

const NewClanView = ({
	clan
}: { clan: Clan }) => {
	const game = useGame();
	const [currentTab, setCurrentTab] = useState<ClanTab>(ClanTab.Clan);

	const name = game.player.username.content();
	const player = clan.members.get(name)!;
	const rank = player.rank || ClanRank.MEMBER;
	const isDeputyOrHigher = rank >= ClanRank.DEPUTY;

	// Refresh the clan state when we visit the clan page.
	useEffect(() => {
		game.clan.network.refreshClanState();
		game.clan.network.refreshClanVault();
		game.clan.network.refreshClanPveStats();
		game.clan.network.refreshClanBulletinBoard();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const managementMembers = Array.from(clan.members.values())
		.filter(member => member.rank === ClanRank.DEPUTY || member.rank === ClanRank.LEADER);
	const members = Array.from(clan.members.values())
		.filter(member => member.rank === ClanRank.MEMBER);

	// Sort both management and members by rank, then by online status.
	managementMembers.sort((a, b) => (a.rank === b.rank ? (a.online ? 0 : 1) - (b.online ? 0 : 1) : b.rank - a.rank));
	members.sort((a, b) => (a.online ? 0 : 1) - (b.online ? 0 : 1));

	return (
		<div className="max-w-7xl min-h-full flex flex-col mx-auto">
			<div className="flex bg-ic-dark-500/75 p-1 mb-2 text-xl text-gray-200 gap-1 overflow-x-auto">
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

			<div className="h-full flex flex-col lg:flex-row gap-2 grow bg-pink-500/0">

				{/* Clan name & buttons - Mobile view */}
				<div className="lg:hidden p-4 space-y-2 bg-ic-dark-500/75">
					<div className="text-white text-4xl font-bold text-center ">
						{/*{clan.name} { clan.tag && (<span className="font-normal text-gray-200">{`[${clan.tag}]`}</span>) }*/}
						{clan.name} <span className="font-normal text-gray-200">{`[TAG]`}</span>
					</div>

					<div className="flex flex-col sm:flex-row gap-x-4 gap-y-2">
						<IdleButton title="Claimable loot" className="w-full" />
						{/*<IdleButton title="Bulletin board" className="w-full" />*/}
						<IdleButton title="Recruitment center" className="w-full" />
						<LeaveClanButton clan={clan} player={player} />
					</div>
				</div>

				<div className="min-h-full max-h-fit flex-2 flex flex-col bg-ic-dark-500/75 p-4">
					<div className="hidden lg:block text-white text-4xl font-bold text-center">
						{/*{clan.name} { clan.tag && (<span className="font-normal text-gray-200">{`[${clan.tag}]`}</span>) }*/}
						{clan.name} <span className="font-normal text-gray-200">{`[TAG]`}</span>
					</div>

					<div className="">
						{/*<AutoSizer>
							{({width, height}) => (*/}
								<div
									className="overflow-y-auto generic-ic-scrollbar p-1" //style={{width, height}}
								>
									<MemberList clan={clan} player={player} />
								</div>
							{/*)}
						</AutoSizer>*/}

					</div>
				</div>

				<div className="flex-3 space-y-2">
					<div className="space-y-2">
						<div className="hidden lg:flex flex-col md:flex-row justify-between gap-2 p-2 bg-ic-dark-500/75">
							<IdleButton title="Claimable loot" className="w-full" />
							{/*<IdleButton title="Bulletin board" className="w-full" />*/}
							<IdleButton title="Recruitment center" className="w-full" />
							<LeaveClanButton clan={clan} player={player} />
						</div>

						<ClanBulletinBoard clan={clan} player={player} />
						<ClanSkills clan={clan} />
						<ClanPvmStats clan={clan} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewClanView;