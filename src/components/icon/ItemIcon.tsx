import React, { CSSProperties } from "react";
import { SpriteSize } from "@idleclient/game/sprite/SpriteSheet.ts";
import CanvasIcon from "@components/icon/CanvasIcon.tsx";
import { ItemId } from "@idleclient/types/gameTypes.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";

interface ItemIconProps {
	item: ItemId | ItemDefinition;
	size?: SpriteSize | number;
	spriteSize?: number;
	padding?: number;
	canvas?: boolean;

	flipX?: boolean;
	flipY?: boolean;
	opacity?: number;
	tintColor?: string;

	className?: string;
	style?: CSSProperties;
	alt?: string;
}

const ItemIcon: React.FC<ItemIconProps> = ({
	item,
	size = SpriteSize.SMALL,
	spriteSize,
	padding = 0,
	canvas = false,

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
			style={icon.getSized(size)}
			aria-label={alt}
		/>
	)
};

export default ItemIcon;