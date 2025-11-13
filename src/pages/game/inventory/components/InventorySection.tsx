import { ItemStack } from "@idleclient/types/gameTypes.ts";
import React, { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { useSpriteSheets } from "@context/SpriteSheetContext.tsx";
import { useGame } from "@context/GameContext.tsx";
import useInventorySlotWatcher from "@hooks/game/inventory/useInventorySlotWatcher.ts";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { InventoryCurrentlyDraggingContext } from "@pages/game/inventory/InventoryPage.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { WeaponEffectType } from "@idleclient/network/NetworkData.ts";
import { toKMB } from "@idleclient/game/utils/numberUtils.ts";
import ItemTooltip from "@components/item/ItemTooltip.tsx";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { useToast } from "@context/ToastContext.tsx";
import { useModal } from "@context/ModalContext.tsx";
import { ItemInteractionModal, ItemInteractionModalId } from "@/modals/ItemInteractionModal.tsx";

// TODO: Wouldn't animated effects be way cooler? :/
const COSMETIC_SHADOWS = {
	offsets: [
		[  0, -4 ], // up
		[  2, -2 ], // up-right
		[  4,  0 ], // right
		[  2,  2 ], // right-down
		[  0,  4 ], // down
		[ -2,  2 ], // down-left
		[ -4,  0 ], // left
		[ -2, -2 ], // left-up
	],

	[WeaponEffectType.None]: { color: "#00000000", blur: 0 }, // Should never be picked.
	[WeaponEffectType.Flaming]: { color: "#FF00007F", blur: 2 },
	[WeaponEffectType.Ghostly]: { color: "#FFFFFF7F", blur: 2 },
	[WeaponEffectType.Void]: { color: "#0000007F", blur: 2 },
	[WeaponEffectType.Nature]: { color: "#00FF007F", blur: 2 }
}

interface InventorySectionProps {
	/**
	 * The start index of this row.
	 */
	startIndex: number;
	/**
	 * The end index we're tracking, inclusive.
	 */
	endIndex: number;

	/**
	 * The number of rows to display.
	 */
	rows?: number;
	/**
	 * How many slots per row.
	 */
	slotsPerRow?: number;

	/**
	 * The size of a slot.
	 */
	slotSize?: number;
	/**
	 * The size of the icon displayed in each slot.
	 */
	iconSize?: number;

	/**
	 * The color of the slot.
	 */
	slotColor?: string;
	/**
	 * The color of the slot when it's hovered over.
	 */
	slotHoverColor?: string;

	/*
	 * The border around the slot.
	 */

	borderColor?: string;
	borderRadius?: number;
	borderWidth?: number;

	/**
	 * The gap between each slot in the row.
	 */
	gap?: number;

	/*
	 * The padding around the row.
	 */

	paddingTop?: number;
	paddingBottom?: number;
	paddingLeft?: number;
	paddingRight?: number;

	/*
	 * Callbacks
	 */

	onDragStart?: (slot: number) => void;
	onDragEnd?: (slot: number) => void;
	onDragDrop?: (slot: number) => void;
}

export const InventorySection: React.FC<InventorySectionProps> = memo(InventorySectionComponent,
	(prev, next) => {
	return prev.startIndex === next.startIndex &&
		prev.endIndex === next.endIndex &&
		prev.rows === next.rows &&
		prev.slotsPerRow === next.slotsPerRow &&
		prev.slotSize === next.slotSize &&
		prev.iconSize === next.iconSize &&
		prev.borderRadius === next.borderRadius &&
		prev.borderWidth === next.borderWidth &&
		prev.gap === next.gap &&
		prev.paddingTop === next.paddingTop &&
		prev.paddingBottom === next.paddingBottom &&
		prev.paddingLeft === next.paddingLeft &&
		prev.paddingRight === next.paddingRight;
});

function InventorySectionComponent({
	startIndex,
	endIndex,

	rows = 2,
	slotsPerRow = 7,

	slotSize = 16 * 4,
	iconSize = 14 * 4,

	slotColor = "#1f7f6b",
	slotHoverColor = "#23987c",

	borderColor = "#23987c",
	borderRadius = 5,
	borderWidth = 2,

	gap = 0,

	paddingTop = 0,
	paddingBottom = 0,
	paddingLeft = 0,
	paddingRight = 0,
}: InventorySectionProps) {
	const TOUCH_CLICK_THRESHOLD = 200;
	const spriteSheets = useSpriteSheets();
	const game = useGame();
	const toast = useToast();
	const modal = useModal();
	const draggingSlotRef = useContext(InventoryCurrentlyDraggingContext);

	const draggingSlot = useSmartRefWatcher(draggingSlotRef);
	const items = useInventorySlotWatcher(game, [startIndex, endIndex])
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const previousItems = useRef<(ItemStack | null | undefined)[]>([]);

	const touchPressRef = useRef<{ slot: number, time: Date } | undefined>(undefined);
	const hoveringRef = useRef<number | null>(null);
	const [hovering, setHovering] = useState<number | null>(null);

	const width = (slotSize * slotsPerRow) + (gap * (slotsPerRow - 1)) + (paddingLeft + paddingRight);
	const height = (slotSize * rows) + paddingTop + paddingBottom + (gap * (rows - 1));

	/*
	 * Draw & clear slot functions
	 */

	const draw = (
		ctx: CanvasRenderingContext2D,
		slot: number
	) => {
		const entry = items[slot];

		let background = hoveringRef.current == slot && entry ? slotHoverColor : slotColor;
		let border = borderColor;
		if (entry === undefined) {
			background = "#703030";
			border = "#903030";
		}

		const row = Math.floor(slot / slotsPerRow);
		const col = slot % slotsPerRow;
		let x = (slotSize * col) + (gap * col) + paddingLeft;
		let y = paddingTop + (row * (slotSize + gap));

		/*
		 * Slot
		 */

		roundRect(ctx, x, y, slotSize, slotSize, borderRadius, background, border, borderWidth);
		if (!entry) return;

		/*
		 * Icon
		 */

		const itemDef = GameData.items().item(entry.id);
		let icon = itemDef.getIcon();
		if (!icon) icon = GameData.items().sheet.getIcon(":missing:");
		const sheet = icon && spriteSheets.sheets.get(icon.sheet.image);

		x += (slotSize - iconSize) / 2;
		y += (slotSize - iconSize) / 2;

		if (!icon || !sheet) {
			ctx.save();

			ctx.globalAlpha = entry.count <= 0 ? 0.8 : 1;
			ctx.shadowColor = "#000000f0";
			ctx.shadowBlur = 2;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 1;

			ctx.fillStyle = "#ff6060";
			ctx.textAlign = "center";
			ctx.font = "bold 16px sans";
			ctx.fillText(`NO TEX`, x + (slotSize / 2) - ((slotSize - iconSize) / 2),
				y + (slotSize / 2) - ((slotSize - iconSize) / 2));
			ctx.fillText(`${entry.id}`, x + (slotSize / 2) - ((slotSize - iconSize) / 2),
				y + (slotSize / 2) - ((slotSize - iconSize) / 2) + 16);
			ctx.restore();
		} else {

			ctx.save();
			let imageSize = iconSize;

			if (entry.count <= 0) {
				// Draw the placeholder background
				ctx.fillStyle = "#A38C62DD";
				ctx.strokeStyle = "#6C5B41DD";
				ctx.lineWidth = 1.5;
				ctx.setLineDash([7, 2]);
				ctx.beginPath()
				ctx.roundRect(x - 2, y - 2, iconSize + 4, iconSize + 4, 4);

				ctx.shadowColor = "#000000A0";
				ctx.shadowBlur = 2;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 2;
				ctx.fill();

				ctx.shadowColor = "#00000000";
				ctx.stroke();
				ctx.globalAlpha = 1;

				const shrinkSize = 6;
				x += shrinkSize / 2;
				y += shrinkSize / 2;
				imageSize -= shrinkSize;
			}

			ctx.globalAlpha = 1;

			if (itemDef.getCosmeticEffect() !== null) {
				const effect = itemDef.getCosmeticEffect()!;
				const options = COSMETIC_SHADOWS[effect];

				COSMETIC_SHADOWS.offsets.forEach(([oX, oY]) => {
					ctx.shadowOffsetX = oX;
					ctx.shadowOffsetY = oY;

					ctx.shadowColor = options.color;
					ctx.shadowBlur = options.blur;

					ctx.drawImage(sheet, icon.x, icon.y, icon.w, icon.h, x, y, imageSize, imageSize);
				})
			} else {
				ctx.shadowColor = entry.count <= 0 ? "#000000F0" : "#000000AA";
				ctx.shadowBlur = entry.count <= 0 ? 1 : 2;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = entry.count <= 0 ? 0 : 2;
			}

			ctx.drawImage(sheet, icon.x, icon.y, icon.w, icon.h, x, y, imageSize, imageSize);
			ctx.restore();
		}

		/*
		 * Item count
		 */

		if (entry.count <= 0) return;

		x += (iconSize / 2)
		y += (iconSize / 2) + 8
		y += (slotSize / 2) - 7

		const calculateFontSize = (baseSize: number, containerSize: number) => {
			const minSize = 8.5; // Minimum font size
			const maxSize = baseSize; // Maximum font size

			const scaleFactor = containerSize / (16 * 4) // The highest slot size defined in InventoryPanel.
			const scaledSize = Math.floor(baseSize * scaleFactor);

			return Math.max(minSize, Math.min(scaledSize, maxSize));
		};

		const baseFontSize = 14;
		const scaledFontSize = calculateFontSize(baseFontSize, slotSize);

		ctx.save();
		ctx.font = `${scaledFontSize}px Nunito Sans, sans-serif`;

		const countText = toKMB(entry.count);

		const metrics = ctx.measureText(countText);
		const textWidth = metrics.width;
		const textHeight = scaledFontSize;

		// Calculate background dimensions, scaled with the font.
		const paddingWidth = Math.floor(scaledFontSize * 0.5)
		const paddingHeight = Math.max(1, Math.floor(scaledFontSize * 0.2));
		const backgroundWidth = Math.max(textWidth + (paddingWidth * 2), iconSize / 1.2);
		const backgroundHeight = textHeight + ((paddingHeight * 2) / 1.5 );

		// Draw background
		roundRect(
			ctx,
			x - (backgroundWidth / 2),
			y - (backgroundHeight / 2),
			backgroundWidth,
			backgroundHeight,
			Math.max(2, Math.floor(scaledFontSize * 0.5)), // Scale border radius too
			"#ca8d35"
		);

		// Draw the text
		ctx.fillStyle = "#FFEED4";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(countText, x, y + 2);
		ctx.restore();
	}

	const clear = (ctx: CanvasRenderingContext2D, slot: number) => {
		const row = Math.floor(slot / slotsPerRow);
		const col = slot % slotsPerRow;

		const x = (slotSize * col) + (gap * col) + paddingLeft;
		const y = ((slotSize + gap) * row) + paddingTop;

		const halfGap = gap / 2;
		ctx.clearRect(x - halfGap, y - borderWidth, slotSize + gap, slotSize + gap);
		//ctx.clearRect(x, (y + paddingTop) - (borderWidth / 2), slotSize + paddingLeft + paddingRight, slotSize + paddingBottom);
	}

	const redraw = (ctx: CanvasRenderingContext2D, slot: number, climb: boolean = true) => {
		clear(ctx, slot);
		draw(ctx, slot);
	}

	const getSlotFromXY = (x: number, y: number): number | null => {
		if (x < paddingLeft || x > (width - paddingRight)) return null;
		if (y < paddingTop || y > (height - paddingBottom)) return null;

		const row = Math.floor((y - paddingTop) / (slotSize + gap));
		const col = Math.floor((x - paddingLeft) / (slotSize + gap));
		const slot = (row * slotsPerRow) + col;

		if (x > ((slotSize * col) + (gap * col) + paddingLeft + slotSize)) return null;
		if (y > ((slotSize * row) + (gap * row) + paddingTop + slotSize)) return null;
		if (slot < 0 || slot >= items.length) return null;
		return slot;
	}

	const getItemFromXY = (x: number, y: number): ItemStack | null => {
		const index = getSlotFromXY(x, y);
		if (index === null) return null;
		return items[index] ?? null;
	}

	const handleHoveringLogic = (e: React.MouseEvent<HTMLElement>, clear?: boolean) => {
		// If we should clear the hovering slot, then just do so and return.
		if (clear) {
			const slot = hoveringRef.current;
			if (slot === null) return;

			setHovering(null);
			hoveringRef.current = null;
			const ctx = canvasRef.current?.getContext("2d");
			if (ctx) redraw(ctx, slot);
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const slot = getSlotFromXY(x, y);
		const previousSlot = hoveringRef.current;

		if (slot === previousSlot) return;
		// Only update the hovering if we're not dragging an item.
		if (draggingSlot === null || slot === null) {
			hoveringRef.current = slot;
			setHovering(slot);
		}

		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		if (previousSlot !== null) redraw(ctx, previousSlot);
		if (slot !== null && draggingSlot === null) redraw(ctx, slot);
	}

	// Clear the hovering slot if we're dragging an item.
	if (draggingSlot !== null && hoveringRef.current !== null) {
		const slot = hoveringRef.current;
		setHovering(null);
		hoveringRef.current = null;
		const ctx = canvasRef.current?.getContext("2d");
		if (ctx) redraw(ctx, slot);
	}

	// Initial draw of items.
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return

		const dpr = window.devicePixelRatio || 1;
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;

		ctx.scale(dpr, dpr);
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.clearRect(0, 0, width, height);

		for (let i = 0; i < items.length; i++) draw(ctx, i);
	}, [slotSize, iconSize, paddingTop, paddingLeft, gap]);

	// Redraw items that changed.
	useEffect(() => {
		const previous = previousItems.current;
		if (previous.length === 0) {
			// First time rendering, no need to check.
			previousItems.current = structuredClone(items);
			return;
		}

		// Update the previous.
		previousItems.current = structuredClone(items);

		// Check which items we should re-render.
		const changed = [];
		if (previous.length !== items.length) {
			items.forEach((_, i) => changed.push(i));
		} else {
			for (let i = 0; i < items.length; i++) {
				const prev = previous[i];
				const curr = items[i];

				if (prev === undefined && curr === undefined) continue;
				if (prev === undefined && curr !== undefined) {
					changed.push(i);
					continue;
				}
				if (prev !== undefined && curr === undefined) {
					changed.push(i);
					continue;
				}

				if ((prev?.id !== curr?.id) || (prev?.count !== curr?.count)) {
					changed.push(i);
				}
			}
		}

		// If we didn't find any changes, then don't do anything.
		if (changed.length === 0) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		for (const index of changed) {
			//console.log("Redrawing item in slot", index);
			redraw(ctx, index);
		}
	}, [items]);

	/*
	 * Click logic
	 */

	const handleLeftClick = (e: React.MouseEvent<HTMLElement>) => {
		console.log(e);
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const item = getItemFromXY(x, y);
		if (item === null) return;
		e.preventDefault();

		modal.openModal(ItemInteractionModalId, <ItemInteractionModal item={item} />)
	}

	const handleRightClick = (e: React.MouseEvent<HTMLElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const item = getItemFromXY(x, y);
		if (item === null) return;
		e.preventDefault();

		const itemDef = ItemDatabase.item(item.id);
		if (itemDef === null) return;
		if (itemDef.levelRequirement !== null && !game.skill.hasLevel(itemDef.levelRequirement)) {
			toast.warn(null, "You don't have the required level to use this item.");
			return;
		}

		e.preventDefault();
		game.equipment.equipItem(item);
	}

	// Custom touch logic... draggable is so much fun.
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const handleTouchStart = (e: TouchEvent) => {
			const rect = canvas.getBoundingClientRect();
			const touch = e.touches[0];
			const x = touch.clientX - rect.left;
			const y = touch.clientY - rect.top;
			const slot = getSlotFromXY(x, y);
			if (slot === null) return;

			touchPressRef.current = {
				slot: slot,
				time: new Date()
			};
		};

		const handleTouchEnd = (e: TouchEvent) => {
			if (!touchPressRef.current) return;
			const endTime = new Date();
			const data = touchPressRef.current;
			touchPressRef.current = undefined;

			const timeDiff = endTime.getTime() - data.time.getTime();
			if (timeDiff > TOUCH_CLICK_THRESHOLD) return;

			const rect = canvas.getBoundingClientRect();
			const touch = e.changedTouches[0];
			const x = touch.clientX - rect.left;
			const y = touch.clientY - rect.top;
			const endSlot = getSlotFromXY(x, y);

			// Make sure we ended in the same slot.
			if (endSlot !== data.slot) return;
			const item = getItemFromXY(x, y);
			if (item === null) return;

			modal.openModal(ItemInteractionModalId, <ItemInteractionModal item={item} />);
		};

		canvas.addEventListener('touchstart', handleTouchStart);
		canvas.addEventListener('touchend', handleTouchEnd);

		return () => {
			canvas.removeEventListener('touchstart', handleTouchStart);
			canvas.removeEventListener('touchend', handleTouchEnd);
		};
	}, [getItemFromXY, getSlotFromXY, modal]);


	/*
	 * Tooltip
	 */

	const getTooltip = () => {
		if (canvasRef.current === null || hovering === null) return null;
		const item = items[hovering];
		if (!item) return null;
		const itemDef = GameData.items().item(item.id);

		const rect = canvasRef.current.getBoundingClientRect();
		const canvasX = rect.left;
		const canvasY = rect.top;

		const row = Math.floor(hovering / slotsPerRow);
		const col = hovering % slotsPerRow;

		const x = (slotSize * col) + (gap * col) + paddingLeft + canvasX;
		const y = ((slotSize + gap) * row) + paddingTop + canvasY;

		const positions = [];
		positions.push({ x: x + (slotSize / 2), y: y - 2 });
		positions.push({ x: x - 2, y: y + (slotSize / 2) });
		positions.push({ x: x + (slotSize / 2), y: y + slotSize + gap - 2 });

		return (
			<ItemTooltip
				key={item.id}
				item={itemDef}
				count={item.count}
				positions={positions}
				className="shadow-black/50 shadow-md"
			/>
		);
	}

	/*
	 * Drag & Drop logic
	 */

	const offset = (slotSize - iconSize) / 2;
	const data = useMemo(() => {
		//console.log("Recalculating inventory section data for index", startIndex);
		return { pl: paddingLeft, pr: paddingRight, pt: paddingTop, pb: paddingBottom,
			w: width, h: height, s: slotSize, g: gap, sl: slotsPerRow, i: items.length }
	}, [paddingLeft, paddingRight, paddingTop, paddingBottom, width, height, slotSize, gap, slotsPerRow, items.length]);

	const getInventorySectionData = useMemo((): string => {
		//console.log("Recalculating inventory section data for index", startIndex);

		return JSON.stringify({
			data: data,
			offset: offset,
			slots: items
				.map((e, i) => e ? i : null)
				.filter(e => e !== null)
		});
	}, [data, offset, items]);

	const droppable = useDroppable({
		id: startIndex * 1000,
		data: { index: startIndex, data: data, offset: offset, type: "section", iconSize: iconSize },
	});

	const draggable = useDraggable({
		id: startIndex * 1000,
		data: { index: startIndex, data: data, offset: offset, type: "section", iconSize: iconSize },
	})

	return (
		<>
			{ getTooltip() }

			<canvas
				ref={(ref) => {
					canvasRef.current = ref;
					droppable.setNodeRef(ref);
					draggable.setNodeRef(ref);
				}}

				style={{
					userSelect: "none",
					WebkitUserSelect: "none",
					msUserSelect: "none",
					MozUserSelect: "none",
					outline: "none",
					WebkitTapHighlightColor: "transparent"
				}}

				{...draggable.listeners}
				{...draggable.attributes}


				onClick={handleLeftClick}
				onContextMenu={handleRightClick}

				onMouseMove={handleHoveringLogic}
				onMouseLeave={e => handleHoveringLogic(e, true)}

				data-inventory-section={getInventorySectionData}
			/>
		</>
	)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number,
	fillColor?: string, strokeColor?: string, strokeWidth: number = 1) {

	ctx.save();
	ctx.beginPath();

	// roundRect might not be available in every browser.
	if (ctx.roundRect) {
		ctx.roundRect(x, y, width, height, radius);
	} else {
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.arcTo(x + width, y, x + width, y + radius, radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
		ctx.lineTo(x + radius, y + height);
		ctx.arcTo(x, y + height, x, y + height - radius, radius);
		ctx.lineTo(x, y + radius);
		ctx.arcTo(x, y, x + radius, y, radius);
	}

	ctx.closePath();

	if (fillColor) {
		ctx.fillStyle = fillColor;
		ctx.fill();
	}

	if (strokeColor) {
		ctx.lineWidth = strokeWidth;
		ctx.strokeStyle = strokeColor;
		ctx.stroke();
	}

	ctx.restore();
}