import React, { useState } from "react";
import { GameMode } from "@idleclient/network/NetworkData.ts";
import { StoredAccountInfo } from "@context/SessionContext.tsx";
import AccountEntry from "./AccountEntry";
import { FiPlusCircle } from "react-icons/fi";

const MAX_NORMAL_ACCOUNTS = 3;
const MODE_TO_NAME = {
	[GameMode.NotSelected]: "not selected?",
	[GameMode.Default]: "Normal",
	[GameMode.Ironman]: "Ironman",
	[GameMode.GroupIronman]: "Group Ironman",
}

interface MobileAccountsSectionProps {
	accountsByType: Record<GameMode, StoredAccountInfo[]>;
	onEditAccount: (account: StoredAccountInfo) => void;
	onForgetAccount: (account: StoredAccountInfo) => void;
	onLoginToStored: (account: StoredAccountInfo) => void;
	onAddAccount: () => void;
}

export const MobileAccountsSection: React.FC<MobileAccountsSectionProps> = ({
	accountsByType,
	onEditAccount,
	onForgetAccount,
	onLoginToStored,
	onAddAccount
}) => {
	const [selectedAccountType, setSelectedAccountType] = useState<GameMode>(GameMode.Default);

	return (
		<div className="w-full md:w-2/3 lg:w-1/3 lg:h-full flex flex-col bg-ic-dark-600">
			{/* Header */}
			<div
				className="flex justify-between gap-2 px-4 py-2 bg-ic-dark-200
                border-b-4 border-b-black/60 border-1 border-ic-dark-000
                font-semibold text-lg/5 text-gray-300"
			>
				<div
					className={"w-full flex items-center justify-center py-1 " +
						`${selectedAccountType === GameMode.Default ? "bg-ic-dark-100 font-bold text-white" :
							"underline"} rounded-lg text-center transition-all`}
					onClick={() => setSelectedAccountType(GameMode.Default)}
				>
					Normal
				</div>

				<div
					className={"w-full flex items-center justify-center py-1 " +
						`${selectedAccountType === GameMode.Ironman ? "bg-ic-dark-100 font-bold text-white" :
							"underline"} rounded-lg text-center transition-all`}
					onClick={() => setSelectedAccountType(GameMode.Ironman)}
				>
					Ironman
				</div>

				<div
					className={"w-full flex items-center justify-center py-1 " +
						`${selectedAccountType === GameMode.GroupIronman ? "bg-ic-dark-100 font-bold text-white" :
							"underline"} rounded-lg text-center transition-all`}
					onClick={() => setSelectedAccountType(GameMode.GroupIronman)}
				>
					GIM
				</div>
			</div>

			{/* Account container */}
			<div className="flex flex-col gap-4 py-4 px-4">
				{/* Accounts */}
				{accountsByType[selectedAccountType].map((account, index) => (
					<AccountEntry
						key={index}
						account={account}
						onEditAccount={onEditAccount}
						onForgetAccount={onForgetAccount}
						onLogin={onLoginToStored}
					/>
				))}

				{(selectedAccountType !== GameMode.Default || accountsByType[selectedAccountType].length < MAX_NORMAL_ACCOUNTS) && (
					<div
						className="group flex flex-col items-center justify-center py-4 bg-ic-dark-500 border
                            border-ic-dark-200 grow select-none cursor-pointer"
						onClick={() => onAddAccount()}
					>
						<span className="text-gray-300 group-hover:text-white text-6xl transition-colors"><FiPlusCircle /></span>
						<span className="font-light text-gray-300 group-hover:text-white text-xl transition-colors">Add an account</span>
					</div>
				)}
			</div>
		</div>
	);
};

interface DesktopAccountsSectionProps {
	accountsByType: Record<GameMode, StoredAccountInfo[]>;
	onEditAccount: (account: StoredAccountInfo) => void;
	onForgetAccount: (account: StoredAccountInfo) => void;
	onLoginToStored: (account: StoredAccountInfo) => void;
	onAddAccount: () => void;
}

export const DesktopAccountsSection: React.FC<DesktopAccountsSectionProps> = ({
	accountsByType,
	onEditAccount,
	onForgetAccount,
	onLoginToStored,
	onAddAccount,
}) => {
	return Object.keys(accountsByType)
		.map(v => parseInt(v) as GameMode)
		.filter(v => v != GameMode.NotSelected)
		.map((type) => (
			<div
				key={type}
				className="w-2/3 lg:w-1/3 flex-1 flex flex-col bg-ic-dark-600
                        border-b-4 border-b-ic-dark-600"
			>
				{/* Header */}
				<div
					className="py-1 bg-ic-dark-200 border-b-4 border-b-black/60
                            border-1 border-ic-dark-000 font-bold text-center
                            text-2xl text-gray-100 select-none"
				>
					{MODE_TO_NAME[type]}
				</div>

				{/* Account container */}
				<div className="lg:max-h-105 lg:min-h-105 flex flex-col gap-2 py-4 px-4 lg:overflow-y-auto ic-scrollbar-nr">
					{/* Accounts */}
					{accountsByType[type].map((account, index) => (
						<AccountEntry
							key={index}
							account={account}
							onEditAccount={onEditAccount}
							onForgetAccount={onForgetAccount}
							onLogin={onLoginToStored}
						/>
					))}

					{(type !== GameMode.Default || accountsByType[type].length < MAX_NORMAL_ACCOUNTS) && (
						<div
							className="group h-min flex flex-col items-center justify-center py-4
                                    bg-ic-dark-400 border border-ic-dark-200 select-none
                                    cursor-pointer"
							onClick={() => onAddAccount()}
						>
							<span className="text-gray-300 group-hover:text-white text-6xl transition-colors"><FiPlusCircle /></span>
							<span className="font-light text-gray-300 group-hover:text-white text-xl transition-colors">Add an account</span>
						</div>
					)}
				</div>
			</div>
		));
};