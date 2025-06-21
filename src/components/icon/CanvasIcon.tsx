import React, { useRef, useEffect } from "react";
import { useSpriteSheets } from "@context/SpriteSheetContext.tsx";
import { SheetIcon } from "@idleclient/game/sprite/SpriteSheet.ts";
import { WeaponEffectType } from "@idleclient/network/NetworkData.ts";

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

interface CanvasIconProps {
	icon: SheetIcon | { sheet: { image: string }; x: number; y: number; w: number; h: number }
	displaySize: number;
	padding?: number;

	flipX?: boolean;
	flipY?: boolean;
	opacity?: number;
	tintColor?: string;
	weaponEffect?: WeaponEffectType | null;

	className?: string;
	style?: React.CSSProperties; // Optional inline styles for canvas
}

const CanvasIcon: React.FC<CanvasIconProps> = ({
	icon,
	displaySize,
	padding = 0,
	flipX = false,
	flipY = false,
	opacity,
	tintColor,
	weaponEffect,
	className,
	style
}) => {
	const spriteSheets = useSpriteSheets();
	const sheet = spriteSheets.sheets.get(icon.sheet.image);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const draw = () => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const dpr = window.devicePixelRatio || 1;
			canvas.width = (displaySize + (padding * 2)) * dpr;
			canvas.height = (displaySize + (padding * 2)) * dpr;
			canvas.style.width = `${displaySize}px`;
			canvas.style.height = `${displaySize}px`;

			if (!sheet) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = "high";

			ctx.save();
			
			if (opacity) {
				ctx.globalAlpha = opacity;
			}

			if (flipX) {
				ctx.translate(displaySize, 0);
				ctx.scale(-1, 1);
			}

			if (flipY) {
				ctx.translate(0, displaySize);
				ctx.scale(1, -1);
			}

			if (weaponEffect) {
				const options = COSMETIC_SHADOWS[weaponEffect];

				COSMETIC_SHADOWS.offsets.forEach(([oX, oY]) => {
					ctx.shadowOffsetX = oX;
					ctx.shadowOffsetY = oY;

					ctx.shadowColor = options.color;
					ctx.shadowBlur = options.blur;

					ctx.drawImage(sheet, icon.x, icon.y, icon.w, icon.h, padding, padding, displaySize, displaySize);
				})
			}

			ctx.drawImage(sheet, icon.x, icon.y, icon.w, icon.h, padding, padding, displaySize, displaySize);
			ctx.restore();

			if (tintColor) {
				ctx.save();
				ctx.globalCompositeOperation = "source-atop";
				ctx.fillStyle = tintColor;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.restore();
			}
		};
		
		const handleResize = () => draw();
		draw();

		window.addEventListener("resize", handleResize);
		window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
			.addEventListener("change", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
				.removeEventListener("change", handleResize);
		};
	}, [sheet, icon, displaySize, flipX, flipY, opacity, tintColor]);

	return <canvas ref={canvasRef} className={className} style={{ ...style, width: `${displaySize}px`, height: `${displaySize}px` }} />;
};

export default CanvasIcon;
