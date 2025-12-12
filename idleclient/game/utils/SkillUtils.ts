import { Skill } from "@idleclient/network/NetworkData.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";

const EXP_TABLE = [
	0,        75,       151,      227,      303,      380,      531,      683,      836,      988,
	1141,     1294,     1447,     1751,     2054,     2358,     2663,     2967,     3272,     3577,
	4182,     4788,     5393,     5999,     6606,     7212,     7819,     9026,     10233,    11441,
	12648,    13856,    15065,    16273,    18682,    21091,    23500,    25910,    28319,    30729,
	33140,    37950,    42761,    47572,    52383,    57195,    62006,    66818,    76431,    86043,
	95656,    105269,   114882,   124496,   134109,   153323,   172538,   191752,   210967,   230182,
	249397,   268613,   307028,   345444,   383861,   422277,   460694,   499111,   537528,   614346,
	691163,   767981,   844800,   921618,   998437,   1075256,  1228875,  1382495,  1536114,  1689734,
	1843355,  1996975,  2150596,  2457817,  2765038,  3072260,  3379481,  3686703,  3993926,  4301148,
	4915571,  5529994,  6144417,  6758841,  7373264,  7987688,  8602113,  9830937,  11059762, 12288587,
	13517412, 14746238, 15975063, 17203889, 19661516, 22119142, 24576769, 27034396, 29492023, 31949651,
	34407278, 39322506, 44237735, 49152963, 54068192, 58983421, 63898650, 68813880, 78644309, 88474739
]

export class SkillUtils {
	public static getLocalizedSkillName(skill: Skill): string {
		return GameData.localization().get(Skill[skill].toLowerCase());
	}

	public static getSpriteIconId(skill: Skill, size?: number): string {
		let skillName = typeof skill === "number" ? Skill[skill].toLowerCase() : (skill as string).toLowerCase();
		if (skillName === "rigour") skillName = "attack";
		return "skill/skill_" + skillName + (size ? "_" + size : "");
	}

	public static getSkills(): Skill[] {
		return Object.keys(Skill).map(Number).filter(key => !isNaN(key))
			.map(key => key as Skill).filter(skill => skill !== Skill.None) as Skill[];
	}

	/*
	 * Level and experience
	 */

	public static getExperienceForLevel(level: number): number {
		return EXP_TABLE[Math.max(1, Math.min(120, level)) - 1];
	}

	public static getLevelForExperience(xp: number): number {
		if (xp <= 0) return 1;
		if (xp >= EXP_TABLE[EXP_TABLE.length - 1]) return 120;

		for (let i = EXP_TABLE.length - 1; i >= 0; i--) {
			if (EXP_TABLE[i] <= xp) return i + 1;
		}

		// Should technically never happen.
		throw new Error("Invalid experience: " + xp);
	}

	public static getLevelProgress(xp: number): { level: number, totalXp: number, currentXp: number, targetXp: number, progress: number } {
		const level = SkillUtils.getLevelForExperience(xp);
		let current;
		let target;
		let progress;

		if (level !== GameData.settings().shared().maxSkillLevel) {
			const currentLevelExperience = SkillUtils.getExperienceForLevel(level);
			target = SkillUtils.getExperienceForLevel(level + 1);
			progress = (xp - currentLevelExperience) / (target - currentLevelExperience);
			current = xp - currentLevelExperience;
			target = target - currentLevelExperience;
		} else {
			current = xp;
			target = GameData.settings().shared().maxPlayerSkillExperience;
			progress = xp / GameData.settings().shared().maxPlayerSkillExperience;
		}

		return { level: level, totalXp: xp, currentXp: current, targetXp: target, progress: progress };
	}
}