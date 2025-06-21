import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ItemIcon, SpriteIcon } from "@components/icon";
import { GameData } from "@idleclient/game/data/GameData.ts";
import { AttackStyle, Skill } from "@idleclient/network/NetworkData.ts";
import ReactDOM from "react-dom";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import { IdleClient } from "@idleclient/IdleClient.ts";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";
import { useGame } from "@context/GameContext.tsx";

interface ItemTooltipProps {
	item: ItemDefinition;
	count?: number;

	positions: { x: number, y: number }[] | HTMLElement; // 0 = top, 1 = left, 2 = bottom.
	/**
	 * If positions is a DOM element, then this can be used to add padding
	 * to the calculated position.
	 */
	positionPadding?: number;
	/**
	 * Class name to add to the tooltip.
	 */
	className?: string;
	/**
	 * The delay before the popup is displayed.
	 */
	delay?: number;
}

const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, count, positions, positionPadding, className, delay }) => {
	const game = useGame();
	// 0 = hidden, waiting until the tooltip has been rendered once to get the
	//     width and height.
	// 1 = hidden, being positioned in the correct spot.
	// 2 = visible, scale at 0, transition is set.
	// 3 = visible, scale at 1, transition is set and is animating in.
	const stateRef = useRef<number>(0);
	const positionRef = useRef<number>(-1);
	const tooltipRef = useRef<HTMLDivElement | null>(null);
	const [draw, setDraw] = useState(0);

	// If the positions is a DOM element, then we need to get the position of the
	// element.
	if (positions instanceof HTMLElement) {
		const rect = positions.getBoundingClientRect();
		const padding = positionPadding ?? 0;
		positions = [
			{ x: rect.left + (rect.width / 2), y: rect.top - padding },
			{ x: rect.left - padding, y: rect.top + (rect.height / 2) },
			{ x: rect.left + (rect.width / 2), y: rect.bottom + padding },
		];
	}

	// Dirty hack to make the tooltip not "jump" into position.
	// We also delay each step to not make the tooltip flash instantly.
	useLayoutEffect(() => {
		if (stateRef.current >= 3) return;

		const timeout = setTimeout(() => {
			if (tooltipRef.current === null) {
				// Wait until the tooltip is rendered.
				setDraw(v => v + 1);
				return;
			}

			// Go to the next state.
			stateRef.current = stateRef.current + 1;
			setDraw(v => v + 1);
		}, stateRef.current === 0 ? delay : 1); // TODO: Ability to change the speed in settings?

		return () => clearTimeout(timeout);
	}, [draw, delay]);

	const getPositionStyle = (index: number) => {
		if (index === 0) {
			return {
				transform: `translateX(calc(-50% - 40px)) translateY(-100%) scale(${stateRef.current >= 3 ? 1 : 0})`,
				left: positions[0].x,
				top: positions[0].y,
				transition: stateRef.current >= 2 ? "transform 0.1s ease-out" : "",
				opacity: stateRef.current >= 2 ? 1 : 0,
				transformOrigin: "center bottom"
			}
		}

		if (index === 1) {
			return {
				transform: `translateX(-100%) translateY(-50%) scale(${stateRef.current >= 3 ? 1 : 0})`,
				left: positions[1].x,
				top: positions[1].y,
				transition: stateRef.current >= 2 ? "transform 0.1s ease-out" : "",
				opacity: stateRef.current >= 2 ? 1 : 0,
				transformOrigin: "right center"
			}
		}

		return {
			transform: `translateX(calc(-50% - 40px)) scale(${stateRef.current >= 3 ? 1 : 0})`,
			left: positions[2].x,
			top: positions[2].y,
			transition: stateRef.current >= 2 ? "transform 0.1s ease-out" : "",
			opacity: stateRef.current >= 2 ? 1 : 0,
			transformOrigin: "center top"
		}
	}

	const getPosition = () => {
		// Get the size of the tooltip and see if it's too close to the edge.
		const rect = tooltipRef.current?.getBoundingClientRect();

		// If the tooltip is not rendered yet, return the default position.
		if (tooltipRef.current === null || rect === undefined) {
			return {
				transform: `translateX(calc(-50%)) translateY(-100%)`,
				left: positions[0].x,
				top: positions[0].y,
				opacity: 0,
			}
		}

		// If we've already calculated the position, then use that.
		if (positionRef.current >= 0)
			return getPositionStyle(positionRef.current);

		const padding = 16;

		// Check if the tooltip fits on the top.
		if ((positions[0].y - rect.height) - padding > 0) {
			positionRef.current = 0;
			return getPositionStyle(0);
		}

		// Okay, now check the left side.
		if ((positions[1].x - rect.width) - padding > 0 && (positions[1].y - (rect.height / 2)) - padding > 0) {
			positionRef.current = 1;
			return getPositionStyle(1);
		}

		positionRef.current = 2;
		return getPositionStyle(2);
	}

	const getStatHTML = (entry: { accuracy: number, strength: number, defence: number }) => {
		const statClass = (value: number) => {
			const base = "w-20 flex items-center justify-end";
			if (value < 0) return base + " text-stat-negative";
			if (value > 0) return base + " text-stat-positive"; //" text-[#b6ffa5]";
			return base + " text-stat-neutral";
		}

		const stat = (value: number) => {
			if (value > 0) return "+" + value;
			return value;
		}

		return (
			<div className="flex pl-1 text-[0.95rem] text-white">
				<span className={statClass(entry.strength)}>
					{stat(entry.strength)} STR
				</span>
				<span className={statClass(entry.accuracy)}>
					{stat(entry.accuracy)} ACC
				</span>
				<span className={statClass(entry.defence)}>
					{stat(entry.defence)} DEF
				</span>
			</div>
		);
	}

	const parseStyledText = (text: string) => {
		return text.split(/(<\/?[bi]>)/).map((part, index) => {
			if (part === "<b>") return null;
			if (part === "</b>") return null;
			if (part === "<i>") return null;
			if (part === "</i>") return null;

			const prevPart = index > 0 ? text.split(/(<\/?[bi]>)/)[index - 1] : "";
			const isBold = prevPart === "<b>";
			const isItalic = prevPart === "<i>";

			return part && (
				<span key={index} className={`${isBold ? "font-semibold" : ""} ${isItalic ? "italic" : ""}`}>
					{part}
				</span>
			);
		});
	};

	const getItemDescription = () => {
		const description = item.getLocalizedDescription();
		if (description === null) return "";

		return description.split(/(\\n|<br>)/)
			.map((line, index) => {
				if (line === "\\n" || line === "<br>") return <br key={`br-${index}`}/>;
				if (!line.endsWith(".") && line.length > 0) line += ".";
				return parseStyledText(line);
		});
	}

	const hasDescription = item.getLocalizedDescription() !== null && item.getLocalizedDescription()?.trim() !== "";
	const hasHealthOnConsume = item.healthAppliedOnConsume > 0;
	const hasSkillBoost = item.skillBoost !== null;
	const hasCombatBonus = item.meleeBonus !== null || item.archeryBonus !== null || item.magicBonus !== null ||
		item.attackInterval > 0 || item.twoHanded || item.attackStyle !== AttackStyle.None;

	const tooltip = (
		<div
			className="absolute z-40 font-nunito"
			style={{
				...getPosition(),
				pointerEvents: 'none',
			}}
		>
			<div
				ref={tooltipRef}
				className={`bg-ic-dark-300 rounded-md max-w-[23rem] ${(className ?? "")}`}
			>

				<div className="flex flex-row">

					{/* Tooltip icon */}

					<div className="flex items-center bg-ic-dark-000/75 rounded-l-md p-1">
						<ItemIcon
							item={item}
							canvas={true}
							size={16 * 4}
							padding={4}
							className="drop-shadow-black/80 drop-shadow-sm"
						/>
					</div>

					{/* Tooltip body */}

					<div className="flex flex-col px-2">

						{/* Name */}
						<div className="flex flex-col py-1 px-2">
							<div className="text-base font-semibold text-white text-center wrap-anywhere">
								{item.getLocalizedName()}
							</div>

							{ count !== undefined && (
								<div className="text-sm/3 mb-0.25 text-gray-300 text-center italic">
									{ count <= 0 ? (
										<span className="text-gray-400">Placeholder</span>
									) : (
										<>
											<span className="text-gray-400 mr-0.5">x</span>
											{ count.toLocaleString() }
										</>
									) }
								</div>
							) }
						</div>

						{/* Description */}
						{ hasDescription && (
							<>
								<div className='mb-0.5 flex-1 border-b-2 border-ic-dark-000/75'/>

								<div className="min-w-[16rem] max-w-full px-1 pb-0.5 text-base text-gray-200">
									{getItemDescription()}
								</div>
							</>
						) }

						{/* Health on consumption */}
						{ hasHealthOnConsume && (
							<>
								<div className='mb-1 flex-1 border-b-2 border-ic-dark-000/75'/>

								<div className="w-max">
									<span className="px-1 font-semibold text-gray-200 text-base">Food</span>

									<div className="flex items-center pb-1 px-2 text-gray-300 text-base">
										<SpriteIcon
											icon={SkillUtils.getSpriteIconId(Skill.Health, 32)}
											canvas={false}
											size={20}
											className="mr-2 drop-shadow-black/50 drop-shadow-sm select-none"
										/>
										Heals: <span className="ml-1.5 text-gray-200">{item.healthAppliedOnConsume.toLocaleString()}</span>
									</div>
								</div>
							</>
						)}

						{/* Skill boost */}
						{ (hasSkillBoost && item.skillBoost!.boostPercentage > 0) && (
							<>
								<div className='mb-1 flex-1 border-b-2 border-ic-dark-000/75'/>

								<div className="w-max">
									<span className="px-1 font-semibold text-gray-200 text-base">Skill Boost</span>

									<div className="flex items-center px-2 pb-1 text-gray-300">
										<SpriteIcon
											icon={SkillUtils.getSpriteIconId(item.skillBoost!.skill, 32)}
											canvas={false}
											size={20}
											className="mr-2 drop-shadow-black/50 drop-shadow-sm select-none"
										/>
										{Skill[item.skillBoost!.skill]}:
										<span className="ml-1 text-gray-200"> {item.skillBoost!.boostPercentage}%</span>
									</div>
								</div>
							</>
						) }

						{/* Combat boost */}
						{ (hasCombatBonus) && (
							<>
								{ !(hasSkillBoost && item.skillBoost!.boostPercentage > 0) && (
									<div className='mb-1 flex-1 border-b-2 border-ic-dark-000/75'/>
								) }

								<div className="flex flex-col">
									<span className="px-1 font-semibold text-gray-200 text-base">Combat Stats</span>

									<div className="flex flex-col pb-1 px-2">
										{ item.meleeBonus && (
											<div className="flex">
												<SpriteIcon
													icon={SkillUtils.getSpriteIconId(Skill.Rigour, 32)}
													canvas={false}
													size={20}
													className="drop-shadow-black/50 drop-shadow-sm select-none"
												/>

												{ getStatHTML(item.meleeBonus) }
											</div>
										)}

										{ item.archeryBonus && (
											<div className="flex">
												<SpriteIcon
													icon={SkillUtils.getSpriteIconId(Skill.Archery, 32)}
													canvas={false}
													size={20}
													className="drop-shadow-black/50 drop-shadow-sm select-none"
												/>
												{ getStatHTML(item.archeryBonus) }
											</div>
										)}

										{ item.magicBonus && (
											<div className="flex">
												<SpriteIcon
													icon={SkillUtils.getSpriteIconId(Skill.Magic, 32)}
													canvas={false}
													size={20}
													className="drop-shadow-black/50 drop-shadow-sm select-none"
												/>
												{ getStatHTML(item.magicBonus) }
											</div>
										)}

										{ item.attackInterval > 0 && item.attackStyle > AttackStyle.None ? (
											<div className="text-sm text-gray-300 flex justify-evenly">
												<div>
													<span className="text-gray-100">{AttackStyle[item.attackStyle]}</span>
													<span> / </span>
													<span className="text-gray-100">{(item.attackInterval / 1000)}</span>
													<span>s</span>
												</div>

												<div className="text-gray-300">
													{ item.twoHanded ? "Two-Handed" : "One-Handed" }
												</div>
											</div>
										) : null}
									</div>
								</div>
							</>
						) }

						{/* Item value & level requirement */}
						{ (item.baseValue || item.levelRequirement) && (
							<div className="flex flex-col h-full">

								<div className='mb-1.5 flex-1 border-b-2 border-ic-dark-000/75'/>

								<div className="w-full flex flex-row justify-between px-2 pb-1 whitespace-nowrap text-white/80">
									{item.levelRequirement && (
										<div className="flex items-center gap-1 italic text-sm">
											<SpriteIcon
												icon={SkillUtils.getSpriteIconId(item.levelRequirement.skill, 32)}
												canvas={false}
												size={20}
												className="drop-shadow-black/30 drop-shadow-sm select-none"
											/>
											<span className={!game.skill.hasLevel(item.levelRequirement) ? "text-ic-red-100!" : ""}>
												Lv. {item.levelRequirement.level}
											</span>
										</div>
									)}

									{item.baseValue && (
										<div className="ml-auto flex items-center gap-1 italic text-sm">
											{item.baseValue.toLocaleString()}
											<ItemIcon
												item={ItemDatabase.get(ItemDatabase.GOLD_ITEM_ID)}
												spriteSize={32}
												canvas={false}
												size={20}
												className="drop-shadow-black/30 drop-shadow-sm select-none"
											/>
										</div>
									)}
								</div>
							</div>
						)}

					</div>
				</div>
			</div>

			{ IdleClient.DEBUG_TOOLTIPS && (
				<div className="mt-2 p-1 bg-ic-dark-300 rounded-md font-jetbrains">
					<div className="flex justify-between px-1 text-gray-200">
						<span>NAME: {item.name}</span>
						<span>ID: {item.id}</span>
					</div>
				</div>
			) }
		</div>
	);

	return ReactDOM.createPortal(tooltip, document.body);
};

export default ItemTooltip;
