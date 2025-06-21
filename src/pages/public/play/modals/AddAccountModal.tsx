import React, { useState } from "react";
import { BaseModalProps } from "@components/modal/BaseModal.tsx";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

interface AddAccountModalProps extends BaseModalProps {
	providedEmail?: string;
	providedError?: string;

	onLogin: (email: string, password: string, remember: boolean) => Promise<{ success: boolean, message?: string }>;
	onRegister: (username: string, email: string, password: string, remember: boolean) => Promise<{ success: boolean, message?: string }>;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({active, onClose, providedEmail, providedError, onLogin, onRegister}) => {
	const [isMouseDown, setIsMouseDown] = useState(false);
	const [showEmail, setShowEmail] = useState(providedEmail === undefined);
	const [showPassword, setShowPassword] = useState(false);
	const [showRepeatPassword, setShowRepeatPassword] = useState(false);
	const [creating, setCreating] = useState(false);

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState(providedEmail ?? "");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [remember, setRemember] = useState(false);

	const [error, setError] = useState<string | null>(providedError ?? null);
	const [nameError, setNameError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [repeatPasswordError, setRepeatPasswordError] = useState<string | null>(null);

	if (!active) return null;

	let isActionPossible = true;
	if (creating) {
		if (username.length < 3 || username.length > 20) isActionPossible = false;
		if (!/^[a-zA-Z0-9]+$/.test(username)) isActionPossible = false;
		if (email.length === 0) isActionPossible = false;
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) isActionPossible = false;
		if (password.length < 6 || password.length > 100) isActionPossible = false;
		if (repeatPassword.length === 0) isActionPossible = false;
		if (repeatPassword !== password) isActionPossible = false;
	} else {
		if (email.length === 0) isActionPossible = false;
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) isActionPossible = false;
		if (password.length < 6 || password.length > 100) isActionPossible = false;
	}

	const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUsername(value);
		setNameError(null);
		if (value.length === 0) return;

		if (value.length < 3 || value.length > 20) {
			setNameError("Username must be between 3 and 20 characters");
		}

