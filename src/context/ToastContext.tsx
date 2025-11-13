import React, { JSX, useContext, useLayoutEffect, useRef, useState } from "react";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";

const DEFAULT_DURATION = 5000;
const ANIMATION_TIME = 200;

export enum ToastType {
	NORMAL,
	WARNING,
	ERROR
}

interface ToastEntry {
	id: number;
	type?: ToastType;

	title?: JSX.Element | string;
	content: JSX.Element | string;
	onClick?: () => void;

	closeOnClick?: boolean;

	titleClass?: string;
	contentClass?: string;

	// Internal
	internal$removing?: () => void;
	internal$remove: () => void;
}

const Toast: React.FC<{
	entry: ToastEntry
}> = ({ entry }) => {
	const [exiting, setExiting] = useState(false);

	let containerStyle: string;
	let lineStyle: string;
	switch (entry.type ?? ToastType.NORMAL) {
		case ToastType.NORMAL:
			containerStyle = "bg-ic-light-500/85 hover:bg-ic-light-450/85";
			lineStyle = "bg-ic-light-300/35";
			break;
		case ToastType.WARNING:
			containerStyle = "bg-ic-orange-400/85 hover:bg-ic-orange-200/85";
			lineStyle = "bg-ic-orange-000/35";
			break;
		case ToastType.ERROR:
			containerStyle = "bg-ic-red-500/85 hover:bg-ic-red-400/85";
			lineStyle = "bg-ic-red-000/35";
			break;
		default:
			containerStyle = "bg-red-100";
			lineStyle = "bg-red-100";
			break;
	}

	entry.internal$removing = () => {
		setExiting(true);
	}

	return (
		<div
			className={`
			${containerStyle} p-2 rounded-md shadow-black/20 shadow-lg cursor-pointer transition-all duration-200 
			max-w-xs w-full group ${exiting ? "animate-toast-slide-out" : "animate-toast-slide-in"}
			`}

			onClick={event => {
				entry.onClick?.();
				if (entry.closeOnClick ?? true)
					entry.internal$remove();
			}}
		>
			{entry.title && (
				<>
					<p className={`px-1 text-xl font-semibold text-gray-100 group-hover:text-white ${entry.titleClass ?? ""}`}>
						{entry.title}
					</p>
					<div className={`h-0.5 mb-1 ${lineStyle}`}/>
				</>
			)}
			<p className={`px-1 text-gray-200 group-hover:text-gray-100 ${entry.contentClass ?? ""}`}>
				{entry.content}
			</p>
		</div>
	);
}

const ToastContainer: React.FC<{ entriesRef: SmartRef<ToastEntry[]> }> = ({ entriesRef }) => {
	const entries = useSmartRefWatcher(entriesRef);
	const toastRefs = useRef<Record<number, HTMLDivElement | null>>({});
	const [offsets, setOffsets] = useState<number[]>([]);

	useLayoutEffect(() => {
		const newOffsets: number[] = [];
		let cumulativeOffset = 0;

		for (let i = entries.length - 1; i >= 0; i--) {
			newOffsets[i] = cumulativeOffset;
			const el = toastRefs.current[entries[i].id];
			if (el) cumulativeOffset += el.offsetHeight + 8; // 8px gap
		}

		setOffsets(newOffsets);
	}, [entries]);

	return (
		<div className="fixed bottom-4 left-4 pr-4 z-50">
			{entries.map((entry, index) => (
				<div
					key={entry.id}
					ref={el => { toastRefs.current[entry.id] = el; }}
					className="w-max absolute transition-all duration-200 ease-in-out"
					style={{
						bottom: offsets[index] ?? 0,
					}}
				>
					<Toast entry={entry}/>
				</div>
			))}
		</div>
	);
}

type ToastTitle = JSX.Element | string | undefined | null;
type ToastContent = JSX.Element | string;
type ToastOptions = {
	type?: ToastType,
	duration?: number,
	onClick?: () => void,
	closeOnClick?: boolean,
	titleClass?: string,
	contentClass?: string
}

interface ToastContextType {
	show: (title: ToastTitle, content: ToastContent, options: ToastOptions & { type: ToastType }) => number;
	info: (title: ToastTitle, content: ToastContent, options?: ToastOptions) => number;
	warn: (title: ToastTitle, content: ToastContent, options?: ToastOptions) => number;
	error: (title: ToastTitle, content: ToastContent, options?: ToastOptions) => number;
	
	remove: (id: number) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const toastsRef = useSmartRef<ToastEntry[]>([]);

	const remove = (id: number) => {
		toastsRef.setContent(c => c.filter(e => e.id !== id));
	}

	const show = (
		title: ToastTitle,
		content: ToastContent,
		options: ToastOptions & { type: ToastType }
	): number => {
		title = title ?? undefined;
		const id = Date.now() + Math.floor(Math.random() * 10000);
		const duration = options?.duration ?? DEFAULT_DURATION;

		const stateInfo = {
			removed: false,
			removingTimeout: undefined as ReturnType<typeof setTimeout> | undefined,
			removeTimeout: undefined as ReturnType<typeof setTimeout> | undefined
		}
		
		const entry: ToastEntry = {
			id: id,
			type: options?.type ?? ToastType.NORMAL,
			
			title: title ?? undefined,
			content: content,
			onClick: options?.onClick,

			closeOnClick: options?.closeOnClick,
			titleClass: options?.titleClass,
			contentClass: options?.contentClass,

			// Internal
			internal$remove: () => {
				if (stateInfo.removed) return;
				stateInfo.removed = true;
				clearTimeout(stateInfo.removingTimeout);
				clearTimeout(stateInfo.removeTimeout);

				entry.internal$removing?.();
				setTimeout(() => remove(id), ANIMATION_TIME);
			}
		}

		if (duration > 0) {
			stateInfo.removingTimeout = setTimeout(() => {
				stateInfo.removed = true;
				entry.internal$removing?.()
			}, Math.max(0, duration - ANIMATION_TIME));
			stateInfo.removeTimeout = setTimeout(() => remove(id), duration);
		}

		toastsRef.setContent(c => [...c, entry]);

		return id;
	}
	
	const info = (title: ToastTitle, content: ToastContent, options?: ToastOptions) =>
		show(title, content, { ...options, type: ToastType.NORMAL });
	const warn = (title: ToastTitle, content: ToastContent, options?: ToastOptions) =>
		show(title, content, { ...options, type: ToastType.WARNING });
	const error = (title: ToastTitle, content: ToastContent, options?: ToastOptions) =>
		show(title, content, { ...options, type: ToastType.ERROR });

	return (
		<ToastContext.Provider value={{
			show: show,
			info: info,
			warn: warn,
			error: error,
			remove: remove
		}}>
			<ToastContainer entriesRef={toastsRef} />
			{children}
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error('useToast must be used within a ToastProvider');
	}
	return context;
};
