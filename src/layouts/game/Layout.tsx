import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@context/SessionContext.tsx";
import { GameState, useGame } from "@context/GameContext.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import Topbar from "@layouts/game/components/Topbar.tsx";
import Sidebar from "@layouts/game/components/Sidebar.tsx";

const Layout: React.FC = () => {
	const user = useSession();
	const game = useGame();

	const gameState = useSmartRefWatcher(game.gameState);
	const [sidebar, setSidebar] = useState(false);

	if (!user.isLoggedIn && !user.loading) {
		return <Navigate to="/play" />;
	}

	if (gameState !== GameState.PLAY) {
		return <Navigate to="/play" />;
	}

	return (
		<div className="flex h-screen">

			<Topbar setSidebar={() => setSidebar(!sidebar)} sidebar={sidebar} />
			<Sidebar setSidebar={(value: boolean) => setSidebar(value)} sidebar={sidebar} />

			<div className={`p-2 lg:p-4 overflow-x-hidden grow transition-all duration-300 mt-16 xl:ml-64`}>
				<div
					onClick={() => setSidebar(false)}
					className={`${!sidebar && "hidden"} xl:hidden fixed top-0 left-0 h-screen w-screen bg-black/50 z-2500`}
				/>
				<Outlet />
			</div>
		</div>
	);
}

export default Layout;