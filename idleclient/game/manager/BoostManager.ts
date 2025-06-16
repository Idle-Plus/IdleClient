import { ManagerStorage, ManagerType } from "@context/GameContext.tsx";
import { MasteryCapeType, Skill } from "@idleclient/network/NetworkData.ts";
import { RefObject, useRef } from "react";
import { useIdleEvent } from "@hooks/event/useIdleEvent.ts";
import { EquipmentEvents } from "@idleclient/event/EquipmentEvents.ts";
import { GameEvents } from "@idleclient/event/GameEvents.ts";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";

interface CombatBoosts {
	melee: { strength: number, accuracy: number, defence: number },
	archery: { strength: number, accuracy: number, defence: number },
	magic: { strength: number, accuracy: number, defence: number },
}

export interface BoostManagerType extends ManagerType {
	combatBoosts: SmartRef<CombatBoosts>;

	getSkillBoost: (skill: Skill) => number;
}

export const BoostManager = (managers: ManagerStorage): BoostManagerType => {

	const _skillBoostsRef = useRef(new Map<Skill, number>());
	const _combatBoostsRef = useSmartRef<CombatBoosts>({
		melee: { strength: 0, accuracy: 0, defence: 0 },
		archery: { strength: 0, accuracy: 0, defence: 0 },
		magic: { strength: 0, accuracy: 0, defence: 0}
	});

	/*
	 * Functions
	 */

	const getSkillBoost = (skill: Skill) => {
		return _skillBoostsRef.current.get(skill) ?? 0;
	}

	/*
	 * Events
	 */

	useIdleEvent(GameEvents.ConnectedPreEvent, () => {
		_skillBoostsRef.current.clear()
		_combatBoostsRef.setContent({
			melee: { strength: 0, accuracy: 0, defence: 0 },
			archery: { strength: 0, accuracy: 0, defence: 0 },
			magic: { strength: 0, accuracy: 0, defence: 0}
		});
	});

	useIdleEvent(EquipmentEvents.ItemEquipEvent, (item, _) => {
		handleSkillBoost(item, true, _skillBoostsRef);
		handleCompletionistCapeBoost(item, true, _skillBoostsRef);
		handleCombatBoost(item, true, _combatBoostsRef);
	});

	useIdleEvent(EquipmentEvents.ItemUnequipEvent, (item, _) => {
		handleSkillBoost(item, false, _skillBoostsRef);
		handleCompletionistCapeBoost(item, false, _skillBoostsRef);
		handleCombatBoost(item, false, _combatBoostsRef);
	});

	return {
		$managerName: "boostManager",

		combatBoosts: _combatBoostsRef,

		getSkillBoost: getSkillBoost
	}
}

function handleSkillBoost(item: ItemDefinition, equip: boolean, ref: RefObject<Map<Skill, number>>) {
	const itemBoost = item.skillBoost;
	if (itemBoost === null) return;

	const boost = ref.current.get(itemBoost.skill) ?? 0;
	const percentage = equip ? itemBoost.boostPercentage : -itemBoost.boostPercentage;

	const result = boost + percentage;
	if (result < 0) {
		console.warn(`BoostManager: Skill boost for skill ${Skill[itemBoost.skill]} is negative when \
		handling ${item}.}`);
	}

	ref.current.set(itemBoost.skill, result);
}

function handleCompletionistCapeBoost(item: ItemDefinition, equip: boolean, ref: RefObject<Map<Skill, number>>) {
	if (item.masteryCapeType !== MasteryCapeType.Completionist) return;

	const tier = item.getMasteryCapeTier();
	const capes = ItemDatabase.SKILLING_CAPES_BY_TIER.get(tier);
	if (capes === undefined) {
		console.warn(`Couldn't find skilling capes for tier ${tier} when handling comp cape ${item}.`);
		return;
	}

	for (const capeId of capes) {
		const cape = ItemDatabase.get(capeId);
		const capeBoost = cape.skillBoost;
		if (capeBoost === null) continue;

		const boost = ref.current.get(capeBoost.skill) ?? 0;
		const percentage = equip ? capeBoost.boostPercentage : -capeBoost.boostPercentage;

		const result = boost + percentage;
		if (result < 0) {
			console.warn(`BoostManager: Skill boost for skill ${Skill[capeBoost.skill]} is negative when \
			handling comp cape ${item}.}`);

		}

		ref.current.set(capeBoost.skill, result);
	}
}

function handleCombatBoost(item: ItemDefinition, equip: boolean, ref: SmartRef<CombatBoosts>) {
	if (item.meleeBonus === null && item.archeryBonus === null && item.magicBonus === null) return;
	const boosts = ref.content();

	boosts.melee.strength += equip ? item.meleeStrengthBonus : -item.meleeStrengthBonus;
	boosts.melee.accuracy += equip ? item.meleeAccuracyBonus : -item.meleeAccuracyBonus;
	boosts.melee.defence += equip ? item.meleeDefenceBonus : -item.meleeDefenceBonus;
	boosts.archery.strength += equip ? item.archeryStrengthBonus : -item.archeryStrengthBonus;
	boosts.archery.accuracy += equip ? item.archeryAccuracyBonus : -item.archeryAccuracyBonus;
	boosts.archery.defence += equip ? item.archeryDefenceBonus : -item.archeryDefenceBonus;
	boosts.magic.strength += equip ? item.magicStrengthBonus : -item.magicStrengthBonus;
	boosts.magic.accuracy += equip ? item.magicAccuracyBonus : -item.magicAccuracyBonus;
	boosts.magic.defence += equip ? item.magicDefenceBonus : -item.magicDefenceBonus;

	ref.trigger();
}