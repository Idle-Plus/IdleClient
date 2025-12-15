import React, { useEffect, useRef, useState } from "react";
import { IdleClansAPI } from "@/api/IdleClansAPI.ts";
import { useGame } from "@context/GameContext.tsx";
import AutoSizer from "react-virtualized-auto-sizer";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { Loader } from "@components/Loader.tsx";
import { IdleInput } from "@components/input/IdleInput.tsx";
import { FaDiscord } from "react-icons/fa6";
import { useModal } from "@context/ModalContext.tsx";
import { RecruitmentCenterModal, RecruitmentCenterModalId } from "@pages/game/clan/modals/RecruitmentCenterModal.tsx";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";
import { ModalUtils } from "@utils/ModalUtils.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { ClanInvitationsModal, ClanInvitationsModalId } from "@pages/game/clan/modals/ClanInvitationsModal.tsx";
import { ClanInfoModal, ClanInfoModalId } from "@pages/game/clan/modals/ClanInfoModal.tsx";

const JoinClanContainer = () => {
	const game = useGame();
	const modals = useModal();
	const [clan, setClan] = useState("");
	const invitations = useSmartRefWatcher(game.clan.clanInvitations);
	const workingRef = useRef(false);

	const search = () => {
		if (workingRef.current) return;

		IdleClansAPI.Clan.getRecruitment(clan)
			.then(result => {
				if (result.error === undefined) {
					modals.openModal(ClanInfoModalId, <ClanInfoModal name={clan} value={result} />);
					return;
				}

				modals.openModal("FailedToFindClan",
					ModalUtils.generalTextModal("Error", "Failed to fetch clan, does it exist?"));
			}).catch(_ => {
			modals.openModal("FailedToFindClan",
				ModalUtils.generalTextModal("Error", "Failed to fetch clan, does it exist?"));
		}).finally(() => workingRef.current = false);
	}

	const openInvitations = () => {
		modals.openModal(ClanInvitationsModalId, <ClanInvitationsModal />);
	}

	return (
		<div className="w-full flex flex-col gap-1 items-center">
			<p className="text-center text-3xl text-white font-bold">Join a clan</p>
			<div className="w-full flex flex-col gap-4 p-4 bg-ic-dark-500/75 rounded-md">

				<div className="w-full flex flex-col xs:flex-row justify-center gap-4">
					<IdleInput
						value={clan}
						onValueChange={value => setClan(value)}
						placeholder={"Enter clan name..."}
						regex={/^.{0,18}$/}
						className="w-full"
					/>
					<IdleButton
						title={"Search"}
						disabled={!/^.{1,18}$/.test(clan)}
						className="px-10!"
						onClick={() => search()}
					/>
				</div>

				<div
					className={`flex flex-col items-center p-1 bg-ic-dark-200 rounded-md select-none ${
						invitations.length > 0 ? "cursor-pointer" : ""}`}
					onClick={() => {
						if (invitations.length <= 0) return;
						openInvitations();
					}}
				>
					<p className="text-ic-light-300 text-2xl">Invitations</p>
					<p className="text-gray-300 text-lg">You have
						<span className="text-ic-light-300"> {invitations.length} </span>
						clan invitation{invitations.length !== 1 ? "s" : ""}
					</p>
				</div>
			</div>
		</div>
	);
}

const CreateClanContainer = () => {
	const game = useGame();
	const modals = useModal();
	const [name, setName] = useState("");

	const totalLevelRequirement = SettingsDatabase.shared().totalLevelRequirementForClanCreation;
	const goldCost = SettingsDatabase.shared().goldCostForClanCreation;

	const hasTotalLevel = game.skill.getTotalLevel() >= totalLevelRequirement;
	const hasGold = game.inventory.gold.content() >= goldCost;
	const canCreate = hasTotalLevel && hasGold;

	return (
		<div className="w-full flex flex-col gap-1 items-center">
			<p className="text-center text-3xl text-white font-bold">Create a clan</p>
			<div className="w-full space-y-4 px-4 pb-4 pt-2 bg-ic-dark-500/75 rounded-md">
				<div className="grid grid-cols-2">
					<div className="text-gray-100 text-xl font-semibold">Requirements</div>
					<div className="text-gray-100 text-xl font-semibold">Cost</div>
					<div className="text-gray-300 text-lg">
						Total level:
						<span className={!hasTotalLevel ? "text-ic-red-100" : ""}> {totalLevelRequirement.toLocaleString()}</span>
					</div>
					<div className="text-gray-300 text-lg">
						Gold:
						<span className={!hasGold ? "text-ic-red-100" : ""}> {goldCost.toLocaleString()}</span>
					</div>
				</div>

				<div className="flex justify-center flex-col xs:flex-row gap-4">
					<IdleInput
						value={name}
						onValueChange={value => setName(value)}
						placeholder={"Enter clan name..."}
						regex={/^[a-zA-Z0-9]{0,18}$/}
						className="w-full"
					/>
					<IdleButton
						title={"Create"}
						onClick={() => {
							if (!/^[a-zA-Z0-9]{3,18}$/.test(name) || !canCreate) return;
							modals.openModal("createClanModal", ModalUtils.generalConfirmationModal(
								<>
									Are you sure you want to create the clan '<b className="text-gray-100">{name}</b>'?
									The name <b className="text-ic-red-100">cannot</b> be changed once created.
								</>
								, () => {
									game.clan.network.createClan(name);
								}, null, { confirmText: "Create", delay: 3 })
							);
						}}
						disabled={!/^[a-zA-Z0-9]{3,18}$/.test(name) || !canCreate}
						className="px-10!"
					/>
				</div>
			</div>
		</div>
	);
};

