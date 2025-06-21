import { login as PlayFabAPI$Login, register as PlayFabAPI$Register } from "../api/PlayFabAPI.ts";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useStateRef } from "@hooks/useStateRef.ts";
import { PlayFabSession } from "@idleclient/types/playFabTypes.ts";
import useSmartRef, { SmartRef } from "@hooks/smartref/useSmartRef.ts";
import { GameMode } from "@idleclient/network/NetworkData.ts";

export interface StoredAccountInfo {
	name: string;
	email: string;
	password?: string | undefined;

	mode?: GameMode | undefined;
	description?: string | undefined;

	lastTotalLevel?: number | undefined;
	lastOnline?: number | undefined;
	lastTask?: string | undefined;
	timeFetched?: number | undefined;
}

export interface SessionContextType {
	loading: boolean;
	storedAccounts: SmartRef<StoredAccountInfo[]>
	session: PlayFabSession | null;
	isLoggedIn: boolean;

	register: (username: string, email: string, password: string) => Promise<{ success: boolean, message?: string, session?: PlayFabSession }>;
	login: (email: string, password: string) => Promise<{ success: boolean, message?: string, session?: PlayFabSession }>;
	logout: () => void;
	updateStoredAccounts: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface UserProviderProps {
	children: React.ReactNode;
}

export const SessionProvider = ({ children }: UserProviderProps) => {
	// pf = PlayFab

	const _storedAccountsInfoRef = useSmartRef<StoredAccountInfo[]>([]);
	const [session, setSession] = useState<PlayFabSession | null>(null);
	const [loading, setLoading, loadingRef] = useStateRef(true);

	// On page load, see if we have a session in local storage.
	useEffect(() => {
		// Load stored accounts.
		const accounts = localStorage.getItem("pf:accounts");
		if (accounts) {
			const decoded = atob(accounts);
			const parsed = JSON.parse(decoded);
			_storedAccountsInfoRef.setContent(parsed);
		}

		// Load current session.
		const session = localStorage.getItem("pf:session");
		if (!session) {
			setLoading(false);
			return;
		}

		const decoded = atob(session);
		const parsed = JSON.parse(decoded);

		// Check if the expiration date is in the past
		const expiration = new Date(parsed.expiration);
		if (expiration < new Date()) {
			localStorage.removeItem("pf:session");
			setLoading(false);
			return;
		}

		setSession(parsed);
		setLoading(false);
		return;
		// setLoading is a state variable, so it's safe to ignore the warning here.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const register = async (
		username: string,
		email: string,
		password: string
	): Promise<{ success: boolean, message?: string, session?: PlayFabSession }> => {
		if (loadingRef.current) throw new Error("Cannot register while loading");
		setLoading(true);

		const result = await PlayFabAPI$Register(username, email, password);
		if (!result.success) {
			setLoading(false);
			return { success: false, message: result.message };
		}

		const stringified = JSON.stringify(result.session);
		const encoded = btoa(stringified);
		localStorage.setItem("pf:session", encoded);

		setSession(result.session);
		setLoading(false);
		return { success: true, session: result.session };
	}

	const login = async (
		email: string,
		password: string
	): Promise<{ success: boolean, message?: string, session?: PlayFabSession }> => {
		if (loadingRef.current) throw new Error("Cannot login while loading");
		setLoading(true);

		const result = await PlayFabAPI$Login(email, password);
		if (!result.success) {
			setLoading(false);
			return { success: false, message: "Invalid username or password" };
		}

		const stringified = JSON.stringify(result.session);
		const encoded = btoa(stringified);
		localStorage.setItem("pf:session", encoded);

		setSession(result.session);
		setLoading(false);
		return { success: true, session: result.session };
	}

	const logout = () => {
		localStorage.removeItem("pf:session");
		setSession(null);
		setLoading(false);
	}

	const updateStoredAccounts = () => {
		const accounts = _storedAccountsInfoRef.content();
		const encoded = btoa(JSON.stringify(accounts));
		localStorage.setItem("pf:accounts", encoded);
	}

	return (
		<SessionContext.Provider value={{
			storedAccounts: _storedAccountsInfoRef,
			session: session,
			loading: loading,

			isLoggedIn: session !== null,
			register: register,
			login: login,
			logout: logout,
			updateStoredAccounts: updateStoredAccounts,
		}}>
			{children}
		</SessionContext.Provider>
	);
}

// eslint-disable-next-line
export const useSession = () => {
	const context = useContext(SessionContext);
	if (!context) throw new Error("useUser must be used within a UserProvider");
	return context;
}