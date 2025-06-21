import React from "react";
import { Navigate } from "react-router-dom";
import { SessionContextType, StoredAccountInfo, useSession } from "@context/SessionContext.tsx";
import IdleClansLogo from "@assets/IdleClansLogo.svg";
import { LoadingContextType, useLoading } from "@context/LoadingContext.tsx";
import { ErrorType, GameMode } from "@idleclient/network/NetworkData.ts";
import { ModalContextType, useModal } from "@context/ModalContext.tsx";
import EditAccountModal from "@pages/public/play/modals/EditAccountModal.tsx";
import AddAccountModal from "@pages/public/play/modals/AddAccountModal.tsx";
import useSmartRefWatcher from "@hooks/smartref/useSmartRefWatcher.ts";
import { GameContextType, GameState, useGame } from "@context/GameContext.tsx";
import { PlayFabSession } from "@idleclient/types/playFabTypes.ts";
import GenericTextModal from "@components/modal/GenericTextModal.tsx";
import GenericConfirmationModal from "@components/modal/GenericConfirmationModal.tsx";
import { useWebsite } from "@context/WebsiteContext.tsx";
import { DesktopAccountsSection, MobileAccountsSection } from "@pages/public/play/components/AccountsSection.tsx";
import NewsSection from "@pages/public/play/components/NewsSection.tsx";
import FooterLinks from "@pages/public/play/components/FooterLinks.tsx";
import WelcomeBackSection from "@pages/public/play/components/WelcomeBackSection.tsx";

// TODO: Fetch news from either a file, or an API/URL.
// Placeholder news posts.
const NEWS_POSTS: {
	title: string;
	content: string | React.ReactNode;
	type: string;
	date: string;
	link?: {
		name: string;
		link: string;
	};
	className?: string;
}[] = [
	{
		title: "Patch 1.2.6",
		content: "Resolved UI glitches on smaller screens and improved load times across all platforms.",
		type: "Patch",
		date: "6/13/2025",
		link: { name: "Changelog", link: "https://github.com/Idle-Plus/IdleClient" },
	},
	{
		title: "Patch 1.2.5",
		content: "Adjusted weapon balance and resolved a bug causing crashes when loading saved games.",
		type: "Patch",
		date: "6/12/2025",
		link: { name: "Changelog", link: "https://github.com/Idle-Plus/IdleClient" },
	},
	{
		title: "Patch 1.2.4",
		content: "Tweaked player movement responsiveness for smoother controls and fixed a rare issue where achievements wouldn’t unlock properly. Also improved network stability during multiplayer sessions.",
		type: "Patch",
		date: "6/11/2025",
		link: { name: "Changelog", link: "https://github.com/Idle-Plus/IdleClient" },
	},
	{
		title: "Patch 1.2.3",
		content: "Fixed enemy AI getting stuck on corners and improved performance during boss fights.",
		type: "Patch",
		date: "6/10/2025",
		link: { name: "Changelog", link: "https://github.com/Idle-Plus/IdleClient" },
	},
]

