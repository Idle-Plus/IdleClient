import { Skill } from "@idleclient/network/NetworkData.ts";
import React from "react";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import { useGame } from "@context/GameContext.tsx";
import useSkillWatcher from "@hooks/game/skill/useSkillWatcher.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";
import {
	toFixedNoRoundTrimLocale,
	toFixedNoRound,
	toFixedNoRoundLocale
} from "@idleclient/game/utils/numberUtils.ts";

interface BasicTaskHeaderProps {
	skill: Skill
}

const BasicTaskHeader: React.FC<BasicTaskHeaderProps> = ({ skill }) => {
	const game = useGame();
	const experience = useSkillWatcher(game, skill);

	const level = SkillUtils.getLevelForExperience(experience);
	let currentExperience;
	let targetExperience;
	let progress;

	if (level !== GameData.settings().shared().maxSkillLevel) {
		const currentLevelExperience = SkillUtils.getExperienceForLevel(level);
		targetExperience = SkillUtils.getExperienceForLevel(level + 1);
		progress = (experience - currentLevelExperience) / (targetExperience - currentLevelExperience);
		currentExperience = experience - currentLevelExperience;
		targetExperience = targetExperience - currentLevelExperience;
	} else {
		currentExperience = experience;
		targetExperience = GameData.settings().shared().maxPlayerSkillExperience;
		progress = experience / GameData.settings().shared().maxPlayerSkillExperience;
	}

	const currentExperienceFormatted = toFixedNoRoundLocale(currentExperience, 1);
	const targetExperienceFormatted = toFixedNoRoundTrimLocale(targetExperience, 1);
	const percentage = toFixedNoRound(progress * 100, 1);

	return (
		<div className="bg-ic-dark-500/75 p-4 mb-4 relative font-raleway">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-2 pb-2 text-center text-xl">
				<span className="text-white">
					{Skill[skill]}
				</span>
				<span className="text-white text-center">
					Lv. {level}
				</span>
				<span className="text-white">
					<span className="text-gray-300">Exp: </span>
					{currentExperienceFormatted}
					<span className="text-gray-300"> / </span>
					{targetExperienceFormatted}
					<span className="text-gray-300"> (<span className="text-gray-100">{percentage}%</span>)</span>
				</span>
			</div>
			<div className="w-full bg-ic-light-500 h-6 rounded-sm overflow-hidden">
				<div
					className="bg-ic-light-200 h-full rounded-sm transition-width duration-200"
					style={{width: `${progress * 100}%`}}
				/>
			</div>
		</div>
	)
}

export default BasicTaskHeader;