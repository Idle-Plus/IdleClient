import { GameContextType } from "@context/GameContext.tsx";
import { useEffect, useRef, useState } from "react";
import { Skill } from "@idleclient/network/NetworkData.ts";

const useSkillWatcher = (
	game: GameContextType,
	type: Skill
): number => {
	const {skill} = game;

	const [_, setForceRender] = useState<number>(0);
	const lastXpRef = useRef<number>(skill.skills.content().get(type) ?? 0);
	const lastSkillRef = useRef<Skill>(type);

	// If the type changes, then update the currently known xp.
	if (type !== lastSkillRef.current) {
		lastXpRef.current = skill.skills.content().get(type) ?? 0;
		lastSkillRef.current = type;
	}

	// Subscribe to the skill listener
	useEffect(() => {
		const id = skill.skillsListener.subscribe(type,  (xp: number | null) => {
			if (xp === lastXpRef.current) return;
			lastXpRef.current = xp ?? 0;
			setForceRender(prevState => (prevState + 1) % 10_000);
		})

		return () => skill.skillsListener.unsubscribe(type, id);
	}, [type]); // eslint-disable-line

	return lastXpRef.current;
}

export default useSkillWatcher;