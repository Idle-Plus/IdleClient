import React, { useEffect, useLayoutEffect, useRef } from "react";

interface AutoResizeTextareaProps {
	value: string;
	onChange: (value: string) => void;

	placeholder?: string;
	rows?: number;
	maxLength?: number;
	className?: string;
}

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
	value,
	onChange,
	placeholder,
	rows,
	maxLength,
	className = ""
}) => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	useLayoutEffect(() => {
		const textarea = textareaRef.current;
		if (textarea === null) return;
		textarea.style.height = "auto";
		textarea.style.height = textarea.scrollHeight + "px";
	}, [value]);

	return (
		<textarea
			ref={textareaRef}
			value={value}
			placeholder={placeholder}
			onChange={e => onChange(e.target.value)}
			rows={rows}
			maxLength={maxLength}
			className={`resize-none ${className}`}
		/>
	);
}

export default AutoResizeTextarea;