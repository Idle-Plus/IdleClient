import BaseModal, { BaseModalProps } from "@components/modal/BaseModal.tsx";
import { ItemStack } from "@idleclient/types/gameTypes.ts";
import React, { useState } from "react";
import { ItemDatabase } from "@idleclient/game/data/item/ItemDatabase.ts";
import { ItemIcon, SpriteIcon } from "@components/icon";
import { ItemDefinition } from "@idleclient/game/data/item/ItemDefinition.ts";
import { AttackStyle, EquipmentSlot, GameMode, ItemActivatableType, Skill } from "@idleclient/network/NetworkData.ts";
import { TextUtils } from "@idleclient/utils/TextUtils.tsx";
import { SkillUtils } from "@idleclient/game/utils/SkillUtils.ts";
import { LocalizationDatabase } from "@idleclient/game/data/LocalizationDatabase.ts";
import { GameContextType, useGame } from "@context/GameContext.tsx";
import { IdleButton } from "@components/input/IdleButton.tsx";
import { IdleNumberInput } from "@components/input/IdleNumberInput.tsx";
import { toKMB } from "@idleclient/game/utils/numberUtils.ts";

interface ItemInteractionModalProps extends BaseModalProps {
	item: ItemStack,
}

const ItemDisplay = React.memo(({ game, item, count }: { game: GameContextType, item: ItemDefinition, count: number }) => {

	const getCombatBoost = (skill: Skill, entry: { accuracy: number, strength: number, defence: number }) => {
		const statClass = (value: number) => {
			if (value < 0) return "text-stat-negative";
			if (value > 0) return "text-stat-positive";
			return "text-stat-neutral";
		}

		const stat = (value: number) =>
			value > 0 ? "+" + value : value;

		return (
			<div className="flex pr-1 not-first:border-t-2 not-first:pt-1 border-dashed border-ic-dark-100/85">
				<SpriteIcon
					icon={SkillUtils.getSpriteIconId(skill, 32)}
					canvas={false}
					size={24}
					className="drop-shadow-black/50 drop-shadow-sm select-none"
				/>

				<div className="w-full grid grid-cols-3 pl-1 text-[0.95rem] text-white">
					<div className={`ml-auto ${statClass(entry.strength)}`}>
						{stat(entry.strength)} STR
					</div>
					<div className={`ml-auto ${statClass(entry.accuracy)}`}>
						{stat(entry.accuracy)} ACC
					</div>
					<div className={`ml-auto ${statClass(entry.defence)}`}>
						{stat(entry.defence)} DEF
					</div>
				</div>
			</div>
		);
	}

	const description = item.getLocalizedDescription(game);
	const hasDescription = description !== null && description.trim() !== "";
	const hasHealthOnConsume = item.healthAppliedOnConsume > 0;
	const hasSkillBoost = item.skillBoost !== null;
	const hasCombatBonus = item.meleeBonus !== null || item.archeryBonus !== null || item.magicBonus !== null ||
		item.attackInterval > 0 || item.twoHanded || item.attackStyle !== AttackStyle.None;

	return (
		<div className="w-full flex flex-col xs:flex-row bg-ic-dark-300 rounded-md shadow-black/20 shadow-md">

			{/* Icon */}
			<div className="w-full xs:w-fit flex justify-center items-center bg-ic-dark-000/75 rounded-t-md xs:rounded-t-none xs:rounded-l-md p-1">
				<ItemIcon
					item={item}
					canvas={true}
					size={22 * 4}
					padding={4}
					className="drop-shadow-black/80 drop-shadow-sm"
				/>
			</div>

			{/* Content */}
			<div className="w-full flex flex-col px-2">

				{/* Item Name */}
				<div className="py-1 px-2">
					<div className="font-semibold text-xl text-white text-center wrap-anywhere">
						{ item.getLocalizedName() }

						{ count > 0 && (
							<div className="text-base/3 mb-0.25 text-gray-300 text-center italic">
								<>
									<span className="text-gray-400 mr-0.5">x</span>
									{ count.toLocaleString() }
								</>
							</div>
						) }
					</div>
				</div>

				{/* Description */}
				{ hasDescription && (
					<>
						<div className='mb-0.5 flex-1 border-b-2 border-ic-dark-000/75'/>
						<div className="max-w-full px-1 pb-0.5 text-base text-gray-200">
							{ TextUtils.getStyledMessage(description, { appendPeriod: true }) }
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
									size={24}
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
									size={24}
									className="mr-2 drop-shadow-black/50 drop-shadow-sm select-none"
								/>
								{ LocalizationDatabase.get(Skill[item.skillBoost!.skill].toLowerCase()) }:
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
								{ item.meleeBonus && (getCombatBoost(Skill.Rigour, item.meleeBonus)) }
								{ item.archeryBonus && (getCombatBoost(Skill.Archery, item.archeryBonus)) }
								{ item.magicBonus && (getCombatBoost(Skill.Magic, item.magicBonus)) }

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
										size={24}
										className="drop-shadow-black/50 drop-shadow-sm select-none"
									/>
									<span className={!game.skill.hasLevel(item.levelRequirement) ? "text-ic-red-100!" : ""}>
										Requires Lv. {item.levelRequirement.level}
									</span>
								</div>
							)}

							{ (item.baseValue || !item.canNotBeTraded) && (
								<div className="w-full flex flex-col items-end gap-y-0.75 italic text-sm">
									{ item.baseValue && (
										<div className="flex gap-1">
											{item.baseValue.toLocaleString()}
											<ItemIcon
												item={ItemDatabase.item(ItemDatabase.GOLD_ITEM_ID)}
												spriteSize={32}
												size={20}
												canvas={false}
												className="drop-shadow-black/30 drop-shadow-sm select-none"
											/>
										</div>
									) }

									{ !item.canNotBeTraded && (
										<div className="flex gap-1">
											{ item.getMarketPrice()?.sell?.toLocaleString() ?? "N/A" }
											<SpriteIcon
												icon={"auction_house_32"}
												canvas={false}
												size={20}
												className="drop-shadow-black/30 drop-shadow-sm select-none"
											/>
										</div>
									) }
								</div>
							) }
						</div>
					</div>
				)}
			</div>
		</div>
	);
}, (prevProps, nextProps) => {
	return prevProps.item.id === nextProps.item.id;
});

