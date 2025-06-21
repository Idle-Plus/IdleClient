import React, { memo, useEffect, useRef, useState } from "react";
import { useWebsite } from "@context/WebsiteContext.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { useGame } from "@context/GameContext.tsx";
import { EquipmentSlot } from "@idleclient/network/NetworkData.ts";
import { ItemIcon, SpriteIcon } from "@components/icon";
import { ItemId } from "@idleclient/types/gameTypes.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import EquipmentTooltip from "@pages/game/inventory/components/EquipmentTooltip.tsx";
import { FaPaw } from "react-icons/fa";
import { GiAbdominalArmor } from "react-icons/gi";
import { IoSettings } from "react-icons/io5";
import { LuChevronsUpDown } from "react-icons/lu";
import { toKMB } from "@idleclient/game/utils/numberUtils.ts";

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
	[EquipmentSlot.LeftHand]: "slot_right_hand", // TODO: Change icon name.
	[EquipmentSlot.Body]: "slot_body",
	[EquipmentSlot.RightHand]: "slot_left_hand", // TODO: Change icon name.
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
	item: ItemId | null,
	count?: number,
	size: number,

	onClick: (slot: EquipmentSlot) => void,
	tooltipRef: React.RefObject<HTMLDivElement | null>,
}

const EquipSlot = memo(EquipSlotComponent, EquipSlotMemoEqual);

function EquipSlotMemoEqual(prevProps: EquipSlotProps, nextProps: EquipSlotProps) {
	const prevItem = prevProps.item;
	const nextItem = nextProps.item;

	if ((prevItem == null) !== (nextItem == null)) return false;
	if (prevItem !== nextItem) return false;
	if (prevProps.count !== nextProps.count) return false;

	/*if (prevItem && nextItem) {
		if (prevItem.id !== nextItem.id) return false;
		if (prevItem.count !== nextItem.count) return false;
	}*/

	return prevProps.size === nextProps.size;
}

