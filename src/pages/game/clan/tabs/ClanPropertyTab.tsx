import { ItemId } from "@idleclient/types/gameTypes.ts";
import { ItemIcon, SpriteIcon } from "@components/icon";
import { toKMB } from "@idleclient/game/utils/numberUtils.ts";
import { Clan } from "@idleclient/types/clan/Clan.ts";
import { ClanMember } from "@idleclient/types/clan/ClanMember.ts";
import { useGame } from "@context/GameContext.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { IoSettings } from "react-icons/io5";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import ItemSlot from "@components/item/ItemSlot.tsx";
import React from "react";
import { SettingsDatabase } from "@idleclient/game/data/SettingsDatabase.ts";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { LocalizationDatabase } from "@idleclient/game/data/LocalizationDatabase.ts";
import AutoSizer from "react-virtualized-auto-sizer";

const CreditsContainer = ({clan}: {clan: Clan}) => {
	const game = useGame();
	const accumulatedCredits = useSmartRefWatcher(game.clan.accumulatedCredits);

	return (
		<div className="w-full bg-ic-dark-500 p-3 px-4 mx-auto rounded-md text-gray-300">
			<p>Clan credits: <span className="text-gray-100">{clan.credits.toLocaleString()}</span></p>
			<p>My accumulated credits: <span className="text-gray-100">{accumulatedCredits.toLocaleString()}</span></p>
		</div>
	);
}

const VaultContainer = ({ clan }: { clan: Clan }) => {
	const vault = clan.vault ?? new Map<ItemId, number>();
	const maxVaultSpace = clan.isIronmanClan() ?
		SettingsDatabase.shared().iapMaxPurchasableClanVaultSpaceIronman :
		SettingsDatabase.shared().iapMaxPurchasableClanVaultSpace;

	/*vault = new Map(vault);
	for (let i = 0; i < (238); i++) {
		(vault as Map<number, number>).set(i, Math.floor(Math.random() * 100) + 1);
	}*/

	const purchasedSpace = (
		<span className="text-gray-100">
			{clan.purchasedVaultSpace} / {maxVaultSpace}
		</span>
	);
	const totalSpace = (
		<span className="text-gray-100">
			{ vault.size } / { clan.getTotalVaultSpace() }
		</span>
	);

	return (
		<div className="h-full flex flex-col bg-ic-dark-500 rounded-md p-2 space-y-2">
			<div className="flex justify-between">
				<div className="pl-2 text-gray-300">
					<p>Purchased space: {purchasedSpace}</p>
					<p>Total space: {totalSpace}</p>
				</div>

				<div className="flex items-center gap-4 pr-2">
					<div className="text-white">
						<IdleButton
							title={""}
							className={"flex items-center gap-2"}
							onClick={() => {
								// TODO: Vault management
							}}
						>
							<IoSettings />
							Manage
						</IdleButton>
					</div>

					<div className="flex items-center bg-ic-dark-200 px-2 py-2 text-xl rounded-md">
						<ItemIcon
							item={ItemDatabase.item(ItemDatabase.GOLD_ITEM_ID)}
							spriteSize={32}
							canvas={false}
							size={26}
							className="drop-shadow-black/30 drop-shadow-sm select-none"
						/>
						<span className="w-24 pl-2 text-gray-100 tbox-trim-end">
							{ toKMB(clan.gold, { minK: 100000, locale: null }) }
						</span>
					</div>
				</div>
			</div>

			<div className="h-full w-full">
				<AutoSizer>
					{({height, width}) => (
						<div
							// h-[28rem]
							className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8
											place-content-start place-items-center gap-y-2 overflow-y-auto ic-scrollbar"
							style={{ height: height, width: width }}
						>
							{ Array.from(vault).map(([itemId, amount]) => (
								<ItemSlot key={itemId} item={itemId} count={amount} />
							)) }
						</div>
					)}
				</AutoSizer>
			</div>
		</div>
	);
}

const HousingContainer = ({ clan }: { clan: Clan }) => {
	const clanHouse = clan.getHouse();

	return (
		<div className="w-full grow bg-ic-dark-500 p-3 px-4 mx-auto rounded-md">

			{ clanHouse !== null && (
				<div className="h-full flex flex-col items-center justify-center gap-2">
					<div className="text-3xl text-gray-100 tbox-trim-both-cap">
						{ LocalizationDatabase.get(clanHouse.name) }
					</div>

					<SpriteIcon
						icon={`clan_house/${clanHouse.name}`}
						size={160}
						className="drop-shadow-black/50 drop-shadow-md"
					/>

					<div className="text-lg text-gray-300">
						<p>
							Skilling exp boost: <span className="text-gray-100">{clanHouse?.globalSkillingBoost ?? 0}%</span>
						</p>
						<p>
							Vault space: <span className="text-gray-100">{(clanHouse?.inventorySpace ?? 0) + SettingsDatabase.shared().baseClanVaultSpace}</span>
						</p>
					</div>

					<IdleButton
						title={"View housing"}
						className={"w-2/3 mt-4"}
						onClick={() => {
							// TODO: House popup
						}}
					/>
				</div>
			) }

			{ clanHouse === null && (
				<div className="h-full flex flex-col items-center justify-center gap-4">
					<p className="w-3/4 text-center text-xl text-gray-100">
						Your clan doesn't own a house! Purchase one to unlock benefits for everyone in the clan.
					</p>

					<IdleButton
						title={"Purchase"}
						className={"w-2/3"}
						onClick={() => {
							// TODO: House popup
						}}
					/>
				</div>
			) }
		</div>
	);
}

const ClanPropertyTab: React.FC<{ clan: Clan, playerMember: ClanMember }> = ({ clan, playerMember }) => {
	return (
		<div className="w-full p-4">
			<div className="h-full grid grid-cols-[3fr_2fr] gap-8">

				{/* Credits & Vault */}
				<div className="flex flex-col">

					{/* Credits */}
					<p className="pl-2 text-3xl font-semibold text-white">Credits</p>
					<CreditsContainer clan={clan} />

					{/* Vault */}
					<p className="mt-4 pl-2 text-3xl font-semibold text-white">Vault</p>
					<VaultContainer clan={clan} />
				</div>

				{/* Housing */}
				<div className="flex flex-col">
					<p className="pl-2 text-3xl font-semibold text-white">Housing</p>
					<HousingContainer clan={clan} />
				</div>
			</div>
		</div>
	);
}

export default ClanPropertyTab;