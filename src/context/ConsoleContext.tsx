import { createContext, ReactNode, useContext, useEffect } from "react";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { IdleClient } from "@idleclient/IdleClient.ts";
import { GameData } from "@idleclient/game/data/GameData.ts";

export enum LogType {
	DEBUG,
	INFO,
	WARNING,
	ERROR
}

export interface ConsoleMessage {
	text: string | ReactNode;
	timestamp: Date;
	type: LogType;
}

function parseConsoleLog(...args: any[]): string {
	if (args.length === 0) return '';

	let i = 1;
	const format = typeof args[0] === 'string' ? args[0] : '';
	let output = typeof format === 'string'
		? format.replace(/%[sdifoOc]/g, match => {
			if (i >= args.length) return match;
			const val = args[i++];
			switch (match) {
				case '%s': return String(val);
				case '%d':
				case '%i': return parseInt(val).toString();
				case '%f': return parseFloat(val).toString();
				case '%o':
				case '%O':
					try {
						return JSON.stringify(val);
					} catch {
						return '[object]';
					}
				case '%c': return '';
				default: return match;
			}
		})
		: String(args[0]);

	const extraArgs = args.slice(i).map(arg => {
		if (typeof arg === 'string') return arg;
		try {
			return JSON.stringify(arg);
		} catch {
			return String(arg);
		}
	});

	if (extraArgs.length > 0) {
		output += ' ' + extraArgs.join(' ');
	}

	return output;
}

interface ConsoleContextType {
	/**
	 * Whether the console is visible or not.
	 */
	visibleRef: SmartRef<boolean>;
	/**
	 * Set whether the console should be visible or not.
	 */
	setVisible: (value: boolean) => void;
	/**
	 * Toggle the console visibility.
	 */
	toggleConsole: () => void;
	/**
	 * The console messages.
	 */
	messagesRef: SmartRef<ConsoleMessage[]>;

	/**
	 * Write a debug message to the console.
	 */
	debug: (...text: (string | object | ReactNode)[]) => void;
	/**
	 * Write a info message to the console.
	 */
	log: (...text: (string | object | ReactNode)[]) => void;

	warn: (...text: (string | object | ReactNode)[]) => void;
	error: (...text: (string | object | ReactNode)[]) => void;

	/**
	 * Write a message to the console.
	 */
	write: (level: LogType, ...text: (string | object | ReactNode)[]) => void;

	/**
	 * Clear the console messages.
	 */
	clear: () => void;
	/**
	 * Execute a command in the console.
	 */
	executeCommand: (command: string) => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export const ConsoleProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
	const visibleRef = useSmartRef<boolean>(false);
	const messagesRef = useSmartRef<ConsoleMessage[]>([]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "F2") toggleConsole();
		};

		// Initial message.
		log(`Idle Client v${IdleClient.VERSION}`)

		// Too much spam...
		/*const originalWarn = console.warn;
		const originalError = console.error;

		console.warn = (...args) => {
			setTimeout(() => write(LogType.WARNING, ...args), 0);
			originalWarn(...args);
		}

		console.error = (...args) => {
			setTimeout(() => write(LogType.ERROR, ...args), 0);
			originalError(...args);
		}*/

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const setVisible = (value: boolean) => {
		visibleRef.setContent(value);
	};

	const toggleConsole = () => {
		visibleRef.setContent(!visibleRef.content());
	};

	const debug = (...text: (string | object | ReactNode)[]) => { write(LogType.DEBUG, ...text); }
	const warn = (...text: (string | object | ReactNode)[]) => { write(LogType.WARNING, ...text); }
	const error = (...text: (string | object | ReactNode)[]) => { write(LogType.ERROR, ...text); }

	const log = (...text: (string | object | ReactNode)[]) => {
		const message: string | ReactNode = parseConsoleLog(...text);
		console.log(`${LogType[LogType.INFO]}: ${message}`);

		const newMessage: ConsoleMessage = {
			text: message,
			timestamp: new Date(),
			type: LogType.INFO,
		};

		const messages = messagesRef.content();
		messages.push(newMessage);
		if (messages.length > 100)
			messages.shift();
		messagesRef.trigger();
	};

	const write = (type: LogType = LogType.INFO, ...text: (string | object | ReactNode)[]) => {
		let message: string | ReactNode = parseConsoleLog(...text);
		if (type === LogType.ERROR) console.error(`${LogType[type]}: ${message}`);
		else if (type === LogType.WARNING) console.warn(`${LogType[type]}: ${message}`);
		else console.log(`${LogType[type]}: ${message}`);

		if (type === LogType.DEBUG) message = <span className="text-[#c0c0c0]">{message}</span>
		else if (type === LogType.WARNING) message = <span className="text-orange-200">{message}</span>;
		else if (type === LogType.ERROR) message = <span className="text-red-300">{message}</span>;

		const newMessage: ConsoleMessage = {
			text: message,
			timestamp: new Date(),
			type: type,
		};

		const messages = messagesRef.content();
		messages.push(newMessage);
		if (messages.length > 100)
			messages.shift();
		messagesRef.trigger();
	};

	const clear = () => {
		messagesRef.setContent([]);
	};

	const executeCommand = (command: string) => {
		// Log the command
		log(`> ${command}`);

		// Parse the command
		const parts = command.trim().split(" ");
		const commandName = parts[0].toLowerCase();

		// Execute the command
		switch (commandName) {
			case "clear":
				clear();
				break;
			case "help":
				log("Available commands:\n" +
					"  clear - Clear the console\n" +
					"  help - Show this help message\n" +
					"  item [item id] - Show information about the provided item.\n" +
					"  debug-tooltips - Toggle debug tooltips, displaying internal item names.\n");
				break;
			case "item":
				if (parts.length < 2) {
					log("Usage: item [itemId]");
				} else {
					const itemId = parseInt(parts[1], 10);
					if (isNaN(itemId)) {
						log(`Invalid item ID: ${parts[1]}`);
					} else {
						const itemDef = GameData.items().item(itemId);
						if (itemDef.id === -1) {
							log(`Item with ID ${itemId} not found`);
						} else {
							log(`Item with ID ${itemId}: ${itemDef.name} / ${itemDef.getLocalizedName()} / ${itemDef.getLocalizedDescription()}`);
							log("", itemDef);
						}
					}
				}
				break;
			case "debug-tooltips":
				IdleClient.DEBUG_TOOLTIPS = !IdleClient.DEBUG_TOOLTIPS;
				log(`Debug tooltips ${IdleClient.DEBUG_TOOLTIPS ? "enabled" : "disabled"}`);
				break;
			default:
				log(`Unknown command: ${commandName}`, LogType.WARNING);
				break;
		}
	};

	return (
		<ConsoleContext.Provider value={{
			visibleRef,
			messagesRef,
			setVisible: setVisible,
			toggleConsole: toggleConsole,

			debug: debug,
			log: log,
			warn: warn,
			error: error,

			write: write,

			clear: clear,
			executeCommand: executeCommand
		}}>
			{children}
		</ConsoleContext.Provider>
	);
};

export const useConsole = () => {
	const context = useContext(ConsoleContext);
	if (context === undefined) throw new Error("useConsole must be used within a ConsoleProvider");
	return context;
};