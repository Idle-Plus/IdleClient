import React from "react";

interface IdleToggleSwitchProps {
	state?: boolean;
	onToggle?: () => void;
	disabled?: boolean;
}

export const IdleToggleSwitch: React.FC<IdleToggleSwitchProps> = ({
	state = false,
	onToggle,
	disabled = false,
}) => {
	return (
		<label className="flex items-center cursor-pointer">
			<div className="relative">
				<input
					type="checkbox"
					className="sr-only"
					checked={state}
					onChange={onToggle}
					disabled={disabled}
				/>
				<div
					className={`w-16 h-8 rounded-full transition-colors duration-200 ease-in-out ${
						state ? 'bg-ic-light-400' : 'bg-gray-500'
					} ${disabled ? 'opacity-50' : ''}`}
				/>
				<div
					className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-all duration-200 ease-in-out ${
						state ? 'transform translate-x-8' : 'transform translate-x-0'
					}`}
				/>
			</div>
		</label>
	);
};
