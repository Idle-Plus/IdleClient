import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import React, { useEffect, useState } from "react";
import { ItemIcon, SpriteIcon } from "@components/icon";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { EquipmentSlot, Skill } from "@idleclient/network/NetworkData.ts";
import { createPortal } from "react-dom";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import { GameContextType, useGame } from "@context/GameContext.tsx";
import { ToolbeltUtils } from "@idleclient/game/utils/ToolbeltUtils.ts";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";
import { TextUtils } from "@idleclient/utils/TextUtils.tsx";

interface EquipmentTooltipProps {
	item: ItemDefinition;
	containerRef: React.RefObject<HTMLDivElement | null>;
}

// TODO: Update this to match the ItemTooltip.

function getExtraInfo(item: ItemDefinition, game: GameContextType) {
	if (item.equipmentSlot === EquipmentSlot.Belt) {
		const unlockedSkills = ToolbeltUtils.getUnlockedSkills(game);
		return (
			<div className="text-base/4 px-2">
				<span>Unlocked tools: </span>
				{ unlockedSkills.map((skill, i) => (
					<span key={i}><SpriteIcon icon={SkillUtils.getSpriteIconId(skill, 32)} canvas={true} size={18} /> </span>
				)) }

				{  unlockedSkills.length <= 0 ? <span>None</span> : "" }
			</div>
		)
	}

	if (item.isEnchanted()) {
		const enchantments = game.player.enchantments.content().get(item.getOriginalItemId()) ?? [];
		const missingEnchantments = Object.keys(Skill).map(Number)
			.filter(key => !isNaN(key) && !enchantments.includes(key))
			.filter(key => key !== Skill.None && key !== Skill.Health);


		return (
			<div className="text-base/5 flex flex-col gap-1">
				{ enchantments.length > 0 && (
					<div>
						<div className="">Enchantments</div>
						<div className="px-2 drop-shadow-black/50 drop-shadow-sm">
							{ enchantments.map((skill, i) => (
								<span key={i}><SpriteIcon icon={SkillUtils.getSpriteIconId(skill, 32)} size={18} /> </span>
							)) }
						</div>
					</div>
				) }
				{ missingEnchantments.length > 0 && (
					<div>
						<div className="">Missing enchantments</div>
						<div className="px-2 drop-shadow-black/50 drop-shadow-sm">
							{ missingEnchantments.map((skill, i) => (
								<span key={i}><SpriteIcon icon={SkillUtils.getSpriteIconId(skill, 32)} size={18} /> </span>
							)) }
						</div>
					</div>
				) }
			</div>
		)
	}

	return null;
}

