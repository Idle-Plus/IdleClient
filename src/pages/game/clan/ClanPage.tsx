import React, { useState, useEffect } from "react";
import { useGame } from "@context/GameContext.tsx";
import { ClanCategory, CreateGuildMessage, LeaveGuildMessage, SendGuildApplicationMessage } from "@idleclient/network/NetworkData.ts";
import { ClanRank } from "@idleclient/types/clan/ClanRank.ts";
import { Network } from "@idleclient/network/Network.ts";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { NotInClanView } from "./views/NotInClanView";
import { ClanView } from "@pages/game/clan/views/ClanView.tsx";

const ClanPage: React.FC = () => {
	const game = useGame();
	const clan = useSmartRefWatcher(game.clan.clan);
	const totalLevel = game.skill.getTotalLevel();
	const gold = game.inventory.gold.content();

	const handleCreateClan = (name: string) => {
		// Send create clan message
		Network.send(new CreateGuildMessage(name, null, null, null));
	};

	const handleJoinClan = (name: string, message: string) => {
		// Send application message
		Network.send(new SendGuildApplicationMessage(name, message));
	};

	return (
		<>
			{clan !== null ? (
				<ClanView clan={clan} />
			) : (
				<NotInClanView />
			)}
		</>
	);
};

export default ClanPage;
