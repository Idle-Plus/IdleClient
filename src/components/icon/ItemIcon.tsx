import React, { CSSProperties, useRef, useState } from "react";
import { SheetIcon, SpriteSize } from "@idleclient/game/sprite/SpriteSheet.ts";
import CanvasIcon from "@components/icon/CanvasIcon.tsx";
import { ItemId } from "@idleclient/types/gameTypes.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";
import ItemTooltip from "@components/item/ItemTooltip.tsx";

interface ItemIconTooltipProps {
	preferredSide?: "left" | "top";
	count?: number;
	positionPadding?: number;
	className?: string;
}

interface ItemIconProps {
	item: ItemId | ItemDefinition;
	size?: SpriteSize | number;
	spriteSize?: number;
	padding?: number;
	canvas?: boolean;
	itemTooltip?: ItemIconTooltipProps;

	flipX?: boolean;
	flipY?: boolean;
	opacity?: number;
	tintColor?: string;

	className?: string;
	style?: CSSProperties;
	alt?: string;
}

const ItemIconWithTooltip: React.FC<{
	item: ItemDefinition,
	icon: SheetIcon,
	size?: SpriteSize | number;
	padding?: number;
	canvas?: boolean;
	itemTooltip: ItemIconTooltipProps;

	flipX?: boolean;
	flipY?: boolean;
	opacity?: number;
	tintColor?: string;

	className?: string;
	style?: CSSProperties;
	alt?: string;
}> = ({
	item,
	icon,
	size = SpriteSize.SMALL,
	padding = 0,
	canvas = false,
	itemTooltip,

	flipX = false,
	flipY = false,
	opacity,
	tintColor,

	className,
	style,
	alt
}) => {
	const iconRef = useRef<HTMLDivElement>(null);
	const [hovering, setHovering] = useState(false);

	if (canvas) {
		return (
			<div
				ref={iconRef}
				onMouseEnter={() => setHovering(true)}
				onMouseLeave={() => setHovering(false)}
			>
				<CanvasIcon
					icon={icon}
					displaySize={size}
					padding={padding}
					flipX={flipX}
					flipY={flipY}
					opacity={opacity}
					tintColor={tintColor}
					weaponEffect={item.getCosmeticEffect()}
					className={className}
					style={{ display: "inline-block", verticalAlign: "middle", ...style }}
					aria-label={alt}
				/>

				{ hovering && (
					<ItemTooltip
						item={item}
						positions={iconRef.current!}
						preferredSide={itemTooltip?.preferredSide}
						count={itemTooltip?.count}
						positionPadding={itemTooltip?.positionPadding}
						className={itemTooltip?.className}
					/>
				) }
			</div>
		);
	}

	return (
		<span
			ref={iconRef}
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}

			className={`inline-block align-middle ${className}`}
			style={icon.getSized(size - (padding * 2))}
			aria-label={alt}
		>
			{ hovering && (
				<ItemTooltip
					item={item}
					positions={iconRef.current!}
					preferredSide={itemTooltip?.preferredSide}
					count={itemTooltip?.count}
					positionPadding={itemTooltip?.positionPadding}
					className={itemTooltip?.className}
				/>
			) }
		</span>
	);
}

const ItemIcon: React.FC<ItemIconProps> = ({
	item,
	size = SpriteSize.SMALL,
	spriteSize,
	padding = 0,
	canvas = false,
	itemTooltip,

	flipX = false,
	flipY = false,
	opacity,
	tintColor,

	className,
	style,
	alt
}) => {
	if (typeof item === "number") {
		item = GameData.items().item(item);
	}

	let icon = item.getIcon(spriteSize);
	if (!icon) {
		console.warn(`Missing item icon for ${item.id}.`);
		icon = GameData.items().sheet.getIcon(":missing:");
		if (!icon) return <span>???</span>;
	}

	if (itemTooltip) {
		return (
			<ItemIconWithTooltip
				{...{ item, icon, size, padding, canvas, itemTooltip, flipX, flipY, opacity, tintColor,
					className, style, alt }}
			/>
		);
	}

	if (canvas) {
		return (
			<CanvasIcon
				icon={icon}
				displaySize={size}
				padding={padding}
				flipX={flipX}
				flipY={flipY}
				opacity={opacity}
				tintColor={tintColor}
				weaponEffect={item.getCosmeticEffect()}
				className={className}
				style={{ display: "inline-block", verticalAlign: "middle", ...style }}
				aria-label={alt}
			/>
		);
	}

	return (
		<span
			className={`inline-block align-middle ${className}`}
			style={icon.getSized(size - (padding * 2))}
			aria-label={alt}
		/>
	)
};

export default ItemIcon;