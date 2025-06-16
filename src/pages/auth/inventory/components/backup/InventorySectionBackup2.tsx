import { ItemStack } from "@idleclient/types/gameTypes.ts";
import React, { CSSProperties, memo, TouchEvent, useContext, useEffect, useRef, useState } from "react";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { useSpriteSheets } from "@context/SpriteSheetContext.tsx";
import { useStateRef } from "@hooks/useStateRef.ts";
import { InventoryDragContext } from "@pages/auth/inventory/components/InventoryPanel.tsx";
import { useGame } from "@context/GameContext.tsx";
import useInventorySlotWatcher from "@hooks/game/inventory/useInventorySlotWatcher.ts";
import { useDraggable, useDroppable } from "@dnd-kit/core";

const shadowOptions = undefined; /*{
	color: "#00000030",
	offsetX: 0,
	offsetY: 4,
	blur: 2
}*/

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

//export const InventoryRow = memo(InventoryRowComponent, MemoEqual);
export const InventorySection: React.FC<InventorySectionProps> = memo(InventorySectionComponent, MemoEqual);

function MemoEqual(prevProps: InventorySectionProps, nextProps: InventorySectionProps) {
	// TODO: Implement
	return false;
}

function InventorySectionComponent({
	startIndex,
	endIndex,
	//items,

	rows = 2,
	slotsPerRow = 7,

	slotSize = 16 * 4,
	iconSize = 14 * 4,

	slotColor = "#1f7f6b",
	//slotColor = "#5f3d39",
	slotHoverColor = "#259f84",
	//slotHoverColor = "#67443D",

	borderColor = "#229177",
	//borderColor = "#67443d",
	borderRadius = 5,
	borderWidth = 2,

	gap = 0,

	paddingTop = 0,
	paddingBottom = 0,
	paddingLeft = 0,
	paddingRight = 0,
}: InventorySectionProps) {
	const { dragState, setDragState, initDragImage } = useContext(InventoryDragContext);
	const game = useGame();
	const items = useInventorySlotWatcher(game, [startIndex, endIndex])
		.map((slot) => {
			if (slot === undefined) return undefined;
			return slot;
		})

	const sheets = useSpriteSheets();
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const previousItems = useRef<(ItemStack | null | undefined)[]>([]);
	const previousHovering = useRef<number | null>(null);
	const [ hovering, setHovering, hoveringRef ] = useStateRef<number | null>(null);

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

		let background = hovering == slot && entry && entry.count > 0 ? slotHoverColor : slotColor;
		let border = borderColor;
		if (entry === undefined) {
			background = "#703030";
			border = "#903030";
		}

		const row = Math.floor(slot / slotsPerRow);
		const col = slot % slotsPerRow;
		let x = (slotSize * col) + (gap * col) + paddingLeft;
		let y = paddingTop + (row * (slotSize + gap));

		// Draw the slot.
		drawRoundedRect(ctx, x, y, slotSize, slotSize, borderRadius, background, border, borderWidth, shadowOptions);

		// Debug, slot id
		/*ctx.save();
		ctx.fillStyle = "#ff4444";
		ctx.textAlign = "center";
		ctx.font = "bold 16px sans";
		ctx.fillText(`${index + slot}`, x + (slotSize / 2), y + (slotSize / 2));
		ctx.restore();*/

		// If we don't have an item, then we're done.
		if (!entry) return;

		// Get the icon, if there isn't one, then display the item id.
		const icon = GameData.items().item(entry.id).getIcon();
		if (!icon) {
			ctx.save();
			ctx.globalAlpha = entry.count <= 0 ? 0.75 : 1;
			ctx.shadowColor = "#000000f0";
			ctx.shadowBlur = 2;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 1;

			ctx.fillStyle = "#ff6060";
			ctx.textAlign = "center";
			ctx.font = "bold 16px sans";
			ctx.fillText(`NO TEX`, x + (slotSize / 2), y + (slotSize / 2));
			ctx.fillText(`${entry.id}`, x + (slotSize / 2), y + (slotSize / 2) + 16);
			ctx.restore();

			x += (slotSize - iconSize) / 2;
			y += (slotSize - iconSize) / 2;
		} else {
			const sheet = sheets.get(icon.sheet.image);
			if (!sheet) return; // Should technically never happen.

			x += (slotSize - iconSize) / 2;
			y += (slotSize - iconSize) / 2;

			ctx.save();
			ctx.globalAlpha = entry.count <= 0 ? 0.33 : 1;
			ctx.shadowColor = "#000000aa";
			ctx.shadowBlur = 2;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 2;
			ctx.drawImage(sheet, icon.x, icon.y, icon.w, icon.h, x, y, iconSize, iconSize);
			ctx.restore();
		}

		// Draw the count if it isn't 0.
		if (entry.count <= 0) return;

		x += (iconSize / 2)
		y += (iconSize / 2) + 8
		y += (slotSize / 2) - 7

		// Background
		const width = iconSize / 1.5;
		const height = 8;
		drawRoundedRect(ctx, x - width, y - (height + 1), width * 2, height * 2, 5, "rgb(202,141,53)");

		const countText =
			entry.count > 1_000_000 ? `${(entry.count / 10_000).toFixed(1)}M` :
				entry.count > 10_000 ? `${(entry.count / 1_000).toFixed(1)}K` :
					`${entry.count}`;

		ctx.save();
		ctx.fillStyle = "#FFEED4";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = "14px system-ui";

		/*ctx.shadowColor = "#00000030";
		ctx.shadowBlur = 2;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 1;*/

		ctx.fillText(countText, x, y);
		ctx.restore();
	}

	const clear = (ctx: CanvasRenderingContext2D, slot: number) => {
		const row = Math.floor(slot / slotsPerRow);
		const col = slot % slotsPerRow;

		let x = (slotSize * col) + (gap * col);
		let y = (slotSize + gap) * row;

		ctx.clearRect(x, y, slotSize + paddingLeft + paddingRight, slotSize + paddingTop + (paddingBottom / 1.33));
	}

	const redraw = (ctx: CanvasRenderingContext2D, slot: number, climb: boolean = true) => {
		clear(ctx, slot);
		draw(ctx, slot);

		// TODO: Fix shadows so we don't need to redraw the entire column above.
		const row = Math.floor(slot / slotsPerRow);
		if (row !== 0 && climb) {
			const index = (row - 1) * slotsPerRow + (slot % slotsPerRow);
			redraw(ctx, index);
		}
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

	/*
	 * Mouse events
	 */

	const onMouseMove = (e: React.MouseEvent<HTMLElement>, slot: number) => {
		/*const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const slot = getSlotFromXY(x, y);*/

		if (slot === null) {
			if (hoveringRef.current !== null) setHovering(null);
			return;
		}

		if (hoveringRef.current === slot) return;
		const item = items[slot];
		if (item === undefined || item === null) return;
		setHovering(slot);
	}

	// Desktop dragging
	// TODO: I hate the native drag and drop API, look into alternatives /
	//       custom implementation that supports touch of the box.

	const onDragItemStart = (e: React.DragEvent<HTMLDivElement>, item: ItemStack, slot: number) => {
		setDragState({ ...dragState, item: item, from: slot });

		e.dataTransfer.dropEffect = 'none'
		e.dataTransfer.effectAllowed = 'move'

		setHovering(null);
		initDragImage(item, e);
	};

	const onDragItemEnd = (e: React.DragEvent<HTMLDivElement>) => {
		setDragState({ ...dragState, item: null, from: -1, isTouchDragging: false });
	};

	const onDragItemOver = (e: React.DragEvent<HTMLDivElement>, slot: number) => {
		if (slot >= game.inventory.inventory.content().length) return;
		e.preventDefault();
	}

	const onDragItemDrop = (e: React.DragEvent<HTMLDivElement>, slot: number) => {
		if (!dragState.item) return;

		const from = dragState.from;
		setDragState({ ...dragState, item: null, from: -1, isTouchDragging: false });

		game.inventory.switchItem(from, slot);
	};

	// Touch dragging

	const onTouchStart = (e: TouchEvent<HTMLElement>, item: ItemStack, slot: number) => {
		const touch = e.touches[0];

		setDragState({ ...dragState, item: item, from: slot, isTouchDragging: true,
			touchPosition: { x: touch.clientX, y: touch.clientY }});

	};

	const onTouchMove = (e: TouchEvent) => {
		if (!dragState.item) return;

		const touch = e.touches[0];
		setDragState({ ...dragState, touchPosition: { x: touch.clientX, y: touch.clientY } });
	};

	const onTouchEnd = (e: TouchEvent) => {
		const touch = e.changedTouches[0];
		const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;

		const from = dragState.from;
		setDragState({ ...dragState, item: null, from: -1, isTouchDragging: false });

		if (!dropTarget || !dropTarget.closest('.inventory-slot')) return;
		const droppedSlot = dropTarget.closest('.inventory-slot');
		if (!droppedSlot) return;

		const dropIndex = Number(droppedSlot.getAttribute('data-index'));
		if (isNaN(dropIndex) || from === dropIndex) return;

		game.inventory.switchItem(from, dropIndex);
	};

	// TODO: Replace with onMouseEnter & onMouseLeave.
	useEffect(() => {
		const previous = previousHovering.current;
		previousHovering.current = hovering;

		if (previous === null && (hovering === null || items[hovering] === undefined))
			return;

		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		if (previous !== null) {
			redraw(ctx, previous);
		}

		if (hovering !== null && items[hovering]) {
			redraw(ctx, hovering);
		}
	}, [hovering]);

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
				let prev = previous[i];
				let curr = items[i];

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
			console.log("Redrawing item in slot", index);
			redraw(ctx, index);
		}
	}, [items]);

	console.log("InventorySection: rendered");

	return (
		<>
			<canvas
				ref={canvasRef}
				//width={width}
				//height={height}

				/*onMouseMove={onMouseMove}
				onMouseLeave={() => setHovering(null)}*/
			/>

			{ items.map((entry, i) => {
				if (entry === undefined) return;

				const slot = startIndex + i;
				const row = Math.floor(i / slotsPerRow);
				const col = i % slotsPerRow;

				const fullSlotSize = slotSize + gap;
				const offset = (slotSize - iconSize) / 2;

				let x = paddingLeft + col * fullSlotSize + offset;
				let y = paddingTop + row * fullSlotSize + offset;

				return (
					<DroppableSlot
						key={slot}
						slot={slot}

						className="absolute select-none inventory-slot"
						style={{
							top: y,
							left: x,
							width: `${iconSize}px`,
							height: `${iconSize}px`,

							touchAction: !!entry ? "none" : undefined,
							//backgroundColor: "#ffaaaa50"
						}}

						isDraggable={!!entry}
						isDroppable={true}
					/>
				)
			}) }
		</>
	)
}

