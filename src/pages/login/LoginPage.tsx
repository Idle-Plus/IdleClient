import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "@context/UserContext.tsx";
import IdleClansLogo from "@assets/IdleClansLogo.png";
import { useLoading } from "@context/LoadingContext.tsx";

const LoginPage: React.FC = () => {
	const loadingBg = useLoading();
	const user = useUser();
	const navigate = useNavigate();


	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const loading = user.loading;

	if (user.isLoggedIn) {
		return <Navigate to="/" />;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (loading) return;
		setError("");

		if (password.length === 0) {
			setError("Please enter a password.");
			return;
		}

		if (email.length === 0) {
			setError("Please enter an email.");
			return;
		}

		try {
			loadingBg.set("loginPageSignIn", "Logging in", 10000);
			const result = await user.login(email, password);
			if (!result) {
				setError("Failed to login, is the email and password correct?");
				return;
			}

			navigate("/");
		} catch (e) {
			setError("An error occurred while processing your request");
		} finally {
			loadingBg.remove("loginPageSignIn");
		}
	};

	return (
		<div className="max-w-md mx-auto h-screen p-2">
			<div className="bg-(--color-darker) rounded-md shadow-lg mt-6">

				<div
					className="flex flex-col items-center gap-6 p-4 rounded-t-md bg-(--color-dark)
					border-b-(--color-darkest) border-b-4"
				>
					<img
						src={IdleClansLogo}
						alt="Idle Clans Logo"
						className="select-none drop-shadow-lg drop-shadow-black/40"
						style={{height: "7.5rem", pointerEvents: "none"}}
					/>
					{/*<img
						src={IdlePlusLogo}
						alt="Idle Plus Logo"
						className="select-none"
						style={{height: "8rem", pointerEvents: "none"}}
					/>*/}

					<h1 className="text-3xl font-bold text-center text-(--color-brighter)">Login to Idle Clans</h1>
				</div>

				{/*<div className='flex items-center w-full mb-4 mt-4'>
					<span className='flex-1 border-b-2 border-(--color-light)'></span>
				</div>*/}

				<div className="p-4">
					<p className="text-center text-(--color-bright) mb-6 pl-1 pr-1">
						Log in with your email and password. Your credentials are sent
						directly to PlayFab (the authentication provider used by Idle Clans)
						to get a session token, they are never sent to or stored by the relay server.
					</p>

					<div className='flex items-center w-full mb-4 mt-4'>
						<span className='flex-1 border-b-2 border-(--color-light)'></span>
					</div>

					<form onSubmit={handleSubmit} className="pl-1 pr-1">
						<div className="">
							<div className="flex flex-row justify-between">
								<label htmlFor="jwt" className="block text-(--color-bright) text-sm font-medium">
									Email
								</label>
							</div>
							<div className="flex flex-row gap-2">
								<input
									id="email"
									type="email"
									autoComplete="off"
									value={email}
									onChange={(e) => { setEmail(e.target.value); setError(""); }}
									className={`w-full p-2 bg-(--color-light-p) border-1 rounded-md text-(--color-bright)
							${error ? "border-red-400" : "border-(--color-light)"} focus:outline-none`}
									placeholder="Enter your email"
								/>
							</div>
							<div className="flex flex-row justify-between mt-1">
								<label htmlFor="jwt" className="block text-(--color-bright) text-sm font-medium">
									Password
								</label>
							</div>
							<div className="flex flex-row gap-2">
								<input
									id="password"
									type="password"
									autoComplete="off"
									value={password}
									onChange={(e) => { setPassword(e.target.value); setError(""); }}
									className={`w-full p-2 bg-(--color-light-p) border-1 rounded-md text-(--color-bright)
							${error ? "border-red-400" : "border-(--color-light)"} focus:outline-none`}
									placeholder="Enter your password"
								/>
							</div>
						</div>

						{error && (
							<p className=" text-red-400 text-sm">{error}</p>
						)}

						<button
							type="submit"
							disabled={loading || email.trim().length === 0}
							className={`mt-4 w-full text-(--color-brighter) font-medium py-2 px-4 rounded-md transition-colors ${
								loading || email.trim().length === 0
									? "bg-(--color-light) text-(--color-lighter)! cursor-not-allowed"
									: "bg-(--color-lighter) hover:bg-(--color-lighter-p) active:bg-(--color-lighter)"
							}`}
						>
							{loading ? "Logging in..." : "Login"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
