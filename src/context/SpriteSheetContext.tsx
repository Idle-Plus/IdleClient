import React, { createContext, useContext, useEffect, useState } from "react";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { useLoading } from "@context/LoadingContext.tsx";

const LOADING_ID = "spriteSheetContext$loading";

type SheetMap = Map<string, HTMLCanvasElement>;

interface SpriteSheetContextType {
	loading: boolean;
	sheets: SheetMap;
}

const SpriteSheetContext = createContext<SpriteSheetContextType | null>(null);

export const SpriteSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const loader = useLoading();

	const [loading, setLoading] = useState(true);
	const [sheets, setSheets] = useState<SheetMap>(new Map<string, HTMLCanvasElement>());

	useEffect(() => {
		async function loadSheets() {
			const BATCH_SIZE = 2;
			const map = new Map<string, HTMLCanvasElement>();
			const queue: { src: string, tries: number }[] = []

			GameData.items().sheet.sheets
				.forEach((value, _) => queue.push({ src: value.image, tries: 0 }));
			GameData.icons().sheets
				.forEach((value, _) => queue.push({ src: value.image, tries: 0 }));

			const start = Date.now();
			loader.set(LOADING_ID, `Loading sprites\n0%`, -1);

			const total = queue.length;
			let finished = 0;
			const onFinishEntry = () => {
				finished++;
				loader.update(LOADING_ID, `Loading sprites\n${(finished / total * 100).toFixed(0)}%`);
			}

			async function loadImage(src: string): Promise<HTMLCanvasElement> {
				return new Promise((resolve, reject) => {
					const img = new Image();
					img.crossOrigin = 'anonymous';
					img.src = src;

					img.decode()
						.then(() => {
							const canvas = document.createElement('canvas');
							canvas.width = img.naturalWidth;
							canvas.height = img.naturalHeight;
							const ctx = canvas.getContext('2d');

							if (!ctx) {
								reject(new Error('Failed to get canvas 2D context'));
								return;
							}

							ctx.drawImage(img, 0, 0);

							// Clean up
							img.src = '';
							img.onload = null;
							img.onerror = null;
							resolve(canvas);
						})
						.catch((err) => {
							reject(err);
						});
				});
			}

			async function processQueue() {
				const retryQueue: typeof queue = [];

				while (queue.length > 0 || retryQueue.length > 0) {
					// Prepare batch of promises up to CONCURRENCY limit
					const batch: Promise<void>[] = [];
					// Fill batch from urls first
					while (batch.length < BATCH_SIZE && (queue.length > 0 || retryQueue.length > 0)) {
						const item = queue.length > 0 ? queue.shift()! : retryQueue.shift()!;
						const { src, tries } = item;

						const p = loadImage(src)
							.then((canvas) => {
								map.set(src, canvas);
								onFinishEntry();
							})
							.catch((err) => {
								console.warn(`Failed to decode ${src} on try ${tries + 1}:`, err);
								retryQueue.push({ src, tries: tries + 1 });
							});

						batch.push(p);
					}

					// Wait for this batch to finish before continuing
					await Promise.all(batch);
				}
			}

			await processQueue();

			const end = Date.now();
			console.log(`SpriteSheetContext: Loaded ${total} sprite sheets in ${end - start}ms.`);
			loader.remove(LOADING_ID);

			setSheets(map);
			setLoading(false);
		}

		loadSheets();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<SpriteSheetContext.Provider value={{
			loading: loading,
			sheets: sheets
		}}>
			{children}
		</SpriteSheetContext.Provider>
	);
};

export function useSpriteSheets() {
	const context = useContext(SpriteSheetContext);
	if (!context) throw new Error("useSpriteSheets must be used within SpriteSheetProvider");
	return context;
}