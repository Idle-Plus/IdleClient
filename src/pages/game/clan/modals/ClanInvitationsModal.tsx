import React from "react";
import BaseModal, { BaseModalProps } from "@components/modal/BaseModal.tsx";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { useGame } from "@context/GameContext.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";

export const ClanInvitationsModalId = "clanInvitationsModal";
export const ClanInvitationsModal: React.FC<BaseModalProps> = ({
	active,
	onClose
}) => {
	const game = useGame();
	const invitations = useSmartRefWatcher(game.clan.clanInvitations);

	if (invitations.length === 0) {
		onClose?.();
	}

	return (
		<BaseModal
			active={active}
			onClose={onClose}
		>
			<div className="w-full max-w-xl h-full flex flex-col px-4 pb-4 bg-ic-dark-500 shadow-black/25 shadow-md rounded-md">
				<p className="text-center pt-2 text-2xl text-white font-bold">Clan Invitations</p>
				<div className="h-0.5 my-1 mb-1 bg-ic-dark-100/75"/>

				<div
					className="flex flex-col gap-4 mt-2 mb-4 overflow-y-auto ic-scrollbar-nr grow"
				>
					{ invitations.map((invitation, index) => {
						const date = new Date(invitation.Date ?? 0);
						const time = `${date.toLocaleDateString(undefined, {
							year: 'numeric',
							month: 'short',
							day: 'numeric'
						})} ${date.toLocaleTimeString(undefined, {
							hour: '2-digit',
							minute: '2-digit'
						})}`;

						return (
							<div
								key={index}
								className="h-min p-4 pt-2 space-y-2 bg-ic-dark-300/75 rounded-md"
							>
								<div className="flex flex-col sm:flex-row justify-between">
									<p className="w-full text-gray-100 text-2xl truncate">{invitation.GuildName ?? "null"}</p>
									<p className="w-min text-gray-400 xs:text-end whitespace-nowrap">{time}</p>
								</div>
								<div className="flex flex-col xs:flex-row gap-4">
									<IdleButton
										title="Accept"
										onClick={() => {
											console.log("Accepting clan invitation.");
											game.clan.network.acceptClanInvite(invitation);
											onClose?.();
										}}
										className="w-full py-1! text-lg!"
									/>

									<IdleButton
										title="Decline"
										onClick={() => {
											console.log("Declining clan invitation.");
											game.clan.network.declineClanInvite(invitation);
										}}
										textSize="text-lg"
										bgColor="bg-ic-red-500"
										bgColorHover="hover:bg-ic-red-400"
										bgColorActive="active:bg-ic-red-400"
										className="w-full py-1! text-lg!"
									/>
								</div>
							</div>
						);
					}) }
				</div>

				<IdleButton
					title="Close"
					onClick={onClose}
					textSize="text-lg"
					bgColor="bg-ic-red-500"
					bgColorHover="hover:bg-ic-red-400"
					bgColorActive="active:bg-ic-red-400"
					className="w-full"
				/>
			</div>
		</BaseModal>
	);
}