// Buttons

const PotionDrinkButton = ({
	game,
	itemDef,
	selected,
}: { game: GameContextType, item: ItemStack, itemDef: ItemDefinition, selected: number }) => {
	if (itemDef.activatableType !== ItemActivatableType.Potion) return null;

	const time = ItemDatabase.getPotionTime(itemDef, game) * selected;
	const days = Math.floor(time / 86400);
	const hours = Math.floor((time % 86400) / 3600);
	const minutes = Math.floor((time % 3600) / 60);
	const seconds = time % 60;

	let timeResult = "";
	if (days > 0) timeResult += `${days}D `;
	if (hours > 0) timeResult += `${hours}H `;
	if (minutes > 0) timeResult += `${minutes}M `;
	if (seconds > 0) timeResult += `${seconds}S`;

	return (
		<IdleButton
			title={`Drink (${timeResult.trim()})`}
			bgColor="bg-ic-orange-300"
			bgColorHover="hover:bg-ic-orange-200"
			bgColorActive="active:bg-ic-orange-200"
			textColor="text-gray-200"
			className="w-full"
		/>
	);
}

const SellButton = ({
	onClose,
	game,
	item,
	itemDef,
	selected,
}: { onClose?: () => void, game: GameContextType, item: ItemStack, itemDef: ItemDefinition, selected: number }) => {
	if (itemDef.canNotBeSoldToGameShop) return null;
	if (item.count < 1) return null;

	const value = ItemDatabase.getSellValue(itemDef, game) * selected;
	const title = value === 0 ? "Delete" : `Sell for ${toKMB(value, { minK: 100_000, locale: null })}`;

	return (
		<IdleButton
			title={title}
			onClick={() => {
				game.inventory.network.sellItem(item.id, selected);
				onClose?.();
			}}
			bgColor="bg-ic-red-500"
			bgColorHover="hover:bg-ic-red-400"
			bgColorActive="active:bg-ic-red-400"
			textColor="text-gray-200"
			className="w-full"
		/>
	);
}

