import React, { useRef } from "react";

interface IdleUsernameInputProps {
	title?: string;
	placeholder?: string;

	value: string;
	onValueChange: (value: string) => void;

	titleClass?: string;
	inputClass?: string;
	className?: string;
}

export const IdleUsernameInput: React.FC<IdleUsernameInputProps> = ({
	title = "",
	placeholder = "placeholder text",

	value,
	onValueChange,

	titleClass = "",
	inputClass = "",
	className = "",
}) => {
	const idRef = useRef(Math.floor(Math.random() * 1_000_000_000));

	const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target.value;

		if (input.length === 0) {
			onValueChange(input);
			return;
		}

		if (!/^[a-zA-Z0-9]+$/.test(input)) return;
		if (input.length > 20) return;

		onValueChange(input);
	}

	const style = "bg-ic-light-500 border-2 border-ic-light-400/50 text-gray-100 placeholder:text-white/75";

	return (
		<div className={className}>
			<div className={`flex items-end justify-between`}>
				<label htmlFor={`playerName_${idRef.current}`} className={`block text-white/75 font-medium ${titleClass}`}>
					{ title }
				</label>
			</div>

			<input
				id={`playerName_${idRef.current}`}
				type="text"
				value={value}
				placeholder={placeholder}
				onChange={onUsernameChange}
				autoComplete="off"
				spellCheck={false}
				className={`w-full h-full px-3 py-1 ${style} text-xl rounded-sm focus:outline-none ${inputClass}`}
			/>
		</div>
	);
}