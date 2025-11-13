import React from "react";
import { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { IdleInputState } from "@components/input/IdleInputState.ts";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";

interface IdleButtonProps {
	title: string;
	className?: string;
	disabled?: boolean;
	onClick?: () => void;

	inputState?: SmartRef<IdleInputState>,

	bgColor?: string;
	bgColorHover?: string;
	bgColorActive?: string;
	bgColorDisabled?: string;
	textColor?: string;
	textColorHover?: string;
	textColorDisabled?: string;
	textSize?: string;

	children?: React.ReactNode;
}

export const IdleButton: React.FC<IdleButtonProps> = ({
	title,
	className,
	disabled = false,
	onClick,

	inputState,

	bgColor = "bg-ic-light-500",
	bgColorHover = "hover:bg-ic-light-400/85",
	bgColorActive = "active:bg-ic-light-400/85",
	bgColorDisabled = "bg-ic-light-700",

	textColor = "text-gray-100",
	textColorHover = "hover:text-white",
	textColorDisabled = "text-gray-300/95",
	textSize = "text-xl",

	children,
}) => {
	// We're good, hopefully, as the inputState should NEVER change.
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const state = inputState ? useSmartRefWatcher(inputState) : undefined;
	disabled = state ? !state.valid : disabled;

	className = className ?? "";
	const style = !disabled ?
		`${textColor} ${textColorHover} ${bgColor} ${bgColorHover} ${bgColorActive} cursor-pointer` :
		`${textColorDisabled} ${bgColorDisabled}`

	return (
		<button
			className={`px-4 py-2 rounded-full select-none transition-colors duration-100 whitespace-nowrap ${textSize} ${style} ${className}`}
			onClick={onClick}

			disabled={disabled}
		>
			{title}
			{children}
		</button>
	);
}