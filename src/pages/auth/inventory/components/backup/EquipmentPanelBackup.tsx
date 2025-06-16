import React, { memo, useRef, useState } from "react";
import { useWebsite } from "@context/WebsiteContext.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { useGame } from "@context/GameContext.tsx";
import { EquipmentSlot } from "@idleclient/network/NetworkData.ts";
import { ItemIcon, SpriteIcon } from "@components/icon";
import { ItemStack } from "@idleclient/types/gameTypes.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import EquipmentTooltip from "@pages/auth/inventory/components/EquipmentTooltip.tsx";

const EQUIPMENT_SLOT_TO_ICON: Record<EquipmentSlot, string> = {
	[EquipmentSlot.None]: "slot_none",
	[EquipmentSlot.Ammunition]: "slot_arrow",
	[EquipmentSlot.Earrings]: "slot_earrings",
	[EquipmentSlot.Amulet]: "slot_amulet",
	[EquipmentSlot.Jewellery]: "slot_ring",
	[EquipmentSlot.Bracelet]: "slot_bracelet",

	[EquipmentSlot.Pet]: "slot_pet",
	[EquipmentSlot.Head]: "slot_head",
	[EquipmentSlot.Cape]: "slot_cape",
	[EquipmentSlot.LeftHand]: "slot_left_hand",
	[EquipmentSlot.Body]: "slot_body",
	[EquipmentSlot.RightHand]: "slot_right_hand",
	[EquipmentSlot.Gloves]: "slot_gloves",
	[EquipmentSlot.Legs]: "slot_legs",
	[EquipmentSlot.Belt]: "slot_belt",
	[EquipmentSlot.BootsLeft]: "slot_boots",
	[EquipmentSlot.Boots]: "slot_boots",
}

function getSize(width: number) {
	if (width >= 1024) return { slot: 22, accessory: 14 };
	if (width >= 768) return { slot: 14, accessory: 10 };
	return { slot: 12, accessory: 8 };
}

function getSlotSize(width: number) {
	if (width >= 1024) return 22;
	if (width >= 768) return 16;
	return 12;
}

function getAccessorySlotSize(width: number) {
	if (width >= 1024) return 14;
	if (width >= 768) return 10;
	return 8;
}

interface EquipSlotProps {
	slot: EquipmentSlot,
	item: ItemStack | null,
	size: number,

	tooltipRef: React.RefObject<HTMLDivElement | null>,
}

const EquipSlot = memo(EquipSlotComponent, EquipSlotMemoEqual);

function EquipSlotMemoEqual(prevProps: EquipSlotProps, nextProps: EquipSlotProps) {
	const prevItem = prevProps.item;
	const nextItem = nextProps.item;

	if ((prevItem == null) !== (nextItem == null)) return false;
	if (prevItem && nextItem) {
		if (prevItem.id !== nextItem.id) return false;
		if (prevItem.count !== nextItem.count) return false;
	}

	return prevProps.size === nextProps.size;
}

function EquipSlotComponent({ slot, item, size = 16, tooltipRef }: EquipSlotProps) {
	const [hovering, setHovering] = useState(false);
	const itemDef = (item && GameData.items().item(item.id)) ?? null;

	const slotSize = size;
	const iconSize = slot === EquipmentSlot.BootsLeft || slot === EquipmentSlot.Boots ||
	slot === EquipmentSlot.Gloves ? slotSize - 8 : slotSize - 2;

	const slotPxSize = `${slotSize * 4}px`;
	const iconPxSize = `${iconSize * 4}px`;
	const slotStyle = { width: slotPxSize, height: slotPxSize };
	const iconStyle = { width: iconPxSize, height: iconPxSize };
	const flipX = (slot === EquipmentSlot.BootsLeft && itemDef?.flipSprite) ||
		(slot === EquipmentSlot.Boots && !itemDef?.flipSprite);

	const icon = item != null ? (
		<div
			className={`flex items-center justify-center relative text-sm`}
			style={iconStyle}
		>
			<ItemIcon
				item={item.id}
				canvas={true}
				size={iconSize * 4}
				flipX={flipX}
				className="drop-shadow drop-shadow-black/40"
			/>

			{ item.count > 1 && (
				<div className="absolute bottom-[-10px] text-sm text-white bg-ic-item-count rounded-md w-14 text-center">
					{item?.count}
				</div>
			) }

			{ ((hovering && itemDef != null) || (slot == EquipmentSlot.Belt && itemDef != null && false)) && (
				<EquipmentTooltip item={itemDef} containerRef={tooltipRef} />
			) }
		</div>
	) : (
		<div
			className={`flex items-center justify-center`}
			style={iconStyle}
		>
			<SpriteIcon
				icon={EQUIPMENT_SLOT_TO_ICON[slot]}
				canvas={true}
				size={iconSize * 4}
				flipX={flipX}
				opacity={0.3}
				tintColor={"black"}
			/>
		</div>
	);

	return (
		<div className={slot == EquipmentSlot.Legs ? "row-span-2" : ""}>
			<div
				className={`flex flex-col items-center border-b-(--color-shadow) border-b-4 rounded-b-md w-fit 
				transition-colors duration-200`}
				onMouseEnter={() => setHovering(item != null)}
				onMouseLeave={() => setHovering(false)}
			>
				<div
					className={`bg-ic-light-500 flex items-center justify-center rounded-md border-2 border-ic-light-450
					${item ? "hover:bg-ic-light-450 hover:border-ic-light-400" : ""}`}
					style={slotStyle}
				>
					{icon}
				</div>
			</div>
		</div>
	);
}

