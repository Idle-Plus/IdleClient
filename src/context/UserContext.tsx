import { login as PlayFabAPI$Login } from "../api/PlayFabAPI.ts";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useStateRef } from "@hooks/useStateRef.ts";
import { PlayFabSession } from "@idleclient/types/playFabTypes.ts";

interface UserContextType {
	session: PlayFabSession | null;
	loading: boolean;
	isLoggedIn: boolean;

	login: (email: string, password: string) => Promise<boolean>;
	logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
	children: React.ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
	const [session, setSession] = useState<PlayFabSession | null>(null);
	const [loading, setLoading, loadingRef] = useStateRef(true);

	// On page load, see if we have a session in local storage.
	useEffect(() => {
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

	const login = async (email: string, password: string) => {
		if (loadingRef.current) throw new Error("Cannot login while loading");
		setLoading(true);

		const result = await PlayFabAPI$Login(email, password);
		if (!result.success) {
			setLoading(false);
			return false;
		}

		const stringified = JSON.stringify(result.session);
		const encoded = btoa(stringified);
		localStorage.setItem("pf:session", encoded);

		setSession(result.session);
		setLoading(false);
		return true;
	}

	const logout = () => {
		localStorage.removeItem("pf:session");
		setSession(null);
		setLoading(false);
	}

	return (
		<UserContext.Provider value={{
			session: session,
			loading: loading,
			isLoggedIn: session !== null,
			login: login,
			logout: logout
		}}>
			{children}
		</UserContext.Provider>
	);
}

// eslint-disable-next-line
export const useUser = () => {
	const context = useContext(UserContext);
	if (!context) throw new Error("useUser must be used within a UserProvider");
	return context;
}