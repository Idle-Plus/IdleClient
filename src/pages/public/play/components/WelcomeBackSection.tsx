import React from "react";
import IdleClansLogo from "@assets/IdleClansLogo.svg";

interface WelcomeBackSectionProps {
	displayName: string;
	onConnect: () => void;
	onLogout: () => void;
}

const WelcomeBackSection: React.FC<WelcomeBackSectionProps> = ({
	displayName,
	onConnect,
	onLogout
}) => {
	return (
		<div className="max-w-lg mx-auto p-2 pb-4 space-y-4">

			{/* Logo */}
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

			{/* Content */}
			<div
				className="shadow-black/50 shadow-lg text-center"
			>

				{/* Title */}
				<div
					className="w-full py-2 pt-2.5 px-2 bg-ic-dark-200 border-b-4 border-b-black/60 border-1
					border-ic-dark-000 font-bold text-3xl text-white">
					Welcome back {displayName}!
				</div>

				{/* Body */}
				<div className="bg-ic-dark-500 border-1 border-ic-dark-200 border-t-0">

					<p className="p-4 text-lg text-gray-300">
						You are currently logged in, but not connected to the game. Do you want
						to continue to Idle Clans, or return back to the account selection page?
					</p>

					<div className="w-full flex flex-col md:flex-row gap-4 px-6 pb-4 items-center font-medium text-lg">

						<button
							className="w-full py-1.5 text-shadow-black/10 text-shadow-md text-white bg-ic-light-400
							hover:bg-ic-light-400/80 rounded-md"
							onClick={onConnect}
						>
							Connect to Idle Clans
						</button>

						<button
							className="w-full py-1.5 text-shadow-black/10 text-shadow-md text-white bg-ic-light-400
							hover:bg-ic-light-400/80 rounded-md"
							onClick={onLogout}
						>
							Account selection
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WelcomeBackSection;