export const NotInClanView: React.FC = () => {
	const discord = "https://discord.gg/kcf2zP5vKa";
	const game = useGame();
	const modals = useModal();
	const gameMode = game.player.mode.content();

	const [recruitingClans, setRecruitingClans] = useState(game.clan.cachedRecruitingClans.current);
	const updatingRef = useRef(false);

	useEffect(() => {
		let shouldUpdate = false;
		if (recruitingClans === undefined) shouldUpdate = true;
		else {
			const date = recruitingClans.time;
			// Check if it's been 10 minutes since the last update.
			if (Date.now() - date.getTime() > 10 * 60 * 1000) shouldUpdate = true;
		}

		if (!shouldUpdate) return;
		if (updatingRef.current) return;
		updatingRef.current = true;

		IdleClansAPI.Clan.getMostActive({ recruiting: true, gameMode: gameMode }).then(value => {
			const result = { clans: value.clans ?? [], time: new Date() };
			game.clan.cachedRecruitingClans.current = result;
			setRecruitingClans(result);
			console.log("Updated recruiting clans.");
		}).finally(() => {
			updatingRef.current = false;
		});
	});

	return (
		<div className="w-full h-full flex flex-col max-w-7xl mx-auto bg-ic-dark-500/75 overflow-y-auto ic-scrollbar-nr">
			<div className="h-full grid xl:grid-cols-[2fr_1fr] gap-4">

				<div className="flex flex-col items-center p-2 xs:p-4">
					<div className="md:w-4/5 h-full flex flex-col space-y-8">
						<div>
							<p className="text-center text-3xl mb-2 text-white font-bold">Clan</p>
							<div className="space-y-4 px-4 pb-3 pt-2 bg-ic-dark-500/75 text-gray-200 text-lg rounded-md">
								Create or join a clan to unlock exclusive upgrades and content that enhance your
								progress throughout the game.
							</div>
						</div>

						<CreateClanContainer />
						<JoinClanContainer />

						<div className="flex flex-col gap-4 justify-end grow select-none">
							<div className="flex flex-col md:flex-row items-center gap-4 p-4 py-2 bg-ic-dark-500/75 text-lg text-gray-300 rounded-md">
								<a href={discord} target="_blank" rel="noopener noreferrer">
									<FaDiscord className="text-7xl text-[#e0e3ff]" />
								</a>
								<span>
									Did you know that the <a className="text-ic-light-100 hover:text-ic-light-000" href={discord} target="_blank" rel="noopener noreferrer">Idle Clans Discord</a> is
									the best place to find a clan with like-minded players?
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="h-128 xl:h-full flex flex-col items-center p-4 select-none">
					<div className="w-full md:w-4/5 xl:w-full flex flex-col h-full">
						<div className="mb-2 text-center text-3xl text-white font-bold">
							Active recruiting clans
						</div>

						<div className="h-full">
							{ recruitingClans === undefined ? (
								<div className="h-full flex items-center justify-center text-gray-200 text-xl">
									<Loader
										title="Fetching recruiting clans"
										className="text-gray-200!"
									/>
								</div>
							) : (
								<AutoSizer>
									{({width, height}) => (
										<div className="space-y-2 px-2 overflow-y-auto ic-scrollbar-nr" style={{ width, height }}>
											{ recruitingClans.clans.map((clan, index) => (
												<div key={index} className="grid grid-cols-2 bg-ic-dark-400 px-3 py-1 rounded-md">
													<div className="text-white text-lg font-semibold">{ clan.name }</div>
													<div className="text-gray-300">
														Members:
														<span className="text-gray-100"> { clan.memberCount } </span>
														/ 20
													</div>
													<div className="text-gray-300">
														Activity:
														<span className="text-gray-100"> { clan.activityScore } </span>
														/ 100
													</div>
													<div className="text-gray-300">
														Language:
														<span className="text-gray-100"> { clan.language }</span>
													</div>
												</div>
											)) }
										</div>
									)}
								</AutoSizer>
							) }
						</div>

						<div className="w-full mx-auto px-4 mt-4">
							<IdleButton
								onClick={() => modals.openModal(RecruitmentCenterModalId, <RecruitmentCenterModal />)}
								title="Open Recruitment Center"
								className="w-full!"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};