const Equipment = () => {
	const website = useWebsite();
	const inventory = useGame().inventory;

	const pageWidth = useSmartRefWatcher(website.pageWidthRef);
	const equipment = useSmartRefWatcher(inventory.equipment);
	const tooltipRef = useRef<HTMLDivElement>(null);

	const { slot, accessory } = getSize(pageWidth);
	const slotSize = slot;
	const accessorySize = accessory;

	const ammoItem = equipment.get(EquipmentSlot.Ammunition) ?? null;
	const earringsItem = equipment.get(EquipmentSlot.Earrings) ?? null;
	const amuletItem = equipment.get(EquipmentSlot.Amulet) ?? null;
	const ringItem = equipment.get(EquipmentSlot.Jewellery) ?? null;
	const braceletItem = equipment.get(EquipmentSlot.Bracelet) ?? null;

	const petItem = equipment.get(EquipmentSlot.Pet) ?? null;
	const headItem = equipment.get(EquipmentSlot.Head) ?? null;
	const capeItem = equipment.get(EquipmentSlot.Cape) ?? null;
	const rightHandItem = equipment.get(EquipmentSlot.RightHand) ?? null;
	const bodyItem = equipment.get(EquipmentSlot.Body) ?? null;
	const leftHandItem = equipment.get(EquipmentSlot.LeftHand) ?? null;
	const glovesItem = equipment.get(EquipmentSlot.Gloves) ?? null;
	const legsItem = equipment.get(EquipmentSlot.Legs) ?? null;
	const beltItem = equipment.get(EquipmentSlot.Belt) ?? null;
	const bootsItem = equipment.get(EquipmentSlot.Boots) ?? null;

	return (
		<div className="flex gap-4 p-2 pb-1 bg-ic-dark-300 /*bg-gray-400*/" ref={tooltipRef}>
			{/* Accessories */}
			<div className="flex flex-col gap-2 justify-between">
				<EquipSlot slot={EquipmentSlot.Ammunition} item={ammoItem} size={accessorySize} tooltipRef={tooltipRef} />
				<div className="flex flex-col gap-0.5 lg:gap-2">
					<EquipSlot slot={EquipmentSlot.Earrings} item={earringsItem} size={accessorySize} tooltipRef={tooltipRef} />
					<EquipSlot slot={EquipmentSlot.Amulet} item={amuletItem} size={accessorySize} tooltipRef={tooltipRef} />
					<EquipSlot slot={EquipmentSlot.Jewellery} item={ringItem} size={accessorySize} tooltipRef={tooltipRef} />
					<EquipSlot slot={EquipmentSlot.Bracelet} item={braceletItem} size={accessorySize} tooltipRef={tooltipRef} />
				</div>
			</div>

			{/* Equipment */}
			<div className="grid grid-cols-[repeat(3,auto)] gap-1 md:gap-1 lg:gap-3 h-full">
				<EquipSlot slot={EquipmentSlot.Pet} item={petItem} size={slotSize} tooltipRef={tooltipRef} />
				<EquipSlot slot={EquipmentSlot.Head} item={headItem} size={slotSize} tooltipRef={tooltipRef} />
				<EquipSlot slot={EquipmentSlot.Cape} item={capeItem} size={slotSize} tooltipRef={tooltipRef} />

				<EquipSlot slot={EquipmentSlot.LeftHand} item={rightHandItem} size={slotSize} tooltipRef={tooltipRef} />
				<EquipSlot slot={EquipmentSlot.Body} item={bodyItem} size={slotSize} tooltipRef={tooltipRef} />
				<EquipSlot slot={EquipmentSlot.RightHand} item={leftHandItem} size={slotSize} tooltipRef={tooltipRef} />

				<EquipSlot slot={EquipmentSlot.Gloves} item={glovesItem} size={slotSize} tooltipRef={tooltipRef} />
				<EquipSlot slot={EquipmentSlot.Legs} item={legsItem} size={slotSize} tooltipRef={tooltipRef} />
				<EquipSlot slot={EquipmentSlot.Belt} item={beltItem} size={slotSize} tooltipRef={tooltipRef} />

				<EquipSlot slot={EquipmentSlot.BootsLeft} item={bootsItem} size={slotSize} tooltipRef={tooltipRef} />
				<EquipSlot slot={EquipmentSlot.Boots} item={bootsItem} size={slotSize} tooltipRef={tooltipRef} />
			</div>
		</div>
	);
}

