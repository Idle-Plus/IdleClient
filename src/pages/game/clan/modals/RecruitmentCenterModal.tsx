import React, { useEffect, useState } from "react";
import { BaseModalProps } from "@components/modal/BaseModal.tsx";
import { IdleInput } from "@components/input/IdleInput.tsx";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { IdleDropdown } from "@components/input/IdleDropdown.tsx";
import { ClanCategory, GameMode } from "@idleclient/network/NetworkData.ts";
import { useGame } from "@context/GameContext.tsx";
import AutoSizer from "react-virtualized-auto-sizer";
import { ActiveClan, IdleClansAPI } from "@/api/IdleClansAPI.ts";
import { Loader } from "@components/Loader.tsx";

const Languages = [
	"None",
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
	ClanCategory.None,
	ClanCategory.Casual,
	ClanCategory.Competitive,
	ClanCategory.Hardcore,
]

const GameModes = [
	"Default",
	"Ironman",
	"Group Ironman"
];

/*interface RecruitmentCenterModalProps extends BaseModalProps {

}*/

const ClanLookup = () => {
	const [clanName, setClanName] = useState("");

	return (
		<div className="w-full flex flex-col xl:flex-row xl:gap-4 gap-y-4 p-4 bg-ic-dark-600/75 rounded-md">
			<IdleInput
				placeholder="Clan name..."
				value={clanName}
				onValueChange={value => setClanName(value)}
				regex={/^.{0,18}$/}
				className="w-full"
			/>

			<IdleButton
				title={"Look up"}
				disabled={clanName.length < 3}
				className="px-4! xl:px-6!"
			/>
		</div>
	);
}

const SearchOptions = ({ loading, search }: { loading: boolean, search: (score: number,
	range: [number, number], language: string | undefined, recruiting: boolean, category: ClanCategory | undefined,
	mode: GameMode) => void }) => {

	const game = useGame();
	const [activityScore, setActivityScore] = useState(0);
	const [minTotalLevel, setMinTotalLevel] = useState(0);
	const [maxTotalLevel, setMaxTotalLevel] = useState(2400);

	const [language, setLanguage] = useState<number>(0);
	const [recruiting, setRecruiting] = useState<boolean>(true);
	const [category, setCategory] = useState<ClanCategory>(ClanCategory.None);
	const [gameMode, setGameMode] = useState<number>(game.player.mode.content() - 1);

	return (
		<div className="p-4 space-y-4 bg-ic-dark-600/75 rounded-md select-none">
			<div>
				<p className="text-lg text-gray-300">Min activity score: <span className="text-gray-100">{activityScore}</span></p>
				<input
					type="range"
					min="0"
					max="100"
					value={activityScore}
					onChange={(e) => setActivityScore(Number(e.target.value))}
					className="w-full h-2 ic-slider"
				/>
			</div>

			<div>
				<p className="text-lg text-gray-300">Min total level: <span className="text-gray-100">{minTotalLevel}</span></p>
				<input
					type="range"
					min="0"
					max="2400"
					value={Math.min(minTotalLevel, maxTotalLevel)}
					onChange={(e) => setMinTotalLevel(Math.min(maxTotalLevel, Number(e.target.value)))}
					className="w-full h-2 ic-slider"
				/>
			</div>

			<div>
				<p className="text-lg text-gray-300">Max total level: <span className="text-gray-100">{maxTotalLevel}</span></p>
				<input
					type="range"
					min="0"
					max="2400"
					value={Math.max(minTotalLevel, maxTotalLevel)}
					onChange={(e) => setMaxTotalLevel(Math.max(minTotalLevel, Number(e.target.value)))}
					className="w-full h-2 ic-slider"
				/>
			</div>

			<div>
				<IdleDropdown
					selected={language}
					onSelect={(_, index) => setLanguage(index ?? 0)}

					values={Languages.map(entry => ({ value: entry }))}
					labelSelected={true}
					entryClass="text-lg"

					createLabel={(value, index) => {
						return (
							<span className="text-white/75">
								Language: <span className="text-white">{value?.value ?? "None"}</span>
							</span>
						);
					}}
				/>
			</div>

			<div>
				<IdleDropdown
					values={[ { value: "Yes" }, { value: "No" } ]}
					selected={recruiting ? 0 : 1 }
					onSelect={(_, index) => setRecruiting(index === 0)}
					labelSelected={true}
					entryClass="text-lg"

					createLabel={(_, index) => {
						return (
							<span className="text-white/75">
								Recruiting: <span className="text-white">{index === 0 ? "Yes" : "No"}</span>
							</span>
						);
					}}
				/>
			</div>

			<div>
				<IdleDropdown
					values={Categories.map(category => ({ value: category === ClanCategory.None ? "Any" : ClanCategory[category] }))}
					selected={category}
					onSelect={(_, index) => setCategory(index as ClanCategory)}
					labelSelected={true}
					entryClass="text-lg"

					createLabel={(entry, index) => {
						return (
							<span className="text-white/75">
								Category: <span className="text-white">{ index === 0 ? "Any" : ClanCategory[Categories[index ?? ClanCategory.Casual]] }</span>
							</span>
						);
					}}
				/>
			</div>

			<div>
				<IdleDropdown
					values={GameModes.map(mode => ({ value: mode }))}
					selected={gameMode}
					onSelect={(_, index) => setGameMode(index)}
					labelSelected={true}
					entryClass="text-lg"

					createLabel={(entry, index) => {
						return (
							<span className="text-white/75 truncate">
								Mode: <span className="text-white">{ GameModes[index ?? 0] }</span>
							</span>
						);
					}}
				/>
			</div>

			<IdleButton
				title={"Search"}
				onClick={() => {
					search(
						activityScore,
						[minTotalLevel, maxTotalLevel],
						language === 0 ? undefined : Languages[language],
						recruiting,
						category,
						(gameMode + 1) as GameMode
					);
				}}
				disabled={loading}
				className="w-full"
			/>
		</div>
	);
}

