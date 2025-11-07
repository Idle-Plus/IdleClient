import { BaseModalProps } from "@components/modal/BaseModal.tsx";
import { JobTask } from "@idleclient/game/data/TaskDatabase.ts";
import React, { useState } from "react";
import { IdleNumberInput } from "@components/input/IdleNumberInput.tsx";
import { useGame } from "@context/GameContext.tsx";
import { toFixedNoRoundLocale } from "@idleclient/game/utils/numberUtils.ts";

interface GatheringCalculatorModalProps extends BaseModalProps {
	task: JobTask
}

const GatheringCalculatorModal: React.FC<GatheringCalculatorModalProps> = ({ active, onClose, task }) => {
	const game = useGame();
	const [isMouseDown, setIsMouseDown] = useState(false);
	const [amount, setAmount] = useState(1);
	const [timeMinutes, setTimeMinutes] = useState(1);

	if (!active) return null;

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			setIsMouseDown(true);
		}
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && isMouseDown) {
			onClose?.();
		}
		setIsMouseDown(false);
	};

	const baseSpeed = task.getModifiedTaskTime(game);
	const baseXp = task.getModifiedExperience(game);
	let baseLoot = task.itemAmount;
	if (game.equipment.isItemEquipped(871)) baseLoot *= 1.05;

	const finalSpeed = (baseSpeed * amount) / 1000;
	const finalXp = baseXp * amount;
	const finalLoot = baseLoot * amount;

	const hours = finalSpeed / 3600;
	const minutes = (finalSpeed % 3600) / 60;
	const seconds = finalSpeed % 60;
	const timeFormatted = `${
		hours > 1 ? hours.toFixed(0) + "h " : ""}${
		minutes > 1 ? minutes.toFixed(0) + "m " : ""}${
		seconds > 1 ? seconds.toFixed(3) + "s" : ""}`;

	const timeMinutesToMs = timeMinutes * 60 * 1000;
	const tasksInTime = Math.floor(timeMinutesToMs / baseSpeed);

	const timeFinalSpeed = (baseSpeed * tasksInTime) / 1000;
	const timeFinalXp = baseXp * tasksInTime;
	let timeFinalLoot = baseLoot * tasksInTime;
	if (game.equipment.isItemEquipped(871)) timeFinalLoot *= 1.05;

	const timeHours = Math.floor(timeFinalSpeed / 3600);
	const timeMinutess = Math.floor((timeFinalSpeed % 3600) / 60);
	const timeSeconds = timeFinalSpeed % 60;
	const timeTimeFormatted = `${
		timeHours >= 1 ? timeHours.toFixed(0) + "h " : ""}${
		timeMinutess >= 1 ? timeMinutess.toFixed(0) + "m " : ""}${
		timeSeconds >= 1 ? timeSeconds.toFixed(3) + "s" : ""}`;

	return (
		<div
			className="fixed inset-0 bg-[#00000080] flex flex-col justify-evenly items-center z-50 p-4"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseLeave={() => setIsMouseDown(false)}
		>
			<div className="w-full h-full flex flex-col items-center max-w-lg p-4 bg-ic-dark-500">
				<p className="text-gray-100 text-2xl font-bold text-center">Gathering Calculator</p>

				<div className="mt-4">
					<p className="text-gray-300 text-xl">Amount of completions</p>
					<IdleNumberInput
						value={amount}
						onValueChange={value => setAmount(value)}
						min={1}
					/>
				</div>

				<p className="text-gray-100 text-2xl/3 mt-8">Result</p>
				<p className="text-gray-200 text-xl italic">With current equipment</p>
				<div className="mt-2">
					{/*<p className="text-gray-300 text-xl">Time: {finalSpeed.toFixed(3)}s</p>*/}
					<p className="text-gray-300 text-xl">Time: {timeFormatted}</p>
					<p className="text-gray-300 text-xl">Items: {toFixedNoRoundLocale(finalLoot, 1)}</p>
					<p className="text-gray-300 text-xl">XP: {toFixedNoRoundLocale(finalXp, 2)}</p>
				</div>


				<div className="mt-10">
					<p className="text-gray-300 text-xl">Time in minutes</p>
					<IdleNumberInput
						value={timeMinutes}
						onValueChange={value => setTimeMinutes(value)}
						min={1}
					/>
				</div>

				<p className="text-gray-100 text-2xl/3 mt-8">Result</p>
				<p className="text-gray-200 text-xl italic">With current equipment</p>
				<div className="mt-2">
					{/*<p className="text-gray-300 text-xl">Time: {finalSpeed.toFixed(3)}s</p>*/}
					<p className="text-gray-300 text-xl">Time: {timeTimeFormatted}</p>
					<p className="text-gray-300 text-xl">Items: {toFixedNoRoundLocale(timeFinalLoot, 1)}</p>
					<p className="text-gray-300 text-xl">XP: {toFixedNoRoundLocale(timeFinalXp, 2)}</p>
					<p className="text-gray-300 text-xl">Completions: {tasksInTime}</p>
				</div>
			</div>
		</div>
	);
}

export default GatheringCalculatorModal;