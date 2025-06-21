import { ManagerStorage, ManagerType } from "@context/GameContext.tsx";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { SkillMap } from "@idleclient/types/gameTypes.ts";
import useIndexEventListener, { IndexEventListener } from "@hooks/useIndexEventListener.ts";
import { LoginDataMessage, Skill } from "@idleclient/network/NetworkData.ts";
import { ItemLevelRequirement } from "@idleclient/game/data/item/ItemDefinition.ts";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";

export interface SkillManagerType extends ManagerType {
	/**
	 * The skills, keyed by the skill and the player's experience points.
	 */
	skills: SmartRef<SkillMap>,
	/**
	 * Listener for the skill experience, which can be used to listen for
	 * changes to a specific skill.
	 */
	skillsListener: IndexEventListener<number>,

	/*
	 * Level
	 */

	hasLevel: {
		/**
		 * Checks whether the specified skill is higher or equal to the specified
		 * level.
		 */
		(skill: Skill, level: number): boolean;
		/**
		 * Check whether the specified {@link ItemLevelRequirement} is being met
		 * or not.
		 */
		(requirement: ItemLevelRequirement): boolean;
	},
	/**
	 * Get the level of the specified skill.
	 */
	getLevel: (skill: Skill) => number,

	/*
	 * Experience
	 */

	addExperience: (skill: Skill, amount: number) => void,
	removeExperience: (skill: Skill, amount: number) => void,
	setExperience: (skill: Skill, amount: number) => void,

	/**
	 * Initialize the skill manager.
	 */
	initialize: (data: LoginDataMessage) => void,
	/**
	 * Cleans up the skill manager, should always be called when the player
	 * disconnects from the game server.
	 */
	cleanup: () => void,
}

export const SkillManager = (managers: ManagerStorage): SkillManagerType => {
	
	const _skillsRef = useSmartRef<SkillMap>(new Map());
	const _skillsListener = useIndexEventListener<number>();

	/*
	 * Private functions
	 */

	const setSkills = (value: SkillMap) => {
		_skillsRef.setContent(value);
		_skillsListener.reinitialize(ctx => {
			for (const [skill, xp] of value.entries()) {
				ctx.set(skill, xp);
			}
		});
	}

	/*
	 * Functions
	 */

	const hasLevel = ((skillOrReq: Skill | ItemLevelRequirement, level?: number): boolean => {
		if (level !== undefined) {
			const experience = _skillsRef.content().get(skillOrReq as Skill) ?? 0;
			const currentLevel = SkillUtils.getLevelForExperience(experience);
			return currentLevel >= level;
		} else {
			const requirement = skillOrReq as ItemLevelRequirement;
			const experience = _skillsRef.content().get(requirement.skill) ?? 0;
			const currentLevel = SkillUtils.getLevelForExperience(experience);
			return currentLevel >= requirement.level;
		}
	});

	const getLevel = (skill: Skill) => {
		return _skillsRef.content().get(skill) ?? 0;
	}

	const addExperience = (skill: Skill, amount: number) => {
		if (amount < 0) throw new Error("Tried to add negative experience.");
		const skillMap = _skillsRef.content() as Map<Skill, number>;
		const currentExperience = skillMap.get(skill) ?? 0;
		skillMap.set(skill, currentExperience + amount);
		_skillsListener.set(skill, currentExperience + amount);
		_skillsRef.trigger();
	}

	const removeExperience = (skill: Skill, amount: number) => {
		if (amount < 0) throw new Error("Tried to remove negative experience.");
		const skillMap = _skillsRef.content() as Map<Skill, number>;
		const currentExperience = skillMap.get(skill) ?? 0;
		const newExperience = Math.max(0, currentExperience - amount);
		skillMap.set(skill, newExperience);
		_skillsListener.set(skill, newExperience);
		_skillsRef.trigger();
	}

	const setExperience = (skill: Skill, amount: number) => {
		if (amount < 0) throw new Error("Tried to set experience to a negative value.");
		const skillMap = _skillsRef.content() as Map<Skill, number>;
		skillMap.set(skill, amount);
		_skillsListener.set(skill, amount);
		_skillsRef.trigger();
	}

	/*
	 * Initialization
	 */

	const initialize = (data: LoginDataMessage) => {
		const parsedExperience = data.SkillExperiencesJson === undefined || data.SkillExperiencesJson === null ?
			{} : JSON.parse(data.SkillExperiencesJson);
		const skills = new Map<Skill, number>(Object.keys(parsedExperience)
			.map(key => {
				const skill = Skill[key as keyof typeof Skill] ?? Skill.None;
				const xp = parsedExperience[key];
				return [skill, xp];
			}));

		setSkills(skills);
	}

	const cleanup = () => {
		setSkills(new Map())
	}
	
	return {
		$managerName: "skillManager",
		skills: _skillsRef,
		skillsListener: _skillsListener,

		hasLevel: hasLevel,
		getLevel: getLevel,

		addExperience: addExperience,
		removeExperience: removeExperience,
		setExperience: setExperience,

		initialize: initialize,
		cleanup: cleanup
	}
}