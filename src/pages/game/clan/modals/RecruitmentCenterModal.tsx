import React, { useEffect, useRef, useState } from "react";
import BaseModal, { BaseModalCloseButton, BaseModalProps } from "@components/modal/BaseModal.tsx";
import { IdleInput } from "@components/input/IdleInput.tsx";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { IdleDropdown } from "@components/input/IdleDropdown.tsx";
import { ClanCategory, GameMode } from "@idleclient/network/NetworkData.ts";
import { useGame } from "@context/GameContext.tsx";
import AutoSizer from "react-virtualized-auto-sizer";
import { ActiveClan, IdleClansAPI } from "@/api/IdleClansAPI.ts";
import { Loader } from "@components/Loader.tsx";
import { ClanInfoModal, ClanInfoModalId } from "@pages/game/clan/modals/ClanInfoModal.tsx";
import { useModal } from "@context/ModalContext.tsx";
import { ModalUtils } from "@utils/ModalUtils.tsx";
import { useLoading } from "@context/LoadingContext.tsx";

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
	const modals = useModal();
	const loading = useLoading();

	const [clanName, setClanName] = useState("");
	const workingRef = useRef(false);

	const search = async () => {
		if (workingRef.current) return;
		loading.set("RecruitmentCenterSearchingClan", "Searching");

		IdleClansAPI.Clan.getRecruitment(clanName)
			.then(result => {
				if (result.error === undefined) {
					modals.openModal(ClanInfoModalId, <ClanInfoModal name={clanName} value={result} />);
					return;
				}

				modals.openModal("FailedToFindClan",
					ModalUtils.generalTextModal("Error", "Failed to fetch clan, is it spelled correctly?"));
			}).catch(_ => {
				modals.openModal("FailedToFindClan",
					ModalUtils.generalTextModal("Error", "Failed to fetch clan, is it spelled correctly?"));
		}).finally(() => {
			workingRef.current = false;
			loading.remove("RecruitmentCenterSearchingClan");
		});
	}

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
				onClick={() => search()}
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

const ClanList = ({ loading, error, clans }: { loading: boolean, error: string | undefined, clans: ActiveClan[] | undefined }) => {
	const modals = useModal();

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
				<p className="text-2xl text-ic-red-200">{error ?? "error"}</p>
			</div>
		);
	}

	return clans?.map((clan, index) => (
		<div
			key={index}
			className="even:bg-ic-dark-300 odd:bg-ic-dark-400 text-gray-100 rounded-md cursor-pointer select-none truncate"
			onClick={() => modals.openModal(ClanInfoModalId, <ClanInfoModal name={clan.name} />)}
		>
			<div className="hidden lg:grid grid-cols-8 p-2">
				<div className="col-span-2 select-text">{clan.name}</div>
				<div>{clan.activityScore}<span className="text-gray-300"> / 100</span></div>
				<div>{clan.memberCount}<span className="text-gray-300"> / 20</span></div>
				<div>{clan.minimumTotalLevel}</div>
				<div>{clan.language}</div>
				<div>{clan.isRecruiting ? "Yes" : "No"}</div>
				<div>{ClanCategory[clan.category ?? 1]}</div>
			</div>

			<div className="lg:hidden p-2 text-gray-300">
				<p className="text-center font-semibold text-gray-100">{clan.name} <span className="text-gray-300">({clan.memberCount} / 20)</span></p>
				<div className="w-full">
					<p>Activity: <span className="text-gray-100">{clan.activityScore}</span> / 100</p>
					<div>Minimum level: <span className="text-gray-100">{clan.minimumTotalLevel}</span></div>
					<div>Language: <span className="text-gray-100">{clan.language}</span></div>
					<div>Recruiting: <span className="text-gray-100">{clan.isRecruiting ? "Yes" : "No"}</span></div>
					<div>Category: <span className="text-gray-100">{ClanCategory[clan.category ?? 1]}</span></div>
				</div>
			</div>
		</div>
	))
}

export const RecruitmentCenterModalId = "RecruitmentCenterModal";
export const RecruitmentCenterModal: React.FC<BaseModalProps> = ({ active, onClose, zIndex }) => {
	const [clans, setClans] = useState<ActiveClan[] | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const [mounted, setMounted] = useState(false);
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

	return (
		<BaseModal
			active={active}
			onClose={onClose}
			zIndex={zIndex}
			onMounted={() => setMounted(true)}
			className="xl:px-10! 2xl:px-48!"
		>
			<div className="w-full h-full bg-ic-dark-500 overflow-y-auto ic-scrollbar-nr">
				<div className="relative h-full flex flex-col p-4 pb-0">

					<div className="w-full text-center mb-4">
						<p className="text-gray-100 text-2xl font-bold text-center">Recruitment Center</p>
					</div>

					<BaseModalCloseButton close={onClose} className="absolute top-2 right-2" />

					<div className="w-full grow flex flex-col-reverse lg:grid lg:grid-cols-[3fr_1fr] gap-4">

						<div
							className="h-126 lg:h-auto flex flex-col p-4 bg-ic-dark-600/75 rounded-md"
						>

							<div className="hidden w-full lg:grid grid-cols-8 p-2 pr-4 text-white text-xl font-semibold select-none">
								<div className="col-span-2 truncate">Name</div>
								<div className="truncate">Activity</div>
								<div className="truncate">Members</div>
								<div className="truncate">Min Lv</div>
								<div className="truncate">Language</div>
								<div className="truncate">Recruiting</div>
								<div className="truncate">Category</div>
							</div>

							<div className="grow">
								{ !mounted && (
									<div className="h-full flex justify-center items-center">
										<Loader title="Loading" />
									</div>
								) }
								{ mounted && (
									<AutoSizer>
										{({ width, height }) => (
											<div
												className="text-lg text-gray-200 space-y-1 overflow-y-auto ic-scrollbar-nr"
												style={{ width, height: height }}
											>
												<ClanList loading={loading} error={error} clans={clans} />
											</div>
										)}
									</AutoSizer>
								) }
							</div>
						</div>

						<div className="h-fit flex flex-col gap-4">
							<ClanLookup />
							<SearchOptions loading={loading} search={search} />
						</div>
					</div>

					<div className="min-h-4"></div>
				</div>
			</div>
		</BaseModal>
	);
}