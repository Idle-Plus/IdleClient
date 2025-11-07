import React, { useEffect, useState } from "react";
import { Clan, ClanApplication } from "@idleclient/types/clan/Clan.ts";
import useSmartRef from "@hooks/smartref/useSmartRef.ts";
import { IdleInputState } from "@components/input/IdleInputState.ts";
import { IdleUsernameInput } from "@components/input/IdleUsernameInput.tsx";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { ClanCategory, Int } from "@idleclient/network/NetworkData.ts";
import { IdleDropdown } from "@components/input/IdleDropdown.tsx";
import { IdleNumberInput } from "@components/input/IdleNumberInput.tsx";
import { IdleInput } from "@components/input/IdleInput.tsx";
import AutoSizer from "react-virtualized-auto-sizer";
import { GameContextType } from "@context/GameContext.tsx";
import { useModal } from "@context/ModalContext.tsx";
import { ModalUtils } from "@utils/ModalUtils.tsx";

const Languages = [
	"Lithuanian",
	"Scottish Gaelic",
	"Romanian",
	"Slovenian",
	"Czech",
	"Turkish",
	"Swahili",
	"Icelandic",
	"Tamil",
	"Hungarian",
	"Luxembourgish",
	"Russian",
	"Spanish",
	"Italian",
	"Japanese",
	"Bengali",
	"Montenegrin",
	"Georgian",
	"Maltese",
	"Slovak",
	"Catalan",
	"Bosnian",
	"Finnish",
	"Swedish",
	"German",
	"Croatian",
	"Indonesian",
	"Dutch",
	"Chinese",
	"Galician",
	"Polish",
	"Welsh",
	"Hindi",
	"Arabic",
	"Thai",
	"Belarusian",
	"Estonian",
	"Ukrainian",
	"Vietnamese",
	"Basque",
	"Malay",
	"Macedonian",
	"Danish",
	"English",
	"Irish",
	"Bulgarian",
	"Moldovan",
	"Korean",
	"Portuguese",
	"Norwegian",
	"Persian",
	"Albanian",
	"Greek",
	"French",
	"Serbian",
	"Latvian"
];

const Categories = [
	ClanCategory.Casual,
	ClanCategory.Competitive,
	ClanCategory.Hardcore
]

const ApplicationEntry: React.FC<{ application: ClanApplication }> = ({ application }) => {
	return (
		<div className="bg-ic-dark-200 rounded-md p-2">
			<div className="flex justify-between px-1">
				<span className="text-xl text-white">{application.name}</span>
				<span className="text-xl text-gray-300">
														<span>Total Level: </span>
														<span className="text-white">{application.level.toLocaleString()}</span>
													</span>
			</div>

			<div className='h-0.5 my-1 mb-1 bg-ic-dark-000'/>

			<div className="px-1">
				{ application.message.length > 0 ? (
					<span className="text-gray-200">{application.message}</span>
				) : (
					<span className="text-gray-300 italic">No message provided</span>
				) }
			</div>
		</div>
	);
}