const EquipmentBonusEntry: React.FC<{ type: "melee" | "archery" | "magic" }> = ({ type }) => {

	const size = 32;
	const className = "drop-shadow-sm drop-shadow-black/20";
	const icon = type === "melee" ? <SpriteIcon icon="skill_attack" size={size} className={className} /> :
		type === "archery" ? <SpriteIcon icon="skill_archery" size={size} className={className} /> :
			<SpriteIcon icon="skill_magic" size={size} className={className} />;

	return (
		<div className="flex justify-between py-1 text-(--color-bright) bg-ic-light-500/50">
			<div className="w-full text-center font-mono font-bold">{icon}</div>
			<div className="grid grid-cols-[repeat(3,7rem)] gap-3 pr-3 items-center text-right text-lg">
				<div>Strength: <span className="font-mono font-bold">999</span></div>
				<div>Accuracy: <span className="font-mono font-bold">999</span></div>
				<div>Defence: <span className="font-mono font-bold">999</span></div>
			</div>
		</div>
	)
}

const EquipmentBonus = () => {
	const website = useWebsite();
	const pageWidth = useSmartRefWatcher(website.pageWidthRef);

	return (
		<div className="whitespace-nowrap px-3 py-3 pt-1">
			{ pageWidth < 1024 ? (
				<>
					<h1 className="text-sm font-bold text-white">Equipment Bonuses</h1>

					<div className="flex justify-between text-(--color-bright) bg-cyan-900 text-sm gap-3">
						<div className="w-full text-center font-mono font-bold">(ME)</div>
						<div className="grid grid-cols-[repeat(3,4rem)] gap-2">
							<div>STR <span className="font-mono font-bold">332</span></div>
							<div>ACC <span className="font-mono font-bold">12</span></div>
							<div>DEF <span className="font-mono font-bold">48</span></div>
						</div>
					</div>

					<div className="flex justify-between text-(--color-bright) bg-cyan-800 text-sm gap-3">
						<div className="w-full text-center font-mono font-bold">(AR)</div>
						<div className="grid grid-cols-[repeat(3,4rem)] gap-2">
							<div>STR <span className="font-mono font-bold">1</span></div>
							<div>ACC <span className="font-mono font-bold">-26</span></div>
							<div>DEF <span className="font-mono font-bold">999</span></div>
						</div>
					</div>

					<div className="flex justify-between text-(--color-bright) bg-cyan-900 text-sm gap-3">
						<div className="w-full text-center font-mono font-bold">(MA)</div>
						<div className="grid grid-cols-[repeat(3,4rem)] gap-2">
							<div>STR <span className="font-mono font-bold">222</span></div>
							<div>ACC <span className="font-mono font-bold">44</span></div>
							<div>DEF <span className="font-mono font-bold">-232</span></div>
						</div>
					</div>
				</>
			) : (
				<>
					<h1 className="text-lg font-bold text-white">Equipment Bonuses</h1>

					<div className="flex flex-col gap-1">
						<EquipmentBonusEntry type="melee" />
						<EquipmentBonusEntry type="archery" />
						<EquipmentBonusEntry type="magic" />
					</div>
				</>
			) }
		</div>
	)
}

export const EquipmentPanel = () => {
	return (
		<div className="flex flex-col items-center bg-ic-dark-500/75 rounded-md shadow-lg h-fit w-fit">
			<div className="flex gap-1 pb-1">
				{/* Menu Buttons */}
				<div className="w-10 lg:w-16 content-stretch {/*bg-lime-400*/}">

				</div>

				{/* Player Doll */}
				<Equipment />
			</div>

			<div className="w-full">
				<EquipmentBonus />
			</div>
		</div>
	)
}