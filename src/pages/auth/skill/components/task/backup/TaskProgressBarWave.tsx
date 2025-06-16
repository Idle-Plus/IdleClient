import React, { memo, useCallback, useEffect, useRef } from "react";
import { CurrentTask } from "@idleclient/game/manager/TaskManager.ts";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";

interface TaskProgressBarProps {
	currentTask: CurrentTask | null,
}

const TaskProgressBar: React.FC<TaskProgressBarProps> = memo(({ currentTask }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number | null>(null);
	const lastProgressRef = useRef(-1);
	const taskRef = useRef<CurrentTask | null>(null);

	const offsetRef = useRef(0);

	const draw = useCallback(() => {
		const taskData = taskRef.current;
		if (!taskData) return;
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;

		const { task, start } = taskData;
		//const progress = 75;
		const progress = Math.min(((Date.now() - start) / task.baseTime) * 100, 100);

		if (lastProgressRef.current > progress)
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		lastProgressRef.current = progress;

		// Draw background
		ctx.fillStyle = '#1a2e29';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const barWidth = canvas.width * progress / 100;

		/*// Create gradient that's wider than canvas to ensure seamless transition
		const gradient = ctx.createLinearGradient(x, 0, x + patternWidth, 0);

		// Create smooth gradient transitions
		gradient.addColorStop(0, '#33d7b1');
		//gradient.addColorStop(0.25, '#ba69d3');
		gradient.addColorStop(0.5, '#ba69d3');
		//gradient.addColorStop(0.75, '#ba69d3');
		gradient.addColorStop(1, '#33d7b1'); // Same as start for seamless loop*/

		// Create a clipping path for the progress
		ctx.save();
		ctx.beginPath();
		ctx.rect(0, 0, barWidth, canvas.height);
		ctx.clip();

		// Create moving gradient with seamless pattern
		const patternWidth = canvas.width * 0.2; // Width of one complete pattern
		const x = (offsetRef.current % patternWidth); // This creates a smooth infinite scroll

		// Draw multiple gradient patterns
		for (let i = -1; i < Math.ceil(canvas.width / patternWidth); i++) {
			const startX = x + (patternWidth * i);
			const gradient = ctx.createLinearGradient(
				startX,
				0,
				startX + patternWidth,
				0
			);

			gradient.addColorStop(0, '#33d7b1');
			gradient.addColorStop(0.1, '#33d7b1');
			gradient.addColorStop(0.4, '#42eac4');
			gradient.addColorStop(0.6, '#42eac4');
			gradient.addColorStop(0.9, '#33d7b1');
			gradient.addColorStop(1, '#33d7b1');

			ctx.fillStyle = gradient;
			ctx.fillRect(startX, 0, patternWidth - -1, canvas.height);
		}


		/*// Draw multiple gradient patterns to ensure full coverage
		for (let i = 0; i < canvas.width / patternWidth + 1; i++) {
			ctx.fillStyle = gradient;
			ctx.fillRect(x + (patternWidth * i), 0, patternWidth - 2, canvas.height);
		}*/

		// Add shine effect
		const shine = ctx.createLinearGradient(0, 0, 0, canvas.height);
		shine.addColorStop(0, 'rgba(255, 255, 255, 0)');
		shine.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
		shine.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
		ctx.fillStyle = shine;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.restore();

		// Update offset for animation
		offsetRef.current += 3; // Adjust this value to control wave speed

		animationFrameRef.current = requestAnimationFrame(draw);
	}, []);


	useEffect(() => {
		taskRef.current = currentTask;
		lastProgressRef.current = -1;
		offsetRef.current = 0; // Reset offset when task changes
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
					//className="h-full w-full"
				/>
			)}
		</AutoSizer>
	);
});


export default TaskProgressBar;