const PlayPage: React.FC = () => {
	const modals = useModal();
	const loading = useLoading();
	const website = useWebsite();
	const sessions = useSession();
	const game = useGame();

	const mobile = useSmartRefWatcher(website.pageWidthRef) < 1024;
	const gameState = useSmartRefWatcher(game.gameState);
	const storedAccounts = useSmartRefWatcher(sessions.storedAccounts);

	// Special handling if we're already logged in.
	if (sessions.isLoggedIn) {
		console.log("Is logged in!");

		// Redirect to the game if we're connected to the server.
		if (gameState === GameState.PLAY) return <Navigate to="/game"/>;
		// If we're waiting on the game to connect, then show the logo.
		if (gameState !== GameState.NONE && gameState !== GameState.READY) return (
			<div className="max-w-lg mx-auto p-2 pb-4 space-y-6">
				<div className="space-y-3 pt-4 drop-shadow-lg drop-shadow-black/40 select-none">
					<img
						src={IdleClansLogo}
						alt="Idle Clans Logo"
						className="h-[5rem] mx-auto"
						style={{pointerEvents: "none"}}
					/>
					<div className="text-center text-white">
						<div className="font-bold text-3xl/7">Idle Client</div>
						<div className="text-lg text-gray-100">An unofficial web based Idle Clans client</div>
					</div>
				</div>
			</div>
		);

		// We aren't connected, but we're logged in, so last ask if they want to
		// connect or go back to the login screen.
		return (
			<WelcomeBackSection
				displayName={sessions.session?.displayName ?? "Unknown"}
				onConnect={() => {
					if (sessions.session === undefined) return;
					connectToGame(modals, game, sessions.session!);
				}}
				onLogout={() => sessions.logout()}
			/>
		)
	}

	let defaultAccounts = storedAccounts.filter(v => v.mode === GameMode.Default ||
		v.mode === undefined);

	// Limit default mode to 3 accounts.
	if (defaultAccounts.length > 3) {
		defaultAccounts = defaultAccounts.filter(account =>
			account.mode === undefined || (account.mode === GameMode.Default &&
				defaultAccounts.filter(a => a.mode === GameMode.Default).indexOf(account) < 3)
		);
	}

	const accountsByType = {
		[GameMode.NotSelected]: [],
		[GameMode.Default]: defaultAccounts,
		[GameMode.Ironman]: storedAccounts.filter(v => v.mode === GameMode.Ironman),
		[GameMode.GroupIronman]: storedAccounts.filter(v => v.mode === GameMode.GroupIronman)
	}

	const onForgetAccount = (account: StoredAccountInfo) => {
		const updated = sessions.storedAccounts.content().filter(v => !(v.email === account.email));
		sessions.storedAccounts.setContent(updated);
		sessions.updateStoredAccounts();
	};

	const onEditAccount = (account: StoredAccountInfo) => {
		modals.openModal("edit-account",
			<EditAccountModal
				accountInfo={{ email: account.email, description: account.description ?? "" }}
				onSave={description => {
					const desc = description.trim();
					account.description = desc.length > 0 ? desc : undefined;
				}}
			/>
		);
	}

	const onLoginToAccount = (account: StoredAccountInfo) => {
		if (account.password === undefined) {
			modals.openModal("login-account",
				<AddAccountModal
					providedEmail={account.email}
					onLogin={(email, password, remember) =>
						loginFromModal(game, sessions, loading, modals, email, password, remember)}
					onRegister={(username, email, password, remember) =>
						registerFromModal(game, sessions, loading, modals, username, email, password, remember)}
				/>
			)
			return;
		}

		loginFromAccount(game, sessions, loading, modals, account.email, account.password);
	}

	const onAddAccount = () => {
		modals.openModal("add-account",
			<AddAccountModal
				onLogin={(email, password, remember) =>
					loginFromModal(game, sessions, loading, modals, email, password, remember)}
				onRegister={(username, email, password, remember) =>
					registerFromModal(game, sessions, loading, modals, username, email, password, remember)}
			/>
		)
	}

	return (
		<div className="max-w-6xl mx-auto p-2 pb-4 space-y-4">

			<div className="space-y-3 pt-4 drop-shadow-lg drop-shadow-black/40 select-none">
				<img
					src={IdleClansLogo}
					alt="Idle Clans Logo"
					className="h-[5rem] mx-auto"
					style={{pointerEvents: "none"}}
				/>
				<div className="text-center text-white">
					<div className="font-bold text-3xl/7">Idle Client</div>
					<div className="text-lg text-gray-100">An unofficial web based Idle Clans client</div>
				</div>
			</div>

			{/* Accounts */}
			<div className="flex flex-col items-center lg:flex-row lg:items-stretch justify-evenly gap-4 px-4">

				{ mobile ? (
					<MobileAccountsSection
						accountsByType={accountsByType}
						onEditAccount={onEditAccount}
						onForgetAccount={onForgetAccount}
						onLoginToStored={onLoginToAccount}
						onAddAccount={onAddAccount}
					/>
				) : (
					<DesktopAccountsSection
						accountsByType={accountsByType}
						onEditAccount={onEditAccount}
						onForgetAccount={onForgetAccount}
						onLoginToStored={onLoginToAccount}
						onAddAccount={onAddAccount}
					/>
				) }
			</div>

			<NewsSection newsPosts={NEWS_POSTS} />

			<FooterLinks />

		</div>
	);
};

