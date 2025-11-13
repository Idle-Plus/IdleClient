import React, { createContext, type MouseEvent, RefObject, TouchEvent, useRef } from "react";
import { EquipmentPanel } from "@pages/game/inventory/components/EquipmentPanel.tsx";
import { InventoryPanel } from "@pages/game/inventory/components/InventoryPanel.tsx";
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	MouseSensor, MouseSensorOptions,
	TouchSensor, TouchSensorOptions,
	useSensor
} from "@dnd-kit/core";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { useGame } from "@context/GameContext.tsx";
import { ItemIcon } from "@components/icon";
import { InventoryHeader } from "@pages/game/inventory/components/InventoryHeader.tsx";

export const InventoryCurrentlyDraggingContext = createContext<SmartRef<number | null>>(null!);

const InventoryDragHandler: React.FC<{
	currentIconSizeRef: RefObject<number>,
	currentDragFromRef: SmartRef<number | null>,
}> = ({ currentIconSizeRef, currentDragFromRef }) => {
	const currentDragFrom = useSmartRefWatcher(currentDragFromRef);
	const game = useGame();

	const iconSize = currentIconSizeRef.current * 1.2;
	const itemInSlot = currentDragFrom !== null ?
		game.inventory.getItemDefinitionInSlot(currentDragFrom) : null;

	return (
		<DragOverlay dropAnimation={null}>
			<div
				style={{
					width: `${iconSize}px`,
					height: `${iconSize}px`,
					opacity: 0.8,
				}}
			>
				{ itemInSlot && <ItemIcon
					item={itemInSlot}
					size={iconSize}
					canvas={true}
					className="drop-shadow-lg drop-shadow-black/50"
				/> }
				{/*{currentDragFrom}*/}
			</div>
		</DragOverlay>
	)
}

const InventoryPage: React.FC = () => {
	const game = useGame();

	const currentIconSizeRef = useRef<number>(16);
	const currentDragFromRef = useSmartRef<number | null>(null);
	const currentDragDropPositionRef = useRef<{ x: number, y: number } | null>(null);

	const sensorOption = { activationConstraint: { distance: 4 }, positionRef: currentDragDropPositionRef };
	const mouseSensor = useSensor(InventoryMouseSensor, sensorOption);
	const touchSensor = useSensor(InventoryTouchSensor, sensorOption);

	const tryMoveItem = (from: number, to: number) => {
		const inventorySize = game.inventory.inventory.content().length;
		if (from < 0 || from >= inventorySize) return;
		if (to < 0 || to >= inventorySize) return;
		game.inventory.network.switchItem(from, to);
	}

	const handleDragStart = (event: DragStartEvent) => {
		const data = event.active.data.current as any | undefined;
		currentDragFromRef.setContent(null, false);
		currentDragDropPositionRef.current = null;

		if (data?.type === "slot") {
			currentIconSizeRef.current = data.iconSize;
			currentDragFromRef.setContent(data.slot);
			return;
		} else if (data?.type === "section") {
			const target = event.activatorEvent.target as HTMLElement;
			const rect = target.getBoundingClientRect();

			const slotData = data.data;

			const clientCoords = getClientXYFromEvent(event.activatorEvent);
			if (clientCoords === null) {
				console.error("Inventory DragStart: No clientX or clientY found in event.activatorEvent when starting dragging.");
				return;
			}

			const [ clientX, clientY ] = clientCoords;
			const x = clientX - rect.left;
			const y = clientY - rect.top;

			// We should already have passed the touch test, so we
			// don't need to care about offset anymore.
			const slot = getSlotFromXY(x, y, slotData, 0);
			if (slot === null) return;
			currentIconSizeRef.current = data.iconSize;
			currentDragFromRef.setContent(slot + data.index);
			return;
		} else {
			console.error("Inventory DragStart: Unknown data type:", data?.type);
		}
	}

	const handleDragEnd = (event: DragEndEvent) => {
		if (!event.over) {
			currentDragFromRef.setContent(null);
			return;
		}

		const overData = event.over.data.current as any | undefined;

		const fromSlot: number | null = currentDragFromRef.content();
		currentDragFromRef.setContent(null);
		let toSlot: number | null = null;

		if (fromSlot === null) {
			console.error("Inventory DragDrop: No fromSlot found.");
			return;
		}

		if (overData?.type === "slot") {
			toSlot = overData.slot;
		} else if (overData?.type === "section") {
			const collision = event.collisions?.[0];
			if (collision === undefined) {
				console.error("Inventory DragDrop: No collision found when checking section over.")
				return;
			}

			const target = collision.data?.droppableContainer?.node?.current as HTMLElement | undefined;
			const data = collision.data?.droppableContainer?.data?.current as any | undefined;
			if (!target || !data) {
				console.error("Inventory DragDrop: No target or data found when checking section over.");
				return;
			}

			const rect = target.getBoundingClientRect();
			const slotData = data.data;

			const position = currentDragDropPositionRef.current;
			if (position === null) {
				console.error("Inventory DragDrop: No position found when checking section over.");
				return;
			}

			// Clean up the position reference.
			currentDragDropPositionRef.current = null;

			const x = position.x - rect.left;
			const y = position.y - rect.top;

			// Offset is zero because we're dropping an item.
			const slot = getSlotFromXY(x, y, slotData, 0);
			if (slot === null) return; // Wasn't above a valid slot.
			toSlot = (slot + data.index);
		} else {
			console.error("Inventory DragDrop: Unknown over data type:", overData?.type);
			return;
		}

		if (toSlot === null) {
			console.error("Inventory DragDrop: No toSlot found when checking section over.");
			return;
		}

		if (fromSlot === toSlot) return;

		tryMoveItem(fromSlot, toSlot);
	}

	const handleDragCancel = () => {
		currentDragFromRef.setContent(null);
	}

	console.log("InventoryPage: Drawing");

	return (
		<div className="flex justify-center max-w-7xl mx-auto h-full p-4">

			<div className="flex flex-col gap-4 grow">

				{/* min-h-10 lg:min-h-14 - 56 px */}
				<InventoryHeader />

				{/* InventoryPanel + EquipmentPanel */}
				<div
					className="flex justify-between gap-4 w-full h-[calc(100%-40px)] lg:h-[calc(100%-56px)]"
					//style={{height: "calc(100% - 56px)"}} // Needs to match the used space above.
				>
					<InventoryCurrentlyDraggingContext.Provider value={currentDragFromRef}>
						<DndContext
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
							onDragCancel={handleDragCancel}
							onDragAbort={handleDragCancel}
							sensors={[mouseSensor, touchSensor]}
							modifiers={[snapCenterToCursor]}
						>

							{/* Inventory */}
							<InventoryPanel />

							{/* Equipment */}
							<EquipmentPanel />

							<InventoryDragHandler
								currentIconSizeRef={currentIconSizeRef}
								currentDragFromRef={currentDragFromRef}
							/>
						</DndContext>
					</InventoryCurrentlyDraggingContext.Provider>
				</div>
			</div>
		</div>
	)
}

