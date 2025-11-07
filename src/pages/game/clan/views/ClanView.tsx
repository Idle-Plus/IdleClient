import React, { useEffect, useState } from "react";
import { ClanRank } from "@idleclient/types/clan/ClanRank.ts";
import { useGame } from "@/context/GameContext";
import { Clan } from "@idleclient/types/clan/Clan.ts";
import { ClanCategory, GameMode, Skill, UpgradeType } from "@idleclient/network/NetworkData.ts";
import { ClanMember } from "@idleclient/types/clan/ClanMember.ts";
import ClanInfoTab from "@pages/game/clan/tabs/ClanInfoTab.tsx";
import ClanQuestsTab from "@pages/game/clan/tabs/ClanQuestsTab.tsx";
import ClanPropertyTab from "@pages/game/clan/tabs/ClanPropertyTab.tsx";
import ClanUpgradesTab from "@pages/game/clan/tabs/ClanUpgradesTab.tsx";
import { IdleUsernameInput } from "@components/input/IdleUsernameInput.tsx";
import { IdleButton } from "@components/input/IdleButton.tsx";
import useSmartRef from "@hooks/smartref/useSmartRef.ts";
import { IdleInputState } from "@components/input/IdleInputState.ts";
import ClanManagementTab from "@pages/game/clan/tabs/ClanManagementTab.tsx";

enum ClanViewTab {
	Clan,
	Quests,
	Property,
	Upgrades,
	Management
}

export const ClanView: React.FC<{ clan: Clan }> = ({ clan }) => {
	const game = useGame();
	const [currentTab, setCurrentTab] = useState<ClanViewTab>(ClanViewTab.Clan);

	const playerName = game.player.username.content();
	const playerMember = clan.members.get(playerName)!;
	const playerRank = playerMember.rank || ClanRank.MEMBER;
	const isDeputyOrHigher = playerRank >= ClanRank.DEPUTY;

	// Refresh the clan state when we visit the clan page.
	useEffect(() => {
		game.clan.network.refreshClanState();
		game.clan.network.refreshClanVault();
		game.clan.network.refreshClanPveStats();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="w-full h-full flex flex-col max-w-7xl mx-auto p-4"> {/*h-full*/}

			{/* Tab List */}
			<div className="bg-ic-dark-500/75 mb-2 text-xl">
				<div className="flex overflow-x-auto text-gray-100">

					{ Object.keys(ClanViewTab).map(Number)
						.filter(v => !isNaN(v)).filter(v => v !== ClanViewTab.Management || isDeputyOrHigher)
						.map((tab, index) => (
							<button
								key={index}
								className={`px-4 py-2 ${
									currentTab === tab
										? "text-white bg-ic-light-500"
										: "cursor-pointer hover:bg-ic-light-500/50 hover:text-white"
								}`}
								onClick={() => setCurrentTab(tab)}
							>
								{ ClanViewTab[tab] }
							</button>
					)) }
				</div>
			</div>

			{/* Tab Content */}
			<div className="h-full flex bg-ic-dark-500/75 overflow-y-auto ic-scrollbar"> {/* overflow-y-auto ic-scrollbar grow pr-1*/}
				{ currentTab === ClanViewTab.Clan && (<ClanInfoTab clan={clan} />) }
				{ currentTab === ClanViewTab.Quests && (<ClanQuestsTab clan={clan} />) }
				{ currentTab === ClanViewTab.Property && (<ClanPropertyTab clan={clan} playerMember={playerMember} />) }
				{ currentTab === ClanViewTab.Upgrades && (<ClanUpgradesTab clan={clan} playerMember={playerMember} />) }
				{ currentTab === ClanViewTab.Management && isDeputyOrHigher && (<ClanManagementTab game={game} clan={clan} />) }
			</div>
		</div>
	);
};