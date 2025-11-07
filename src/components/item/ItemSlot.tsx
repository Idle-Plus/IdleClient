import React, { useRef, useState } from "react";
import { ItemId } from "@idleclient/types/gameTypes.ts";
import { Int } from "@idleclient/network/NetworkData.ts";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { ItemIcon } from "@components/icon";
import { toKMB } from "@idleclient/game/utils/numberUtils.ts";
import ItemTooltip from "@components/item/ItemTooltip.tsx";

const ItemSlot: React.FC<{
	item: ItemId | null,
	count?: Int
}> = ({ item, count }) => {
	const [hovering, setHovering] = useState(false);
	const slotRef = useRef<HTMLDivElement | null>(null);
	const itemDef = item !== null ? ItemDatabase.item(item) : null;

	return (
		<div
			ref={slotRef}
			className={`border-b-(--color-shadow) border-b-4 rounded-b-md w-fit`}
			onMouseEnter={() => setHovering(item != null)}
			onMouseLeave={() => setHovering(false)}
			onContextMenu={(e) => item != null && e.preventDefault()}
		>
			<div
				className={`bg-ic-light-600 flex items-center justify-center rounded-md border-2 border-ic-light-500
						${item ? "hover:bg-ic-light-500 hover:border-ic-light-450" : ""}`}
			>
				<div
					className={`w-16 h-16 flex items-center justify-center relative text-sm`}
				>

					{ itemDef !== null && (
						<>
							<ItemIcon
								item={itemDef}
								canvas={false}
								size={16 * 4}
								padding={2}
								flipX={itemDef.flipSprite}
								className="drop-shadow drop-shadow-black/40"
							/>

							{ count !== undefined && (
								<div className="absolute bottom-[-10px] w-[85%] text-xs text-white bg-ic-item-count rounded-full text-center">
									{ toKMB(count) }
								</div>
							) }

							{ hovering && (
								<ItemTooltip
									item={itemDef}
									positions={slotRef.current!}
									preferredSide={"left"}
									count={count}
									positionPadding={4}
									className="shadow-black/25 shadow-md"
								/>
							) }
						</>
					) }
				</div>
			</div>
		</div>
	);
}

export default ItemSlot;