const connectToGame = (
	modals: ModalContextType,
	game: GameContextType,
	session: PlayFabSession
) => {
	game.connect(session).then(result => {
		if (result.success) {
			game.gameState.setContent(GameState.PLAY);
			return;
		}

		// We failed to connect, handle the error.
		console.log("Failed to connect, reason: ", result);

		if (result.error === undefined) {
			modals.openModal("loginPage$error",
				<GenericTextModal
					title="Failed to connect"
					message="Couldn't establish a connection to the server, please try again in a minute."
				/>
			)
		}

		if (result.error !== undefined) {
			const error = result.error;
			const errorName = ErrorType[error];

			switch (error) {
				case ErrorType.AlreadyLoggedIn: {
					modals.openModal("loginPage$error",
						<GenericConfirmationModal
							title="Already connected"
							message="This account is already connected to Idle Clans! Would you like to log the
							currently connected client out?\n\nYou'll be able to log in on this client afterwards
							(after a possible small delay)."
							onConfirm={() => {
								game.connectForceLogin();
							}}
							onDecline={() => {
								game.disconnect();
							}}

							closeable={false}
						/>
					)
					break;
				}
				case ErrorType.OutdatedClient: {
					modals.openModal("loginPage$error",
						<GenericTextModal
							title="Outdated client"
							message="The client is currently outdated, please check back later."
						/>
					)
					break;
				}
				case ErrorType.ConfigMismatch: {
					modals.openModal("loginPage$error",
						<GenericTextModal
							title="Config mismatch"
							message="The client and server data are out of sync, please check back later.
							// TODO: automatically update the data?"
						/>
					)
					break;
				}
				default: {
					modals.openModal("loginPage$error",
						<GenericTextModal
							title="Error"
							message={`Failed to connect to the server, received error: ${errorName}, please report this.`}
						/>
					)
					break;
				}
			}

			// Disconnect if the error isn't that we're already logged in.
			if (error !== ErrorType.AlreadyLoggedIn) game.disconnect();
		}
	}).catch(err => {
		console.error("Failed to connect! Error: ", err);
	});
}

const loginFromAccount = (
	game: GameContextType,
	sessions: SessionContextType,
	loading: LoadingContextType,
	modals: ModalContextType,

	email: string,
	password: string
) => {
	loginFromModal(game, sessions, loading, modals, email, password, false).then(result => {
		if (result.success) return;

		modals.openModal(
			"login-account",
			<AddAccountModal
				providedEmail={email}
				providedError={result.message ?? "Failed to login"}
				onLogin={(mail, pass, remember) => loginFromModal(game, sessions, loading, modals, mail, pass, remember)}
				onRegister={async () => { return { success: false } } }
			/>
		)
	});
}

const loginFromModal = async (
	game: GameContextType,
	sessions: SessionContextType,
	loading: LoadingContextType,
	modals: ModalContextType,

	email: string,
	password: string,
	remember: boolean
): Promise<{ success: boolean, message?: string }> => {
	if (game.gameState.content() !== GameState.NONE) {
		console.warn("Tried to login while in game. Ignoring.");
		return Promise.resolve({success: false, message: "Can't login while in game."});
	}

	loading.set("loginPage$signIn", "Logging in", -1);
	game.gameState.setContent(GameState.READY);

	try {
		const loginResult = await sessions.login(email, password);

		if (!loginResult.success || !loginResult.session) {
			game.gameState.setContent(GameState.NONE);
			return {success: false, message: loginResult.message ?? "Failed to login"};
		}

		const session = loginResult.session;
		const entry = sessions.storedAccounts.content()
			.find(v => v.email === email);

		if (entry) {
			// Update the display name and optionally set the password.
			entry.name = session.displayName;
			if (remember) entry.password = password;
			sessions.updateStoredAccounts();
		} else {
			// Create a new account entry and store it.
			const account: StoredAccountInfo = {
				name: session.displayName,
				email: email
			}

			if (remember) account.password = password;
			sessions.storedAccounts.setContent([...sessions.storedAccounts.content(), account]);
			sessions.updateStoredAccounts();
		}

		connectToGame(modals, game, session);

		return {success: true};
	} finally {
		loading.remove("loginPage$signIn");
	}
}

const registerFromModal = async (
	game: GameContextType,
	sessions: SessionContextType,
	loading: LoadingContextType,
	modals: ModalContextType,

	username: string,
	email: string,
	password: string,
	remember: boolean
): Promise<{ success: boolean, message?: string }> => {
	if (game.gameState.content() !== GameState.NONE) {
		console.warn("Tried to login while in game. Ignoring.");
		return Promise.resolve({success: false, message: "Can't login while in game."});
	}

	game.gameState.setContent(GameState.READY);
	loading.set("loginPage$register", "Registering", -1);

	try {
		const loginResult = await sessions.register(username, email, password);

		if (!loginResult.success || !loginResult.session) {
			game.gameState.setContent(GameState.NONE);
			return {success: false, message: loginResult.message ?? "Failed to register"};
		}

		const session = loginResult.session;
		const account: StoredAccountInfo = {
			name: session.displayName,
			email: email
		}

		if (remember) account.password = password;
		sessions.storedAccounts.setContent([...sessions.storedAccounts.content(), account]);
		sessions.updateStoredAccounts();

		connectToGame(modals, game, session);

		return {success: true};
	} finally {
		loading.remove("loginPage$register");
	}
}

export default PlayPage;