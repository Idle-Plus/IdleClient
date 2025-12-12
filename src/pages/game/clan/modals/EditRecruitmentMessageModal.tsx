import BaseModal, { BaseModalProps } from "@/components/modal/BaseModal";
import React, { useState } from "react";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { useGame } from "@context/GameContext.tsx";

interface EditRecruitmentMessageModalProps extends BaseModalProps {
	message: string;
}

export const EditRecruitmentMessageModal: React.FC<EditRecruitmentMessageModalProps> = ({
	active,
	onClose,
	message
}) => {
	const game = useGame();
	const [recruitmentMessage, setRecruitmentMessage] = useState(message === "undefined" ? "" : message);

	return (
		<BaseModal
			active={active}
			onClose={onClose}
			className=""
		>
			<div className="w-full h-fit max-w-2xl px-4 pb-4 overflow-y-auto bg-ic-dark-500 shadow-black/25 shadow-md rounded-md">
				<p className="text-center pt-2 text-2xl text-white font-bold">
					Edit recruitment message
				</p>
				<div className="h-0.5 my-1 mb-1 bg-ic-dark-100/75"/>

				<textarea
					value={recruitmentMessage}
					onChange={(e) => setRecruitmentMessage(e.target.value)}
					className="w-full h-64 p-3 mt-2 bg-ic-dark-600/75 text-gray-200 rounded-md resize-none focus:outline-none"
					spellCheck={false}
					autoComplete="off"
					placeholder="Enter your recruitment message..."
				/>

				<div className="w-full grid grid-cols-1 xs:grid-cols-2 gap-x-4 gap-y-2 mt-2">
					<IdleButton
						title="Confirm"
						onClick={() => {
							const message = recruitmentMessage.trim().length > 0 ? recruitmentMessage :
								"undefined";
							game.clan.network.updateRecruitmentMessage(message);
							onClose?.();
						}}
						className="w-full"
					/>

					<IdleButton
						title="Cancel"
						onClick={onClose}
						bgColor="bg-ic-red-500"
						bgColorHover="hover:bg-ic-red-400"
						bgColorActive="active:bg-ic-red-400"
						className="w-full"
					/>
				</div>
			</div>
		</BaseModal>
	)
}