export const RecruitmentCenterModalId = "RecruitmentCenterModal";
export const RecruitmentCenterModal: React.FC<BaseModalProps> = ({ active, onClose }) => {
	const [isMouseDown, setIsMouseDown] = useState(false);

	const [clans, setClans] = useState<ActiveClan[] | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | undefined>(undefined);
	
	const search = (
		score: number,
		range: [number, number],
		language: string | undefined,
		recruiting: boolean,
		category: ClanCategory | undefined,
		mode: GameMode) => {
		if (loading && clans !== undefined) return;
		setClans([]);
		setLoading(true);
		setError(undefined);

		IdleClansAPI.Clan.getMostActive({
			minActivityScore: score,
			totalLevelRange: range,
			language: language as any,
			recruiting: recruiting,
			category: category,
			gameMode: mode
		}).then(result => {
			if (result.error === undefined) {
				setClans(result.clans);
				return;
			}

			switch (result.error) {
				case "not_found":
					setError("No clans found matching the given criteria.");
					break;
				case "rate_limit":
					setError("You are being rate limited, try again soon.");
					break;
			}
		}).catch(_ => setError("Failed to fetch clans, try again soon."))
			.finally(() => setLoading(false));
	}

	useEffect(() => {
		if (clans !== undefined) return;
		search(0, [0, 2400], undefined, true, undefined, GameMode.Default);
	});
	
	if (!active) return null;

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) setIsMouseDown(true);
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && isMouseDown) onClose?.();
		setIsMouseDown(false);
	};

	return (
		<div
			className="fixed inset-0 bg-[#00000080] flex flex-col justify-evenly items-center z-50 p-4 lg:p-8 xl:px-10 2xl:px-28"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseLeave={() => setIsMouseDown(false)}
		>
			<div className="w-full h-full bg-ic-dark-500 overflow-y-auto ic-scrollbar-nr">
				<div className="h-full flex flex-col p-4 pb-0">

					<div className="relative w-full text-center mb-4">
						<p className="text-gray-100 text-2xl font-bold text-center">Recruitment Center</p>
						<div className="absolute top-0 right-0 bg-red-500/50 hover:bg-red-400/50 rounded-lg h-8 w-8">
							<button
								onClick={onClose}
								className="text-ic-red-200 hover:text-ic-red-100"
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 cursor-pointer" fill="none"
								     viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									      d="M6 18L18 6M6 6l12 12"/>
								</svg>
							</button>
						</div>
					</div>

					<div className="w-full grow flex flex-col-reverse lg:grid lg:grid-cols-[3fr_1fr] gap-4">

						<div
							className="h-126 lg:h-auto p-4 bg-ic-dark-600/75 rounded-md"
						>

							<div className="w-full grid grid-cols-8 p-2 pr-4 text-white text-xl font-semibold select-none">
								<div className="col-span-2 truncate">Name</div>
								<div className="truncate">Activity</div>
								<div className="truncate">Members</div>
								<div className="truncate">Min Lv</div>
								<div className="truncate">Language</div>
								<div className="truncate">Recruiting</div>
								<div className="truncate">Category</div>
							</div>

							<AutoSizer>
								{({ width, height }) => (
									<div
										className="text-lg text-gray-200 space-y-1 overflow-y-auto ic-scrollbar-nr"
										style={{ width, height: height - 44 }}
									>

										{ (() => {
											if (loading) {
												return (
													<div className="h-full flex justify-center items-center">
														<Loader title="Loading" />
													</div>
												);
											}

											if (error !== undefined) {
												return (
													<div className="h-full flex justify-center items-center">
														<p className="text-2xl text-ic-red-200">{error}</p>
													</div>
												);
											}

											return clans?.map((clan, index) => (
												<div
													key={index}
													className="grid grid-cols-8 p-2 even:bg-ic-dark-300
													odd:bg-ic-dark-400 text-gray-100 rounded-md cursor-pointer select-none"
													onClick={() => {
														// TODO: Open clan info
													}}
												>
													<div className="col-span-2 text-gray-100 select-text">{clan.name}</div>
													<div>{clan.activityScore}<span className="text-gray-300"> / 100</span></div>
													<div>{clan.memberCount}<span className="text-gray-300"> / 20</span></div>
													<div>{clan.minimumTotalLevel}</div>
													<div>{clan.language}</div>
													<div>{clan.isRecruiting ? "Yes" : "No"}</div>
													<div>{ClanCategory[clan.category ?? 1]}</div>
												</div>
											))
										})() }
									</div>
								)}
							</AutoSizer>
						</div>

						<div className="h-fit flex flex-col gap-4">
							<ClanLookup />
							<SearchOptions loading={loading} search={search} />
						</div>
					</div>

					<div className="min-h-4"></div>
				</div>
			</div>
		</div>
	);
}