/*
<div
						className="absolute select-none inventory-slot"
						data-index={slot}
						style={{
							top: y,
							left: x,
							width: `${slotSize}px`,
							height: `${slotSize}px`,

							//backgroundColor: "#ffaaaa50"
						}}

						onMouseMove={(e) => onMouseMove(e, i)}
						onMouseLeave={() => setHovering(null)}

						// Dragging
						draggable={!!entry}
						onDragStart={(e) => onDragItemStart(e, entry!, slot)}
						onDragEnd={onDragItemEnd}
						onDragOver={(e) => onDragItemOver(e, slot)}
						onDrop={(e) => onDragItemDrop(e, slot)}

						// Touch Dragging
						onTouchStart={(e) => onTouchStart(e, entry!!, slot)}
						onTouchMove={onTouchMove}
						onTouchEnd={onTouchEnd}

						onMouseDown={(e) => {console.log("// TODO: Open some sort of item UI.", slot)}}
					/>
 */

interface DroppableSlotProps {
	slot: number;
	className: string;
	style: CSSProperties;
	isDraggable: boolean;
	isDroppable: boolean;
}

const DroppableSlot = memo<DroppableSlotProps>(DroppableSlotComponent,
	(prevProps, nextProps) => {

	console.log("DroppableSlot: comparing1")
	if (prevProps.slot !== nextProps.slot) return false;
	if (prevProps.isDraggable !== nextProps.isDraggable) return false;
	if (prevProps.isDroppable !== nextProps.isDroppable) return false;
	console.log("DroppableSlot: comparing2");
	return true;
});

