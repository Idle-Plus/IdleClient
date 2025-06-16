import { useWebsite } from "@context/WebsiteContext.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { useGame } from "@context/GameContext.tsx";
import { ItemIcon } from "@components/icon";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import React from "react";

const GoldCount = () => {
	const website = useWebsite();
	const pageWidth = useSmartRefWatcher(website.pageWidthRef);

	const game = useGame();
	const gold = useSmartRefWatcher(game.inventory.gold);

	const goldIconSize =
		pageWidth >= 1024 ? 30 :
			pageWidth >= 768 ? 22 :
				20;

	// TODO: Make this a button, and when clicked, opens the popup to send gold.

	return (
		<div
			className="flex items-center m-1.25 lg:m-2 px-1.5 md:px-2 lg:px-3 gap-1.5 md:gap-2 lg:gap-3 select-none
			whitespace-nowrap font-light"
		>
			<ItemIcon item={ItemDatabase.GOLD_ITEM_ID} canvas={true} size={goldIconSize} />
			<div
				className="w-20 md:w-26 lg:w-32 px-2 py-1 text-[0.65rem] md:text-sm lg:text-lg tbox-trim-end text-gray-200
				bg-ic-light-500/25 rounded-sm"
			>
				{ gold.toLocaleString() }
			</div>
		</div>
	)
}

const InventorySize = () => {
	const game = useGame();
	const inventory = useSmartRefWatcher(game.inventory.inventory);

	const slotsFilled = inventory.filter(i => i != null).length;
	const slotsTotal = inventory.length;

	return (
		<div className="flex items-center text-[0.65rem] md:text-sm lg:text-lg text-gray-300">
			Space: {slotsFilled}/{slotsTotal}
		</div>
	)
}

export const InventoryHeader = () => {
	return (
		<div className="w-full min-h-10 lg:min-h-14 flex gap-4 bg-ic-dark-500/75 rounded-md">
			<div className="h-full w-1/2 flex justify-between">
				<GoldCount />
				<InventorySize />
			</div>
			<div className="h-full w-1/2 flex">

			</div>
		</div>
	)
}