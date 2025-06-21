import React from 'react';
import GameSidebar from './GameSidebar.tsx';
import { useWebsite } from "../context/WebsiteContext.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from "@context/SessionContext.tsx";
import Console from './console/Console';
import { GameState, useGame } from "@context/GameContext.tsx";


const GameLayout: React.FC = () => {
	const website = useWebsite();
	const user = useSession();
	const game = useGame();

	const sidebar = useSmartRefWatcher(website.sidebarRef);
	const mobile = useSmartRefWatcher(website.mobileRef);
	const gameState = useSmartRefWatcher(game.gameState);

	if (!user.isLoggedIn && !user.loading) {
		return <Navigate to="/play" />;
	}

	if (gameState !== GameState.PLAY) {
		return <Navigate to="/play" />;
	}

	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<GameSidebar />

			{/* Main Content */}
			<main
				className={`overflow-auto ${mobile ? 'w-full p-2' : 'flex-1 p-6'}`}
				style={mobile && sidebar ?
					{filter: "brightness(0.75) blur(1px)", transition: "filter 0.2s"} :
					{transition: "filter 0.2s"}}
			>
				<Outlet />
			</main>

			{/* Console Overlay */}
			<Console />
		</div>
	);
};

export default GameLayout;