// @ts-expect-error - We're overriding something that should be.
// noinspection JSUnusedLocalSymbols,DuplicatedCode
class InventoryMouseSensor extends MouseSensor {
	
	private handleEnd(nativeEvent: any) {
		// @ts-expect-error - We're overriding something that should be.
		const {onAbort, onEnd, options} = this.props;

		if (options && options.positionRef) {
			const clientCoords = getClientXYFromEvent(nativeEvent);
			if (clientCoords !== null) options.positionRef.current = { x: clientCoords[0], y: clientCoords[1] };
		}

		// @ts-expect-error - We're overriding something that should be.
		this.detach();
		// @ts-expect-error - We're overriding something that should be.
		if (!this.activated) {
			// @ts-expect-error - We're overriding something that should be.
			onAbort(this.props.active);
		}
		onEnd();
	}

	static activators = [
		{
			eventName: 'onMouseDown' as const,
			handler: ({ nativeEvent: event }: MouseEvent, { onActivation }: MouseSensorOptions) => {

				const target = event.target as HTMLElement;
				const dataAttribute = target.getAttribute("data-inventory-section");
				if (dataAttribute !== null) {
					const data = JSON.parse(dataAttribute) as { data: {pl: number, pr: number, pt: number, pb: number,
							w: number, h: number, s: number, g: number, sl: number, i: number }, offset: number,
						slots: number[] };

					const rect = target.getBoundingClientRect();
					const x = event.clientX - rect.left;
					const y = event.clientY - rect.top;

					// Offset is zero when using the mouse sensor.
					const slot = getSlotFromXY(x, y, data.data, 0);
					if (slot === null) return false;
					onActivation?.({event});
					return data.slots.includes(slot);

				}

				onActivation?.({event});
				return true;
			},
		},
	];
}

// @ts-expect-error - We're overriding something that should be.
// noinspection JSUnusedLocalSymbols,DuplicatedCode
class InventoryTouchSensor extends TouchSensor {

