import { Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from "@context/SessionContext.tsx";
import { useLoading } from "@context/LoadingContext.tsx";
import { useEffect, useRef, useState } from "react";
import { IdleClansMath } from "@idleclient/game/utils/IdleClansMath.ts";
import { ClanPage, InventoryPage, ProfilePage, TaskPage } from "@pages/game";
import { useGame } from "@context/GameContext.tsx";
import { PlayPage } from "@pages/public";
import { useSpriteSheets } from "@context/SpriteSheetContext.tsx";
import { GameLayout } from "@layouts/game";

const LOADING_ID = "idleClient$app$loading";

const LogoutHandler = () => {
	const user = useSession();
	const game = useGame();

	user.logout();
	game.disconnect();

	return <Navigate to="/login" />;
}

function App() {
	const loader = useLoading();
	const spriteSheets = useSpriteSheets();
	const sessions = useSession();

	const initializedRef = useRef(false);
	const [wasmInitialized, setWasmInitialized] = useState(false);
	const isSpriteSheetsLoading = spriteSheets.loading;
	const isSessionsLoading = sessions.loading;
	const isLoading = !wasmInitialized || isSpriteSheetsLoading || isSessionsLoading;

	// Load the WASM library.
	useEffect(() => {
		IdleClansMath.load().then(() => {
			setWasmInitialized(true);
		}).catch(error => {
			console.error("Failed to load Idle Client WASM library, error: ", error);
		});
	}, []);

	useEffect(() => {
		if (initializedRef.current) return;

		if (isLoading) loader.set(LOADING_ID, "Loading Idle Client", -1);
		else {
			loader.remove(LOADING_ID);
			initializedRef.current = true;
		}
	}, [isLoading, loader]);

	if (isLoading && !initializedRef.current) {
		return null;
	}

	return (
		<Routes>

			<Route path="/" element={<Navigate to="/play" />}/>
			<Route path="/play" element={<PlayPage />}/>

			<Route element={<GameLayout />}>
				<Route path="/game" element={<ProfilePage />}/>
				<Route path="/game/inventory" element={<InventoryPage />}/>

				<Route path="/game/clan" element={<ClanPage />}/>
				<Route path="/game/local-market" element={<div>Local Market</div>}/>
				<Route path="/game/player-market" element={<div>Player Market</div>}/>

				<Route path="/game/raid" element={<div>Raid</div>}/>
				<Route path="/game/raid/:name" element={<div>RaidName</div>}/>
				<Route path="/game/skill/:name" element={<TaskPage />}/>

				<Route path="/logout" element={<LogoutHandler />}/>
				<Route path="*" element={<div className="text-red-400 font-bold text-5xl">Not Found</div>}/>
			</Route>
		</Routes>
	)
}

export default App
