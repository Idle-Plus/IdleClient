import React, { useState } from "react";

export const NotInClanView: React.FC<{
	totalLevel: number,
	gold: number,
	onCreateClan: (name: string) => void,
	onJoinClan: (name: string, message: string) => void
}> = ({ totalLevel, gold, onCreateClan, onJoinClan }) => {

	return null;

	/*const [selectedOption, setSelectedOption] = useState<'create' | 'join' | null>(null);
	const [clanName, setClanName] = useState("");
	const [applicationMessage, setApplicationMessage] = useState("");
	const [showApplicationPopup, setShowApplicationPopup] = useState(false);

	const topClans = [
	];

	const canCreateClan = totalLevel >= 100 && gold >= 10000;

	const handleCreateClan = () => {
		if (!canCreateClan) return;
		if (!clanName.trim()) return;
		onCreateClan(clanName);
	};

	const handleJoinClanClick = () => {
		if (!clanName.trim()) return;
		setShowApplicationPopup(true);
	};

	const handleSubmitApplication = () => {
		onJoinClan(clanName, applicationMessage);
		setShowApplicationPopup(false);
		setClanName("");
		setApplicationMessage("");
	};

	return (
		<div className="flex flex-col max-w-7xl mx-auto h-full p-4">
			<div className="bg-ic-dark-500/75 p-4 mb-4">
				<h1 className="text-2xl text-white font-bold mb-2">Clan</h1>
				<p className="text-gray-300">Join an existing clan or create your own.</p>
			</div>

			<div className="flex gap-4 mb-4">
				<button
					className={`px-4 py-2 ${
						selectedOption === 'create'
							? "text-white bg-ic-light-500"
							: "text-gray-300 hover:bg-ic-light-500/50 hover:text-gray-200 bg-ic-dark-500/75"
					}`}
					onClick={() => setSelectedOption('create')}
				>
					Create Clan
				</button>
				<button
					className={`px-4 py-2 ${
						selectedOption === 'join'
							? "text-white bg-ic-light-500"
							: "text-gray-300 hover:bg-ic-light-500/50 hover:text-gray-200 bg-ic-dark-500/75"
					}`}
					onClick={() => setSelectedOption('join')}
				>
					Join Clan
				</button>
			</div>

			{selectedOption === 'create' && (
				<div className="bg-ic-dark-500/75 p-4 mb-4">
					<h2 className="text-xl text-white mb-2">Create a Clan</h2>
					{!canCreateClan && (
						<div className="text-red-400 mb-2">
							<p>Requirements to create a clan:</p>
							<ul className="list-disc list-inside">
								<li className={totalLevel >= 100 ? "text-green-400" : ""}>
									Total Level: {totalLevel}/100
								</li>
								<li className={gold >= 10000 ? "text-green-400" : ""}>
									Gold: {gold.toLocaleString()}/10,000
								</li>
							</ul>
						</div>
					)}
					<div className="flex flex-col gap-2">
						<label className="text-gray-300">
							Clan Name:
							<input
								type="text"
								className="ml-2 p-1 bg-ic-dark-400 text-white"
								value={clanName}
								onChange={(e) => setClanName(e.target.value)}
							/>
						</label>
						<button
							className={`px-4 py-2 ${
								canCreateClan
									? "bg-ic-light-500 text-white hover:bg-ic-light-600"
									: "bg-ic-dark-400 text-gray-500 cursor-not-allowed"
							}`}
							onClick={handleCreateClan}
							disabled={!canCreateClan}
						>
							Create Clan
						</button>
					</div>
				</div>
			)}

			{selectedOption === 'join' && (
				<div className="bg-ic-dark-500/75 p-4 mb-4">
					<h2 className="text-xl text-white mb-2">Join a Clan</h2>
					<div className="flex flex-col gap-2">
						<label className="text-gray-300">
							Clan Name:
							<input
								type="text"
								className="ml-2 p-1 bg-ic-dark-400 text-white"
								value={clanName}
								onChange={(e) => setClanName(e.target.value)}
							/>
						</label>
						<button
							className="px-4 py-2 bg-ic-light-500 text-white hover:bg-ic-light-600"
							onClick={handleJoinClanClick}
							disabled={!clanName.trim()}
						>
							Join Clan
						</button>
					</div>
				</div>
			)}

			<div className="bg-ic-dark-500/75 p-4 flex-grow">
				<h2 className="text-xl text-white mb-2">Top Active Clans</h2>
				{topClans.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{topClans.map((clan, index) => (
							<div key={index} className="bg-ic-dark-400 p-3">
								{/!* Clan info would go here *!/}
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-400">
						No clans available. API endpoint for retrieving top clans is not implemented yet.
					</p>
				)}
			</div>

			{/!* Application Popup *!/}
			{showApplicationPopup && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-ic-dark-500 p-4 max-w-md w-full">
						<h2 className="text-xl text-white mb-2">Apply to Join {clanName}</h2>
						<div className="mb-4">
							<label className="text-gray-300 block mb-1">
								Application Message (Optional):
							</label>
							<textarea
								className="w-full p-2 bg-ic-dark-400 text-white"
								rows={4}
								value={applicationMessage}
								onChange={(e) => setApplicationMessage(e.target.value)}
							/>
						</div>
						<div className="flex justify-end gap-2">
							<button
								className="px-4 py-2 bg-ic-dark-400 text-gray-300 hover:bg-ic-dark-300"
								onClick={() => setShowApplicationPopup(false)}
							>
								Cancel
							</button>
							<button
								className="px-4 py-2 bg-ic-light-500 text-white hover:bg-ic-light-600"
								onClick={handleSubmitApplication}
							>
								Submit Application
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);*/
};