import React, { JSX, useEffect, useState } from "react";
import { LuChevronsUpDown } from "react-icons/lu";
import AutoSizer from "react-virtualized-auto-sizer";

interface IdleDropdownProps<T> {
	values: { value: T, disabled?: boolean }[];
	selected?: number;

	label?: string;
	labelSelected?: boolean;

	allowDuplicateSelect?: boolean;
	onSelect?: (value: T, index: number) => void;
	canSelect?: (value: T, index: number) => boolean;

	dropdownColor?: string;
	dropdownColorHover?: string;
	dropdownColorActive?: string;
	dropdownClass?: string;

	entryColor?: string;
	entryColorHover?: string;
	entryColorActive?: string;
	entryTextColor?: string;
	entryTextColorHover?: string;
	entryTextColorActive?: string;
	entryContainerColor?: string;
	entryClass?: string;

	createElement?: (entry: { value: T, disabled?: boolean }, index: number) => JSX.Element;
	createLabel?: (entry?: { value: T, disabled?: boolean }, index?: number) => any;
}

export const IdleDropdown = <T,>({
	values,
	selected,

	label = "Dropdown",
	labelSelected = false,

	allowDuplicateSelect = false,
	onSelect,
	canSelect = () => true,

	dropdownColor = "bg-ic-light-500",
	dropdownColorHover = "hover:bg-ic-light-450",
	dropdownColorActive = "bg-ic-light-450",
	dropdownClass,

	entryColor = "bg-ic-light-450",
	entryColorHover = "hover:bg-ic-light-400",
	entryColorActive = "bg-ic-light-400",
	entryTextColor = "text-white/80",
	entryTextColorHover = "hover:text-white",
	entryTextColorActive = "text-white",
	entryContainerColor = "bg-ic-light-600",
	entryClass,

	createElement,
	createLabel = (entry) => {
		if (!entry || !labelSelected) return label;
		return entry.value as any;
	},
}: IdleDropdownProps<T>) => {
	const [dropdownId, _] = useState("idle-dropdown-" + Math.floor(Math.random() * 100000).toString(16));
	const [open, setOpen] = useState(false);
	//const [currentlySelected, setCurrentlySelected] = useState<number | undefined>(selected);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (open && event.target instanceof Element && !event.target.closest("." + dropdownId)) {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [open, dropdownId]);

	const handleSelect = (value: T, index: number) => {
		if (!allowDuplicateSelect && selected === index) return;
		if (canSelect && !canSelect(value, index)) return;
		setOpen(false);
		onSelect?.(value, index);
		//setCurrentlySelected(index);
	}

	createElement = createElement ?? ((entry: { value: any, disabled?: boolean }, index: number) => {
		if (entry?.disabled) return (
			<div
				key={index}
				className={`rounded-md w-full px-2 py-1 text-left bg-ic-red-500 ${entryClass}`}
			>
				{entry.value}
			</div>
		);

		const activeStyle = selected === index ?
			`${entryColorActive} ${entryTextColorActive}` :
			`${entryColor} ${entryColorHover} ${entryTextColor} ${entryTextColorHover}`;
		const entryStyle = `transition-colors duration-100 ${activeStyle}`;

		return (
			<button
				key={index}
				onClick={() => handleSelect(entry.value, index)}
				className={`w-full px-2 py-1 text-left rounded-md ${entryStyle} ${entryClass}`}
			>
				{entry.value}
			</button>
		);
	});

	const style = `transition-colors duration-200 ${open ? dropdownColorActive : dropdownColor} ${dropdownColorHover} text-gray-100`;

	return (
		<div className={`${dropdownId} w-full`}>
			<button
				onClick={() => setOpen(!open)}
				className={`w-full flex items-center justify-between px-4 py-2 text-lg rounded-md cursor-pointer ${style} ${dropdownClass}`}
			>
				{ createLabel(
					selected === undefined ? undefined : values[selected],
					selected ?? undefined
				) }
				<span className="ml-2"><LuChevronsUpDown /></span>
			</button>

			{open && (
				<AutoSizer>
					{({width}) =>
						<div
							className={`absolute z-10 mt-1 min-w-fit ${entryContainerColor} rounded-md shadow-black/50 shadow-sm 
							max-h-64 flex flex-col p-1 space-y-1 whitespace-nowrap select-none overflow-y-auto ic-scrollbar`}
							style={{width: width}}
						>
							{values.map((entry, index) =>
								createElement(entry, index)
							)}
							{/*<div
								className={`max-h-64 flex flex-col p-1 space-y-1 whitespace-nowrap select-none overflow-y-auto ic-scrollbar`}
							>
								{values.map((entry, index) =>
									createElement(entry, index)
								)}
							</div>*/}
						</div>
					}
				</AutoSizer>
			)}
		</div>
	)
}

/*
<>
	{ loadout?.locked ? (
		<div
			key={i}
			className="rounded-md w-full px-2 py-1 text-left bg-ic-red-500"
		>
			{loadout.name}
		</div>
	) : (
		<button
			key={i}
			onClick={() => {
				setIsDropdownOpen(false);
				// TODO: Handle select
			}}
			className="rounded-md w-full px-2 py-1 text-left bg-ic-orange-500
					hover:bg-ic-orange-600"
		>
			{loadout.name}
		</button>
	) }
</>
*/