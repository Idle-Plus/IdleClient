import React from "react";
import { useGame } from "@context/GameContext.tsx";
import { useUser } from "@context/UserContext.tsx";
import { useLoading } from "@context/LoadingContext.tsx";

const HomePage: React.FC = () => {
	const user = useUser();
	const game = useGame();
	const loading = useLoading();

	return (
		<div className="flex flex-col">

			<button className="text-white" onClick={() => game.connect(user.session!)}>
				Click to connect
			</button>
			<button
				className="text-white"
				onClick={() => loading.set("test", "Tesssting " + Math.random(), 2000)}
			>
				Test loading
			</button>
		</div>
	)
}

export default HomePage;
