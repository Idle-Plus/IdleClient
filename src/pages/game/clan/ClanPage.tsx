import React from "react";
import { useGame } from "@context/GameContext.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { NotInClanView } from "./views/NotInClanView";
import { ClanView } from "@pages/game/clan/views/ClanView.tsx";
import NewClanView from "@pages/game/clan/views/NewClanView.tsx";

const ClanPage: React.FC = () => {
	const game = useGame();
	const clan = useSmartRefWatcher(game.clan.clan);

	return (
		<>
			{clan !== null ? (
				<>
					<NewClanView clan={clan} />
					{/*<ClanView clan={clan} />*/}
				</>
			) : (
				<NotInClanView />
			)}
		</>
	);
};

export default ClanPage;
