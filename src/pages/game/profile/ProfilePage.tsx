import React from "react";
import { useGame } from "@context/GameContext.tsx";
import { useSession } from "@context/SessionContext.tsx";
import { useLoading } from "@context/LoadingContext.tsx";
import { useToast } from "@context/ToastContext.tsx";
import { useModal } from "@context/ModalContext.tsx";
import { ItemInteractionModal } from "@/modals/ItemInteractionModal.tsx";

const ProfilePage: React.FC = () => {
	const user = useSession();
	const toast = useToast();
	const game = useGame();
	const loading = useLoading();
	const modal = useModal();

	return (
		<div className="flex flex-col">
			<button
				className="text-white"
				onClick={() => loading.set("test", "Tesssting " + Math.random(), 2000)}
			>
				Test loading
			</button>

			<button
				className="text-white"
				onClick={() => game.setDummy(game.dummy + 1)}
			>
				Force update GameContext
			</button>
			<button
				className="text-white"
				onClick={() => {
					const message = "Another long message, no idea what to write yet, but I'll just keep going, then doing some more, maybe even a little after that, until the end of the sentence has been reached.";
					toast.info("Clan", message.slice(0, Math.floor(Math.random() * message.length)).trimEnd())
				}}
			>
				Test toast
			</button>
			<button
				className="text-white" // 580
				onClick={() => modal.openModal("test", <ItemInteractionModal item={{id: 580, count: 5}} />)}
			>
				Test modal
			</button>
			<button
				className="text-white" // 580
				onClick={() => game.inventory.addItem(580, Math.ceil(Math.random() * 1000))}
			>
				Give ghost items
			</button>
		</div>
	)
}

export default ProfilePage;
