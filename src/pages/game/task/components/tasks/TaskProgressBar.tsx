import React, { memo, useCallback, useEffect, useRef } from "react";
import { CurrentTask } from "@idleclient/game/manager/TaskManager.ts";
import AutoSizer from "react-virtualized-auto-sizer";
import { useGame } from "@context/GameContext.tsx";

interface TaskProgressBarProps {
	currentTask: CurrentTask | null,
}

const TaskProgressBar: React.FC<TaskProgressBarProps> = memo(({ currentTask }) => {
	const game = useGame();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number | null>(null);
	const lastProgressRef = useRef(-1);
	const taskRef = useRef<CurrentTask | null>(null);

	console.log("Task changed!");

	const draw = useCallback(() => {
		const taskData = taskRef.current;
		if (!taskData) return;
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;
		const { task, start } = taskData;

		//const startTime = Date.now();
		// TODO: Quite a heavy operation to run each frame.
		const time = task.getModifiedTaskTime(game);
		//console.log(`time: ${time}`)
		//console.log("Took: " + (Date.now() - startTime) + "ms to get time for task: " + task.name)

		const progress = Math.min(((Date.now() - start) / time) * 100, 100);

		if (lastProgressRef.current > progress)
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		lastProgressRef.current = progress;

		ctx.fillStyle = '#33d7b1';
		ctx.fillRect(0, 0, (canvas.width * progress) / 100, canvas.height);

		animationFrameRef.current = requestAnimationFrame(draw);
	}, []);

	useEffect(() => {
		taskRef.current = currentTask;
		lastProgressRef.current = -1;
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