	private handleEnd(nativeEvent: any) {
		// @ts-expect-error - We're overriding something that should be.
		const {onAbort, onEnd, options} = this.props;

		if (options && options.positionRef) {
			const clientCoords = getClientXYFromEvent(nativeEvent);
			if (clientCoords !== null) options.positionRef.current = { x: clientCoords[0], y: clientCoords[1] };
		}

		// @ts-expect-error - We're overriding something that should be.
		this.detach();
		// @ts-expect-error - We're overriding something that should be.
		if (!this.activated) {
			// @ts-expect-error - We're overriding something that should be.
			onAbort(this.props.active);
		}
		onEnd();
	}

	static activators = [
		{
			eventName: 'onTouchStart' as const,
			handler: ({ nativeEvent: event }: TouchEvent, { onActivation }: TouchSensorOptions) => {

				const target = event.target as HTMLElement;
				const dataAttribute = target.getAttribute("data-inventory-section");
				if (dataAttribute !== null) {
					const data = JSON.parse(dataAttribute) as { data: {pl: number, pr: number, pt: number, pb: number,
							w: number, h: number, s: number, g: number, sl: number, i: number }, offset: number,
						slots: number[] };

					const rect = target.getBoundingClientRect();
					const x = event.touches[0].clientX - rect.left;
					const y = event.touches[0].clientY - rect.top;

					const slot = getSlotFromXY(x, y, data.data, data.offset);
					if (slot === null) return false;
					const result = data.slots.includes(slot);
					if (!result) return false;
					onActivation?.({event});
					return true;
				}

				onActivation?.({event});
				return true;
			},
		}
	];

	static setup() {
		// Same logic as parent.
		window.addEventListener("touchmove", noop, {
			capture: false,
			passive: false,
		});

		// :/ welp, it works.
		window.addEventListener("touchstart", (event) => {
			const target = event.target as HTMLElement;
			const dataAttribute = target.getAttribute("data-inventory-section");
			if (!dataAttribute) return;

			const data = JSON.parse(dataAttribute) as { data: {pl: number, pr: number, pt: number, pb: number,
					w: number, h: number, s: number, g: number, sl: number, i: number }, offset: number,
				slots: number[] };

			const rect = target.getBoundingClientRect();
			const x = event.touches[0].clientX - rect.left;
			const y = event.touches[0].clientY - rect.top;

			const slot = getSlotFromXY(x, y, data.data, data.offset);
			if (slot === null) return;
			const result = data.slots.includes(slot);
			if (result) event.preventDefault();
		}, {
			passive: false,
		});

		return function teardown() {
			window.removeEventListener("touchmove", noop);
			window.removeEventListener("touchstart", noop);
		};

		function noop() {}
	}
}

const getClientXYFromEvent = (event: Event): [ number, number ] | null => {
	let clientX: number | null = null;
	let clientY: number | null = null;
	if ("touches" in event) {
		const touchEvent = event as unknown as TouchEvent;
		if (touchEvent.touches.length > 0) {
			clientX = touchEvent.touches[0].clientX;
			clientY = touchEvent.touches[0].clientY;
		} else if (touchEvent.changedTouches.length > 0) {
			clientX = touchEvent.changedTouches[0].clientX;
			clientY = touchEvent.changedTouches[0].clientY;
		}
	} else if ("clientX" in event && "clientY" in event) {
		const mouseEvent = event as MouseEvent | PointerEvent;
		clientX = mouseEvent.clientX;
		clientY = mouseEvent.clientY;
	}

	if (clientX === null || clientY === null) return null;
	return [ clientX, clientY ];
}

const getSlotFromXY = (
	x: number,
	y: number,
	data: { pl: number, pr: number, pt: number, pb: number, w: number, h: number, s: number, g: number, sl: number, i: number },
	offset: number
): number | null => {

	const paddingLeft = data.pl;
	const paddingRight = data.pr;
	const paddingTop = data.pt;
	const paddingBottom = data.pb;
	const width = data.w;
	const height = data.h;
	const slotSize = data.s;
	const gap = data.g;
	const slotsPerRow = data.sl;
	const items = data.i;

	if (x < paddingLeft || x >= width - paddingRight ||
		y < paddingTop  || y >= height - paddingBottom) return null;
	const effectiveX = x - paddingLeft;
	const effectiveY = y - paddingTop;

	const col = Math.floor(effectiveX / (slotSize + gap));
	const row = Math.floor(effectiveY / (slotSize + gap));

	const minX = paddingLeft + col * (slotSize + gap) + offset;
	const minY = paddingTop  + row * (slotSize + gap) + offset;
	const maxX = (minX + slotSize - offset) - offset;
	const maxY = (minY + slotSize - offset) - offset;

	// Check bounds of the slot.
	if (x < minX || x > maxX || y < minY || y > maxY) return null;
	const slot = row * slotsPerRow + col;
	if (slot < 0 || slot >= items) return null;
	return slot;
};

export default InventoryPage;