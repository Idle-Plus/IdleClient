import { ItemStack } from "@idleclient/types/gameTypes.ts";
import { memo, useState } from "react";
import { ItemIcon } from "@components/icon";

interface ItemSlotProps {
	item: ItemStack | null,
	size?: number
	containerClass?: string;
	slotClass?: string;
	itemClass?: string;
	iconClass?: string;

	flipX?: boolean;
}

export const ItemSlot = memo(ItemSlotComponent, MemoEqual);

function MemoEqual(prevProps: ItemSlotProps, nextProps: ItemSlotProps) {
	const prevItem = prevProps.item;
	const nextItem = nextProps.item;

	if ((prevItem == null) !== (nextItem == null)) return false;
	if (prevItem && nextItem) {
		if (prevItem.id !== nextItem.id) return false;
		if (prevItem.count !== nextItem.count) return false;
	}

	if (prevProps.size !== nextProps.size) return false;
	if (prevProps.containerClass !== nextProps.containerClass) return false;
	if (prevProps.slotClass !== nextProps.slotClass) return false;
	if (prevProps.itemClass !== nextProps.itemClass) return false;
	return prevProps.iconClass === nextProps.iconClass;

}

function ItemSlotComponent({
	item,
	size = 16,
	containerClass,
	slotClass,
	itemClass,
	iconClass,

	flipX = false,
}: ItemSlotProps) {
	const [hovering, setHovering] = useState(false);

	const slotSize = size; // 22
	const iconSize = slotSize - 2;

	const slotPxSize = `${slotSize * 4}px`;
	const iconPxSize = `${iconSize * 4}px`;
	const slotStyle = { width: slotPxSize, height: slotPxSize };
	const iconStyle = { width: iconPxSize, height: iconPxSize };

	const icon = item != null ? (
		<div
			className={`flex items-center justify-center relative text-sm ${iconClass ?? ""}`}
			style={iconStyle}
			onMouseEnter={(e) => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
		>
			{/*ITEM: {item?.id}
			<br/>
			COUNT:{item?.count}*/}
			{/* // TODO: Option to toggle if we should use canvas rendering or not. */}
			<ItemIcon item={item.id} canvas={true} size={iconSize * 4} opacity={item.count <= 0 ? 0.4 : 1} flipX={flipX} className="drop-shadow drop-shadow-black/40" />
			{/*{ item.count >= 1 && (
				<div className="absolute bottom-[-10px] text-sm text-white bg-[#CA8D35] rounded-md w-14 text-center">
					{item?.count}
				</div>
			) }*/}
		</div>
	) : (
		<div
			className={`flex items-center justify-center ${iconClass ?? ""}`}
			style={iconStyle}
		>
		</div>
	);

	return (
		<div className={containerClass ?? ""}>
			<div
				className={`flex flex-col items-center border-b-(--color-shadow) border-b-4 rounded-b-md w-fit 
				transition-colors duration-200 ${slotClass ?? ""}`}
			>
				<div
					className={`${hovering ? "bg-[#259f84]" : "bg-[#1f7f6b]"}
					flex items-center justify-center rounded-md border-2 border-[#229177]
					${item != null ? "cursor-pointer " : ""} ${itemClass ?? ""}`}
					style={slotStyle}
				>
					{icon}
				</div>
			</div>
		</div>
	);
}
