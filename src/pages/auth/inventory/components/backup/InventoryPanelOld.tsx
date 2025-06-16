import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, ListChildComponentProps, VariableSizeList } from "react-window";
import React from "react";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { ItemStack } from "@idleclient/types/gameTypes.ts";
import { InventorySection } from "@pages/auth/inventory/components/InventorySection.tsx";
import { ItemSlot } from "@components/ItemSlot.tsx";
import { useGame } from "@context/GameContext.tsx";
import { useWebsite } from "@context/WebsiteContext.tsx";

function getSlotSize(width: number) {
	if (width >= 1536) return 18;
	if (width >= 1064) return 16;
	if (width >= 768) return 12;
	return 10;
}

export const InventoryPanelOld: React.FC = () => {
	const website = useWebsite();
	const game = useGame();

	const pageWidth = useSmartRefWatcher(website.pageWidthRef);
	const inventory = useSmartRefWatcher(game.inventory.inventory);
	const inventorySize = inventory.length;

	const maxSlots = 550; // TODO: GameData should be exported and used instead.
	const slotsPerRow = 7; // TODO: Should be changeable in settings.
	const rows = Math.ceil(maxSlots / slotsPerRow);

	// How many rows per inventory component.
	const rowsPerComponent = 1;
	const rowsOverscan = 2;

	const slotSizePx = (getSlotSize(pageWidth) * 4);
	const slotGap = 12;
	const slotPadTop = 12;
	const slotPadBottom = 12;
	const slotPadLeft = 8;
	const slotPadRight = 8;
	//const slotPaddingPx = gap;
	const scrollWidthPx = 12;

	const inventoryWidth = (slotSizePx * slotsPerRow) + (slotGap * (slotsPerRow - 1)) +
		(slotPadLeft + slotPadRight) + scrollWidthPx;

	const Row = React.memo(({ index, style }: ListChildComponentProps) => {
		const totalSlotsPerComponent = slotsPerRow * rowsPerComponent;
		const startSlot = index * totalSlotsPerComponent;
		const remainingSlots = maxSlots - startSlot;
		const rowsInComponent = Math.ceil(Math.min(remainingSlots, totalSlotsPerComponent) / slotsPerRow);

		const perEntry = slotsPerRow * rowsPerComponent;
		const startIndex = perEntry * index;
		const count = Math.min(startIndex + perEntry, maxSlots) - startIndex;

		const items: (ItemStack | null | undefined)[] = [];
		for (let i = 0; i < perEntry; i++) {
			const index = startIndex + i;
			// Check if we're at the end of the inventory.
			if ((index + 1) >= maxSlots) break;

			// Check if we should lock the slot or not.
			if (index >= inventorySize) {
				items[i] = undefined;
				continue;
			}

			// Get the inventory item.
			items[i] = inventory[index];
		}

		console.log("ITEMS:", items.length, startIndex, 0, items);

		/*if ((index % 2 === 0) || true) {
			return (
				<div
					style={style}
				>
					<InventoryRow
						index={startIndex}
						items={items}
						rows={rowsInComponent}
						slotSize={slotSizePx}
						gap={slotGap}
						paddingTop={slotPadTop}
						paddingBottom={slotPadBottom}
						paddingLeft={slotPadLeft}
						paddingRight={slotPadRight}
					/>
				</div>
			)
		}*/

		// flex flex-row justify-start
		return (
			<div
				className="grid justify-items-center bg-pink-400/30 overflow-hidden"
				style={{...style, gridTemplateColumns: `repeat(${slotsPerRow}, minmax(0, 1fr))`}}
			>
				{Array.from({ length: count }, (_, i) => {
					const slotIndex = startIndex + i;
					const item = slotIndex < inventorySize ? inventory[slotIndex] : null;

					// TODO: Make slot red or something if it's locked.
					return (
						<ItemSlot
							key={slotIndex}
							item={item}
							size={slotSizePx / 4}
							itemClass={slotIndex >= inventorySize ? "bg-red-500" : ""}
						/>
					);
				})}
			</div>
		);
	}, (prevProps, newProps) => {
		return prevProps.index === newProps.index /*&& prevProps.style === newProps.style*/;
	});

	return (
		<div className="flex flex-row">
			<div
				className="bg-(--color-darker) rounded-md shadow-lg h-full /*bg-red-400*/"
				style={{width: inventoryWidth + "px"}}
			>
				{/* 48 px */}
				<div className="w-full h-12 bg-pink-400">

				</div>

				<div
					className={`/*pl-3*/`}
					style={{height: `calc(100% - 48px)`}}
				>
					<AutoSizer>
						{({ height, width }) => (
							<VariableSizeList
								itemKey={(index) => `inv-row-${index}`}
								estimatedItemSize={(slotSizePx + slotPadTop) * rowsPerComponent}
								itemSize={index => {
									const totalSlotsPerComponent = slotsPerRow * rowsPerComponent;
									const startSlot = index * totalSlotsPerComponent;
									const remainingSlots = maxSlots - startSlot;

									// Find out how many rows this component actually needs.
									const rowsInComponent = Math.ceil(Math.min(remainingSlots, totalSlotsPerComponent) / slotsPerRow);
									return rowsInComponent * (slotSizePx + slotPadTop);
								}}
								//itemSize={(slotSizePx + slotPadTop) * rowsPerComponent}
								//itemSize={(slotSizePx) + 8}
								height={height}
								itemCount={Math.ceil(rows / rowsPerComponent)} // rows
								width={width}
								//width={((slotSize * 4) + 8) * slotsPerRow}
								overscanCount={rowsOverscan}

								className="inventory-scrollbar"
							>
								{Row}
							</VariableSizeList>
						)}
					</AutoSizer>
				</div>
			</div>

			<div className="w-12 h-full bg-yellow-300">

			</div>
		</div>
	)
}