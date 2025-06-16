import AutoSizer from "react-virtualized-auto-sizer";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { ItemStack } from "@idleclient/types/gameTypes.ts";
import { InventorySection } from "@pages/auth/inventory/components/InventorySection.tsx";
import { useGame } from "@context/GameContext.tsx";
import { useWebsite } from "@context/WebsiteContext.tsx";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { useSpriteSheets } from "@context/SpriteSheetContext.tsx";

// How many rows per inventory component.
const rowsPerComponent = 2; // TODO: Changeable in settings.
const rowsOverscan = 1; // TODO: Changeable in settings.
const slotsPerRow = 7; // TODO: Changeable in settings.

// Style settings for the inventory slots.
const slotGap = 16;
const slotPadTop = 12;
const slotPadBottom = 12;
const slotPadLeft = 8;
const slotPadRight = 8;
const scrollWidthPx = 12;

function getSlotSize(width: number) {
	if (width >= 1536) return 18;
	if (width >= 1064) return 16;
	if (width >= 768) return 12;
	return 10;
}

export interface DragState {
	item: ItemStack | null,
	from: number,

	isTouchDragging: boolean,
	touchPosition: { x: number; y: number } | null
}

export const InventoryDragContext = createContext<{
	dragState: DragState,
	setDragState: (state: DragState) => void,
	initDragImage: (stack: ItemStack, dragEvent: React.DragEvent<HTMLDivElement> | null) => void,
}>({ dragState: { item: null, from: -1, isTouchDragging: false, touchPosition: null },
	setDragState: () => {}, initDragImage: () => {} });

const Row = React.memo(({ index, style, data }: ListChildComponentProps) => {
	const { maxSlots, slotSizePx } = data; // TODO: We don't need to include maxSlots.

	const totalSlotsPerComponent = slotsPerRow * rowsPerComponent;
	const startIndex = totalSlotsPerComponent * index;
	const endIndex = Math.min(startIndex + totalSlotsPerComponent, maxSlots) - 1;
	const count = (endIndex - startIndex) + 1;
	const rowsInComponent = Math.ceil(count / slotsPerRow);

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
				iconSize={slotSizePx - (5 * 4)}
				gap={slotGap}
				paddingTop={slotPadTop}
				paddingBottom={slotPadBottom}
				paddingLeft={slotPadLeft}
				paddingRight={slotPadRight}
			/>
		</div>
	)
}, (prevProps, newProps) => {
	return prevProps.index === newProps.index && prevProps.data.slotSizePx === newProps.data.slotSizePx;
});

export const InventoryPanelWorking: React.FC = () => {
	const website = useWebsite();
	const sheets = useSpriteSheets();
	const game = useGame();

	const pageWidth = useSmartRefWatcher(website.pageWidthRef);
	const listRef = useRef<VariableSizeList>(null);
	const [dragState, setDragState] = useState<DragState>({ item: null, from: -1, isTouchDragging: false, touchPosition: null });

	const maxSlots = 550; //550; // TODO: GameData should be exported and used instead.
	const rows = Math.ceil(maxSlots / slotsPerRow);
	const slotSizePx = (getSlotSize(pageWidth) * 4) - (slotGap / 4);

	// The width of the inventory.
	const inventoryWidth = (slotSizePx * slotsPerRow) + (slotGap * (slotsPerRow - 1)) +
		(slotPadLeft + slotPadRight) + scrollWidthPx;

	// Dragging logic.

	const initDragImage = (stack: ItemStack, dragEvent: React.DragEvent<HTMLDivElement> | null) => {
		if (!dragEvent) return;

		const item = GameData.items().item(stack.id);

		if (!item) return;
		const icon = item.getIcon();
		if (!icon) return;
		const sheet = sheets.get(icon.sheet.image);
		if (!sheet) return;

		const canvas = document.createElement("canvas");
		canvas.style.position = "fixed";
		canvas.style.top = "-99999px";
		canvas.style.left = "-99999px";

		const ctx = canvas.getContext("2d")!;
		document.body.append(canvas);

		// Clean up the canvas next frame.
		requestAnimationFrame(() => canvas.remove());

		const padding = 8;
		const iconSize = (slotSizePx - (4 * 4));

		const dpr = window.devicePixelRatio || 1;
		canvas.width = (iconSize + (padding * 2)) * dpr;
		canvas.height = (iconSize + (padding * 2)) * dpr;
		canvas.style.width = `${iconSize + (padding * 2)}px`;
		canvas.style.height = `${iconSize + (padding * 2)}px`;
		ctx.scale(dpr, dpr);

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.globalAlpha = stack.count <= 0 ? 0.5 : 1;
		ctx.shadowColor = "#000000a0";
		ctx.shadowBlur = 4;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 2;
		ctx.drawImage(sheet, icon.x, icon.y, icon.w, icon.h, padding, padding, iconSize, iconSize);

		const size = (slotSizePx - (2 * 4)) / icon.w;
		dragEvent.dataTransfer.setDragImage(canvas, ((size * icon.w) / 2) + padding, ((size * icon.w) / 2) + padding);
	}


	// TODO: Remove this, used for testing.
	/*useEffect(() => {
		const timer = setInterval(() => {
			game.inventory.addItem(792);
		}, 1000);

		return () => {
			clearInterval(timer);
		};
	}, []);*/

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
		//return (rowsInComponent * (slotSizePx + slotPadTop));

		return (slotSizePx * rowsInComponent) + (slotGap * rowsInComponent);
	}, [slotSizePx]);

	console.info("InventoryPanel rendered.");

	return (
		<div className="flex flex-row bg-[#0e2835] ">

			{/* TODO: Find a better solution */}
			{/* Dragging Overlay for Touch Devices */}
			{dragState.isTouchDragging && dragState.touchPosition !== null && (
				<div
					className="fixed pointer-events-none"
					style={{
						top: dragState.touchPosition.y - 24,
						left: dragState.touchPosition.x - 24,
						width: 48,
						height: 48,
						zIndex: 1000,
					}}
				>
					{(() => {
						const item = dragState.item;
						if (!item) return null;
						const icon = GameData.items().item(item.id)?.getIcon();
						if (!icon) return null;

						return (
							<div
								className="inventory-item"
								style={icon.getStyle(1)}
							/>
						);
					})()}
				</div>
			)}

			<div
				className="rounded-md shadow-lg h-full /*bg-red-400*/"
				//className="bg-(--color-darker) rounded-md shadow-lg h-full /*bg-red-400*/"
				style={{width: inventoryWidth + "px"}}
			>
				{/* 56 px */}
				<div className="w-full h-14 bg-[#163d51]">

				</div>

				<InventoryDragContext.Provider value={{ dragState, setDragState, initDragImage }}>
					<div style={{height: `calc(100% - 56px)`}}>
						<AutoSizer>
							{({ height, width }) => (
								<VariableSizeList
									ref={listRef}
									itemCount={Math.ceil(rows / rowsPerComponent)}
									overscanCount={rowsOverscan}
									//estimatedItemSize={((slotSizePx + slotPadTop) * rowsPerComponent) + (slotGap * 2)}
									estimatedItemSize={((slotSizePx + slotPadTop) * rowsPerComponent)}
									itemSize={getItemSizeFunction}
									height={height}
									width={width}
									itemData={{ maxSlots, slotSizePx }}
									className="inventory-scrollbar"
								>
									{Row}
								</VariableSizeList>
							)}
						</AutoSizer>
					</div>
				</InventoryDragContext.Provider>
			</div>

			<div className="w-14 h-full bg-[#163d51]">

			</div>
		</div>
	)
}