function DroppableSlotComponent({
	slot,
	className,
	style,
	isDraggable,
	isDroppable,
}: DroppableSlotProps) {

	const droppable = useDroppable({
		id: slot,
		disabled: !isDroppable,
	});

	const draggable = useDraggable({
		id: slot,
		disabled: !isDraggable,
	});

	const finalStyle = draggable.transform ? {
		...style,
		//transform: `translate3d(${draggable.transform.x}px, ${draggable.transform.y}px, 0)`,
	} : style;

	return (
		<div
			ref={ref => {
				droppable.setNodeRef(ref);
				draggable.setNodeRef(ref);
			}}
			key={slot}
			className={className}
			style={finalStyle}
			{...draggable.listeners}
			{...draggable.attributes}
		>

		</div>
	)
}

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
	fillColor?: string,
	strokeColor?: string,
	strokeWidth: number = 1,

	shadowOptions?: {
		color?: string;
		blur?: number;
		offsetX?: number;
		offsetY?: number;
	}
) {
	ctx.save();

	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.arcTo(x + width, y, x + width, y + radius, radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
	ctx.lineTo(x + radius, y + height);
	ctx.arcTo(x, y + height, x, y + height - radius, radius);
	ctx.lineTo(x, y + radius);
	ctx.arcTo(x, y, x + radius, y, radius);
	ctx.closePath();

	if (shadowOptions) {
		ctx.shadowColor = shadowOptions.color ?? "rgba(0, 0, 0, 0.5)";
		ctx.shadowBlur = shadowOptions.blur ?? 4;
		ctx.shadowOffsetX = shadowOptions.offsetX ?? 2;
		ctx.shadowOffsetY = shadowOptions.offsetY ?? 2;
	}

	if (fillColor) {
		ctx.fillStyle = fillColor;
		ctx.fill();
	}

	/*if (shadowOptions) {
		ctx.shadowColor = "transparent";
		ctx.shadowBlur = 0;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
	}*/

	if (strokeColor) {
		ctx.lineWidth = strokeWidth;
		ctx.strokeStyle = strokeColor;
		ctx.stroke();
	}

	ctx.restore();
}