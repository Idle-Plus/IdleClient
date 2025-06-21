import React from "react";
import { useGame } from "@context/GameContext.tsx";
import { useSession } from "@context/SessionContext.tsx";
import { useLoading } from "@context/LoadingContext.tsx";

const ProfilePage: React.FC = () => {
	const user = useSession();
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
		</div>
	)
}

export default ProfilePage;
