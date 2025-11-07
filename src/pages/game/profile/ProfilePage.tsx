import React from "react";
import { useGame } from "@context/GameContext.tsx";
import { useSession } from "@context/SessionContext.tsx";
import { useLoading } from "@context/LoadingContext.tsx";
import { useToast } from "@context/ToastContext.tsx";

const ProfilePage: React.FC = () => {
	const user = useSession();
	const toast = useToast();
	const game = useGame();
	const loading = useLoading();

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
				onClick={() => toast.info("Clan", "Another long message, no idea what to write yet, but I'll just keep going, then doing some more, maybe even a little after that, until the end of the sentence has been reached.")}
			>
				Test toast
			</button>
		</div>
	)
}

export default ProfilePage;
