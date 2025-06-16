import AutoSizer from "react-virtualized-auto-sizer";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import React, { useCallback, useEffect, useRef } from "react";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { InventorySection } from "@pages/auth/inventory/components/InventorySection.tsx";
import { useWebsite } from "@context/WebsiteContext.tsx";
import { SpriteIcon } from "@/components/icon";
import { ItemIcon } from "@components/icon";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { useGame } from "@context/GameContext.tsx";

// How many rows per inventory component.
const rowsPerComponent = 5; // TODO: Changeable in settings.
const rowsOverscan = 1; // TODO: Changeable in settings.
const slotsPerRow = 7; // TODO: Changeable in settings.

const Row = /*React.memo(*/({ index, style, data }: ListChildComponentProps) => {
	// TODO: We don't need to include maxSlots, instead, get it from game data.
	const { maxSlots, invStyle } = data;

	const totalSlotsPerComponent = slotsPerRow * rowsPerComponent;
	const startIndex = totalSlotsPerComponent * index;
	const endIndex = Math.min(startIndex + totalSlotsPerComponent, maxSlots) - 1;
	const count = (endIndex - startIndex) + 1;
	const rowsInComponent = Math.ceil(count / slotsPerRow);

	const slotSizePx = (invStyle.slotSize * 4) - (invStyle.slotGap / 4);
	const iconSizePx = (invStyle.iconSize * 4) - (invStyle.slotGap / 4);

	return (
		<div
			style={style}
		>
			<InventorySection
				startIndex={startIndex}
				endIndex={endIndex}

				rows={rowsInComponent}
				slotsPerRow={slotsPerRow}
				slotSize={slotSizePx}
				iconSize={iconSizePx}
				//iconSize={slotSizePx - (5 * 4)}
				gap={invStyle.slotGap}
				paddingTop={invStyle.slotPadTop}
				paddingBottom={invStyle.slotPadBottom}
				paddingLeft={invStyle.slotPadLeft}
				paddingRight={invStyle.slotPadRight}
				borderRadius={invStyle.slotBorderRadius}
				borderWidth={invStyle.slotBorderWidth}
			/>
		</div>
	)
}

function getInventoryStyle(width: number) {
	if (width >= 1536) return {
		slotGap: 16,
		slotPadTop: 12,
		slotPadBottom: 12,
		slotPadLeft: 8,
		slotPadRight: 8,
		scrollWidthPx: 8,
		slotSize: 18,
		iconSize: 13,
		slotBorderRadius: 5,
		slotBorderWidth: 2,
	}

	if (width >= 1024) return {
		slotGap: 12,
		slotPadTop: 8,
		slotPadBottom: 8,
		slotPadLeft: 8,
		slotPadRight: 8,
		scrollWidthPx: 8,
		slotSize: 14,
		iconSize: 9,
		slotBorderRadius: 3,
		slotBorderWidth: 2,
	}

	if (width >= 768) return {
		slotGap: 10,
		slotPadTop: 8,
		slotPadBottom: 8,
		slotPadLeft: 8,
		slotPadRight: 8,
		scrollWidthPx: 8,
		slotSize: 10,
		iconSize: 7,
		slotBorderRadius: 3,
		slotBorderWidth: 1.5,
	}

	return {
		slotGap: 8,
		slotPadTop: 8,
		slotPadBottom: 8,
		slotPadLeft: 8,
		slotPadRight: 8,
		scrollWidthPx: 8,
		slotSize: 8,
		iconSize: 6,
		slotBorderRadius: 3,
		slotBorderWidth: 1,
	}
}

export const InventoryPanel: React.FC = () => {
	const website = useWebsite();
	const pageWidth = useSmartRefWatcher(website.pageWidthRef);
	const listRef = useRef<VariableSizeList>(null);

	const invStyle = getInventoryStyle(pageWidth);

	const maxSlots = 550; // TODO: GameData should be exported and used instead.
	const rows = Math.ceil(maxSlots / slotsPerRow);
	const slotSizePx = (invStyle.slotSize * 4) - (invStyle.slotGap / 4);

	// The width of the inventory.
	const inventoryWidth = (slotSizePx * slotsPerRow) + (invStyle.slotGap * (slotsPerRow - 1)) +
		(invStyle.slotPadLeft + invStyle.slotPadRight) + invStyle.scrollWidthPx;

	// Reset the list if the slot size changes.
	useEffect(() => {
		listRef.current?.resetAfterIndex(0);
	}, [slotSizePx]);

	const getItemSizeFunction = useCallback((index: number) => {
		const totalSlotsPerComponent = slotsPerRow * rowsPerComponent;
		const startSlot = index * totalSlotsPerComponent;
		const remainingSlots = maxSlots - startSlot;

		// Find out how many rows this component actually needs.
		const rowsInComponent = Math.ceil(Math.min(remainingSlots, totalSlotsPerComponent) / slotsPerRow);
		return (slotSizePx * rowsInComponent) + (invStyle.slotGap * rowsInComponent);
	}, [invStyle.slotGap, slotSizePx]);

	console.info("InventoryPanel rendered.");

	return (
		<div className="flex flex-row /*bg-[#0e2835]*/ ">
			<div
				className="rounded-md shadow-lg h-full"
				style={{width: inventoryWidth + "px"}}
			>
				{/* 56 px */}
				<div className="flex w-full h-10 lg:h-14 p-1.25 lg:p-2 bg-ic-dark-500/75 border-b-4 border-ic-dark-500 rounded-tl-md">
					{/*<TopBar />*/}
				</div>

				<div
					className="h-[calc(100%-40px)] lg:h-[calc(100%-56px)] bg-ic-dark-500"
					//style={{height: `calc(100% - 56px)`}}
				>
					<AutoSizer>
						{({ height, width }) => (
							<VariableSizeList
								ref={listRef}
								itemCount={Math.ceil(rows / rowsPerComponent)}
								overscanCount={rowsOverscan}
								estimatedItemSize={((slotSizePx + invStyle.slotPadTop) * rowsPerComponent)}
								itemSize={getItemSizeFunction}
								height={height}
								width={width}
								itemData={{ maxSlots, invStyle }}
								className="inventory-scrollbar"
							>
								{Row}
							</VariableSizeList>
						)}
					</AutoSizer>
				</div>
			</div>

			<div className="w-10 lg:w-14 h-full bg-ic-dark-500/75 rounded-r-md">

			</div>
		</div>
	)
}
