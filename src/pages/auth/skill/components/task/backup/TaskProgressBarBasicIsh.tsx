import React, { memo, useCallback, useEffect, useRef } from "react";
import { CurrentTask } from "@idleclient/game/manager/TaskManager.ts";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";

interface TaskProgressBarProps {
	currentTask: CurrentTask | null,
}

interface Point {
	x: number;
	y: number;
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
		const progress = Math.min(((Date.now() - start) / task.baseTime) * 100, 100);

		if (lastProgressRef.current > progress) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
		lastProgressRef.current = progress;

		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Create gradient
		const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
		//gradient.addColorStop(0, '#00ff9d');
		//gradient.addColorStop(0.5, '#33d7b1');
		//gradient.addColorStop(1, '#00ffcc');
		gradient.addColorStop(0, '#ffad3c');
		gradient.addColorStop(0.5, '#f46d0d');
		gradient.addColorStop(1, '#dc2929');

		// Draw background with slight transparency
		ctx.fillStyle = '#1a2e29';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Draw main progress bar with gradient
		ctx.fillStyle = gradient;
		const progressWidth = (canvas.width * progress) / 100;
		ctx.fillRect(0, 0, progressWidth, canvas.height);

		// Add glow effect
		//ctx.shadowColor = '#63ffd8';
		ctx.shadowColor = '#ffd786';
		//ctx.shadowColor = '#33d7b1';
		//ctx.shadowColor = '#33d7b1';
		ctx.shadowBlur = 10;
		ctx.shadowOffsetX = 0;

		ctx.strokeStyle = '#ffd786';
		//ctx.strokeStyle = '#cefff4';
		ctx.lineWidth = 3;
		ctx.strokeRect(progressWidth, -20, 0, canvas.height + 20);

		// Add animated shine effect
		/*offsetRef.current = (offsetRef.current + 2) % (canvas.width * 2);
		const shimmerWidth = canvas.width * 0.1;

		ctx.save();
		ctx.globalCompositeOperation = 'source-atop';
		const shimmerGradient = ctx.createLinearGradient(
			offsetRef.current - shimmerWidth,
			0,
			offsetRef.current,
			0
		);
		shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
		shimmerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
		shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

		ctx.fillStyle = shimmerGradient;
		ctx.fillRect(0, 0, progressWidth, canvas.height);
		ctx.restore();*/

		animationFrameRef.current = requestAnimationFrame(draw);
	}, []);

	useEffect(() => {
		taskRef.current = currentTask;
		lastProgressRef.current = -1;
		offsetRef.current = 0;
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