// Modal

export const ItemInteractionModalId = "ItemInteractionModal";
export const ItemInteractionModal: React.FC<ItemInteractionModalProps> = ({ active, onClose, item }) => {
	const itemDef = ItemDatabase.item(item.id);
	const game = useGame();

	const [selected, setSelected] = useState(1);

	return (
		<BaseModal
			active={active}
			onClose={onClose}
			className="p-4"
		>
			<div className="relative w-full max-w-lg flex flex-col gap-2 overflow-y-auto ic-scrollbar-nr">
				<div className="p-4 space-y-4 bg-ic-dark-500 rounded-md">

					<ItemDisplay game={game} item={itemDef} count={item.count} />

					{/* Amount Selection */}
					{ item.count > 1 && (
						<div className="space-y-2">
							<div className="grid grid-cols-[3fr_1fr] items-center gap-4">
								<input
									type="range"
									min="1"
									max={item.count}
									value={selected}
									onChange={(e) => setSelected(Number(e.target.value))}
									className="w-full h-2 ic-slider"
								/>
								<IdleButton
									title="Max"
									disabled={selected === item.count}
									onClick={() => setSelected(item.count)}
									className="px-3! xs:px-8! rounded-md!"
								/>
							</div>
							<div className="grid grid-cols-[2fr_1fr_1fr] gap-2">
								<IdleNumberInput
									value={selected}
									onValueChange={value => setSelected(value)}
									min={1}
									max={item.count}
								/>
								<IdleButton
									title="-1"
									disabled={selected <= 1}
									onClick={() => setSelected(prev => Math.max(prev - 1, 1))}
									className="px-3! xs:px-6! rounded-md!"
								/>
								<IdleButton
									title="+1"
									disabled={selected >= item.count}
									onClick={() => setSelected(prev => Math.min(prev + 1, item.count)) }
									className="px-3! xs:px-6! rounded-md!"
								/>
							</div>

							<div className='flex-1 mt-4 border-b-2 border-ic-dark-200'/>
						</div>
					) }

					{/* Buttons */}
					<div className="space-y-4">
						<PotionDrinkButton game={game} item={item} itemDef={itemDef} selected={selected} />

						{ itemDef.healthAppliedOnConsume > 0 && (
							<IdleButton
								title={`Eat (+${itemDef.healthAppliedOnConsume.toLocaleString()} HP)`}
								bgColor="bg-ic-orange-300"
								bgColorHover="hover:bg-ic-orange-200"
								bgColorActive="active:bg-ic-orange-200"
								textColor="text-gray-200"
								className="w-full"
							/>
						) }

						{ itemDef.equipmentSlot !== EquipmentSlot.None && (
							<IdleButton
								title="Equip"
								textColor="text-gray-200"
								className="w-full"
							/>
						) }

						{ (!itemDef.canNotBeTraded || itemDef.tradeableWithClan) && (
							<>
								{ !itemDef.canNotBeTraded ? (
									// Tradeable and can be traded with clan
									<div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
										<IdleButton
											title="Send to clan vault"
											disabled={game.clan.clan.content() === null}
											textColor="text-gray-200"
											className="w-full"
										/>
										<IdleButton
											title="Send to player"
											textColor="text-gray-200"
											className="w-full"
										/>
									</div>
								) : (
									// Only tradeable with clan
									<IdleButton
										title="Send to clan vault"
										textColor="text-gray-200"
										className="w-full"
									/>
								) }
							</>
						) }

						{ (!itemDef.canNotBeTraded && game.player.mode.content() === GameMode.Default) && (
							<IdleButton
								title="Create sell offer"
								textColor="text-gray-200"
								className="w-full"
							/>
						) }

						<IdleButton
							title="Wiki page"
							onClick={() => {
								// open the wiki page.
								const url = "https://wiki.idleclans.com/index.php/";
								const itemName = itemDef.getLocalizedName();
								window.open(url + itemName.replace(" ", "_"), "_blank");
							}}
							textColor="text-gray-200"
							className="w-full"
						/>

						<SellButton onClose={onClose} game={game} item={item} itemDef={itemDef} selected={selected} />
					</div>
				</div>
			</div>
		</BaseModal>
	);
}