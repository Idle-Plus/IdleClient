import React, { useState } from "react";
/*import { Network } from "../../../../code/network/Network.ts";
import { useUser } from "../../../context/UserContext.tsx";*/
import { Navigate } from "react-router-dom";
import { useUser } from "@context/UserContext.tsx";

const Index = () => {
	const user = useUser();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	/*const startNetwork = () => {
		Network.connect();
	}*/

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		user.login(email, password);

		try {
			//user.login(email, password);
			/*setLoading(true);
			const result = await login(email, password);
			setLoading(false);*/

			/*if (!result.success) {
				alert("Login failed");
				return;
			}

			console.log(result);
			const session = result.data;
			console.log(session);

			// Send the session ticket to the server
			const packet = {
				"name": "Uraxys",
				"ticket": session
			}

			Network.data(JSON.stringify(packet));*/
		} catch (error) {
			console.error(error);
		}
	}

	if (user.isLoggedIn) {
		return (
			<Navigate to="/" />
		)
	}

	return (
		<div className="flex items-start justify-center">
			<div className="w-full max-w-lg">

				{/*<button onClick={startNetwork}>
					Connect to the server
				</button>*/}

				<form onSubmit={handleLogin} className="bg-white p-5 mt-20 rounded-md">
					<h2 className="text-3xl font-bold text-gray-700 text-center mb-6">Login with Idle Clans</h2>

					{/* TODO: Remove later */}
					{ user.isLoggedIn && (
						<div className="mb-4 bg-green-200 p-2 text-lg border border-green-300 rounded-sm">
							You are already logged in as {user.session?.displayName}
						</div>
					)}

					<div className="mb-4">
						<label className="block font-bold text-gray-600">Email</label>
						<input
							className="w-full px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500"
							type="email"
							required={true}
							disabled={loading}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>

					<div className="mb-4">
						<label className="block font-bold text-gray-600">Password</label>
						<input
							className="w-full px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500"
							type="password"
							required={true}
							disabled={loading}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					<div className="mb-4 bg-orange-100 p-2 text-lg border border-orange-200 rounded-sm">
						Your password and email is never shared with us,
						and is only sent to the authentication endpoint used by Idle Clans.
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className={loading ?
								"w-full bg-gray-400 text-white py-2 px-4 rounded-sm" :
								"w-full bg-blue-500 text-white py-2 px-4 rounded-sm hover:bg-blue-700"
							}
						>
							Login
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default Index;