const EquipmentTooltip: React.FC<EquipmentTooltipProps> = ({ item, containerRef }) => {
	const game = useGame();
	const [visible, setVisible] = useState(false);
	const [shift, setShift] = useState(false);

	// Dirty hack to make the tooltip not "jump" into position.
	useEffect(() => {
		const timeout = setTimeout(() => {
			setVisible(true);
		}, 1);

		const handleKeyDown = (e: KeyboardEvent, down: boolean) => {
			if (e.key === "Shift" && down) {
				setShift(true);
			} else if (e.key === "Shift" && !down) {
				setShift(false);
			}
		};

		const handleDown = (e: KeyboardEvent) => handleKeyDown(e, true);
		const handleUp = (e: KeyboardEvent) => handleKeyDown(e, false);

		window.addEventListener("keydown", handleDown);
		window.addEventListener("keyup", handleUp);
		return () => {
			clearTimeout(timeout);
			window.removeEventListener("keydown", handleDown);
			window.removeEventListener("keyup", handleUp);
		}
	}, []);

	const statClass = (value: number) => {
		const base = "w-18";
		if (value < 0) return base + " text-[#ffa5a5]";
		if (value > 0) return base + " text-[#b6ffa5]";
		return base + " text-gray-300";
	}

	const stat = (value: number) => {
		if (value > 0) return "+" + value;
		return value;
	}

	const getStatHTML = (entry: { accuracy: number, strength: number, defence: number }) => {
		return (
			<div className="grid grid-cols-3 pl-1 gap-3 text-right text-white whitespace-nowrap">
				<span className={statClass(entry.strength)}>
					<span className="">{stat(entry.strength)} </span>
					STR
				</span>
				<span className={statClass(entry.accuracy)}>
					<span className="">{stat(entry.accuracy)} </span>
					ACC
				</span>
				<span className={statClass(entry.defence)}>
					<span className="">{stat(entry.defence)} </span>
					DEF
				</span>
			</div>
		);
	}

	const description = item.getLocalizedDescription(game);
	const hasDescription = description !== null && description.trim() !== "";
	const hasSkillBoost = item.skillBoost !== null;
	const hasCombatBonus = item.meleeBonus !== null || item.archeryBonus !== null || item.magicBonus !== null;

	const extraInfo = getExtraInfo(item, game);
	const hasExtraInfo = extraInfo !== null;

	const tooltip = (
		<div
			className="absolute z-40 bg-ic-dark-300 rounded-md max-w-[23rem]"
			style={{
				transform: `translateX(calc(-100% - 1rem)) scale(${visible ? 1 : 0})`,
				opacity: visible ? 1 : 0,

				pointerEvents: 'none',
				boxShadow: "0 0 8px -1px #00000080",

				transition: "transform 0.075s ease-out",
				transformOrigin: "center right",
			}}
		>

			<div className="flex flex-row">
				<div className="flex items-center bg-ic-dark-000/75 rounded-l-md p-1">
					<ItemIcon
						item={item}
						canvas={true}
						size={16 * 4}
						className="drop-shadow-black/80 drop-shadow-sm"
					/>
				</div>

				<div className="px-2">
					{/* ${!hasInfo ? "h-full" : ""} */}
					<div className={`flex items-center justify-center py-1 px-2`}>
						{/* w-max */}
						<h1 className="text-lg font-semibold text-white text-center wrap-anywhere">{item.getLocalizedName()}</h1>
					</div>

					{ hasDescription && (
						<>
							<div className='flex items-center w-full'>
								<span className='flex-1 border-b-2 border-ic-dark-000/75'/>
							</div>

							<div className="px-2 text-base text-gray-200 inline-block min-w-[16rem] max-w-full">
								{TextUtils.getStyledMessage(description, {appendPeriod: true})}
							</div>
						</>
					) }

					{ (hasSkillBoost && item.skillBoost!.boostPercentage > 0) && (
						<>
							<div className='flex items-center py-0.5'>
								<span className='flex-1 border-b-2 border-ic-dark-000/75'/>
							</div>

							<div className="w-max">
								<span className="font-semibold text-gray-200 text-base">Skill Boost</span>

								<div className="pb-1 pt-0">
									<span className="capitalize text-gray-200">
										<SpriteIcon
											icon={SkillUtils.getSpriteIconId(item.skillBoost!.skill, 32)}
											canvas={true}
											size={24}
											className="mr-2 drop-shadow-black/50 drop-shadow-sm select-none"
										/>
										{Skill[item.skillBoost!.skill]}:
										<span className="text-gray-100"> {item.skillBoost!.boostPercentage}%</span>
									</span>
								</div>
							</div>
						</>
					) }

					{ (hasCombatBonus) && (
						<>
							{ !(hasSkillBoost && item.skillBoost!.boostPercentage > 0) && (
								<div className='flex items-center py-0.5'>
									<span className='flex-1 border-b-2 border-ic-dark-000/75'/>
								</div>
							) }

							<div className="w-max flex flex-col">
								<span className="font-semibold text-gray-200 text-base">Combat Stats</span>

								<div className="flex flex-col pb-1 gap-0.5">
									{ item.meleeBonus && (
										<div className="flex justify-center">
											<SpriteIcon
												icon={SkillUtils.getSpriteIconId(Skill.Rigour, 32)}
												canvas={true}
												size={24}
												className="mr-1 drop-shadow-black/50 drop-shadow-sm select-none"
											/>

											{ getStatHTML(item.meleeBonus) }
										</div>
									)}

									{ item.archeryBonus && (
										<div className="flex justify-center">
											<SpriteIcon
												icon={SkillUtils.getSpriteIconId(Skill.Archery, 32)}
												canvas={true}
												size={24}
												className="mr-1 drop-shadow-black/50 drop-shadow-sm select-none"
											/>
											{ getStatHTML(item.archeryBonus) }
										</div>
									)}

									{ item.magicBonus && (
										<div className="flex justify-center">
											<SpriteIcon
												icon={SkillUtils.getSpriteIconId(Skill.Magic, 32)}
												canvas={true}
												size={24}
												className="mr-1 drop-shadow-black/50 drop-shadow-sm select-none"
											/>
											{ getStatHTML(item.magicBonus) }
										</div>
									)}
								</div>
							</div>
						</>
					) }

					{ hasExtraInfo && (
						<>
							{ shift ? (
								<>
									<div className='flex items-center py-1'>
										<span className='flex-1 border-b-2 border-ic-dark-000/75' />
									</div>
									<div className="text-base text-gray-300">
										{ extraInfo }
									</div>
								</>
							) : (
								<div className="w-full flex justify-center text-gray-300/80 italic text-sm">
									Hold SHIFT for more info.
								</div>
							) }
						</>
					) }

					{ (item.baseValue || item.levelRequirement) && (
						<>
							<div className='flex items-center py-1'>
								<span className='flex-1 border-b-2 border-ic-dark-000/75' />
							</div>

							<div className="w-full flex flex-row gap-1 pb-1.5 whitespace-nowrap text-white/80">
								<div className="w-full flex items-center gap-1 italic text-sm">
									{ item.levelRequirement && (
										<>
											<SpriteIcon
												icon={SkillUtils.getSpriteIconId(item.levelRequirement.skill, 32)}
												canvas={true}
												size={16}
												className="mr-1 drop-shadow-black/30 drop-shadow-sm select-none"
											/>
											<span className="capitalize">Lv. {item.levelRequirement.level}</span>
										</>
									) }
								</div>
								<div className="w-full flex items-center gap-1 justify-end italic text-sm">
									{ item.baseValue && (
										<>
											{item.baseValue.toLocaleString()}
											<ItemIcon
												item={GameData.items().item(ItemDatabase.GOLD_ITEM_ID)}
												canvas={true}
												size={20}
												className="ml-1 drop-shadow-black/30 drop-shadow-sm select-none"
											/>
										</>
									) }
								</div>
							</div>
						</>
					) }
				</div>
			</div>
		</div>
	);

	if (containerRef.current) {
		return createPortal(tooltip, containerRef.current);
	}

	return tooltip;
};

export default EquipmentTooltip;
