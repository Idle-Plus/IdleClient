import { CSSProperties } from "react";

/*
 * Input types
 */

interface SheetData {
	textures: SheetTextureData[],
	metadata: SheetMetadata
}

interface SheetTextureData {
	name: string,
	sheet: number,
	x: number,
	y: number,
	w: number,
	h: number
}

interface SheetMetadata {
	scale: number,
	padding: number,
	sheets: { path: string, size: { w: number, h: number } }[]
}

/*
 * Internal types
 */

interface Sheet {
	width: number,
	height: number,
	image: string,
}

export class SpriteSheet {

	public sheets: Map<number, Sheet> = new Map(); // sheet index -> sheet
	public iconsById: Map<number, SheetIcon> = new Map();
	public iconsByName: Map<string, SheetIcon> = new Map();

	constructor(data: Array<{ dataSheet: SheetData, path: string }>) {
		let sheetIndex = 0;
		let textureIndex = 0;
		data.forEach(entry => {
			const baseSheetIndex = sheetIndex;
			const baseTextureIndex = textureIndex;

			const dataSheet = entry.dataSheet;
			let path = entry.path;

			if (!path.endsWith("/")) path += "/";

			const textures = dataSheet.textures;
			const metadata = dataSheet.metadata;

			for (let i = 0; i < metadata.sheets.length; i++) {
				const usedIndex = baseSheetIndex + i;
				sheetIndex++;

				const sheet = metadata.sheets[i];
				this.sheets.set(usedIndex, {
					width: sheet.size.w,
					height: sheet.size.h,
					image: path + sheet.path
				});
			}

			for (let i = 0; i < textures.length; i++) {
				const usedIndex = baseTextureIndex + i;
				textureIndex++;

				const texture = textures[i];
				const sheet = this.sheets.get(texture.sheet + baseSheetIndex);
				if (sheet === undefined) throw new Error("Sheet not found: " + texture.sheet);
				const icon = new SheetIcon(sheet, texture.w, texture.h, texture.x, texture.y);

				this.iconsById.set(usedIndex, icon);
				this.iconsByName.set(texture.name, icon);
			}
		});
	}

	public getIcon(id: number | string): SheetIcon | null {
		if (typeof id === "string") {
			const icon = this.iconsByName.get(id);
			if (icon === undefined) return null;
			return icon;
		}

		const icon = this.iconsById.get(id);
		if (icon === undefined) return null;
		return icon;
	}
}

export class SheetIcon {
	public readonly sheet: Sheet;
	public readonly w: number;
	public readonly h: number;
	public readonly x: number;
	public readonly y: number;

	constructor(sheet: Sheet, w: number, h: number, x: number, y: number) {
		this.sheet = sheet;
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
	}

	public apply(style: CSSStyleDeclaration, upscaleFactor: number, ignoreBackground: boolean = false) {
		const spriteSheetWidth = this.sheet.width * upscaleFactor;
		const spriteSheetHeight = this.sheet.height * upscaleFactor;
		const positionX = this.x * upscaleFactor;
		const positionY = this.y * upscaleFactor;
		const width = this.w * upscaleFactor;
		const height = this.h * upscaleFactor;

		if (!ignoreBackground) {
			style.backgroundImage = `url(${this.sheet.image})`;
		}

		style.backgroundSize = `${spriteSheetWidth}px ${spriteSheetHeight}px`;
		style.backgroundPosition = `-${positionX}px -${positionY}px`;
		style.width = width + "px";
		style.height = height + "px";
		style.backgroundRepeat = "no-repeat";
	}

	public getStyle(upscaleFactor: number): CSSProperties {
		const spriteSheetWidth = this.sheet.width * upscaleFactor;
		const spriteSheetHeight = this.sheet.height * upscaleFactor;
		const positionX = this.x * upscaleFactor;
		const positionY = this.y * upscaleFactor;
		const width = this.w * upscaleFactor;
		const height = this.h * upscaleFactor;

		return {
			backgroundImage: `url(${this.sheet.image})`,
			backgroundSize: `${spriteSheetWidth}px ${spriteSheetHeight}px`,
			backgroundPosition: `-${positionX}px -${positionY}px`,
			width: width,
			height: height,
			backgroundRepeat: "no-repeat",
		};
	}

	public get(size: SpriteSize): CSSProperties {
		return this.getStyle(size / this.w);
	}

	public getSized(size: number): CSSProperties {
		return this.getStyle(size / this.w);
	}
}

export enum SpriteSize {
	TEXT = 16,
	SMALL = 32,
	MEDIUM = 48,
	LARGE = 64
}