import React, { memo, useEffect, useRef } from "react";
import { CurrentTask } from "@idleclient/game/manager/TaskManager.ts";
import usePacket from "@hooks/network/usePacket.ts";
import { CompleteTaskMessage, PacketType } from "@idleclient/network/NetworkData.ts";

interface TaskProgressBarProps {
	currentTask: CurrentTask | null,
}

const TaskProgressBar: React.FC<TaskProgressBarProps> = memo(({ currentTask }) => {
	const targetProgressRef = useRef(0);
	const barRef = useRef<HTMLDivElement>(null);
	const isActive = currentTask !== null;

	console.log("RE-RENDER TASK PROGRESS BAR!", currentTask);

	//currentTask = { task: { baseTime: 1000 }, start: Date.now() }

	const resetProgressBar = (value?: number) => {
		const bar = barRef.current;
		if (bar === null) {
			console.error("Progress bar is null when resetting progress bar.");
			return;
		}

		targetProgressRef.current = value ?? 0;
		bar.style.width = value ? `${value}%` : "0%";
		bar.style.transitionDuration = "0ms";
	}

	const setProgressBar = (progress: number, transitionDuration: number) => {
		const bar = barRef.current;
		if (bar === null) {
			console.error("Progress bar is null when setting progress bar.");
			return;
		}

		targetProgressRef.current = progress;
		bar.style.width = `${progress}%`;
		bar.style.transitionDuration = `${transitionDuration}ms`;
	}

	/**
	 * First time progress bar setup logic.
	 */
	useEffect(() => {
		if (currentTask === null) {
			resetProgressBar();
			return;
		}
		const task = currentTask.task;
		const start = currentTask.start;

		const progress = ((Date.now() - start) / task.baseTime) * 100;
		const timeLeft = task.baseTime - (Date.now() - start);

		// Reset the progress bar at the current progress.
		resetProgressBar(progress);

		// Start animating the task next frame if we have more than 25ms
		// of progress left.
		if ((timeLeft - 25) <= 0) return;
		const timeout = setTimeout(() => setProgressBar(100, timeLeft), 1);
		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		if (isActive) return;
		resetProgress();
	}, [isActive]);

	/**
	 * Reset the current progress back to 0, an optional callback to know when the
	 * progress bar has been cleared.
	 */
	const resetProgress = (callback?: () => void) => {
		resetProgressBar();
		requestAnimationFrame(() => callback?.());
	}

	/**
	 * Clears the current progress and replays the progress animation.
	 */
	const refreshProgress = (lastCompleted: number) => {
		resetProgress(() => {
			const timeLeft = currentTask?.task?.baseTime ?? 0 - (Date.now() - lastCompleted);
			if (timeLeft <= 0) return;
			setProgressBar(100, timeLeft)
		})
	}

	/*useEffect(() => {
		if (currentTask === null) return;
		refreshProgress(currentTask.start);
	}, [currentTask?.start]);*/

	const click = () => {
		//refreshProgress(Date.now());
	}

	usePacket<CompleteTaskMessage>(packet => {
		if (currentTask === null) return;
		if (currentTask.task.taskType !== packet.TaskType) return;
		if (currentTask.task.taskId !== packet.TaskId) return;
		console.log("Resetting task.");
		refreshProgress(Date.now());
	}, [isActive], PacketType.CompleteTaskMessage);

	return (
		<div
			ref={barRef}
			className="h-full bg-ic-light-300"
			style={{ width: `${targetProgressRef.current}%`, transitionTimingFunction: "linear" }}
			onClick={click}
		/>
	)
});

export default TaskProgressBar;