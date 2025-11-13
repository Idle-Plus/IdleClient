import React, { useRef } from "react";

interface IdleInputProps {
	title?: string;
	placeholder?: string;

	value: string;
	onValueChange: (value: string) => void;
	regex?: RegExp;

	disabled?: boolean;

	titleClass?: string;
	inputClass?: string;
	className?: string;
}

export const IdleInput: React.FC<IdleInputProps> = ({
	title = "",
	placeholder = "placeholder text",

	value,
	onValueChange,
	regex,

	disabled,

	titleClass = "",
	inputClass = "",
	className = "",
}) => {
	const idRef = useRef(Math.floor(Math.random() * 1_000_000_000));

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target.value;
		if (regex !== undefined && !regex.test(input)) return;
		onValueChange(input);
	}

	const style = disabled ?
		"bg-ic-light-700 border-2 border-ic-light-500/50 text-white/75 placeholder:text-white/50 cursor-not-allowed" :
		"bg-ic-light-500 border-2 border-ic-light-400/50 text-gray-100 placeholder:text-white/75";

	return (
		<div className={`${className}`}>
			<div className="flex items-end justify-between">
				<label htmlFor={`inputField_${idRef.current}`} className={`block text-white/75 font-medium ${titleClass}`}>
					{ title }
				</label>
			</div>

			<input
				id={`inputField_${idRef.current}`}
				type="text"
				value={value}
				placeholder={placeholder}
				onChange={onInputChange}
				disabled={disabled}
				autoComplete="off"
				spellCheck={false}
				className={`w-full h-full px-3 py-1 ${style} text-xl rounded-sm focus:outline-none ${inputClass}`}
			/>
		</div>
	);
}