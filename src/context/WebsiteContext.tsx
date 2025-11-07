import { createContext, useContext, useState, useEffect } from 'react';
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";

interface WebsiteContextType {
	/**
	 * If the sidebar is open or not.
	 */
	sidebarRef: SmartRef<boolean>;
	/**
	 * Set if the sidebar should be open or not.
	 */
	setSidebar: (value: boolean) => void;

	mobileRef: SmartRef<boolean>;
	pageWidthRef: SmartRef<number>;
	pageHeightRef: SmartRef<number>;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

export const WebsiteProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
	const MIN_WIDTH = 1024;

	const sidebarRef = useSmartRef(!localStorage.getItem("sidebarCollapsed")?.includes("false") || false);
	const mobileRef = useSmartRef(window.innerWidth < MIN_WIDTH);
	const pageWidthRef = useSmartRef(window.innerWidth);
	const pageHeightRef = useSmartRef(window.innerHeight);

	// Update mobile state when window size changes.
	useEffect(() => {
		const handleResize = () => {
			const value = window.innerWidth < MIN_WIDTH;
			if (value !== mobileRef.content()) mobileRef.setContent(value);
			pageWidthRef.setContent(window.innerWidth);
			pageHeightRef.setContent(window.innerHeight);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);

		// isMobile, pageWidth and pageHeight is a smart ref.
		// eslint-disable-next-line
	}, [MIN_WIDTH]);

	const setSidebar = (collapsed: boolean) => {
		sidebarRef.setContent(collapsed);
		localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
	};

	return (
		<WebsiteContext.Provider value={{
			sidebarRef: sidebarRef,
			setSidebar: setSidebar,

			mobileRef: mobileRef,
			pageWidthRef: pageWidthRef,
			pageHeightRef: pageHeightRef
		}}>
			{children}
		</WebsiteContext.Provider>
	);
};

export const useWebsite = () => {
	const context = useContext(WebsiteContext);
	if (context === undefined) {
		throw new Error('useWebsite must be used within a WebsiteProvider');
	}
	return context;
};