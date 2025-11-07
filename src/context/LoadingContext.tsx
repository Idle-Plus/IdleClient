import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import IdleClansLogo from "@assets/IdleClansLogo.svg"
import React, { useEffect, useRef, useState } from "react";

/*
 * LoadingComponent
 */

const LoadingComponent: React.FC<{ entriesRef: SmartRef<Map<string, { time: number, title: string | undefined }>> }> = ({ entriesRef }) => {
	const FADE_IN_DELAY = 200;
	const FADE_OUT_DELAY = 100;

	const [isVisible, setIsVisible] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const lastTitleRef = useRef("");

	const entries = useSmartRefWatcher(entriesRef);
	const currentEntry = entries.entries().next().value;

	// Handle the fade in and out animations.
	useEffect(() => {
		const shouldBeVisible = currentEntry !== undefined && entries.size > 0;

		if (shouldBeVisible && !isVisible) {
			setShouldRender(true);
			const timer = setTimeout(() => setIsVisible(true), 50);
			return () => clearTimeout(timer);
		}

		if (!shouldBeVisible) {
			setIsVisible(false);
			const timer = setTimeout(() => setShouldRender(false), FADE_OUT_DELAY);
			return () => clearTimeout(timer);
		}
	}, [currentEntry, entries.size, isVisible]);



	// Handle timed out entries.
	useEffect(() => {
		const handle = setInterval(() => {
			const entries = entriesRef.content();
			let updated = false;

			for (const [id, entry] of entries) {
				if (entry.time < Date.now()) {
					entries.delete(id);
					updated = true;
				}
			}

			if (!updated) {
				// Check if a loader is stuck.
				if (currentEntry && entries.size <= 0) {
					entriesRef.trigger();
				}
				return;
			}
			entriesRef.trigger();
		}, 1000);

		return () => clearInterval(handle);
	});

	useEffect(() => {
		const setScrollLock = (lock: boolean) => {
			document.body.style.overflow = lock ? "hidden" : "";
			document.body.style.height = lock ? "100%" : "";
		};

		if (entries.size > 0) setScrollLock(true);
		else setScrollLock(false);
		return () => setScrollLock(false);
	}, [entries.size]);


	if (!shouldRender) return null;

	if (currentEntry?.[1].title) lastTitleRef.current = currentEntry?.[1].title;
	const title = currentEntry?.[1].title ?? lastTitleRef.current;

	return (
		<div
			className={`fixed flex items-center justify-center w-full h-full bg-black/33 opacity-0
			transition-opacity ease-in-out z-[10000] inset-0 ${isVisible ? "opacity-100!" : ""}`}

			style={ isVisible ?
				{ pointerEvents: "auto", userSelect: "none", transitionDuration: `${FADE_IN_DELAY}ms` } :
				{ pointerEvents: "none", transitionDuration: `${FADE_OUT_DELAY}ms` }
			}

			onKeyDown={(e) => {
				if (e.key !== "F5") e.preventDefault();
			}}
			tabIndex={-1}
		>
			<div className="flex flex-col items-center gap-2 text-white">
				<div className="">
					{/* Inner spinner */}
					<div className="fixed border-8 w-24 h-24 border-gray-700 rounded-full"/>
					<div className="w-24 h-24 border-8 border-white border-b-transparent rounded-full animate-spin">
						<img className="p-4 select-none" src={IdleClansLogo} alt="Loading" style={{pointerEvents: "none"}} />
					</div>
				</div>
				<div className="flex flex-col items-center gap-0 h-fit">
					{ title && title.split("\n").map((line, i) => <div key={i}>{line}</div>) }
				</div>
			</div>
		</div>
	)
}

/*
 * LoadingContext
 */

export interface LoadingContextType {
	/**
	 * Check if we're currently loading. Optionally provide the id of the
	 * loading entry to check.
	 */
	is: (id?: string) => boolean;
	/**
	 * Set a loading entry. An optional title and timeout can be provided.
	 *
	 * If a title isn't provided, then a generic "loading" title will be used
	 * instead.
	 *
	 * The timeout is used as a fallback in case the loading takes too long
	 * or the system forgot to remove their loading entry. If set to a
	 * negative number, then the entry will never time out. Defaults to 5
	 * seconds.
	 */
	set: (id: string, title?: string, timeout?: number) => void;
	/**
	 * Update the title of a loading entry.
	 */
	update: (id: string, title: string) => void;
	/**
	 * Remove a loading entry.
	 */
	remove: (id: string) => void;
}

const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined);

interface LoadingContextProps {
	children: React.ReactNode;
}

export const LoadingProvider = ({ children }: LoadingContextProps) => {
	/**
	 * The entries responsible for the loading, and optionally their timeout
	 * timestamp.
	 *
	 * The timestamp is a fallback used in case the loading takes too long or
	 * the system forgot to remove their loading entry. Defaults to 5 seconds.
	 */
	const loadingEntriesRef = useSmartRef(new Map<string, { time: number, title: string | undefined }>);

	const is = (id?: string) => {
		if (id === undefined) return loadingEntriesRef.content().size > 0;
		return loadingEntriesRef.content().has(id);
	}

	const set = (id: string, title?: string, timeout?: number) => {
		if (timeout === undefined) timeout = 5000;
		title = title ?? "Loading";
		if (timeout < 0) timeout = Infinity;
		timeout = Date.now() + timeout;

		loadingEntriesRef.content().set(id, { time: timeout, title: title });
		loadingEntriesRef.trigger();
	}

	const update = (id: string, title: string) => {
		const entry = loadingEntriesRef.content().get(id);
		if (!entry) return;
		loadingEntriesRef.content().set(id, { ...entry, title: title });
		loadingEntriesRef.trigger();
	}

	const remove = (id: string) => {
		if (!loadingEntriesRef.content().delete(id)) return;
		loadingEntriesRef.trigger();
	}

	return (
		<LoadingContext.Provider value={{ is, set, update, remove }}>
			<LoadingComponent entriesRef={loadingEntriesRef} />
			{children}
		</LoadingContext.Provider>
	)
}

export const useLoading = () => {
	const context = React.useContext(LoadingContext);
	if (context === undefined) {
		throw new Error('useLoading must be used within a LoadingProvider');
	}
	return context;
}