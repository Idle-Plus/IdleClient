import React, { useState, useRef, useEffect } from "react";
import { useConsole } from "@context/ConsoleContext";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher";

const Console: React.FC = () => {
	const console = useConsole();

	const isVisible = useSmartRefWatcher(console.visibleRef);
	const messages = useSmartRefWatcher(console.messagesRef);
	const [input, setInput] = useState("");

	const inputRef = useRef<HTMLInputElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isVisible && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isVisible]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (isVisible && event.key === "Escape") {
				console.setVisible(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isVisible, console]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim()) {
			console.executeCommand(input);
			setInput("");
		}
	};

	if (!isVisible) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 z-50"
			onClick={() => console.setVisible(false)}
		>
			<div
				className="h-8/10 w-full flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>

				<div
					className="flex-1 flex flex-col-reverse bg-ic-dark-500 text-white p-2 overflow-y-auto dark-scrollbar font-jetbrains text-sm"
				>
					<div>
						{ messages.map((msg, index) => (
							<div key={index} className="flex flex-row mb-0.5 py-[1px] even:bg-ic-dark-300 odd:bg-ic-dark-200">
								<div className="text-gray-500 min-w-fit pr-2">[{msg.timestamp.toLocaleTimeString()}]</div>
								<div className="whitespace-pre-wrap wrap-anywhere">
									{ typeof msg.text === "string" ?
										msg.text.split("\n").map((line, lineIndex) => {
											return (
												<div key={lineIndex}>{line}</div>
											)
										}) : msg.text
									}
								</div>
							</div>
						)) }
					</div>
					<div ref={messagesEndRef}/>
				</div>

				<form onSubmit={handleSubmit} className="mt-2 flex pr-2">
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						className="flex-1 bg-ic-dark-100 text-white p-2 px-4 font-mono outline-none"
						placeholder="Enter command (type 'help' for available commands)"
					/>
					<button
						type="submit"
						className="bg-ic-light-500 text-white px-4 ml-2 outline-none"
					>
						Execute
					</button>
				</form>
			</div>
		</div>
	);
};

export default Console;