function EquipSlotComponent({ slot, item, count = 1, size = 16, onClick, tooltipRef }: EquipSlotProps) {
	const [hovering, setHovering] = useState(false);
	const itemDef = item !== null ? GameData.items().item(item) : null;

	const slotSize = size;
	const iconSize = slot === EquipmentSlot.BootsLeft || slot === EquipmentSlot.Boots ||
	slot === EquipmentSlot.Gloves ? slotSize - 8 : slotSize - 2;

	const slotPxSize = `${slotSize * 4}px`;
	const iconPxSize = `${iconSize * 4}px`;
	const slotStyle = { width: slotPxSize, height: slotPxSize };
	const iconStyle = { width: iconPxSize, height: iconPxSize };
	const flipX =
		// Should always be flipped, except if the item should be flipped.
		(slot === EquipmentSlot.Boots && (itemDef?.flipSprite ?? true)) ||
		// Should only be flipped if the item should be flipped.
		(slot === EquipmentSlot.BootsLeft && !(itemDef?.flipSprite ?? true));

	const icon = item != null ? (
		<div
			className={`flex items-center justify-center relative text-sm`}
			style={iconStyle}
		>
			<ItemIcon
				item={item}
				canvas={true}
				size={iconSize * 4}
				padding={2}
				flipX={flipX}
				className="drop-shadow drop-shadow-black/40"
			/>

			{ count > 1 && (
				<div className="absolute bottom-[-10px] text-sm text-white bg-ic-item-count rounded-md px-1 text-center">
					{ toKMB(count) }
				</div>
			) }

			{ ((hovering && itemDef != null) || (slot == EquipmentSlot.Jewellery && itemDef != null && false)) && (
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
				padding={2}
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
				onContextMenu={(e) => item != null && e.preventDefault()}
			>
				<div
					className={`bg-ic-light-600 flex items-center justify-center rounded-md border-2 border-ic-light-500
					${item ? "hover:bg-ic-light-500 hover:border-ic-light-450" : ""}`}
					style={slotStyle}
					onClick={() => item != null && onClick(slot)}
					onContextMenu={(e) => {
						if (item === null) return;
						onClick(slot);
					}}
				>
					{icon}
				</div>
			</div>
		</div>
	);
}

const Equipment = () => {
	const website = useWebsite();
	const game = useGame();

	const pageWidth = useSmartRefWatcher(website.pageWidthRef);
	const equipment = useSmartRefWatcher(game.equipment.equipment);
	const ammunitionAmount = useSmartRefWatcher(game.equipment.ammunitionAmount);

	const tooltipRef = useRef<HTMLDivElement>(null);

	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	// TODO: Loadouts
	const loadouts = [
		{ name: "Loadout 1" },
		{ name: "Loadout 2" },
		{ name: "Loadout 3" },

		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
		{ name: "Buy in local market", locked: true },
	]

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

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isDropdownOpen && event.target instanceof Element &&
				!event.target.closest(".loadout-dropdown")) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isDropdownOpen]);

	const onSlotClicked = (slot: EquipmentSlot) => {
		if (slot === EquipmentSlot.BootsLeft) slot = EquipmentSlot.Boots;
		if (game.equipment.equipment.content().get(slot) === undefined) return;
		game.equipment.unequipItem(slot);
	}

	return (
		<div className="bg-ic-dark-300 pr-2">

			<div className="h-10 w-full flex items-center justify-end gap-2 mt-2 pr-2">

				<div className="loadout-dropdown">
					<button
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						className={`h-8 w-48 flex items-center justify-between px-2 bg-ic-light-500 text-lg 
						text-gray-100 rounded-md hover:bg-ic-light-450 active:bg-ic-light-400 cursor-pointer transition-colors
						duration-100 ${isDropdownOpen ? "bg-ic-light-450!" : ""}`}
					>
						<span>Select loadout</span>
						<span className="ml-2"><LuChevronsUpDown /></span>
					</button>

					{isDropdownOpen && (
						<div className="absolute z-10 mt-1 w-48 bg-ic-light-400 rounded-md shadow-lg">
							<div
								className="flex flex-col p-1 space-y-1 whitespace-nowrap select-none max-h-64
								overflow-y-auto ic-scrollbar text-white/80"
							>
								{loadouts.map((loadout, i) => (
									<>
										{ loadout?.locked ? (
											<div
												key={i}
												className="rounded-md w-full px-2 py-1 text-left bg-ic-red-500"
											>
												{loadout.name}
											</div>
										) : (
											<button
												key={i}
												onClick={() => {
													setIsDropdownOpen(false);
													// TODO: Handle select
												}}
												className="rounded-md w-full px-2 py-1 text-left bg-ic-orange-500
												hover:bg-ic-orange-600"
											>
												{loadout.name}
											</button>
										) }
									</>
								))}
							</div>
						</div>
					)}
				</div>


				<div className="h-8 w-8 flex items-center justify-center text-3xl bg-ic-light-500 text-white/90 rounded-md">
					<IoSettings />
				</div>
			</div>

			<div className="flex gap-4 p-2 pb-1" ref={tooltipRef}>
				{/* Accessories */}
				<div className="flex flex-col gap-2 justify-between">
					<EquipSlot slot={EquipmentSlot.Ammunition} item={ammoItem} count={ammunitionAmount} size={accessorySize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
					<div className="flex flex-col gap-0.5 lg:gap-2">
						<EquipSlot slot={EquipmentSlot.Earrings} item={earringsItem} size={accessorySize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
						<EquipSlot slot={EquipmentSlot.Amulet} item={amuletItem} size={accessorySize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
						<EquipSlot slot={EquipmentSlot.Jewellery} item={ringItem} size={accessorySize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
						<EquipSlot slot={EquipmentSlot.Bracelet} item={braceletItem} size={accessorySize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
					</div>
				</div>

				{/* Equipment */}
				<div className="grid grid-cols-[repeat(3,auto)] gap-1 md:gap-1 lg:gap-3 h-full">
					<EquipSlot slot={EquipmentSlot.Pet} item={petItem} size={slotSize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
					<EquipSlot slot={EquipmentSlot.Head} item={headItem} size={slotSize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
					<EquipSlot slot={EquipmentSlot.Cape} item={capeItem} size={slotSize} onClick={onSlotClicked} tooltipRef={tooltipRef} />

					<EquipSlot slot={EquipmentSlot.RightHand} item={rightHandItem} size={slotSize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
					<EquipSlot slot={EquipmentSlot.Body} item={bodyItem} size={slotSize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
					<EquipSlot slot={EquipmentSlot.LeftHand} item={leftHandItem} size={slotSize} onClick={onSlotClicked} tooltipRef={tooltipRef} />

					<EquipSlot slot={EquipmentSlot.Gloves} item={glovesItem} size={slotSize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
					<EquipSlot slot={EquipmentSlot.Legs} item={legsItem} size={slotSize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
					<EquipSlot slot={EquipmentSlot.Belt} item={beltItem} size={slotSize} onClick={onSlotClicked} tooltipRef={tooltipRef} />

					<EquipSlot slot={EquipmentSlot.Boots} item={bootsItem} size={slotSize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
					<EquipSlot slot={EquipmentSlot.BootsLeft} item={bootsItem} size={slotSize} onClick={onSlotClicked} tooltipRef={tooltipRef} />
				</div>
			</div>
		</div>
	);
}

const EquipmentBonusEntry: React.FC<{
	type: "melee" | "archery" | "magic",
	boost: { strength: number, accuracy: number, defence: number }
}> = ({ type, boost }) => {

	const size = 32;
	const className = "drop-shadow-sm drop-shadow-black/20";
	const icon = type === "melee" ? <SpriteIcon icon="skill_attack" size={size} className={className} /> :
		type === "archery" ? <SpriteIcon icon="skill_archery" size={size} className={className} /> :
			<SpriteIcon icon="skill_magic" size={size} className={className} />;

	return (
		<div className="flex justify-between py-1 text-(--color-bright) bg-ic-light-500/50">
			<div className="w-full text-center font-bold">{icon}</div>
			<div className="grid grid-cols-[repeat(3,7rem)] gap-4 pr-3 items-center font-light text-left text-lg">
				<div>Strength: <span className={`font-mono font-bold ${boost.strength < 0 ? "text-[#fdbaba]" : ""}`}>{boost.strength}</span></div>
				<div>Accuracy: <span className={`font-mono font-bold ${boost.accuracy < 0 ? "text-[#fdbaba]" : ""}`}>{boost.accuracy}</span></div>
				<div>Defence: <span className={`font-mono font-bold ${boost.defence < 0 ? "text-[#fdbaba]" : ""}`}>{boost.defence}</span></div>
			</div>
		</div>
	)
}

const EquipmentBonus = () => {
	const website = useWebsite();
	const game = useGame();

	const pageWidth = useSmartRefWatcher(website.pageWidthRef);
	const combatBoosts = useSmartRefWatcher(game.boost.combatBoosts);

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
						<EquipmentBonusEntry type="melee" boost={combatBoosts.melee} />
						<EquipmentBonusEntry type="archery" boost={combatBoosts.archery} />
						<EquipmentBonusEntry type="magic" boost={combatBoosts.magic} />
					</div>
				</>
			) }
		</div>
	)
}

enum EquipmentTab {
	Equipment,
	Pets
}

export const EquipmentPanel = () => {
	const [tab, setTab] = useState(EquipmentTab.Equipment);

	const selectTab = (value: EquipmentTab) => {
		if (value === tab) return;
		setTab(value);
	}

	const tabButtons = [
		{ icon: <GiAbdominalArmor />, tab: EquipmentTab.Equipment },
		{ icon: <FaPaw />, tab: EquipmentTab.Pets },
	]

	return (
		<div className="flex flex-col items-center bg-ic-dark-500/75 rounded-md shadow-lg h-fit w-fit">
			<div className="flex gap-1 pb-1">

				{/* Menu Buttons */}
				<div className="w-10 lg:w-16 flex flex-col items-center gap-4 py-4">
					{ tabButtons.map((button, index) => (
						<div
							key={index}
							className={`text-5xl transition-colors duration-200 ${tab === button.tab ? "text-ic-light-100" : 
								"text-ic-light-500 hover:text-ic-light-400 cursor-pointer"}`}
							onClick={() => selectTab(button.tab)}
						>
							{button.icon}
						</div>
					))}
				</div>

				{/* Player Doll */}
				<Equipment />
			</div>

			<div className="w-full font-raleway">
				<EquipmentBonus />
			</div>
		</div>
	)
}