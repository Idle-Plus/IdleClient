import React, { memo, useCallback, useEffect, useRef } from "react";
import { CurrentTask } from "@idleclient/game/manager/TaskManager.ts";
import AutoSizer from "react-virtualized-auto-sizer";

interface TaskProgressBarProps {
	currentTask: CurrentTask | null,
}

interface Point {
	x: number;
	y: number;
}

interface PrerenderedFrame {
	imageData: ImageData;
	width: number;
}

const FRAMES_TO_PRERENDER = 30;
const FRAMES: Map<number, PrerenderedFrame[]> = new Map();

const generatePoints = (width: number, height: number, count: number) => {

	const points: Point[] = [];
	for (let i = 0; i < count; i++) {
		points.push({
			x: Math.random() * width,
			y: Math.random() * height
		});
	}
	return points;
};

// Pre-render frames
const generateFrames = (width: number, height: number) => {
	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = width;
	tempCanvas.height = height;
	const tempCtx = tempCanvas.getContext('2d')!;
	const points = generatePoints(width, height, 20);
	const frames: PrerenderedFrame[] = [];

	// Generate frames for one complete cycle of animation
	for (let frame = 0; frame < FRAMES_TO_PRERENDER; frame++) {
		const offset = (frame / FRAMES_TO_PRERENDER) * Math.PI * 2;

		// Clear the temporary canvas
		tempCtx.clearRect(0, 0, width, height);

		// Draw the frame
		const pixelSize = 8;
		for (let x = 0; x < width; x += pixelSize) {
			for (let y = 0; y < height; y += pixelSize) {
				let minDist = Infinity;
				let closestPoint = points[0];

				for (const point of points) {
					const dx = x - (point.x + Math.sin(offset + point.x * 0.05) * 10);
					const dy = y - (point.y + Math.cos(offset + point.y * 0.05) * 10);
					const dist = dx * dx + dy * dy;
					if (dist < minDist) {
						minDist = dist;
						closestPoint = point;
					}
				}

				const intensity = (Math.sin(minDist * 0.01 + offset) + 1) * 0.5;
				const r = 51 + intensity * 20;
				const g = 215 + intensity * 40;
				const b = 177 + intensity * 20;

				tempCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
				tempCtx.fillRect(x, y, pixelSize, pixelSize);
			}
		}

		// Store the frame
		frames.push({
			imageData: tempCtx.getImageData(0, 0, width, height),
			width: width
		});
	}

	return frames;
};

const getFrames = (width: number, height: number) => {
	const id = (width * 10000) + height;
	if (!FRAMES.has(id)) {
		const start = Date.now();
		FRAMES.clear();
		FRAMES.set(id, generateFrames(width, height));
		console.log(`Generated ${FRAMES.get(id)?.length} frames in ${Date.now() - start}ms`);
	}
	return FRAMES.get(id)!;
}

const TaskProgressBar: React.FC<TaskProgressBarProps> = memo(({ currentTask }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number | null>(null);
	const lastProgressRef = useRef(-1);
	const taskRef = useRef<CurrentTask | null>(null);

	const draw = useCallback(() => {
		const taskData = taskRef.current;
		if (!taskData) return;
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;

		const frames = getFrames(canvas.width, canvas.height);
		const frameCount = frames.length;

		const { task, start } = taskData;
		const progress = Math.min(((Date.now() - start) / task.baseTime) * 100, 100);

		if (lastProgressRef.current > progress) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
		lastProgressRef.current = progress;

		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Calculate which frame to show based on time
		const frameIndex = Math.floor((Date.now() / 50) % frameCount);
		const frame = frames[frameIndex];

		// Draw the frame up to the progress point
		const progressWidth = (canvas.width * progress) / 100;
		ctx.putImageData(
			frame.imageData,
			0, 0,
			0, 0,
			Math.min(progressWidth, frame.width),
			canvas.height
		);

		animationFrameRef.current = requestAnimationFrame(draw);
	}, []);

	useEffect(() => {
		taskRef.current = currentTask;
		lastProgressRef.current = -1;

		if (canvasRef.current) {
			// Generate frames when size changes
			/*framesRef.current = generateFrames(
				canvasRef.current.width,
				canvasRef.current.height
			);*/
		}
	}, [currentTask]);

	useEffect(() => {
		if (!currentTask) {
			const canvas = canvasRef.current;
			const ctx = canvas?.getContext('2d');
			if (ctx) ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
			return;
		}

		animationFrameRef.current = requestAnimationFrame(draw);

		return () => {
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, [currentTask, draw]);

	return (
		<AutoSizer>
			{({ height, width }) => (
				<canvas
					ref={canvasRef}
					width={width}
					height={height}
				/>
			)}
		</AutoSizer>
	);
});

export default TaskProgressBar;