import React, { CSSProperties } from "react";
import { SpriteSize } from "@idleclient/game/sprite/SpriteSheet.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import CanvasIcon from "@components/icon/CanvasIcon.tsx";
import { useSpriteSheets } from "@context/SpriteSheetContext.tsx";

interface SpriteIconProps {
	icon: string;
	size?: SpriteSize | number;
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

const SpriteIcon: React.FC<SpriteIconProps> = ({
	icon,
	size = SpriteSize.SMALL,
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
	//const sheets = useSpriteSheets();

	if (!GameData.isInitialized()) return <span className="text-red-500">??</span>;
	let sheetIcon = GameData.icons().getIcon(icon);
	if (!sheetIcon) {
		console.warn(`Missing icon for ${icon}.`);
		sheetIcon = GameData.icons().getIcon(":missing:");
		if (!sheetIcon) return <span className="text-red-500">??</span>;
	}

	if (canvas) {
		//const sheet = sheets.get(sheetIcon.sheet.image);
		// If the sheet hasn't loaded yet, then we go back to default rendering.
		//if (sheet) {
			return (
				<CanvasIcon
					icon={sheetIcon}
					displaySize={size}
					padding={padding}
					flipX={flipX}
					flipY={flipY}
					opacity={opacity}
					tintColor={tintColor}
					className={className}
					style={{ display: "inline-block", verticalAlign: "middle", ...style }}
					aria-label={alt}
				/>
			);
		//}
	}

	return (
		<span
			className={`inline-block align-middle ${className}`}
			style={sheetIcon.getSized(size)}
			aria-label={alt}
		/>
	)
};

export default SpriteIcon;