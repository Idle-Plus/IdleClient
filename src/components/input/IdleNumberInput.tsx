import React from "react";

interface IdleNumberInputProps {
	title?: string;
	placeholder?: string;

	value: number;
	onValueChange: (value: number) => void;
	min?: number;
	max?: number;

	titleClass?: string;
	inputClass?: string;
	className?: string;
}

export const IdleNumberInput: React.FC<IdleNumberInputProps> = ({
	title = "",
	placeholder = "placeholder text",

	value = 0,
	onValueChange,
	min,
	max,

	titleClass = "",
	inputClass = "",
	className = "",
}) => {
	const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const strInput = e.target.value;
		if (strInput.length === 0) {
			onValueChange(min !== undefined ? min : 0);
			return;
		}

		let input = parseInt(strInput);
		if (isNaN(input)) return;

		// if the number starts with a 0 and has another digit after it, remove the 0.
		if (strInput.startsWith("0") && strInput.length > 1) e.target.value = strInput.slice(1);

		if (min !== undefined && input < min) input = min;
		if (max !== undefined && input > max) input = max;

		onValueChange(input);
	}

	const style = "bg-ic-light-500 border-2 border-ic-light-400/50 text-gray-100 placeholder:text-white/75";

	return (
		<div className={className}>
			<div className={`flex items-end justify-between`}>
				<label htmlFor="numberInput" className={`block text-white/75 font-medium ${titleClass}`}>
					{ title }
				</label>
			</div>

			<input
				id="numberInput"
				type="number"
				placeholder={placeholder}
				value={value}
				onChange={onNumberChange}
				autoComplete="off"
				spellCheck={false}
				className={`w-full h-full px-3 py-1 ${style} text-xl rounded-sm focus:outline-none ${inputClass} 
				[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
				[&::-webkit-inner-spin-button]:appearance-none`}
			/>
		</div>
	);
}