const ClanManagementTab: React.FC<{ game: GameContextType, clan: Clan }> = ({ game, clan }) => {
	const modals = useModal();
	const clanHouseTier = clan.getHouse()?.houseId ?? -1;

	const [inviteName, setInviteName] = useState<string>("");
	const [minLevel, setMinLevel] = useState<number>(clan.minTotalLevel);
	const [clanTag, setClanTag] = useState<string>(clan.tag ?? "");
	useEffect(() => setMinLevel(clan.minTotalLevel), [clan.minTotalLevel]);
	useEffect(() => setClanTag(clan.tag ?? ""), [clan.tag]);

	const applications = clan.applications.concat(clan.applications)
		.concat(clan.applications.concat(clan.applications))
		.concat(clan.applications.concat(clan.applications).concat(clan.applications.concat(clan.applications)));

	return (
		<div className="w-full h-full p-4 space-y-2 grid grid-cols-[3fr_2fr] gap-4">
			<div>

				{/* General */}
				<p className="w-full text-3xl font-semibold text-white">General</p>
				<div className="grid grid-cols-2 py-2 gap-4">
					{/* TODO: Implement */}

					<IdleButton
						title="View clan logs"
					/>

					{/*<IdleButton
						title="Claim leadership"
					/>*/}

				</div>

				{/* Recruitment */}
				<p className="w-full mt-4 text-3xl font-semibold text-white">Recruitment</p>
				<div className="grid grid-cols-2 py-2 gap-4">

					{/* Recruiting */}
					<IdleDropdown
						values={[ { value: "Yes" }, { value: "No" } ]}
						selected={clan.recruiting ? 0 : 1 }
						onSelect={(_, index) => {
							game.clan.network.updateRecruitmentStatus(index === 0);
						}}
						labelSelected={true}
						entryClass="text-lg"

						createLabel={(entry, index) => {
							return (
								<span className="text-white/75">
										Recruiting: <span className="text-white">{index === 0 ? "Yes" : "No"}</span>
									</span>
							);
						}}
					/>

					{/* Category */}
					<IdleDropdown
						values={Categories.map(category => ({ value: ClanCategory[category] }))}
						selected={Categories.indexOf(clan.category) ?? 0}
						onSelect={(_, index) => {
							const category = Categories[index ?? 0];
							game.clan.network.updateCategory(category);
						}}
						labelSelected={true}
						entryClass="text-lg"

						createLabel={(entry, index) => {
							return (
								<span className="text-white/75">
									Category: <span className="text-white">{ClanCategory[Categories[index ?? ClanCategory.Casual]]}</span>
								</span>
							);
						}}
					/>

					{/* Language */}
					<IdleDropdown
						values={Languages.map(language => ({ value: language }))}
						selected={clan.language !== null ? Languages.indexOf(clan.language) : 43}
						onSelect={(_, index) => {
							const language = Languages[index ?? 43];
							game.clan.network.updateLanguage(language);
						}}
						labelSelected={true}
						entryClass="text-lg"

						createLabel={(_, index) => {
							return (
								<span className="text-white/75">
									Language: <span className="text-white">{Languages[index ?? 43]}</span>
								</span>
							);
						}}
					/>

					{/* Total level requirement */}
					<div className="grid grid-cols-[2fr_5fr] gap-4">
						<IdleNumberInput
							placeholder={"Min level"}
							value={minLevel}
							onValueChange={value => setMinLevel(value)}
							min={0}
							max={2400}
							titleClass="text-lg"
							className="w-full h-full"
						/>

						<IdleButton
							title="Set level requirement"
							onClick={() => {
								game.clan.network.updateTotalLevelRequirement(minLevel);
							}}
						/>
					</div>

				</div>

				{/* Clan Tag */}
				<div className="w-full mt-4">
					<p className="text-3xl font-semibold text-white">Clan Tag</p>
					<p className="text-gray-300">
						Set a unique clan tag that appears before members' names in chat. It must be exactly 3
						characters long, use only letters and numbers, and cannot match an existing clan tag or
						clan name. <span className={clanHouseTier < 3 ? "text-ic-red-100" : ""}>Requires a House or above to unlock.</span>
					</p>

					<div className="w-1/2 flex mt-4 pr-2 gap-4">
						<IdleInput
							placeholder={"Clan tag"}
							value={clanTag}
							onValueChange={value => setClanTag(value)}
							regex={/^[a-zA-Z0-9]{0,3}$/}
							disabled={clanHouseTier < 3}
						/>

						<IdleButton
							title="Set clan tag"
							disabled={clanHouseTier < 3 || (clanTag.length !== 3 || !clanTag.match(/^[a-zA-Z0-9]{3}$/))}

							onClick={() => {
								if (clanHouseTier < 3) return;
								if (!clanTag.match(/^[a-zA-Z0-9]{3}$/)) return;
								if (clan.tag === clanTag) {
									modals.openModal("clanManagement$sameTag", ModalUtils.generalTextModal(null, "This is already your clan tag."))
									return;
								}

								game.clan.network.updateTag(clanTag);
							}}
						/>
					</div>
				</div>

			</div>

			{/* Clan invite and applications */}
			<div className="flex flex-col gap-4">

				{/* Clan Invite */}
				<div className="space-y-1">
					<p className="w-full mb-0 text-3xl font-semibold text-white">Invite a player to the clan</p>
					<div className="flex gap-4 py-2"> {/* bg-ic-dark-500 rounded-md */}
						<IdleUsernameInput
							placeholder={"Player to invite"}
							value={inviteName}
							onValueChange={value => setInviteName(value)}

							titleClass="text-lg"
							className="w-full"
						/>

						<IdleButton
							disabled={!/^[a-zA-Z0-9]{3,20}$/.test(inviteName)}
							title="Invite to clan"

							onClick={() => {
								if (!/^[a-zA-Z0-9]{3,20}$/.test(inviteName)) return;
								game.clan.network.sendClanInvite(inviteName);
							}}
						/>
					</div>
				</div>

				{/* Clan Applications */}
				<div className="flex flex-col grow gap-y-1">
					<p className="w-full text-3xl font-semibold text-white">Applications</p>
					<div className="grow flex flex-col bg-ic-dark-500 rounded-md">
						<div className="h-full">
							{ applications.length > 0 ? (
								<AutoSizer>
									{({width, height}) => (
										<div className="space-y-2 p-3 overflow-y-auto ic-scrollbar-nr" style={{width: width, height: height}}>
											{ applications.map((application, index) => (
												<ApplicationEntry key={index} application={application} />
											)) }
										</div>
									)}
								</AutoSizer>
							) : (
								<div className="h-full flex justify-center items-center px-4 text-center text-2xl text-gray-300">
									There are currently no incoming applications
								</div>
							) }
						</div>

						<div className="px-4 py-3">
							<IdleButton
								title="Clear all applications"
								className="w-full"

								bgColor="bg-ic-red-500"
								bgColorHover="hover:bg-ic-red-400"
								bgColorDisabled="bg-ic-red-700"

								onClick={() => game.clan.network.clearAllApplications() }
								disabled={applications.length === 0}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ClanManagementTab;