		if (!/^[a-zA-Z0-9]+$/.test(value)) {
			setNameError("Username can only contain letters and numbers");
		}
	}

	const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmail(value);
		setEmailError(null);
		if (value.length === 0) return;

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
			setEmailError("Invalid email address");
		}
	}

	const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPassword(value);
		setPasswordError(null);
		if (value.length === 0) return;

		if (value.length < 6 || value.length > 100) {
			setPasswordError("Password must be between 6 and 100 characters");
		}
	}

	const onRepeatPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setRepeatPassword(value);
		setRepeatPasswordError(null);
		if (value.length === 0) return;

		if (value !== password) {
			setRepeatPasswordError("Passwords do not match");
		}
	}

	// Login to an account

	const handleLogin = async () => {
		const result = await onLogin(email, password, remember);
		if (result.success) {
			onClose?.();
			return;
		}
		setError(result.message ?? "Failed to login");
	}

	// Register an account

	const handleRegister = async () => {
		const result = await onRegister(username, email, password, remember);
		if (result.success) {
			onClose?.();
			return;
		}
		setError(result.message ?? "Failed to register");
	}

	// Handle closing logic

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.target !== e.currentTarget) return;
		setIsMouseDown(true);
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && isMouseDown) onClose?.();
		setIsMouseDown(false);
	};

	return (
		<div
			className="fixed inset-0 bg-[#00000080] flex flex-col justify-evenly items-center z-50 p-4"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseLeave={() => setIsMouseDown(false)}
		>
			<div
				className="w-full h-fit bg-ic-dark-500 max-w-md overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div
					className="flex justify-between items-center mb-2 px-4 md:px-6 pt-3 pb-2 bg-ic-dark-200
						border-b-4 border-b-black/60 border-1 border-ic-dark-000"
				>
					<span className="text-3xl font-bold text-white">{ creating ? "Register" : "Login" }</span>
					<button
						onClick={onClose}
						className="text-ic-red-200 hover:text-ic-red-300"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 cursor-pointer" fill="none"
						     viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
							      d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</button>
				</div>

				<div className="pb-3 px-4 md:px-6">

					<p className="text-lg text-gray-300 mb-6 px-1">
						Your credentials are sent directly to PlayFab (the authentication provider
						used by Idle Clans) to get a session token, they are never sent to or stored
						by the relay server.
					</p>

					{ !creating ? (
						<>
							{/* Email */}
							<div className="mb-1">
								<div className="flex items-baseline justify-between">
									<label htmlFor="email" className="block text-white/75 font-medium">
										Email Address
									</label>
									{ emailError && <span className="pr-1 text-red-400 text-xs">{ emailError }</span> }
								</div>

								<div className="relative">
									<input
										id="email"
										type={ providedEmail && !showEmail ? "password" : "email" }
										value={ providedEmail !== undefined ? providedEmail : email }
										disabled={ providedEmail !== undefined }
										required={true}
										placeholder="Enter your email"
										className="w-full px-3 py-2 bg-ic-dark-200 text-white border
										border-ic-dark-000 focus:outline-none"
										onChange={(e) => onEmailChange(e)}
									/>

									{ providedEmail && (
										<button
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 text-white/75 hover:text-white"
											onClick={() => setShowEmail(!showEmail)}
										>
											{showEmail ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
										</button>
									) }
								</div>
							</div>

							{/* Password */}
							<div className="mb-2">
								<div className="flex items-baseline justify-between">
									<label htmlFor="password" className="block text-white/75 font-medium">
										Password
									</label>
									{ passwordError && <span className="pr-1 text-red-400 text-xs">{ passwordError }</span> }
								</div>

								<div className="relative">
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										value={password}
										required={true}
										placeholder="Enter your password"
										className="w-full px-3 py-2 bg-ic-dark-200 text-white border
										border-ic-dark-000 focus:outline-none"
										onChange={(e) => onPasswordChange(e)}
									/>
									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2 text-white/75 hover:text-white"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
									</button>
								</div>
							</div>

							{/* Remember me */}
							<div className="flex items-center mb-6 px-0.5">
								<input
									id="remember"
									type="checkbox"
									className="w-5 h-5 rounded-full text-red-300 accent-ic-dark-500"
									checked={remember}
									onChange={(e) => setRemember(e.target.checked)}
								/>
								<label htmlFor="remember" className="ml-2 text-white/75">
									Remember password
								</label>
							</div>

							{ error && (
								<div className="mb-1 text-red-400 px-1">
									{error}
								</div>
							) }

							{/* Login */}
							<div className="mb-4">
								<button
									className={`w-full px-4 py-2 text-xl/6 rounded-md transition-colors ${
										isActionPossible ? 
											"text-white bg-ic-light-400 hover:bg-ic-light-400/80 cursor-pointer" : 
											"text-gray-400 bg-ic-light-500/50 cursor-not-allowed"
									}`}
									disabled={!isActionPossible}
									onClick={handleLogin}
								>
									Login
								</button>
							</div>
						</>
					) : (
						<>
							{/* Username */}
							<div className="mb-2">
								<div className="flex items-baseline justify-between">
									<label htmlFor="username" className="block text-white/75 font-medium">
										Username
									</label>
									{ nameError && <span className="pr-1 text-red-400 text-xs">{ nameError }</span> }
								</div>

								<input
									id="username"
									type="text"
									value={username}
									placeholder="Choose your username"
									className="w-full px-3 py-2 bg-ic-dark-200 text-white border
									border-ic-dark-000 focus:outline-none"
									onChange={(e) => onUsernameChange(e)}
								/>
							</div>

							{/* Email */}
							<div className="mb-2">
								<div className="flex items-baseline justify-between">
									<label htmlFor="email" className="block text-white/75 font-medium">
										Email Address
									</label>
									{ emailError && <span className="pr-1 text-red-400 text-xs">{ emailError }</span> }
								</div>

								<input
									id="email"
									type="email"
									value={email}
									placeholder="Enter your email"
									className="w-full px-3 py-2 bg-ic-dark-200 text-white border
									border-ic-dark-000 focus:outline-none"
									onChange={(e) => onEmailChange(e)}
								/>
							</div>

							{/* Password */}
							<div className="mb-1">
								<div className="flex items-baseline justify-between">
									<label htmlFor="password" className="block text-white/75 font-medium">
										Password
									</label>
									{ (passwordError || repeatPasswordError) && (
										<span className="pr-1 text-red-400 text-xs">
											{ passwordError !== null ? passwordError : repeatPasswordError }
										</span>
									) }
								</div>

								<div className="relative">
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										value={password}
										autoComplete="new-password"
										placeholder="Enter your password"
										className="w-full px-3 py-2 bg-ic-dark-200 text-white border
										border-ic-dark-000 focus:outline-none"
										onChange={(e) => onPasswordChange(e)}
									/>
									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2 text-white/75 hover:text-white"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}
									</button>
								</div>
							</div>

							{/* Confirm password */}
							<div className="mb-2">
								<div className="relative">
									<input
										id="confirmPassword"
										type={showRepeatPassword ? "text" : "password"}
										value={repeatPassword}
										autoComplete="new-password"
										placeholder="Confirm your password"
										className="w-full px-3 py-2 bg-ic-dark-200 text-white border
										border-ic-dark-000 focus:outline-none"
										onChange={(e) => onRepeatPasswordChange(e)}
									/>
									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2 text-white/75 hover:text-white"
										onClick={() => setShowRepeatPassword(!showRepeatPassword)}
									>
										{showRepeatPassword ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}
									</button>
								</div>
							</div>

							{/* Remember me */}
							<div className="flex items-center mb-6 px-0.5">
								<input
									id="remember"
									type="checkbox"
									className="w-5 h-5 rounded-full text-red-300 accent-ic-dark-500"
									checked={remember}
									onChange={(e) => setRemember(e.target.checked)}
								/>
								<label htmlFor="remember" className="ml-2 text-white/75">
									Remember password
								</label>
							</div>

							{ error && (
								<div className="mb-1 text-red-400 px-1">
									{error}
								</div>
							) }

							{/* Register */}
							<div className="mb-4">
								<button
									className={`w-full px-4 py-2 text-xl/6 rounded-md transition-colors ${
										isActionPossible ?
											"text-white bg-ic-light-400 hover:bg-ic-light-400/80 cursor-pointer" :
											"text-gray-400 bg-ic-light-500/50 cursor-not-allowed"
									}`}
									disabled={!isActionPossible}
									onClick={handleRegister}
								>
									Register
								</button>
							</div>
						</>
					)}

					{/* Register / Forgot password */}
					<div className="flex justify-between text-lg text-gray-300 underline select-none">
						{ !providedEmail && (
							<div
								className="hover:text-white transition-colors cursor-pointer"
								onClick={() => setCreating(!creating)}
							>
								{creating ? "Login with an existing account" : "Create an account"}
							</div>
						) }

						{!creating && (
							<div
								className={`hover:text-white transition-colors cursor-pointer ${providedEmail ? "ml-auto" : ""}`}
							>
								Forgot password?
							</div>
						)}
					</div>
				</div>
			</div>

			<div/>
		</div>
	);
}

export default AddAccountModal;