import { Routes, Route } from 'react-router-dom'
import GameLayout from "@components/GameLayout.tsx";
import LoginPage from "@pages/login/LoginPage.tsx";
import { Navigate } from 'react-router-dom';
import { useUser } from "@context/UserContext.tsx";
import HomePage from "@pages/auth/home/HomePage.tsx";
import { InventoryPage } from "@pages/auth/inventory";
import SkillPage from "@pages/auth/skill/SkillPage.tsx";
import { useLoading } from "@context/LoadingContext.tsx";
import { useEffect, useState } from "react";
import { IdleClansMath } from "@idleclient/game/utils/IdleClansMath.ts";

const LogoutHandler = () => {
	const user = useUser();
	user.logout();
	return <Navigate to="/login" />;
}

function App() {
	const loading = useLoading();
	const [initialized, setInitialized] = useState(false);

	// Load the WASM library.
	useEffect(() => {
		loading.set("wasm$init", "Loading libraries...");

		IdleClansMath.load().then(value => {
			loading.remove("wasm$init");
			setInitialized(true);
		}).catch(error => {
			loading.remove("wasm$init");
			console.error(error);
		});

		// eslint-disable-next-line
	}, []);

	if (!initialized) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-gray-400 text-5xl">Loading...</div>
			</div>
		);
	}

	return (
		<Routes>
			<Route element={<GameLayout />}>
				<Route path="/game/profile" element={<HomePage />}/>
				<Route path="/game/inventory" element={<InventoryPage />}/>

				<Route path="/game/clan" element={<div>Clan</div>}/>
				<Route path="/game/local-market" element={<div>Local Market</div>}/>
				<Route path="/game/player-market" element={<div>Player Market</div>}/>

				<Route path="/game/raid" element={<div>Raid</div>}/>
				<Route path="/game/raid/:name" element={<div>RaidName</div>}/>
				<Route path="/game/skill/:name" element={<SkillPage />}/>

				<Route path="/logout" element={<LogoutHandler />}/>
				<Route path="*" element={<div className="text-red-400 font-bold text-5xl">Not Found</div>}/>
			</Route>
			<Route path="/login" element={<LoginPage />}/>
		</Routes>
	)
}

export default App
